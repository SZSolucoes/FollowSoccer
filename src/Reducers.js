/* eslint-disable max-len */
import { combineReducers } from 'redux';

import SystemEventsReducer from './tools/systemevents/SystemEventsReducer';
import LoginReducer from './components/login/LoginReducer';
import MainDrawerMenuReducer from './components/drawersmenu/MainDrawerMenuReducer';
import ProfileReducer from './components/profile/ProfileReducer';
import InfosReducer from './components/grupos/gerenciar/infos/InfosReducer';
import JogosReducer from './components/grupos/gerenciar/jogos/JogosReducer';
import CadastroJogosReducer from './components/grupos/gerenciar/admin/cadastrojogos/CadastroJogosReducer';
import GruposReducer from './components/grupos/GruposReducer';
import JogoReducer from './components/grupos/gerenciar/jogos/JogoReducer';
import HistoricoReducer from './components/grupos/gerenciar/jogos/HistoricoReducer';
import GerenciarReducer from './components/grupos/gerenciar/admin/gerenciar/GerenciarReducer';
import ImagensJogosReducer from './components/grupos/gerenciar/admin/gerenciar/ImagensJogosReducer';
import SearchBarReducer from './tools/searchbar/SearchBarReducer';

export default combineReducers({
    SystemEventsReducer,
    LoginReducer,
    MainDrawerMenuReducer,
    ProfileReducer,
    InfosReducer,
    JogosReducer,
    CadastroJogosReducer,
    GruposReducer,
    JogoReducer,
    HistoricoReducer,
    GerenciarReducer,
    ImagensJogosReducer,
    SearchBarReducer
});
