import _ from 'lodash';
import { Alert } from 'react-native';
import { roundTo } from './NumComplex';
import { usuarioAttr } from './UserUtils';
import { store } from '../App';
import { showDropdownAlert } from './SystemEvents';
import { ERROS } from './Constantes';

const deParaPos = {
    go: { name: 'Goleiro', index: 0 },
    le: { name: 'Lateral Esquerdo', index: 1 },
    ld: { name: 'Lateral Direito', index: 2 },
    za1: { name: 'Zagueiro', index: 3 },
    za2: { name: 'Zagueiro', index: 4 },
    za3: { name: 'Zagueiro', index: 5 },
    za4: { name: 'Zagueiro', index: 6 },
    md1: { name: 'Meio Defensivo', index: 7 },
    md2: { name: 'Meio Defensivo', index: 8 },
    md3: { name: 'Meio Defensivo', index: 9 },
    md4: { name: 'Meio Defensivo', index: 10 },
    mo1: { name: 'Meio Ofensivo', index: 11 },
    mo2: { name: 'Meio Ofensivo', index: 12 },
    mo3: { name: 'Meio Ofensivo', index: 13 },
    mo4: { name: 'Meio Ofensivo', index: 14 },
    ale: { name: 'Ala Esquerdo', index: 15 }, 
    ald: { name: 'Ala Direito', index: 16 },
    at1: { name: 'Atacante', index: 17 }, 
    at2: { name: 'Atacante', index: 18 }, 
    at3: { name: 'Atacante', index: 19 }, 
    at4: { name: 'Atacante', index: 20 },
    default: { name: '', index: 0 }
};

export const getPosName = (posvalue) => deParaPos[posvalue].name;
export const getPosIndex = (posvalue) => deParaPos[posvalue].index;

