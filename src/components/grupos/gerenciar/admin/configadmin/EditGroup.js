import React from 'react';
import { 
    View,
    Text,
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
            imgbody: '',
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
                imgbody: grupoSelected.imgbody,
                grupoSelectedCopyMount: { ...grupoSelected }
            });
        }
    }

    componentDidUpdate = (prevProps) => {
        const { grupoSelected, userLogged } = this.props;

        if (grupoSelected && grupoSelected.key) {
            const isEqualGroup = _.isEqual(
                [
                    prevProps.grupoSelected.nome,
                    prevProps.grupoSelected.esporte,
                    prevProps.grupoSelected.tipo,
                    prevProps.grupoSelected.periodicidade,
                    prevProps.grupoSelected.tipocobranca,
                    prevProps.grupoSelected.valorindividual,
                    prevProps.grupoSelected.imgbody
                ],
                [
                    grupoSelected.nome,
                    grupoSelected.esporte,
                    grupoSelected.tipo,
                    grupoSelected.periodicidade,
                    grupoSelected.tipocobranca,
                    grupoSelected.valorindividual,
                    grupoSelected.imgbody
                ]
            );

            if (!isEqualGroup && grupoSelected.userKeyLastEdit === userLogged.key) {
                this.setState({
                    nome: grupoSelected.nome,
                    esporte: grupoSelected.esporte,
                    tipo: grupoSelected.tipo,
                    periodicidade: grupoSelected.periodicidade,
                    tipocobranca: grupoSelected.tipocobranca,
                    valorindividual: grupoSelected.valorindividual,
                    imgbody: grupoSelected.imgbody,
                    grupoSelectedCopyMount: { ...grupoSelected }
                });
            }
        }
    }

    onPressConfirmar = async () => {
        const {
            nome,
            esporte,
            tipo,
            imgbody,
            validFields,
            tipocobranca,
            b64ImageData,
            periodicidade,
            b64ImageContentType,
            grupoSelectedCopyMount
        } = this.state;

        const bckImage = grupoSelectedCopyMount.imgbody;

        const { grupoSelectedKey, userLogged } = this.props;

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
        let imgbodyEdit = imgbody;
        let isNewImg = false;

        if (b64ImageData) {
            const Blob = RNFetchBlob.polyfill.Blob;
            const glbXMLHttpRequest = global.XMLHttpRequest;
            const glbBlob = global.Blob;

            global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
            global.Blob = Blob;

            let uploadBlob = null;

            try {
                const fileName = b64.encode(new Date().getTime().toString());
                const imgExt = b64ImageContentType.slice(b64ImageContentType.indexOf('/') + 1);
                const storageGroupRef = this.fbStorageRef.ref()
                .child(`grupos/${grupoSelectedKey}/${fileName}.${imgExt}`);
    
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

                    return false;
                }
                
                if (uploadBlob) {
                    await storageGroupRef.put(blob, { contentType: b64ImageContentType });
                    imgbodyEdit = await storageGroupRef.getDownloadURL().then(url => url);

                    if (imgbodyEdit) isNewImg = true;
    
                    global.XMLHttpRequest = glbXMLHttpRequest;
                    global.Blob = glbBlob;
    
                    uploadBlob.close();
                    uploadBlob = null;
                }
            } catch (e) {
                this.setState({ loading: false });

                showDropdownAlert(
                    'error',
                    ERROS.groupCadImgPush.erro,
                    ERROS.groupCadImgPush.mes
                );

                global.XMLHttpRequest = glbXMLHttpRequest;
                global.Blob = glbBlob;

                if (uploadBlob) {
                    uploadBlob.close();
                    uploadBlob = null;
                }

                if (isNewImg) {
                    this.fbStorageRef.refFromURL(imgbodyEdit).delete()
                    .then(() => true)
                    .catch(() => true);
                }

                return false;
            }
        }

        dbGruposRef.update({
            nome,
            esporte,
            tipo,
            periodicidade,
            tipocobranca,
            valorindividual,
            imgbody: imgbodyEdit,
            userKeyLastEdit: userLogged.key
            //groupInviteKey,
        })
        .then(() => {
            this.setState({ loading: false });
            showDropdownAlert('success', 'Sucesso', 'Grupo alterado com sucesso');

            // Caso existe uma imagem ja upada, deleta a anterior para manter a nova
            if (isNewImg && bckImage) {
                this.fbStorageRef.refFromURL(bckImage).delete()
                .then(() => true)
                .catch(() => true);
            }
        })
        .catch((e) => {
            console.log(e);
            this.setState({ loading: false });
            showDropdownAlert(
                'error', 
                ERROS.editGroup.erro, 
                ERROS.editGroup.mes
            );

            // Se ocorreu erro no processo de gravacao entao realiza o rollback 
            //deletando a imagem upada no storage
            if (isNewImg) {
                this.fbStorageRef.refFromURL(imgbodyEdit).delete()
                .then(() => true)
                .catch(() => true);
            }
        });
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
                    imgbody: `data:${image.mime};base64,${image.data}`,
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
            nome: this.state.grupoSelectedCopyMount.nome,
            esporte: this.state.grupoSelectedCopyMount.esporte,
            tipo: this.state.grupoSelectedCopyMount.tipo,
            periodicidade: this.state.grupoSelectedCopyMount.periodicidade,
            tipocobranca: this.state.grupoSelectedCopyMount.tipocobranca,
            valorindividual: this.state.grupoSelectedCopyMount.valorindividual,
            loading: false,
            imgbody: this.state.grupoSelectedCopyMount.imgbody,
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
                                    !!this.state.imgbody && 
                                    (<FastImage
                                        resizeMode={FastImage.resizeMode.stretch} 
                                        source={{ uri: this.state.imgbody }}
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
                        title={'Restaurar'}
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
    }
});

const mapStateToProps = state => ({
    dropdownAlert: state.SystemEventsReducer.dropdownAlert,
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoSelectedKey: state.GruposReducer.grupoSelectedKey,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps)(EditGroup);
