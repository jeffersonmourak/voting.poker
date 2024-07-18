import {v4 as uuidV4} from 'uuid';

export const generateRoomId = () => {
  return uuidV4();
};
