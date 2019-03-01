const THREE = require('three');
const DomParser = require('react-native-html-parser').DOMParser;

global.THREE = THREE;
global.DOMParser = DomParser;

// eslint-disable-next-line no-undef
if (!window.addEventListener) window.addEventListener = () => { };

require('three/examples/js/renderers/Projector');
require('three/examples/js/loaders/OBJLoader');
require('three/examples/js/loaders/DDSLoader');
require('three/examples/js/loaders/MTLLoader');
//require('three/examples/js/loaders/GLTFLoader');
require('three/examples/js/libs/inflate.min');
require('./tools/webglthree/GLTFLoader');
require('./tools/webglthree/ColladaLoader');
require('./tools/webglthree/FBXLoader');

console.disableYellowBox = true;
console.time = () => false;
console.timeEnd = () => false;

export default THREE;
