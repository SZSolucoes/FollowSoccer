import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    ScrollView,
    Modal,
    Text,
    ActivityIndicator,
    TouchableWithoutFeedback
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
import _ from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-crop-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import FastImage from 'react-native-fast-image';
import { Dialog } from 'react-native-simple-dialogs';
import * as Progress from 'react-native-progress';

import firebase from '../../../Firebase';
import { showAlert } from '../../../utils/store';
import { colorAppF, colorAppS } from '../../../utils/constantes';
import { checkPerfil } from '../../../utils/userUtils';
import { checkConInfo } from '../../../utils/jogosUtils';
import { doActiveRNFetchBlob } from '../../../utils/utilsTools';
import Card from '../../tools/Card';

class InfoEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isTitValid: props.isTitValid ? props.isTitValid : false,
            contentType: props.contentType ? props.contentType : '',
            imgsArticleUri: props.imgsArticleUri ? props.imgsArticleUri : [],
            titulo: props.titulo ? props.titulo : '',
            descricao: props.descricao ? props.descricao : '',
            linkExt: props.linkExt ? props.linkExt : '',
            loading: props.loading ? props.loading : false,
            scrollView: props.scrollView ? props.scrollView : null,
            showImageView: false,
            imgSelected: 0,
            uploadModal: false,
            uploadModalPerc: 0,
            uploadModalText: 'Enviando imagem...'
        };

        this.onPressSelectImg = this.onPressSelectImg.bind(this);
        this.onPressConfirmar = this.onPressConfirmar.bind(this);
        this.renderImages = this.renderImages.bind(this);
    }

    onPressSelectImg() {
        ImagePicker.openPicker({
            width: 600,
            height: 400,
            cropping: true,
            includeBase64: true,
            cropperCircleOverlay: false,
            multiple: true,
            mediaType: 'photo'
          }).then(images => {
            for (let index = 0; index < images.length; index++) {
                const image = images[index];
                if (image) {
                    let contentType = '';
                    let imgB64 = '';

                    if (image.mime) {
                        contentType = image.mime;
                    }

                    if (image.data) {
                        imgB64 = image.data;
                    }
    
                    const imgData = `data:${image.mime};base64,${image.data}`;
                    const isNotIn = _.findIndex(
                        this.state.imgsArticleUri, (item) => item.data === imgData
                    );
    
                    if (isNotIn === -1) {
                        this.setState({ 
                            imgsArticleUri: [
                                ...this.state.imgsArticleUri, 
                                { data: imgData, contentType, isUri: 'false', b64data: imgB64 }
                            ]
                        });
                    }
                   
                    if (!this.props.keyItem) {
                        this.props.onChangeSuperState({ 
                            imgsArticleUri: this.state.imgsArticleUri
                        });
                    }
                }
            }
          }).catch(() => false);
    }

    async onPressConfirmar() {
        this.setState({ loading: true });

        const { 
            titulo, descricao, linkExt, scrollView, imgsArticleUri 
        } = this.state;
        const { keyItem, userLogged, userLevel, onPressBack } = this.props;
        const protocol = linkExt.substr(0, 4);
        let linkArticle = linkExt;
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

        // Tratamento para o protocolo
        if (protocol.trim() && protocol.toLowerCase() !== 'http') {
            linkArticle = `http://${linkExt}`;        
        }

        dataStr = Moment().format('DD/MM/YYYY HH:mm:ss');

        // Upload de imagem e dados
        if (imgsArticleUri && imgsArticleUri.length) {
            const storageRef = firebase.storage().ref();
            const databaseRef = firebase.database().ref();
            const imgsUrl = _.filter(
                imgsArticleUri, imgurl => imgurl.isUri === 'true' && !imgurl.isRem
            );

            const lenNumberUpload = _.sumBy(imgsArticleUri, (x) => {
                const ret = x.isUri === 'false' ? 1 : 0;
                return ret;
            });

            let indexUpload = 0;

            if (lenNumberUpload) {
                if (lenNumberUpload === 1) {
                    this.setState({ 
                        uploadModal: true,
                        uploadModalPerc: 0,
                        uploadModalText: 'Enviando imagem...'
                    });
                } else {
                    this.setState({ 
                        uploadModal: true,
                        uploadModalPerc: 0,
                        uploadModalText: 'Enviando imagens...'
                    });
                }
            }

            const Blob = RNFetchBlob.polyfill.Blob;
            
            doActiveRNFetchBlob(true);
            
            const dbInfosRef = keyItem ? 
            databaseRef.child(`informativos/${keyItem}`) : databaseRef.child('informativos');

            // TRATAMENTO DE UPLOAD DE IMAGENS
            const asyncFun = async (element) => {
                let blobFile = null;

                if (element.isUri === 'false' && element.b64data) {
                    const fileName = b64.encode(new Date().getTime().toString());
                    const imgExt = element.contentType.slice(
                        element.contentType.indexOf('/') + 1
                    );
                    const imgRef = storageRef.child(`informativos/${fileName}.${imgExt}`);
                    const metadata = {
                        contentType: element.contentType
                    };
    
                    blobFile = await Blob.build(
                        element.b64data, { type: `${element.contentType};BASE64` }
                    );
                    
                    const url = await imgRef.put(blobFile, metadata)
                    .then(async (snapshot) => await snapshot.ref.getDownloadURL());

                    await blobFile.close();
                    
                    blobFile = null;
                    
                    indexUpload++;

                    this.setState({ uploadModalPerc: indexUpload / lenNumberUpload });

                    return { 
                        data: url, contentType: element.contentType, isUri: 'true' 
                    };
                } else if (keyItem && element.isUri === 'true' && element.isRem) {
                    firebase.storage().refFromURL(element.data).delete()
                    .then(() => true)
                    .catch(() => true);
                }

                return null;
            };
            
            try {
                for (let index = 0; index < imgsArticleUri.length; index++) {
                    const elem = imgsArticleUri[index];
                    const imgToPush = await asyncFun(elem);
                    if (imgToPush) {
                        imgsUrl.push(imgToPush);
                    }
                }
            } catch (e) {
                console.log(e);

                this.setState({ 
                    loading: false, 
                    isTitValid: false, 
                    uploadModal: false, 
                    uploadModalPerc: 0 
                });

                doActiveRNFetchBlob(false);

                showAlert(
                    'danger', 
                    'Ops!', 
                    'Ocorreu um erro ao editar o informativo.'
                );

                return;
            }

            if (imgsUrl.length === 0) {
                imgsUrl.push({ push: 'push' });
            }

            // TRATAMENTO DATABASE
            if (keyItem) {
                await dbInfosRef.update({
                    descPost: titulo, 
                    imgsArticle: imgsUrl, 
                    textArticle: descricao,
                    linkArticle 
                });
            } else {
                await dbInfosRef.push({
                    descPost: titulo, 
                    imgsArticle: imgsUrl, 
                    textArticle: descricao,
                    linkArticle,
                    emailUser: userLogged.email,
                    nomeUser: userLogged.nome,
                    perfilUser: checkPerfil(userLogged.tipoPerfil),
                    userLevel,
                    imgAvatar: userLogged.imgAvatar,
                    listComents: [{ push: 'push' }],
                    listLikes: [{ push: 'push' }],
                    dataPost: dataStr
                });
            }

            doActiveRNFetchBlob(false);

            setTimeout(() => {
                this.setState({ 
                    loading: false, 
                    isTitValid: false, 
                    uploadModal: false, 
                    uploadModalPerc: 0 
                });
    
                setTimeout(() => {
                    if (keyItem) {
                        showAlert(
                            'success', 'Sucesso!', 'Edição realizada com sucesso.'
                        );
                        onPressBack(true);
                    } else {
                        showAlert(
                            'success', 'Sucesso!', 'Cadastro realizado com sucesso.'
                        );
                    }  
                }, 500);
            }, 2000);
        } else {
            const databaseRef = firebase.database().ref();
            const dbInfosRef = keyItem ? 
            databaseRef.child(`informativos/${keyItem}`) : databaseRef.child('informativos');

            if (keyItem) {
                dbInfosRef.update({
                    descPost: titulo, 
                    textArticle: descricao,
                    linkArticle
                })
                .then(() => {
                    this.setState({ loading: false, isTitValid: false });
                    showAlert('success', 'Sucesso!', 'Edição realizada com sucesso.');
                    onPressBack(true);
                })
                .catch(() => {
                    this.setState({ loading: false, isTitValid: false });
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro ao editar o informativo.'
                    );
                });  
            } else {
                dbInfosRef.push({
                    descPost: titulo, 
                    imgsArticle: [{ push: 'push' }], 
                    textArticle: descricao,
                    linkArticle,
                    emailUser: userLogged.email,
                    nomeUser: userLogged.nome,
                    perfilUser: checkPerfil(userLogged.tipoPerfil),
                    userLevel,
                    imgAvatar: userLogged.imgAvatar,
                    listComents: [{ push: 'push' }],
                    listLikes: [{ push: 'push' }],
                    dataPost: dataStr
                })
                .then(() => {
                    this.setState({ loading: false, isTitValid: false });
                    showAlert('success', 'Sucesso!', 'Cadastro realizado com sucesso.');
                })
                .catch(() => {
                    this.setState({ loading: false, isTitValid: false });
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro ao cadastrar o informativo.'
                    );
                });  
            }
        }
    }
    
    renderImages() {
        const viewsImages = _.map(this.state.imgsArticleUri, (data, index) => {
            if (!data.isRem) {
                return (
                    <Card key={index} >
                        <View style={{ flexDirection: 'row', paddingBottom: 5 }}>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <TouchableWithoutFeedback
                                    onPress={() => this.setState({ 
                                        showImageView: true,
                                        imgSelected: index
                                    })}
                                >
                                    <FastImage 
                                        source={{ uri: data.data }}
                                        style={{
                                            width: 80,
                                            height: 80
                                        }}
                                    />
                                </TouchableWithoutFeedback>
                            </View>
                            <View 
                                style={{ 
                                    flex: 1, 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        const newArray = [...this.state.imgsArticleUri];
                                        
                                        if (newArray[index].isUri === 'true') {
                                            newArray[index].isRem = true;
                                        } else {
                                            newArray.splice(index, 1);
                                        }
    
                                        this.setState({ 
                                            imgsArticleUri: newArray,
                                        });
                                    }}
                                >
                                    <Icon
                                        name='delete' 
                                        type='material-community' 
                                        size={34} color='red' 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Card>
                );
            }

            return null;
        });

        return viewsImages;
    }

    render() {
        const imagesForView = this.state.imgsArticleUri.map(
            (item) => ({ url: item.data })
        );

        return (
            <View>
                <Card containerStyle={styles.card}>
                    <FormLabel labelStyle={styles.text}>TÍTULO</FormLabel>
                    <FormInput
                        ref={(ref) => {
                            this.inputTitulo = ref;
                        }}
                        selectTextOnFocus
                        containerStyle={[styles.inputContainer, { height: 80 }]}
                        inputStyle={[styles.text, styles.input, { height: 80 }]} 
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
                        multiline 
                    />
                    { 
                        this.state.isTitValid &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.text}>IMAGEM DO ARTIGO</FormLabel>
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
                                    Selecionar imagens
                                </FormLabel> 
                            </View>
                        </TouchableOpacity>
                        <ScrollView
                            style={{ 
                                height: 200,
                                borderWidth: 2, 
                                borderColor: '#EEEEEE',
                                borderRadius: 0.9,
                                backgroundColor: colorAppF
                            }}
                            contentContainerStyle={{
                                paddingHorizontal: 10,
                                paddingBottom: 50
                            }}
                        >
                            <TouchableWithoutFeedback
                                onPressIn={
                                    () => this.props.scrollView().setNativeProps({ 
                                        scrollEnabled: false 
                                    })
                                }
                                onPressOut={
                                    () => this.props.scrollView().setNativeProps({ 
                                        scrollEnabled: true 
                                    })
                                }
                            >
                                <View>
                                    { 
                                        this.renderImages()
                                    }
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </View>
                    <FormLabel labelStyle={styles.text}>DESCRIÇÃO DO ARTIGO</FormLabel>
                    <FormInput
                        ref={(ref) => {
                            this.inputDesc = ref;
                        }}
                        selectTextOnFocus
                        containerStyle={[styles.inputContainer, { height: 80 }]}
                        inputStyle={[styles.text, styles.input, { height: 80 }]} 
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
                    />
                    <FormLabel labelStyle={styles.text}>LINK EXTERNO DO ARTIGO</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        ref={(ref) => { this.inputLinkExt = ref; }}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        autoCapitalize={'none'}
                        value={this.state.linkExt}
                        onChangeText={(value) => {
                            if (this.props.keyItem) {
                                this.setState({ linkExt: value });
                            } else {
                                this.setState({ linkExt: value });
                                this.props.onChangeSuperState({ linkExt: value });
                            }
                        }}
                        underlineColorAndroid={'transparent'}
                    />
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
                                    isTitValid: this.props.isTitValid ? 
                                    this.props.isTitValid : false,
                                    contentType: this.props.contentType ? 
                                    this.props.contentType : '',
                                    imgsArticleUri: this.props.imgsArticleUri ? 
                                    this.props.imgsArticleUri : [],
                                    titulo: this.props.titulo ? this.props.titulo : '',
                                    descricao: this.props.descricao ? this.props.descricao : '',
                                    linkExt: this.props.linkExt ? this.props.linkExt : '',
                                    loading: this.props.loading ? this.props.loading : false
                                });
                            } else {
                                this.setState({
                                    isTitValid: false,
                                    contentType: '',
                                    imgsArticleUri: [],
                                    titulo: '',
                                    descricao: '',
                                    linkExt: '',
                                    loading: false
                                });
                            }
                        }}
                    />
                </Card>
                <Modal 
                    visible={this.state.showImageView} 
                    transparent
                    onRequestClose={() => this.setState({ showImageView: false })}
                >
                    <ImageViewer
                        imageUrls={imagesForView}
                        index={this.state.imgSelected}
                        isVisible={this.state.showImageView}
                        enableSwipeDown
                        pageAnimateTime={600}
                        enablePreload
                        footerContainerStyle={{ flex: 1, left: 0, right: 0 }}
                        renderImage={(props) => <FastImage {...props} />}
                        loadingRender={() => <ActivityIndicator />}
                        renderFooter={() => (
                            <View 
                                style={{ 
                                    flex: 1, 
                                    flexDirection: 'row',
                                    alignItems: 'center', 
                                    justifyContent: 'center'
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => this.setState({ showImageView: false })}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1,
                                            flexDirection: 'row',
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            paddingVertical: 15
                                        }}
                                    >
                                        <Text
                                            style={{ 
                                                fontFamily: 'OpenSans-Bold', 
                                                color: 'white',
                                                textAlign: 'center',
                                                fontSize: 16
                                            }}
                                        >
                                            Fechar
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                        onCancel={() => this.setState({ showImageView: false })}
                    />
                </Modal>
                <Dialog
                    animationType={'fade'}
                    visible={this.state.uploadModal}
                    title={this.state.uploadModalText}
                    onTouchOutside={() => true}
                >
                    <View 
                        style={{ 
                            alignItems: 'center',
                            justifyContent: 'center' 
                        }}
                    >
                        <Progress.Circle 
                            progress={this.state.uploadModalPerc}
                            size={100}
                            showsText
                            color={colorAppS}
                        />
                    </View>
                </Dialog>
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
    }
});

const mapStateToProps = (state) => ({
    userLogged: state.LoginReducer.userLogged,
    userLevel: state.LoginReducer.userLevel
});

export default connect(mapStateToProps, {})(InfoEdit);
