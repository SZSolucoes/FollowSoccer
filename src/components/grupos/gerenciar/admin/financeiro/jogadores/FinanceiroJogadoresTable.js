/* eslint-disable max-len */
import React, { Component } from 'react';
import { 
    View,
    Text,
    Alert,
    FlatList,
    Platform, 
    ScrollView,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { Icon } from 'react-native-elements';
import Moment from 'moment';
import _ from 'lodash';
import { connect } from 'react-redux';

import firebase from '../../../../../../utils/Firebase';
import FinanceiroJogadoresTableRows from './FinanceiroJogadoresTableRow';
import { checkConInfo } from '../../../../../../utils/SystemEvents';
import { normalize } from '../../../../../../utils/StrComplex';
import { colorAppTertiary } from '../../../../../../utils/Constantes';

class FinanceiroJogadoresTable extends Component {
    constructor(props) { 
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
        this.yearNow = new Date().getFullYear();
        
        this.state = { 
            width: Dimensions.get('window').width,
            yearNumber: this.yearNow,
            years: [this.yearNow.toString()],
            dropWidth: 0
        };
    }

    componentDidMount = () => {
        Dimensions.addEventListener('change', this.changedOrientation);

        if (this.props.grupoSelected) {
            const dtYearGroup = parseInt(Moment(
                this.props.grupoSelected.dtcriacao,
                typeof this.props.grupoSelected.dtcriacao === 'number'
                ? undefined : 'DD-MM-YYYY'
            )
            .format('YYYY'), 10);

            const yearsCount = this.yearNow - dtYearGroup;
            const newYears = [this.yearNow.toString()];

            for (let index = 1; index <= yearsCount; index++) {
                newYears.push((this.yearNow - index).toString());
            }

            this.setState({ years: newYears });
        }
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.changedOrientation);
    }

    onPressItem = (item, index, params) => {
        const keyGroup = this.props.grupoSelected.key;
        const valorIndividual = this.props.grupoSelected.valorindividual;
        const groupCobType = this.props.grupoSelected.tipocobranca;

        let message = '';

        if (params.hasCheck) {
            message = `Confirma a remoção do pagamento referente a "${params.monthName}" de "${params.yearNumber}" para o jogador: "${params.playerName}" ?`;
        } else {
            message = `Confirma o pagamento referente a "${params.monthName}" de "${params.yearNumber}" para o jogador: "${params.playerName}" ?`;
        }

        const funExec = () => {
            const dbCobrancaRef = this.dbFirebaseRef
            .child(`grupos/${keyGroup}/cobranca/${params.yearNumber}/${groupCobType}/${params.playerKey}`);

            if (params.hasCheck) {
                dbCobrancaRef.child(params.month).remove().then(() => true).catch((e) => console.log(e));
            } else {
                dbCobrancaRef.update({
                    [params.month]: valorIndividual
                }).then(() => true).catch((e) => console.log(e));
            }
        };

        Alert.alert(
            'Aviso', 
            message,
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

    changedOrientation = (e) => {
        this.setState({ width: e.window.width });
    }
 
    keyExtractor = (item, index) => index.toString()

    parsePlayersList = (group, year) => {
        const listPlayers = group.participantes ? _.values(group.participantes) : [];
        const yearNode = group.cobranca && group.cobranca[year] ? group.cobranca[year] : null;
        const yearTypeNode = yearNode && yearNode[group.tipocobranca] ? yearNode[group.tipocobranca] : null;
        const parsedArray = [];

        listPlayers.forEach((player) => {
            if (group.tipocobranca === 'Mensal') {
                const hasPlayerCob = yearTypeNode && yearTypeNode[player.key];
                let playerTotal = 0;

                if (hasPlayerCob) {
                    const arrPlayerCob = _.values(yearTypeNode[player.key]);
                    for (let index = 0; index < arrPlayerCob.length; index++) {
                        const element = arrPlayerCob[index];
                        playerTotal += element;
                    }
                }

                parsedArray.push({
                    jogador: player,
                    total: playerTotal,
                    jan: hasPlayerCob && yearTypeNode[player.key].jan ? yearTypeNode[player.key].jan : null,
                    fev: hasPlayerCob && yearTypeNode[player.key].fev ? yearTypeNode[player.key].fev : null,
                    mar: hasPlayerCob && yearTypeNode[player.key].mar ? yearTypeNode[player.key].mar : null,
                    abr: hasPlayerCob && yearTypeNode[player.key].abr ? yearTypeNode[player.key].abr : null,
                    mai: hasPlayerCob && yearTypeNode[player.key].mai ? yearTypeNode[player.key].mai : null,
                    jun: hasPlayerCob && yearTypeNode[player.key].jun ? yearTypeNode[player.key].jun : null,
                    jul: hasPlayerCob && yearTypeNode[player.key].jul ? yearTypeNode[player.key].jul : null,
                    ago: hasPlayerCob && yearTypeNode[player.key].ago ? yearTypeNode[player.key].ago : null,
                    set: hasPlayerCob && yearTypeNode[player.key].set ? yearTypeNode[player.key].set : null,
                    out: hasPlayerCob && yearTypeNode[player.key].out ? yearTypeNode[player.key].out : null,
                    nov: hasPlayerCob && yearTypeNode[player.key].nov ? yearTypeNode[player.key].nov : null,
                    dez: hasPlayerCob && yearTypeNode[player.key].dez ? yearTypeNode[player.key].dez : null
                });
            }
        });

        return parsedArray;
    }

    renderSeparator = () => (
        <View
            style={{
            height: 1,
            width: '100%',
            backgroundColor: '#607D8B',
            }}
        />
    )

    renderItem = ({ item, index }) => (
        <FinanceiroJogadoresTableRows 
            key={index} 
            index={index} 
            item={item} 
            onPressItem={this.onPressItem}
            width={this.state.width}
            yearNumber={this.state.yearNumber}
        />
    )

    renderYearBar = () => (
        <View 
            style={{
                paddingHorizontal: 15,
                backgroundColor: colorAppTertiary,
                borderBottomWidth: 0.1,
                borderBottomColor: 'black',
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.5,
                        shadowRadius: 1,
                    },
                    android: {
                        elevation: 1
                    }
                })
            }}
        >
            <View 
                style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
            >
                <View style={{ flex: 0.7 }} />
                <View 
                    style={{ 
                        flex: 2.3, 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: 5
                    }}
                    onLayout={
                        (event) =>
                            this.setState({
                                dropWidth: event.nativeEvent.layout.width
                    })}
                >
                    <ModalDropdown
                        ref={(ref) => { this.modalDropRef = ref; }}
                        textStyle={{
                            color: 'white',
                            fontSize: normalize(16),
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                        style={{
                            width: this.state.dropWidth / 1.5,
                            justifyContent: 'center',
                            height: 36
                        }}
                        dropdownTextStyle={{ 
                            fontSize: normalize(16), 
                            textAlign: 'center'
                        }}
                        dropdownStyle={{
                            width: this.state.dropWidth / 1.5
                        }}
                        options={this.state.years}
                        onSelect={
                            (index, value) => this.setState({ yearNumber: value })
                        }
                        defaultIndex={0}
                        defaultValue={this.state.years[0]}
                    />
                </View>
                <View 
                    style={{ 
                        flex: 0.7, 
                        flexDirection: 'row', 
                        justifyContent: 'flex-end' 
                    }}
                >
                    <TouchableOpacity
                        onPress={() => this.modalDropRef.show()}
                    >
                        <Icon
                            name='calendar-search' 
                            type='material-community' 
                            size={28} color='white' 
                        />   
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )

    renderTotal = (group, year) => {
        const listPlayers = group.participantes ? _.values(group.participantes) : [];
        const yearNode = group.cobranca && group.cobranca[year] ? group.cobranca[year] : null;
        const yearTypeNode = yearNode && yearNode[group.tipocobranca] ? yearNode[group.tipocobranca] : null;
        let playerTotal = 0;

        listPlayers.forEach((player) => {
            if (group.tipocobranca === 'Mensal') {
                const hasPlayerCob = yearTypeNode && yearTypeNode[player.key];
                
                if (hasPlayerCob) {
                    const arrPlayerCob = _.values(yearTypeNode[player.key]);
                    for (let index = 0; index < arrPlayerCob.length; index++) {
                        const element = arrPlayerCob[index];
                        playerTotal += element;
                    }
                }
            }
        });

        return (
            <View 
                style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    left: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 15,
                    backgroundColor: colorAppTertiary,
                    borderBottomWidth: 0.1,
                    borderBottomColor: 'black',
                    ...Platform.select({
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.5,
                            shadowRadius: 1,
                        },
                        android: {
                            elevation: 1
                        }
                    })
                }}
            >
                <Text style={{ color: 'white', fontSize: 14, fontFamily: 'OpenSans-Bold' }}>
                    {'Total arrecadado: '}
                </Text>
                <Text style={{ color: 'white', fontSize: 14, fontFamily: 'OpenSans-SemiBold' }}>
                    R$ {parseFloat(Math.round(playerTotal * 100) / 100).toFixed(2)}
                </Text>
            </View>
        );
    }
 
    render = () => (
        <View style={{ flex: 1 }}>
            {this.renderYearBar()}
            <ScrollView>
                <FlatList
                    stickyHeaderIndices={[0]}
                    data={this.parsePlayersList(this.props.grupoSelected, this.state.yearNumber)}
                    extraData={this.state}
                    style={{ 
                        flex: 1,
                        marginVertical: 10,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        width: this.state.width 
                    }}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderItem}
                    ListFooterComponent={(
                        <View style={{ marginBottom: 50 }} />
                    )}
                />
            </ScrollView>
            <View style={{ marginVertical: 25 }} />
            {this.renderTotal(this.props.grupoSelected, this.state.yearNumber)}
        </View>
    )
}

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps)(FinanceiroJogadoresTable);

