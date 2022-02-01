"use strict";
console.log('dkdk')
const svg = document.getElementsByTagName('svg')[0];
const mapBorder = document.getElementsByClassName('mapborder')[0];
window.addEventListener("message",function(e){
    console.log(`in iframe: ${e.data.join('|')}`);
    let queryPoints = e.data;
    let output = [];
    for(let [latitude, longitude] of queryPoints){
        let x = thetaToX(longitude);
        let y = phiToY(latitude);
        let element = document.elementFromPoint(x, y);
        if(element === svg || element === mapBorder || element === null){
            throw new Error(`The search somehow went out of bounds: the element found was ${element}`);
        }
        output.push([...element.classList]);
    }
    window.parent.postMessage(output);
});

function xToTheta(x){
    if(x < 0 || x > 1100){
        throw new RangeError(`The input x: ${x}, is outside of the svg x pos range of 0 to 1100.`);
    }
    if(x < 1069){
        return(0.3272524367143436 * x - 169.855708194561);
    }else{
        return(0.3272524367143436 * x - 529.8328548476334);
    }
}

function thetaToX(theta){
    if(theta < -180 || theta > 180){
        throw new RangeError(`The input theta: ${theta} is outside of the range of -180 to 180`)
    }
    if(theta > -169.855708194561){
        return(3.0557450084715274 * theta + 519.0357324759261);
    }else{
        return(3.0557450084715274 * theta + 1619.034101524875);
    }
}

function yToPhi(y){
    if(y < 0 || y > 549.8){
        throw new RangeError(`The input y:${y}, is outside of the svg y pos range of 0 to 549.8`);
    }
    return(y * -0.32712491274676575 + 89.95015451446541);
}

function phiToY(phi){
    if(phi < -90 || phi > 90){
        throw new RangeError(`The input phi: ${phi} is outside of the range of -90 to 90`)
    }
    return(phi * -3.056936237608173 + 274.9718869137237)
}