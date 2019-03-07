import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    Text,
    ActivityIndicator
} from 'react-native';

import { connect } from 'react-redux';
import {
    Icon,
    Divider,
    FormLabel
} from 'react-native-elements';
import _ from 'lodash';
import { Actions } from 'react-native-router-flux';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'rn-fetch-blob';
import b64 from 'base-64';
import ImageViewer from 'react-native-image-zoom-viewer';
import FastImage from 'react-native-fast-image';
import { Dialog } from 'react-native-simple-dialogs';
import * as Progress from 'react-native-progress';

import firebase from '../../../../../utils/Firebase';
import { modificaShowImageView } from './ImagensJogosActions';
import { checkConInfo, showDropdownAlert } from '../../../../../utils/SystemEvents';
import { colorAppS, colorAppF } from '../../../../../utils/Constantes';
import Card from '../../../../../tools/elements/Card';

class ImagensJogos extends React.Component {

    constructor(props) {
        super(props);

        this.scrollView = null;
        this.dbFirebaseRef = firebase.database().ref();

        this.state = {
            jogo: props.jogo,
            showImageView: false,
            imgSelected: 0,
            uploadModal: false,
            uploadModalPerc: 0,
            uploadModalText: 'Enviando imagem...'
        };
    }

    componentDidMount = () => {
        if (this.props.enableButtons) {
            setTimeout(() => Actions.refresh({ right: this.rightButtonImagens }), 500);
        }
    }

    onPressSelectImgCamera = () => {
        ImagePicker.openCamera({
            width: 600,
            height: 400,
            cropping: true,
            includeBase64: true,
            mediaType: 'photo',
            cropperCircleOverlay: false,
            freeStyleCropEnabled: true,
            compressImageMaxWidth: 600,
            compressImageMaxHeight: 400,
            compressImageQuality: 0.7
        })
        .then(image => checkConInfo(() => this.doUploadImageCamera(image), [], 500))
        .catch(() => {
            setTimeout(() => {
                this.setState({ uploadModal: false });
                this.setState({ uploadModalPerc: 0 });
            }, 2000);
        });
    }

    onPressSelectImgGallery = () => {
        ImagePicker.openPicker({
            width: 600,
            height: 400,
            cropping: true,
            includeBase64: true,
            mediaType: 'photo',
            multiple: true,
            cropperCircleOverlay: false,
            freeStyleCropEnabled: true,
            compressImageMaxWidth: 600,
            compressImageMaxHeight: 400,
            compressImageQuality: 0.7
        })
        .then(images => checkConInfo(() => this.doUploadImageGallery(images), [], 500))
        .catch(() => {
            setTimeout(() => {
                this.setState({ uploadModal: false });
                this.setState({ uploadModalPerc: 0 });
            }, 2000);
        });
    }

    onPressRemoveImage = (image, loadingState) => {
        this.setState({ [loadingState]: true });
        const { grupoSelected } = this.props;

        const databaseRef = this.dbFirebaseRef;
        const dbJogosRef = databaseRef
        .child(`grupos/${grupoSelected.key}/jogos/${this.props.jogo.key}`);

        const newImages = _.filter(
            this.state.jogo.imagens, (img) => !typeof img === 'string' || img !== image
        );

        dbJogosRef.update({
            imagens: newImages
        })
        .then(() => {
            firebase.storage().refFromURL(image).delete()
            .then(() => {
                const newJogo = { ...this.state.jogo, imagens: newImages };
                this.setState({ [loadingState]: false, jogo: newJogo });
                this.updateProps();
                showDropdownAlert(
                    'success',
                    'Imagem removida',
                    ''
                );
            })
            .catch(() => { 
                this.setState({ [loadingState]: false });
                this.updateProps();
            });
        })
        .catch(() => { 
            this.setState({ [loadingState]: false });
            this.updateProps();
        });
    }

