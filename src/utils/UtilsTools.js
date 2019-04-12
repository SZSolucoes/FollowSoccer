import RNFetchBlob from 'rn-fetch-blob';
import _ from 'lodash';
import Axios from 'axios';
import CryptoJS from 'crypto-js';
import Moment from 'moment';

import { GROUP_PARAMS, BACKENDHOST } from './Constantes';
import { cypherKeyBackEnd } from './Firebase';

const glbXMLHttpRequest = global.XMLHttpRequest;
const glbBlob = global.Blob;

const RNXMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
const RNBlob = RNFetchBlob.polyfill.Blob;

export const doActiveRNFetchBlob = (status) => {
    if (status) {
        global.XMLHttpRequest = RNXMLHttpRequest;
        global.Blob = RNBlob;
    } else {
        global.XMLHttpRequest = glbXMLHttpRequest;
        global.Blob = glbBlob;
    }
};

export const checkGroupKeys = async (grupoSelected, fbDatabaseRef) => {
    if (!grupoSelected.parametros) {
        const grupoRef = fbDatabaseRef.child(`grupos/${grupoSelected.key}`);
        await grupoRef.update({
            parametros: { ...GROUP_PARAMS }
        }).then(() => true).catch(() => false);
    } else if (grupoSelected.parametros) {
        const grupoParamRef = fbDatabaseRef.child(`grupos/${grupoSelected.key}/parametros`);

        const filtredKeys = _.filter(
            Object.keys(GROUP_PARAMS), 
            itemAttr => 
            !(_.findKey(Object.keys(grupoSelected.parametros), valueKey => valueKey === itemAttr))
        );

        if (filtredKeys && filtredKeys.length) {
            const newObjKeys = {};
            for (let index = 0; index < filtredKeys.length; index++) {
                const element = filtredKeys[index];
                newObjKeys[element] = GROUP_PARAMS[element];
            }
            
            await grupoParamRef
            .update({ ...newObjKeys }).then(() => true).catch(() => false);
        }
    }
};

export const checkResetYearScore = async (grupoSelectedKey) => {
    Axios.get(
        `${BACKENDHOST}checkResetScore`, 
        { params: { groupKey: grupoSelectedKey }, 
        timeout: 5000 
    })
    .then(() => true)
    .catch(() => false);
};

export const retServerTime = async (isMoment = false) => (
    Axios.get(`${BACKENDHOST}getTimerServer`, { timeout: 5000 })
    .then(res => {
        try {
            if (res && res.data && res.data.timer) {
                const bytes = CryptoJS.AES.decrypt(res.data.timer, cypherKeyBackEnd);
                if (!bytes) return '';
    
                const plaintext = bytes.toString(CryptoJS.enc.Utf8);
                if (!plaintext) return '';
    
                const timestamp = parseInt(plaintext, 10);
                if (!timestamp) return '';
    
                if (isMoment) {
                    return Moment(timestamp).format('DD/MM/YYYY HH:mm:ss');
                } 
                    
                return timestamp;
            } 
    
            return '';
        } catch (e) {
            return '';
        }
    })
    .catch(() => '')
);

export const finishScoreGroup = async (grupoSelectedKey) => (
    Axios.post(
        `${BACKENDHOST}finishScoreGroup`,
        {
            groupKey: CryptoJS.AES.encrypt(grupoSelectedKey, cypherKeyBackEnd).toString() 
        },
        { 
            timeout: 10000 
        })
    .then((res) => res && res.data && res.data.success === 'true')
    .catch(() => false)
);

