import React from 'react';
import { 
    View, 
    StyleSheet
} from 'react-native';

import { connect } from 'react-redux';
import { List, Button } from 'react-native-elements';
//import { checkConInfo } from '../../../../utils/jogosUtils';
import ListItem from '../../../../../tools/elements/ListItem';
import AcumFaltas from './AcumFaltas';
import {
    modificaShowModal,
} from './AnaliseJogadoresActions';

class AnaliseJogadores extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loginAutomaticoEnabled: false
        };
    }

    render = () => (
        <View style={styles.viewPrinc}>
            <List>
                <ListItem
                    title='Acúmulo de faltas'
                    subtitle={
                        'Jogadores com faltas acumuladas por partidas seguidas.' +
                        ' A contagem é zerada após a presença em uma partida recente.'
                    }
                    subtitleNumberOfLines={10}
                    rightIcon={(
                        <Button 
                            title='Listar jogadores' 
                            onPress={() => this.props.modificaShowModal(true)} 
                        />
                    )}
                />
            </List>
            <AcumFaltas 
                showModal={this.props.showModal}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    }
});

const mapStateToProps = (state) => ({
    showModal: state.AnaliseJogadoresReducer.showModal
});

export default connect(mapStateToProps, {
    modificaShowModal
})(AnaliseJogadores);
