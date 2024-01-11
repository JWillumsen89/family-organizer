import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { UserContext } from '../components/UserContext.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../config/firebaseConfig.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import Feather from 'react-native-vector-icons/Feather';
import { showCustomToast } from '../components/CustomToast.js';

export default function LoginSignUpScreen() {
    const userContext = useContext(UserContext);
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const auth = getAuth();

    const toggleSignUp = () => {
        setIsSignUp(!isSignUp);
    };

    const handleSetEmail = input => {
        setEmail(input.toLowerCase());
    };

    const login = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const userDocRef = doc(db, 'userData', email);
            const userDoc = await getDoc(userDocRef);

            const userDataForStorage = {
                userId: userCredential.user.uid,
                email,
                name: userDoc.data().name,
                isLoggedIn: true,
            };
            userContext.setUserData(userDataForStorage);
            await AsyncStorage.setItem('userData', JSON.stringify(userDataForStorage));
            showCustomToast({ type: 'success', text1: 'Success', text2: 'You are logged in!' });
        } catch (error) {
            let errorMessage1 = 'An unexpected error occurred.';
            let errorMessage2 = 'Please try again.';
            if (error.code === 'auth/invalid-credential') {
                errorMessage1 = 'Invalid email or password.';
                errorMessage2 = 'Please check your credentials.';
            }
            showCustomToast({ type: 'error', text1: errorMessage1, text2: errorMessage2 });
        }
    };

    const signUp = async () => {
        if (password !== confirmPassword) {
            showCustomToast({ type: 'error', text1: 'Error', text2: 'Passwords do not match' });
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            showCustomToast({ type: 'success', text1: 'Success', text2: 'You are signed up and logged in!' });

            const userDocRef = doc(db, 'userData', email);
            await setDoc(userDocRef, {
                name: name,
                email: email,
            });

            const userDataForStorage = {
                userId: userCredential.user.uid,
                email,
                name,
                isLoggedIn: true,
            };
            userContext.setUserData(userDataForStorage);
            await AsyncStorage.setItem('userData', JSON.stringify(userDataForStorage));
        } catch (error) {
            let errorMessage = 'An unexpected error occurred. Please try again.';
            if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password format.';
            }
            showCustomToast({ type: 'error', text1: 'Sign Up Error', text2: errorMessage });
        }
    };

    return (
        <View style={[MainStyle.container, { padding: 20 }]}>
            <Text style={MainStyle.appName}>Family Organizer</Text>
            <Text style={[MainStyle.textStyle, { fontSize: 20 }]}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
            <TextInput
                style={MainStyle.input}
                onChangeText={handleSetEmail}
                value={email}
                placeholder="Enter your email..."
                keyboardType="email-address"
                placeholderTextColor={MainStyle.placeholderTextColor}
            />
            {isSignUp && (
                <TextInput
                    style={MainStyle.input}
                    onChangeText={setName}
                    value={name}
                    placeholder="Enter your name..."
                    placeholderTextColor={MainStyle.placeholderTextColor}
                />
            )}
            <TextInput
                style={MainStyle.input}
                onChangeText={setPassword}
                value={password}
                placeholder="Enter your password..."
                secureTextEntry
                placeholderTextColor={MainStyle.placeholderTextColor}
            />

            {isSignUp && (
                <TextInput
                    style={MainStyle.input}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    placeholder="Re-enter your password..."
                    secureTextEntry
                    placeholderTextColor={MainStyle.placeholderTextColor}
                />
            )}

            <TouchableOpacity style={MainStyle.loginButton} onPress={isSignUp ? signUp : login}>
                <Feather name="log-in" size={20} color={MainStyle.background} />
                <Text style={MainStyle.loginButtonText}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleSignUp}>
                <Text style={MainStyle.toggleText}>{isSignUp ? 'Already have an account? Log In' : 'New user? Click here'}</Text>
            </TouchableOpacity>
        </View>
    );
}
