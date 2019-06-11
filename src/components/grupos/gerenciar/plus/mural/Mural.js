/* eslint-disable max-len */
import React from 'react';
import {
    Text,
    View,
    Image,
    Animated,
    Platform,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { Icon, CheckBox } from 'react-native-elements';
import { connect } from 'react-redux';
import Moment from 'moment';
import _ from 'lodash';
import MuralItem from './MuralItem';
import MonthSelector from '../../../../../tools/month/MonthSelector';
import { normalize } from '../../../../../utils/StrComplex';
import { colorAppTertiary } from '../../../../../utils/Constantes';
import imgMural from '../../../../../assets/imgs/mural.png';
import firebase from '../../../../../utils/Firebase';
import { isPortrait } from '../../../../../utils/Screen';

const textAll = 'Todo o Período';

class Mural extends React.Component {
    constructor(props) {
        super(props);

        this.firebaseDB = firebase.database().ref();
        this.firebaseDBMural = null;

        this.animCalendarWidth = new Animated.Value();
        this.animCalendarHeight = new Animated.Value();
        this.animCalendarTranslateX = new Animated.Value(Dimensions.get('window').width);

        this.calendarDims = {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height
        };
        this.isCalendarOpened = false;
        this.isAnimating = false;

        this.isPortrait = isPortrait();

        this.today = {
            moment: Moment(new Date(), 'DD-MM-YYYY'), 
            formated: Moment().format('YYYYMM')
        };

        this.state = {
            muralItens: [],
            month: Moment(),
            monthText: textAll,
            yearsmonthsAllowed: [],
            loading: true
        };
    }

    componentDidMount = () => {
        const { grupoSelected } = this.props;

        Dimensions.addEventListener('change', this.onChangeDimensions);

        this.isPortrait = isPortrait();

        if (grupoSelected && grupoSelected.key) {
            this.firebaseDBMural = this.firebaseDB.child(`grupos/${grupoSelected.key}/mural`);
            this.firebaseDBMural.on('value', snap => {
                if (snap) {
                    const snapVal = snap.val();
    
                    if (snapVal && typeof snapVal === 'object') {
                        const muralItens = _.reverse(_.map(snapVal, (ita, key) => ({ 
                            key,
                            dataInclusaoFormated: Moment(ita.dataInclusao, 'DD-MM-YYYY').format('MM/YYYY'),
                            ...ita 
                        })));
                        const yearsmonthsAllowed = [];
    
                        for (let index = 0; index < muralItens.length; index++) {
                            const element = muralItens[index];
                            
                            yearsmonthsAllowed.push(
                                { 
                                    moment: Moment(element.dataInclusao, 'DD-MM-YYYY'), 
                                    formated: Moment(element.dataInclusao, 'DD-MM-YYYY').format('YYYYMM')
                                }
                            );
                        }
    
                        this.setState({ muralItens, yearsmonthsAllowed, loading: false });
    
                        return;
                    }
                }
    
                this.setState({ muralItens: [], yearsmonthsAllowed: [], loading: false });
            });
        }
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
        if (this.firebaseDBMural) this.firebaseDBMural.off();
    }

    onChangeDimensions = ({ window }) => {
        this.calendarDims.width = window.width;
        this.calendarDims.height = window.height;

        this.isPortrait = isPortrait();

        if (this.isCalendarOpened) this.onPressDateBtn(true);
    }

    onPressDateBtn = (showCalendar = false, brokeAnim = false) => {
        if (!this.isAnimating || brokeAnim) {
            if (showCalendar && this.isPortrait) {
                if (!this.isCalendarOpened) {
                    this.animCalendarWidth.setValue(0);
                    this.animCalendarHeight.setValue(0);
                    this.animCalendarTranslateX.setValue(0);
                }
        
                this.isAnimating = true;
                Animated.parallel([
                    Animated.spring(
                        this.animCalendarWidth,
                        {
                            toValue: this.calendarDims.width
                        }
                    ),
                    Animated.spring(
                        this.animCalendarHeight,
                        {
                            toValue: this.calendarDims.height
                        }
                    )
                ]).start(() => {
                    this.isCalendarOpened = true;
                    this.isAnimating = false;
                });
            } if (this.isCalendarOpened) {
                this.isAnimating = true;
                Animated.parallel([
                    Animated.spring(
                        this.animCalendarWidth,
                        {
                            toValue: 0,
                            bounciness: 0
                        }
                    ),
                    Animated.spring(
                        this.animCalendarHeight,
                        {
                            toValue: 0,
                            bounciness: 0
                        }
                    )
                ]).start(() => {
                    this.animCalendarTranslateX.setValue(this.calendarDims.width);
                    this.isCalendarOpened = false;
                    this.isAnimating = false;
                });
            }
        }
    }

    onMonthSelected = (date) => {
        this.setState({ month: date, monthText: date.format('MM/YYYY') });
        this.onPressDateBtn(false, true);
    }

    renderMuralItens = (muralItens, monthText) => {
        let viewMuralItens = null;

        if (muralItens && muralItens.length) {
            let filtredItens = muralItens;

            if (monthText !== textAll) {
                filtredItens = _.filter(muralItens, it => it.dataInclusaoFormated === monthText);
            }

            viewMuralItens = _.map(filtredItens, (ita, index) => <MuralItem key={index} item={ita} />);
        } 

        return viewMuralItens;
    }

    render = () => {
        const { yearsmonthsAllowed } = this.state;
        const minDate = _.minBy(yearsmonthsAllowed, 'formated');
        const maxDate = _.maxBy(yearsmonthsAllowed, 'formated');

        const monthProps = minDate && maxDate ? 
        ({ 
            minDate: minDate.moment, 
            maxDate: maxDate.moment, 
            initialView: maxDate, 
            yearsmonthsAllowed 
        }) 
        : 
        ({ 
            minDate: this.today.moment, 
            maxDate: this.today.moment, 
            initialView: this.today.moment 
        });

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
                    <Image
                        source={imgMural}
                        style={{
                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            resizeMode: 'stretch',
                            marginTop: 1
                        }}
                    />
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
                                {this.renderMuralItens(this.state.muralItens, this.state.monthText)}
                                <View style={{ marginVertical: 50 }} />
                            </ScrollView>
                        )
                    }
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: this.animCalendarWidth,
                            height: this.animCalendarHeight,
                            zIndex: 400,
                            overflow: 'hidden',
                            transform: [
                                { translateX: this.animCalendarTranslateX }, 
                                /* { 
                                    scaleX: this.animCalendarWidth.interpolate({
                                        inputRange: [0, this.calendarDims.width],
                                        outputRange: [0.1, 1],
                                        extrapolate: 'clamp'
                                    }) 
                                },
                                { 
                                    scaleY: this.animCalendarHeight.interpolate({
                                        inputRange: [0, this.calendarDims.height],
                                        outputRange: [0.1, 1],
                                        extrapolate: 'clamp'
                                    }) 
                                } */
                            ]
                        }}
                    >
                        <View>
                            <MonthSelector
                                selectedDate={this.state.month}
                                onMonthTapped={(date) => this.onMonthSelected(date)}
                                {...monthProps}
                            />
                        </View>
                    </Animated.View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps)(Mural);
