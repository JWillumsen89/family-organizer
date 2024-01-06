// DataContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchData } from '../services/FetchData';
import { UserContext } from './UserContext';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { userData } = useContext(UserContext);
    const [organizers, setOrganizers] = useState([]);

    useEffect(() => {
        let unsubscribe;
        if (userData && userData.email) {
            unsubscribe = fetchData(userData.email, setOrganizers);
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userData]);

    return <DataContext.Provider value={{ organizers }}>{children}</DataContext.Provider>;
};
