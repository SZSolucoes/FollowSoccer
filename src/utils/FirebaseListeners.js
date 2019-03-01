
import _ from 'lodash';
import b64 from 'base-64';
import { store } from '../App';
import firebase from './Firebase';
import { usuarioAttr } from './UserUtils';

let jogosListener = null;
let infosListener = null;
let usuariosListener = null;
let usuarioListener = null;
let analiseFinaListener = null;
let enquetesListener = null;

let jogosListenerOn = false;
let infosListenerOn = false;
let usuariosListenerOn = false;
let usuarioListenerOn = false;
let analiseFinaListenerOn = false;
let enquetesListenerOn = false;

export const startFbListener = (name, params) => {
    const databaseRef = firebase.database().ref();

    switch (name) {
        case 'jogos':
            // LISTENER FIREBASE JOGOS
            if (!jogosListener || (jogosListener && !jogosListenerOn)) {
                jogosListener = databaseRef.child('jogos').orderByChild('endStatus').equalTo('0');
                jogosListener.on('value', (snapshot) => {
                    let snapVal = null;

                    if (snapshot) {
                        snapVal = snapshot.val();
                    }

                    if (snapVal) {
                        store.dispatch({
                            type: 'modify_listjogos_jogos',
                            payload: _.map(snapVal, (value, key) => ({ key, ...value }))
                        });      
                    }
                });
                jogosListenerOn = true;
            }
            break;
        case 'infos':
            // LISTENER FIREBASE INFORMATIVOS
            if (!infosListener || (infosListener && !infosListenerOn)) {
                infosListener = databaseRef.child('informativos');
                infosListener.on('value', (snapshot) => {
                    let snapVal = null;

                    if (snapshot) {
                        snapVal = snapshot.val();
                    }

                    if (snapVal) {
                        store.dispatch({
                            type: 'modify_listinfos_info',
                            payload: _.map(snapVal, (value, key) => ({ key, ...value }))
                        });      
                    }
                });
                infosListenerOn = true;
            }
            break;
        case 'usuarios':
            // LISTENER FIREBASE USUARIOS
            if (!usuariosListener || (usuariosListener && !usuariosListenerOn)) {
                usuariosListener = databaseRef.child('usuarios');
                usuariosListener.on('value', (snapshot) => {
                    let snapVal = null;
                    
                    if (snapshot) {
                        snapVal = snapshot.val();
                    }

                    if (snapVal) {
                        store.dispatch({
                            type: 'modify_listusuarios_usuarios',
                            payload: _.map(snapVal, (value, key) => ({ key, ...value }))
                        });
                    }
                });
                usuariosListenerOn = true;
            }
            break;
        case 'usuario':
            // LISTENER FIREBASE USUARIO
            if (!usuarioListener || (usuarioListener && !usuarioListenerOn)) {
                usuarioListener = databaseRef.child(`usuarios/${b64.encode(params.email)}`);
                usuarioListener.on('value', (snapshot) => {
                    let snapVal = null;
                    
                    if (snapshot) {
                        snapVal = snapshot.val();
                    }

                    if (snapVal) {
                        if (snapVal.level !== store.getState().LoginReducer.userLevel) {
                            store.dispatch({
                                type: 'modify_userlevel_login',
                                payload: snapVal.level
                            });
                        }

                        const asyncFunKeys = async () => {
                            const filtredKeys = _.filter(Object.keys(usuarioAttr), 
                                itemAttr => 
                                !(_.findKey(
                                    Object.keys(snapVal), valueKey => valueKey === itemAttr)
                                )
                            );
            
                            if (filtredKeys && filtredKeys.length) {
                                const newObjKeys = {};
                                for (let index = 0; index < filtredKeys.length; index++) {
                                    const element = filtredKeys[index];
                                    newObjKeys[element] = usuarioAttr[element];
                                }
                                
                                usuarioListener.update({ ...newObjKeys });
                            }
                        };

                        asyncFunKeys();

                        store.dispatch({
                            type: 'modify_userlogged_login',
                            payload: { key: snapshot.key, ...snapVal }
                        }); 
                    }
                });
                usuarioListenerOn = true;
            }
            break;
        case 'analise/financeiro':
            // LISTENER FIREBASE ANÁLISE FINACEIRO
            if (!analiseFinaListener || (analiseFinaListener && !analiseFinaListenerOn)) {
                analiseFinaListener = databaseRef.child('analise/financeiro');
                analiseFinaListener.on('value', (snapshot) => {
                    let snapVal = null;
                    
                    if (snapshot) {
                        snapVal = snapshot.val();
                    }

                    if (snapVal) {
                        store.dispatch({
                            type: 'modify_listfina_analisefina',
                            payload: _.map(
                                snapVal, 
                                (value, key) => ({ key, data: b64.decode(key), ...value })
                            )
                        });
                    }
                });
                analiseFinaListenerOn = true;
            }
            break;
        case 'enquetes':
            // LISTENER FIREBASE ENQUETES
            if (!enquetesListener || (enquetesListener && !enquetesListenerOn)) {
                enquetesListener = databaseRef.child('enquetes');
                enquetesListener.on('value', (snapshot) => {
                    let snapVal = null;
                    
                    if (snapshot) {
                        snapVal = snapshot.val();
                    }

                    if (snapVal) {
                        const loginReducer = store.getState().LoginReducer;
                        const enquetesList = _.map(
                            snapshot.val(), (value, key) => ({ key, ...value })
                        );
                        const openEnqts = _.filter(enquetesList, en => en.status === '1');
    
                        // CONTADOR DE ENQUETES NÃO VOTADAS
                        if (loginReducer.userLogged && loginReducer.userLogged.key) {
                            if (openEnqts && openEnqts.length) {
                                const numEnquetes = _.reduce(openEnqts, (sum, item) => {
                                    const votos = _.filter(item.votos, vl => !vl.push);
    
                                    if (votos && votos.length) {
                                        const hasVote = _.findIndex(
                                            votos, vot => vot.key === loginReducer.userLogged.key
                                        ) !== -1;
    
                                        if (!hasVote) {
                                            return sum + 1;
                                        }
    
                                        return sum;
                                    }
    
                                    return sum + 1;
                                }, 0);
                                
                                store.dispatch({
                                    type: 'modify_enqueteprops_profile',
                                    payload: { badge: { value: numEnquetes } }
                                });
                            } else {
                                store.dispatch({
                                    type: 'modify_enqueteprops_profile',
                                    payload: { badge: { value: 0 } }
                                });
                            }
                        }
    
                        // LISTA DE TODAS AS ENQUETES
                        store.dispatch({
                            type: 'modify_enquetes_enquetes',
                            payload: enquetesList
                        });
                    }
                });
                enquetesListenerOn = true;
            }
            break;
        default:
    }
};

export const stopFbListener = (name) => {
    switch (name) {
        case 'jogos':
            if (jogosListener) {
                jogosListener.off();
                jogosListenerOn = false;
            }
            break;
        case 'infos':
            if (infosListener) {
                infosListener.off();
                infosListenerOn = false;
            }
            break;
        case 'usuarios':
            if (usuariosListener) {
                usuariosListener.off();
                usuariosListenerOn = false;
            }
            break;
        case 'usuario':
            if (usuarioListener) {
                usuarioListener.off();
                usuarioListenerOn = false;
            }
            break;
        case 'analise/financeiro':
            if (analiseFinaListener) {
                analiseFinaListener.off();
                analiseFinaListenerOn = false;
            }
            break;
        case 'enquetes':
            if (enquetesListener) {
                enquetesListener.off();
                enquetesListenerOn = false;
            }
            break;
        default:
    }
};

