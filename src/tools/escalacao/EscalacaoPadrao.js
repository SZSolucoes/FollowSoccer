import React from 'react';
import {
    TouchableOpacity,
    View,
    Text
} from 'react-native';
import { connect } from 'react-redux';
import { 
    modificaShowPlayersModal,
    modificaJogador
} from '../../components/grupos/gerenciar/admin/gerenciar/GerenciarActions';
import { checkConInfo } from '../../utils/SystemEvents';

class EscalacaoPadrao extends React.Component {

    constructor(props) {
        super(props);

        this.onTouchAddPlayerBtn = this.onTouchAddPlayerBtn.bind(this);
        this.checkConInfoTouchPlayer = this.checkConInfoTouchPlayer.bind(this);
    }

    onTouchAddPlayerBtn(side) {
        return checkConInfo(() => this.checkConInfoTouchPlayer(side)); 
    }

    checkConInfoTouchPlayer(side) {
        const newJogador = {
            key: '',
            nome: '',
            posicao: '',
            posvalue: 'default',
            imgAvatar: '',
            side,
            vitorias: '0',
            derrotas: '0',
            empates: '0',
            jogosEscalados: '0'
        };

        this.props.modificaJogador(newJogador);
        this.props.modificaShowPlayersModal(true);
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View 
                    style={{ 
                        marginTop: 15,
                        paddingHorizontal: 5
                    }}
                >
                    <TouchableOpacity
                        onPress={() => this.onTouchAddPlayerBtn(this.props.side)}
                    >
                        <View 
                            style={{
                                flexDirection: 'row', 
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#9E9E9E',
                                borderRadius: 5,
                                padding: 10
                            }}
                        >
                            <Text 
                                style={{ 
                                    color: 'white',
                                    fontSize: 16, 
                                    fontWeight: '500',
                                }}
                            >
                                Adicionar jogador
                            </Text> 
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const mapStateToProps = () => ({
});

export default connect(mapStateToProps, {
    modificaShowPlayersModal,
    modificaJogador
})(EscalacaoPadrao);
