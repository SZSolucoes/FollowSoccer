const INITIAL_STATE = {
    jogoSelected: '',
    currentTime: 0,
    showTimerModal: false
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_jogoselected_jogo':
            return { 
                ...state, 
                jogoSelected: action.payload
            };
        case 'modifica_currenttime_jogo':
            return { 
                ...state, 
                currentTime: action.payload
            };
        case 'modifica_showtimermodal_jogo':
            return { 
                ...state, 
                showTimerModal: action.payload
            };
        case 'modifica_clean_jogo':
            return {
                ...state,
                jogoSelected: '',
                currentTime: 0,
                showTimerModal: false
            };
        default:
            return state;
    }
};
