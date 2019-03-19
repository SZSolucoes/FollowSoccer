import React from 'react';
import { 
    View, 
    ScrollView, 
    StyleSheet, 
    Text,
    TouchableOpacity
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { connect } from 'react-redux';
import { colorAppDark, colorAppSecondary } from '../../utils/Constantes';

class MonthPicker extends React.Component {

    constructor(props) {
        super(props);

        this.yearNow = new Date().getFullYear();
        this.years = [this.yearNow, this.yearNow - 1, this.yearNow - 2];

        this.state = {
            indexSelected: 0,
            dropWidth: 0
        };
    }

    onPressMonth = (item, index) => {
        this.setState({ indexSelected: index });
        if (this.props.onPressMonth) {
            if (index === 0) {
                this.props.onPressMonth(item, '');
                return;
            }
            const str = `${index}`;
            const pad = '00';
            const ans = pad.substring(0, pad.length - str.length) + str;
            this.props.onPressMonth(item, ans);
        }
    }

    onSelectYear = (item, index) => {
        if (this.props.onSelectYear) {
            this.props.onSelectYear(item, index);
        }
    }

    renderMonths = () => {
        const months = [
            'Tudo', 
            'Jan', 
            'Fev', 
            'Mar', 
            'Abr', 
            'Mai', 
            'Jun', 
            'Jul', 
            'Ago', 
            'Set', 
            'Out', 
            'Nov', 
            'Dez'
        ];
        let viewsMonth = null;

        viewsMonth = months.map((item, index) => {
            let styleSelect = index === this.state.indexSelected ? 
            styles.monthSelected : styles.month;

            styleSelect = index - 1 === this.state.indexSelected ?
            { ...styleSelect, borderTopColor: colorAppSecondary } : styleSelect;

            styleSelect = months.length - 1 === index ?
            { ...styleSelect, borderBottomWidth: 2, borderBottomColor: '#DCE0E4' } 
            : styleSelect;

            styleSelect = months.length - 1 === index && index === this.state.indexSelected ?
            { ...styleSelect, borderBottomWidth: 2, borderBottomColor: colorAppSecondary } 
            : styleSelect;

            return (
                <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => this.onPressMonth(item, index)}
                >
                    <View
                        style={styleSelect}
                    >
                        <Text style={styles.textMonth}>
                            { item }
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        });

        return viewsMonth;
    }

    render = () => {
        const { orientation } = this.props;
        const orientHV = orientation && orientation === 'vertical'; 
        const orient = orientHV ? styles.viewPVertical : styles.viewPHorizontal;

        return (
            <View
                style={{ ...orient, borderLeftWidth: 0, borderTopWidth: 0, borderBottomWidth: 0 }}
            >
                <View style={{ flex: 0.1 }} />
                <View
                    style={{ 
                            borderTopWidth: 3, 
                            borderBottomWidth: 3, 
                            borderLeftWidth: 3, 
                            borderTopColor: colorAppDark, 
                            borderBottomColor: colorAppDark, 
                            borderLeftColor: colorAppDark,
                            backgroundColor: colorAppDark 
                        }}
                    onLayout={
                        (event) =>
                            this.setState({
                                dropWidth: orientHV ? 
                                event.nativeEvent.layout.width : 
                                event.nativeEvent.layout.height
                    })}
                >
                    <ModalDropdown
                        ref={(ref) => { this.modalDropRef = ref; }}
                        style={{
                            width: this.state.dropWidth - 1
                        }}
                        textStyle={styles.dropModalBtnText}
                        dropdownTextStyle={{ fontSize: 16 }}
                        options={this.years}
                        onSelect={(index, value) => this.onSelectYear(value, index)}
                        defaultIndex={0}
                        defaultValue={this.years[0].toString()}
                    />
                </View>
                <View 
                    style={{ flex: 0.5, borderBottomWidth: 3, borderBottomColor: colorAppDark }} 
                />
                <View style={{ flex: 10.5 }}>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        horizontal={!orientHV} 
                        style={orient}
                        contentContainerStyle={{ backgroundColor: 'white' }}
                    >
                        { this.renderMonths() }
                    </ScrollView>
                </View>
                <View style={{ flex: 0.5, borderTopWidth: 3, borderTopColor: colorAppDark }} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPHorizontal: {
        flex: 1,
        flexDirection: 'row'
    },
    viewPVertical: {
        flex: 1,
        flexDirection: 'column',
        borderLeftWidth: 3,
        borderLeftColor: colorAppDark
    },
    month: { 
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderTopColor: '#DCE0E4',
        borderLeftColor: '#DCE0E4',
        overflow: 'hidden',
        padding: 15,
        backgroundColor: colorAppDark
    },
    monthSelected: { 
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderTopColor: colorAppSecondary,
        borderLeftColor: colorAppSecondary,
        padding: 15,
        backgroundColor: colorAppDark
    },
    textMonth: {
        fontSize: 12,
        fontWeight: '500',
        color: 'white'
    },
    dropModalBtnText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10
    }
});

const mapStateToProps = () => ({
});

export default connect(mapStateToProps)(MonthPicker);

