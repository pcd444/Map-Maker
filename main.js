'use strict';
import gridPointsGenerator from "./gridPointsGenerator.js";
import { degreeToRadians } from "./radianDegreeConversion.js";

// Iframe
const IFRAME = document.getElementById('myframe');
const IFRAME_WINDOW = IFRAME.contentWindow;

// Canvas element
const canvasElement = document.getElementById("myCanvas");
const ctx = canvasElement.getContext('2d');
canvasElement.style.height = '200px';
canvasElement.style.width = '400px';
// Initilize canvas
ctx.fillStyle = "blue";
ctx.fillRect(0, 0, 100, 100);

// Geting parentElement and finding its dimensions. They should stay static
const parentElement = document.getElementById('parent');
const parentHeight = parentElement.clientHeight;
const parentWidth = parentElement.clientWidth;
const parentWidthHeightRatio = parentWidth/parentHeight;


// GLOBAL DATA
// Will hold the >mapvalue data for each pixel. This is the data that has been run through Nearest Neighbor.
let PIXELGRID = null;


// BUTTONS
// Project button
const projectButton = document.getElementById('project-button');
// Getting canvas sizing inputs
// Actual dimensions of canvas
const pxHeightInput = document.getElementById('height');
const pxWidthInput = document.getElementById('width');
// Output bounds input
const minXInput = document.getElementById('minX');
const maxXInput = document.getElementById('maxX');
const minYInput = document.getElementById('minY');
const maxYInput = document.getElementById('maxY');
// Input Bounds input
const minThetaInput = document.getElementById('minTheta');
const maxThetaInput = document.getElementById('maxTheta');
const minPhiInput = document.getElementById('minPhi');
const maxPhiInput = document.getElementById('maxPhi');

// Bounds global variables
let pxHeight =null;
let pxWidth = null;
let minX = null;
let maxX = null;
let minY = null;
let maxY = null;
let minTheta =null;
let maxTheta =null;
let minPhi = null;
let maxPhi = null;

// Submit button
const button = document.getElementById('button1')

// Changing the canvas dimensions and projection range parameters.
button.addEventListener('click',function(e){
    // Getting the values from the input elements.
    const pxHeightInput = filterInt(pxHeightInput.value);
    const pxWidthInput = filterInt(pxWidthInput.value);
    const minXInput = filterInt(minXInput.value);
    const maxXInput = filterInt(maxXInput.value);
    const minYInput = filterInt(minYInput.value);
    const maxYInput = filterInt(maxYInput.value);
    const minThetaInput = filterInt(minThetaInput.value);
    const maxThetaInput = filterInt(maxThetaInput.value);
    const minPhiInput = filterInt(minPhiInput.value);
    const maxPhiInput = filterInt(maxPhiInput.value);
    // Checking if inputs are valid.
    if(!validateCanvasSizingInputs(minXInput, maxXInput, minYInput, maxYInput, minThetaInput, maxThetaInput, minPhiInput, maxPhiInput, pxHeightInput, pxWidthInput)){
        return;
    }
    // Updating global vars
    pxHeight = pxHeightInput;
    pxWidth = pxWidthInput;
    minX = minXInput;
    maxX = maxXInput;
    minY = minYInput;
    maxY = maxYInput;
    minTheta = minThetaInput;
    maxTheta = maxThetaInput;
    minPhi = minPhiInput;
    maxPhi = maxPhiInput;


    // Resize the canvas.
    canvasElement.height = pxHeightInput;
    canvasElement.width = pxWidthInput;

    // Resize the canvas css height and width to remain in the parent box while remaining centered and being as 
    // large as possible. 
    if(pxWidthInput/pxHeightInput >= parentWidthHeightRatio){
        // left right edges will be flush.
        canvasElement.style.width = `${parentWidth}px`;
        canvasElement.style.height = `${(parentWidth/pxWidthInput) * pxHeightInput}px`;
    } else{
        // top bottom edges will be flush  
        canvasElement.style.height = `${parentHeight}px`;
        canvasElement.style.width = `${(parentHeight/pxHeightInput) * pxWidthInput}px`;
    }

});

