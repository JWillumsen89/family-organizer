import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchData } from '../services/FetchData';
import { UserContext } from './UserContext';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { userData } = useContext(UserContext);
    const [organizers, setOrganizers] = useState([]);

    useEffect(() => {
        let unsubscribeOrganizers;

        if (userData && userData.email) {
            unsubscribeOrganizers = fetchData(userData.email, setOrganizers, organizers);
        }

        return () => {
            if (unsubscribeOrganizers) unsubscribeOrganizers();
        };
    }, [userData]);

    return <DataContext.Provider value={{ organizers, setOrganizers }}>{children}</DataContext.Provider>;
};
