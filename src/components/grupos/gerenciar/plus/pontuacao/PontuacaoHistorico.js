/* eslint-disable max-len */
import React from 'react';
import {
    Text,
    View,
    Image,
    Platform,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { Icon, CheckBox } from 'react-native-elements';
import { connect } from 'react-redux';
import Moment from 'moment';
import _ from 'lodash';
import { normalize } from '../../../../../utils/StrComplex';
import { colorAppTertiary, colorAppPrimary } from '../../../../../utils/Constantes';
import firebase from '../../../../../utils/Firebase';
import Card from '../../../../../tools/elements/Card';
import ListItem from '../../../../../tools/elements/ListItem';
import { retrieveUpdUserGroup } from '../../../../../utils/UserUtils';
import ModalFilter from './ModalFilter';

import imgCrown from '../../../../../assets/imgs/kingcrown.png';

const textAll = 'Todo o Período';

class PontuacaoHistorico extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();

        this.state = {
            scoresList: [],
            loading: true,
            dayText: textAll,
            showModal: false
        };
    }

    componentDidMount = () => {
        const { grupoSelected } = this.props;

        if (grupoSelected && grupoSelected.key) {
            const historicoScoresRef = this.dbFirebaseRef
            .child(`historico/grupos/${grupoSelected.key}/scores`);

            historicoScoresRef.once('value', snap => {
                if (snap) {
                    const snapVal = snap.val();
    
                    if (snapVal && typeof snapVal === 'object') {
                        const participantes = _.values(grupoSelected.participantes);
                        this.setState({ 
                            scoresList: _.orderBy(
                                _.map(
                                    snapVal, 
                                    (ita, key) => ({ 
                                        key,
                                        moment: Moment(parseInt(key, 10)),
                                        formatedMoment: Moment(parseInt(key, 10)).format('DD/MM/YYYY'),
                                        scoreObjs: _.filter(
                                            _.values(ita),
                                            itb => _.find(participantes, itc => itc.key === itb.key)
                                        )
                                    })
                                ),
                                [(value) => value.moment.toDate().getTime()],
                                ['desc']
                            ),
                            loading: false 
                        });
    
                        return;
                    }
                }
    
                this.setState({ scoresList: [], loading: false });
            });
        }
    }

    renderCardsHistory = () => {
        const { dayText } = this.state;
        let view = false;

        if (this.state.scoresList && this.state.scoresList.length) {
            let newList = this.state.scoresList;

            if (dayText !== textAll) {
                newList = _.filter(this.state.scoresList, itx => itx.formatedMoment === dayText);
            }

            view = this.renderParticipantes(newList);
        }

        return view;
    }

    renderParticipantes = (listParticipantes) => {
        if (listParticipantes && listParticipantes.length) {
            return _.map(listParticipantes, (itk, index) => {
                let participantes = itk.scoreObjs;
                participantes = _.orderBy(
                    participantes, 
                    [(it => parseInt(it.score || 0, 10)), 'nome'], 
                    ['desc', 'asc']
                );
        
                return (
                    <View
                        key={index}
                        style={{
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
                        }}
                    >
                        <View 
                            style={{ 
                                flexDirection: 'row',
                                alignItems: 'flex-end',
                                marginLeft: 8,
                                marginTop: 5,
                                marginBottom: 5 
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: 'OpenSans-SemiBold',
                                    fontSize: 16
                                }}
                            >
                                {`Jogadores - ${itk.moment.format('DD/MM/YYYY')}`}
                            </Text>
                        </View>
                        {
                
                            _.map(participantes, (ita, indexB) => {
                                const updatedImg = retrieveUpdUserGroup(
                                    ita.key, 
                                    'imgAvatar', 
                                    ita
                                );
                                const imgAvt = updatedImg ? 
                                { uri: updatedImg } : { uri: '' };
        
                                const nome = retrieveUpdUserGroup(
                                    ita.key, 
                                    'nome', 
                                    ita
                                );
                                const posicao = retrieveUpdUserGroup(
                                    ita.key, 
                                    'posicao', 
                                    ita
                                );
    
                                let pontuacao = ita.score || '';
                                const numScore = parseInt(pontuacao, 10);
                                let textPts = 'sem pontuação';
    
                                if (numScore === 1) {
                                    textPts = 'ponto';
                                } else if (numScore > 1) {
                                    textPts = 'pontos';
                                } else {
                                    pontuacao = '';
                                }
                                
                                return (
                                    <Card
                                        key={indexB}
                                        containerStyle={{
                                            padding: 5,
                                            marginHorizontal: 5,
                                            marginVertical: 10
                                        }}
                                        wrapperStyle={{
                                            overflow: 'visible'
                                        }}
                                    >
                                        <ListItem
                                            avatar={imgAvt}
                                            title={nome}
                                            titleStyle={{
                                                fontWeight: '500'
                                            }}
                                            subtitle={posicao}
                                            subtitleStyle={{ color: 'red' }}
                                            titleContainerStyle={{ marginLeft: 10 }}
                                            subtitleContainerStyle={{ marginLeft: 10 }}
                                            containerStyle={{
                                                borderBottomWidth: 0
                                            }}
                                            leftIcon={(
                                                <View
                                                    style={{ marginRight: 8 }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontFamily: 'OpenSans-Bold',
                                                            fontSize: 16
                                                        }}
                                                    >
                                                        {`${indexB + 1}º`}
                                                    </Text>
                                                </View>
                                            )}
                                            rightIcon={(
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontFamily: 'OpenSans-SemiBold',
                                                            color: 'black',
                                                            fontSize: 13
                                                        }}
                                                    >
                                                        {pontuacao}
                                                    </Text>
                                                    <View style={{ marginHorizontal: 2 }} />
                                                    <Text
                                                        style={{
                                                            fontFamily: 'OpenSans-SemiBold',
                                                            color: 'black',
                                                            fontSize: 13
                                                        }}
                                                    >
                                                        {textPts}
                                                    </Text>
                                                </View>
                                            )}
                                        />
                                        {
                                            indexB === 0 &&
                                            (<View 
                                                style={{
                                                    position: 'absolute',
                                                    top: -5,
                                                    left: 0,
                                                    marginLeft: 36,
                                                    zIndex: 500
                                                }}
                                            >
                                                <Image source={imgCrown} style={{ width: 28, height: 18 }} />
                                            </View>)
                                        }
                                    </Card>
                                );
                            })
                        }
                    </View>
                );
            });
        }

        return false;
    }

    render = () => (
        <View
            style={{ flex: 1 }}
        >
            <View 
                style={{
                    height: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center', 
                    backgroundColor: colorAppTertiary,
                    ...Platform.select({
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.5,
                            shadowRadius: 2,
                        },
                        android: {
                            elevation: 2
                        }
                    })
                }}
            >
                <View style={{ flex: 1 }}>
                    <CheckBox
                        title={'Tudo'}
                        checked={this.state.dayText === textAll}
                        onPress={() => this.setState({ dayText: textAll })}
                        size={20}
                        textStyle={{ fontSize: normalize(14), color: 'white' }}
                        checkedColor={'white'}
                        containerStyle={{
                            padding: 5,
                            backgroundColor: 'transparent'
                        }}
                    />
                </View>
                <View 
                    style={{ 
                        flex: 1.3,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            color: 'white',
                            fontSize: normalize(16),
                            fontWeight: '500'
                        }}
                    >
                        {this.state.dayText}
                    </Text>
                </View>
                <View 
                    style={{ 
                        flex: 1, 
                        alignItems: 'flex-end', 
                        justifyContent: 'center',
                        paddingRight: 10
                    }}
                >
                    <TouchableOpacity
                        onPress={() => this.setState({ showModal: true })}
                    >
                        <Icon 
                            name={'calendar'}
                            type={'material-community'}
                            size={34}
                            color={'white'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flex: 1 }}>
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
                            <ActivityIndicator size={'large'} color={colorAppPrimary} />
                        </View>
                    )
                    :
                    (
                        <ScrollView
                            contentContainerStyle={{
                                flexGrow: 1,
                            }}
                        >
                            <View style={{ marginTop: 15 }} />
                                {this.renderCardsHistory()}
                            <View style={{ marginVertical: 50 }} />
                        </ScrollView>
                    )
                }
            </View>
            <ModalFilter
                showModal={this.state.showModal}
                superCloseModal={() => this.setState({ showModal: false })}
                onChooseDate={(value) => this.setState({
                    dayText: value.format('DD/MM/YYYY')
                })}
                listDates={this.state.scoresList}
            />
        </View>
    )
}

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoSelectedKey: state.GruposReducer.grupoSelectedKey,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps)(PontuacaoHistorico);
