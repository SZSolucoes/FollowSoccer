
import React from 'react';
import {
    View,
    ScrollView,
    Animated,
    StyleSheet,
    Dimensions,
    Text,
    TouchableWithoutFeedback,
    TextInput,
    Keyboard,
    TouchableOpacity,
    Alert,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import _ from 'lodash';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import Moment from 'moment';
import { Icon, Divider } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import firebase from '../../../../utils/Firebase';
import { isPortrait } from '../../../../utils/Screen';
import { checkConInfo } from '../../../../utils/SystemEvents';
import { modificaStartUpOrDownAnim, modificaInfoMsgSelected } from './InfoActions';
import { modificaAnimatedHeigth } from '../jogos/JogosActions';
import Avatar from '../../../../tools/elements/Avatar';

class Coment extends React.Component {
    constructor(props) {
        super(props);

        this.scrollView = null;
        this.listenerDimensions = null;
        this.dbFbRef = firebase.database().ref();
        this.maxTextHeight = 120;

        this.state = {
            maxHeight: Dimensions.get('window').height,
            animScreenT: new Animated.Value(Dimensions.get('window').height),
            comentario: '',
            maxWidthText: Dimensions.get('window').width / 1.3
        };
    }

    componentDidMount = () => {
        Dimensions.addEventListener('change', this.onChangeDimension);
    }

    shouldComponentUpdate = (nextProps, nextStates) => {
        const { infoMsgSelected } = nextProps;

        if (nextProps.startUpOrDownAnim !== this.props.startUpOrDownAnim) {
            this.startUpOrDownAnim(nextProps.startUpOrDownAnim); 
        }
        if (infoMsgSelected && 
            infoMsgSelected.key !== this.props.infoMsgSelected.key) {
            this.infoKeyListener = this.dbFbRef
            .child(`grupos/${infoMsgSelected.groupkey}/informativos/${infoMsgSelected.key}`);
            this.infoKeyListener.on('value', (snapshot) => {
                this.props.modificaInfoMsgSelected(
                    { ...snapshot.val(), key: snapshot.key, groupkey: infoMsgSelected.groupkey }
                );
            });
        } else if (infoMsgSelected === {}) {
            this.infoKeyListener.off();
        }

        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.onChangeDimension);
    }

    onChangeDimension = (event) => {
        if (isPortrait()) {
            this.setState({ 
                maxHeight: event.window.height, maxWidthText: event.window.width / 1.3 
            });
        } else {
            this.setState({ maxWidthText: event.window.width / 1.3 });
        }
    }

    onPressSendMessage = () => {
        const { infoMsgSelected, userLogged } = this.props;
        const { comentario } = this.state;
        const dataAtual = Moment().format('YYYY-MM-DD HH:mm:ss');
        const newInfoMsgSelectedList = infoMsgSelected.listComents ? 
        [...infoMsgSelected.listComents] : [];
        let newInfoMsgSelected = {};

        if (!comentario.trim()) {
            this.setState({ comentario: '' });
            return;
        }

        newInfoMsgSelectedList.push({
            key: userLogged.key,
            imgAvatar: userLogged.imgAvatar,
            nome: userLogged.nome,
            comentario: comentario.trim(),
            dataKey: dataAtual
        });

        newInfoMsgSelected = { ...infoMsgSelected, listComents: newInfoMsgSelectedList };

        this.dbFbRef
        .child(`grupos/${infoMsgSelected.groupkey}/informativos/${infoMsgSelected.key}`)
        .update({
            listComents: newInfoMsgSelectedList
        })
        .then(() => { 
            this.props.modificaInfoMsgSelected(newInfoMsgSelected);
            setTimeout(() => {
                if (this.scrollView) {
                    this.scrollView.scrollToEnd({ animated: true });
                }
                Keyboard.dismiss();
            }, 500);
        })
        .catch(() => true); 

        this.setState({ comentario: '' });
    }

    startUpOrDownAnim = (startUpOrDownAnim) => {
        if (startUpOrDownAnim === 'up') {
            if (this.props.commentUpPress) this.props.commentUpPress();
            Animated.spring(
                this.state.animScreenT, 
                {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 2
                }
            ).start();
            this.props.modificaAnimatedHeigth(true);
        } else {
            if (this.props.commentDownPress) this.props.commentDownPress();
            Animated.spring(
                this.state.animScreenT, 
                {
                    toValue: this.state.maxHeight,
                    useNativeDriver: true,
                    bounciness: 2
                }
            ).start();
            this.props.modificaAnimatedHeigth(false);
        }
    }

    removeComent = (item) => {
        const { infoMsgSelected } = this.props;
        const newListComents = [...infoMsgSelected.listComents];
        const msgIndex = _.findIndex(
            newListComents, (itemComent) => itemComent.dataKey === item.dataKey
        );
        let newInfoMsgSelected = {};
        if (msgIndex !== -1) {
            newListComents.splice(msgIndex, 1);
            newInfoMsgSelected = { ...infoMsgSelected, listComents: newListComents };
            this.dbFbRef
            .child(`grupos/${infoMsgSelected.groupkey}/informativos/${infoMsgSelected.key}`)
            .update({
                listComents: newListComents
            })
            .then(() => { 
                this.props.modificaInfoMsgSelected(newInfoMsgSelected);
            })
            .catch(() => true); 
        }
    }

    renderComents = () => {
        const { infoMsgSelected, userLogged } = this.props;
        const newListComents = [...infoMsgSelected.listComents];
        const isPushed = _.findIndex(
            newListComents, (coment) => coment.push && coment.push === 'push'
        );
        let viewComents = null;
        const dataAtual = Moment();

        if (isPushed !== -1) {
            newListComents.splice(isPushed, 1);
        }

        if (newListComents.length === 0) {
            return viewComents;
        }

        viewComents = newListComents.map((item, index) => {
            const userImg = item.imgAvatar ? { uri: item.imgAvatar } : null;
            const isMsgUser = item.key && item.key === userLogged.key;
            let timeDiff = '';
            let timeAppend = '';

            if (item.dataKey) {
                const dataKeyTime = Moment(item.dataKey, 'YYYY-MM-DD HH:mm:ss');
                timeDiff = dataAtual.diff(dataKeyTime, 'days');
                timeAppend = 'd';
                if (!timeDiff > 0) {
                    timeDiff = dataAtual.diff(dataKeyTime, 'hours');
                    timeAppend = 'h';
                    if (!timeDiff > 0) {
                        timeDiff = dataAtual.diff(dataKeyTime, 'minutes');
                        timeAppend = 'min';
                        if (!timeDiff > 0) {
                            timeDiff = dataAtual.diff(dataKeyTime, 'seconds');
                            timeAppend = 's';
                            if (!timeDiff > 0) {
                                timeDiff = '';
                                timeAppend = 'agora mesmo';
                            }
                        }
                    }
                }
                timeDiff = `${timeDiff} ${timeAppend}`;
            }
            return (
                <View key={index}>
                    <View style={styles.coments}>
                        <Avatar
                            medium
                            rounded
                            source={userImg}
                            onPress={() => Keyboard.dismiss()}
                            activeOpacity={0.7}
                        />
                        <View 
                            style={[
                                styles.viewComent,
                                {
                                    maxWidth: this.state.maxWidthText
                                }
                            ]}   
                        >
                            <Text style={{ fontWeight: 'bold', color: 'black' }}>
                                {item.nome}
                            </Text>
                            <Text style={{ color: 'black' }}>
                                {item.comentario}
                            </Text>
                        </View>
                    </View>
                    <View 
                        style={{ 
                            marginHorizontal: 75, marginVertical: 2, flexDirection: 'row' 
                        }}
                    >
                        <View>
                            <Text style={{ color: '#707070' }}>
                                {timeDiff}
                            </Text>
                        </View>
                        {
                            isMsgUser &&
                            <View style={{ marginLeft: 10 }}>
                                <Text 
                                    style={{ fontWeight: 'bold', color: '#707070' }}
                                    onPress={() => checkConInfo(() => {
                                        Alert.alert(
                                            'Remover!', 
                                            'Deseja remover o comentário selecionado ?',
                                            [
                                                { 
                                                    text: 'Cancelar',
                                                    onPress: () => false, 
                                                    style: 'cancel' 
                                                },
                                                { 
                                                    text: 'Ok', 
                                                    onPress: () => this.removeComent(item)
                                                }
                                            ]
                                        );
                                    })}
                                >
                                    Remover
                                </Text>
                            </View>
                        }
                    </View>
                </View>
            );
        });

        return viewComents;
    }

    renderBasedPlatform = () => {
        if (Platform.OS === 'ios') {
            return (
                <KeyboardAvoidingView
                    behavior={'position'}
                >
                    <View style={styles.inputMsg}>
                        <Divider />
                        <View style={styles.viewTextInput}>
                            <View style={styles.inputSend}>
                                <TextInput
                                    placeholder='Escreva um comentário...'
                                    multiline
                                    value={this.state.comentario}
                                    onChangeText={
                                        (value) => this.setState({ comentario: value })
                                    }
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => checkConInfo(() => this.onPressSendMessage())}
                                style={{ 
                                    flex: 0.5,
                                    ...Platform.select({
                                        ios: {
                                            marginTop: 3
                                        }
                                    })
                                }}
                            >
                                <Icon
                                    name='send' 
                                    type='material-community' 
                                    size={30} color='green'
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            );
        }

        return (
            <View style={styles.inputMsg}>
                <Divider />
                <View style={styles.viewTextInput}>
                    <View style={styles.inputSend}>
                        <TextInput
                            placeholder='Escreva um comentário...'
                            multiline
                            value={this.state.comentario}
                            onChangeText={
                                (value) => this.setState({ comentario: value })
                            }
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => checkConInfo(() => this.onPressSendMessage())}
                        style={{ 
                            flex: 0.5,
                            ...Platform.select({
                                ios: {
                                    marginTop: 3
                                }
                            })
                        }}
                    >
                        <Icon
                            name='send' 
                            type='material-community' 
                            size={30} color='green'
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    render = () => {
        const { infoMsgSelected } = this.props;
        let qtdLikes = infoMsgSelected && infoMsgSelected.listLikes ? 
        infoMsgSelected.listLikes.length : 0;

        if (qtdLikes === 0 || (qtdLikes === 1 && infoMsgSelected.listLikes[0].push)) {
            qtdLikes = 0;
        }

        return (
            <Animated.View 
                style={{ 
                    backgroundColor: 'transparent', 
                    width: '100%',
                    height: '100%',
                    transform: [{ translateY: this.state.animScreenT }],
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 900
                }} 
            >
                <View style={styles.containerPrincip}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            Keyboard.dismiss();
                        }}
                    >
                        <View
                            style={{ 
                                flexDirection: 'row', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginHorizontal: 15
                            }}
                        >
                            <TouchableWithoutFeedback
                                onPress={
                                    () => 
                                    Actions.listLikes({ 
                                        infoMsgSelected
                                    })
                                }
                            >
                                <View
                                    style={{ 
                                        flexDirection: 'row', 
                                        alignItems: 'center'
                                    }}
                                >
                                    <Icon
                                        name='thumb-up' 
                                        type='material-community' 
                                        size={18} color='green'
                                    />
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Text
                                        style={{ fontWeight: 'bold' }}
                                    >
                                        { qtdLikes }
                                    </Text>
                                    <Icon
                                        name='chevron-right' 
                                        type='material-community' 
                                        size={34} color='green'
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback
                                style={{ alignSelf: 'flex-end' }}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    this.props.modificaStartUpOrDownAnim('down');
                                }}
                            >   
                                <View>
                                    <Icon
                                        name='close-box-outline' 
                                        type='material-community' 
                                        size={28} color='black'
                                        iconStyle={{ opacity: 0.8, margin: 5 }}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                    <Divider />
                    <ScrollView
                        keyboardShouldPersistTaps={'handled'}
                        ref={(ref) => { this.scrollView = ref; }}
                    >
                        {
                            !!this.props.infoMsgSelected &&
                            !!this.props.infoMsgSelected.listComents &&
                            this.renderComents()
                        }
                        <View style={{ marginVertical: 40 }} />
                    </ScrollView>
                    { this.renderBasedPlatform() }
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    containerPrincip: {
        backgroundColor: 'white', 
        width: '100%', 
        height: '100%',
        zIndex: 800,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        ...Platform.select({
            ios: {
                paddingTop: getStatusBarHeight(true)
            }
        })
    },
    inputMsg: {
        backgroundColor: 'white',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 850
    },
    viewTextInput: {
        backgroundColor: '#EEEEEE',
        borderRadius: 20,
        margin: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    inputSend: { 
        flex: 3, 
        maxHeight: 100,
        paddingHorizontal: 15,
        ...Platform.select({
            ios: {
                marginVertical: 10
            }
        })
    },
    coments: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginVertical: 5
    },
    viewComent: {
        backgroundColor: '#EEEEEE',
        borderRadius: 15,
        marginHorizontal: 10,
        padding: 10
    },
});

const mapStateToProps = (state) => ({
    startUpOrDownAnim: state.InfosReducer.startUpOrDownAnim,
    infoMsgSelected: state.InfosReducer.infoMsgSelected,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {
    modificaStartUpOrDownAnim,
    modificaInfoMsgSelected,
    modificaAnimatedHeigth
})(Coment);

