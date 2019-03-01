import React from 'react';
import PropTypes from 'prop-types';

import {
  Text,
  View,
  Animated,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';

import { Icon } from 'react-native-elements';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import FastImage from 'react-native-fast-image';
import Avatar from '../elements/Avatar';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

const ScrollViewPropTypes = ScrollView.propTypes;

export default class ParallaxMenuView extends React.Component {
    constructor() {
        super();

        this.state = {
            scrollY: new Animated.Value(0),
            screenWith: Dimensions.get('screen').width,
            screenHeight: Dimensions.get('screen').height * (
                Dimensions.get('screen').height > Dimensions.get('screen').width ?
                0.50 
                :
                0.80
            )
        };

        this.onChangeDimensions = this.onChangeDimensions.bind(this);
    }

    componentDidMount = () => {
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
    }

    onChangeDimensions = ({ screen }) => {
        const isPortrait = screen.height > screen.width;
        const screenHeight = isPortrait ? screen.height * 0.50 : screen.height * 0.80;

        this.setState({ screenWith: screen.width, screenHeight });
    }

    scrollTo = (where) => {
        if (!this.scrollView) return;

        this.scrollView.scrollTo(where);
    }
  
    renderBackground = () => {
        const {  
            backgroundSource, 
            onBackgroundLoadEnd, 
            onBackgroundLoadError 
        } = this.props;

        const { scrollY } = this.state;

        if (!this.state.screenHeight || !backgroundSource) {
            return null;
        }

        return (
            <AnimatedFastImage
                resizeMode={FastImage.resizeMode.cover}
                style={[
                    styles.background,
                    {
                        height: this.state.screenHeight,
                        width: this.state.screenWith,
                        transform: [
                        {
                            translateY: scrollY.interpolate({
                            inputRange: [-this.state.screenHeight, 0, this.state.screenHeight],
                            outputRange: [
                                this.state.screenHeight / 2, 
                                0, 
                                -this.state.screenHeight / 3
                            ]
                            })
                        },
                        {
                            scale: scrollY.interpolate({
                            inputRange: [-this.state.screenHeight, 0, this.state.screenHeight],
                            outputRange: [2, 1, 1]
                            })
                        }
                        ]
                    }
                ]}
                source={backgroundSource}
                onLoadEnd={onBackgroundLoadEnd}
                onError={onBackgroundLoadError}
            />
        );
    }

    renderHeaderView = () => {
        const { 
            backgroundSource, 
            userImage, 
            userName, 
            userTitle, 
            navBarHeight,
            onPressUserImg,
            onPressBackgroundImg
        } = this.props;

        const { scrollY } = this.state;

        if (!this.state.screenHeight || !backgroundSource) {
            return null;
        }

        const newNavBarHeight = navBarHeight || getStatusBarHeight();    
        const newWindowHeight = this.state.screenHeight - newNavBarHeight;

        return (
            <Animated.View
                style={{
                    opacity: scrollY.interpolate({
                        inputRange: [
                            -this.state.screenHeight, 
                            0, 
                            (this.state.screenHeight * 0.50) + newNavBarHeight
                        ],
                        outputRange: [1, 1, 0]
                    })
                }}
            >
                <TouchableWithoutFeedback 
                    onPress={() => onPressBackgroundImg && onPressBackgroundImg()}
                >
                    <View 
                        style={{ 
                            height: 
                            newWindowHeight, 
                            justifyContent: 'center', 
                            alignItems: 'center' 
                        }}
                    >
                        {this.props.headerView ||
                            (
                            <View>
                                <View
                                    style={styles.avatarView}
                                >
                                <TouchableWithoutFeedback 
                                    onPress={() => onPressUserImg && onPressUserImg()}
                                >
                                    <Avatar
                                        rounded
                                        source={userImage}
                                        height={120}
                                        width={120}
                                        showEditButton
                                        onEditPress={() => onPressUserImg && onPressUserImg()}
                                    />
                                </TouchableWithoutFeedback>
                                </View>
                                <TouchableWithoutFeedback>
                                    <View style={{ paddingVertical: 10 }}>
                                        <Text 
                                            style={{ 
                                                textAlign: 'center', 
                                                fontSize: 22,
                                                fontFamily: 'OpenSans-SemiBold',
                                                color: 'white', 
                                                paddingBottom: 5
                                            }}
                                        >
                                            {userName}
                                        </Text>
                                        <Text 
                                            style={{
                                                textAlign: 'center', 
                                                fontSize: 17, 
                                                color: 'rgba(247,247, 250, 1)',
                                                paddingBottom: 5
                                            }}
                                        >
                                            {userTitle}
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            )
                        }
                    </View>
                </TouchableWithoutFeedback>
            </Animated.View>
        );
    }

    renderNavBarTitle = () => {
        const { 
            backgroundSource, navBarTitleColor, navBarTitleComponent 
        } = this.props;

        const { scrollY } = this.state;

        if (!this.state.screenHeight || !backgroundSource) {
            return null;
        }

        return (
            <Animated.View
                style={{
                    opacity: scrollY.interpolate({
                    inputRange: [
                        -this.state.screenHeight, 
                        this.state.screenHeight * 0.50, 
                        this.state.screenHeight * 0.8
                    ],
                    outputRange: [0, 0, 1]
                    })
                }}
            >
                {
                    navBarTitleComponent ||
                    <Text 
                        style={{ 
                            fontSize: 18, fontWeight: '600', color: navBarTitleColor || 'white' 
                        }}
                    >
                        {this.props.navBarTitle}
                    </Text>
                }
            </Animated.View>
        );
    }

    rendernavBar = () => {
        const {
            backgroundSource, 
            leftIcon,
            rightIcon, 
            leftIconOnPress, 
            rightIconOnPress, 
            navBarColor, 
            navBarHeight, 
            leftIconUnderlayColor, 
            rightIconUnderlayColor
        } = this.props;

        const { scrollY } = this.state;

        if (!this.state.screenHeight || !backgroundSource) {
            return null;
        }

        const newNavBarHeight = navBarHeight || getStatusBarHeight();

        if (this.props.navBarView) {
            return (
                <Animated.View
                    style={{
                        height: newNavBarHeight,
                        width: this.state.screenWith,
                        flexDirection: 'row',
                        backgroundColor: scrollY.interpolate({
                            inputRange: [
                                -this.state.screenHeight, 
                                this.state.screenHeight * 0.50, this.state.screenHeight * 0.8
                            ],
                            outputRange: [
                                'transparent', 'transparent', navBarColor || 'rgba(0, 0, 0, 1.0)'
                            ],
                            extrapolate: 'clamp'
                        })
                    }}
                >
                    {this.props.navBarView}
                </Animated.View>
            );                
        }

        return (
            <Animated.View
                style={{
                    height: newNavBarHeight,
                    width: this.state.screenWith,
                    flexDirection: 'row',
                    backgroundColor: scrollY.interpolate({
                        inputRange: [
                            -this.state.screenHeight, 
                            this.state.screenHeight * 0.50, this.state.screenHeight * 0.8
                        ],
                        outputRange: [
                            'transparent', 'transparent', navBarColor || 'rgba(0, 0, 0, 1.0)'
                        ]
                    })
                }}
            >
                {
                    leftIcon &&
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                        <Icon
                            name={(leftIcon && leftIcon.name) || 'menu'}
                            type={(leftIcon && leftIcon.type) || 'simple-line-icon'}
                            color={(leftIcon && leftIcon.color) || 'white'}
                            size={(leftIcon && leftIcon.size) || 23}
                            onPress={leftIconOnPress}
                            underlayColor={leftIconUnderlayColor || 'transparent'}
                        />
                        </View>
                }
                <View
                    style={{
                        flex: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center'
                    }}
                >
                    {this.renderNavBarTitle()}
                </View>
                {
                    rightIcon &&         
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Icon
                            name={(rightIcon && rightIcon.name) || 'present'}
                            type={(rightIcon && rightIcon.type) || 'simple-line-icon'}
                            color={(rightIcon && rightIcon.color) || 'white'}
                            size={(rightIcon && rightIcon.size) || 23}
                            onPress={rightIconOnPress}
                            underlayColor={rightIconUnderlayColor || 'transparent'}
                        />
                    </View>
                }
            </Animated.View>
        );        
    }

    render = () => {
        const { style, ...props } = this.props;

        return (
            <View style={[styles.container, style]}>
                { this.renderBackground() }
                <ScrollView
                    ref={component => {
                        this.scrollView = component;
                    }}
                    {...props}
                    style={styles.scrollView}
                    onScroll={Animated.event([
                        { nativeEvent: { contentOffset: { y: this.state.scrollY } } }
                    ])}
                    scrollEventThrottle={16}
                >
                    {this.renderHeaderView()}
                    <View style={[styles.content, props.scrollableViewStyle]}>
                        {this.props.children}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

ParallaxMenuView.defaultProps = {
  leftIconOnPress: () => console.log('Icone esquerdo'),
  rightIconOnPress: () => console.log('Icone direito')
};

ParallaxMenuView.propTypes = {
  ...ScrollViewPropTypes,
  backgroundSource: PropTypes.any,
  windowHeight: PropTypes.number,
  navBarTitle: PropTypes.string,
  navBarTitleColor: PropTypes.string,
  navBarTitleComponent: PropTypes.node,
  navBarColor: PropTypes.string,
  userImage: PropTypes.any,
  userName: PropTypes.string,
  userTitle: PropTypes.string,
  headerView: PropTypes.node,
  leftIcon: PropTypes.object,
  rightIcon: PropTypes.object,
  onPressBackgroundImg: PropTypes.func,
  onPressUserImg: PropTypes.func
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderColor: 'transparent'
    },
    scrollView: {
        backgroundColor: 'transparent'
    },
    background: {
        position: 'absolute',
        backgroundColor: 'white'
    },
    content: {
        shadowColor: '#222',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        backgroundColor: '#fff',
        flex: 1,
        flexDirection: 'column'
    },
    headerView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    listView: {
        backgroundColor: 'rgba(247,247, 250, 1)'
    },
    logoutText: {
        color: 'red',
        textAlign: 'center',
        fontWeight: 'bold'
    }
});

