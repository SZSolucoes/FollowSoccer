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
import InfoReducer from './components/grupos/gerenciar/admin/informativos/InfoReducer';
import FinanceiroReducer from './components/grupos/gerenciar/admin/financeiro/FinanceiroReducer';
import EnquetesReducer from './components/grupos/gerenciar/admin/enquetes/EnquetesReducer';

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
    SearchBarReducer,
    InfoReducer,
    FinanceiroReducer,
    EnquetesReducer
});
