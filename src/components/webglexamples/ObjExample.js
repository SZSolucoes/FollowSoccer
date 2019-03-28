/* eslint-disable no-param-reassign */
import React from 'react';
import WebGLTHREE from '../../tools/webglthree/WebGLThree';
//import { buffer } from './Obj';
//import { mtl, obj } from './Obj';
import { ASSETSTYPES } from '../../utils/Constantes';

class ObjExample extends React.PureComponent {
    render = () => (
        <WebGLTHREE
            //textureUrl={'http://192.168.0.6:8082/objs/luigi.mtl'}
            //objUrl={'http://192.168.0.6:8082/objs/luigi.obj'}
            //textureStr={mtl}
            //objStr={obj}
            type={ASSETSTYPES.wavefront}
            width={'100%'}
            height={'100%'}
            backgroundColor={'green'}
            onMountedContext={this.props.onRenderObj}
            cameraZoom={3}
            minCameraZoom={3}
            maxCameraZoom={20}
        />
    )
}

export default ObjExample;
