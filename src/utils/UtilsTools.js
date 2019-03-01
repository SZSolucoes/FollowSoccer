import RNFetchBlob from 'rn-fetch-blob';

const glbXMLHttpRequest = global.XMLHttpRequest;
const glbBlob = global.Blob;

const RNXMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
const RNBlob = RNFetchBlob.polyfill.Blob;

export const doActiveRNFetchBlob = (status) => {
    if (status) {
        global.XMLHttpRequest = RNXMLHttpRequest;
        global.Blob = RNBlob;
    } else {
        global.XMLHttpRequest = glbXMLHttpRequest;
        global.Blob = glbBlob;
    }
};

