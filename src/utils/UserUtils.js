import _ from 'lodash';
import firebase from './Firebase';
import { store } from '../App';

export const usuarioAttr = {
    userDisabled: 'false',
    email: '',
    senha: '',
    nome: '',
    nomeForm: '',
    dtnasc: '',
    imgAvatar: '',
    imgBackground: '',
    level: '1',
    telefone: '',
    endereco: '',
    dataCadastro: '',
    dataHoraUltimoLogin: '',
    jogosParticipados: '0',
    jogosEscalados: '0',
    vitorias: '0',
    derrotas: '0',
    empates: '0',
    gols: '0',
    faltas: '0',
    faltasHistorico: [{ push: 'push' }],
    cartoesAmarelos: '0',
    cartoesVermelhos: '0',
    posicao: '',
    userNotifToken: '',
    infoImgUpdated: 'true', 
    jogosImgUpdated: 'true',
    pwRecover: '',
    grupos: { push: 'push' },
    convites: { push: 'push' }
};

export const updateUserDB = (
    informativos = 'true', 
    jogos = 'true', 
    emailUser, 
    keyUser, 
    newImg,
    newNome
) => {
    const dbFbRef = firebase.database().ref();
    const dbUserRef = dbFbRef.child(`usuarios/${keyUser}`);

    const mainUpdate = async () => {
        // UPDATE DE IMAGEM E NOME DO USUARIO PARA OS INFORMATIVOS
        if (informativos === 'false') {
            const dbInfoRef = dbFbRef.child('informativos');
            await dbInfoRef.once('value', async (snapshot) => {
                if (snapshot) {
                    let childFailed = false;
                    let lastIndex = 0;
                    const numChilds = snapshot.numChildren();
        
                    await snapshot.forEach((child) => {
                        const funExec = async () => {
                            const childVal = child.val();

                            let hasUpdatedImgUser = false;
                            let hasUpdatedNomeUser = false;
                            let hasUpdatedListComents = false;
                            
                            if (
                                childVal.emailUser === emailUser && 
                                childVal.imgAvatar !== newImg
                                ) {
                                    hasUpdatedImgUser = true;
                            }

                            if (
                                childVal.emailUser === emailUser && 
                                childVal.nomeUser !== newNome
                                ) {
                                    hasUpdatedNomeUser = true;
                            }
            
                            hasUpdatedListComents = _.findIndex(
                                childVal.listComents, (comentUser) => (
                                    !comentUser.push && 
                                    comentUser.key === keyUser && 
                                    (comentUser.imgAvatar !== newImg || 
                                    childVal.nome !== newNome)
                                )) !== -1;
            
                            if (hasUpdatedImgUser || hasUpdatedNomeUser || hasUpdatedListComents) {
                                await child.ref.once('value', async snapNew => {
                                    const snapNewVal = snapNew.val();
                                    let updates = {};

                                    if (hasUpdatedImgUser) {
                                        updates = { ...updates, imgAvatar: newImg };
                                    }

                                    if (hasUpdatedNomeUser) {
                                        updates = { ...updates, nomeUser: newNome };
                                    }

                                    if (hasUpdatedListComents) {
                                        const comentsUpdated = _.map(
                                            snapNewVal.listComents, (comentUser) => {
                                                if (!comentUser.push && 
                                                    comentUser.key === keyUser && 
                                                    (comentUser.imgAvatar !== newImg || 
                                                    snapNewVal.nome !== newNome)
                                                    ) {
                                                        return { 
                                                            ...comentUser, 
                                                            imgAvatar: newImg, 
                                                            nome: newNome 
                                                        };
                                                }
                                                
                                                return comentUser;
                                        });
                                        
                                        updates = { ...updates, listComents: comentsUpdated };
                                    }

                                    await child.ref.update({
                                        ...updates
                                    })
                                    .then(async () => { 
                                        lastIndex++;
                                        
                                        /* Caso o update não falhou em nenhum caso entao 
                                        atualiza o status do usuarios de update */
                                        if (numChilds === lastIndex && !childFailed) {
                                            dbUserRef.update({
                                                infoImgUpdated: 'true'
                                            })
                                            .then(() => true)
                                            .catch(() => true);
                                        } 
                                        await true; 
                                    })
                                    .catch(async () => {
                                         childFailed = true;
                                         await true; 
                                    });
                                });
                            }
                        };
                        
                        funExec();
                        return false;
                    });
                }
            });
        }
        // FIM DO UPDATE INFORMATIVOS

        if (jogos === 'false') {
            // UPDATE DE IMAGEM E NOME DO USUARIO PARA OS JOGOS
            const dbJogosRef = dbFbRef.child('jogos');
            await dbJogosRef.once('value', async (snapshot) => {
                if (snapshot) {
                    let childFailed = false;
                    let lastIndex = 0;
                    const numChilds = snapshot.numChildren();
        
                    await snapshot.forEach((child) => {
                        const funExec = async () => {
                            const childVal = child.val();

                            let hasUpdatedGols = false;
                            let hasUpdatedCartoes = false;
                            let hasUpdatedConfirmados = false;
                            let hasUpdatedEscalacao = false;
                            let hasUpdatedSubs = false;

                            hasUpdatedGols = _.findIndex(childVal.gols, (gol) => 
                                (
                                    !gol.push && 
                                    gol.key === keyUser && 
                                    gol.nome !== newNome
                                )
                            ) !== -1;
                            
                            hasUpdatedCartoes = _.findIndex(
                                childVal.cartoes, (cartao) => 
                                    (
                                        !cartao.push && 
                                        cartao.key === keyUser && 
                                        (cartao.imgAvatar !== newImg ||
                                        cartao.nome !== newNome)
                                    )
                            ) !== -1;

                            hasUpdatedConfirmados = _.findIndex(
                                childVal.confirmados, (confirmado) => 
                                    (
                                        !confirmado.push && 
                                        confirmado.key === keyUser && 
                                        (confirmado.imgAvatar !== newImg ||
                                        confirmado.nome !== newNome)
                                    )
                            ) !== -1;

                            hasUpdatedEscalacao = _.findIndex(_.values(childVal.escalacao), 
                                (sidesE) => {
                                    const founded = _.findIndex(sidesE, (sideE) => 
                                            !sideE.push && 
                                            sideE.key === keyUser && 
                                            (sideE.imgAvatar !== newImg || sideE.nome !== newNome)
                                    ) !== -1;

                                    return founded;
                            }) !== -1;

                            hasUpdatedSubs = _.findIndex(childVal.subs, (subs) => {
                                if (!subs.push) {
                                    if (!subs.jogadorIn.push && 
                                        subs.jogadorIn.key === keyUser && 
                                        (subs.jogadorIn.imgAvatar !== newImg || 
                                            subs.jogadorIn.nome !== newNome)
                                        ) {
                                            return true;
                                    }

                                    if (!subs.jogadorOut.push && 
                                        subs.jogadorOut.key === keyUser && 
                                        (subs.jogadorOut.imgAvatar !== newImg || 
                                        subs.jogadorOut.nome !== newNome)
                                        ) {
                                            return true;
                                    }

                                    return false;
                                }

                                return false;
                            }) !== -1;
                            
                            if (hasUpdatedGols || hasUpdatedCartoes || hasUpdatedConfirmados || 
                                hasUpdatedEscalacao || hasUpdatedSubs) {
                                await child.ref.once('value', async snapNew => {
                                    const snapNewVal = snapNew.val();
                                    let updates = {};

                                    if (hasUpdatedGols) {
                                        const golsUpdated = _.map(
                                            snapNewVal.gols, (gol) => {
                                            if (!gol.push && 
                                                gol.key === keyUser && 
                                                gol.nome !== newNome
                                                ) {
                                                    return { ...gol, nome: newNome };
                                            }
            
                                            return gol;
                                        });

                                        updates = { ...updates, gols: golsUpdated };
                                    }

                                    if (hasUpdatedCartoes) {
                                        const cartoesUpdated = _.map(
                                            childVal.cartoes, (cartao) => {
                                            if (!cartao.push && 
                                                cartao.key === keyUser && 
                                                (cartao.imgAvatar !== newImg ||
                                                cartao.nome !== newNome)
                                                ) {
                                                    return { ...cartao, nome: newNome };
                                            }
            
                                            return cartao;
                                        });

                                        updates = { ...updates, cartoes: cartoesUpdated };
                                    }
    
                                    if (hasUpdatedConfirmados) {
                                        const confirmadosUpdated = _.map(
                                            childVal.confirmados, (confirmado) => {
                                            if (!confirmado.push && 
                                                confirmado.key === keyUser && 
                                                (confirmado.imgAvatar !== newImg ||
                                                confirmado.nome !== newNome)
                                                ) {
                                                    return { 
                                                        ...confirmado, 
                                                        imgAvatar: newImg, 
                                                        nome: newNome 
                                                    };
                                            }
            
                                            return confirmado;
                                        });

                                        updates = { ...updates, confirmados: confirmadosUpdated };
                                    }
                                    
                                    if (hasUpdatedEscalacao) {
                                        const escalacaoUpdated = _.map(
                                            childVal.escalacao, (sides, key) => {
                                            let hasChangedSide = false;
                                            const newSides = _.map(sides, (side) => {
                                                if (!side.push && 
                                                    side.key === keyUser && 
                                                    (side.imgAvatar !== newImg || 
                                                    side.nome !== newNome)
                                                    ) {
                                                        hasChangedSide = true;
                                                        return { 
                                                            ...side, 
                                                            imgAvatar: newImg, 
                                                            nome: newNome 
                                                        };
                                                }
            
                                                return side;
                                            });
            
                                            if (hasChangedSide) {
                                                return { [key]: newSides };
                                            }
            
                                            return { [key]: sides };
                                        });
            
                                        let copyEscalacao = {};
                                        for (const side of escalacaoUpdated) {
                                            copyEscalacao = { ...copyEscalacao, ...side };
                                        }

                                        updates = { ...updates, escalacao: copyEscalacao };
                                    }
    
                                    if (hasUpdatedSubs) {
                                        const subsUpdated = _.map(childVal.subs, (subs) => {
                                            if (!subs.push) {
                                                let hasChangedSub = false;
                                                let newSub = {};
            
                                                if (!subs.jogadorIn.push && 
                                                    subs.jogadorIn.key === keyUser && 
                                                    (subs.jogadorIn.imgAvatar !== newImg || 
                                                        subs.jogadorIn.nome !== newNome)
                                                    ) {
                                                        hasChangedSub = true;
                                                        newSub = { 
                                                            ...subs, 
                                                            jogadorIn: { 
                                                                ...subs.jogadorIn, 
                                                                imgAvatar: newImg,
                                                                nome: newNome
                                                            } 
                                                        };
                                                }
            
                                                if (hasChangedSub) {
                                                    return newSub;
                                                }
            
                                                if (!subs.jogadorOut.push && 
                                                    subs.jogadorOut.key === keyUser && 
                                                    (subs.jogadorOut.imgAvatar !== newImg || 
                                                    subs.jogadorOut.nome !== newNome)
                                                    ) {
                                                        hasChangedSub = true;
                                                        newSub = { 
                                                            ...newSub, 
                                                            jogadorOut: { 
                                                                ...subs.jogadorOut, 
                                                                imgAvatar: newImg,
                                                                nome: newNome 
                                                            } 
                                                        };
                                                }
            
                                                if (hasChangedSub) {
                                                    return newSub;
                                                }
                                            }
            
                                            return subs;
                                        });

                                        updates = { ...updates, subs: subsUpdated };
                                    }

                                    await child.ref.update({
                                        ...updates
                                    })
                                    .then(async () => { 
                                        lastIndex++;
                                        
                                        /* Caso o update não falhou em nenhum caso entao 
                                        atualiza o status do usuarios de update */
                                        if (numChilds === lastIndex && !childFailed) {
                                            dbUserRef.update({
                                                jogosImgUpdated: 'true'
                                            })
                                            .then(() => true)
                                            .catch(() => true);
                                        } 
                                        await true; 
                                    })
                                    .catch(async () => {
                                        childFailed = true;
                                        await true; 
                                    });
                                });
                            }
                        };
                        
                        funExec();
                        return false;
                    });
                }
            });
        }
        // FIM DO UPDATE JOGOS
    };

    mainUpdate();

    return true;
};

export const retrieveUpdUserGroup = (userKey, objKey, obj) => {
    if (userKey) {
        const grupoParticipantes = store.getState().GruposReducer.grupoParticipantes;

        if (grupoParticipantes && grupoParticipantes.length) {
                const userFounded = _.find(grupoParticipantes, ita => ita.key === userKey);

                if (userFounded) return userFounded[objKey];
        }
    }

    if (!objKey || !obj) return;

    return obj[objKey];
};
