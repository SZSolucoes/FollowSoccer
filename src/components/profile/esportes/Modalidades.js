import React from 'react';
import {
    View,
    Text,
    Image,
    Animated,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback
} from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import { colorAppForeground } from '../../../utils/Constantes';
import Card from '../../../tools/elements/Card';
import SoccerUserParams from './SoccerUserParams';

import imgBolaAnim from '../../../assets/imgs/bolaanim.png';

class Modalidades extends React.Component {
    constructor(props) {
        super(props);

        this.isFirstSoccer = true;
        this.maxViewSoccerHeight = 0;
        this.minViewSoccerHeight = 0;

        this.animValueSoccer = new Animated.Value();

        this.state = {
            isSoccerExpanded: false
        };
    }

    onLayoutSoccer = (event) => {
        this.maxViewSoccerHeight = event.nativeEvent.layout.height;
        if (this.state.isSoccerExpanded) {
            Animated.spring(     
                this.animValueSoccer,
                {
                    toValue: this.maxViewSoccerHeight + 50
                }
            ).start(); 
        }
    }

    onLayoutTitleSoccer = (event) => {
        this.minViewSoccerHeight = event.nativeEvent.layout.height;
        if (this.isFirstSoccer) {
            this.onToggleSoccer();
            this.isFirstSoccer = false;
        }
    }

    onToggleSoccer = () => {
        const initialValue = this.state.isSoccerExpanded ? 
        this.maxViewSoccerHeight + this.minViewSoccerHeight : this.minViewSoccerHeight;

        const finalValue = this.state.isSoccerExpanded ? 
        this.minViewSoccerHeight : this.maxViewSoccerHeight + this.minViewSoccerHeight;
    
        this.setState({ isSoccerExpanded: !this.state.isSoccerExpanded });

        this.animValueSoccer.setValue(initialValue);
        Animated.spring(     
            this.animValueSoccer,
            {
                toValue: finalValue
            }
        ).start(); 
    }

    render = () => (
        <View 
            style={{ 
                flex: 1,
                backgroundColor: colorAppForeground
            }}
        >
            <ScrollView
                contentContainerStyle={{
                    backgroundColor: colorAppForeground
                }}
            >
                <Card
                    containerStyle={styles.card}
                >
                    <Animated.View
                        style={{ height: this.animValueSoccer }}
                    >
                        <View 
                            onLayout={this.onLayoutTitleSoccer}
                        >
                            <TouchableWithoutFeedback
                                onPress={() => this.onToggleSoccer()}
                            >
                                <View
                                    style={styles.titleContainer} 
                                >
                                    <View 
                                        style={{ 
                                            flexDirection: 'row', 
                                            alignItems: 'center' 
                                        }}
                                    >
                                        <Image 
                                            style={{ height: 30, width: 30, marginRight: 10 }}
                                            resizeMode={'stretch'}
                                            source={imgBolaAnim} 
                                        />
                                        <Text 
                                            onPress={() => this.onToggleSoccer()}
                                            style={{ 
                                                fontFamily: 'OpenSans-Regular',
                                                fontSize: 16, 
                                                color: 'black' 
                                            }}
                                        >
                                            Complementos
                                        </Text>
                                    </View>
                                    <TouchableWithoutFeedback
                                        onPress={() => this.onToggleSoccer()}
                                    >
                                        <Icon
                                            color={'black'}
                                            name={
                                                this.state.isSoccerExpanded ? 
                                                'menu-up' : 'menu-down'
                                            }
                                            type='material-community'
                                            size={30}
                                        />
                                    </TouchableWithoutFeedback>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        <View 
                            onLayout={this.onLayoutSoccer}
                        >
                            <View style={{ marginVertical: 5 }} />
                            <SoccerUserParams />
                            <View style={{ marginVertical: 50 }} />
                        </View>
                    </Animated.View>
                </Card>
                <View style={{ marginVertical: 50 }} />
            </ScrollView>
        </View>
    )
}

const mapStateToProps = () => ({});

const styles = StyleSheet.create({
    text: { 
        fontSize: 28,
        fontFamily: 'OpenSans-Regular',
        fontWeight: 'bold',
        color: 'black' 
    },
    card: {
        flex: 1,
        margin: 0,
        padding: 0,
        marginHorizontal: 5,
        marginVertical: 15,
        borderRadius: 5,
        overflow: 'hidden'
    },
    titleContainer: {
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

export default connect(mapStateToProps)(Modalidades);
