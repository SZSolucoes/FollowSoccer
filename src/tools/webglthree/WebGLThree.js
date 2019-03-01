/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-undef */

import React from 'react';
import { 
    StyleSheet, 
    View, 
    Dimensions, 
    AppState, 
    ActivityIndicator
} from 'react-native';
import { WebGLView } from 'react-native-webgl';
import PropTypes from 'prop-types';
import now from 'performance-now';
import THREE from '../../Three';
import OrbitControlsResponder from './OrbitControlsResponder';
import { colorAppPrimary } from '../../utils/Constantes';
import { loaderFromType } from './LoadersUtils';

class WebGLTHREE extends React.Component {
    constructor(props) {
        super(props);

        this.requestId = () => false;
        this.touchBox = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.renderer = null;

        this.fps = 60;
        this.interval = 1000 / this.fps;
        this.then = now();
        this.delta = 0;
        this.camera = null;
        this.scene = null;

        this.onContextCreate = this.onContextCreate.bind(this);
        this.onDimensionsChange = this.onDimensionsChange.bind(this);

        this.state = {
            height: Dimensions.get('screen').height,
            width: Dimensions.get('screen').width,
            camera: null,
            running: true,
            hasMounted: false,
            webglWidth: 0,
            webglHeight: 0
        };
    }

