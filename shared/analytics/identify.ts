import {identify as FSIdentify, consent as FSConsent} from 'react-fullstory';
import {User} from '@root/types/User';
import {isDev} from '../constants';
import {debugAnalytics} from './analyticsDevDebug';

export interface IdentifyArgs extends User {
    roomId?: string;
}

export const identify = (user: IdentifyArgs) => {
    if (isDev) {
        return debugAnalytics('identify', user);
    }

    FSIdentify(user.name, {
        ...user,
    });
};

export const consent = (consent: boolean) => {
    if (isDev) {
        return debugAnalytics('consent', consent);
    }

    FSConsent(consent);
};
