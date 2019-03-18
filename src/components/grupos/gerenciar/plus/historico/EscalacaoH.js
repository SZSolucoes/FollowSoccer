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
import { colorAppF, shirtColors } from '../../../utils/constantes';
//import Campo from '../../campo/Campo';
import { isPortrait } from '../../../utils/orientation';
import { getPosIndex } from '../../../utils/jogosUtils';
import ListItem from '../../tools/ListItem';
import Card from '../../tools/Card';

import imgTeam from '../../../imgs/team.png';
import imgAvatar from '../../../imgs/perfiluserimg.png';

class EscalacaoH extends React.Component {

    constructor(props) {
        super(props);

        this.isFirstCasa = true;
        this.isFirstVisit = true;

        this.maxViewCasaHeight = 0;
        this.minViewCasaHeight = 0;

        this.maxViewVisitHeight = 0;
        this.minViewVisitHeight = 0;

        this.onLayoutTitleCasa = this.onLayoutTitleCasa.bind(this);
        this.onLayoutCasa = this.onLayoutCasa.bind(this);
        this.onToggleCasa = this.onToggleCasa.bind(this);

        this.onLayoutTitleVisit = this.onLayoutTitleVisit.bind(this);
        this.onLayoutVisit = this.onLayoutVisit.bind(this);
        this.onToggleVisit = this.onToggleVisit.bind(this);

        this.onChangeDimensions = this.onChangeDimensions.bind(this);
        this.renderCasaJogadores = this.renderCasaJogadores.bind(this);
        this.renderVisitJogadores = this.renderVisitJogadores.bind(this);
        this.renderIcons = this.renderIcons.bind(this);
        this.renderConfirmados = this.renderConfirmados.bind(this);

        this.state = {
            heightDim: Dimensions.get('screen').height,
            animCasaValue: new Animated.Value(),
            animVisitValue: new Animated.Value(),
            isCasaExpanded: true,
            isVisitExpanded: true
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.onChangeDimensions);
        if (isPortrait()) {
            this.setState({ heightDim: Dimensions.get('screen').height / 2.5 });
        } else {
            this.setState({ heightDim: Dimensions.get('screen').height / 1.5 });
        }
    }

    shouldComponentUpdate(nextProps, nextStates) {
        const { itemSelected } = this.props;

        if (nextProps.listJogos) {
            const nj = _.filter(nextProps.listJogos, (item) => item.key === itemSelected)[0];
                
            if (!nj) {
                return false;
            }
        }

        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
    }

    onChangeDimensions(event) {
        if (isPortrait()) {
            this.setState({ heightDim: event.screen.height / 2.5 });
        }
    }

    onLayoutTitleCasa(event) {
        this.minViewCasaHeight = event.nativeEvent.layout.height;
        if (this.isFirstCasa) {
            this.onToggleCasa();
            this.isFirstCasa = false;
        }
    }

    onLayoutCasa(event) {
        this.maxViewCasaHeight = event.nativeEvent.layout.height;
        if (this.state.isCasaExpanded) {
            Animated.spring(     
                this.state.animCasaValue,
                {
                    toValue: this.maxViewCasaHeight + 50
                }
            ).start(); 
        }
    }

    onLayoutTitleVisit(event) {
        this.minViewVisitHeight = event.nativeEvent.layout.height;
        if (this.isFirstVisit) {
            this.onToggleVisit();
            this.isFirstVisit = false;
        }
    }

    onLayoutVisit(event) {
        this.maxViewVisitHeight = event.nativeEvent.layout.height;
        if (this.state.isVisitExpanded) {
            Animated.spring(     
                this.state.animVisitValue,
                {
                    toValue: this.maxViewVisitHeight + 50
                }
            ).start(); 
        }
    }

    onToggleCasa() {
        const initialValue = this.state.isCasaExpanded ? 
        this.maxViewCasaHeight + this.minViewCasaHeight : this.minViewCasaHeight;

        const finalValue = this.state.isCasaExpanded ? 
        this.minViewCasaHeight : this.maxViewCasaHeight + this.minViewCasaHeight;
    
        this.setState({ isCasaExpanded: !this.state.isCasaExpanded });

        this.state.animCasaValue.setValue(initialValue);
        Animated.spring(     
            this.state.animCasaValue,
            {
                toValue: finalValue
            }
        ).start(); 
    }

    onToggleVisit() {
        const initialValue = this.state.isVisitExpanded ? 
        this.maxViewVisitHeight + this.minViewVisitHeight : this.minViewVisitHeight;

        const finalValue = this.state.isVisitExpanded ? 
        this.minViewVisitHeight : this.maxViewVisitHeight + this.minViewVisitHeight;
    
        this.setState({ isVisitExpanded: !this.state.isVisitExpanded });
    
        this.state.animVisitValue.setValue(initialValue);
        Animated.spring(     
            this.state.animVisitValue,
            {
                toValue: finalValue
            }
        ).start(); 
    }

    renderIcons() {
        return (
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
        );
    }

    renderCasaJogadores(jogo) {
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
                        const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                        return (
                            <ListItem
                                containerStyle={
                                    (index + 1) === numJogadores ? { borderBottomWidth: 0 } : null 
                                }
                                roundAvatar
                                avatar={imgAvt}
                                key={index}
                                title={item.nome}
                                subtitle={item.posicao}
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

    renderVisitJogadores(jogo) {
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
                        const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                        return (
                            <ListItem
                                containerStyle={
                                    (index + 1) === numJogadores ? { borderBottomWidth: 0 } : null 
                                }
                                roundAvatar
                                avatar={imgAvt}
                                key={index}
                                title={item.nome}
                                subtitle={item.posicao}
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

    renderConfirmados(jogo) {
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
                            const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
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
                                    title={item.nome}
                                    rightIcon={(<View />)}
                                />
                            );
                        })
                    }
                </List>
            </Card>     
        );
    }

    render() {
        const { listJogos, itemSelected } = this.props;
        const jogo = _.filter(listJogos, (item) => item.key === itemSelected)[0];

        if (!jogo) {
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
                            style={{ height: this.state.animCasaValue }}
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
                            style={{ height: this.state.animVisitValue }}
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
    itemSelected: state.HistoricoReducer.itemSelected,
    listJogos: state.HistoricoReducer.listJogos
});

export default connect(mapStateToProps, {})(EscalacaoH);
