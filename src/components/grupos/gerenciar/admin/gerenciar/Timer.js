import React from 'react';
import { Text, View } from 'react-native';
import _ from 'lodash';
import { formattedSeconds } from '../../../../../utils/StrComplex';

import ModalInput from '../../../../../tools/modalinput/ModalInput';
import firebase from '../../../../../utils/Firebase';

export default class Timer extends React.Component {
    constructor(props) {
        super(props);

        this.intervalIncrementer = null;
        this.intervalUpdTimeFb = null;
        this.fbDatabaseRef = firebase.database().ref();

        this.state = {
            seconds: 0
        };
    }

    componentDidMount = () => {
        const { jogo, grupoSelected } = this.props;

        if (jogo) {
            const currentTime = parseInt(jogo.currentTime, 10);
    
            this.setState({ seconds: currentTime });
            if (jogo.status === '1') {
                this.intervalIncrementer = setInterval(() =>
                    this.setState({
                        seconds: this.state.seconds + 1
                    })
                , 1000);
                this.intervalUpdTimeFb = setInterval(() => {
                    this.fbDatabaseRef
                    .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
                    .update({
                        currentTime: this.state.seconds.toString()
                    })
                    .then(() => true)
                    .catch(() => true);
                }, 1000 * 60);
            }
        }
    }

    shouldComponentUpdate = (nextProps, nextStates) => {
        if (!nextProps.jogo) {
            return false;
        }

        const { jogo } = this.props;
        const nj = nextProps.jogo;
        const isJogoEqual = _.isEqual(jogo, nj);

        if (!isJogoEqual) {
            setTimeout(() => {
                const { grupoSelected } = this.props;
                
                if (!nj) {
                    return false;
                }

                if (jogo.currentTime !== nj.currentTime) {
                    this.setState({ seconds: parseInt(nj.currentTime, 10) });
                }
                if (jogo.status !== nj.status) {
                    clearInterval(this.intervalIncrementer);
                    clearInterval(this.intervalUpdTimeFb);
                    if (nj.status === '1') {
                        this.intervalIncrementer = setInterval(() =>
                            this.setState({
                                seconds: this.state.seconds + 1
                            })
                        , 1000);
                        this.intervalUpdTimeFb = setInterval(() => {
                            this.fbDatabaseRef
                            .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
                            .update({
                                currentTime: this.state.seconds.toString()
                            })
                            .then(() => true)
                            .catch(() => true);
                        }, 1000 * 60);
                    } 
                }
            }, 500);
        }

        if (nextStates.seconds !== this.state.seconds) {
            this.props.modificaCurrentTime(nextStates.seconds);
        }

        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount = () => {
        const { jogo, grupoSelected } = this.props;

        if (jogo) {
            this.fbDatabaseRef
            .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
            .update({
                status: '0',
                currentTime: this.state.seconds.toString()
            })
            .then(() => true)
            .catch(() => true);
        }

        if (this.intervalIncrementer) {
            clearInterval(this.intervalIncrementer);
        }

        if (this.intervalUpdTimeFb) {
            clearInterval(this.intervalUpdTimeFb);
        }
    }

    onConfirmManualTimer = (value) => {
        const { jogo, grupoSelected } = this.props;
        if (value) {
            const newValue = parseInt(value, 10) * 60;
            this.setState({ seconds: newValue });

            if (jogo) {
                this.fbDatabaseRef
                .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
                .update({
                    currentTime: newValue.toString()
                })
                .then(() => true)
                .catch(() => true);
            }
        }
    }

    getTimer = () => this.state.seconds

    render = () => (
        <View>
            <Text
                style={{ fontSize: 16, fontWeight: '500' }}
            >
                { formattedSeconds(this.state.seconds) }
            </Text>
            <ModalInput
                isDialogVisible={this.props.showTimerModal}
                title={'Tempo de Jogo'}
                message={'Altere em minutos o tempo de jogo desejado.'}
                submitInput={(value) => this.onConfirmManualTimer(value)}
                closeDialog={() => this.props.modificaShowTimerModal(false)}
                hint={this.state.seconds}
                cancelText={'Cancelar'}
                submitText={'Ok'} 
            />
        </View>
    )
}

