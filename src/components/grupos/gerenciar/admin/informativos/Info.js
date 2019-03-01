import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    Text,
    ActivityIndicator
} from 'react-native';

import { connect } from 'react-redux';
import { 
    Icon,
    SearchBar,
    Divider,
    ButtonGroup
} from 'react-native-elements';
import _ from 'lodash';
import InfoEdit from './InfoEdit';

import { colorAppS, colorAppF } from '../../../utils/constantes';
import { checkConInfo } from '../../../utils/jogosUtils';
import { showAlert } from '../../../utils/store';
import { limitDotText } from '../../../utils/strComplex';
import ListItem from '../../tools/ListItem';
import Card from '../../tools/Card';
import firebase from '../../../Firebase';
import imgAvatar from '../../../imgs/perfiluserimg.png';
import {
    modificaFilterLoad,
    modificaFilterStr,
    modificaItemSelected,
    modificaFlagRemoveInfo,
    modificaClean
} from '../../../actions/InfoActions';
import { modificaRemocao } from '../../../actions/AlertSclActions';
import { store } from '../../../App';

class Info extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            dropWidth: 0,
            modalOpt: 'Cadastrar',
            itemEdit: {},
            idxMdl: 0,
            titulo: '',
            imgsArticleUri: [],
            descricao: '',
            linkExt: '',
            refresh: false
        };

        this.scrollView = null;

        this.renderEditar = this.renderEditar.bind(this);
        this.renderSwitchType = this.renderSwitchType.bind(this);
        this.onPressBack = this.onPressBack.bind(this);
        this.onPressEditRemove = this.onPressEditRemove.bind(this);
        this.onChangeSuperState = this.onChangeSuperState.bind(this);
        this.renderListInfosEdit = this.renderListInfosEdit.bind(this);
        this.onFilterInfosEdit = this.onFilterInfosEdit.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.renderIcons = this.renderIcons.bind(this);
    }

    componentWillUnmount() {
        this.props.modificaClean();
    }

    onPressBack(refresh = false) {
        this.scrollView.scrollTo({
            y: 0,
            duration: 0,
            animated: false
        });

        if (refresh) {
            this.setState({
                modalOpt: 'Editar',
                idxMdl: 1,
                refresh: true
            });
            firebase.database().ref().child('informativos').once('value', snap => {
                let snapVal = null;
                if (snap) {
                    snapVal = snap.val();
                }

                if (snapVal) {
                    store.dispatch({
                        type: 'modifica_listinfos_info',
                        payload: _.map(snapVal, (value, key) => ({ key, ...value }))
                    });
                }
                this.setState({
                    refresh: false
                });
            });
        } else {
            this.setState({
                modalOpt: 'Editar',
                idxMdl: 1,
                refresh: false
            });
        }
    }

    onPressEditRemove(item) {
        this.props.modificaItemSelected(item);
        this.props.modificaFlagRemoveInfo(true);
        this.props.modificaRemocao(true);
        showAlert('danger', 'Remover!', 'Deseja remover o informativo selecionado ?');
    }

    onChangeSuperState(newState) {
        this.setState({ ...newState });
    }

    onFilterInfosEdit(infos, filterStr) {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(infos, (usuario) => (
                (usuario.descPost && usuario.descPost.toLowerCase().includes(lowerFilter)) ||
                (usuario.nomeUser && usuario.nomeUser.toLowerCase().includes(lowerFilter)) ||
                (usuario.perfilUser && usuario.perfilUser.toLowerCase().includes(lowerFilter)) ||
                (usuario.textArticle && usuario.textArticle.toLowerCase().includes(lowerFilter)) ||
                (usuario.dataPost && usuario.dataPost.toLowerCase().includes(lowerFilter))
        ));
    }

    renderIcons(item) {
        return (
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
                        alignItems: 'center',
                        justifyContent: 'flex-end'
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
                        justifyContent: 'flex-end'
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
        );
    }

    renderListInfosEdit(infos) {
        const reverseInfos = _.reverse([...infos]);
        let infosView = null;

        if (infos.length) {
            infosView = (
                reverseInfos.map((item, index) => {
                    const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                    const nomeUser = item.nomeUser ? item.nomeUser : 'Patinhas';
                    const perfilUser = item.perfilUser ? item.perfilUser : 'Administrador';
                    return (
                        <View key={index}>
                            <Card containerStyle={styles.card}>
                                <View style={{ marginVertical: 5 }}>
                                    <ListItem
                                        containerStyle={{ borderBottomWidth: 0 }}
                                        avatar={imgAvt}
                                        title={nomeUser}
                                        subtitle={perfilUser}
                                        rightIcon={(this.renderIcons(item))}
                                    />
                                </View>
                                { 
                                    !!item.descPost &&
                                    <View style={{ marginHorizontal: 10 }}>
                                        <Text>
                                            { limitDotText(item.descPost, 150) }
                                        </Text>
                                    </View>
                                }
                                {
                                    !!item.textArticle &&
                                    <View
                                        style={{
                                            paddingVertical: 5,
                                            paddingHorizontal: 10
                                        }}
                                    >
                                        <Text 
                                            style={{
                                                color: 'black',
                                                fontWeight: '400'
                                            }}
                                        >
                                            { limitDotText(item.textArticle, 40) }
                                        </Text>
                                    </View>
                                }
                                <View style={{ marginVertical: 5 }} />
                            </Card>
                        </View>
                    );
                })
            );
        }

        setTimeout(() => this.setState({ refresh: false }), 1000);
        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return infosView;
    }

    renderBasedFilterOrNot() {
        const { listInfos, filterStr } = this.props;
        let infosView = null;
        if (listInfos) {
            if (filterStr) {
                infosView = this.renderListInfosEdit(
                    this.onFilterInfosEdit(listInfos, filterStr)
                );
            } else {
                infosView = this.renderListInfosEdit(listInfos);
            }
        }
        return infosView;
    }

    renderEditar() {
        return (
            <View>
                <Card containerStyle={styles.card}>
                    <SearchBar
                        round
                        lightTheme
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        clearIcon={!!this.props.filterStr}
                        showLoadingIcon={
                            this.props.listInfos &&
                            this.props.listInfos.length > 0 && 
                            this.props.filterLoad
                        }
                        containerStyle={{ 
                            backgroundColor: 'transparent',
                            borderTopWidth: 0, 
                            borderBottomWidth: 0
                        }}
                        searchIcon={{ size: 26 }}
                        value={this.props.filterStr}
                        onChangeText={(value) => {
                            this.props.modificaFilterStr(value);
                            this.props.modificaFilterLoad(true);
                        }}
                        onClear={() => this.props.modificaFilterStr('')}
                        placeholder='Buscar informativo...' 
                    />
                    { this.renderBasedFilterOrNot() }
                </Card>
                <View style={{ marginBottom: 30 }} />
            </View>
        );
    }

    renderSwitchType(modalOpt) {
        const filtred = _.filter(this.state.itemEdit.imgsArticle, item => !item.push);
        
        switch (modalOpt) {
            case 'Cadastrar':
                return (
                    <InfoEdit 
                        scrollView={() => this.scrollView}
                        titulo={this.state.titulo}
                        imgsArticleUri={this.state.imgsArticleUri}
                        descricao={this.state.descricao}
                        linkExt={this.state.linkExt}
                        onChangeSuperState={(value) => this.onChangeSuperState(value)}
                    />
                );
            case 'Editar':
                return this.renderEditar();
            case 'Em Edição':
                return (
                    <InfoEdit 
                        scrollView={() => this.scrollView}
                        titulo={this.state.itemEdit.descPost}
                        imgsArticleUri={filtred}
                        descricao={this.state.itemEdit.textArticle}
                        linkExt={this.state.itemEdit.linkArticle}
                        keyItem={this.state.itemEdit.key}
                        onPressBack={this.onPressBack}
                    />);
            default:
                return (
                    <InfoEdit 
                        scrollView={() => this.scrollView}
                        titulo={this.state.titulo}
                        imgsArticleUri={this.state.imgsArticleUri}
                        descricao={this.state.descricao}
                        linkExt={this.state.linkExt}
                        onChangeSuperState={(value) => this.onChangeSuperState(value)}
                    />
                );
        }
    }

    render() {
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

                                        if (index === 1) {
                                            this.setState({
                                                refresh: true,
                                                idxMdl: index
                                            });

                                            setTimeout(() => {
                                                this.setState({
                                                    modalOpt: buttonsGroup[index],
                                                    refresh: false
                                                });
                                            }, 1000);

                                            return;
                                        }

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
                                        borderColor: colorAppS,
                                        borderWidth: 2,
                                    }}
                                    selectedButtonStyle={{
                                        backgroundColor: colorAppS,
                                        borderColor: colorAppS,
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
                                onPress={() => this.onPressBack()}
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
                        backgroundColor: colorAppS,
                    }}
                />
                <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    ref={(ref) => { this.scrollView = ref; }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    {
                        this.state.refresh ?
                        (
                            <View
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <ActivityIndicator size='large' color={colorAppS} />
                            </View>
                        )
                        :
                        this.renderSwitchType(this.state.modalOpt)
                    }
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF
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
    listInfos: state.InfoReducer.listInfos,
    filterStr: state.InfoReducer.filterStr,
    filterLoad: state.InfoReducer.filterLoad,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {
    modificaFilterLoad,
    modificaFilterStr,
    modificaItemSelected,
    modificaFlagRemoveInfo,
    modificaClean,
    modificaRemocao
})(Info);
