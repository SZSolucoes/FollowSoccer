import React from 'react';
import {
    View,
    ScrollView, 
    StyleSheet
} from 'react-native';

import { connect } from 'react-redux';
import _ from 'lodash';

import ProfileEnquetesCard from './ProfileEnquetesCard';

class ProfileEnquetes extends React.Component {

    render() {
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
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {})(ProfileEnquetes);
