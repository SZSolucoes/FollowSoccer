import React from 'react';
import {
    View,
    Animated,
    TextInput,
    Dimensions,
    TouchableNativeFeedback
} from 'react-native';
import { Icon } from 'react-native-elements';

const MIN_ICON_WIDTH = 70;
const MAX_BORDER_RADIUS = 20;

export default class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.animWidth = new Animated.Value(0);
        this.visibleInput = false;

        this.state = {
            maxWidth: Dimensions.get('window').width,
            searchValue: ''
        };
    }

    componentDidMount = () => {
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
    }

    onChangeDimensions = (dims) => {
        this.setState({ maxWidth: dims.window.width });
        if (this.visibleInput) this.onShowInput();
    }

    onShowInput = () => {
        Animated.spring(
            this.animWidth,
            {
                toValue: this.state.maxWidth,
                bounciness: 0
            }
        ).start(() => (this.visibleInput = true));
    }

    onHideInput = () => {
        Animated.spring(
            this.animWidth,
            {
                toValue: 0,
                bounciness: 0
            }
        ).start(() => (this.visibleInput = false));
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
                        value={this.state.searchValue}
                        onChangeText={
                            (value) => this.setState({ searchValue: value })
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

