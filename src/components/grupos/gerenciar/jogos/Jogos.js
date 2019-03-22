import React from 'react';
import { 
    View,
    StyleSheet,
    ImageBackground,
    Platform,
    TouchableOpacity,
    Text,
    Animated,
    Keyboard,
    TouchableWithoutFeedback,
    FlatList,
    ActivityIndicator,
    Dimensions,
    Alert
} from 'react-native';
import _ from 'lodash';

import Moment from 'moment';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { Divider, SearchBar, CheckBox } from 'react-native-elements';
import { isPortrait } from '../../../../utils/Screen';
import Versus from './Versus';
import {
    modificaAnimatedHeigth,
    modificaFilterStr,
    modificaFilterLoad,
    modificaUserLogged,
    modificaLoadingFooter,
    modificaAddNewRows
} from './JogosActions';
import { modificaJogoSelected } from './JogoActions';
import firebase from '../../../../utils/Firebase';
import { colorAppTertiary, ERROS, colorAppForeground } from '../../../../utils/Constantes';
import Avatar from '../../../../tools/elements/Avatar';
import Card from '../../../../tools/elements/Card';
import { store } from '../../../../App';
import { checkConInfo, showDropdownAlert } from '../../../../utils/SystemEvents';
import { modificaGrupoSelected, modificaGrupoParticipantes } from '../../GruposActions';

