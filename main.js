'use strict';

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
    const pxHeight = filterInt(pxHeightInput.value);
    const pxWidth = filterInt(pxWidthInput.value);
    const minX = filterInt(minXInput.value);
    const maxX = filterInt(maxXInput.value);
    const minY = filterInt(minYInput.value);
    const maxY = filterInt(maxYInput.value);
    const minTheta = filterInt(minThetaInput.value);
    const maxTheta = filterInt(maxThetaInput.value);
    const minPhi = filterInt(minPhiInput.value);
    const maxPhi = filterInt(maxPhiInput.value);
    // Checking if inputs are valid.
    if(!validateCanvasSizingInputs(minX, maxX, minY, maxY, minTheta, maxTheta, minPhi, maxPhi, pxHeight, pxWidth)){
        return;
    }
    // Resize the canvas.
    canvasElement.height = pxHeight;
    canvasElement.width = pxWidth;

    // Resize the canvas css height and width to remain in the parent box while remaining centered and being as 
    // large as possible. 
    if(pxWidth/pxHeight >= parentWidthHeightRatio){
        // left right edges will be flush.
        canvasElement.style.width = `${parentWidth}px`;
        canvasElement.style.height = `${(parentWidth/pxWidth) * pxHeight}px`;
    } else{
        // top bottom edges will be flush  
        canvasElement.style.height = `${parentHeight}px`;
        canvasElement.style.width = `${(parentHeight/pxHeight) * pxWidth}px`;
    }

});

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