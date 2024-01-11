import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { DataContext } from '../components/DataContext.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { db } from '../config/firebaseConfig';
import { collection, addDoc, or, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { UserContext } from '../components/UserContext';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import { showCustomToast } from '../components/CustomToast.js';
import LoadingScreen from './LoadingScreen.js';
import Feather from 'react-native-vector-icons/Feather';

const EventCreateEditScreen = ({ navigation, route }) => {
    const userContext = useContext(UserContext);
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);
    const { organizers } = useContext(DataContext);

    const [color, setColor] = useState();
    const [day, setDay] = useState();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [description, setDescription] = useState();
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('00:00');
    const [name, setName] = useState();
    const [username, setUsername] = useState();
    const [parentEventId, setParentEventId] = useState();
    const [id, setId] = useState();
    const [creator, setCreator] = useState();
    const isInitialEditing = route.params?.item != null;
    const [isEditing, setIsEditing] = useState(isInitialEditing);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedOrganizerIds, setSelectedOrganizerIds] = useState([]);
    const [showStartDatePicker, setShowStartDatePicker] = useState(Platform.OS === 'ios');
    const [showEndDatePicker, setShowEndDatePicker] = useState(Platform.OS === 'ios');
    const [showStartTimePicker, setShowStartTimePicker] = useState(Platform.OS === 'ios');
    const [showEndTimePicker, setShowEndTimePicker] = useState(Platform.OS === 'ios');

    const scrollViewRef = useRef();

    const data = [
        { label: 'Purple', value: 'purple' },
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Orange', value: 'orange' },
        { label: 'Pink', value: 'pink' },
    ];

    const [isFocus, setIsFocus] = useState(false);

    useEffect(() => {
        if (route.params?.item) {
            setIsEditing(true);
            const item = route.params.item;
            setColor(item.color);
            setDay(new Date(item.day));
            setStartDate(new Date(item.startDate));
            setEndDate(new Date(item.endDate));
            setDescription(item.description);
            setStartTime(item.startTime);
            setEndTime(item.endTime);
            setName(item.name);
            setSelectedOrganizerIds(item.organizers);
            setParentEventId(item.parentEventId);
            setId(item.id);
            setCreator(item.creator);
            setUsername(item.username);
        } else {
            setColor(undefined);
            setStartDate(new Date());
            setEndDate(new Date());
            setDescription('');
            setStartTime('00:00');
            setEndTime('00:00');
            setName('');
            setIsEditing(false);
            setUsername('');
            if (route.params?.backScreen == 'OrganizerScreen') {
                setSelectedOrganizerIds([route.params?.organizerId]);
            } else {
                setSelectedOrganizerIds([]);
            }
        }

        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });

        navigation.setOptions({
            title: isEditing ? 'Edit Event' : 'Create Event',
        });
    }, [navigation, route.params, isEditing]);

    useEffect(() => {
        if (!isEditing) {
            if (startTime) {
                const [hours, minutes] = startTime.split(':').map(Number);
                const endTime = new Date(2024, 0, 1, hours, minutes);
                endTime.setHours(endTime.getHours() + 1);
                setEndTime(formatTime(endTime));
            }
        }
    }, [startTime, isEditing]);

    useEffect(() => {
        if (!isEditing) {
            if (startDate) {
                setEndDate(new Date(startDate));
            }
        }
    }, [startDate, isEditing]);

    const formatDate = date => {
        if (!date) return '';

        let month = '' + (date.getMonth() + 1);
        let day = '' + date.getDate();
        let year = date.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    const validateInput = () => {
        if (startDate > endDate) {
            showCustomToast({ type: 'error', text1: 'Error!', text2: 'Start date must be before or equal to the end date.' });
            return;
        }

        if (startTime > endTime) {
            showCustomToast({ type: 'error', text1: 'Error!', text2: 'Start time must be before or equal to the end time.' });
            return;
        }

        if (!name) {
            showCustomToast({ type: 'error', text1: 'Error!', text2: 'Event name cannot be empty.' });
            return;
        }

        if (!color) {
            showCustomToast({ type: 'error', text1: 'Error!', text2: 'Color must be selected.' });
            return;
        }

        return true;
    };

    const handleNewSubmit = async () => {
        if (!validateInput()) {
            return;
        }
        setIsLoading(true);
        const parentEventId = new Date().getTime(); // Generate a single ID for all events

        //Convert dates to midnight.
        let loopDate = new Date(startDate);
        loopDate.setHours(0, 0, 0, 0);
        let lastDate = new Date(endDate);
        lastDate.setHours(0, 0, 0, 0);

        while (loopDate <= lastDate) {
            const isLastDay = loopDate.getTime() === lastDate.getTime(); // Makes a check to see if its last day

            try {
                await addDoc(collection(db, 'events'), {
                    color,
                    creator: userContext.userData.email,
                    day: formatDate(loopDate),
                    start_date: formatDate(startDate),
                    end_date: isLastDay ? formatDate(loopDate) : formatDate(endDate),
                    description,
                    end_time: endTime,
                    name,
                    start_time: startTime,
                    parentEventId: parentEventId,
                    organizers: selectedOrganizerIds,
                    username: userContext.userData.name,
                });

                showCustomToast({ type: 'success', text1: 'Success!', text2: isEditing ? 'Event was edited.' : 'Event was added.' });
            } catch (e) {
                setIsLoading(false);
                showCustomToast({ type: 'error', text1: 'Error!', text2: isEditing ? 'Event was not changed.' : 'Event was not added.' });
                console.error('Error adding document: ', e);
            }

            // Move to the next day
            loopDate.setDate(loopDate.getDate() + 1);
        }

        navigateToScreen();
        setIsLoading(false);
    };

    const handleUpdateSubmit = async () => {
        if (!validateInput()) {
            return;
        }
        setIsLoading(true);
        //Fetch and filter events
        try {
            const allEventsWithSameParentId = Object.values(route.params?.events)
                .flat()
                .filter(event => event.parentEventId === parentEventId);

            const validDateRangeEvents = allEventsWithSameParentId.filter(
                event => new Date(event.day) >= new Date(startDate) && new Date(event.day) <= new Date(endDate)
            );

            //Update or create events for each day
            for (let date = new Date(startDate); date <= new Date(endDate); date.setDate(date.getDate() + 1)) {
                const formattedDate = formatDate(date);
                const existingEvent = validDateRangeEvents.find(event => event.day === formattedDate);

                if (existingEvent) {
                    // Update existing event
                    await updateEventInFirebase(existingEvent.id, date);
                } else {
                    // Create new event for this date
                    await createNewEventForDate(date, parentEventId);
                }
            }

            // Delete extra events that is not part of the new date range
            const datesInRange = getDatesInRange(startDate, endDate);
            const eventsToDelete = allEventsWithSameParentId.filter(event => !datesInRange.includes(event.day));

            for (const event of eventsToDelete) {
                await deleteEventInFirebase(event.id);
            }

            setIsLoading(false);
            showCustomToast({ type: 'success', text1: 'Success!', text2: 'Event was edited.' });
        } catch (e) {
            setIsLoading(false);
            showCustomToast({ type: 'error', text1: 'Error!', text2: 'Event was not edited.' });
            console.error('Error updating document: ', e);
        }

        navigateToScreen();
    };

    const getDatesInRange = (startDate, endDate) => {
        const dateArray = [];
        let currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0);

        let lastDate = new Date(endDate);
        lastDate.setHours(0, 0, 0, 0);

        while (currentDate <= lastDate) {
            dateArray.push(formatDate(new Date(currentDate)));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dateArray;
    };

    const createNewEventForDate = async (date, parentEventId) => {
        try {
            // Check if it's the last day
            const isLastDay = date.getTime() === new Date(endDate).getTime();

            await addDoc(collection(db, 'events'), {
                color,
                creator: userContext.userData.email,
                day: formatDate(date),
                start_date: formatDate(startDate),
                end_date: isLastDay ? formatDate(date) : formatDate(endDate),
                description,
                end_time: endTime,
                name,
                start_time: startTime,
                parentEventId: parentEventId,
                organizers: selectedOrganizerIds,
            });
        } catch (e) {}
    };

    const updateEventInFirebase = async eventId => {
        try {
            await updateDoc(doc(db, 'events', eventId), {
                color,
                creator: creator,
                start_date: formatDate(startDate),
                end_date: formatDate(endDate),
                description,
                end_time: endTime,
                name,
                start_time: startTime,
                organizers: selectedOrganizerIds,
            });
        } catch (e) {
            console.error(`Error updating event with ID ${eventId}: `, e);
        }
    };

    const deleteEventInFirebase = async eventId => {
        try {
            await deleteDoc(doc(db, 'events', eventId));
            return true;
        } catch (e) {
            return false;
        }
    };

    const onChangeStartDate = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowStartDatePicker(false);
        }
        setStartDate(selectedDate || startDate);
    };

    const onChangeEndDate = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowEndDatePicker(false);
        }
        setEndDate(selectedDate || endDate);
    };

    const onChangeStartTime = (event, selectedTime) => {
        if (Platform.OS === 'android') {
            setShowStartTimePicker(false);
        }
        if (selectedTime) {
            setStartTime(formatTime(selectedTime));
        }
    };

    const onChangeEndTime = (event, selectedTime) => {
        if (Platform.OS === 'android') {
            setShowEndTimePicker(false);
        }
        if (selectedTime) {
            setEndTime(formatTime(selectedTime));
        }
    };

    const formatTime = date => {
        if (!date) return '';

        let hours = date.getHours();
        let minutes = date.getMinutes();

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        return `${hours}:${minutes}`;
    };

    const toggleOrganizerSelection = organizerId => {
        setSelectedOrganizerIds(prevIds => {
            if (prevIds.includes(organizerId)) {
                return prevIds.filter(id => id !== organizerId);
            } else {
                return [...prevIds, organizerId];
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedOrganizerIds.length === organizers.length) {
            setSelectedOrganizerIds([]);
        } else {
            setSelectedOrganizerIds(organizers.map(organizer => organizer.id));
        }
    };

    const deleteAllEventsWithSameParentEventId = async () => {
        setIsLoading(true);
        try {
            const allEventsWithSameParentId = Object.values(route.params?.events)
                .flat()
                .filter(event => event.parentEventId === parentEventId);

            for (const event of allEventsWithSameParentId) {
                await deleteEventInFirebase(event.id);
            }

            showCustomToast({ type: 'success', text1: 'Success!', text2: 'Event and related events deleted.' });
            navigateToScreen();
        } catch (error) {
            console.error('Error deleting events: ', error);
            showCustomToast({ type: 'error', text1: 'Error!', text2: 'Failed to delete the event.' });
        }
        setIsLoading(false);
    };

    const navigateToScreen = () => {
        const backScreen = route.params?.backScreen || 'HomeScreen';
        const organizerId = route.params?.organizerId;
        const organizerName = route.params?.organizerName;

        const navigationParams = organizerId ? { organizerId, organizerName } : {};
        navigation.navigate(backScreen, navigationParams);
    };

    const showDeleteConfirmation = () => {
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event and all related events?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: deleteAllEventsWithSameParentEventId,
                },
            ],
            { cancelable: true }
        );
    };

    const showPickerAndroid = setPickerState => {
        if (Platform.OS === 'android') {
            setPickerState(true);
        }
    };

    return (
        <View style={MainStyle.container}>
            {isLoading && <LoadingScreen />}
            {!isLoading && (
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingBottom: 200,
                    }}
                >
                    <View style={MainStyle.formContainer}>
                        {isEditing && (
                            <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={showDeleteConfirmation}>
                                <Feather name="trash" size={24} color={'#A04550'} />
                            </TouchableOpacity>
                        )}

                        <Text style={MainStyle.formLabel}>Event Name</Text>
                        <TextInput
                            style={MainStyle.formInput}
                            placeholder="Enter Event Name..."
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor={MainStyle.placeholderTextColor}
                        />

                        <Text style={MainStyle.formLabel}>Description</Text>
                        <TextInput
                            style={[MainStyle.formInput, { height: 100 }]}
                            placeholder="Enter Description..."
                            value={description}
                            onChangeText={setDescription}
                            placeholderTextColor={MainStyle.placeholderTextColor}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <Text style={MainStyle.formLabel}>Start and End Time</Text>
                        <View style={MainStyle.rowContainer}>
                            {Platform.OS === 'android' && (
                                <View>
                                    <TouchableOpacity onPress={() => showPickerAndroid(setShowStartTimePicker)}>
                                        <TextInput style={MainStyle.androidInputField} value={startTime} editable={false} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {showStartTimePicker && (
                                <DateTimePicker
                                    value={new Date(2024, 0, 1, parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]))}
                                    mode="time"
                                    display="default"
                                    onChange={onChangeStartTime}
                                    is24Hour={true}
                                    themeVariant="dark"
                                />
                            )}

                            {Platform.OS === 'android' && (
                                <View>
                                    <TouchableOpacity onPress={() => showPickerAndroid(setShowEndTimePicker)}>
                                        <TextInput style={MainStyle.androidInputField} value={endTime} editable={false} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {showEndTimePicker && (
                                <DateTimePicker
                                    value={new Date(2024, 0, 1, parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]))}
                                    mode="time"
                                    display="default"
                                    onChange={onChangeEndTime}
                                    is24Hour={true}
                                    themeVariant="dark"
                                />
                            )}
                        </View>

                        <Text style={MainStyle.formLabel}>Start and End Date</Text>
                        <View style={MainStyle.rowContainer}>
                            {Platform.OS === 'android' && (
                                <View>
                                    <TouchableOpacity onPress={() => showPickerAndroid(setShowStartDatePicker)}>
                                        <TextInput style={MainStyle.androidInputField} value={formatDate(startDate)} editable={false} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {showStartDatePicker && (
                                <DateTimePicker value={startDate} mode="date" display="default" onChange={onChangeStartDate} themeVariant="dark" />
                            )}

                            {Platform.OS === 'android' && (
                                <View>
                                    <TouchableOpacity onPress={() => showPickerAndroid(setShowEndDatePicker)}>
                                        <TextInput style={MainStyle.androidInputField} value={formatDate(endDate)} editable={false} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {showEndDatePicker && (
                                <DateTimePicker value={endDate} mode="date" display="default" onChange={onChangeEndDate} themeVariant="dark" />
                            )}
                        </View>

                        {organizers.length === 0 || route.params?.backScreen == 'OrganizerScreen' ? null : (
                            <>
                                <Text style={MainStyle.formLabel}>Select Organizer</Text>
                                <View style={MainStyle.checkboxContainer}>
                                    <TouchableOpacity style={MainStyle.checkboxOption} onPress={toggleSelectAll}>
                                        <View style={[MainStyle.checkbox, selectedOrganizerIds.length === organizers.length && MainStyle.checkboxChecked]}>
                                            {selectedOrganizerIds.length === organizers.length && <Text style={MainStyle.checkboxCheckmark}>✓</Text>}
                                        </View>
                                        <Text style={MainStyle.checkboxText}>All</Text>
                                    </TouchableOpacity>
                                    {organizers.map((organizer, index) => (
                                        <TouchableOpacity
                                            key={organizer.id}
                                            style={MainStyle.checkboxOption}
                                            onPress={() => toggleOrganizerSelection(organizer.id)}
                                        >
                                            <View style={[MainStyle.checkbox, selectedOrganizerIds.includes(organizer.id) && MainStyle.checkboxChecked]}>
                                                {selectedOrganizerIds.includes(organizer.id) && <Text style={MainStyle.checkboxCheckmark}>✓</Text>}
                                            </View>
                                            <Text style={MainStyle.checkboxText}>{organizer.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        <Text style={MainStyle.formLabel}>Color</Text>
                        <Dropdown
                            style={[MainStyle.dropdown, isFocus && { borderColor: MainStyle.accent }]}
                            placeholderStyle={MainStyle.dropdownPlaceholderStyle}
                            selectedTextStyle={MainStyle.dropdownSelectedTextStyle}
                            inputSearchStyle={MainStyle.dropdownInputSearchStyle}
                            itemStyle={MainStyle.dropdownItemStyle}
                            itemContainerStyle={{ backgroundColor: MainStyle.background }}
                            itemTextStyle={MainStyle.dropdownItemTextStyle}
                            searchField=""
                            activeColor={MainStyle.header}
                            data={data}
                            search={false}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={!isFocus ? 'Select color' : '...'}
                            searchPlaceholder="Search..."
                            value={color}
                            onFocus={() => setIsFocus(true)}
                            onBlur={() => setIsFocus(false)}
                            onChange={item => {
                                setColor(item.value);
                                setIsFocus(false);
                            }}
                        />

                        <View style={MainStyle.buttonContainer}>
                            <TouchableOpacity style={MainStyle.formButton} onPress={isEditing ? handleUpdateSubmit : handleNewSubmit}>
                                <Text style={MainStyle.formButtonsText}>{isEditing ? 'Save Changes' : 'Create Event'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={MainStyle.cancelButton} onPress={navigateToScreen}>
                                <Text style={MainStyle.formButtonsText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

export default EventCreateEditScreen;
