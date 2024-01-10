import React, { useState, useEffect, useContext } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { UserContext } from '../components/UserContext';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import Feather from 'react-native-vector-icons/Feather';
import { Agenda } from 'react-native-calendars';
import LoadingScreen from './LoadingScreen.js';
import { db } from '../config/firebaseConfig.js';
import { doc, setDoc, addDoc, getDocs, getDoc, collection, updateDoc, deleteDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';

const timeToString = time => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
};

export default function TimelineScreen({ navigation }) {
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);
    const [currentMonth, setCurrentMonth] = useState('');
    const [selectedDay, setSelectedDay] = useState(timeToString(new Date().getTime()));
    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState({});
    const userContext = useContext(UserContext);

    useEffect(() => {
        const today = new Date();
        const todayString = timeToString(today.getTime());
        setSelectedDay(todayString);

        const monthName = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        setCurrentMonth(`${monthName} ${year}`);
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            setIsLoading(true);
            await fetchEvents();

            setIsLoading(false);
        });

        return unsubscribe;
    }, [navigation]);

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

        return (
            <TouchableOpacity style={dynamicItemStyle} onPress={() => openEvent(item)}>
                <Text style={{ color: 'white' }}>{item.name}</Text>
                <Text style={{ color: 'white' }}>
                    {item.startDate} - {item.endDate} {item.startTime} - {item.endTime}
                </Text>
            </TouchableOpacity>
        );
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
        }, new Date(0));

        // Format latestEndDate back to a string if needed, e.g. 'YYYY-MM-DD'
        const formattedLatestEndDate = latestEndDate.toISOString().split('T')[0];

        // Update the item's endDate
        const updatedItem = { ...item, endDate: formattedLatestEndDate };

        navigation.navigate('EventCreateEditScreen', {
            backScreen: 'TimelineScreen',
            type: 'edit',
            item: updatedItem,
            events: events,
        });
    };

    const renderEmptyDate = () => {
        return <View style={MainStyle.emptyDate}></View>;
    };

    const onAddEventPressed = () => {
        navigation.navigate('EventCreateEditScreen', {
            backScreen: 'TimelineScreen',
            type: 'add',
        });
    };

    const fetchEvents = async () => {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('creator', '==', userContext.userData.email));

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
                });
            });

            for (const date in fetchedEvents) {
                fetchedEvents[date] = sortEventsByTime(fetchedEvents[date]);
            }
            setEvents(fetchedEvents);
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

    return (
        <View style={{ flex: 1 }}>
            {isLoading && <LoadingScreen />}
            {!isLoading && (
                <>
                    <View style={{ alignItems: 'center', padding: 10, backgroundColor: MainStyle.background }}>
                        <Text style={MainStyle.monthTitle}>{currentMonth}</Text>
                        <TouchableOpacity style={MainStyle.todayButton} onPress={goToToday}>
                            <Text style={MainStyle.todayButtonText}>Today</Text>
                        </TouchableOpacity>
                        <View style={{ marginLeft: 'auto' }}>
                            <TouchableOpacity onPress={onAddEventPressed} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
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
                </>
            )}
        </View>
    );
}
