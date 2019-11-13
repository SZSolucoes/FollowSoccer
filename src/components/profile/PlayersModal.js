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
import { SearchBar, List, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
    modificaShowUsersModal,
    modificaFilterModalLoad,
    modificaFilterModalStr
} from '../../actions/PainelAdminActions';

import perfilUserImg from '../../imgs/perfiluserimg.png';
import { checkConInfo } from '../../utils/SystemEvents';
import ListItem from '../../tools/elements/ListItem';
import Card from '../../tools/elements/Card';

class PlayersModal extends React.Component {
    constructor(props) {
        super(props);

        this.closeModal = this.closeModal.bind(this);
        this.onFilterUsuarios = this.onFilterUsuarios.bind(this);
        this.renderListUsuarios = this.renderListUsuarios.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.onChoosePlayer = this.onChoosePlayer.bind(this);

        this.state = {
            fadeAnimValue: new Animated.Value(0)
        };
    }

    onChoosePlayer(item) {
        this.props.onChooseUser(item, () => this.closeModal());
    }

    onFilterUsuarios(usuarios, filterModalStr) {
        const lowerFilter = filterModalStr.toLowerCase();
        return _.filter(usuarios, (usuario) => (
                (usuario.email && usuario.email.toLowerCase().includes(lowerFilter)) ||
                (usuario.dtnasc && usuario.dtnasc.toLowerCase().includes(lowerFilter)) ||
                (usuario.tipoPerfil && usuario.tipoPerfil.toLowerCase().includes(lowerFilter)) ||
                (usuario.nome && usuario.nome.toLowerCase().includes(lowerFilter)) || 
                (usuario.posicao && usuario.posicao.toLowerCase().includes(lowerFilter)) ||
                (usuario.nomeForm && usuario.nomeForm.toLowerCase().includes(lowerFilter)) 
        ));
    }

    closeModal() {
        Animated.timing(
            this.state.fadeAnimValue,
            {
                toValue: 0,
                duration: 200
            }
        ).start(() => {
            setTimeout(() => this.props.modificaShowUsersModal(false), 100);
            setTimeout(() => this.props.modificaFilterModalStr(''), 100);
        });
    }

    renderListUsuarios(usuarios) {
        let usuariosView = null;

        if (usuarios.length) {
            const filtredByUserLogged = _.filter(
                usuarios, (usr) => usr.key !== this.props.userLogged.key
            );
            const newSortedUsers = _.orderBy(filtredByUserLogged, ['nome', 'emai'], ['asc', 'asc']);
            usuariosView = (
                <List containerStyle={{ marginBottom: 20 }}>
                {
                    newSortedUsers.map((item, index) => {
                        if ((index + 1) > 30) {
                            return false;
                        }
                        const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : perfilUserImg;
                        return (
                            <ListItem
                                roundAvatar
                                avatar={imgAvt}
                                key={index}
                                title={item.nome}
                                subtitle={item.email}
                                rightIcon={(<View />)}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    checkConInfo(() => this.onChoosePlayer(item));
                                }}
                            />
                        );
                    })
                }
                </List>
            );
        }

        setTimeout(() => this.props.modificaFilterModalLoad(false), 1000);
        return usuariosView;
    }

    renderBasedFilterOrNot() {
        const { listUsuarios, filterModalStr } = this.props;
        let usuariosView = null;
        if (listUsuarios) {
            if (filterModalStr) {
                usuariosView = this.renderListUsuarios(
                    this.onFilterUsuarios(listUsuarios, filterModalStr)
                );
            } else {
                usuariosView = this.renderListUsuarios(listUsuarios);
            }
        }
        return usuariosView;
    }

    render() {
        const { title } = this.props;

        return (
            <Modal
                animationType={'slide'}
                transparent
                visible={this.props.showUsersModal}
                supportedOrientations={['portrait']}
                onRequestClose={() => this.closeModal()}
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
                    onPress={() => this.closeModal()}
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
                                this.closeModal();
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
                                                    {title || ''}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Keyboard.dismiss();
                                                    this.closeModal();
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
                                        <SearchBar
                                            round
                                            lightTheme
                                            autoCapitalize={'none'}
                                            autoCorrect={false}
                                            clearIcon={!!this.props.filterModalStr}
                                            showLoadingIcon={
                                                this.props.listUsuarios &&
                                                this.props.listUsuarios.length > 0 && 
                                                this.props.filterModalLoad
                                            }
                                            containerStyle={{ 
                                                backgroundColor: 'transparent',
                                                borderTopWidth: 0, 
                                                borderBottomWidth: 0
                                            }}
                                            searchIcon={{ size: 26 }}
                                            value={this.props.filterModalStr}
                                            onChangeText={(value) => {
                                                this.props.modificaFilterModalStr(value);
                                                this.props.modificaFilterModalLoad(true);
                                            }}
                                            onClear={() => this.props.modificaFilterModalStr('')}
                                            placeholder='Buscar jogador...' 
                                        />
                                        <ScrollView
                                            style={{ height: '72%' }}
                                        >
                                            { this.renderBasedFilterOrNot() }
                                        </ScrollView>
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
        width: '80%',
        height: '70%',
        borderRadius: 5,
        padding: 5,
    }
});

const mapStateToProps = (state) => ({
    listUsuarios: state.UsuariosReducer.listUsuarios,
    filterModalStr: state.PainelAdminReducer.filterModalStr,
    filterModalLoad: state.PainelAdminReducer.filterModalLoad,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, { 
    modificaShowUsersModal,
    modificaFilterModalLoad,
    modificaFilterModalStr 
})(PlayersModal);

