import React, { useContext, useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { UserContext } from '../components/UserContext.js';
import { DataContext } from '../components/DataContext.js';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import { db } from '../config/firebaseConfig.js';
import { doc, getDocs, getDoc, collection, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import Feather from 'react-native-vector-icons/Feather';

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

    const onCreateOrganizerPressed = () => {
        navigation.navigate('CreateOrganizerScreen', {
            backScreen: 'OrganizersDashboardScreen',
            type: 'add',
        });
    };

    const handleDeleteOrganizer = async organizerId => {
        try {
            const organizerRef = doc(db, 'organizers', organizerId);
            await deleteDoc(organizerRef);
            const events = await handleEventsRelatedToOrganizer(organizerId);
        } catch (error) {
            console.log(error);
        }
    };

    const handleEventsRelatedToOrganizer = async organizerId => {
        try {
            const eventsRef = collection(db, 'events');
            const q = query(eventsRef, where('organizers', 'array-contains', organizerId));
            const querySnapshot = await getDocs(q);
            const events = [];
            querySnapshot.forEach(doc => {
                events.push(doc.id);
            });

            //if event organizers array contains organizerId, remove organizerId from array or if event only has one organizer, delete event
            for (let i = 0; i < events.length; i++) {
                const eventRef = doc(db, 'events', events[i]);
                const docSnap = await getDoc(eventRef);
                const eventData = docSnap.data();

                if (eventData.organizers.length === 1) {
                    await deleteDoc(eventRef);
                } else {
                    const newOrganizers = eventData.organizers.filter(org => org !== organizerId);
                    await updateDoc(eventRef, {
                        organizers: newOrganizers,
                    });
                }
            }
            return events;
        } catch (error) {
            console.log(error);
        }
    };

    const showDeleteConfirmation = organizerId => {
        Alert.alert(
            'Delete Organizer',
            'Are you sure you want to delete this organizer and all events only related to this organizer?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => handleDeleteOrganizer(organizerId),
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={loading ? MainStyle.container : MainStyle.organizersContainer}>
            {loading ? (
                <ActivityIndicator size="large" color={MainStyle.accent} />
            ) : (
                <>
                    <TouchableOpacity
                        style={[MainStyle.todayButton, { backgroundColor: MainStyle.accent, paddingHorizontal: 20, paddingVertical: 10 }]}
                        onPress={onCreateOrganizerPressed}
                    >
                        <Text style={MainStyle.todayButtonText}>Create Organizer</Text>
                    </TouchableOpacity>
                    {createdByOrganizers.length === 0 ? (
                        <Text style={MainStyle.titleStyle}>No organizers created by you yet.</Text>
                    ) : (
                        <>
                            <Text style={MainStyle.titleStyle}>Organizers created by you</Text>
                            <View style={MainStyle.scrollViewContainer}>
                                <ScrollView>
                                    {createdByOrganizers.map((organizer, index) => (
                                        <View key={organizer.id} style={MainStyle.organizerRow}>
                                            <TouchableOpacity
                                                style={MainStyle.createdByYouOrganizerItem}
                                                onPress={() => {
                                                    navigation.navigate('OrganizerScreen', {
                                                        organizerName: organizer.name,
                                                        organizerId: organizer.id,
                                                    });
                                                }}
                                            >
                                                <Text style={MainStyle.organizerItemTextStyle}>{organizer.name}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={MainStyle.createdByYouDeleteIconContainer}
                                                onPress={() => showDeleteConfirmation(organizer.id)}
                                            >
                                                <Feather name="trash" size={24} color={'#A04550'} />
                                            </TouchableOpacity>
                                        </View>
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
                                        <TouchableOpacity
                                            key={organizer.id}
                                            style={MainStyle.organizerItem}
                                            onPress={() => {
                                                navigation.navigate('OrganizerScreen', {
                                                    organizerName: organizer.name,
                                                    organizerId: organizer.id,
                                                });
                                            }}
                                        >
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
