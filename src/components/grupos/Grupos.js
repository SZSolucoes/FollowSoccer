/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import { 
    View,
    StyleSheet,
    Animated,
    ActivityIndicator,
    TouchableOpacity,
    AsyncStorage
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
    colorAppPrimary 
} from '../../utils/Constantes';

import firebase from '../../utils/Firebase';
import AvatarSync from './AvatarSync';
import Card from '../../tools/elements/Card';

import { modificaGrupoSelected } from './GruposActions';
import { mappedKeyStorage } from '../../utils/Storage';

import imgSoccerGroup from '../../assets/imgs/soccergroup.jpg';

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
        position: 1,
    }, 
    /* {
        text: 'Language',
        icon: null,
        name: 'bt_language',
        position: 2
    },  */
];

class Grupos extends React.Component {
    constructor(props) {
        super(props);

        this.renderGroup = this.renderGroup.bind(this);
        this.onScrollFlatList = this.onScrollFlatList.bind(this);
        this.onChooseOptionFloatBtn = this.onChooseOptionFloatBtn.bind(this);

        this.scrollY = new Animated.Value(0);
        this.scrollYCurrentOffset = 0;
        this.floatBtnPositionYAnim = new Animated.Value(0);
        this.inAnimation = false;
        this.firebaseGroupListeners = [];
        this.fbDatabaseRef = firebase.database().ref();

        this.state = {
            groups: [],
            loading: true
        };
    }

    componentDidMount = () => {
        const { userLogged } = this.props;

        if (userLogged && userLogged.key) {
            this.onInitializeListeners();
        }

        this.scrollY.addListener(value => {
            if (value.value <= 5) {
                Animated.spring(this.floatBtnPositionYAnim, {
                    useNativeDriver: true,
                    toValue: 0,
                    bounciness: 8
                }).start();
            }
        });
    }

    componentDidUpdate = (prevProps) => {
        const { userLogged } = this.props;
        const userLoggedEqualGrupos = _.isEqual(prevProps.userLogged.grupos, userLogged.grupos);

        if (!userLoggedEqualGrupos) this.onInitializeListeners();
    }

    componentWillUnmount = () => {
        this.removeFbListeners();
    }

    onInitializeListeners = () => {
        const { userLogged } = this.props;

        // ######### FETCH GROUPS ################
        const filtredGroupKeys = _.filter(userLogged.grupos, ita => ita.groupKey);
        const numGroups = filtredGroupKeys.length;

        const newGroups = _.filter(this.state.groups, itd => {
            if (_.findIndex(filtredGroupKeys, itf => itf.groupKey === itd.key) === -1) {
                return false;
            }

            return true;
        });

        this.setState({ groups: newGroups });

        if (numGroups) {
            this.removeFbListeners();

            const asyncFunExec = async () => {
                for (let index = 0; index < numGroups; index++) {
                    const element = filtredGroupKeys[index];
                    const dbGroupsRef = this.fbDatabaseRef
                    .child(`grupos/${element.groupKey}`);
                    
                    dbGroupsRef.on('value', (snapshot) => {
                        const snapVal = snapshot ? snapshot.val() : null;
            
                        if (snapVal) {
                            const indexF = _.findIndex(
                                this.state.groups, itb => itb.key === element.groupKey
                            );

                            const newState = [...this.state.groups];

                            if (indexF !== -1) {
                                newState[indexF] = { key: element.groupKey, ...snapVal };
                            } else {
                                newState.push({ key: element.groupKey, ...snapVal });
                            }

                            this.setState({ groups: newState, loading: false });
                        } else {
                            const indexF = _.findIndex(
                                this.state.groups, itc => itc.key === element.groupKey
                            );

                            const newState = [...this.state.groups];

                            if (indexF !== -1) {
                                newState.splice(indexF, 1);
                            }

                            this.setState({ groups: newState, loading: false });
                        }
                    });
                    
                    this.firebaseGroupListeners.push(dbGroupsRef);
                }
            };

            asyncFunExec();
        } else {
            this.setState({ loading: false });
        }

        // ######### UPDATE TOKEN NOTIFICATION ################
        const userNode = this.fbDatabaseRef.child(`usuarios/${userLogged.key}`);
            
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
        });
    }

    onChooseOptionFloatBtn = (btnName) => {
        switch (btnName) {
            case 'bt_creategroup':
                Actions.createGroup();
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
                <View 
                    style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginVertical: 5
                    }}
                >
                    {
                        _.map(participantes, (mprtc, index) => (
                            <AvatarSync
                                key={index}
                                keyUser={mprtc.key}
                            />
                        ))
                    }
                </View>
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
                                    let rightView = () => <View />;
                                    if (this.props.userLogged.key === item.userowner) {
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
                                    this.props.modificaGrupoSelected(item);
                                    Actions.gerenciarGrupo({
                                        right: rightView
                                    });
                                }}
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
                    data={this.state.groups}
                    renderItem={this.renderGroup}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={(<View style={{ marginVertical: 50 }} />)}
                    scrollEventThrottle={16}
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
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {
    modificaGrupoSelected 
})(Grupos);
