# Nearest Neighbor Search
## Motivation
The nearest neighbor search is used in forward method projection creation to resolve untouched spots. The need of the NN search is that in the forward method since you are itterating over lat/long values and not pixels there is no garentee that you will touch every pixel. Even if you do other methods to minamize the number of mixed pixels the only way to ensure a pixel is hit is a backwards method, which introduces the complexity that the forwards method was trying to avoid.

So the question is what to do with untouched pixels and asside from giving up you can make a guess on what value the pixel has from pixels with known values. A smart way to do this is a NN search.
 
## Description
The NN search finds the nearest touched pixel and returns its info. Now what does nearest mean? Well it is not possible to use the lat long positions to find the true earth distance because we don't know the lat/long of the untouched point and finding it would be using a backwards method. Because the map is likely locally euclidian it makes sense to use euclidian distance over something like manhattan. 

## Some thoughts on method
Because the data we are sorting over is discreet there is a good chance there are ties. In that case the most common result is kept and if there is a tie there too the result can be any one. 

It is not easy to actually go closestpoint by closest point, and ~~impossible to speed up asymptotically~~ (No longer sure of this). So Best to do it just using a square scan.

## Description of square scan method.
The method is called square scan because it doesn't try to look at cells in a perfect order but scans a square around the query cell. The first non empty cell scanned might not be the actuall nearest neighbor. Because of this after a non empty cell is encountered you have to look to see if there is a better cell. this can be done by searching out to a manhattan distance of equal to the actuall distance that you found. 

## In depth descriptoin of square scan. 
Scan higher and higher manhattan distances from the query cell until you find a hit. When you find a hit record the distance to the cell and finish the scan of that layer. If you encounter any other hits on that scan check if they are as good or better than the so far best hit and deal accordingly (adding to list or replacing og). Now that that layer is scanned take the euclidian distance to the query cell and call it d. Scan more layers until you reach one for higher manhattan distance than d, updating when encountering hits appropriately.
At any time in the previous steps if you find that you have scanned the entire grid, return the found cell if you did find one or return null (or maybe error out).