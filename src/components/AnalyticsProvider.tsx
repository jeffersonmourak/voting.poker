"use client";

import * as React from "react";

import { useEffect } from "react";
import { DataCollectionNotification } from "@/components/DataCollectionNotification";
import { isDev } from "@/constants";
import { debugAnalytics } from "@/helpers/debugAnalytics";
import {
	ConsentStatus,
	getConsent,
	identify,
	saveConsent,
	tracker,
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

const enableAnalytics = () => {
	if (isDev) {
		return debugAnalytics("init", "OPEN REPLAY");
	}

	identify();
	tracker.start();
};

const disableAnalytics = () => {
	if (isDev) {
		return debugAnalytics("stop", "OPEN REPLAY");
	}

	tracker.stop();
	tracker.forceFlushBatch();
};

export default function AnalyticsProvider({
	children,
}: { children: React.ReactNode }) {
	const [enabled, setEnabled] = React.useState(false);

	useEffect(() => {
		const consentData = getConsent();

		if (consentData.status !== ConsentStatus.rejected) {
			tracker.coldStart();

			if (consentData.status === ConsentStatus.accepted) {
				enableAnalytics();
				setEnabled(true);
			}
		}
	}, []);

	const consent = (consent: boolean) => {
		if (consent) {
			enableAnalytics();
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
			disableAnalytics();
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
