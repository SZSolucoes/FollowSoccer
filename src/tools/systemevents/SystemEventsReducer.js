const INITIAL_STATE = {
    conInfo: {},
    dropdownAlert: {
        type: '',
        title: '',
        message: ''
    }
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modify_coninfo_systemevents':
            return { 
                ...state, 
                conInfo: { ...action.payload }
            };
        case 'modify_dropdownalert_systemevents':
            return { 
                ...state, 
                dropdownAlert: { ...state.dropdownAlert, ...action.payload }
            };
        case 'modify_clean_systemevents':
            return {
                ...state,
                conInfo: {},
                dropdownAlert: {
                    type: '',
                    title: '',
                    message: ''
                }            
            };
        default:
            return state;
    }
};
