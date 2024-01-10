import Toast, { BaseToast } from 'react-native-toast-message';

// Custom toast configuration
const toastConfig = {
    success: props => <BaseToast {...props} />,
    error: props => <BaseToast {...props} />,
};

export const showCustomToast = ({ type, text1, text2 }) => {
    Toast.show({
        type: type,
        text1: text1,
        text2: text2,
    });
};

// Export the Toast component with the custom configuration
export const CustomToastComponent = () => <Toast config={toastConfig} />;
