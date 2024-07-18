'use client';

import * as React from 'react';

import { isDev } from '@voting.poker/next/constants';
import { debugAnalytics } from '@voting.poker/next/helpers/debugAnalytics';
import { H } from 'highlight.run';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { DataCollectionNotification } from './DataCollectionNotification';


interface IAnalyticsContext {
  enabled: boolean;
  consent: (cosent: boolean) => void;
}

export const AnalyticsContext = React.createContext<IAnalyticsContext>({
  enabled: false,
  consent: () => { },
});

const enableAnalytics = () => {
  if (isDev) {
    return debugAnalytics('init', 'HIGHLIGHT');
  }

  H.init('lgxly4gm', {
    tracingOrigins: true,
    networkRecording: {
      enabled: true,
      recordHeadersAndBody: true,
      urlBlocklist: [
        // insert full or partial urls that you don't want to record here
      ],
    },
  });
};

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = React.useState(false);

  useEffect(() => {
    const hasAnswerd = Cookies.get('dataCollectionAccepted');
    const hasAccepted = Cookies.get('dataCollectionAccepted') === 'true';

    if (hasAnswerd && hasAccepted) {
      enableAnalytics();
      setEnabled(true);
    }
  }, []);

  const consent = (consent: boolean) => {
    if (consent) {
      enableAnalytics();
      setEnabled(true);
    }
  };

  return (
    <AnalyticsContext.Provider
      value={{
        enabled,
        consent,
      }}>
      {children}
      <DataCollectionNotification />
    </AnalyticsContext.Provider>
  );
};
