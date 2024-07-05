import { CoreClientState } from 'core';
import { createContext, useContext } from 'react';
import { useCoreClientState } from './useCoreClientState';

interface RoomContext {
  state: CoreClientState;
  roomId: string;
}

const RoomContext = createContext<RoomContext | null>(null);

export function useRoom() {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }

  return context;
}

interface RoomProviderProps {
  children: React.ReactNode;
  roomId: string;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({
  children,
  roomId,
}) => {
  const [state] = useCoreClientState(roomId);
  return <RoomContext.Provider value={{ state, roomId }}>{children}</RoomContext.Provider>;
};
