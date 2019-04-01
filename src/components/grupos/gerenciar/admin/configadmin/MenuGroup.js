import React from 'react';
import { 
    View,
    Text,
    Alert,
    Platform,
    Clipboard,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import { connect } from 'react-redux';
import { Icon, Divider } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';

import firebase from '../../../../../utils/Firebase';
import { colorAppForeground, colorAppSecondary, ERROS } from '../../../../../utils/Constantes';
import Card from '../../../../../tools/elements/Card';
import { showDropdownAlert, checkConInfo } from '../../../../../utils/SystemEvents';
import { retrieveUpdUserGroup } from '../../../../../utils/UserUtils';
import ListItem from '../../../../../tools/elements/ListItem';
import { normalize } from '../../../../../utils/StrComplex';

class MenuGroup extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
    }

    onAddAdmin = (user) => {
        const funExec = () => {
            const { grupoSelectedKey } = this.props;
            const dbGroupAdminsRef = this.dbFirebaseRef
            .child(`grupos/${grupoSelectedKey}/groupAdmins`);
    
            dbGroupAdminsRef.update({
                [user.key]: {
                    key: user.key
                }
            })
            .then(() => showDropdownAlert(
                'success',
                'Sucesso',
                'Administrador adicionado com sucesso'
            ))
            .catch(() => showDropdownAlert(
                'error',
                ERROS.groupAdminAdd.erro,
                ERROS.groupAdminAdd.mes
            ));
        };

        Alert.alert(
            'Aviso', 
            `Deseja tornar em administrador o jogador "${user.nome}" ?`,
            [
                { text: 'Cancelar', onPress: () => false },
                { 
                    text: 'Sim', 
                    onPress: () => checkConInfo(() => funExec()) 
                }
            ],
            { cancelable: true }
        );
    }

    onRemoveAdmin = (user) => {
        const isUserLogged = this.props.userLogged.key === user.key;

        const funExec = () => {
            const { grupoSelectedKey } = this.props;
            const dbGroupAdminsRef = this.dbFirebaseRef
            .child(`grupos/${grupoSelectedKey}/groupAdmins/${user.key}`);
    
            dbGroupAdminsRef.remove()
            .then(() => {
                if (isUserLogged) {
                    showDropdownAlert(
                        'success',
                        'Sucesso',
                        'Administração removida com sucesso'
                    );
                    Actions.popTo('_cadastroGrupos');
                } else {
                    showDropdownAlert(
                        'success',
                        'Sucesso',
                        'Administrador removido com sucesso'
                    );
                }
            })
            .catch(() => {
                if (isUserLogged) {
                    showDropdownAlert(
                        'error',
                        ERROS.groupAdminRemoveUserLooged.erro,
                        ERROS.groupAdminRemoveUserLooged.mes
                    );
                } else {
                    showDropdownAlert(
                        'error',
                        ERROS.groupAdminRemove.erro,
                        ERROS.groupAdminRemove.mes
                    );
                }
            });
        };  

        Alert.alert(
            'Aviso',
            isUserLogged ? 
            'Confirma a remoção da própria adiministração ?'
            :
            `Deseja remover os direitos de administrador para o jogador "${user.nome}" ?`,
            [
                { text: 'Cancelar', onPress: () => false },
                { 
                    text: 'Sim', 
                    onPress: () => checkConInfo(() => funExec()) 
                }
            ],
            { cancelable: true }
        );
    }

    onGenerateNewCode = () => {
        const funExec = () => {
            const { grupoSelectedKey, userLogged } = this.props;
            const dbGroupRef = this.dbFirebaseRef.child(`grupos/${grupoSelectedKey}`);
            const twofirstKey = userLogged.key.slice(0, 2);
            const twoLastKey = userLogged.key.slice(-2);
            const medianKey = new Date().getTime().toString(36);
            const groupInviteKey = `${twofirstKey}${medianKey}${twoLastKey}`.replace(/=/g, '');
    
            dbGroupRef.update({
                groupInviteKey
            })
            .then(() => showDropdownAlert(
                'success', 
                'Sucesso', 
                'Foi gerado um novo código para o grupo'
            ))
            .catch(() => showDropdownAlert(
                'error', 
                ERROS.groupGenNewKey.erro, 
                ERROS.groupGenNewKey.mes
            ));
        };

        Alert.alert(
            'Aviso', 
            'Confirma a geração de uma novo código para o grupo ?',
            [
                { text: 'Cancelar', onPress: () => false },
                { 
                    text: 'Sim', 
                    onPress: () => checkConInfo(() => funExec()) 
                }
            ],
            { cancelable: true }
        );
    }

    onPressRemoveGroup = () => {
        const funExec = () => {
            const { grupoSelectedKey } = this.props;
            const dbGroupRef = this.dbFirebaseRef.child(`grupos/${grupoSelectedKey}`);
    
            dbGroupRef.remove()
            .then(() => {
                showDropdownAlert(
                    'success', 
                    'Sucesso', 
                    'Grupo excluído com sucesso'
                );

                Actions.popTo('_cadastroGrupos');
            })
            .catch(() => showDropdownAlert(
                'error', 
                ERROS.groupDelete.erro, 
                ERROS.groupDelete.mes
            ));
        };

        Alert.alert(
            'Aviso', 
            'O processo de exclusão do grupo é irreversível, confirma a exclusão ?',
            [
                { 
                    text: 'Sim', 
                    onPress: () => checkConInfo(() => funExec()) 
                },
                { text: 'Cancelar', onPress: () => false }
            ],
            { cancelable: true }
        );
    }

    renderAdminsBtn = (user, grupoSelected, isAdmin) => {
        let view = (<View />);

        if (user.key === grupoSelected.userowner) return view;

        if (isAdmin) {
            view = (
                <View style={{ padding: 5, borderRadius: 5, backgroundColor: 'red' }}>
                    <TouchableOpacity
                        onPress={() => this.onRemoveAdmin(user)}
                    >
                        <View>
                            <Text
                                style={styles.textLabelAdmin}
                            >
                                Remover admin
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        } else {
            view = (
                <View style={{ padding: 5, borderRadius: 5, backgroundColor: 'green' }}>
                    <TouchableOpacity
                        onPress={() => this.onAddAdmin(user)}
                    >
                        <View>
                            <Text
                                style={styles.textLabelAdmin}
                            >
                                Tornar admin
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }

        return view;
    }

    renderAdmins = (participantes, admins, grupoSelected) => {
        const adminsValues = _.values(admins);
        return (
            <View>
                <View 
                    style={{ 
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        marginLeft: 8,
                        marginTop: 5,
                        marginBottom: 5 
                    }}
                >
                    <Text
                        style={{
                            fontFamily: 'OpenSans-SemiBold',
                            fontSize: 18
                        }}
                    >
                        Participantes
                    </Text>
                </View>
                {
        
                    _.map(participantes, (ita, index) => {
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
                        /* const posicao = retrieveUpdUserGroup(
                            ita.key, 
                            'posicao', 
                            ita
                        ); */
                        const cidade = retrieveUpdUserGroup(
                            ita.key, 
                            'cidade', 
                            ita
                        );
                        const estado = retrieveUpdUserGroup(
                            ita.key, 
                            'estado', 
                            ita
                        );
                        const isAdmin = _.findIndex(
                            adminsValues, 
                            itd => itd.key === ita.key
                        ) !== -1;

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
                                    {
                                        ...(
                                            isAdmin || 
                                            (ita.key === grupoSelected.userowner) ? 
                                            { 
                                                subtitle: 'Administrador',
                                                subtitleStyle: { color: 'red' } 
                                            } 
                                            : 
                                            {}
                                        )
                                    }
                                    containerStyle={{
                                        borderBottomWidth: 0
                                    }}
                                    rightIcon={this.renderAdminsBtn(ita, grupoSelected, isAdmin)}
                                />
                                <Divider />
                                <View
                                    style={{ padding: 5 }}
                                >
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={styles.cardTextUsersBold}>
                                            {'E-mail: '}
                                        </Text>
                                        <Text 
                                            selectable
                                            style={styles.cardTextUsersSemiBold}
                                        >
                                            {email}
                                        </Text>
                                    </View>
                                    <View style={{ marginVertical: 4 }} />
                                    {/* <View style={{ flexDirection: 'row' }}>
                                        <Text style={styles.cardTextUsersBold}>
                                            {'Posição: '} 
                                        </Text>
                                        <Text 
                                            selectable
                                            style={styles.cardTextUsersSemiBold}
                                        >
                                            {posicao}
                                        </Text>
                                    </View> */}
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={styles.cardTextUsersBold}>
                                            {'Cidade: '} 
                                        </Text>
                                        <Text 
                                            selectable
                                            style={styles.cardTextUsersSemiBold}
                                        >
                                            {cidade || 'não informado'}
                                        </Text>
                                    </View>
                                    <View style={{ marginVertical: 2 }} />
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={styles.cardTextUsersBold}>
                                            {'Estado: '} 
                                        </Text>
                                        <Text 
                                            selectable
                                            style={styles.cardTextUsersSemiBold}
                                        >
                                            {estado || 'não informado'}
                                        </Text>
                                    </View>
                                </View>
                            </Card>
                        );
                    })
                }
            </View>
        );
    }

    render = () => (
        <ScrollView 
            style={styles.viewPrinc}
            contentContainerStyle={{ flexGrow: 1 }}
            ref={(ref) => { this.scrollView = ref; }}
            keyboardShouldPersistTaps={'handled'}
        >  
            <View style={{ marginVertical: 5 }} />
            <View style={styles.viewPrinc}>
                <View style={{ flex: 1 }}>
                    <View style={[styles.cardDefault, { borderColor: 'red' }]}>
                        <ListItem
                            title='Excluir grupo'
                            subtitle={
                                'Ao excluir o grupo, todos os dados do grupo como jogos,' +
                                ' informativos, participantes e entre outros serão perdidos.'
                            }
                            subtitleNumberOfLines={5}
                            containerStyle={{ borderBottomWidth: 0 }}
                            rightIcon={(
                                <View style={{ marginLeft: 5 }}>
                                    <TouchableOpacity
                                        onPress={() => this.onPressRemoveGroup()}
                                    >
                                        <Icon 
                                            name='delete' 
                                            type='material-community' 
                                            size={30}
                                            color={'red'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                    <View style={[styles.cardDefault, { flexDirection: 'row' }]}>
                        <View 
                            style={{
                                flex: 3,
                                backgroundColor: 'white',
                                margin: 5,
                                flexDirection: 'row'
                            }}
                        >
                            <Text style={styles.textLabel}>
                                {'Código do grupo: '}
                            </Text>
                            <Text style={styles.text}>
                                {this.props.grupoSelected.groupInviteKey}
                            </Text>
                        </View>
                        <View style={{ flex: 0.5 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    Clipboard.setString(
                                        this.props.grupoSelected.groupInviteKey
                                    );
                                    showDropdownAlert(
                                        'success', 
                                        'Sucesso', 
                                        'Código copiado para área de transferência'
                                    );
                                }}
                            >
                                <Icon 
                                    name='content-copy' 
                                    type='material-community' 
                                    size={26}
                                    color={colorAppSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 0.5 }}>
                            <TouchableOpacity
                                onPress={() => this.onGenerateNewCode()}
                            >
                                <Icon 
                                    name='autorenew'
                                    type='material-community' 
                                    size={26}
                                    color={colorAppSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            backgroundColor: 'white',
                            borderColor: 'rgba(39, 167, 68, 0.8)',
                            borderWidth: 1,
                            borderRadius: 5,
                            margin: 10,
                            paddingVertical: 10,
                            paddingHorizontal: 5,
                            ...Platform.select({
                                ios: {
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 2,
                                },
                                android: {
                                    elevation: 2,
                                },
                            })
                        }}
                    >
                        {
                            this.renderAdmins(
                                this.props.grupoSelected.participantes,
                                this.props.grupoSelected.groupAdmins,
                                this.props.grupoSelected
                            )
                        }
                    </View>
                </View>
                <View style={{ marginVertical: 60 }} />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
    text: {
        fontSize: normalize(14),
        fontFamily: 'OpenSans-Regular'
    },
    textLabel: {
        fontSize: normalize(14),
        fontFamily: 'OpenSans-Bold',
        fontWeight: 'bold'
    },
    textLabelAdmin: {
        fontSize: normalize(14),
        fontFamily: 'OpenSans-Bold',
        fontWeight: 'bold',
        color: 'white'
    },
    inputContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#9E9E9E',
        height: Platform.OS === 'android' ? 45 : 40,
    },
    input: {
        paddingBottom: 0, 
        width: null,
        color: 'black',
        height: 35
    },
    card: {
        paddingHorizontal: 10
    },
    cardTextUsersSemiBold: {
        fontFamily: 'OpenSans-SemiBold',
    },
    cardTextUsersBold: {
        fontFamily: 'OpenSans-Bold',
        color: '#43484d'
    },
    cardDefault: {
        backgroundColor: 'white',
        borderColor: 'rgba(39, 167, 68, 0.8)',
        borderWidth: 1,
        borderRadius: 5,
        margin: 10,
        paddingVertical: 10,
        paddingHorizontal: 5,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        })
    }
});

const mapStateToProps = state => ({
    dropdownAlert: state.SystemEventsReducer.dropdownAlert,
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoSelectedKey: state.GruposReducer.grupoSelectedKey,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps)(MenuGroup);
