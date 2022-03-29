'use strict';
import {gridPointsGenerator} from "./gridPointsGenerator.js";
import { degreeToRadians, radianToDegrees } from "./radianDegreeConversion.js";
import { parseFloat, parseInteger, parseProjection } from "./parsers.js";
import { autoFindXYBounds } from "./autoFindXYBounds.js";
import { pixelDimensionsFromXYAndCount } from "./pixelDimensionsFromXYAndCount.js";
import { allCountryCodes } from "./allCountryCodes.js";

// Config
const resolutions = [25*50 ,50*100, 100*200];

// Iframe
const IFRAME = document.getElementById('myframe');
const IFRAME_WINDOW = IFRAME.contentWindow;

// Canvas element
const canvasElement = document.getElementById("myCanvas");
const ctx = canvasElement.getContext('2d');
canvasElement.style.height = '450px';
canvasElement.style.width = '900px';

// Initilize canvas
ctx.fillStyle = "blue";
ctx.fillRect(0, 0, 100, 100);

// Geting parentElement and finding its dimensions. They should stay static
const parentElement = document.getElementById('parent');
const parentHeight = parentElement.clientHeight;
const parentWidth = parentElement.clientWidth;
const parentWidthHeightRatio = parentWidth/parentHeight;


// GLOBAL DATA
// Will hold the >mapvalue data for each pixel. This is the data that has been run through Nearest Neighbor if i decide to do that.
let PIXELGRID = null;

// Projection inputs
const xProjectionInput = document.getElementById('projection-inputX');
const yProjectionInput = document.getElementById('projection-inputY');

// BUTTONS
// Project button
const projectButton = document.getElementById('project-button');
// Getting canvas sizing inputs
// Actual dimensions of canvas
const pixelHeightInput = document.getElementById('height');
const pixelWidthInput = document.getElementById('width');
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

// Unit radio inputs
const radians = document.getElementById('radians');
const degrees = document.getElementById('degrees');

// Resolution slider
const resolutionSlider = document.getElementById('resolution');

// MATH SETUP
// ADDING LN
math.import({ln:Math.log});
// Trig functions
const OGTRIG = {
    sin: math.sin, 
    cos: math.cos, 
    tan: math.tan, 
    sec: math.sec, 
    csc: math.csc
};

const DEGTRIG = {
    sin: function(x){return OGTRIG.sin(degreeToRadians(x))},
    cos: function(x){return OGTRIG.cos(degreeToRadians(x))},
    tan: function(x){return OGTRIG.tan(degreeToRadians(x))},
    sec: function(x){return OGTRIG.sec(degreeToRadians(x))},
    csc: function(x){return OGTRIG.csc(degreeToRadians(x))},
};

const OGINVERSETRIG = {
    asin: math.asin,
    acos: math.acos, 
    atan: math.atan, 
    asec: math.asec, 
    acsc: math.acsc
}

const DEGINVERSETRIG = {
    asin: function(x){return radianToDegrees(OGINVERSETRIG.asin(x))},
    acos: function(x){return radianToDegrees(OGINVERSETRIG.acos(x))},
    atan: function(x){return radianToDegrees(OGINVERSETRIG.atan(x))},
    asec: function(x){return radianToDegrees(OGINVERSETRIG.asec(x))},
    acsc: function(x){return radianToDegrees(OGINVERSETRIG.acsc(x))},
};

// Current mode
let trigMode = "radians";

// Initialize color inputs
let colorInputs = [];
let colorInputsParent = document.getElementById('color-inputs-parent');
// First deal with seabase

let [seabaseInput, seabaseLabel] = createColorInputAndLabel('seabase', '#0000ff');
seabaseInput.addEventListener('input',renderMap);
colorInputs.push(seabaseInput);
let seabaseInputParent = document.createElement('div');
seabaseInputParent.className = 'color-input-parent';
seabaseInputParent.append(seabaseLabel, seabaseInput);
colorInputsParent.appendChild(seabaseInputParent);



for(let countryCode of allCountryCodes){
    let [countryInput, countryLabel] = createColorInputAndLabel(countryCode, '#00ff00');
    countryInput.addEventListener('input',renderMap);
    colorInputs.push(countryInput);
    let countryInputParent = document.createElement('div');
    countryInputParent.className = 'color-input-parent';
    countryInputParent.append(countryLabel, countryInput);
    colorInputsParent.appendChild(countryInputParent);
}

