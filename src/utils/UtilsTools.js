import RNFetchBlob from 'rn-fetch-blob';
import _ from 'lodash';

import { GROUP_PARAMS } from './Constantes';

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

