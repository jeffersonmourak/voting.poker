"use client";

import * as React from "react";

import Cookies from "js-cookie";
import { useEffect } from "react";
import { DataCollectionNotification } from "@/components/DataCollectionNotification";
import { isDev } from "@/constants";
import { debugAnalytics } from "@/helpers/debugAnalytics";
import { tracker } from "@/helpers/analytics";

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
		return debugAnalytics("init", "HIGHLIGHT");
	}

	tracker.start();
};

export default function AnalyticsProvider({
	children,
}: { children: React.ReactNode }) {
	const [enabled, setEnabled] = React.useState(false);

	useEffect(() => {
		const hasAnswerd = Cookies.get("dataCollectionAccepted");
		const hasAccepted = Cookies.get("dataCollectionAccepted") === "true";

		if (hasAnswerd && hasAccepted) {
			enableAnalytics();
			setEnabled(true);
		}
	}, []);

	const consent = (consent: boolean) => {
		if (consent) {
			enableAnalytics();
			setEnabled(true);
			Cookies.set("dataCollectionAccepted", "true");
		} else {
			Cookies.set("dataCollectionAccepted", "false");
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
