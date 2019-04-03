/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
import React from 'react';
import { 
    View,
    Text,
    Alert,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import { connect } from 'react-redux';
import { Icon, FormInput } from 'react-native-elements';
import _ from 'lodash';
import Moment from 'moment';
import Firebase from '@firebase/app';

import firebase from '../../../../../utils/Firebase';
import { 
    ERROS,
    GROUP_PARAMS, 
    colorAppSecondary, 
    colorAppForeground
} from '../../../../../utils/Constantes';
import { showDropdownAlert, checkConInfo } from '../../../../../utils/SystemEvents';
import ListItem from '../../../../../tools/elements/ListItem';
import { normalize } from '../../../../../utils/StrComplex';
import { retServerTime } from '../../../../../utils/UtilsTools';

class ParamsGroup extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
        this.state = {
            inputWidth: '99%',
            today: null,
            pontopresenc: GROUP_PARAMS.pontopresenc,
            pontopresencLoading: false,
            pontopresencSuccess: false,
            pontopresencError: false,
            pontovitoria: GROUP_PARAMS.pontovitoria,
            pontovitoriaLoading: false,
            pontovitoriaSuccess: false,
            pontovitoriaError: false,
            pontoempate: GROUP_PARAMS.pontoempate,
            pontoempateLoading: false,
            pontoempateSuccess: false,
            pontoempateError: false,
            scorereset: GROUP_PARAMS.scorereset,
            scoreresetLoading: false,
            scoreresetSuccess: false,
            scoreresetError: false
        };
    }

    componentDidMount = () => {
        setTimeout(() => this.setState({ inputWidth: 'auto' }), 100);

        const { grupoSelected } = this.props;

        if (grupoSelected && grupoSelected.key && grupoSelected.parametros) {
            this.setState({
                pontopresenc: grupoSelected.parametros.pontopresenc || '0',
                pontovitoria: grupoSelected.parametros.pontovitoria || '0',
                pontoempate: grupoSelected.parametros.pontoempate || '0',
                scorereset: grupoSelected.parametros.scorereset || '0'
            });
        }

        retServerTime()
        .then((value) => {
            if (value) this.setState({ today: value });
        })
        .catch(() => false);
    }

    componentDidUpdate = (prevProps) => {
        const { grupoSelected } = this.props;

        if (grupoSelected && grupoSelected.key && grupoSelected.parametros) {
            const isEqualGroup = _.isEqual(
                [
                    prevProps.grupoSelected.parametros.pontopresenc || '0',
                    prevProps.grupoSelected.parametros.pontovitoria || '0',
                    prevProps.grupoSelected.parametros.pontoempate || '0',
                    prevProps.grupoSelected.parametros.scorereset || '0'
                ],
                [
                    grupoSelected.parametros.pontopresenc || '0',
                    grupoSelected.parametros.pontovitoria || '0',
                    grupoSelected.parametros.pontoempate || '0',
                    grupoSelected.parametros.scorereset || '0'
                ]
            );

            if (!isEqualGroup) {
                this.setState({
                    pontopresenc: grupoSelected.parametros.pontopresenc || '0',
                    pontovitoria: grupoSelected.parametros.pontovitoria || '0',
                    pontoempate: grupoSelected.parametros.pontoempate || '0',
                    scorereset: grupoSelected.parametros.scorereset || '0'
                });
            }
        }
    }

    onClickSave = (field) => {
        const { grupoSelectedKey } = this.props;
        const grupoParamsRef = this.dbFirebaseRef.child(`grupos/${grupoSelectedKey}/parametros`);

        if (field === 'pontopresenc') {
            this.setState({
                pontopresencLoading: true,
                pontopresencSuccess: false,
                pontopresencError: false
            });

            grupoParamsRef.update({
                pontopresenc: this.state.pontopresenc
            })
            .then(() =>
                setTimeout(() => this.setState({
                    pontopresencLoading: false,
                    pontopresencSuccess: true,
                    pontopresencError: false
                }), 1000)
            )
            .catch(() => {
                showDropdownAlert(
                    'error',
                    ERROS.paramsGroup.erro,
                    ERROS.paramsGroup.mes
                );
                setTimeout(() => this.setState({
                    pontopresencLoading: false,
                    pontopresencSuccess: false,
                    pontopresencError: true
                }), 1000);
            });
        } else if (field === 'pontovitoria') {
            this.setState({
                pontovitoriaLoading: true,
                pontovitoriaSuccess: false,
                pontovitoriaError: false
            });

            grupoParamsRef.update({
                pontovitoria: this.state.pontovitoria
            })
            .then(() =>
                setTimeout(() => this.setState({
                    pontovitoriaLoading: false,
                    pontovitoriaSuccess: true,
                    pontovitoriaError: false
                }), 1000)
            )
            .catch(() => {
                showDropdownAlert(
                    'error',
                    ERROS.paramsGroup.erro,
                    ERROS.paramsGroup.mes
                );
                setTimeout(() => this.setState({
                    pontovitoriaLoading: false,
                    pontovitoriaSuccess: false,
                    pontovitoriaError: true
                }), 1000);
            });
        } else if (field === 'pontoempate') {
            this.setState({
                pontoempateLoading: true,
                pontoempateSuccess: false,
                pontoempateError: false
            });

            grupoParamsRef.update({
                pontoempate: this.state.pontoempate
            })
            .then(() =>
                setTimeout(() => this.setState({
                    pontoempateLoading: false,
                    pontoempateSuccess: true,
                    pontoempateError: false
                }), 1000)
            )
            .catch(() => {
                showDropdownAlert(
                    'error',
                    ERROS.paramsGroup.erro,
                    ERROS.paramsGroup.mes
                );
                setTimeout(() => this.setState({
                    pontoempateLoading: false,
                    pontoempateSuccess: false,
                    pontoempateError: true
                }), 1000);
            });
        } else if (field === 'scorereset') {
            const grupoRef = this.dbFirebaseRef.child(`grupos/${grupoSelectedKey}`);

            this.setState({
                scoreresetLoading: true,
                scoreresetSuccess: false,
                scoreresetError: false
            });

            const asyncFunExec = async () => {
                let dataAtual = await retServerTime() || this.state.scorereset;
                if (!dataAtual) {
                    dataAtual = Firebase.database.ServerValue.TIMESTAMP;
                }

                const retA = await grupoRef.update({
                    dtScoreUpdate: dataAtual
                }).then(() => true).catch(() => false);
    
                if (retA) {
                    grupoParamsRef.update({
                        scorereset: this.state.scorereset
                    })
                    .then(() =>
                        setTimeout(() => this.setState({
                            scoreresetLoading: false,
                            scoreresetSuccess: true,
                            scoreresetError: false
                        }), 1000)
                    )
                    .catch(() => {
                        showDropdownAlert(
                            'error',
                            ERROS.paramsGroup.erro,
                            ERROS.paramsGroup.mes
                        );
                        setTimeout(() => this.setState({
                            scoreresetLoading: false,
                            scoreresetSuccess: false,
                            scoreresetError: true
                        }), 1000);
                    });
                } else {
                    showDropdownAlert(
                        'error',
                        ERROS.paramsGroup.erro,
                        ERROS.paramsGroup.mes
                    );
                    setTimeout(() => this.setState({
                        scoreresetLoading: false,
                        scoreresetSuccess: false,
                        scoreresetError: true
                    }), 1000);
                }
            };

            asyncFunExec();
        }
    }

    onValidInputField = (field, value) => {
        if (field === 'pontopresenc') {
            const newValue = value.substring(0, 5).replace(/[^0-9]/g, '');
            if (newValue) {
                if (newValue.length > 1 && newValue[0] === '0') {
                    return (newValue.substring(1));
                } 

                return newValue;
            }

            return '0';
        } else if (field === 'pontovitoria') {
            const newValue = value.substring(0, 5).replace(/[^0-9]/g, '');
            if (newValue) {
                if (newValue.length > 1 && newValue[0] === '0') {
                    return (newValue.substring(1));
                } 

                return newValue;
            }

            return '0';
        } else if (field === 'pontoempate') {
            const newValue = value.substring(0, 5).replace(/[^0-9]/g, '');
            if (newValue) {
                if (newValue.length > 1 && newValue[0] === '0') {
                    return (newValue.substring(1));
                } 

                return newValue;
            }

            return '0';
        } else if (field === 'scorereset') {
            const newValue = value.substring(0, 5).replace(/[^0-9]/g, '');
            if (newValue) {
                if (newValue.length > 1 && newValue[0] === '0') {
                    return (newValue.substring(1));
                } 

                return newValue;
            }

            return '0';
        }

        return value;
    }

    onResetScores = () => {
        const asyncFunExec = async () => {
            const { grupoSelected } = this.props;
    
            if (grupoSelected && grupoSelected.participantes) {
                const listParticip = _.values(grupoSelected.participantes);
    
                for (let indexB = 0; indexB < listParticip.length; indexB++) {
                    const element = listParticip[indexB];
                    
                    await this.dbFirebaseRef
                    .child(`grupos/${grupoSelected.key}/participantes/${element.key}`)
                    .update({ score: '0' }).then(() => true).catch(() => false);
                }

                showDropdownAlert(
                    'success',
                    'Sucesso',
                    'A pontuação foi zerada com sucesso'
                );
            }
        };

        Alert.alert(
            'Aviso', 
            'A pontuação de todos os participantes será zerada. Deseja continuar ?',
            [
                { text: 'Cancelar', onPress: () => false },
                { 
                    text: 'Sim', 
                    onPress: () => checkConInfo(() => asyncFunExec())
                }
            ],
            { cancelable: true }
        );
    }

    renderIconFields = (field) => {
        if (field === 'pontopresenc') {
            if (this.state.pontopresencLoading) {
                return (
                    <ActivityIndicator 
                        size={'small'}
                        color={colorAppSecondary} 
                    />
                );
            }
            if (this.state.pontopresencSuccess) {
                return (
                    <Icon 
                        name='check' 
                        type='material-community' 
                        size={22} 
                        color={colorAppSecondary} 
                    />
                );
            }
            if (this.state.pontopresencError) {
                return (
                    <Icon 
                        name='alert-circle-outline' 
                        type='material-community' 
                        size={22}
                        color={'red'}
                    />
                );
            }

            return (
                <ActivityIndicator 
                    size={'small'}
                    color={'transparent'} 
                />
            );
        } else if (field === 'pontovitoria') {
            if (this.state.pontovitoriaLoading) {
                return (
                    <ActivityIndicator 
                        size={'small'}
                        color={colorAppSecondary} 
                    />
                );
            }
            if (this.state.pontovitoriaSuccess) {
                return (
                    <Icon 
                        name='check' 
                        type='material-community' 
                        size={22} 
                        color={colorAppSecondary} 
                    />
                );
            }
            if (this.state.pontovitoriaError) {
                return (
                    <Icon 
                        name='alert-circle-outline' 
                        type='material-community' 
                        size={22}
                        color={'red'}
                    />
                );
            }

            return (
                <ActivityIndicator 
                    size={'small'}
                    color={'transparent'} 
                />
            );
        } else if (field === 'pontoempate') {
            if (this.state.pontoempateLoading) {
                return (
                    <ActivityIndicator 
                        size={'small'}
                        color={colorAppSecondary} 
                    />
                );
            }
            if (this.state.pontoempateSuccess) {
                return (
                    <Icon 
                        name='check' 
                        type='material-community' 
                        size={22} 
                        color={colorAppSecondary} 
                    />
                );
            }
            if (this.state.pontoempateError) {
                return (
                    <Icon 
                        name='alert-circle-outline' 
                        type='material-community' 
                        size={22}
                        color={'red'}
                    />
                );
            }

            return (
                <ActivityIndicator 
                    size={'small'}
                    color={'transparent'} 
                />
            );
        } else if (field === 'scorereset') {
            if (this.state.scoreresetLoading) {
                return (
                    <ActivityIndicator 
                        size={'small'}
                        color={colorAppSecondary} 
                    />
                );
            }
            if (this.state.scoreresetSuccess) {
                return (
                    <Icon 
                        name='check' 
                        type='material-community' 
                        size={22} 
                        color={colorAppSecondary} 
                    />
                );
            }
            if (this.state.scoreresetError) {
                return (
                    <Icon 
                        name='alert-circle-outline' 
                        type='material-community' 
                        size={22}
                        color={'red'}
                    />
                );
            }

            return (
                <ActivityIndicator 
                    size={'small'}
                    color={'transparent'} 
                />
            );
        }
    }

    renderDaysToLeft = () => {
        let view = false;
        const { grupoSelected } = this.props;
        const valid = grupoSelected && 
        grupoSelected.parametros && 
        grupoSelected.parametros.scorereset &&
        grupoSelected.parametros.scorereset !== '0';


        if (valid && this.state.today) {
            const dtLastUpdate = Moment(
                grupoSelected.dtScoreUpdate,
                typeof grupoSelected.dtScoreUpdate === 'number'
                ? undefined : 'DD-MM-YYYY HH:mm:ss'
            );

            const dtToday = Moment(this.state.today);
            const dtDiference = dtToday.diff(dtLastUpdate, 'days');
            const score = parseInt(grupoSelected.parametros.scorereset, 10);
            const days = Math.abs(score - dtDiference);

            if (days >= 1) {
                view = (
                    <View 
                        style={{
                            marginHorizontal: 15,
                            marginVertical: 10
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: 'OpenSans-SemiBold',
                                color: 'red',
                                fontSize: 13
                            }}
                        >
                            {`${days === 1 ? 'Resta' : 'Restam'} ${days} ${days === 1 ? 'dia' : 'dias'}...`}
                        </Text>
                    </View>
                );
            }
        }

        return view;
    }

    render = () => (
        <ScrollView 
            style={styles.viewPrinc}
            contentContainerStyle={{ flexGrow: 1 }}
            ref={(ref) => { this.scrollView = ref; }}
            keyboardShouldPersistTaps={'handled'}
        >  
            <View style={{ marginVertical: 5 }} />
            <View style={styles.viewPrinc}>
                <View style={styles.cardGreen}>
                    <View style={{ marginTop: 5, marginBottom: 15 }}>
                        <ListItem
                            title='Pontuação por presença'
                            subtitle={
                                'Jogadores que se apresentam a cada jogo receberão' +
                                ' a quantidade de pontos informados no campo.'
                            }
                            subtitleNumberOfLines={5}
                            containerStyle={{ borderBottomWidth: 0 }}
                            rightIcon={
                                <View style={{ marginLeft: 15 }}>
                                    {this.renderIconFields('pontopresenc')}
                                </View>
                            }
                        />
                        <View>
                            <FormInput
                                selectTextOnFocus
                                autoCorrect={false}
                                containerStyle={styles.inputContainerWithBtn}
                                returnKeyType={'next'}
                                inputStyle={[styles.text, styles.input, { 
                                    width: this.state.inputWidth 
                                }]}
                                value={this.state.pontopresenc}
                                underlineColorAndroid={'transparent'}
                                multiline
                                keyboardType={'numeric'}
                                returnKeyType={'done'}
                                onChangeText={
                                    value => this.setState({ 
                                        pontopresenc: 
                                        this.onValidInputField('pontopresenc', value) 
                                    })
                                }
                            />
                            <TouchableOpacity 
                                style={styles.btnSave}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    checkConInfo(() => this.onClickSave('pontopresenc'));
                                }}
                            >
                                <Icon
                                    name='content-save' 
                                    type='material-community' 
                                    size={28} color={colorAppSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.cardGreen}>
                    <View style={{ marginTop: 5, marginBottom: 15 }}>
                        <ListItem
                            title='Pontuação por vitória'
                            subtitle={
                                'Jogadores que são vitoriosos a cada jogo receberão' +
                                ' a quantidade de pontos informados no campo.'
                            }
                            subtitleNumberOfLines={5}
                            containerStyle={{ borderBottomWidth: 0 }}
                            rightIcon={
                                <View style={{ marginLeft: 15 }}>
                                    {this.renderIconFields('pontovitoria')}
                                </View>
                            }
                        />
                        <View>
                            <FormInput
                                selectTextOnFocus
                                autoCorrect={false}
                                containerStyle={styles.inputContainerWithBtn}
                                returnKeyType={'next'}
                                inputStyle={[styles.text, styles.input, { 
                                    width: this.state.inputWidth 
                                }]}
                                value={this.state.pontovitoria}
                                underlineColorAndroid={'transparent'}
                                multiline
                                keyboardType={'numeric'}
                                returnKeyType={'done'}
                                onChangeText={
                                    value => this.setState({ 
                                        pontovitoria: 
                                        this.onValidInputField('pontovitoria', value) 
                                    })
                                }
                            />
                            <TouchableOpacity 
                                style={styles.btnSave}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    checkConInfo(() => this.onClickSave('pontovitoria'));
                                }}
                            >
                                <Icon
                                    name='content-save' 
                                    type='material-community' 
                                    size={28} color={colorAppSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.cardGreen}>
                    <View style={{ marginTop: 5, marginBottom: 15 }}>
                        <ListItem
                            title='Pontuação por empate'
                            subtitle={
                                'Jogadores que empatam a cada jogo receberão' +
                                ' a quantidade de pontos informados no campo.'
                            }
                            subtitleNumberOfLines={5}
                            containerStyle={{ borderBottomWidth: 0 }}
                            rightIcon={
                                <View style={{ marginLeft: 15 }}>
                                    {this.renderIconFields('pontoempate')}
                                </View>
                            }
                        />
                        <View>
                            <FormInput
                                selectTextOnFocus
                                autoCorrect={false}
                                containerStyle={styles.inputContainerWithBtn}
                                returnKeyType={'next'}
                                inputStyle={[styles.text, styles.input, { 
                                    width: this.state.inputWidth 
                                }]}
                                value={this.state.pontoempate}
                                underlineColorAndroid={'transparent'}
                                multiline
                                keyboardType={'numeric'}
                                returnKeyType={'done'}
                                onChangeText={
                                    value => this.setState({ 
                                        pontoempate: 
                                        this.onValidInputField('pontoempate', value) 
                                    })
                                }
                            />
                            <TouchableOpacity 
                                style={styles.btnSave}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    checkConInfo(() => this.onClickSave('pontoempate'));
                                }}
                            >
                                <Icon
                                    name='content-save' 
                                    type='material-community' 
                                    size={28} color={colorAppSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.cardGreen}>
                    <View style={{ marginTop: 5, marginBottom: 15 }}>
                        <ListItem
                            title='Resetar pontuação'
                            subtitle={
                                'Reseta a pontuação de todos os participantes ao' +
                                ' ultrapassar a quantidade de dias informada' +
                                ' a partir da alteração do valor.' +
                                ' Observação: o valor 0 ( zero ) desabilita o parâmetro.'
                            }
                            subtitleNumberOfLines={7}
                            containerStyle={{ borderBottomWidth: 0 }}
                            rightIcon={
                                <View style={{ marginLeft: 15 }}>
                                    {this.renderIconFields('scorereset')}
                                </View>
                            }
                        />
                        <View>
                            <FormInput
                                selectTextOnFocus
                                autoCorrect={false}
                                containerStyle={
                                    [styles.inputContainerWithBtn, { paddingRight: 200 }]
                                }
                                returnKeyType={'next'}
                                inputStyle={[styles.text, styles.input, { 
                                    width: this.state.inputWidth 
                                }]}
                                value={this.state.scorereset}
                                underlineColorAndroid={'transparent'}
                                multiline
                                keyboardType={'numeric'}
                                returnKeyType={'done'}
                                onChangeText={
                                    value => this.setState({ 
                                        scorereset: 
                                        this.onValidInputField('scorereset', value) 
                                    })
                                }
                            />
                            <View style={styles.btnSave}>
                                <View style={{ marginLeft: 20 }}>
                                    <TouchableOpacity 
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            checkConInfo(() => this.onClickSave('scorereset'));
                                        }}
                                    >
                                        <Icon
                                            name='content-save' 
                                            type='material-community' 
                                            size={28} color={colorAppSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginLeft: 5 }}>
                                    <TouchableOpacity 
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            checkConInfo(() => this.onResetScores());
                                        }}
                                    >
                                        <Icon
                                            name='restart' 
                                            type='material-community' 
                                            size={28} color={colorAppSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        {this.renderDaysToLeft()}
                    </View>
                </View>
                <View style={{ marginVertical: 60 }} />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
    text: {
        fontSize: normalize(14),
        fontFamily: 'OpenSans-Regular'
    },
    textLabel: {
        fontSize: normalize(14),
        fontFamily: 'OpenSans-Bold',
        fontWeight: 'bold'
    },
    textLabelAdmin: {
        fontSize: normalize(14),
        fontFamily: 'OpenSans-Bold',
        fontWeight: 'bold',
        color: 'white'
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
    cardTextUsersSemiBold: {
        fontFamily: 'OpenSans-SemiBold',
    },
    cardTextUsersBold: {
        fontFamily: 'OpenSans-Bold',
        color: '#43484d'
    },
    btnSave: { 
        position: 'absolute', 
        right: 0, 
        marginHorizontal: 20,
        marginTop: 5,
        zIndex: 1,
        flexDirection: 'row'
    },
    cardGreen: {
        backgroundColor: 'white',
        borderColor: 'rgba(39, 167, 68, 0.8)',
        borderWidth: 1,
        borderRadius: 5,
        margin: 10,
        paddingVertical: 10,
        paddingHorizontal: 5,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        })
    }
});

const mapStateToProps = state => ({
    dropdownAlert: state.SystemEventsReducer.dropdownAlert,
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoSelectedKey: state.GruposReducer.grupoSelectedKey,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps)(ParamsGroup);
