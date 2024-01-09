import React, { useContext, useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { UserContext } from '../components/UserContext.js';
import { DataContext } from '../components/DataContext.js';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import { db, storage, app } from '../config/firebaseConfig.js';
import { doc, setDoc, addDoc, getDocs, getDoc, collection, updateDoc, deleteDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

export default function CreateOrganizerScreen({ navigation }) {
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);
    const userContext = useContext(UserContext);
    const { organizers } = useContext(DataContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 1000);
    }, []);

    return (
        <View style={loading ? MainStyle.container : MainStyle.container}>
            {loading ? (
                <ActivityIndicator size="large" color={MainStyle.accent} />
            ) : (
                <>
                    <Text style={MainStyle.textStyle}>Create Organizer</Text>
                </>
            )}
        </View>
    );
}