function createColorInputAndLabel(name, color){
    let input = document.createElement('input');
    input.setAttribute('type','color');
    input.setAttribute('value',color);
    input.setAttribute('name', name);
    input.setAttribute('id', name);
    let label = document.createElement('label');
    label.innerText = name;
    label.setAttribute('for',name);
    return [input,label];
}
// UI functions

// MB remove
function minMaxCheckerBuilder(minElement, maxElement){
    minElement.addEventListener('change',
        function(e){

        }
    );
}


function makeProjectionFromParts(xFunction, yFunction){
    return(
        function(theta, phi){
            if(trigMode === 'radians'){
                theta = theta * Math.PI /180;
                phi = phi * Math.PI /180;
            }
            return [xFunction(theta,phi), yFunction(theta,phi)];
        }
    );
}

// Probably want to move these somewhere else
function checkThetaBounds(theta){
    return(-180 <= theta && theta <= 180);
}
function checkPhiBounds(phi){
    return(-90 <= phi && phi <= 90);
}

function possiblyAutoSetXYBounds(){
    // CHECK if all of the nessisary imputs are proper.
    const minThetaValue = parseFloat(minThetaInput.value);
    const maxThetaValue = parseFloat(maxThetaInput.value);
    const minPhiValue = parseFloat(minPhiInput.value);
    const maxPhiValue = parseFloat(maxPhiInput.value);
    if(minThetaValue !== null && maxThetaValue !== null && minPhiValue !== null && maxPhiValue !== null){
        if(minThetaValue < maxThetaValue && minPhiValue < maxPhiValue){
            if(checkThetaBounds(minThetaValue) && checkThetaBounds(maxThetaValue) && checkPhiBounds(minPhiValue) && checkPhiBounds(maxPhiValue)){
                // check if Projections are there and valid
                const xProjection = parseProjection(xProjectionInput.value);
                const yProjection = parseProjection(yProjectionInput.value);
                if(xProjection !== null && yProjection !== null){
                    // Autofind and set
                    const projection = makeProjectionFromParts(xProjection, yProjection);
                    const {minX,maxX,minY,maxY} = autoFindXYBounds(projection, minThetaValue, maxThetaValue, minPhiValue, maxPhiValue);
                    minXInput.value = minX;
                    maxXInput.value = maxX;
                    minYInput.value = minY;
                    maxYInput.value = maxY;
                    maxYInput.dispatchEvent(new Event('change')); // This will trigger the pixel updates
                }
            }
        }
    }
}

minThetaInput.addEventListener('change',
    function(e){
        let floatValue = parseFloat(this.value); //1
        let paredFloatValue = parseFloat(maxThetaInput.value); //2
        if(floatValue !== null && checkThetaBounds(floatValue)){
            // remove error style //1
            this.classList.remove('Local-Error'); //1
            if(paredFloatValue !== null){
                if(paredFloatValue > floatValue){ // 3
                    // remove other error styles on this and paired //1,2
                    this.classList.remove('Nonlocal-Error');
                    maxThetaInput.classList.remove('Nonlocal-Error');
                    // initiate possible x,y update // common to theta and phi
                    possiblyAutoSetXYBounds();
                }
                else{
                    // add other error styles on this and paired //1,2
                    this.classList.add('Nonlocal-Error'); //1
                    maxThetaInput.classList.add('Nonlocal-Error'); //2
                }
            }
        } else {
            // add error style //1
            this.classList.add('Nonlocal-Error');
        }
    }
);

maxThetaInput.addEventListener('change',
    function(e){
        let floatValue = parseFloat(this.value); //1
        let paredFloatValue = parseFloat(minThetaInput.value); //2
        if(floatValue !== null && checkThetaBounds(floatValue)){
            // remove error style //1
            this.classList.remove('Local-Error'); //1
            if(paredFloatValue !== null){
                if(paredFloatValue < floatValue){ // 3
                    // remove other error styles on this and paired //1,2
                    this.classList.remove('Nonlocal-Error');//1
                    minThetaInput.classList.remove('Nonlocal-Error'); //2
                    // initiate possible x,y update // common to theta and phi
                    possiblyAutoSetXYBounds();
                }
                else{
                    // add other error styles on this and paired //1,2
                    this.classList.add('Nonlocal-Error'); //1
                    minThetaInput.classList.add('Nonlocal-Error'); //2
                }
            }
        } else {
            // add error style //1
            this.classList.add('Nonlocal-Error');
        }
    }
);

