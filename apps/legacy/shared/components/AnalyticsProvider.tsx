import * as React from 'react';
import {isDev} from '../constants';
import {H} from 'highlight.run';
import {useEffect} from 'react';
import Cookies from 'js-cookie';
import {debugAnalytics} from '../analytics/analyticsDevDebug';

interface IAnalyticsContext {
  enabled: boolean;
  consent: (cosent: boolean) => void;
}

export const AnalyticsContext = React.createContext<IAnalyticsContext>({
  enabled: false,
  consent: () => {},
});

interface AnalyticsProviderProps {}

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

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({children}) => {
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
      {!isDev && <></>}
      {children}
    </AnalyticsContext.Provider>
  );
};