export const doEndGame = async (
    jogo, 
    firebase, 
    Actions, 
    missedPlayers, 
    listUsuarios,
    grupoSelectedKey,
    grupoParametros,
    listParticipantes
    ) => {
    const dbFirebaseRef = firebase.database().ref();
    const placarCasa = parseInt(jogo.placarCasa, 10);
    const placarVisit = parseInt(jogo.placarVisit, 10);
    const jogadores = _.uniqBy([
        ...jogo.escalacao.casa,
        ...jogo.escalacao.visit,
        ...jogo.escalacao.banco,
    ], 'key');
    /* const jogadoresConfirmados = _.filter(jogo.confirmados, (jConfs) => !jConfs.push);
    const missedPlayers = _.filter(jogadoresConfirmados, jConf => {
        for (let index = 0; index < jogadores.length; index++) {
            const element = jogadores[index];
            if (element.key === jConf.key) {
                return false;
            }
        }

        return true;
    }); */

    let i = 0;
    let iFix = 0;

    _.remove(jogadores, (item) => !!item.push);

    if (jogadores.length === 0) {
        Alert.alert('Aviso', 'Não há jogadores escalados para finalizar o jogo');
        return false;
    }

    store.dispatch({
        type: 'modifica_endgamemodal_gerenciar',
        payload: true
    });

    store.dispatch({
        type: 'modifica_endgamemodalperc_gerenciar',
        payload: 0.02
    });
    
    // Timeout utilizado para dar tempo de renderizar o modal de loading
    setTimeout(() => {
        // Altera o status do jogo para encerrado
        dbFirebaseRef.child(`grupos/${grupoSelectedKey}/jogos/${jogo.key}`).update({
            status: '3'
        })
        .then(() => true)
        .catch(() => true);
    
        // Inicia a atualizacao dos usuarios para vitorias derrotas e escalacao
        if (placarCasa > placarVisit) {
            const jogadoresVit = _.filter(jogadores, (jogv) => jogv.side === 'casa');
            const jogadoresDer = _.filter(jogadores, (jogd) => jogd.side === 'visit');
            let numJogs = jogadoresVit.length + jogadoresDer.length;
            
            iFix = 1 / (jogadoresVit.length + jogadoresDer.length);

            const jogadoresPresentes = _.differenceBy(jogo.confirmados, jogadoresVit, 'key');

            updateScores(
                grupoSelectedKey, 
                grupoParametros, 
                jogadoresVit, 
                'vitoria', 
                dbFirebaseRef,
                listParticipantes
            );
            updateScores(
                grupoSelectedKey, 
                grupoParametros, 
                jogadoresPresentes, 
                'presenca', 
                dbFirebaseRef,
                listParticipantes
            );
    
            // Jogadores vitoriosos atualizados primeiro
            jogadoresVit.forEach((jogador) => {
                dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', (snapshot) => {
                    dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                        vitorias: (parseInt(snapshot.val().vitorias, 10) + 1).toString(),
                        jogosEscalados: 
                            (parseInt(snapshot.val().jogosEscalados, 10) + 1).toString(),
                        faltas: '0'
                    })
                    .then(() => {
                        i += iFix;
                        numJogs--;
    
                        store.dispatch({
                            type: 'modifica_endgamemodalperc_gerenciar',
                            payload: roundTo(i, 2)
                        });
    
                        if (numJogs <= 0) {
                            setTimeout(() => 
                            changeStsEndGame(
                                jogo, 
                                firebase, 
                                Actions, 
                                missedPlayers, 
                                listUsuarios,
                                grupoSelectedKey
                            ), 2000);
                        }
                    })
                    .catch(() => {
                        showDropdownAlert(
                            'error',
                            ERROS.endGameContab.erro,
                            ERROS.endGameContab.mes
                        );
                        closeEndGameModal();
                    });
                });
            });
    
            // Jogadores com derrota atualizados por ultimo
            jogadoresDer.forEach((jogador) => {
                dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', (snapshot) => {
                    dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                        derrotas: (parseInt(snapshot.val().derrotas, 10) + 1).toString(),
                        jogosEscalados: 
                            (parseInt(snapshot.val().jogosEscalados, 10) + 1).toString(),
                        faltas: '0'
                    })
                    .then(() => {
                        i += iFix;
                        numJogs--;
    
                        store.dispatch({
                            type: 'modifica_endgamemodalperc_gerenciar',
                            payload: roundTo(i, 2)
                        });
    
                        if (numJogs <= 0) {
                            setTimeout(() => 
                            changeStsEndGame(
                                jogo, 
                                firebase, 
                                Actions, 
                                missedPlayers,
                                listUsuarios,
                                grupoSelectedKey
                            ), 2000);
                        }
                    })
                    .catch(() => {
                        showDropdownAlert(
                            'error',
                            ERROS.endGameContab.erro,
                            ERROS.endGameContab.mes
                        );
                        closeEndGameModal();
                    });
                });
            });
        } else if (placarVisit > placarCasa) {
            const jogadoresVit = _.filter(jogadores, (jogv) => jogv.side === 'visit');
            const jogadoresDer = _.filter(jogadores, (jogd) => jogd.side === 'casa');
            let numJogs = jogadoresVit.length + jogadoresDer.length;
    
            iFix = 1 / (jogadoresVit.length + jogadoresDer.length);

            const jogadoresPresentes = _.differenceBy(jogo.confirmados, jogadoresVit, 'key');

            updateScores(
                grupoSelectedKey, 
                grupoParametros, 
                jogadoresVit, 
                'vitoria', 
                dbFirebaseRef,
                listParticipantes
            );
            updateScores(
                grupoSelectedKey, 
                grupoParametros, 
                jogadoresPresentes, 
                'presenca', 
                dbFirebaseRef,
                listParticipantes
            );
    
            // Jogadores vitoriosos atualizados primeiro
            jogadoresVit.forEach((jogador) => {
                dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', (snapshot) => {
                    dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                        vitorias: (parseInt(snapshot.val().vitorias, 10) + 1).toString(),
                        jogosEscalados: 
                            (parseInt(snapshot.val().jogosEscalados, 10) + 1).toString(),
                        faltas: '0'
                    })
                    .then(() => {
                        i += iFix;
                        numJogs--;
    
                        store.dispatch({
                            type: 'modifica_endgamemodalperc_gerenciar',
                            payload: roundTo(i, 2)
                        });
    
                        if (numJogs <= 0) {
                            setTimeout(() => 
                            changeStsEndGame(
                                jogo, 
                                firebase, 
                                Actions, 
                                missedPlayers,
                                listUsuarios,
                                grupoSelectedKey
                            ), 2000);
                        }
                    })
                    .catch(() => {
                        showDropdownAlert(
                            'error',
                            ERROS.endGameContab.erro,
                            ERROS.endGameContab.mes
                        );
                        closeEndGameModal();
                    });
                });
            });
    
            // Jogadores com derrota atualizados por ultimo
            jogadoresDer.forEach((jogador) => {
                dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', (snapshot) => {
                    dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                        derrotas: (parseInt(snapshot.val().derrotas, 10) + 1).toString(),
                        jogosEscalados: 
                            (parseInt(snapshot.val().jogosEscalados, 10) + 1).toString(),
                        faltas: '0'
                    })
                    .then(() => {
                        i += iFix;
                        numJogs--;
    
                        store.dispatch({
                            type: 'modifica_endgamemodalperc_gerenciar',
                            payload: roundTo(i, 2)
                        });
    
                        if (numJogs <= 0) {
                            setTimeout(() => 
                            changeStsEndGame(
                                jogo, 
                                firebase, 
                                Actions, 
                                missedPlayers,
                                listUsuarios,
                                grupoSelectedKey
                            ), 2000);
                        }
                    })
                    .catch(() => {
                        showDropdownAlert(
                            'error',
                            ERROS.endGameContab.erro,
                            ERROS.endGameContab.mes
                        );
                        closeEndGameModal();
                    });
                });
            });
        } else {
            iFix = 1 / jogadores.length;
            let numJogs = jogadores.length;

            const jogadoresPresentes = _.differenceBy(jogo.confirmados, jogadores, 'key');

            updateScores(
                grupoSelectedKey, 
                grupoParametros, 
                jogadores, 
                'empate', 
                dbFirebaseRef,
                listParticipantes
            );
            updateScores(
                grupoSelectedKey, 
                grupoParametros, 
                jogadoresPresentes, 
                'presenca', 
                dbFirebaseRef,
                listParticipantes
            );
    
            jogadores.forEach((jogador) => {
                dbFirebaseRef.child(`usuarios/${jogador.key}`)
                .once('value', (snapshot) => {
                    dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                        empates: (parseInt(snapshot.val().empates, 10) + 1).toString(),
                        jogosEscalados: 
                            (parseInt(snapshot.val().jogosEscalados, 10) + 1).toString(),
                        faltas: '0'
                    })
                    .then(() => {
                        i += iFix;
                        numJogs--;
    
                        store.dispatch({
                            type: 'modifica_endgamemodalperc_gerenciar',
                            payload: roundTo(i, 2)
                        });
    
                        if (numJogs <= 0) {
                            setTimeout(() => 
                            changeStsEndGame(
                                jogo, 
                                firebase, 
                                Actions, 
                                missedPlayers,
                                listUsuarios,
                                grupoSelectedKey
                            ), 2000);
                        }
                    })
                    .catch(() => {
                        showDropdownAlert(
                            'error',
                            ERROS.endGameContab.erro,
                            ERROS.endGameContab.mes
                        );
                        closeEndGameModal();
                    });
                });  
            });
        }
    }, 500);
};

