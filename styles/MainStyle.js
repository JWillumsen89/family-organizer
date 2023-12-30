import { StyleSheet, Platform } from 'react-native';

export const darkThemeColors = {
    background: '#03120e',
    primaryText: '#8ab0ab',
    secondaryText: '#9cbabf',
    accent: '#8ab0ab',
    avatarBackground: '#1a1d1a',
    header: '#26413c',
    inputFields: '#0A2E2A',
    placeholderText: 'rgba(160, 172, 184, 0.5)',
};

export const lightThemeColors = {
    background: '#f0f4f8',
    primaryText: '#26413c',
    secondaryText: '#506f76',
    accent: '#26413c',
    avatarBackground: '#b0c4d0',
    header: '#8ab0ab',
    inputFields: '#E6E9ED',
    placeholderText: 'rgba(199, 206, 212, 0.5)',
};

export const getStyles = theme => {
    const themeColors = theme === 'dark' ? darkThemeColors : lightThemeColors;

    return (mainStyle = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.background,
            alignItems: 'center',
            justifyContent: 'center',
        },
        textStyle: {
            color: themeColors.primaryText,
        },
        appName: {
            fontSize: 40,
            fontWeight: 'bold',
            color: themeColors.primaryText,
            marginTop: 20,
            marginBottom: 50,
        },
        userProfileSection: {
            backgroundColor: themeColors.header,
            padding: 20,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: themeColors.accent,
            borderRadius: 4,
            margin: 10,
            marginBottom: 10,
        },
        avatarCircle: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: themeColors.avatarBackground,
            marginBottom: 10,
        },
        usernameText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.primaryText,
            marginBottom: 5,
        },
        userEmail: {
            fontSize: 14,
            fontWeight: 'bold',
            color: themeColors.primaryText,
            marginBottom: 5,
        },
        userId: {
            fontSize: 14,
            color: themeColors.primaryText,
        },
        themeIcon: {
            marginTop: 20,
            marginLeft: 20,
        },
        header: themeColors.header,
        headerTintColor: themeColors.accent,
        accent: themeColors.accent,
        secondaryText: themeColors.secondaryText,
        primaryText: themeColors.primaryText,
        background: themeColors.background,
        logoutButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            marginTop: 20,
            backgroundColor: themeColors.background,
            borderRadius: 5,
        },
        logoutButtonText: {
            marginLeft: 10,
            fontSize: 16,
            color: themeColors.primaryText,
        },
        loginButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            marginTop: 20,
            backgroundColor: themeColors.accent,
            borderRadius: 5,
        },
        loginButtonText: {
            marginLeft: 10,
            fontSize: 16,
            color: themeColors.background,
        },
        input: {
            height: 40,
            margin: 12,
            borderWidth: 1,
            borderColor: themeColors.accent,
            padding: 10,
            width: '100%',
            color: themeColors.primaryText,
            backgroundColor: themeColors.inputFields,
            borderRadius: 4,
        },
        placeholderTextColor: themeColors.placeholderText,
        toggleText: {
            marginTop: 20,
            color: themeColors.accent,
        },
        drawerItem: {
            paddingVertical: 15,
            paddingLeft: 19,
            fontSize: 16,
            color: themeColors.secondaryText,
            fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'Roboto',
            fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        },

        subMenuItem: {
            paddingTop: 10,
            paddingBottom: 5,
            paddingLeft: 25,
            fontSize: 16,
            color: themeColors.accent,
            fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'Roboto',
            fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        },
        organizersContainer: {
            flex: 1,
            backgroundColor: themeColors.background,
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 20,
        },
        scrollViewContainer: {
            maxHeight: 200,
            width: '90%',
            marginTop: 10,
            marginBottom: 20,
            paddingVertical: 10,
            paddingHorizontal: 5,
            borderWidth: 1,
            borderColor: themeColors.accent,
            borderRadius: 8,
            backgroundColor: themeColors.inputFields,
        },
        organizerItem: {
            backgroundColor: themeColors.background,
            padding: 10,
            marginVertical: 5,
            borderRadius: 6,
            alignItems: 'center',
        },
        titleStyle: {
            fontSize: 22,
            fontWeight: 'bold',
            color: themeColors.primaryText,
            marginTop: 10,
            marginBottom: 5,
        },
        organizerItemTextStyle: {
            color: themeColors.primaryText,
            fontSize: 16,
        },
    }));
};
