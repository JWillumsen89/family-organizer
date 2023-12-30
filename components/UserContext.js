import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export default function UserProvider({ children }) {
    const initialUserData = {
        userId: null,
        email: null,
        isLoggedIn: false
    };

    const [userData, setUserData] = useState(initialUserData);
    const value = { userData, setUserData };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
