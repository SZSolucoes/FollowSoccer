
import React from 'react';
import {
    View,
    Text,
    TouchableWithoutFeedback,
    Animated,
    Platform
} from 'react-native';
import { Icon, Divider } from 'react-native-elements';
import _ from 'lodash';
import { store } from '../../../../App';
import { checkConInfo } from '../../../../utils/SystemEvents';

export default class InfoActionsBar extends React.Component {

    constructor(props) {
        super(props);

        this.onPressShareBtn = this.onPressShareBtn.bind(this);

        this.state = {
            curtirAnimValue: new Animated.Value(1),
            comentAnimValue: new Animated.Value(1),
            compartAnimValue: new Animated.Value(1)
        };
    }

    onPressShareBtn(item) {
        store.dispatch({
            type: 'modifica_itemshareselected_info',
            payload: item
        });
        setTimeout(() => 
            store.dispatch({
                type: 'modifica_showsharemodal_info',
                payload: true
            })
        , 100);
    }

    render() {
        const { item, userLogged } = this.props;
        let qtdLikes = item.listLikes ? item.listLikes.length : 0;
        let qtdComents = item.listComents ? item.listComents.length : 0;
        let txtQtdLikes = '';
        let likeFound = -1;
        let txtQtdComent = '';
        let likeIconType = 'thumb-up-outline';
        let likeOrDeslike = 'like';
        let textLike = 'Curtir';

        if (qtdLikes > 0) {
            const isPushed = _.findIndex(
                item.listLikes, (itemLike) => itemLike.push && itemLike.push === 'push'
            );
            likeFound = _.findIndex(
                item.listLikes, 
                (itemLike) => itemLike.key && (itemLike.key === userLogged.key)
            );
            if (isPushed !== -1) {
                qtdLikes--;
            }
        }

        if (qtdComents > 0) {
            const isPushed = _.findIndex(
                item.listComents, (itemComent) => itemComent.push && itemComent.push === 'push'
            );
            if (isPushed !== -1) {
                qtdComents--;
            }
        }

        if (likeFound !== -1) {
            likeIconType = 'thumb-up';
            likeOrDeslike = 'deslike';
            textLike = 'Curtiu';
        }

        if (qtdLikes === 0) {
            txtQtdLikes = '0 curtidas';
        } else if (qtdLikes === 1) {
            txtQtdLikes = `${qtdLikes.toString()} curtiu`;
        } else {
            txtQtdLikes = `${qtdLikes.toString()} curtiram`;
        }

        if (qtdComents === 0) {
            txtQtdComent = '0 comentários';
        } else if (qtdComents === 1) {
            txtQtdComent = `${qtdComents.toString()} comentou`;
        } else {
            txtQtdComent = `${qtdComents.toString()} comentaram`;
        }

        return (
            <TouchableWithoutFeedback
                onPress={() => this.props.comentsUpOrDown('up', item)}
            >
                <View style={{ marginHorizontal: 10 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ color: '#A2A2A2' }}>
                            { txtQtdLikes }
                        </Text>
                        <View style={{ marginHorizontal: 5 }}>
                            <Text style={{ textAlign: 'center' }}>-</Text>
                        </View>
                        <Text 
                            style={{ color: '#A2A2A2' }}
                        >
                            { txtQtdComent }
                        </Text>
                    </View>
                    <Divider style={{ marginVertical: 10 }} />
                    <View 
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            justifyContent: 'space-between' 
                        }}
                    >
                        <TouchableWithoutFeedback
                            onPressIn={() => {
                                Animated.spring(
                                    this.state.curtirAnimValue, 
                                    {
                                        toValue: 0.7,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                            }}
                            onPressOut={() => {
                                Animated.spring(
                                    this.state.curtirAnimValue, 
                                    {
                                        toValue: 1,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                            }}
                            onPress={() => checkConInfo(
                                () => this.props.onPressLikeBtn(likeOrDeslike, item)
                            )}
                        >
                            <Animated.View 
                                style={{ 
                                    flexDirection: 'row',
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    transform: [{ scale: this.state.curtirAnimValue }]
                                }}
                            >
                                <Icon
                                    name={likeIconType}
                                    type='material-community' 
                                    size={24} color='green'
                                />
                                <View 
                                    style={{ 
                                        ...Platform.select({
                                            android: {
                                                marginHorizontal: 4
                                            },
                                            ios: {
                                                marginHorizontal: 2
                                            }
                                        })
                                    }} 
                                />
                                <Text style={{ color: '#A2A2A2' }}>
                                    {textLike}
                                </Text>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                            onPressIn={() => {
                                Animated.spring(
                                    this.state.comentAnimValue, 
                                    {
                                        toValue: 0.7,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                            }}
                            onPressOut={() => {
                                Animated.spring(
                                    this.state.comentAnimValue, 
                                    {
                                        toValue: 1,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                            }}
                            onPress={() => this.props.comentsUpOrDown('up', item)}
                        >
                            <Animated.View 
                                style={{ 
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transform: [{ scale: this.state.comentAnimValue }] 
                                }}
                            >
                                <Icon
                                    name='comment-text-outline' 
                                    type='material-community' 
                                    size={24} color='green'
                                />
                                <View 
                                    style={{ 
                                        ...Platform.select({
                                            android: {
                                                marginHorizontal: 4
                                            },
                                            ios: {
                                                marginHorizontal: 2
                                            }
                                        })
                                    }} 
                                />
                                <Text style={{ color: '#A2A2A2' }}>
                                    Comentar
                                </Text>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                            onPressIn={() => {
                                Animated.spring(
                                    this.state.compartAnimValue, 
                                    {
                                        toValue: 0.7,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                            }}
                            onPressOut={() => {
                                Animated.spring(
                                    this.state.compartAnimValue, 
                                    {
                                        toValue: 1,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                            }}
                            onPress={() => this.onPressShareBtn(item)}
                        >
                            <Animated.View 
                                style={{ 
                                    flexDirection: 'row',
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    transform: [{ scale: this.state.compartAnimValue }]
                                }}
                            >
                                <Icon
                                    name='share-outline' 
                                    type='material-community' 
                                    size={24} color='green'
                                />
                                <View 
                                    style={{ 
                                        ...Platform.select({
                                            android: {
                                                marginHorizontal: 4
                                            },
                                            ios: {
                                                marginHorizontal: 2
                                            }
                                        })
                                    }} 
                                />
                                <Text style={{ color: '#A2A2A2' }}>
                                    Compartilhar
                                </Text>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

