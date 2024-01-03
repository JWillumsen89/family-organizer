import React, { useState, useEffect, useContext } from 'react';
import { Text, View, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { UserContext } from '../components/UserContext';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, storage, app } from '../config/firebaseConfig.js';
import { doc, setDoc, addDoc, getDocs, getDoc, collection, updateDoc, deleteDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import Feather from 'react-native-vector-icons/Feather';
import { Agenda, AgendaSchedule } from 'react-native-calendars';

const timeToString = time => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
};

export default function TimelineScreen2() {
    const userContext = useContext(UserContext);
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);
    const [items, setItems] = useState({});
    const [loading, setLoading] = useState(true);

    const [currentMonth, setCurrentMonth] = useState('');
    const [selectedDay, setSelectedDay] = useState(timeToString(new Date().getTime()));

    useEffect(() => {
        const today = new Date();
        const todayString = timeToString(today.getTime());
        setSelectedDay(todayString);

        const monthName = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        setCurrentMonth(`${monthName} ${year}`);
    }, []);

    useEffect(() => {
        // Define a function to fetch events
        const fetchEvents = async () => {
            const userEmail = userContext.userData.email; // Ensure you have the user's email in context
            const eventsRef = collection(db, 'events');
            const q = query(eventsRef, where('creator', '==', userEmail));

            try {
                const querySnapshot = await getDocs(q);
                let fetchedEvents = {};

                querySnapshot.forEach(doc => {
                    const eventData = doc.data();
                    console.log(eventData);
                    const dateStr = eventData.day; // Use the date string directly

                    // Check if the date already exists in fetchedEvents
                    if (!fetchedEvents[dateStr]) {
                        fetchedEvents[dateStr] = [];
                    }

                    // Add the event to the correct date in fetchedEvents
                    fetchedEvents[dateStr].push({
                        name: eventData.name,
                        height: 120, // Adjust the properties as needed
                        description: eventData.description,
                        day: dateStr,
                        color: eventData.color, // Include other properties as needed
                    });
                });
                console.log(fetchedEvents);

                // Update the items state with the fetched events
                setItems(currentItems => ({
                    ...currentItems,
                    ...fetchedEvents,
                }));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events: ', error);
            }
        };

        fetchEvents();
    }, [userContext.userData.email]);

    const onDayPress = day => {
        const newSelectedDay = timeToString(day.timestamp);
        setSelectedDay(newSelectedDay);

        currentDate = new Date(day.timestamp);
        const newMonthName = currentDate.toLocaleString('default', { month: 'long' });
        const newYear = currentDate.getFullYear();
        setCurrentMonth(newMonthName + ' ' + newYear);
    };

    const goToToday = () => {
        const today = new Date();
        const todayString = timeToString(today.getTime());
        setSelectedDay(todayString);

        const monthName = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        setCurrentMonth(`${monthName} ${year}`);
    };

    const sampleEvents = {
        '2024-01-03': [
            {
                name: 'Meeting with Project Team',
                height: 100,
                description: 'Discuss project milestones and deadlines.',
                day: '2024-01-03',
                color: 'blue',
            },
            {
                name: 'Lunch Break',
                height: 100,
                description: 'Lunch with colleagues at the cafeteria.',
                day: '2024-01-03',
                color: 'green',
            },
        ],
        '2024-01-04': [
            {
                name: 'Client Presentation',
                height: 120,
                description: 'Present the new project ideas to the client.',
                day: '2024-01-04',
                color: 'red',
            },
        ],
    };

    const loadItems = day => {
        let newItems = { ...items };

        for (let i = -15; i < 85; i++) {
            const time = day.timestamp + i * 24 * 60 * 60 * 1000;
            const strTime = timeToString(time);

            if (!newItems[strTime]) {
                newItems[strTime] = [];
            }
        }

        setItems({
            ...newItems,
            ...sampleEvents,
        });
    };

    const renderItem = item => {
        const dynamicItemStyle = {
            ...MainStyle.item,
            backgroundColor: item.color,
        };

        return (
            <TouchableOpacity style={dynamicItemStyle} onPress={() => Alert.alert(item.name)}>
                <Text style={{ color: 'white' }}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    const renderEmptyDate = () => {
        return <View style={MainStyle.emptyDate}></View>;
    };

    return (
        <View style={loading ? MainStyle.container : { flex: 1 }}>
            {loading ? (
                <ActivityIndicator size="large" color={MainStyle.accent} />
            ) : (
                <>
                    <View style={{ alignItems: 'center', padding: 10, backgroundColor: MainStyle.background }}>
                        <Text style={MainStyle.monthTitle}>{currentMonth}</Text>
                        <TouchableOpacity style={MainStyle.todayButton} onPress={goToToday}>
                            <Text style={MainStyle.todayButtonText}>Today</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[MainStyle.agendaContainer]}>
                        <Agenda
                            items={items}
                            loadItemsForMonth={loadItems}
                            selected={selectedDay}
                            renderItem={renderItem}
                            onDayPress={onDayPress}
                            renderEmptyDate={renderEmptyDate}
                            theme={{
                                'stylesheet.agenda.main': {
                                    reservations: {
                                        backgroundColor: MainStyle.background,
                                        marginTop: 100,
                                    },
                                },
                                calendarBackground: MainStyle.background,
                                agendaKnobColor: MainStyle.primaryText,
                                backgroundColor: MainStyle.background,
                                agendaDayTextColor: MainStyle.primaryText,
                                agendaDayNumColor: MainStyle.primaryText,
                                agendaTodayColor: MainStyle.primaryText,
                                monthTextColor: MainStyle.primaryText,
                                textDefaultColor: 'red',
                                todayBackgroundColor: MainStyle.primaryText,
                                textSectionTitleColor: MainStyle.primaryText,
                                selectedDayBackgroundColor: MainStyle.primaryText,
                                dayTextColor: MainStyle.primaryText,
                                dotColor: 'white',
                                textDisabledColor: MainStyle.secondaryText,
                            }}
                        />
                    </View>
                </>
            )}
        </View>
    );
}
