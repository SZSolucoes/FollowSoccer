import React from 'react';
import {
    View,
    Text,
    Modal, 
    Animated,
    Keyboard,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';
import { SearchBar, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import _ from 'lodash';
//import { checkConInfo } from '../../../../utils/jogosUtils';

import { colorAppSecondary } from '../../../../../utils/Constantes';
import Card from '../../../../../tools/elements/Card';

class ModalFilter extends React.Component {
    constructor(props) {
        super(props);

        this.fadeAnimValue = new Animated.Value(0);

        this.state = {
            filterModalStr: '',
            filterModalLoad: false
        };
    }

    onFilterDates = (dates, filterModalStr) => _.filter(dates, (date) => (
        date.moment && 
        date.moment.format('DD/MM/YYYY').toLowerCase().includes(filterModalStr)
    ))

    closeModal = () => {
        Animated.timing(
            this.fadeAnimValue,
            {
                toValue: 0,
                duration: 200
            }
        ).start(() => {
            setTimeout(() => this.props.superCloseModal(), 100);
        });
    }

    renderListDates = (dts) => {
        let datesView = null;
        
        if (dts.length) {
            const dates = _.uniqBy(dts, itz => itz.moment.format('YYYYMMDD'));

            datesView = (
                dates.map((item, index) => (
                    <View
                        key={index}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                this.closeModal();
                                this.props.onChooseDate(item.moment);
                            }}
                        >
                            <View
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    margin: 10
                                }}
                            >
                                <Text 
                                    style={{ 
                                        color: colorAppSecondary, 
                                        fontWeight: '500',
                                        textAlign: 'center',
                                        fontSize: 20
                                    }}
                                >
                                    {item.moment.format('DD/MM/YYYY')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <View 
                            style={{ 
                                borderBottomWidth: 1,
                                marginVertical: 2, 
                                borderBottomColor: '#bbb' 
                            }} 
                        />
                    </View>
                ))
            );
        }

        setTimeout(() => this.setState({ filterModalLoad: false }), 1000);
        return datesView;
    }

    renderBasedFilterOrNot = () => {
        const { listDates } = this.props;
        const { filterModalStr } = this.state;
        let datesView = null;
        if (listDates) {
            if (filterModalStr) {
                datesView = this.renderListDates(
                    this.onFilterDates(listDates, filterModalStr)
                );
            } else {
                datesView = this.renderListDates(listDates);
            }
        }
        return datesView;
    }

    render = () => (
        <Modal
            animationType={'slide'}
            transparent
            visible={this.props.showModal}
            supportedOrientations={['portrait']}
            onRequestClose={() => this.closeModal()}
            onShow={() =>
                Animated.timing(
                    this.fadeAnimValue,
                    {
                        toValue: 0.5,
                        duration: 800
                    }
                ).start()
            }
        >
            <TouchableWithoutFeedback
                onPress={() => this.closeModal()}
            >
                <Animated.View
                    style={{
                        flex: 1,
                        backgroundColor: this.fadeAnimValue.interpolate({
                            inputRange: [0, 0.5],
                            outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']
                        })
                    }}
                >
                    <TouchableWithoutFeedback
                        onPress={() => {
                            Keyboard.dismiss();
                            this.closeModal();
                        }}
                    >
                        <View style={styles.viewPricinp} >
                            <TouchableWithoutFeedback
                                onPress={() => Keyboard.dismiss()}
                            >  
                                <Card containerStyle={styles.card}>
                                    <View 
                                        style={{ 
                                            flexDirection: 'row', 
                                            justifyContent: 'flex-end' 
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => {
                                                Keyboard.dismiss();
                                                this.closeModal();
                                            }}
                                        >   
                                            <View 
                                                style={{  
                                                    alignItems: 'flex-end',  
                                                }}
                                            >
                                                <Icon
                                                    name='close-box-outline' 
                                                    type='material-community' 
                                                    size={28} color='black'
                                                    iconStyle={{ opacity: 0.8, margin: 5 }}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <SearchBar
                                        round
                                        lightTheme
                                        autoCapitalize={'none'}
                                        autoCorrect={false}
                                        clearIcon={!!this.state.filterModalStr}
                                        showLoadingIcon={
                                            this.props.listDates &&
                                            this.props.listDates.length > 0 && 
                                            this.state.filterModalLoad
                                        }
                                        containerStyle={{ 
                                            backgroundColor: 'transparent',
                                            borderTopWidth: 0, 
                                            borderBottomWidth: 0
                                        }}
                                        searchIcon={{ size: 26 }}
                                        value={this.state.filterModalStr}
                                        onChangeText={(value) => 
                                            this.setState({ 
                                                filterModalStr: value, 
                                                filterModalLoad: true 
                                            })
                                        }
                                        onClear={() => this.setState({ filterModalStr: '' })}
                                        placeholder='Buscar data...' 
                                    />
                                    <TouchableWithoutFeedback>
                                        <View style={{ height: '72%' }}>
                                            <ScrollView
                                                keyboardShouldPersistTaps={'never'}
                                                style={{ flex: 1 }}
                                                contentContainerStyle={{
                                                    flexGrow: 1
                                                }}
                                            >
                                                { this.renderBasedFilterOrNot() }
                                            </ScrollView>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </Card>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const styles = StyleSheet.create({
    viewPricinp: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center'
    },
    card: {
        width: '90%',
        height: '70%',
        borderRadius: 5,
        padding: 5,
    }
});

const mapStateToProps = (state) => ({
    userLogged: state.LoginReducer.userLogged,
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps)(ModalFilter);

