
export const modificaJogoSelected = (jogo) => ({
    type: 'modifica_jogoselected_imagensjogos',
    payload: jogo
});

export const modificaShowImageView = (value) => ({
    type: 'modifica_showimageview_imagensjogos',
    payload: value
});

export const modificaClean = () => ({
    type: 'modifica_clean_imagensjogos'
});

