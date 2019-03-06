/* eslint-disable max-len */
import Axios from 'axios';
import _ from 'lodash';
import firebase from './Firebase';

const key = '';

export const sendCadJogoPushNotifForAll = (jogo, grupo) => {
    const participantesKeys = [];
    const participantes = _.filter(
        grupo.participantes, 
        itc => itc.jogoNotifCad && itc.jogoNotifCad === 'on'
    );

    for (let index = 0; index < participantes.length; index++) {
        const user = participantes[index];
        
        if (typeof user === 'object' && user.key) participantesKeys.push(user.key);
    }

    if (!(participantesKeys.length > 0)) return;

    const asyncFunExec = async () => {
        const promises = [];
        const tokenKeys = [];

        const dbFirebaseRef = firebase.database().ref();

        for (let indexA = 0; indexA < participantesKeys.length; indexA++) {
            const userKey = participantesKeys[indexA];

            const promise = dbFirebaseRef.child(`usuarios/${userKey}/userNotifToken`).once('value');

            promises.push(promise);
        }

        const snapsUserNotifToken = await Promise.all(promises);

        if (snapsUserNotifToken && 
            snapsUserNotifToken instanceof Array && snapsUserNotifToken.length
        ) {
            for (let indexB = 0; indexB < snapsUserNotifToken.length; indexB++) {
                const token = snapsUserNotifToken[indexB];
                const tokenVal = token.val();

                if (tokenVal && !tokenKeys.includes(tokenVal)) tokenKeys.push(tokenVal);
            }
        }

        if (tokenKeys.length) {
            tokenKeys.forEach(k => {
                Axios.post('https://fcm.googleapis.com/fcm/send',
                {
                    to: k,
                    notification: {
                        title: `Jogo (${jogo}) foi criado`,
                        body: 'Aproveite e já confirme a sua presença',
                        show_in_foreground: true
                    }, 
                    data: {
                        targetScreen: 'main'
                    }
                },
                    {
                        headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `key=${key}`
                        }
                    }
                );
            });
        }
    };

    asyncFunExec();
};

export const sendReminderJogoPushNotifForAll = async (jogo, grupo) => { 
    const message = `Jogo (${jogo}) está chegando. Aproveite e confirme sua presença o quanto antes`;
    const participantesKeys = [];
    const participantes = _.filter(
        grupo.participantes, 
        itc => itc.jogoNotifReminder && itc.jogoNotifReminder === 'on'
    );

    for (let index = 0; index < participantes.length; index++) {
        const user = participantes[index];
        
        if (typeof user === 'object' && user.key) participantesKeys.push(user.key);
    }

    if (!(participantesKeys.length > 0)) return;

    const asyncFunExec = async () => {
        const promises = [];
        const tokenKeys = [];

        const dbFirebaseRef = firebase.database().ref();

        for (let indexA = 0; indexA < participantesKeys.length; indexA++) {
            const userKey = participantesKeys[indexA];

            const promise = dbFirebaseRef.child(`usuarios/${userKey}/userNotifToken`).once('value');

            promises.push(promise);
        }

        const snapsUserNotifToken = await Promise.all(promises);

        if (snapsUserNotifToken && 
            snapsUserNotifToken instanceof Array && snapsUserNotifToken.length
        ) {
            for (let indexB = 0; indexB < snapsUserNotifToken.length; indexB++) {
                const token = snapsUserNotifToken[indexB];
                const tokenVal = token.val();

                if (tokenVal && !tokenKeys.includes(tokenVal)) tokenKeys.push(tokenVal);
            }
        }

        if (tokenKeys.length) {
            tokenKeys.forEach(k => {
                Axios.post('https://fcm.googleapis.com/fcm/send',
                {
                    to: k,
                    notification: {
                        title: 'Lembrete',
                        body: message,
                        show_in_foreground: true
                    }, 
                    data: {
                        targetScreen: 'main'
                    }
                },
                    {
                        headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `key=${key}`
                        }
                    }
                );
            });
        }
    };

    asyncFunExec();
};

