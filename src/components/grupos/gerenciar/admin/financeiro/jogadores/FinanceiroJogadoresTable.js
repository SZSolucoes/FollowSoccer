/* eslint-disable max-len */
import React, { Component } from 'react';
import { 
    View,
    Text,
    Alert,
    FlatList,
    Platform,
    Animated,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { Icon, Button } from 'react-native-elements';
import Moment from 'moment';
import _ from 'lodash';
import { connect } from 'react-redux';

import firebase from '../../../../../../utils/Firebase';
import FinanceiroJogadoresTableRows from './FinanceiroJogadoresTableRow';
import { checkConInfo, showDropdownAlert } from '../../../../../../utils/SystemEvents';
import { normalize } from '../../../../../../utils/StrComplex';
import { colorAppTertiary, ERROS } from '../../../../../../utils/Constantes';
import { retrieveUpdUserGroup } from '../../../../../../utils/UserUtils';
import { isPortrait } from '../../../../../../utils/Screen';
import { modifySearchValue } from '../../../../../../tools/searchbar/SearchBarActions';
import MonthSelector from '../../../../../../tools/month/MonthSelector';

class FinanceiroJogadoresTable extends Component {
    constructor(props) { 
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
        this.yearNow = new Date().getFullYear();

        this.animCalendarWidth = new Animated.Value();
        this.animCalendarHeight = new Animated.Value();
        this.animCalendarTranslateX = new Animated.Value(Dimensions.get('window').width);

        this.calendarDims = {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height
        };
        this.isCalendarOpened = false;
        this.isAnimating = false;

        this.isPortrait = isPortrait();
        
        this.state = { 
            width: Dimensions.get('window').width,
            yearNumber: this.yearNow,
            years: [this.yearNow.toString()],
            dropWidth: 0,
            month: Moment(),
            loadingPag: false
        };
    }

    componentDidMount = () => {
        Dimensions.addEventListener('change', this.changedOrientation);

        this.isPortrait = isPortrait();

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

        this.props.modifySearchValue('');
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

    onPressDateBtn = (showCalendar = false, brokeAnim = false) => {
        if (!this.isAnimating || brokeAnim) {
            if (showCalendar && this.isPortrait) { 
                if (!this.isCalendarOpened) {
                    this.animCalendarWidth.setValue(0);
                    this.animCalendarHeight.setValue(0);
                    this.animCalendarTranslateX.setValue(0);
                }
                
                this.isAnimating = true;
                Animated.parallel([
                    Animated.spring(
                        this.animCalendarWidth,
                        {
                            toValue: this.calendarDims.width
                        }
                    ),
                    Animated.spring(
                        this.animCalendarHeight,
                        {
                            toValue: this.calendarDims.height
                        }
                    )
                ]).start(() => {
                    this.isCalendarOpened = true;
                    this.isAnimating = false;
                });
            } else if (this.isCalendarOpened) {
                this.isAnimating = true;
                Animated.parallel([
                    Animated.spring(
                        this.animCalendarWidth,
                        {
                            toValue: 0,
                            bounciness: 0
                        }
                    ),
                    Animated.spring(
                        this.animCalendarHeight,
                        {
                            toValue: 0,
                            bounciness: 0
                        }
                    )
                ]).start(() => {
                    this.animCalendarTranslateX.setValue(this.calendarDims.width);
                    this.isCalendarOpened = false;
                    this.isAnimating = false;
                });
            }
        }
    }

    onMonthSelected = (date) => {
        this.setState({ month: date });
    }

    onPressConfirmarPagAll = (listUsuarios) => {
        const yearNumber = parseInt(this.state.month.format('YYYY'), 10);
        const monthName = this.state.month.format('MMMM');
        const keyGroup = this.props.grupoSelected.key;
        const valorIndividual = this.props.grupoSelected.valorindividual;
        const groupCobType = this.props.grupoSelected.tipocobranca;
        const cobrancaGroup = this.props.grupoSelected.cobranca;
        let message = '';

        if (this.props.searchValue.trim()) {
            message = `Confirma o pagamento referente a "${monthName}" de "${yearNumber}" para todos os usuários filtrados ?`;
        } else {
            message = `Confirma o pagamento referente a "${monthName}" de "${yearNumber}" para todos os usuários ?`;
        }

        const funExec = () => {
            this.setState({ loadingPag: true });
            
            const newListPlayers = {};
            const yearNode = cobrancaGroup && cobrancaGroup[yearNumber] ? cobrancaGroup[yearNumber] : null;
            for (let index = 0; index < listUsuarios.length; index++) {
                const element = listUsuarios[index];
                
                const playerCob = yearNode && yearNode[groupCobType] && yearNode[groupCobType][element.key] ? yearNode[groupCobType][element.key] : {};

                newListPlayers[element.key] = { ...playerCob, [monthName.slice(0, 3).toLocaleLowerCase()]: valorIndividual };
            }

            const dbCobrancaYearRef = this.dbFirebaseRef
            .child(`grupos/${keyGroup}/cobranca/${yearNumber}/${groupCobType}`);

            dbCobrancaYearRef.update({
                ...newListPlayers
            }).then(() => {
                this.setState({ loadingPag: false });
                showDropdownAlert(
                    'success',
                    'Sucesso!',
                    'Pagamentos realizados com sucesso.'
                );
            }).catch(() => {
                this.setState({ loadingPag: false });
                showDropdownAlert(
                    'error', 
                    ERROS.financeiroAllPag.erro, 
                    ERROS.financeiroAllPag.mes
                );
            });
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

    changedOrientation = ({ window }) => {
        this.calendarDims.width = window.width;
        this.calendarDims.height = window.height;

        this.isPortrait = isPortrait();

        if (this.isCalendarOpened) this.onPressDateBtn(true);
        
        this.setState({ width: window.width });
    }
 
    keyExtractor = (item, index) => index.toString()

    parsePlayersList = (group, listPlayers, year) => {
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
                        onPress={() => this.onPressDateBtn(!this.isCalendarOpened)}
                    >
                        <Icon
                            name='calendar-multiple-check' 
                            type='material-community' 
                            size={28} color='white' 
                        />   
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )

    renderTotal = (group, listPlayers, year) => {
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
 
    renderMonthBatch = (listUsuarios) => {
        let dtDiff = 2;

        if (this.props.grupoSelected) {
            const dtYearGroup = parseInt(Moment(
                this.props.grupoSelected.dtcriacao,
                typeof this.props.grupoSelected.dtcriacao === 'number'
                ? undefined : 'DD-MM-YYYY'
            )
            .format('YYYY'), 10);
    
            dtDiff = this.yearNow - dtYearGroup;
        }

        const minDate = Moment(`01-01-${this.yearNow - dtDiff}`, 'DD-MM-YYYY');
        const maxDate = Moment(`31-12-${this.yearNow}`, 'DD-MM-YYYY');

        const monthProps = 
        ({ 
            minDate,
            maxDate,
            initialView: maxDate
        });
        
        return (
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: this.animCalendarWidth,
                    height: this.animCalendarHeight,
                    zIndex: 400,
                    overflow: 'hidden',
                    transform: [
                        { translateX: this.animCalendarTranslateX }, 
                        /* { 
                            scaleX: this.animCalendarWidth.interpolate({
                                inputRange: [0, this.calendarDims.width],
                                outputRange: [0.1, 1],
                                extrapolate: 'clamp'
                            }) 
                        },
                        { 
                            scaleY: this.animCalendarHeight.interpolate({
                                inputRange: [0, this.calendarDims.height],
                                outputRange: [0.1, 1],
                                extrapolate: 'clamp'
                            }) 
                        } */
                    ]
                }}
            >
                <View style={{ backgroundColor: 'white', flex: 1 }}>
                    <MonthSelector
                        selectedDate={this.state.month}
                        onMonthTapped={(date) => this.onMonthSelected(date)}
                        {...monthProps}
                    />
                    <Button 
                        small
                        loading={this.state.loadingPag}
                        disabled={this.state.loadingPag}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loadingPag ? ' ' : 'Pagar todos'} 
                        buttonStyle={{ width: '100%', marginTop: 10 }}
                        onPress={() => checkConInfo(() => this.onPressConfirmarPagAll(listUsuarios))}
                    />
                    <Button 
                        small
                        loading={this.state.loadingPag}
                        disabled={this.state.loadingPag}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loadingPag ? ' ' : 'Cancelar'} 
                        buttonStyle={{ width: '100%', marginTop: 10 }}
                        onPress={() => this.onPressDateBtn(false)}
                    />
                </View>
            </Animated.View>
        );
    }

    render = () => {
        const { grupoSelected } = this.props;
        let listUsuarios = grupoSelected.participantes ? _.values(grupoSelected.participantes) : [];
        listUsuarios = _.map(listUsuarios, (itemA) => {
            const updatedImg = retrieveUpdUserGroup(
                itemA.key, 
                'imgAvatar', 
                itemA
            );
            const imgAvatar = updatedImg ? 
            { uri: updatedImg } : { uri: '' };
    
            const nome = retrieveUpdUserGroup(
                itemA.key, 
                'nome', 
                itemA
            );

            return { ...itemA, imgAvatar, nome };
        });

        listUsuarios = _.filter(listUsuarios, (item) => { 
            const playerName = this.props.searchValue.trim();
            if (!playerName) return true;

            return item.nome.toLowerCase().includes(playerName.toLowerCase());
        });

        listUsuarios = _.orderBy(listUsuarios, ['nome'], ['asc']);

        return (
            <View style={{ flex: 1 }}>
                {this.renderYearBar()}
                <View style={{ flex: 1 }}>
                    <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 }}>
                        <FlatList
                            data={this.parsePlayersList(grupoSelected, listUsuarios, this.state.yearNumber)}
                            extraData={this.state}
                            style={{ 
                                flex: 1,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                width: this.state.width 
                            }}
                            keyExtractor={this.keyExtractor}
                            renderItem={this.renderItem}
                            ListFooterComponent={(
                                <View style={{ marginBottom: 50 }} />
                            )}
                        />
                        <View style={{ marginVertical: 25 }} />
                        {this.renderTotal(grupoSelected, listUsuarios, this.state.yearNumber)}
                    </View>
                    {this.renderMonthBatch(listUsuarios)}
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected,
    searchValue: state.SearchBarReducer.searchValue
});

export default connect(mapStateToProps, {
    modifySearchValue
})(FinanceiroJogadoresTable);

