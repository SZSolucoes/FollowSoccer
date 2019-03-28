import React from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Linking,
    Animated,
    FlatList,
    ActivityIndicator,
    Platform,
    Keyboard,
    Dimensions,
    Modal
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Icon } from 'react-native-elements';
import ModalDropdown from 'react-native-modal-dropdown';
import ImageViewer from 'react-native-image-zoom-viewer';
import FastImage from 'react-native-fast-image';
import InfoActionsBar from './InfoActionsBar';
import Coment from './Coment';
import { 
    modificaStartUpOrDownAnim,
    modificaInfoMsgSelected,
    modificaAddNewRows,
    modificaLoadingFooter,
    modificaImagesForView,
    modificaShowImageView,
    modificaImagesForViewIndex,
    modificaInfoFilterStr,
    modificaInfoFilterLoad
} from './InfoActions';

import {  
    modificaAnimatedHeigth,
} from '../jogos/JogosActions';

import firebase from '../../../../utils/Firebase';
import { colorAppForeground, colorAppTertiary } from '../../../../utils/Constantes';
import ShareModal from './ShareModal';
import { isPortrait } from '../../../../utils/Screen';
import { normalize } from '../../../../utils/StrComplex';
import Avatar from '../../../../tools/elements/Avatar';
import ListItem from '../../../../tools/elements/ListItem';
import Card from '../../../../tools/elements/Card';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class Informativos extends React.Component {

    constructor(props) {
        super(props);

        this.dbFbRef = firebase.database().ref();
        this.KeyboardIsOpened = false;
        this.scrollCurrentOffset = 0;
        this.scrollViewContentSize = 0;
        this.scrollViewHeight = 0;
        this.fixedNumberRows = 30;

        this.fullHeight = 100;
        this.maxClamp = 100;
        this.minClamp = 0;

        this.state = {
            maxOffSetScrollView: 0,
            animTools: new Animated.Value(0),
            isPortraitMode: true,
            dropWidth: 0,
            maxWidth: isPortrait() ? Dimensions.get('screen').height
            : Dimensions.get('screen').width
        };

        this.scrollY = new Animated.Value(0);
        this.scrollX = new Animated.Value(0);

        this.clampedScroll = Animated.diffClamp(
            this.scrollY.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolateLeft: 'clamp'
            }).interpolate({
                inputRange: [0, this.fullHeight],
                outputRange: [-this.fullHeight, this.fullHeight],
                extrapolate: 'identity'
            }), 
            this.minClamp,
            this.maxClamp,
        );
        
        this.animBarValue = Animated.add(
            Animated.multiply(this.clampedScroll, -1),
            this.scrollY.interpolate({ 
                inputRange: [0, 1],
                outputRange: [0, -1],
            }).interpolate({
                inputRange: [-this.fullHeight, 0],
                outputRange: [0, this.minClamp],
                extrapolate: 'clamp'
            })
        );

        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardHide);
    }

    componentDidMount = () => {
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
    }

    onKeyboardShow = () => {
        this.KeyboardIsOpened = true;
    }
    
    onKeyboardHide = () => {
        this.KeyboardIsOpened = false;
    }
    
    onPressLikeBtn = (likeOrDeslike, item) => {
        const { userLogged } = this.props;
        const itemListLikes = item.listLikes ? item.listLikes : [];
        if (likeOrDeslike === 'like') {
            const isPushed = _.findIndex(
                itemListLikes, (itemInfo) => itemInfo.push && itemInfo.push === 'push'
            );
            let newArray = [];
            if (isPushed !== -1) {
                const auxArr = [...itemListLikes];
                if (isPushed !== -1) {
                    auxArr.splice(isPushed, 1);
                }
                newArray = [...auxArr, { key: userLogged.key }];
            } else {
                newArray = [...itemListLikes, { key: userLogged.key }];
            }
            this.dbFbRef
            .child(`grupos/${item.groupkey}/informativos/${item.key}`)
            .update({
                listLikes: newArray
            })
            .then(() => true)
            .catch(() => true); 
        } else {
            const newArray = [...itemListLikes];
            const indexPushed = _.findIndex(
                itemListLikes, (itemInfo) => itemInfo.key === userLogged.key
            );
            if (indexPushed !== -1) {
                newArray.splice(indexPushed, 1);
                if (newArray.length === 0) {
                    newArray.push({ push: 'push' });
                }
                this.dbFbRef
                .child(`grupos/${item.groupkey}/informativos/${item.key}`)
                .update({
                    listLikes: newArray
                })
                .then(() => true)
                .catch(() => true);
            }
        }
    }

    onPressImage = (imagesUri, index) => {
        if (imagesUri && imagesUri.length) {
            const imagesForView = _.map(imagesUri, imgU => ({ url: imgU.uri }));
            this.props.modificaImagesForViewIndex(index);
            this.props.modificaImagesForView(imagesForView);
            this.props.modificaShowImageView(true);
        }
    }

    onChangeDimensions = (dim) => {
        if (isPortrait()) {
            this.setState({ isPortraitMode: true, maxWidth: dim.screen.height });
        } else {
            this.setState({ isPortraitMode: false, maxWidth: dim.screen.width });
        }
    }

    onScrollView = (currentOffset, direction) => {
        if (!this.KeyboardIsOpened) {
            if (currentOffset <= 0 || direction === 'up') {
                this.props.modificaAnimatedHeigth(false);
            } else if (direction === 'down') {
                this.props.modificaAnimatedHeigth(true);
            } else {
                this.props.modificaAnimatedHeigth(false);
            }
        }
        //this.onScrollViewTools(currentOffset, direction);
    }

    onFilterInfos = (infos, filterStr) => {
        const lowerFilter = filterStr.toLowerCase();
        if (filterStr === 'Todo o Período') {
            return infos;
        }
        return _.filter(infos, (info) => (
                (info.dataPost && info.dataPost.toLowerCase().includes(lowerFilter))
        ));
    }

    addNewRows = (numberAdd) => {
        this.props.modificaAddNewRows(numberAdd);
        this.props.modificaLoadingFooter(false);
    }

    comentsUpOrDown = (upOrDown = 'down', info) => {
        if (upOrDown === 'up') {
            this.props.modificaInfoMsgSelected(info);
        } else {
            this.props.modificaInfoMsgSelected({});
        }
        this.props.modificaStartUpOrDownAnim(upOrDown);
    }

    dataSourceControl = (infos, filterStr) => {
        let newInfos = infos;
        if (infos && infos.length > 0) {
            newInfos = _.reverse([...infos]);
            newInfos = newInfos.slice(0, this.props.maxRows);
            return this.renderBasedFilterOrNot(newInfos, filterStr);
        }

        return newInfos;
    }

    flatListKeyExtractor = (item, index) => index.toString()

    renderBasedFilterOrNot = (infos, filterStr) => {
        let newInfos = infos;
        
        if (infos) {
            if (filterStr) {
                newInfos = this.onFilterInfos(infos, filterStr);
                if (!newInfos || newInfos.length === 0) {
                    setTimeout(() => this.props.modificaInfoFilterLoad(false), 1000);
                }
            }
            this.lastIndexListInfos = newInfos.length - 1;
        }

        return newInfos;
    }

    renderActions = (item) => (
        <InfoActionsBar 
            item={item} 
            comentsUpOrDown={(upOrDown, info) => this.comentsUpOrDown(upOrDown, info)}
            onPressLikeBtn={
                (likeOrDeslike, itemInfo) => this.onPressLikeBtn(likeOrDeslike, itemInfo)
            }
            userLogged={this.props.userLogged}
        />
    )

    renderArticle = (item) => {
        const imagesUri = [];
        const filtredImgs = _.filter(item.imgsArticle, x => !x.push);
        const hasImages = !!(filtredImgs && filtredImgs.length);

        if (hasImages) {
            filtredImgs.forEach(element => {
                imagesUri.push({ uri: element.data });
            });
        }

        return (
            <View 
                style={{
                    margin: 10
                }}
            >
                { 
                    hasImages && this.renderImages(imagesUri)
                }
                {
                    (!!item.textArticle || !!item.linkArticle) &&
                        <TouchableWithoutFeedback
                            onPress={
                                () => !!item.linkArticle && Linking.openURL(item.linkArticle) 
                            }
                        >
                            <View
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 5,
                                    borderLeftWidth: 1,
                                    borderRightWidth: 1,
                                    borderBottomWidth: 1,
                                    borderColor: colorAppForeground
                                }}
                            >
                                {
                                    !!item.textArticle &&
                                    <Text style={styles.textArticle}>
                                        { item.textArticle }
                                    </Text>
                                }
                                {
                                    !!item.linkArticle &&
                                    <Text style={{ color: '#A2A2A2' }}>
                                        { item.linkArticle }
                                    </Text>
                                }
                            </View>
                        </TouchableWithoutFeedback>
                }
               
            </View>
        );
    }

    renderImages = (imgsUri) => {
        const lenImages = imgsUri.length;

        if (lenImages === 1) {
            return (
                <TouchableWithoutFeedback
                    onPress={() => this.onPressImage(imgsUri, 0)}
                >
                    <FastImage
                        resizeMode={FastImage.resizeMode.cover}
                        style={{ 
                            width: null, 
                            height: 200,
                            borderRadius: 2
                        }}
                        source={imgsUri[0]}
                    />
                </TouchableWithoutFeedback>
            );
        } else if (lenImages === 2) {
            return (
                <View
                    style={{ flexDirection: 'row' }}
                >
                    <View style={{ flex: 1 }}>
                        <TouchableWithoutFeedback
                            onPress={() => this.onPressImage(imgsUri, 0)}
                        >
                            <FastImage
                                resizeMode={FastImage.resizeMode.cover}
                                style={{ 
                                    width: null, 
                                    height: 200,
                                    borderRadius: 2,
                                    marginRight: 5
                                }}
                                source={imgsUri[0]}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableWithoutFeedback
                            onPress={() => this.onPressImage(imgsUri, 1)}
                        >
                            <FastImage
                                resizeMode={FastImage.resizeMode.cover}
                                style={{ 
                                    width: null, 
                                    height: 200,
                                    borderRadius: 2
                                }}
                                source={imgsUri[1]}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            );
        } else if (lenImages === 3) {
            return (
                <View
                    style={{ flexDirection: 'row' }}
                >
                    <View style={{ flex: 1.8 }}>
                        <TouchableWithoutFeedback
                            onPress={() => this.onPressImage(imgsUri, 0)}
                        >
                            <FastImage
                                resizeMode={FastImage.resizeMode.cover}
                                style={{ 
                                    width: null, 
                                    height: 200,
                                    borderRadius: 2
                                }}
                                source={imgsUri[0]}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1 }}>
                            <TouchableWithoutFeedback
                                onPress={() => this.onPressImage(imgsUri, 1)}
                            >
                                <FastImage
                                    resizeMode={FastImage.resizeMode.cover}
                                    style={{ 
                                        width: null, 
                                        height: 98,
                                        borderRadius: 2,
                                        marginLeft: 2
                                    }}
                                    source={imgsUri[1]}
                                />
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableWithoutFeedback
                                onPress={() => this.onPressImage(imgsUri, 2)}
                            >
                                <FastImage
                                    resizeMode={FastImage.resizeMode.cover}
                                    style={{ 
                                        width: null, 
                                        height: 98,
                                        borderRadius: 2,
                                        marginLeft: 2,
                                        marginTop: 1
                                    }}
                                    source={imgsUri[2]}
                                />
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View
                style={{ flexDirection: 'row' }}
            >
                <View style={{ flex: 1.8 }}>
                    <TouchableWithoutFeedback
                        onPress={() => this.onPressImage(imgsUri, 0)}
                    >
                        <FastImage
                            resizeMode={FastImage.resizeMode.cover}
                            style={{ 
                                width: null, 
                                height: 200,
                                borderRadius: 2
                            }}
                            source={imgsUri[0]}
                        />
                    </TouchableWithoutFeedback>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <TouchableWithoutFeedback
                            onPress={() => this.onPressImage(imgsUri, 1)}
                        >
                            <FastImage
                                resizeMode={FastImage.resizeMode.cover}
                                style={{ 
                                    width: null, 
                                    height: 98,
                                    borderRadius: 2,
                                    marginLeft: 2
                                }}
                                source={imgsUri[1]}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableWithoutFeedback
                            onPress={() => this.onPressImage(imgsUri, 2)}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 10,
                                    flex: 1,
                                    borderRadius: 2,
                                    marginLeft: 2,
                                    marginTop: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.4)'
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: '600',
                                        fontSize: 24,
                                        color: 'white'
                                    }}
                                >
                                    {`+${lenImages - 2}`}
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <FastImage
                            resizeMode={FastImage.resizeMode.cover}
                            style={{ 
                                width: null, 
                                height: 98,
                                borderRadius: 2,
                                marginLeft: 2,
                                marginTop: 1
                            }}
                            source={imgsUri[2]}
                        />
                    </View>
                </View>
            </View>
        );
    }

    renderDots = () => (<View />)
    
    renderInfos = ({ item, index }) => {
        const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : { uri: '' };
        const nomeUser = item.nomeUser ? item.nomeUser : '';
        let perfilUser = item.perfilUser ? item.perfilUser : 'Administrador';

        if (this.lastIndexListInfos === index) {
            setTimeout(() => this.props.modificaInfoFilterLoad(false), 1000);
        }

        if (item.userLevel && '0|255'.includes(item.userLevel)) {
            perfilUser = item.userLevel === '255' ? 'Administrador Geral' : 'Administrador';
        }

        return (
            <View>
                <Card containerStyle={styles.card}>
                    <View style={{ marginVertical: 5 }}>
                        <ListItem
                            containerStyle={{ borderBottomWidth: 0 }}
                            avatar={imgAvt}
                            title={nomeUser}
                            subtitle={perfilUser}
                            rightIcon={(this.renderDots())}
                        />
                    </View>
                    { 
                        !!item.descPost &&
                        <View style={{ marginHorizontal: 10 }}>
                            <Text>
                                { item.descPost }
                            </Text>
                        </View>
                    }
                    { this.renderArticle(item) }
                    { this.renderActions(item) }
                    <View style={{ marginVertical: 5 }} />
                </Card>
            </View>
        );
    }

    renderInfoList = () => (
        <View style={{ flex: 1 }}>
            <AnimatedFlatList
                ref={(ref) => { this.scrollViewRef = ref; }}
                data={this.dataSourceControl(this.props.listInfos, this.props.filterInfoStr)}
                renderItem={this.renderInfos}
                keyExtractor={this.flatListKeyExtractor}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                style={styles.viewPrinc}
                scrollEventThrottle={16}
                onEndReachedThreshold={0.01}
                /* onEndReached={() => {
                    let rowsToShow = (this.lastIndexListInfos + 1) + this.fixedNumberRows;
                    const infosLength = this.props.listInfos.length;
                    if (rowsToShow > infosLength) {
                        rowsToShow = infosLength;
                    }

                    if (rowsToShow !== this.props.maxRows) {
                        if (rowsToShow !== (this.lastIndexListInfos + 1)) {
                            this.props.modificaLoadingFooter(true);
                        }
                        _.debounce(this.addNewRows, 2000)(rowsToShow);
                    } else {
                        this.props.modificaLoadingFooter(false);
                    }
                }}
                onContentSizeChange={(w, h) => { 
                    this.scrollViewContentSize = h;
                    const newOffSet = h - this.scrollViewHeight;
                    this.setState({ maxOffSetScrollView: newOffSet });
                }}
                onLayout={ev => { 
                    this.scrollViewHeight = ev.nativeEvent.layout.height;
                    const newOffSet = this.scrollViewContentSize - ev.nativeEvent.layout.height;
                    this.setState({ maxOffSetScrollView: newOffSet });
                }} */
                onScroll={
                    Animated.event(
                        [{
                            nativeEvent: { contentOffset: { y: this.scrollY } }
                        }],
                        {
                            useNativeDriver: true,
                            listener: (event) => {
                                const currentOffset = event.nativeEvent.contentOffset.y;
                                const direction = currentOffset > 
                                                this.scrollCurrentOffset ? 'down' : 'up';
                                this.scrollCurrentOffset = currentOffset;
                                this.onScrollView(currentOffset, direction);
                            }
                        }
                    )
                }
                ListHeaderComponent={
                    (
                    <View 
                        style={{ marginTop: 60 }} 
                    />
                    )
                }
                ListFooterComponent={(
                    <View style={{ marginBottom: 350, marginTop: 10 }} >
                    {
                        this.props.loadingFooter &&
                        <ActivityIndicator size={'large'} color={'white'} />
                    }
                    </View> 
            )}
            />
            <ShareModal />
            <Modal 
                visible={this.props.showImageView}
                animationType={'slide'}
                transparent
                onRequestClose={() => this.props.modificaShowImageView(false)}
            >
                <ImageViewer
                    imageUrls={this.props.imagesForView}
                    index={this.props.imagesForViewIndex}
                    isVisible={this.props.showImageView}
                    enableSwipeDown
                    pageAnimateTime={600}
                    enablePreload
                    footerContainerStyle={{ flex: 1, left: 0, right: 0 }}
                    renderImage={(props) => <FastImage {...props} />}
                    loadingRender={() => <ActivityIndicator />}
                    renderFooter={() => (
                        <View 
                            style={{ 
                                flex: 1, 
                                flexDirection: 'row',
                                alignItems: 'center', 
                                justifyContent: 'center'
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => this.props.modificaShowImageView(false)}
                            >
                                <View 
                                    style={{ 
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        paddingVertical: 15
                                    }}
                                >
                                    <Text
                                        style={{ 
                                            fontFamily: 'OpenSans-Bold', 
                                            color: 'white',
                                            textAlign: 'center',
                                            fontSize: 16
                                        }}
                                    >
                                        Fechar
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                    onCancel={() => this.props.modificaShowImageView(false)}
                />
            </Modal>
        </View>
    )

    render = () => {
        const { userLogged, listInfos } = this.props;
        const userImg = userLogged.imgAvatar ? { uri: userLogged.imgAvatar } : { uri: '' };
        let dates = ['Todo o Período'];

        if (this.props.listInfos.length) {
            const newDates = [];
            listInfos.forEach(inf => {
                const newD = inf.dataPost.slice(3, 10);
                if (_.findIndex(newDates, dt => dt === newD) === -1) {
                    newDates.push(newD);
                }
            });
            dates = ['Todo o Período', ..._.reverse(newDates)];
        }

        return (
            <View style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <Animated.View 
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            right: 0,
                            zIndex: 1,
                            paddingHorizontal: 15,
                            backgroundColor: colorAppTertiary,
                            borderBottomWidth: 0.1,
                            borderBottomColor: 'black',
                            transform: [
                                { 
                                    translateY: this.animBarValue, 
                                },
                                {
                                    translateX: this.scrollX 
                                }
                            ],
                            ...Platform.select({
                                ios: {
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 1,
                                },
                                android: {
                                  elevation: 1
                                }
                            })
                        }}
                    >
                        <View 
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <View style={{ flex: 0.5 }}>
                                <Avatar
                                    small
                                    rounded
                                    title={'  '}
                                    source={userImg}
                                    /* onPress={() => { 
                                        Keyboard.dismiss();
                                        Actions.replace('_perfil');
                                    }} */
                                    activeOpacity={0.7}
                                /> 
                            </View>
                            <View 
                                style={{ 
                                    flex: 2.5, 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    padding: 5
                                }}
                                onLayout={
                                    (event) =>
                                        this.setState({
                                            dropWidth: event.nativeEvent.layout.width
                                })}
                            >
                                <ModalDropdown
                                    ref={(ref) => { this.modalDropRef = ref; }}
                                    textStyle={styles.dropModalBtnText}
                                    style={{
                                        width: this.state.dropWidth / 1.5,
                                        justifyContent: 'center',
                                        height: 36
                                    }}
                                    dropdownTextStyle={{ 
                                        fontSize: normalize(16), 
                                        textAlign: 'center'
                                    }}
                                    dropdownStyle={{
                                        width: this.state.dropWidth / 1.5
                                    }}
                                    options={dates}
                                    onSelect={
                                        (index, value) => this.props.modificaInfoFilterStr(value)
                                    }
                                    defaultIndex={0}
                                    defaultValue={dates[0]}
                                />
                            </View>
                            <View 
                                style={{ 
                                    flex: 0.7, 
                                    flexDirection: 'row', 
                                    justifyContent: 'flex-end' 
                                }}
                            >
                                {/* <TouchableOpacity
                                    onPress={() => this.modalDropRef.show()}
                                >
                                    <Icon
                                        name='clipboard-plus' 
                                        type='material-community' 
                                        size={28} color='white' 
                                    />   
                                </TouchableOpacity>
                                <View style={{ marginHorizontal: 2 }} />  */}
                                <TouchableOpacity
                                    onPress={() => this.modalDropRef.show()}
                                >
                                    <Icon
                                        name='calendar-search' 
                                        type='material-community' 
                                        size={28} color='white' 
                                    />   
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
                { 
                    this.props.listInfos.length ? this.renderInfoList() : null
                }
                <Coment 
                    commentUpPress={() => 
                        Animated.spring(
                            this.scrollX, 
                            { toValue: -this.state.maxWidth, bounciness: 2, useNativeDriver: true }
                        ).start()
                    }
                    commentDownPress={
                        () => Animated.spring(
                            this.scrollX, { toValue: 0, bounciness: 2, useNativeDriver: true }
                        ).start()
                    }
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppForeground,
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    },
    card: {
        padding: 0,
        margin: 0,
        marginVertical: 15,
        marginHorizontal: 10
    },
    textArticle: {
        fontSize: 16,
        color: 'black',
        fontWeight: '400'
    },
    dropModalBtnText: {
        color: 'white',
        fontSize: normalize(16),
        fontWeight: 'bold',
        textAlign: 'center'
    }
});

const mapStateToProps = (state) => ({
    loadingFooter: state.InfosReducer.loadingFooter,
    maxRows: state.InfosReducer.maxRows,
    imagesForView: state.InfosReducer.imagesForView,
    imagesForViewIndex: state.InfosReducer.imagesForViewIndex,
    showImageView: state.InfosReducer.showImageView,
    filterInfoStr: state.InfosReducer.filterInfoStr,
    filterInfoLoad: state.InfosReducer.filterInfoLoad,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {
    modificaStartUpOrDownAnim,
    modificaInfoMsgSelected,
    modificaAddNewRows,
    modificaLoadingFooter,
    modificaImagesForView,
    modificaShowImageView,
    modificaImagesForViewIndex,
    modificaInfoFilterStr,
    modificaInfoFilterLoad,
    modificaAnimatedHeigth
})(Informativos);
