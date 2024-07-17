'use client'

import { AvatarProvider } from '@/components/AvatarProvider';
import { RoomProvider } from '@/hooks/useRoom';
import { CssBaseline } from '@mui/material';
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
