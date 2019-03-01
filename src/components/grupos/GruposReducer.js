const INITIAL_STATE = {
    grupoSelected: {},
    grupoParticipantes: []
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_gruposelected_grupos':
            return { 
                ...state, 
                grupoSelected: { ...action.payload }
            };
        case 'modifica_grupoparticipantes_grupos':
            return { 
                ...state, 
                grupoParticipantes: [...action.payload]
            };
        case 'modifica_clean_grupos':
            return {
                ...state,
                grupoSelected: {},
                grupoParticipantes: []
            };
        default:
            return state;
    }
};
