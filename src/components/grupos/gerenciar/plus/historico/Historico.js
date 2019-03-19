import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import {
    SearchBar
} from 'react-native-elements';
import _ from 'lodash';

import firebase from '../../../../../utils/Firebase';
import MonthPicker from '../../../../../tools/month/MonthPicker';
import Card from '../../../../../tools/elements/Card';
import { 
    colorAppSecondary, 
    colorAppForeground, 
    colorAppPrimary 
} from '../../../../../utils/Constantes';
import Versus from '../../jogos/Versus';
import { 
    modificaFilterStr, 
    modificaFilterLoad, 
    modificaItemSelected,
    modificaListJogos,
    modificaClean
} from './HistoricoActions';
import { store } from '../../../../../App';

class Historico extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            indicatorOn: true,
            yearFilter: new Date().getFullYear(),
            monthFilter: '',
        };

        this.fbDatabaseRef = firebase.database().ref();

        this.scrollView = null;
    }

    componentDidMount = () => {
        const { grupoSelected } = this.props;
        if (grupoSelected && grupoSelected.key) { 
            this.fbDatabaseRef.child(`grupos/${grupoSelected.key}/jogos`)
            .orderByChild('endStatus')
            .equalTo('1')
            .once('value', (snapshot) => {
                if (snapshot) {
                    this.props.modificaListJogos(
                        _.map(snapshot.val(), (value, key) => ({ key, ...value }))
                    );
                }
                this.setState({ indicatorOn: false });
            });
        } else {
            this.setState({ indicatorOn: false });
        }
    }

    componentWillUnmount = () => {
        this.props.modificaClean();
    }

    onFilterJogos = (jogos, filterStr) => {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(jogos, (jogo) => (
                (jogo.titulo && jogo.titulo.toLowerCase().includes(lowerFilter)) ||
                (jogo.descricao && jogo.descricao.toLowerCase().includes(lowerFilter)) ||
                (jogo.data && jogo.data.toLowerCase().includes(lowerFilter)) ||
                `${jogo.placarCasa}x${jogo.placarVisit}`.includes(lowerFilter)
        ));
    }

    onPressCardGame = (item) => {
        this.props.modificaItemSelected(item.key);
        store.dispatch({
            type: 'modifica_itemselectedausente_jogos',
            payload: item.key
        });
        Actions.historicoJogoTab({ onBack: () => Actions.popTo('historico') });
    }

    doDateFilter = (value, type) => {
        if (type === 'month') {
            this.setState({ monthFilter: value });
        } else if (type === 'year') {
            this.setState({ yearFilter: value });
        }
    }

    renderListJogos = (jogos) => {
        const reverseJogos = _.reverse([...jogos]);
        const jogosView = reverseJogos.map((item, index) => {
            const titulo = item.titulo ? item.titulo : ' ';
            const data = item.data ? item.data : ' ';
            const placarCasa = item.placarCasa ? item.placarCasa : '0'; 
            const placarVisit = item.placarVisit ? item.placarVisit : '0';
            let tituloConcat = '';

            if (titulo) {
                tituloConcat = titulo;
            }
            if (data) {
                tituloConcat += ` - ${data}`;
            }

            return (
                <View key={index}>
                    <TouchableOpacity
                        onPress={() => this.onPressCardGame(item)}
                    >
                        <Card 
                            title={tituloConcat} 
                            containerStyle={styles.card}
                        >
                            <Versus
                                jogo={item}
                                placarCasa={placarCasa} 
                                placarVisit={placarVisit}  
                            />
                        </Card>
                    </TouchableOpacity>
                    <View style={{ marginBottom: 10 }} />
                </View>
            );
        });
        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return jogosView;
    }

    renderBasedFilterOrNot = () => {
        const { listJogos, filterStr } = this.props;
        const { monthFilter, yearFilter } = this.state;
        let filtredJogos = listJogos;
        let jogosView = null;

        if (listJogos) {
            if (yearFilter) {
                filtredJogos = _.filter(filtredJogos, (jogo) => 
                    jogo.data && jogo.data.includes(`/${yearFilter}`)
                );
            }
            if (monthFilter) {
                filtredJogos = _.filter(filtredJogos, (jogo) => 
                    jogo.data && jogo.data.includes(`/${monthFilter}/`)
                );
            }

            if (filterStr) {
                jogosView = this.renderListJogos(
                    this.onFilterJogos(filtredJogos, filterStr)
                );
            } else {
                jogosView = this.renderListJogos(filtredJogos);
            }
        }
        return jogosView;
    }

    renderEditar = () => (
        <Card containerStyle={styles.card}>
            <SearchBar
                round
                lightTheme
                autoCapitalize={'none'}
                autoCorrect={false}
                clearIcon={!!this.props.filterStr}
                showLoadingIcon={
                    this.props.listJogos &&
                    this.props.listJogos.length > 0 && 
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
                placeholder='Buscar jogo...' 
            />
            { this.renderBasedFilterOrNot() }
        </Card>
    )

    render = () => (
        <View style={styles.viewPrinc}>
            <View style={{ flex: 0.8 }}>
                {
                    this.state.indicatorOn ?
                    (
                        <View
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ActivityIndicator size={'large'} color={colorAppPrimary} />
                        </View>
                    )
                    :
                    (
                        <ScrollView 
                            style={{ flex: 1 }} 
                            ref={(ref) => { this.scrollView = ref; }}
                            keyboardShouldPersistTaps={'handled'}
                        >
                            { this.renderEditar() }
                            <View style={{ marginVertical: 20 }} />
                        </ScrollView>
                    )
                }
            </View>
            <View style={{ flex: 0.2 }}>
                <MonthPicker 
                    orientation={'vertical'}
                    onSelectYear={(value) => this.doDateFilter(value, 'year')}
                    onPressMonth={(value, number) => this.doDateFilter(number, 'month')}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colorAppForeground
    },
    card: {
        paddingHorizontal: 10,
    },
    dropCard: { 
        backgroundColor: colorAppSecondary,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: 0,
    },
    dropCardRed: { 
        backgroundColor: 'red',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
    }
});

const mapStateToProps = (state) => ({
    listJogos: state.HistoricoReducer.listJogos,
    filterStr: state.HistoricoReducer.filterStr,
    filterLoad: state.HistoricoReducer.filterLoad,
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps, {
    modificaFilterStr, 
    modificaFilterLoad, 
    modificaItemSelected,
    modificaListJogos,
    modificaClean
})(Historico);
