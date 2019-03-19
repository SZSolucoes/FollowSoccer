import React from 'react';
import { 
    ScrollView,
    StyleSheet,
    View,
    Dimensions,
    Animated,
    Text,
    TouchableWithoutFeedback,
    Image
} from 'react-native';
import { Icon, List, Badge } from 'react-native-elements';
import { connect } from 'react-redux';
import _ from 'lodash';
import { colorAppF, shirtColors } from '../../../../../utils/Constantes';
//import Campo from '../../campo/Campo';
import { isPortrait } from '../../../../../utils/Screen';
import { getPosIndex } from '../../../../../utils/JogosUtils';
import firebase from '../../../../../utils/Firebase';
import ListItem from '../../../../../tools/elements/ListItem';
import Card from '../../../../../tools/elements/Card';

import imgTeam from '../../../../../assets/imgs/team.png';
import { retrieveUpdUserGroup } from '../../../../../utils/UserUtils';

class EscalacaoH extends React.Component {
    constructor(props) {
        super(props);

        this.isFirstCasa = true;
        this.isFirstVisit = true;

        this.maxViewCasaHeight = 0;
        this.minViewCasaHeight = 0;

        this.maxViewVisitHeight = 0;
        this.minViewVisitHeight = 0;

        this.animCasaValue = new Animated.Value();
        this.animVisitValue = new Animated.Value();

        this.fbJogoRef = null;
        this.fbDatabaseRef = firebase.database().ref();

        this.state = {
            heightDim: Dimensions.get('screen').height,
            isCasaExpanded: true,
            isVisitExpanded: true,
            jogo: {}
        };
    }

    componentDidMount = () => {
        const { itemSelected, grupoSelected } = this.props;

        Dimensions.addEventListener('change', this.onChangeDimensions);
        if (isPortrait()) {
            this.setState({ heightDim: Dimensions.get('screen').height / 2.5 });
        } else {
            this.setState({ heightDim: Dimensions.get('screen').height / 1.5 });
        }

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
        const { itemSelected } = this.props;

        if (nextProps.listJogos) {
            const nj = _.find(nextProps.listJogos, (item) => item.key === itemSelected);
                
            if (!nj) {
                return false;
            }
        }

        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
        if (this.fbJogoRef) this.fbJogoRef.off();
    }

    onChangeDimensions = (event) => {
        if (isPortrait()) {
            this.setState({ heightDim: event.screen.height / 2.5 });
        }
    }

    onLayoutTitleCasa = (event) => {
        this.minViewCasaHeight = event.nativeEvent.layout.height;
        if (this.isFirstCasa) {
            this.onToggleCasa();
            this.isFirstCasa = false;
        }
    }

    onLayoutCasa = (event) => {
        this.maxViewCasaHeight = event.nativeEvent.layout.height;
        if (this.state.isCasaExpanded) {
            Animated.spring(     
                this.animCasaValue,
                {
                    toValue: this.maxViewCasaHeight + 50
                }
            ).start(); 
        }
    }

    onLayoutTitleVisit = (event) => {
        this.minViewVisitHeight = event.nativeEvent.layout.height;
        if (this.isFirstVisit) {
            this.onToggleVisit();
            this.isFirstVisit = false;
        }
    }

    onLayoutVisit = (event) => {
        this.maxViewVisitHeight = event.nativeEvent.layout.height;
        if (this.state.isVisitExpanded) {
            Animated.spring(     
                this.animVisitValue,
                {
                    toValue: this.maxViewVisitHeight + 50
                }
            ).start(); 
        }
    }

    onToggleCasa = () => {
        const initialValue = this.state.isCasaExpanded ? 
        this.maxViewCasaHeight + this.minViewCasaHeight : this.minViewCasaHeight;

        const finalValue = this.state.isCasaExpanded ? 
        this.minViewCasaHeight : this.maxViewCasaHeight + this.minViewCasaHeight;
    
        this.setState({ isCasaExpanded: !this.state.isCasaExpanded });

        this.animCasaValue.setValue(initialValue);
        Animated.spring(     
            this.animCasaValue,
            {
                toValue: finalValue
            }
        ).start(); 
    }

