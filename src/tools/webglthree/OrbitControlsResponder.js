/* eslint-disable import/imports-first */

import React from 'react';
import Controls from './OrbitControls';
import { PanResponder, View } from 'react-native';
import PropTypes from 'prop-types';

class OrbitControlsResponder extends React.Component {

    constructor(props) {
        super(props);

        const { camera, width, height } = props;
        this.state = {
            ...this.updateWithCamera(camera, width, height),
            width,
            height,
        };
    }

    componentDidUpdate = (prevProps) => {
        const { camera } = this.props;
        if (camera && prevProps.camera !== camera) {
            const { width, height } = this.state;
            const stateUpdated = this.updateWithCamera(camera, width, height);
            if (stateUpdated) this.setState(stateUpdated);
        }
    }

    updateWithCamera = (camera, width, height) => {
        if (!camera) return null;

        const { minCameraZoom, maxCameraZoom } = this.props;

        const controls = new Controls(camera, width, height);
        controls.maxDistance = maxCameraZoom || 20;
        controls.minDistance = minCameraZoom || 2;
        controls.enablePan = false;
        controls.zoomSpeed = 0.3;
        return {
            controls,
            panResponder: this.buildPanRespondersHandleOrbits(controls)
        };
    }

    buildPanRespondersHandleOrbits = ({ onTouchStart, onTouchMove, onTouchEnd }) => (
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            onPanResponderStart: (({ nativeEvent }, gest) => { 
                onTouchStart(nativeEvent); 
                if (this.props.onTouch) this.props.onTouch(nativeEvent);
            }),
            onPanResponderMove: (({ nativeEvent }) => onTouchMove(nativeEvent)),
            onPanResponderRelease: (({ nativeEvent }) => onTouchEnd(nativeEvent)),
            onPanResponderTerminate: (({ nativeEvent }) => onTouchEnd(nativeEvent)),
        })
    )

    render() {
        const {
            controls,
            panResponder
        } = this.state;

        return (
            <View
                style={this.props.style}
                {...(panResponder || {}).panHandlers}
                onLayout={({ nativeEvent: { layout: { width, height } } }) => {
                    this.setState({ width, height });
                    if (controls) {
                        controls.clientWidth = width;
                        controls.clientHeight = height;
                    }
                }}
            >
                {this.props.children}
            </View>
        );
    }
}

OrbitControlsResponder.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
};

OrbitControlsResponder.defaultProps = {
    width: 0,
    height: 0,
    camera: null,
};

export default OrbitControlsResponder;
