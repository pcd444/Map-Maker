// This file contains a function which does a nearest neighbor search on a grid of elements. 

// Input: 
//  grid: array of arrays,  the grid. Every inner array is a row.
//  queryCol: number, the column of the cell we want to find nearest neighbor for.
//  queryRow: number, the column of the cell we want to find nearest neighbor for.

// Output: the contents of the nearest unempty cell, if more than one the most common contents, 
// if there is a tie it is broken randomly.
function findNearestNeighbor(grid, queryCol, queryRow){
    let height = grid.length;
    let width = grid[0].length;
    let manhattanDistance = 1; // Also could be named layer count
    let soFarClosest = []; // Has to be a list in order to store multiple cells in case of ties/tiebreakers.
    let soFarClosestDistance = Infinity;

    // The while loop checks that the square scan hasn't scanned the whole grid.
    while(queryCol + manhattanDistance < width || queryCol - manhattanDistance >= 0 || queryRow + manhattanDistance < height || queryRow - manhattanDistance >= 0){
        // Every loop scans a layer.
        // Check if the soFarClosest must be the overall closest. Does this by checking if a closer cell can be encountered.
        if(soFarClosest !== null){
            if(manhattanDistance > soFarClosestDistance){
                // TODO: count up closests in case of distance ties
                return getMostCommon(soFarClosest);
            }
        }
        // Top scan. Fixed row < queryRow. column from lessthan queryColumn to greater.
        /* 
          S--->E#       Positive is down and to the right. S is for start, E is for end, Q for query
          #######
          #######
          ###Q###
          #######
          #######
          #######
        */
        for(let i = 0; i < manhattanDistance * 2; i++){
            let rowOffset =  -manhattanDistance
            let colOffset = -manhattanDistance + i;
            let cellValue = grid[queryRow+ rowOffset]?.[queryCol + colOffset]
            if(cellValue !== undefined){
                // A HIT!
                const euclidDistance = Math.hypot(rowOffset, colOffset);
                // Check if the best so far.
                if(euclidDistance < soFarClosestDistance){
                    soFarClosest = [cellValue];
                    soFarClosestDistance = euclidDistance;
                }
                // Check if tied for the best.
                if(euclidDistance === soFarClosestDistance){
                    soFarClosest.push(cellValue);
                }
            }
        }
        // Right scan. Fixed column > queryCol. row from lessthan queryRow to greater.
        /*           
          ######S
          ######|
          ######|
          ###Q##|
          ######V
          ######E
          #######
        */
        // TODO NOT CHANGED YET
        for(let i = 0; i < manhattanDistance * 2; i++){
            let rowOffset =  -manhattanDistance + i
            let colOffset = manhattanDistance;
            let cellValue = grid[queryRow+ rowOffset]?.[queryCol + colOffset]
            if(cellValue !== undefined){
                // A HIT!
                const euclidDistance = Math.hypot(rowOffset, colOffset);
                // Check if the best so far.
                if(euclidDistance < soFarClosestDistance){
                    soFarClosest = [cellValue];
                    soFarClosestDistance = euclidDistance;
                }
                // Check if tied for the best.
                if(euclidDistance === soFarClosestDistance){
                    soFarClosest.push(cellValue);
                }
            }
        }

        // Bootom scan. Fixed row > queryCol. col from greaterthan queryRow to less.
        /*           
          #######
          #######
          #######
          ###Q###
          #######
          #######
          #E<---S
        */
        // TODO NOT CHANGED YET
        for(let i = 0; i < manhattanDistance * 2; i++){
            let rowOffset =  manhattanDistance;
            let colOffset = manhattanDistance - i;
            let cellValue = grid[queryRow+ rowOffset]?.[queryCol + colOffset]
            if(cellValue !== undefined){
                // A HIT!
                const euclidDistance = Math.hypot(rowOffset, colOffset);
                // Check if the best so far.
                if(euclidDistance < soFarClosestDistance){
                    soFarClosest = [cellValue];
                    soFarClosestDistance = euclidDistance;
                }
                // Check if tied for the best.
                if(euclidDistance === soFarClosestDistance){
                    soFarClosest.push(cellValue);
                }
            }
        }

        // Left scan. Fixed col < queryCol. row from greaterthan queryRow to less.
        /*           
          #######
          E######
          ^######
          |##Q###
          |######
          |######
          S######
        */
        // TODO NOT CHANGED YET
        for(let i = 0; i < manhattanDistance * 2; i++){
            let rowOffset =  manhattanDistance - i;
            let colOffset = -manhattanDistance ;
            let cellValue = grid[queryRow+ rowOffset]?.[queryCol + colOffset]
            if(cellValue !== undefined){
                // A HIT!
                const euclidDistance = Math.hypot(rowOffset, colOffset);
                // Check if the best so far.
                if(euclidDistance < soFarClosestDistance){
                    soFarClosest = [cellValue];
                    soFarClosestDistance = euclidDistance;
                }
                // Check if tied for the best.
                if(euclidDistance === soFarClosestDistance){
                    soFarClosest.push(cellValue);
                }
            }
        }

        // TODO: update manhattan distance
        manhattanDistance += 1; 
    }
    // Exiting the loop means you exceeded the bounds of the grid.
    // TODO: count up closests in case of distance ties
    // Case 1: no neighbor found
    if(soFarClosest.length === 0){
        return null;
        console.log('No Neighbor Found')
    }
    // Case 2: clear nearest neighbor found
    if(soFarClosest.length === 1){
        return soFarClosest[0];
    }
    // Case 3: multiple nearest neighbor.
    else{
        //
        return getMostCommon(soFarClosest);
    }
}

// Takes an array of elements. Returns a map whose keys are unique elements in the array and the values are counts of those elements.
function getCounts(array){
    let map = new Map();
    for(let element of array){
        map.set(element, (map.get(element)? map.get(element): 0) + 1);
    }
    return map;
}
// Takes an array of elements. Returns the element with the most copys in the array.
function getMostCommon(array){
    let countMap = getCounts(array);
    let countArray = [...countMap];
    let bestElement = null;
    let bestCount = 0;
    for(let [element, count] of countArray){
        if(count > bestCount){
            bestElement = element
        }
    }
    return bestElement;
}

export default findNearestNeighbor;