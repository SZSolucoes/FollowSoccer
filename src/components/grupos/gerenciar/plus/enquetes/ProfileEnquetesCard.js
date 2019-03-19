import React from 'react';
import { 
    View, 
    StyleSheet,
    Dimensions,
    Animated,
    Easing
} from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import { Circle, G, Line, Text, Svg } from 'react-native-svg';

import { connect } from 'react-redux';
import _ from 'lodash';
import { CheckBox, Button, Text as RNEText } from 'react-native-elements';
import { checkConInfo, showDropdownAlert } from '../../../../../utils/SystemEvents';
import { colorAppSecondary, colorAppPrimary, ERROS } from '../../../../../utils/Constantes';
import firebase from '../../../../../utils/Firebase';
import Card from '../../../../../tools/elements/Card';

class ProfileEnquetesCard extends React.Component {
    constructor(props) {
        super(props);

        this.opacityValue = new Animated.Value(1);

        this.state = {
            loading: false,
            optSelected: -1
        };
    }

    componentDidMount = () => {
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
    }

    onChangeDimensions = () => {
        this.onAnimChartOpacity();
    }

    onAnimChartOpacity = () => {
        this.opacityValue.setValue(0);
        setTimeout(() => {
            Animated.timing(
                this.opacityValue,
                {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear
                }
            ).start();
        }, 500);
    }

    onPressVotar = (enquete, userKey) => {
        const { optSelected } = this.state;
        const { grupoSelected } = this.props;
        const { votos } = enquete;
        const newVotos = [
            ...votos,
            {
                key: userKey,
                optVal: `${optSelected}`
            }
        ];

        if (optSelected === -1) {
            return;
        }

        this.setState({ loading: true });

        const databaseRef = firebase.database().ref();
        const dbEnquetes = databaseRef.child(`grupos/${grupoSelected.key}/enquetes/${enquete.key}`);

        dbEnquetes.update({
            votos: newVotos
        })
        .then(() => {
            showDropdownAlert(
                'info',
                'Seu voto foi efetuado',
                ''
            );
            this.setState({ loading: false });
        })
        .catch(() => {
            showDropdownAlert(
                'error',
                ERROS.enqueteVoting.erro,
                ERROS.enqueteVoting.mes
            );
            this.setState({ loading: false });
        });
    }