export const sendEnquetePushNotifForTopic = (grupo) => {
    const participantesKeys = [];
    const participantes = _.filter(
        grupo.participantes, 
        itc => itc.enqueteNotif && itc.enqueteNotif === 'on'
    );

    for (let index = 0; index < participantes.length; index++) {
        const user = participantes[index];
        
        if (typeof user === 'object' && user.key) participantesKeys.push(user.key);
    }

    if (!(participantesKeys.length > 0)) return;

    const asyncFunExec = async () => {
        const promises = [];
        const tokenKeys = [];

        const dbFirebaseRef = firebase.database().ref();

        for (let indexA = 0; indexA < participantesKeys.length; indexA++) {
            const userKey = participantesKeys[indexA];

            const promise = dbFirebaseRef.child(`usuarios/${userKey}/userNotifToken`).once('value');

            promises.push(promise);
        }

        const snapsUserNotifToken = await Promise.all(promises);

        if (snapsUserNotifToken && 
            snapsUserNotifToken instanceof Array && snapsUserNotifToken.length
        ) {
            for (let indexB = 0; indexB < snapsUserNotifToken.length; indexB++) {
                const token = snapsUserNotifToken[indexB];
                const tokenVal = token.val();

                if (tokenVal && !tokenKeys.includes(tokenVal)) tokenKeys.push(tokenVal);
            }
        }

        if (tokenKeys.length) {
            tokenKeys.forEach(k => {
                Axios.post('https://fcm.googleapis.com/fcm/send',
                {
                    to: k,
                    notification: {
                        title: 'Nova enquete disponível',
                        body: 'Aproveite e já confirme o seu voto',
                        show_in_foreground: true,
                        targetScreen: 'enquetes'
                    }, 
                    data: {
                        targetScreen: 'enquetes'
                    }
                },
                    {
                        headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `key=${key}`
                        }
                    }
                );
            });
        }
    };

    asyncFunExec();
};

export const sendMuralPushNotifForTopic = (grupo) => {
    const participantesKeys = [];
    const participantes = _.filter(
        grupo.participantes, 
        itc => itc.muralNotif && itc.muralNotif === 'on'
    );

    for (let index = 0; index < participantes.length; index++) {
        const user = participantes[index];
        
        if (typeof user === 'object' && user.key) participantesKeys.push(user.key);
    }

    if (!(participantesKeys.length > 0)) {
        return;
    }

    const asyncFunExec = async () => {
        const promises = [];
        const tokenKeys = [];

        const dbFirebaseRef = firebase.database().ref();

        for (let indexA = 0; indexA < participantesKeys.length; indexA++) {
            const userKey = participantesKeys[indexA];

            const promise = dbFirebaseRef.child(`usuarios/${userKey}/userNotifToken`).once('value');

            promises.push(promise);
        }

        const snapsUserNotifToken = await Promise.all(promises);

        if (snapsUserNotifToken && 
            snapsUserNotifToken instanceof Array && snapsUserNotifToken.length
        ) {
            for (let indexB = 0; indexB < snapsUserNotifToken.length; indexB++) {
                const token = snapsUserNotifToken[indexB];
                const tokenVal = token.val();

                if (tokenVal && !tokenKeys.includes(tokenVal)) tokenKeys.push(tokenVal);
            }
        }

        if (tokenKeys.length) {
            tokenKeys.forEach(k => {
                Axios.post('https://fcm.googleapis.com/fcm/send',
                {
                    to: k,
                    notification: {
                        title: 'Mural',
                        body: 'Foi realizado uma nova publicação no mural',
                        show_in_foreground: true,
                        targetScreen: 'mural'
                    }, 
                    data: {
                        targetScreen: 'mural'
                    }
                },
                    {
                        headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `key=${key}`
                        }
                    }
                );
            });
        }
    };

    asyncFunExec();
};

