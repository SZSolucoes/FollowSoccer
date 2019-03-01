import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    Text,
    Switch,
    Platform,
    ActivityIndicator
} from 'react-native';

import { connect } from 'react-redux';
import { 
    Icon,
    SearchBar,
    Divider,
    List,
    ButtonGroup
} from 'react-native-elements';
import _ from 'lodash';
import b64 from 'base-64';

import { colorAppS, colorAppF } from '../../../utils/constantes';
import { checkConInfo } from '../../../utils/jogosUtils';
import { showAlert } from '../../../utils/store';
import ListItem from '../../tools/ListItem';
import Card from '../../tools/Card';
import firebase from '../../../Firebase';
import UsuarioEdit from './UsuarioEdit';
import {
    modificaFilterStr,
    modificaFilterLoad,
    modificaItemSelected,
    modificaFlagDisableUser,
    modificaClean
} from '../../../actions/UsuariosActions';
import { modificaRemocao } from '../../../actions/AlertSclActions';
import imgAvatar from '../../../imgs/perfiluserimg.png';
import { store } from '../../../App';

class Usuarios extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            modalOpt: 'Cadastrar',
            itemEdit: {},
            idxMdl: 0,
            email: '',
            senha: '',
            nome: '',
            nomeForm: '',
            data: '',
            tipoPerfil: '',
            tipoUsuario: '1',
            refresh: false
        };

        this.scrollView = null;

        this.renderEditar = this.renderEditar.bind(this);
        this.renderSwitchType = this.renderSwitchType.bind(this);
        this.onPressBack = this.onPressBack.bind(this);
        this.onPressEditRemove = this.onPressEditRemove.bind(this);
        this.onFilterPermissions = this.onFilterPermissions.bind(this);
        this.onChangeSuperState = this.onChangeSuperState.bind(this);
        this.renderListUsuariosEdit = this.renderListUsuariosEdit.bind(this);
        this.onFilterUsuariosEdit = this.onFilterUsuariosEdit.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.renderIcons = this.renderIcons.bind(this);
    }

    componentWillUnmount() {
        this.props.modificaClean();
    }

    onPressBack(refresh = false) {
        this.scrollView.scrollTo({
            y: 0,
            duration: 0,
            animated: false
        });

        if (refresh) {
            this.setState({
                modalOpt: 'Editar',
                idxMdl: 1,
                refresh: true
            });
            firebase.database().ref().child('usuarios').once('value', snap => {
                let snapVal = null;
                if (snap) {
                    snapVal = snap.val();
                }

                if (snapVal) {
                    store.dispatch({
                        type: 'modifica_listusuarios_usuarios',
                        payload: _.map(snapVal, (value, key) => ({ key, ...value }))
                    });
                }
                this.setState({
                    refresh: false
                });
            });
        } else {
            this.setState({
                modalOpt: 'Editar',
                idxMdl: 1,
                refresh: false
            });
        }
    }

    onPressEditRemove(item) {
        this.props.modificaItemSelected(item);
        this.props.modificaFlagDisableUser(true);
        this.props.modificaRemocao(true);
        if (item.userDisabled && item.userDisabled === 'true') {
            showAlert('danger', 'Habilitar!', 'Deseja habilitar o usuário selecionado ?');
        } else {
            showAlert('danger', 'Desabilitar!', 'Deseja desabilitar o usuário selecionado ?');
        }
    }

    onChangeSuperState(newState) {
        this.setState({ ...newState });
    }

    onFilterUsuariosEdit(usuarios, filterStr) {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(usuarios, (usuario) => (
                (usuario.email && usuario.email.toLowerCase().includes(lowerFilter)) ||
                (usuario.dtnasc && usuario.dtnasc.toLowerCase().includes(lowerFilter)) ||
                (usuario.tipoPerfil && usuario.tipoPerfil.toLowerCase().includes(lowerFilter)) ||
                (usuario.nome && usuario.nome.toLowerCase().includes(lowerFilter)) ||
                (usuario.nomeForm && usuario.nomeForm.toLowerCase().includes(lowerFilter))
        ));
    }

    onFilterPermissions(userLevel) {
        if (this.props.userLogged.level === userLevel || userLevel === '255') {
            return false;
        }

        return true;
    }

    renderIcons(item) {
        return (
            <View 
                style={{ 
                    flex: 0.5, 
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <View 
                    style={{ 
                        flex: 1, 
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            this.scrollView.scrollTo({
                                y: 0,
                                duration: 0,
                                animated: false
                            });
                            this.setState({ 
                                modalOpt: 'Em Edição', 
                                itemEdit: item 
                            });
                        }}
                    >
                        <Icon
                            name='square-edit-outline' 
                            type='material-community' 
                            size={30} color='green' 
                        />   
                    </TouchableOpacity>
                </View>
                <View 
                    style={{ 
                        flex: 1, 
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                > 
                    {
                        Platform.OS === 'android' ?
                        (
                            <Switch 
                                value={item.userDisabled === 'false'}
                                onValueChange={
                                    () => checkConInfo(() => this.onPressEditRemove(item))
                                }
                            />
                        )
                        :
                        (
                            <Switch 
                                value={item.userDisabled === 'false'}
                                onValueChange={
                                    () => checkConInfo(() => this.onPressEditRemove(item))
                                }
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                        )
                    }
                </View>
            </View>
        );
    }

    renderListUsuariosEdit(usuarios) {
        let usuariosView = null;

        if (usuarios.length) {
            const filtredAdminG = _.filter(
                usuarios, (usr) => usr.level === '1' || 
                    this.onFilterPermissions(usr.level) || 
                    usr.key === this.props.userLogged.level
            );
            const newSortedUsers = _.orderBy(filtredAdminG, ['nome', 'emai'], ['asc', 'asc']);
            usuariosView = (
                <List containerStyle={{ marginBottom: 20 }}>
                {
                    newSortedUsers.map((item, index) => {
                        const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                        return (
                            <ListItem
                                roundAvatar
                                avatar={imgAvt}
                                key={index}
                                title={item.nome}
                                subtitle={item.email}
                                rightIcon={(
                                    this.renderIcons(item)
                                )}
                            />
                        );
                    })
                }
                </List>
            );
        }

        setTimeout(() => this.setState({ refresh: false }), 1000);
        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return usuariosView;
    }

    renderBasedFilterOrNot() {
        const { listUsuarios, filterStr } = this.props;
        let usuariosView = null;
        if (listUsuarios) {
            if (filterStr) {
                usuariosView = this.renderListUsuariosEdit(
                    this.onFilterUsuariosEdit(listUsuarios, filterStr)
                );
            } else {
                usuariosView = this.renderListUsuariosEdit(listUsuarios);
            }
        }
        return usuariosView;
    }

    renderEditar() {
        return (
            <View>
                <Card containerStyle={styles.card}>
                    <SearchBar
                        round
                        lightTheme
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        clearIcon={!!this.props.filterStr}
                        showLoadingIcon={
                            this.props.listUsuarios &&
                            this.props.listUsuarios.length > 0 && 
                            this.props.filterLoad
                        }
                        containerStyle={{ 
                            backgroundColor: 'transparent',
                            borderTopWidth: 0, 
                            borderBottomWidth: 0
                        }}
                        searchIcon={{ size: 26 }}
                        value={this.props.filterStr}
                        onChangeText={(value) => {
                            this.props.modificaFilterStr(value);
                            this.props.modificaFilterLoad(true);
                        }}
                        onClear={() => this.props.modificaFilterStr('')}
                        placeholder='Buscar usuário...' 
                    />
                    { this.renderBasedFilterOrNot() }
                </Card>
                <View style={{ marginBottom: 30 }} />
            </View>
        );
    }

    renderSwitchType(modalOpt) {
        switch (modalOpt) {
            case 'Cadastrar':
                return (
                    <UsuarioEdit
                        onPressBack={this.onPressBack}
                        scrollView={() => this.scrollView}
                        email={this.state.email}
                        senha={this.state.senha}
                        nome={this.state.nome}
                        nomeForm={this.state.nomeForm}
                        data={this.state.data}
                        tipoPerfil={this.state.tipoPerfil}
                        tipoUsuario={this.state.tipoUsuario}
                        onChangeSuperState={(value) => this.onChangeSuperState(value)}
                    />
                );
            case 'Editar':
                return this.renderEditar();
            case 'Em Edição':
                return (
                    <UsuarioEdit
                        onPressBack={this.onPressBack}
                        scrollView={() => this.scrollView}
                        email={this.state.itemEdit.email}
                        senha={this.state.itemEdit.senha}
                        nome={this.state.itemEdit.nome}
                        nomeForm={this.state.itemEdit.nomeForm}
                        imgAvatar={this.state.itemEdit.imgAvatar}
                        data={this.state.itemEdit.dtnasc}
                        tipoPerfil={this.state.itemEdit.tipoPerfil}
                        tipoUsuario={this.state.itemEdit.level}
                        keyItem={b64.encode(this.state.itemEdit.email)}
                    />);
            default:
                return (
                    <UsuarioEdit
                        onPressBack={this.onPressBack}
                        scrollView={() => this.scrollView}
                        email={this.state.email}
                        senha={this.state.senha}
                        nome={this.state.nome}
                        nomeForm={this.state.nomeForm}
                        data={this.state.data}
                        tipoPerfil={this.state.tipoPerfil}
                        tipoUsuario={this.state.tipoUsuario}
                        onChangeSuperState={(value) => this.onChangeSuperState(value)}
                    />
                );
        }
    }

    render() {
        const buttonsGroup = ['Cadastrar', 'Editar'];
        return (
            <View style={styles.viewPrinc}>
                <View style={{ flexDirection: 'row' }}>
                    {
                        this.state.modalOpt !== 'Em Edição' ?
                        null : (<View style={{ flex: 1 }} />)
                    }
                    {
                        this.state.modalOpt !== 'Em Edição' ?
                        (
                            <View
                                style={styles.viewGroupBtn}
                            >
                                <ButtonGroup
                                    onPress={(index) => {
                                        this.scrollView.scrollTo({
                                            y: 0,
                                            duration: 0,
                                            animated: false
                                        });

                                        if (index === 1) {
                                            this.setState({
                                                refresh: true,
                                                idxMdl: index
                                            });

                                            setTimeout(() => {
                                                this.setState({
                                                    modalOpt: buttonsGroup[index],
                                                    refresh: false
                                                });
                                            }, 1000);

                                            return;
                                        }

                                        this.setState({
                                            modalOpt: buttonsGroup[index],
                                            idxMdl: index
                                        });
                                    }}
                                    selectedIndex={this.state.idxMdl}
                                    containerStyle={{ 
                                        width: '100%',
                                        backgroundColor: 'transparent',
                                        height: 40,
                                        borderRadius: 5
                                    }}
                                    buttons={buttonsGroup}
                                    textStyle={{
                                        color: 'gray',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        marginVertical: 8,
                                        marginRight: 5
                                    }}
                                    buttonStyle={{
                                        backgroundColor: 'transparent',
                                        borderColor: colorAppS,
                                        borderWidth: 2,
                                    }}
                                    selectedButtonStyle={{
                                        backgroundColor: colorAppS,
                                        borderColor: colorAppS,
                                        borderWidth: 2,
                                    }}
                                    selectedTextStyle={{
                                        color: 'white',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        marginVertical: 8,
                                        marginRight: 5
                                    }}
                                />
                            </View>
                        )
                        :
                        (
                            <TouchableOpacity
                                style={styles.viewGroupBtnRed}
                                onPress={() => this.onPressBack()}
                            >
                                <View>
                                    <Text 
                                        style={[styles.dropModalBtnText, { marginHorizontal: 40 }]}
                                    >
                                        Voltar
                                    </Text>
                                    <Icon
                                        pointerEvents={'none'}
                                        containerStyle={{
                                            left: 0,
                                            top: 0,
                                            right: 0,
                                            bottom: 0, 
                                            position: 'absolute', 
                                            zIndex: 1,
                                            alignItems: 'flex-start',
                                            paddingRight: 8

                                        }}
                                        name='arrow-left-thick' 
                                        type='material-community' 
                                        size={25} color='white' 
                                    /> 
                                </View>
                            </TouchableOpacity>
                        )
                    }
                </View>
                <Divider
                    style={{
                        marginHorizontal: 15,
                        height: 2,
                        backgroundColor: colorAppS,
                    }}
                />
                <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    ref={(ref) => { this.scrollView = ref; }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    {
                        this.state.refresh ?
                        (
                            <View
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <ActivityIndicator size='large' color={colorAppS} />
                            </View>
                        )
                        :
                        this.renderSwitchType(this.state.modalOpt)
                    }
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF
    },
    card: {
        paddingHorizontal: 10,
    },
    viewGroupBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 15
    },
    viewGroupBtnRed: { 
        backgroundColor: 'red',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 15,
        marginVertical: 20,
        height: 40,
        borderRadius: 4
    },
    dropModalBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 1,
        textAlign: 'center',
        marginRight: 5
    }
});

const mapStateToProps = (state) => ({
    listUsuarios: state.UsuariosReducer.listUsuarios,
    filterStr: state.UsuariosReducer.filterStr,
    filterLoad: state.UsuariosReducer.filterLoad,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {
    modificaFilterStr,
    modificaFilterLoad,
    modificaItemSelected,
    modificaRemocao,
    modificaFlagDisableUser,
    modificaClean
})(Usuarios);
