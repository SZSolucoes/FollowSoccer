

export const modificaFilterStr = (value) => ({
    type: 'modifica_filterstr_cadastrojogos',
    payload: value
});

export const modificaFilterLoad = (value) => ({
    type: 'modifica_filterload_cadastrojogos',
    payload: value
});

export const modificaClean = () => ({
    type: 'modifica_clean_cadastrojogos'
});

