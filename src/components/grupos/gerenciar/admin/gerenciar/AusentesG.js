import React from 'react';
import { 
    View,
    Text,
    Image,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { List, Badge, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import _ from 'lodash';
import Moment from 'moment';
import { colorAppForeground } from '../../../../../utils/Constantes';
import Card from '../../../../../tools/elements/Card';
import ListItem from '../../../../../tools/elements/ListItem';
//import Campo from '../../../campo/Campo';
import imgTeam from '../../../../../assets/imgs/team.png';
import firebase from '../../../../../utils/Firebase';
import { retrieveUpdUserGroup } from '../../../../../utils/UserUtils';
import { checkConInfo } from '../../../../../utils/SystemEvents';

class AusentesG extends React.Component {
    constructor(props) {
        super(props);

        this.fbJogoRef = null;
        this.fbDatabaseRef = firebase.database().ref();

        this.state = {
            jogo: {}
        };
    }

    componentDidMount = () => {
        const { grupoSelected, itemSelected } = this.props;
        
        this.fbJogoRef = this.fbDatabaseRef
        .child(`grupos/${grupoSelected.key}/jogos/${itemSelected}`);

        this.fbJogoRef.on('value', snap => {
            if (snap) {
                const snapVal = snap.val();

                if (snapVal) {
                    this.setState({ jogo: { key: snap.key, ...snapVal } });

                    return;
                }
            }

            this.setState({ jogo: {} });
        });
    }

    componentWillUnmount = () => {
        if (this.fbJogoRef) this.fbJogoRef.off();
    }

    onPressConfirmP = (jogo, user) => {
        const { grupoSelected } = this.props;
        const userAusenteIndex = _.findIndex(
            jogo.ausentes, 
            (usuario) => usuario.key && usuario.key === user.key);

        const funExec = (newAusentesList = false) => {
            const newConfirmadosList = jogo.confirmados ? 
            [...jogo.confirmados] : [];
            const dataAtual = Moment().format('YYYY-MM-DD HH:mm:ss');
            const ausentes = newAusentesList ? { ausentes: newAusentesList } : {};
    
            newConfirmadosList.push({
                key: user.key,
                imgAvatar: user.imgAvatar,
                nome: user.nome,
                horaConfirm: dataAtual
            });
    
            this.fbDatabaseRef.child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`).update({
                confirmados: newConfirmadosList,
                ...ausentes
            })
            .then(() => true)
            .catch(() => true);
        };

        if (userAusenteIndex !== -1) {
            let newAusentesList = [];
            newAusentesList = [...jogo.ausentes];
            newAusentesList.splice(userAusenteIndex, 1);

            Alert.alert(
                'Aviso', 
                `Deseja confirmar a presença do jogador "${
                    retrieveUpdUserGroup(
                        user.key, 
                        'nome', 
                        user
                    )}" ?`,
                [
                    { text: 'Cancelar', onPress: () => false },
                    { 
                        text: 'OK', 
                        onPress: () => checkConInfo(
                        () => funExec(newAusentesList)) 
                    }
                ],
                { cancelable: false }
            );
        } else {
            Alert.alert(
                'Aviso', 
                `Deseja confirmar a presença do jogador "${user.nome}" ?`,
                [
                    { text: 'Cancelar', onPress: () => false },
                    { 
                        text: 'OK', 
                        onPress: () => checkConInfo(
                        () => funExec()) 
                    }
                ],
                { cancelable: false }
            );
        }
    }

    renderRightConfirm = (jogo, userKey) => (
        <TouchableOpacity
            onPress={() => this.onPressConfirmP(jogo, userKey)}
        >
            <View
                style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Icon 
                    name='account-convert'
                    type='material-community'
                    size={28} 
                />
            </View>
        </TouchableOpacity>
    )

    render = () => {
        const { grupoSelected } = this.props;
        const { jogo } = this.state;
        const listUsuarios = grupoSelected.participantes ? 
        _.values(grupoSelected.participantes) : [];

        if (typeof jogo === 'object' && Object.keys(jogo).length === 0) {
            return false;
        }

        let jogadoresAusentes = _.filter(jogo.ausentes, (jg) => !jg.push);
        jogadoresAusentes = _.orderBy(jogadoresAusentes, ['nome'], ['asc']);

        const numjogadoresAusentes = jogadoresAusentes.length;

        // ############ NAO CONFIRMADOS ################
        let naoConfirmados = [];
        const totalConfirmed = _.uniqBy([
            ...jogadoresAusentes,
            ...jogo.confirmados
        ], 'key');

        for (let index = 0; index < listUsuarios.length; index++) {
            const element = listUsuarios[index];

            if (_.findIndex(totalConfirmed, ita => ita.key === element.key) === -1) {
                naoConfirmados.push(element);
            }
        }

        naoConfirmados = _.orderBy(naoConfirmados, ['nome'], ['asc']);

        const numNaoConfirmados = naoConfirmados.length;

        return (
            <View style={{ flex: 1 }}>
                <ScrollView style={styles.viewP}>
                    {
                        numjogadoresAusentes !== 0 &&
                        (
                            <Card
                                containerStyle={styles.card}
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
                                            style={{ fontSize: 16, color: 'black' }}
                                        >
                                            Ausentes
                                        </Text>
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Badge value={numjogadoresAusentes} />
                                        </View>
                                    </View>
                                </View>
                                <List 
                                    containerStyle={{
                                        marginTop: 0, 
                                        borderTopWidth: 0, 
                                        borderBottomWidth: 0
                                    }}
                                >
                                    {
                                        jogadoresAusentes.map((item, index) => {
                                            const updatedImg = retrieveUpdUserGroup(
                                                item.key, 
                                                'imgAvatar', 
                                                item
                                            );
                                            const imgAvt = updatedImg ? 
                                            { uri: updatedImg } : { uri: '' };
                                            return (
                                                <ListItem
                                                    containerStyle={
                                                        (index + 1) === numjogadoresAusentes ? 
                                                        { borderBottomWidth: 0 } : null 
                                                    }
                                                    titleContainerStyle={{ marginLeft: 10 }}
                                                    subtitleContainerStyle={{ marginLeft: 10 }}
                                                    roundAvatar
                                                    avatar={imgAvt}
                                                    key={index}
                                                    title={retrieveUpdUserGroup(
                                                        item.key, 
                                                        'nome', 
                                                        item
                                                    )}
                                                    subtitle={retrieveUpdUserGroup(
                                                        item.key, 
                                                        'posicao', 
                                                        item
                                                    )}
                                                    rightIcon={this.renderRightConfirm(jogo, item)}
                                                />
                                            );
                                        })
                                    }
                                </List>
                            </Card>  
                        )
                    }
                    {
                        numNaoConfirmados !== 0 &&
                        (
                            <Card
                                containerStyle={styles.card}
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
                                            style={{ fontSize: 16, color: 'black' }}
                                        >
                                            Confirmação Pendente
                                        </Text>
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Badge value={numNaoConfirmados} />
                                        </View>
                                    </View>
                                </View>
                                <List 
                                    containerStyle={{
                                        marginTop: 0, 
                                        borderTopWidth: 0, 
                                        borderBottomWidth: 0
                                    }}
                                >
                                    {
                                        naoConfirmados.map((item, index) => {
                                            const updatedImg = retrieveUpdUserGroup(
                                                item.key, 
                                                'imgAvatar', 
                                                item
                                            );
                                            const imgAvt = updatedImg ? 
                                            { uri: updatedImg } : { uri: '' };
                                            return (
                                                <ListItem
                                                    containerStyle={
                                                        (index + 1) === numNaoConfirmados ? 
                                                        { borderBottomWidth: 0 } : null 
                                                    }
                                                    titleContainerStyle={{ marginLeft: 10 }}
                                                    subtitleContainerStyle={{ marginLeft: 10 }}
                                                    roundAvatar
                                                    avatar={imgAvt}
                                                    key={index}
                                                    title={retrieveUpdUserGroup(
                                                        item.key, 
                                                        'nome', 
                                                        item
                                                    )}
                                                    subtitle={retrieveUpdUserGroup(
                                                        item.key, 
                                                        'posicao', 
                                                        item
                                                    )}
                                                    rightIcon={this.renderRightConfirm(jogo, item)}
                                                />
                                            );
                                        })
                                    }
                                </List>
                            </Card>
                        )
                    }
                    <View style={{ marginVertical: 60 }} />
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewP: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
    text: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: 'black' 
    },
    card: {
        flex: 1,
        padding: 5,
        margin: 0,
        marginHorizontal: 5,
        marginVertical: 15,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: 'white'
    },
    titleContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    }
});

const mapStateToProps = (state) => ({
    itemSelected: state.GerenciarReducer.itemSelected,
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps, {})(AusentesG);
