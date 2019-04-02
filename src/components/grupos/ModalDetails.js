import React from 'react';
import {
    View,
    Text,
    Modal, 
    Keyboard,
    Animated,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';
import { Icon } from 'react-native-elements';
import { TextMask } from 'react-native-masked-text';
import Moment from 'moment';
import _ from 'lodash';
import { colorAppSecondary } from '../../utils/Constantes';
import Card from '../../tools/elements/Card';

export default class ModalDetails extends React.Component {
    constructor(props) {
        super(props);

        this.closeModalToggle = this.closeModalToggle.bind(this);

        this.state = {
            fadeAnimValue: new Animated.Value(0)
        };
    }

    closeModalToggle() {
        Animated.timing(
            this.state.fadeAnimValue,
            {
                toValue: 0,
                duration: 200
            }
        ).start(() => {
            setTimeout(() => this.props.closeModalToggle(), 100);
        });
    }

    renderBody(grupoSelectedToDetails) {
        return (
            <TouchableWithoutFeedback>
                <Card
                    style={{
                        padding: 10
                    }}
                >
                    <View 
                        style={styles.viewFields}
                    >
                        <Text 
                            style={styles.textFieldName}
                        >
                            Data de criação
                        </Text>
                        <Text 
                            style={styles.textFieldValue}
                        >
                            {
                                Moment(
                                    grupoSelectedToDetails.dtcriacao,
                                    typeof grupoSelectedToDetails.dtcriacao === 'number'
                                    ? undefined : 'DD-MM-YYYY'
                                )
                                .format('DD/MM/YYYY')
                            }
                        </Text>
                    </View>
                    {/* <View 
                        style={styles.viewFields}
                    >
                        <Text 
                            style={styles.textFieldName}
                        >
                            Esporte
                        </Text>
                        <Text 
                            style={styles.textFieldValue}
                        >
                            {grupoSelectedToDetails.esporte}
                        </Text>
                    </View> */}
                    <View 
                        style={styles.viewFields}
                    >
                        <Text 
                            style={styles.textFieldName}
                        >
                            Modalidade
                        </Text>
                        <Text 
                            style={styles.textFieldValue}
                        >
                            {grupoSelectedToDetails.tipo}
                        </Text>
                    </View>
                    <View 
                        style={styles.viewFields}
                    >
                        <Text 
                            style={styles.textFieldName}
                        >
                            Total de participantes
                        </Text>
                        <Text 
                            style={styles.textFieldValue}
                        >
                            {_.values(grupoSelectedToDetails.participantes).length}
                        </Text>
                    </View>
                    <View 
                        style={styles.viewFields}
                    >
                        <Text 
                            style={styles.textFieldName}
                        >
                            Periodicidade
                        </Text>
                        <Text 
                            style={styles.textFieldValue}
                        >
                            {grupoSelectedToDetails.periodicidade}
                        </Text>
                    </View>
                    <View 
                        style={styles.viewFields}
                    >
                        <Text 
                            style={styles.textFieldName}
                        >
                            Tipo de cobrança
                        </Text>
                        <Text 
                            style={styles.textFieldValue}
                        >
                            {grupoSelectedToDetails.tipocobranca}
                        </Text>
                    </View>
                    <View 
                        style={styles.viewFields}
                    >
                        <Text 
                            style={styles.textFieldName}
                        >
                            Valor
                        </Text>
                        <TextMask
                            value={grupoSelectedToDetails.valorindividual}
                            type={'money'}
                            style={styles.textFieldValue}
                            options={{
                                unit: 'R$ '
                            }}
                        />
                    </View>
                </Card>
            </TouchableWithoutFeedback>
        );
    }

    render() {
        const { grupoSelectedToDetails } = this.props;

        return (
            <Modal
                animationType={'slide'}
                transparent
                visible={this.props.showModal}
                supportedOrientations={['portrait']}
                onRequestClose={() => this.closeModalToggle()}
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
                    onPress={() => this.closeModalToggle()}
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
                                this.closeModalToggle();
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
                                                    paddingVertical: 10,
                                                    flex: 2
                                                }}
                                            >
                                                <Text 
                                                    style={{ 
                                                        color: 'grey',
                                                        fontWeight: '500',
                                                        fontSize: 16
                                                    }}
                                                >
                                                    {grupoSelectedToDetails.nome || ''}
                                                </Text>
                                            </View>
                                            <View 
                                                style={{
                                                    flex: 0.5,
                                                    paddingVertical: 10,
                                                    alignItems: 'flex-end'
                                                }}
                                            >
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        Keyboard.dismiss();
                                                        this.closeModalToggle();
                                                    }}
                                                >   
                                                    <Icon
                                                        name='close-box-outline' 
                                                        type='material-community' 
                                                        size={28} color='black'
                                                        iconStyle={{ opacity: 0.8, margin: 5 }}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <ScrollView
                                            style={styles.container}
                                        >
                                            {this.renderBody(grupoSelectedToDetails)}
                                            <View style={{ marginVertical: 20 }} />
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
    container: {
        height: '82%',
        backgroundColor: 'white',
        borderColor: '#e1e8ee',
        borderWidth: 1.5,
        padding: 5,
        margin: 5
    },
    card: {
        width: '90%',
        height: '80%',
        borderRadius: 5,
        padding: 0
    },
    viewFields: { 
        flex: 1,
        padding: 5,
        margin: 5,
        alignItems: 'flex-start', 
        justifyContent: 'space-between'
    },
    textFieldName: {
        color: colorAppSecondary, 
        fontWeight: '500',
        textAlign: 'center',
        fontFamily: 'OpenSans-Regular'
    },
    textFieldValue: { 
        fontWeight: '500',
        textAlign: 'center',
        fontFamily: 'OpenSans-Regular'
    }
});
