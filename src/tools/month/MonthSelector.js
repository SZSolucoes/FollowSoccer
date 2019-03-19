/* eslint-disable max-len */
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import GestureRecognizer, { swipeDirections, } from 'react-native-swipe-gestures';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';

const DATE_FORMAT = 'DD-MM-YYYY';
const MONTH_YEAR_FORMAT = 'MMYYYY';
const getMonthListFirstDayDate = (date) => {
    const monthList = [];
    const year = date.format('YYYY');
    for (let i = 1; i < 13; i += 1) {
        monthList.push(moment(`01-${i}-${year}`, DATE_FORMAT));
    }
    return monthList;
};
class MonthSelector extends React.Component {
    constructor(props) {
        super(props);
        this.handleMonthTaps = (month) => {
            this.props.onMonthTapped(month);
        };
        this.handNextPrevTaps = (isNext) => {
            if (this.isYearEnabled(isNext)) {
                const currentInitialView = this.state.initialView.clone();
                this.setState({
                    initialView: currentInitialView.add(isNext ? 1 : -1, 'y'),
                });
                this.props.onYearChanged(currentInitialView);
            }
        };
        this.state = { initialView: props.initialView };
    }

    componentWillMount = () => {
        moment.defineLocale(this.props.localeLanguage, this.props.localeSettings);
    }

    getSelectedBackgroundColor = (month) => {
        if (this.props.selectedBackgroundColor &&
            month.format(MONTH_YEAR_FORMAT) ===
                this.props.selectedDate.format(MONTH_YEAR_FORMAT)) {
            return { backgroundColor: this.props.selectedBackgroundColor, borderRadius: 20 };
        }
        return {};
    }

    getSelectedForeGround = (month) => {
        if (this.props.selectedMonthTextStyle &&
            month.format(MONTH_YEAR_FORMAT) ===
                this.props.selectedDate.format(MONTH_YEAR_FORMAT)) {
            return this.props.selectedMonthTextStyle;
        }
        if (month.format(MONTH_YEAR_FORMAT) ===
            this.props.currentDate.format(MONTH_YEAR_FORMAT)) {
            return this.props.currentMonthTextStyle;
        }
        return {};
    }

    getMonthActualComponent = (month, isDisabled = false) => (
        <View 
            style={[
                isDisabled === true && { flex: 1, alignItems: 'center' },
                isDisabled === false && this.getSelectedBackgroundColor(month),
                styles.monthStyle
            ]}
        >
            <Text 
                style={[
                    this.props.monthTextStyle,
                    this.getSelectedForeGround(month),
                    isDisabled === true && this.props.monthDisabledStyle,
                ]}
            >
                {month.format(this.props.monthFormat)}
            </Text>
        </View>
    );
    
    getMonthComponent = (month) => {
        if (this.isMonthEnabled(month)) {
            return (
                <TouchableOpacity 
                    onPress={() => this.handleMonthTaps(month)} 
                    style={{ flex: 1, alignItems: 'center' }}
                >
                    {this.getMonthActualComponent(month)}
                </TouchableOpacity>
            );
        }
        return this.getMonthActualComponent(month, true);
    }

    isMonthEnabled = (month) => {
        const yearsmonthsLength = this.props.yearsmonthsAllowed.length;
        
        if (yearsmonthsLength) {
            const currentMonthYear = month.format('YYYYMM');
            for (let index = 0; index < yearsmonthsLength; index++) {
                const element = this.props.yearsmonthsAllowed[index];
                if (currentMonthYear === element.formated) return true;
            }
            
            return false;
        }
        
        const currentYear = month.format('YYYYMM');
        const minDateYear = this.props.minDate.format('YYYYMM');
        const maxDateYear = this.props.maxDate.format('YYYYMM');

        if (currentYear <= maxDateYear && currentYear >= minDateYear) {
            return true;
        }
        return false;
    }