minPhiInput.addEventListener('change',
    function(e){
        let floatValue = parseFloat(this.value); //1
        let paredFloatValue = parseFloat(maxPhiInput.value); //2
        if(floatValue !== null && checkPhiBounds(floatValue)){
            // remove error style //1
            this.classList.remove('Local-Error'); //1
            if(paredFloatValue !== null){
                if(paredFloatValue > floatValue){ // 3
                    // remove other error styles on this and paired //1,2
                    this.classList.remove('Nonlocal-Error');//1
                    maxPhiInput.classList.remove('Nonlocal-Error'); //2
                    // initiate possible x,y update // common to theta and phi
                    possiblyAutoSetXYBounds();
                }
                else{
                    // add other error styles on this and paired //1,2
                    this.classList.add('Nonlocal-Error'); //1
                    maxPhiInput.classList.add('Nonlocal-Error'); //2
                }
            }
        } else {
            // add error style //1
            this.classList.add('Nonlocal-Error');
        }
    }
);

maxPhiInput.addEventListener('change',
    function(e){
        let floatValue = parseFloat(this.value); //1
        let paredFloatValue = parseFloat(minPhiInput.value); //2
        if(floatValue !== null && checkPhiBounds(floatValue)){
            // remove error style //1
            this.classList.remove('Local-Error'); //1
            if(paredFloatValue !== null){
                if(paredFloatValue < floatValue){ // 3
                    // remove other error styles on this and paired //1,2
                    this.classList.remove('Nonlocal-Error');//1
                    minPhiInput.classList.remove('Nonlocal-Error'); //2
                    // initiate possible x,y update // common to theta and phi
                    possiblyAutoSetXYBounds();
                }
                else{
                    // add other error styles on this and paired //1,2
                    this.classList.add('Nonlocal-Error'); //1
                    minPhiInput.classList.add('Nonlocal-Error'); //2
                }
            }
        } else {
            // add error style //1
            this.classList.add('Nonlocal-Error');
        }
    }
);

function changeCanvasDimensions(pixelWidth, pixelHeight){
    // Resize the canvas.
    canvasElement.height = pixelHeight;
    canvasElement.width = pixelWidth;

    // Resize the canvas css height and width to remain in the parent box while remaining centered and being as 
    // large as possible. 
    if(pixelWidth/pixelHeight >= parentWidthHeightRatio){
        // left right edges will be flush.
        canvasElement.style.width = `${parentWidth}px`;
        canvasElement.style.height = `${(parentWidth/pixelWidth) * pixelHeight}px`;
    } else{
        // top bottom edges will be flush  
        canvasElement.style.height = `${parentHeight}px`;
        canvasElement.style.width = `${(parentHeight/pixelHeight) * pixelWidth}px`;
    }
}

function possiblePixelCountUpdate(){
    // CHECK if all of the nessisary imputs are proper.
    const minXValue = parseFloat(minXInput.value);
    const maxXValue = parseFloat(maxXInput.value);
    const minYValue = parseFloat(minYInput.value);
    const maxYValue = parseFloat(maxYInput.value);
    if(minXValue !== null && maxXValue !== null && minYValue !== null && maxYValue !== null){
        if(minXValue < maxXValue && minYValue < maxYValue){
            // Reactivate Slider
            resolutionSlider.classList.add('Active');
            // Take value from slider
            const sliderPosition = parseInt(resolutionSlider.value);
            const resolutionPixelCount = resolutions[sliderPosition];
            const deltaX = maxXValue - minXValue;
            const deltaY = maxYValue - minYValue;
            const [pixelWidth, pixelHeight] = pixelDimensionsFromXYAndCount(resolutionPixelCount, deltaX, deltaY);
            // Update inputs
            pixelHeightInput.value = pixelHeight;
            pixelWidthInput.value = pixelWidth;
            // Update Canvas
            //changeCanvasDimensions(pixelWidth, pixelHeight);
        }
    }
}


minXInput.addEventListener('change',
    function(e){
        const floatValue = parseFloat(this.value); //1
        const paredElement = maxXInput; //2
        const paredFloatValue = parseFloat(paredElement.value); 
        if(floatValue !== null){
            // remove error style //1
            this.classList.remove('Local-Error'); //1
            if(paredFloatValue !== null){
                if(paredFloatValue > floatValue){ // 3
                    // remove other error styles on this and paired //1,2
                    this.classList.remove('Nonlocal-Error'); //1
                    paredElement.classList.remove('Nonlocal-Error'); //2
                    // initiate possible pixel count update
                    possiblePixelCountUpdate();
                }
                else{
                    // add other error styles on this and paired //1,2
                    this.classList.add('Nonlocal-Error');
                    paredElement.classList.add('Nonlocal-Error');
                }
            }
        } else {
            // add error style //1
            this.classList.add('Local-Error');
        }
    }
);


