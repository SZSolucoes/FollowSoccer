import React from 'react';
import { 
    View,
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

class ParamsGroup extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
        this.state = {
            inputWidth: '99%',
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
            pontoempateError: false
        };
    }

    componentDidMount = () => {
        setTimeout(() => this.setState({ inputWidth: 'auto' }), 100);

        const { grupoSelected } = this.props;

        if (grupoSelected && grupoSelected.key && grupoSelected.parametros) {
            this.setState({
                pontopresenc: grupoSelected.parametros.pontopresenc || '0',
                pontovitoria: grupoSelected.parametros.pontovitoria || '0',
                pontoempate: grupoSelected.parametros.pontoempate || '0'
            });
        }
    }

    componentDidUpdate = (prevProps) => {
        const { grupoSelected } = this.props;

        if (grupoSelected && grupoSelected.key && grupoSelected.parametros) {
            const isEqualGroup = _.isEqual(
                [
                    prevProps.grupoSelected.parametros.pontopresenc || '0',
                    prevProps.grupoSelected.parametros.pontovitoria || '0',
                    prevProps.grupoSelected.parametros.pontoempate || '0'
                ],
                [
                    grupoSelected.parametros.pontopresenc || '0',
                    grupoSelected.parametros.pontovitoria || '0',
                    grupoSelected.parametros.pontoempate || '0'
                ]
            );

            if (!isEqualGroup) {
                this.setState({
                    pontopresenc: grupoSelected.parametros.pontopresenc || '0',
                    pontovitoria: grupoSelected.parametros.pontovitoria || '0',
                    pontoempate: grupoSelected.parametros.pontoempate || '0'
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
        }
    }

    onValidInputField = (field, value) => {
        if (field === 'pontopresenc') {
            const newValue = value.replace(/[^0-9]/g, '');
            if (newValue) {
                if (newValue.length > 1 && newValue[0] === '0') {
                    return (newValue.substring(1));
                } 

                return newValue;
            }

            return '0';
        } else if (field === 'pontovitoria') {
            const newValue = value.replace(/[^0-9]/g, '');
            if (newValue) {
                if (newValue.length > 1 && newValue[0] === '0') {
                    return (newValue.substring(1));
                } 

                return newValue;
            }

            return '0';
        } else if (field === 'pontoempate') {
            const newValue = value.replace(/[^0-9]/g, '');
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
        }
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
        zIndex: 1
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
