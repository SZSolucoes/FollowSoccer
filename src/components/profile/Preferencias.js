import React from 'react';
import { 
    View, 
    StyleSheet,
    AsyncStorage
} from 'react-native';

import { connect } from 'react-redux';
import { CheckBox, List } from 'react-native-elements';
import { checkConInfo } from '../../utils/SystemEvents';
import { mappedKeyStorage } from '../../utils/Storage';
import ListItem from '../../tools/elements/ListItem';

class Preferencias extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loginAutomaticoEnabled: false
        };
    }

    componentDidMount = () => {
        AsyncStorage
        .getItem(mappedKeyStorage('loginAutomaticoEnabled')).then((value) => {
            if (value && value === 'yes') {
                this.setState({ loginAutomaticoEnabled: true });
            }
        });
    }

    onPressCheck = (checkName) => {
        if (checkName === 'loginautomatico') {
            if (this.state.loginAutomaticoEnabled) {
                AsyncStorage
                .setItem(mappedKeyStorage('loginAutomaticoEnabled'), 'no').then(() => {
                    this.setState({ loginAutomaticoEnabled: false });
                });
            } else {
                AsyncStorage
                .setItem(mappedKeyStorage('loginAutomaticoEnabled'), 'yes').then(() => {
                    this.setState({ loginAutomaticoEnabled: true });
                });
            }
        }
    }

    render = () => {
        return (
            <View style={styles.viewPrinc}>
                <List>
                    <ListItem
                        title='Login automático'
                        subtitle={
                            'Salvar usuário e senha para entrada automática.'
                        }
                        subtitleNumberOfLines={5}
                        rightIcon={(
                            <CheckBox
                                title={this.state.loginAutomaticoEnabled ? 'Ativo  ' : 'Inativo'}
                                checked={this.state.loginAutomaticoEnabled}
                                onPress={() => 
                                    checkConInfo(() => this.onPressCheck('loginautomatico'))
                                }
                            />
                        )}
                    />
                </List>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    }
});

const mapStateToProps = () => ({
});

export default connect(mapStateToProps, {})(Preferencias);
