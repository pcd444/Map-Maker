
function gridPointsGenerator(minDim1,maxDim1,minDim2,maxDim2,dim1PixelCount,dim2PixelCount){
    // Generates a flat array of gridpoints
    let output = [];
    // Currently might be causing out of bounds on the svg map.
    const dim1Delta = maxDim1-minDim1;
    const dim1Step = dim1Delta/(dim1PixelCount-1);
    const dim2Delta = maxDim2-minDim2;
    const dim2Step = dim2Delta/(dim2PixelCount-1);
    for(let i = 0; i<dim1PixelCount; i++){
        for(let j = 0; j<dim2PixelCount; j++){
            output.push([i*dim1Step+minDim1, j*dim2Step+minDim2]);
        }
    }
    return output;
}

export default gridPointsGenerator;