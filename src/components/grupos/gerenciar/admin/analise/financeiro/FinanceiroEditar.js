import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    Text,
    Platform
} from 'react-native';
import { TextMask } from 'react-native-masked-text';

import { connect } from 'react-redux';
import {
    Icon,
    SearchBar,
    Divider
} from 'react-native-elements';
import _ from 'lodash';

import { colorAppF } from '../../../../utils/constantes';
import { checkConInfo } from '../../../../utils/jogosUtils';
import { showAlert } from '../../../../utils/store';
import { normalize } from '../../../../utils/strComplex';
import ListItem from '../../../tools/ListItem';
import Card from '../../../tools/Card';
import {
    modificaFilterLoad,
    modificaFilterStr,
    modificaItemSelected,
    modificaFlagRemoveAnaliseFina,
    modificaClean
} from '../../../../actions/FinanceiroActions';
import { modificaRemocao } from '../../../../actions/AlertSclActions';

class FinanceiroEditar extends React.Component {

    constructor(props) {
        super(props);

        this.scrollView = null;

        this.onPressEditRemove = this.onPressEditRemove.bind(this);
        this.renderListFinaEdit = this.renderListFinaEdit.bind(this);
        this.onFilterFinaEdit = this.onFilterFinaEdit.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.renderTitleAndIcons = this.renderTitleAndIcons.bind(this);
    }

    componentWillUnmount() {
        this.props.modificaClean();
    }

    onPressEditRemove(item) {
        this.props.modificaItemSelected(item);
        this.props.modificaFlagRemoveAnaliseFina(true);
        this.props.modificaRemocao(true);
        showAlert('danger', 'Remover!', 'Confirma a remoção ?');
    }

    onFilterFinaEdit(listFina, filterStr) {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(listFina, (item) => (
                (item.data && item.data.toLowerCase().includes(lowerFilter))
        ));
    }

    renderTitleAndIcons(item) {
        return (
            <View 
                style={{ 
                    flex: 1, 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: 10
                }}
            >
                <Text 
                    style={{   
                        fontSize: normalize(14),
                        ...Platform.select({
                            ios: {
                                fontWeight: 'bold',
                            },
                            android: {
                                fontFamily: 'sans-serif',
                                fontWeight: 'bold',
                            },
                        }),
                        textAlign: 'center',
                        color: '#43484d',
                    }}
                >
                    {item.data}
                </Text>
                <View 
                    style={{ 
                        flex: 1,
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <TouchableOpacity
                        onPress={() => checkConInfo(
                            () => this.onPressEditRemove(item)
                        )}
                    >
                        <Icon
                            name='delete' 
                            type='material-community' 
                            size={30} color='red' 
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    renderListFinaEdit(listFina) {
        const reverseListFina = _.reverse([...listFina]);
        let finasView = null;

        if (listFina.length) {
            finasView = (
                reverseListFina.map((item, index) => {
                    let valorReceita = 0;
                    let valorDespesa = 0;
                    let resultado = 0;

                    if (item.receita) {
                        valorReceita = item.receita.valor;
                    } 

                    if (item.despesa) {
                        valorDespesa = item.despesa.valor;
                    } 

                    resultado = valorReceita - valorDespesa;

                    return (
                        <View key={index}>
                            <Card 
                                containerStyle={styles.card}
                            >
                                <View>
                                    {this.renderTitleAndIcons(item)}
                                </View>
                                <Divider style={{ marginTop: 10 }} />
                                <View style={{ marginBottom: 5 }}>
                                    <ListItem
                                        hideChevron
                                        containerStyle={{ borderBottomWidth: 0 }}
                                        title={'Receita'}
                                        titleStyle={{ fontSize: 18 }}
                                        subtitle={
                                            <TextMask 
                                                value={valorReceita}
                                                type={'money'}
                                                style={{ fontSize: 20, color: 'blue' }}
                                                options={{
                                                    unit: 'R$ '
                                                }}
                                            />
                                        }
                                        leftIcon={{ 
                                            name: 'arrow-up-bold', 
                                            type: 'material-community', 
                                            size: 28, 
                                            color: 'blue' 
                                        }}
                                    />
                                    <ListItem
                                        hideChevron
                                        containerStyle={{ borderBottomWidth: 1 }}
                                        title={'Despesa'}
                                        titleStyle={{ fontSize: 18 }}
                                        subtitle={
                                            <TextMask 
                                                value={valorDespesa}
                                                type={'money'}
                                                style={{ fontSize: 20, color: 'red' }}
                                                options={{
                                                    unit: 'R$ '
                                                }}
                                            />
                                        }
                                        leftIcon={{ 
                                            name: 'arrow-down-bold', 
                                            type: 'material-community', 
                                            size: 28, 
                                            color: 'red' 
                                        }}
                                    />
                                    <ListItem
                                        hideChevron
                                        containerStyle={{ borderBottomWidth: 0 }}
                                        title={'Resultado'}
                                        titleStyle={{ fontSize: 18 }}
                                        subtitle={
                                            <TextMask 
                                                value={resultado}
                                                type={'money'}
                                                style={{ 
                                                    fontSize: 20,
                                                    color: resultado < 0 ? 'red' : 'blue'
                                                }}
                                                options={{
                                                    unit: resultado < 0 ? '- R$ ' : 'R$ ' 
                                                }}
                                            />
                                        }
                                        leftIcon={{ 
                                            name: 'arrow-up-bold', 
                                            type: 'material-community', 
                                            size: 28, 
                                            color: 'transparent' 
                                        }}
                                    />
                                </View>
                                <View style={{ marginVertical: 5 }} />
                            </Card>
                        </View>
                    );
                })
            );
        }

        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return finasView;
    }

    renderBasedFilterOrNot() {
        const { listFina, filterStr } = this.props;

        let finasView = null;
        if (listFina) {
            if (filterStr) {
                finasView = this.renderListFinaEdit(
                    this.onFilterFinaEdit(listFina, filterStr)
                );
            } else {
                finasView = this.renderListFinaEdit(listFina);
            }
        }
        return finasView;
    }

    render() {
        return (
            <View style={styles.viewPrinc}>
                <ScrollView 
                    style={{ flex: 1 }} 
                    ref={(ref) => { this.scrollView = ref; }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    <View>
                        <Card 
                            containerStyle={styles.card}
                        >
                            <SearchBar
                                round
                                lightTheme
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                clearIcon={!!this.props.filterStr}
                                showLoadingIcon={
                                    this.props.listFina &&
                                    this.props.listFina.length > 0 && 
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
                                placeholder='Buscar data...' 
                            />
                            { this.renderBasedFilterOrNot() }
                        </Card>
                        <View style={{ marginBottom: 30 }} />
                    </View>
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
    }
});

const mapStateToProps = (state) => ({
    listFina: state.FinanceiroReducer.listFina,
    filterStr: state.FinanceiroReducer.filterStr,
    filterLoad: state.FinanceiroReducer.filterLoad,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {
    modificaFilterLoad,
    modificaFilterStr,
    modificaItemSelected,
    modificaFlagRemoveAnaliseFina,
    modificaClean,
    modificaRemocao
})(FinanceiroEditar);