import imgCampoBackground from '../../../../assets/imgs/campojogos.png';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class Jogos extends React.Component {
    constructor(props) {
        super(props);

        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardHide);

        this.KeyboardIsOpened = false;
        this.scrollCurrentOffset = 0;
        this.scrollViewContentSize = 0;
        this.scrollViewHeight = 0;
        this.lastIndexListJogos = -1;
        this.fixedNumberRows = 30;

        this.fullHeight = 100;
        this.maxClamp = 100;
        this.minClamp = 0;

        this.fbDatabaseRef = firebase.database().ref();
        this.fbGroupSelectedRef = null;
        this.firebaseUsersListeners = [];

        this.scrollY = new Animated.Value(0);

        this.clampedScroll = Animated.diffClamp(
            this.scrollY.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolateLeft: 'clamp'
            }).interpolate({
                inputRange: [0, this.fullHeight],
                outputRange: [-this.fullHeight, this.fullHeight],
                extrapolate: 'identity'
            }), 
            this.minClamp,
            this.maxClamp,
        );
        
        this.animBarValue = Animated.add(
            Animated.multiply(this.clampedScroll, -1),
            this.scrollY.interpolate({ 
                inputRange: [0, 1],
                outputRange: [0, -1],
            }).interpolate({
                inputRange: [-this.fullHeight, 0],
                outputRange: [0, this.minClamp],
                extrapolate: 'clamp'
            })
        );

        this.state = {
            maxOffSetScrollView: 0,
            animTools: new Animated.Value(0),
            isPortraitMode: true
        };
    }

    componentDidMount = () => {
        const { grupoSelectedKey } = this.props;

        // LISTENER PARA ATUALIZACAO DO GRUPO
        this.fbGroupSelectedRef = this.fbDatabaseRef
        .child(`grupos/${grupoSelectedKey}`);
        
        this.fbGroupSelectedRef.on('value', snap => {
            if (snap) {
                const snapVal = snap.val();

                if (snapVal) {
                    const grupoSelected = { key: snap.key, ...snapVal };

                    this.props.modificaGrupoSelected(grupoSelected);
                    this.onInitializeListeners(grupoSelected);

                    return;
                }
            }
        });

        // PARTICIPANTES
        this.onInitializeListeners();
        
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    componentDidUpdate = (prevProps) => {
        const isEqualGroupPartic = _.isEqual(
            prevProps.grupoSelected.participantes, 
            this.props.grupoSelected.participantes
        );

        if (!isEqualGroupPartic) this.onInitializeListeners();
    }

    componentWillUnmount = () => {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        Dimensions.removeEventListener('change', this.onChangeDimensions);
        
        if (this.fbGroupSelectedRef) this.fbGroupSelectedRef.off();
        
        this.removeFbListeners();

        if (this.props.gruposListener) this.props.gruposListener();
    }

    onInitializeListeners = (grupoParam = false) => {
        const { grupoSelected } = this.props;

        const grupoFound = grupoParam || grupoSelected;

        if (grupoFound) {
            // ######### FETCH GROUPS ################
            const filtredParticKeys = _.filter(grupoFound.participantes, ita => ita.key);
            const numPartics = filtredParticKeys.length;
    
            const newPartics = _.filter(this.props.grupoParticipantes, itd => {
                if (_.findIndex(filtredParticKeys, itf => itf.key === itd.key) === -1) {
                    return false;
                }
    
                return true;
            });
    
            this.props.modificaGrupoParticipantes(newPartics);
    
            if (numPartics) {
                this.removeFbListeners();
    
                const asyncFunExec = async () => {
                    for (let index = 0; index < numPartics; index++) {
                        const element = filtredParticKeys[index];
                        const dbParticRef = this.fbDatabaseRef
                        .child(`usuarios/${element.key}`);
                        
                        dbParticRef.on('value', (snapshot) => {
                            const snapVal = snapshot ? snapshot.val() : null;
                
                            if (snapVal) {
                                const indexF = _.findIndex(
                                    this.props.grupoParticipantes, itb => itb.key === element.key
                                );
    
                                const newState = [...this.props.grupoParticipantes];
    
                                if (indexF !== -1) {
                                    newState[indexF] = { key: element.key, ...snapVal };
                                } else {
                                    newState.push({ key: element.key, ...snapVal });
                                }
    
                                this.props.modificaGrupoParticipantes(newState);
                            } else {
                                const indexF = _.findIndex(
                                    this.props.grupoParticipantes, itc => itc.key === element.key
                                );
    
                                const newState = [...this.props.grupoParticipantes];
    
                                if (indexF !== -1) {
                                    newState.splice(indexF, 1);
                                }
    
                                this.props.modificaGrupoParticipantes(newState);
                            }
                        });
                        
                        this.firebaseUsersListeners.push({ 
                            listener: dbParticRef, key: element.key
                        });
                    }
                };
    
                asyncFunExec();
            } 
        }
    }

    onChangeDimensions = () => {
        if (isPortrait()) {
            this.setState({ isPortraitMode: true });
        } else {
            this.setState({ isPortraitMode: false });
        }
    }

    onKeyboardShow = () => {
        this.KeyboardIsOpened = true;
    }
    
    onKeyboardHide = () => {
        this.KeyboardIsOpened = false;
    }

    onPressCardGame = (item) => {
        this.props.modificaJogoSelected(item.key);
        store.dispatch({
            type: 'modifica_itemselectedausente_jogos',
            payload: item.key
        });
        Actions.jogoTabBar({ onBack: () => Actions.popTo('_jogos') });
    }

    onPressConfirmP = (item, b64UserKey) => {
        const { userLogged, grupoSelected } = this.props;

        const userAusenteIndex = _.findIndex(
            item.ausentes, 
            (usuario) => usuario.key && usuario.key === b64UserKey);

        const funExec = (newAusentesList = false) => {
            const newConfirmadosList = item.confirmados ? 
            [...item.confirmados] : [];
            const dataAtual = Moment().format('YYYY-MM-DD HH:mm:ss');
            const ausentes = newAusentesList ? { ausentes: newAusentesList } : {};
    
            newConfirmadosList.push({
                key: b64UserKey,
                imgAvatar: userLogged.imgAvatar,
                nome: userLogged.nome,
                horaConfirm: dataAtual
            });
    
            this.fbDatabaseRef.child(`grupos/${grupoSelected.key}/jogos/${item.key}`).update({
                confirmados: newConfirmadosList,
                ...ausentes
            })
            .then(() => true)
            .catch(() => true);
        };

        if (userAusenteIndex !== -1) {
            let newAusentesList = [];
            newAusentesList = [...item.ausentes];
            newAusentesList.splice(userAusenteIndex, 1);

            Alert.alert(
                'Aviso', 
                'A ausência confirmada será removida.\nDeseja continuar ?',
                [
                    { text: 'Cancelar', onPress: () => false },
                    { 
                        text: 'OK', 
                        onPress: () => checkConInfo(
                        () => funExec(newAusentesList)) 
                    }
                ],
                { cancelable: true }
            );
        } else {
            funExec();
        }
    }

    onPressConfirmAusencia = (item, b64UserKey) => {
        const { userLogged, grupoSelected } = this.props;

        const userConfirmedIndex = _.findIndex(
            item.confirmados, 
            (usuario) => usuario.key && usuario.key === b64UserKey);
        
        const funExec = (newConfirmadosList = false) => {
            const newAusentesList = item.ausentes ? 
            [...item.ausentes] : [];
            const dataAtual = Moment().format('YYYY-MM-DD HH:mm:ss');
            const confirmados = newConfirmadosList ? { confirmados: newConfirmadosList } : {};
    
            newAusentesList.push({
                key: b64UserKey,
                imgAvatar: userLogged.imgAvatar,
                nome: userLogged.nome,
                horaConfirm: dataAtual
            });
    
            this.fbDatabaseRef.child(`grupos/${grupoSelected.key}/jogos/${item.key}`).update({
                ausentes: newAusentesList,
                ...confirmados
            })
            .then(() => true)
            .catch(() => true);
        };

        if (userConfirmedIndex !== -1) {
            let newConfirmadosList = [];
            newConfirmadosList = [...item.confirmados];
            newConfirmadosList.splice(userConfirmedIndex, 1);

            Alert.alert(
                'Aviso', 
                'A presença confirmada será removida.\nDeseja continuar ?',
                [
                    { text: 'Cancelar', onPress: () => false },
                    { 
                        text: 'OK', 
                        onPress: () => checkConInfo(
                        () => funExec(newConfirmadosList)) 
                    }
                ],
                { cancelable: true }
            );
        } else {
            funExec();
        }
    }

    onPressRemoveP = (item, b64UserKey) => {
        const { grupoSelected } = this.props;
        const indexFound = _.findIndex(
            item.confirmados, (usuario) => usuario.key === b64UserKey
        );
        let newConfirmadosList = [];

        if (newConfirmadosList !== -1) {
            newConfirmadosList = [...item.confirmados];
            newConfirmadosList.splice(indexFound, 1);
            this.fbDatabaseRef.child(`grupos/${grupoSelected.key}/jogos/${item.key}`).update({
                confirmados: newConfirmadosList
            })
            .then(() => true)
            .catch(() => true);
        }
    }
    
    onPressRemoveAusencia = (item, b64UserKey) => {
        const { grupoSelected } = this.props;
        const indexFound = _.findIndex(
            item.ausentes, (usuario) => usuario.key === b64UserKey
        );
        let newAusentesList = [];

        if (newAusentesList !== -1) {
            newAusentesList = [...item.ausentes];
            newAusentesList.splice(indexFound, 1);
            this.fbDatabaseRef.child(`grupos/${grupoSelected.key}/jogos/${item.key}`).update({
                ausentes: newAusentesList
            })
            .then(() => true)
            .catch(() => true);
        }
    }

    onScrollView = (currentOffset, direction) => {
        if (!this.KeyboardIsOpened) {
            if (currentOffset <= 0 || direction === 'up') {
                this.props.modificaAnimatedHeigth(false);
            } else if (direction === 'down') {
                this.props.modificaAnimatedHeigth(true);
            } else {
                this.props.modificaAnimatedHeigth(false);
            }
        }
        //this.onScrollViewTools(currentOffset, direction);
    }

    onScrollViewTools = (currentOffset, direction) => {
        if (currentOffset <= 0 || direction === 'up') {
            Animated.timing(
                this.state.animTools, 
                {
                    toValue: 0,
                    useNativeDriver: true,
                    duration: 200
                }
            ).start();
        } else if (direction === 'down') {
            Animated.timing(
                this.state.animTools, 
                {
                    toValue: 1,
                    useNativeDriver: true,
                    duration: 200
                }
            ).start();
        } else {
            Animated.timing(
                this.state.animTools, 
                {
                    toValue: 0,
                    useNativeDriver: true,
                    duration: 200
                }
            ).start();
        }
    }

    onFilterJogos = (jogos, filterStr) => {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(jogos, (jogo) => (
                (jogo.titulo && jogo.titulo.toLowerCase().includes(lowerFilter)) ||
                (jogo.descricao && jogo.descricao.toLowerCase().includes(lowerFilter)) ||
                (jogo.data && jogo.data.toLowerCase().includes(lowerFilter)) ||
                `${jogo.placarCasa}x${jogo.placarVisit}`.includes(lowerFilter)
        ));
    }

    addNewRows = (numberAdd) => {
        const forcedMore = numberAdd < 2 ? 2 : numberAdd;
        this.props.modificaAddNewRows(forcedMore);
        this.props.modificaLoadingFooter(false);
    }

    dataSourceControl = (jogos, filterStr) => {
        let newJogos = _.reverse([...jogos]);

        newJogos = newJogos.slice(0, this.props.maxRows);
        return this.renderBasedFilterOrNot(newJogos, filterStr);
    }

    flatListKeyExtractor = (item, index) => index.toString()

    removeFbListeners = () => {
        if (this.firebaseUsersListeners.length) {
            for (let index = 0; index < this.firebaseUsersListeners.length; index++) {
                const element = this.firebaseUsersListeners[index];
                
                if (element.key !== this.props.userLogged.key) element.listener.off();
            }

            this.firebaseUsersListeners = [];
        } 
    }

    renderBasedFilterOrNot = (jogos, filterStr) => {
        let newJogos = jogos;
        
        if (jogos) {
            if (filterStr) {
                newJogos = this.onFilterJogos(jogos, filterStr);
                if (!newJogos || newJogos.length === 0) {
                    setTimeout(() => this.props.modificaFilterLoad(false), 1000);
                }
            }
            this.lastIndexListJogos = newJogos.length - 1;
        }

        return newJogos;
    }

    renderCardFooter = (item) => {
        if (item.endStatus && item.endStatus === '0' && 
        (!item.lockLevel || item.lockLevel === '0')) {
            const b64UserKey = this.props.userLogged.key;
            const userConfirmed = _.findIndex(
                item.confirmados, 
                (usuario) => usuario.key && usuario.key === b64UserKey) !== -1;
            const userAusente = _.findIndex(
                item.ausentes, 
                (usuario) => usuario.key && usuario.key === b64UserKey) !== -1;
            const textP = userConfirmed ? 'Presença confirmada' : 'Confirmar - Presença';
            const color = userConfirmed ? 'green' : 'red';
            const textA = userAusente ? 'Ausência confirmada' : 'Confirmar - Ausência';
            const colorA = userAusente ? 'green' : '#343A40';

            return (
                <View>
                    <Divider
                        style={{
                            marginTop: 5,
                            marginBottom: 5,
                            height: 2
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            if (this.props.conInfo.type === 'none' ||
                                this.props.conInfo.type === 'unknown'
                            ) {
                                showDropdownAlert(
                                    'error',
                                    ERROS.semConexao.erro,
                                    ERROS.semConexao.mes
                                );
                                return false;
                            }
                            
                            if (userConfirmed) {
                                this.onPressRemoveP(item, b64UserKey);
                            } else {
                                this.onPressConfirmP(item, b64UserKey);
                            }
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 5,
                                backgroundColor: color,
                                marginTop: 5,
                                paddingVertical: 2,
                                marginHorizontal: 5
                            }}
                        >
                            <CheckBox
                                center
                                containerStyle={{
                                    marginLeft: 0,
                                    marginRight: 10,
                                    backgroundColor: 'transparent',
                                    borderWidth: 0,
                                    padding: 0
                                }}
                                title={(<View />)}
                                size={22}
                                checked={userConfirmed}
                                checkedColor={'white'}
                                onPress={() => {
                                    if (userConfirmed) {
                                        this.onPressRemoveP(item, b64UserKey);
                                    } else {
                                        this.onPressConfirmP(item, b64UserKey);
                                    }
                                }}
                            />
                            <Text
                                style={{ 
                                    color: 'white',
                                    fontSize: 16, 
                                    fontWeight: '500',
                                    fontFamily: 'OpenSans-Regular'
                                }}
                            >
                                {textP}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <Divider
                        style={{
                            marginTop: 5,
                            marginBottom: 5,
                            height: 2
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            if (this.props.conInfo.type === 'none' ||
                                this.props.conInfo.type === 'unknown'
                            ) {
                                showDropdownAlert(
                                    'error',
                                    ERROS.semConexao.erro,
                                    ERROS.semConexao.mes
                                );
                                return false;
                            }
                            
                            if (userAusente) {
                                this.onPressRemoveAusencia(item, b64UserKey);
                            } else {
                                this.onPressConfirmAusencia(item, b64UserKey);
                            }
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 5,
                                backgroundColor: colorA,
                                marginTop: 5,
                                paddingVertical: 2,
                                marginHorizontal: 5
                            }}
                        >
                            <CheckBox
                                center
                                containerStyle={{
                                    marginLeft: 0,
                                    marginRight: 10,
                                    backgroundColor: 'transparent',
                                    borderWidth: 0,
                                    padding: 0
                                }}
                                title={(<View />)}
                                size={22}
                                checked={userAusente}
                                checkedColor={'white'}
                                onPress={() => {
                                    if (userAusente) {
                                        this.onPressRemoveAusencia(item, b64UserKey);
                                    } else {
                                        this.onPressConfirmAusencia(item, b64UserKey);
                                    }
                                }}
                            />
                            <Text
                                style={{ 
                                    color: 'white',
                                    fontSize: 16, 
                                    fontWeight: '500',
                                    fontFamily: 'OpenSans-Regular'
                                }}
                            >
                                {textA}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ marginBottom: 5 }} />
                </View>
            );
        }

        return false;
    }

    renderCardsJogos = ({ item, index }) => {
        const titulo = item.titulo ? item.titulo : ' ';
        const data = item.data ? item.data : ' ';
        const descricao = item.descricao ? item.descricao : ' ';
        const placarCasa = item.placarCasa ? item.placarCasa : '0'; 
        const placarVisit = item.placarVisit ? item.placarVisit : '0';

        if (this.lastIndexListJogos === index) {
            setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        }

        const imageProps = item.imagem ? { image: { uri: item.imagem } } : {}

        return (
            <View>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => this.onPressCardGame(item)}
                >
                    <Card 
                        title={titulo} 
                        containerStyle={[styles.card, styles.shadowCard]}
                        {...imageProps}
                        featuredSubtitle={descricao}
                    >
                        {
                            item.status === '1' ?
                            (
                                <View 
                                    style={{
                                        alignItems: 'center'
                                    }}
                                >
                                    <View 
                                        style={{
                                            backgroundColor: 'red',
                                            borderRadius: 15,
                                            paddingHorizontal: 15,
                                            paddingVertical: 5
                                        }}
                                    >
                                        <Text 
                                            style={[
                                                styles.textData, 
                                                { 
                                                    color: 'white', 
                                                }
                                            ]}
                                        >
                                            Ao vivo
                                        </Text>
                                    </View>
                                </View>
                            )
                            :
                            (
                                <Text style={styles.textData}>
                                    {data}
                                </Text>
                            )
                        }
                        <Divider
                            style={{
                                marginTop: 5,
                                marginBottom: 5,
                                height: 2
                            }}
                        />
                        <Versus
                            jogo={item}
                            placarCasa={placarCasa}
                            placarVisit={placarVisit}
                        />
                        { item.status !== '1' && this.renderCardFooter(item) }
                    </Card>   
                </TouchableOpacity>
                <View style={{ marginBottom: 10 }} />
            </View>
        );
    }

    renderListItens = (jogos) => (
        <View>
            <AnimatedFlatList
                ref={(ref) => { this.scrollViewRef = ref; }}
                data={this.dataSourceControl(jogos, this.props.filterStr)}
                renderItem={this.renderCardsJogos}
                keyExtractor={this.flatListKeyExtractor}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                scrollEventThrottle={16}
                onEndReachedThreshold={0.01}
                /*onEndReached={() => {
                    let rowsToShow = (this.lastIndexListJogos + 1) + this.fixedNumberRows;
                    const jogosLength = jogos.length;
                    if (rowsToShow > jogosLength) {
                        rowsToShow = jogosLength;
                    }

                    if (rowsToShow !== this.props.maxRows) {
                        if (rowsToShow !== (this.lastIndexListJogos + 1)) {
                            this.props.modificaLoadingFooter(true);
                        }
                        _.debounce(this.addNewRows, 2000)(rowsToShow);
                    } else {
                        this.props.modificaLoadingFooter(false);
                    }
                }}
                onContentSizeChange={(w, h) => { 
                    this.scrollViewContentSize = h;
                    const newOffSet = h - this.scrollViewHeight;
                    this.setState({ maxOffSetScrollView: newOffSet });
                }}
                onLayout={ev => { 
                    this.scrollViewHeight = ev.nativeEvent.layout.height;
                    const newOffSet = this.scrollViewContentSize - ev.nativeEvent.layout.height;
                    this.setState({ maxOffSetScrollView: newOffSet });
                }} */
                onScroll={
                    Animated.event(
                        [{
                            nativeEvent: { contentOffset: { y: this.scrollY } }
                        }],
                        {
                            useNativeDriver: true,
                            listener: (event) => {
                                const currentOffset = event.nativeEvent.contentOffset.y;
                                const direction = currentOffset > 
                                                this.scrollCurrentOffset ? 'down' : 'up';
                                this.scrollCurrentOffset = currentOffset;
                                this.onScrollView(currentOffset, direction);
                            }
                        }
                    )
                }
                ListHeaderComponent={(<View style={{ marginTop: 60 }} />)}
                ListFooterComponent={(
                        <View style={{ marginBottom: 80 }} >
                        {
                            this.props.loadingFooter &&
                            <ActivityIndicator size={'large'} color={'white'} />
                        }
                        </View> 
                )}
            />
        </View>
    )

    render = () => {
        const { userLogged, grupoSelected } = this.props;
        const userImg = userLogged.imgAvatar ? { uri: userLogged.imgAvatar } : { uri: '' };
        const jogosMapped = grupoSelected.jogos ?
        _.map(grupoSelected.jogos, (ita, key) => ({ key, ...ita })) : [];

        const jogos = _.filter(
            jogosMapped, 
            itb => itb.endStatus === '0' || (userLogged.level === '0' && itb.endStatus === '255')
        );

        return (
            <View style={styles.viewPrinc}>
                <ImageBackground
                    source={imgCampoBackground}
                    style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'contain'
                    }}
                >
                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                        <Animated.View 
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                right: 0,
                                zIndex: 1,
                                paddingHorizontal: 15,
                                backgroundColor: colorAppTertiary,
                                borderBottomWidth: 0.5,
                                borderBottomColor: 'white',
                                transform: [
                                    { 
                                        translateY: this.animBarValue, 
                                    }
                                ],
                                ...Platform.select({
                                    ios: {
                                      shadowColor: 'rgba(0,0,0, .2)',
                                      shadowOffset: { height: 0, width: 0 },
                                      shadowOpacity: 1,
                                      shadowRadius: 1,
                                    },
                                    android: {
                                      elevation: 1
                                    }
                                })
                            }}
                        >
                            {
                                Platform.OS === 'ios' && this.state.isPortraitMode &&
                                <View 
                                    style={{ 
                                        height: getStatusBarHeight(true), 
                                        backgroundColor: colorAppTertiary 
                                    }} 
                                />
                            }
                            <View 
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <View style={{ flex: 0.5 }}>
                                    <Avatar
                                        small
                                        rounded
                                        title={'  '}
                                        source={userImg}
                                        onPress={() => { 
                                            Keyboard.dismiss();
                                        }}
                                        activeOpacity={0.7}
                                    /> 
                                </View>
                                <View style={{ flex: 2.5 }}>
                                    <SearchBar
                                        autoCapitalize={'none'}
                                        autoCorrect={false}
                                        onFocus={() => this.props.modificaAnimatedHeigth(1)}
                                        onBlur={() => this.props.modificaAnimatedHeigth(false)}
                                        clearIcon={!!this.props.filterStr}
                                        showLoadingIcon={
                                            jogos &&
                                            jogos.length > 0 && 
                                            this.props.filterLoad
                                        }
                                        containerStyle={{ 
                                            backgroundColor: 'transparent',
                                            borderTopWidth: 0, 
                                            borderBottomWidth: 0
                                        }}
                                        searchIcon={{ size: 24 }}
                                        value={this.props.filterStr}
                                        onChangeText={(value) => {
                                            this.props.modificaFilterStr(value);
                                            this.props.modificaFilterLoad(true);
                                        }}
                                        onClear={() => this.props.modificaFilterStr('')}
                                        placeholder='Buscar jogo...'
                                    />
                                </View>
                                <View style={{ flex: 0.5 }} />
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                    { 
                        jogos.length ?
                        (this.renderListItens(jogos))
                        :
                        (<View />)
                    }
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
    card: {
        padding: 5,
        margin: 10,
        marginHorizontal: 10,
        marginVertical: 15,
        borderRadius: 3
    },
    shadowCard: {
        ...Platform.select({
            ios: {
                elevation: 2
            },
            android: {
                elevation: 2
            }
        })
    },
    textData: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        fontFamily: 'OpenSans-Regular',
    },
    viewTopTools: {
        position: 'relative'
    }
});

const mapStateToProps = (state) => ({
    username: state.LoginReducer.username,
    password: state.LoginReducer.password,
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoSelectedKey: state.GruposReducer.grupoSelectedKey,
    gruposListener: state.GruposReducer.gruposListener,
    grupoParticipantes: state.GruposReducer.grupoParticipantes,
    filterStr: state.JogosReducer.filterStr,
    loadingFooter: state.JogosReducer.loadingFooter,
    maxRows: state.JogosReducer.maxRows,
    filterLoad: state.JogosReducer.filterLoad,
    jumpScene: state.JogosReducer.jumpScene,
    userLogged: state.LoginReducer.userLogged,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {
    modificaAnimatedHeigth,
    modificaFilterStr,
    modificaFilterLoad,
    modificaUserLogged,
    modificaLoadingFooter,
    modificaAddNewRows,
    modificaJogoSelected,
    modificaGrupoSelected,
    modificaGrupoParticipantes
})(Jogos);
