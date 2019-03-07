import React from 'react';
import { 
    View, 
    StyleSheet,
    ScrollView,
    Platform,
    TouchableOpacity,
    Alert,
    AsyncStorage
} from 'react-native';
import { 
    FormLabel, 
    FormInput,
    FormValidationMessage,
    Button, 
    Icon
} from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import { TextInputMask } from 'react-native-masked-text';
import Moment from 'moment';

import { connect } from 'react-redux';
import firebase from '../../Firebase';
import { checkConInfo } from '../../utils/jogosUtils';
import { showAlert, mappedKeyStorage } from '../../utils/store';
import { updateUserDB } from '../../utils/userUtils';
import Card from '../../tools/elements/Card';

class EditPerfil extends React.Component {
    constructor(props) {
        super(props);

        this.onPressConfirmarEdit = this.onPressConfirmarEdit.bind(this);
        this.onPressConfirmarSenha = this.onPressConfirmarSenha.bind(this);
        this.onValidField = this.onValidField.bind(this);

        this.state = {
            userLogged: { ...this.props.userLogged },
            novaSenha: '',
            novaSenhaRep: '',
            secureOnNovaSenha: true,
            secureOnNovaSenhaRep: true,
            isTelefoneValid: true,
            cleanEditPerfil: false,
            loadingEditP: false,
            loadingSenha: false
        };
    }

    shouldComponentUpdate(nextProps, nextStates) {
        if (!nextStates.cleanEditPerfil &&
            (nextStates.userLogged.telefone !== this.inputTelefone.getRawValue())) {
            this.setState({ 
                userLogged: {
                    ...this.state.userLogged, 
                    telefone: this.inputTelefone.getRawValue()
                }
            });
        } else if (nextStates.cleanEditPerfil) {
            this.setState({
                cleanEditPerfil: false
            });
        }
        
        return nextProps !== this.props || nextStates !== this.state;
    }

    onPressConfirmarEdit() {
        const telefone = this.inputTelefone.getRawValue();
        const {
            key,
            nome,
            nomeForm,
            dtnasc,
            endereco
        } = this.state.userLogged;
        const updatesName = {};
        const newName = nome;
        const oldName = this.props.userLogged.nome;

        if (telefone && !this.inputTelefone.isValid()) {
            this.setState({ isTelefoneValid: false });
            return;
        }

        this.setState({ loadingEditP: true });

        if (newName !== oldName) {
            updatesName.infoImgUpdated = 'false';
            updatesName.jogosImgUpdated = 'false';
        }

        const dbUsuariosRef = firebase.database().ref().child(`usuarios/${key}`);

        dbUsuariosRef.update({
            nome,
            nomeForm,
            endereco,
            dtnasc,
            telefone,
            ...updatesName
        })
        .then(() => {
            if (newName !== oldName) {
                setTimeout(() => updateUserDB(
                    'false',
                    'false',
                    this.props.userLogged.email, 
                    this.props.userLogged.key, 
                    this.props.userLogged.imgAvatar,
                    newName
                ), 2000);
            }
            this.setState({ loadingEditP: false, isTelefoneValid: true });
            showAlert('success', 'Sucesso', 'Edição realizada com sucesso');
        })
        .catch(() => {
            this.setState({ loadingEditP: false, isTelefoneValid: true });
            showAlert(
                'danger', 
                'Ops', 
                'Ocorreu um erro ao editar o perfil'
            );
        });
    }

