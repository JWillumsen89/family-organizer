import React, { useState, useContext } from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { UserContext } from '../components/UserContext.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, storage, app } from '../config/firebaseConfig.js';
import { doc, setDoc, addDoc, getDocs, getDoc, collection, updateDoc, deleteDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import Feather from 'react-native-vector-icons/Feather';

import { MY_USER_EMAIL, MY_USER_PASSWORD } from '@env';

export default function LoginSignUpScreen() {
    const userContext = useContext(UserContext);
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);

    const [email, setEmail] = useState(MY_USER_EMAIL);
    const [password, setPassword] = useState(MY_USER_PASSWORD);
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const auth = getAuth();

    const toggleSignUp = () => {
        setIsSignUp(!isSignUp);
    };

    const login = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            alert("You're logged in!");

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
        } catch (error) {
            alert(error.message);
        }
    };

    const signUp = async () => {
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            alert("You're signed up!");

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
            alert(error.message);
        }
    };

    return (
        <View style={MainStyle.container}>
            <Text style={MainStyle.appName}>Family Organizer</Text>
            <Text style={[MainStyle.textStyle, { fontSize: 20 }]}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
            <TextInput
                style={MainStyle.input}
                onChangeText={setEmail}
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
