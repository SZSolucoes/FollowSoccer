import React from 'react';
import { 
    View, 
    StyleSheet,
    StatusBar,
    Animated,
    Easing
} from 'react-native';

import imgLogo from '../../assets/imgs/patinhasfclogo.png';

export default class SplashScreenAnim extends React.Component {
    constructor(props) {
        super(props);
        
        this.opacityValue = new Animated.Value(0);
        this.animTimmimg = null;

        this.doOpacAnim = this.doOpacAnim.bind(this);
    }

    componentDidMount = () => {
        this.doOpacAnim(0.12, 1);
    }

    componentWillUnmount = () => {
        this.animTimmimg.stop();
    }

    doOpacAnim = (initialValue, toValue) => {
        this.opacityValue.setValue(initialValue);
        this.animTimmimg = Animated.timing(
          this.opacityValue,
          {
            toValue,
            duration: 2000,
            easing: Easing.linear
          }
        );
        this.animTimmimg.start(() => this.doOpacAnim(toValue, initialValue));
    }

    render = () => (
        <View style={styles.viewPrinc}>
            <StatusBar hidden />
            <Animated.Image 
                source={imgLogo} 
                style={{ 
                    width: 250,
                    height: 250,
                    opacity: this.opacityValue
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#004091',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