maxXInput.addEventListener('change',
    function(e){
        const floatValue = parseFloat(this.value); //1
        const paredElement = minXInput; //2
        const paredFloatValue = parseFloat(paredElement.value); 
        if(floatValue !== null){
            // remove error style //1
            this.classList.remove('Local-Error'); //1
            if(paredFloatValue !== null){
                if(paredFloatValue < floatValue){ // 3
                    // remove other error styles on this and paired //1,2
                    this.classList.remove('Nonlocal-Error'); //1
                    paredElement.classList.remove('Nonlocal-Error'); //2
                    // initiate possible pixel count update
                    possiblePixelCountUpdate();
                }
                else{
                    // add other error styles on this and paired //1,2
                    this.classList.add('Nonlocal-Error');
                    paredElement.classList.add('Nonlocal-Error');
                }
            }
        } else {
            // add error style //1
            this.classList.add('Local-Error');
        }
    }
);

minYInput.addEventListener('change',
    function(e){
        const floatValue = parseFloat(this.value); //1
        const paredElement = maxYInput; //2
        const paredFloatValue = parseFloat(paredElement.value); 
        if(floatValue !== null){
            // remove error style //1
            this.classList.remove('Local-Error'); //1
            if(paredFloatValue !== null){
                if(paredFloatValue > floatValue){ // 3
                    // remove other error styles on this and paired //1,2
                    this.classList.remove('Nonlocal-Error'); //1
                    paredElement.classList.remove('Nonlocal-Error'); //2
                    // initiate possible pixel count update
                    possiblePixelCountUpdate();
                }
                else{
                    // add other error styles on this and paired //1,2
                    this.classList.add('Nonlocal-Error');
                    paredElement.classList.add('Nonlocal-Error');
                }
            }
        } else {
            // add error style //1
            this.classList.add('Local-Error');
        }
    }
);

maxYInput.addEventListener('change',
    function(e){
        const floatValue = parseFloat(this.value); //1
        const paredElement = minYInput; //2
        const paredFloatValue = parseFloat(paredElement.value); 
        if(floatValue !== null){
            // remove error style //1
            this.classList.remove('Local-Error'); //1
            if(paredFloatValue !== null){
                if(paredFloatValue < floatValue){ // 3
                    // remove other error styles on this and paired //1,2
                    this.classList.remove('Nonlocal-Error'); //1
                    paredElement.classList.remove('Nonlocal-Error'); //2
                    // initiate possible pixel count update
                    possiblePixelCountUpdate();
                }
                else{
                    // add other error styles on this and paired //1,2
                    this.classList.add('Nonlocal-Error');
                    paredElement.classList.add('Nonlocal-Error');
                }
            }
        } else {
            // add error style //1
            this.classList.add('Local-Error');
        }
    }
);

function checkIfPixelDimsMatchXYBounds(pixelHeight, pixelWidth){
    const xMin = parseFloat(minXInput.value);
    const xMax = parseFloat(maxXInput.value);
    const yMin = parseFloat(minYInput.value);
    const yMax = parseFloat(maxYInput.value);
    // Check if all bounds are present
    if(xMin !== null && xMax !== null && yMin !== null && yMax !== null){
        // Check that bounds dont conflict
        if(xMin < xMax && yMin < yMax){
            // Check if no more than a little bit off
            const deltaX = xMax - xMin;
            const deltaY = yMax - yMin;
            const xyRatio = deltaX/deltaY;
            const pixelRatio = pixelWidth/pixelHeight;
            const ratioDiff = Math.abs(xyRatio - pixelRatio);
            const onlyALittleBitOff = Math.abs(ratioDiff) < 0.01;
            // Check if there is no better at a similar res. Concretly this checks if there is a better match by just changing pixelHeight or pixelWidth
            const withOneLessWidth = Math.abs(((pixelWidth-1)/pixelHeight) - xyRatio);
            const withOneMoreWidth = Math.abs(((pixelWidth+1)/pixelHeight) - xyRatio);
            const withOneLessHeight = Math.abs((pixelWidth/(pixelHeight-1)) - xyRatio);
            const withOneMoreHeight = Math.abs((pixelWidth/(pixelHeight+1)) - xyRatio);
            const thereIsBetterAtSimilarRes = withOneLessWidth < ratioDiff || withOneMoreWidth < ratioDiff || withOneLessHeight < ratioDiff || withOneMoreHeight < ratioDiff;
            if(onlyALittleBitOff && !thereIsBetterAtSimilarRes){
                return true;
            }
            else{
                return false;
            }
        }
    }
    // If the x y bounds are invalid return false
    return false;
}

