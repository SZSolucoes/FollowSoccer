import React from 'react';
import {
    ScrollView,
    View,
    ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import { colorAppP, colorAppPrimary } from '../../../../utils/Constantes';
import ListItem from '../../../../tools/elements/ListItem';
import firebase from '../../../../utils/Firebase';

class ListLikes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            listUsuarios: []
        };
    }
    componentDidMount = () => {
        const dbFirebaseUsuariosRef = firebase.database().ref().child('usuarios');

        dbFirebaseUsuariosRef.once('value', snap => {
            if (snap) {
                const snapVal = snap.val();
                if (snapVal) {
                    const mapped = _.map(snapVal, (ita, key) => ({ key, ...ita }));
                    this.setState({ listUsuarios: mapped });

                    return;
                }
            }

            this.setState({ listUsuarios: [] });
        });
    }
    render = () => {
        const { infoMsgSelected } = this.props;
        const { listUsuarios } = this.state;

        let usuarios = [];

        if (!infoMsgSelected) return null;

        if (!listUsuarios.length) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size={'large'} color={colorAppPrimary} />
                </View>
            );
        } 

        const { listLikes } = infoMsgSelected;

        if (!listLikes || listLikes.length <= 0) return null;

        for (let index = 0; index < listLikes.length; index++) {
            const element = listLikes[index];
            const findedUser = _.find(listUsuarios, it => it.key === element.key);

            if (findedUser) usuarios.push(findedUser);
        }

        if (!usuarios.length) return null;

        usuarios = _.orderBy(usuarios, ['nome'], ['asc']);

        return (
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, padding: 2 }}
            >
                {
                    _.map(usuarios, (ita, index) => (
                        <ListItem
                            key={index}
                            avatar={ita.imgAvatar}
                            title={ita.nome}
                            titleStyle={{
                                fontWeight: '500'
                            }}
                            containerStyle={{
                                borderBottomWidth: 0
                            }}
                            hideChevron
                            avatarProps={{
                                width: 50,
                                height: 50,
                                borderRadius: 50 / 2,
                                showEditButton: true,
                                editButton: {
                                    size: 20,
                                    iconName: 'thumb-up',
                                    iconType: 'material',
                                    iconColor: 'white',
                                    underlayColor: colorAppP,
                                    style: {
                                        backgroundColor: 'green'
                                    }
                                }
                            }}
                        />
                    ))
                }
                <View style={{ marginBottom: 50 }} />
            </ScrollView>
        );
    }
}

const mapStateToProps = () => ({});

export default connect(mapStateToProps)(ListLikes);
