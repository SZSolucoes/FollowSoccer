
export const modificaJogoSelected = (value) => ({
    type: 'modifica_jogoselected_jogo',
    payload: value
});

export const modificaClean = () => ({
    type: 'modifica_clean_jogo'
});

export const modificaCurrentTime = (value) => ({
    type: 'modifica_currenttime_jogo',
    payload: value
});

export const modificaShowTimerModal = (value) => ({
    type: 'modifica_showtimermodal_jogo',
    payload: value
});

