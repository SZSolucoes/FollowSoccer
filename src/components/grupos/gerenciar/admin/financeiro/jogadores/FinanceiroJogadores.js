import React from 'react';
import {
    View
} from 'react-native';
import { connect } from 'react-redux';
import FinanceiroJogadoresTable from './FinanceiroJogadoresTable';

class FinanceiroJogadores extends React.Component {
    render = () => (
        <View style={{ flex: 1 }}>
            <FinanceiroJogadoresTable />
        </View>
    )
}

const mapStateToProps = () => ({});

export default connect(mapStateToProps)(FinanceiroJogadores);
