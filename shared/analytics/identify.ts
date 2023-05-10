import {User} from '@root/types/User';
import {isDev} from '../constants';
import {H} from 'highlight.run';
import {debugAnalytics} from './analyticsDevDebug';

export interface IdentifyArgs extends User {
  roomId?: string;
}

export const identify = (user: IdentifyArgs) => {
  if (isDev) {
    return debugAnalytics('identify', user);
  }
  H.identify(user.name, {...user});
};

export const consent = (consent: boolean) => {
  if (isDev) {
    return debugAnalytics('consent', consent);
  }
};
