
const fps = 1000 / 60;
let distStart = 0;

export const Rotate = (entities, { touches }) => {
    const touchesMoved = touches.find(t => t.type === 'move');

    const obj = entities[0];

    if (obj && touchesMoved && touchesMoved.event.touches.length === 1) {
        obj.axisRotateY = touchesMoved.delta.pageX * 0.03;
        setTimeout(() => (obj.axisRotateY = 0), fps);
    }

    return entities;
};

export const onDoubleTouchStart = (entities, { touches }) => {
    const toucheStart = touches.find(ita => ita.type === 'start');
    
    if (toucheStart && toucheStart.event.touches.length === 2) {
        const touchesStarted = toucheStart.event.touches;
        distStart = distance(
            [touchesStarted[0].pageX, touchesStarted[0].pageY],
            [touchesStarted[1].pageX, touchesStarted[1].pageY]
        );
    }

    return entities;
};

export const Zoom = (entities, { touches }) => {
    const toucheMoved = touches.find(t => t.type === 'move');
    let distMoved = 0;

    if (toucheMoved && toucheMoved.event.touches.length === 2) {
        const touchesMoved = toucheMoved.event.touches;
        distMoved = distance(
            [touchesMoved[0].pageX, touchesMoved[0].pageY],
            [touchesMoved[1].pageX, touchesMoved[1].pageY]
        );
        
        const obj = entities[0];

        if (obj) {
            console.log(distStart);
            obj.cameraPosition.z = (distStart - distMoved) * 0.0009;
            setTimeout(() => (obj.cameraPosition.z = 0), fps);
        }
    }

    return entities;
};

export const distance = ([x1, y1], [x2, y2]) =>
	Math.sqrt(Math.abs(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
