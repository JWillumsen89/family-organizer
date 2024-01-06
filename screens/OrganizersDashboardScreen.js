import React, { useContext, useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { UserContext } from '../components/UserContext.js';
import { DataContext } from '../components/DataContext.js';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import { db, storage, app } from '../config/firebaseConfig.js';
import { doc, setDoc, addDoc, getDocs, getDoc, collection, updateDoc, deleteDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

export default function OrganizersDashboardScreen({ navigation }) {
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);
    const userContext = useContext(UserContext);
    const { organizers } = useContext(DataContext);
    const [createdByOrganizers, setCreatedByOrganizers] = useState([]);
    const [sharedWithOrganizers, setSharedWithOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sort the organizers
        const sortedCreatedByOrganizers = organizers.filter(org => org.createdBy === userContext.userData.email);
        const sortedSharedWithOrganizers = organizers.filter(org => org.sharedWith?.includes(userContext.userData.email));

        setCreatedByOrganizers(sortedCreatedByOrganizers);
        setSharedWithOrganizers(sortedSharedWithOrganizers);
        setLoading(false);
    }, [organizers, userContext.userData.email]);

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
