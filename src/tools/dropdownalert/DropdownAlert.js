import React from 'react';
import DA from 'react-native-dropdownalert';
import { connect } from 'react-redux';

class DropdownAlert extends React.Component {
    componentDidUpdate = () => {
        const {
            dropdownAlert
        } = this.props;

        this.dropdown.alertWithType(
            dropdownAlert.type, 
            dropdownAlert.title, 
            dropdownAlert.message,
            dropdownAlert.interval
        );
    }

    render = () => <DA ref={ref => (this.dropdown = ref)} />
}

const mapStateToProps = state => ({
    dropdownAlert: state.SystemEventsReducer.dropdownAlert,
});

export default connect(mapStateToProps)(DropdownAlert);
