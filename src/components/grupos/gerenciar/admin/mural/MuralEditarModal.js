import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    ScrollView,
    Keyboard
} from 'react-native';

import { connect } from 'react-redux';
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage,
    Button
} from 'react-native-elements';
import _ from 'lodash';

import {
    modificaItemEditModal,
    modificaTituloEditModal,
    modificaOptsEditModal
} from '../../../actions/EnquetesActions';

import firebase from '../../../Firebase';
import { showAlert } from '../../../utils/store';
import { colorAppF } from '../../../utils/constantes';
import { checkConInfo } from '../../../utils/jogosUtils';
import Card from '../../tools/Card';

class EnqueteEditModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isTituloNotValid: false,
            isDescriNotValid: false,
            titulo: props.itemSelected ? props.itemSelected.titulo : '',
            descricao: props.itemSelected ? props.itemSelected.descricao : '',
            loading: false,
            inputWidth: '99%'
        };
    }

    componentDidMount = () => {
        setTimeout(() => this.setState({ inputWidth: 'auto' }), 100);
      }

    componentDidUpdate(prevProps, prevState) {
        const { itemSelected } = this.props;
        const { titulo, descricao } = this.state;
        const stateEqual = _.isEqual(prevState, this.state);

        if (itemSelected &&
            stateEqual && 
            ((titulo !== itemSelected.titulo) || 
            (descricao !== itemSelected.descricao))) {
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({
                    titulo: this.props.itemSelected.titulo,
                    descricao: this.props.itemSelected.descricao
                });
        }
    }

    onPressConfirmar = () => {
        Keyboard.dismiss();

        const { titulo, descricao } = this.state;
        const { itemSelected, closeModalToggle } = this.props;

        const tituloNotValid = !titulo.trim();
        const descriNotValid = !descricao.trim();

        if (tituloNotValid || descriNotValid) {
            this.setState({ isTituloNotValid: tituloNotValid, isDescriNotValid: descriNotValid });
            return;
        }

        this.setState({ loading: true, isTituloNotValid: false, isDescriNotValid: false });

        const databaseRef = firebase.database().ref();
        const dbMuralItem = databaseRef.child(`mural/${itemSelected.key}`);

        const asyncFun = async () => {
            const ret = await dbMuralItem.update({
                titulo,
                descricao
            })
            .then(() => {
                showAlert('success', 'Sucesso!', 'Edição efetuada com sucesso.');
                return true; 
            })
            .catch(() => {
                showAlert(
                    'danger', 
                    'Ops!', 
                    'Ocorreu um erro durante a edição.'
                );

                return false;
            });

            if (ret) {
                this.setState({ loading: false });
                closeModalToggle();
            } else {
                this.setState({ loading: false });
            }
        };

        asyncFun();
    }

    render() {
        return (
            <ScrollView 
                style={{ flex: 1 }} 
                ref={(ref) => { this.scrollView = ref; }}
                keyboardShouldPersistTaps={'handled'}
            >
                <View>
                    <Card containerStyle={styles.card}>
                        <FormLabel labelStyle={styles.text}>TÍTULO</FormLabel>
                        <FormInput
                            ref={(ref) => {
                                this.inputTitulo = ref;
                            }}
                            selectTextOnFocus
                            containerStyle={[styles.inputContainer, { height: 60 }]}
                            inputStyle={[styles.text, styles.input, { 
                                height: 60,
                                width: this.state.inputWidth 
                            }]} 
                            value={this.state.titulo}
                            onChangeText={(value) => {
                                this.setState({ titulo: value });
                            }}
                            underlineColorAndroid={'transparent'}
                            multiline 
                        />
                        { 
                            this.state.isTituloNotValid &&
                            <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                        }
                        <FormLabel labelStyle={styles.text}>DESCRIÇÃO</FormLabel>
                        <FormInput
                            ref={(ref) => {
                                this.inputDesc = ref;
                            }}
                            selectTextOnFocus
                            containerStyle={{
                                marginTop: 10, 
                                height: 120, 
                                borderWidth: 1,
                                borderColor: '#9E9E9E' 
                            }}
                            inputStyle={[styles.text, styles.input, { 
                                height: 120,
                                width: this.state.inputWidth
                            }]} 
                            value={this.state.descricao}
                            onChangeText={(value) => {
                                this.setState({ descricao: value });
                            }}
                            underlineColorAndroid={'transparent'}
                            multiline 
                        />
                        { 
                            this.state.isDescriNotValid &&
                            <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                        }
                        <Button 
                            small
                            loading={this.state.loading}
                            disabled={this.state.loading}
                            loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                            title={this.state.loading ? ' ' : 'Confirmar'} 
                            buttonStyle={{ width: '100%', marginTop: 30 }}
                            onPress={() => checkConInfo(() => this.onPressConfirmar())}
                        />
                        <Button 
                            small
                            title={'Restaurar'}
                            buttonStyle={{ width: '100%', marginVertical: 10 }}
                            onPress={() => 
                                this.setState({
                                    isTituloNotValid: false,
                                    isDescriNotValid: false,
                                    titulo: this.props.itemSelected.titulo,
                                    descricao: this.props.itemSelected.descricao,
                                    loading: false
                            })}
                        />
                    </Card>
                    <View style={{ marginBottom: 100 }} />
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF
    },
    text: {
        fontSize: 14,
    },
    inputContainerMargem: {
        borderWidth: 1,
        borderColor: '#9E9E9E',
        height: Platform.OS === 'android' ? 105 : 100,
        padding: Platform.OS === 'ios' ? 5 : 0
    },
    inputMargem: {
        paddingBottom: 0, 
        width: null,
        color: 'black',
        height: 95
    },
    inputContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#9E9E9E',
        height: Platform.OS === 'android' ? 45 : 40,
    },
    inputContainerWithBtn: {
        borderBottomWidth: 1,
        borderBottomColor: '#9E9E9E',
        height: Platform.OS === 'android' ? 45 : 40,
        paddingRight: 30
    },
    input: {
        paddingBottom: 0,
        color: 'black',
        height: 35
    },
    card: {
        paddingHorizontal: 10,
    },
    viewImageSelect: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2, 
        borderColor: '#EEEEEE',
        borderRadius: 0.9
    },
    dateInput: {
        borderWidth: 0,
        alignItems: 'flex-start',
        height: 35,
        ...Platform.select({
            android: {
                paddingLeft: 3,
                justifyContent: 'flex-end'
            },
            ios: {
                paddingLeft: 0,
                justifyContent: 'center'
            }
        })
    },
    add: { 
        position: 'absolute', 
        right: 0, 
        marginHorizontal: 20,
        marginTop: 5,
        zIndex: 1
    }
});

const mapStateToProps = (state) => ({
    userLogged: state.LoginReducer.userLogged,
    itemEditModal: state.EnquetesReducer.itemEditModal,
    titulo: state.EnquetesReducer.titulo,
    opts: state.EnquetesReducer.opts
});

export default connect(mapStateToProps, {
    modificaItemEditModal,
    modificaTituloEditModal,
    modificaOptsEditModal
})(EnqueteEditModal);
