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

import { colorAppForeground } from '../../../../../utils/Constantes';
import { checkConInfo } from '../../../../../utils/SystemEvents';
import firebase from '../../../../../utils/Firebase';
import Card from '../../../../../tools/elements/Card';
import {
    modificaFilterLoad,
    modificaEnquetes,
    modificaFilterStr,
    modificaItemSelected,
    modificaFlagRemoveEnquetes,
    modificaFlagEndEnquetes,
    modificaItemEditModal,
    modificaTituloEditModal,
    modificaOptsEditModal,
    modificaClean
} from './EnquetesActions';
//import { modificaRemocao } from '../../../actions/AlertSclActions';
import EnqueteEditModal from './EnqueteEditModal';
import { ModalContainer } from '../../../../../tools/modalcontainer/ModalContainer';

import imgFinishFlag from '../../../../../assets/imgs/finishflag.png';

class EnqueteEditar extends React.Component {
    constructor(props) {
        super(props);

        this.scrollView = null;
        this.dbFirebaseRef = firebase.database().ref();
        this.enquetesListener = null;

        this.state = {
            showModal: false,
            itemSelected: {}
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
                }
    
                if (snapVal) {
                    const enquetesList = _.map(
                        snapshot.val(), (value, key) => ({ key, ...value })
                    );
    
                    // LISTA DE TODAS AS ENQUETES
                    this.props.modificaEnquetes(enquetesList);
                }
            });
        }
    }

    componentWillUnmount = () => {
        this.props.modificaClean();

        if (this.enquetesListener) this.enquetesListener.off();
    }

    onPressRemove = (item) => {
        this.props.modificaItemSelected(item);
        this.props.modificaFlagRemoveEnquetes(true);
        this.props.modificaRemocao(true);
        //showAlert('danger', 'Remover', 'Confirma a remoção ?');
    }

    onPressEnd = (item) => {
        this.props.modificaItemSelected(item);
        this.props.modificaFlagEndEnquetes(true);
        this.props.modificaRemocao(true);
        //showAlert('danger', 'Encerrar', 'Confirma o encerramento da enquete ?');
    }

    onFilterEnqueteEdit = (enquetes, filterStr) => {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(enquetes, (item) => (
                (item.titulo && item.titulo.toLowerCase().includes(lowerFilter))
        ));
    }

    renderEnquetes = (enquetes) => {
        const reverseEnquetes = _.reverse([...enquetes]);
        let enquetesView = null;

        if (enquetes.length) {
            enquetesView = (
                reverseEnquetes.map((item, index) => (
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
                                        onPress={() => checkConInfo(
                                            () => this.setState({
                                                itemSelected: item,
                                                showModal: true
                                            })
                                        )}
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
                ))
            );
        }

        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return enquetesView;
    }

    renderBasedFilterOrNot = () => {
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
                        () => this.setState({ 
                            showModal: !this.state.showModal
                        })
                    } 
                    itemSelected={this.state.itemSelected}
                />
            </ModalContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
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
    grupoSelected: state.GruposReducer.grupoSelected,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {
    modificaFilterLoad,
    modificaEnquetes,
    modificaFilterStr,
    modificaItemSelected,
    modificaFlagRemoveEnquetes,
    modificaFlagEndEnquetes,
    modificaClean,
    modificaItemEditModal,
    modificaTituloEditModal,
    modificaOptsEditModal,
    //modificaRemocao
})(EnqueteEditar);
