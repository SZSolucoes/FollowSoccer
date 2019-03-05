import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet
} from 'react-native';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { modifyCleanLogin } from '../../../login/LoginActions';

import ListItem from '../../../../tools/elements/ListItem';
import { colorAppSecondary } from '../../../../utils/Constantes';
import Card from '../../../../tools/elements/Card';

class Plus extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            progress: 0,
            showAbout: false
        };
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
                        titleStyle={{ fontFamily: 'OpenSans-Regular' }}
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
                        titleStyle={{ fontFamily: 'OpenSans-Regular' }}
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
                        titleStyle={{ fontFamily: 'OpenSans-Regular' }}
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
                        titleStyle={{ fontFamily: 'OpenSans-Regular' }}
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
                        titleStyle={{ fontFamily: 'OpenSans-Regular' }}
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
                        titleStyle={{ fontFamily: 'OpenSans-Regular' }}
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
                        titleStyle={{ fontFamily: 'OpenSans-Regular' }}
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
                <View style={{ marginBottom: 100 }} />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flexGrow: 1,
        backgroundColor: '#EEEEEE'
    }
});

const mapStateToProps = (state) => ({
    userLogged: state.LoginReducer.userLogged,
    userLevel: state.LoginReducer.userLevel,
    username: state.LoginReducer.username,
    enqueteProps: state.ProfileReducer.enqueteProps
});

export default connect(mapStateToProps, {
    modifyCleanLogin
})(Plus);
