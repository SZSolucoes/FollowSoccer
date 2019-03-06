import React, { Component } from 'react';
import {
  Clipboard,
  ToastAndroid,
  AlertIOS,
  Platform
} from 'react-native';
import Share, { ShareSheet, Button } from 'react-native-share';
import { 
    TWITTER_ICON, 
    FACEBOOK_ICON, 
    WHATSAPP_ICON, 
    GOOGLE_PLUS_ICON, 
    EMAIL_ICON, 
    PINTEREST_ICON, 
    CLIPBOARD_ICON, 
    MORE_ICON 
} from '../../utils/Constantes';

export default class ShareModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false
        };
    }

    onCancel = () => {
        this.setState({ visible: false });
    }

    onOpen = () => {
        this.setState({ visible: true });
    }

    render = () => {
        const {
            visible,
            shareOptions,
            twitter,
            facebook,
            whatsapp,
            googleplus,
            email,
            pinterest,
            clipboard,
            more
        } = this.props;
        
        if (!shareOptions) return false;

        return (
            <ShareSheet visible={this.state.visible || visible} onCancel={this.onCancel}>
                {
                    !!twitter &&
                    <Button 
                        iconSrc={{ uri: TWITTER_ICON }}
                        onPress={() => {
                            this.onCancel();
                            setTimeout(() => {
                                Share.shareSingle(Object.assign(shareOptions, {
                                    social: 'twitter'
                                }));
                            }, 300);
                        }}
                    >
                        Twitter
                    </Button>
                }
                {
                    !!facebook &&
                    <Button 
                        iconSrc={{ uri: FACEBOOK_ICON }}
                        onPress={() => {
                            this.onCancel();
                            setTimeout(() => {
                                Share.shareSingle(Object.assign(shareOptions, {
                                    social: 'facebook'
                                }));
                            }, 300);
                        }}
                    >
                        Facebook
                    </Button>
                }
                {
                    !!whatsapp &&
                    <Button 
                        iconSrc={{ uri: WHATSAPP_ICON }}
                        onPress={() => {
                            this.onCancel();
                            setTimeout(() => {
                                Share.shareSingle(Object.assign(shareOptions, {
                                    social: 'whatsapp'
                                }));
                            }, 300);
                        }}
                    >
                        Whatsapp
                    </Button>
                }
                {
                    !!googleplus &&
                    <Button 
                        iconSrc={{ uri: GOOGLE_PLUS_ICON }}
                        onPress={() => {
                            this.onCancel();
                            setTimeout(() => {
                                Share.shareSingle(Object.assign(shareOptions, {
                                    social: 'googleplus'
                                }));
                            }, 300);
                        }}
                    >
                        Google +
                    </Button>
                }
                {
                    !!email &&
                    <Button 
                        iconSrc={{ uri: EMAIL_ICON }}
                        onPress={() => {
                            this.onCancel();
                            setTimeout(() => {
                                Share.shareSingle(Object.assign(shareOptions, {
                                    social: 'email'
                                }));
                            }, 300);
                        }}
                    >
                        Email
                    </Button>
                }
                {
                    !!pinterest &&
                    <Button 
                        iconSrc={{ uri: PINTEREST_ICON }}
                        onPress={() => {
                            this.onCancel();
                            setTimeout(() => {
                                Share.shareSingle(Object.assign(shareOptions, {
                                    social: 'pinterest'
                                }));
                            }, 300);
                        }}
                    >
                        Pinterest
                    </Button>
                }
                {
                    !!clipboard &&
                    <Button
                        iconSrc={{ uri: CLIPBOARD_ICON }}
                        onPress={() => {
                            this.onCancel();
                            setTimeout(() => {
                                if (shareOptions.url) {
                                    Clipboard.setString(shareOptions.url);
                                    if (Platform.OS === 'android') {
                                        ToastAndroid.show(
                                            'Link copiado', 
                                            ToastAndroid.SHORT
                                        );
                                    } else if (Platform.OS === 'ios') {
                                        AlertIOS.alert(
                                            'Link copiado'
                                        );
                                    }
                                }
                            }, 300);
                        }}
                    >
                        Copiar link
                    </Button>
                }
                {
                    !!more &&
                    <Button 
                        iconSrc={{ uri: MORE_ICON }}
                        onPress={() => {
                            this.onCancel();
                            setTimeout(() => {
                                Share.open(shareOptions);
                            }, 300);
                        }}
                    >
                        Mais
                    </Button>
                }
            </ShareSheet>
        );
    }
}

