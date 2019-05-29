import React from 'react';
import { 
    View,
    Alert,
    Image,
    ScrollView, 
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';

import { modifyCleanLogin } from '../../../login/LoginActions';

import ListItem from '../../../../tools/elements/ListItem';
import { colorAppSecondary, ERROS } from '../../../../utils/Constantes';
import Card from '../../../../tools/elements/Card';
import { showDropdownAlert, checkConInfo } from '../../../../utils/SystemEvents';
import firebase from '../../../../utils/Firebase';
import { store } from '../../../../App';

import imgFinishFlag from '../../../../assets/imgs/finishflag.png';
import { finishScoreGroup } from '../../../../utils/UtilsTools';

class Plus extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
        this.enquetesListener = null;

        this.state = {
            progress: 0,
            showAbout: false
        };
    }

    componentDidMount = () => {
        this.onStartListener();
    }

    componentWillUnmount = () => {
        if (this.enquetesListener) this.enquetesListener.off();
    }

    onStartListener = () => {
        const { grupoSelectedKey, userLogged } = this.props;

        if (grupoSelectedKey) {
            this.enquetesListener = this.dbFirebaseRef
            .child(`grupos/${grupoSelectedKey}/enquetes`);

            this.enquetesListener.on('value', (snapshot) => {
                let snapVal = null;
                
                if (snapshot) {
                    snapVal = snapshot.val();

                    if (snapVal) {
                        const enquetesList = _.map(
                            snapshot.val(), (value, key) => ({ key, ...value })
                        );
                        const openEnqts = _.filter(enquetesList, en => en.status === '1');
    
                        // CONTADOR DE ENQUETES NÃO VOTADAS
                        if (userLogged && userLogged.key) {
                            if (openEnqts && openEnqts.length) {
                                const numEnquetes = _.reduce(openEnqts, (sum, item) => {
                                    const votos = _.filter(item.votos, vl => !vl.push);
    
                                    if (votos && votos.length) {
                                        const hasVote = _.findIndex(
                                            votos, vot => vot.key === userLogged.key
                                        ) !== -1;
    
                                        if (!hasVote) {
                                            return sum + 1;
                                        }
    
                                        return sum;
                                    }
    
                                    return sum + 1;
                                }, 0);
                                
                                store.dispatch({
                                    type: 'modifica_enqueteprops_enquetes',
                                    payload: { badge: { value: numEnquetes } }
                                });

                                return;
                            }
                        }
                    }
                }

                store.dispatch({
                    type: 'modifica_enqueteprops_enquetes',
                    payload: { badge: { value: 0 } }
                });
            });
        }
    }

    onPressExitGroup = () => {
        try {
            const asyncFunExec = async () => {
                const { grupoSelectedKey, userLogged } = this.props;
                let ret = false;

                ret = await this.dbFirebaseRef
                .child(`grupos/${grupoSelectedKey}/participantes/${userLogged.key}`)
                .remove().then(() => true).catch(() => false);

                if (ret) {
                    ret = await this.dbFirebaseRef
                    .child(`usuarios/${userLogged.key}/grupos/${grupoSelectedKey}`)
                    .remove().then(() => true).catch(() => false);
                }
    
                if (ret) {
                    Actions.popTo('_cadastroGrupos');
                } else {
                    showDropdownAlert(
                        'error',
                        ERROS.groupExit.erro,
                        ERROS.groupExit.mes
                    );
                }
            };

            Alert.alert(
                'Aviso',
                `Sair do grupo "${this.props.grupoSelected.nome}" ?`,
                [
                    {
                        text: 'Sair',
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

    onPressFinishScore = () => {
        const asyncFunExec = async () => {
            if (this.props.grupoSelectedKey) {
                store.dispatch({
                    type: 'modifica_showloadingendscore_grupos',
                    payload: true
                });

                const ret = await finishScoreGroup(this.props.grupoSelectedKey);

                store.dispatch({
                    type: 'modifica_showloadingendscore_grupos',
                    payload: false
                });

                if (ret) {
                    showDropdownAlert(
                        'success',
                        'Sucesso',
                        'Histórico de pontuação salvo com sucesso.'
                    );
                } else {
                    showDropdownAlert(
                        'error',
                        ERROS.pontuacaoFinish.erro,
                        ERROS.pontuacaoFinish.mes
                    );
                }
            } else {
                showDropdownAlert(
                    'error',
                    ERROS.pontuacaoFinish.erro,
                    ERROS.pontuacaoFinish.mes
                );
            }
        };

        Alert.alert(
            'Aviso',
            'Ao finalizar o período de pontuação o mesmo será gravado em histórico' +
            ' e a pontuação será zerada para todos os participantes do grupo.' +
            ' Deseja continuar ?',
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
    }

    render = () => {
        let enqueteProps = {};

        if (this.props.enqueteProps && 
            this.props.enqueteProps.badge &&
            this.props.enqueteProps.badge.value) {
            enqueteProps = { ...this.props.enqueteProps };
        }

        let rightViewPontuacao = () => (<View />);

        if (this.props.grupoSelected && this.props.grupoSelected.key) {
            const admins = this.props.grupoSelected.groupAdmins ? 
            _.values(this.props.grupoSelected.groupAdmins) : [];

            if (
                (this.props.userLogged.key === this.props.grupoSelected.userowner) ||
                (_.findIndex(
                    admins, 
                    itf => itf.key === this.props.userLogged.key
                ) !== -1)
            ) {
                rightViewPontuacao = (
                    <View 
                        style={{
                            flexDirection: 'row',
                            marginHorizontal: 5,
                            paddingHorizontal: 10,
                            justifyContent: 'space-between'
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => this.onPressFinishScore()}
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
                );
            }
        }

        return (
            <ScrollView contentContainerStyle={styles.viewPrinc}>
                <Card
                    containerStyle={{ marginHorizontal: 0 }}
                >
                    <ListItem
                        key={'Histórico de Jogos'}
                        title={'Histórico de Jogos'}
                        titleStyle={styles.titleStyle}
                        containerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={{ 
                            name: 'history', 
                            type: 'material-community', 
                            color: colorAppSecondary,
                            size: 28 
                        }}
                        onPress={() => Actions.historico()}
                    />
                </Card>
                <Card
                    containerStyle={{ marginHorizontal: 0 }}
                >
                    <ListItem
                        key={'Pontuação'}
                        title={'Pontuação'}
                        titleStyle={styles.titleStyle}
                        containerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={{ 
                            name: 'gamepad-variant', 
                            type: 'material-community', 
                            color: colorAppSecondary,
                            size: 28 
                        }}
                        onPress={() => Actions.pontuacao({
                            right: rightViewPontuacao
                        })}
                    />
                </Card>
                <Card
                    containerStyle={{ marginHorizontal: 0 }}
                >
                    <ListItem
                        key={'Financeiro - Grupo'}
                        title={'Financeiro - Grupo'}
                        titleStyle={styles.titleStyle}
                        containerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={{ 
                            name: 'cash-multiple', 
                            type: 'material-community', 
                            color: colorAppSecondary,
                            size: 28 
                        }}
                        onPress={() => Actions.profileFinanceiro()}
                    />
                </Card>
                <Card
                    containerStyle={{ marginHorizontal: 0 }}
                >
                    <ListItem
                        key={'Financeiro - Jogadores'}
                        title={'Financeiro - Jogadores'}
                        titleStyle={styles.titleStyle}
                        containerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={{ 
                            name: 'cash-multiple', 
                            type: 'material-community', 
                            color: colorAppSecondary,
                            size: 28 
                        }}
                        onPress={() => Actions.plusFinanceiroJogadores()}
                    />
                </Card>
                <Card
                    containerStyle={{ marginHorizontal: 0 }}
                >
                    <ListItem
                        key={'Mural'}
                        title={'Mural'}
                        titleStyle={styles.titleStyle}
                        containerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={{ 
                            name: 'chart-timeline', 
                            type: 'material-community', 
                            color: colorAppSecondary,
                            size: 28 
                        }}
                        onPress={() => Actions.mural()}
                    />
                </Card>
                <Card
                    containerStyle={{ marginHorizontal: 0 }}
                >
                    <ListItem
                        key={'Enquetes'}
                        title={'Enquetes'}
                        titleStyle={styles.titleStyle}
                        containerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={{ 
                            name: 'poll', 
                            type: 'material-community', 
                            color: colorAppSecondary,
                            size: 28 
                        }}
                        onPress={() => {
                            if (this.enquetesListener) this.enquetesListener.off();
                            Actions.profileEnquetes({ onBack: () => {
                                this.onStartListener();
                                Actions.pop();
                            } });
                        }}
                        {...enqueteProps}
                    />
                </Card>
                <Card
                    containerStyle={{ marginHorizontal: 0 }}
                >
                    <ListItem
                        key={'Histórico de Enquetes'}
                        title={'Histórico de Enquetes'}
                        titleStyle={styles.titleStyle}
                        containerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={{ 
                            name: 'chart-pie', 
                            type: 'material-community', 
                            color: colorAppSecondary,
                            size: 28 
                        }}
                        onPress={() => {
                            if (this.enquetesListener) this.enquetesListener.off();
                            Actions.profileEnquetesHistorico({ onBack: () => {
                                this.onStartListener();
                                Actions.pop();
                            } });
                        }}
                    />
                </Card>
                <Card
                    containerStyle={{ marginHorizontal: 0 }}
                >
                    <ListItem
                        key={'Histórico de Faltas'}
                        title={'Histórico de Faltas'}
                        titleStyle={styles.titleStyle}
                        containerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={{ 
                            name: 'account-alert', 
                            type: 'material-community', 
                            color: colorAppSecondary,
                            size: 28 
                        }}
                        onPress={
                            () => Actions.analisejogadores({ title: 'Histórico de Faltas' })
                        }
                    />
                </Card>
                <Card
                    containerStyle={{ marginHorizontal: 0 }}
                >
                    <ListItem
                        key={'Histórico de Pontuação'}
                        title={'Histórico de Pontuação'}
                        titleStyle={styles.titleStyle}
                        containerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={{ 
                            name: 'counter', 
                            type: 'material-community', 
                            color: colorAppSecondary,
                            size: 28 
                        }}
                        onPress={
                            () => Actions.pontuacaoHistorico()
                        }
                    />
                </Card>
                <Card
                    containerStyle={{ marginHorizontal: 0 }}
                >
                    <ListItem
                        key={'Notificações'}
                        title={'Notificações'}
                        titleStyle={styles.titleStyle}
                        containerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={{ 
                            name: 'bell', 
                            type: 'material-community', 
                            color: colorAppSecondary,
                            size: 28 
                        }}
                        onPress={() => Actions.grupoNotificacoes()}
                    />
                </Card>
                {
                    this.props.grupoSelected.userowner !== this.props.userLogged.key &&
                    (
                        <Card
                            containerStyle={{ marginHorizontal: 0 }}
                        >
                            <ListItem
                                hideChevron
                                key={'Sair do grupo'}
                                title={'Sair do grupo'}
                                titleStyle={{ fontFamily: 'OpenSans-Regular', color: 'red' }}
                                containerStyle={{ borderBottomWidth: 0 }}
                                leftIcon={{ 
                                    name: 'logout', 
                                    type: 'material-community', 
                                    color: 'red',
                                    size: 28 
                                }}
                                onPress={() => this.onPressExitGroup()}
                            />
                        </Card>
                    )
                }
                <View style={{ marginBottom: 100 }} />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flexGrow: 1,
        backgroundColor: '#EEEEEE'
    },
    titleStyle: {
        fontFamily: 'OpenSans-Regular',
        fontWeight: '400'
    }
});

const mapStateToProps = (state) => ({
    userLogged: state.LoginReducer.userLogged,
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoSelectedKey: state.GruposReducer.grupoSelectedKey,
    userLevel: state.LoginReducer.userLevel,
    username: state.LoginReducer.username,
    enqueteProps: state.EnquetesReducer.enqueteProps
});

export default connect(mapStateToProps, {
    modifyCleanLogin
})(Plus);
