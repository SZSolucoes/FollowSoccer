import React from 'react';
import {
    Modal, 
    Text, 
    View,
    TouchableWithoutFeedback,
    TouchableHighlight,
    StyleSheet,
    Clipboard,
    Animated,
    ActivityIndicator
} from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import {
    modificaShowShareModal
} from './InfoActions';
import { colorAppPrimary, ERROS } from '../../../../utils/Constantes';

import Avatar from '../../../../tools/elements/Avatar';
import { showDropdownAlert } from '../../../../utils/SystemEvents';

class ShareModal extends React.Component {

    constructor(props) {
        super(props);

        this.onShareImage = this.onShareImage.bind(this);
        this.onShareImagesFile = this.onShareImagesFile.bind(this);
        this.onShareMessage = this.onShareMessage.bind(this);
        this.closeModal = this.closeModal.bind(this);

        this.state = {
            fadeAnimValue: new Animated.Value(0),
            enablePress: true
        };
    }

    onShareMessage(item) {
        let message = '';

        if (item.nomeUser) {
            message += `${item.nomeUser}`;
        }
        if (item.descPost) {
            message += `\n\n${item.descPost}`;
        }
        if (item.textArticle) {
            message += `\n\nTexto do artigo:\n${item.textArticle}`;
        }
        if (item.linkArticle) {
            message += `\n\nLink do artigo:\n${item.linkArticle}`;
        }

        const shareImageBase64 = {
            title: 'Enviar como mensagem',
            message
        };

        Share.open(shareImageBase64)
        .then(() => {
            this.setState({ enablePress: true });
            this.closeModal();
        })
        .catch(() => {
            this.setState({ enablePress: true });
            this.closeModal();
        });
    }

    async onShareImagesFile(cachedImg, articleImg) {
        if (cachedImg !== articleImg) {
            return cachedImg;
        } 
            
        const fs = RNFetchBlob.fs;
        let imagePath = null;
        let contentType = '';

        return await RNFetchBlob.config({
            fileCache: true
        })
        .fetch('GET', articleImg)
        .then(res => {
            imagePath = res.path();
            contentType = res.info().headers['content-type'];
            return res.readFile('base64');
        })
        .then(base64Data => {
            fs.unlink(imagePath);
            return `data:${contentType};base64,${base64Data}`;
        })
        .catch(() => null);
    }

    async onShareImage(item) {
        const { imgsArticle } = item;
        const locateCachedImgsUri = [];

        const shareImageBase64 = {
            title: imgsArticle.length === 1 ? 'Compartilhar imagem' : 'Compartilhar imagens',
            urls: []
        };

        this.setState({ enablePress: false });

        try {
            for (let index = 0; index < imgsArticle.length; index++) {
                const element = imgsArticle[index];
                locateCachedImgsUri.push({ uri: element.data });
            }
    
            if (locateCachedImgsUri.length === imgsArticle.length) {
                for (let index = 0; index < locateCachedImgsUri.length; index++) {
                    const cachedB64OrUrl = locateCachedImgsUri[index];
                    const articleB64OrUrl = imgsArticle[index];
    
                    const ret = await this.onShareImagesFile(cachedB64OrUrl, articleB64OrUrl);
                    if (ret) {
                        shareImageBase64.urls.push(ret);
                    } else {
                        this.setState({ enablePress: true });
                        setTimeout(() => 
                            showDropdownAlert(
                                'error', 
                                ERROS.shareModalImage.erro, 
                                ERROS.shareModalImage.mes
                            )
                        , 500);

                        return;
                    }
                }
    
                Share.open(shareImageBase64)
                .then(() => {
                    this.setState({ enablePress: true });
                    this.closeModal();
                })
                .catch(() => {
                    this.setState({ enablePress: true });
                    this.closeModal();
                });
            } else {
                this.setState({ enablePress: true });
                this.closeModal();
            }
        } catch (e) {
            console.log(e);
            this.setState({ enablePress: true });
            setTimeout(() => 
                showDropdownAlert(
                    'error', 
                    ERROS.shareModalImage.erro, 
                    ERROS.shareModalImage.mes
                )
            , 500);
        }
    }

    closeModal() {
        this.setState({ enablePress: true });
        Animated.timing(
            this.state.fadeAnimValue,
            {
                toValue: 0,
                duration: 200
            }
        ).start(() => {
            setTimeout(() => this.props.modificaShowShareModal(false), 100);
        });
    }

