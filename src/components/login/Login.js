import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    Image,
    Keyboard,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Text,
    Platform,
    //ImageBackground
} from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';
import { showDropdownAlert } from '../../utils/SystemEvents';

import imgLogo from '../../assets/imgs/logo.png';
import { colorAppPrimary, colorAppSecondary } from '../../utils/Constantes';

import {
    modifyUsername,
    modifyPassword,
    modifyHidePw,
    modifyModalVisible,
    modifyCleanLogin,
    modifyShowLogoLogin,
    modifyUserToken,
    doLogin
} from './LoginActions';
import TouchableByPlatform from '../../tools/touchables/TouchableByPlatform';

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardHide);

        this.state = { marginTop: 0, marginBottom: 0 };
    }

    componentWillUnmount = () => {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    onTouchLogin = () => {
        Keyboard.dismiss();
    }

    onPressEnterBtn = () => {
        const { username, password } = this.props;

        Keyboard.dismiss();

        if (username && password) {
            if (!this.props.indicator) {
                this.props.doLogin({ email: username, password });
            }
        } else {
            showDropdownAlert(
                'warn', 
                'Aviso', 
                'É necessário informar usuário e senha válidos'
            );
        }
    }

    keyboardShow = (e) => {
        this.props.modifyShowLogoLogin(false);
        if (Platform.OS === 'ios') {
            this.setState({ 
                ...this.state, 
                marginTop: 60, 
                marginBottom: e.endCoordinates.height - 60 
            });
        } else {
            this.setState({ ...this.state, marginTop: 50, marginBottom: 0 });
        }
    }
    
    keyboardHide = () => {
        this.props.modifyShowLogoLogin(true);
        this.setState({ ...this.state, marginTop: 0, marginBottom: 0 });
    }

    renderAnimLogin = () => {
        if (this.props.indicator) {
            return (
                <View style={styles.loading}>
                    <ActivityIndicator size='small' color='white' />
                </View>
            );
        }
        return (
            <Text style={styles.txtMenu}>Entrar</Text>
        );
    }

    render = () => (
        <View style={styles.viewMain}>
            <TouchableWithoutFeedback
                onPress={() => this.onTouchLogin()}
            >
                {/* <ImageBackground
                    source={imgCampoLogo}
                    style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'contain'
                    }}
                > */}
                    <ScrollView 
                        contentContainerStyle={styles.viewMain}
                        keyboardShouldPersistTaps={'handled'}
                    >
                        {
                        this.props.showLogoLogin &&
                        <View style={styles.viewLogo}>
                            <Image 
                                style={styles.imgLogo}
                                source={imgLogo}
                                resizeMode='stretch'
                            />
                        </View>
                        }
                        <View style={{ flex: 3 }}>
                            <View 
                                style={{ 
                                    marginTop: this.state.marginTop, 
                                    marginBottom: this.state.marginBottom 
                                }}
                            >
                                <View style={styles.sectionStyle}>
                                    <TextInput
                                        placeholder={'E-mail'}
                                        selectTextOnFocus
                                        autoCorrect={false}
                                        placeholderTextColor={'grey'}
                                        returnKeyType={'next'}
                                        autoCapitalize={'none'}
                                        style={styles.input}
                                        onChangeText={username => 
                                            this.props.modifyUsername(username)}
                                        value={this.props.username}
                                        underlineColorAndroid={'transparent'}
                                        onSubmitEditing={() => this.txtPassword.focus()}
                                        blurOnSubmit={false}
                                    />
                                </View>
                                <View style={styles.sectionStyle}>
                                    <TextInput 
                                        ref={(input) => { this.txtPassword = input; }}
                                        placeholder={'Senha'}
                                        placeholderTextColor={'grey'}
                                        selectTextOnFocus
                                        returnKeyType={'go'}
                                        autoCapitalize={'none'}
                                        autoCorrect={false}
                                        style={[styles.input, { marginLeft: 55 }]}
                                        secureTextEntry={this.props.hidePw}
                                        underlineColorAndroid={'transparent'}
                                        onChangeText={password => 
                                            this.props.modifyPassword(password)}
                                        value={this.props.password}
                                        onSubmitEditing={() => this.onPressEnterBtn()}
                                    />
                                    <TouchableOpacity
                                        onPressIn={() => this.props.modifyHidePw(false)}
                                        onPressOut={() => this.props.modifyHidePw(true)}
                                    >
                                        <View
                                            style={{ 
                                                marginHorizontal: 15,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Icon
                                                name='eye'
                                                type='material-community'
                                                color='grey'
                                                size={24}
                                                containerStyle={styles.imageStyle}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.loginBtn}>
                                    <TouchableByPlatform 
                                        onPress={() => this.onPressEnterBtn()}
                                    >
                                        <View style={styles.menu}>
                                            {this.renderAnimLogin()}
                                        </View>
                                    </TouchableByPlatform>
                                </View>
                                <View style={styles.loginBtnTwo}>
                                    <TouchableOpacity 
                                        onPress={() => {
                                            if (Actions.currentScene !== 'cadastrar') {
                                                Actions.cadastrar();
                                            }
                                        }}
                                    >
                                        <View style={styles.menuTwo}>
                                            <Text
                                                style={{
                                                    fontFamily: 'OpenSans-SemiBold',
                                                    fontSize: 12,
                                                    color: 'white',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                Cadastre-se 
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.loginBtnTwo}>
                                    <TouchableOpacity 
                                        onPress={() => {
                                            if (Actions.currentScene !== 'recuperarSenha') {
                                                Actions.recuperarSenha();
                                            }
                                        }}
                                    >
                                        <View style={styles.menuTwo}>
                                            <Text
                                                style={{
                                                    fontFamily: 'OpenSans-SemiBold',
                                                    fontSize: 12,
                                                    color: 'white',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                Recuperar senha 
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={{ marginVertical: 10 }} />
                    </ScrollView>
                {/* </ImageBackground> */}
            </TouchableWithoutFeedback>
        </View>
    )
}

const styles = StyleSheet.create({
    viewMain: {
        flexGrow: 1,
        backgroundColor: colorAppPrimary
    },
    viewLogo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imgLogo: {
        width: 250,
        height: 240,
        marginBottom: 10,
        resizeMode: 'stretch'
    },
    loginBtn: {
        marginLeft: 50,
        marginRight: 50,
        marginTop: 15
    },
    loginBtnTwo: {
        marginLeft: 100,
        marginRight: 100,
        marginTop: 10
    },
    input: {
        flex: 1,
        textAlign: 'center',
        fontFamily: 'OpenSans-Regular'
    },
    sectionStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 0.8,
        borderColor: 'grey',
        height: 40,
        borderRadius: 5,
        marginHorizontal: 50,
        marginVertical: 10,
        ...Platform.select({
            ios: {
              shadowColor: 'rgba(0,0,0, .2)',
              shadowOffset: { height: 0, width: 0 },
              shadowOpacity: 1,
              shadowRadius: 1,
            },
            android: {
              elevation: 6
            }
        })
    },
    imageStyle: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    loading: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    menu: {
        flexDirection: 'row',
        backgroundColor: colorAppPrimary,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        borderRadius: 10,
        height: 40,
        borderColor: 'white',
        borderWidth: 1,
        ...Platform.select({
            ios: {
              shadowColor: 'rgba(0,0,0, .2)',
              shadowOffset: { height: 0, width: 0 },
              shadowOpacity: 1,
              shadowRadius: 1,
            },
            android: {
              elevation: 6
            }
        })
    },
    menuTwo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        borderRadius: 10,
        borderColor: 'grey',
        borderWidth: 1,
        backgroundColor: colorAppSecondary,
        ...Platform.select({
            ios: {
              shadowColor: 'rgba(0,0,0, .2)',
              shadowOffset: { height: 0, width: 0 },
              shadowOpacity: 1,
              shadowRadius: 1,
            },
            android: {
              elevation: 4
            }
        })
    },
    txtMenu: {
        fontSize: 16,
        padding: 5,
        color: 'white',
        fontFamily: 'OpenSans-Bold'
    }
});

const mapStateToProps = state => ({
    showLogoLogin: state.LoginReducer.showLogoLogin,
    username: state.LoginReducer.username,
    password: state.LoginReducer.password,
    userToken: state.LoginReducer.userToken,
    hidePw: state.LoginReducer.hidePw,
    indicator: state.LoginReducer.indicator
});

export default connect(mapStateToProps, {
    modifyUsername,
    modifyPassword,
    modifyHidePw,
    modifyModalVisible,
    modifyCleanLogin,
    modifyShowLogoLogin,
    modifyUserToken,
    doLogin
})(Login);
