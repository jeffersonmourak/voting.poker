"use client";

import * as React from "react";

import { useEffect } from "react";
import { DataCollectionNotification } from "@/components/DataCollectionNotification";
import {
  ConsentStatus,
  getConsent,
  identify,
  saveConsent,
} from "@/helpers/analytics";
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
