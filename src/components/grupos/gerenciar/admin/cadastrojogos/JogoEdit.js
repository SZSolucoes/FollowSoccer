import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    Image,
    TouchableOpacity,
    Alert
} from 'react-native';

import { connect } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage,
    Button, 
    Icon
} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Moment from 'moment';
import b64 from 'base-64';

import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-datepicker';
import firebase from '../../../../../utils/Firebase';
import { colorAppForeground, shirtColors, ERROS } from '../../../../../utils/Constantes';
import { sendCadJogoPushNotifForAll } from '../../../../../utils/FcmPushNotifications';
import { checkConInfo, showDropdownAlert } from '../../../../../utils/SystemEvents';
import Card from '../../../../../tools/elements/Card';

class JogoEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isTitValid: props.isTitValid ? props.isTitValid : false,
            contentType: props.contentType ? props.contentType : '',
            imgJogoUri: props.imgJogoUri ? props.imgJogoUri : null,
            imgPath: props.imgPath ? props.imgPath : '',
            titulo: props.titulo ? props.titulo : '',
            data: props.data ? props.data : Moment().format('DD/MM/YYYY'),
            descricao: props.descricao ? props.descricao : '',
            timeCasa: props.timeCasa ? props.timeCasa : '',
            homeshirt: props.homeshirt ? props.homeshirt : 'white',
            timeVisit: props.timeVisit ? props.timeVisit : '',
            visitshirt: props.visitshirt ? props.visitshirt : 'blue',
            loading: props.loading ? props.loading : false,
            scrollView: props.scrollView ? props.scrollView : null,
            isCasaSelected: false,
            isVisitSelected: false
        };

        this.fbDatabaseRef = firebase.database().ref();
        this.fbStorageRef = firebase.storage().ref();
        this.fbJogosRef = null;

        this.b64Str = props.b64Str ? props.b64Str : '';
        this.contentType = props.contentType ? props.contentType : '';
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
               
                if (this.props.keyItem) {
                    this.setImgProperties(image.data, contentType);
                    this.setState({ 
                        imgJogoUri: `data:${image.mime};base64,${image.data}`
                    });
                } else {
                    this.setImgProperties(image.data, contentType);
                    this.setState({ 
                        imgJogoUri: `data:${image.mime};base64,${image.data}`
                    });
                    this.props.onChangeSuperState({ 
                        imgJogoUri: `data:${image.mime};base64,${image.data}`,
                        b64Str: image.data,
                        contentType
                    });
                }
            }
          }).catch(() => false);
    }

    onChooseShirtColor = (side, key) => {
        if (side === 'casa') {
            this.setState({
                homeshirt: key
            });
        } else if (side === 'visit') {
            this.setState({
                visitshirt: key
            });
        }
    }

    onPressConfirmar = () => {
        this.setState({ loading: true });

        const { 
            titulo, 
            data, 
            descricao, 
            scrollView, 
            timeCasa, 
            timeVisit,
            homeshirt,
            visitshirt
        } = this.state;

        const { keyItem, imgJogoUri, grupoSelected, grupoSelectedKey } = this.props;
        const b64File = this.b64Str;
        const contentTp = this.contentType;
        let dataStr = '';

        if (!(titulo)) {
            this.setState({
                isTitValid: !titulo,
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

        if ((homeshirt && visitshirt) && homeshirt === visitshirt) {
            Alert.alert(
                'Aviso', 
                'A camisa do time da casa deverá ser diferente da camisa do time de visitantes'
            );

            this.setState({ loading: false, isTitValid: false });

            return;
        }

        if (data instanceof Moment) {
            dataStr = Moment(data).format('DD/MM/YYYY');
        } else {
            dataStr = data;
        }

        // Upload de imagem e dados
        if (b64File) {
            const metadata = {
                contentType: contentTp
            };

            const storageRef = this.fbStorageRef;
            const databaseRef = this.fbDatabaseRef;

            const Blob = RNFetchBlob.polyfill.Blob;

            const glbXMLHttpRequest = global.XMLHttpRequest;
            const glbBlob = global.Blob;

            let uploadBlob = null;

            global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
            global.Blob = Blob;

            const fileName = b64.encode(new Date().getTime().toString());
            const imgExt = contentTp.slice(contentTp.indexOf('/') + 1);
            const imgRef = storageRef
            .child(`grupos/${grupoSelectedKey}/jogos/${fileName}.${imgExt}`);
            const dbJogosRef = keyItem ? 
            databaseRef.child(
                `grupos/${grupoSelectedKey}/jogos/${keyItem}`
            ) : databaseRef.child(`grupos/${grupoSelectedKey}/jogos`);

            Blob.build(b64File, { type: `${contentTp};BASE64` })
                .then((blob) => { 
                    uploadBlob = blob;
                    return imgRef.put(blob, metadata);
                })
                .then(() => {
                    if (uploadBlob) {
                        uploadBlob.close();
                        uploadBlob = null;
                    }
                    return imgRef.getDownloadURL();
                })
                .then((url) => {
                    if (keyItem) {
                        return dbJogosRef.update({
                            titulo, 
                            data: dataStr, 
                            descricao,
                            timeCasa,
                            timeVisit,
                            imagem: url,
                            homeshirt,
                            visitshirt
                        });
                    }
                    return dbJogosRef.push({
                            titulo, 
                            data: dataStr, 
                            descricao,
                            timeCasa,
                            timeVisit,
                            imagem: url,
                            placarCasa: '0',
                            placarVisit: '0',
                            confirmados: [{ push: 'push' }],
                            ausentes: [{ push: 'push' }],
                            gols: [{ push: 'push' }],
                            cartoes: [{ push: 'push' }],
                            subs: [{ push: 'push' }],
                            escalacao: { 
                                casa: [{ push: 'push' }], 
                                visit: [{ push: 'push' }], 
                                banco: [{ push: 'push' }] 
                            },
                            status: '0',
                            currentTime: '0',
                            endStatus: '0',
                            lockLevel: '0',
                            imagens: [{ push: 'push' }],
                            homeshirt,
                            visitshirt
                        });
                })
                .then(() => {
                    this.setState({ loading: false, isTitValid: false });
                    if (keyItem && imgJogoUri) {
                        firebase.storage().refFromURL(imgJogoUri).delete()
                        .then(() => true)
                        .catch(() => true);
                    }
                    if (keyItem) {
                        this.props.onChangeSuperState({
                            modalOpt: 'Editar',
                            idxMdl: 1
                        });
                        showDropdownAlert(
                            'success', 
                            'Sucesso', 
                            'Edição realizada com sucesso'
                        );    
                    } else {
                        if (grupoSelected) {
                            sendCadJogoPushNotifForAll(titulo, grupoSelected);
                        }
                        
                        showDropdownAlert(
                            'success', 
                            'Sucesso', 
                            'Cadastro realizado com sucesso'
                        );
                        this.cleanStates();
                    }
                    global.XMLHttpRequest = glbXMLHttpRequest;
                    global.Blob = glbBlob;
                })
                .catch(() => {
                    global.XMLHttpRequest = glbXMLHttpRequest;
                    global.Blob = glbBlob;

                    if (uploadBlob) {
                        uploadBlob.close();
                    }

                    this.setState({ loading: false, isTitValid: false });
                    showDropdownAlert(
                        'error', 
                        ERROS.cadJogosDefault.erro, 
                        ERROS.cadJogosDefault.mes
                    );
                });  
        } else {
            const databaseRef = this.fbDatabaseRef;
            const dbJogosRef = keyItem ? 
            databaseRef.child(`grupos/${grupoSelectedKey}/jogos/${keyItem}`) 
            : 
            databaseRef.child(`grupos/${grupoSelectedKey}/jogos`);

            if (keyItem) {
                dbJogosRef.update({
                    titulo, 
                    data: dataStr, 
                    descricao,
                    timeCasa,
                    timeVisit,
                    homeshirt,
                    visitshirt 
                })
                .then(() => {
                    this.setState({ loading: false, isTitValid: false });
                    this.props.onChangeSuperState({
                        modalOpt: 'Editar',
                        idxMdl: 1
                    });
                    showDropdownAlert(
                        'success', 
                        'Sucesso', 
                        'Edição realizada com sucesso'
                    );
                })
                .catch(() => {
                    this.setState({ loading: false, isTitValid: false });
                    showDropdownAlert(
                        'error', 
                        ERROS.cadJogosEdit.erro, 
                        ERROS.cadJogosEdit.mes
                    );
                });  
            } else {
                dbJogosRef.push({
                    titulo, 
                    data: dataStr, 
                    descricao,
                    timeCasa,
                    timeVisit,
                    imagem: '',
                    placarCasa: '0',
                    placarVisit: '0',
                    confirmados: [{ push: 'push' }],
                    ausentes: [{ push: 'push' }],
                    gols: [{ push: 'push' }],
                    cartoes: [{ push: 'push' }],
                    subs: [{ push: 'push' }],
                    escalacao: { 
                        casa: [{ push: 'push' }], 
                        visit: [{ push: 'push' }], 
                        banco: [{ push: 'push' }] 
                    },
                    status: '0',
                    currentTime: '0',
                    endStatus: '0',
                    lockLevel: '0',
                    imagens: [{ push: 'push' }],
                    homeshirt,
                    visitshirt
                })
                .then(() => {
                    sendCadJogoPushNotifForAll(titulo, grupoSelected);
                    this.setState({ loading: false, isTitValid: false });
                    showDropdownAlert(
                        'success', 
                        'Sucesso', 
                        'Cadastro realizado com sucesso'
                    );
                    this.cleanStates();
                })
                .catch(() => {
                    this.setState({ loading: false, isTitValid: false });
                    showDropdownAlert(
                        'error', 
                        ERROS.cadJogosDefault.erro, 
                        ERROS.cadJogosDefault.mes
                    );
                });  
            }
        }
    }
    
    setImgProperties = (b64Str, mime) => {
        this.b64Str = b64Str;
        this.contentType = mime;
    }

    clearContentImg = () => {
        this.b64Str = '';
        this.contentType = '';
    }

    cleanStates = () => {
        this.setState({
            isTitValid: false,
            contentType: '',
            imgJogoUri: null,
            imgPath: '',
            titulo: '',
            data: Moment().format('DD/MM/YYYY'),
            descricao: '',
            timeCasa: '',
            homeshirt: 'white',
            timeVisit: '',
            visitshirt: 'blue',
            loading: false
        });
    }

    limitNomeTime = (value, type) => {
        if (value.length > 16) {
            return;
        }
        if (type === 'casa') {
            if (this.props.keyItem) {
                this.setState({ timeCasa: value });
            } else {
                this.setState({ timeCasa: value });
                this.props.onChangeSuperState({ timeCasa: value });
            }
        } else if (type === 'visit') {
            if (this.props.keyItem) {
                this.setState({ timeVisit: value });
            } else {
                this.setState({ timeVisit: value });
                this.props.onChangeSuperState({ timeVisit: value });
            }
        }
    }
    
    render = () => (
        <View>
            <Card containerStyle={styles.card}>
                <FormLabel labelStyle={styles.text}>TÍTULO</FormLabel>
                <FormInput
                    selectTextOnFocus
                    containerStyle={styles.inputContainer}
                    returnKeyType={'next'}
                    inputStyle={[styles.text, styles.input]}
                    value={this.state.titulo}
                    onChangeText={(value) => {
                        if (this.props.keyItem) {
                            this.setState({ titulo: value });
                        } else {
                            this.setState({ titulo: value });
                            this.props.onChangeSuperState({ titulo: value });
                        }
                    }}
                    underlineColorAndroid={'transparent'}
                    onSubmitEditing={() => this.inputDate.onPressDate()}
                />
                { 
                    this.state.isTitValid &&
                    <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                }
                <FormLabel labelStyle={styles.text}>DATA</FormLabel>
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
                        mode='datetime'
                        format='DD/MM/YYYY - HH:mm'
                        minDate={Moment().format('DD/MM/YYYY')}
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
                            this.descricao.focus();
                        }}
                    />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <FormLabel labelStyle={styles.text}>TIME CASA</FormLabel>
                    <TouchableOpacity
                        onPress={
                            () => {
                                if (this.props.onAnimShirtView) {
                                    this.props.onAnimShirtView(
                                        'casa',
                                        () => 
                                            this.setState({
                                                isCasaSelected: !this.state.isCasaSelected,
                                                isVisitSelected: false
                                            })
                                    );
                                }
                            }
                        }
                    >
                        <Card
                            containerStyle={{
                                padding: 2,
                                backgroundColor: this.state.isCasaSelected ?
                                'grey' : 'white'
                            }}
                        >
                            <Image 
                                source={shirtColors[this.state.homeshirt] || shirtColors.white}
                                style={{
                                    height: 40,
                                    width: 40
                                }}
                            />
                        </Card>
                    </TouchableOpacity>
                </View>
                <FormInput
                    ref={(ref) => {
                        this.timeCasa = ref;
                    }}
                    selectTextOnFocus
                    containerStyle={styles.inputContainer}
                    returnKeyType={'next'}
                    inputStyle={[styles.text, styles.input]}
                    value={this.state.timeCasa}
                    onChangeText={(value) => {
                        this.limitNomeTime(value, 'casa');
                    }}
                    underlineColorAndroid={'transparent'}
                    onSubmitEditing={() => this.timeVisit.focus()}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <FormLabel labelStyle={styles.text}>TIME VISITANTES</FormLabel>
                    <TouchableOpacity
                        onPress={
                            () => {
                                if (this.props.onAnimShirtView) {
                                    this.props.onAnimShirtView(
                                        'visit',
                                        () =>
                                            this.setState({
                                                isVisitSelected: !this.state.isVisitSelected,
                                                isCasaSelected: false
                                            })
                                    );
                                }
                            }
                        }
                    >
                        <Card
                            containerStyle={{
                                padding: 2,
                                backgroundColor: this.state.isVisitSelected ?
                                'grey' : 'white'
                            }}
                        >
                            <Image 
                                source={shirtColors[this.state.visitshirt] || shirtColors.blue}
                                style={{
                                    height: 40,
                                    width: 40
                                }}
                            />
                        </Card>
                    </TouchableOpacity>
                </View>
                <FormInput
                    ref={(ref) => {
                        this.timeVisit = ref;
                    }}
                    selectTextOnFocus
                    containerStyle={styles.inputContainer}
                    returnKeyType={'next'}
                    inputStyle={[styles.text, styles.input]}
                    value={this.state.timeVisit}
                    onChangeText={(value) => {
                        this.limitNomeTime(value, 'visit');
                    }}
                    underlineColorAndroid={'transparent'}
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
                                this.state.imgJogoUri && 
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
                <FormLabel labelStyle={styles.text}>TEXTO DE SOBREPOSIÇÃO</FormLabel>
                <FormInput
                    ref={(ref) => {
                        this.descricao = ref;
                    }}
                    selectTextOnFocus
                    containerStyle={styles.inputContainer}
                    inputStyle={[styles.text, styles.input]} 
                    value={this.state.descricao}
                    onChangeText={(value) => {
                        if (this.props.keyItem) {
                            this.setState({ descricao: value });
                        } else {
                            this.setState({ descricao: value });
                            this.props.onChangeSuperState({ descricao: value });
                        }
                    }}
                    underlineColorAndroid={'transparent'}
                    multiline
                    onSubmitEditing={() => this.timeCasa.focus()}
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
                    title={this.props.keyItem ? 'Restaurar' : 'Limpar'} 
                    buttonStyle={{ width: '100%', marginVertical: 10 }}
                    onPress={() => {
                        this.clearContentImg();
                        if (this.props.keyItem) {
                            this.setState({
                                isTitValid: this.props.isTitValid ? 
                                this.props.isTitValid : false,
                                contentType: this.props.contentType ? 
                                this.props.contentType : '',
                                imgJogoUri: this.props.imgJogoUri ? 
                                this.props.imgJogoUri : null,
                                imgPath: this.props.imgPath ? this.props.imgPath : '',
                                titulo: this.props.titulo ? this.props.titulo : '',
                                data: this.props.data ? 
                                this.props.data : Moment().format('DD/MM/YYYY'),
                                descricao: this.props.descricao ? this.props.descricao : '',
                                timeCasa: this.props.timeCasa ? this.props.timeCasa : '',
                                homeshirt: this.props.homeshirt ? 
                                this.props.homeshirt : 'white',
                                timeVisit: this.props.timeVisit ? this.props.timeVisit : '',
                                visitshirt: this.props.visitshirt ? 
                                this.props.visitshirt : 'blue',
                                loading: this.props.loading ? this.props.loading : false
                            });
                        } else {
                            this.cleanStates();
                        }
                    }}
                    fontFamily={'OpenSans-SemiBold'}
                />
            </Card>
            <View style={{ marginVertical: 60 }} />
        </View>
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
    }
});

const mapStateToProps = (state) => ({
    conInfo: state.LoginReducer.conInfo,
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoSelectedKey: state.GruposReducer.grupoSelectedKey
});

export default connect(mapStateToProps, {}, null, { forwardRef: true })(JogoEdit);
