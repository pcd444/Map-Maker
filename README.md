# Map Maker
First a small note about the github language breakdown. The reason it is so heavily html is because there is a HUGE svg baked into the html currently. The svg is more than 2000 lines long.

## What is this. 
A toy webapp for generating map projections of the earth. 

## User Guide
Put in your faviorite projections formulas in the X= and Y= inputs, as well as providing the theta and phi bounds (fancy words for lattitude and longitude) that you would like the map be confined to. If all inputs are correct the Map X/Y bounds will be auto calculated for you as well as some pixel dimensions for the canvas. If you would like to increase or decrease you can use the slider to pick a different resolution or, if you want a specific pixel values set them by hand. But be careful if you set the pixel dimensions by hand and they don't match up properly with the X/Y dimensions you wont be able to project. 

Now you are ready to hit the Project button and wait for your image to appear. Once the image has appeared you can scroll down to the color pickers and choose what color you want to make different countries.

Finally you can hit the save as PNG button to save the projection as a PNG.


## Dev Guide: How does it work internally.
1. The user provides the map projection formulas as text, as well as the range of latitude and longitude that he wants projected. 
2. The map projection formulas are parsed by mathjs library.
3. A grid of lat/longitude points are generated. 
4. Those points are projected by the projection formula to get X, Y coordinates for where they will end up.
5. Now that we know where those points end up we need to find out what was at that lat/long in order to know how to color the location. To achive that we have a hidden iframe that contains an SVG of the earth which we can do point queries on. (More details below)
6. Now that we know where those lat longitude points are on the final map, and what was at the lat/long point, we can now color in the canvas with the appropriate user controlled color.
### Details on the point querying method.
There is a dom api method [document.elementFromPoint](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint). This method takes two arguments X and Y and finds and returns the element X units to the right and Y units down from the viewport. The method works well with SVGs. Say if you have an svg that is like a donut with a gap in the center, element from point will not return the donut if the coordiates land inside the hole but will return the element if between the hole and the edge. 

Using document.elementFromPoint and an SVG of an equirectangular projection you can do lattitude/longitude queries. It has to be an equirectangular projection because then the relationship between X/Y and lat/long is simple. 

One issue is that because `elementFromPoint` queries relative to the viewport the results would change if the SVG got bumped around after pageload by dom changes, or even if the user scrolled. Also it would be aqward having a whole svg in the users face with seemingly no purpose.

The solution to both of the above problems is to put the SVG in a hidden iframe. The JS inside the iframe will take use the iframe as the viewport in `elementFromPoint` so the queries wont be effected by scrolling etc. 

The hiding of the viewport has to be done in a specific way. If you set `display: none` or `opacity: 0`. What you have to do is set `height` and `width` to zero, and set `overflow` to `hidden`.

## Why is it so terribly slow?
I wish i could say it was because the math behind the projection was just so cool and complicated, but is actually because `document.elementFromPoint` is VERY slow. I profiled the code in chrome devtools and it was something like 99% of the workload. But sadly I am probably not going to fix it as this is mostly a toy project.

I didn't expect `elementFromPoint` to be so slow, I though that since it was native code that it might be pretty fast. But probably crossing the JS to API layer causes a big slowdown. Also I'm not certian but I don't think chrome uses any fancy point query algorithm. I poked around in Chromium to see what they did and it sounded like maybe an intermediate painting layer was used to do the queries but I am not sure as I don't really know C++.
