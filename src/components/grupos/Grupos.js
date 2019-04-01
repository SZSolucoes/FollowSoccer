/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import { 
    View,
    Animated,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import { connect } from 'react-redux';
import { FloatingAction } from 'react-native-floating-action';
import {
    Icon,
    Text,
    Button,
    Divider,
} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import Moment from 'moment';

import { 
    colorAppForeground, 
    colorAppSecondary, 
    colorAppDark, 
    colorAppPrimary, 
    ERROS
} from '../../utils/Constantes';

import firebase from '../../utils/Firebase';
import AvatarSync from './AvatarSync';
import Card from '../../tools/elements/Card';

import ModalDetails from './ModalDetails';
import {
    modificaGrupoSelected,
    modificaGrupoSelectedKey,
    modificaListenerGroups 
} from './GruposActions';

import imgSoccerGroup from '../../assets/imgs/soccergroup.jpg';
import ModalCodeGroupInput from '../../tools/modalinput/ModalCodeGroupInput';
import { showDropdownAlert, checkConInfo } from '../../utils/SystemEvents';
import refreshTokenAndHour from '../../utils/Singletons';

const floatBtnActions = [
    {
        text: 'Novo grupo',
        icon: (
            <Icon
                raised
                name='account-multiple-plus'
                type='material-community'
                color={'white'}
                containerStyle={{ backgroundColor: colorAppSecondary }}
            />
        ),
        name: 'bt_creategroup',
        color: colorAppSecondary,
        position: 1
    }, 
    {
        text: 'Ingressar por código',
        icon: (
            <Icon
                raised
                name='qrcode-edit'
                type='material-community'
                color={'white'}
                containerStyle={{ backgroundColor: colorAppSecondary }}
            />
        ),
        name: 'bt_codegroup',
        color: colorAppSecondary,
        position: 2
    }
];

class Grupos extends React.Component {
    constructor(props) {
        super(props);

        this.scrollY = new Animated.Value(0);
        this.scrollYCurrentOffset = 0;
        this.floatBtnPositionYAnim = new Animated.Value(0);
        this.inAnimation = false;
        this.firebaseGroupListeners = [];
        this.fbDatabaseRef = firebase.database().ref();

        this.state = {
            groups: [],
            loading: false,
            showModalCodeGroup: false,
            showModalDetails: false,
            grupoSelectedToDetails: {}
        };
    }

    componentDidMount = () => {
        const { userLogged } = this.props;

        if (userLogged && userLogged.key) {
            this.onInitializeListeners();
        }

        this.scrollY.addListener(value => {
            if (value.value <= 10) {
                Animated.spring(this.floatBtnPositionYAnim, {
                    useNativeDriver: true,
                    toValue: 0,
                    bounciness: 8
                }).start();
            }
        });

        this.props.modificaListenerGroups(this.onInitializeListeners);
    }

    componentDidUpdate = (prevProps) => {
        const { userLogged } = this.props;
        const userLoggedEqualGrupos = _.isEqual(prevProps.userLogged.grupos, userLogged.grupos);

        if (!userLoggedEqualGrupos) this.onInitializeListeners();
    }

    componentWillUnmount = () => {
        this.removeFbListeners();
    }

    onConfirmCodeGroup = (value) => {
        if (value) {
            this.fbDatabaseRef
            .child('grupos')
            .orderByChild('groupInviteKey')
            .equalTo(value)
            .once('value', async snap => {
                if (snap) {
                    const snapVal = snap.val();
                    if (snapVal && typeof snapVal === 'object') {
                        const snapKey = Object.keys(snapVal);
                        if (snapKey && snapKey.length) {
                            const { userLogged } = this.props;
                            const grupos = _.filter(_.values(userLogged.grupos), ita => !ita.push);

                            let ret = false;

                            if (_.findIndex(grupos, itb => itb.groupKey === snapKey[0]) !== -1) {
                                showDropdownAlert(
                                    'warn', 
                                    'Aviso',
                                    'Você já ingressou no grupo informado'
                                );

                                return;
                            }

                            ret = await snap.ref.child(`${snapKey[0]}/participantes`).update({
                                [userLogged.key]: {
                                    imgAvatar: userLogged.imgAvatar,
                                    key: userLogged.key,
                                    nome: userLogged.nome,
                                    jogoNotifCad: 'on',
                                    jogoNotifReminder: 'on',
                                    enqueteNotif: 'on',
                                    muralNotif: 'on',
                                    pontuacao: '0'
                                }
                            }).then(() => true).catch(() => false);
    
                            if (ret) {
                                ret = await this.fbDatabaseRef
                                .child(`usuarios/${userLogged.key}/grupos`)
                                .update({
                                    [snapKey[0]]: { groupKey: snapKey[0] } 
                                }).then(() => true).catch(() => false);
                            }

                            if (ret) {
                                await this.fbDatabaseRef
                                .child(`grupos/${snapKey[0]}/convites/${userLogged.key}`)
                                .remove().then(() => true).catch(() => false);

                                await this.fbDatabaseRef
                                .child(`usuarios/${userLogged.key}/convites/${snapKey[0]}`)
                                .remove();
                                
                                showDropdownAlert(
                                    'success',
                                    'Sucesso',
                                    `Você ingressou no grupo (${snapVal[snapKey[0]].nome})`
                                );
                            } else {
                                showDropdownAlert(
                                    'error',
                                    ERROS.groupCodeInvite.erro,
                                    ERROS.groupCodeInvite.mes
                                );
                            }

                            return;
                        }
                    }
                }

                showDropdownAlert(
                    'warn', 
                    'Grupo não localizado',
                    ''
                );
            });
        }
    }

    onInitializeListeners = () => {
        const { userLogged } = this.props;
        let lastGroup = 0;

        // ######### FETCH GROUPS ################
        const filtredGroupKeys = _.filter(userLogged.grupos, ita => ita.groupKey);
        const numGroups = filtredGroupKeys.length;

        const newGroups = _.filter(this.state.groups, itd => {
            if (_.findIndex(filtredGroupKeys, itf => itf.groupKey === itd.key) === -1) {
                return false;
            }

            return true;
        });

        this.setState({ groups: newGroups, loading: true });

        if (numGroups) {
            this.removeFbListeners();

            const asyncFunExec = async () => {
                for (let index = 0; index < numGroups; index++) {
                    const element = filtredGroupKeys[index];
                    const dbGroupsRef = this.fbDatabaseRef
                    .child(`grupos/${element.groupKey}`);
                    
                    // eslint-disable-next-line no-loop-func
                    dbGroupsRef.on('value', (snapshot) => {
                        const snapVal = snapshot ? snapshot.val() : null;
                        
                        lastGroup++;

                        if (snapVal) {
                            const indexF = _.findIndex(
                                this.state.groups, itb => itb.key === element.groupKey
                            );

                            const newState = [...this.state.groups];
                            
                            if (indexF !== -1) {
                                newState.splice(indexF, 1, { key: element.groupKey, ...snapVal });
                            } else {
                                newState.push({ key: element.groupKey, ...snapVal });
                            }

                            this.setState({ 
                                groups: newState
                            });
                        } else {
                            const indexF = _.findIndex(
                                this.state.groups, itc => itc.key === element.groupKey
                            );

                            const newState = [...this.state.groups];

                            if (indexF !== -1) {
                                newState.splice(indexF, 1);
                            }

                            this.setState({ 
                                groups: newState
                            });
                        }
                    });
                    
                    this.firebaseGroupListeners.push(dbGroupsRef);
                }
            };

            asyncFunExec();

            const checkRefresh = setInterval(() => {
                if (lastGroup === numGroups) {
                    this.setState({ loading: false });
                    this.clearIntervals(checkRefresh);
                }
            }, 500);
        } else {
            this.setState({ loading: false });
        }

        // ######### UPDATE TOKEN NOTIFICATION ################
        /* const userNode = this.fbDatabaseRef.child(`usuarios/${userLogged.key}`);
            
        AsyncStorage.getItem(mappedKeyStorage('userNotifToken')).then((userNotifToken) => {
            const dataAtual = Moment().format('DD/MM/YYYY HH:mm:ss');
            if (userNotifToken) {
                userNode.update({
                    dataHoraUltimoLogin: dataAtual,
                    userNotifToken
                })
                .then(() => true)
                .catch(() => true);
            } else {
                userNode.update({
                    dataHoraUltimoLogin: dataAtual
                })
                .then(() => true)
                .catch(() => true);
            }
        }); */
        refreshTokenAndHour.updateTokenAndHour(this.fbDatabaseRef, userLogged);
    }

    onChooseOptionFloatBtn = (btnName) => {
        switch (btnName) {
            case 'bt_creategroup':
                Actions.createGroup();
                break;
            case 'bt_codegroup':
                this.setState({ showModalCodeGroup: true });
                setTimeout(() => {
                    if (this.modalCodeGroupRef) this.modalCodeGroupRef.onOpenModal();
                }, 200);

                break;
            default:
        }
    }

    onScrollFlatList = (currentOffset, direction, absValue = 0) => {
        if (direction === 'up' && !this.inAnimation) {
            this.inAnimation = true;
            Animated.spring(this.floatBtnPositionYAnim, {
                useNativeDriver: true,
                toValue: 0,
                bounciness: 8
            }).start(() => { this.inAnimation = false; });
        } else if (direction === 'down' && !this.inAnimation && absValue > 5) {
            this.inAnimation = true;
            Animated.spring(this.floatBtnPositionYAnim, {
                useNativeDriver: true,
                toValue: 100,
                bounciness: 0
            }).start(() => { this.inAnimation = false; });
        }
    }

    clearIntervals = (interval) => (
        clearInterval(interval)
    )

    dataSourceControl = (grupos, filter) => {
        /* let newGroups = grupos.sort(
            (a, b) => {

                const aTime = Moment(a.dtcriacao, 'DD-MM-YYY HH:mm:ss');
                const bTime = Moment(b.dtcriacao, 'DD-MM-YYY HH:mm:ss');
                if (aTime.isAfter(bTime)) {
                    console.log('after');
                    return -1;
                } 
                if (aTime.isBefore(bTime)) {
                    console.log('before');
                    return 1;
                } 
               
                return 0;  
            }
        ); */

        let newGroups = _.orderBy(
            grupos, 
            [dt => Moment(dt.dtcriacao, 'DD-MM-YYYY HH:mm:ss')], 
            ['desc']
        );
        
        if (filter.trim()) {
            const toLowerSearchValue = filter.trim().toLowerCase();
            newGroups = _.filter(newGroups, ita =>
                ita.nome && ita.nome.toLowerCase().includes(toLowerSearchValue)
            );
        }

        return newGroups;
    }

    removeFbListeners = () => {
        if (this.firebaseGroupListeners.length) {
            for (let index = 0; index < this.firebaseGroupListeners.length; index++) {
                const element = this.firebaseGroupListeners[index];
                
                element.off();
            }

            this.firebaseGroupListeners = [];
        } 
    }

    renderGroup = ({ item }) => {
        let viewImagem = null;
        let viewParticipantes = null;

        const participantes = _.filter(item.participantes, prtc => !prtc.push);

        if (item.imgbody) {
            viewImagem = (
                <View style={{ flex: 2 }}>
                    <FastImage 
                        style={{ 
                            height: 150, 
                            width: '100%', 
                            backgroundColor: colorAppDark
                        }}
                        source={{ uri: item.imgbody }}
                    />
                </View>
            );
        } else {
            viewImagem = (
                <View style={{ flex: 2 }}>
                    <FastImage 
                        style={{ 
                            height: 150, 
                            width: '100%', 
                            backgroundColor: colorAppDark 
                        }}
                        source={imgSoccerGroup}
                    />
                </View>
            );
        }
        
        const viewTitle = (
            <View 
                style={{
                    flex: 1, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginVertical: 10
                }}
            >
                <View style={{ flex: 1 }}>
                    <View />
                </View>
                <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                    <Text
                        style={{ 
                            textAlign: 'center', 
                            fontWeight: 'bold',
                            fontSize: 16,
                            fontFamily: 'OpenSans-Bold'
                        }}
                    >
                        {item.nome}
                    </Text>
                </View>
                <View style={{ flex: 1 }} >
                    <View />
                </View>
            </View>
        );

        if (participantes.length) {
            viewParticipantes = (
                <ScrollView
                    horizontal
                    contentContainerStyle={{
                        flexGrow: 1,
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginVertical: 5
                    }}
                >
                    {
                        _.map(participantes, (mprtc, index) => (
                            <View
                                key={index}
                                style={{ 
                                    flex: 1,
                                    alignItems: 'center', 
                                    justifyContent: 'center'
                                }}
                            >
                                <AvatarSync
                                    keyUser={mprtc.key}
                                />
                            </View>
                        ))
                    }
                </ScrollView>
            );
        }

        return (
            <Card
                containerStyle={{ padding: 0 }}
            >
                <View style={{ flex: 1 }}>
                    {viewImagem}
                    <View style={{ paddingBottom: 10, paddingHorizontal: 10 }}>
                        {viewTitle}
                        <Divider style={{ marginBottom: 5 }} />
                        {viewParticipantes}
                        <Divider style={{ marginBottom: 10 }} />
                        <View style={{ flex: 1 }}>
                            <Button
                                backgroundColor='#03A9F4'
                                buttonStyle={{
                                    borderRadius: 0, 
                                    marginLeft: 0, 
                                    marginRight: 0, 
                                    marginBottom: 0
                                }}
                                title='VISUALIZAR'
                                fontFamily='OpenSans-SemiBold'
                                onPress={() => {
                                    const admins = item.groupAdmins ? 
                                    _.values(item.groupAdmins) : [];
                                    let rightView = () => <View />;
                                    if (
                                            (this.props.userLogged.key === item.userowner) ||
                                            (_.findIndex(
                                                admins, 
                                                itf => itf.key === this.props.userLogged.key
                                            ) !== -1)
                                        ) {
                                        rightView = () => (
                                            <View 
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <View style={{ marginRight: 5 }} />
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        Actions.ownerMenuAdmin()
                                                    }
                                                >
                                                    <Icon
                                                        name='teach'
                                                        type='material-community'
                                                        color={'white'}
                                                        size={32}
                                                    />
                                                </TouchableOpacity>
                                                <View style={{ marginRight: 10 }} />
                                            </View>
                                        );
                                    }
                                    this.props.modificaGrupoSelected({});
                                    this.props.modificaGrupoSelectedKey(item.key);
                                    this.removeFbListeners();
                                    setTimeout(() => Actions.gerenciarGrupo({
                                        right: rightView
                                    }), 200);
                                    setTimeout(() => this.setState({ groups: [] }), 1000);
                                }}
                            />
                            <Button
                                backgroundColor={colorAppSecondary}
                                buttonStyle={{
                                    marginTop: 5,
                                    borderRadius: 0, 
                                    marginLeft: 0, 
                                    marginRight: 0, 
                                    marginBottom: 0
                                }}
                                title='DETALHES'
                                fontFamily='OpenSans-SemiBold'
                                onPress={() => this.setState({
                                    grupoSelectedToDetails: item,
                                    showModalDetails: true
                                })}
                            />
                        </View>
                    </View>
                </View>
            </Card>
        );
    }

    render = () => (
        this.state.loading ?
        (
            <View 
                style={[styles.mainView, { alignItems: 'center', justifyContent: 'center' }]}
            >
                <ActivityIndicator size={'large'} color={colorAppPrimary} />
            </View>
        )
        :
        (
            <View 
                style={styles.mainView}
            >
                <Animated.FlatList
                    data={this.dataSourceControl(this.state.groups, this.props.searchValue)}
                    renderItem={this.renderGroup}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={(<View style={{ marginVertical: 50 }} />)}
                    scrollEventThrottle={16}
                    onRefresh={() => this.onInitializeListeners()}
                    refreshing={false}
                    onScroll={
                        Animated.event(
                            [{
                                nativeEvent: { contentOffset: { y: this.scrollY } }
                            }],
                            {
                                useNativeDriver: true,
                                listener: (event) => {
                                    const currentOffset = event.nativeEvent.contentOffset.y;
                                    const direction = currentOffset > this.scrollYCurrentOffset ? 
                                    'down' : 'up';
                                    const absValue = Math.abs(
                                        currentOffset - this.scrollYCurrentOffset
                                    );
                                    this.scrollYCurrentOffset = currentOffset;
                                    this.onScrollFlatList(currentOffset, direction, absValue);
                                }
                            }
                        )
                    }
                />
                <Animated.View 
                    style={{
                        position: 'absolute',
                        transform: [{ translateY: this.floatBtnPositionYAnim }],
                        right: 0,
                        bottom: 0,
                        top: 0,
                        left: 0
                    }}
                    pointerEvents={'box-none'}
                >
                    <FloatingAction
                        overlayColor={'rgba(68, 68, 68, 0.4)'}
                        actions={floatBtnActions}
                        color={colorAppSecondary}
                        onPressItem={(name) => this.onChooseOptionFloatBtn(name)}
                    />
                </Animated.View>
                <ModalCodeGroupInput
                    ref={ref => (this.modalCodeGroupRef = ref)}
                    isDialogVisible={this.state.showModalCodeGroup}
                    title={'Ingressar por código'}
                    message={'Informe abaixo o código de acesso ao grupo desejado.'}
                    submitInput={(value) => checkConInfo(() => this.onConfirmCodeGroup(value))}
                    closeDialog={() => this.setState({ showModalCodeGroup: false })}
                    hint={'Código do grupo'}
                    cancelText={'Cancelar'}
                    submitText={'Confirmar'}
                />
                <ModalDetails
                    showModal={this.state.showModalDetails}
                    closeModalToggle={
                        () => this.setState({ showModalDetails: !this.state.showModalDetails })
                    }
                    grupoSelectedToDetails={this.state.grupoSelectedToDetails}
                />
            </View>
        )
    )
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
});

const mapStateToProps = state => ({
    userLogged: state.LoginReducer.userLogged,
    showInputText: state.SearchBarReducer.showInputText,
    searchValue: state.SearchBarReducer.searchValue
});

export default connect(mapStateToProps, {
    modificaGrupoSelected,
    modificaGrupoSelectedKey,
    modificaListenerGroups
})(Grupos);
