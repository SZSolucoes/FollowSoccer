import React from 'react';
import { 
    View,
    StyleSheet,
    ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { Text, List } from 'react-native-elements';
import _ from 'lodash';

import { colorAppSecondary, colorAppForeground } from '../../utils/Constantes';
import { modifyMenuChoosed, modifyMenuClean } from './MainDrawerMenuActions';

import { showDropdownAlert } from '../../utils/SystemEvents';
import imgAvatar from '../../assets/imgs/logo.png';
import Avatar from '../../tools/elements/Avatar';
import ListItem from '../../tools/elements/ListItem';

const CADGRUP = 'Grupos';
const MINHPART = 'Partidas';
const PERFIL = 'Perfil';
const CONVITES = 'Convites';
const SOBRE = 'Sobre';

class MainDrawerMenu extends React.Component {
    constructor(props) {
        super(props);

        this.onMenuItemPress = this.onMenuItemPress.bind();
    }

    componentDidMount = () => {
        setTimeout(() => this.props.modifyMenuChoosed(CADGRUP), 500);
    }

    componentWillUnmount = () => {
        this.props.modifyMenuClean();
    }

    onMenuItemPress = (menuKey) => {
        switch (menuKey) {
            case CADGRUP:
                setTimeout(() => this.props.modifyMenuChoosed(CADGRUP), 500);
                Actions.cadastroGrupos();
                break;
            case MINHPART:
                setTimeout(() => this.props.modifyMenuChoosed(MINHPART), 500);
                Actions.minhasPartidas();
                break;
            case PERFIL:
                setTimeout(() => this.props.modifyMenuChoosed(PERFIL), 500);
                Actions.profile();
                break;
            case CONVITES:
                setTimeout(() => this.props.modifyMenuChoosed(CONVITES), 500);
                Actions.convites();
                break;
            case SOBRE:
                this.props.modifyMenuChoosed(SOBRE);
                break;
            default:
                this.props.modifyMenuChoosed('');
        }
    }

    render = () => {
        const { userLogged } = this.props;
        let imgAvt = '';
        let nome = '';
        let conviteProps = {};
        const filtredInvites = _.filter(userLogged.convites, ita => typeof ita === 'object');

        if (typeof userLogged === 'object') {
            imgAvt = userLogged.imgAvatar ? { uri: userLogged.imgAvatar } : imgAvatar;
            nome = userLogged.nome;
        }

        if (filtredInvites.length) {
            conviteProps = { badge: { value: filtredInvites.length } };
        }

        return (
            <ScrollView contentContainerStyle={styles.viewPrinc}>
                <View 
                    style={{ 
                        flex: 1, 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: colorAppSecondary,
                        paddingVertical: 5
                    }}
                >
                    <View 
                        style={{ 
                            flex: 1,
                            alignItems: 'center', 
                            justifyContent: 'center'
                        }}
                    >
                        <Avatar
                            rounded
                            width={90}
                            source={imgAvt}
                            onPress={() => (
                                this.props.menuChoosed !== PERFIL &&
                                this.onMenuItemPress(PERFIL)
                            )}
                            activeOpacity={0.7}
                            containerStyle={{ marginBottom: 5 }}
                        />
                        <Text 
                            style={{ 
                                textAlign: 'center', 
                                fontFamily: 'OpenSans-SemiBold',
                                color: 'white',
                                fontSize: 16
                            }}
                        >
                            {nome}
                        </Text>
                    </View>
                </View>
                <View style={{ flex: 3 }}>
                    <List 
                        containerStyle={{ 
                            marginTop: 0,
                            borderBottomWidth: 0,
                            paddingVertical: 15
                        }}
                    >
                        <View style={{ paddingVertical: 5 }}>
                            <ListItem
                                hideChevron
                                key={CADGRUP}
                                title={CADGRUP}
                                containerStyle={{
                                    borderBottomWidth: 0,
                                    backgroundColor: 
                                        this.props.menuChoosed === CADGRUP ?
                                        colorAppForeground : 'transparent'
                                }}
                                titleStyle={{ 
                                    fontFamily: 'OpenSans-SemiBold', 
                                    color: 'black',
                                    fontWeight: '400'
                                }}
                                leftIcon={{
                                    name: 'account-group',
                                    type: 'material-community',
                                    size: 28,
                                    color: 
                                        this.props.menuChoosed === CADGRUP ?
                                        'black' : 'grey',
                                    style: {
                                        paddingHorizontal: 5
                                    }
                                }}
                                onPress={() => (
                                    this.props.menuChoosed !== CADGRUP &&
                                    this.onMenuItemPress(CADGRUP)
                                )}
                            />
                        </View>
                        {/* <View style={{ paddingVertical: 5 }}>
                            <ListItem
                                hideChevron
                                key={MINHPART}
                                title={MINHPART}
                                containerStyle={{
                                    borderBottomWidth: 0,
                                    backgroundColor: 
                                        this.props.menuChoosed === MINHPART ?
                                        colorAppForeground : 'transparent'
                                }}
                                titleStyle={{ 
                                    fontFamily: 'OpenSans-SemiBold', 
                                    color: 'black',
                                    fontWeight: '400'
                                }}
                                leftIcon={{
                                    name: 'clipboard-text',
                                    type: 'material-community',
                                    size: 28,
                                    color: 
                                        this.props.menuChoosed === MINHPART ?
                                        'black' : 'grey',
                                    style: {
                                        paddingHorizontal: 5
                                    }
                                }}
                                onPress={() => (
                                    this.props.menuChoosed !== MINHPART &&
                                    this.onMenuItemPress(MINHPART)
                                )}
                            />
                        </View> */}
                        <View style={{ paddingVertical: 5 }}>
                            <ListItem
                                hideChevron
                                key={PERFIL}
                                title={PERFIL}
                                containerStyle={{
                                    borderBottomWidth: 0,
                                    backgroundColor: 
                                        this.props.menuChoosed === PERFIL ?
                                        colorAppForeground : 'transparent'
                                }}
                                titleStyle={{ 
                                    fontFamily: 'OpenSans-SemiBold', 
                                    color: 'black',
                                    fontWeight: '400'
                                }}
                                leftIcon={{
                                    name: 'account-circle',
                                    type: 'material-community',
                                    size: 28,
                                    color: 
                                        this.props.menuChoosed === PERFIL ?
                                        'black' : 'grey',
                                    style: {
                                        paddingHorizontal: 5
                                    }
                                }}
                                onPress={() => (
                                    this.props.menuChoosed !== PERFIL &&
                                    this.onMenuItemPress(PERFIL)
                                )}
                            />
                        </View>
                        <View style={{ paddingVertical: 5 }}>
                            <ListItem
                                hideChevron
                                key={CONVITES}
                                title={CONVITES}
                                containerStyle={{
                                    borderBottomWidth: 0,
                                    backgroundColor: 
                                        this.props.menuChoosed === CONVITES ?
                                        colorAppForeground : 'transparent'
                                }}
                                titleStyle={{ 
                                    fontFamily: 'OpenSans-SemiBold', 
                                    color: 'black',
                                    fontWeight: '400'
                                }}
                                leftIcon={{
                                    name: 'email',
                                    type: 'material-community',
                                    size: 28,
                                    color: 
                                        this.props.menuChoosed === CONVITES ?
                                        'black' : 'grey',
                                    style: {
                                        paddingHorizontal: 5
                                    }
                                }}
                                onPress={() => (
                                    this.props.menuChoosed !== CONVITES &&
                                    this.onMenuItemPress(CONVITES)
                                )}
                                {...conviteProps}
                            />
                        </View>
                    </List>
                    <List 
                        containerStyle={{
                            marginTop: 0, 
                            borderBottomWidth: 0,
                            paddingVertical: 15
                        }}
                    >
                        <ListItem
                            hideChevron
                            key={SOBRE}
                            title={SOBRE}
                            containerStyle={{
                                borderBottomWidth: 0
                            }}
                            wrapperStyle={{
                                paddingVertical: 5
                            }}
                            titleStyle={{ 
                                fontFamily: 'OpenSans-SemiBold', 
                                color: 'black',
                                fontWeight: '400'
                            }}
                            leftIcon={{
                                name: 'information',
                                type: 'material-community',
                                size: 28,
                                color: 'grey',
                                style: {
                                    paddingHorizontal: 5
                                }
                            }}
                            onPress={() => {
                                showDropdownAlert();
                            }}
                        />
                    </List>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flexGrow: 1
    }
});

const mapStateToProps = (state) => ({
    menuChoosed: state.MainDrawerMenuReducer.menuChoosed,
    userLogged: state.LoginReducer.userLogged
});


export default connect(mapStateToProps, {
    modifyMenuChoosed,
    modifyMenuClean
})(MainDrawerMenu);
