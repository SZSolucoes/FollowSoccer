import React from 'react';
import { 
    View,
    Text
} from 'react-native';

import { connect } from 'react-redux';
//import ObjExample from './ObjExample';

class Partidas extends React.Component {
    render = () => (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* <View style={{ flex: 1 }}>
                 <ObjExample onRenderObj={this.onRenderObj} />
            </View> */}
            <View 
                style={{ 
                    flex: 1, 
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center' 
                }}
            >
                <Text>Partidas</Text>
            </View>
        </View>
    )
}

const mapStateToProps = state => ({
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps)(Partidas);