const closeEndGameModal = () => {
    store.dispatch({
        type: 'modifica_endgamemodal_gerenciar',
        payload: false
    });
    store.dispatch({
        type: 'modifica_endgamemodalperc_gerenciar',
        payload: 0
    });
};

const changeStsEndGame = (
    jogo, 
    firebase, 
    Actions, 
    missedPlayers, 
    listUsuarios,
    grupoSelectedKey
    ) => {
    const dbFirebaseRef = firebase.database().ref();

    dbFirebaseRef.child(`grupos/${grupoSelectedKey}/jogos/${jogo.key}`).update({
        endStatus: '1'
    })
    .then(() => {
        closeEndGameModal();
        updateMissedPlayers(firebase, missedPlayers, listUsuarios, jogo);
        Actions.popTo('gerenciar');
        showDropdownAlert(
            'success',
            'Jogo finalizado',
            ''
        );
    })
    .catch(() => {
        closeEndGameModal();
        showDropdownAlert(
            'error',
            ERROS.endGameFinaliz.erro,
            ERROS.endGameFinaliz.mes
        );
    });
};

const updateMissedPlayers = (
        firebase, 
        missedPlayers = [], 
        listUsuarios, 
        jogo
    ) => {
    const confirmados = jogo.confirmados;
    const usuariosKeysMissed = [];

    for (let index = 0; index < listUsuarios.length; index++) {
        const element = listUsuarios[index];
        
        if (
            element.key && 
            _.findIndex(
                confirmados, 
                ita => ita.key && 
                ita.key === element.key
            ) === -1
        ) {
                usuariosKeysMissed.push(element.key);
        }  
    }

    const compMissedPlayers = [...usuariosKeysMissed, ...missedPlayers];

    if (compMissedPlayers && compMissedPlayers.length) {
        const dbFirebaseRef = firebase.database().ref();
        const dataAtual = jogo.data;

        compMissedPlayers.forEach((jogadorKey) => {
            dbFirebaseRef.child(`usuarios/${jogadorKey}`)
            .once('value', (snapshot) => {
                const faltasH = snapshot.val().faltasHistorico || usuarioAttr.faltasHistorico;
                const newSnap = [...faltasH];
                const indexFoundToDel = _.findIndex(newSnap, idx => !!idx.push);
                if (indexFoundToDel !== -1) {
                    newSnap.splice(indexFoundToDel, 1);
                }
                newSnap.push({ data: dataAtual });
                dbFirebaseRef.child(`usuarios/${jogadorKey}`).update({
                    faltas: (parseInt(snapshot.val().faltas, 10) + 1).toString(),
                    faltasHistorico: newSnap
                })
                .then(() => true)
                .catch(() => {
                    showDropdownAlert(
                        'error',
                        ERROS.endGameJogMissGame.erro,
                        ERROS.endGameJogMissGame.mes
                    );
                });
            });  
        });
    }
};

const updateScores = (
    grupoKey, 
    parametros, 
    listJogadores, 
    type, 
    dbFirebaseRef,
    listParticipantes
    ) => {
    if (listJogadores && listJogadores.length && listParticipantes) {
        const { pontoempate, pontopresenc, pontovitoria } = parametros;
        let scoreValue = 0;
    
        if (type === 'vitoria') {
            scoreValue = parseInt(pontovitoria, 10) + parseInt(pontopresenc, 10);
        } else if (type === 'presenca') {
            scoreValue = parseInt(pontopresenc, 10);
        } else if (type === 'empate') {
            scoreValue = parseInt(pontoempate, 10) + parseInt(pontopresenc, 10);
        }
    
    
        for (let index = 0; index < listJogadores.length; index++) {
            const element = listParticipantes[listJogadores[index].key];
            
            if (element) {
                dbFirebaseRef.child(`grupos/${grupoKey}/participantes/${element.key}`)
                .update({
                    score: parseInt(element.score, 10) + scoreValue
                }).then(() => true).catch(() => false);
            }
        }
    }
};

