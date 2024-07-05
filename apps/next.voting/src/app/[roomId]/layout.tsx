'use client'

import { useParams } from 'next/navigation';
import { RoomProvider } from './_hooks/useRoom';

interface RoomLayoutProps {
  children: React.ReactNode;
}

export default function RoomLayout({ children }: RoomLayoutProps) {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <RoomProvider roomId={roomId} >
      <main>
        <h1>Room Layout {roomId}</h1>
        {children}
      </main>
    </RoomProvider>
  );
}