    onPressConfirmarSenha() {
        const { novaSenha, novaSenhaRep, userLogged } = this.state;

        if (novaSenha.trim() !== novaSenhaRep.trim()) {
            Alert.alert('Aviso', 'As senhas informadas devem ser iguais');
            return;
        }

        if (novaSenha.trim().length < 6) {
            Alert.alert('Aviso', 'As senhas devem possuir 6 ou mais caracteres');
            return;
        }

        this.setState({ loadingSenha: true });

        const user = firebase.auth().currentUser;
        const dbUsuariosRef = firebase.database().ref().child(`usuarios/${userLogged.key}`);

        firebase.auth().signInWithEmailAndPassword(user.email, userLogged.senha)
        .then(() => {
            dbUsuariosRef.update({
                senha: novaSenha,
                pwRecover: ''
            })
            .then(() => {
                user.updatePassword(novaSenha).then(() => {
                    this.setState({ loadingSenha: false });
                    AsyncStorage.setItem(mappedKeyStorage('password'), novaSenha);
                    showAlert('success', 'Sucesso', 'Senha alterada com sucesso');
                }).catch((error) => {
                    this.setState({ loadingSenha: false });

                    if (error && error.code && error.code === 'auth/weak-password') {
                        showAlert('danger', 'Erro', 'A senha informada é insegura');
                    } else {
                        showAlert(
                            'danger', 
                            'Ops', 
                            'Ocorreu um erro ao alterar a senha'
                        );
                    }
                });
            })
            .catch(() => {
                this.setState({ loadingSenha: false });
                showAlert(
                    'danger', 
                    'Ops', 
                    'Ocorreu um erro ao alterar a senha'
                );
            });
        })
        .catch(() => {
            this.setState({ loadingSenha: false });
            showAlert(
                'danger', 
                'Ops', 
                'Ocorreu um erro ao alterar a senha'
            );
        });
    }

    onValidField(value, field) {
        let newValue = value;

        switch (field) {
            case 'nome':
                newValue = value.length <= 40 ? value : this.state.userLogged.nome;
                newValue = newValue.replace(/[^a-zA-Z0-9À-ÿ ]/g, '');
                break;
            case 'nomeForm':
                newValue = value.length <= 40 ? value : this.state.userLogged.nomeForm;
                newValue = newValue.replace(/[^a-zA-Z0-9À-ÿ ]/g, '');
                break;
            case 'endereco':
                newValue = value.length <= 100 ? value : this.state.userLogged.endereco;
                newValue = newValue.replace(/[^a-zA-Z0-9À-ÿ ]/g, '');
                break;
            case 'novasenha':
                newValue = value.length <= 20 ? value : this.state.novaSenha;
                break;
            case 'novasenharep':
                newValue = value.length <= 20 ? value : this.state.novaSenhaRep;
                break;
            default:
        }

        return newValue;
    }

