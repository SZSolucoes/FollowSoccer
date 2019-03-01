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
import MonthPicker from '../../tools/MonthPicker';

import { colorAppF } from '../../../utils/constantes';
import {
    modificaFilterLoad,
    modificaFilterStr,
    modificaClean
} from '../../../actions/EnquetesActions';

import ProfileEnquetesCard from './ProfileEnquetesCard';
import Card from '../../../tools/elements/Card';

class ProfileEnquetesHistoricoMain extends React.Component {

    constructor(props) {
        super(props);

        this.scrollView = null;

        this.state = {
            indicatorOn: true,
            yearFilter: new Date().getFullYear(),
            monthFilter: '',
        };

        this.doDateFilter = this.doDateFilter.bind(this);
        this.renderEditar = this.renderEditar.bind(this);
        this.renderEnquetes = this.renderEnquetes.bind(this);
        this.onFilterEnqueteEdit = this.onFilterEnqueteEdit.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
    }

    componentWillUnmount() {
        this.props.modificaClean();
    }

    onFilterEnqueteEdit(enquetes, filterStr) {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(enquetes, (item) => (
                (item.titulo && item.titulo.toLowerCase().includes(lowerFilter))
        ));
    }

    doDateFilter(value, type) {
        if (type === 'month') {
            this.setState({ monthFilter: value });
        } else if (type === 'year') {
            this.setState({ yearFilter: value });
        }
    }

    renderEnquetes(enquetes) {
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

    renderBasedFilterOrNot() {
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

    renderEditar() {
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
        );
    }

    render() {
        return (
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
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colorAppF
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
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {
    modificaFilterLoad,
    modificaFilterStr,
    modificaClean
})(ProfileEnquetesHistoricoMain);
