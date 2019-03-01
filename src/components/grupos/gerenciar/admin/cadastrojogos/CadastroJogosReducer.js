const INITIAL_STATE = {
    filterStr: '',
    filterLoad: false
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_filterstr_cadastrojogos':
            return { 
                ...state, 
                filterStr: action.payload
            };
        case 'modifica_filterload_cadastrojogos':
            return { 
                ...state, 
                filterLoad: action.payload
            };
        case 'modifica_clean_cadastrojogos':
            return {
                ...state,
                filterStr: '',
                filterLoad: false
            };
        default:
            return state;
    }
};
