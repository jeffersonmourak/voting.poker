'use client'

import { CssBaseline } from '@mui/material';
import { AvatarProvider } from '@voting.poker/next/components/AvatarProvider';
import { RoomProvider } from '@voting.poker/next/hooks/useRoom';
import { useParams } from 'next/navigation';

interface RoomLayoutProps {
  children: React.ReactNode;
}

export default function RoomLayout({ children }: RoomLayoutProps) {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <RoomProvider roomId={roomId} >
      <AvatarProvider roomId={roomId}>
        <CssBaseline />
        {children}
      </AvatarProvider>
    </RoomProvider>
  );
}
