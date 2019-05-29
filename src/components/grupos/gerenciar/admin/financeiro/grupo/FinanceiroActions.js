
export const modificaFilterStr = (value) => ({
    type: 'modifica_filterstr_analisefina',
    payload: value
});

export const modificaFilterLoad = (value) => ({
    type: 'modifica_filterload_analisefina',
    payload: value
});

export const modificaItemSelected = (value) => ({
    type: 'modifica_itemselected_analisefina',
    payload: value
});

export const modificaFlagRemoveAnaliseFina = (value) => ({
    type: 'modifica_flagremoveanalisefina_analisefina',
    payload: value
});

export const modificaClean = () => ({
    type: 'modifica_clean_analisefina'
});

