import { User } from '@voting.poker/core';
import { H } from 'highlight.run';
import { isDev } from '../constants';
import { debugAnalytics } from './debugAnalytics';

export interface IdentifyArgs extends Omit<User, 'vote'> {
  roomId?: string;
}

export const identify = (user: IdentifyArgs) => {
  if (isDev) {
    return debugAnalytics('identify', user);
  }

  H.identify(user.name, { ...user });
};

export const consent = (consent: boolean) => {
  if (isDev) {
    return debugAnalytics('consent', consent);
  }
};
