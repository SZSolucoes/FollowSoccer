import React from 'react';
import { Text } from 'react-native-elements';
import Card from '../../../../../tools/elements/Card';

export default class MuralItem extends React.PureComponent {
    render = () => (
        <Card
            title={this.props.item.titulo}
        >
            <Text
                style={{
                    fontWeight: '500'
                }}
            >
                {this.props.item.descricao}
            </Text>
        </Card>
    );
}
