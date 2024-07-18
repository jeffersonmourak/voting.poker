import { AvatarProvider } from "@voting.poker/next/components/AvatarProvider";
import { RoomProvider } from "@voting.poker/next/hooks/useRoom";

type ProvidersProps = React.PropsWithChildren<{ roomId: string }>;

export default function Providers({ children, roomId }: ProvidersProps) {
  return (
    <RoomProvider roomId={roomId} >
      <AvatarProvider roomId={roomId}>
        {children}
      </AvatarProvider>
    </RoomProvider>
  );
}
