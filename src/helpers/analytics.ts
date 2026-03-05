import type { User } from "@/lib/core";
import { debugAnalytics } from "./debugAnalytics";
import { isDev } from "@/constants";
import trackerAssist from "@openreplay/tracker-assist";
import Cookies from "js-cookie";
import sillyName from "sillyname";
import posthogOriginal, { type Properties } from "posthog-js";

const posthog = new Proxy(posthogOriginal, {
  get(target, prop, receiver) {
    const originalValue = Reflect.get(target, prop, receiver);

    if (typeof originalValue === "function") {
      return function (this: unknown, ...args: unknown[]) {
        if (process.env.NODE_ENV === "development") {
          return debugAnalytics("posthog", String(prop), args);
        }

        return (originalValue as (...args: unknown[]) => unknown).apply(this, args);
      };
    }

    return originalValue;
  },
});


posthog.setPersonPropertiesForFlags({ 'agreedAt': null });

posthog.init("phc_q4uAbtOL08ekE237YhrpiIB49z6HedJyPfz9N93Eqye", {
  api_host: "https://us.i.posthog.com",
  defaults: "2025-05-24",
  bootstrap: {
    featureFlags: {
      'activate_survey': false,
    }
  },
  person_profiles: "always",
  cookieless_mode: "on_reject",
});



const trackingFields = ["name", "emoji", "avatar", "moderator"] as const;

export interface IdentifyArgs extends Omit<User, "vote"> {
  roomId?: string;
}

export const identify = (user?: IdentifyArgs) => {
  if (isDev) {
    return debugAnalytics("user", "identify", user);
  }

  const consentData = getConsent();
  if (consentData.status === ConsentStatus.rejected) {
    return;
  }

  if (consentData.status === ConsentStatus.pending) {
    const anonymousId = sillyName();

    posthog.alias(anonymousId);
    posthog.setPersonProperties({
      anonymous: true,
    });
  } else {

    if (user !== undefined) {

      posthog.alias(user.id);
    }
  }

  const personProperties: Properties = {};

  if (user) {
    if (user?.roomId) {
      personProperties.session_room_id = user.roomId;
    }
    for (const field of trackingFields) {
      personProperties[field] = `${user[field]}`;
    }
  }

  posthog.setPersonProperties(personProperties);
};

export const consent = (consent: boolean) => {
  if (isDev) {
    return debugAnalytics("user", "consent", consent);
  }
};

export enum ConsentStatus {
  pending = "PENDING",
  accepted = "ACCEPTED",
  rejected = "REJECTED",
}

type PendingConsentData = {
  status: ConsentStatus.pending;
};

type RejectedConsentData = {
  status: ConsentStatus.rejected;
  timestamp: number;
};

type AcceptedConsentData = {
  status: ConsentStatus.accepted;
  identifier: string;
  timestamp: number;
};

type ConsentData =
  | PendingConsentData
  | RejectedConsentData
  | AcceptedConsentData;

export function saveConsent(consent: ConsentData) {
  Cookies.set("dataCollectionAccepted", JSON.stringify(consent));
}

function getAndMigrateConsent(): ConsentData {
  const consent = Cookies.get("dataCollectionAccepted");

  if (!consent) {
    return {
      status: ConsentStatus.pending,
    };
  }

  const parsedConsent = JSON.parse(consent) as ConsentData | boolean;

  if (typeof parsedConsent === "boolean") {
    let migratedConsent: AcceptedConsentData | RejectedConsentData = {
      status: ConsentStatus.rejected,
      timestamp: Date.now(),
    };

    if (parsedConsent) {
      migratedConsent = {
        status: ConsentStatus.accepted,
        identifier: sillyName(),
        timestamp: Date.now(),
      };
    }

    saveConsent(migratedConsent);

    return migratedConsent;
  }

  return parsedConsent;
}

export const getConsent = () => {
  const consent = getAndMigrateConsent();

  if (consent.status === ConsentStatus.accepted) {
    posthog.identify(consent.identifier, {
      agreedAt: consent.timestamp,
    });
  }
  return consent;
};