// projectButton.addEventListener('click',);

function validateCanvasSizingInputs(minX, maxX, minY, maxY, minTheta, maxTheta, minPhi, maxPhi, pxHeight, pxWidth){
    // Check that canvas pixel values are positive and not to big.
    if(pxHeight < 1 || pxWidth < 1 || pxHeight >10000 || pxWidth > 10000){
        return false;
    }
    // Check if the mins are smaller than maxes.
    if(minPhi >= maxPhi || minTheta >= maxTheta || minX >= maxX || minY >= maxY){
        return false;
    }
    // Check that all data are numbers, not NaN, and not Infinite.
    for(let input of [minX, maxX, minY, maxY, minTheta, maxTheta, minPhi, maxPhi]){
        if(typeof input !== 'number' || isNaN(input) || Math.abs(input) === Infinity){
            return false;
        }
    }
    // Checking if the pixel values and x & y values match up.
    const xDelta = maxX - minX;
    const yDelta = maxY - minY;
    // Idealy this should be 1
    const ratioRatio = (pxHeight/pxWidth)/(yDelta/xDelta);
    if(ratioRatio > 1.01 || ratioRatio < 0.99){
        return false;
    }
    return true;

}


function filterInt(value) {
    if (/^[-+]?(\d+|Infinity)$/.test(value)) {
      return Number(value)
    } else {
      return NaN
    }
}
//stuff

// Returns an array [x,y]
function mercatorProjection(theta, phi){
    theta = theta;
    phi = degreeToRadians(phi);
    const x = theta;
    const y = (180/Math.PI)*Math.log(Math.tan(Math.PI/4 + phi/2));
    return [x,y];
}
function equiRectangularProjection(theta, phi){
    const x = theta;
    const y = phi;
    return [x,y];
}
function gallsPetersProjection(theta, phi){
    phi = degreeToRadians(phi);
    const x = theta;
    const y = (180/Math.PI) * 2 * Math.sin(phi)
    return [x,y];
}

// Mercator north america
//projectButton.addEventListener('click',() =>FullProjectionRender(mercatorProjection,-170,-50,10,100,120*2,90*2,-170,-50,10,70,2));

// Equirectangular north america
//projectButton.addEventListener('click',() =>FullProjectionRender(equiRectangularProjection,-170,-50,10,70,100*2,50*2,-170,-50,10,70,2));

// Mercator all long, lats to 70
//projectButton.addEventListener('click',() =>FullProjectionRender(mercatorProjection,-180,180,-100,100,180*2,100*2,-180,180,-70,70,2));

// Galls Peters full world
projectButton.addEventListener('click',() =>FullProjectionRender(gallsPetersProjection,-180,180,-(2*180/Math.PI),(2*180/Math.PI),157,100,-180,180,-90,90,1));

