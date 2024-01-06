import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { db } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { UserContext } from '../components/UserContext';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';

const EventCreateEditScreen = ({ navigation, route }) => {
    const userContext = useContext(UserContext);
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);

    const [color, setColor] = useState();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [description, setDescription] = useState();
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('00:00');
    const [name, setName] = useState();
    const [isEditing, setIsEditing] = useState(false);
    const predefinedColors = ['purple', 'red', 'blue', 'green', 'yellow', 'orange', 'pink'];

    const data = [
        { label: 'Purple', value: 'purple' },
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'Orange', value: 'orange' },
        { label: 'Pink', value: 'pink' },
    ];

    const [isFocus, setIsFocus] = useState(false);

    const renderLabel = () => {
        if (value || isFocus) {
            return <Text style={[MainStyle.dropdownLabel, isFocus && { color: MainStyle.accent }]}>Dropdown label</Text>;
        }
        return null;
    };

    useEffect(() => {
        const editing = route.params?.type !== 'add';
        setIsEditing(editing);
        navigation.setOptions({
            title: isEditing ? 'Edit Event' : 'Create Event',
        });
    }, [navigation, route.params?.type]);

    const formatDate = date => {
        if (!date) return '';

        let month = '' + (date.getMonth() + 1);
        let day = '' + date.getDate();
        let year = date.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    const handleSubmit = async () => {
        if (startDate > endDate) {
            alert('Start date must be before the end date.');
            return;
        }

        const eventId = new Date().getTime();

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            try {
                await addDoc(collection(db, 'events'), {
                    color,
                    creator: userContext.userData.email,
                    day: formatDate(new Date(date)),
                    end_date: formatDate(endDate),
                    description,
                    end_time: endTime,
                    name,
                    start_time: startTime,
                    parentEventId: eventId,
                });
            } catch (e) {
                console.error('Error adding document: ', e);
            }
        }

        const backScreen = route.params?.backScreen || 'HomeScreen';
        navigation.navigate(backScreen);
    };

    const handleCancel = () => {
        const backScreen = route.params?.backScreen || 'HomeScreen';
        navigation.navigate(backScreen);
    };

    const onChangeStartDate = (event, selectedDate) => {
        setStartDate(selectedDate || startDate);
    };

    const onChangeEndDate = (event, selectedDate) => {
        setEndDate(selectedDate || endDate);
    };

    const formatTime = date => {
        if (!date) return '';

        let hours = date.getHours();
        let minutes = date.getMinutes();

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        return `${hours}:${minutes}`;
    };

    const onChangeStartTime = (event, selectedTime) => {
        if (selectedTime) {
            setStartTime(formatTime(selectedTime));
        }
    };

    const onChangeEndTime = (event, selectedTime) => {
        if (selectedTime) {
            setEndTime(formatTime(selectedTime));
        }
    };

    return (
        <View style={MainStyle.container}>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingBottom: 200,
                }}
            >
                <View style={MainStyle.formContainer}>
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
                        <DateTimePicker
                            value={new Date(2024, 0, 1, parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]))}
                            mode="time"
                            display="default"
                            onChange={onChangeStartTime}
                            is24Hour={true}
                            themeVariant="dark"
                        />
                        <DateTimePicker
                            value={new Date(2024, 0, 1, parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]))}
                            mode="time"
                            display="default"
                            onChange={onChangeEndTime}
                            is24Hour={true}
                            themeVariant="dark"
                        />
                    </View>

                    <Text style={MainStyle.formLabel}>Start and End Date</Text>
                    <View style={MainStyle.rowContainer}>
                        <DateTimePicker value={startDate} mode="date" display="default" onChange={onChangeStartDate} themeVariant="dark" />
                        <DateTimePicker value={endDate} mode="date" display="default" onChange={onChangeEndDate} themeVariant="dark" />
                    </View>

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
                        <TouchableOpacity style={MainStyle.formButton} onPress={handleSubmit}>
                            <Text style={MainStyle.formButtonsText}>{isEditing ? 'Save Changes' : 'Create Event'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={MainStyle.cancelButton} onPress={handleCancel}>
                            <Text style={MainStyle.formButtonsText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default EventCreateEditScreen;
