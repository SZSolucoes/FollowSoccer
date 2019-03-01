import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    Picker,
    TouchableWithoutFeedback,
    Text,
    ActionSheetIOS
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

import DatePicker from 'react-native-datepicker';
import firebase from '../../../Firebase';
import { showAlert } from '../../../utils/store';
import { colorAppF } from '../../../utils/constantes';
import { checkConInfo } from '../../../utils/jogosUtils';
import { usuarioAttr, updateUserDB } from '../../../utils/userUtils';
import Card from '../../tools/Card';
import { store } from '../../../App';

class UsuarioEdit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isEmailValid: props.isEmailValid ? props.isEmailValid : false,
            isSenhaValid: props.isSenhaValid ? props.isSenhaValid : false,
            email: props.email ? props.email : '',
            senha: props.senha ? props.senha : '',
            nome: props.nome ? props.nome : '',
            nomeForm: props.nomeForm ? props.nomeForm : '',
            data: props.data ? props.data : Moment().format('DD/MM/YYYY'),
            tipoPerfil: props.tipoPerfil ? props.tipoPerfil : '',
            tipoPerfilIos: this.getPerfilIOS(props.tipoPerfil ? props.tipoPerfil : ''),
            tipoUsuario: props.tipoUsuario ? props.tipoUsuario : '1',
            tipoUsuarioIos: this.getTipoUsuarioIOS(props.tipoUsuario ? props.tipoUsuario : ''),
            loading: props.loading ? props.loading : false,
            scrollView: props.scrollView ? props.scrollView : null,
            secureOn: true
        };

        this.onPressConfirmar = this.onPressConfirmar.bind(this);
        this.renderUserType = this.renderUserType.bind(this);
        this.getPerfilIOS = this.getPerfilIOS.bind(this);
        this.getTipoUsuarioIOS = this.getTipoUsuarioIOS.bind(this);
    }

    onPressConfirmar() {
        this.setState({ loading: true });

        const { 
            email, 
            senha, 
            nome,
            nomeForm, 
            data, 
            tipoPerfil, 
            tipoUsuario, 
            scrollView 
        } = this.state;

        const updatesName = {};
        const newName = nome;
        const oldName = this.props.nome;
        const odlEmail = this.props.email;
        const odlPw = this.props.senha;

        const { userLogged } = this.props;

        if (newName !== oldName) {
            updatesName.infoImgUpdated = 'false';
            updatesName.jogosImgUpdated = 'false';
        }

        const { keyItem } = this.props;
        let dataAtual = '';
        let dataStr = '';
        const isValid = { isEmailValid: true, isSenhaValid: true };
        isValid.isEmailValid = !email;
        isValid.isSenhaValid = !senha;

        if (isValid.isEmailValid || isValid.isSenhaValid) {
            this.setState({
                ...isValid,
                loading: false
            });
            if (scrollView) {
                scrollView().scrollTo({
                y: 0,
                duration: 2000,
                animated: true
              });
            }
            return;
        }

        const databaseRef = firebase.database().ref();
        const auth = firebase.auth();
        dataAtual = Moment().format('DD/MM/YYYY HH:mm:ss');
        const emailUser64 = b64.encode(email);

        if (data instanceof Moment) {
            dataStr = Moment(data).format('DD/MM/YYYY');
        } else {
            dataStr = data;
        }

        const dbUsuariosRef = keyItem ? 
        databaseRef.child(`usuarios/${keyItem}`) 
        : 
        databaseRef.child(`usuarios/${emailUser64}`);

        if (keyItem) {
            if (odlEmail !== email || odlPw !== senha) {
                this.onUpdateEmailOrPw(
                    odlEmail !== email, 
                    odlPw !== senha,
                    odlEmail,
                    odlPw,
                    email, 
                    senha, 
                    {
                        nome,
                        nomeForm,
                        dtnasc: dataStr, 
                        tipoPerfil,
                        level: tipoUsuario,
                        ...updatesName
                    },
                    keyItem, 
                    userLogged
                );
            } else {
                dbUsuariosRef.update({
                    nome,
                    nomeForm,
                    dtnasc: dataStr, 
                    tipoPerfil,
                    level: tipoUsuario,
                    ...updatesName
                })
                .then(() => {
                    if (newName !== oldName) {
                        setTimeout(() => updateUserDB(
                            'false',
                            'false',
                            this.props.email, 
                            keyItem, 
                            this.props.imgAvatar,
                            newName
                        ), 2000);
                    }
                    
                    dbUsuariosRef.once('value', snapvl => {
                        const snapVal = snapvl.val();
                        store.dispatch({
                            type: '',
                            payload: [...this.props.listUsuarios, { key: snapvl.key, ...snapVal }]
                        });
                        this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                        showAlert('success', 'Sucesso!', 'Edição realizada com sucesso.');
                        this.props.onPressBack(true);
                    });
                })
                .catch(() => {
                    this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro ao editar o usuário.'
                    );
                });  
            }
        } else {
            auth.createUserWithEmailAndPassword(email, senha)
            .then(() => {
                const newUser = {
                    ...usuarioAttr,
                    userDisabled: 'false',
                    email,
                    senha,
                    nome,
                    nomeForm,
                    dtnasc: dataStr, 
                    tipoPerfil,
                    level: tipoUsuario,
                    dataCadastro: dataAtual
                };
                dbUsuariosRef.set({ ...newUser })
                .then(() => {
                    this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                    showAlert('success', 'Sucesso!', 'Cadastro realizado com sucesso.');
                })
                .catch(() => {
                    this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro ao cadastrar o usuário.'
                    );
                });
            })
            .catch((error) => {
                this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        dbUsuariosRef.once('value')
                        .then(snap => {
                            if (snap && snap.val()) {
                                showAlert('danger', 'Erro!', 'Email já cadastrado.');
                            } else {
                                const newUser = {
                                    ...usuarioAttr,
                                    userDisabled: 'false',
                                    email,
                                    senha,
                                    nome,
                                    nomeForm,
                                    dtnasc: dataStr, 
                                    tipoPerfil,
                                    level: tipoUsuario,
                                    dataCadastro: dataAtual
                                };
                                dbUsuariosRef.set({ ...newUser })
                                .then(() => {
                                    showAlert(
                                        'success', 
                                        'Sucesso!', 
                                        'Cadastro realizado com sucesso.'
                                    );
                                })
                                .catch(() => {
                                    showAlert(
                                        'danger', 
                                        'Ops!', 
                                        'Ocorreu um erro ao cadastrar o usuário.'
                                    );
                                });
                            }
                        })
                        .catch(() => showAlert('danger', 'Erro!', 'Email já cadastrado.'));
                        break;
                    case 'auth/invalid-email':
                        showAlert('danger', 'Erro!', 'Email informado não é válido..');
                        break;
                    case 'auth/operation-not-allowed':
                        showAlert(
                            'danger', 
                            'Erro!', 
                            'Cadastro de usuários desabilitado no firebase.'
                        );
                        break;
                    case 'auth/weak-password':
                        showAlert('danger', 'Erro!', 'A senha informada é insegura.');
                        break;
                    default:
                }
            }); 
        }
    }

    async onUpdateEmailOrPw(
        isUpdateEmail, 
        isUpdateSenha, 
        oldEmail,
        oldPw, 
        newEmail, 
        newPw,
        params, 
        keyItem, 
        userLogged) {
        const dbNewUserRef = firebase.database().ref().child(`usuarios/${b64.encode(newEmail)}`);
        const dbUsuariosRef = firebase.database().ref().child(`usuarios/${keyItem}`);

        await firebase.auth().signInWithEmailAndPassword(oldEmail, oldPw)
        .then(async (userFb) => {
            let emailUp = oldEmail;
            let pwUp = oldPw;
            
            if (isUpdateEmail) {
                const updatedEmail = await userFb.user.updateEmail(newEmail)
                .then(() => true)
                .catch((error) => {
                    firebase.auth().signInWithEmailAndPassword(userLogged.email, userLogged.senha)
                    .then(() => true).catch(() => false);
                    const valided = error && error.code;
                    if (valided && error.code === 'auth/invalid-email') {
                        showAlert('danger', 'Erro!', 'E-mail inválido.');
                    } else if (valided && error.code === 'auth/email-already-in-use') {
                        showAlert('danger', 'Erro!', 'E-mail já em uso.');
                    } else {
                        showAlert(
                            'danger', 
                            'Ops!', 
                            'Ocorreu um erro ao alterar a senha.'
                        );
                    }

                    return false;
                });

                if (updatedEmail) {
                    emailUp = newEmail;
                } else {
                    this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                    return;
                }
            }

            if (isUpdateSenha) {
                const updatedSenha = await userFb.user.updatePassword(newPw)
                .then(() => true)
                .catch(async (error) => {
                    if (isUpdateEmail) {
                        await userFb.user.updateEmail(oldEmail)
                        .then(() => true).catch(() => false);
                    }
                    firebase.auth().signInWithEmailAndPassword(userLogged.email, userLogged.senha)
                    .then(() => true).catch(() => false);
                    if (error && error.code && error.code === 'auth/weak-password') {
                        showAlert('danger', 'Erro!', 'A senha informada é insegura.');
                    } else {
                        showAlert(
                            'danger', 
                            'Ops!', 
                            'Ocorreu um erro ao alterar a senha.'
                        );
                    }

                    return false;
                });

                if (updatedSenha) {
                    pwUp = newPw;
                } else {
                    this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                    return;
                }
            }

            if (isUpdateEmail) {
                dbUsuariosRef.once('value', snapv => {
                    const snapValN = snapv.val();
                    dbNewUserRef.set({
                        ...snapValN,
                        email: emailUp,
                        senha: pwUp,
                        ...params
                    })
                    .then(() => {
                        dbUsuariosRef.remove().then(() => true).catch(() => false);
                        firebase.auth()
                        .signInWithEmailAndPassword(userLogged.email, userLogged.senha)
                        .then(() => true).catch(() => false);
        
                        this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                        showAlert('success', 'Sucesso!', 'Edição realizada com sucesso.');
                        this.props.onPressBack(true);
                    })
                    .catch(() => {
                        firebase
                        .auth().signInWithEmailAndPassword(userLogged.email, userLogged.senha)
                        .then(() => true).catch(() => false);
        
                        this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
        
                        showAlert(
                            'danger', 
                            'Ops!', 
                            'Ocorreu um erro durante a edição. 002'
                        );
                    });
                });
            } else {
                dbUsuariosRef.update({
                    email: emailUp,
                    senha: pwUp,
                    ...params
                })
                .then(() => {
                    firebase.auth().signInWithEmailAndPassword(userLogged.email, userLogged.senha)
                    .then(() => true).catch(() => false);
    
                    this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                    showAlert('success', 'Sucesso!', 'Edição realizada com sucesso.');
                    this.props.onPressBack(true);
                })
                .catch(() => {
                    firebase.auth().signInWithEmailAndPassword(userLogged.email, userLogged.senha)
                    .then(() => true).catch(() => false);
    
                    this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
    
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro durante a edição. 002'
                    );
                });
            }
        })
        .catch(() => {
            this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
            firebase.auth().signInWithEmailAndPassword(userLogged.email, userLogged.senha)
            .then(() => true).catch(() => false);
            showAlert(
                'danger', 
                'Ops!', 
                'Ocorreu um erro durante a edição. 003'
            );
        });
    }

    getPerfilIOS(value) {
        switch (value) {
            case 'visitante':
                return 'Visitante';
            case 'sociocontrib':
                return 'Sócio Contribuinte';
            case 'sociopatrim':
                return 'Sócio Patrimonial';
            case 'convidado':
                return 'Convidado';
            default:
                return 'Convidado';
        }
    }

    getTipoUsuarioIOS(value) {
        switch (value) {
            case '0':
                return 'Administrador';
            case '1':
                return 'Comum';
            default:
                return 'Comum';
        }
    }

    renderUserType() {
        let renderField = false;
        
        if (this.props.userLevel === '255') {
            renderField = this.props.tipoUsuario !== '255';
        } 
        
        if (renderField) {
            return (
                <View>
                    <FormLabel labelStyle={styles.text}>TIPO DE USUÁRIO</FormLabel>
                    <View
                        style={[styles.inputContainer, { 
                            flex: 1, 
                            flexDirection: 'row',
                            ...Platform.select({
                            android: {
                                marginHorizontal: 16
                            },
                            ios: {
                                marginHorizontal: 20
                            }
                        }) }]}
                    >
                        {
                            Platform.OS === 'android' ?
                            (
                            <Picker
                                ref={(ref) => { this.inputTipoUsuario = ref; }}
                                selectedValue={this.state.tipoUsuario}
                                style={{ height: 50, width: '105%', marginLeft: -4 }}
                                onValueChange={(value) => {
                                    if (this.props.keyItem) {
                                        this.setState({ tipoUsuario: value });
                                    } else {
                                        this.setState({ tipoUsuario: value });
                                        this.props.onChangeSuperState({ 
                                            tipoUsuario: value 
                                        });
                                    }
                                }}
                            >
                                <Picker.Item label={'Comum'} value={'1'} />
                                <Picker.Item label={'Administrador'} value={'0'} />
                            </Picker>
                            )
                            :
                            (
                                <TouchableWithoutFeedback
                                    onPress={() =>
                                        ActionSheetIOS.showActionSheetWithOptions({
                                            options: [
                                                'Comum',
                                                'Administrador'
                                            ]
                                        },
                                        (buttonIndex) => {
                                            let value = '';
                                            let label = '';
                                            switch (buttonIndex) {
                                                case 0:
                                                    value = '1';
                                                    label = 'Comum';
                                                    break;
                                                case 1:
                                                    value = '0';
                                                    label = 'Administrador';
                                                    break;
                                                default:
                                            }
                                            if (this.props.keyItem) {
                                                this.setState({ 
                                                    tipoUsuario: value, 
                                                    tipoUsuarioIos: label 
                                                });
                                            } else {
                                                this.setState({ 
                                                    tipoUsuario: value, 
                                                    tipoUsuarioIos: label 
                                                });
                                                this.props.onChangeSuperState(
                                                    { tipoUsuario: value }
                                                );
                                            }
                                        })
                                    }
                                >
                                    <View 
                                        style={{ height: 50, width: '105%', marginTop: 9 }}
                                    >
                                        <Text style={styles.text}>
                                            {this.state.tipoUsuarioIos}
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        }
                    </View>
                </View>
            );
        }

        return false;
    }

    render() {
        return (
            <View>
                <Card containerStyle={styles.card}>
                    <FormLabel labelStyle={styles.text}>EMAIL</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.email}
                        autoCapitalize={'none'}
                        onChangeText={(value) => {
                            if (this.props.keyItem) {
                                this.setState({ email: value });
                            } else {
                                this.setState({ email: value });
                                this.props.onChangeSuperState({ email: value });
                            }
                        }}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputSenha.focus()}
                    />
                    { 
                        this.state.isEmailValid &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.text}>SENHA</FormLabel>
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
                            onChangeText={(value) => {
                                if (this.props.keyItem) {
                                    this.setState({ senha: value });
                                } else {
                                    this.setState({ senha: value });
                                    this.props.onChangeSuperState({ senha: value });
                                }
                            }}
                            underlineColorAndroid={'transparent'}
                            onSubmitEditing={() => this.inputNome.focus()}
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
                        this.state.isSenhaValid &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.text}>APELIDO</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        ref={(ref) => { this.inputNome = ref; }}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.nome}
                        onChangeText={(value) => {
                            if (this.props.keyItem) {
                                this.setState({ nome: value });
                            } else {
                                this.setState({ nome: value });
                                this.props.onChangeSuperState({ nome: value });
                            }
                        }}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputNomeForm.focus()}
                    />
                    <FormLabel labelStyle={styles.text}>NOME</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        ref={(ref) => { this.inputNomeForm = ref; }}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.nomeForm}
                        onChangeText={(value) => {
                            if (this.props.keyItem) {
                                this.setState({ nomeForm: value });
                            } else {
                                this.setState({ nomeForm: value });
                                this.props.onChangeSuperState({ nomeForm: value });
                            }
                        }}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputDate.onPressDate()}
                    />
                    <FormLabel labelStyle={styles.text}>DATA ANIVERSÁRIO</FormLabel>
                    <View 
                        style={[styles.inputContainer, { 
                            flex: 1, 
                            flexDirection: 'row',
                            ...Platform.select({
                            android: {
                                marginHorizontal: 16
                            },
                            ios: {
                                marginHorizontal: 20
                            }
                        }) }]}
                    >
                        <DatePicker
                            ref={(ref) => { this.inputDate = ref; }}
                            style={[styles.inputContainer, { flex: 1 }]}
                            date={this.state.data}
                            mode='date'
                            format='DD/MM/YYYY'
                            maxDate={Moment().format('DD/MM/YYYY')}
                            confirmBtnText='Ok'
                            cancelBtnText='Cancelar'
                            placeholder=' '
                            showIcon={false}
                            customStyles={{
                                dateInput: StyleSheet.flatten(styles.dateInput),
                                dateText: StyleSheet.flatten(styles.dateText)
                            }}
                            onDateChange={(date) => {
                                if (this.props.keyItem) {
                                    this.setState({ data: date }); 
                                } else {
                                    this.setState({ data: date }); 
                                    this.props.onChangeSuperState({ data: date });
                                }
                            }}
                        />
                    </View>
                    <FormLabel labelStyle={styles.text}>PERFIL</FormLabel>
                    <View
                        style={[styles.inputContainer, { 
                            flex: 1, 
                            flexDirection: 'row',
                            ...Platform.select({
                            android: {
                                marginHorizontal: 16
                            },
                            ios: {
                                marginHorizontal: 20
                            }
                        }) }]}
                    >
                        {
                            Platform.OS === 'android' ?
                            (
                            <Picker
                                ref={(ref) => { this.inputTipoPerfil = ref; }}
                                selectedValue={this.state.tipoPerfil}
                                style={{ height: 50, width: '105%', marginLeft: -4 }}
                                onValueChange={(value) => {
                                    if (this.props.keyItem) {
                                        this.setState({ tipoPerfil: value });
                                    } else {
                                        this.setState({ tipoPerfil: value });
                                        this.props.onChangeSuperState({ tipoPerfil: value });
                                    }
                                }}
                            >
                                <Picker.Item label={'Convidado'} value={'convidado'} />
                                <Picker.Item label={'Sócio Patrimonial'} value={'sociopatrim'} />
                                <Picker.Item label={'Sócio Contribuinte'} value={'sociocontrib'} />
                                <Picker.Item label={'Visitante'} value={'visitante'} />
                            </Picker>
                            )
                            :
                            (
                                <TouchableWithoutFeedback
                                    onPress={() =>
                                        ActionSheetIOS.showActionSheetWithOptions({
                                            options: [
                                                'Convidado',
                                                'Sócio Patrimonial', 
                                                'Sócio Contribuinte',
                                                'Visitante',
                                            ]
                                          },
                                          (buttonIndex) => {
                                            let value = '';
                                            let label = '';
                                            switch (buttonIndex) {
                                                case 3:
                                                    value = 'visitante';
                                                    label = 'Visitante';
                                                    break;
                                                case 2:
                                                    value = 'sociocontrib';
                                                    label = 'Sócio Contribuinte';
                                                    break;
                                                case 1:
                                                    value = 'sociopatrim';
                                                    label = 'Sócio Patrimonial';
                                                    break;
                                                case 0:
                                                    value = 'convidado';
                                                    label = 'Convidado';
                                                    break;
                                                default:
                                            }
                                            if (this.props.keyItem) {
                                                this.setState({ 
                                                    tipoPerfil: value, 
                                                    tipoPerfilIos: label 
                                                });
                                            } else {
                                                this.setState({ 
                                                    tipoPerfil: value, 
                                                    tipoPerfilIos: label 
                                                });
                                                this.props.onChangeSuperState(
                                                    { tipoPerfil: value }
                                                );
                                            }
                                        })
                                    }
                                >
                                    <View style={{ height: 50, width: '105%', marginTop: 9 }} >
                                        <Text style={styles.text}>{this.state.tipoPerfilIos}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        }
                    </View>
                    {this.renderUserType()}
                    <Button 
                        small
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loading ? ' ' : 'Confirmar'} 
                        buttonStyle={{ width: '100%', marginTop: 30 }}
                        onPress={() => checkConInfo(() => this.onPressConfirmar())}
                    />
                    <Button 
                        small
                        title={this.props.keyItem ? 'Restaurar' : 'Limpar'}
                        buttonStyle={{ width: '100%', marginVertical: 10 }}
                        onPress={() => {
                            if (this.props.keyItem) {
                                this.setState({
                                    isEmailValid: this.props.isEmailValid ? 
                                    this.props.isEmailValid : false,
                                    isSenhaValid: this.props.isSenhaValid ? 
                                    this.props.isSenhaValid : false,
                                    email: this.props.email ? this.props.email : '',
                                    senha: this.props.senha ? this.props.senha : '',
                                    nome: this.props.nome ? this.props.nome : '',
                                    nomeForm: this.props.nomeForm ? this.props.nomeForm : '',
                                    data: this.props.data ? 
                                    this.props.data : Moment().format('DD/MM/YYYY'),
                                    tipoPerfil: this.props.tipoPerfil ? this.props.tipoPerfil : '',
                                    tipoPerfilIos: this.getPerfilIOS(
                                        this.props.tipoPerfil ? this.props.tipoPerfil : ''
                                    ),
                                    tipoUsuario: this.props.tipoUsuario ? 
                                    this.props.tipoUsuario : '1',
                                    tipoUsuarioIos: this.getTipoUsuarioIOS(
                                        this.props.tipoUsuario ? this.props.tipoUsuario : ''
                                    ),
                                    loading: this.props.loading ? this.props.loading : false,
                                });
                            } else {
                                this.setState({
                                    isEmailValid: false,
                                    isSenhaValid: false,
                                    email: '',
                                    senha: '',
                                    nome: '',
                                    nomeForm: '',
                                    data: Moment().format('DD/MM/YYYY'),
                                    tipoPerfil: '',
                                    tipoPerfilIos: this.getPerfilIOS(''),
                                    tipoUsuario: '1',
                                    tipoUsuarioIos: this.getTipoUsuarioIOS(''),
                                    loading: false
                                });
                            }
                        }}
                    />
                </Card>
                <View style={{ marginVertical: 60 }} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF
    },
    text: {
        fontSize: 14,
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
    viewImageSelect: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2, 
        borderColor: '#EEEEEE',
        borderRadius: 0.9
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

const mapStateToProps = (state) => ({
    userLevel: state.LoginReducer.userLevel,
    userLogged: state.LoginReducer.userLogged,
    listUsuarios: state.UsuariosReducer.listUsuarios
});

export default connect(mapStateToProps, {})(UsuarioEdit);
