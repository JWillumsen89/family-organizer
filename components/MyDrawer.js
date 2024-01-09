import React, { useContext, useState, useEffect } from 'react';
import { TouchableOpacity, Text, View, Button, Dimensions, Platform } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { UserContext } from '../components/UserContext.js';
import { DataContext } from '../components/DataContext.js';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, storage, app } from '../config/firebaseConfig.js';
import { doc, setDoc, addDoc, getDocs, getDoc, collection, updateDoc, deleteDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { showCustomToast } from '../components/CustomToast.js';

import HomeScreen from '../screens/HomeScreen';
import OrganizersDashboardScreen from '../screens/OrganizersDashboardScreen.js';
import TimelineScreen from '../screens/TimelineScreen.js';
import EventCreateEditScreen from '../screens/EventCreateEditScreen.js';
import OrganizerScreen from '../screens/OrganizerScreen.js';
import CreateOrganizerScreen from '../screens/CreateOrganizerScreen.js';

const Drawer = createDrawerNavigator();

const dynamicFontSize = () => {
    const screenWidth = Dimensions.get('window').width;
    return Math.min(20, screenWidth / 22);
};

function CustomDrawerContent(props) {
    const userContext = useContext(UserContext);
    const { organizers } = useContext(DataContext);
    const { theme, toggleTheme } = useTheme();
    const [createdByOrganizers, setCreatedByOrganizers] = useState(new Map());
    const [sharedWithOrganizers, setSharedWithOrganizers] = useState(new Map());
    const navigation = useNavigation();

    const iconName = theme === 'dark' ? 'moon' : 'sun';

    const MainStyle = getStyles(theme);
    const logout = () => {
        const userDataForStorage = {
            userId: null,
            email: null,
            name: null,
            isLoggedIn: false,
        };
        userContext.setUserData(userDataForStorage);
        AsyncStorage.removeItem('userData');
        showCustomToast({ type: 'success', text1: 'Success', text2: 'You are logged out!' });
    };

    const userProfileSection = (
        <View style={MainStyle.userProfileSection}>
            <View style={MainStyle.avatarCircle}>{/* Add an image here in the future */}</View>
            <Text style={MainStyle.usernameText}>{userContext.userData.name}</Text>
            <Text style={MainStyle.userEmail}>{userContext.userData.email}</Text>
        </View>
    );

    const isDrawerOpen = useDrawerStatus() === 'open';
    const [isSubMenuOpen, setSubMenuOpen] = useState(false);

    useEffect(() => {
        if (!isDrawerOpen) {
            setSubMenuOpen(false);
        }
    }, [isDrawerOpen]);

    const toggleSubMenu = () => {
        setSubMenuOpen(!isSubMenuOpen);
    };

    const SubMenu = () => (
        <View style={{ paddingLeft: 20 }}>
            {organizers.map(organizer => (
                <TouchableOpacity
                    key={organizer.id}
                    onPress={() => {
                        props.navigation.navigate('OrganizerScreen', {
                            organizerName: organizer.name,
                            organizerId: organizer.id,
                        });
                    }}
                >
                    <Text style={MainStyle.subMenuItem}>- {organizer.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <DrawerContentScrollView {...props}>
            <TouchableOpacity style={MainStyle.themeIcon} onPress={toggleTheme}>
                <Feather name={iconName} size={30} color={MainStyle.accent} />
            </TouchableOpacity>
            {userProfileSection}
            <DrawerItemList {...props} />
            {organizers.length > 0 && (
                <TouchableOpacity onPress={toggleSubMenu}>
                    <Text style={MainStyle.drawerItem}>Organizers Quick Access</Text>
                </TouchableOpacity>
            )}
            {isSubMenuOpen && <SubMenu />}
            <TouchableOpacity style={MainStyle.logoutButton} onPress={logout}>
                <Feather name="log-out" size={24} color={MainStyle.accent} />
                <Text style={MainStyle.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </DrawerContentScrollView>
    );
}

export default function MyDrawer({ onLogout }) {
    const isPortrait = () => {
        const dim = Dimensions.get('screen');
        return dim.height >= dim.width;
    };

    const [portrait, setPortrait] = useState(isPortrait());
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', () => {
            setPortrait(isPortrait());
        });

        return () => subscription?.remove();
    }, []);

    const { theme, toggleTheme } = useTheme();

    const MainStyle = getStyles(theme);

    const headerStyle = {
        headerStyle: {
            backgroundColor: MainStyle.header,
        },
        headerTintColor: MainStyle.accent,
        headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: dynamicFontSize(),
            letterSpacing: 2,
        },
        headerTitleAlign: 'center',
    };

    return (
        <Drawer.Navigator
            initialRouteName="Home"
            screenOptions={{
                drawerType: 'slide',
                drawerActiveTintColor: MainStyle.accent,
                drawerInactiveTintColor: MainStyle.secondaryText,
                drawerActiveBackgroundColor: MainStyle.header,
                drawerLabelStyle: { fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'Roboto' },
                drawerStyle: {
                    width: portrait ? '75%' : '40%',
                    minWidth: 250,
                    backgroundColor: MainStyle.background,
                },
            }}
            drawerContent={props => <CustomDrawerContent {...props} onLogout={onLogout} toggleTheme={toggleTheme} />}
        >
            <Drawer.Screen name="Home" component={HomeScreen} options={{ ...headerStyle, title: 'Home' }} />
            <Drawer.Screen name="TimelineScreen" component={TimelineScreen} options={{ ...headerStyle, title: 'Your Timeline' }} />
            <Drawer.Screen
                name="EventCreateEditScreen"
                component={EventCreateEditScreen}
                options={{
                    ...headerStyle,
                    title: 'Create/Edit Event',
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen
                name="OrganizerScreen"
                component={OrganizerScreen}
                options={({ route }) => ({
                    ...headerStyle,
                    title: route.params?.organizerName || 'Organizer',
                    drawerItemStyle: { display: 'none' },
                    organizerId: route.params?.organizerId,
                    key: route.params?.organizerId,
                })}
            />
            <Drawer.Screen
                name="CreateOrganizerScreen"
                component={CreateOrganizerScreen}
                options={{
                    ...headerStyle,
                    title: 'Create/Edit Organizer',
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen name="OrganizersDashboardScreen" component={OrganizersDashboardScreen} options={{ ...headerStyle, title: 'Organizers Dashboard' }} />
        </Drawer.Navigator>
    );
}
