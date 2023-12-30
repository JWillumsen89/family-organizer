import React, { useContext, useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { UserContext } from '../components/UserContext.js';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import { db, storage, app } from '../config/firebaseConfig.js';
import { doc, setDoc, addDoc, getDocs, getDoc, collection, updateDoc, deleteDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { isLoaded } from 'expo-font';

export default function OrganizersDashboardScreen({ navigation }) {
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);
    const userContext = useContext(UserContext);
    const [createdByOrganizers, setCreatedByOrganizers] = useState([]);
    const [sharedWithOrganizers, setSharedWithOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrganizers = async () => {
            //created by user
            const createdByQuery = query(collection(db, 'organizers'), where('createdBy', '==', userContext.userData.email));

            const [createdBySnapshot] = await Promise.all([getDocs(createdByQuery)]);

            const createdByOrganizersSet = new Map();

            createdBySnapshot.forEach(doc => {
                createdByOrganizersSet.set(doc.id, { id: doc.id, ...doc.data() });
            });

            const sortedCreatedByOrganizers = Array.from(createdByOrganizersSet.values()).sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            setCreatedByOrganizers(sortedCreatedByOrganizers);

            //Shared with user
            const sharedWithQuery = query(collection(db, 'organizers'), where('sharedWith', 'array-contains', userContext.userData.email));

            const [sharedWithSnapshot] = await Promise.all([getDocs(sharedWithQuery)]);

            const sharedWithOrganizersSet = new Map();

            sharedWithSnapshot.forEach(doc => {
                sharedWithOrganizersSet.set(doc.id, { id: doc.id, ...doc.data() });
            });

            const sortedSharedWithOrganizers = Array.from(sharedWithOrganizersSet.values()).sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            setSharedWithOrganizers(sortedSharedWithOrganizers);
            setLoading(false);
        };

        fetchOrganizers();
    }, [userContext.userData.email]);

    return (
        <View style={loading ? MainStyle.container : MainStyle.organizersContainer}>
            {loading ? (
                <ActivityIndicator size="large" color={MainStyle.accent} />
            ) : (
                <>
                    {createdByOrganizers.length === 0 ? (
                        <Text style={MainStyle.titleStyle}>No organizers created by you yet.</Text>
                    ) : (
                        <>
                            <Text style={MainStyle.titleStyle}>Organizers created by you</Text>
                            <View style={MainStyle.scrollViewContainer}>
                                <ScrollView>
                                    {createdByOrganizers.map((organizer, index) => (
                                        <TouchableOpacity key={index} style={MainStyle.organizerItem} onPress={() => console.log(organizer.id)}>
                                            <Text style={MainStyle.organizerItemTextStyle}>{organizer.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </>
                    )}

                    {sharedWithOrganizers.length === 0 ? (
                        <Text style={MainStyle.titleStyle}>No organizers shared with you yet.</Text>
                    ) : (
                        <>
                            <Text style={MainStyle.titleStyle}>Organizers shared with you</Text>
                            <View style={MainStyle.scrollViewContainer}>
                                <ScrollView>
                                    {sharedWithOrganizers.map((organizer, index) => (
                                        <TouchableOpacity key={index} style={MainStyle.organizerItem} onPress={() => console.log(organizer.id)}>
                                            <Text style={MainStyle.organizerItemTextStyle}>{organizer.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </>
                    )}
                </>
            )}
        </View>
    );
}
