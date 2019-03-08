import React from 'react';
import { 
    View,
    Alert,
    ScrollView, 
    StyleSheet
} from 'react-native';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { modifyCleanLogin } from '../../../login/LoginActions';

import ListItem from '../../../../tools/elements/ListItem';
import { colorAppSecondary, ERROS } from '../../../../utils/Constantes';
import Card from '../../../../tools/elements/Card';
import { showDropdownAlert, checkConInfo } from '../../../../utils/SystemEvents';
import firebase from '../../../../utils/Firebase';

class Plus extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();

        this.state = {
            progress: 0,
            showAbout: false
        };
    }

    onPressExitGroup = () => {
        try {
            const asyncFunExec = async () => {
                const { grupoSelected, userLogged } = this.props;
                let ret = false;

                ret = await this.dbFirebaseRef
                .child(`grupos/${grupoSelected.key}/participantes/${userLogged.key}`)
                .remove().then(() => true).catch(() => false);

                if (ret) {
                    ret = await this.dbFirebaseRef
                    .child(`usuarios/${userLogged.key}/grupos/${grupoSelected.key}`)
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

    render = () => {
        let enqueteProps = {};

        if (this.props.enqueteProps && 
            this.props.enqueteProps.badge &&
            this.props.enqueteProps.badge.value) {
            enqueteProps = { ...this.props.enqueteProps };
        }
        return (
            <ScrollView contentContainerStyle={styles.viewPrinc}>
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
                        onPress={() => Actions.profileEnquetes()}
                        {...enqueteProps}
                    />
                </Card>
                <Card
                    containerStyle={{ marginHorizontal: 0 }}
                >
                    <ListItem
                        key={'Financeiro'}
                        title={'Financeiro'}
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
                        onPress={() => Actions.profileEnquetesHistorico()}
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
    userLevel: state.LoginReducer.userLevel,
    username: state.LoginReducer.username,
    enqueteProps: state.ProfileReducer.enqueteProps
});

export default connect(mapStateToProps, {
    modifyCleanLogin
})(Plus);