pixelHeightInput.addEventListener('change',
    function(e){
        resolutionSlider.classList.remove('Active');
        const intValue = parseInteger(this.value);
        const paredElementValue = parseInteger(pixelWidthInput.value);
        if(intValue !== null && intValue >= 20 && intValue <= 4000){
            this.classList.remove('Local-Error');
            if(paredElementValue !== null && paredElementValue >= 20 && paredElementValue <= 4000){
                // Check if the pixel dimensions match the X & Y bounds
                if(checkIfPixelDimsMatchXYBounds(intValue, paredElementValue)){//n
                    this.classList.remove('Nonlocal-Error');
                    pixelWidthInput.classList.remove('Nonlocal-Error');
                    //changeCanvasDimensions(paredElementValue ,intValue);//n
                } else {//n
                    this.classList.add('Nonlocal-Error');
                    pixelWidthInput.classList.add('Nonlocal-Error');
                }//n
            }
        } else{
            this.classList.add('Local-Error');
        }
    }
);

pixelWidthInput.addEventListener('change',
    function(e){
        resolutionSlider.classList.remove('Active');
        const intValue = parseInteger(this.value);
        const paredElementValue = parseInteger(pixelHeightInput.value);
        if(intValue !== null && intValue >= 20 && intValue <= 4000){
            this.classList.remove('Local-Error');
            if(paredElementValue !== null && paredElementValue >= 20 && paredElementValue <= 4000){
                // Check if the pixel dimensions match the X & Y bounds
                if(checkIfPixelDimsMatchXYBounds(paredElementValue, intValue)){//n
                    this.classList.remove('Nonlocal-Error');
                    pixelHeightInput.classList.remove('Nonlocal-Error');
                    //changeCanvasDimensions(intValue, paredElementValue);//n
                } else {//n
                    this.classList.add('Nonlocal-Error');
                    pixelHeightInput.classList.add('Nonlocal-Error');
                }//n
            }
        } else{
            this.classList.add('Local-Error');
        }
    }
);

resolutionSlider.addEventListener('change',
    function(e){
        this.classList.add('Active');
        possiblePixelCountUpdate();
    }
);


xProjectionInput.addEventListener('change',
    function(e){
        const xProj = parseProjection(this.value);
        const yProj = parseProjection(yProjectionInput.value);
        if(xProj !== null){
            this.classList.remove('Local-Error');
            if(yProj !== null){
                this.classList.remove('Nonlocal-Error');
                yProjectionInput.classList.remove('Nonlocal-Error');
                // AutosetXY
                possiblyAutoSetXYBounds();
            } else{
                this.classList.add('Nonlocal-Error');
                yProjectionInput.classList.add('Nonlocal-Error');
            }
        } else{
            this.classList.add('Local-Error');
        }
    }
);


yProjectionInput.addEventListener('change',
    function(e){
        const yProj = parseProjection(this.value);
        const xProj = parseProjection(xProjectionInput.value);
        if(yProj !== null){
            this.classList.remove('Local-Error');
            if(xProj !== null){
                this.classList.remove('Nonlocal-Error');
                xProjectionInput.classList.remove('Nonlocal-Error');
                // AutosetXY
                possiblyAutoSetXYBounds();
            } else{
                this.classList.add('Nonlocal-Error');
                xProjectionInput.classList.add('Nonlocal-Error');
            }
        } else{
            this.classList.add('Local-Error');
        }
    }
);


