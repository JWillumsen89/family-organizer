import React, { useContext, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { UserContext } from '../components/UserContext.js';
import { useTheme } from '../components/ThemeContext.js';
import { getStyles } from '../styles/MainStyle.js';
import { db } from '../config/firebaseConfig.js';
import { doc, addDoc, getDoc, collection } from 'firebase/firestore';
import Feather from 'react-native-vector-icons/Feather';
import { showCustomToast } from '../components/CustomToast.js';

export default function CreateOrganizerScreen({ navigation }) {
    const { theme } = useTheme();
    const MainStyle = getStyles(theme);
    const userContext = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [verifiedEmails, setVerifiedEmails] = useState([]);

    const handleNewSubmit = async () => {
        setLoading(true);
        try {
            const organizerRef = collection(db, 'organizers');
            const organizer = {
                name: name,
                createdBy: userContext.userData.email,
                sharedWith: verifiedEmails,
            };
            await addDoc(organizerRef, organizer);
            navigation.navigate('OrganizersDashboardScreen');
            showCustomToast({ type: 'success', text1: 'Success', text2: 'Organizer created!' });
            setLoading(false);
        } catch (error) {
            showCustomToast({ type: 'error', text1: 'Error', text2: 'Something went wrong' });
            setLoading(false);
        }
    };

    const navigateToScreen = () => {
        const backScreen = 'OrganizersDashboardScreen';
        navigation.navigate(backScreen);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setEmailInput('');
        setVerifiedEmails([]);
    };

    const handleEmailSubmit = async () => {
        const lowerCaseEmail = emailInput.toLowerCase();
        const emailDoc = doc(db, 'userData', lowerCaseEmail);
        const docSnap = await getDoc(emailDoc);

        //if it the users own email, don't add it and make a error toast
        if (lowerCaseEmail === userContext.userData.email) {
            showCustomToast({ type: 'error', text1: 'Error', text2: 'You cannot add your own email' });
            setEmailInput('');
            return;
        }
        if (docSnap.exists()) {
            setVerifiedEmails(oldEmails => [...oldEmails, lowerCaseEmail]);
            setEmailInput('');
        } else {
            showCustomToast({ type: 'error', text1: 'Error', text2: 'No user with that email exist' });
        }
    };

    const removeEmail = emailToRemove => {
        setVerifiedEmails(verifiedEmails.filter(email => email !== emailToRemove));
    };

    const validateEmail = email => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    return (
        <View style={loading ? MainStyle.container : MainStyle.container}>
            {loading ? (
                <ActivityIndicator size="large" color={MainStyle.accent} />
            ) : (
                <>
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingBottom: 200,
                        }}
                    >
                        <View style={MainStyle.formContainer}>
                            <Text style={MainStyle.formLabel}>Organizer Name</Text>
                            <TextInput
                                style={MainStyle.formInput}
                                placeholder="Enter Organizer Name..."
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor={MainStyle.placeholderTextColor}
                            />
                            <Text style={MainStyle.formLabel}>Shared With User Email</Text>
                            <TextInput
                                style={MainStyle.formInput}
                                placeholder="Enter User Email..."
                                value={emailInput}
                                keyboardType="email-address"
                                onChangeText={setEmailInput}
                                placeholderTextColor={MainStyle.placeholderTextColor}
                            />
                            {validateEmail(emailInput) && (
                                <TouchableOpacity style={MainStyle.addEmailButton} onPress={handleEmailSubmit}>
                                    <Text style={MainStyle.formButtonsText}>Add Email</Text>
                                </TouchableOpacity>
                            )}

                            {verifiedEmails.length > 0 && (
                                <View>
                                    {verifiedEmails.map((email, index) => (
                                        <View key={index} style={MainStyle.emailListItem}>
                                            <Text style={MainStyle.emailText}>{email}</Text>
                                            <TouchableOpacity onPress={() => removeEmail(email)} style={MainStyle.removeEmailIcon}>
                                                <Feather name="trash" size={24} color={'#A04550'} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <View style={MainStyle.buttonContainer}>
                                <TouchableOpacity style={MainStyle.formButton} onPress={handleNewSubmit}>
                                    <Text style={MainStyle.formButtonsText}>{'Create Organizer'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={MainStyle.cancelButton} onPress={navigateToScreen}>
                                    <Text style={MainStyle.formButtonsText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </>
            )}
        </View>
    );
}
