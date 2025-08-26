import type { User } from "@/lib/core";
import { debugAnalytics } from "./debugAnalytics";
import { isDev } from "@/constants";
import Tracker from "@openreplay/tracker";
import trackerAssist from "@openreplay/tracker-assist";
import Cookies from "js-cookie";
import sillyName from "sillyname";
import posthog, { type Properties } from "posthog-js";

export const tracker = new Tracker({
  projectKey: "rDQFS2nTrl0zWaahjpa7",
  capturePerformance: true,
});

posthog.init("phc_q4uAbtOL08ekE237YhrpiIB49z6HedJyPfz9N93Eqye", {
  api_host: "https://us.i.posthog.com",
  defaults: "2025-05-24",
  person_profiles: "always",
});

tracker.use(trackerAssist());

const trackingFields = ["name", "emoji", "avatar", "moderator"] as const;

export interface IdentifyArgs extends Omit<User, "vote"> {
  roomId?: string;
}

export const identify = (user?: IdentifyArgs) => {
  if (isDev) {
    return debugAnalytics("identify", user);
  }

  const consentData = getConsent();
  if (consentData.status === ConsentStatus.rejected) {
    return;
  }

  if (consentData.status === ConsentStatus.pending) {
    const anonymousId = sillyName();
    tracker.setUserAnonymousID(anonymousId);
    posthog.alias(anonymousId);
    posthog.setPersonProperties({
      anonymous: true,
    });
  } else {
    tracker.setUserID(consentData.identifier);
    if (user !== undefined) {
      tracker.setMetadata("session_user_id", user.id);
      posthog.alias(user.id);
    }
  }

  const personProperties: Properties = {};

  if (user) {
    if (user?.roomId) {
      tracker.setMetadata("session_room_id", user.roomId);
      personProperties.session_room_id = user.roomId;
    }
    for (const field of trackingFields) {
      tracker.setMetadata(field, `${user[field]}`);
      personProperties[field] = `${user[field]}`;
    }
  }

  posthog.setPersonProperties(personProperties);

  if (consentData.status === ConsentStatus.pending) {
    tracker.start();
    tracker.forceFlushBatch();
  }
};

export const consent = (consent: boolean) => {
  if (isDev) {
    return debugAnalytics("consent", consent);
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
