import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet
} from 'react-native';

import { connect } from 'react-redux';
import {
    SearchBar
} from 'react-native-elements';
import _ from 'lodash';

import { colorAppForeground } from '../../../../../utils/Constantes';
import {
    modificaEnquetes,
    modificaFilterLoad,
    modificaFilterStr,
    modificaClean
} from '../../admin/enquetes/EnquetesActions';

import ProfileEnquetesCard from './ProfileEnquetesCard';
import Card from '../../../../../tools/elements/Card';
import MonthPicker from '../../../../../tools/month/MonthPicker';
import firebase from '../../../../../utils/Firebase';

class ProfileEnquetesHistoricoMain extends React.Component {
    constructor(props) {
        super(props);

        this.scrollView = null;
        this.dbFirebaseRef = firebase.database().ref();
        this.enquetesListener = null;

        this.state = {
            indicatorOn: true,
            yearFilter: new Date().getFullYear(),
            monthFilter: '',
        };
    }

    componentDidMount = () => {
        const { grupoSelected } = this.props;

        if (grupoSelected && grupoSelected.key) {
            this.enquetesListener = this.dbFirebaseRef
            .child(`grupos/${grupoSelected.key}/enquetes`);

            this.enquetesListener.on('value', (snapshot) => {
                let snapVal = null;
                
                if (snapshot) {
                    snapVal = snapshot.val();

                    if (snapVal) {
                        const enquetesList = _.map(
                            snapshot.val(), (value, key) => ({ key, ...value })
                        );
        
                        // LISTA DE TODAS AS ENQUETES
                        this.props.modificaEnquetes(enquetesList);
    
                        return;
                    }
                }
    
                this.props.modificaEnquetes([]);
            });
        }
    }

    componentWillUnmount = () => {
        this.props.modificaClean();
        if (this.enquetesListener) this.enquetesListener.off();
    }

    onFilterEnqueteEdit = (enquetes, filterStr) => {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(enquetes, (item) => (
                (item.titulo && item.titulo.toLowerCase().includes(lowerFilter))
        ));
    }

    doDateFilter = (value, type) => {
        if (type === 'month') {
            this.setState({ monthFilter: value });
        } else if (type === 'year') {
            this.setState({ yearFilter: value });
        }
    }

    renderEnquetes = (enquetes) => {
        const reverseEnquetes = _.reverse([...enquetes]);
        let enquetesView = null;

        if (enquetes.length) {
            enquetesView = (
                reverseEnquetes.map((item, index) => {
                    if ((index + 1) > 30) {
                        return false;
                    }

                    return (
                        <ProfileEnquetesCard
                            key={index}
                            enquete={item}
                            isResult
                            isHistory
                            userKey={this.props.userLogged.key}
                        />
                    );
                })
            );
        }

        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return enquetesView;
    }

    renderBasedFilterOrNot = () => {
        const { enquetes, filterStr } = this.props;
        const closedEnq = _.filter(enquetes, enqt => enqt.status === '2');
        const { monthFilter, yearFilter } = this.state;

        let filtredEnq = closedEnq;
        let enquetesView = null;

        if (closedEnq) {
            if (yearFilter) {
                filtredEnq = _.filter(filtredEnq, (enqt) => 
                    enqt.dataCriacao && enqt.dataCriacao.includes(`/${yearFilter}`)
                );
            }

            if (monthFilter) {
                filtredEnq = _.filter(filtredEnq, (enqt) => 
                    enqt.dataCriacao && enqt.dataCriacao.includes(`/${monthFilter}/`)
                );
            }

            if (filterStr) {
                enquetesView = this.renderEnquetes(
                    this.onFilterEnqueteEdit(filtredEnq, filterStr)
                );
            } else {
                enquetesView = this.renderEnquetes(filtredEnq);
            }
        }
        return enquetesView;
    }

    renderEditar = () => (
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
                                this.props.enquetes &&
                                this.props.enquetes.length > 0 && 
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
                            placeholder='Buscar enquete...' 
                        />
                    </Card>
                    { this.renderBasedFilterOrNot() }
                    <View style={{ marginBottom: 30 }} />
                </View>
            </ScrollView>
        </View>
    )

    render = () => (
        <View style={styles.viewPrinc}>
            <View style={{ flex: 0.8 }}>
                <ScrollView 
                    style={{ flex: 1 }} 
                    ref={(ref) => { this.scrollView = ref; }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    { this.renderEditar() }
                    <View style={{ marginVertical: 20 }} />
                </ScrollView>
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
        paddingHorizontal: 10
    }
});

const mapStateToProps = (state) => ({
    enquetes: state.EnquetesReducer.enquetes,
    filterStr: state.EnquetesReducer.filterStr,
    filterLoad: state.EnquetesReducer.filterLoad,
    conInfo: state.LoginReducer.conInfo,
    userLogged: state.LoginReducer.userLogged,
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps, {
    modificaEnquetes,
    modificaFilterLoad,
    modificaFilterStr,
    modificaClean
})(ProfileEnquetesHistoricoMain);
