import React from 'react';
import { Router, Scene, Actions, ActionConst } from 'react-native-router-flux';
import { 
    StyleSheet,
    View,
    Dimensions,
    Platform,
    StatusBar,
    Keyboard,
    DeviceEventEmitter,
    AsyncStorage,
    Animated,
    Text,
    Alert,
    Image,
    TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import _ from 'lodash';

import { store } from './App';
import { isPortrait } from './utils/Screen';
import { mappedKeyStorage } from './utils/Storage';

import DropdownAlert from './tools/dropdownalert/DropdownAlert';
import { colorAppSecondary } from './utils/Constantes';
import { checkConInfo } from './utils/SystemEvents';
import firebase from './utils/Firebase';
import { doEndGame } from './utils/JogosUtils';

import imgFinishFlag from './assets/imgs/finishflag.png';

//import SplashScreenAnim from './components/login/SplashScreenAnim';
import MainDrawerMenu from './components/drawersmenu/MainDrawerMenu';

import Login from './components/login/Login';
import Profile from './components/profile/Profile';
import Cadastrar from './components/login/Cadastrar';
import RecuperarSenha from './components/login/RecuperarSenha';
import Grupos from './components/grupos/Grupos';
import CreateGroup from './components/grupos/CreateGroup';
//import GerenciarGrupoPrincipal from './components/grupos/gerenciar/GerenciarGrupoPrincipal';
import GerenciarGrupoInfos from './components/grupos/gerenciar/GerenciarGrupoInfos';
import Partidas from './components/partidas/Partidas';
import AnimatedScene from './tools/animated/AnimatedScene';
import ListLikes from './components/grupos/gerenciar/infos/ListLikes';
import Admin from './components/grupos/gerenciar/admin/Admin';
import CadastroJogos from './components/grupos/gerenciar/admin/cadastrojogos/CadastroJogos';
import Jogos from './components/grupos/gerenciar/jogos/Jogos';
import { normalize } from './utils/StrComplex';
import Jogo from './components/grupos/gerenciar/jogos/Jogo';
import Escalacao from './components/grupos/gerenciar/jogos/Escalacao';
import Ausentes from './components/grupos/gerenciar/jogos/Ausentes';
import JogoG from './components/grupos/gerenciar/admin/gerenciar/JogoG';
import EscalacaoG from './components/grupos/gerenciar/admin/gerenciar/EscalacaoG';
import AusentesG from './components/grupos/gerenciar/admin/gerenciar/AusentesG';
import Gerenciar from './components/grupos/gerenciar/admin/gerenciar/Gerenciar';
import ImagensJogos from './components/grupos/gerenciar/admin/gerenciar/ImagensJogos';
import Plus from './components/grupos/gerenciar/plus/Plus';
import Notifications from './components/grupos/gerenciar/plus/Notifications';
import Jogadores from './components/grupos/gerenciar/admin/jogadores/Jogadores';
import SearchBar from './tools/searchbar/SearchBar';
import Convites from './components/convites/Convites';

const AnimatedSceneComp = Animated.createAnimatedComponent(AnimatedScene);

class Routes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            logged: false,
            loading: true,
            timingNotEnd: true
        };

        this.animHideBar = new Animated.Value(0);

        StatusBar.setHidden(false);
    }

    componentDidMount = () => {
        //setTimeout(() => this.setState({ timingNotEnd: false }), 10000);

        this.checkLogin();

        DeviceEventEmitter.removeAllListeners('hardwareBackPress');
        DeviceEventEmitter.addListener('hardwareBackPress', this.onBackButton);

        Dimensions.addEventListener('change', this.onDimensionsChange);
    }

    shouldComponentUpdate = (nextProps, nextStates) => {
        if (nextProps.animatedHeigth !== this.props.animatedHeigth) {
            this.doTabAnimation(nextProps.animatedHeigth);
            return false;
        }

        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.onDimensionsChange);
    }

    onDimensionsChange = (dim) => {
        if (isPortrait()) {
            const isComentUp = store.getState().InfosReducer.startUpOrDownAnim === 'up';
            
            if (!this.state.timingNotEnd) {
                StatusBar.setHidden(false);
            }
            
            if (!isComentUp) {
                this.doTabAnimation(false);
            }
        } else {
            if (!this.state.timingNotEnd) {
                StatusBar.setHidden(true);
            }

            Animated.timing(
                this.animHideBar, 
                {
                    toValue: dim.screen.height,
                    useNativeDriver: true,
                    delay: 200
                }
            ).start();
        } 
    }

    onBackButton = () => {
        Keyboard.dismiss();

        if (!Actions.currentScene) return true;
        
        if (!('|listLikes|'.includes(Actions.currentScene))) this.cleanModals();
    
        if ('|gerenciarGrupo|_jogos|_informativos|_perfil|_plus|_admin|'
        .includes(Actions.currentScene)) {
            Actions.popTo('_cadastroGrupos');
            return true;
        }
    
        if (!('_'.includes(Actions.currentScene[0]))) {
            Actions.pop();
            return true;
        }
    
        if (
            Actions.currentScene.includes('jogo') || 
            Actions.currentScene.includes('escalacao')
        ) {
            if ('|_jogoTab|_escalacaoTab|'.includes(Actions.currentScene)) {
                Actions.popTo('_jogos');
                return true;
            }
            if ('|_jogoTabG|_escalacaoTabG|'.includes(Actions.currentScene)) {
                Actions.popTo('gerenciar');
                return true;
            }
            if ('|_jogoTabH|_escalacaoTabH|'.includes(Actions.currentScene)) {
                Actions.popTo('historico');
                return true;
            }
            if ('|_jogoTabP|_escalacaoTabP|'.includes(Actions.currentScene)) {
                Actions.popTo('profileHistorico');
                return true;
            }
        }
    
        if ('|_financeiroCadastrar|_financeiroEditar|'.includes(Actions.currentScene)) {
            Actions.popTo('analise');
            return true;
        }
    
        if ('|_enqueteCadastrar|_enqueteEditar|'.includes(
            Actions.currentScene)
            ) {
            Actions.popTo('_admin');
            return true;
        }
    
        return true;
    };
    
    cleanModals = async () => {
        store.dispatch({
            type: 'modifica_startupordownanim_info',
            payload: 'down'
        });
        store.dispatch({
            type: 'modifica_showsharemodal_info',
            payload: false
        });
        store.dispatch({
            type: 'modifica_showimageview_info',
            payload: false
        });
        store.dispatch({
            type: 'modifica_showimageview_imagensjogos',
            payload: false
        });
    };

    checkLogin = async () => {
        try {
            const isAutoLogin = await AsyncStorage.getItem(
                mappedKeyStorage('loginAutomaticoEnabled')
            );

            if (isAutoLogin && isAutoLogin === 'yes') {
                const username = await AsyncStorage.getItem(mappedKeyStorage('username'));

                if (username) {
                    const password = await AsyncStorage.getItem(mappedKeyStorage('password'));
                    
                    if (password) {
                        store.dispatch({
                            type: 'modifica_username_login',
                            payload: username
                        });
                        store.dispatch({
                            type: 'modifica_password_login',
                            payload: password
                        });

                        this.setState({
                            logged: true,
                            loading: false,
                        });
                    } else {
                        this.setState({
                            loading: false,
                        });
                    }
                } else {
                    this.setState({
                        loading: false,
                    });
                }
            } else {
                this.setState({
                    loading: false,
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    doTabAnimation = (animHideBar) => {
        if (isPortrait()) {
            if (
                animHideBar === 1 || 
                store.getState().InfosReducer.startUpOrDownAnim === 'up'
            ) {
                Animated.timing(
                    this.animHideBar, 
                    {
                        toValue: 100,
                        useNativeDriver: true,
                        delay: 200
                    }
                ).start();
            } else {
                const toValue = animHideBar ? Dimensions.get('screen').height : 0;
                Animated.spring(
                    this.animHideBar, 
                    {
                        toValue,
                        useNativeDriver: true,
                        bounciness: 2
                    }
                ).start();
            }
        }  
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
                onPress={() => {
                    const { jogoSelected } = store.getState().ImagensJogosReducer;
                    Actions.imagens({ jogo: jogoSelected });
                }}
            >
                <Icon
                    iconStyle={{ marginHorizontal: 5 }}
                    color={'white'}
                    name='folder-image'
                    type='material-community'
                    size={26}
                />
            </TouchableOpacity>
        </View>
    )

    rightButtonGerenciarTab = () => (
        <View 
            style={{
                flexDirection: 'row',
                marginHorizontal: 5,
                paddingHorizontal: 10,
                justifyContent: 'space-between'
            }}
        >
            <TouchableOpacity
                onPress={() => {
                    const { grupoSelected } = store.getState().GruposReducer;
                    const { itemSelected } = store.getState().GerenciarReducer;
                    const listJogos = grupoSelected.jogos ?
                    _.map(grupoSelected.jogos, (ita, key) => ({ key, ...ita })) : [];
                    const jogo = _.find(listJogos, (item) => item.key === itemSelected);
                    if (jogo) {
                        if (jogo.status === '1') {
                            Alert.alert(
                                'Aviso',
                                'Para alterar o tempo de jogo manualmente' +
                                ' é necessário que o jogo esteja pausado.'
                            );
                            return;
                        }
                        store.dispatch({
                            type: 'modifica_showtimermodal_jogo',
                            payload: true
                        });
                    }
                }}
            >
                <Icon
                    iconStyle={{ marginHorizontal: 5 }}
                    color={'white'}
                    name='timer'
                    type='material-community'
                    size={26}
                />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => checkConInfo(() => {
                    const state = store.getState();
                    const { grupoSelected } = store.getState().GruposReducer;
                    const { itemSelected } = store.getState().GerenciarReducer;
                    const listJogos = grupoSelected.jogos ?
                    _.map(grupoSelected.jogos, (ita, key) => ({ key, ...ita })) : [];
                    const { missedPlayers } = state.GerenciarReducer;
                    const jogo = _.find(listJogos, (item) => item.key === itemSelected);
                    
                    if (jogo) {
                        const listUsuarios = grupoSelected.participantes || [];

                        if (jogo.status === '1') {
                            Alert.alert(
                                'Aviso',
                                'Para finalizar o jogo' +
                                ' é necessário que o jogo não esteja em andamento.'
                            );
                            return;
                        }
                        Alert.alert(
                            'Atenção',
                            'Ao finalizar o jogo, o mesmo estará disponível' +
                            ' apenas em histórico. Deseja continuar ?',
                            [
                                { text: 'Cancelar', 
                                    onPress: () => true, 
                                    style: 'cancel' 
                                },
                                { 
                                    text: 'Ok', 
                                    onPress: () => checkConInfo(
                                        () => doEndGame(
                                            jogo, 
                                            firebase, 
                                            Actions, 
                                            missedPlayers, 
                                            listUsuarios,
                                            grupoSelected.key
                                        ), [], 500
                                    )
                                }
                            ]
                        );
                    }
                })}
            >
                <Image
                    source={imgFinishFlag}
                    style={{ 
                        width: 20, 
                        height: 25, 
                        tintColor: 'white',
                        marginHorizontal: 5
                    }}
                />
            </TouchableOpacity>
        </View>
    )

    renderMainScreen = () => (
        <Scene 
            key='mainscreen' 
            drawer
            hideNavBar
            contentComponent={() => (<MainDrawerMenu />)}
            initial={this.state.logged}
            type={ActionConst.RESET}
            drawerIcon={(
                <View 
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 6
                    }}
                >
                    <Icon
                        name='menu'
                        type='material-community'
                        color='white'
                        size={26}
                    />
                </View>
            )}
        >
            <Scene 
                key='cadastroGrupos'
                title={'Grupos'}
                component={Grupos}
                titleStyle={styles.title}
                inital
            />
            <Scene 
                key='minhasPartidas'
                title={'Partidas'}
                component={Partidas}
                titleStyle={styles.title}
            />
            <Scene 
                key='profile' 
                component={Profile}
                title={'Perfil'}
                titleStyle={styles.title}
            />
            <Scene 
                key='convites'
                title={'Convites'}
                component={Convites}
                titleStyle={styles.title}
            />
        </Scene>
    )

    renderGerenciarGrupoTabs = () => (
        <AnimatedSceneComp
            key={'gerenciarGrupo'}
            tabs
            lazy={false}
            swipeEnabled
            title={'Grupo'} 
            titleStyle={styles.title}
            leftButtonTextStyle={styles.btLeft}
            backButtonTintColor={'white'}
            showLabel={false}
            onBack={this.onBackButton}
            tabBarStyle={
                [styles.gerenciarGrupo, 
                { transform: [{ translateY: this.animHideBar }] }]
            }
            //renderRightButton={() => this.rightButtonGerenciarTab()}
        >
            <Scene 
                key='jogos' 
                component={Jogos} 
                hideNavBar
                onEnter={() => this.doTabAnimation(false)}
                icon={({ focused }) => (
                    <View>
                        <Icon
                            color={focused ? 'white' : 'black'}
                            name='soccer'
                            type='material-community'
                        />
                        { focused && 
                        <Text
                            style={{
                                color: focused ? 'white' : 'black',
                                fontWeight: 'bold',
                                fontFamily: 'OpenSans-Regular'
                            }}
                        >
                            Jogos
                        </Text>}
                    </View>
                )} 
            />
            <Scene 
                key='informativos' 
                component={GerenciarGrupoInfos} 
                hideNavBar
                onEnter={() => this.doTabAnimation(false)}
                icon={({ focused }) => (
                    <View>
                        <Icon
                            color={focused ? 'white' : 'black'}
                            name='clipboard'
                            type='font-awesome'
                            size={22}
                        />
                        { focused && 
                        <Text
                            style={{
                                color: focused ? 'white' : 'black',
                                fontWeight: 'bold',
                                fontFamily: 'OpenSans-Regular'
                            }}
                        >
                            Info
                        </Text>}
                    </View>
                )} 
            />
            <Scene 
                key='plus' 
                component={Plus} 
                hideNavBar
                onEnter={() => this.doTabAnimation(false)}
                icon={({ focused }) => (
                    <View>
                        <Icon
                            color={focused ? 'white' : 'black'}
                            name='google-analytics'
                            type='material-community'
                        />
                        { focused && 
                        <Text
                            style={{
                                color: focused ? 'white' : 'black',
                                fontWeight: 'bold',
                                fontFamily: 'OpenSans-Regular'
                            }}
                        >
                            Mais
                        </Text>}
                    </View>
                )} 
            />
        </AnimatedSceneComp>
    );

    renderJogoTabBar = () => (
        <Scene 
            key={'jogoTabBar'}
            tabs
            showLabel
            tabBarPosition={'top'}
            lazy={false}
            swipeEnabled
            title={'Jogo'} 
            titleStyle={styles.title}
            leftButtonTextStyle={styles.btLeft}
            backButtonTintColor={'white'}
            tabBarStyle={{ backgroundColor: colorAppSecondary }}
            labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
            renderRightButton={() => this.rightButtonImagens()}
        >
            <Scene 
                key={'jogoTab'}
                hideNavBar 
                component={Jogo}
                initial
                tabBarLabel={'Jogo'}
                activeTintColor={'white'} 
            />
            <Scene 
                key={'escalacaoTab'}
                hideNavBar 
                component={Escalacao}
                tabBarLabel={'Escalação'}
                activeTintColor={'white'} 
            />
            <Scene 
                key={'ausentesTab'}
                hideNavBar 
                component={Ausentes}
                tabBarLabel={'Ausentes'}
                activeTintColor={'white'} 
            />
        </Scene>
    )

    renderJogoGerenciarTabBar = () => (
        <Scene 
            key={'gerenciarJogoTab'}
            tabs
            showLabel
            tabBarPosition={'top'}
            lazy={false}
            swipeEnabled
            title={'Gerenciar Jogo'} 
            titleStyle={styles.title}
            leftButtonTextStyle={styles.btLeft}
            backButtonTintColor={'white'}
            tabBarStyle={{ backgroundColor: colorAppSecondary }}
            labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
            renderRightButton={() => this.rightButtonGerenciarTab()}
        >
            <Scene 
                key={'jogoTabG'}
                hideNavBar 
                component={JogoG}
                initial
                tabBarLabel={'Jogo'}
                activeTintColor={'white'}
            />
            <Scene 
                key={'escalacaoTabG'}
                hideNavBar 
                component={EscalacaoG}
                tabBarLabel={'Escalação'}
                activeTintColor={'white'}
            />
            <Scene 
                key={'ausentesTabG'}
                hideNavBar 
                component={AusentesG}
                tabBarLabel={'Ausentes'}
                activeTintColor={'white'}
            />
        </Scene>
    )

    renderRouter = () => (
        <Router>
            <Scene 
                key='root'
                navigationBarStyle={styles.header}
            >
                <Scene 
                    key='login' 
                    component={Login}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft} 
                    initial={!this.state.logged}
                    hideNavBar
                />
                {this.renderMainScreen()}
                {this.renderGerenciarGrupoTabs()}
                {this.renderJogoTabBar()}
                {this.renderJogoGerenciarTabBar()}
                <Scene 
                    key='cadastrar'
                    title={'Cadastrar'}
                    component={Cadastrar}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                />
                <Scene 
                    key='recuperarSenha'
                    title={'Recuperar Senha'}
                    component={RecuperarSenha}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                />
                <Scene 
                    key='listLikes'
                    title={'Curtidas'}
                    component={ListLikes}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                />
                <Scene 
                    key='createGroup'
                    title={'Criar Grupo'}
                    component={CreateGroup}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                />
                <Scene 
                    key='ownerMenuAdmin'
                    title={'Gerenciar Grupo'}
                    component={Admin}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                />
                <Scene 
                    key={'cadastroJogos'}
                    title={'Jogos'} 
                    component={CadastroJogos}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                />
                <Scene 
                    key={'gerenciar'}
                    title={'Gerenciar Jogos'} 
                    component={Gerenciar}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'imagens'}
                    title={'Imagens'}
                    component={ImagensJogos}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'grupoNotificacoes'}
                    title={'Notificações'} 
                    component={Notifications}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'jogadores'}
                    title={'Jogadores'} 
                    component={Jogadores}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    renderRightButton={() => <SearchBar />}
                    //initial
                />
                {/*<Scene 
                    key={'gerenciarGrupo'}
                    tabs
                    showLabel
                    tabBarPosition={'top'}
                    lazy={false}
                    swipeEnabled
                    title={'Gerenciar Grupo'} 
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    tabBarStyle={{ backgroundColor: colorAppSecondary }}
                    labelStyle={{ fontFamily: 'OpenSans-Bold', fontSize: normalize(12) }}
                    //renderRightButton={() => this.rightButtonGerenciarTab()}
                >
                     <Scene 
                        key={'gerenciarGrupoPrincipal'}
                        hideNavBar 
                        component={GerenciarGrupoPrincipal}
                        tabBarLabel={'Principal'}
                        activeTintColor={'white'}
                        initial
                    /> 
                    <Scene 
                        key={'gerenciarGrupoInfos'}
                        hideNavBar 
                        component={GerenciarGrupoInfos}
                        tabBarLabel={'Informativos'}
                        activeTintColor={'white'}
                        initial
                    />
                    <Scene 
                        key={'gerenciarGrupoParticipantes'}
                        hideNavBar 
                        component={GerenciarGrupoParticipantes}
                        tabBarLabel={'Participantes'}
                        activeTintColor={'white'}
                    />
                </Scene>*/}
            </Scene>
        </Router>
    )

    render = () => {
        /* if (this.state.loading || this.state.timingNotEnd) {
            return (
                <SplashScreenAnim />
            );
        } */

        return (
            <View style={{ flex: 1 }}>
                {this.renderRouter()}
                <DropdownAlert ref={ref => (this.dropdownalert = ref)} />
            </View>
            
        );
    }
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: colorAppSecondary,
        fontSize: 18,
        fontFamily: 'OpenSans-Regular',
        borderBottomWidth: 0,
        ...Platform.select({
            ios: {
              shadowColor: 'rgba(0,0,0, .2)',
              shadowOffset: { height: 0, width: 0 },
              shadowOpacity: 1,
              shadowRadius: 1,
            },
            android: {
              elevation: 4
            }
        })
    },
    title: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'OpenSans-Regular'
    },
    btLeft: {
        color: 'white'
    },
    gerenciarGrupo: {
        backgroundColor: colorAppSecondary,
        position: 'absolute',
        height: 50,
        left: 0,
        right: 0,
        bottom: 0,
        ...Platform.select({
            android: {
                elevation: 8,
                borderTopWidth: 1,
                borderTopColor: 'rgba(0, 0, 0, 0.4)',
            }
        })
    }
});

const mapStateToProps = (state) => ({
    animatedHeigth: state.JogosReducer.animatedHeigth,
    userLevel: state.LoginReducer.userLevel
});

export default connect(mapStateToProps)(Routes);

