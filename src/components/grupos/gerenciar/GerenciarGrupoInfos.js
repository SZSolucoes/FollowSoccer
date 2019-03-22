import React from 'react';

import { connect } from 'react-redux';
import _ from 'lodash';
import Informativos from './infos/Informativos';
import firebase from '../../../utils/Firebase';
import { store } from '../../../App';

class GerenciarGrupoInfos extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseChildRef = null;

        this.state = {
            listInfos: []
        };
    }

    componentDidMount = () => {
        const { grupoSelectedKey } = this.props;

        if (grupoSelectedKey) {
            this.dbFirebaseChildRef = firebase
            .database().ref().child(`grupos/${grupoSelectedKey}/informativos`);
    
            this.dbFirebaseChildRef.on('value', snap => {
                if (snap) {
                    const snapVal = snap.val();
                    if (snapVal) {
                        const filtredVal = _.pickBy(snapVal, ita => !ita.push);
                        const mapped = _.map(
                            filtredVal, 
                            (value, key) => ({ key, ...value, groupkey: grupoSelectedKey })
                        );
                        this.setState({ 
                            listInfos: mapped
                        });

                        store.dispatch({
                            type: 'modifica_listinfos_info',
                            payload: mapped
                        });

                        return;
                    }
                }

                this.setState({ 
                    listInfos: []
                });

                store.dispatch({
                    type: 'modifica_listinfos_info',
                    payload: []
                });
            });
        }
    }

    componentWillUnmount() {
        if (this.dbFirebaseChildRef) {
            this.dbFirebaseChildRef.off();
        }
    }

    render = () => (<Informativos listInfos={this.state.listInfos} />)
}

const mapStateToProps = (state) => ({
    grupoSelectedKey: state.GruposReducer.grupoSelectedKey
});

export default connect(mapStateToProps)(GerenciarGrupoInfos);
