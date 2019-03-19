import React from 'react';
import {
    View,
    ScrollView, 
    StyleSheet
} from 'react-native';

import { connect } from 'react-redux';
import _ from 'lodash';

import {
    modificaEnquetes
} from '../../admin/enquetes/EnquetesActions';
import ProfileEnquetesCard from './ProfileEnquetesCard';
import firebase from '../../../../../utils/Firebase';

class ProfileEnquetes extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
        this.enquetesListener = null;
    }
    
    componentDidMount = () => {
        const { grupoSelected } = this.props;

        if (grupoSelected && grupoSelected.key) {
            this.enquetesListener = this.dbFirebaseRef
            .child(`grupos/${grupoSelected.key}/enquetes`);

            this.enquetesListener.on('value', (snapshot) => {
                let snapVal = null;
                
                if (snapshot) {
                    snapVal = snapshot.val();

                    if (snapVal) {
                        const enquetesList = _.map(
                            snapshot.val(), (value, key) => ({ key, ...value })
                        );
        
                        // LISTA DE TODAS AS ENQUETES
                        this.props.modificaEnquetes(enquetesList);
    
                        return;
                    }
                }
    
                this.props.modificaEnquetes([]);
            });
        }
    }

    componentWillUnmount = () => {
        if (this.enquetesListener) this.enquetesListener.off();
    }

    render = () => {
        const openEnqts = _.reverse(_.filter(this.props.enquetes, en => en.status === '1'));
        let enquetesCard = [];

        enquetesCard = _.map(openEnqts, (enqt, index) => {
            const isResult = _.findIndex(
                enqt.votos, vot => vot.key && vot.key === this.props.userLogged.key
            ) !== -1;

            return (
                <ProfileEnquetesCard
                    key={index}
                    enquete={enqt}
                    isResult={isResult}
                    userKey={this.props.userLogged.key}
                    grupoSelected={this.props.grupoSelected}
                />
            );
        });

        return (
            <ScrollView style={styles.viewPrinc}>
                { enquetesCard }
                <View style={{ marginVertical: 50 }} />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    }
});

const mapStateToProps = (state) => ({
    enquetes: state.EnquetesReducer.enquetes,
    userLogged: state.LoginReducer.userLogged,
    grupoSelected: state.GruposReducer.grupoSelected
});

export default connect(mapStateToProps, { modificaEnquetes })(ProfileEnquetes);
