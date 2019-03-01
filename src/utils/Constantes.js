import imgShirtWhite from '../assets/imgs/shirtwhite.png';
import imgShirtBlue from '../assets/imgs/shirtblue.png';
import imgShirtRed from '../assets/imgs/shirtred.png';
import imgShirtGreen from '../assets/imgs/shirtgreen.png';
import imgShirtYellow from '../assets/imgs/shirtyellow.png';

export const colorAppPrimary = '#004091';
export const colorAppSecondary = '#27A744';
export const colorAppTertiary = '#8F742E';
export const colorAppForeground = '#DCE0E4';
export const colorAppDark = '#2E3238';

export const BACKENDHOST = 'http://192.168.0.148:8014/';

export const ASSETSTYPES = {
    wavefront: 'wavefront',
    gltf: 'gltf',
    collada: 'collada',
    fbx: 'fbx'
};

export const shirtColors = {
    white: imgShirtWhite,
    blue: imgShirtBlue,
    red: imgShirtRed,
    green: imgShirtGreen,
    yellow: imgShirtYellow,
};

export const ERROS = {
    default: {
        erro: 'Erro #0001',
        mes: 'Ocorreu um erro inesperado. Verifique a conexão.'
    },
    semConexao: {
        erro: 'Erro #0002',
        mes: 'Sem conexão com a internet.'
    },
    userDisabled: {
        erro: 'Erro #0003',
        mes: 'Usuário desativado.'
    },
    emailNotFound: {
        erro: 'Erro #0004',
        mes: 'Email não cadastrado.'
    },
    emailInvalid: {
        erro: 'Erro #0005',
        mes: 'Email inválido.'
    },
    incorrectLogin: {
        erro: 'Erro #0006',
        mes: 'Email ou senha incorretos.'
    },
    cadUser: {
        erro: 'Erro #0007',
        mes: 'Ocorreu um erro ao cadastrar o usuário. Verifique a conexão.'
    },
    emailExists: {
        erro: 'Erro #0008',
        mes: 'E-mail já cadastrado.'
    },
    cadOff: {
        erro: 'Erro #0009',
        mes: 'Cadastro desabilitado no momento.'
    },
    passwordInsec: {
        erro: 'Erro #0010',
        mes: 'A senha informada é insegura.\nInforme uma senha de no mínimo 6 caracteres.'
    },
    cadGroup: {
        erro: 'Erro #0011',
        mes: 'Ocorreu um erro ao cadastrar o grupo.\nEntre em contato com o suporte.'
    },
    shareModalImage: {
        erro: 'Erro #0012',
        mes: 'Falha ao carregar imagem. Verifique a conexão.'
    },
    cadJogosDefault: {
        erro: 'Erro #0013',
        mes: 'Ocorreu um erro ao cadastrar o jogo.'
    },
    cadJogosEdit: {
        erro: 'Erro #0014',
        mes: 'Ocorreu um erro ao editar o jogo.'
    },
    jogoGIniciarPartida: {
        erro: 'Erro #0015',
        mes: 'Falha ao iniciar a partida. Verifique a conexão.'
    },
    jogoGPausarPartida: {
        erro: 'Erro #0016',
        mes: 'Falha ao pausar a partida. Verifique a conexão.'
    },
    jogoGReiniciarPartida: {
        erro: 'Erro #0017',
        mes: 'Falha ao reiniciar a partida. Verifique a conexão.'
    },
    jogoGMarcarGol: {
        erro: 'Erro #0018',
        mes: 'Falha ao marcar o gol. Verifique a conexão.'
    },
    jogoGRemoverGol: {
        erro: 'Erro #0019',
        mes: 'Falha ao remover o gol. Verifique a conexão.'
    },
    jogoGAplicarCartao: {
        erro: 'Erro #0020',
        mes: 'Falha ao aplicar cartão. Verifique a conexão.'
    },
    jogoGRemoverCartao: {
        erro: 'Erro #0021',
        mes: 'Falha ao remover cartão. Verifique a conexão.'
    },
    jogoGRemoverSubst: {
        erro: 'Erro #0022',
        mes: 'Falha ao remover substituição. Verifique a conexão.'
    },
    jogoGSubstJogador: {
        erro: 'Erro #0023',
        mes: 'Falha ao substituir jogador. Verifique a conexão.'
    },
    jogoGRemoveJogadorConfirm: {
        erro: 'Erro #0024',
        mes: 'Falha ao remover jogador confirmado. Verifique a conexão.'
    },
    jogoGEscalarJogador: {
        erro: 'Erro #0025',
        mes: 'Falha ao escalar jogador. Verifique a conexão.'
    },
    jogoGRemoverEscalacao: {
        erro: 'Erro #0026',
        mes: 'Falha ao remover escalação. Verifique a conexão.'
    },
    endGameContab: {
        erro: 'Erro #0027',
        mes: 'Falha ao contabilizar dados. Verifique a conexão.'
    },
    endGameFinaliz: {
        erro: 'Erro #0028',
        mes: 'Falha ao finalizar jogo. Verifique a conexão.'
    },
    endGameJogMissGame: {
        erro: 'Erro #0029',
        mes: 'Falha ao gravar falta de jogadores. Verifique a conexão.'
    }
};

