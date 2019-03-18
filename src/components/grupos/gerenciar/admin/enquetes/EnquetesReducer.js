const INITIAL_STATE = {
    enquetes: [],
    itemSelected: {},
    filterStr: '',
    filterLoad: false,
    flagRemoveEnquetes: false,
    flagEndEnquetes: false,
    titulo: '',
    opts: [''],
    itemEditModal: {}
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_enquetes_enquetes':
            return { 
                ...state, 
                enquetes: [...action.payload] 
            };
        case 'modifica_filterstr_enquetes':
            return { 
                ...state, 
                filterStr: action.payload
            };
        case 'modifica_filterload_enquetes':
            return { 
                ...state, 
                filterLoad: action.payload
            };
        case 'modifica_itemselected_enquetes':
            return { 
                ...state, 
                itemSelected: { ...action.payload }
            };
        case 'modifica_flagremoveenquetes_enquetes':
            return { 
                ...state, 
                flagRemoveEnquetes: action.payload
            };
        case 'modifica_flagendenquetes_enquetes':
            return { 
                ...state, 
                flagEndEnquetes: action.payload
            };
        case 'modifica_titulomodal_enquetes':
            return { 
                ...state, 
                titulo: action.payload
            };
        case 'modifica_optsmodal_enquetes':
            return { 
                ...state, 
                opts: [...action.payload]
            };
        case 'modifica_itemeditmodal_enquetes':
            return { 
                ...state, 
                itemEditModal: { ...action.payload }
            };
        case 'modifica_clean_enquetes':
            return {
                ...state,
                filterStr: '',
                filterLoad: false
            };
        default:
            return state;
    }
};
