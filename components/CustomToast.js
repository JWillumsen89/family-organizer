import Toast, { BaseToast } from 'react-native-toast-message';

// Custom toast configuration
const toastConfig = {
    success: props => (
        <BaseToast
            {...props}
            // style={{ backgroundColor: '#1C1C1E', borderLeftColor: '#FFA726' }}
            // contentContainerStyle={{ paddingHorizontal: 15 }}
            // text1Style={{ color: '#FFA726' }}
            // text2Style={{ color: '#FFFFFF' }}
        />
    ),
    error: props => (
        <BaseToast
            {...props}
            style={{ backgroundColor: '#1C1C1E', borderLeftColor: '#D32F2F' }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ color: '#D32F2F' }}
            text2Style={{ color: '#FFFFFF' }}
        />
    ),
    // You can add more custom types if needed
};

// Export the function to show custom toasts
export const showCustomToast = ({ type, text1, text2 }) => {
    Toast.show({
        type: type,
        text1: text1,
        text2: text2,
    });
};

// Export the Toast component with the custom configuration
export const CustomToastComponent = () => <Toast config={toastConfig} />;