    doUploadImageCamera = (image) => {
        if (image) {
            this.setState({ 
                uploadModal: true,
                uploadModalPerc: 0,
                uploadModalText: 'Enviando imagem...'
            });

            const { grupoSelected } = this.props;
            const storageRef = firebase.storage().ref();
            const databaseRef = this.dbFirebaseRef;

            const Blob = RNFetchBlob.polyfill.Blob;

            const glbXMLHttpRequest = global.XMLHttpRequest;
            const glbBlob = global.Blob;

            let uploadBlob = null;

            global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
            global.Blob = Blob;

            let contentType = '';
            
            if (image.mime) {
                contentType = image.mime;
            }

            const metadata = {
                contentType
            };

            const fileName = b64.encode(new Date().getTime().toString());
            const imgExt = contentType.slice(contentType.indexOf('/') + 1);
            const imgRef = storageRef
            .child(`grupos/${grupoSelected.key}/jogos/${fileName}.${imgExt}`);
            const dbJogosRef = databaseRef
            .child(`grupos/${grupoSelected.key}/jogos/${this.props.jogo.key}`);

            Blob.build(image.data, { type: `${contentType};BASE64` })
            .then((blob) => { 
                uploadBlob = blob;
                const uploadTask = imgRef.put(blob, metadata);
                uploadTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes);
                    this.setState({ uploadModalPerc: progress });
                });

                return uploadTask;
            })
            .then(() => {
                if (uploadBlob) {
                    uploadBlob.close();
                    uploadBlob = null;
                }
                return imgRef.getDownloadURL();
            })
            .then((url) => {
                const newImgs = [...this.state.jogo.imagens, url];
                const newJogo = { ...this.state.jogo, imagens: newImgs };
                this.setState({ jogo: newJogo });
                return dbJogosRef.update({ imagens: newImgs });
            })
            .then(() => {
                setTimeout(() => {
                    this.setState({ uploadModal: false, uploadModalPerc: 0 });
                    this.updateProps();
                }, 2000);

                global.XMLHttpRequest = glbXMLHttpRequest;
                global.Blob = glbBlob;
            })
            .catch(() => {
                setTimeout(() => {
                    this.setState({ uploadModal: false, uploadModalPerc: 0 });
                    this.updateProps();
                }, 2000);

                global.XMLHttpRequest = glbXMLHttpRequest;
                global.Blob = glbBlob;
            
                if (uploadBlob) {
                    uploadBlob.close();
                }
            });
        }
    }

    doUploadImageGallery = async (images) => {
        if (images && images.length > 0) {
            if (images.length > 1) {
                this.setState({ 
                    uploadModal: true,
                    uploadModalPerc: 0,
                    uploadModalText: 'Enviando imagens...'
                });
            } else {
                this.setState({ 
                    uploadModal: true,
                    uploadModalPerc: 0,
                    uploadModalText: 'Enviando imagem...'
                });
            }

            const { grupoSelected } = this.props;
            const storageRef = firebase.storage().ref();
            const databaseRef = this.dbFirebaseRef;

            const Blob = RNFetchBlob.polyfill.Blob;

            const glbXMLHttpRequest = global.XMLHttpRequest;
            const glbBlob = global.Blob;

            let indexUpload = 0;

            global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
            global.Blob = Blob;

            const funExec = async (image) => {
                let uploadBlob = null;
                let contentType = '';

                if (image.mime) {
                    contentType = image.mime;
                }

                const metadata = {
                    contentType
                };
    
                const fileName = b64.encode(new Date().getTime().toString());
                const imgExt = contentType.slice(contentType.indexOf('/') + 1);
                const imgRef = storageRef
                .child(`grupos/${grupoSelected.key}/jogos/${fileName}.${imgExt}`);
                const dbJogosRef = databaseRef
                .child(`grupos/${grupoSelected.key}/jogos/${this.props.jogo.key}`);
    
                await Blob.build(image.data, { type: `${contentType};BASE64` })
                .then(async (blob) => { 
                    uploadBlob = blob;
                    return imgRef.put(blob, metadata);
                })
                .then(async () => {
                    if (uploadBlob) {
                        uploadBlob.close();
                        uploadBlob = null;
                    }
                    return await imgRef.getDownloadURL();
                })
                .then(async (url) => {
                    const newImgs = [...this.state.jogo.imagens, url];
                    const newJogo = { ...this.state.jogo, imagens: newImgs };
                    this.setState({ jogo: newJogo });
                    return await dbJogosRef.update({ imagens: newImgs });
                })
                .then(async () => {
                    indexUpload++;
                    this.setState({ uploadModalPerc: indexUpload / images.length });
                    if (images.length === indexUpload) {
                        setTimeout(() => {
                            this.setState({ uploadModal: false, uploadModalPerc: 0 });
                            this.updateProps();
                        }, 2000);
                    }

                    if (images.length === indexUpload) {
                        global.XMLHttpRequest = glbXMLHttpRequest;
                        global.Blob = glbBlob;
                    }

                    return await true;
                })
                .catch(async () => {
                    setTimeout(() => {
                        this.setState({ uploadModal: false, uploadModalPerc: 0 });
                        this.updateProps();
                    }, 2000);
                
                    if (images.length === indexUpload) {
                        global.XMLHttpRequest = glbXMLHttpRequest;
                        global.Blob = glbBlob;
                    }

                    if (uploadBlob) {
                        uploadBlob.close();
                    }

                    return await true;
                });
            };

            const reversedArray = _.reverse(images);

            for (const image of reversedArray) {
                await funExec(image);
            }
        }
    }

    updateProps = () => {
        const databaseRef = this.dbFirebaseRef;
        const { grupoSelected } = this.props;

        const dbJogosRef = databaseRef
        .child(`grupos/${grupoSelected.key}/jogos/${this.props.jogo.key}`);

        dbJogosRef.once('value', (snapshot) => {
            if (snapshot && snapshot.val()) {
                this.setState({ jogo: { ...snapshot.val() } });
            }
        });
    }

    rightButtonImagens = () => (
        <View 
            style={{
                flexDirection: 'row',
                marginHorizontal: 5,
                paddingHorizontal: 10,
                justifyContent: 'space-between'
            }}
        >
            <TouchableOpacity
                onPress={() => checkConInfo(() => this.onPressSelectImgCamera())}
            >
                <Icon
                    iconStyle={{ marginHorizontal: 5 }}
                    color={'white'}
                    name='camera'
                    type='material-community'
                    size={26}
                />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => checkConInfo(() => this.onPressSelectImgGallery())}
            >
                <Icon
                    iconStyle={{ marginHorizontal: 5 }}
                    color={'white'}
                    name='folder-multiple-image'
                    type='material-community'
                    size={26}
                />
            </TouchableOpacity>
        </View>
    )

    renderImagensCard = () => {
        const { jogo } = this.state;
        const filteredImgs = _.filter(jogo.imagens, (img) => !img.push);

        if (filteredImgs.length > 0) {
            const imagensView = filteredImgs.map((item, index) => (
                    <View key={index}>
                        <TouchableWithoutFeedback
                            onPress={() => {
                                this.setState({ imgSelected: index });
                                this.props.modificaShowImageView(true);
                            }}
                        >
                            <Card 
                                containerStyle={styles.card}
                            >
                                <FastImage
                                    style={{ width: null, height: 200 }}
                                    source={{ uri: item }} 
                                />
                                {
                                    this.props.enableButtons &&
                                    <View>
                                        <View style={{ marginVertical: 10 }} >
                                            <Divider />
                                        </View>
                                        <TouchableOpacity
                                            onPress={() =>
                                                checkConInfo(() => 
                                                this.onPressRemoveImage(item, `loading${index}`))
                                            }
                                        >
                                            <View style={styles.viewImageSelect}>
                                                {
                                                    this.state[`loading${index}`] ?
                                                    (
                                                        <ActivityIndicator 
                                                            size={'small'}
                                                            color={'white'}
                                                        />
                                                    )
                                                    :
                                                    (
                                                        <FormLabel 
                                                            labelStyle={{ 
                                                                color: 'white',
                                                                fontSize: 14, 
                                                                fontWeight: '500',
                                                                marginTop: 0, 
                                                                marginBottom: 0 
                                                            }}
                                                        >
                                                            Remover
                                                        </FormLabel>
                                                    )
                                                }
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                }
                            </Card>
                        </TouchableWithoutFeedback>
                        <View style={{ marginBottom: 5 }} />
                    </View>
                )
            );
            return imagensView;
        }

        return null;
    }

    render = () => {
        let imagesForView = _.filter(this.state.jogo.imagens, (img) => !img.push);
        imagesForView = imagesForView.map(
            (item) => ({ url: item })
        );

        return (
            <View style={styles.viewPrinc}>
                <ScrollView 
                    style={{ flex: 1 }} 
                    ref={(ref) => { this.scrollView = ref; }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    { this.renderImagensCard() }
                    <View style={{ marginVertical: 20 }} />
                </ScrollView>
                <Modal 
                    visible={this.props.showImageView} 
                    transparent
                    onRequestClose={() => this.props.modificaShowImageView(false)}
                >
                    <ImageViewer
                        imageUrls={imagesForView}
                        index={this.state.imgSelected}
                        isVisible={this.props.showImageView}
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
                                    onPress={() => this.props.modificaShowImageView(false)}
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
                        onCancel={() => this.props.modificaShowImageView(false)}
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
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF
    },
    card: {
        paddingHorizontal: 10,
    },
    dropCard: { 
        backgroundColor: colorAppS,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: 0,
    },
    dropCardRed: { 
        backgroundColor: 'red',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
    },
    dropModalBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 8,
        marginRight: 5
    },
    viewImageSelect: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#9E9E9E',
        borderRadius: 5,
        padding: 5
    }
});

const mapStateToProps = (state) => ({
    showImageView: state.ImagensJogosReducer.showImageView,
    grupoSelected: state.GruposReducer.grupoSelected 
});

export default connect(mapStateToProps, { modificaShowImageView })(ImagensJogos);
