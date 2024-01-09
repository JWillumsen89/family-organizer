import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchData, fetchEvents, fetchEventsForOrganizers } from '../services/FetchData';
import { UserContext } from './UserContext';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { userData } = useContext(UserContext);
    const [organizers, setOrganizers] = useState([]);
    const [items, setItems] = useState({});
    const [itemsForOrganizer, setItemsForOrganizer] = useState({});

    useEffect(() => {
        let unsubscribeOrganizers;
        let unsubscribeEvents;

        if (userData && userData.email) {
            // Subscribe to organizers updates
            unsubscribeOrganizers = fetchData(userData.email, setOrganizers, organizers);

            // Subscribe to events updates
            // unsubscribeEvents = fetchEvents(userData.email, setItems, items);
        }

        return () => {
            // Unsubscribe from updates
            if (unsubscribeOrganizers) unsubscribeOrganizers();
            // if (unsubscribeEvents) unsubscribeEvents();
        };
    }, [userData, items]);

    // useEffect(() => {   
    //     let unsubscribeEvents;
    //     unsubscribeEvents = fetchEvents(userData.email, setItems, items);
    //     return () => {
    //         // Unsubscribe from updates
    //         if (unsubscribeEvents) unsubscribeEvents();
    //     };
    // }, [items]);

    // useEffect(() => {
    //     let unsubscribeEventsForOrganizer;
    //     // Check if organizers array is not empty
    //     if (organizers && organizers.length > 0) {
    //         // Subscribe to events updates for organizers
    //         unsubscribeEventsForOrganizer = fetchEventsForOrganizers(setItemsForOrganizer, organizers);
    //     }

    //     return () => {
    //         // Unsubscribe from events updates for organizers
    //         if (unsubscribeEventsForOrganizer) unsubscribeEventsForOrganizer();
    //     };
    // }, [organizers]); // Dependency on organizers

    return <DataContext.Provider value={{ organizers, items, setItems, itemsForOrganizer, setItemsForOrganizer }}>{children}</DataContext.Provider>;
};
