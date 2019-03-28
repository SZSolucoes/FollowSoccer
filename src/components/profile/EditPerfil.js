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
import { connect } from 'react-redux';
import { 
    FormLabel, 
    FormInput,
    FormValidationMessage,
    Button, 
    Icon
} from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import { TextInputMask } from 'react-native-masked-text';
import { Dropdown } from 'react-native-material-dropdown';
import Moment from 'moment';
import _ from 'lodash';

import firebase from '../../utils/Firebase';
import { checkConInfo, showDropdownAlert } from '../../utils/SystemEvents';
import Card from '../../tools/elements/Card';
import { ERROS } from '../../utils/Constantes';
import { mappedKeyStorage } from '../../utils/Storage';
import cityes from '../../utils/CityStates.json';

const ESTADOS = _.map(cityes.estados, st => ({ value: st.nome, cidades: st.cidades }));

class EditPerfil extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userLogged: { ...this.props.userLogged },
            novaSenha: '',
            novaSenhaRep: '',
            secureOnNovaSenha: true,
            secureOnNovaSenhaRep: true,
            isTelefoneValid: true,
            cleanEditPerfil: false,
            loadingEditP: false,
            loadingSenha: false,
            inputWidth: '99%'
        };
    }

    componentDidMount = () => {
        setTimeout(() => this.setState({ inputWidth: '100%' }), 100);
    }

    shouldComponentUpdate = (nextProps, nextStates) => {
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

    onPressConfirmarEdit = () => {
        const telefone = this.inputTelefone.getRawValue();
        const {
            key,
            nome,
            nomeForm,
            dtnasc,
            endereco,
            estado,
            cidade
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
            estado,
            cidade,
            ...updatesName
        })
        .then(() => {
            this.setState({ loadingEditP: false, isTelefoneValid: true });
            showDropdownAlert(
                'success', 
                'Sucesso', 
                'Edição realizada com sucesso'
            );
        })
        .catch(() => {
            this.setState({ loadingEditP: false, isTelefoneValid: true });
            showDropdownAlert(
                'error', 
                ERROS.perfilEdit.erro, 
                ERROS.perfilEdit.mes
            );
        });
    }

    onPressConfirmarSenha = () => {
        const { novaSenha, novaSenhaRep, userLogged } = this.state;

        if (novaSenha.trim() !== novaSenhaRep.trim()) {
            Alert.alert('Aviso', 'As senhas informadas devem ser iguais.');
            return;
        }

        if (novaSenha.trim().length < 6) {
            Alert.alert('Aviso', 'As senha devem possuir 6 ou mais caracteres.');
            return;
        }

        this.setState({ loadingSenha: true });

        const user = firebase.auth().currentUser;
        const dbUsuariosRef = firebase.database().ref().child(`usuarios/${userLogged.key}`);

        firebase.auth().signInWithEmailAndPassword(user.email, userLogged.senha)
        .then(() => {
            user.updatePassword(novaSenha).then(() => {
                dbUsuariosRef.update({
                    senha: novaSenha,
                    pwRecover: ''
                })
                .then(() => {
                    AsyncStorage.setItem(mappedKeyStorage('password'), novaSenha);
                    firebase.auth().signInWithEmailAndPassword(user.email, novaSenha)
                    .then(() => {
                        this.setState({ loadingSenha: false });
                        showDropdownAlert(
                            'success', 
                            'Sucesso', 
                            'Senha alterada com sucesso'
                        );
                    })
                    .catch(() => {
                        this.setState({ loadingSenha: false });
                        showDropdownAlert(
                            'error', 
                            ERROS.perfilEditPw.erro,
                            ERROS.perfilEditPw.mes
                        );
                    });
                })
                .catch(() => {
                    this.setState({ loadingSenha: false });
                    showDropdownAlert(
                        'error', 
                        ERROS.perfilEditPw.erro,
                        ERROS.perfilEditPw.mes
                    );
                });
            }).catch((error) => {
                this.setState({ loadingSenha: false });

                if (error && error.code && error.code === 'auth/weak-password') {
                    showDropdownAlert(
                        'error', 
                        ERROS.perfilEditPwInsec.erro,
                        ERROS.perfilEditPwInsec.mes
                    );
                } else {
                    showDropdownAlert(
                        'error',
                        ERROS.perfilEditPw.erro,
                        ERROS.perfilEditPw.mes
                    );
                }
            });
        })
        .catch(() => {
            this.setState({ loadingSenha: false });
            showDropdownAlert(
                'error', 
                ERROS.perfilEditPw.erro,
                ERROS.perfilEditPw.mes
            );
        });
    }

    onValidField = (value, field) => {
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

    render = () => {
        const estado = _.find(
            ESTADOS, 
            st => st.value === this.state.userLogged.estado
        );
        let cidades = [];
        if (estado) {
            cidades = _.map(
                estado.cidades, 
                 ct => ({ value: ct })
             );
        }

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
                    <FormLabel labelStyle={styles.text}>ESTADO</FormLabel>
                    <View 
                        style={{ 
                            flex: 1,
                            flexDirection: 'row',
                            borderBottomWidth: 1,
                            borderBottomColor: '#9E9E9E',
                            ...Platform.select({
                            android: {
                                marginHorizontal: 16,
                                paddingHorizontal: 4
                            },
                            ios: {
                                marginHorizontal: 20,
                                paddingHorizontal: 0,
                                paddingBottom: 2
                            }
                        }) }}
                    >
                        <Dropdown
                            value={this.state.userLogged.estado}
                            onChangeText={(value) => this.setState(
                                { 
                                    userLogged: { 
                                        ...this.state.userLogged, 
                                        estado: this.onValidField(value, 'estado'),
                                        cidade: ''
                                    } 
                                }
                            )}
                            fontSize={14}
                            style={[styles.text, styles.input]}
                            itemTextStyle={{ fontFamily: 'OpenSans-Regular' }}
                            data={ESTADOS}
                            containerStyle={{
                                width: this.state.inputWidth,
                                height: 40
                            }}
                            inputContainerStyle={{
                                borderBottomColor: 'transparent',
                                borderBottomWidth: 0,
                                paddingTop: 0,
                                paddingBottom: 0
                            }}
                            rippleInsets={{ top: 0, bottom: -8 }}
                        />
                    </View>
                    <FormLabel labelStyle={styles.text}>CIDADE</FormLabel>
                    <View 
                        style={{ 
                            flex: 1,
                            flexDirection: 'row',
                            borderBottomWidth: 1,
                            borderBottomColor: '#9E9E9E',
                            ...Platform.select({
                            android: {
                                marginHorizontal: 16,
                                paddingHorizontal: 4
                            },
                            ios: {
                                marginHorizontal: 20,
                                paddingHorizontal: 0,
                                paddingBottom: 2
                            }
                        }) }}
                    >
                        <Dropdown
                            value={this.state.userLogged.cidade}
                            onChangeText={(value) => this.setState(
                                { 
                                    userLogged: { 
                                        ...this.state.userLogged, 
                                        cidade: this.onValidField(value, 'cidade') 
                                    } 
                                }
                            )}
                            fontSize={14}
                            dropdownPosition={4}
                            itemCount={10}
                            style={[styles.text, styles.input]}
                            itemTextStyle={{ fontFamily: 'OpenSans-Regular' }}
                            data={cidades}
                            containerStyle={{
                                width: this.state.inputWidth,
                                height: 40
                            }}
                            inputContainerStyle={{
                                borderBottomColor: 'transparent',
                                borderBottomWidth: 0,
                                paddingTop: 0,
                                paddingBottom: 0
                            }}
                            rippleInsets={{ top: 0, bottom: -8 }}
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
                        onChangeText={(value) => this.setState(
                            { 
                                userLogged: { 
                                    ...this.state.userLogged, 
                                    telefone: value
                                } 
                            }
                        )}
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
                        fontFamily={'OpenSans-SemiBold'}
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
                                estado: this.props.userLogged.estado,
                                cidade: this.props.userLogged.cidade
                            },
                            isTelefoneValid: true,
                            cleanEditPerfil: true
                        })}
                        fontFamily={'OpenSans-SemiBold'}
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
                        fontFamily={'OpenSans-SemiBold'}
                    />
                    <Button 
                        small
                        title={'Limpar'} 
                        buttonStyle={{ width: '100%', marginVertical: 10 }}
                        onPress={() => this.setState({
                            senhaAtual: '',
                            novaSenha: '',
                            novaSenhaRep: ''
                        })}
                        fontFamily={'OpenSans-SemiBold'}
                    />
                </Card>
                <View style={{ marginVertical: 60 }} />
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
        fontFamily: 'OpenSans-Regular',
        fontSize: 14,
    },
    inputContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#9E9E9E',
        height: Platform.OS === 'android' ? 45 : 40
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