    onToggleVisit = () => {
        const initialValue = this.state.isVisitExpanded ? 
        this.maxViewVisitHeight + this.minViewVisitHeight : this.minViewVisitHeight;

        const finalValue = this.state.isVisitExpanded ? 
        this.minViewVisitHeight : this.maxViewVisitHeight + this.minViewVisitHeight;
    
        this.setState({ isVisitExpanded: !this.state.isVisitExpanded });
    
        this.animVisitValue.setValue(initialValue);
        Animated.spring(     
            this.animVisitValue,
            {
                toValue: finalValue
            }
        ).start(); 
    }

    renderIcons = () => (
        <View 
            style={{ 
                flex: 0.5, 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <View 
                style={{ 
                    flex: 1, 
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            />
        </View>
    )

    renderCasaJogadores = (jogo) => {
        let casaJogadores = _.filter(jogo.escalacao.casa, (item) => !item.push).sort(
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
        casaJogadores = _.orderBy(casaJogadores, ['nome'], ['asc']);

        const numJogadores = casaJogadores.length;

        if (numJogadores === 0) {
            return false;
        }

        return (
            <List 
                containerStyle={{  
                    borderTopWidth: 0, 
                    borderBottomWidth: 0 
                }}
            >
                {
                    casaJogadores.map((item, index) => {
                        const updatedImg = retrieveUpdUserGroup(item.key, 'imgAvatar', item);
                        const imgAvt = updatedImg ? { uri: updatedImg } : { uri: '' };
                        return (
                            <ListItem
                                containerStyle={
                                    (index + 1) === numJogadores ? { borderBottomWidth: 0 } : null 
                                }
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
                                rightIcon={(
                                    this.renderIcons()
                                )}
                            />
                        );
                    })
                }
            </List>
        );
    }

    renderVisitJogadores = (jogo) => {
        let visitJogadores = _.filter(jogo.escalacao.visit, (item) => !item.push).sort(
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
        visitJogadores = _.orderBy(visitJogadores, ['nome'], ['asc']);

        const numJogadores = visitJogadores.length;

        if (numJogadores === 0) {
            return false;
        }

        return (
            <List 
                containerStyle={{  
                    borderTopWidth: 0, 
                    borderBottomWidth: 0 
                }}
            >
                {
                    visitJogadores.map((item, index) => {
                        const updatedImg = retrieveUpdUserGroup(item.key, 'imgAvatar', item);
                        const imgAvt = updatedImg ? { uri: updatedImg } : { uri: '' };
                        return (
                            <ListItem
                                containerStyle={
                                    (index + 1) === numJogadores ? { borderBottomWidth: 0 } : null 
                                }
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
                                rightIcon={(
                                    this.renderIcons()
                                )}
                            />
                        );
                    })
                }
            </List>
        );
    }

    renderConfirmados = (jogo) => {
        let jogadoresConfirmados = _.filter(jogo.confirmados, (jgCasa) => !jgCasa.push);
        jogadoresConfirmados = _.orderBy(jogadoresConfirmados, ['nome'], ['asc']);

        const numjogadoresConfirmados = jogadoresConfirmados.length;

        if (numjogadoresConfirmados === 0) {
            return false;
        }

        return (
            <Card
                containerStyle={styles.card}
            >
                <View 
                    style={styles.titleContainer} 
                    onLayout={this.onLayoutTitleCasa}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image 
                            style={{ height: 45, width: 45, marginRight: 10 }}
                            resizeMode={'stretch'}
                            source={imgTeam} 
                        /> 
                        <Text 
                            style={{ fontSize: 16, color: 'black' }}
                        >
                            Confirmados
                        </Text>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Badge value={numjogadoresConfirmados} />
                        </View>
                    </View>
                </View>
                <List 
                    containerStyle={{
                        marginTop: 0, 
                        borderTopWidth: 0, 
                        borderBottomWidth: 0
                    }}
                >
                    {
                        jogadoresConfirmados.map((item, index) => {
                            const updatedImg = retrieveUpdUserGroup(item.key, 'imgAvatar', item);
                            const imgAvt = updatedImg ? { uri: updatedImg } : { uri: '' };
                            return (
                                <ListItem
                                    containerStyle={
                                        (index + 1) === numjogadoresConfirmados ? 
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
                                    rightIcon={(<View />)}
                                />
                            );
                        })
                    }
                </List>
            </Card>     
        );
    }

    render = () => {
        const { jogo } = this.state;

        if (typeof jogo === 'object' && Object.keys(jogo).length === 0) {
            return false;
        }

        //const jogadoresCasaFt = _.filter(jogo.escalacao.casa, (jgCasa) => !jgCasa.push);
        //const jogadoresVisitFt = _.filter(jogo.escalacao.visit, (jgVisit) => !jgVisit.push);

        return (
            <View style={{ flex: 1 }}>
                <ScrollView style={styles.viewP}>
                    <Card
                        containerStyle={styles.card}
                    >
                        <Animated.View
                            style={{ height: this.animCasaValue }}
                        >
                            <View  
                                onLayout={this.onLayoutTitleCasa}
                            >
                                <TouchableWithoutFeedback
                                    onPress={() => this.onToggleCasa()}
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
                                                style={{ height: 40, width: 35, marginRight: 5 }}
                                                resizeMode={'stretch'}
                                                source={
                                                    shirtColors[jogo.homeshirt] || shirtColors.white
                                                }
                                            /> 
                                            <Text 
                                                onPress={() => this.onToggleCasa()}
                                                style={{ fontSize: 16, color: 'black' }}
                                            >
                                                { jogo.timeCasa ? jogo.timeCasa.trim() : 'Casa' }
                                            </Text>
                                        </View>
                                        <TouchableWithoutFeedback
                                            onPress={() => this.onToggleCasa()}
                                        >
                                            <Icon
                                                color={'black'}
                                                name={
                                                    this.state.isCasaExpanded ? 
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
                                onLayout={this.onLayoutCasa}
                            >
                                {/* <View style={{ height: this.state.heightDim }}>
                                    <Campo 
                                        jogadores={jogadoresCasaFt} 
                                        side={'casa'}
                                        tatics={'4-4-2'}
                                        enableTouch={false}
                                    />
                                </View> 
                                <View style={{ marginVertical: 20 }} /> */}
                                { this.renderCasaJogadores(jogo) }
                                <View style={{ marginVertical: 20 }} />
                            </View>
                        </Animated.View>
                    </Card>
                    <Card
                        containerStyle={styles.card}
                    >
                        <Animated.View
                            style={{ height: this.animVisitValue }}
                        >
                            <View onLayout={this.onLayoutTitleVisit}>
                                <TouchableWithoutFeedback
                                    onPress={() => this.onToggleVisit()}
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
                                                style={{ height: 40, width: 35, marginRight: 5 }}
                                                resizeMode={'stretch'}
                                                source={
                                                    shirtColors[jogo.visitshirt] || shirtColors.blue
                                                }
                                            />
                                            <Text 
                                                onPress={() => this.onToggleVisit()}
                                                style={{ fontSize: 16, color: 'black' }}
                                            >
                                                { 
                                                    jogo.timeVisit ? 
                                                    jogo.timeVisit.trim() 
                                                    : 
                                                    'Visitantes' 
                                                }
                                            </Text>
                                        </View>
                                        <TouchableWithoutFeedback
                                            onPress={() => this.onToggleVisit()}
                                        >
                                            <Icon
                                                color={'black'}
                                                name={
                                                    this.state.isVisitExpanded ? 
                                                    'menu-up' : 'menu-down'
                                                }
                                                type='material-community'
                                                size={30}
                                            />
                                        </TouchableWithoutFeedback>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View onLayout={this.onLayoutVisit}>
                                {/* <View style={{ height: this.state.heightDim }}>
                                    <Campo 
                                        jogadores={jogadoresVisitFt}
                                        side={'visit'}
                                        tatics={'4-4-2'}
                                        enableTouch={false}
                                    />
                                </View>
                                <View style={{ marginVertical: 20 }} /> */}
                                { this.renderVisitJogadores(jogo) }
                                <View style={{ marginVertical: 20 }} />
                            </View>
                        </Animated.View>
                    </Card>
                    { this.renderConfirmados(jogo) }
                    <View style={{ marginVertical: 60 }} />
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewP: {
        flex: 1,
        backgroundColor: colorAppF
    },
    text: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: 'black' 
    },
    card: {
        flex: 1,
        padding: 5,
        margin: 0,
        marginHorizontal: 5,
        marginVertical: 15,
        borderRadius: 5,
        overflow: 'hidden'
    },
    titleContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

const mapStateToProps = (state) => ({
    itemSelected: state.JogosReducer.itemSelectedAusente,
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps, {})(EscalacaoH);
