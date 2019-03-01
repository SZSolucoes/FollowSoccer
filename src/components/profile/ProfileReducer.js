const INITIAL_STATE = {
    enqueteProps: {},
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_enqueteprops_profile':
            return { 
                ...state, 
                enqueteProps: { ...action.payload }
            };
        case 'modifica_clean_profile':
            return {
                ...state,
                enqueteProps: {}
            };
        default:
            return state;
    }
};
