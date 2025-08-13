export const isDev =
  typeof global === "undefined"
    ? import.meta.env.DEV
    : process && process.env.NODE_ENV === "development";

export const siteHost = isDev
  ? typeof location !== "undefined"
    ? location.host
    : "localhost:3000"
  : "jeffersonmourak.com/voting.poker";

export const BASE_URL = isDev ? `http://${siteHost}` : `https://${siteHost}`;

export const ablyKey =
  "KFbzIQ.hA8SsQ:h4P2SGxtFt3I-6sB2vbLbmeHycJIs5wDMKaWk23dWAw";

export const giphyKey = "0cPLUIIRYsiq91sNjp48iyhp6dEWPF0R";
