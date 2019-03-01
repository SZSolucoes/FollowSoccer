
import { AsyncStorage } from 'react-native';
import b64 from 'base-64';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import firebase from '../../utils/Firebase';
import { mappedKeyStorage } from '../../utils/Storage';
import { usuarioAttr } from '../../utils/UserUtils';
import { showDropdownAlert } from '../../utils/SystemEvents';
import { ERROS } from '../../utils/Constantes';

export const modifyUsername = (value) => ({
    type: 'modify_username_login',
    payload: value
});

export const modifyPassword = (value) => ({
    type: 'modify_password_login',
    payload: value
});

export const modifyHidePw = (value) => ({
    type: 'modify_hidepw_login',
    payload: value
});

export const modifyShowLogoLogin = (value) => ({
    type: 'modify_showlogologin_login',
    payload: value
});

export const modifyModalVisible = (value) => ({
    type: 'modify_modalvisible_login',
    payload: value
});

export const modifyUserToken = (value) => ({
    type: 'modify_usertoken_login',
    payload: value
});

export const modifyUserLogged = (value) => ({
    type: 'modify_userlogged_login',
    payload: value
});

export const modifyCleanLogin = () => ({
    type: 'modify_clean_login'
});

export const doLogin = (params) => dispatch => {
    dispatch({
        type: 'modify_indicator_login',
        payload: true
    });

    const newParams = { ...params };
    const authRef = firebase.auth();
    const dbUsuarioRef = firebase.database().ref().child(`usuarios/${b64.encode(newParams.email)}`);

    dbUsuarioRef.once('value', (snapshot) => {
        if (snapshot && snapshot.val()) {
            const snapVal = snapshot.val();

            if (snapVal.pwRecover && (newParams.password === snapVal.pwRecover)) {
                newParams.password = snapVal.senha;
            }

            authRef.signInWithEmailAndPassword(newParams.email, newParams.password)
            .then(() => onLoginSuccess(dispatch, newParams, snapshot, dbUsuarioRef))
            .catch((error) => onLoginError(dispatch, error));
        } else {
            onLoginError(dispatch, { code: 'auth/wrong-password' });
        }
    });
};

const onLoginSuccess = (dispatch, params, snapshot, dbUsuarioRef) => {
    //const dataAtual = Moment().format('DD/MM/YYYY HH:mm:ss');
    //let usuarioLogged = {};

    const snapVal = snapshot ? snapshot.val() : {};

    /* if (!snapVal) {
        usuarioLogged = {
            ...usuarioAttr,
            userDisabled: 'false',
            email: params.email,
            senha: params.password,
            dataCadastro: dataAtual,
            dataHoraUltimoLogin: dataAtual
        };

        dbUsuarioRef.set({ ...usuarioLogged })
        .then(() => true)
        .catch(() => true);
    } */

    if (snapVal && 
        snapVal.userDisabled && 
        snapVal.userDisabled === 'true') {
        dispatch({
            type: 'modify_indicator_login',
            payload: false
        });

        showDropdownAlert('error', ERROS.userDisabled.erro, ERROS.userDisabled.mes);
    } else if (
        snapVal && 
        snapVal.userDisabled && 
        snapVal.userDisabled === 'false'
    ) {
        const asyncFunKeys = async () => {
            const filtredKeys = _.filter(Object.keys(usuarioAttr), 
                itemAttr => 
                !(_.findKey(Object.keys(snapVal), valueKey => valueKey === itemAttr))
            );

            if (filtredKeys && filtredKeys.length) {
                const newObjKeys = {};
                for (let index = 0; index < filtredKeys.length; index++) {
                    const element = filtredKeys[index];
                    newObjKeys[element] = usuarioAttr[element];
                }
                
                dbUsuarioRef.update({ ...newObjKeys });
            }
        };

        asyncFunKeys();
        
        dispatch({
            type: 'modify_userlogged_login',
            payload: { key: snapshot.key, ...snapVal }
        });
        dispatch({
            type: 'modify_userlevel_login',
            payload: snapVal.level ? snapVal.level : '1'
        });
        dispatch({
            type: 'modify_indicator_login',
            payload: false
        });
    
        AsyncStorage.setItem(mappedKeyStorage('username'), params.email);
        AsyncStorage.setItem(mappedKeyStorage('password'), params.password);
    
        Actions.mainscreen();
    } else {
        dispatch({
            type: 'modify_indicator_login',
            payload: false
        });

        showDropdownAlert('error', ERROS.emailNotFound.erro, ERROS.emailNotFound.mes);
    }
};

const onLoginError = (dispatch, error) => {
    dispatch({
        type: 'modify_indicator_login',
        payload: false
    });
    switch (error.code) {
        case 'auth/invalid-email':
            showDropdownAlert('error', ERROS.emailInvalid.erro, ERROS.emailInvalid.mes);
            break;
        case 'auth/user-disabled':
            showDropdownAlert('error', ERROS.userDisabled.erro, ERROS.userDisabled.mes);
            break;
        case 'auth/user-not-found':
            showDropdownAlert('error', ERROS.emailNotFound.erro, ERROS.emailNotFound.mes);
            break;
        case 'auth/wrong-password':
            showDropdownAlert('error', ERROS.incorrectLogin.erro, ERROS.incorrectLogin.mes);
            break;
        default:
            showDropdownAlert('error', ERROS.default.erro, ERROS.default.mes);
    }
};

