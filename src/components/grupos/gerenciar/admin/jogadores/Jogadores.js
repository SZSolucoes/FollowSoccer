/* eslint-disable max-len */
import React from 'react';
import {
    ScrollView,
    View,
    Text,
    Image,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Keyboard,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';
import { connect } from 'react-redux';
import { Divider, Badge, Button, Icon } from 'react-native-elements';
import _ from 'lodash';
import Share from 'react-native-share';

import { 
    colorAppPrimary, 
    colorAppForeground, 
    colorAppSecondary, 
    ERROS,
    SHARE_INVITE
} from '../../../../../utils/Constantes';
import ListItem from '../../../../../tools/elements/ListItem';
import firebase from '../../../../../utils/Firebase';
import { retrieveUpdUserGroup } from '../../../../../utils/UserUtils';
import Card from '../../../../../tools/elements/Card';

import imgTeam from '../../../../../assets/imgs/team.png';
import { normalize } from '../../../../../utils/StrComplex';
//import ShareModal from '../../../../../tools/share/ShareModal';
import { checkConInfo, showDropdownAlert } from '../../../../../utils/SystemEvents';

class Jogadores extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
        this.debouncedUpdateList = _.debounce(this.onUpdateListInvites, 800);

        this.viewIngressed = (
            <View
                style={{ margin: 5 }}
            >
                <Text
                    style={{
                        fontFamily: 'OpenSans-SemiBold',
                        color: 'red',
                        fontSize: normalize(13)
                    }}
                >
                    Membro do grupo
                </Text>
            </View>
        );

        this.state = {
            loadingInvite: false,
            listUsuarios: [],
            listUsuariosInvite: [],
            noUsers: false
        };
    }

    componentDidUpdate = (prevProps) => {
        const { searchValue, showInputText } = this.props;

        if (showInputText && prevProps.searchValue !== searchValue) {
            if (!searchValue.trim()) {
                this.setState({ 
                    loadingInvite: false, 
                    listUsuariosInvite: [],
                    noUsers: false
                });
            }
            this.debouncedUpdateList(searchValue);
        } else if ((prevProps.searchValue !== searchValue) && !!searchValue) {
            this.setState({ 
                loadingInvite: false, 
                listUsuariosInvite: [],
                noUsers: false
            });
        }
    }

    onUpdateListInvites = (searchValue) => {
        if (!searchValue.trim()) {
            this.setState({ 
                loadingInvite: false, 
                listUsuariosInvite: [],
                noUsers: false
            });
            return;
        }

        this.setState({ 
            loadingInvite: true, 
            listUsuariosInvite: [],
            noUsers: false
        });

        const { grupoSelected, userLogged } = this.props;
        const convites = _.values(grupoSelected.convites);

        this.dbFirebaseRef
        .child('usuarios')
        .once('value', snap => {
            if (snap) {
                const snapVal = snap.val();
                if (snapVal) {
                    const toLowerSearchValue = searchValue.toLowerCase().trim();
                    const mappedUsers = _.map(snapVal, (ita, key) => ({ key, ...ita }));

                    const filtredByValue = _.filter(mappedUsers, itc => (
                        (itc.nome && itc.nome.toLowerCase().includes(toLowerSearchValue)) ||
                        (itc.email && itc.email.toLowerCase().includes(toLowerSearchValue))
                    ));

                    const filtreByParticip = _.filter(filtredByValue, itb => {
                        if (itb.key === userLogged.key) return false;

                        const findedGrupoConvites = _.findIndex(convites, itba => (
                            itba.key && (itba.key === itb.key)
                        ));

                        if (findedGrupoConvites !== -1) return false;

                        return true;
                    });

                    this.setState({ 
                        loadingInvite: false, 
                        listUsuariosInvite: filtreByParticip,
                        noUsers: filtreByParticip.length === 0
                    });

                    return;
                }
            }

            this.setState({ loadingInvite: false, listUsuariosInvite: [], noUsers: false });
        });
    }

    onSendInvite = async (user, index) => {
        const { grupoSelected } = this.props;
        const funExec = async () => {
            let ret = false;
            
            ret = await this.dbFirebaseRef.child(`usuarios/${user.key}/convites`)
            .update({
                [grupoSelected.key]: { groupKey: grupoSelected.key }
            })
            .then(() => true)
            .catch(() => false);

            if (ret) {
                ret = await this.dbFirebaseRef
                .child(`grupos/${grupoSelected.key}/convites`)
                .update({
                    [user.key]: { key: user.key }
                })
                .then(() => true)
                .catch(() => false);
            }

            if (ret) {
                const splicedList = [...this.state.listUsuariosInvite];

                splicedList.splice(index);

                this.setState({ 
                    listUsuariosInvite: splicedList,
                    noUsers: false
                });
                
                showDropdownAlert(
                    'success',
                    'Convite enviado',
                    ''
                );
            } else {
                showDropdownAlert(
                    'error',
                    ERROS.groupInvite.erro,
                    ERROS.groupInvite.mes
                );
            }
        };

        Alert.alert(
            'Aviso', 
            `Confirma o convite para o jogador\n(${user.nome}) ?`,
            [
                { text: 'Cancelar', onPress: () => false },
                { 
                    text: 'Sim', 
                    onPress: () => checkConInfo(funExec) 
                }
            ],
            { cancelable: true }
        );
    }

    onRemovePlayer = (item) => {
        try {
            const asyncFunExec = async () => {
                const { grupoSelected } = this.props;
                let ret = false;

                ret = await this.dbFirebaseRef
                .child(`grupos/${grupoSelected.key}/participantes/${item.key}`)
                .remove().then(() => true).catch(() => false);

                if (ret) {
                    ret = await this.dbFirebaseRef
                    .child(`usuarios/${item.key}/grupos/${grupoSelected.key}`)
                    .remove().then(() => true).catch(() => false);
                }
    
                if (ret) {
                    showDropdownAlert(
                        'success',
                        'Sucesso',
                        'Jogador removido do grupo'
                    );
                } else {
                    showDropdownAlert(
                        'error',
                        ERROS.groupPlayersRemove.erro,
                        ERROS.groupPlayersRemove.mes
                    );
                }
            };

            Alert.alert(
                'Aviso',
                `Confirma a remoção do jogador:\n(${item.nome}) ?`,
                [
                    {
                        text: 'Sim',
                        onPress: () => checkConInfo(() => asyncFunExec())
                    },
                    {
                        text: 'Cancelar',
                        onPress: () => false,
                    },
                ],
              { cancelable: true },
            );
        } catch (e) {
            console.log(e);
        }
    }

    onRenderRightIconInvite = (
        listUsuarios,
        ita,
        index
    ) => {
        const findedPartic = _.findIndex(listUsuarios, itba => (
            itba.key === ita.key
        ));
        
        if (findedPartic !== -1) return this.viewIngressed;

        return (
            <TouchableOpacity
                onPress={() => this.onSendInvite(ita, index)}
            >
                <Icon
                    name='email' 
                    type='material-community' 
                    size={30} color={colorAppSecondary} 
                />  
            </TouchableOpacity>
        );
    }

    onRederRightIconPlayers = (
        ita,
        index,
        userKey
    ) => (
        ita.key !== userKey ?
        (
            <TouchableOpacity
                onPress={() => this.onRemovePlayer(ita, index)}
            >
                <Icon
                    name='delete' 
                    type='material-community' 
                    size={30} color={'red'} 
                />  
            </TouchableOpacity>
        )  
        :
        (<View />)
    )

    render = () => {
        const { grupoSelected, showInputText, searchValue, userLogged } = this.props;
        let userKey = '';

        let listUsuarios = grupoSelected.participantes ? 
        _.values(grupoSelected.participantes) : [];

        listUsuarios = _.orderBy(listUsuarios, ['nome'], ['asc']);

        if (showInputText) {
            if (this.state.loadingInvite) {
                return (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size={'large'} color={colorAppPrimary} />
                    </View>
                );
            }

            if (this.state.noUsers && !!searchValue) {
                return (
                    <TouchableWithoutFeedback
                        onPress={() => Keyboard.dismiss()}
                    >
                        <View style={{ flex: 1 }}>
                            <ScrollView
                                style={{ flex: 1 }}
                                contentContainerStyle={{
                                    flexGrow: 1
                                }}
                            >
                                <Card
                                    title={'Jogador não encontrado'}
                                    titleStyle={{
                                        fontFamily: 'OpenSans-Bold',
                                        fontSize: 16
                                    }}
                                >
                                    <Text 
                                        style={{
                                            fontFamily: 'OpenSans-Regular',
                                            fontSize: normalize(13),
                                            color: 'black',
                                            fontWeight: '400',
                                            textAlign: 'center'
                                        }}
                                    >
                                        Deseja convidar um jogador ainda não cadastrado 
                                        para participar do grupo ?
                                    </Text>
                                    <Button
                                        backgroundColor='#03A9F4'
                                        buttonStyle={{
                                            borderRadius: 0,
                                            marginTop: 10, 
                                            marginLeft: 0, 
                                            marginRight: 0, 
                                            marginBottom: 0
                                        }}
                                        title={'Convidar'}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            Share.open(
                                                {
                                                    title: SHARE_INVITE.shareTitle,
                                                    message: `${SHARE_INVITE.shareMessage}${grupoSelected.groupInviteKey}\n\n`,
                                                    url: SHARE_INVITE.fullUrls,
                                                    subject: SHARE_INVITE.shareSubject
                                                }
                                            ).then(() => true).catch(() => false);
                                        }}
                                        fontFamily='OpenSans-SemiBold'
                                    />
                                </Card>
                            </ScrollView>
                            {/* <ShareModal
                                ref={ref => (this.shareModalRef = ref)}
                                shareOptions={{
                                    title: SHARE_INVITE.shareTitle,
                                    message: `${SHARE_INVITE.shareMessage}${grupoSelected.groupInviteKey}\n`,
                                    url: SHARE_INVITE.shareUrl,
                                    subject: SHARE_INVITE.shareSubject
                                }}
                                twitter
                                facebook
                                messenger
                                whatsapp
                                email
                                clipboard
                            /> */}
                        </View>
                    </TouchableWithoutFeedback>
                );
            }

            const listUsuariosInvite = _.orderBy(this.state.listUsuariosInvite, ['nome'], ['asc']);
            
            return (
                <ScrollView
                    contentContainerStyle={{ 
                        flexGrow: 1, 
                        padding: 2
                    }}
                >
                    {
                        _.map(listUsuariosInvite, (ita, index) => {
                            const updatedImg = retrieveUpdUserGroup(
                                ita.key, 
                                'imgAvatar', 
                                ita
                            );
                            const imgAvt = updatedImg ? 
                            { uri: updatedImg } : { uri: '' };

                            const nome = retrieveUpdUserGroup(
                                ita.key, 
                                'nome', 
                                ita
                            );
                            const email = retrieveUpdUserGroup(
                                ita.key, 
                                'email', 
                                ita
                            );
                            const posicao = retrieveUpdUserGroup(
                                ita.key, 
                                'posicao', 
                                ita
                            );

                            return (
                                <Card
                                    key={index}
                                    containerStyle={{
                                        padding: 5,
                                        margin: 5
                                    }}
                                >
                                    <ListItem
                                        avatar={imgAvt}
                                        title={nome}
                                        titleStyle={{
                                            fontWeight: '500'
                                        }}
                                        containerStyle={{
                                            borderBottomWidth: 0
                                        }}
                                        rightIcon={this.onRenderRightIconInvite(
                                            listUsuarios,
                                            ita,
                                            index
                                        )}
                                    />
                                    <Divider />
                                    <View
                                        style={{ padding: 5 }}
                                    >
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.cardTextUsersBold}>
                                                {'Email: '} 
                                            </Text>
                                            <Text 
                                                selectable
                                                style={styles.cardTextUsersSemiBold}
                                            >
                                                {email}
                                            </Text>
                                        </View>
                                        <View style={{ marginVertical: 2 }} />
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.cardTextUsersBold}>
                                                {'Posição: '} 
                                            </Text>
                                            <Text 
                                                selectable
                                                style={styles.cardTextUsersSemiBold}
                                            >
                                                {posicao}
                                            </Text>
                                        </View>
                                    </View>
                                </Card>
                            );
                        })
                    }
                    <View style={{ marginBottom: 50 }} />
                </ScrollView>
            );
        }

        if (!(listUsuarios.length > 0)) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size={'large'} color={colorAppPrimary} />
                </View>
            );
        } 

        if (userLogged && userLogged.key) {
            userKey = userLogged.key;
        }

        return (
            <View
                style={{ flex: 1 }}
            >
                <View
                    style={{
                        flex: 1.5
                    }}
                >
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                            flexGrow: 1,
                            backgroundColor: colorAppForeground
                        }}
                    >
                        <Card>
                            <Text 
                                style={{
                                    fontFamily: 'OpenSans-Regular',
                                    fontSize: normalize(13),
                                    color: 'black',
                                    fontWeight: '400',
                                    textAlign: 'center'
                                }}
                            >
                                Deseja convidar um jogador ainda não cadastrado 
                                para participar do grupo ?
                            </Text>
                            <Button
                                backgroundColor='#03A9F4'
                                buttonStyle={{
                                    borderRadius: 0,
                                    marginTop: 10, 
                                    marginLeft: 0, 
                                    marginRight: 0, 
                                    marginBottom: 0
                                }}
                                title={'Convidar'}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    Share.open(
                                        {
                                            title: SHARE_INVITE.shareTitle,
                                            message: `${SHARE_INVITE.shareMessage}${grupoSelected.groupInviteKey}\n\n`,
                                            url: SHARE_INVITE.fullUrls,
                                            subject: SHARE_INVITE.shareSubject
                                        }
                                    ).then(() => true).catch(() => false);
                                }}
                                fontFamily='OpenSans-SemiBold'
                            />
                        </Card>
                        <View style={{ marginBottom: 50 }} />
                    </ScrollView>
                </View>
                <View
                    style={{
                        flex: 3
                    }}
                >
                    <View 
                        style={styles.titleContainer}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image 
                                style={{ height: 45, width: 45, marginRight: 10 }}
                                resizeMode={'stretch'}
                                source={imgTeam} 
                            /> 
                            <Text 
                                style={{ 
                                    fontSize: 16, 
                                    color: 'black',
                                    fontFamily: 'OpenSans-Regular'
                                }}
                            >
                                Jogadores
                            </Text>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Badge value={listUsuarios.length} />
                            </View>
                        </View>
                    </View>
                    <ScrollView
                        contentContainerStyle={{ 
                            flexGrow: 1, 
                            padding: 2
                        }}
                    >
                        {
                            _.map(listUsuarios, (ita, index) => {
                                const updatedImg = retrieveUpdUserGroup(
                                    ita.key, 
                                    'imgAvatar', 
                                    ita
                                );
                                const imgAvt = updatedImg ? 
                                { uri: updatedImg } : { uri: '' };

                                const nome = retrieveUpdUserGroup(
                                    ita.key, 
                                    'nome', 
                                    ita
                                );
                                const email = retrieveUpdUserGroup(
                                    ita.key, 
                                    'email', 
                                    ita
                                );
                                const posicao = retrieveUpdUserGroup(
                                    ita.key, 
                                    'posicao', 
                                    ita
                                );

                                return (
                                    <Card
                                        key={index}
                                        containerStyle={{
                                            padding: 5,
                                            margin: 5
                                        }}
                                    >
                                        <ListItem
                                            avatar={imgAvt}
                                            title={nome}
                                            titleStyle={{
                                                fontWeight: '500'
                                            }}
                                            containerStyle={{
                                                borderBottomWidth: 0
                                            }}
                                            rightIcon={this.onRederRightIconPlayers(
                                                ita,
                                                index,
                                                userKey
                                            )}
                                        />
                                        <Divider />
                                        <View
                                            style={{ padding: 5 }}
                                        >
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.cardTextUsersBold}>
                                                    {'Email: '} 
                                                </Text>
                                                <Text 
                                                    selectable
                                                    style={styles.cardTextUsersSemiBold}
                                                >
                                                    {email}
                                                </Text>
                                            </View>
                                            <View style={{ marginVertical: 2 }} />
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.cardTextUsersBold}>
                                                    {'Posição: '} 
                                                </Text>
                                                <Text 
                                                    selectable
                                                    style={styles.cardTextUsersSemiBold}
                                                >
                                                    {posicao}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card>
                                );
                            })
                        }
                        <View style={{ marginBottom: 50 }} />
                    </ScrollView>
                </View>
                {/* <ShareModal
                    ref={ref => (this.shareModalRef = ref)}
                    shareOptions={{
                        title: SHARE_INVITE.shareTitle,
                        message: `${SHARE_INVITE.shareMessage}${grupoSelected.groupInviteKey}\n`,
                        url: SHARE_INVITE.shareUrl,
                        subject: SHARE_INVITE.shareSubject
                    }}
                    twitter
                    facebook
                    messenger
                    whatsapp
                    email
                    clipboard
                /> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    },
    cardTextUsersSemiBold: {
        fontFamily: 'OpenSans-SemiBold',
    },
    cardTextUsersBold: {
        fontFamily: 'OpenSans-Bold',
        color: '#43484d'
    }
});

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoParticipantes: state.GruposReducer.grupoParticipantes,
    userLogged: state.LoginReducer.userLogged,
    showInputText: state.SearchBarReducer.showInputText,
    searchValue: state.SearchBarReducer.searchValue
});

export default connect(mapStateToProps)(Jogadores);
