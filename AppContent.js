import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { UserContext } from './components/UserContext.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './components/ThemeContext.js';
import { getStyles } from './styles/MainStyle.js';

//Screens
import LoginSignUpScreen from './screens/LoginSignUpScreen';
import LoadingScreen from './screens/LoadingScreen';
//Components
import MyDrawer from './components/MyDrawer';
import Toast, { BaseToast } from 'react-native-toast-message';

export default function AppContent() {
    const { userData, setUserData } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);

    useEffect(() => {
        AsyncStorage.getItem('userData').then(data => {
            if (data) {
                const userDataFromStorage = JSON.parse(data);
                setUserData(userDataFromStorage);
            }
            setTimeout(() => setLoading(false), 1000);
        });
    }, [setUserData]);

    if (loading) {
        return <LoadingScreen />;
    }
    const isLoggedIn = userData && userData.isLoggedIn;

    const toastConfig = {
        success: props => (
            <BaseToast
                {...props}
                style={{
                    backgroundColor: MainStyle.background,
                    borderLeftColor: MainStyle.background,
                    borderColor: MainStyle.accent,
                }}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                text1Style={{
                    fontWeight: 'bold',
                    fontSize: 26,
                    color: 'green',
                }}
                text2Style={{
                    fontSize: 14,
                    color: MainStyle.secondaryText,
                }}
            />
        ),
        error: props => (
            <BaseToast
                {...props}
                style={{
                    backgroundColor: MainStyle.background,
                    borderLeftColor: MainStyle.background,
                    borderColor: MainStyle.accent,
                }}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                text1Style={{
                    fontWeight: 'bold',
                    fontSize: 22,
                    color: 'red',
                }}
                text2Style={{
                    fontSize: 14,
                    color: MainStyle.secondaryText,
                }}
            />
        ),
    };

    return (
        <>
            {!isLoggedIn ? (
                <LoginSignUpScreen />
            ) : (
                <NavigationContainer>
                    <MyDrawer />
                </NavigationContainer>
            )}
            <Toast config={toastConfig} />
        </>
    );
}
