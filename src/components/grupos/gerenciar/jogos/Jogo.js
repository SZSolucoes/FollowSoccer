import React from 'react';
import { 
    ScrollView,
    StyleSheet,
    Text,
    Image,
    View,
    Platform,
    TouchableOpacity,
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { List } from 'react-native-elements';
import { colorAppForeground, colorAppPrimary, shirtColors } from '../../../../utils/Constantes';
import { getPosIndex } from '../../../../utils/JogosUtils';
import { limitDotText, formattedSeconds, formatJogoSeconds } from '../../../../utils/StrComplex';
import firebase from '../../../../utils/Firebase';
import { modificaJogoSelected } from '../admin/gerenciar/ImagensJogosActions';
import Card from '../../../../tools/elements/Card';
import ListItem from '../../../../tools/elements/ListItem';

import imgBola from '../../../../assets/imgs/bolaanim.png';
import imgYellowCard from '../../../../assets/imgs/yellowcard.png';
import imgRedCard from '../../../../assets/imgs/redcard.png';
import imgCartoes from '../../../../assets/imgs/cards.png';
import imgInOut from '../../../../assets/imgs/inout.png';
import { retrieveUpdUserGroup } from '../../../../utils/UserUtils';

class Jogo extends React.Component {
    constructor(props) {
        super(props);

        this.intervalIncrementer = null;
        this.fbJogoRef = null;
        this.fbDatabaseRef = firebase.database().ref();

        this.state = {
            seconds: 0,
            jogo: {}
        };
    }

    componentDidMount = () => {
        const { itemSelected, grupoSelected } = this.props;
        const listJogos = grupoSelected.jogos ?
        _.map(grupoSelected.jogos, (ita, key) => ({ key, ...ita })) : [];

        const jogo = _.find(listJogos, (item) => item.key === itemSelected);

        if (jogo) {
            const currentTime = parseInt(jogo.currentTime, 10);
    
            this.setState({ seconds: currentTime });
            if (jogo.status === '1') {
                this.intervalIncrementer = setInterval(() =>
                    this.setState({
                        seconds: this.state.seconds + 1
                    })
                , 1000);
            }
        }
        
        this.props.modificaJogoSelected(jogo);

        // LISTENER PARA ATUALIZACAO DO JOGO
        this.fbJogoRef = this.fbDatabaseRef
        .child(`grupos/${grupoSelected.key}/jogos/${itemSelected}`);

        this.fbJogoRef.on('value', snap => {
            if (snap) {
                const snapVal = snap.val();

                if (snapVal) {
                    this.setState({ jogo: { key: snap.key, ...snapVal } });

                    return;
                }
            }

            this.setState({ jogo: {} });
        });
    }

    shouldComponentUpdate = (nextProps, nextStates) => { 
        if (!nextStates.jogo) {
            return false;
        }

        const isJogoEqual = _.isEqual(nextStates.jogo, this.state.jogo);

        if (!isJogoEqual) {
            setTimeout(() => {
                const { jogo } = this.state;
                const nj = nextStates.jogo;
                
                if (!nj) {
                    return false;
                }

                if (jogo.currentTime !== nj.currentTime) {
                    this.setState({ seconds: parseInt(nj.currentTime, 10) });
                }
                if (jogo.status !== nj.status) {
                    if (nj.status === '0') {
                        clearInterval(this.intervalIncrementer);
                    } else if (nj.status === '1') {
                        this.intervalIncrementer = setInterval(() =>
                            this.setState({
                                seconds: this.state.seconds + 1
                            })
                        , 1000);
                    } else if (nj.status === '2') {
                        clearInterval(this.intervalIncrementer);
                        this.setState({
                            seconds: 0
                        }); 
                    }
                }
            }, 500);
        }

        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount = () => {  
        if (this.intervalIncrementer) {
            clearInterval(this.intervalIncrementer);
        }
        this.props.modificaClean();
        if (this.fbJogoRef) this.fbJogoRef.off();
    }

    textJogoProgress = (jogo) => {
        switch (jogo.status) {
            case '0':
                return 'Em espera';
            case '1':
                return 'Ao vivo';
            case '2':
                return 'Em espera';
            case '3':
                return 'Encerrado';
            default:
                return 'Encerrado';
        }
    }

    textPlacar = (jogo) => `${jogo.placarCasa} - ${jogo.placarVisit}`

    renderCardPlacar = (jogo) => (
        <Card
            containerStyle={styles.card}
        >
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <View style={styles.topViewPlacar} />
                <View style={{ position: 'absolute', alignSelf: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        { limitDotText(jogo.titulo, 25) }
                    </Text>
                </View>
            </View>
            <View style={{ marginTop: 20 }} />
            <View style={styles.viewPlacar}>
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1.1 }}>
                    <Image 
                        style={{ height: 80, width: 70 }}
                        resizeMode={'stretch'}
                        source={
                            shirtColors[jogo.homeshirt] || shirtColors.white
                        } 
                    />
                    <Text
                        style={{
                            fontWeight: '500',
                            fontSize: 14,
                            textAlign: 'center'
                        }}
                    >
                        { jogo.timeCasa ? jogo.timeCasa.trim() : 'Casa' }
                    </Text>
                </View>
                <View 
                    style={{
                        paddingHorizontal: 5,
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderRadius: 3,
                        flex: 0.8
                    }}
                >
                        <View
                            style={{ 
                                alignItems: 'center',
                                justifyContent: 'center' 
                            }}
                        >
                            <View style={{ marginBottom: 10 }}>
                                <Text
                                    style={{ 
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontWeight: 'bold', 
                                        color: 'red' 
                                    }}
                                >
                                    { this.textJogoProgress(jogo) }
                                </Text>
                            </View>
                            <View>
                                <Text
                                    style={{ 
                                        fontSize: 26, 
                                        fontWeight: 'bold', 
                                        color: 'black' 
                                    }}
                                >
                                    { this.textPlacar(jogo) }
                                </Text>
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text
                                    style={{ fontSize: 16, fontWeight: '500' }}
                                >
                                { formattedSeconds(this.state.seconds) }
                                </Text>
                            </View>
                        </View>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1.1 }}>
                    <Image 
                        style={{ height: 80, width: 70 }}
                        resizeMode={'stretch'}
                        source={
                            shirtColors[jogo.visitshirt] || shirtColors.blue
                        }
                    />
                    <Text
                        style={{
                            fontWeight: '500',
                            fontSize: 14,
                            textAlign: 'center'
                        }}
                        
                    >
                        { jogo.timeVisit ? jogo.timeVisit.trim() : 'Visitantes' }
                    </Text>
                </View>
            </View>
            <View style={{ marginBottom: 20 }} />
        </Card>
    )

    renderGoals = (jogo) => (
        <View>
            <View style={{ padding: 5 }}>
                <View style={{ margin: 5 }}>
                    <Text
                        style={{ 
                            color: 'black', 
                            fontWeight: 'bold',
                            fontSize: 16 
                        }}
                    >
                        Gols
                    </Text>
                </View>
                <View style={styles.cardEffect}>
                    <List 
                        containerStyle={{
                            marginTop: 0,
                            paddingHorizontal: 5,
                            paddingVertical: 10,
                            borderTopWidth: 0,
                            borderBottomWidth: 0
                        }}
                    >
                        { this.renderGolJogador(jogo.gols) }
                    </List>
                </View>
            </View>
        </View>
    )

    renderGolJogador = (gols/*, jogo*/) => {
        const golsCasa = _.filter(gols, (item) => item.side && item.side === 'casa').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const golsVisit = _.filter(gols, (item) => item.side && item.side === 'visit').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const numGolsCasa = golsCasa.length;
        const numGolsVisit = golsVisit.length;
        const viewsGols = [];

        if (numGolsCasa === 0 && numGolsVisit === 0) {
            return (
                <View 
                    style={{ alignContent: 'center', marginLeft: 3 }} 
                >
                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                </View>
            );
        }

        if (numGolsCasa > numGolsVisit) {
            let i = 0;
            for (i = 0; i < numGolsCasa; i++) {
                if ((i + 1) > numGolsVisit || numGolsVisit === 0) {
                    let timeText = formatJogoSeconds(golsCasa[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    { 
                                        golsCasa[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    { 
                                        golsCasa[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeText }
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextCasa = formatJogoSeconds(golsCasa[i].time);
                    let timeTextVisit = formatJogoSeconds(golsVisit[i].time);
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    { 
                                        golsCasa[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    { 
                                        golsCasa[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    { 
                                        golsVisit[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    { 
                                        golsVisit[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            let i = 0;
            for (i = 0; i < numGolsVisit; i++) {
                if ((i + 1) > numGolsCasa || numGolsCasa === 0) {
                    let timeText = formatJogoSeconds(golsVisit[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    { 
                                        golsVisit[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    { 
                                        golsVisit[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeText }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextVisit = formatJogoSeconds(golsVisit[i].time);
                    let timeTextCasa = formatJogoSeconds(golsCasa[i].time);
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    { 
                                        golsVisit[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    { 
                                        golsVisit[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    { 
                                        golsCasa[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    { 
                                        golsCasa[i].isContra ?
                                        `${retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )} ( Contra )`
                                        :
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewsGols;
    }

    renderCartoes = (jogo) => (
        <View>
            <View style={{ padding: 5 }}>
                <View style={{ margin: 5 }}>
                    <Text
                        style={{ 
                            color: 'black', 
                            fontWeight: 'bold',
                            fontSize: 16 
                        }}
                    >
                        Cartões
                    </Text>
                </View>
                <View style={styles.cardEffect}>
                    <List 
                        containerStyle={{ 
                            marginTop: 0,
                            paddingHorizontal: 5,
                            paddingVertical: 10,
                            borderTopWidth: 0,
                            borderBottomWidth: 0
                        }}
                    >
                        { this.renderCartaoJogador(jogo.cartoes) }
                    </List>
                </View>
            </View>
        </View>
    )

    renderCartaoJogador = (cartoes/*, jogo*/) => {
        const cartoesCasa = _.filter(cartoes, (item) => item.side && item.side === 'casa').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const cartoesVisit = _.filter(cartoes, (item) => item.side && item.side === 'visit').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const numCartoesCasa = cartoesCasa.length;
        const numCartoesVisit = cartoesVisit.length;
        const viewCartoes = [];

        if (numCartoesCasa === 0 && numCartoesVisit === 0) {
            return (
                <View 
                    style={{ alignContent: 'center' }} 
                >
                    <Image source={imgCartoes} style={{ width: 30, height: 30 }} />
                </View>
            );
        }

        if (numCartoesCasa > numCartoesVisit) {
            let i = 0;
            for (i = 0; i < numCartoesCasa; i++) {
                if ((i + 1) > numCartoesVisit || numCartoesVisit === 0) {
                    let timeText = formatJogoSeconds(cartoesCasa[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        ) 
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        ) 
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={
                                                cartoesCasa[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeText }
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextCasa = formatJogoSeconds(cartoesCasa[i].time);
                    let timeTextVisit = formatJogoSeconds(cartoesVisit[i].time);
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        ) 
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        ) 
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        ) 
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        ) 
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={
                                                cartoesCasa[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={
                                                cartoesVisit[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            let i = 0;
            for (i = 0; i < numCartoesVisit; i++) {
                if ((i + 1) > numCartoesCasa || numCartoesCasa === 0) {
                    let timeText = formatJogoSeconds(cartoesVisit[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        ) 
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        ) 
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeText }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={
                                                cartoesVisit[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextVisit = formatJogoSeconds(cartoesVisit[i].time);
                    let timeTextCasa = formatJogoSeconds(cartoesCasa[i].time);
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        ) 
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        ) 
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        ) 
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    { 
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        ) 
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={
                                                cartoesCasa[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={
                                                cartoesVisit[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewCartoes;
    }

    renderSubs = (jogo) => (
        <View>
            <View style={{ padding: 5 }}>
                <View style={{ margin: 5 }}>
                    <Text
                        style={{ 
                            color: 'black', 
                            fontWeight: 'bold',
                            fontSize: 16 
                        }}
                    >
                        Substituições
                    </Text>
                </View>
                <View style={styles.cardEffect}>
                    <List 
                        containerStyle={{ 
                            marginTop: 0,
                            paddingHorizontal: 5,
                            paddingVertical: 10,
                            borderTopWidth: 0,
                            borderBottomWidth: 0
                        }}
                    >
                        { this.renderSubsJogador(jogo.subs) }
                    </List>
                </View>
            </View>
        </View>
    )

    renderSubsJogador = (subs/*, jogo*/) => {
        const subsCasa = _.filter(subs, (item) => item.side && item.side === 'casa').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const subsVisit = _.filter(subs, (item) => item.side && item.side === 'visit').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const numSubsCasa = subsCasa.length;
        const numSubsVisit = subsVisit.length;
        const viewSubs = [];

        if (numSubsCasa === 0 && numSubsVisit === 0) {
            return (
                <View 
                    style={{ alignContent: 'center' }} 
                >
                    <Image source={imgInOut} style={{ width: 30, height: 30 }} />
                </View>
            );
        }

        if (numSubsCasa > numSubsVisit) {
            let i = 0;
            for (i = 0; i < numSubsCasa; i++) {
                if ((i + 1) > numSubsVisit || numSubsVisit === 0) {
                    let timeText = formatJogoSeconds(subsCasa[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text>
                                <Text>
                                    { timeText[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeText }
                                        <View>
                                            <Text style={styles.textOut}>
                                                { 
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorOut.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorOut
                                                    ) 
                                                }
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { 
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorIn
                                                    ) 
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextCasa = formatJogoSeconds(subsCasa[i].time);
                    let timeTextVisit = formatJogoSeconds(subsVisit[i].time);
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start'
                                        }}
                                    >
                                        { timeTextCasa }
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.textOut}>
                                                { 
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorOut.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorOut
                                                    ) 
                                                }
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { 
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorIn
                                                    ) 
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Text style={{ textAlign: 'right' }}>
                                                { timeTextVisit }
                                                <Text style={styles.textOut}>
                                                    { 
                                                        retrieveUpdUserGroup(
                                                            subsVisit[i].jogadorOut.key, 
                                                            'nome', 
                                                            subsVisit[i].jogadorOut
                                                        ) 
                                                    }
                                                </Text>
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { 
                                                    retrieveUpdUserGroup(
                                                        subsVisit[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsVisit[i].jogadorIn
                                                    ) 
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            let i = 0;
            for (i = 0; i < numSubsVisit; i++) {
                if ((i + 1) > numSubsCasa || numSubsCasa === 0) {
                    let timeText = formatJogoSeconds(subsVisit[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text>
                                <Text>
                                    { timeText[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Text style={{ textAlign: 'right' }}>
                                                { timeText }
                                                <Text style={styles.textOut}>
                                                    { 
                                                        retrieveUpdUserGroup(
                                                            subsVisit[i].jogadorOut.key, 
                                                            'nome', 
                                                            subsVisit[i].jogadorOut
                                                        ) 
                                                    }
                                                </Text>
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { 
                                                    retrieveUpdUserGroup(
                                                        subsVisit[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsVisit[i].jogadorIn
                                                    ) 
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextVisit = formatJogoSeconds(subsVisit[i].time);
                    let timeTextCasa = formatJogoSeconds(subsCasa[i].time);
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start'
                                        }}
                                    >
                                        { timeTextCasa }
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.textOut}>
                                                { 
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorOut.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorOut
                                                    ) 
                                                }
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { 
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorIn
                                                    ) 
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Text style={{ textAlign: 'right' }}>
                                                { timeTextVisit }
                                                <Text style={styles.textOut}>
                                                    { 
                                                        retrieveUpdUserGroup(
                                                            subsVisit[i].jogadorOut.key, 
                                                            'nome', 
                                                            subsVisit[i].jogadorOut
                                                        ) 
                                                    }
                                                </Text>
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { 
                                                    retrieveUpdUserGroup(
                                                        subsVisit[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsVisit[i].jogadorIn
                                                    ) 
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={() => false}
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewSubs;
    }

    renderEscalados = (jogo) => {
        let jogadoresCasaFt = _.filter(jogo.escalacao.casa, (jgCasa) => !jgCasa.push).sort(
            (a, b) => {
                if (getPosIndex(a.posvalue) > getPosIndex(b.posvalue)) {
                    return 1;
                } 
                if (getPosIndex(a.posvalue) < getPosIndex(b.posvalue)) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        jogadoresCasaFt = _.orderBy(jogadoresCasaFt, ['nome'], ['asc']);

        let jogadoresVisitFt = _.filter(jogo.escalacao.visit, (jgVisit) => !jgVisit.push).sort(
            (a, b) => {
                if (getPosIndex(a.posvalue) > getPosIndex(b.posvalue)) {
                    return 1;
                } 
                if (getPosIndex(a.posvalue) < getPosIndex(b.posvalue)) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        jogadoresVisitFt = _.orderBy(jogadoresVisitFt, ['nome'], ['asc']);

        const numJogadoresCasa = jogadoresCasaFt.length;
        const numjogadoresVisit = jogadoresVisitFt.length;

        if (numJogadoresCasa === 0 && numjogadoresVisit === 0) {
            return false;
        }

        return (
            <View style={{ padding: 5 }}>
                <View style={{ margin: 5 }}>
                    <Text
                        style={{ 
                            color: 'black', 
                            fontWeight: 'bold',
                            fontSize: 16 
                        }}
                    >
                        Jogadores
                    </Text>
                </View>
                <View style={[styles.cardEffect, { paddingVertical: 5, paddingHorizontal: 1 }]}>
                    <List 
                        containerStyle={{ 
                            marginTop: 0, 
                            borderTopWidth: 0, 
                            borderBottomWidth: 0 
                        }}
                    >
                        {
                            jogadoresCasaFt.map((item, index) => {
                                const updatedImg = retrieveUpdUserGroup(
                                    item.key, 'imgAvatar', item
                                );
                                const imgAvt = updatedImg ? 
                                { uri: updatedImg } : { uri: '' };
                                return (
                                    <ListItem
                                        containerStyle={
                                            (index + 1) === numJogadoresCasa && 
                                            numjogadoresVisit === 0 ? 
                                            { borderBottomWidth: 0 } : null 
                                        }
                                        titleContainerStyle={{ marginLeft: 10 }}
                                        subtitleContainerStyle={{ marginLeft: 10 }}
                                        roundAvatar
                                        avatar={imgAvt}
                                        key={index}
                                        title={retrieveUpdUserGroup(
                                            item.key, 
                                            'nome', 
                                            item
                                        )}
                                        subtitle={retrieveUpdUserGroup(
                                            item.key, 
                                            'posicao', 
                                            item
                                        )}
                                        rightIcon={this.renderIcons(item, jogo)}
                                        leftIcon={(
                                            <Image 
                                                style={{ height: 40, width: 35, marginRight: 5 }}
                                                resizeMode={'stretch'}
                                                source={
                                                    shirtColors[jogo.homeshirt] || shirtColors.white
                                                } 
                                            />)
                                        }
                                    />
                                );
                            })
                        }
                        {
                            jogadoresVisitFt.map((item, index) => {
                                const updatedImg = retrieveUpdUserGroup(
                                    item.key,
                                    'imgAvatar',
                                    item
                                );
                                const imgAvt = updatedImg.imgAvatar ? 
                                { uri: updatedImg } : { uri: '' };
                                return (
                                    <ListItem
                                        containerStyle={
                                            (index + 1) === numjogadoresVisit ?
                                            { borderBottomWidth: 0 } : null 
                                        }
                                        titleContainerStyle={{ marginLeft: 10 }}
                                        subtitleContainerStyle={{ marginLeft: 10 }}
                                        roundAvatar
                                        avatar={imgAvt}
                                        key={index}
                                        title={retrieveUpdUserGroup(
                                            item.key, 
                                            'nome', 
                                            item
                                        )}
                                        subtitle={retrieveUpdUserGroup(
                                            item.key, 
                                            'posicao', 
                                            item
                                        )}
                                        rightIcon={this.renderIcons(item, jogo)}
                                        leftIcon={(
                                            <Image 
                                                style={{ height: 40, width: 35, marginRight: 5 }}
                                                resizeMode={'stretch'}
                                                source={
                                                    shirtColors[jogo.visitshirt] || shirtColors.blue
                                                } 
                                            />)
                                        }
                                    />
                                );
                            })
                        }
                    </List>
                </View>
            </View>
        );
    }

    renderIcons = (/*jogador, jogo*/) => (<View />)
        
    render = () => {
        const { jogo } = this.state;

        if (typeof jogo === 'object' && Object.keys(jogo).length === 0) {
            return false;
        }

        return (
            <View style={{ flex: 1 }}>
                <ScrollView style={styles.viewP}>
                    { this.renderCardPlacar(jogo) }
                    <View style={{ marginVertical: 2 }} />
                    { this.renderGoals(jogo) }
                    { this.renderCartoes(jogo) }
                    { this.renderSubs(jogo) }
                    { this.renderEscalados(jogo) }
                    <View style={{ marginVertical: 20 }} />
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewP: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
    viewPlacar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    text: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: 'black' 
    },
    card: {
        padding: 0,
        margin: 0,
        marginHorizontal: 10,
        marginVertical: 15,
        borderRadius: 5
    },
    cardEffect: {
        backgroundColor: 'white',
        borderColor: '#e1e8ee',
        borderRadius: 5,
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0, .2)',
                shadowOffset: { height: 0, width: 0 },
                shadowOpacity: 1,
                shadowRadius: 1,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    topViewPlacar: {
        width: '80%',
        height: 0,
        borderTopWidth: 40,
        borderTopColor: colorAppPrimary,
        borderLeftWidth: 20,
        borderLeftColor: 'transparent',
        borderRightWidth: 20,
        borderRightColor: 'transparent',
        borderStyle: 'solid'
    },
    separator: { 
        width: '100%', 
        borderTopWidth: 0.5, 
        borderTopColor: 'black',
        marginVertical: 5
    },
    circleBtn: { 
        width: 70, 
        height: 70, 
        borderRadius: 70 / 2,
        borderColor: '#e1e8ee',
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0, .2)',
                shadowOffset: { height: 0, width: 0 },
                shadowOpacity: 1,
                shadowRadius: 1,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    circleBtnTwo: { 
        width: 60, 
        height: 60, 
        borderRadius: 60 / 2,
        borderWidth: 2,
        borderColor: 'white'
    },
    centerFlex: { 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    extraTime: { 
        fontSize: 12, 
        fontWeight: 'bold', 
        color: 'red' 
    },
    textIn: {
        fontWeight: '600',
        color: '#4AD940'
    },
    textOut: {
        fontWeight: '600',
        color: '#E44545'
    }
});

const mapStateToProps = (state) => ({
    itemSelected: state.JogoReducer.jogoSelected,
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps, { 
    modificaJogoSelected
})(Jogo);
