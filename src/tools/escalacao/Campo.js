import React from 'react';
import { 
    View,
    StyleSheet,
    ImageBackground,
    Text,
    Alert
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import { 
    modificaShowPlayersModal,
    modificaJogador
} from '../../actions/GerenciarActions';
import { getPosName, checkConInfo } from '../../utils/jogosUtils';
import Avatar from '../tools/Avatar';

import imgCampo from '../../imgs/campo.jpg';
import imgAvatar from '../../imgs/perfiluserimg.png';

class Campo extends React.Component {

    constructor(props) {
        super(props);

        this.renderTatics = this.renderTatics.bind(this);
        this.retrieveSource = this.retrieveSource.bind(this);
        this.onTouchPlayer = this.onTouchPlayer.bind(this);
        this.checkConInfoTouchPlayer = this.checkConInfoTouchPlayer.bind(this);
    }

    onTouchPlayer(jogador, side, pos) {
        return checkConInfo(() => this.checkConInfoTouchPlayer(jogador, side, pos)); 
    }

    checkConInfoTouchPlayer(jogador, side, pos) {
        const incluir = jogador.length === 0;

        if (incluir) {
            const newJogador = {
                key: '',
                nome: '',
                posicao: getPosName(pos),
                posvalue: pos,
                imgAvatar: '',
                side,
                vitorias: '0',
                derrotas: '0',
                empates: '0',
                jogosEscalados: '0'
            };

            this.props.modificaJogador(newJogador);
            this.props.modificaShowPlayersModal(true);
            return;
        }
        
        Alert.alert(
            'Aviso',
            `Confirma a remoção do jogador:\n${jogador[0].nome} ?`,
            [
                { text: 'Cancelar', onPress: () => true, style: 'cancel' },
                { text: 'Ok', onPress: () => this.props.doInOrOut(jogador[0], false) },
            ]
        ); 
    }

    retrieveSource(jogador) {
        if (jogador && jogador.length > 0 && jogador[0].imgAvatar) {
            return { uri: jogador[0].imgAvatar };
        } else if (jogador && jogador.length > 0) {
            return imgAvatar;
        }

        return null;
    }

    renderTatics(jogadores, side, enableTouch, tatics, renderSide = 'LR') {
        const go = _.filter(jogadores, (gopos) => gopos.posvalue === 'go');
        const le = _.filter(jogadores, (lepos) => lepos.posvalue === 'le');
        const ld = _.filter(jogadores, (ldpos) => ldpos.posvalue === 'ld');
        const za1 = _.filter(jogadores, (za1pos) => za1pos.posvalue === 'za1');
        const za2 = _.filter(jogadores, (za2pos) => za2pos.posvalue === 'za2');
        const md1 = _.filter(jogadores, (md1pos) => md1pos.posvalue === 'md1');
        const md2 = _.filter(jogadores, (md2pos) => md2pos.posvalue === 'md2');
        const mo1 = _.filter(jogadores, (mo1pos) => mo1pos.posvalue === 'mo1');
        const mo2 = _.filter(jogadores, (mo2pos) => mo2pos.posvalue === 'mo2');
        const at1 = _.filter(jogadores, (at1pos) => at1pos.posvalue === 'at1');
        const at2 = _.filter(jogadores, (at2pos) => at2pos.posvalue === 'at2');
        //const at3 = _.filter(jogadores, (at3pos) => at3pos.posvalue === 'at3');

        if (renderSide === 'LR') {
            switch (tatics) {
                case '4-4-2':
                    return (
                        <View style={styles.viewMain}>
                            <View 
                                style={{ 
                                    marginTop: 15, 
                                    justifyContent: 'flex-start', 
                                    padding: 3
                                }}
                            >
                                <Text style={{ fontWeight: 'bold', color: 'black' }}>
                                    {'4-4-2'}
                                </Text>
                            </View>
                            <ImageBackground
                                source={imgCampo}
                                style={styles.campo}
                            >
                                <View style={styles.viewGridRow}>
                                    <View style={[styles.viewGridColumn, { flex: 0.7 }]}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'GO'}
                                            source={this.retrieveSource(go)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(go, side, 'go')
                                            }
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View style={styles.viewGridColumn}>
                                        <View style={{ alignSelf: 'flex-end' }}>
                                            <Avatar
                                                medium
                                                avatarStyle={
                                                    side === 'casa' ? 
                                                    styles.avatarHomeStyle : styles.avatarVisitStyle
                                                }
                                                rounded
                                                title={'LE'}
                                                source={this.retrieveSource(le)}
                                                onPress={
                                                    () => enableTouch 
                                                    && this.onTouchPlayer(le, side, 'le')
                                                }
                                                activeOpacity={0.7}
                                            />
                                        </View>
                                        <View style={{ alignSelf: 'flex-start' }}>
                                            <Avatar
                                                medium
                                                avatarStyle={
                                                    side === 'casa' ? 
                                                    styles.avatarHomeStyle : styles.avatarVisitStyle
                                                }
                                                rounded
                                                title={'ZA'}
                                                source={this.retrieveSource(za1)}
                                                onPress={
                                                    () => enableTouch 
                                                    && this.onTouchPlayer(za1, side, 'za1')
                                                }
                                                activeOpacity={0.7}
                                            />
                                        </View>
                                        <View style={{ alignSelf: 'flex-start' }}>
                                            <Avatar
                                                medium
                                                avatarStyle={
                                                    side === 'casa' ? 
                                                    styles.avatarHomeStyle : styles.avatarVisitStyle
                                                }
                                                rounded
                                                title={'ZA'}
                                                source={this.retrieveSource(za2)}
                                                onPress={
                                                    () => enableTouch 
                                                    && this.onTouchPlayer(za2, side, 'za2')
                                                }
                                                activeOpacity={0.7}
                                            />
                                        </View>
                                        <View style={{ alignSelf: 'flex-end' }}>
                                            <Avatar
                                                medium
                                                avatarStyle={
                                                    side === 'casa' ? 
                                                    styles.avatarHomeStyle : styles.avatarVisitStyle
                                                }
                                                rounded
                                                title={'LD'}
                                                source={this.retrieveSource(ld)}
                                                onPress={
                                                    () => enableTouch 
                                                    && this.onTouchPlayer(ld, side, 'ld')
                                                }
                                                activeOpacity={0.7}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.viewGridColumn}>
                                        <View />
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MD'}
                                            source={this.retrieveSource(md1)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(md1, side, 'md1')
                                            }
                                            activeOpacity={0.7}
                                        />
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MD'}
                                            source={this.retrieveSource(md2)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(md2, side, 'md2')
                                            }
                                            activeOpacity={0.7}
                                        />
                                        <View />
                                    </View>
                                    <View style={styles.viewGridColumn}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MO'}
                                            source={this.retrieveSource(mo1)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(mo1, side, 'mo1')
                                            }
                                            activeOpacity={0.7}
                                        />
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MO'}
                                            source={this.retrieveSource(mo2)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(mo2, side, 'mo2')
                                            }
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View style={styles.viewGridColumn}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'AT'}
                                            source={this.retrieveSource(at1)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(at1, side, 'at1')
                                            }
                                            activeOpacity={0.7}
                                        />
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'AT'}
                                            source={this.retrieveSource(at2)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(at2, side, 'at2')
                                            }
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                </View>
                            </ImageBackground>
                        </View>
                    );
                case '4-3-3':
                default:
                    return (
                        <View style={styles.viewMain}>
                            <View 
                                style={{ 
                                    marginTop: 15, 
                                    justifyContent: 'flex-start', 
                                    padding: 3
                                }}
                            >
                                <Text style={{ fontWeight: 'bold', color: 'black' }}>
                                    {'4-4-2'}
                                </Text>
                            </View>
                            <ImageBackground
                                source={imgCampo}
                                style={styles.campo}
                            >
                                <View style={styles.viewGridRow}>
                                    <View style={[styles.viewGridColumn, { flex: 0.7 }]}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'GO'}
                                            source={this.retrieveSource(go)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(go, side, 'go')
                                            }
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View style={styles.viewGridColumn}>
                                        <View style={{ alignSelf: 'flex-end' }}>
                                            <Avatar
                                                medium
                                                avatarStyle={
                                                    side === 'casa' ? 
                                                    styles.avatarHomeStyle : styles.avatarVisitStyle
                                                }
                                                rounded
                                                title={'LE'}
                                                source={this.retrieveSource(le)}
                                                onPress={
                                                    () => enableTouch 
                                                    && this.onTouchPlayer(le, side, 'le')
                                                }
                                                activeOpacity={0.7}
                                            />
                                        </View>
                                        <View style={{ alignSelf: 'flex-start' }}>
                                            <Avatar
                                                medium
                                                avatarStyle={
                                                    side === 'casa' ? 
                                                    styles.avatarHomeStyle : styles.avatarVisitStyle
                                                }
                                                rounded
                                                title={'ZA'}
                                                source={this.retrieveSource(za1)}
                                                onPress={
                                                    () => enableTouch 
                                                    && this.onTouchPlayer(za1, side, 'za1')
                                                }
                                                activeOpacity={0.7}
                                            />
                                        </View>
                                        <View style={{ alignSelf: 'flex-start' }}>
                                            <Avatar
                                                medium
                                                avatarStyle={
                                                    side === 'casa' ? 
                                                    styles.avatarHomeStyle : styles.avatarVisitStyle
                                                }
                                                rounded
                                                title={'ZA'}
                                                source={this.retrieveSource(za2)}
                                                onPress={
                                                    () => enableTouch 
                                                    && this.onTouchPlayer(za2, side, 'za2')
                                                }
                                                activeOpacity={0.7}
                                            />
                                        </View>
                                        <View style={{ alignSelf: 'flex-end' }}>
                                            <Avatar
                                                medium
                                                avatarStyle={
                                                    side === 'casa' ? 
                                                    styles.avatarHomeStyle : styles.avatarVisitStyle
                                                }
                                                rounded
                                                title={'LD'}
                                                source={this.retrieveSource(ld)}
                                                onPress={
                                                    () => enableTouch 
                                                    && this.onTouchPlayer(ld, side, 'ld')
                                                }
                                                activeOpacity={0.7}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.viewGridColumn}>
                                        <View />
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MD'}
                                            source={this.retrieveSource(md1)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(md1, side, 'md1')
                                            }
                                            activeOpacity={0.7}
                                        />
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MD'}
                                            source={this.retrieveSource(md2)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(md2, side, 'md2')
                                            }
                                            activeOpacity={0.7}
                                        />
                                        <View />
                                    </View>
                                    <View style={styles.viewGridColumn}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MO'}
                                            source={this.retrieveSource(mo1)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(mo1, side, 'mo1')
                                            }
                                            activeOpacity={0.7}
                                        />
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MO'}
                                            source={this.retrieveSource(mo2)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(mo2, side, 'mo2')
                                            }
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View style={styles.viewGridColumn}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'AT'}
                                            source={this.retrieveSource(at1)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(at1, side, 'at1')
                                            }
                                            activeOpacity={0.7}
                                        />
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'AT'}
                                            source={this.retrieveSource(at2)}
                                            onPress={
                                                () => enableTouch 
                                                && this.onTouchPlayer(at2, side, 'at2')
                                            }
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                </View>
                            </ImageBackground>
                        </View>
                    );
            }
        }

        switch (tatics) {
            case '4-4-2':
                return (
                    <View style={styles.viewMain}>
                        <View 
                            style={{ 
                                marginTop: 15, 
                                justifyContent: 'flex-end', 
                                padding: 3
                            }}
                        >
                            <Text style={{ fontWeight: 'bold', color: 'black' }}>
                                {'4-4-2'}
                            </Text>
                        </View>
                        <ImageBackground
                            source={imgCampo}
                            style={styles.campo}
                        >
                            <View style={styles.viewGridRow}>
                                <View style={styles.viewGridColumn}>
                                    <View style={{ alignSelf: 'flex-end' }}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'AT'}
                                            //source={{ uri: '' }}
                                            onPress={() => enableTouch && console.log('Works!')}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View style={{ alignSelf: 'flex-end' }}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'AT'}
                                            //source={{ uri: '' }}
                                            onPress={() => enableTouch && console.log('Works!')}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                </View>
                                <View style={styles.viewGridColumn}>
                                    <View style={{ alignSelf: 'flex-end' }}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MO'}
                                            //source={{ uri: '' }}
                                            onPress={() => enableTouch && console.log('Works!')}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View style={{ alignSelf: 'flex-end' }}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MO'}
                                            //source={{ uri: '' }}
                                            onPress={() => enableTouch && console.log('Works!')}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                </View>
                                <View style={styles.viewGridColumn}>
                                    <View />
                                    <View style={{ alignSelf: 'flex-end' }}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MD'}
                                            //source={{ uri: '' }}
                                            onPress={() => enableTouch && console.log('Works!')}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View style={{ alignSelf: 'flex-end' }}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'MD'}
                                            //source={{ uri: '' }}
                                            onPress={() => enableTouch && console.log('Works!')}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View />
                                </View>
                                <View style={styles.viewGridColumn}>
                                    <View style={{ alignSelf: 'flex-start' }}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'LD'}
                                            //source={{ uri: '' }}
                                            onPress={() => enableTouch && console.log('Works!')}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View style={{ alignSelf: 'flex-end' }}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'ZA'}
                                            //source={{ uri: '' }}
                                            onPress={() => enableTouch && console.log('Works!')}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View style={{ alignSelf: 'flex-end' }}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'ZA'}
                                            //source={{ uri: '' }}
                                            onPress={() => enableTouch && console.log('Works!')}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View style={{ alignSelf: 'flex-start' }}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'LE'}
                                            //source={{ uri: '' }}
                                            onPress={() => enableTouch && console.log('Works!')}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.viewGridColumn, { flex: 0.7 }]}>
                                    <View style={{ alignSelf: 'flex-end' }}>
                                        <Avatar
                                            medium
                                            avatarStyle={
                                                side === 'casa' ? 
                                                styles.avatarHomeStyle : styles.avatarVisitStyle
                                            }
                                            rounded
                                            title={'GO'}
                                            //source={{ uri: '' }}
                                            onPress={() => enableTouch && console.log('Works!')}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                </View>
                            </View>
                        </ImageBackground>
                    </View>
                );
            case '4-3-3':
            default:
        }
    }

    render() {
        const { jogadores, side, enableTouch, tatics, renderSide } = this.props;

        return this.renderTatics(jogadores, side, enableTouch, tatics, renderSide);
    }
}

const styles = StyleSheet.create({
    viewMain: {
        flex: 3
    },
    campo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    viewGridRow: {
        flex: 1,
        flexDirection: 'row'
    },
    viewGridColumn: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-around',
    },
    circle: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 100
    },
    avatarHomeStyle: {
        borderWidth: 2,
        borderColor: 'white'
    },
    avatarVisitStyle: {
        borderWidth: 2,
        borderColor: '#0083FF'
    }
});

const mapStateToProps = () => ({
});

export default connect(mapStateToProps, {
    modificaShowPlayersModal,
    modificaJogador
})(Campo);
