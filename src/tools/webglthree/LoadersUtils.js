/* eslint-disable no-param-reassign */

import THREE from '../../Three';

export const loaderFromType = async (args = {}) => {
    const {
        type,
        textureUrl,
        objUrl,
        textureStr,
        objStr,
    } = args;

    if (!type) return;

    switch (type) {
        case 'wavefront':
            if ((textureUrl && objUrl) || (textureStr && objStr)) { 
                const OBJloader = new THREE.OBJLoader();
        
                THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
        
                if (textureUrl && objUrl) {
                    try {
                        const materialWithTexture = await new Promise(
                            (resolve) => {
                                const mtlLoader = new THREE.MTLLoader();
        
                                mtlLoader.load(textureUrl, materials => {
                                    materials.preload();
                                    resolve(materials);
                                }, null, () => resolve(false));
                            }
        
                        );
        
                        if (!materialWithTexture) return;
            
                        const obj = await new Promise((resolve) => {
                            OBJloader.setMaterials(materialWithTexture);
            
                            OBJloader.load(objUrl,
                                geoObj => {
                                    resolve(geoObj);
                                }, null, () => resolve(false)
                            );
                        });
        
                        return obj;
                    } catch (e) {
                        console.log(e);
                        return;
                    }
                } else if (textureStr && objStr) {
                    try {
                        const materialWithTexture = await new Promise(
                            (resolve) => {
                                const mtlLoader = new THREE.MTLLoader();
        
                                mtlLoader.setResourcePath(' ');
        
                                const materials = mtlLoader.parse(textureStr);
                                materials.preload();
                                resolve(materials);
                            }
        
                        );
        
                        if (!materialWithTexture) return;
            
                        const obj = await new Promise((resolve) => {
                            OBJloader.setMaterials(materialWithTexture);
                            const parsed = OBJloader.parse(objStr);
                            resolve(parsed);
                        });
        
                        return obj;
                    } catch (e) {
                        console.log(e);
                        return;
                    }
                }
            }

            break;
        case 'gltf':
            if (objUrl || objStr) {
                let gltfLoader = new THREE.GLTFLoader();
    
                let gltfLoaded = null;
                
                try {
                    if (typeof objStr === 'string') {
                        gltfLoaded = await new Promise((resolve) => {
                            gltfLoader
                            .parse(
                                objStr, null, gltf => resolve(gltf), () => resolve(false)
                            );
                        });
                    } else if (objUrl) {
                        const path = objUrl.substring(0, objUrl.lastIndexOf('/') + 1);
                        const file = objUrl.substring(objUrl.lastIndexOf('/') + 1);
    
                        gltfLoader = gltfLoader.setPath(path);
    
                        gltfLoaded = await new Promise((resolve) => {
                            gltfLoader.load(
                                file, gltf => resolve(gltf), null, () => resolve(false)
                            );
                        });
                    }
                } catch (e) {
                    console.log(e);
                }

                return gltfLoaded;
            }

            break;
        case 'collada':
            if (objUrl || objStr) {
                const colladaLoader = new THREE.ColladaLoader();
                
                let colladaLoaded = null;
                try {  
                    if (typeof objStr === 'string') {
                        colladaLoaded = await new Promise((resolve) => {
                            colladaLoader
                            .parse(
                                objStr, 
                                null, 
                                collada => resolve(collada), () => resolve(false)
                            );
                        });
                    } else if (objUrl) {
                        colladaLoaded = await new Promise((resolve) => {
                            colladaLoader
                            .load(
                                objUrl, collada => resolve(collada), null, () => resolve(false)
                            );
                        });

                        if (!colladaLoaded) return;

                        //console.log(colladaLoaded.library.nodes);

                        /* const avatar = colladaLoaded.scene;
                        avatar.traverse((node) => {
                            if (node.isSkinnedMesh) {
                                node.frustumCulled = false;
                                node.castShadow = true;
                                node.receiveShadow = true;
                            }
                            if (node.isMesh) {
                                node.castShadow = true;
                                node.receiveShadow = true;
                            }
                        });
                         */
                        /* mixer = new THREE.AnimationMixer(avatar);
                        
                        const animations = collada.animations;
                        const action = mixer.clipAction(animations[0]).play(); */

                        return colladaLoaded;
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            break;
        case 'fbx':
            if (objUrl || objStr) {
                const fbxLoader = new THREE.FBXLoader();
    
                let fbxLoaded = null;
                try {  
                    if (typeof objStr === 'string') {
                        fbxLoaded = await new Promise((resolve) => {
                            fbxLoader
                            .parse(
                                objStr, 
                                null, 
                                fbx => resolve(fbx), () => resolve(false)
                            );
                        });
                    } else if (objUrl) {
                        fbxLoaded = await new Promise((resolve) => {
                            fbxLoader
                            .load(
                                objUrl, fbx => resolve(fbx), null, () => resolve(false)
                            );
                        });
                    }
                } catch (e) {
                    console.log(e);
                }

                /* mixer = new THREE.AnimationMixer(fbxLoaded);
                const action = mixer.clipAction(fbxLoaded.animations[0]);
                action.play(); */

                fbxLoaded.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                return fbxLoaded;
                
                /* if (this.props.cameraZoom && typeof this.props.cameraZoom === 'number') {
                    camera.position.z = this.props.cameraZoom;
                } else {
                    camera.position.z = 3;
                } */
            }

            break;
        default:
    }
};
