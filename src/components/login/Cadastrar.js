import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    ScrollView
} from 'react-native';

import { connect } from 'react-redux';
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage,
    Button, 
    Icon
} from 'react-native-elements';
import Moment from 'moment';
import b64 from 'base-64';
import { Actions } from 'react-native-router-flux';

import firebase from '../../utils/Firebase';
import { colorAppForeground, ERROS } from '../../utils/Constantes';
import { checkConInfo, showDropdownAlert } from '../../utils/SystemEvents';
import { usuarioAttr } from '../../utils/UserUtils';
import Card from '../../tools/elements/Card';

class Cadastrar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            senha: '',
            nome: '',
            nomeForm: '',
            loading: false,
            secureOn: true,
            validFields: {
                nome: true,
                email: true,
                senha: true
            }
        };

        this.onPressConfirmar = this.onPressConfirmar.bind(this);
        this.onValidField = this.onValidField.bind(this);
    }

    onPressConfirmar = () => {
        const {
            nome,
            email,
            senha,
            nomeForm,
            validFields
        } = this.state;

        const newValidFields = { ...validFields };
        newValidFields.nome = true;
        newValidFields.email = true;
        newValidFields.senha = true;

        if (!nome.trim()) newValidFields.nome = false;
        if (!email.trim()) newValidFields.email = false;
        if (!senha.trim()) newValidFields.senha = false;

        if (
            !newValidFields.nome || 
            !newValidFields.email || 
            !newValidFields.senha
        ) return this.setState({ validFields: newValidFields });

        this.setState({ loading: true, validFields: newValidFields });

        // Gravacao de dados no firebase
        const databaseRef = firebase.database().ref();
        const authRef = firebase.auth();

        const emailUser64 = b64.encode(email);
        const dataAtual = Moment().format('DD/MM/YYYY HH:mm:ss');

        const dbUsuariosRef = databaseRef.child(`usuarios/${emailUser64}`);

        authRef.createUserWithEmailAndPassword(email, senha)
        .then(() => {
            const newUser = {
                ...usuarioAttr,
                userDisabled: 'false',
                email,
                senha,
                nome,
                nomeForm,
                dataCadastro: dataAtual
            };
            dbUsuariosRef.set({ ...newUser })
            .then(() => {
                this.setState({ loading: false });
                showDropdownAlert('success', 'Sucesso', 'Cadastro realizado com sucesso');
                Actions.pop();
            })
            .catch(() => {
                this.setState({ loading: false });
                showDropdownAlert(
                    'error', 
                    ERROS.cadUser.erro, 
                    ERROS.cadUser.mes
                );
            });
        })
        .catch((error) => {
            this.setState({ loading: false });
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    dbUsuariosRef.once('value')
                    .then(snap => {
                        if (snap && snap.val()) {
                            showDropdownAlert(
                                'error', 
                                ERROS.emailExists.erro, 
                                ERROS.emailExists.mes
                            );
                        } else {
                            const newUser = {
                                ...usuarioAttr,
                                userDisabled: 'false',
                                email,
                                senha,
                                nome,
                                nomeForm,
                                dataCadastro: dataAtual
                            };
                            dbUsuariosRef.set({ ...newUser })
                            .then(() => {
                                showDropdownAlert(
                                    'success', 
                                    'Sucesso', 
                                    'Cadastro realizado com sucesso'
                                );
                                Actions.pop();
                            })
                            .catch(() => {
                                showDropdownAlert(
                                    'error', 
                                    ERROS.cadUser.erro, 
                                    ERROS.cadUser.mes
                                );
                            });
                        }
                    })
                    .catch(() => showDropdownAlert(
                        'error', 
                        ERROS.emailExists.erro, 
                        ERROS.emailExists.mes
                    ));
                    break;
                case 'auth/invalid-email':
                    showDropdownAlert(
                        'error', 
                        ERROS.emailInvalid.erro, 
                        ERROS.emailInvalid.mes
                    );
                    break;
                case 'auth/operation-not-allowed':
                    showDropdownAlert(
                        'error', 
                        ERROS.cadOff.erro, 
                        ERROS.cadOff.mes
                    );
                    break;
                case 'auth/weak-password':
                    showDropdownAlert(
                        'error', 
                        ERROS.passwordInsec.erro, 
                        ERROS.passwordInsec.mes,
                        5000
                    );
                    break;
                default:
            }
        }); 
    }

    onValidField = (value, field) => {
        let newValue = value;

        switch (field) {
            case 'nome':
                newValue = value.length <= 40 ? value : value.slice(0, 40);
                newValue = newValue.replace(/[^a-zA-Z0-9À-ÿ ]/g, '');
                newValue = newValue.replace(/ {2}/g, ' ');
                break;
            case 'nomeForm':
                newValue = value.length <= 50 ? value : value.slice(0, 40);
                newValue = newValue.replace(/[^a-zA-Z0-9À-ÿ ]/g, '');
                newValue = newValue.replace(/ {2}/g, ' ');
                break;
            case 'email':
                newValue = value.length <= 100 ? value : value.slice(0, 100);
                newValue = newValue.replace(/[^a-zA-Z0-9@.]/g, '');
                break;
            case 'senha':
                newValue = value.length <= 20 ? value : value.slice(0, 20);
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
                    <FormLabel labelStyle={styles.textLabel}>APELIDO</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        ref={(ref) => { this.inputNome = ref; }}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.nome}
                        onChangeText={
                            (value) => 
                            this.setState({ nome: this.onValidField(value, 'nome') })
                        }
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputEmailRef.focus()}
                    />
                    { 
                        !this.state.validFields.nome &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.textLabel}>E-MAIL</FormLabel>
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
                        onSubmitEditing={() => this.inputSenha.focus()}
                    />
                    { 
                        !this.state.validFields.email &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.textLabel}>SENHA</FormLabel>
                    <View>
                        <FormInput
                            selectTextOnFocus
                            autoCorrect={false}
                            secureTextEntry={this.state.secureOn}
                            ref={(ref) => { this.inputSenha = ref; }}
                            containerStyle={styles.inputContainer}
                            returnKeyType={'next'}
                            inputStyle={[styles.text, styles.input]}
                            value={this.state.senha}
                            onChangeText={
                                (value) => 
                                this.setState({ senha: this.onValidField(value, 'senha') })
                            }
                            underlineColorAndroid={'transparent'}
                            onSubmitEditing={() => this.inputNomeForm.focus()}
                        />
                        <TouchableOpacity 
                            style={styles.eye}
                            onPressIn={() => this.setState({ secureOn: false })}
                            onPressOut={() => this.setState({ secureOn: true })}
                        >
                            <Icon
                                name='eye' 
                                type='material-community' 
                                size={24} color='#9E9E9E' 
                            />
                        </TouchableOpacity>
                    </View>
                    { 
                        !this.state.validFields.senha &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.textLabel}>NOME COMPLETO (OPCIONAL)</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        ref={(ref) => { this.inputNomeForm = ref; }}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.nomeForm}
                        onChangeText={
                            (value) => 
                            this.setState({ nomeForm: this.onValidField(value, 'nomeForm') })
                        }
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputDate.onPressDate()}
                    />
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
                                senha: '',
                                nome: '',
                                nomeForm: '',
                                loading: false,
                                secureOn: true,
                                validFields: {
                                    nome: true,
                                    email: true,
                                    senha: true
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

export default connect(mapStateToProps)(Cadastrar);
