function parseInteger(string){
    if (/^[-+]?(\d+)$/.test(string)) {
        return Number(string)
    } else {
        return null;
    }
}

function parseFloat(string){
    if (/^[-+]?(\d+)(.\d*)?(e[+-]?\d+)?$/.test(string)) {
        return Number(string)
    } else {
        return null;
    }
}
// Outputs the parsed projection function, not the compiled projection function
function parseProjection(string){
    try{
        let expressionTree =  math.parse(string);
        // Check that all symbols are correct. That is phi, theta, θ, φ, latitude, or longitude.
        if(checkVariables(expressionTree)){
            const parsedExpression =  expressionTree.compile();
            return(
                function(theta, phi){
                    return parsedExpression.evaluate({theta,phi});
                }
            );
        }
        else{
            return null;
        }
    } catch(error){
        return null;
    }
    

}

function checkVariables(expressionNode){
    const type = expressionNode.type
    switch(type){
        case 'ConstantNode':
            if (expressionNode.value === undefined) {
                return false;
            }
            else{
                return true;
            }

        case 'FunctionNode':
            const funArguments = expressionNode.args;
            for(let argument of funArguments){
                if(!checkVariables(argument)){
                    return false;
                }
            }
            return true;

        case 'ParenthesisNode':
            return checkVariables(expressionNode.content);
        case 'OperatorNode':
            const opArguments = expressionNode.args;
            for(let argument of opArguments){
                if(!checkVariables(argument)){
                    return false;
                }
            }
            return true;

        case 'SymbolNode':
            const name = expressionNode.name;
            if(name === 'theta' || name === 'phi' /*|| name === 'θ' || name === 'φ' || name === 'lattitude' || name === 'longitude'*/ || name ==='pi'){
                return true;
            }
            else{
                return false;
            }

        default:
            return false;
    }
}

export {parseInteger, parseFloat, parseProjection};