import { redirect } from 'next/navigation';
import { MouseEventHandler } from 'react';
import { v4 as uuidV4 } from 'uuid';

export const generateRoomId = () => {
  return uuidV4();
};

export const toNewRoom: MouseEventHandler<HTMLAnchorElement> = (e) => {
  e.preventDefault();
  redirect(`/${uuidV4()}`);
};
