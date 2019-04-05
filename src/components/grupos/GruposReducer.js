const INITIAL_STATE = {
    grupoSelected: {},
    grupoSelectedKey: '',
    gruposListener: () => false,
    grupoParticipantes: [],
    showLoadingEndScore: false
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_gruposelected_grupos':
            return { 
                ...state, 
                grupoSelected: { ...action.payload }
            };
        case 'modifica_gruposelectedkey_grupos':
            return { 
                ...state, 
                grupoSelectedKey: action.payload
            };
        case 'modifica_gruposlistener_grupos':
            return { 
                ...state, 
                gruposListener: action.payload
            };
        case 'modifica_grupoparticipantes_grupos':
            return { 
                ...state, 
                grupoParticipantes: [...action.payload]
            };
        case 'modifica_showloadingendscore_grupos':
            return { 
                ...state, 
                showLoadingEndScore: action.payload
            };
        case 'modifica_clean_grupos':
            return {
                ...state,
                grupoSelected: {},
                grupoSelectedKey: '',
                gruposListener: () => false,
                grupoParticipantes: [],
                showLoadingEndScore: false
            };
        default:
            return state;
    }
};
