import { randomUUID } from "node:crypto";
import type { Browser, Page } from "@playwright/test";

export const POOL_MESSAGE_NAMES = [
  "START_SESSION",
  "END_SESSION",
  "VOTE",
  "MODERATOR_SYNC",
] as const;

export type WireCounts = Record<string, number>;

/**
 * Injected before the app loads in every tab:
 * - accepted-consent cookie (suppresses the banner; lets capture() flow so
 *   telemetry events are observable on the console via the dev debug proxy)
 * - counters attributing every outgoing message to its wire (Ably WebSocket
 *   vs RTCDataChannel) — the core assertion of the transport split.
 */
const INIT_SCRIPT = `
  document.cookie = "dataCollectionAccepted=" + encodeURIComponent(
    JSON.stringify({ status: "ACCEPTED", identifier: "e2e", timestamp: 1 })
  );
  window.__wire = { ws: [], dc: [] };
  const wsSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function (data) {
    if (typeof data === "string") window.__wire.ws.push(data);
    return wsSend.call(this, data);
  };
  if (window.RTCDataChannel) {
    const dcSend = RTCDataChannel.prototype.send;
    RTCDataChannel.prototype.send = function (data) {
      window.__wire.dc.push(String(data));
      return dcSend.call(this, data);
    };
  }
`;

export function newRoomPath(): string {
  return `/${randomUUID()}`;
}

const telemetryByPage = new WeakMap<Page, string[]>();

/**
 * Telemetry events captured from the tab's console (the dev analytics proxy
 * logs every suppressed PostHog call). Collected from before navigation, so
 * events fired during page load are included.
 */
export function telemetryEvents(page: Page): string[] {
  return telemetryByPage.get(page) ?? [];
}

export async function openTab(
  browser: Browser,
  roomPath: string,
  { breakWebRTC = false } = {}
): Promise<Page> {
  const context = await browser.newContext();
  await context.addInitScript(
    INIT_SCRIPT + (breakWebRTC ? "delete window.RTCPeerConnection;" : "")
  );

  const page = await context.newPage();

  const telemetry: string[] = [];
  telemetryByPage.set(page, telemetry);
  page.on("console", (message) => {
    if (!message.text().includes("[ANALYTICS]")) {
      return;
    }
    // Serialize the args: text() renders objects as opaque handles.
    void Promise.all(
      message.args().map((arg) => arg.jsonValue().catch(() => null))
    ).then((args) => {
      telemetry.push(JSON.stringify(args));
    });
  });

  await page.goto(roomPath);
  // The avatar editor opens on join; Save closes it.
  await page.getByRole("button", { name: "Save" }).click();

  return page;
}

export async function claimModerator(page: Page) {
  await page.getByRole("button", { name: "Be the moderator" }).click();
}

export async function startSession(page: Page) {
  await page.getByRole("button", { name: "Start" }).click();
}

export async function stopSession(page: Page) {
  await page.getByRole("button", { name: "Stop" }).click();
}

export async function voteCard(page: Page, value: string) {
  await page.getByText(value, { exact: true }).first().click();
}

export async function waitForCards(page: Page) {
  await page.getByText("☕️").first().waitFor();
}

/** Count outgoing messages per named event, split by wire. */
export async function wireCounts(
  page: Page
): Promise<{ ws: WireCounts; dc: WireCounts }> {
  return page.evaluate((names) => {
    const wire = (
      window as unknown as { __wire: { ws: string[]; dc: string[] } }
    ).__wire;

    const count = (frames: string[]) =>
      Object.fromEntries(
        names.map((name) => [
          name,
          frames.filter((frame) => frame.includes(`"${name}"`)).length,
        ])
      );

    return { ws: count(wire.ws), dc: count(wire.dc) };
  }, POOL_MESSAGE_NAMES as unknown as string[]);
}

