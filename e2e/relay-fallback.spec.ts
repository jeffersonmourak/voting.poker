import { expect, test } from "@playwright/test";
import {
  claimModerator,
  newRoomPath,
  openTab,
  startSession,
  stopSession,
  telemetryEvents,
  voteCard,
  waitForCards,
} from "./helpers/room";

test("a browser without WebRTC still participates via the Ably relay", async ({
  browser,
}) => {
  const room = newRoomPath();

  const moderator = await openTab(browser, room);
  await claimModerator(moderator);

  const noRtc = await openTab(browser, room, { breakWebRTC: true });

  // The moderator's dial to this peer can never complete; wait past the 10s
  // open timeout so its queued events flush to the relay.
  await moderator.waitForTimeout(12_000);

  await startSession(moderator);
  await waitForCards(noRtc);

  await voteCard(noRtc, "8");
  await voteCard(moderator, "5");
  await moderator.waitForTimeout(1500);

  await stopSession(moderator);

  for (const page of [moderator, noRtc]) {
    await expect(page.getByText("Well Done!")).toBeVisible();
    await expect(page.locator("body")).toContainText("5");
    await expect(page.locator("body")).toContainText("8");
  }

  // Telemetry labeled both sides of the degradation.
  await expect
    .poll(() => telemetryEvents(noRtc).join("\n"))
    .toContain("webrtc_unavailable");
  await expect
    .poll(() =>
      telemetryEvents(moderator)
        .filter((line) => line.includes("p2p_relay_fallback"))
        .join("\n")
    )
    .toContain("timeout");
});
