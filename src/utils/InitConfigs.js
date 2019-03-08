import { AsyncStorage, NetInfo, Platform, AppState } from 'react-native';
import Axios from 'axios';
import { decode, encode } from 'base-64';
import _ from 'lodash';
import { Actions } from 'react-native-router-flux';
import FCM, { FCMEvent, NotificationType, WillPresentNotificationResult } from 'react-native-fcm';

import { startFbListener } from './FirebaseListeners';
import { mappedKeyStorage } from './Storage';

export const initConfigs = (store) => {
    if (!global.btoa) {
        global.btoa = encode;
    }
    
    if (!global.atob) {
        global.atob = decode;
    }
    
    Axios.defaults.timeout = 80000; // Timeout default para o Axios
    
    console.disableYellowBox = true;

    const consoleCloned = _.clone(console);

    console.warn = message => {
        if (message.indexOf('Setting a timer') <= -1) {
            consoleCloned.warn(message);
        }
    };
    
    setTimeout(async () => {
        const username = await AsyncStorage.getItem(mappedKeyStorage('username'));
        
        if (username) {
            const password = await AsyncStorage.getItem(mappedKeyStorage('password'));
            
            if (password) {
                let loginAutomaticoEnabled = '';

                try {
                    loginAutomaticoEnabled = await AsyncStorage.getItem(
                        mappedKeyStorage('loginAutomaticoEnabled')
                    );
                } catch (e) {
                    console.log(e);

                    AsyncStorage.setItem(
                        mappedKeyStorage('loginAutomaticoEnabled'), 
                        'yes'
                    );
                }
                if (loginAutomaticoEnabled && loginAutomaticoEnabled === 'yes') {
                    store.dispatch({
                        type: 'modify_username_login',
                        payload: username
                    });
                    store.dispatch({
                        type: 'modify_password_login',
                        payload: password
                    });
                }

                startFbListener('usuario', { email: username });
            } 
        } 
    }, 1000);
    
    NetInfo.addEventListener(
        'connectionChange',
        (conInfo) => {
            if (conInfo.type === 'none' || 
                conInfo.type === 'unknown' || 
                conInfo.type === 'wifi' || 
                conInfo.type === 'cellular' || 
                conInfo.effectiveType === 'unknown') {
                    store.dispatch({
                        type: 'modify_coninfo_systemevents',
                        payload: conInfo
                    });
                }
        }
    );
};

export const initPushNotifs = async (store) => { 
    try {
        await FCM.createNotificationChannel({
            id: 'default',
            name: 'Default',
            description: 'used for example',
            priority: 'high'
        });

        await FCM.requestPermissions({
            badge: true,
            sound: true,
            alert: true
        });

        await FCM.getFCMToken().then(token => {
            if (token) {
                AsyncStorage.setItem(mappedKeyStorage('userNotifToken'), token); 
            }
        });
    } catch (e) {
        console.log(e);
    }

    try {
        const firstNotif = await FCM.getInitialNotification();

        if (firstNotif && firstNotif.opened_from_tray) {
            if ((firstNotif.targetScreen && firstNotif.targetScreen === 'enquetes') ||
            (
                firstNotif.local_notification && 
                firstNotif.title && 
                firstNotif.title.includes('enquete'))) {
                store.dispatch({
                    type: 'modifica_jumpscene_jogos',
                    payload: 'enquetes'
                });
            }
        }
    } catch (e) {
        console.log(e);
    }

    FCM.on(FCMEvent.Notification, notif => {
            if (notif && notif.opened_from_tray) {
                if ((notif.targetScreen && notif.targetScreen === 'enquetes') ||
                (
                    notif.local_notification && 
                    notif.title && 
                    notif.title.includes('enquete')
                )) {
                    if (!store.getState().JogosReducer.jumpScene) {
                        setTimeout(() => {
                            if (Actions.currentScene !== 'profileEnquetes') {
                                Actions.profileEnquetes();
                            }
                        }, 500);
                    }
                }
            }
            if (AppState.currentState === 'active') {
                if (Platform.OS === 'ios' && 
                notif._notificationType === NotificationType.WillPresent && 
                !notif.local_notification) {
                    // Bloco de customização para a notificação local ios
                    /*FCM.presentLocalNotification({
                        channel: 'default', 
                        title: 'Test Notification with action', 
                        body: notif.fcm.body, 
                        sound: 'default', 
                        priority: 'high', 
                        show_in_foreground: true,
                    });*/
                    notif.finish(WillPresentNotificationResult.All);
                } else if (Platform.OS === 'android') {
                    FCM.presentLocalNotification({
                        channel: 'default',
                        body: notif.fcm.body,
                        id: new Date().valueOf().toString(),
                        priority: 'high',
                        sound: 'default',
                        title: notif.fcm.title,
                        icon: 'ic_launcher',
                        large_icon: 'ic_launcher',
                        show_in_foreground: true,
                        vibrate: 300, 
                        lights: true,
                        targetScreen: notif.fcm.targetScreen
                    });
                }
            }
        }
    );

    FCM.on(FCMEvent.RefreshToken, (newToken) => {
        if (newToken) {
            AsyncStorage.setItem(mappedKeyStorage('userNotifToken'), newToken); 
        }
    });

    try {
        const loginAutomaticoEnabled = await AsyncStorage.getItem(
            mappedKeyStorage('loginAutomaticoEnabled')
        );

        if (!loginAutomaticoEnabled) {
            AsyncStorage.setItem(mappedKeyStorage('loginAutomaticoEnabled'), 'yes');
        }
    } catch (e) {
        console.log(e);
        AsyncStorage.setItem(mappedKeyStorage('loginAutomaticoEnabled'), 'yes');
    }
};

