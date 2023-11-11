import React, {useState} from 'react';
import {useRoom} from '../hooks/useRoom';
import {AvatarEditorModal} from './AvatarEditorModal';

interface IAvatarContextData {
  open: boolean;
}

interface IAvatarContext extends IAvatarContextData {
  update: (value: Partial<IAvatarContextData>) => void;
}

export const AvatarContext = React.createContext<IAvatarContext>({
  open: true,
  update: () => {},
});

interface AvatarProviderProps {
  children: React.ReactNode;
  roomId: string;
}

export const AvatarProvider = ({children, roomId}: AvatarProviderProps) => {
  const [{open}, updateConfig] = useState<IAvatarContextData>({
    open: true,
  });

  const {user, updateUser} = useRoom(roomId);

  const update = (value: Partial<IAvatarContextData>) => {
    updateConfig((v) => ({...v, ...value}));
  };

  return (
    <AvatarContext.Provider
      value={{
        open,
        update,
      }}>
      {children}
      <AvatarEditorModal
        open={open}
        setOpen={(value) => update({open: value})}
        user={user}
        onChange={updateUser}
      />
    </AvatarContext.Provider>
  );
};