    render() {
        const { userLogged, itemShareSelected } = this.props;
        const userImg = userLogged.imgAvatar ? { uri: userLogged.imgAvatar } : { uri: '' };
        const userNome = userLogged.nome ? userLogged.nome : ' ';
        const hasImgs = !!(
            itemShareSelected && 
            itemShareSelected.imgsArticle && 
            itemShareSelected.imgsArticle.length
        );
        return (
            <Modal
                animationType="slide"
                transparent
                visible={this.props.showShareModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => this.closeModal()}
                onShow={() =>
                    Animated.timing(
                        this.state.fadeAnimValue,
                        {
                            toValue: 0.5,
                            duration: 800
                        }
                    ).start()
                }
            >
                <TouchableWithoutFeedback
                    onPress={() => this.closeModal()}
                >
                    <Animated.View
                        style={{
                            flex: 1,
                            backgroundColor: this.state.fadeAnimValue.interpolate({
                                inputRange: [0, 0.5],
                                outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']
                            })
                        }}
                    >
                        <View style={{ flex: 1 }} />
                        <TouchableWithoutFeedback>
                            <View style={styles.viewPricinp} >
                                <View style={styles.viewTop}>
                                    <View style={styles.viewUser}>
                                        <View 
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start' 
                                            }}
                                        >
                                            <Avatar
                                                small
                                                rounded
                                                title={'avatar'}
                                                source={userImg}
                                                onPress={() => false}
                                            />
                                            <View style={{ marginHorizontal: 5 }} />
                                            <Text 
                                                style={{ 
                                                    fontWeight: '400', fontSize: 14, color: 'black' 
                                                }}
                                            >
                                                { userNome }
                                            </Text>
                                        </View>
                                        <View 
                                            style={{
                                                flex: 1,
                                                alignItems: 'flex-end', 
                                            }}
                                        >
                                            {
                                                !this.state.enablePress &&
                                                <ActivityIndicator 
                                                    size={'large'} 
                                                    color={colorAppPrimary} 
                                                />
                                            }
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.viewBottom}>
                                    <TouchableHighlight
                                        underlayColor={'#EEEEEE'}
                                        style={{ flex: 1 }}
                                        onPress={() => 
                                            this.state.enablePress && 
                                            this.onShareMessage(itemShareSelected)
                                        }
                                    >
                                        <View
                                            style={[
                                                styles.itemMenu,
                                                { 
                                                    backgroundColor: this.state.enablePress 
                                                    ? 'white' : '#EEEEEE' 
                                                }
                                            ]}
                                        >
                                            <Icon
                                                name='comment-text-multiple-outline' 
                                                type='material-community' 
                                                size={28} color='green'
                                            />
                                            <View style={{ marginHorizontal: 5 }} />
                                            <Text style={styles.itemMenuText}>
                                                Enviar como mensagem
                                            </Text>
                                        </View>
                                    </TouchableHighlight>
                                    {
                                        hasImgs &&
                                        <TouchableHighlight
                                            underlayColor={'#EEEEEE'}
                                            style={{ flex: 1 }}
                                            onPress={
                                                () => this.state.enablePress && 
                                                this.onShareImage(itemShareSelected)
                                            }
                                        >
                                            <View
                                                style={[
                                                    styles.itemMenu,
                                                    { 
                                                        backgroundColor: this.state.enablePress 
                                                        ? 'white' : '#EEEEEE' 
                                                    }
                                                ]}
                                            >
                                                <Icon
                                                    name='image-move' 
                                                    type='material-community' 
                                                    size={28} color='green'
                                                />
                                                <View style={{ marginHorizontal: 5 }} />
                                                <Text style={styles.itemMenuText}>
                                                    {
                                                        itemShareSelected.imgsArticle.length === 1 ?
                                                        'Compartilhar imagem' 
                                                        : 
                                                        'Compartilhar imagens'
                                                    }
                                                </Text>
                                            </View>
                                        </TouchableHighlight>
                                    }
                                    {
                                        !!itemShareSelected.linkArticle &&
                                        <TouchableHighlight
                                            underlayColor={'#EEEEEE'}
                                            style={{ flex: 1 }}
                                            onPress={() => {
                                                if (this.state.enablePress) {
                                                    Clipboard.setString(
                                                        itemShareSelected.linkArticle
                                                    );
                                                    this.closeModal();
                                                    setTimeout(
                                                    () => 
                                                    showDropdownAlert(
                                                        'success', 
                                                        'Sucesso', 
                                                        'Link copiado para área de transferência'
                                                    )
                                                    , 500);
                                                }
                                            }}
                                        >
                                            <View
                                                style={[
                                                    styles.itemMenu,
                                                    { 
                                                        backgroundColor: this.state.enablePress 
                                                        ? 'white' : '#EEEEEE' 
                                                    }
                                                ]}
                                            >
                                                <Icon
                                                    name='link-variant' 
                                                    type='material-community' 
                                                    size={28} color='green'
                                                />
                                                <View style={{ marginHorizontal: 5 }} />
                                                <Text style={styles.itemMenuText}>
                                                    Copiar link
                                                </Text>
                                            </View>
                                        </TouchableHighlight>
                                    }
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    viewPricinp: {
        flex: 0.5,
        backgroundColor: 'white',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5
    },
    viewTop: {
        flex: 0.5,
        justifyContent: 'center'
    },
    viewBottom: {
        flex: 1,
        borderTopWidth: 1,
        borderTopColor: '#707070'
    },
    itemMenu: {
        flexDirection: 'row', 
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 10
    },
    itemMenuText: {
        fontSize: 16,
        color: 'black'
    },
    viewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10
    }
});

const mapStateToProps = (state) => ({
    showShareModal: state.InfosReducer.showShareModal,
    userLogged: state.LoginReducer.userLogged,
    itemShareSelected: state.InfosReducer.itemShareSelected
});

export default connect(mapStateToProps, { modificaShowShareModal })(ShareModal);

