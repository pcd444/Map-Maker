'use strict';
export function pixelDimensionsFromXYAndCount(pixelCount, deltaX, deltaY) {
    const ratio = deltaX / deltaY;
    const pixelHeight = Math.round(Math.sqrt(pixelCount / ratio));
    const pixelWidth = Math.round(Math.sqrt(pixelCount * ratio));
    return walk(pixelWidth, pixelHeight, ratio);
}
// This will find a better height width if the above didn't find the best one.
function walk(pixelWidth, pixelHeight, prefRatio){
    while(true){
        if(Math.abs((pixelWidth + 1)/pixelHeight - prefRatio) < Math.abs(pixelWidth/pixelHeight - prefRatio)){
            pixelWidth++;
            continue;
        }
        if(Math.abs((pixelWidth - 1)/pixelHeight - prefRatio) < Math.abs(pixelWidth/pixelHeight - prefRatio)){
            pixelWidth--;
            continue;
        }
        if(Math.abs(pixelWidth/(pixelHeight + 1) - prefRatio) < Math.abs(pixelWidth/pixelHeight - prefRatio)){
            pixelHeight++;
            continue;
        }
        if(Math.abs(pixelWidth/(pixelHeight - 1) - prefRatio) < Math.abs(pixelWidth/pixelHeight - prefRatio)){
            pixelHeight--;
            continue;
        }
        break;
    }
    return([pixelWidth, pixelHeight]);
}

// Wait or we could just not care
