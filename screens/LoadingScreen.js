import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';

const LoadingScreen = () => {
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);
    return (
        <View style={MainStyle.container}>
            <ActivityIndicator size="large" color={MainStyle.accent} />
            <Text>Loading...</Text>
        </View>
    );
};

export default LoadingScreen;
