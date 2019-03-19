const INITIAL_STATE = {
    showModal: false,
    filterModalStr: '',
    filterModalLoad: false
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_showmodal_analisejogadores':
            return { 
                ...state, 
                showModal: action.payload
            };
        case 'modifica_filtermodalstr_analisejogadores':
            return { 
                ...state, 
                filterModalStr: action.payload
            };
        case 'modifica_filtermodalload_analisejogadores':
            return { 
                ...state, 
                filterModalLoad: action.payload
            };
        case 'modifica_clean_analisejogadores':
            return {
                ...state,
                showModal: false,
                filterModalStr: '',
                filterModalLoad: false
            };
        default:
            return state;
    }
};
