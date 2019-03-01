import { NetInfo } from 'react-native';
import { store } from '../App';
import { ERROS } from './Constantes';

export const checkConInfo = (funExec = () => true, params = [], delay = 0) => {
    if (delay) {
        setTimeout(() => {
            NetInfo.getConnectionInfo()
            .then((conInfo) => {
                if (conInfo.type === 'none' || conInfo.type === 'unknown'
                ) {
                    showDropdownAlert('error', ERROS.semConexao.erro, ERROS.semConexao.mes);
                    return false;
                }
                return funExec(...params);
            })
            .catch(() => {
                showDropdownAlert('error', ERROS.semConexao.erro, ERROS.semConexao.mes);
                return false;
            });
        }, delay); 
    } else {
        NetInfo.getConnectionInfo()
        .then((conInfo) => {
            if (conInfo.type === 'none' || conInfo.type === 'unknown'
            ) {
                showDropdownAlert('error', ERROS.semConexao.erro, ERROS.semConexao.mes);
                return false;
            }
            return funExec(...params);
        })
        .catch(() => {
            showDropdownAlert('error', ERROS.semConexao.erro, ERROS.semConexao.mes);
            return false;
        });
    }
};

export const showDropdownAlert = (
        type = 'error', 
        title = ERROS.default.erro, 
        message = ERROS.default.mes,
        interval = 3500
    ) => {
        store.dispatch({
            type: 'modify_dropdownalert_systemevents',
            payload: {
                type,
                title,
                message,
                interval
            }
        });
};
