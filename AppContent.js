import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { UserContext } from './components/UserContext.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
//Screens
import LoginSignUpScreen from './screens/LoginSignUpScreen';
import LoadingScreen from './screens/LoadingScreen';
//Components
import MyDrawer from './components/MyDrawer';

export default function AppContent() {
    const { userData, setUserData } = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem('userData').then(data => {
            if (data) {
                const userDataFromStorage = JSON.parse(data);
                console.log('userDataFromStorage', userDataFromStorage);
                setUserData(userDataFromStorage);
            }
            setTimeout(() => setLoading(false), 1000);
        });
    }, [setUserData]);

    if (loading) {
        return <LoadingScreen />;
    }
    const isLoggedIn = userData && userData.isLoggedIn;

    return !isLoggedIn ? (
        <LoginSignUpScreen />
    ) : (
        <NavigationContainer>
            <MyDrawer />
        </NavigationContainer>
    );
}
