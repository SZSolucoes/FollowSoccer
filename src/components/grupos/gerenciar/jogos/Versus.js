import React from 'react';
import { 
    View,
    StyleSheet,
    Image
} from 'react-native';

import { connect } from 'react-redux';
import { Text } from 'react-native-elements';
import { shirtColors } from '../../../../utils/Constantes';
import imgX from '../../../../assets/imgs/imgx.png';

class Versus extends React.PureComponent {
    render() {
        const { jogo, placarCasa, placarVisit } = this.props;
        return (
            <View style={styles.viewPrinc}>
                <Image 
                    source={
                        shirtColors[jogo.homeshirt] || shirtColors.white
                    }
                    style={styles.imgBrasao} 
                />
                <Text h1 style={styles.text}>
                    {placarCasa || '0'}
                </Text>
                <Image 
                    source={imgX} 
                    style={{ resizeMode: 'contain', flex: 0.7, width: 20, height: 20 }} 
                />
                <Text h1 style={styles.text}>
                    {placarVisit || '0'}
                </Text>
                <Image 
                    source={
                        shirtColors[jogo.visitshirt] || shirtColors.blue
                    }
                    style={styles.imgBrasao} 
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'white'
    },
    imgBrasao: { 
        resizeMode: 'contain', 
        flex: 1, 
        width: 50, 
        height: 60 
    },
    text: { 
        color: 'black',
        fontWeight: '400' 
    }
});

const mapStateToProps = () => ({
    
});

export default connect(mapStateToProps, {})(Versus);
