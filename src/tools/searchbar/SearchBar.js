import React from 'react';
import {
    View,
    Animated,
    TextInput,
    Dimensions,
    Keyboard,
    TouchableNativeFeedback
} from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';

import {
    modifySearchValue,
    modifyShowInputText
} from './SearchBarActions';

const MIN_ICON_WIDTH = 70;
const MAX_BORDER_RADIUS = 20;

class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.animWidth = new Animated.Value(0);

        this.state = {
            maxWidth: Dimensions.get('window').width
        };
    }

    componentDidMount = () => {
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
        this.props.modifySearchValue('');
    }

    onChangeDimensions = (dims) => {
        this.setState({ maxWidth: dims.window.width });
        if (this.props.showInputText) this.onShowInput();
    }

    onShowInput = () => {
        this.props.modifyShowInputText(true);

        Animated.spring(
            this.animWidth,
            {
                toValue: this.state.maxWidth,
                bounciness: 0
            }
        ).start();
    }

    onHideInput = () => {
        this.props.modifyShowInputText(false);

        Animated.spring(
            this.animWidth,
            {
                toValue: 0,
                bounciness: 0
            }
        ).start(() => Keyboard.dismiss());
    }

    render = () => (
        <Animated.View
            style={{
                width: this.animWidth.interpolate({
                    inputRange: [0, this.state.maxWidth],
                    outputRange: [MIN_ICON_WIDTH, this.state.maxWidth]
                }),
                height: '100%',
                flexDirection: 'row',
                paddingHorizontal: 15,
                alignItems: 'center',
                justifyContent: 'center',
                borderTopLeftRadius: MAX_BORDER_RADIUS,
                borderBottomLeftRadius: MAX_BORDER_RADIUS,
                borderTopRightRadius: MAX_BORDER_RADIUS,
                borderBottomRightRadius: MAX_BORDER_RADIUS
            }}
        >
            <TouchableNativeFeedback
                onPress={() => this.onShowInput()}
            >
                <Icon
                    iconStyle={{ marginHorizontal: 5 }}
                    name='account-plus'
                    color={'white'}
                    type='material-community' 
                    size={28}
                />
            </TouchableNativeFeedback>
            <Animated.View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    width: this.animWidth,
                    height: '100%',
                    backgroundColor: 'white',
                    borderTopLeftRadius: this.animWidth.interpolate({
                        inputRange: [this.state.maxWidth - MAX_BORDER_RADIUS, this.state.maxWidth],
                        outputRange: [MAX_BORDER_RADIUS, 0]
                    }),
                    borderBottomLeftRadius: this.animWidth.interpolate({
                        inputRange: [this.state.maxWidth - MAX_BORDER_RADIUS, this.state.maxWidth],
                        outputRange: [MAX_BORDER_RADIUS, 0]
                    }),
                    borderTopRightRadius: this.animWidth.interpolate({
                        inputRange: [this.state.maxWidth - MAX_BORDER_RADIUS, this.state.maxWidth],
                        outputRange: [MAX_BORDER_RADIUS, 0]
                    }),
                    borderBottomRightRadius: this.animWidth.interpolate({
                        inputRange: [this.state.maxWidth - MAX_BORDER_RADIUS, this.state.maxWidth],
                        outputRange: [MAX_BORDER_RADIUS, 0]
                    }),
                }}
            >
                <View 
                    style={{ 
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderTopLeftRadius: MAX_BORDER_RADIUS,
                        borderBottomLeftRadius: MAX_BORDER_RADIUS,
                        borderTopRightRadius: MAX_BORDER_RADIUS,
                        borderBottomRightRadius: MAX_BORDER_RADIUS
                    }}
                >
                    <TouchableNativeFeedback
                        onPress={() => this.onHideInput()}
                    >
                        <Icon
                            iconStyle={{ marginHorizontal: 5 }}
                            name='arrow-left'
                            color={'black'}
                            type='material-community' 
                            size={28}
                        />
                    </TouchableNativeFeedback>
                </View>
                <View style={{ flex: 3 }}>
                    <TextInput
                        placeholder='Buscar Jogador...'
                        style={{
                            fontFamily: 'OpenSans-Regular'
                        }}
                        selectTextOnFocus
                        value={this.props.searchValue}
                        onChangeText={
                            (value) => {
                                this.props.modifySearchValue(value);
                            }
                        }
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <View />
                </View>
            </Animated.View>
        </Animated.View>
    )
}

const mapStateToProps = state => ({
    showInputText: state.SearchBarReducer.showInputText,
    searchValue: state.SearchBarReducer.searchValue
});

export default connect(mapStateToProps, {
    modifySearchValue,
    modifyShowInputText
}, null, { forwardRef: true })(SearchBar);

