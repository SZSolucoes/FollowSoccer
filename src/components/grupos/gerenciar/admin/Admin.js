import React from 'react';
import { 
    View,
    Text,
    Alert,
    Platform,
    ScrollView, 
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';

import { colorAppForeground } from '../../../../utils/Constantes';
import Card from '../../../../tools/elements/Card';

class Admin extends React.Component {
    render() {
        return (
            <ScrollView style={styles.viewPrinc}>
                <View style={{ marginTop: 10 }} />
                <View style={styles.viewLinha}>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={() => Actions.cadastroJogos()}
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <Icon name='soccer-field' type='material-community' size={34} />
                                <View style={{ marginTop: 10 }} />
                                <Text style={styles.text}>Jogos</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={() => Actions.gerenciar()}
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <View style={{ marginTop: 2 }} />
                                <Icon name='users' type='font-awesome' size={26} />
                                <View style={{ marginTop: 15 }} />
                                <Text style={styles.text}>Gerenciar</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewLinha}>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={() => Actions.jogadores()}
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <Icon 
                                    name='account-card-details' 
                                    type='material-community' 
                                    size={34} 
                                />
                                <View style={{ marginTop: 10 }} />
                                <Text style={styles.text}>Jogadores</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={
                            () => Actions.financeiroAdmin(
                                { onBack: () => Actions.popTo('ownerMenuAdmin') }
                            )
                        }
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <Icon name='cash-multiple' type='material-community' size={34} />
                                <View style={{ marginTop: 10 }} />
                                <Text style={styles.text}>Financeiro</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewLinha}>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={() => Actions.cadastroInfos()}
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <View style={{ marginTop: 2 }} />
                                <Icon name='clipboard' type='font-awesome' size={26} />
                                <View style={{ marginTop: 15 }} />
                                <Text style={styles.text}>Informativos</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={
                            () => Actions.adminEnquetes(
                                { onBack: () => Actions.popTo('ownerMenuAdmin') }
                            )
                        }
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <Icon name='poll' type='material-community' size={34} />
                                <View style={{ marginTop: 10 }} />
                                <Text style={styles.text}>Enquetes</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewLinha}>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={
                            () => Actions.muralAdmin(
                                { onBack: () => Actions.popTo('ownerMenuAdmin') }
                            )
                        }
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <Icon name='chart-timeline' type='material-community' size={34} />
                                <View style={{ marginTop: 10 }} />
                                <Text style={styles.text}>Mural</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={
                            () => Alert.alert('Em desenvolvimento')/* Actions.adminParams(
                                { onBack: () => Actions.popTo('ownerMenuAdmin') }
                            ) */
                        }
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <Icon name='settings' type='material-community' size={34} />
                                <View style={{ marginTop: 10 }} />
                                <Text style={styles.text}>Configurações</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 100 }} />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
    viewLinha: {
        flex: 1,
        flexDirection: 'row',
        ...Platform.select({
            ios: {
                elevation: 2
            },
            android: {
                elevation: 2
            }
        })
    },
    viewIconText: { 
        flex: 1, 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    text: {
        color: 'black',
        fontWeight: '400',
        alignSelf: 'center',
        fontFamily: 'OpenSans-Regular'
    }
});

const mapStateToProps = () => ({
});

export default connect(mapStateToProps, {})(Admin);
