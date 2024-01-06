import React, { useState, useEffect, useContext } from 'react';
import { Text, View, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { UserContext } from '../components/UserContext.js';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, storage, app } from '../config/firebaseConfig.js';
import { doc, setDoc, addDoc, getDocs, getDoc, collection, updateDoc, deleteDoc, onSnapshot, orderBy, query, where, or } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import Feather from 'react-native-vector-icons/Feather';
import { Agenda, AgendaSchedule } from 'react-native-calendars';

const timeToString = time => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
};

export default function TimelineScreen({ navigation, route }) {
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
        const unsubscribe = navigation.addListener('focus', fetchEvents);
        return unsubscribe;
    }, [navigation]);

    const fetchEvents = async () => {
        setLoading(true);
        const userEmail = userContext.userData.email;
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('creator', '==', userEmail));

        try {
            const querySnapshot = await getDocs(q);
            let fetchedEvents = {};

            querySnapshot.forEach(doc => {
                const eventData = doc.data();
                const dateStr = eventData.day;

                if (!fetchedEvents[dateStr]) {
                    fetchedEvents[dateStr] = [];
                }
                console.log('eventData', eventData);

                fetchedEvents[dateStr].push({
                    name: eventData.name,
                    height: 120,
                    description: eventData.description,
                    day: dateStr,
                    endDate: eventData.end_date,
                    color: eventData.color,
                    startTime: eventData.start_time,
                    endTime: eventData.end_time,
                    organizer: eventData.organizer,
                    creator: eventData.creator,
                });
            });

            console.log('fetchedEvents', fetchedEvents);

            for (const date in fetchedEvents) {
                fetchedEvents[date] = sortEventsByTime(fetchedEvents[date]);
            }

            setItems(currentItems => ({
                ...currentItems,
                ...fetchedEvents,
            }));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events: ', error);
        }
    };

    const sortEventsByTime = events => {
        return events.sort((a, b) => {
            const startComparison = a.startTime.localeCompare(b.startTime);
            if (startComparison !== 0) {
                // If start times are different, prioritize sorting by start time
                return startComparison;
            }
            // If start times are the same, sort by end time
            return a.endTime.localeCompare(b.endTime);
        });
    };

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
        });
    };

    const renderItem = item => {
        const dynamicItemStyle = {
            ...MainStyle.item,
            backgroundColor: item.color,
        };

        return (
            <TouchableOpacity style={dynamicItemStyle} onPress={() => Alert.alert(item.name + ' ' + item.description)}>
                <Text style={{ color: 'white' }}>{item.name}</Text>
                <Text style={{ color: 'white' }}>
                    {item.day} - {item.endDate} {item.startTime} - {item.endTime}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderEmptyDate = () => {
        return <View style={MainStyle.emptyDate}></View>;
    };

    const onAddEventPressed = () => {
        setLoading(true);
        navigation.navigate('EventCreateEditScreen', {
            backScreen: 'TimelineScreen',
            type: 'add',
        });
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
                        <TouchableOpacity onPress={onAddEventPressed}>
                            <Feather name="plus" size={24} color={MainStyle.accent} />
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
