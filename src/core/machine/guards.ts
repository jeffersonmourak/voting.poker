import type { User, VotingContext } from "./context";
import { type Events, type ModeratorSyncEvent, VotingEvents } from "./events";

export const GUARD_USER_IS_MODERATOR_KEY = "guard:user:moderator" as const;
export const GUARD_MODERATOR_IS_STARTING_KEY = "guard:moderator:start" as const;
export const GUARD_MODERATOR_IS_RESULTING_KEY =
  "guard:moderator:result" as const;

export const userIsModeratorGuard = ({
  context,
  event,
}: {
  context: VotingContext;
  event: Events;
}) => {
  return (
    context.users.find((user: User) => user.id === event.createdBy)
      ?.moderator ?? false
  );
};

export const MatchModeratorSyncState =
  (filter: (event: ModeratorSyncEvent) => boolean) =>
  ({ event }: { event: Events }) => {
    if (event.type !== VotingEvents.ModeratorSync) {
      return false;
    }

    return filter(event);
  };