    isYearEnabled = (isNext) => {
        const minYear = this.props.minDate.format('YYYY');
        const maxYear = this.props.maxDate.format('YYYY');
        const currentYear = this.state.initialView.format('YYYY');
        if ((isNext && currentYear < maxYear) ||
            (!isNext && currentYear > minYear)) {
            return true;
        }
        return false;
    }
    
    handleSwipe(gestureName) {
        const { SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
        switch (gestureName) {
            case SWIPE_LEFT:
                this.handNextPrevTaps(true);
                break;
            case SWIPE_RIGHT:
                this.handNextPrevTaps(false);
                break;
            default:
        }
    }

    renderQ(months, qNo) {
        const startMonth = qNo * 3;
        return (
            <View style={[styles.horizontalFlexViewStyle]}>
                {this.getMonthComponent(months[startMonth])}
                {this.getMonthComponent(months[startMonth + 1])}
                {this.getMonthComponent(months[startMonth + 2])}
            </View>
        );
    }

    renderHeader = () => (
        <View 
            style={[
                styles.horizontalFlexViewStyle,
                {
                    borderBottomColor: this.props.seperatorColor,
                    borderBottomWidth: this.props.seperatorHeight,
                    alignSelf: 'center',
                    height: 64,
                },
            ]}
        >
            {
                this.isYearEnabled(false) ?
                (
                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                        <TouchableOpacity onPress={() => this.handNextPrevTaps(false)}>
                            {this.props.prevIcon ? 
                                (this.props.prevIcon) : 
                                (<Text style={[styles.prevTextStyle, this.props.prevTextStyle]}>
                                    {this.props.prevText}
                                </Text>)
                            }
                        </TouchableOpacity>
                    </View>
                )
                :
                (<View style={{ flex: 1 }} />)
            }
            <View style={styles.yearViewStyle}>
                <Text style={[styles.yearTextStyle, this.props.yearTextStyle]}>
                    {this.state.initialView.format('YYYY')}
                </Text>
            </View>
            {
                this.isYearEnabled(true) ? 
                (
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={() => this.handNextPrevTaps(true)}>
                            {this.props.nextIcon ? 
                                (this.props.nextIcon) : 
                                (<Text style={[styles.nextTextStyle, this.props.nextTextStyle]}>
                                    {this.props.nextText}
                                </Text>)
                            }
                        </TouchableOpacity>
                    </View>
                )
                :
                (<View style={{ flex: 1 }} />)
            }
        </View>
    );

    render() {
        const months = getMonthListFirstDayDate(this.state.initialView);
        const { 
            containerStyle, 
            swipable, 
            velocityThreshold, 
            directionalOffsetThreshold, 
            gestureIsClickThreshold 
        } = this.props;
        const SWIPE_CONFIG = {
            velocityThreshold,
            directionalOffsetThreshold,
            gestureIsClickThreshold,
        };
        return (
            <GestureRecognizer 
                onSwipe={direction => (swipable ? this.handleSwipe(direction) : null)} 
                config={SWIPE_CONFIG} 
                style={[styles.container, containerStyle]}
            >
                {this.renderHeader()}
                {this.renderQ(months, 0)}
                {this.renderQ(months, 1)}
                {this.renderQ(months, 2)}
                {this.renderQ(months, 3)}
            </GestureRecognizer>
        );
    }
}
MonthSelector.propTypes = {
    selectedDate: PropTypes.any,
    currentDate: PropTypes.any,
    maxDate: PropTypes.any,
    minDate: PropTypes.any,
    selectedBackgroundColor: PropTypes.string,
    selectedMonthStyle: PropTypes.any,
    seperatorColor: PropTypes.string,
    seperatorHeight: PropTypes.number,
    nextIcon: PropTypes.any,
    prevIcon: PropTypes.any,
    nextText: PropTypes.string,
    prevText: PropTypes.string,
    containerStyle: PropTypes.any,
    yearTextStyle: PropTypes.object,
    prevTextStyle: PropTypes.object,
    nextTextStyle: PropTypes.object,
    monthTextStyle: PropTypes.any,
    currentMonthTextStyle: PropTypes.any,
    monthFormat: PropTypes.string,
    initialView: PropTypes.any,
    onMonthTapped: PropTypes.func,
    onYearChanged: PropTypes.func,
    monthDisabledStyle: PropTypes.any,
    localeLanguage: PropTypes.string,
    localeSettings: PropTypes.any,
    swipable: PropTypes.bool,
    velocityThreshold: PropTypes.number,
    directionalOffsetThreshold: PropTypes.number,
    gestureIsClickThreshold: PropTypes.number,
    yearsmonthsAllowed: PropTypes.array,
};
MonthSelector.defaultProps = {
    selectedDate: moment(),
    currentDate: moment(),
    maxDate: moment(),
    minDate: moment('01-01-2000', 'DD-MM-YYYY'),
    selectedBackgroundColor: '#000',
    selectedMonthTextStyle: { color: '#fff' },
    seperatorHeight: 1,
    seperatorColor: '#b6c3cb',
    nextIcon: null,
    prevIcon: null,
    nextText: 'Próximo',
    prevText: 'Anterior',
    containerStyle: null,
    yearTextStyle: {},
    prevTextStyle: {},
    nextTextStyle: {},
    monthFormat: 'MMM',
    currentMonthTextStyle: {
        color: '#22ee11',
    },
    monthTextStyle: { color: '#000', fontWeight: '500' },
    initialView: moment(),
    onMonthTapped: month => month,
    onYearChanged: year => year,
    monthDisabledStyle: { color: '#00000050' },
    localeLanguage: 'en',
    localeSettings: {
        months: 'Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
        monthsShort: 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
        weekdays: 'domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado'.split('_'),
        weekdaysShort: 'dom_seg_ter_qua_qui_sex_sáb'.split('_'),
        weekdaysMin: 'dom_2ª_3ª_4ª_5ª_6ª_sáb'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D [de] MMMM [de] YYYY',
            LLL: 'D [de] MMMM [de] YYYY [às] LT',
            LLLL: 'dddd, D [de] MMMM [de] YYYY [às] LT'
        },
        calendar: {
            sameDay: '[Hoje às] LT',
            nextDay: '[Amanhã às] LT',
            nextWeek: 'dddd [às] LT',
            lastDay: '[Ontem às] LT',
            lastWeek: () => (this.day() === 0 || this.day() === 6 ?
                    '[Último] dddd [às] LT' : // Saturday + Sunday
                    '[Última] dddd [às] LT' // Monday - Friday
            ),
            sameElse: 'L'
        },
        relativeTime: {
            future: 'em %s',
            past: '%s atrás',
            s: 'segundos',
            m: 'um minuto',
            mm: '%d minutos',
            h: 'uma hora',
            hh: '%d horas',
            d: 'um dia',
            dd: '%d dias',
            M: 'um mês',
            MM: '%d meses',
            y: 'um ano',
            yy: '%d anos'
        },
        ordinal: '%dº'
    },
    swipable: false,
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
    gestureIsClickThreshold: 5,
    yearsmonthsAllowed: []
};
export default MonthSelector;
// define your styles
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0, .2)',
                shadowOffset: { height: 0, width: 0 },
                shadowOpacity: 1,
                shadowRadius: 1
            },
            android: {
                elevation: 2
            }
        })
    },
    monthStyle: {
        height: 40,
        width: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerStyle: {
        height: 64,
        flex: 1,
        justifyContent: 'space-between',
    },
    horizontalFlexViewStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    yearViewStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        flex: 1.5,
    },
    yearTextStyle: {
        fontWeight: '600'
    },
    prevTextStyle: {
        fontWeight: '600'
    },
    nextTextStyle: {
        fontWeight: '600'
    }
});
//# sourceMappingURL=MonthSelector.js.map
