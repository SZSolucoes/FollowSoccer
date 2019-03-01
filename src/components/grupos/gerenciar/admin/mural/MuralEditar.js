import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    Text,
    Alert,
    Platform,
    ActivityIndicator
} from 'react-native';

import { connect } from 'react-redux';
import {
    Icon,
    SearchBar,
    Divider
} from 'react-native-elements';
import _ from 'lodash';
import Toast from 'react-native-simple-toast';

import firebase from '../../../Firebase';
import { colorAppF, colorAppS } from '../../../utils/constantes';
import { checkConInfo } from '../../../utils/jogosUtils';
import { normalize } from '../../../utils/strComplex';
import Card from '../../tools/Card';
import { ModalContainer } from '../../tools/ModalContainer';
import MuralEditarModal from './MuralEditarModal';

class MuralEditar extends React.Component {

    constructor(props) {
        super(props);

        this.scrollView = null;
        this.firebaseRef = firebase.database().ref();
        this.dbMuralRef = this.firebaseRef.child('mural');

        this.onPressEditRemove = this.onPressEditRemove.bind(this);
        this.renderMuralItens = this.renderMuralItens.bind(this);
        this.onFilterMuralEdit = this.onFilterMuralEdit.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.renderTitleAndIcons = this.renderTitleAndIcons.bind(this);

        this.state = {
            muralItens: [],
            filterStr: '',
            filterLoad: false,
            showModal: false,
            itemSelected: {},
            loading: true
        };
    }

    componentDidMount = () => {
        this.dbMuralRef.on('value', snap => {
            if (snap) {
                const snapVal = snap.val();
                if (snapVal) {
                    const mappedItensMural = _.map(snapVal, (ita, key) => ({ key, ...ita }));
                    this.setState({ muralItens: mappedItensMural, loading: false });
                    
                    return;
                }
            } 

            this.setState({ muralItens: [], loading: false });
        });
    }

    componentWillUnmount() {
        this.dbMuralRef.off();
    }

    onPressEditRemove(item) {
        Alert.alert(
            'Remover!', 
            'Confirma a remoção ?',
            [
                { text: 'Cancelar', onPress: () => false },
                { 
                    text: 'OK', 
                    onPress: () => checkConInfo(
                    () => this.onConfirmRemove(item))
                }
            ],
            { cancelable: true }
        );
    }

    onConfirmRemove = (item) => {
        this.firebaseRef.child(`mural/${item.key}`).remove()
        .then(() => Toast.show('Publicação removida', Toast.SHORT))
        .catch(() => Toast.show('Falaha ao remover publicação', Toast.SHORT));
    }

    onFilterMuralEdit(muralItens, filterStr) {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(muralItens, (item) => (
                (
                    (item.titulo && item.titulo.toLowerCase().includes(lowerFilter)) ||
                    (item.descricao && item.descricao.toLowerCase().includes(lowerFilter))
                )
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
                <View style={{ flex: 2 }}>
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
                            textAlign: 'left',
                            color: '#43484d',
                        }}
                    >
                        {item.titulo}
                    </Text>
                </View>
                <Divider style={{ height: '100%', width: 1 }} />
                <View 
                    style={{ 
                        flex: 0.5,
                        alignItems: 'center',
                        justifyContent: 'space-between',
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
                            size={30} color='green'
                            containerStyle={{ marginBottom: 5 }}
                        />
                    </TouchableOpacity>
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

    renderMuralItens(muralItens) {
        const reverseMuralItens = _.reverse([...muralItens]);
        let muralItensView = null;

        if (muralItens.length) {
            muralItensView = (
                reverseMuralItens.map((item, index) => (
                    <View key={index}>
                        <Card 
                            containerStyle={styles.card}
                        >
                            <View>
                                {this.renderTitleAndIcons(item)}
                            </View>
                            <Divider style={{ marginTop: 10 }} />
                            <View style={{ marginVertical: 5 }}>
                                <Text>
                                    {item.descricao}
                                </Text>
                            </View>
                            <View style={{ marginVertical: 5 }} />
                        </Card>
                    </View>
                ))
            );
        }
        
        if (this.state.filterLoad) {
            setTimeout(() => this.setState({ filterLoad: false }), 1000);
        }

        return muralItensView;
    }

    renderBasedFilterOrNot() {
        const { muralItens, filterStr } = this.state;

        let muralItensView = null;
        if (muralItens) {
            if (filterStr) {
                muralItensView = this.renderMuralItens(
                    this.onFilterMuralEdit(muralItens, filterStr)
                );
            } else {
                muralItensView = this.renderMuralItens(muralItens);
            }
        }
        return muralItensView;
    }

    render() {
        return (
            <View style={styles.viewPrinc}>
                {
                    this.state.loading ?
                    (
                        <View 
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ActivityIndicator size={'large'} color={colorAppS} />
                        </View>
                    )
                    :
                    (
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
                                            this.state.muralItens &&
                                            this.state.muralItens.length > 0 && 
                                            this.state.filterLoad
                                        }
                                        containerStyle={{ 
                                            backgroundColor: 'transparent',
                                            borderTopWidth: 0, 
                                            borderBottomWidth: 0
                                        }}
                                        searchIcon={{ size: 26 }}
                                        value={this.state.filterStr}
                                        onChangeText={(value) => {
                                            this.setState({
                                                filterStr: value,
                                                filterLoad: true
                                            });
                                        }}
                                        onClear={() => this.setState({ filterStr: '' })}
                                        placeholder='Buscar item no mural...' 
                                    />
                                    { this.renderBasedFilterOrNot() }
                                </Card>
                                <View style={{ marginBottom: 30 }} />
                            </View>
                        </ScrollView>
                    )
                }
                <ModalContainer 
                    showModal={this.state.showModal}
                    closeModalToggle={() => this.setState({ showModal: !this.state.showModal })}
                    tittle={'Editar - Mural'}
                >
                    <MuralEditarModal 
                        closeModalToggle={
                            () => this.setState({ 
                                showModal: !this.state.showModal
                            })
                        } 
                        itemSelected={this.state.itemSelected}
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
        paddingHorizontal: 10,
    }
});

const mapStateToProps = (state) => ({
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {
})(MuralEditar);
