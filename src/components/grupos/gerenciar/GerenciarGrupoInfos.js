import React from 'react';

import { connect } from 'react-redux';
import _ from 'lodash';
import Informativos from './infos/Informativos';
import firebase from '../../../utils/Firebase';

class GerenciarGrupoInfos extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseChildRef = null;

        this.state = {
            listInfos: []
        };
    }

    componentDidMount = () => {
        const { grupoSelected } = this.props;

        if (grupoSelected) {
            this.dbFirebaseChildRef = firebase
            .database().ref().child(`grupos/${grupoSelected.key}/informativos`);
    
            this.dbFirebaseChildRef.on('value', snap => {
                if (snap) {
                    const snapVal = snap.val();
                    if (snapVal) {
                        const filtredVal = _.pickBy(snapVal, ita => !ita.push);
                        this.setState({ 
                            listInfos: _.map(
                                filtredVal, 
                                (value, key) => ({ key, ...value, groupkey: grupoSelected.key })
                            )
                        });
                    }
                }
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
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps)(GerenciarGrupoInfos);
