const INITIAL_STATE = {
    menuChoosed: 'Minhas Partidas'
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modify_menuchoosed_maindrawermenu':
            return { 
                ...state, 
                menuChoosed: action.payload
            };
        case 'modify_clean_maindrawermenu':
            return {
                ...state,
                menuChoosed: 'Minhas Partidas'
            };
        default:
            return state;
    }
};
