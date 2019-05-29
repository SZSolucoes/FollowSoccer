import React from 'react';
import { 
    View, 
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import ListItem from '../../../../../tools/elements/ListItem';
import Card from '../../../../../tools/elements/Card';
import { colorAppSecondary } from '../../../../../utils/Constantes';

class FinanceiroMenu extends React.Component {
    render() {
        return (
            <View style={styles.mainView}>
                <TouchableOpacity
                    onPress={
                        () => Actions.financeiroAdmin(
                            { onBack: () => Actions.popTo('adminFinanceiroMenu') }
                        )
                    }
                >
                    <Card>
                        <ListItem
                            title='Grupo'
                            chevronColor={colorAppSecondary}
                            leftIcon={{ 
                                name: 'cash-multiple', 
                                type: 'material-community', 
                                size: 35, 
                                color: colorAppSecondary 
                            }}
                            titleStyle={{ fontSize: 20, fontWeight: '400' }}
                            containerStyle={{ borderBottomWidth: 0 }}
                        />
                    </Card>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={
                        () => Actions.adminFinanceiroJogadores()
                    }
                >
                    <Card>
                        <ListItem
                            title='Jogadores'
                            chevronColor={colorAppSecondary}
                            leftIcon={{ 
                                name: 'account-multiple', 
                                type: 'material-community', 
                                size: 35, 
                                color: colorAppSecondary 
                            }}
                            titleStyle={{ fontSize: 20, fontWeight: '400' }}
                            containerStyle={{ borderBottomWidth: 0 }}
                        />
                    </Card>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    }
});

const mapStateToProps = () => ({
});

export default connect(mapStateToProps, {})(FinanceiroMenu);
