import React from 'react';
import {
    ScrollView,
    View,
    Text,
    Image,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';
import { Divider, Badge } from 'react-native-elements';
import _ from 'lodash';

import { colorAppPrimary } from '../../../../../utils/Constantes';
import ListItem from '../../../../../tools/elements/ListItem';
import firebase from '../../../../../utils/Firebase';
import { retrieveUpdUserGroup } from '../../../../../utils/UserUtils';
import Card from '../../../../../tools/elements/Card';

import imgTeam from '../../../../../assets/imgs/team.png';

class Jogadores extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();

        this.state = {
            loading: true,
            listUsuarios: []
        };
    }

    render = () => {
        const { grupoSelected } = this.props;

        const listUsuarios = grupoSelected.participantes ? 
        _.values(grupoSelected.participantes) : [];

        if (!(listUsuarios.length > 0)) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size={'large'} color={colorAppPrimary} />
                </View>
            );
        } 

        return (
            <View
                style={{ flex: 1 }}
            >
                <View
                    style={{
                        flex: 1
                    }}
                >
                    <Card>
                        <Text>Deseja convidar um jogador não cadastrado para o grupo ?</Text>
                    </Card>
                </View>
                <View
                    style={{
                        flex: 3
                    }}
                >
                    <View 
                        style={styles.titleContainer}
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
                                Jogadores
                            </Text>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Badge value={listUsuarios.length} />
                            </View>
                        </View>
                    </View>
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, padding: 2 }}
                    >
                        {
                            _.map(listUsuarios, (ita, index) => {
                                const updatedImg = retrieveUpdUserGroup(
                                    ita.key, 
                                    'imgAvatar', 
                                    ita
                                );
                                const imgAvt = updatedImg ? 
                                { uri: updatedImg } : { uri: '' };

                                return (
                                    <Card
                                        key={index}
                                        containerStyle={{
                                            padding: 5,
                                            margin: 5
                                        }}
                                    >
                                        <ListItem
                                            avatar={imgAvt}
                                            title={retrieveUpdUserGroup(
                                                ita.key, 
                                                'nome', 
                                                ita
                                            )}
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
                                                    underlayColor: colorAppPrimary,
                                                    style: {
                                                        backgroundColor: 'green'
                                                    }
                                                }
                                            }}
                                        />
                                        <Divider />
                                    </Card>
                                );
                            })
                        }
                        <View style={{ marginBottom: 50 }} />
                    </ScrollView>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    }
});

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoParticipantes: state.GruposReducer.grupoParticipantes,
    userLogged: state.LoginReducer.userLogged,
});

export default connect(mapStateToProps)(Jogadores);
