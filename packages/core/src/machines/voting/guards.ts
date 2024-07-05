import { ParameterizedObject } from 'xstate';
import { Guard } from 'xstate/dist/declarations/src/guards';
import { User, VotingContext } from './context';
import { Events } from './events';

export const GUARD_USER_IS_MODERATOR_KEY = 'guard:user:moderator' as const;

export const userIsModeratorGuard: Guard<
  VotingContext,
  Events,
  ParameterizedObject,
  ParameterizedObject
> = ({context, event}) => {
  return context.users.find((user: User) => user.name === event.createdBy)?.moderator ?? false;
};
