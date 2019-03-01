const INITIAL_STATE = {
    username: '',
    password: '',
    userToken: '',
    modalVisible: false,
    urlServer: '',
    hidePw: true,
    showLogoLogin: true,
    indicator: false,
    userLogged: {},
    userLevel: '1',
    conInfo: '',
    hideTabBar: false
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modify_username_login':
            return { 
                ...state, 
                username: action.payload 
            };
        case 'modify_password_login':
            return { 
                ...state, 
                password: action.payload 
            };
        case 'modify_hidepw_login':
            return { 
                ...state, 
                hidePw: action.payload 
            };
        case 'modify_modalvisible_login':
            return { 
                ...state, 
                modalVisible: action.payload 
            };
        case 'modify_usertoken_login':
            return { 
                ...state, 
                userToken: action.payload 
            };
        case 'modify_urlserver_login':
            return {
                ...state,
                urlServer: action.payload,
            };
        case 'modify_showlogologin_login':
            return {
                ...state,
                showLogoLogin: action.payload,
            };
        case 'modify_indicator_login':
            return {
                ...state,
                indicator: action.payload,
            };
        case 'modify_userlogged_login':
            return {
                ...state,
                userLogged: { ...action.payload },
            };
        case 'modify_userlevel_login':
            return {
                ...state,
                userLevel: action.payload
            };
        case 'modify_coninfo_login':
            return {
                ...state,
                conInfo: action.payload
            };
        case 'modify_hidetabbar_login':
            return {
                ...state,
                hideTabBar: action.payload
            };
        case 'modify_clean_login':
            return {
                ...state,
                username: '',
                password: '',
                modalVisible: false,
                hidePw: true,
                showLogoLogin: true,
                indicator: false,
                userLogged: {},
                userLevel: '1',
                conInfo: '',
                hideTabBar: false
            };
        default:
            return state;
    }
};
