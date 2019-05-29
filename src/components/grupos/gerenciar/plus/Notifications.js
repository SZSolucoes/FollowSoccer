/* eslint-disable max-len */
import React from 'react';
import { 
    View,
    ScrollView,
    StyleSheet
} from 'react-native';

import { connect } from 'react-redux';
import { CheckBox, List } from 'react-native-elements';
import _ from 'lodash';

import ListItem from '../../../../tools/elements/ListItem';
import { checkConInfo } from '../../../../utils/SystemEvents';
import firebase from '../../../../utils/Firebase';

class Notifications extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();

        this.state = {
            disabled: false
        };
    }

    onPressCheck = (notifType) => {
        const { userLogged, grupoSelected } = this.props;
        const participante = _.find(grupoSelected.participantes, ita => ita.key === userLogged.key);

        if (notifType === 'notifcad') {
            if (participante.jogoNotifCad === 'on') {
                this.updateDbNode(participante, grupoSelected, 'jogoNotifCad', 'off');
            } else {
                this.updateDbNode(participante, grupoSelected, 'jogoNotifCad', 'on');
            }
        } else if (notifType === 'notifreminder') {
            if (participante.jogoNotifReminder === 'on') {
                this.updateDbNode(participante, grupoSelected, 'jogoNotifReminder', 'off');
            } else {
                this.updateDbNode(participante, grupoSelected, 'jogoNotifReminder', 'on');
            }
        } else if (notifType === 'notifenquete') {
            if (participante.enqueteNotif === 'on') {
                this.updateDbNode(participante, grupoSelected, 'enqueteNotif', 'off');
            } else {
                this.updateDbNode(participante, grupoSelected, 'enqueteNotif', 'on');
            }
        } else if (notifType === 'notifmural') {
            if (participante.muralNotif === 'on') {
                this.updateDbNode(participante, grupoSelected, 'muralNotif', 'off');
            } else {
                this.updateDbNode(participante, grupoSelected, 'muralNotif', 'on');
            }
        } else if (notifType === 'notifinformativos') {
            if (participante.informativosNotif === 'on') {
                this.updateDbNode(participante, grupoSelected, 'informativosNotif', 'off');
            } else {
                this.updateDbNode(participante, grupoSelected, 'informativosNotif', 'on');
            }
        }
    };

    updateDbNode = (participante, grupoSelected, key, value) => {
        this.setState({ disabled: true });

        this.dbFirebaseRef
        .child(`grupos/${grupoSelected.key}/participantes/${participante.key}`)
        .update({
            [key]: value
        })
        .then(() => {
            this.setState({ disabled: false });
        })
        .catch(() => {
            this.setState({ disabled: false });
        });
    }

    render = () => {
        const { userLogged, grupoSelected } = this.props;

        const participante = _.find(grupoSelected.participantes, ita => ita.key === userLogged.key);

        if (!participante) return false;

        return (
            <ScrollView>
                <View style={styles.viewPrinc}>
                    <List>
                        <ListItem
                            disabled={this.state.disabled}
                            title='Novo Jogo'
                            subtitle={'Receber notificações quando um novo jogo for criado.'}
                            subtitleNumberOfLines={5}
                            rightIcon={(
                                <CheckBox
                                    title={participante.jogoNotifCad === 'on' ? 'Ativo  ' : 'Inativo'}
                                    checked={participante.jogoNotifCad === 'on'}
                                    onPress={() => !this.state.disabled &&
                                        checkConInfo(this.onPressCheck, ['notifcad'])
                                    }
                                />
                            )}
                        />
                    </List>
                    <List>
                        <ListItem
                            disabled={this.state.disabled}
                            title='Confirmação de Presença'
                            subtitle={
                                'Receber notificações para confirmação de presença em jogos.'
                            }
                            subtitleNumberOfLines={5}
                            rightIcon={(
                                <CheckBox
                                    title={
                                        participante.jogoNotifReminder === 'on' ? 'Ativo  ' : 'Inativo'
                                    }
                                    checked={participante.jogoNotifReminder === 'on'}
                                    onPress={() => !this.state.disabled &&
                                        checkConInfo(this.onPressCheck, ['notifreminder'])
                                    }
                                />
                            )}
                        />
                    </List>
                    <List>
                        <ListItem
                            disabled={this.state.disabled}
                            title='Enquetes'
                            subtitle={'Receber notificações quando uma enquete for criada.'}
                            subtitleNumberOfLines={5}
                            rightIcon={(
                                <CheckBox
                                    title={participante.enqueteNotif === 'on' ? 'Ativo  ' : 'Inativo'}
                                    checked={participante.enqueteNotif === 'on'}
                                    onPress={() => !this.state.disabled &&
                                        checkConInfo(this.onPressCheck, ['notifenquete'])
                                    }
                                />
                            )}
                        />
                    </List>
                    <List>
                        <ListItem
                            disabled={this.state.disabled}
                            title='Mural'
                            subtitle={
                                'Receber notificações quando uma publicação no mural for realizada.'
                            }
                            subtitleNumberOfLines={5}
                            rightIcon={(
                                <CheckBox
                                    title={participante.muralNotif === 'on' ? 'Ativo  ' : 'Inativo'}
                                    checked={participante.muralNotif === 'on'}
                                    onPress={() => !this.state.disabled &&
                                        checkConInfo(this.onPressCheck, ['notifmural'])
                                    }
                                />
                            )}
                        />
                    </List>
                    <List>
                        <ListItem
                            disabled={this.state.disabled}
                            title='Informativos'
                            subtitle={
                                'Receber notificações quando um informativo for publicado.'
                            }
                            subtitleNumberOfLines={5}
                            rightIcon={(
                                <CheckBox
                                    title={
                                        participante.informativosNotif === 'on' ? 'Ativo  ' : 'Inativo'
                                    }
                                    checked={participante.informativosNotif === 'on'}
                                    onPress={() => !this.state.disabled &&
                                        checkConInfo(this.onPressCheck, ['notifinformativos'])
                                    }
                                />
                            )}
                        />
                    </List>
                </View>
                <View style={{ marginVertical: 25 }} />
            </ScrollView>
        );
    }
        
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    }
});

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {})(Notifications);
