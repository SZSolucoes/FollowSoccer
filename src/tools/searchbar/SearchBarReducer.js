const INITIAL_STATE = {
    showInputText: false,
    searchValue: ''
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modify_showinputtext_searchbar':
            return { 
                ...state, 
                showInputText: action.payload
            };
        case 'modify_searchvalue_searchbar':
            return { 
                ...state, 
                searchValue: action.payload
            };
        case 'modify_clean_searchbar':
            return {
                ...state,
                showInputText: false,
                searchValue: ''
            };
        default:
            return state;
    }
};
