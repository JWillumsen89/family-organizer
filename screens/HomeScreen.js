import React, { useContext } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { UserContext } from '../components/UserContext';
import { useTheme } from '../components/ThemeContext';
import { getStyles } from '../styles/MainStyle';

export default function HomeScreen({ navigation }) {
    const userContext = useContext(UserContext);
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);

    const navigateToScreen = screenName => {
        navigation.navigate(screenName);
    };

    return (
        <View style={MainStyle.container}>
            <Text style={[MainStyle.appName, { marginTop: -100 }]}>Welcome to</Text>
            <Text style={[MainStyle.appName, { marginTop: -50, marginBottom: 30 }]}>Family Organizer</Text>
            <Text style={[MainStyle.textStyle, { fontSize: 20, marginBottom: 30 }]}>{userContext.userData.name}!</Text>
            <View style={MainStyle.sectionContainer}>
                <Text style={[MainStyle.textStyle, MainStyle.sectionTitle]}>Organizers Dashboard</Text>
                <Text style={MainStyle.sectionDescription}>Access your organizers dashboard to manage and view all your Organizers.</Text>
                <TouchableOpacity style={MainStyle.sectionButton} onPress={() => navigateToScreen('OrganizersDashboardScreen')}>
                    <Text style={MainStyle.sectionButtonText}>Go to Dashboard</Text>
                </TouchableOpacity>
            </View>
            <View style={MainStyle.sectionContainer}>
                <Text style={[MainStyle.textStyle, MainStyle.sectionTitle]}>Your Timeline</Text>
                <Text style={MainStyle.sectionDescription}>View your personal timeline to keep track of upcoming and past activities.</Text>
                <TouchableOpacity style={MainStyle.sectionButton} onPress={() => navigateToScreen('TimelineScreen')}>
                    <Text style={MainStyle.sectionButtonText}>View Timeline</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
