import {User} from '@root/types/User';
import {v4 as uuidv4} from 'uuid';
import React, {createContext, useState} from 'react';

interface UserContextInterface {
    user: User | null;
    nextUserId: string;
    setUser: (user: User, roomId: string) => void;
    removeUser: () => void;
}

export const UserContext = createContext<UserContextInterface>({
    user: null,
    nextUserId: uuidv4(),
    setUser: () => {},
    removeUser: () => {},
});

export const UserProvider = ({children}: {children: JSX.Element | JSX.Element[]}) => {
    const [user, setUser] = useState<null | User>(null);
    const [nextUserId, setNextUserId] = useState<string>(uuidv4());

    const handleSetUser = (user: User) => {
        setUser(user);
    };

    const removeUser = () => {
        setUser(null);
        setNextUserId(uuidv4());
    };

    return (
        <UserContext.Provider value={{user, nextUserId, setUser: handleSetUser, removeUser}}>
            {children}
        </UserContext.Provider>
    );
};
