import React from 'react';
import { 
    View, 
    StyleSheet,
    Alert
} from 'react-native';

import { connect } from 'react-redux';
import { List, Button } from 'react-native-elements';
import Toast from 'react-native-simple-toast';

import firebase from '../../Firebase';
import { checkConInfo } from '../../utils/jogosUtils';

import PlayersModal from './PlayersModal';
import {
    modificaShowUsersModal
} from '../../actions/PainelAdminActions';
import ListItem from '../../tools/elements/ListItem';

class PainelAdmin extends React.Component {
    constructor(props) {
        super(props);

        this.fbDatabaseRef = firebase.database().ref();

        this.onChooseUserTransfAdmin = this.onChooseUserTransfAdmin.bind(this);
        this.onConfirmTransfer = this.onConfirmTransfer.bind(this);
        this.onConfirmDel = this.onConfirmDel.bind(this);
        this.onChooseUserExcluir = this.onChooseUserExcluir.bind(this);

        this.state = {
            modalChoosed: ''
        };
    }

    componentDidMount() {
        
    }

    async onConfirmTransfer(usuario, funCloseModal) {
        const { userLogged } = this.props;
        let lRet = false;
        
        const updatedUserLogged = await this.fbDatabaseRef.child(`usuarios/${userLogged.key}`)
        .update({
            level: '0'
        })
        .then(() => true) 
        .catch(() => false);

        if (updatedUserLogged) {
            const updatedUserTransf = await this.fbDatabaseRef.child(`usuarios/${usuario.key}`)
            .update({
                level: '255'
            })
            .then(() => true) 
            .catch(() => false);

            if (updatedUserTransf) {
                lRet = true;
            } else {
                lRet = false;
            }
        } else {
            lRet = false;
        }

        if (lRet) {
            funCloseModal();
            Toast.show(
                'Transferência realizada com sucesso', 
                Toast.SHORT
            );
        } else {
            Toast.show(
                'Falha ao transferir administração, verifique a conexão', 
                Toast.SHORT
            );

            const rolledUserLogged = await this.fbDatabaseRef.child(`usuarios/${userLogged.key}`)
            .update({
                level: '255'
            })
            .then(() => true) 
            .catch(() => false);

            const rolledUserTransf = this.fbDatabaseRef.child(`usuarios/${usuario.key}`).update({
                level: usuario.level
            })
            .then(() => true) 
            .catch(() => false);

            if (!(rolledUserLogged && rolledUserTransf)) {
                Alert.alert('Erro', 'Falha ao desfazer transferência');
            }
        }
    }

    onConfirmDel(usuario, funCloseModal) {
        this.fbDatabaseRef.child(`usuarios/${usuario.key}`)
        .remove()
        .then(() => {
            funCloseModal();
            Toast.show(
                'Usuário removido com sucesso', 
                Toast.SHORT
            );
        }) 
        .catch(() => {
            funCloseModal();
            Toast.show(
                'Falha ao remover usuário, verifique a conexão', 
                Toast.SHORT
            );
        });
    }

    onChooseUserTransfAdmin(usuario, funCloseModal) {
        Alert.alert(
            'Aviso',
            'Confirma a transferência de administração geral ' +
            `para o usuário:\n( ${usuario.nome} ) ?`,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => 
                        checkConInfo(() => this.onConfirmTransfer(usuario, funCloseModal))
                }
            ]
        ); 
    }

    onChooseUserExcluir(usuario, funCloseModal) {
        Alert.alert(
            'Aviso',
            `Confirma a exclusão do usuário ${usuario.nome} ?`,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => 
                        checkConInfo(() => this.onConfirmDel(usuario, funCloseModal))
                }
            ]
        ); 
    }

    render() {
        let onChooseUser = () => false;
        let title = '';

        switch (this.state.modalChoosed) {
            case 'transferir':
                title = 'Transferir Admin';
                onChooseUser = (usuario, funCloseModal) => 
                checkConInfo(() => this.onChooseUserTransfAdmin(usuario, funCloseModal));
                break;
            case 'excluir':
                title = 'Excluir Usuário';
                onChooseUser = (usuario, funCloseModal) => 
                checkConInfo(() => this.onChooseUserExcluir(usuario, funCloseModal));
                break;
            default:
                break;
        }

        return (
            <View style={styles.viewPrinc}>
                <List>
                    <ListItem
                        title='Transferir Administração'
                        subtitle={
                            'Transferir administração geral para outro usuário.'
                        }
                        subtitleNumberOfLines={5}
                        rightIcon={(
                            <Button 
                                title='Listar usuários' 
                                onPress={() => {
                                    this.setState({ modalChoosed: 'transferir' });
                                    this.props.modificaShowUsersModal(true);
                                }}
                            />
                        )}
                    />
                </List>
                <List>
                    <ListItem
                        title='Excluir Usuários'
                        subtitle={
                            'Excluir usuários do aplicativo apagando todos os dados.'
                        }
                        subtitleNumberOfLines={5}
                        rightIcon={(
                            <Button 
                                title='Listar usuários' 
                                onPress={() => {
                                    this.setState({ modalChoosed: 'excluir' });
                                    this.props.modificaShowUsersModal(true);
                                }} 
                            />
                        )}
                    />
                </List>
                <PlayersModal
                    showUsersModal={this.props.showUsersModal}  
                    onChooseUser={onChooseUser}
                    title={title}
                />
            </View>
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
    showUsersModal: state.PainelAdminReducer.showUsersModal,
    userLogged: state.LoginReducer.userLogged 
});

export default connect(mapStateToProps, { modificaShowUsersModal })(PainelAdmin);
