const INITIAL_STATE = {
    filterStr: '',
    filterLoad: false,
    itemSelected: '',
    listJogos: []
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_filterstr_historico':
            return { 
                ...state, 
                filterStr: action.payload
            };
        case 'modifica_filterload_historico':
            return { 
                ...state, 
                filterLoad: action.payload
            };
        case 'modifica_itemselected_historico':
            return { 
                ...state, 
                itemSelected: action.payload
            };
        case 'modifica_listJogos_historico':
            return { 
                ...state, 
                listJogos: [...action.payload]
            };
        case 'modifica_clean_historico':
            return {
                ...state,
                filterStr: '',
                filterLoad: false,
                itemSelected: '',
                listJogos: []
            };
        default:
            return state;
    }
};
