import React from 'react';
import {
    Modal, 
    View,
    TouchableWithoutFeedback,
    StyleSheet,
    Animated,
    ScrollView,
    TouchableOpacity,
    Keyboard,
    Text
} from 'react-native';
import { Icon, Divider } from 'react-native-elements';
import { colorAppF } from '../../utils/Constantes';
import Card from '../elements/Card';

export class ModalContainer extends React.Component {
    constructor(props) {
        super(props);

        this.closeModalToggle = this.closeModalToggle.bind(this);

        this.state = {
            fadeAnimValue: new Animated.Value(0)
        };
    }

    closeModalToggle() {
        Animated.timing(
            this.state.fadeAnimValue,
            {
                toValue: 0,
                duration: 200
            }
        ).start(() => {
            setTimeout(() => this.props.closeModalToggle(), 100);
        });
    }

    render() {
        const { children, tittle } = this.props;

        return (
            <Modal
                animationType={'slide'}
                transparent
                visible={this.props.showModal}
                supportedOrientations={['portrait']}
                onRequestClose={() => this.closeModalToggle()}
                onShow={() =>
                    Animated.timing(
                        this.state.fadeAnimValue,
                        {
                            toValue: 0.5,
                            duration: 800
                        }
                    ).start()
                }
            >
                <TouchableWithoutFeedback
                    onPress={() => this.closeModalToggle()}
                >
                    <Animated.View
                        style={{
                            flex: 1,
                            backgroundColor: this.state.fadeAnimValue.interpolate({
                                inputRange: [0, 0.5],
                                outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']
                            })
                        }}
                    >
                        <TouchableWithoutFeedback
                            onPress={() => {
                                Keyboard.dismiss();
                                this.closeModalToggle();
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
                                                justifyContent: 'space-between' 
                                            }}
                                        >
                                            <View
                                                style={{ 
                                                    justifyContent: 'center', 
                                                    paddingLeft: 15,
                                                    paddingVertical: 5
                                                }}
                                            >
                                                <Text 
                                                    style={{ 
                                                        color: 'grey',
                                                        fontWeight: '500',
                                                        fontSize: 18 
                                                    }}
                                                >
                                                    {tittle || ''}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Keyboard.dismiss();
                                                    this.closeModalToggle();
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
                                        <Divider 
                                            style={{ height: 1, backgroundColor: 'grey' }} 
                                        />
                                        <ScrollView
                                            style={{ height: '82%', backgroundColor: colorAppF }}
                                        >
                                            {children}
                                        </ScrollView>
                                        <Divider 
                                            style={{ height: 1, backgroundColor: 'grey' }} 
                                        />
                                    </Card>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }
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
        height: '80%',
        borderRadius: 5,
        padding: 0
    }
});
