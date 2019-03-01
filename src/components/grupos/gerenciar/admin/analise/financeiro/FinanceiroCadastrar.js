import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    Picker,
    TouchableWithoutFeedback,
    Text,
    ActionSheetIOS,
    ScrollView,
    Alert
} from 'react-native';

import { connect } from 'react-redux';
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage,
    Button
} from 'react-native-elements';
import Moment from 'moment';
import b64 from 'base-64';
import { TextInputMask } from 'react-native-masked-text';

import DatePicker from 'react-native-datepicker';
import firebase from '../../../../Firebase';
import { showAlert } from '../../../../utils/store';
import { colorAppF } from '../../../../utils/constantes';
import { checkConInfo } from '../../../../utils/jogosUtils';
import Card from '../../../tools/Card';

class FinanceiroCadastrar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isValorValid: false,
            data: Moment().format('MM/YYYY'),
            tipoOpe: 'receita',
            tipoOpeIos: 'Receita',
            valor: 0,
            loading: false
        };

        this.onPressConfirmar = this.onPressConfirmar.bind(this);
        this.getTipOpeIOS = this.getTipOpeIOS.bind(this);
    }

    onPressConfirmar() {
        const valor = this.inputValorRef.getRawValue();

        this.setState({ loading: true, isValorValid: false, valor });

        const { data, tipoOpe } = this.state;
        const dataAtual = Moment().format('DD/MM/YYYY HH:mm:ss');
        let dataStr = '';

        if (data instanceof Moment) {
            dataStr = Moment(data).format('MM/YYYY');
        } else {
            dataStr = data;
        }

        const dataKey = b64.encode(dataStr);
        const databaseRef = firebase.database().ref();
        const dbAnaliseFina = databaseRef.child(`analise/financeiro/${dataKey}`);

        const asyncFun = async () => {
            const snapExists = await dbAnaliseFina.once('value')
            .then((snapshot) => snapshot)
            .catch(() => null);

            const snap = snapExists && snapExists.val() ? snapExists.val() : null;

            // Se existe entao realiza update com base na operacao
            if (snap && tipoOpe === 'receita' && snap.receita) {
                const asyncAlert = await new Promise((resolve) => {
                    Alert.alert(
                        'Aviso',
                        'Já existe uma receita para a data selecionada!' +
                        '\nConfirma a alteração do valor ?',
                        [
                            {
                                text: 'Sim',
                                onPress: () => {
                                    resolve('sim');
                                },
                            },
                            {
                                text: 'Não',
                                onPress: () => {
                                    resolve('nao');
                                },
                            },
                        ],
                      { cancelable: false },
                    );
                });

                if (asyncAlert === 'sim') {
                    const dbAnaliseFinaRec = dbAnaliseFina.child('receita');
                    await dbAnaliseFinaRec.update({
                        valor
                    })
                    .then(() => showAlert('success', 'Sucesso!', 'Alteração efetuada com sucesso.'))
                    .catch(() => showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro durante a alteração.'
                    ));
                }
            } else if (snap && tipoOpe === 'despesa' && snap.despesa) {
                const asyncAlert = await new Promise((resolve) => {
                    Alert.alert(
                        'Aviso',
                        'Já existe uma despesa para a data selecionada!' +
                        '\nConfirma a alteração do valor ?',
                        [
                            {
                                text: 'Sim',
                                onPress: () => {
                                    resolve('sim');
                                },
                            },
                            {
                                text: 'Não',
                                onPress: () => {
                                    resolve('nao');
                                },
                            },
                        ],
                      { cancelable: false },
                    );
                });

                if (asyncAlert === 'sim') {
                    const dbAnaliseFinaDes = dbAnaliseFina.child('despesa');
                    await dbAnaliseFinaDes.update({
                        valor
                    })
                    .then(() => showAlert('success', 'Sucesso!', 'Alteração efetuada com sucesso.'))
                    .catch(() => showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro durante a alteração.'
                    ));
                }
            // Senao existe entao verifica a inclusao
            } else if (tipoOpe === 'receita') {
                const dbAnaliseFinaRec = dbAnaliseFina.child('receita');
                await dbAnaliseFinaRec.set({
                    valor,
                    dataInclusao: dataAtual
                })
                .then(() => showAlert('success', 'Sucesso!', 'Cadastro efetuado com sucesso.'))
                .catch(() => showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro durante o cadastro.'
                ));
            } else {
                const dbAnaliseFinaDes = dbAnaliseFina.child('despesa');
                await dbAnaliseFinaDes.set({
                    valor,
                    dataInclusao: dataAtual
                })
                .then(() => showAlert('success', 'Sucesso!', 'Cadastro efetuado com sucesso.'))
                .catch(() => 
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro durante a cadastro.'
                ));
            }
            
            this.setState({ loading: false });
        };

        asyncFun();
    }

    getTipOpeIOS(value) {
        switch (value) {
            case 'receita':
                return 'Receita';
            case 'despesa':
                return 'Despesa';
            default:
                return '';
        }
    }

    render() {
        return (
            <ScrollView 
                style={{ flex: 1 }} 
                ref={(ref) => { this.scrollView = ref; }}
                keyboardShouldPersistTaps={'handled'}
            >
                <View>
                    <Card containerStyle={styles.card}>
                        <FormLabel labelStyle={styles.text}>MÊS/ANO</FormLabel>
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
                                androidMode={'spinner'}
                                format='MM/YYYY'
                                maxDate={Moment().format('MM/YYYY')}
                                confirmBtnText='Ok'
                                cancelBtnText='Cancelar'
                                placeholder=' '
                                showIcon={false}
                                customStyles={{
                                    dateInput: StyleSheet.flatten(styles.dateInput),
                                    dateText: StyleSheet.flatten(styles.dateText)
                                }}
                                onDateChange={(date) => this.setState({ data: date })}
                            />
                        </View>
                        <FormLabel labelStyle={styles.text}>TIPO DE OPERAÇÃO</FormLabel>
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
                                    ref={(ref) => { this.inputTipoOpe = ref; }}
                                    selectedValue={this.state.tipoOpe}
                                    style={{ height: 50, width: '105%', marginLeft: -4 }}
                                    onValueChange={(value) => this.setState({ tipoOpe: value })}
                                >
                                    <Picker.Item label={'Receita'} value={'receita'} />
                                    <Picker.Item label={'Despesa'} value={'despesa'} />
                                </Picker>
                                )
                                :
                                (
                                    <TouchableWithoutFeedback
                                        onPress={() =>
                                            ActionSheetIOS.showActionSheetWithOptions({
                                                options: [
                                                    'Receita',
                                                    'Despesa',
                                                ]
                                            },
                                            (buttonIndex) => {
                                                let value = '';
                                                let label = '';
                                                switch (buttonIndex) {
                                                    case 0:
                                                        value = 'receita';
                                                        label = 'Receita';
                                                        break;
                                                    case 1:
                                                        value = 'despesa';
                                                        label = 'Despesa';
                                                        break;
                                                    default:
                                                }

                                                this.setState({ 
                                                    tipoOpe: value, 
                                                    tipoOpeIos: label 
                                                });
                                            })
                                        }
                                    >
                                        <View style={{ height: 50, width: '105%', marginTop: 9 }} >
                                            <Text style={styles.text}>{this.state.tipoOpeIos}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                )
                            }
                        </View>
                        <FormLabel labelStyle={styles.text}>VALOR</FormLabel>
                        <TextInputMask
                            ref={ref => { this.inputValorRef = ref; }}
                            type={'money'}
                            style={styles.input}
                            customTextInput={FormInput}
                            customTextInputProps={{
                                containerStyle: styles.inputContainer,
                                inputStyle: [styles.text, styles.input]
                            }}
                            options={{
                                unit: 'R$ '
                            }}
                            underlineColorAndroid={'transparent'}
                            value={this.state.valor}
                        />
                        { 
                            this.state.isValorValid &&
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
                        />
                        <Button 
                            small
                            title={this.props.keyItem ? 'Restaurar' : 'Limpar'}
                            buttonStyle={{ width: '100%', marginVertical: 10 }}
                            onPress={() => 
                                this.setState({
                                    isValorValid: false,
                                    data: Moment().format('MM/YYYY'),
                                    tipoOpe: 'receita',
                                    tipoOpeIos: this.getTipOpeIOS('receita'),
                                    loading: false,
                                    valor: 0
                            })}
                        />
                    </Card>
                    <View style={{ marginBottom: 30 }} />
                </View>
            </ScrollView>
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
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {})(FinanceiroCadastrar);
