import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    ScrollView
} from 'react-native';

import { connect } from 'react-redux';
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage,
    Button
} from 'react-native-elements';
import b64 from 'base-64';

import firebase from '../../utils/Firebase';
import { colorAppForeground, ERROS } from '../../utils/Constantes';
import { checkConInfo, showDropdownAlert } from '../../utils/SystemEvents';
import { sendPwRecover } from '../../utils/Email';
import Card from '../../tools/elements/Card';

class RecuperarSenha extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            loading: false,
            validFields: {
                email: true
            }
        };

        this.onPressConfirmar = this.onPressConfirmar.bind(this);
        this.onValidField = this.onValidField.bind(this);
    }

    onPressConfirmar = async () => {
        const newPw = Math.random().toString(36).slice(-8);
        const user = {
            device: Platform.OS === 'ios' ? 'iPhone' : 'Android',
            newPw
        };

        const {
            email,
            validFields
        } = this.state;

        const newValidFields = { ...validFields };
        newValidFields.email = true;

        if (!email.trim()) newValidFields.email = false;

        if ( 
            !newValidFields.email
        ) return this.setState({ validFields: newValidFields });

        this.setState({ loading: true, validFields: newValidFields });

        const databaseRef = firebase.database().ref();

        const emailUser64 = b64.encode(email);
       
        const dbUsuariosRef = databaseRef.child(`usuarios/${emailUser64}`);

        const snapUser = await dbUsuariosRef.once('value');

        if (snapUser && snapUser.val()) {
            const hasUpdate = await dbUsuariosRef.update({
                pwRecover: newPw
            })
            .then(() => true)
            .catch(() => false);

            if (hasUpdate) {
                const hasSendMail = await sendPwRecover(
                    email,
                    user,
                    //anexos
                );

                if (hasSendMail) {
                    showDropdownAlert(
                        'success', 
                        'Sucesso!', 
                        'Foi encaminhado uma nova senha de recuperação para o e-mail informado.',
                        5000
                    );

                    this.setState({ loading: false, validFields: newValidFields, email: '' });
                    return;
                } 

                showDropdownAlert(
                    'error', 
                    ERROS.default.erro, 
                    ERROS.default.mes
                );
            } else {
                showDropdownAlert(
                    'error', 
                    ERROS.default.erro, 
                    ERROS.default.mes
                );
            }

            this.setState({ loading: false, validFields: newValidFields });
        } else {
            this.setState({ loading: false, validFields: newValidFields });
            showDropdownAlert(
                'error', 
                ERROS.emailInvalid.erro, 
                ERROS.emailInvalid.mes
            );
        }
    }

    onValidField(value, field) {
        let newValue = value;

        switch (field) {
            case 'email':
                newValue = value.length <= 100 ? value : value.slice(0, 100);
                newValue = newValue.replace(/[^a-zA-Z0-9@.]/g, '');
                break;
            default:
        }

        return newValue;
    }

    render = () => (
        <ScrollView 
            style={{ flex: 1 }} 
            ref={(ref) => { this.scrollView = ref; }}
            keyboardShouldPersistTaps={'handled'}
        >  
            <View>
                <Card containerStyle={styles.card}>
                    <FormLabel labelStyle={styles.textLabel}>EMAIL</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        ref={(ref) => { this.inputEmailRef = ref; }}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.email}
                        autoCapitalize={'none'}
                        onChangeText={
                            (value) => 
                            this.setState({ email: this.onValidField(value, 'email') })
                        }
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => checkConInfo(() => this.onPressConfirmar())}
                    />
                    { 
                        !this.state.validFields.email &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <Button 
                        small
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loading ? ' ' : 'Confirmar'} 
                        buttonStyle={{ width: '100%', marginTop: 30 }}
                        onPress={() => checkConInfo(() => this.onPressConfirmar())}
                        fontFamily='OpenSans-SemiBold'
                    />
                    <Button 
                        small
                        title={'Limpar'}
                        buttonStyle={{ width: '100%', marginVertical: 10 }}
                        onPress={() => 
                            this.setState({
                                email: '',
                                loading: false,
                                validFields: {
                                    email: true
                                }
                            })
                        }
                        fontFamily='OpenSans-SemiBold'
                    />
                </Card>
                <View style={{ marginBottom: 30 }} />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
    text: {
        fontSize: 14,
        fontFamily: 'OpenSans-Regular'
    },
    textLabel: {
        fontSize: 14,
        fontFamily: 'OpenSans-Bold',
        fontWeight: 'bold'
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
    card: {
        paddingHorizontal: 10,
    },
    dateInput: {
        borderWidth: 0,
        alignItems: 'flex-start',
        height: 35,
        ...Platform.select({
            android: {
                paddingLeft: 3,
                justifyContent: 'flex-end'
            },
            ios: {
                paddingLeft: 0,
                justifyContent: 'center'
            }
        })
    },
    eye: { 
        position: 'absolute', 
        right: 0, 
        marginHorizontal: 20,
        marginTop: 5,
        zIndex: 1
    }
});

const mapStateToProps = state => ({
    dropdownAlert: state.SystemEventsReducer.dropdownAlert,
});

export default connect(mapStateToProps)(RecuperarSenha);
