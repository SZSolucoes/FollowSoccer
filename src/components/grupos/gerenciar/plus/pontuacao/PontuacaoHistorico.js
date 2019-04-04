/* eslint-disable max-len */
import React from 'react';
import {
    Text,
    View,
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
import { colorAppTertiary } from '../../../../../utils/Constantes';
import firebase from '../../../../../utils/Firebase';

const textAll = 'Todo o Período';

class PontuacaoHistorico extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();

        this.state = {
            scoresList: [],
            loading: true
        };
    }

    componentDidMount = () => {
        const { grupoSelected } = this.props;

        if (grupoSelected && grupoSelected.key) {
            const historicoScoresRef = this.dbFirebaseRef.child(`historico/grupos/${grupoSelected.key}/scores`);
            historicoScoresRef.once('value', snap => {
                if (snap) {
                    const snapVal = snap.val();
    
                    if (snapVal && typeof snapVal === 'object') {
                        this.setState({ 
                            scoresList: _.map(
                                snapVal, 
                                (ita, key) => ({ key, ...ita })
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

    render = () => {
        const { yearsmonthsAllowed } = this.state;

        return (
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
                            checked={this.state.monthText === textAll}
                            onPress={() => this.setState({ monthText: textAll })}
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
                            {this.state.monthText}
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
                            onPress={() => this.onPressDateBtn(!this.isCalendarOpened)}
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
                                <ActivityIndicator size={'large'} color={'white'} />
                            </View>
                        )
                        :
                        (
                            <ScrollView
                                style={{
                                    marginVertical: 17
                                }}
                                contentContainerStyle={{
                                    flexGrow: 1,
                                }}
                            >
                                <Text>
                                    {JSON.stringify(this.state.scoresList)}
                                </Text>
                                <View style={{ marginVertical: 50 }} />
                            </ScrollView>
                        )
                    }
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoSelectedKey: state.GruposReducer.grupoSelectedKey,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps)(PontuacaoHistorico);
