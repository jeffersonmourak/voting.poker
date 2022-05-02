import Cookies from 'js-cookie';
import {User} from '@root/types/User';
import {v4 as uuidv4} from 'uuid';
import React, {createContext, useState} from 'react';
import {identify, shutdown, restart} from 'react-fullstory';

interface UserContextInterface {
    user: User | null;
    nextUserId: string;
    setUser: (user: User, roomId: string) => void;
    removeUser: () => void;
    enableDataCollection: () => void;
}

export const UserContext = createContext<UserContextInterface>({
    user: null,
    nextUserId: uuidv4(),
    setUser: () => {},
    removeUser: () => {},
    enableDataCollection: () => {},
});

export const UserProvider = ({children}: {children: JSX.Element | JSX.Element[]}) => {
    const [user, setUser] = useState<null | User>(null);
    const [room, setRoom] = useState<null | string>(null);
    const [nextUserId, setNextUserId] = useState<string>(uuidv4());

    const hasAnswerd = Cookies.get('dataCollectionAccepted') !== undefined;
    const hasDenied = Cookies.get('dataCollectionAccepted') === 'true';

    if (!hasAnswerd || hasDenied) {
        shutdown();
    }

    const handleSetUser = (userData: User, roomId: string) => {
        setUser(userData);
        setRoom(roomId);
        identify(userData.name, {
            ...user,
            roomId,
        });
    };

    const removeUser = () => {
        setUser(null);
        setRoom(null);
        setNextUserId(uuidv4());
    };

    const enableDataCollection = () => {
        if (user && room) {
            identify(user?.name, {
                ...user,
                roomId: room,
            });
        }
        restart();
    };

    return (
        <UserContext.Provider
            value={{user, nextUserId, setUser: handleSetUser, removeUser, enableDataCollection}}>
            {children}
        </UserContext.Provider>
    );
};
