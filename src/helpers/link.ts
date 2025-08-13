import { BASE_URL } from "@/constants";
import type { MouseEvent } from "react";
import { v4 as uuidV4 } from "uuid";

export const generateRoomId = () => {
  return uuidV4();
};

export function getRoomUrl(roomId: string) {
  return `${BASE_URL}/${roomId}`;
}

export function getNewRoomUrl() {
  return getRoomUrl(generateRoomId());
}

export const toNewRoom = <T = Element, E = MouseEvent>(e: MouseEvent<T, E>) => {
  e.preventDefault();
  window.location.href = getNewRoomUrl();
};
