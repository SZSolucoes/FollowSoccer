/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { 
    Text,
    View,
    Picker,
    Platform,
    ScrollView,
    StyleSheet,
    ActionSheetIOS,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';

import { connect } from 'react-redux';
import { 
    Icon,
    Button,
    FormLabel, 
    FormInput, 
    FormValidationMessage
} from 'react-native-elements';
import { TextInputMask } from 'react-native-masked-text';
import FastImage from 'react-native-fast-image';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'rn-fetch-blob';
import _ from 'lodash';
import b64 from 'base-64';
import Firebase from '@firebase/app';

import firebase from '../../utils/Firebase';
import { colorAppForeground, ERROS } from '../../utils/Constantes';
import { checkConInfo, showDropdownAlert } from '../../utils/SystemEvents';
import Card from '../../tools/elements/Card';
import { retServerTime } from '../../utils/UtilsTools';

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

class CreateGroup extends React.Component {
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
            imgJogoUri: '',
            b64ImageData: '',
            b64ImageContentType: '',
            validFields: {
                nome: true,
                esporte: true,
                tipo: true,
                periodicidade: true,
                tipocobranca: true,
            }
        };

        this.fbDatabaseRef = firebase.database().ref();
        this.fbStorageRef = firebase.storage();
    }

   onPressConfirmar = async () => {
        const {
            nome,
            esporte,
            tipo,
            validFields,
            tipocobranca,
            b64ImageData,
            periodicidade,
            b64ImageContentType,
        } = this.state;

        const { userLogged } = this.props;

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

        try {
            // Gravacao de dados no firebase
            const dbGruposRef = this.fbDatabaseRef.child('grupos');
            const fbUsuarioRef = this.fbDatabaseRef.child(`usuarios/${userLogged.key}`);
            const fbUsuarioGrupoRef = this.fbDatabaseRef.child(`usuarios/${userLogged.key}/grupos`);
            const twofirstKey = userLogged.key.slice(0, 2);
            const twoLastKey = userLogged.key.slice(-2);
            const medianKey = new Date().getTime().toString(36);
            const groupInviteKey = `${twofirstKey}${medianKey}${twoLastKey}`.replace(/=/g, '');

            let dataAtual = await retServerTime();

            if (!dataAtual) {
                dataAtual = Firebase.database.ServerValue.TIMESTAMP;
            }

            const ret = await dbGruposRef.push({
                nome,
                esporte,
                tipo,
                periodicidade,
                tipocobranca,
                valorindividual,
                userowner: userLogged.key,
                dtcriacao: dataAtual,
                imgbody: '',
                groupInviteKey,
                convites: { push: 'push' },
                userKeyLastEdit: userLogged.key,
                participantes: { [userLogged.key]: {
                    imgAvatar: userLogged.imgAvatar,
                    key: userLogged.key,
                    nome: userLogged.nome,
                    jogoNotifCad: 'on',
                    jogoNotifReminder: 'on',
                    enqueteNotif: 'on',
                    muralNotif: 'on'
                } }
            })
            .catch(() => false);

            if (ret) {
                const snap = await fbUsuarioRef.once('value');

                if (snap) {
                    const snapVal = snap.val();
                    const keyGroup = ret.getKey();

                    if (snapVal) {
                        let imgbody = '';

                        if (b64ImageData) {
                            const Blob = RNFetchBlob.polyfill.Blob;
                            const glbXMLHttpRequest = global.XMLHttpRequest;
                            const glbBlob = global.Blob;
                
                            global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
                            global.Blob = Blob;
                
                            let uploadBlob = null;
                
                            const fileName = b64.encode(new Date().getTime().toString());
                            const imgExt = b64ImageContentType
                            .slice(b64ImageContentType.indexOf('/') + 1);
                            const storageGroupRef = this.fbStorageRef.ref()
                            .child(`grupos/${keyGroup}/${fileName}.${imgExt}`);
                
                            const blob = await Blob.build(
                                b64ImageData, 
                                { type: `${b64ImageContentType};BASE64` }
                            );
                            uploadBlob = blob;
            
                            if (!uploadBlob) {
                                this.setState({ loading: false });

                                showDropdownAlert(
                                    'error',
                                    ERROS.groupCadImgPush.erro,
                                    ERROS.groupCadImgPush.mes
                                );
                                global.XMLHttpRequest = glbXMLHttpRequest;
                                global.Blob = glbBlob;

                                this.fbDatabaseRef.child(`grupos/${keyGroup}`).remove();

                                return false;
                            }

                            await storageGroupRef.put(blob, { contentType: b64ImageContentType });

                            imgbody = await storageGroupRef.getDownloadURL().then(url => url);

                            global.XMLHttpRequest = glbXMLHttpRequest;
                            global.Blob = glbBlob;

                            if (uploadBlob) {
                                uploadBlob.close();
                            }

                            if (!imgbody) {
                                this.setState({ loading: false });

                                showDropdownAlert(
                                    'error',
                                    ERROS.groupCadImgPush.erro,
                                    ERROS.groupCadImgPush.mes
                                );
                                
                                this.fbDatabaseRef.child(`grupos/${keyGroup}`).remove();
    
                                return false;
                            }
                        }

                        const newGroup = { [keyGroup]: { groupKey: keyGroup } };
                        const retA = await fbUsuarioGrupoRef.update({
                            ...newGroup
                        }).then(() => true).catch(() => false);

                        if (retA) {
                            const retB = !imgbody || await this.fbDatabaseRef
                            .child(`grupos/${keyGroup}`).update({
                                imgbody
                            }).then(() => true).catch(() => false);
                            
                            if (retB) {
                                showDropdownAlert('success', 'Sucesso', 'Grupo criado com sucesso');
                                this.cleanStates();
                            } else {
                                this.setState({ loading: false });
                                showDropdownAlert(
                                    'error', 
                                    ERROS.cadGroup.erro,
                                    ERROS.cadGroup.mes
                                );
                            }

                            return false;
                        }

                        this.setState({ loading: false });
                        showDropdownAlert(
                            'error',
                            ERROS.groupCadImgPush.erro,
                            ERROS.groupCadImgPush.mes
                        );

                        this.fbDatabaseRef.child(`grupos/${keyGroup}`).remove();
                        if (imgbody) {
                            this.fbStorageRef.refFromURL(imgbody).delete()
                            .then(() => true)
                            .catch(() => true);
                        }
                    }
                }
            } 
        } catch (e) {
            this.setState({ loading: false });
            showDropdownAlert(
                'error', 
                ERROS.cadGroup.erro, 
                ERROS.cadGroup.mes
            );

            return false;
        }

        this.setState({ loading: false });
        showDropdownAlert(
            'error', 
            ERROS.cadGroup.erro, 
            ERROS.cadGroup.mes
        );

        return true;
    }

    onPressSelectImg = () => {
        ImagePicker.openPicker({
            width: 600,
            height: 400,
            cropping: true,
            includeBase64: true,
            cropperCircleOverlay: false,
            mediaType: 'photo'
        }).then(image => {
            if (image) {
                let contentType = '';
                if (image.mime) {
                    contentType = image.mime;
                }
                
                this.setState({ 
                    imgJogoUri: `data:${image.mime};base64,${image.data}`,
                    b64ImageData: image.data,
                    b64ImageContentType: contentType
                });
            }
        }).catch(() => false);
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
            nome: '',
            esporte: optionsEsporte[0],
            tipo: optionsEsporteTipo[optionsEsporte[0]][0],
            periodicidade: optionsPeriodicidade[0],
            tipocobranca: optionsTipoCobranca[0],
            valorindividual: 0,
            loading: false,
            imgJogoUri: '',
            b64ImageData: '',
            b64ImageContentType: '',
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
                    <FormLabel labelStyle={styles.text}>IMAGEM DE EXIBIÇÃO</FormLabel>
                    <View style={{ marginVertical: 20, marginHorizontal: 10 }}>
                        <TouchableOpacity
                            onPress={() => this.onPressSelectImg()}
                        >
                            <View style={styles.viewImageSelect}>
                                <Icon 
                                    name='folder-image' 
                                    type='material-community' 
                                    size={34} color='#9E9E9E' 
                                />
                                <FormLabel 
                                    labelStyle={[styles.text, { marginTop: 0, marginBottom: 0 }]}
                                >
                                    Selecionar imagem
                                </FormLabel> 
                            </View>
                            <View style={[styles.viewImageSelect, { height: 200 }]}>
                                { 
                                    !!this.state.imgJogoUri && 
                                    (<FastImage
                                        resizeMode={FastImage.resizeMode.stretch} 
                                        source={{ uri: this.state.imgJogoUri }}
                                        style={{
                                            flex: 1,
                                            alignSelf: 'stretch',
                                            width: undefined,
                                            height: undefined
                                        }}
                                    />)
                                }
                            </View>
                        </TouchableOpacity>
                    </View>
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
    },
    viewImageSelect: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2, 
        borderColor: '#EEEEEE',
        borderRadius: 0.9
    },
});

const mapStateToProps = state => ({
    dropdownAlert: state.SystemEventsReducer.dropdownAlert,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps)(CreateGroup);
