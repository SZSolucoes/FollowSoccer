import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Picker,
    ActionSheetIOS,
    Text
} from 'react-native';

import { connect } from 'react-redux';
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage,
    Button
} from 'react-native-elements';
import { TextInputMask } from 'react-native-masked-text';
import _ from 'lodash';

import firebase from '../../../../../utils/Firebase';
import { colorAppForeground, ERROS } from '../../../../../utils/Constantes';
import { checkConInfo, showDropdownAlert } from '../../../../../utils/SystemEvents';
import Card from '../../../../../tools/elements/Card';

const optionsEsporte = [
    'Futebol'
];
const optionsEsporteTipo = {
    Futebol: [
        'Campo',
        'Society',
        'Futsal'
    ]
};

const optionsPeriodicidade = [
    'Semanal',
    'Quinzenal',
    'Mensal'
];

const optionsTipoCobranca = [
    'Jogo',
    'Mensal'
];

class EditGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            nome: '',
            esporte: optionsEsporte[0],
            tipo: optionsEsporteTipo[optionsEsporte[0]][0],
            periodicidade: optionsPeriodicidade[0],
            tipocobranca: optionsTipoCobranca[0],
            valorindividual: 0,
            loading: false,
            validFields: {
                nome: true,
                esporte: true,
                tipo: true,
                periodicidade: true,
                tipocobranca: true,
            }
        };

        this.fbDatabaseRef = firebase.database().ref();
    }

    componentDidMount = () => {
        const { grupoSelected } = this.props;

        if (grupoSelected && grupoSelected.key) {
            this.setState({
                nome: grupoSelected.nome,
                esporte: grupoSelected.esporte,
                tipo: grupoSelected.tipo,
                periodicidade: grupoSelected.periodicidade,
                tipocobranca: grupoSelected.tipocobranca,
                valorindividual: grupoSelected.valorindividual,
                grupoSelectedCopyMount: { ...grupoSelected }
            });
        }
    }

    onPressConfirmar = () => {
        const {
            nome,
            esporte,
            tipo,
            periodicidade,
            tipocobranca,
            validFields
        } = this.state;

        const { grupoSelectedKey } = this.props;

        const valorindividual = this.inputValorRef.getRawValue();

        const newValidFields = { ...validFields };
        newValidFields.nome = true;
        newValidFields.email = true;
        newValidFields.senha = true;

        if (!nome.trim()) newValidFields.nome = false;
        if (!esporte.trim()) newValidFields.esporte = false;
        if (!tipo.trim()) newValidFields.tipo = false;
        if (!periodicidade.trim()) newValidFields.periodicidade = false;
        if (!tipocobranca.trim()) newValidFields.tipocobranca = false;

        if (
            !newValidFields.nome || 
            !newValidFields.esporte || 
            !newValidFields.tipo ||
            !newValidFields.periodicidade ||
            !newValidFields.tipocobranca
        ) { 
            this.scrollView.scrollTo({ y: 5, animated: true }); 
            return this.setState({ validFields: newValidFields }); 
        }

        this.setState({ loading: true, validFields: newValidFields });

        // Gravacao de dados no firebase
        const dbGruposRef = this.fbDatabaseRef.child(`grupos/${grupoSelectedKey}`);
        /* const twofirstKey = userLogged.key.slice(0, 2);
        const twoLastKey = userLogged.key.slice(-2);
        const medianKey = new Date().getTime().toString(36);
        const groupInviteKey = `${twofirstKey}${medianKey}${twoLastKey}`.replace(/=/g, ''); */

        dbGruposRef.update({
            nome,
            esporte,
            tipo,
            periodicidade,
            tipocobranca,
            valorindividual,
            imgbody: '',
            //groupInviteKey,
        })
        .then(() => {
            this.setState({ loading: false });
            showDropdownAlert('success', 'Sucesso', 'Grupo alterado com sucesso');
        })
        .catch(() => {
            this.setState({ loading: false });
            showDropdownAlert(
                'error', 
                ERROS.editGroup.erro, 
                ERROS.editGroup.mes
            );
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
            default:
        }

        return newValue;
    }

    cleanStates = () => {
        this.setState({
            nome: this.state.grupoSelectedCopyMount.nome,
            esporte: this.state.grupoSelectedCopyMount.esporte,
            tipo: this.state.grupoSelectedCopyMount.tipo,
            periodicidade: this.state.grupoSelectedCopyMount.periodicidade,
            tipocobranca: this.state.grupoSelectedCopyMount.tipocobranca,
            valorindividual: this.state.grupoSelectedCopyMount.valorindividual,
            loading: false,
            validFields: {
                nome: true,
                esporte: true,
                tipo: true,
                periodicidade: true,
                tipocobranca: true,
            }
        });
    }

    renderPickerEsporte = () => {
        if (Platform.OS === 'ios') {
            return (
                <TouchableWithoutFeedback
                    onPress={() =>
                        ActionSheetIOS.showActionSheetWithOptions({
                            options: optionsEsporte
                        },
                        (buttonIndex) => {
                            this.setState({ 
                                esporte: optionsEsporte[buttonIndex]
                            });
                        })
                    }
                >
                    <View 
                        style={{ height: 50, width: '105%', marginTop: 9 }}
                    >
                        <Text style={styles.text}>
                            {this.state.esporte}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            );
        }

        return (
            <Picker
                selectedValue={this.state.esporte}
                style={{ 
                    height: 50, 
                    width: '105%', 
                    marginLeft: -4
                }}
                onValueChange={(value) => this.setState({ esporte: value })}
            >
                {
                    _.map(optionsEsporte, (esp, index) => (
                        <Picker.Item label={esp} value={esp} key={index} />
                    ))
                }
            </Picker>
        );
    }

    renderPickerTipo = () => {
        if (Platform.OS === 'ios') {
            return (
                <TouchableWithoutFeedback
                    onPress={() =>
                        ActionSheetIOS.showActionSheetWithOptions({
                            options: optionsEsporteTipo[this.state.esporte]
                        },
                        (buttonIndex) => {
                            this.setState({ 
                                tipo: optionsEsporteTipo[this.state.esporte][buttonIndex]
                            });
                        })
                    }
                >
                    <View 
                        style={{ height: 50, width: '105%', marginTop: 9 }}
                    >
                        <Text style={styles.text}>
                            {this.state.tipo}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            );
        }

        return (
            <Picker
                selectedValue={this.state.tipo}
                style={{ 
                    height: 50, 
                    width: '105%', 
                    marginLeft: -4
                }}
                onValueChange={(value) => this.setState({ tipo: value })}
            >
                {
                    _.map(optionsEsporteTipo[this.state.esporte], (espt, index) => (
                        <Picker.Item label={espt} value={espt} key={index} />
                    ))
                }
            </Picker>
        );
    }

    renderPickerPeriodicidade = () => {
        if (Platform.OS === 'ios') {
            return (
                <TouchableWithoutFeedback
                    onPress={() =>
                        ActionSheetIOS.showActionSheetWithOptions({
                            options: optionsPeriodicidade
                        },
                        (buttonIndex) => {
                            this.setState({ 
                                periodicidade: optionsPeriodicidade[buttonIndex]
                            });
                        })
                    }
                >
                    <View 
                        style={{ height: 50, width: '105%', marginTop: 9 }}
                    >
                        <Text style={styles.text}>
                            {this.state.periodicidade}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            );
        }

        return (
            <Picker
                selectedValue={this.state.periodicidade}
                style={{ 
                    height: 50, 
                    width: '105%', 
                    marginLeft: -4
                }}
                onValueChange={(value) => this.setState({ periodicidade: value })}
            >
                {
                    _.map(optionsPeriodicidade, (esp, index) => (
                        <Picker.Item label={esp} value={esp} key={index} />
                    ))
                }
            </Picker>
        );
    }

    renderPickerTipoCobranca = () => {
        if (Platform.OS === 'ios') {
            return (
                <TouchableWithoutFeedback
                    onPress={() =>
                        ActionSheetIOS.showActionSheetWithOptions({
                            options: optionsTipoCobranca
                        },
                        (buttonIndex) => {
                            this.setState({ 
                                tipocobranca: optionsTipoCobranca[buttonIndex]
                            });
                        })
                    }
                >
                    <View 
                        style={{ height: 50, width: '105%', marginTop: 9 }}
                    >
                        <Text style={styles.text}>
                            {this.state.tipocobranca}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            );
        }

        return (
            <Picker
                selectedValue={this.state.tipocobranca}
                style={{ 
                    height: 50, 
                    width: '105%', 
                    marginLeft: -4
                }}
                onValueChange={(value) => this.setState({ tipocobranca: value })}
            >
                {
                    _.map(optionsTipoCobranca, (esp, index) => (
                        <Picker.Item label={esp} value={esp} key={index} />
                    ))
                }
            </Picker>
        );
    }

    render = () => (
        <ScrollView 
            style={{ flex: 1 }} 
            ref={(ref) => { this.scrollView = ref; }}
            keyboardShouldPersistTaps={'handled'}
        >  
            <View>
                <Card containerStyle={styles.card}>
                    <FormLabel labelStyle={styles.textLabel}>TÍTULO</FormLabel>
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
                        onSubmitEditing={() => false}
                    />
                    { 
                        !this.state.validFields.nome &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    {/* <FormLabel labelStyle={styles.textLabel}>ESPORTE</FormLabel>
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
                        {this.renderPickerEsporte()}
                    </View>
                    { 
                        !this.state.validFields.esporte &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    } */}
                    <FormLabel labelStyle={styles.textLabel}>TIPO</FormLabel>
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
                        {this.renderPickerTipo()}
                    </View>
                    { 
                        !this.state.validFields.tipo &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.textLabel}>PERIODICIDADE</FormLabel>
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
                        {this.renderPickerPeriodicidade()}
                    </View>
                    { 
                        !this.state.validFields.periodicidade &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.textLabel}>TIPO DE COBRANÇA</FormLabel>
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
                        {this.renderPickerTipoCobranca()}
                    </View>
                    { 
                        !this.state.validFields.tipocobranca &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.textLabel}>VALOR INDIVIDUAL</FormLabel>
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
                        onChangeText={value => this.setState({ valorindividual: value })}
                        value={this.state.valorindividual}
                    />
                    <Button 
                        small
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loading ? ' ' : 'Confirmar'} 
                        buttonStyle={{ width: '100%', marginTop: 30 }}
                        onPress={() => checkConInfo(() => this.onPressConfirmar())}
                        fontFamily={'OpenSans-SemiBold'}
                    />
                    <Button 
                        small
                        title={'Limpar'}
                        buttonStyle={{ width: '100%', marginVertical: 10 }}
                        onPress={() => this.cleanStates()}
                        fontFamily={'OpenSans-SemiBold'}
                    />
                </Card>
                <View style={{ marginVertical: 60 }} />
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
        paddingHorizontal: 10
    }
});

const mapStateToProps = state => ({
    dropdownAlert: state.SystemEventsReducer.dropdownAlert,
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoSelectedKey: state.GruposReducer.grupoSelectedKey,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps)(EditGroup);
