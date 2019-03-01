import { Dimensions } from 'react-native';

export const isPortrait = () => Dimensions.get('screen').height > Dimensions.get('screen').width;
