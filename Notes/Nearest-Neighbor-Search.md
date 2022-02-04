# Nearest Neighbor Search
## Motivation
The nearest neighbor search is used in forward method projection creation to resolve untouched spots. The need of the NN search is that in the forward method since you are itterating over lat/long values and not pixels there is no garentee that you will touch every pixel. Even if you do other methods to minamize the number of mixed pixels the only way to ensure a pixel is hit is a backwards method, which introduces the complexity that the forwards method was trying to avoid.

So the question is what to do with untouched pixels and asside from giving up you can make a guess on what value the pixel has from pixels with known values. A smart way to do this is a NN search.
 
## Description
The NN search finds the nearest touched pixel and returns its info. Now what does nearest mean? Well it is not possible to use the lat long positions to find the true earth distance because we don't know the lat/long of the untouched point and finding it would be using a backwards method. Because the map is likely locally euclidian it makes sense to use euclidian distance over something like manhattan. 

## Some thoughts on method
Because the data we are sorting over is discreet there is a good chance there are ties. In that case the most common result is kept and if there is a tie there too the result can be any one. 

It is not easy to actually go closestpoint by closest point, and impossible to speed up asymptotically. So Best to do it just using a square scan.