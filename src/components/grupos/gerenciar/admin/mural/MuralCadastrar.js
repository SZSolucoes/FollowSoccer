import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    ScrollView
} from 'react-native';

import { connect } from 'react-redux';
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage,
    Button
} from 'react-native-elements';
import Moment from 'moment';

import firebase from '../../../../../utils/Firebase';
import { colorAppF, ERROS } from '../../../../../utils/Constantes';
import { checkConInfo, showDropdownAlert } from '../../../../../utils/SystemEvents';
import Card from '../../../../../tools/elements/Card';
import { sendMuralPushNotifForTopic } from '../../../../../utils/FcmPushNotifications';

class MuralCadastrar extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();

        this.state = {
            isTituloNotValid: false,
            isDescriNotValid: false,
            titulo: '',
            descricao: '',
            loading: false,
            inputWidth: '99%'
        };
    }

    componentDidMount = () => {
        setTimeout(() => this.setState({ inputWidth: 'auto' }), 100);
    }

    onPressConfirmar = () => {
        const { titulo, descricao } = this.state;
        const { userLogged, grupoSelected } = this.props;

        const tituloNotValid = !titulo.trim();
        const descriNotValid = !descricao.trim();

        if (tituloNotValid || descriNotValid) {
            this.setState({ isTituloNotValid: tituloNotValid, isDescriNotValid: descriNotValid });
            return;
        }

        this.setState({ loading: true, isTituloNotValid: false, isDescriNotValid: false });

        const dataInclusao = Moment().format('DD/MM/YYYY HH:mm:ss');

        const databaseRef = this.dbFirebaseRef;
        const dbMural = databaseRef.child(`grupos/${grupoSelected.key}/mural`);

        const asyncFun = async () => {
            await dbMural.push({
                dataInclusao,
                titulo,
                descricao,
                usuarioKey: userLogged.key,
                usuarioNome: userLogged.nome
            })
            .then(() => {
                sendMuralPushNotifForTopic(grupoSelected);
                showDropdownAlert(
                    'success',
                    'Sucesso',
                    'Publicação efetuada com sucesso'
                );
            })
            .catch(() => 
                showDropdownAlert(
                    'error',
                    ERROS.muralCad.erro,
                    ERROS.muralCad.mes
            ));

            this.setState({ loading: false });
        };

        asyncFun();
    }

    render = () => (
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
                        fontFamily={'OpenSans-SemiBold'}
                    />
                    <Button 
                        small
                        title={'Limpar'}
                        buttonStyle={{ width: '100%', marginVertical: 10 }}
                        onPress={() => 
                            this.setState({
                                isTituloNotValid: false,
                                isDescriNotValid: false,
                                titulo: '',
                                descricao: '',
                                loading: false
                        })}
                        fontFamily={'OpenSans-SemiBold'}
                    />
                </Card>
                <View style={{ marginBottom: 100 }} />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF
    },
    text: {
        fontSize: 14,
        fontFamily: 'OpenSans-Regular'
    },
    inputContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#9E9E9E',
        height: Platform.OS === 'android' ? 45 : 40,
    },
    input: {
        paddingBottom: 0,
        color: 'black',
        height: 35
    },
    card: {
        paddingHorizontal: 10,
    }
});

const mapStateToProps = (state) => ({
    userLogged: state.LoginReducer.userLogged,
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps, {})(MuralCadastrar);
