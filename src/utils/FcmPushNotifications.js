import Axios from 'axios';

const key = 'AIzaSyCSN342x3TvqVI8h36tFDs1GMTiC4nzjdw';

export const sendCadJogoPushNotifForAll = (jogo) => {
    Axios.post('https://fcm.googleapis.com/fcm/send',
      {
        to: '/topics/all',
        notification: {
            title: `Jogo (${jogo}) foi criado`,
            body: 'Aproveite e já confirme a sua presença',
            show_in_foreground: 'true'
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
};

export const sendEnquetePushNotifForTopic = () => {
    Axios.post('https://fcm.googleapis.com/fcm/send',
      {
        to: '/topics/enquetes',
        notification: {
            title: 'Nova enquete disponível',
            body: 'Aproveite e já confirme o seu voto',
            show_in_foreground: 'true',
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
};

export const sendTestPushNotifForTopic = () => {
    Axios.post('https://fcm.googleapis.com/fcm/send',
      {
        to: '/topics/devtests',
        notification: {
            title: 'Teste Push',
            body: 'Mensagem de teste push',
            show_in_foreground: 'true',
            targetScreen: 'devtests'
        }, 
        data: {
            targetScreen: 'devtests'
        }
      },
        {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `key=${key}`
            }
        }
    );
};

