import { expect, test } from "@playwright/test";
import {
  claimModerator,
  newRoomPath,
  openTab,
  startSession,
  stopSession,
  voteCard,
  waitForCards,
  wireCounts,
} from "./helpers/room";

test("a full round runs over data channels, not the Ably relay", async ({
  browser,
}) => {
  const room = newRoomPath();

  const moderator = await openTab(browser, room);
  await claimModerator(moderator);

  const participant = await openTab(browser, room);
  // The newcomer must learn the moderator via presence (no modal shown).
  await expect(
    participant.getByRole("button", { name: "Be the moderator" })
  ).toBeHidden();

  // Give the WebRTC mesh a moment to negotiate over Ably signaling.
  await moderator.waitForTimeout(3000);

  await startSession(moderator);
  await waitForCards(participant);

  await voteCard(moderator, "5");
  await voteCard(participant, "8");
  await moderator.waitForTimeout(1500);

  await stopSession(moderator);

  for (const page of [moderator, participant]) {
    await expect(page.getByText("Well Done!")).toBeVisible();
    await expect(page.locator("body")).toContainText("5");
    await expect(page.locator("body")).toContainText("8");
  }

  // The transport split: broadcast pool events ride the data channels
  // exclusively. (MODERATOR_SYNC is excluded — falling back to Ably while a
  // newcomer's channel is still opening is designed behavior.)
  const moderatorWire = await wireCounts(moderator);
  const participantWire = await wireCounts(participant);

  for (const name of ["START_SESSION", "END_SESSION", "VOTE"]) {
    expect(moderatorWire.ws[name], `${name} leaked to Ably`).toBe(0);
    expect(participantWire.ws[name], `${name} leaked to Ably`).toBe(0);
  }

  expect(moderatorWire.dc.START_SESSION).toBeGreaterThan(0);
  expect(moderatorWire.dc.VOTE).toBeGreaterThan(0);
  expect(moderatorWire.dc.END_SESSION).toBeGreaterThan(0);
  expect(participantWire.dc.VOTE).toBeGreaterThan(0);
});
