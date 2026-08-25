"use client";

import * as React from "react";

import { useEffect } from "react";
import { DataCollectionNotification } from "@/features/analytics/DataCollectionNotification";
import {
  ConsentStatus,
  getConsent,
  saveConsent,
} from "@/features/analytics/analytics";
import sillyName from "sillyname";

interface IAnalyticsContext {
  enabled: boolean;
  consent: (cosent: boolean) => void;
}

export const AnalyticsContext = React.createContext<IAnalyticsContext>({
  enabled: false,
  consent: () => {},
});

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = React.useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    const consentData = getConsent();

    if (consentData.status !== ConsentStatus.rejected) {
      if (consentData.status === ConsentStatus.accepted) {
        // The home page hydrates build-time HTML, so consent has to be read
        // post-mount: deriving it in the initial state would make the client's
        // first render disagree with the pre-rendered markup.
        // oxlint-disable-next-line react/set-state-in-effect
        setEnabled(true);
      }
    }
  }, []);

  const consent = (consent: boolean) => {
    if (consent) {
      setEnabled(true);
      saveConsent({
        status: ConsentStatus.accepted,
        identifier: sillyName(),
        timestamp: Date.now(),
      });
    } else {
      saveConsent({
        status: ConsentStatus.rejected,
        timestamp: Date.now(),
      });
    }
  };

  return (
    <AnalyticsContext.Provider
      value={{
        enabled,
        consent,
      }}
    >
      {children}
      <DataCollectionNotification />
    </AnalyticsContext.Provider>
  );
}
