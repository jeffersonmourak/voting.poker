import type { MouseEvent } from "react";
import { v4 as uuidV4 } from "uuid";

export const generateRoomId = () => {
  return uuidV4();
};

export const toNewRoom = <T = Element, E = MouseEvent>(e: MouseEvent<T, E>) => {
  e.preventDefault();
  window.location.href = `/${uuidV4()}`;
};
