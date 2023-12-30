import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserContext } from './UserContext.js';
import { db, storage, app } from '../config/firebaseConfig.js';
import { doc, setDoc, addDoc, getDocs, getDoc, collection, updateDoc, deleteDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';


const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { userData } = useContext(UserContext);
    const [theme, setTheme] = useState('dark');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchThemePreference = async () => {
            if (userData?.email) {
                try {
                    const userDocRef = doc(db, 'userData', userData.email);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setTheme(userDoc.data().themePreference || 'dark');
                    }
                } catch (error) {
                    console.error('Error fetching theme preference:', error);
                }
                setIsLoading(false);
            }
        };

        fetchThemePreference();
    }, [userData]);

    const toggleTheme = async () => {
        if (!userData?.email) return;

        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        try {
            const userDocRef = doc(db, 'userData', userData.email);
            await updateDoc(userDocRef, {
                themePreference: newTheme,
            });
        } catch (error) {
            console.error('Error updating theme preference:', error);
        }
    };

    return <ThemeContext.Provider value={{ theme, toggleTheme, isLoading }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
