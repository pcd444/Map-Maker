function parseInteger(string){
    if (/^[-+]?(\d+)$/.test(value)) {
        return Number(value)
    } else {
        throw Error("input could not be parsed into an integer");
    }
}

function parseFloat(string){
    if (/^[-+]?(\d+)(.\d*)?$/.test(value)) {
        return Number(value)
    } else {
        throw Error("input could not be parsed into an float");
    }
}
// Outputs the parsed projection function, not the compiled projection function
function parseProjection(string){
    return math.parse(string);
}