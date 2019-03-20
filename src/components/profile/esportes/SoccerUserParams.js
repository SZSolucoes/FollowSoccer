import React from 'react';
import {
    View,
    Text,
    Platform,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';
import {
    Icon,
    FormLabel
} from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown';
import { colorAppSecondary, ERROS } from '../../../utils/Constantes';
import SoccerPositions from '../../../utils/SoccerPositions.json';
import firebase from '../../../utils/Firebase';
import { checkConInfo, showDropdownAlert } from '../../../utils/SystemEvents';

class SoccerUserParams extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();

        this.state = {
            userLogged: { ...this.props.userLogged },
            loadingCampoPos: false,
            showCampoPosIconSuccess: false,
            showCampoPosIconError: false,
            loadingSocietyPos: false,
            showSocietyPosIconSuccess: false,
            showSocietyPosIconError: false,
            loadingFutsalPos: false,
            showFutsalPosIconSuccess: false,
            showFutsalPosIconError: false,
            inputWidth: '99%'
        };
    }

    componentDidMount = () => {
        setTimeout(() => this.setState({ inputWidth: '100%' }), 100);
    }

    onEditFormCampoPos = (value) => {
        this.setState({ 
            loadingCampoPos: true,
            showCampoPosIconSuccess: false,
            showCampoPosIconError: false
        });

        const { userLogged } = this.props;

        this.dbFirebaseRef.child(`usuarios/${userLogged.key}`)
        .update({ posicaoFutebolCampo: value })
        .then(() => setTimeout(() => {
            this.setState({ 
                loadingCampoPos: false,
                showCampoPosIconSuccess: true,
                showCampoPosIconError: false
            });
        }, 1000))
        .catch(() => setTimeout(() => {
            this.setState({ 
                loadingCampoPos: false,
                showCampoPosIconSuccess: false,
                showCampoPosIconError: true
            });
            showDropdownAlert(
                'error',
                ERROS.profileModaliSave.erro,
                ERROS.profileModaliSave.mes
            );
        }, 1000));
    }

    onEditFormSocietyPos = (value) => {
        this.setState({ 
            loadingSocietyPos: true,
            showSocietyPosIconSuccess: false,
            showSocietyPosIconError: false
        });

        const { userLogged } = this.props;

        this.dbFirebaseRef.child(`usuarios/${userLogged.key}`)
        .update({ posicaoFutebolSociety: value })
        .then(() => setTimeout(() => {
            this.setState({ 
                loadingSocietyPos: false,
                showSocietyPosIconSuccess: true,
                showSocietyPosIconError: false
            });
        }, 1000))
        .catch(() => setTimeout(() => {
            this.setState({ 
                loadingSocietyPos: false,
                showSocietyPosIconSuccess: false,
                showSocietyPosIconError: true
            });
            showDropdownAlert(
                'error',
                ERROS.profileModaliSave.erro,
                ERROS.profileModaliSave.mes
            );
        }, 1000));
    }

    onEditFormFutsalPos = (value) => {
        this.setState({ 
            loadingFutsalPos: true,
            showFutsalPosIconSuccess: false,
            showFutsalPosIconError: false
        });

        const { userLogged } = this.props;

        this.dbFirebaseRef.child(`usuarios/${userLogged.key}`)
        .update({ posicaoFutebolFutsal: value })
        .then(() => setTimeout(() => {
            this.setState({ 
                loadingFutsalPos: false,
                showFutsalPosIconSuccess: true,
                showFutsalPosIconError: false
            });
        }, 1000))
        .catch(() => setTimeout(() => {
            this.setState({ 
                loadingFutsalPos: false,
                showFutsalPosIconSuccess: false,
                showFutsalPosIconError: true
            });
            showDropdownAlert(
                'error',
                ERROS.profileModaliSave.erro,
                ERROS.profileModaliSave.mes
            );
        }, 1000));
    }

    renderCampoPref = () => (
        <View>
            <View
                style={styles.modalidadesText}
            >
                <Text style={styles.text}>
                    Campo
                </Text>
            </View>
            <View style={{ marginTop: 5, marginBottom: 15 }}>
                <View
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
                >
                    <FormLabel 
                        labelStyle={styles.textForm}
                        containerStyle={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginVertical: 5
                        }}
                    >
                        POSIÇÃO
                    </FormLabel>
                    {
                        this.state.loadingCampoPos &&
                        <ActivityIndicator size={'small'} color={colorAppSecondary} />
                    }
                    {
                        this.state.showCampoPosIconSuccess &&
                        <Icon 
                            name='check' 
                            type='material-community' 
                            size={22} 
                            color={colorAppSecondary} 
                        />
                    }
                    {
                        this.state.showCampoPosIconError &&
                        <Icon 
                            name='alert-circle-outline' 
                            type='material-community' 
                            size={22}
                            color={'red'}
                        />
                    }
                </View>
                <View 
                    style={[styles.inputContainer, {
                        flexDirection: 'row',
                        ...Platform.select({
                        android: {
                            marginHorizontal: 16,
                            paddingHorizontal: 4
                        },
                        ios: {
                            marginHorizontal: 20,
                            paddingHorizontal: 6
                        }
                    }) }]}
                >
                    <Dropdown
                        value={this.state.userLogged.posicaoFutebolCampo}
                        onChangeText={(value) => {
                            this.setState(
                                { 
                                    userLogged: { 
                                        ...this.state.userLogged,
                                        posicaoFutebolCampo: value
                                    } 
                                }
                            );
                            checkConInfo(() => this.onEditFormCampoPos(value));
                        }}
                        fontSize={14}
                        style={[styles.textForm, styles.input]}
                        itemTextStyle={{ fontFamily: 'OpenSans-Regular' }}
                        data={SoccerPositions.campo}
                        containerStyle={{
                            width: this.state.inputWidth
                        }}
                        inputContainerStyle={{
                            borderBottomColor: 'transparent',
                            borderBottomWidth: 0,
                            paddingTop: 8,
                            paddingBottom: 0
                        }}
                        rippleInsets={{ top: 0, bottom: -8 }}
                    />
                </View>
            </View>
        </View>
    )

    renderSocietyPref = () => (
        <View>
            <View
                style={styles.modalidadesText}
            >
                <Text style={styles.text}>
                    Society
                </Text>
            </View>
            <View style={{ marginTop: 5, marginBottom: 15 }}>
                <View
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
                >
                    <FormLabel 
                        labelStyle={styles.textForm}
                        containerStyle={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginVertical: 5
                        }}
                    >
                        POSIÇÃO
                    </FormLabel>
                    {
                        this.state.loadingSocietyPos &&
                        <ActivityIndicator size={'small'} color={colorAppSecondary} />
                    }
                    {
                        this.state.showSocietyPosIconSuccess &&
                        <Icon 
                            name='check' 
                            type='material-community' 
                            size={22} 
                            color={colorAppSecondary} 
                        />
                    }
                    {
                        this.state.showSocietyPosIconError &&
                        <Icon 
                            name='alert-circle-outline' 
                            type='material-community' 
                            size={22}
                            color={'red'}
                        />
                    }
                </View>
                <View 
                    style={[styles.inputContainer, {
                        flexDirection: 'row',
                        ...Platform.select({
                        android: {
                            marginHorizontal: 16,
                            paddingHorizontal: 4
                        },
                        ios: {
                            marginHorizontal: 20,
                            paddingHorizontal: 6
                        }
                    }) }]}
                >
                    <Dropdown
                        value={this.state.userLogged.posicaoFutebolSociety}
                        onChangeText={(value) => {
                            this.setState(
                                { 
                                    userLogged: { 
                                        ...this.state.userLogged,
                                        posicaoFutebolSociety: value
                                    } 
                                }
                            );
                            checkConInfo(() => this.onEditFormSocietyPos(value));
                        }}
                        fontSize={14}
                        style={[styles.textForm, styles.input]}
                        itemTextStyle={{ fontFamily: 'OpenSans-Regular' }}
                        data={SoccerPositions.society}
                        containerStyle={{
                            width: this.state.inputWidth
                        }}
                        inputContainerStyle={{
                            borderBottomColor: 'transparent',
                            borderBottomWidth: 0,
                            paddingTop: 8,
                            paddingBottom: 0
                        }}
                        rippleInsets={{ top: 0, bottom: -8 }}
                    />
                </View>
            </View>
        </View>
    )

    renderFutsalPref = () => (
        <View>
            <View
                style={styles.modalidadesText}
            >
                <Text style={styles.text}>
                    Futsal
                </Text>
            </View>
            <View style={{ marginTop: 5, marginBottom: 15 }}>
                <View
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
                >
                    <FormLabel 
                        labelStyle={styles.textForm}
                        containerStyle={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginVertical: 5
                        }}
                    >
                        POSIÇÃO
                    </FormLabel>
                    {
                        this.state.loadingFutsalPos &&
                        <ActivityIndicator size={'small'} color={colorAppSecondary} />
                    }
                    {
                        this.state.showFutsalPosIconSuccess &&
                        <Icon 
                            name='check' 
                            type='material-community' 
                            size={22} 
                            color={colorAppSecondary} 
                        />
                    }
                    {
                        this.state.showFutsalPosIconError &&
                        <Icon 
                            name='alert-circle-outline' 
                            type='material-community' 
                            size={22}
                            color={'red'}
                        />
                    }
                </View>
                <View 
                    style={[styles.inputContainer, {
                        flexDirection: 'row',
                        ...Platform.select({
                        android: {
                            marginHorizontal: 16,
                            paddingHorizontal: 4
                        },
                        ios: {
                            marginHorizontal: 20,
                            paddingHorizontal: 6
                        }
                    }) }]}
                >
                    <Dropdown
                        value={this.state.userLogged.posicaoFutebolFutsal}
                        onChangeText={(value) => {
                            this.setState(
                                { 
                                    userLogged: { 
                                        ...this.state.userLogged,
                                        posicaoFutebolFutsal: value
                                    } 
                                }
                            );
                            checkConInfo(() => this.onEditFormFutsalPos(value));
                        }}
                        fontSize={14}
                        style={[styles.textForm, styles.input]}
                        itemTextStyle={{ fontFamily: 'OpenSans-Regular' }}
                        data={SoccerPositions.futsal}
                        containerStyle={{
                            width: this.state.inputWidth
                        }}
                        inputContainerStyle={{
                            borderBottomColor: 'transparent',
                            borderBottomWidth: 0,
                            paddingTop: 8,
                            paddingBottom: 0
                        }}
                        rippleInsets={{ top: 0, bottom: -8 }}
                    />
                </View>
            </View>
        </View>
    )

    render = () => (
        <View>
            {this.renderCampoPref()}
            {this.renderSocietyPref()}
            {this.renderFutsalPref()}
        </View>
    )
}

const styles = StyleSheet.create({
    viewMain: {
        flex: 1
    },  
    text: { 
        fontSize: 16,
        fontFamily: 'OpenSans-SemiBold',
        color: 'white' 
    },
    card: {
        flex: 1,
        padding: 5,
        margin: 0,
        marginHorizontal: 5,
        marginVertical: 15,
        borderRadius: 5,
        overflow: 'hidden'
    },
    titleContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    modalidadesText: {
        backgroundColor: colorAppSecondary,
        marginHorizontal: 5,
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    inputContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#9E9E9E',
        height: Platform.OS === 'android' ? 45 : 40,
    },
    input: {
        paddingBottom: 0, 
        width: null,
        color: 'black',
        height: 35
    },
    textForm: {
        fontFamily: 'OpenSans-Regular',
        fontSize: 14,
        marginTop: 0
    }
});

const mapStateToProps = (state) => ({
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps)(SoccerUserParams);
