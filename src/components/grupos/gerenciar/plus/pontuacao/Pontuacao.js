/* eslint-disable max-len */
import React from 'react';
import {
    View,
    Text,
    Platform,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import _ from 'lodash';

import { colorAppForeground, colorAppPrimary } from '../../../../../utils/Constantes';
import { normalize } from '../../../../../utils/StrComplex';
import ListItem from '../../../../../tools/elements/ListItem';
import { retrieveUpdUserGroup } from '../../../../../utils/UserUtils';
import Card from '../../../../../tools/elements/Card';

class Pontuacao extends React.Component {
    renderParticipantes = (listParticipantes) => {
        if (listParticipantes) {
            let participantes = _.values(listParticipantes);
            participantes = _.orderBy(
                participantes, 
                [(it => parseInt(it.score || 0, 10)), 'nome'], 
                ['desc', 'desc']
            );
    
            return (
                <View>
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
                                fontSize: 18
                            }}
                        >
                            Jogadores
                        </Text>
                    </View>
                    {
            
                        _.map(participantes, (ita, index) => {
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
                                    key={index}
                                    containerStyle={{
                                        padding: 5,
                                        marginHorizontal: 5,
                                        marginVertical: 10
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
                                        containerStyle={{
                                            borderBottomWidth: 0
                                        }}
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
                                </Card>
                            );
                        })
                    }
                </View>
            );
        }

        return false;
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
                <View style={{ flex: 1 }}>
                    <View style={[styles.cardDefault, { borderColor: colorAppPrimary }]}>
                        <ListItem
                            title='Pontuação'
                            subtitle={
                                'Abaixo está a lista de jogadores que mais pontuaram por partidas.\n' +
                                'A pontuação por partida é aplicada através das vitórias, empates e presença em jogos.'
                            }
                            subtitleNumberOfLines={8}
                            containerStyle={{ borderBottomWidth: 0 }}
                            rightIcon={(<View />)}
                        />
                        <View style={{ marginHorizontal: 20, marginVertical: 5 }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: 'OpenSans-Bold',
                                        fontSize: 13
                                    }}
                                >
                                    Pontos por vitória:
                                </Text>
                                <View style={{ marginHorizontal: 2 }} />
                                <Text
                                    style={{
                                        fontFamily: 'OpenSans-SemiBold',
                                        fontSize: 13
                                    }}
                                >
                                    {this.props.grupoSelected.parametros.pontovitoria}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    marginTop: 2
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: 'OpenSans-Bold',
                                        fontSize: 13
                                    }}
                                >
                                    Pontos por empate:
                                </Text>
                                <View style={{ marginHorizontal: 2 }} />
                                <Text
                                    style={{
                                        fontFamily: 'OpenSans-Regular',
                                        fontSize: 13
                                    }}
                                >
                                    {this.props.grupoSelected.parametros.pontoempate}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    marginTop: 2
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: 'OpenSans-Bold',
                                        fontSize: 13
                                    }}
                                >
                                    Pontos por presença:
                                </Text>
                                <View style={{ marginHorizontal: 2 }} />
                                <Text
                                    style={{
                                        fontFamily: 'OpenSans-Regular',
                                        fontSize: 13
                                    }}
                                >
                                    {this.props.grupoSelected.parametros.pontopresenc}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <View
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
                        {
                            this.renderParticipantes(
                                this.props.grupoSelected.participantes
                            )
                        }
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
    input: {
        paddingBottom: 0, 
        width: null,
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
    cardDefault: {
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

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoSelectedKey: state.GruposReducer.grupoSelectedKey,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps)(Pontuacao);
