import {gridPointsGenerator} from "./gridPointsGenerator.js";

function autoFindXYBounds(projection, minTheta, maxTheta, minPhi, maxPhi){
    const projectedPoints = gridPointsGenerator(minPhi,maxPhi,minTheta,maxTheta,100,100).map(p=>projection(p[1],p[0]));
    let minX = +Infinity;
    let maxX = -Infinity;
    let minY = +Infinity;
    let maxY = -Infinity;
    for(const [x,y] of projectedPoints){
        if(x < minX){
            minX = x;
        }
        if(x > maxX){
            maxX = x;
        }
        if(y < minY){
            minY = y;
        }
        if(y > maxY){
            maxY = y;
        }
    }
    return ({minX,maxX,minY,maxY});
}

export {autoFindXYBounds};