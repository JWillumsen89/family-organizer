import React, { useState, useEffect, useContext } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../components/ThemeContext.js';
import { DataContext } from '../components/DataContext.js';
import { getStyles } from '../styles/MainStyle.js';
import Feather from 'react-native-vector-icons/Feather';
import { Agenda } from 'react-native-calendars';
import { db } from '../config/firebaseConfig.js';
import { getDocs, collection, onSnapshot, query } from 'firebase/firestore';
import LoadingScreen from './LoadingScreen.js';
import { getInitials } from '../utils/getInitials.js';

const timeToString = time => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
};

export default function OrganizerScreen({ navigation, route }) {
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);
    const [events, setEvents] = useState({});
    const { organizers } = useContext(DataContext);
    const [isLoading, setIsLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState('');
    const [selectedDay, setSelectedDay] = useState(timeToString(new Date().getTime()));
    const isItemsForOrganizerEmpty = Object.keys(events).length === 0;
    const organizerId = route.params?.organizerId;
    const organizerName = route.params?.organizerName;

    useEffect(() => {
        const today = new Date();
        const todayString = timeToString(today.getTime());
        setSelectedDay(todayString);

        setMonthName(today);
    }, []);

    useEffect(() => {
        // Check if the organizer exists in the context
        const organizerExists = organizers.some(organizer => organizer.id === organizerId);

        // If the organizer does not exist, navigate back to the dashboard
        if (!organizerExists) {
            navigation.navigate('OrganizersDashboardScreen');
        }
    }, [organizers, organizerId, navigation]);

    let fetchDataOutsideFocusEffect;

    useFocusEffect(
        React.useCallback(() => {
            async function fetchData() {
                setIsLoading(true);
                await fetchEvents();
                setIsLoading(false);
            }

            fetchDataOutsideFocusEffect = fetchData;
            fetchData();

            return () => {
                fetchDataOutsideFocusEffect = null;
            };
        }, [organizerId])
    );

    useEffect(() => {
        if (!organizerId) return;

        const eventsRef = collection(db, 'events');

        const unsubscribe = onSnapshot(eventsRef, snapshot => {
            let shouldFetchData = false;

            snapshot.docChanges().forEach(change => {
                const eventData = change.doc.data();
                if (eventData.organizers.includes(organizerId)) {
                    shouldFetchData = true;
                }
            });

            if (shouldFetchData && fetchDataOutsideFocusEffect) {
                fetchDataOutsideFocusEffect();
            }
        });

        return () => {
            unsubscribe();
        };
    }, [organizerId]);

    const onDayPress = day => {
        const newSelectedDay = timeToString(day.timestamp);
        setSelectedDay(newSelectedDay);

        setMonthName(new Date(day.timestamp));
    };

    const goToToday = () => {
        const today = new Date();
        const todayString = timeToString(today.getTime());
        setSelectedDay(todayString);

        setMonthName(today);
    };

    const setMonthName = date => {
        const monthName = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        setCurrentMonth(`${monthName} ${year}`);
    };

    const fetchEvents = async () => {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef);

        try {
            const querySnapshot = await getDocs(q);
            let fetchedEvents = {};

            querySnapshot.forEach(doc => {
                const eventData = doc.data();
                const dateStr = eventData.day;

                if (!fetchedEvents[dateStr]) {
                    fetchedEvents[dateStr] = [];
                }

                fetchedEvents[dateStr].push({
                    id: doc.id,
                    name: eventData.name,
                    height: 120,
                    description: eventData.description,
                    day: dateStr,
                    startDate: eventData.start_date,
                    endDate: eventData.end_date,
                    color: eventData.color,
                    startTime: eventData.start_time,
                    endTime: eventData.end_time,
                    organizers: eventData.organizers,
                    creator: eventData.creator,
                    parentEventId: eventData.parentEventId,
                    username: eventData.username,
                });
            });

            if (organizerId) {
                for (const date in fetchedEvents) {
                    fetchedEvents[date] = fetchedEvents[date].filter(event => event.organizers.includes(organizerId));
                }
            }

            for (const date in fetchedEvents) {
                fetchedEvents[date] = sortEventsByTime(fetchedEvents[date]);
            }
            setEvents(fetchedEvents); // Update the state with fetched events
        } catch (error) {
            console.error('Error fetching events: ', error);
        }
    };

    const sortEventsByTime = events => {
        return events.sort((a, b) => {
            const startComparison = a.startTime.localeCompare(b.startTime);
            if (startComparison !== 0) {
                return startComparison;
            }
            return a.endTime.localeCompare(b.endTime);
        });
    };

    const openEvent = item => {
        let parentEventItems = [];
        Object.values(events).forEach(eventsOnDate => {
            parentEventItems.push(...eventsOnDate.filter(event => event.parentEventId === item.parentEventId));
        });

        // Find the latest end date
        const latestEndDate = parentEventItems.reduce((latest, currentEvent) => {
            const currentEndDate = new Date(currentEvent.endDate);
            return currentEndDate > latest ? currentEndDate : latest;
        }, new Date(0)); // Initialize with an old date

        // Format latestEndDate back to a string
        const formattedLatestEndDate = latestEndDate.toISOString().split('T')[0];

        // Update the item's endDate
        const updatedItem = { ...item, endDate: formattedLatestEndDate };

        navigation.navigate('EventCreateEditScreen', {
            backScreen: 'OrganizerScreen',
            type: 'edit',
            item: updatedItem,
            events: events,
            organizerId: organizerId,
            organizerName: organizerName,
        });
    };

    const loadItems = day => {
        let newItems = { ...events };

        for (let i = -15; i < 85; i++) {
            const time = day.timestamp + i * 24 * 60 * 60 * 1000;
            const strTime = timeToString(time);

            if (!newItems[strTime]) {
                newItems[strTime] = [];
            }
        }

        setEvents({
            ...newItems,
        });
    };

    const renderItem = item => {
        const dynamicItemStyle = {
            ...MainStyle.item,
            backgroundColor: item.color,
        };

        const initials = getInitials(item.username);

        return (
            <TouchableOpacity style={dynamicItemStyle} onPress={() => openEvent(item)}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={{ color: 'white' }}>{item.name}</Text>
                        <Text style={{ color: 'white' }}>
                            {item.startDate} {'->'} {item.endDate}
                        </Text>
                        <Text style={{ color: 'white' }}>
                            {item.startTime} {'->'} {item.endTime}
                        </Text>
                    </View>
                    <View style={MainStyle.avatarCircle}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{initials}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyDate = () => {
        return <View style={MainStyle.emptyDate}></View>;
    };

    const onAddEventPressed = () => {
        navigation.navigate('EventCreateEditScreen', {
            backScreen: 'OrganizerScreen',
            type: 'add',
            organizerId: organizerId,
            organizerName: organizerName,
        });
    };

    return (
        <View style={{ flex: 1 }}>
            {isLoading && <LoadingScreen />}
            {!isLoading && (
                <>
                    {isItemsForOrganizerEmpty ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: MainStyle.background }}>
                            <Text style={MainStyle.titleStyle}>No events added yet.</Text>
                            <TouchableOpacity
                                style={[MainStyle.todayButton, { backgroundColor: MainStyle.accent, paddingHorizontal: 20, paddingVertical: 10 }]}
                                onPress={onAddEventPressed}
                            >
                                <Text style={MainStyle.todayButtonText}>Add a New Event</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <View style={{ alignItems: 'center', padding: 10, backgroundColor: MainStyle.background }}>
                                <Text style={MainStyle.monthTitle}>{currentMonth}</Text>
                                <TouchableOpacity style={[MainStyle.todayButton, {}]} onPress={goToToday}>
                                    <Text style={MainStyle.todayButtonText}>Today</Text>
                                </TouchableOpacity>
                                <View style={{ marginLeft: 'auto' }}>
                                    <TouchableOpacity
                                        onPress={onAddEventPressed}
                                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Feather name="plus" size={24} color={MainStyle.accent} />
                                        <Text style={[MainStyle.textStyle]}>Add Event</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={[MainStyle.agendaContainer]}>
                                <Agenda
                                    items={events}
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
                        </View>
                    )}
                </>
            )}
        </View>
    );
}
