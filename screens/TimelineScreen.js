import React, { useState, useEffect, useContext } from 'react';
import { Text, View, Button, TouchableOpacity } from 'react-native';
import { UserContext } from '../components/UserContext';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, storage, app } from '../config/firebaseConfig.js';
import { doc, setDoc, addDoc, getDocs, getDoc, collection, updateDoc, deleteDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import Feather from 'react-native-vector-icons/Feather';

export default function TimelineScreen() {
    const userContext = useContext(UserContext);
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);
    const [currentDate, setCurrentDate] = useState(new Date());

    const getStartOfWeek = date => {
        const start = new Date(date);
        start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
        return start;
    };

    const getEndOfWeek = startOfWeek => {
        const end = new Date(startOfWeek);
        end.setDate(end.getDate() + 6);
        return end;
    };

    const events = [
        {
            title: 'Coffee break',
            start: new Date(2023, 11, 31, 15, 45),
            end: new Date(2023, 11, 31, 16, 30),
            resource: 'Mom',
        },
        {
            title: 'Dance Lesson',
            start: new Date(2023, 11, 31, 15, 45),
            end: new Date(2023, 11, 31, 16, 30),
            resource: 'Dad',
        },
        {
            title: 'Hockey Game',
            start: new Date(2023, 11, 31, 15, 45),
            end: new Date(2023, 11, 31, 16, 30),
            resource: 'Kid',
        },
        {
            title: 'Meeting',
            start: new Date(2023, 11, 31, 10, 0),
            end: new Date(2023, 11, 31, 10, 30),
            resource: 'All Family',
        },

        {
            title: 'Coffee break',
            start: new Date(2024, 0, 2, 15, 45),
            end: new Date(2024, 0, 2, 16, 30),
            resource: 'Mom',
        },
    ];

    const filterEventsForWeek = (events, startOfWeek, endOfWeek) => {
        return events.filter(event => {
            return event.start >= startOfWeek && event.start <= endOfWeek;
        });
    };

    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = getEndOfWeek(startOfWeek);
    const eventsForWeek = filterEventsForWeek(events, startOfWeek, endOfWeek);

    const moveToDate = date => {
        setCurrentDate(date);
    };

    const goToPrevWeek = () => {
        let newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        moveToDate(newDate);
    };

    const goToNextWeek = () => {
        let newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        moveToDate(newDate);
    };

    const goToToday = () => {
        moveToDate(new Date());
    };

    events.sort((a, b) => {
        return a.start.getTime() - b.start.getTime();
    });

    const formatDate = date => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are 0-based in JavaScript
        return `${dayName} ${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
    };

    const resources = ['Mom', 'Dad', 'Kid', 'All Family'];

    return (
        <View style={[MainStyle.agendaContainer]}>
            <View style={MainStyle.navigationControls}>
                <TouchableOpacity onPress={goToPrevWeek}>
                    <Feather name="chevron-left" size={30} color={MainStyle.primaryText} />
                </TouchableOpacity>
                <TouchableOpacity onPress={goToToday}>
                    <Text style={MainStyle.todayButton}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToNextWeek}>
                    <Feather name="chevron-right" size={30} color={MainStyle.primaryText} />
                </TouchableOpacity>
            </View>

            <View style={MainStyle.weekView}>
                <View style={MainStyle.dateColumn}>
                    <Text style={MainStyle.dateColumnHeader}>Dates</Text>
                    {[...Array(7).keys()].map(offset => {
                        const day = new Date(startOfWeek);
                        day.setDate(day.getDate() + offset);
                        return (
                            <Text key={offset} style={MainStyle.dateHeader}>
                                {formatDate(day)}
                            </Text>
                        );
                    })}
                </View>

                {/* Resource Columns */}
                {resources.map(resource => (
                    <View key={resource} style={MainStyle.resourceColumn}>
                        <Text style={MainStyle.resourceHeader}>{resource}</Text>
                        {[...Array(7).keys()].map(offset => {
                            const day = new Date(startOfWeek);
                            day.setDate(day.getDate() + offset);
                            const resourceDayEvents = eventsForWeek.filter(event => {
                                return event.start.toISOString().split('T')[0] === day.toISOString().split('T')[0] && event.resource === resource;
                            });

                            return (
                                <View key={offset} style={MainStyle.dayColumn}>
                                    {resourceDayEvents.map((event, index) => (
                                        <Text key={index} style={MainStyle.eventItem}>
                                            {event.title}
                                        </Text>
                                    ))}
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
}
