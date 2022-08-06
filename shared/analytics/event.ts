import {NextWebVitalsMetric} from 'next/app';
import {event as GAEvent} from 'nextjs-google-analytics';

import {isDev} from '../constants';
import {debugAnalytics} from './analyticsDevDebug';

export type Action = NextWebVitalsMetric['name'] | 'create_room' | 'update_user';

export interface EventArgs {
    action: Action;
    category?: string;
    label?: string;
    value?: number;
    userId?: string;
    nonInteraction?: boolean;
}

export type AnalyticEvent = (options: EventArgs) => void;

export const event: AnalyticEvent = (options) => {
    if (isDev) {
        return debugAnalytics('event', options);
    }

    const {action, ...gaOptions} = options;

    GAEvent(action, gaOptions);
};