    componentDidMount = () => {
        Dimensions.addEventListener('change', this.onDimensionsChange);
        AppState.addEventListener('change', (appState) => {
            if (appState !== 'active') {
                cancelAnimationFrame(this.requestId);
                this.setState({ running: false, hasMounted: false });
            } else {
                cancelAnimationFrame(this.requestId);
                this.setState({ running: true, hasMounted: false });
            }
        });
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.onDimensionsChange);
        cancelAnimationFrame(this.requestId);
    }

    onTouch = (nativeEvent) => {
        this.touchBox.x = ((nativeEvent.locationX / this.state.webglWidth) * 2) - 1;
        this.touchBox.y = -((nativeEvent.locationY / this.state.webglHeight) * 2) + 1;
    }

    onDimensionsChange = (dim) => {
        this.setState({
            height: dim.screen.height,
            width: dim.screen.width
        });
    }
    
    onContextCreate = async (
        gl, 
        textureUrl, 
        objUrl,
        textureStr,
        objStr,
        type
        ) => {
        this.gl = gl;
        this.rngl = gl.getExtension('RN');

        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
        this.renderer = new THREE.WebGLRenderer({
            canvas: {
                    width,
                    height,
                    style: {},
                    addEventListener: () => {},
                    removeEventListener: () => {},
                    clientHeight: height,
                    alpha: true
            },
            context: gl,
            alpha: true,
            antialias: true
        });

        this.renderer.setSize(width, height);
        //renderer.setClearColor(0xf00000, 1);

        THREE.TextureLoader.prototype.loadMeshBasicMaterial = this.loadMeshBasicMaterial;
        THREE.TextureLoader.prototype.load = this.loadTexture;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            50, 
            gl.drawingBufferWidth / gl.drawingBufferHeight, 
            0.1,
            2000
        );

        pointLight = new THREE.PointLight(0xffffff, 2);

        pointLight.position.set(5, 5, 5);

        this.scene.add(pointLight);

        this.scene.add(this.camera);

        if (this.props.backgroundColor) {
            this.scene.background = new THREE.Color(this.props.backgroundColor);
        }

        if (this.props.cameraZoom && typeof this.props.cameraZoom === 'number') {
            this.camera.position.z = this.props.cameraZoom;
        } else {
            this.camera.position.z = 3;
        }

        // Loading models
        const init = async () => loaderFromType({
            textureUrl, 
            objUrl,
            textureStr,
            objStr,
            type
        });

        let retLoaded;

        try {
            retLoaded = await init();
            this.scene.add(retLoaded);
        } catch (e) {
            console.log(e);
            this.setState({ hasMounted: true });
            return false;
        }

        if (retLoaded) {
            // Render control
            this.then = now();
            
            // Inicia a animação
            this.animate();
        }

        this.setState({ camera: this.camera, hasMounted: true });

        if (this.props.onMountedContext) this.props.onMountedContext(true);
    };

    animate = () => {
        this.requestId = requestAnimationFrame(this.animate);

        this.delta = now() - this.then;

        if (this.delta > this.interval) {
            this.then = now() - (this.delta % this.interval);

            this.renderFrames();
        }
    };

    loadMeshBasicMaterial = (src) => {
        const texture = new THREE.Texture();
        const material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });
        const properties = this.renderer.properties.get(texture);

        //console.log('meshbasic', src);

        this.rngl.loadTexture({ yflip: true, image: src })
        .then(({ loadedTexture }) => {
            properties.__webglTexture = loadedTexture;
            properties.__webglInit = true;
            texture.needsUpdate = true;
        });

        return material;
    };

    loadTexture = (src) => {
        const txtr = new THREE.Texture();
        const properties = this.renderer.properties.get(txtr);

        //console.log('loadTexture', src);

        this.rngl.loadTexture({ yflip: true, image: { uri: src.trim() } })
        .then(({ texture }) => {
            properties.__webglTexture = texture;
            properties.__webglInit = true;
            texture.needsUpdate = true;
        });

        return txtr;
    };

    raycasting = () => {
        this.raycaster.setFromCamera(this.touchBox, this.camera);

        // calculate objects intersecting the picking ray

        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        //console.log(intersects);

        for (let i = 0; i < intersects.length; i++) {
            //intersects[ i ].object.material.color.set( 0xff0000 );
            //console.log('distance', intersects[i].distance);
            //console.log('point', intersects[i].point);
            //console.log('uv', intersects[i].uv);
            //console.log('face', intersects[i].face);
            //console.log('faceIndex', intersects[i].faceIndex);
        }

        this.touchBox.x = -2;
        this.touchBox.y = -2;
    };

    renderFrames = () => {
        /*  const deltab = clock.getDelta();
         if (mixer) mixer.update(deltab); */

         this.raycasting();

         this.renderer.render(this.scene, this.camera);

         this.gl.flush();
         this.rngl.endFrame();
     };
  
    render = () => {
        const { 
            textureUrl, 
            objUrl,
            textureStr,
            objStr,
            type,
            width, 
            height,
            minCameraZoom,
            maxCameraZoom
        } = this.props;
        const widthChoosed = width || this.state.width;
        const heightChoosed = height || this.state.height;

        if (this.state.running) {
            return (
                <View style={{ flex: 1 }}>
                    <View style={[styles.container, { opacity: this.state.hasMounted ? 1 : 0 }]}>
                        <OrbitControlsResponder
                            style={{
                                width: widthChoosed,
                                height: heightChoosed
                            }}
                            camera={this.state.camera}
                            minCameraZoom={minCameraZoom}
                            maxCameraZoom={maxCameraZoom}
                            onTouch={this.onTouch}
                        >
                            <WebGLView
                                style={{
                                    width: widthChoosed,
                                    height: heightChoosed
                                }}
                                onLayout={({ nativeEvent }) => 
                                    this.setState({ 
                                        webglWidth: nativeEvent.layout.width, 
                                        webglHeight: nativeEvent.layout.height, 
                                    })
                                }
                                onContextCreate={
                                    (gl) => 
                                    this.onContextCreate(
                                        gl, 
                                        textureUrl, 
                                        objUrl,
                                        textureStr,
                                        objStr,
                                        type
                                    )
                                }
                            />
                        </OrbitControlsResponder>
                    </View>
                    {
                        !this.state.hasMounted &&
                        (
                            <View 
                                style={[
                                    styles.container,
                                    {
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        bottom: 0,
                                        left: 0
                                    }
                                ]} 
                            >
                                <ActivityIndicator size={'large'} color={colorAppPrimary} />
                            </View>
                        )
                    }
                </View>
            );
        }

        return (
            <View 
                style={[
                    styles.container
                ]} 
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

WebGLTHREE.propTypes = {
    textureUrl: PropTypes.string, 
    objUrl: PropTypes.string, 
    width: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]), 
    height: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    onMountedContext: PropTypes.func,
    backgroundColor: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])
};

export default WebGLTHREE;

