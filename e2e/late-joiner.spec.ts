import { expect, test } from "@playwright/test";
import {
  claimModerator,
  newRoomPath,
  openTab,
  startSession,
  stopSession,
  voteCard,
  waitForCards,
} from "./helpers/room";

test("late joiners are fast-forwarded by the moderator sync", async ({
  browser,
}) => {
  const room = newRoomPath();

  const moderator = await openTab(browser, room);
  await claimModerator(moderator);
  const participant = await openTab(browser, room);
  await moderator.waitForTimeout(3000);

  await startSession(moderator);
  await waitForCards(participant);
  await voteCard(moderator, "5");
  await voteCard(participant, "8");
  await moderator.waitForTimeout(1500);

  // Mid-round joiner: sees the card grid without anyone clicking Start again.
  const midRound = await openTab(browser, room);
  await waitForCards(midRound);
  await expect(midRound.getByText("Let's get started!")).toBeHidden();

  await stopSession(moderator);

  // The mid-round joiner lands on the results with everyone else.
  await expect(midRound.getByText("Well Done!")).toBeVisible();

  // Post-reveal joiner: catches up straight to the results, not Idle.
  const postReveal = await openTab(browser, room);
  await expect(postReveal.getByText("Well Done!")).toBeVisible();
  await expect(postReveal.getByText("Let's get started!")).toBeHidden();
  await expect(postReveal.locator("body")).toContainText("5");
  await expect(postReveal.locator("body")).toContainText("8");
});
