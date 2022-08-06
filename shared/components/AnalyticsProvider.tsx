import * as React from 'react';
import FullStory from 'react-fullstory';

import {GoogleAnalytics, usePageViews} from 'nextjs-google-analytics';
import {isDev} from '../constants';

interface AnalyticsProviderProps {}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({children}) => {
    usePageViews();
    return (
        <>
            {!isDev && (
                <>
                    <GoogleAnalytics />
                    <FullStory org={process.env.NEXT_PUBLIC_FULL_STORY_ORG_ID || ''} />
                </>
            )}
            {children}
        </>
    );
};
