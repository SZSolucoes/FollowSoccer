import React from 'react';
import firebase from '../../utils/Firebase';
import Avatar from '../../tools/elements/Avatar';

export default class AvatarSync extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();

        this.state = {
            imgAvatar: null
        };
    }

    componentDidMount = () => {
        const { keyUser } = this.props;

        const dbFirebaseChildRef = this.dbFirebaseRef.child(`usuarios/${keyUser}`);

        dbFirebaseChildRef.once('value', snap => {
            if (snap) {
                const snapVal = snap.val();
                if (snapVal) {
                    this.setState({ imgAvatar: { uri: snapVal.imgAvatar } });
                }
            }
        });
    }
    
    render = () => (
        <Avatar
            rounded
            width={30}
            source={this.state.imgAvatar}
            activeOpacity={0.7}
            containerStyle={{ margin: 5 }}
        />
    )
}

