import {User} from '@root/types/User';
import React, {createContext, useState} from 'react';

import {get} from '@root/helpers/request';

interface UserContextInterface {
    user: User | null;
    setUser: (user: User, roomId: string) => void;
    removeUser: () => void;
}

export const UserContext = createContext<UserContextInterface>({
    user: null,
    setUser: () => {},
    removeUser: () => {},
});

export const UserProvider = ({children}: {children: JSX.Element | JSX.Element[]}) => {
    const [user, setUser] = useState<null | User>(null);

    const handleSetUser = (user: User, roomId: string) => {
        setUser(user);
    };

    const removeUser = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{user: user, setUser: handleSetUser, removeUser}}>
            {children}
        </UserContext.Provider>
    );
};
