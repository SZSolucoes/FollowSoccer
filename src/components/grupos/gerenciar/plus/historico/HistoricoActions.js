
export const modificaItemSelected = (value) => ({
    type: 'modifica_itemselected_historico',
    payload: value
});

export const modificaFilterStr = (value) => ({
    type: 'modifica_filterstr_historico',
    payload: value
});

export const modificaFilterLoad = (value) => ({
    type: 'modifica_filterload_historico',
    payload: value
});

export const modificaListJogos = (value) => ({
    type: 'modifica_listJogos_historico',
    payload: value
});

export const modificaClean = () => ({
    type: 'modifica_clean_historico'
});

