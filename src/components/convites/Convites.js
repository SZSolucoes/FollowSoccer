import React from 'react';
import {
    View,
    Text,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Divider } from 'react-native-elements';

import { colorAppPrimary, colorAppForeground, ERROS } from '../../utils/Constantes';
import firebase from '../../utils/Firebase';
import Card from '../../tools/elements/Card';
import { normalize } from '../../utils/StrComplex';
import { checkConInfo, showDropdownAlert } from '../../utils/SystemEvents';

class Convites extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
        this.dbUserInvitesRef = null;

        this.state = {
            loading: false,
            enabledButtons: true,
            convites: []
        };
    }

    componentDidMount = () => {
        const { userLogged } = this.props;

        if (userLogged && userLogged.key) {
            this.setState({ loading: true });

            this.startFirebaseListenerForUserInvites();
        }
    }

    componentWillUnmount = () => {
        if (this.dbUserInvitesRef) this.dbUserInvitesRef.off();
    }

    onPressAcceptGroupInvite = async (item) => {
        try {
            const asyncFunExec = async () => {
                this.setState({ enabledButtons: false });

                const { userLogged } = this.props;
                const grupos = _.filter(_.values(userLogged.grupos), ita => !ita.push);
        
                let ret = false;
        
                if (_.findIndex(grupos, itb => itb.groupKey === item.key) !== -1) {
                    showDropdownAlert(
                        'warn', 
                        'Aviso',
                        'Você já ingressou ao grupo informado'
                    );
        
                    return;
                }
                
                ret = await this.dbFirebaseRef
                .child(`grupos/${item.key}/participantes`).update({
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
                    ret = await this.dbFirebaseRef
                    .child(`usuarios/${userLogged.key}/grupos`)
                    .update({
                        [item.key]: { groupKey: item.key } 
                    }).then(() => true).catch(() => false);
                }

                if (ret) {
                    ret = await this.dbFirebaseRef
                        .child(`grupos/${item.key}/convites/${userLogged.key}`)
                        .remove().then(() => true).catch(() => false);
                }

                if (ret) {
                    ret = await this.dbFirebaseRef
                    .child(`usuarios/${userLogged.key}/convites/${item.key}`)
                    .remove().then(() => true).catch(() => false);
                }
        
                if (ret) {
                    showDropdownAlert(
                        'success',
                        'Sucesso',
                        `Você ingressou no grupo (${item.nome})`
                    );
                } else {
                    showDropdownAlert(
                        'error',
                        ERROS.groupCodeInvite.erro,
                        ERROS.groupCodeInvite.mes
                    );
                }
        
                this.setState({ enabledButtons: true });
            };

            Alert.alert(
                'Aviso',
                'Confirma a ação de aceitar o convite ?',
                [
                    {
                        text: 'Cancelar',
                        onPress: () => false,
                    },
                    {
                        text: 'Sim',
                        onPress: () => checkConInfo(() => asyncFunExec())
                    }
                ],
              { cancelable: true },
            );
        } catch (e) {
            console.log(e);

            this.setState({ enabledButtons: true });
        }
    }

    onPressRejectGroupInvite = async (item) => {
        try {
            const asyncFunExec = async () => {
                this.setState({ enabledButtons: false });
                
                const { userLogged } = this.props;
                let ret = false;

                ret = await this.dbFirebaseRef
                .child(`grupos/${item.key}/convites/${userLogged.key}`)
                .remove().then(() => true).catch(() => false);

                if (ret) {
                    ret = await this.dbFirebaseRef
                    .child(`usuarios/${userLogged.key}/convites/${item.key}`)
                    .remove().then(() => true).catch(() => false);
                }
    
                if (ret) {
                    showDropdownAlert(
                        'info',
                        'Convite recusado',
                        ''
                    );
                } else {
                    showDropdownAlert(
                        'error',
                        ERROS.groupInviteReject.erro,
                        ERROS.groupInviteReject.mes
                    );
                }
        
                this.setState({ enabledButtons: true });
            };

            Alert.alert(
                'Aviso',
                'Confirma a ação de recusar o convite ?',
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

            this.setState({ enabledButtons: true });
        }
    }

    startFirebaseListenerForUserInvites = () => {
        const { userLogged } = this.props;

        if (this.dbUserInvitesRef) this.dbUserInvitesRef.off();

        this.dbUserInvitesRef = this.dbFirebaseRef
        .child(`usuarios/${userLogged.key}/convites`)
        .on('value', async snap => {
            if (snap) {
                const snapVal = snap.val();
                if (snapVal) {
                    const filtredVals = _.filter(snapVal, ita => typeof ita === 'object');
                    const invites = [];

                    if (filtredVals.length) {
                        for (let index = 0; index < filtredVals.length; index++) {
                            const element = filtredVals[index];
                            
                            const groupSnap = await this.dbFirebaseRef
                            .child(`grupos/${element.groupKey}`).once('value');

                            if (groupSnap) {
                                const groupVal = groupSnap.val();

                                if (groupVal) invites.push({ key: element.groupKey, ...groupVal });
                            }
                        }

                        this.setState({ convites: invites, loading: false });

                        return;
                    }
                }
            }

            this.setState({ convites: [], loading: false });
        });
    }

    renderCardInvites = (item, index) => (
        <Card
            key={index}
            title={'Convite para Grupo'}
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
                {
                    'Você foi convidado para participar do grupo'
                }
            </Text>
            <View
                style={{ margin: 5 }}
            >
                <Text
                    style={{
                        fontFamily: 'OpenSans-Regular',
                        fontSize: normalize(14),
                        color: 'black',
                        fontWeight: '500',
                        textAlign: 'center'
                    }}
                >
                    {`( ${item.nome} )`}
                </Text>
            </View>
            <Divider style={{ marginVertical: 15 }} />
            <View
                style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-around' 
                }}
            >
                <TouchableOpacity
                    onPress={
                        () => 
                        this.state.enabledButtons &&
                        checkConInfo(() => this.onPressAcceptGroupInvite(item, index))
                    }
                >
                    <View>
                        <Text
                            style={[styles.textButton, { color: 'green' }]}
                        >
                            Aceitar
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={
                        () => 
                        this.state.enabledButtons &&
                        checkConInfo(() => this.onPressRejectGroupInvite(item, index))
                    }
                >
                    <View>
                        <Text
                            style={[styles.textButton, { color: 'red' }]}
                        >
                            Recusar
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Card>
    )

    render = () => {
        if (this.state.loading) {
            return (
                <View 
                    style={[styles.mainView, { alignItems: 'center', justifyContent: 'center' }]}
                >
                    <ActivityIndicator size={'large'} color={colorAppPrimary} />
                </View>
            );
        }

        return (
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {
                    _.map(this.state.convites, (ita, index) => this.renderCardInvites(ita, index))
                }
                <View style={{ marginVertical: 50 }} />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
    textButton: {
        fontFamily: 'OpenSans-SemiBold',
        fontSize: 16
    }
});

const mapStateToProps = (state) => ({
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps)(Convites);
