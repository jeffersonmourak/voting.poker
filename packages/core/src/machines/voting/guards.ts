import { ParameterizedObject } from 'xstate';
import { Guard } from 'xstate/dist/declarations/src/guards';
import { User, VotingContext } from './context';
import { Events, ModeratorSyncEvent, VotingEvents } from './events';

export const GUARD_USER_IS_MODERATOR_KEY = 'guard:user:moderator' as const;
export const GUARD_MODERATOR_IS_STARTING_KEY = 'guard:moderator:start' as const;
export const GUARD_MODERATOR_IS_RESULTING_KEY = 'guard:moderator:result' as const;

export const userIsModeratorGuard: Guard<
  VotingContext,
  Events,
  ParameterizedObject,
  ParameterizedObject
> = ({context, event}) => {
  return context.users.find((user: User) => user.id === event.createdBy)?.moderator ?? false;
};

export const MatchModeratorSyncState =
  (
    filter: (event: ModeratorSyncEvent) => boolean
  ): Guard<VotingContext, Events, ParameterizedObject, ParameterizedObject> =>
  ({event}) => {
    if (event.type !== VotingEvents.ModeratorSync) {
      return false;
    }

    return filter(event);
  };