    render() {
        return (
            <ScrollView style={styles.viewPrinc}>
                <Card 
                    containerStyle={styles.card}
                    title={'Dados do Perfil'}
                    titleStyle={{ fontSize: 18 }}
                >
                    <FormLabel labelStyle={styles.text}>APELIDO</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.userLogged.nome}
                        onChangeText={(value) => this.setState(
                            { 
                                userLogged: { 
                                    ...this.state.userLogged, 
                                    nome: this.onValidField(value, 'nome') 
                                } 
                            }
                        )}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputNomeForm.focus()}
                    />
                    <FormLabel labelStyle={styles.text}>NOME</FormLabel>
                    <FormInput
                        ref={ref => (this.inputNomeForm = ref)}
                        selectTextOnFocus
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.userLogged.nomeForm}
                        onChangeText={(value) => this.setState(
                            { 
                                userLogged: { 
                                    ...this.state.userLogged, 
                                    nomeForm: this.onValidField(value, 'nomeForm') 
                                } 
                            }
                        )}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputDate.onPressDate()}
                    />
                    <FormLabel labelStyle={styles.text}>DATA NASCIMENTO</FormLabel>
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
                            date={this.state.userLogged.dtnasc}
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
                            onDateChange={(value) => this.setState(
                                { userLogged: { ...this.state.userLogged, dtnasc: value } }
                            )}
                        />
                    </View>
                    <FormLabel labelStyle={styles.text}>ENDEREÇO</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.userLogged.endereco}
                        onChangeText={(value) => this.setState(
                            { 
                                userLogged: { 
                                    ...this.state.userLogged, 
                                    endereco: this.onValidField(value, 'endereco') 
                                } 
                            }
                        )}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputTelefone.getElement().focus()}
                    />
                    <FormLabel labelStyle={styles.text}>TELEFONE</FormLabel>
                    <TextInputMask
                        ref={ref => { this.inputTelefone = ref; }}
                        type={'cel-phone'}
                        style={styles.input}
                        customTextInput={FormInput}
                        customTextInputProps={{
                            containerStyle: styles.inputContainer,
                            inputStyle: [styles.text, styles.input]
                        }}
                        underlineColorAndroid={'transparent'}
                        value={this.state.userLogged.telefone}
                    />
                    { 
                        !this.state.isTelefoneValid &&
                        <FormValidationMessage>Telefone inválido</FormValidationMessage> 
                    }
                    <Button 
                        small
                        loading={this.state.loadingEditP}
                        disabled={this.state.loadingEditP}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loadingEditP ? ' ' : 'Confirmar'} 
                        buttonStyle={{ width: '100%', marginTop: 30 }}
                        onPress={() => checkConInfo(() => this.onPressConfirmarEdit())}
                    />
                    <Button 
                        small
                        title={'Restaurar'} 
                        buttonStyle={{ width: '100%', marginVertical: 10 }}
                        onPress={() => this.setState({
                            userLogged: { 
                                ...this.state.userLogged,
                                nome: this.props.userLogged.nome, 
                                nomeForm: this.props.userLogged.nomeForm, 
                                dtnasc: this.props.userLogged.dtnasc, 
                                endereco: this.props.userLogged.endereco, 
                                telefone: this.props.userLogged.telefone,
                            },
                            isTelefoneValid: true,
                            cleanEditPerfil: true
                        })}
                    />
                </Card>
                <Card 
                    containerStyle={styles.card}
                    title={'Modificar Senha'}
                    titleStyle={{ fontSize: 18 }}
                >
                    <FormLabel labelStyle={styles.text}>NOVA SENHA</FormLabel>
                    <View>
                        <FormInput
                            selectTextOnFocus
                            autoCorrect={false}
                            secureTextEntry={this.state.secureOnNovaSenha}
                            containerStyle={styles.inputContainer}
                            returnKeyType={'next'}
                            inputStyle={[styles.text, styles.input]}
                            value={this.state.novaSenha}
                            onChangeText={(value) => this.setState(
                                { novaSenha: this.onValidField(value, 'novasenha') }
                            )}
                            underlineColorAndroid={'transparent'}
                            onSubmitEditing={() => this.inputNovaSenhaRep.focus()}
                        />
                        <TouchableOpacity 
                            style={styles.eye}
                            onPressIn={() => this.setState({ secureOnNovaSenha: false })}
                            onPressOut={() => this.setState({ secureOnNovaSenha: true })}
                        >
                            <Icon
                                name='eye' 
                                type='material-community' 
                                size={24} color='#9E9E9E' 
                            />
                        </TouchableOpacity>
                    </View>
                    <FormLabel labelStyle={styles.text}>REPETIR NOVA SENHA</FormLabel>
                    <View>
                        <FormInput
                            selectTextOnFocus
                            autoCorrect={false}
                            secureTextEntry={this.state.secureOnNovaSenhaRep}
                            ref={(ref) => { this.inputNovaSenhaRep = ref; }}
                            containerStyle={styles.inputContainer}
                            returnKeyType={'next'}
                            inputStyle={[styles.text, styles.input]}
                            value={this.state.novaSenhaRep}
                            onChangeText={(value) => this.setState(
                                { novaSenhaRep: this.onValidField(value, 'novasenharep') }
                            )}
                            underlineColorAndroid={'transparent'}
                        />
                        <TouchableOpacity 
                            style={styles.eye}
                            onPressIn={() => this.setState({ secureOnNovaSenhaRep: false })}
                            onPressOut={() => this.setState({ secureOnNovaSenhaRep: true })}
                        >
                            <Icon
                                name='eye' 
                                type='material-community' 
                                size={24} color='#9E9E9E' 
                            />
                        </TouchableOpacity>
                    </View>
                    <Button 
                        small
                        loading={this.state.loadingSenha}
                        disabled={this.state.loadingSenha}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loadingSenha ? ' ' : 'Confirmar'} 
                        buttonStyle={{ width: '100%', marginTop: 30 }}
                        onPress={() => checkConInfo(() => this.onPressConfirmarSenha())}
                    />
                    <Button 
                        small
                        title={'Limpar'} 
                        buttonStyle={{ width: '100%', marginVertical: 10 }}
                        onPress={() => this.setState({
                            senhaAtual: '',
                            novaSenha: ''
                        })}
                    />
                </Card>
                <View style={{ marginBottom: 30 }} />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
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
    userLogged: state.LoginReducer.userLogged,
    username: state.LoginReducer.username
});

export default connect(mapStateToProps, {})(EditPerfil);
