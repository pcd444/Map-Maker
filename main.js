const canvasElement = document.getElementById("myCanvas");
const ctx = canvasElement.getContext('2d');
canvasElement.style.height = '200px';
canvasElement.style.width = '400px';

ctx.fillStyle = "blue";
ctx.fillRect(0, 0, 1, 1);

const parentElement = document.getElementById('parent');
const parentHeight = parentElement.clientHeight;
const parentWidth = parentElement.clientWidth;
const parentWidthHeightRatio = parentWidth/parentHeight;

const height = document.getElementById('height');
const width = document.getElementById('width');
const button = document.getElementById('button1')

button.addEventListener('click',function(e){
    // Change height and width of the canvas to match the new values

    const hval = parseInt(height.value,10);
    const wval = parseInt(width.value,10);
    canvasElement.height = hval;
    canvasElement.width = wval;

    // Resize the canvas css height and width to remain in the parent box while remaining centered and being as 
    // large as possible. 
    if(wval/hval >= parentWidthHeightRatio){
        // left right edges will be flush.
        canvasElement.style.width = `${parentWidth}px`;
        canvasElement.style.height = `${(parentWidth/wval) * hval}px`;
    } else{
        // top bottom edges will be flush  
        canvasElement.style.height = `${parentHeight}px`;
        canvasElement.style.width = `${(parentHeight/hval) * wval}px`;
    }

});
