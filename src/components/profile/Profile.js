import React from 'react';
import { 
    View, 
    StyleSheet,
    AsyncStorage,
    Dimensions,
    Text
} from 'react-native';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import * as Progress from 'react-native-progress';
import RNFetchBlob from 'rn-fetch-blob';
import b64 from 'base-64';
import { Button, List } from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import { Dialog } from 'react-native-simple-dialogs';
import ParallaxMenuView from '../../tools/parallaxmenuview/ParallaxMenuView';
import { showAlert, mappedKeyStorage } from '../../utils/Storage';
import { colorAppPrimary, colorAppSecondary, APP_VERSION } from '../../utils/Constantes';
import firebase from '../../utils/Firebase';
import { checkConInfo } from '../../utils/SystemEvents';
import { modifyCleanLogin } from '../login/LoginActions';

import ListItem from '../../tools/elements/ListItem';
import { stopFbListener } from '../../utils/FirebaseListeners';

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            progress: 0,
            showAbout: false
        };
    }

    onPressLogout = () => {
        AsyncStorage.removeItem(mappedKeyStorage('username'));
        AsyncStorage.removeItem(mappedKeyStorage('password'));

        this.props.modifyCleanLogin();

        stopFbListener('usuario');

        Actions.reset('login');
    }

    onPressUserImg = (type) => {
        const width = type === 'userImg' ? 400 : 600;
        const height = type === 'userImg' ? 400 : 400;
        const cropperCircleOverlay = type === 'userImg';
        ImagePicker.openPicker({
            width,
            height,
            cropping: true,
            cropperCircleOverlay,
            includeBase64: true,
            mediaType: 'photo'
          }).then(image => checkConInfo(() => this.doUploadUserImg(image, type)))
          .catch(() => false);
    }

    doUploadUserImg = (image, type) => {
        if (image) {
            const metadata = {
                contentType: image.mime
            };

            const storageRef = firebase.storage().ref();
            const databaseRef = firebase.database().ref();

            const Blob = RNFetchBlob.polyfill.Blob;

            const glbXMLHttpRequest = global.XMLHttpRequest;
            const glbBlob = global.Blob;

            let uploadBlob = null;

            global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
            global.Blob = Blob;

            const { userLogged, username } = this.props;
            const imgUrl = type === 'userImg' ? userLogged.imgAvatar : userLogged.imgBackground;
            const usuariob64 = b64.encode(username);
            const fileName = b64.encode(new Date().getTime().toString());
            const imgExt = image.mime.slice(image.mime.indexOf('/') + 1);
            const imgRef = storageRef
                .child(`usuarios/${usuariob64}/${fileName}.${imgExt}`);

            Blob.build(image.data, { type: `${image.mime};BASE64` })
            .then((blob) => { 
                uploadBlob = blob;
                const uploadTask = imgRef.put(blob, metadata);
                uploadTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (progress === 1) {
                        this.setState({ progress: 0.85 }); 
                    } else if (progress === 0) {
                        this.setState({ progress: 0.10 }); 
                    } else {
                        this.setState({ progress }); 
                    }
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
                const imgUpd = type === 'userImg' ? 
                { imgAvatar: url, infoImgUpdated: 'false', jogosImgUpdated: 'false' } : 
                { imgBackground: url };
                if (type === 'userImg') {
                    /* setTimeout(() => updateUserDB(
                        'false',
                        'false',
                        userLogged.email, 
                        userLogged.key, 
                        url,
                        userLogged.nome
                    ), 2000); */
                }
                databaseRef.child(`usuarios/${usuariob64}`).update(imgUpd);
            })
            .then(() => {
                if (imgUrl) {
                    firebase.storage().refFromURL(imgUrl).delete()
                    .then(() => true)
                    .catch(() => true);
                }
                global.XMLHttpRequest = glbXMLHttpRequest;
                global.Blob = glbBlob;

                this.setState({ progress: 1 });
                setTimeout(() => this.setState({ progress: 0 }), 1500);
            })
            .catch(() => {
                global.XMLHttpRequest = glbXMLHttpRequest;
                global.Blob = glbBlob;

                if (uploadBlob) {
                    uploadBlob.close();
                }
                showAlert(
                    'danger', 
                    'Ops', 
                    'Falha no upload de imagem'
                );
                this.setState({ progress: 1 });
                setTimeout(() => this.setState({ progress: 0 }), 1500);
            }); 
        }
    }

    render = () => {
        const { userLogged } = this.props;
        const userImg = userLogged.imgAvatar ? { uri: userLogged.imgAvatar } : { uri: '' };
        const imgBg = userLogged.imgBackground ? 
            { uri: userLogged.imgBackground } : { uri: '' };
        const username = userLogged.nome ? userLogged.nome : 'Patinhas';

        return (
            <View style={styles.viewPrinc}>
                <ParallaxMenuView
                    onPressBackgroundImg={() => checkConInfo(() => this.onPressUserImg('userBg'))}
                    onPressUserImg={() => checkConInfo(() => this.onPressUserImg('userImg'))}
                    userImage={userImg}
                    backgroundSource={imgBg}
                    userName={username}
                    
                    navBarHeight={0.1}
                    navBarTitle={' '}
                >
                    {
                        this.state.progress > 0 &&
                        <View
                            style={{ 
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Progress.Bar 
                                progress={this.state.progress} 
                                width={Dimensions.get('screen').width} 
                                color={colorAppPrimary}
                                borderRadius={0}
                                borderWidth={0}
                            />
                        </View>
                    }
                    <List>
                        <ListItem
                            key={'Editar Perfil'}
                            title={'Editar Perfil'}
                            leftIcon={{ name: 'account', type: 'material-community' }}
                            titleStyle={{ 
                                fontFamily: 'OpenSans-Regular', 
                                color: 'black'
                            }}
                            onPress={() => Actions.profileEditPerfil()}
                        />
                        <ListItem
                            key={'Modalidades'}
                            title={'Modalidades'}
                            leftIcon={{ name: 'gamepad', type: 'material-community' }}
                            titleStyle={{ 
                                fontFamily: 'OpenSans-Regular', 
                                color: 'black'
                            }}
                            onPress={() => Actions.profileModalidades()}
                        />
                        <ListItem
                            key={'Preferências'}
                            title={'Preferências'}
                            leftIcon={{ name: 'settings', type: 'material-community' }}
                            titleStyle={{ 
                                fontFamily: 'OpenSans-Regular', 
                                color: 'black'
                            }}
                            onPress={() => Actions.profilePreferencias()}
                        />
                        <ListItem
                            key={'Sobre'}
                            title={'Sobre'}
                            leftIcon={{ name: 'information-outline', type: 'material-community' }}
                            titleStyle={{ 
                                fontFamily: 'OpenSans-Regular', 
                                color: 'black'
                            }}
                            onPress={() => this.setState({ showAbout: true })}
                            hideChevron
                        />
                    </List>
                    <Button 
                        small 
                        title={'Sair'}
                        textStyle={{ fontFamily: 'OpenSans-Regular', color: 'white' }}
                        buttonStyle={{ width: '100%', marginVertical: 20 }}
                        onPress={() => this.onPressLogout()}
                    />
                    <View style={{ marginBottom: 100 }} />
                </ParallaxMenuView>
                <Dialog
                    animationType={'fade'}
                    visible={this.state.showAbout}
                    title={'FollowSoccer'}
                    titleStyle={{
                        fontFamily: 'OpenSans-SemiBold'
                    }}
                    onTouchOutside={() => this.setState({ showAbout: false })}
                >
                    <View 
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%' 
                        }}
                    >
                        <View style={{ marginVertical: 20, flexDirection: 'row' }}>
                            <View style={{ marginHorizontal: 10 }}>
                                <Text style={styles.versionBtn}>
                                    Versão:
                                </Text>
                            </View>
                            <View style={{ marginHorizontal: 10 }}>
                                <Text style={styles.versionBtn}>
                                    {APP_VERSION}
                                </Text>
                            </View>
                        </View>
                        <View style={{ marginTop: 5 }}>
                            <Button 
                                small 
                                title={'Fechar'}
                                backgroundColor={colorAppSecondary}
                                textStyle={{ fontFamily: 'OpenSans-Regular', color: 'white' }}
                                buttonStyle={{ width: '100%' }}
                                onPress={() => this.setState({ showAbout: false })}
                            />
                        </View>
                    </View>
                </Dialog>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    },
    versionBtn: {
        fontSize: 16,
        fontFamily: 'OpenSans-Regular',
        color: 'black'
    }
});

const mapStateToProps = (state) => ({
    userLogged: state.LoginReducer.userLogged,
    userLevel: state.LoginReducer.userLevel,
    username: state.LoginReducer.username,
    enqueteProps: state.ProfileReducer.enqueteProps
});

export default connect(mapStateToProps, {
    modifyCleanLogin
})(Profile);
