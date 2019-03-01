const INITIAL_STATE = {
    filterStr: '',
    filterLoad: false,
    itemSelected: '',
    missedPlayers: [],
    showPlayersModal: false,
    showPlayersModalJ: false,
    isSubstitute: false,
    filterModalStr: '',
    filterModalLoad: false,
    jogador: {},
    endGameModal: false,
    endGameModalPerc: 0,
    onItemRender: () => false
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_filterstr_gerenciar':
            return { 
                ...state, 
                filterStr: action.payload
            };
        case 'modifica_filterload_gerenciar':
            return { 
                ...state, 
                filterLoad: action.payload
            };
        case 'modifica_itemselected_gerenciar':
            return { 
                ...state, 
                itemSelected: action.payload
            };
        case 'modifica_missedplayers_gerenciar':
            return { 
                ...state, 
                missedPlayers: [...action.payload]
            };
        case 'modifica_showplayersmodal_gerenciar':
            return { 
                ...state, 
                showPlayersModal: action.payload
            };
        case 'modifica_showplayersmodalj_gerenciar':
            return { 
                ...state, 
                showPlayersModalJ: action.payload
            };
        case 'modifica_issubstitute_gerenciar':
            return { 
                ...state, 
                isSubstitute: action.payload
            };
        case 'modifica_filtermodalstr_gerenciar':
            return { 
                ...state, 
                filterModalStr: action.payload
            };
        case 'modifica_filtermodalload_gerenciar':
            return { 
                ...state, 
                filterModalLoad: action.payload
            };
        case 'modifica_endgamemodal_gerenciar':
            return { 
                ...state, 
                endGameModal: action.payload
            };
        case 'modifica_endgamemodalperc_gerenciar':
            return { 
                ...state, 
                endGameModalPerc: action.payload
            };
        case 'modifica_onitemrender_gerenciar':
            return { 
                ...state, 
                onItemRender: action.payload
            };
        case 'modifica_jogador_gerenciar':
            return { 
                ...state, 
                jogador: { ...action.payload }
            };
        case 'modifica_clean_gerenciar':
            return {
                ...state,
                filterStr: '',
                filterLoad: false,
                itemSelected: '',
                missedPlayers: [],
                showPlayersModal: false,
                showPlayersModalJ: false,
                isSubstitute: false,
                filterModalStr: '',
                filterModalLoad: false,
                jogador: {},
                endGameModal: false,
                endGameModalPerc: 0,
                onItemRender: () => false
            };
        default:
            return state;
    }
};
