import {
    Platform,
    TouchableOpacity,
    TouchableNativeFeedback
} from 'react-native';

export default Platform.OS === 'ios' ? TouchableOpacity : TouchableNativeFeedback;