    renderEnqueteWithOpts = (enquete, userKey) => {
        const titulo = enquete.titulo || '';
        let viewOpts = [];

        viewOpts = _.map(enquete.opcoes, (opt, index) => (
            <CheckBox
                key={index}
                left
                title={opt}
                checkedIcon='dot-circle-o'
                uncheckedIcon='circle-o'
                checked={this.state.optSelected === index}
                onPress={() => this.setState({ optSelected: index })}
            />
        ));

        return (
            <Card 
                containerStyle={styles.card}
                title={titulo}
                titleStyle={{ color: 'black', fontSize: 15 }}
            >
                <View style={{ padding: 5 }}>
                    { viewOpts }
                </View>
                <View 
                    style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'center',
                        marginTop: 5 
                    }}
                >
                    <Button 
                        small
                        rounded
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loading ? ' ' : 'Votar'} 
                        buttonStyle={{ 
                            width: '100%', 
                            marginVertical: 10, 
                            backgroundColor: colorAppSecondary 
                        }}
                        onPress={
                            () => checkConInfo(() => this.onPressVotar(enquete, userKey))
                        }
                    />
                </View>
            </Card>
        );
    }

    renderEnqueteWithResult = (enquete, userKey) => {
        const titulo = enquete.titulo || '';
        const votos = _.groupBy(_.filter(enquete.votos, vts => !vts.push), 'optVal');
        const colors = [];
        const newOpcs = [];
        const numTotalVts = _.reduce(votos, (sum, item) => sum + item.length, 0);
        const userVote = _.find(enquete.votos, vtU => vtU.key && vtU.key === userKey);
        const innerRadius = this.props.isHistory ? 10 : 20;
        const outerRadius = this.props.isHistory ? 25 : 55;
        const labelRadius = this.props.isHistory ? 40 : 80;
        const startAngle = this.props.isHistory ? 40 : 80;
        const vHeight = this.props.isHistory ? 110 : 220;
        const rCircles = this.props.isHistory ? 9 : 19;
        const rCirclesFontText = this.props.isHistory ? 9 : 18;
        const rOptsCircles = this.props.isHistory ? 5 : 10;
        const rOptsText = this.props.isHistory ? 10 : 14;
        const rOptsTextVt = this.props.isHistory ? 10 : 14;

        const multiplier = this.props.isHistory ? 1.3 : 1;

        let newViewOpcs = null;

        const randomColor = () => 
        (`#${(Math.random() * 0xFFFFFF << 0).toString(16)}000000`).slice(0, 7);

        for (let index = 0; index < enquete.opcoes.length; index++) {
            let colorRd = randomColor();
            if (colors.includes(colorRd)) {
                while (colors.includes(colorRd)) {
                    colorRd = randomColor();
                }
            } 

            colors.push(colorRd);
        }

        for (let index = 0; index < enquete.opcoes.length; index++) {
            const indexKey = _.find(Object.keys(votos), vtIdx => `${vtIdx}` === `${index}`);
            if (indexKey) {
                newOpcs.push(
                    { 
                        idxKey: index, 
                        vtCount: votos[`${indexKey}`].length, 
                        color: colors[index],
                        text: enquete.opcoes[index]
                    }
                );
            } else {
                newOpcs.push({ 
                    idxKey: index, 
                    vtCount: 0, 
                    color: colors[index], 
                    text: enquete.opcoes[index] 
                });
            }
        }

        const pieData = newOpcs
            .filter(value => value.vtCount > 0)
            .map((value, index) => ({
                value: value.vtCount,
                svg: { fill: value.color },
                key: `pie-${index}`,
                amount: value.vtCount
        }));

        const Labels = ({ slices }) => slices.map((slice, index) => {
            const { labelCentroid, pieCentroid, data } = slice;
            return (
                <G key={index}>
                    <Line
                        x1={labelCentroid[0]}
                        y1={labelCentroid[1]}
                        x2={pieCentroid[0]}
                        y2={pieCentroid[1]}
                        stroke={data.svg.fill}
                    />
                    <Circle
                        cx={labelCentroid[0]}
                        cy={labelCentroid[1]}
                        r={rCircles * multiplier}
                        fill={data.svg.fill}
                    />
                    <Text
                        key={index}
                        x={labelCentroid[0]}
                        y={labelCentroid[1]}
                        fill={'white'}
                        textAnchor={'middle'}
                        alignmentBaseline={'middle'}
                        fontSize={rCirclesFontText * multiplier}
                        fontWeight={'bold'}
                        stroke={'black'}
                        strokeWidth={0.2}
                    >
                        {data.amount}
                    </Text>
                </G>
            );
        });

        newViewOpcs = _.map(newOpcs, (opcItem, index) => {
            const vtText = `${opcItem.vtCount} ${opcItem.vtCount === 1 ? 'Voto' : 'Votos'}`;
            const vtTextPerc = opcItem.vtCount ?
                ` ( ${Math.floor((opcItem.vtCount / numTotalVts) * 100)} % )`
                :
                '';

            return (
                <View
                    style={{
                        marginBottom: 10 
                    }}
                    key={index}
                >
                    <View 
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            marginBottom: 5,
                            flex: 1 
                        }}
                    >
                        <Svg
                            height={`${(rOptsCircles * 2) * multiplier}`}
                            width={`${(rOptsCircles * 2) * multiplier}`}
                        >
                            <G>
                                <Circle
                                    cx={rOptsCircles * multiplier}
                                    cy={rOptsCircles * multiplier}
                                    r={rOptsCircles * multiplier}
                                    fill={opcItem.color}
                                />
                            </G>
                        </Svg>
                        <View 
                            style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center',
                                paddingHorizontal: 10 
                            }}
                        >
                            <RNEText
                                style={{
                                    textAlign: 'left',
                                    fontWeight: '400',
                                    fontSize: rOptsText * multiplier
                                }}
                            >
                                {
                                    vtText + vtTextPerc
                                }
                            </RNEText>
                            {
                                userVote && userVote.optVal === `${index}` &&
                                (   
                                    <View
                                        style={{
                                            padding: 5
                                        }}
                                    >
                                        <View
                                            style={{
                                                backgroundColor: colorAppPrimary,
                                                borderRadius: 10,
                                                paddingHorizontal: 9,
                                                alignItems: 'center'
                                            }}
                                        >
                                            <RNEText
                                                style={{ 
                                                    color: 'white', 
                                                    fontWeight: '500',
                                                    fontSize: rOptsTextVt * multiplier
                                                }}
                                            >
                                                Seu voto
                                            </RNEText>
                                        </View>
                                    </View>
                                )
                            }
                        </View>
                    </View>
                    <View
                        style={{ paddingHorizontal: 9 }}
                    >
                        <RNEText
                            style={{
                                textAlign: 'left',
                                fontWeight: '600',
                                color: 'black',
                                fontSize: rOptsText * multiplier
                            }}
                        >
                            {opcItem.text}
                        </RNEText>
                    </View>
                </View>
            );
        });
                        
        return (
            <Card 
                containerStyle={styles.card}
                title={titulo}
                titleStyle={{ color: 'black', fontSize: 15 }}
            >
                { 
                    !!numTotalVts &&
                    (
                        <Animated.View
                            style={{
                                opacity: this.opacityValue
                            }}
                        >
                            <View 
                                style={{
                                    height: vHeight * multiplier
                                }}
                            >
                                <PieChart
                                    style={{ height: vHeight * multiplier, flex: 1 }}
                                    data={pieData}
                                    innerRadius={innerRadius * multiplier}
                                    outerRadius={outerRadius * multiplier}
                                    labelRadius={labelRadius * multiplier}
                                    startAngle={startAngle * multiplier}
                                >
                                    <Labels />
                                </PieChart>
                            </View>
                        </Animated.View>
                    )
                }
                {newViewOpcs}
            </Card>
        );
    }

    render = () => (
        this.props.isResult ? 
        this.renderEnqueteWithResult(
            this.props.enquete, 
            this.props.userKey, 
            this.props.isHistory
        ) 
        : 
        this.renderEnqueteWithOpts(this.props.enquete, this.props.userKey)
    )
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    },
    card: {
        paddingHorizontal: 10
    }
});

const mapStateToProps = () => ({
});

export default connect(mapStateToProps, {})(ProfileEnquetesCard);