projectButton.addEventListener('click', 
    function(e){
        // Check that all of the inputs exist and are sensible.
        const xProjection = parseProjection(xProjectionInput.value);
        const yProjection = parseProjection(yProjectionInput.value);
        const xMin = parseFloat(minXInput.value);
        const xMax = parseFloat(maxXInput.value);
        const yMin = parseFloat(minYInput.value);
        const yMax = parseFloat(maxYInput.value);
        const thetaMin = parseFloat(minThetaInput.value);
        const thetaMax = parseFloat(maxThetaInput.value);
        const phiMin = parseFloat(minPhiInput.value);
        const phiMax = parseFloat(maxPhiInput.value);
        const pixelWidth = parseInt(pixelWidthInput.value);
        const pixelHeight = parseInt(pixelHeightInput.value);
        // Check that no nessisary input is missing 
        if(xProjection === null || yProjection === null || xMin === null || xMax === null || yMin === null || yMax === null || thetaMin === null || thetaMax === null || phiMin === null || phiMax === null || pixelWidth === null || pixelHeight === null){
            // Alert
            alert("A nessisary input was missing.");
            // TODO Highlight missing input
            return;
        }
        // Check that all of the inputs are correct.
        if(xMin >= xMax || yMin >= yMax || thetaMin >= thetaMax || phiMin >= phiMax){
            alert("A minimum bound is above a maximum");
            return;
        }
        if(thetaMin < -180 || thetaMin > 180 || phiMin < -90 || phiMin > 90){
            alert("A theta/phi coordinate is out of bounds");
            return;
        }
        if(pixelHeight < 20 || pixelHeight > 4000 || pixelWidth < 20 || pixelWidth > 4000){
            alert("A pixel value is to big or small. Pixel values have to be in the range [20, 4000]");
            return;
        }
        if(!checkIfPixelDimsMatchXYBounds(pixelHeight, pixelWidth)){
            alert("The pixel dimensions and X/Y dimensions dont match up.");
            return;
        }

        changeCanvasDimensions(pixelWidth, pixelHeight);

        let projection = makeProjectionFromParts(xProjection, yProjection);
        const temp = parseInteger(document.getElementById('testPointFactor').value);
        const testPointsFactor =  temp ? temp : 2;
        // Do the projection and other stuff.
        let gridPoints = gridPointsGenerator(phiMin,phiMax,thetaMin,thetaMax,Math.floor(pixelHeight * testPointsFactor),Math.floor(pixelWidth * testPointsFactor));
        // Find corespondingXY
        let corespondingXY = gridPoints.map(v=>{
            let proj = projection(v[1],v[0]);
            return [proj[0],proj[1]];
        });
        const xStep = (xMax-xMin)/pixelWidth;
        const yStep = (yMax-yMin)/pixelHeight;
        let corespondingColRow = corespondingXY.map(v=>{
            const col = Math.floor((v[0]-xMin)/xStep);
            const row =  -(Math.floor((v[1]-yMin)/yStep)) + (pixelHeight - 1);
            return [col,row];
        });
        // Do the point queries
        // Render.
        // Currently the steps above are done in the callback below.
        window.addEventListener('message',callback);
        // Get the point querys done by iframe.
        IFRAME_WINDOW.postMessage(gridPoints);

        function callback(e){
            let pointQueries = e.data;
            PIXELGRID = [];
            for(let i = 0; i< pixelHeight;i++){
                let row = [];
                for(let j =0; j < pixelWidth;j++){
                    row.push(null);
                }
                PIXELGRID.push(row);
            }
            if(corespondingColRow.length!==pointQueries.length){
                throw new Error('ERROR: LENGTH DONT MATCH');
            }
            for(let i = 0; i < corespondingColRow.length;i++){
                let [col,row] = corespondingColRow[i];
                if(row < pixelHeight && col < pixelWidth && row>=0 && col >=0)
                    PIXELGRID[row][col] = pointQueries[i];
            }
            // Write data to canvas
            renderMap()

            // Remove callback from window
            window.removeEventListener('message',callback);
        }
    }
);

function renderMap(){
    // Get colors
    let colorMap = new Map();
    for(let input of colorInputs){
        colorMap.set(input.name,input.value);
    }
    // Map Query data is allready in PIXELGRID
    // Loop Over PIXELGRID, coloring every pixel using data in colorMap
    for(let [rowNum, row] of PIXELGRID.entries()){
        for(let [colNum, value] of row.entries()){
            if(value === null){
                ctx.fillStyle = 'red';
                ctx.fillRect(colNum,rowNum,1,1);
            }
            else{
                ctx.fillStyle = colorMap.get(value[0]);
                ctx.fillRect(colNum,rowNum,1,1);
            }
        }
    }
}

radians.addEventListener('change', function(e){
    trigMode = 'radians';
    math.import({...OGTRIG,...OGINVERSETRIG},{override:true});
    possiblyAutoSetXYBounds();
});

degrees.addEventListener('change', function(e){
    trigMode = 'degrees';
    math.import({...DEGTRIG,...DEGINVERSETRIG},{override:true});
    possiblyAutoSetXYBounds();
});
