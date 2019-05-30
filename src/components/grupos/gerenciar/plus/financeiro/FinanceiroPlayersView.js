/* eslint-disable max-len */
import React from 'react';
import {
    View,
    Text,
    Platform,
    ScrollView,
    Dimensions,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import ModalDropdown from 'react-native-modal-dropdown';
import { Icon } from 'react-native-elements';
import Moment from 'moment';
import _ from 'lodash';

import { colorAppTertiary } from '../../../../../utils/Constantes';
import { normalize } from '../../../../../utils/StrComplex';
import { retrieveUpdUserGroup } from '../../../../../utils/UserUtils';

class FinanceiroPlayersView extends React.Component {
    constructor(props) { 
        super(props);

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

    changedOrientation = (e) => {
        this.setState({ width: e.window.width });
    }

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

    renderHeader = () => {
        const headerView = (
            <View style={styles.header}>
                <View style={[styles.monthHeader, { borderLeftWidth: 0 }]}>
                    <Text style={styles.textHeader}> 
                        Janeiro
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Fevereiro
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Março
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Abril
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Maio
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Junho
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Julho
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Agosto
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Setembro
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Outubro
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Novembro
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Dezembro
                    </Text>
                </View>
                <View style={[styles.monthHeader, { backgroundColor: '#8F742E' }]}>
                    <Text style={styles.textHeader}> 
                        Total
                    </Text>
                </View>
            </View>
        );

        return headerView;
    };

    renderRow = (indexKey, key, params) => {
        const color = indexKey % 2 !== 0 ? { backgroundColor: '#BCE774' } : {};
        const rowView = (
            <View key={key}>
                <View style={styles.header}>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.jan}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.fev}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.mar}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.abr}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.mai}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.jun}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.jul}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.ago}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.set}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.out}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.nov}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.dez}
                        </Text>
                    </View>
                    <View style={[styles.monthRow, { ...color }]}>
                        <Text style={styles.textRow}> 
                            {params.total}
                        </Text>
                    </View>
                </View>
            </View>
        );

        return rowView;
    };

    renderPlayerNames = (group) => {
        const listPlayers = group.participantes ? _.values(group.participantes) : [];

        return _.map(listPlayers, (value, indexKey) => {
            const nome = retrieveUpdUserGroup(
                value.key, 
                'nome', 
                value
            );
            return (
                <View 
                    key={`player${indexKey}`} 
                    style={[
                        styles.rowAndHeaderTable, 
                        { ...indexKey % 2 !== 0 ? { backgroundColor: '#BCE774' } : {} }
                    ]}
                >
                    <Text style={styles.rowCells}> 
                        {nome}
                    </Text>
                </View>
            );
        });
    }

    renderPlayerMonths = (group, year) => {
        const listPlayers = group.participantes ? _.values(group.participantes) : [];
        const yearNode = group.cobranca && group.cobranca[year] ? group.cobranca[year] : null;
        const yearTypeNode = yearNode && yearNode[group.tipocobranca] ? yearNode[group.tipocobranca] : null;
        const parsedArray = [];

        listPlayers.forEach((player, indexKey) => {
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

                const jan = hasPlayerCob && 
                yearTypeNode[player.key].jan ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].jan * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const fev = hasPlayerCob && 
                yearTypeNode[player.key].fev ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].fev * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const mar = hasPlayerCob && 
                yearTypeNode[player.key].mar ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].mar * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const abr = hasPlayerCob && 
                yearTypeNode[player.key].abr ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].abr * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const mai = hasPlayerCob && 
                yearTypeNode[player.key].mai ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].mai * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const jun = hasPlayerCob && 
                yearTypeNode[player.key].jun ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].jun * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const jul = hasPlayerCob && 
                yearTypeNode[player.key].jul ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].jul * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const ago = hasPlayerCob && 
                yearTypeNode[player.key].ago ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].ago * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const set = hasPlayerCob && 
                yearTypeNode[player.key].set ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].set * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const out = hasPlayerCob && 
                yearTypeNode[player.key].out ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].out * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const nov = hasPlayerCob && 
                yearTypeNode[player.key].nov ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].nov * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const dez = hasPlayerCob && 
                yearTypeNode[player.key].dez ? 
                `R$ ${parseFloat(Math.round(yearTypeNode[player.key].dez * 100) / 100).toFixed(2)}`
                : 
                ' ';
                const total = `R$ ${parseFloat(Math.round(playerTotal * 100) / 100).toFixed(2)}`;

                parsedArray.push(
                    this.renderRow(indexKey, `month${indexKey}`, {
                        jan, fev, mar, abr, mai, jun, jul, ago, set, out, nov, dez, total
                    })
                );
            }
        });

        return parsedArray;
    }

    render = () => (
        <View style={{ flex: 1 }}>
            {this.renderYearBar()}
            <View>
                <ScrollView>
                    <View style={{ flexDirection: 'row', padding: 5 }}>
                        <View style={{ flex: 4 }}>
                            <View style={[styles.rowAndHeaderTable, { backgroundColor: '#0099E8', borderRightWidth: 0.5, borderRightColor: 'white' }]}>
                                <Text style={styles.textHeader}> 
                                    Jogador
                                </Text>
                            </View>
                        </View>
                        <View style={{ flex: 5 }}>
                            <ScrollView 
                                horizontal
                                ref={ref => (this.scrollHeaderRef = ref)} 
                                disableScrollViewPanResponder={false}
                                scrollEnabled={false}
                                bounces={false}
                                showsHorizontalScrollIndicator={false}
                            >
                                <View style={{ width: this.state.width + 1600 }}>
                                    <View>
                                        {this.renderHeader()}
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </ScrollView>
            </View>
            <ScrollView>
                <View style={{ flexDirection: 'row', padding: 5 }}>
                    <View style={{ flex: 4 }}>
                        {this.renderPlayerNames(this.props.grupoSelected)}
                    </View>
                    <View style={{ flex: 5 }}>
                        <ScrollView 
                            horizontal
                            bounces={false}
                            scrollEventThrottle={1}
                            onScroll={(event) => this.scrollHeaderRef.scrollTo({ x: event.nativeEvent.contentOffset.x, animated: false })}
                        >
                            <View style={{ width: this.state.width + 1600 }}>
                                {this.renderPlayerMonths(this.props.grupoSelected, this.state.yearNumber)}
                            </View>
                        </ScrollView>
                    </View>
                </View>
                <View style={{ marginVertical: 25 }} />
            </ScrollView>
            <View style={{ marginVertical: 25 }} />
            {this.renderTotal(this.props.grupoSelected, this.state.yearNumber)}
        </View>
    )
}

const headerAndCells = {
    paddingHorizontal: 25,
    paddingVertical: 10
};

const styles = StyleSheet.create({
    rowAndHeaderTable: {
        flex: 4, 
        alignItems: 'center', 
        justifyContent: 'center',
        ...headerAndCells
    },
    rowCells: {
        fontSize: 14,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'OpenSans-SemiBold'
    },
    monthHeader: {
        borderLeftWidth: 0.5,
        borderLeftColor: 'white',
        flex: 1,
        ...headerAndCells,
        backgroundColor: '#0099E8'
    },
    monthRow: {
        flex: 1,
        ...headerAndCells
    },
    textHeader: {
        fontSize: 14,
        textAlign: 'center',
        color: 'white',
        fontFamily: 'OpenSans-SemiBold',
    },
    textRow: {
        fontSize: 14,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'OpenSans-SemiBold',
    },
    header: {
        width: '100%',
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 1
    },
    row: {
        width: '100%',
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 1
    }
});

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps)(FinanceiroPlayersView);
