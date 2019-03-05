import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Text,
    Image,
    Animated,
    Dimensions,
    Alert
} from 'react-native';

import { connect } from 'react-redux';
import { 
    Icon,
    SearchBar,
    Divider,
    ButtonGroup
} from 'react-native-elements';
import _ from 'lodash';

import { 
    colorAppSecondary, 
    colorAppForeground, 
    shirtColors 
} from '../../../../../utils/Constantes';
import { checkConInfo, showDropdownAlert } from '../../../../../utils/SystemEvents';
import firebase from '../../../../../utils/Firebase';
import Card from '../../../../../tools/elements/Card';
import Versus from '../../jogos/Versus';
import JogoEdit from './JogoEdit';
import { modificaItemSelected } from '../../jogos/JogosActions';
import { 
    modificaFilterStr, 
    modificaFilterLoad, 
    modificaClean
 } from './CadastroJogosActions';

class CadastroJogos extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpt: 'Cadastrar',
            itemEdit: {},
            idxMdl: 0,
            titulo: '',
            data: '',
            descricao: '',
            timeCasa: '',
            homeshirt: '',
            timeVisit: '',
            visitshirt: '',
            imagem: '',
            b64Str: '',
            contentType: '',
            imgJogoUri: '',
            sideShirt: '',
            sideShirtText: '',
            jogos: []
        };

        this.scrollView = null;
        this.isAnimating = false;
        this.isCasaShow = false;
        this.isVisitShow = false;
        this.sideShirt = '';
        this.funExecOnEndAnimCustom = false;
        this.screenWidth = Dimensions.get('screen').width;
        this.animShirtView = new Animated.Value(this.screenWidth);
        this.animFadeInorOut = new Animated.Value(0);
        this.animFadeView = new Animated.Value(this.screenWidth);

        this.fbDatabaseRef = firebase.database().ref();
        this.fbJogosRef = null;

        this.animShirtView.addListener(({ value }) => {
            if (value === this.screenWidth) {
                if (this.sideShirt === 'casa' && 
                    this.state.sideShirtText !== 'TIME CASA (CAMISA)'
                ) {
                    this.setState({
                        sideShirt: 'casa',
                        sideShirtText: 'TIME CASA (CAMISA)'
                    });

                    this.scrollShirt.scrollTo({ x: 0, animated: false });

                    return;
                }
                if (this.sideShirt === 'visit' && 
                    this.state.sideShirtText !== 'TIME VISITANTES (CAMISA)'
                ) {
                    this.setState({
                        sideShirt: 'visit',
                        sideShirtText: 'TIME VISITANTES (CAMISA)'
                    });

                    this.scrollShirt.scrollTo({ x: 0, animated: false });

                    return;
                }
            }
        });

        this.animFadeInorOut.addListener(({ value }) => {
            if (value === 0) this.animFadeView.setValue(this.screenWidth);
        });
    }

    componentDidMount = () => {
        const { grupoSelected, userLogged } = this.props;
        this.fbJogosRef = this.fbDatabaseRef.child(`grupos/${grupoSelected.key}/jogos`);

        this.fbJogosRef.on('value', snap => {
            if (snap) {
                const snapVal = snap.val();

                if (snapVal) {
                    const mapped = _.map(snapVal, (ita, key) => ({ key, ...ita }));
                    const jogos = _.filter(
                        mapped, 
                        itb => itb.endStatus === '0' || 
                        (userLogged.level === '0' && itb.endStatus === '255')
                    );

                    this.setState({ jogos });

                    return;
                }
            }

            this.setState({ jogos: [] });
        });
    }
    
    componentDidUpdate = () => {
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    componentWillUnmount = () => {
        this.props.modificaClean();
        Dimensions.removeEventListener('change', this.onChangeDimensions);
        if (this.fbJogosRef) this.fbJogosRef.off();
    }

    onChangeDimensions = (dims) => {
        this.screenWidth = dims.screen.width;
    }

    onPressEditRemove = (jogo) => {
        const funExec = () => {
            const groupKey = this.props.grupoSelected.key;
            const dbJogoRef = this.fbDatabaseRef.child(`grupos/${groupKey}/jogos/${jogo.key}`);

            dbJogoRef.remove()
            .then(() => {
                if (jogo.imagem) {
                    firebase.storage().refFromURL(jogo.imagem).delete()
                    .then(() => true)
                    .catch(() => true);
                }
                setTimeout(
                    () => showDropdownAlert('success', 'Sucesso!', 'Jogo removido com sucesso.')
                , 1000);
            })
            .catch(() => 
                setTimeout(
                    () => showDropdownAlert('success', 'Sucesso!', 'Falha ao remover jogo.')
                , 1000)
            );
        };

        Alert.alert(
            'Aviso', 
            'Confirma a remoção do jogo selecionado ?',
            [
                { text: 'Cancelar', onPress: () => false },
                { 
                    text: 'Sim', 
                    onPress: () => checkConInfo(funExec) 
                }
            ],
            { cancelable: true }
        );
    }

    onAnimShirtView = (side, funExecOnEndAnim = false) => {
        if (!this.isAnimating) {
            this.isAnimating = true;

            // eslint-disable-next-line no-underscore-dangle
            const isFullWidth = this.animShirtView.__getValue() === this.screenWidth;
            if (this.sideShirt !== side && isFullWidth) {
                if (side === 'casa') {
                    this.setState({
                        sideShirt: side,
                        sideShirtText: 'TIME CASA (CAMISA)'
                    });
                } else if (side === 'visit') {
                    this.setState({
                        sideShirt: side,
                        sideShirtText: 'TIME VISITANTES (CAMISA)'
                    });
                }
            }

            this.sideShirt = side;
            this.funExecOnEndAnimCustom = funExecOnEndAnim || this.funExecOnEndAnimCustom;
            
            if (!this.state.sideShirt) {
                if (side === 'casa') {
                    this.setState({
                        sideShirt: side,
                        sideShirtText: 'TIME CASA (CAMISA)'
                    });
                } else if (side === 'visit') {
                    this.setState({
                        sideShirt: side,
                        sideShirtText: 'TIME VISITANTES (CAMISA)'
                    });
                }
            }

            if (side === 'casa') {
                if (this.isVisitShow) {
                    this.animFadeView.setValue(0);
                    Animated.sequence([
                        Animated.spring(
                            this.animShirtView,
                            {
                                toValue: this.screenWidth,
                                bounciness: 0,
                                useNativeDriver: true
                            }
                        ),
                        Animated.spring(
                            this.animShirtView,
                            {
                                toValue: 0,
                                //delay: 50,
                                bounciness: 0,
                                useNativeDriver: true
                            }
                        )
                    ]).start(() => { 
                        this.isVisitShow = false; 
                        this.isCasaShow = true; 
                        if (this.funExecOnEndAnimCustom) this.funExecOnEndAnimCustom();
                        this.isAnimating = false;
                    });
                } else if (this.isCasaShow) {
                    Animated.sequence([
                        Animated.timing(
                            this.animFadeInorOut,
                            {
                                toValue: 0,
                                duration: 100,
                                useNativeDriver: false
                            }
                        ),
                        Animated.spring(
                            this.animShirtView,
                            {
                                toValue: this.screenWidth,
                                bounciness: 0,
                                useNativeDriver: true
                            }
                        )
                    ]).start(() => { 
                        this.isCasaShow = false; 
                        if (this.funExecOnEndAnimCustom) this.funExecOnEndAnimCustom();
                        this.isAnimating = false; 
                    });
                } else {
                    this.animFadeView.setValue(0);
                    Animated.parallel([
                        Animated.spring(
                            this.animShirtView,
                            {
                                toValue: 0,
                                bounciness: 0,
                                useNativeDriver: true
                            }
                        ),
                        Animated.timing(
                            this.animFadeInorOut,
                            {
                                toValue: 1,
                                duration: 200,
                                useNativeDriver: false
                            }
                        )
                    ])
                    .start(() => { 
                        this.isCasaShow = true; 
                        if (this.funExecOnEndAnimCustom) this.funExecOnEndAnimCustom();
                        this.isAnimating = false; 
                    });
                }
    
                return;
            }
    
            if (side === 'visit') {
                if (this.isCasaShow) {
                    this.animFadeView.setValue(0);
                    Animated.sequence([
                        Animated.spring(
                            this.animShirtView,
                            {
                                toValue: this.screenWidth,
                                bounciness: 0,
                                useNativeDriver: true
                            }
                        ),
                        Animated.spring(
                            this.animShirtView,
                            {
                                toValue: 0,
                                //delay: 50,
                                bounciness: 0,
                                useNativeDriver: true
                            }
                        )
                    ]).start(() => { 
                        this.isCasaShow = false; 
                        this.isVisitShow = true;
                        if (this.funExecOnEndAnimCustom) this.funExecOnEndAnimCustom();
                        this.isAnimating = false;
                    });
                } else if (this.isVisitShow) {
                    Animated.sequence([
                        Animated.timing(
                            this.animFadeInorOut,
                            {
                                toValue: 0,
                                duration: 100,
                                useNativeDriver: false
                            }
                        ),
                        Animated.spring(
                            this.animShirtView,
                            {
                                toValue: this.screenWidth,
                                bounciness: 0,
                                useNativeDriver: true
                            }
                        )
                    ]).start(() => { 
                        this.isVisitShow = false; 
                        if (this.funExecOnEndAnimCustom) this.funExecOnEndAnimCustom();
                        this.isAnimating = false; 
                    });
                } else {
                    this.animFadeView.setValue(0);
                    Animated.parallel([
                        Animated.spring(
                            this.animShirtView,
                            {
                                toValue: 0,
                                bounciness: 0,
                                useNativeDriver: true
                            }
                        ),
                        Animated.timing(
                            this.animFadeInorOut,
                            {
                                toValue: 1,
                                duration: 200,
                                useNativeDriver: false
                            }
                        )
                    ]).start(() => { 
                        this.isVisitShow = true; 
                        if (this.funExecOnEndAnimCustom) this.funExecOnEndAnimCustom();
                        this.isAnimating = false; 
                    });
                }
    
                return;
            }
        }
    }

    onChangeSuperState = (newState) => {
        this.setState({ ...newState });
        if (this.state.modalOpt !== 'Cadastrar') {
            this.scrollView.scrollTo({
                y: 0,
                duration: 0,
                animated: false
            });
        }
    }

    onFilterJogosEdit = (jogos, filterStr) => {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(jogos, (jogo) => (
                (jogo.titulo && jogo.titulo.toLowerCase().includes(lowerFilter)) ||
                (jogo.descricao && jogo.descricao.toLowerCase().includes(lowerFilter)) ||
                (jogo.data && jogo.data.toLowerCase().includes(lowerFilter)) ||
                `${jogo.placarCasa}x${jogo.placarVisit}`.includes(lowerFilter)
        ));
    }

    renderListJogosEdit = (jogos) => {
        const reverseJogos = _.reverse([...jogos]);

        const jogosView = reverseJogos.map((item, index) => {
            const titulo = item.titulo ? item.titulo : ' ';
            const data = item.data ? item.data : ' ';
            const placarCasa = item.placarCasa ? item.placarCasa : '0'; 
            const placarVisit = item.placarVisit ? item.placarVisit : '0';
            let tituloConcat = '';

            if (titulo) {
                tituloConcat = titulo;
            }
            if (data) {
                tituloConcat += ` - ${data}`;
            }

            return (
                <View key={index}>
                    <Card 
                        title={tituloConcat} 
                        containerStyle={styles.card}
                    >
                        <Versus
                            jogo={item}
                            placarCasa={placarCasa} 
                            placarVisit={placarVisit}  
                        />
                        <Divider
                            style={{
                                marginVertical: 10
                            }}
                        />
                        <View 
                            style={{ 
                                flex: 1, 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                            }}
                        >
                            <View 
                                style={{ 
                                    flex: 1, 
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        this.scrollView.scrollTo({
                                            y: 0,
                                            duration: 0,
                                            animated: false
                                        });
                                        this.setState({ 
                                            modalOpt: 'Em Edição', 
                                            itemEdit: item 
                                        });
                                    }}
                                >
                                    <Icon
                                        name='square-edit-outline' 
                                        type='material-community' 
                                        size={34} color='green' 
                                    />   
                                </TouchableOpacity>
                            </View>
                            <View 
                                style={{ 
                                    flex: 1, 
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => checkConInfo(
                                        () => this.onPressEditRemove(item)
                                    )}
                                >
                                    <Icon
                                        name='delete' 
                                        type='material-community' 
                                        size={34} color='red' 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Card>
                    <View style={{ marginBottom: 10 }} />
                </View>
            );
        });
        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return jogosView;
    }

    renderBasedFilterOrNot = (jogos, filterStr) => {
        let jogosView = null;

        if (jogos) {
            if (filterStr) {
                jogosView = this.renderListJogosEdit(
                    this.onFilterJogosEdit(jogos, filterStr)
                );
            } else {
                jogosView = this.renderListJogosEdit(jogos);
            }
        }
        return jogosView;
    }

    renderEditar = (jogos, filterStr) => (
        <View>
            <Card containerStyle={styles.card}>
                <SearchBar
                    round
                    lightTheme
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    clearIcon={!!filterStr}
                    showLoadingIcon={
                        jogos &&
                        jogos.length > 0 && 
                        this.props.filterLoad
                    }
                    containerStyle={{ 
                        backgroundColor: 'transparent',
                        borderTopWidth: 0, 
                        borderBottomWidth: 0
                    }}
                    searchIcon={{ size: 26 }}
                    value={filterStr}
                    onChangeText={(value) => {
                        this.props.modificaFilterStr(value);
                        this.props.modificaFilterLoad(true);
                    }}
                    onClear={() => this.props.modificaFilterStr('')}
                    placeholder='Buscar jogo...' 
                />
                { this.renderBasedFilterOrNot(jogos, filterStr) }
            </Card>
            <View style={{ marginBottom: 30 }} />
        </View>
    )

    renderSwitchType = (modalOpt) => {
        if (modalOpt === 'Cadastrar') {
            return (
                <JogoEdit
                    ref={ref => (this.jogoEditRef = ref)}
                    scrollView={() => this.scrollView}
                    titulo={this.state.titulo}
                    data={this.state.data}
                    descricao={this.state.descricao}
                    timeCasa={this.state.timeCasa}
                    homeshirt={this.state.homeshirt}
                    timeVisit={this.state.timeVisit}
                    visitshirt={this.state.visitshirt}
                    b64Str={this.state.b64Str}
                    contentType={this.state.contentType}
                    imgJogoUri={this.state.imgJogoUri}
                    onChangeSuperState={(value) => this.onChangeSuperState(value)}
                    onAnimShirtView={this.onAnimShirtView}
                />
            );
        } else if (modalOpt === 'Editar') {
            const { filterStr } = this.props;

            return this.renderEditar(this.state.jogos, filterStr);
        } else if (modalOpt === 'Em Edição') {
            return (
                <JogoEdit
                    ref={ref => (this.jogoEditRef = ref)}
                    scrollView={() => this.scrollView}
                    titulo={this.state.itemEdit.titulo}
                    data={this.state.itemEdit.data}
                    descricao={this.state.itemEdit.descricao}
                    timeCasa={this.state.itemEdit.timeCasa}
                    homeshirt={this.state.itemEdit.homeshirt}
                    timeVisit={this.state.itemEdit.timeVisit}
                    visitshirt={this.state.itemEdit.visitshirt}
                    imgJogoUri={this.state.itemEdit.imagem}
                    keyItem={this.state.itemEdit.key}
                    onAnimShirtView={this.onAnimShirtView}
                    onChangeSuperState={(value) => this.onChangeSuperState(value)}
                />
            );
        } 

        return (
            <JogoEdit
                ref={ref => (this.jogoEditRef = ref)}
                scrollView={() => this.scrollView}
                titulo={this.state.titulo}
                data={this.state.data}
                descricao={this.state.descricao}
                timeCasa={this.state.timeCasa}
                homeshirt={this.state.homeshirt}
                timeVisit={this.state.timeVisit}
                visitshirt={this.state.visitshirt}
                b64Str={this.state.b64Str}
                contentType={this.state.contentType}
                imgJogoUri={this.state.imgJogoUri}
                onChangeSuperState={(value) => this.onChangeSuperState(value)}
                onAnimShirtView={this.onAnimShirtView}
            />
        );
    }

    render = () => {
        const buttonsGroup = ['Cadastrar', 'Editar'];
        return (
            <View style={styles.viewPrinc}>
                <View style={{ flexDirection: 'row' }}>
                    {
                        this.state.modalOpt !== 'Em Edição' ?
                        null : (<View style={{ flex: 1 }} />)
                    }
                    {
                        this.state.modalOpt !== 'Em Edição' ?
                        (
                            <View
                                style={styles.viewGroupBtn}
                            >
                                <ButtonGroup
                                    onPress={(index) => {
                                        this.scrollView.scrollTo({
                                            y: 0,
                                            duration: 0,
                                            animated: false
                                        });
                                        this.setState({
                                            modalOpt: buttonsGroup[index],
                                            idxMdl: index
                                        });
                                    }}
                                    selectedIndex={this.state.idxMdl}
                                    containerStyle={{ 
                                        width: '100%',
                                        backgroundColor: 'transparent',
                                        height: 40,
                                        borderRadius: 5
                                    }}
                                    buttons={buttonsGroup}
                                    textStyle={{
                                        color: 'gray',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        marginVertical: 8,
                                        marginRight: 5
                                    }}
                                    buttonStyle={{
                                        backgroundColor: 'transparent',
                                        borderColor: colorAppSecondary,
                                        borderWidth: 2,
                                    }}
                                    selectedButtonStyle={{
                                        backgroundColor: colorAppSecondary,
                                        borderColor: colorAppSecondary,
                                        borderWidth: 2,
                                    }}
                                    selectedTextStyle={{
                                        color: 'white',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        marginVertical: 8,
                                        marginRight: 5
                                    }}
                                />
                            </View>
                        )
                        :
                        (
                            <TouchableOpacity
                                style={styles.viewGroupBtnRed}
                                onPress={() => {
                                    this.scrollView.scrollTo({
                                        y: 0,
                                        duration: 0,
                                        animated: false
                                    });
                                    this.setState({
                                        modalOpt: 'Editar',
                                        idxMdl: 1
                                    }); 
                                }}
                            >
                                <View>
                                    <Text 
                                        style={[styles.dropModalBtnText, { marginHorizontal: 40 }]}
                                    >
                                        Voltar
                                    </Text>
                                    <Icon
                                        pointerEvents={'none'}
                                        containerStyle={{
                                            left: 0,
                                            top: 0,
                                            right: 0,
                                            bottom: 0, 
                                            position: 'absolute', 
                                            zIndex: 1,
                                            alignItems: 'flex-start',
                                            paddingRight: 8

                                        }}
                                        name='arrow-left-thick' 
                                        type='material-community' 
                                        size={25} color='white' 
                                    /> 
                                </View>
                            </TouchableOpacity>
                        )
                    }
                </View>
                <Divider
                    style={{
                        marginHorizontal: 15,
                        height: 2,
                        backgroundColor: colorAppSecondary,
                    }}
                />
                <ScrollView 
                    style={{ flex: 1 }} 
                    ref={(ref) => { this.scrollView = ref; }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    {this.renderSwitchType(this.state.modalOpt)}
                </ScrollView>
                <TouchableWithoutFeedback
                    onPress={() => this.onAnimShirtView(this.state.sideShirt)}
                >
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            backgroundColor: this.animFadeInorOut.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)'],
                                extrapolate: 'clamp'
                            }),
                            transform: [{ translateX: this.animFadeView }]
                        }}
                    />
                </TouchableWithoutFeedback>
                <Animated.View
                    pointerEvents={'box-none'}
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        transform: [{ translateX: this.animShirtView }]
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'flex-end'
                        }}
                    >
                        <View 
                            style={{
                                height: 150,
                                backgroundColor: 'white',
                                padding: 10
                            }}
                        >
                            <Text
                                style={{
                                    textAlign: 'left',
                                    fontWeight: '500',
                                    fontSize: 14,
                                }}
                            >
                                {this.state.sideShirtText}
                            </Text>
                            <ScrollView
                                ref={ref => (this.scrollShirt = ref)}
                                containerStyle={{
                                    flexGrow: '1',
                                    flexDirection: 'row'
                                }}
                                horizontal
                            >
                                {
                                    _.map(shirtColors, (ita, key) => (
                                        <TouchableOpacity
                                            key={key}
                                            onPress={() => {
                                                if (this.jogoEditRef) {
                                                    this.onAnimShirtView(this.state.sideShirt);
                                                    
                                                    this
                                                    .jogoEditRef
                                                    .onChooseShirtColor(this.state.sideShirt, key);
                                                } 
                                            }}
                                        >
                                            <Card
                                                containerStyle={{
                                                    padding: 2
                                                }}
                                            >
                                                <Image
                                                    source={ita}
                                                    style={{
                                                        height: 60,
                                                        width: 60
                                                    }}
                                                />
                                            </Card>
                                        </TouchableOpacity>
                                    ))
                                }
                            </ScrollView>
                        </View>
                    </View>
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
    card: {
        paddingHorizontal: 10,
    },
    viewGroupBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 15
    },
    viewGroupBtnRed: { 
        backgroundColor: 'red',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 15,
        marginVertical: 20,
        height: 40,
        borderRadius: 4
    },
    dropModalBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginRight: 5
    }
});

const mapStateToProps = (state) => ({
    filterStr: state.CadastroJogosReducer.filterStr,
    filterLoad: state.CadastroJogosReducer.filterLoad,
    conInfo: state.LoginReducer.conInfo,
    userLogged: state.LoginReducer.userLogged,
    grupoSelected: state.GruposReducer.grupoSelected,
});

export default connect(mapStateToProps, {
    modificaItemSelected,
    modificaFilterStr, 
    modificaFilterLoad,
    modificaClean
})(CadastroJogos);
