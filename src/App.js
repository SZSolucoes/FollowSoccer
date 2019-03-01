
import React from 'react';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { initConfigs, initPushNotifs } from './utils/InitConfigs';

import Routes from './Routes';
import Reducers from './Reducers';
//import { doActiveRNFetchBlob } from './utils/utilsTools';

export const store = createStore(Reducers, {}, applyMiddleware(ReduxThunk));

initConfigs(store);
initPushNotifs(store);
//doActiveRNFetchBlob(true);

class App extends React.Component {
    render = () => (
        <Provider store={store}>
            <Routes />
        </Provider>
    )
}

export default App;
