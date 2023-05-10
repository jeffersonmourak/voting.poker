import { configureAbly } from "@ably-labs/react-hooks";
import { v4 as uuidV4 } from 'uuid';
const clientId = uuidV4();
export const useAbly = () => {
  configureAbly({ key: process.env.NEXT_PUBLIC_ABLY_KEY, clientId});

  return {
    clientId
  }
};
