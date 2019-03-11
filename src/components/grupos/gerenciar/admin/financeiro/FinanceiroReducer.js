const INITIAL_STATE = {
    listFina: [],
    itemSelected: {},
    filterStr: '',
    filterLoad: false,
    flagRemoveAnaliseFina: false,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_listfina_analisefina':
            return { 
                ...state, 
                listFina: [...action.payload] 
            };
        case 'modifica_filterstr_analisefina':
            return { 
                ...state, 
                filterStr: action.payload
            };
        case 'modifica_filterload_analisefina':
            return { 
                ...state, 
                filterLoad: action.payload
            };
        case 'modifica_itemselected_analisefina':
            return { 
                ...state, 
                itemSelected: { ...action.payload }
            };
        case 'modifica_flagremoveanalisefina_analisefina':
            return { 
                ...state, 
                flagRemoveAnaliseFina: action.payload
            };
        case 'modifica_clean_analisefina':
            return {
                ...state,
                filterStr: '',
                filterLoad: false
            };
        default:
            return state;
    }
};
