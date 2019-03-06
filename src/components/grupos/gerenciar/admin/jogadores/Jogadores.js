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
import { Divider, Badge, Button } from 'react-native-elements';
import _ from 'lodash';

import { colorAppPrimary, colorAppSecondary, colorAppDark, colorAppForeground } from '../../../../../utils/Constantes';
import ListItem from '../../../../../tools/elements/ListItem';
import firebase from '../../../../../utils/Firebase';
import { retrieveUpdUserGroup } from '../../../../../utils/UserUtils';
import Card from '../../../../../tools/elements/Card';

import imgTeam from '../../../../../assets/imgs/team.png';
import { normalize } from '../../../../../utils/StrComplex';
import ShareModal from '../../../../../tools/share/ShareModal';

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
                        flex: 1.5,
                        overflow: 'scroll'
                    }}
                >
                    <ScrollView
                        contentContainerStyle={{
                            flex: 1,
                            backgroundColor: colorAppForeground
                        }}
                    >
                        <Card>
                            <Text 
                                style={{
                                    fontFamily: 'OpenSans-Regular',
                                    fontSize: normalize(13),
                                    color: 'black',
                                    fontWeight: '400'
                                }}
                            >
                                Deseja convidar um jogador ainda não cadastrado para o grupo ?
                            </Text>
                            <Button
                                backgroundColor='#03A9F4'
                                buttonStyle={{
                                    borderRadius: 0,
                                    marginTop: 10, 
                                    marginLeft: 0, 
                                    marginRight: 0, 
                                    marginBottom: 0
                                }}
                                title={'Convidar'}
                                onPress={() => this.shareModalRef && this.shareModalRef.onOpen()}
                                fontFamily='OpenSans-SemiBold'
                            />
                        </Card>
                    </ScrollView>
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
                                style={{ 
                                    fontSize: 16, 
                                    color: 'black',
                                    fontFamily: 'OpenSans-Regular'
                                }}
                            >
                                Jogadores
                            </Text>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Badge value={listUsuarios.length} />
                            </View>
                        </View>
                    </View>
                    <ScrollView
                        contentContainerStyle={{ 
                            flexGrow: 1, 
                            padding: 2
                        }}
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

                                const nome = retrieveUpdUserGroup(
                                    ita.key, 
                                    'nome', 
                                    ita
                                );
                                const email = retrieveUpdUserGroup(
                                    ita.key, 
                                    'email', 
                                    ita
                                );
                                const posicao = retrieveUpdUserGroup(
                                    ita.key, 
                                    'posicao', 
                                    ita
                                );

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
                                            title={nome}
                                            titleStyle={{
                                                fontWeight: '500'
                                            }}
                                            containerStyle={{
                                                borderBottomWidth: 0
                                            }}
                                            hideChevron
                                        />
                                        <Divider />
                                        <View
                                            style={{ padding: 5 }}
                                        >
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.cardTextUsersBold}>
                                                    {'Email: '} 
                                                </Text>
                                                <Text 
                                                    selectable
                                                    style={styles.cardTextUsersSemiBold}
                                                >
                                                    {email}
                                                </Text>
                                            </View>
                                            <View style={{ marginVertical: 2 }} />
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.cardTextUsersBold}>
                                                    {'Posição: '} 
                                                </Text>
                                                <Text 
                                                    selectable
                                                    style={styles.cardTextUsersSemiBold}
                                                >
                                                    {posicao}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card>
                                );
                            })
                        }
                        <View style={{ marginBottom: 50 }} />
                    </ScrollView>
                </View>
                <ShareModal
                    ref={ref => (this.shareModalRef = ref)}
                    shareOptions={{
                        title: 'React Native',
                        message: 'Hola mundo',
                        url: 'http://facebook.github.io/react-native/',
                        subject: 'Share Link' //  for email
                    }}
                    twitter
                    facebook
                    whatsapp
                    clipboard
                />
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
    },
    cardTextUsersSemiBold: {
        fontFamily: 'OpenSans-SemiBold',
    },
    cardTextUsersBold: {
        fontFamily: 'OpenSans-Bold',
        color: '#43484d'
    }
});

const mapStateToProps = (state) => ({
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoParticipantes: state.GruposReducer.grupoParticipantes,
    userLogged: state.LoginReducer.userLogged,
});

export default connect(mapStateToProps)(Jogadores);
