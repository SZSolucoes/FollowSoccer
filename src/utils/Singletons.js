import { AsyncStorage } from 'react-native';
import Moment from 'moment';

import { mappedKeyStorage } from './Storage';

class RefreshTokenAndHour {
    constructor() {
        if (!RefreshTokenAndHour.instance) {
            this.hasUpdated = false;
            RefreshTokenAndHour.instance = this;
        }
        
        return RefreshTokenAndHour.instance;
    }

    updateTokenAndHour = (fbDatabaseRef, userLogged) => {
        if (!this.hasUpdated && userLogged && userLogged.key) {
            const userNode = fbDatabaseRef.child(`usuarios/${userLogged.key}`);
            
            AsyncStorage.getItem(mappedKeyStorage('userNotifToken')).then((userNotifToken) => {
                const dataAtual = Moment().format('DD/MM/YYYY HH:mm:ss');
                if (userNotifToken) {
                    userNode.update({
                        dataHoraUltimoLogin: dataAtual,
                        userNotifToken
                    })
                    .then(() => (this.hasUpdated = true))
                    .catch(() => (this.hasUpdated = false));
                } else {
                    userNode.update({
                        dataHoraUltimoLogin: dataAtual
                    })
                    .then(() => (this.hasUpdated = true))
                    .catch(() => (this.hasUpdated = false));
                }
            });
        }
    }
}

const refreshTokenAndHour = new RefreshTokenAndHour();

export default refreshTokenAndHour;
