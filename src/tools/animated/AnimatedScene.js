import { Scene } from 'react-native-router-flux';
import React from 'react';

export default class AnimatedScene extends React.Component {
    render() {
        return (
            <Scene {...this.props} />
        );
    }
}

