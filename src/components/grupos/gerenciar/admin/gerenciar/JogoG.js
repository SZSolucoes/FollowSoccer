import React from 'react';
import { 
    ScrollView,
    StyleSheet,
    Text,
    Image,
    View,
    Platform,
    TouchableOpacity,
    Alert
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { List, CheckBox, Divider, Icon } from 'react-native-elements';
import * as Progress from 'react-native-progress';
import { Dialog } from 'react-native-simple-dialogs';
import PlayersModal from './PlayersModal';
import firebase from '../../../../../utils/Firebase';
import { 
    colorAppForeground, 
    colorAppPrimary, 
    colorAppSecondary, 
    colorAppDark, 
    shirtColors, 
    ERROS
} from '../../../../../utils/Constantes';
import { getPosIndex } from '../../../../../utils/JogosUtils';
import { checkConInfo, showDropdownAlert } from '../../../../../utils/SystemEvents';
import { 
    limitDotText,
    formatJogoSeconds 
} from '../../../../../utils/StrComplex';
import ListItem from '../../../../../tools/elements/ListItem';
import Card from '../../../../../tools/elements/Card';
import { 
    modificaClean, 
    modificaCurrentTime,
    modificaShowTimerModal 
} from '../../jogos/JogoActions';
import { 
    modificaShowPlayersModalJ,
    modificaIsSubstitute,
    modificaMissedPlayers,
    modificaJogador
} from './GerenciarActions';

import imgBola from '../../../../../assets/imgs/bolaanim.png';
import imgYellowCard from '../../../../../assets/imgs/yellowcard.png';
import imgRedCard from '../../../../../assets/imgs/redcard.png';
import imgCartoes from '../../../../../assets/imgs/cards.png';
import imgInOut from '../../../../../assets/imgs/inout.png';

import { sendReminderJogoPushNotifForAll } from '../../../../../utils/FcmPushNotifications';
import { retrieveUpdUserGroup } from '../../../../../utils/UserUtils';
import Timer from './Timer';

class JogoG extends React.Component {
    constructor(props) {
        super(props);

        this.intervalIncrementer = null;
        this.intervalUpdTimeFb = null;

        this.fbDatabaseRef = firebase.database().ref();
        this.fbJogoRef = null;

        this.state = {
            btnStartEnabled: true,
            btnPauseEnabled: false,
            btnResetEnabled: false,
            lockBtnEnabled: '0',
            jogo: {}
        };
    }

    componentDidMount = () => {
        const { itemSelected, grupoSelected } = this.props;
        const listJogos = grupoSelected.jogos ?
        _.map(grupoSelected.jogos, (ita, key) => ({ key, ...ita })) : [];

        const jogo = _.find(listJogos, (item) => item.key === itemSelected);

        if (jogo) {
            const currentTime = parseInt(jogo.currentTime, 10);
            const lockedEnabled = !jogo.lockLevel ? '0' : jogo.lockLevel;
    
            this.setState({ lockBtnEnabled: lockedEnabled });
            if (jogo.status === '0') {
                this.setState({
                    btnStartEnabled: true,
                    btnPauseEnabled: false,
                    btnResetEnabled: currentTime > 0
                });
            } else if (jogo.status === '1') {
                this.setState({
                    btnStartEnabled: false,
                    btnPauseEnabled: true,
                    btnResetEnabled: false
                });
            } else if (jogo.status === '2') {
                this.setState({
                    btnStartEnabled: true,
                    btnPauseEnabled: false,
                    btnResetEnabled: false
                });
            }
        }

        // LISTENER PARA ATUALIZACAO DO JOGO
        this.fbJogoRef = this.fbDatabaseRef
        .child(`grupos/${grupoSelected.key}/jogos/${itemSelected}`);

        this.fbJogoRef.on('value', snap => {
            if (snap) {
                const snapVal = snap.val();

                if (snapVal) {
                    this.setState({ jogo: { key: snap.key, ...snapVal } });

                    return;
                }
            }

            this.setState({ jogo: {} });
        });

        this.props.modificaMissedPlayers([]);
        this.props.onItemRender();
    }

    shouldComponentUpdate = (nextProps, nextStates) => {
        if (!nextStates.jogo) {
            return false;
        }

        const { jogo } = this.state;
        const nj = nextStates.jogo;
        const isJogoEqual = _.isEqual(jogo, nj);

        if (!isJogoEqual) {
            setTimeout(() => { 
                if (!nj) {
                    return false;
                }

                if (jogo.status !== nj.status) {
                    if (nj.status === '0') {
                        this.setState({
                            btnStartEnabled: true,
                            btnPauseEnabled: false,
                            btnResetEnabled: nj.currentTime > 0
                        });
                    } else if (nj.status === '1') {
                        this.setState({
                            btnStartEnabled: false,
                            btnPauseEnabled: true,
                            btnResetEnabled: false
                        });
                    } else if (nj.status === '2') {
                        this.setState({
                            btnStartEnabled: true,
                            btnPauseEnabled: false,
                            btnResetEnabled: false
                        }); 
                    }
                }
            }, 500);
        }

        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount = () => {
        this.props.modificaClean();
        this.props.modificaMissedPlayers([]);

        if (this.fbJogoRef) this.fbJogoRef.off();
    }

    onPressSubs = (jogador) => {
        const newJogador = {
            key: jogador.key,
            nome: retrieveUpdUserGroup(
                jogador.key, 'nome', jogador
            ),
            posicao: retrieveUpdUserGroup(
                jogador.key, 'posicao', jogador
            ),
            posvalue: jogador.posvalue,
            imgAvatar: retrieveUpdUserGroup(
                jogador.key, 'imgAvatar', jogador
            ),
            side: jogador.side,
            vitorias: jogador.vitorias,
            derrotas: jogador.derrotas,
            empates: jogador.empates,
            jogosEscalados: jogador.jogosEscalados
        };

        this.props.modificaJogador(newJogador);
        this.props.modificaIsSubstitute(true);
        this.props.modificaShowPlayersModalJ(true);
        return;
    }

    onStartTimer = (enabled, jogo) => {
        if (enabled) {
            const { grupoSelected } = this.props;

            this.fbDatabaseRef
            .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
            .update({
                status: '1',
                currentTime: this.timerRef.getTimer().toString()
            })
            .then(() => {
                this.setState({
                    btnStartEnabled: false,
                    btnPauseEnabled: true,
                    btnResetEnabled: false
                });  
            })
            .catch(() => 
                showDropdownAlert(
                    'error',
                    ERROS.jogoGIniciarPartida.erro,
                    ERROS.jogoGIniciarPartida.mes
                )
            );
        } 
    }

    onPauseTimer = (enabled, jogo) => { 
        if (enabled) {
            const { grupoSelected } = this.props;

            this.fbDatabaseRef
            .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
            .update({
                status: '0',
                currentTime: this.timerRef.getTimer().toString()
            })
            .then(() => {
                this.setState({
                    btnStartEnabled: true,
                    btnPauseEnabled: false,
                    btnResetEnabled: true
                });
            })
            .catch(() => 
                showDropdownAlert(
                    'error',
                    ERROS.jogoGPausarPartida.erro,
                    ERROS.jogoGPausarPartida.mes
                )
            );
        }  
    }

    onResetTimer = (enabled, jogo) => { 
        if (enabled) {
            const { grupoSelected } = this.props;

            Alert.alert(
                'Aviso',
                'Confirma o reinício do jogo ?',
                [
                    { text: 'Cancelar', 
                        onPress: () => true, 
                        style: 'cancel' 
                    },
                    { 
                        text: 'Ok', 
                        onPress: () => checkConInfo(() => {
                            this.fbDatabaseRef
                            .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
                            .update({
                                status: '2',
                                currentTime: '0'
                            })
                            .then(() => {
                                this.setState({
                                    btnStartEnabled: true,
                                    btnPauseEnabled: false,
                                    btnResetEnabled: false
                                }); 
                            })
                            .catch(() => 
                                showDropdownAlert(
                                    'error',
                                    ERROS.jogoGReiniciarPartida.erro,
                                    ERROS.jogoGReiniciarPartida.mes
                                )
                            );
                        })
                    }
                ]
            ); 
        } 
    }

    onPressPlayerGol = (jogador, jogo) => {
        const { grupoSelected } = this.props;
        const jogadorNome = retrieveUpdUserGroup(
            jogador.key, 'nome', jogador
        );
        const gols = [
            ...jogo.gols, 
            {
                key: jogador.key, 
                side: jogador.side,
                nome: jogadorNome,
                time: this.timerRef.getTimer().toString(),
                indexKey: jogo.gols.length.toString()
            }
        ];
        const placarCasa = parseInt(jogo.placarCasa, 10) + 1;
        const placarVisit = parseInt(jogo.placarVisit, 10) + 1;

        Alert.alert(
            'Aviso',
            `Confirma o gol para o jogador:\n${jogadorNome} ?`,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => checkConInfo(() => {
                        let payload = {};
                        if (jogador.side === 'casa') {
                            payload = { gols, placarCasa };
                        } else {
                            payload = { gols, placarVisit };
                        }
                        this.fbDatabaseRef
                        .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
                        .update({
                            ...payload
                        })
                        .then(() => {
                            showDropdownAlert(
                                'info',
                                'Gol marcado.',
                                ''
                            );
                            this.fbDatabaseRef
                            .child(`usuarios/${jogador.key}/gols`).once('value', (snapshot) => {
                                const golsPlus = parseInt(snapshot.val(), 10) + 1;
                                this.fbDatabaseRef
                                .child(`usuarios/${jogador.key}`).update({
                                    gols: golsPlus.toString(),
                                })
                                .then(() => true)
                                .catch(() => true);
                            });
                        })
                        .catch(() => 
                            showDropdownAlert(
                                'error',
                                ERROS.jogoGMarcarGol.erro,
                                ERROS.jogoGMarcarGol.mes
                            )
                        );
                    })
                }
            ]
        );
    }

    onAddPressRemoveGol = (jogador, jogo) => 
    () => checkConInfo(() => this.onPressRemoveGol(jogador, jogo))

    onPressRemoveGol = (jogador, jogo) => {
        const { grupoSelected } = this.props;
        const gols = [
            ...jogo.gols
        ];
        const jogadorNome = retrieveUpdUserGroup(
            jogador.key, 'nome', jogador
        );
        let i = 0;
        
        gols.splice(parseInt(jogador.indexKey, 10), 1);

        for (i = 0; i < gols.length; i++) {
            if (!gols[i].push) {
                gols[i].indexKey = i.toString();
            }
        }

        const placarCasa = parseInt(jogo.placarCasa, 10) - 1;
        const placarVisit = parseInt(jogo.placarVisit, 10) - 1;

        Alert.alert(
            'Aviso',
            `Confirma a remoção do gol para o jogador:\n${jogadorNome} ?`,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => checkConInfo(() => {
                        let payload = {};
                        if (jogador.side === 'casa') {
                            payload = { gols, placarCasa };
                        } else {
                            payload = { gols, placarVisit };
                        }
                        this.fbDatabaseRef
                        .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
                        .update({
                            ...payload
                        })
                        .then(() => {
                            showDropdownAlert(
                                'info',
                                'Gol removido.',
                                ''
                            );
                            this.fbDatabaseRef
                            .child(`usuarios/${jogador.key}/gols`).once('value', (snapshot) => {
                                const golsLess = parseInt(snapshot.val(), 10) - 1;
                                this.fbDatabaseRef
                                .child(`usuarios/${jogador.key}`).update({
                                    gols: golsLess.toString()
                                })
                                .then(() => true)
                                .catch(() => true);
                            });
                        })
                        .catch(() => 
                            showDropdownAlert(
                                'error',
                                ERROS.jogoGRemoverGol.erro,
                                ERROS.jogoGRemoverGol.mes
                            )
                        );
                    })
                }
            ]
        );
    }

    onPressCard = (jogador, jogo, color) => {
        const { grupoSelected } = this.props;
        const jogadorNome = retrieveUpdUserGroup(
            jogador.key, 'nome', jogador
        );
        const cartoes = [
            ...jogo.cartoes, 
            { 
                key: jogador.key, 
                side: jogador.side,
                nome: jogadorNome,
                time: this.timerRef.getTimer().toString(),
                color,
                indexKey: jogo.cartoes.length.toString()
            }
        ];

        Alert.alert(
            'Aviso',
            `Confirma o cartão ${color} para o jogador:\n${jogadorNome} ?`,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => checkConInfo(() => {
                        this.fbDatabaseRef
                        .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
                        .update({
                            cartoes
                        })
                        .then(() => {
                            const keyCard = color === 'amarelo' ? 
                            'cartoesAmarelos' : 'cartoesVermelhos';
                            showDropdownAlert(
                                'info',
                                `Cartão ${color} aplicado.`,
                                ''
                            );
                            this.fbDatabaseRef
                            .child(`usuarios/${jogador.key}/${keyCard}`)
                            .once('value', (snapshot) => {
                                const cartaoPlus = parseInt(snapshot.val(), 10) + 1;
                                const keyCardJson = color === 'amarelo' ? 
                                { cartoesAmarelos: cartaoPlus.toString() } 
                                :
                                { cartoesVermelhos: cartaoPlus.toString() };
                                this.fbDatabaseRef
                                .child(`usuarios/${jogador.key}`).update({
                                    ...keyCardJson
                                })
                                .then(() => true)
                                .catch(() => true);
                            });
                        })
                        .catch(() =>
                            showDropdownAlert(
                                'error',
                                ERROS.jogoGAplicarCartao.erro,
                                ERROS.jogoGAplicarCartao.mes
                            )
                        );
                    })
                }
            ]
        );
    }

    onAddPressRemoveCard = (jogador, jogo) => 
    () => checkConInfo(() => this.onPressRemoveCard(jogador, jogo))

    onPressRemoveCard = (jogador, jogo) => {
        const { grupoSelected } = this.props;
        const cartoes = [
            ...jogo.cartoes
        ];
        const jogadorNome = retrieveUpdUserGroup(
            jogador.key, 'nome', jogador
        );
        let i = 0;
        
        cartoes.splice(parseInt(jogador.indexKey, 10), 1);

        for (i = 0; i < cartoes.length; i++) {
            if (!cartoes[i].push) {
                cartoes[i].indexKey = i.toString();
            }
        }

        Alert.alert(
            'Aviso',
            `Confirma a remoção do cartão ${jogador.color} para o jogador:\n${jogadorNome} ?`,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => checkConInfo(() => {
                        this.fbDatabaseRef
                        .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
                        .update({
                            cartoes
                        })
                        .then(() => {
                            const keyCard = jogador.color === 'amarelo' ? 
                            'cartoesAmarelos' : 'cartoesVermelhos';
                            showDropdownAlert(
                                'info',
                                `Cartão ${jogador.color} removido.`,
                                ''
                            );
                            this.fbDatabaseRef
                            .child(`usuarios/${jogador.key}/${keyCard}`)
                            .once('value', (snapshot) => {
                                const cartaoLess = parseInt(snapshot.val(), 10) - 1;
                                const keyCardJson = jogador.color === 'amarelo' ? 
                                ({ cartoesAmarelos: cartaoLess.toString() }) 
                                :
                                ({ cartoesVermelhos: cartaoLess.toString() });
                                this.fbDatabaseRef
                                .child(`usuarios/${jogador.key}`).update({
                                    ...keyCardJson
                                })
                                .then(() => true)
                                .catch(() => true);
                            });
                        })
                        .catch(() =>
                            showDropdownAlert(
                                'error',
                                ERROS.jogoGRemoverCartao.erro,
                                ERROS.jogoGRemoverCartao.mes
                            )
                        );
                    })
                }
            ]
        );
    }

    onAddPressRemoveSubs = (sub, jogo) => 
    () => checkConInfo(() => this.onPressRemoveSubs(sub, jogo))

    onPressRemoveSubs = (sub, jogo) => {
        const { grupoSelected } = this.props;
        const subs = [
            ...jogo.subs
        ];
        let i = 0;
        
        subs.splice(parseInt(sub.indexKey, 10), 1);

        for (i = 0; i < subs.length; i++) {
            if (!subs[i].push) {
                subs[i].indexKey = i.toString();
            }
        }

        Alert.alert(
            'Aviso',
            'Confirma a remoção da substituição ?',
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => checkConInfo(() => {
                        this.fbDatabaseRef
                        .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
                        .update({
                            subs
                        })
                        .then(() =>
                            this.doInOrOut(sub.jogadorIn, false, jogo, sub.jogadorOut, true)
                        )
                        .catch(() =>
                            showDropdownAlert(
                                'error',
                                ERROS.jogoGRemoverSubst.erro,
                                ERROS.jogoGRemoverSubst.mes
                            )
                        );
                    })
                }
            ]
        );
    }

    onPressLock = (jogo, lockedEnabled) => {
        const { grupoSelected } = this.props;
        const dbJogoRef = this.fbDatabaseRef
        .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`);

        const lockLevel = lockedEnabled ? '1' : '0';
        const oldLockLevel = this.state.lockBtnEnabled;
        const textConfirm = lockedEnabled ?
        'Deseja realmente desabilitar a confirmação de presença dos jogadores ?'
        :
        'Deseja realmente habilitar a confirmação de presença dos jogadores ?';

        const funExec = () => {
            this.setState({ lockBtnEnabled: lockLevel });
    
            dbJogoRef.update({
                lockLevel
            })
            .then(() => true)
            .catch(() => this.setState({ lockBtnEnabled: oldLockLevel }));
        };
        
        Alert.alert(
            'Aviso',
            textConfirm,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => checkConInfo(() => {
                        funExec();
                    })
                }
            ]
        );
    }

    onSendNotif = (jogo) => {
        const funExec = () => {
            sendReminderJogoPushNotifForAll(jogo.titulo);
            showDropdownAlert(
                'info',
                'Notificação enviada.',
                ''
            );
        };
        
        Alert.alert(
            'Aviso',
            'Deseja enviar um lembrete da confirmação de presença ?',
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Enviar', 
                    onPress: () => checkConInfo(() => {
                        funExec();
                    })
                }
            ]
        );
    }

    doInOrOut = (jogador, inOrOut, jogo, newJogador = false, isRemove = false) => {
        const { grupoSelected } = this.props;
        if (newJogador) {
            const { side } = jogador;
            let fSubs = [];
            let inc = 0;

            if (isRemove) {
                fSubs = jogo.subs;
            } else {
                fSubs = _.filter(
                    jogo.subs, 
                    (sub) => 
                        sub.push || (!sub.push &&
                        !((sub.jogadorIn.key === jogador.key && 
                        sub.jogadorOut.key === newJogador.key) ||
                        (sub.jogadorIn.key === newJogador.key && 
                        sub.jogadorOut.key === jogador.key)))
                );

                fSubs = _.filter(fSubs, (sub) => {
                    if (sub.push) {
                        return true;
                    }
                    const players = [];

                    if (sub.jogadorIn.key === newJogador.key || 
                        sub.jogadorOut.key === newJogador.key) {
                        players.push(1);
                    }

                    for (inc = 0; inc < jogo.escalacao.casa.length; inc++) {
                        const player = jogo.escalacao.casa[inc];
                        if (sub.jogadorIn.key === player.key || sub.jogadorOut.key === player.key) {
                            players.push(1);
                        }
                    }
                    for (inc = 0; inc < jogo.escalacao.visit.length; inc++) {
                        const player = jogo.escalacao.visit[inc];
                        if (sub.jogadorIn.key === player.key || sub.jogadorOut.key === player.key) {
                            players.push(1);
                        }
                    }

                    return !(players.length >= 2);
                });
            }

            for (inc = 0; inc < fSubs.length; inc++) {
                if (!fSubs[inc].push) {
                    fSubs[inc].indexKey = inc.toString();
                }
            }

            const subs = [
                ...fSubs, 
                { 
                    jogadorIn: newJogador,
                    jogadorOut: jogador, 
                    side: jogador.side,
                    time: this.timerRef.getTimer().toString(),
                    indexKey: fSubs.length.toString()
                }
            ];

            if (side === 'casa') {
                const newCasaList = _.filter(
                    jogo.escalacao.casa, (item) => (item.key !== jogador.key) || !!item.push
                );
                const newBancoList = _.filter(
                    jogo.escalacao.banco, (item) => (item.key !== newJogador.key) || !!item.push
                );
                newCasaList.push(newJogador);
                newBancoList.push(jogador);

                this.fbDatabaseRef
                .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}/escalacao`)
                .update({
                    casa: newCasaList,
                    banco: newBancoList
                })
                .then(() => {
                    if (isRemove) {
                        showDropdownAlert(
                            'info',
                            'Substituição removida.',
                            ''
                        );
                        return true;
                    }
                    this.fbDatabaseRef
                    .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
                    .update({
                        subs
                    })
                    .then(() =>
                        showDropdownAlert(
                            'info',
                            'Substituição efetuada.',
                            ''
                        )
                    )
                    .catch(() =>
                        showDropdownAlert(
                            'error',
                            ERROS.jogoGSubstJogador.erro,
                            ERROS.jogoGSubstJogador.mes
                        )
                    );
                })
                .catch(() => {
                    if (isRemove) {
                        showDropdownAlert(
                            'error',
                            ERROS.jogoGRemoverSubst.erro,
                            ERROS.jogoGRemoverSubst.mes
                        );
                    } else {
                        showDropdownAlert(
                            'error',
                            ERROS.jogoGSubstJogador.erro,
                            ERROS.jogoGSubstJogador.mes
                        );
                    }
                });
            } else if (side === 'visit') {
                const newVisitList = _.filter(
                    jogo.escalacao.visit, (item) => (item.key !== jogador.key) || !!item.push
                );
                const newBancoList = _.filter(
                    jogo.escalacao.banco, (item) => (item.key !== newJogador.key) || !!item.push
                );
                newVisitList.push(newJogador);
                newBancoList.push(jogador);
                this.fbDatabaseRef
                .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}/escalacao`)
                .update({
                    visit: newVisitList,
                    banco: newBancoList
                })
                .then(() => {
                    if (isRemove) {
                        showDropdownAlert(
                            'info',
                            'Substituição removida.',
                            ''
                        );
                        return true;
                    }
                    this.fbDatabaseRef
                    .child(`grupos/${grupoSelected.key}/jogos/${jogo.key}`)
                    .update({
                        subs
                    })
                    .then(() =>
                        showDropdownAlert(
                            'info',
                            'Substituição efetuada.',
                            ''
                        )
                    )
                    .catch(() =>
                        showDropdownAlert(
                            'error',
                            ERROS.jogoGSubstJogador.erro,
                            ERROS.jogoGSubstJogador.mes
                        )
                    );
                })
                .catch(() => {
                    if (isRemove) {
                        showDropdownAlert(
                            'error',
                            ERROS.jogoGRemoverSubst.erro,
                            ERROS.jogoGRemoverSubst.mes
                        );
                    } else {
                        showDropdownAlert(
                            'error',
                            ERROS.jogoGSubstJogador.erro,
                            ERROS.jogoGSubstJogador.mes
                        );
                    }
                });
            }
        } 
    }

    textJogoProgress = (jogo) => {
        switch (jogo.status) {
            case '0':
                return 'Em espera';
            case '1':
                return 'Ao vivo';
            case '2':
                return 'Em espera';
            case '3':
                return 'Encerrado';
            default:
                return 'Encerrado';
        }
    }

    textPlacar = (jogo) => `${jogo.placarCasa} - ${jogo.placarVisit}`

    renderCardPlacar = (jogo) => {
        const { 
            btnStartEnabled,
            btnPauseEnabled,
            btnResetEnabled
        } = this.state;
        return (
            <Card
                containerStyle={styles.card}
            >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={styles.topViewPlacar} />
                    <View style={{ position: 'absolute', alignSelf: 'center' }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            { limitDotText(jogo.titulo, 25) }
                        </Text>
                    </View>
                </View>
                <View style={{ marginTop: 20 }} />
                <View style={styles.viewPlacar}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1.1 }}>
                        <Image 
                            style={{ height: 80, width: 70 }}
                            resizeMode={'stretch'}
                            source={shirtColors[jogo.homeshirt] || shirtColors.white} 
                        />
                        <Text
                            style={{
                                fontWeight: '500',
                                fontSize: 14,
                                textAlign: 'center'
                            }}
                        >
                            { jogo.timeCasa ? jogo.timeCasa.trim() : 'Casa' }
                        </Text>
                    </View>
                    <View 
                        style={{
                            paddingHorizontal: 5,
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderRadius: 3,
                            flex: 0.8
                        }}
                    >
                            <View
                                style={{ 
                                    alignItems: 'center',
                                    justifyContent: 'center' 
                                }}
                            >
                                <View style={{ marginBottom: 10 }}>
                                    <Text
                                        style={{ 
                                            fontSize: 14,
                                            textAlign: 'center', 
                                            fontWeight: 'bold', 
                                            color: 'red' 
                                        }}
                                    >
                                        { this.textJogoProgress(jogo) }
                                    </Text>
                                </View>
                                <View>
                                    <Text
                                        style={{ 
                                            fontSize: 26, 
                                            fontWeight: 'bold', 
                                            color: 'black' 
                                        }}
                                    >
                                        { this.textPlacar(jogo) }
                                    </Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Timer
                                        ref={ref => (this.timerRef = ref)}
                                        jogo={jogo}
                                        showTimerModal={this.props.showTimerModal}
                                        grupoSelected={this.props.grupoSelected}
                                        btnStartEnabled={this.state.btnStartEnabled}
                                        btnPauseEnabled={this.state.btnPauseEnabled}
                                        btnResetEnabled={this.state.btnResetEnabled}
                                        modificaShowTimerModal={this.props.modificaShowTimerModal}
                                        modificaCurrentTime={this.props.modificaCurrentTime}
                                    />
                                </View>
                            </View>
                    </View>
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1.1 }}>
                        <Image 
                            style={{ height: 80, width: 70 }}
                            resizeMode={'stretch'}
                            source={shirtColors[jogo.visitshirt] || shirtColors.blue}
                        />
                        <Text
                            style={{
                                fontWeight: '500',
                                fontSize: 14,
                                textAlign: 'center'
                            }}
                            
                        >
                            { jogo.timeVisit ? jogo.timeVisit.trim() : 'Visitantes' }
                        </Text>
                    </View>
                </View>
                <View 
                    style={{ 
                        flex: 1,
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginTop: 15 
                    }}
                >
                    <View style={[styles.centerFlex, { opacity: btnStartEnabled ? 1 : 0.5 }]}>
                        <TouchableOpacity
                            onPress={() => checkConInfo(
                                () => this.onStartTimer(btnStartEnabled, jogo)
                            )}
                        >
                            <View 
                                style={[
                                    styles.circleBtn, 
                                    styles.centerAlign, 
                                    { backgroundColor: colorAppSecondary }
                                ]}
                            >
                                <View
                                    style={[
                                        styles.circleBtnTwo, 
                                        styles.centerAlign
                                    ]}
                                >
                                    <Text style={styles.textCircle}>
                                        { 
                                            parseInt(jogo.currentTime, 10) > 0 ? 
                                            'Retomar' : 'Iniciar'
                                        }
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.centerFlex, { opacity: btnPauseEnabled ? 1 : 0.5 }]}>
                        <TouchableOpacity
                            onPress={() => checkConInfo(
                                () => this.onPauseTimer(btnPauseEnabled, jogo)
                            )}
                        >
                            <View 
                                style={[
                                    styles.circleBtn, 
                                    styles.centerAlign, 
                                    { backgroundColor: colorAppDark }
                                ]}
                            >
                                <View
                                    style={[
                                        styles.circleBtnTwo, 
                                        styles.centerAlign
                                    ]}
                                >
                                    <Text style={styles.textCircle}>
                                        Pausar
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.centerFlex, { opacity: btnResetEnabled ? 1 : 0.5 }]}>
                        <TouchableOpacity
                            onPress={() => checkConInfo(
                                () => this.onResetTimer(btnResetEnabled, jogo)
                            )}
                        >
                            <View 
                                style={[
                                    styles.circleBtn, 
                                    styles.centerAlign, 
                                    { backgroundColor: colorAppPrimary }
                                ]}
                            >
                                <View
                                    style={[
                                        styles.circleBtnTwo, 
                                        styles.centerAlign
                                    ]}
                                >
                                    <Text style={styles.textCircle}>
                                        Reiniciar
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                {this.renderCardFooter(jogo)}
                <View style={{ marginBottom: 20 }} />
            </Card>
        );
    }

    renderGoals = (jogo) => (
        <View>
            <View style={{ padding: 5 }}>
                <View style={{ margin: 5 }}>
                    <Text
                        style={{ 
                            color: 'black', 
                            fontWeight: 'bold',
                            fontSize: 16 
                        }}
                    >
                        Gols
                    </Text>
                </View>
                <View style={styles.cardEffect}>
                    <List 
                        containerStyle={{
                            marginTop: 0,
                            paddingHorizontal: 5,
                            paddingVertical: 10,
                            borderTopWidth: 0,
                            borderBottomWidth: 0
                        }}
                    >
                        { this.renderGolJogador(jogo.gols, jogo) }
                    </List>
                </View>
            </View>
        </View>
    )

    renderGolJogador = (gols, jogo) => {
        const golsCasa = _.filter(gols, (item) => item.side && item.side === 'casa').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const golsVisit = _.filter(gols, (item) => item.side && item.side === 'visit').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const numGolsCasa = golsCasa.length;
        const numGolsVisit = golsVisit.length;
        const viewsGols = [];

        if (numGolsCasa === 0 && numGolsVisit === 0) {
            return (
                <View 
                    style={{ alignContent: 'center', marginLeft: 3 }} 
                >
                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                </View>
            );
        }

        if (numGolsCasa > numGolsVisit) {
            let i = 0;
            for (i = 0; i < numGolsCasa; i++) {
                if ((i + 1) > numGolsVisit || numGolsVisit === 0) {
                    let timeText = formatJogoSeconds(golsCasa[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={this.onAddPressRemoveGol(golsCasa[i], jogo)}
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeText }
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextCasa = formatJogoSeconds(golsCasa[i].time);
                    let timeTextVisit = formatJogoSeconds(golsVisit[i].time);
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={this.onAddPressRemoveGol(golsCasa[i], jogo)}
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
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
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveGol(golsVisit[i], jogo)
                                        }
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            let i = 0;
            for (i = 0; i < numGolsVisit; i++) {
                if ((i + 1) > numGolsCasa || numGolsCasa === 0) {
                    let timeText = formatJogoSeconds(golsVisit[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
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
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeText }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveGol(golsVisit[i], jogo)
                                        }
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextVisit = formatJogoSeconds(golsVisit[i].time);
                    let timeTextCasa = formatJogoSeconds(golsCasa[i].time);
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsVisit[i].key, 'nome', golsVisit[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            golsCasa[i].key, 'nome', golsCasa[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveGol(golsCasa[i], jogo)
                                        }
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
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
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveGol(golsVisit[i], jogo)
                                        }
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewsGols;
    }

    renderCartoes = (jogo) => (
        <View>
            <View style={{ padding: 5 }}>
                <View style={{ margin: 5 }}>
                    <Text
                        style={{ 
                            color: 'black', 
                            fontWeight: 'bold',
                            fontSize: 16 
                        }}
                    >
                        Cartões
                    </Text>
                </View>
                <View style={styles.cardEffect}>
                    <List 
                        containerStyle={{ 
                            marginTop: 0,
                            paddingHorizontal: 5,
                            paddingVertical: 10,
                            borderTopWidth: 0,
                            borderBottomWidth: 0
                        }}
                    >
                        { this.renderCartaoJogador(jogo.cartoes, jogo) }
                    </List>
                </View>
            </View>
        </View>
    )

    renderCartaoJogador = (cartoes, jogo) => {
        const cartoesCasa = _.filter(cartoes, (item) => item.side && item.side === 'casa').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const cartoesVisit = _.filter(cartoes, (item) => item.side && item.side === 'visit').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const numCartoesCasa = cartoesCasa.length;
        const numCartoesVisit = cartoesVisit.length;
        const viewCartoes = [];

        if (numCartoesCasa === 0 && numCartoesVisit === 0) {
            return (
                <View 
                    style={{ alignContent: 'center' }} 
                >
                    <Image source={imgCartoes} style={{ width: 30, height: 30 }} />
                </View>
            );
        }

        if (numCartoesCasa > numCartoesVisit) {
            let i = 0;
            for (i = 0; i < numCartoesCasa; i++) {
                if ((i + 1) > numCartoesVisit || numCartoesVisit === 0) {
                    let timeText = formatJogoSeconds(cartoesCasa[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesCasa[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeText }
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextCasa = formatJogoSeconds(cartoesCasa[i].time);
                    let timeTextVisit = formatJogoSeconds(cartoesVisit[i].time);
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesCasa[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
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
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesVisit[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            let i = 0;
            for (i = 0; i < numCartoesVisit; i++) {
                if ((i + 1) > numCartoesCasa || numCartoesCasa === 0) {
                    let timeText = formatJogoSeconds(cartoesVisit[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
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
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeText }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesVisit[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextVisit = formatJogoSeconds(cartoesVisit[i].time);
                    let timeTextCasa = formatJogoSeconds(cartoesCasa[i].time);
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesVisit[i].key, 'nome', cartoesVisit[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        )
                                    }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    {
                                        retrieveUpdUserGroup(
                                            cartoesCasa[i].key, 'nome', cartoesCasa[i]
                                        )
                                    }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesCasa[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
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
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesVisit[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewCartoes;
    }

    renderSubs = (jogo) => (
        <View>
            <View style={{ padding: 5 }}>
                <View style={{ margin: 5 }}>
                    <Text
                        style={{ 
                            color: 'black', 
                            fontWeight: 'bold',
                            fontSize: 16 
                        }}
                    >
                        Substituições
                    </Text>
                </View>
                <View style={styles.cardEffect}>
                    <List 
                        containerStyle={{ 
                            marginTop: 0,
                            paddingHorizontal: 5,
                            paddingVertical: 10,
                            borderTopWidth: 0,
                            borderBottomWidth: 0
                        }}
                    >
                        { this.renderSubsJogador(jogo.subs, jogo) }
                    </List>
                </View>
            </View>
        </View>
    )

    renderSubsJogador = (subs, jogo) => {
        const subsCasa = _.filter(subs, (item) => item.side && item.side === 'casa').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const subsVisit = _.filter(subs, (item) => item.side && item.side === 'visit').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const numSubsCasa = subsCasa.length;
        const numSubsVisit = subsVisit.length;
        const viewSubs = [];

        if (numSubsCasa === 0 && numSubsVisit === 0) {
            return (
                <View 
                    style={{ alignContent: 'center' }} 
                >
                    <Image source={imgInOut} style={{ width: 30, height: 30 }} />
                </View>
            );
        }

        if (numSubsCasa > numSubsVisit) {
            let i = 0;
            for (i = 0; i < numSubsCasa; i++) {
                if ((i + 1) > numSubsVisit || numSubsVisit === 0) {
                    let timeText = formatJogoSeconds(subsCasa[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text>
                                <Text>
                                    { timeText[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeText }
                                        <View>
                                            <Text style={styles.textOut}>
                                                {
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorOut.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorOut
                                                    )
                                                }
                                            </Text>
                                            <Text style={styles.textIn}>
                                                {
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorIn
                                                    )
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextCasa = formatJogoSeconds(subsCasa[i].time);
                    let timeTextVisit = formatJogoSeconds(subsVisit[i].time);
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start'
                                        }}
                                    >
                                        { timeTextCasa }
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.textOut}>
                                                {
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorOut.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorOut
                                                    )
                                                }
                                            </Text>
                                            <Text style={styles.textIn}>
                                                {
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorIn
                                                    )
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                </View>
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
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Text style={{ textAlign: 'right' }}>
                                                { timeTextVisit }
                                                <Text style={styles.textOut}>
                                                    {
                                                        retrieveUpdUserGroup(
                                                            subsVisit[i].jogadorOut.key, 
                                                            'nome', 
                                                            subsVisit[i].jogadorOut
                                                        )
                                                    }
                                                </Text>
                                            </Text>
                                            <Text style={styles.textIn}>
                                                {
                                                    retrieveUpdUserGroup(
                                                        subsVisit[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsVisit[i].jogadorIn
                                                    )
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            let i = 0;
            for (i = 0; i < numSubsVisit; i++) {
                if ((i + 1) > numSubsCasa || numSubsCasa === 0) {
                    let timeText = formatJogoSeconds(subsVisit[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text>
                                <Text>
                                    { timeText[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
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
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Text style={{ textAlign: 'right' }}>
                                                { timeText }
                                                <Text style={styles.textOut}>
                                                    {
                                                        retrieveUpdUserGroup(
                                                            subsVisit[i].jogadorOut.key, 
                                                            'nome', 
                                                            subsVisit[i].jogadorOut
                                                        )
                                                    }
                                                </Text>
                                            </Text>
                                            <Text style={styles.textIn}>
                                                {
                                                    retrieveUpdUserGroup(
                                                        subsVisit[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsVisit[i].jogadorIn
                                                    )
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextVisit = formatJogoSeconds(subsVisit[i].time);
                    let timeTextCasa = formatJogoSeconds(subsCasa[i].time);
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start'
                                        }}
                                    >
                                        { timeTextCasa }
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.textOut}>
                                                {
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorOut.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorOut
                                                    )
                                                }
                                            </Text>
                                            <Text style={styles.textIn}>
                                                {
                                                    retrieveUpdUserGroup(
                                                        subsCasa[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsCasa[i].jogadorIn
                                                    )
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                </View>
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
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Text style={{ textAlign: 'right' }}>
                                                { timeTextVisit }
                                                <Text style={styles.textOut}>
                                                    {
                                                        retrieveUpdUserGroup(
                                                            subsVisit[i].jogadorOut.key, 
                                                            'nome', 
                                                            subsVisit[i].jogadorOut
                                                        )
                                                    }
                                                </Text>
                                            </Text>
                                            <Text style={styles.textIn}>
                                                {
                                                    retrieveUpdUserGroup(
                                                        subsVisit[i].jogadorIn.key, 
                                                        'nome', 
                                                        subsVisit[i].jogadorIn
                                                    )
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewSubs;
    }

    renderEscalados = (jogo) => {
        let jogadoresCasaFt = _.filter(jogo.escalacao.casa, (jgCasa) => !jgCasa.push).sort(
            (a, b) => {
                if (getPosIndex(a.posvalue) > getPosIndex(b.posvalue)) {
                    return 1;
                } 
                if (getPosIndex(a.posvalue) < getPosIndex(b.posvalue)) {
                    return -1;
                } 
               
                return 0;  
            }
        );

        jogadoresCasaFt = _.orderBy(jogadoresCasaFt, ['nome'], ['asc']);
        
        let jogadoresVisitFt = _.filter(jogo.escalacao.visit, (jgVisit) => !jgVisit.push).sort(
            (a, b) => {
                if (getPosIndex(a.posvalue) > getPosIndex(b.posvalue)) {
                    return 1;
                } 
                if (getPosIndex(a.posvalue) < getPosIndex(b.posvalue)) {
                    return -1;
                } 
               
                return 0;  
            }
        );

        jogadoresVisitFt = _.orderBy(jogadoresVisitFt, ['nome'], ['asc']);

        const numJogadoresCasa = jogadoresCasaFt.length;
        const numjogadoresVisit = jogadoresVisitFt.length;

        if (numJogadoresCasa === 0 && numjogadoresVisit === 0) {
            return false;
        }

        return (
            <View style={{ padding: 5 }}>
                <View style={{ margin: 5 }}>
                    <Text
                        style={{ 
                            color: 'black', 
                            fontWeight: 'bold',
                            fontSize: 16 
                        }}
                    >
                        Jogadores
                    </Text>
                </View>
                <View style={[styles.cardEffect, { paddingVertical: 5, paddingHorizontal: 1 }]}>
                    <List 
                        containerStyle={{ 
                            marginTop: 0, 
                            borderTopWidth: 0, 
                            borderBottomWidth: 0 
                        }}
                    >
                        {
                            jogadoresCasaFt.map((item, index) => {
                                const updatedImg = retrieveUpdUserGroup(
                                    item.key, 'imgAvatar', item
                                );
                                const imgAvt = updatedImg ? 
                                { uri: updatedImg } : { uri: '' };
                                return (
                                    <ListItem
                                        containerStyle={
                                            (index + 1) === numJogadoresCasa && 
                                            numjogadoresVisit === 0 ? 
                                            { borderBottomWidth: 0 } : null 
                                        }
                                        titleContainerStyle={{ marginLeft: 10 }}
                                        subtitleContainerStyle={{ marginLeft: 10 }}
                                        roundAvatar
                                        avatar={imgAvt}
                                        key={index}
                                        title={retrieveUpdUserGroup(
                                            item.key, 
                                            'nome', 
                                            item
                                        )}
                                        subtitle={retrieveUpdUserGroup(
                                            item.key, 
                                            'posicao', 
                                            item
                                        )}
                                        rightIcon={this.renderIcons(item, jogo)}
                                        leftIcon={(
                                            <Image 
                                                style={{ height: 40, width: 35, marginRight: 5 }}
                                                resizeMode={'stretch'}
                                                source={
                                                    shirtColors[jogo.homeshirt] || shirtColors.white
                                                } 
                                            />)
                                        }
                                    />
                                );
                            })
                        }
                        {
                            jogadoresVisitFt.map((item, index) => {
                                const updatedImg = retrieveUpdUserGroup(
                                    item.key, 'imgAvatar', item
                                );
                                const imgAvt = updatedImg ? 
                                { uri: updatedImg } : { uri: '' };
                                return (
                                    <ListItem
                                        containerStyle={
                                            (index + 1) === numjogadoresVisit ?
                                            { borderBottomWidth: 0 } : null 
                                        }
                                        titleContainerStyle={{ marginLeft: 10 }}
                                        subtitleContainerStyle={{ marginLeft: 10 }}
                                        roundAvatar
                                        avatar={imgAvt}
                                        key={index}
                                        title={retrieveUpdUserGroup(
                                            item.key, 
                                            'nome', 
                                            item
                                        )}
                                        subtitle={retrieveUpdUserGroup(
                                            item.key, 
                                            'posicao', 
                                            item
                                        )}
                                        rightIcon={this.renderIcons(item, jogo)}
                                        leftIcon={(
                                            <Image 
                                                style={{ height: 40, width: 35, marginRight: 5 }}
                                                resizeMode={'stretch'}
                                                source={
                                                    shirtColors[jogo.visitshirt] || shirtColors.blue
                                                }
                                            />)
                                        }
                                    />
                                );
                            })
                        }
                    </List>
                </View>
            </View>
        );
    }

    renderIcons = (jogador, jogo) => {
        let i = 0;
        let yellow = 0;
        let red = 0;
        let disabled = false;

        for (i = 0; i < jogo.cartoes.length; i++) {
            if (!jogo.cartoes[i].push && jogo.cartoes[i].key === jogador.key) {
                if (jogo.cartoes[i].color === 'amarelo') {
                    yellow++;
                }
                if (jogo.cartoes[i].color === 'vermelho') {
                    red++;
                }
            }
        }

        if (yellow >= 2 || red >= 1) {
            disabled = true;
        }

        return (
            <View 
                style={{ 
                    flex: 1
                }}
            >
                {
                    disabled ?
                    (
                        <View 
                            style={{ 
                                flex: 1, 
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Text style={{ color: 'red', fontWeight: '500' }}>
                                Jogador Expulso
                            </Text>
                        </View>
                    )
                    :
                    (
                        <View 
                            style={{ 
                                flex: 0.8, 
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
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
                                    onPress={() => checkConInfo(
                                        () => this.onPressPlayerGol(jogador, jogo)
                                    )}
                                >
                                    <Image 
                                        source={imgBola}
                                        style={{ 
                                            width: 25, height: 25 
                                        }} 
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
                                        () => this.onPressCard(jogador, jogo, 'amarelo')
                                    )}
                                >
                                    <Image 
                                        source={imgYellowCard}
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
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
                                        () => this.onPressCard(jogador, jogo, 'vermelho')
                                    )}
                                >
                                    <Image 
                                        source={imgRedCard}
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
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
                                        () => this.onPressSubs(jogador)
                                    )}
                                >
                                    <Image 
                                        source={imgInOut}
                                        style={{ 
                                            width: 25, height: 25 
                                        }} 
                                    />   
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
            </View>

        );
    }

    renderCardFooter = (jogo) => {
        const lockedEnabled = this.state.lockBtnEnabled === '0';
        const textLock = lockedEnabled ? 
        'Presença - Habilitada' : 'Presença - Desabilitada';
        const colorPr = lockedEnabled ? 'green' : 'red';

        return (
            <View
                style={{
                    marginTop: 20, 
                    paddingHorizontal: 15 
                }}
            >
                <Divider
                    style={{
                        marginTop: 5,
                        marginBottom: 5,
                        height: 2
                    }}
                />
                <TouchableOpacity
                    onPress={
                        () => checkConInfo(() => this.onPressLock(jogo, lockedEnabled))
                    }
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 5,
                            backgroundColor: colorPr,
                            marginTop: 5,
                            paddingVertical: 2,
                            opacity: 0.8
                        }}
                    >
                        <CheckBox
                            center
                            containerStyle={{
                                marginLeft: 0,
                                marginRight: 10,
                                backgroundColor: 'transparent',
                                borderWidth: 0,
                                padding: 0
                            }}
                            title={(<View />)}
                            size={22}
                            checked={lockedEnabled}
                            checkedColor={'white'}
                            onPress={
                                () => checkConInfo(() => this.onPressLock(jogo, lockedEnabled))
                            }
                        />
                        <Text
                            style={{ 
                                color: 'white',
                                fontSize: 14, 
                                fontWeight: '500' 
                            }}
                        >
                            {textLock}
                        </Text>
                    </View>
                </TouchableOpacity>
                <Divider
                    style={{
                        marginTop: 5,
                        marginBottom: 5,
                        height: 2
                    }}
                />
                <TouchableOpacity
                    onPress={
                        () => checkConInfo(() => this.onSendNotif(jogo))
                    }
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 5,
                            backgroundColor: '#3E51B4',
                            marginTop: 5,
                            paddingVertical: 2,
                            opacity: 0.8
                        }}
                    >
                        <Icon
                            name={'send'}
                            type={'material-community'}
                            color={'white'}
                            containerStyle={{
                                marginLeft: 0,
                                marginRight: 9,
                                backgroundColor: 'transparent',
                                borderWidth: 0,
                                paddingVertical: 3.8
                            }}
                            size={22}
                            onPress={
                                () => checkConInfo(() => this.onSendNotif(jogo))
                            }
                        />
                        <Text
                            style={{ 
                                color: 'white',
                                fontSize: 14, 
                                fontWeight: '500' 
                            }}
                        >
                            Enviar notificação
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    render = () => {
        const { jogo } = this.state;

        if (typeof jogo === 'object' && Object.keys(jogo).length === 0) {
            return false;
        }

        const jogadoresCasaFt = _.filter(jogo.escalacao.casa, (jgCasa) => !jgCasa.push);
        const jogadoresVisitFt = _.filter(jogo.escalacao.visit, (jgVisit) => !jgVisit.push);

        return (
            <View style={{ flex: 1 }}>
                <ScrollView style={styles.viewP}>
                    { this.renderCardPlacar(jogo) }
                    <View style={{ marginVertical: 2 }} />
                    { this.renderGoals(jogo) }
                    { this.renderCartoes(jogo) }
                    { this.renderSubs(jogo) }
                    { this.renderEscalados(jogo) }
                    <View style={{ marginVertical: 20 }} />
                </ScrollView>
                <PlayersModal
                    showPlayersModal={this.props.showPlayersModalJ}  
                    doInOrOut={
                        (jogador, inOrOut, newJogador = false) => 
                        checkConInfo(() => this.doInOrOut(jogador, inOrOut, jogo, newJogador))
                    }
                    jogadoresCasaFt={jogadoresCasaFt}
                    jogadoresVisitFt={jogadoresVisitFt}
                    listUsuarios={this.props.grupoParticipantes}
                />
                <Dialog
                    animationType={'fade'} 
                    visible={this.props.endGameModal && Actions.currentScene === '_jogoTabG'}
                    title='Gravando dados...'
                    onTouchOutside={() => true}
                >
                    <View 
                        style={{ 
                            alignItems: 'center',
                            justifyContent: 'center' 
                        }}
                    >
                        <Progress.Circle 
                            progress={this.props.endGameModalPerc}
                            size={100}
                            showsText
                            color={colorAppPrimary}
                        />
                    </View>
                </Dialog>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewP: {
        flex: 1,
        backgroundColor: colorAppForeground
    },
    viewPlacar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    text: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: 'black' 
    },
    card: {
        padding: 0,
        margin: 0,
        marginHorizontal: 10,
        marginVertical: 15,
        borderRadius: 5
    },
    cardEffect: {
        backgroundColor: 'white',
        borderColor: '#e1e8ee',
        borderRadius: 5,
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0, .2)',
                shadowOffset: { height: 0, width: 0 },
                shadowOpacity: 1,
                shadowRadius: 1,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    topViewPlacar: {
        width: '80%',
        height: 0,
        borderTopWidth: 40,
        borderTopColor: colorAppPrimary,
        borderLeftWidth: 20,
        borderLeftColor: 'transparent',
        borderRightWidth: 20,
        borderRightColor: 'transparent',
        borderStyle: 'solid'
    },
    separator: { 
        width: '100%', 
        borderTopWidth: 0.5, 
        borderTopColor: 'black',
        marginVertical: 5
    },
    circleBtn: { 
        width: 70, 
        height: 70, 
        borderRadius: 70 / 2,
        borderColor: '#e1e8ee',
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0, .2)',
                shadowOffset: { height: 0, width: 0 },
                shadowOpacity: 1,
                shadowRadius: 1,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    circleBtnTwo: { 
        width: 60, 
        height: 60, 
        borderRadius: 60 / 2,
        borderWidth: 2,
        borderColor: 'white'
    },
    centerFlex: { 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    centerAlign: {
        alignItems: 'center', 
        justifyContent: 'center'
    },
    textCircle: {
        fontSize: 12, 
        color: 'white', 
        fontWeight: 'bold' 
    },
    extraTime: { 
        fontSize: 12, 
        fontWeight: 'bold', 
        color: 'red' 
    },
    textIn: {
        fontWeight: '600',
        color: '#4AD940'
    },
    textOut: {
        fontWeight: '600',
        color: '#E44545'
    }
});

const mapStateToProps = (state) => ({
    showPlayersModalJ: state.GerenciarReducer.showPlayersModalJ,
    endGameModal: state.GerenciarReducer.endGameModal,
    endGameModalPerc: state.GerenciarReducer.endGameModalPerc,
    itemSelected: state.GerenciarReducer.itemSelected,
    onItemRender: state.GerenciarReducer.onItemRender,
    grupoSelected: state.GruposReducer.grupoSelected,
    grupoParticipantes: state.GruposReducer.grupoParticipantes,
    showTimerModal: state.JogoReducer.showTimerModal
});

export default connect(mapStateToProps, { 
    modificaClean,
    modificaCurrentTime,
    modificaShowTimerModal,
    modificaMissedPlayers,
    modificaShowPlayersModalJ,
    modificaIsSubstitute,
    modificaJogador
})(JogoG);
