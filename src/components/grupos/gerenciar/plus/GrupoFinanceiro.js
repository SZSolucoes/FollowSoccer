import React from 'react';
import { 
    View,
    Text,
    Platform,
    ScrollView, 
    StyleSheet,
} from 'react-native';
import { TextMask } from 'react-native-masked-text';

import { connect } from 'react-redux';
import {
    SearchBar,
    Divider
} from 'react-native-elements';
import _ from 'lodash';
import b64 from 'base-64';

import { colorAppForeground } from '../../../../utils/Constantes';
import { normalize } from '../../../../utils/StrComplex';
import ListItem from '../../../../tools/elements/ListItem';
import Card from '../../../../tools/elements/Card';
import firebase from '../../../../utils/Firebase';

class GrupoFinanceiro extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
        this.scrollView = null;
        this.dbFinanceiroRef = null;

        this.state = {
            listFina: [],
            filterLoad: false,
            filterStr: ''
        };
    }

    componentDidMount = () => {
        const { grupoSelected } = this.props;
        const lValid = grupoSelected && typeof grupoSelected === 'object' && grupoSelected.key;

        if (lValid) {
            this.dbFinanceiroRef = this.dbFirebaseRef
            .child(`grupos/${grupoSelected.key}/financeiro`);
            this.dbFinanceiroRef.on('value', snap => {
                if (snap) {
                    const snapVal = snap.val();
                    if (snapVal) {
                        const mappedValues = _.map(snapVal, (ita, key) => { 
                            const keyDecoded = b64.decode(key);

                            return {
                                key, 
                                ...ita,
                                data: keyDecoded,
                                dataReversed: keyDecoded.split('').reverse().join('')
                            };
                        });
                        
                        this.setState({ 
                            listFina: _.orderBy(mappedValues, ['dataReversed'], ['desc']), 
                            loading: false 
                        });
                        
                        return;
                    }
                } 
    
                this.setState({ listFina: [], loading: false });
            });
        }
    }

    componentWillUnmount = () => {
        if (this.dbFinanceiroRef) this.dbFinanceiroRef.off();
    }

    onFilterFinaEdit = (listFina, filterStr) => {
        const lowerFilter = filterStr.trim().toLowerCase();
        return _.filter(listFina, (item) => (
                (item.data && item.data.toLowerCase().includes(lowerFilter))
        ));
    }

    renderTitleAndIcons = (item) => (
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
        </View>
    )

    renderListFinaEdit = (listFina) => {
        let finasView = false;

        if (listFina.length) {
            finasView = (
                listFina.map((item, index) => {
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

        setTimeout(() => this.setState({ filterLoad: false }), 1000);

        return finasView;
    }

    renderBasedFilterOrNot = () => {
        const { listFina, filterStr } = this.state;

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

    render = () => (
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
                            clearIcon={!!this.state.filterStr}
                            showLoadingIcon={
                                this.state.listFina &&
                                this.state.listFina.length > 0 && 
                                this.state.filterLoad
                            }
                            containerStyle={{ 
                                backgroundColor: 'transparent',
                                borderTopWidth: 0, 
                                borderBottomWidth: 0
                            }}
                            searchIcon={{ size: 26 }}
                            value={this.state.filterStr}
                            onChangeText={(value) => this.setState({
                                filterStr: value,
                                filterLoad: true
                            })}
                            onClear={() => this.setState({ filterStr: '' })}
                            placeholder='Buscar data...' 
                        />
                        { this.renderBasedFilterOrNot() }
                    </Card>
                    <View style={{ marginBottom: 30 }} />
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
    card: {
        paddingHorizontal: 10,
    }
});

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {
})(GrupoFinanceiro);
