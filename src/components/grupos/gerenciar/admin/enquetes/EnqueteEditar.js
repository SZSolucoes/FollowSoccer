import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';

import { connect } from 'react-redux';
import { 
    Icon,
    SearchBar
} from 'react-native-elements';
import _ from 'lodash';

import { colorAppF } from '../../../utils/constantes';
import { checkConInfo } from '../../../utils/jogosUtils';
import { showAlert } from '../../../utils/store';
import Card from '../../tools/Card';
import {
    modificaFilterLoad,
    modificaFilterStr,
    modificaItemSelected,
    modificaFlagRemoveEnquetes,
    modificaFlagEndEnquetes,
    modificaItemEditModal,
    modificaTituloEditModal,
    modificaOptsEditModal,
    modificaClean
} from '../../../actions/EnquetesActions';
import { modificaRemocao } from '../../../actions/AlertSclActions';
import { ModalContainer } from '../../tools/ModalContainer';
import EnqueteEditModal from './EnqueteEditModal';

import imgFinishFlag from '../../../imgs/finishflag.png';

class EnqueteEditar extends React.Component {

    constructor(props) {
        super(props);

        this.scrollView = null;

        this.state = {
            showModal: false,
            itemEdit: {}
        };

        this.onPressRemove = this.onPressRemove.bind(this);
        this.onPressEnd = this.onPressEnd.bind(this);
        this.renderEnquetes = this.renderEnquetes.bind(this);
        this.onFilterEnqueteEdit = this.onFilterEnqueteEdit.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
    }

    componentWillUnmount() {
        this.props.modificaClean();
    }

    onPressRemove(item) {
        this.props.modificaItemSelected(item);
        this.props.modificaFlagRemoveEnquetes(true);
        this.props.modificaRemocao(true);
        showAlert('danger', 'Remover!', 'Confirma a remoção ?');
    }

    onPressEnd(item) {
        this.props.modificaItemSelected(item);
        this.props.modificaFlagEndEnquetes(true);
        this.props.modificaRemocao(true);
        showAlert('danger', 'Encerrar!', 'Confirma o encerramento da enquete ?');
    }

    onFilterEnqueteEdit(enquetes, filterStr) {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(enquetes, (item) => (
                (item.titulo && item.titulo.toLowerCase().includes(lowerFilter))
        ));
    }

    renderEnquetes(enquetes) {
        const reverseEnquetes = _.reverse([...enquetes]);
        let enquetesView = null;

        if (enquetes.length) {
            enquetesView = (
                reverseEnquetes.map((item, index) => {
                    return (
                        <View key={index}>
                            <Card
                                title={item.titulo} 
                                containerStyle={styles.card}
                            >
                                <View 
                                    style={{ 
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center', 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.props.modificaItemEditModal(item);
                                                this.props.modificaTituloEditModal(item.titulo);
                                                this.props.modificaOptsEditModal(item.opcoes);
                                                this.setState({
                                                    showModal: true
                                                });
                                            }}
                                        >
                                            <Icon
                                                name='square-edit-outline' 
                                                type='material-community' 
                                                size={34} color='green' 
                                            />   
                                        </TouchableOpacity>
                                    </View>
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => checkConInfo(
                                                () => this.onPressRemove(item)
                                            )}
                                        >
                                            <Icon
                                                name='delete' 
                                                type='material-community' 
                                                size={34} color='red' 
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => checkConInfo(
                                                () => this.onPressEnd(item)
                                            )}
                                        >
                                            <Image
                                                source={imgFinishFlag}
                                                style={{ 
                                                    width: 22, 
                                                    height: 27, 
                                                    tintColor: 'black',
                                                    marginHorizontal: 5
                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ marginVertical: 5 }} />
                            </Card>
                        </View>
                    );
                })
            );
        }

        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return enquetesView;
    }

    renderBasedFilterOrNot() {
        const { enquetes, filterStr } = this.props;
        const opEnq = _.filter(enquetes, enqt => enqt.status === '1');

        let enquetesView = null;
        if (opEnq) {
            if (filterStr) {
                enquetesView = this.renderEnquetes(
                    this.onFilterEnqueteEdit(opEnq, filterStr)
                );
            } else {
                enquetesView = this.renderEnquetes(opEnq);
            }
        }
        return enquetesView;
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
                            { this.renderBasedFilterOrNot() }
                        </Card>
                        <View style={{ marginBottom: 30 }} />
                    </View>
                </ScrollView>
                <ModalContainer 
                    showModal={this.state.showModal}
                    closeModalToggle={() => this.setState({ showModal: !this.state.showModal })}
                    tittle={'Editar - Enquete'}
                >
                    <EnqueteEditModal 
                        closeModalToggle={
                            () => this.setState({ showModal: !this.state.showModal })
                        } 
                    />
                </ModalContainer>
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
        paddingHorizontal: 10
    }
});

const mapStateToProps = (state) => ({
    enquetes: state.EnquetesReducer.enquetes,
    filterStr: state.EnquetesReducer.filterStr,
    filterLoad: state.EnquetesReducer.filterLoad,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {
    modificaFilterLoad,
    modificaFilterStr,
    modificaItemSelected,
    modificaFlagRemoveEnquetes,
    modificaFlagEndEnquetes,
    modificaClean,
    modificaItemEditModal,
    modificaTituloEditModal,
    modificaOptsEditModal,
    modificaRemocao
})(EnqueteEditar);
