import React from 'react';
import {
  Text,
  View,
  FlatList,
  Keyboard,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

class PickerText extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            item: {},
            listItems: [],
            focus: false,
        };
    }

    componentDidMount = () => {
        const listItems = this.props.items;
        const defaultIndex = this.props.defaultIndex;
        
        if (defaultIndex && listItems.length > defaultIndex) {
            this.setState({
                listItems,
                item: listItems[defaultIndex]
            });
        } else {
            this.setState({ listItems });
        }
    }

    searchedItems= (searchedText) => {
        const it = this.props.items.filter(item =>
            item.value.toLowerCase().indexOf(searchedText.toLowerCase()) > -1
        );

        const item = {
            id: -1,
            value: searchedText
        };

        this.setState({ listItems: it, item });

        const onTextChange = this.props.onTextChange;

        if (onTextChange && typeof onTextChange === 'function') {
            setTimeout(() => {
                onTextChange(searchedText);
            }, 0);
        }
    };

    renderFlatList = () => {
        if (this.state.focus) {
            return (
                <TouchableWithoutFeedback>
                    <View>
                        <FlatList
                            keyboardShouldPersistTaps={'handled'}
                            maxToRenderPerBatch={10}
                            initialNumToRender={10}
                            data={this.state.listItems}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => this.renderItems(item)} 
                        />
                    </View>
                </TouchableWithoutFeedback>
            );
        }
    }

    renderItems = (item) => (
        <TouchableOpacity
            onPress={() => {
                this.setState({ item, focus: false });
                Keyboard.dismiss();
                setTimeout(() => {
                    this.props.onItemSelect(item);
                }, 0);
            }}
        >
            <Text style={{ ...this.props.textInputStyle }}>{item.value}</Text>
        </TouchableOpacity>
    );

    render = () => (
        <View 
            style={{ width: '100%' }}
        >
            <TextInput
                underlineColorAndroid={'transparent'}
                onFocus={() => {
                    this.setState({
                        focus: true,
                        item: {
                        value: '',
                        id: 0
                        },
                        listItems: this.props.items
                    });
                }}
                onBlur={() => {
                    this.setState({ focus: false });
                }}
                ref={(ref) => (this.input = ref)}
                onChangeText={(text) => this.searchedItems(text)}
                value={this.state.item.value}
                style={{ ...this.props.textInputStyle }}
            />
            <View
                style={{ 
                    position: 'absolute',
                    zIndex: 9999,
                    top: 10,
                    left: 0,
                    right: 0,
                    height: 200,
                    backgroundColor: 'green'
                }}
            >
                { this.renderFlatList() }
            </View>
        </View>
    );
}

export default PickerText;