function FullProjectionRender(projection,xMin,xMax,yMin,yMax,xPixelCount,yPixelCount,minTheta,maxTheta,minPhi,maxPhi,testPointsFactor){
    // Overwrite Canvas
    canvasElement.height = yPixelCount;
    canvasElement.width = xPixelCount;
    // Gen theta and phi values
    let gridPoints = gridPointsGenerator(minPhi,maxPhi,minTheta,maxTheta,Math.floor(yPixelCount * testPointsFactor),Math.floor(xPixelCount * testPointsFactor));
    // Find corespondingXY
    let corespondingXY = gridPoints.map(v=>{
        let proj = projection(v[1],v[0]);
        return [proj[1],proj[0]];
    });
    // Find the pixel each point will end up in.
    const xStep = (xMax-xMin)/xPixelCount;
    const yStep = (yMax-yMin)/yPixelCount;
    let corespondingColRow = corespondingXY.map(v=>{
        const col = Math.floor((v[1]-xMin)/xStep);
        const row =  -(Math.floor((v[0]-yMin)/yStep)) + (yPixelCount - 1);
        return [col,row];
    });
    // Callback to be done after pointlocation is done in iframe
    function callback(e){
        let pointQueries = e.data;
        let pixelGrid = [];
        for(let i = 0; i< yPixelCount;i++){
            let row = [];
            for(let j =0; j < xPixelCount;j++){
                row.push(null);
            }
            pixelGrid.push(row);
        }
        if(corespondingColRow.length!==pointQueries.length){
            throw new Error('ERROR: LENGTH DONT MATCH');
        }
        for(let i = 0; i < corespondingColRow.length;i++){
            let [col,row] = corespondingColRow[i];
            if(row < yPixelCount && col < xPixelCount && row>=0 && col >=0)
                pixelGrid[row][col] = pointQueries[i];
        }
        // Write data to canvas
        for(let [rowNum, row] of pixelGrid.entries()){
            for(let [colNum, value] of row.entries()){
                if(value === null){
                    ctx.fillStyle ='red';
                    ctx.fillRect(colNum,rowNum,1,1);
                } 
                else if(value.includes('region')){
                    ctx.fillStyle ='black';
                    ctx.fillRect(colNum,rowNum,1,1);
                } else{
                    ctx.fillStyle ='blue';
                    ctx.fillRect(colNum,rowNum,1,1);
                }
                
            }
        }
        window.removeEventListener('message',callback);
    }

    window.addEventListener('message',callback);
    // Get the point querys done by iframe.
    IFRAME_WINDOW.postMessage(gridPoints);
}




// Functions to use for the testing purpose. This stuff is extreamly hacky
// Global Testing vars
let gridPoints;
let corespondingColRow;

// setTimeout(
//     function(){
//         window.addEventListener('message',function(e){
//             console.log('here');
//             testProjectionListener(e.data);
//         });
        
//         testProjection(mercatorProjection,-180,180,-90,90,100,100,-180,180,-89,89);
//     }, 100
// );



function testProjection(projection,xMin,xMax,yMin,yMax,xPixelCount,yPixelCount,minTheta,maxTheta,minPhi,maxPhi){
    // Overwrite Canvas
    canvasElement.height = yPixelCount;
    canvasElement.width = xPixelCount;
    // Gen theta and phi values
    gridPoints = gridPointsGenerator(minPhi,maxPhi,minTheta,maxTheta,yPixelCount,xPixelCount);
    // Find corespondingXY
    let corespondingXY = gridPoints.map(v=>{
        let proj = projection(v[1],v[0]);
        return [proj[1],proj[0]];
    });
    // Find the pixel each point will end up in.
    const xStep = (xMax-xMin)/xPixelCount;
    const yStep = (yMax-yMin)/yPixelCount;
    corespondingColRow = corespondingXY.map(v=>{
        const col = Math.floor((v[0]-xMin)/xStep);
        const row = Math.floor((v[1]-yMin)/yStep);
        return [col,row];
    });
    // Get the point querys done by iframe.
    IFRAME_WINDOW.postMessage(gridPoints);

}

function testProjectionListener(pointQueries){
    // Find
    // Currently not using pixel arrays to store multiple hits
    let pixelGrid = [];
    for(let i = 0;i<canvasElement.height;i++){
        let row = [];
        for(let j =0; j <canvasElement.width;j++){
            row.push(null);
        }
        pixelGrid.push(row);
    }
    if(corespondingColRow.length!==pointQueries.length){
        throw new Error('ERROR: LENGTH DONT MATCH');
    }
    for(let i = 0; i < corespondingColRow.length;i++){
        let [row,col] = corespondingColRow[i];
        pixelGrid[row][col] = pointQueries[i];
    }
    // Write data to canvas
    for(let [rowNum, row] of pixelGrid.entries()){
        for(let [colNum, value] of row.entries()){
            if(value === null){
                ctx.fillStyle ='red';
                ctx.fillRect(colNum,rowNum,1,1);
            } 
            else if(value.includes('region')){
                ctx.fillStyle ='black';
                ctx.fillRect(colNum,rowNum,1,1);
            } else{
                ctx.fillStyle ='blue';
                ctx.fillRect(colNum,rowNum,1,1);
            }
            
        }
    }
}
