import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    ScrollView,
    Alert,
    TouchableOpacity,
    Keyboard
} from 'react-native';

import { connect } from 'react-redux';
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage, 
    Button,
    Icon
} from 'react-native-elements';
import Moment from 'moment';
import _ from 'lodash';

import firebase from '../../../Firebase';
import { showAlert } from '../../../utils/store';
import { colorAppF, colorAppS } from '../../../utils/constantes';
import { checkConInfo } from '../../../utils/jogosUtils';
import { sendEnquetePushNotifForTopic } from '../../../utils/fcmPushNotifications';
import Card from '../../tools/Card';

class EnqueteCadastrar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            titulo: '',
            isTituloNotValid: false,
            opts: [''],
            inputWidth: '99%'
        };

        this.onPressConfirmar = this.onPressConfirmar.bind(this);
        this.renderOpts = this.renderOpts.bind(this);
    }

    componentDidMount = () => {
        setTimeout(() => this.setState({ inputWidth: 'auto' }), 100);
    }

    onPressConfirmar() {
        const { opts, titulo } = this.state;
        const newOpts = _.filter(opts, op => op.trim() !== '');
        const newTitulo = titulo.trim();

        Keyboard.dismiss();

        this.setState({ isTituloNotValid: false });

        if (!newTitulo) {
            this.setState({ isTituloNotValid: true });
            return;
        }

        if (!newOpts.length || newOpts.length === 1) {
            Alert.alert('Aviso', 'É necessário informar pelo menos duas opções de enquete.');
            return;
        }

        this.setState({ loading: true });

        const dataCriacao = Moment().format('DD/MM/YYYY HH:mm:ss');

        const databaseRef = firebase.database().ref();
        const dbEnqueteRef = databaseRef.child('enquetes');

        dbEnqueteRef.push({
            titulo: newTitulo,
            dataCriacao,
            opcoes: newOpts,
            votos: [{ push: 'push' }],
            status: '1'
        })
        .then(() => {
            sendEnquetePushNotifForTopic();
            
            this.setState({
                loading: false,
                titulo: '',
                isTituloNotValid: false,
                opts: ['']
            });
            showAlert(
                'success', 'Sucesso!', 'Cadastro realizado com sucesso.'
            );
        })
        .catch(() => {
            this.setState({ loading: false });
            showAlert(
                'danger', 
                'Ops!', 
                'Ocorreu um erro ao cadastrar a enquete.'
            );
        });
    }

    renderOpts() {
        let optsViews = null;

        optsViews = _.map(this.state.opts, (opt, index) => {
            if (index > 0) {
                return (
                    <View key={index} style={{ marginTop: 10 }}>
                        <FormInput
                            selectTextOnFocus
                            autoCorrect={false}
                            containerStyle={styles.inputContainerWithBtn}
                            returnKeyType={'next'}
                            inputStyle={[styles.text, styles.input, { 
                                width: this.state.inputWidth 
                            }]}
                            value={opt}
                            underlineColorAndroid={'transparent'}
                            multiline
                            onChangeText={value => {
                                const newOpts = [...this.state.opts];
                                newOpts[index] = value;
                                this.setState({ opts: newOpts });
                            }}
                        />
                        <TouchableOpacity 
                            style={styles.add}
                            onPress={() => {
                                Keyboard.dismiss();
                                const newOpts = [...this.state.opts];
                                newOpts.splice(index, 1);
                                this.setState({ opts: newOpts });
                            }}
                        >
                            <Icon
                                name='minus-circle' 
                                type='material-community' 
                                size={26} color='red' 
                            />
                        </TouchableOpacity>
                    </View>
                );
            }
            
            return (
                <View key={index}>
                    <FormInput
                        selectTextOnFocus
                        autoCorrect={false}
                        containerStyle={styles.inputContainerWithBtn}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input, {
                            width: this.state.inputWidth
                        }]}
                        value={opt}
                        underlineColorAndroid={'transparent'}
                        multiline
                        onChangeText={value => {
                            const newOpts = [...this.state.opts];
                            newOpts[index] = value;
                            this.setState({ opts: newOpts });
                        }}
                    />
                    <TouchableOpacity 
                        style={styles.add}
                        onPress={() => {
                            Keyboard.dismiss();
                            const newOpts = [...this.state.opts];
                            newOpts.push('');
                            this.setState({ opts: newOpts });
                        }}
                    >
                        <Icon
                            name='plus-circle' 
                            type='material-community' 
                            size={26} color={colorAppS} 
                        />
                    </TouchableOpacity>
                </View>
            );
        });

        return optsViews;
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
                                this.titulo = ref;
                            }}
                            selectTextOnFocus
                            containerStyle={styles.inputContainerMargem}
                            inputStyle={[styles.text, styles.inputMargem, {
                                width: this.state.inputWidth
                            }]} 
                            value={this.state.titulo}
                            underlineColorAndroid={'transparent'}
                            multiline
                            onChangeText={value => this.setState({ titulo: value })}
                        />
                        { 
                            this.state.isTituloNotValid &&
                            <FormValidationMessage>
                                Campo obrigatório
                            </FormValidationMessage> 
                        }
                        <FormLabel labelStyle={styles.text}>OPÇÕES</FormLabel>
                        {this.renderOpts()}
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
                            title={this.props.keyItem ? 'Restaurar' : 'Limpar'}
                            buttonStyle={{ width: '100%', marginVertical: 10 }}
                            onPress={() => {
                                Keyboard.dismiss();
                                this.setState({
                                    loading: false,
                                    titulo: '',
                                    isTituloNotValid: false,
                                    opts: ['']
                                });
                            }}
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
        paddingHorizontal: 10
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
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {})(EnqueteCadastrar);
