/* eslint-disable max-len */
import React, { PureComponent } from 'react';
import { 
    View, 
    Text,
    StyleSheet,
    ScrollView
} from 'react-native';
import { CheckBox, Divider } from 'react-native-elements';

import ListItem from '../../../../../../tools/elements/ListItem';
import Card from '../../../../../../tools/elements/Card';
import { colorAppField } from '../../../../../../utils/Constantes';

export default class FinanceiroJogadoresTableRow extends PureComponent {
    renderHeader = () => {
        const headerView = (
            <View style={styles.header}>
                <View style={styles.monthHeader}>
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
            </View>
        );

        return headerView;
    };

    render = () => (
        <Card>
            <View style={styles.jogadorCell}>
                <ListItem
                    avatar={this.props.item.jogador.imgAvatar}
                    hideChevron
                    title={this.props.item.jogador.nome}
                    titleStyle={{
                        fontWeight: '500',
                        fontSize: 16
                    }}
                    titleContainerStyle={{ marginLeft: 10 }}
                    containerStyle={{
                        borderBottomWidth: 0
                    }}
                />
            </View>
            <Divider style={{ marginBottom: 5 }} />
            <ScrollView
                horizontal
                contentContainerStyle={{
                    flexGrow: 1,
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginVertical: 5
                }}
            >
                <View style={{ width: this.props.width + 1000 }}>
                    {this.renderHeader()}
                    <View
                        style={styles.row} 
                    >
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.jan}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.jan,
                                            month: 'jan', 
                                            monthName: 'Janeiro', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.fev}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.fev,
                                            month: 'fev', 
                                            monthName: 'Fevereiro', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.mar}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.mar,
                                            month: 'mar', 
                                            monthName: 'Março', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.abr}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.abr,
                                            month: 'abr', 
                                            monthName: 'Abril', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.mai}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.mai,
                                            month: 'mai', 
                                            monthName: 'Maio', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.jun}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.jun,
                                            month: 'jun', 
                                            monthName: 'Junho', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.jul}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.jul,
                                            month: 'jul', 
                                            monthName: 'Julho', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.ago}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.ago,
                                            month: 'ago', 
                                            monthName: 'Agosto', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.set}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.set,
                                            month: 'set', 
                                            monthName: 'Setembro', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.out}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.out,
                                            month: 'out', 
                                            monthName: 'Outubro', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.nov}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.nov,
                                            month: 'nov', 
                                            monthName: 'Novembro', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                        <View style={styles.monthCell}>
                            <CheckBox
                                title={'Pago'}
                                size={22}
                                containerStyle={{ 
                                    margin: 5, 
                                    marginLeft: 5, 
                                    marginRight: 5 
                                }}
                                textStyle={{ margin: 0 }}
                                checked={!!this.props.item.dez}
                                onPress={() => this.props.onPressItem(
                                        { ...this.props.item }, 
                                        this.props.index,
                                        {
                                            hasCheck: !!this.props.item.dez,
                                            month: 'dez', 
                                            monthName: 'Dezembro', 
                                            yearNumber: this.props.yearNumber, 
                                            playerName: this.props.item.jogador.nome,
                                            playerKey: this.props.item.jogador.key
                                        }
                                    )
                                }
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
            <Divider style={{ marginTop: 5, marginBottom: 10 }} />
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, fontFamily: 'OpenSans-Bold' }}>
                    {'Total: '}
                </Text>
                <Text style={{ fontSize: 14, fontFamily: 'OpenSans-SemiBold' }}>
                        R$ {parseFloat(Math.round(this.props.item.total * 100) / 100).toFixed(2)}
                </Text>
            </View>
        </Card>
    )
}

const headerAndCells = {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 10
};

const styles = StyleSheet.create({
    monthHeader: {
        flex: 1,
        ...headerAndCells
    },
    monthCell: {
        flex: 1.5,
        ...headerAndCells,
        height: 85,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15
    },
    textHeader: {
        fontSize: 14,
        textAlign: 'center',
        color: 'white',
        fontFamily: 'OpenSans-SemiBold',
    },
    header: {
        width: '100%',
        backgroundColor: colorAppField, 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 1
    },
    row: {
        width: '100%',
        backgroundColor: '#20293F',
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 1
    }
});

