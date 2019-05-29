/* eslint-disable max-len */
import Axios from 'axios';
import { BACKENDHOST } from './Constantes';

export const sendPwRecover = async (
    emailDest = '',
    user = {},
    pwRecover = '',
    attachs = []
) => Axios.post(`${BACKENDHOST}sendPwRecover`, {
        emailDest,
        userDevice: user.device,
        pwRecover,
        attachs
    })
    .then((res) => res && res.data && (res.data.success === 'true' || res.data.success === true))
    .catch(() => false);

