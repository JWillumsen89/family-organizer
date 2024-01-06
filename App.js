import React from 'react';
import { KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import UserProvider from './components/UserContext.js';
import { DataProvider } from './components/DataContext.js';
import AppContent from './AppContent';
import { ThemeProvider } from './components/ThemeContext.js';

export default function App() {
    return (
        <UserProvider>
            <DataProvider>
                <ThemeProvider>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <AppContent />
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </ThemeProvider>
            </DataProvider>
        </UserProvider>
    );
}
