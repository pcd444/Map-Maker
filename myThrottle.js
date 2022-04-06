export default function myThrottle(fun, time){
    // Takes a method and returns a throttled version of the function. Assumes that the function is side effect only.
    // The behavior is, if the function is ready run the function, set ready to false, and setTimeout to reready the function in x ms
    // if the function is not ready to run set the run on ready to true.
    let ready = true;
    let runOnReady = false;
    return(
        function (...args){
            if(ready){
                // set ready to false
                ready = false;
                // run fun with args
                fun(...args);
                // Set up setTimeout
                setTimeout(onReady,time);
            }
            else{
                runOnReady = args;
            }
        }
    );
    function onReady(){
        ready = true;
        if(runOnReady){
            fun(...runOnReady);
        }
        runOnReady = false;
    }
}