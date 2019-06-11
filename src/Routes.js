/* eslint-disable max-len */
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

import SplashScreenAnim from './components/login/SplashScreenAnim';
import MainDrawerMenu from './components/drawersmenu/MainDrawerMenu';

import Login from './components/login/Login';
import Profile from './components/profile/Profile';
import Cadastrar from './components/login/Cadastrar';
import RecuperarSenha from './components/login/RecuperarSenha';
import Grupos from './components/grupos/Grupos';
import CreateGroup from './components/grupos/CreateGroup';
//import GerenciarGrupoPrincipal from './components/grupos/gerenciar/GerenciarGrupoPrincipal';
import GerenciarGrupoInfos from './components/grupos/gerenciar/GerenciarGrupoInfos';
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
import Info from './components/grupos/gerenciar/admin/informativos/Info';
import MuralCadastrar from './components/grupos/gerenciar/admin/mural/MuralCadastrar';
import MuralEditar from './components/grupos/gerenciar/admin/mural/MuralEditar';
import FinanceiroCadastrar from './components/grupos/gerenciar/admin/financeiro/grupo/FinanceiroCadastrar';
import FinanceiroEditar from './components/grupos/gerenciar/admin/financeiro/grupo/FinanceiroEditar';
import EnqueteCadastrar from './components/grupos/gerenciar/admin/enquetes/EnqueteCadastrar';
import EnqueteEditar from './components/grupos/gerenciar/admin/enquetes/EnqueteEditar';
import EditPerfil from './components/profile/EditPerfil';
import ProfileEnquetes from './components/grupos/gerenciar/plus/enquetes/ProfileEnquetes';
import ProfileEnquetesHistorico from './components/grupos/gerenciar/plus/enquetes/ProfileEnquetesHistorico';
import GrupoFinanceiro from './components/grupos/gerenciar/plus/GrupoFinanceiro';
import AnaliseJogadores from './components/grupos/gerenciar/plus/jogadores/AnaliseJogadores';
import Historico from './components/grupos/gerenciar/plus/historico/Historico';
import JogoH from './components/grupos/gerenciar/plus/historico/JogoH';
import EscalacaoH from './components/grupos/gerenciar/plus/historico/EscalacaoH';
import AusentesH from './components/grupos/gerenciar/plus/historico/AusentesH';
import Mural from './components/grupos/gerenciar/plus/mural/Mural';
import Preferencias from './components/profile/Preferencias';
import Modalidades from './components/profile/esportes/Modalidades';
import EditGroup from './components/grupos/gerenciar/admin/configadmin/EditGroup';
import MenuGroup from './components/grupos/gerenciar/admin/configadmin/MenuGroup';
import ParamsGroup from './components/grupos/gerenciar/admin/configadmin/ParamsGroup';
import Pontuacao from './components/grupos/gerenciar/plus/pontuacao/Pontuacao';
import PontuacaoHistorico from './components/grupos/gerenciar/plus/pontuacao/PontuacaoHistorico';
import FinanceiroMenu from './components/grupos/gerenciar/admin/financeiro/FinanceiroMenu';
import FinanceiroJogadores from './components/grupos/gerenciar/admin/financeiro/jogadores/FinanceiroJogadores';
import FinanceiroPlayersView from './components/grupos/gerenciar/plus/financeiro/FinanceiroPlayersView';

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
        setTimeout(() => this.setState({ timingNotEnd: false }), 6000);

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
    
        if ('|gerenciarGrupo|_jogos|_informativos|_perfil|_plus|'
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
            Actions.popTo('adminFinanceiroMenu');
            return true;
        }
    
        if ('|_muralCadastrar|_muralEditar|'.includes(Actions.currentScene)) {
            Actions.popTo('ownerMenuAdmin');
            return true;
        }
        
        if ('|_enqueteCadastrar|_enqueteEditar|'.includes(Actions.currentScene)) {
            Actions.popTo('ownerMenuAdmin');
            return true;
        }

        if ('|_configMenu|_configEdit|'.includes(Actions.currentScene)) {
            Actions.popTo('ownerMenuAdmin');
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
                        const listUsuarios = _.values(grupoSelected.participantes) || [];

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
                                            grupoSelected.key,
                                            grupoSelected.parametros,
                                            grupoSelected.participantes
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
                renderRightButton={
                    () => 
                    <SearchBar 
                        inputPlaceHolder={'Filtrar grupo...'}
                        iconName={'filter-outline'}
                        iconNameWithValue={'filter'}
                    />
                }
                inital
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
            titleStyle={styles.titlesmall}
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
                        <Text
                            style={{
                                color: focused ? 'white' : 'black',
                                fontFamily: focused ? 'OpenSans-Bold' : 'OpenSans-SemiBold'
                            }}
                        >
                            Jogos
                        </Text>
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
                            name='monitor-dashboard'
                            type='material-community'
                        /> 
                        <Text
                            style={{
                                color: focused ? 'white' : 'black',
                                fontFamily: focused ? 'OpenSans-Bold' : 'OpenSans-SemiBold'
                            }}
                        >
                            Informativos
                        </Text>
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
                        <Text
                            style={{
                                color: focused ? 'white' : 'black',
                                fontFamily: focused ? 'OpenSans-Bold' : 'OpenSans-SemiBold'
                            }}
                        >
                            Mais
                        </Text>
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

    renderMuralAdmin = () => (
        <Scene 
            key={'muralAdmin'}
            tabs
            showLabel
            tabBarPosition={'top'}
            lazy={false}
            swipeEnabled
            title={'Mural'}
            titleStyle={styles.title}
            leftButtonTextStyle={styles.btLeft}
            backButtonTintColor={'white'}
            tabBarStyle={{ backgroundColor: colorAppSecondary }}
            labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
            //renderRightButton={() => this.rightButtonGerenciarTab()}
        >
            <Scene 
                key={'muralCadastrar'}
                hideNavBar 
                component={MuralCadastrar}
                initial
                tabBarLabel={'Incluir'}
                activeTintColor={'white'}
            />
            <Scene 
                key={'muralEditar'}
                hideNavBar 
                component={MuralEditar}
                tabBarLabel={'Visualizar'}
                activeTintColor={'white'}
            />
        </Scene>
    )

    renderFinanceiroAdmin = () => (
        <Scene 
            key={'financeiroAdmin'}
            tabs
            showLabel
            tabBarPosition={'top'}
            lazy={false}
            swipeEnabled
            title={'Financeiro - Grupo'} 
            titleStyle={styles.titlesmall}
            leftButtonTextStyle={styles.btLeft}
            backButtonTintColor={'white'}
            tabBarStyle={{ backgroundColor: colorAppSecondary }}
            labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
            //renderRightButton={() => this.rightButtonGerenciarTab()}
        >
            <Scene 
                key={'financeiroCadastrar'}
                hideNavBar 
                component={FinanceiroCadastrar}
                initial
                tabBarLabel={'Incluir'}
                activeTintColor={'white'}
            />
            <Scene 
                key={'financeiroEditar'}
                hideNavBar 
                component={FinanceiroEditar}
                tabBarLabel={'Visualizar'}
                activeTintColor={'white'}
            />
        </Scene>
    )

    renderEnquetesAdmin = () => (
        <Scene 
            key={'adminEnquetes'}
            tabs
            showLabel
            tabBarPosition={'top'}
            lazy={false}
            swipeEnabled
            title={'Enquetes'} 
            titleStyle={styles.title}
            leftButtonTextStyle={styles.btLeft}
            backButtonTintColor={'white'}
            tabBarStyle={{ backgroundColor: colorAppSecondary }}
            labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
            //renderRightButton={() => this.rightButtonGerenciarTab()}
        >
            <Scene 
                key={'enqueteCadastrar'}
                hideNavBar 
                component={EnqueteCadastrar}
                initial
                tabBarLabel={'Incluir'}
                activeTintColor={'white'}
            />
            <Scene 
                key={'enqueteEditar'}
                hideNavBar 
                component={EnqueteEditar}
                tabBarLabel={'Visualizar'}
                activeTintColor={'white'}
            />
        </Scene>
    )

    renderHistoricoJogo = () => (
        <Scene 
            key={'historicoJogoTab'}
            tabs
            showLabel
            tabBarPosition={'top'}
            lazy={false}
            swipeEnabled
            title={'Histórico de Jogo'} 
            titleStyle={styles.title}
            leftButtonTextStyle={styles.btLeft}
            backButtonTintColor={'white'}
            tabBarStyle={{ backgroundColor: colorAppSecondary }}
            labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
            renderRightButton={() => this.rightButtonImagens()}
        >
            <Scene 
                key={'jogoTabH'}
                hideNavBar 
                component={JogoH}
                initial
                tabBarLabel={'Jogo'}
                activeTintColor={'white'}
            />
            <Scene 
                key={'escalacaoTabH'}
                hideNavBar 
                component={EscalacaoH}
                tabBarLabel={'Escalação'}
                activeTintColor={'white'}
            />
            <Scene 
                key={'ausentesTabH'}
                hideNavBar 
                component={AusentesH}
                tabBarLabel={'Ausentes'}
                activeTintColor={'white'}
            />
        </Scene>
    )

    renderConfigAdmin = () => (
        <Scene 
            key={'configAdmin'}
            tabs
            showLabel
            tabBarPosition={'top'}
            lazy={false}
            swipeEnabled
            title={'Administrativo'}
            titleStyle={styles.title}
            leftButtonTextStyle={styles.btLeft}
            backButtonTintColor={'white'}
            tabBarStyle={{ backgroundColor: colorAppSecondary }}
            labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
        >
            <Scene 
                key={'configMenu'}
                hideNavBar 
                component={MenuGroup}
                tabBarLabel={'Menu'}
                activeTintColor={'white'}
                initial
            />
            <Scene 
                key={'configEdit'}
                hideNavBar 
                component={EditGroup}
                tabBarLabel={'Editar'}
                activeTintColor={'white'}
            />
            <Scene 
                key={'configParams'}
                hideNavBar 
                component={ParamsGroup}
                tabBarLabel={'Pontos'}
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
                {this.renderMuralAdmin()}
                {this.renderFinanceiroAdmin()}
                {this.renderEnquetesAdmin()}
                {this.renderHistoricoJogo()}
                {this.renderConfigAdmin()}
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
                    renderRightButton={
                        () => 
                        <SearchBar
                            inputPlaceHolder={'Buscar jogador...'}
                            iconName={'account-plus'}
                        />
                    }
                    //initial
                />
                <Scene 
                    key={'cadastroInfos'}
                    title={'Informativos'} 
                    component={Info}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'profileEditPerfil'}
                    title={'Editar Perfil'} 
                    component={EditPerfil}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'profileEnquetes'}
                    title={'Enquetes'}
                    component={ProfileEnquetes}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'profileEnquetesHistorico'}
                    title={'Histórico de Enquetes'}
                    component={ProfileEnquetesHistorico}
                    titleStyle={styles.titlesmall}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'profileFinanceiro'}
                    title={'Financeiro - Grupo'}
                    component={GrupoFinanceiro}
                    titleStyle={styles.titlesmall}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'analisejogadores'}
                    title={'Histórico de Faltas'}
                    component={AnaliseJogadores}
                    titleStyle={styles.titlesmall}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'historico'}
                    title={'Histórico de Jogos'} 
                    component={Historico}
                    titleStyle={styles.titlesmall}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'mural'}
                    title={'Mural'}
                    component={Mural}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'profilePreferencias'}
                    title={'Preferências'}
                    component={Preferencias}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'profileModalidades'}
                    title={'Modalidades'}
                    component={Modalidades}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'pontuacao'}
                    title={'Pontuação'}
                    component={Pontuacao}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'pontuacaoHistorico'}
                    title={'Histórico de Pontuação'}
                    component={PontuacaoHistorico}
                    titleStyle={styles.titlesmall}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'adminFinanceiroMenu'}
                    title={'Financeiro'}
                    component={FinanceiroMenu}
                    titleStyle={styles.title}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    //initial
                />
                <Scene 
                    key={'adminFinanceiroJogadores'}
                    title={'Financeiro - Jogadores'}
                    component={FinanceiroJogadores}
                    titleStyle={styles.titlesmall}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
                    renderRightButton={
                        () => 
                        <SearchBar 
                            inputPlaceHolder={'Filtrar jogador...'}
                            iconName={'filter-outline'}
                            iconNameWithValue={'filter'}
                        />
                    }
                    //initial
                />
                <Scene 
                    key={'plusFinanceiroJogadores'}
                    title={'Financeiro - Jogadores'}
                    component={FinanceiroPlayersView}
                    titleStyle={styles.titlesmall}
                    leftButtonTextStyle={styles.btLeft}
                    backButtonTintColor={'white'}
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
        if (this.state.loading || this.state.timingNotEnd) {
            return (
                <SplashScreenAnim />
            );
        }

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
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
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
    titlesmall: {
        color: 'white',
        fontSize: normalize(14),
        textAlign: 'center',
        fontFamily: 'OpenSans-Regular'
    },
    titlevsmall: {
        color: 'white',
        fontSize: normalize(12),
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

