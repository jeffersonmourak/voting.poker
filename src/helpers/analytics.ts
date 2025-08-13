// import { User } from "@voting.poker/core";
// import { H } from "highlight.run";

import type { User } from "@/lib/core";
import { debugAnalytics } from "./debugAnalytics";
import { isDev } from "@/constants";
import Tracker from "@openreplay/tracker";
import trackerAssist from "@openreplay/tracker-assist";

export const tracker = new Tracker({
  projectKey: "rDQFS2nTrl0zWaahjpa7",
  capturePerformance: true,
  __DISABLE_SECURE_MODE: true,
});

tracker.use(trackerAssist());

const trackingFields = ["name", "emoji", "avatar", "moderator"] as const;

export interface IdentifyArgs extends Omit<User, "vote"> {
  roomId?: string;
}

export const identify = (user: IdentifyArgs) => {
  if (isDev) {
    return debugAnalytics("identify", user);
  }

  tracker.setUserID(user.id);

  for (const field of trackingFields) {
    tracker.setMetadata(field, `${user[field]}`);
  }
};

export const consent = (consent: boolean) => {
  if (isDev) {
    return debugAnalytics("consent", consent);
  }
};
