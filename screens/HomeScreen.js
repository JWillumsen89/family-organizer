import React, { useState, useEffect, useContext } from 'react';
import { Text, View, Button } from 'react-native';
import { UserContext } from '../components/UserContext';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';

export default function HomeScreen() {
    const userContext = useContext(UserContext);
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);

    useEffect(() => {}, []);

    return (
        <View style={MainStyle.container}>
            <Text style={MainStyle.textStyle}>Home Screen</Text>
            <Text style={MainStyle.textStyle}>{userContext.userData.name}</Text>
            <Text style={MainStyle.textStyle}>{userContext.userData.email}</Text>
            <Text style={MainStyle.textStyle}>{userContext.userData.userId}</Text>
        </View>
    );
}
