/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * Class: OpenLayers.Tile.CanvasFilter
 * This class is supposed to be sub classed. Instances of sub classes can
 * be set on 'canvasFilter' in <OpenLayers.Layer.Grid> layers. See
 * 'examples/processingCanvas.html' for an example sub class.
 * 
 * <OpenLayers.Tile.CanvasFilter> is used to change the pixel data of
 * an image before it is drawn on a canvas (for example to adjust the 
 * brightness of tiles).
 * 
 * Inherits from:
 *  - <OpenLayers.Class>
 */
OpenLayers.Tile.CanvasFilter = OpenLayers.Class({

    /**
     * APIProperty: webworkerScript
     * {String} The path to the web worker script which is called, when
     *          the filter should be executed asynchronously.
     */     
    webworkerScript: null,

    /**
     * APIProperty: numberOfWebWorkers
     * {Integer} The number of web workers to use.
     */  
    numberOfWebWorkers: 4,

    /**
     * Constructor: OpenLayers.Tile.Image
     * Constructor for a new <OpenLayers.Tile.CanvasFilter> instance.
     */   
    initialize: function() {},
    
    /** 
     * APIMethod: supportsAsync
     * Indicates if the filter support the execution in a web worker.
     */
    supportsAsync: function() {
        return false;    
    },

    /** 
     * APIMethod: getParameters
     * Can be overridden in sub classes to pass additional parameters
     * to the web worker script.
     */
    getParameters: function() {
        return {};    
    },
    
    /**
     * APIMethod: process
     * This method is called if the filter process should not be executed in
     * a web worker. The method is supposed to return a canvas element which
     * is drawn on the tile's canvas.
     * 
     * Parameters:
     * image - {Image} image of the tile
     * 
     * Returns:
     * {Canvas}
     */
    process: function(image) {
        throw "method 'process(image)' must be implemented in sub class";
    },

    /**
     * APIMethod: processAsync
     * This method is called if the filter process should not be executed in
     * a web worker. The method is supposed to return a canvas element which
     * is drawn on the tile's canvas.
     * 
     * Parameters:
     * image - {Image} Image of the tile
     * callbackDone - {Function} Called when the filter was applied
     * callbackStatus - {Function} Called to report the progress
     * callbackError - {Function} Called in case of an error inside the web worker
     */    
    processAsync: function(image, callbackDone, callbackStatus, callbackError) {
        if (!this.supportsAsync() || this.webworkerScript === null) {
            return;
        }
        
        var context = {
            filter: this,
            image: image    
        };
        
        // create a canvas elements and set the ImageData object
        this.drawImage(context);
        
        // this method will be called when all web workers
        // completed, successful or not
        var callbackFinished = function(event) {
            if (!event.error) {
                // coloring is finished, execute the callback function
                callbackDone(context.canvas);    
            } else {
                // one of the web workers reported an error, redirect this error
                if (callbackError) {
                    callbackError(event.error); 
                }  
            }
        };
        
        var barrier = new OpenLayers.Tile.CanvasFilter.CanvasBarrier(
                            this.numberOfWebWorkers, 
                            context.canvas.getContext("2d"), 
                            this.webworkerScript, 
                            callbackFinished,
                            callbackStatus,
                            this.getParameters());
                    
        barrier.start();
    },

    /**
     * Method: drawImage
     * Creates a canvas element for 'context.image' and draws the
     * image onto the canvas.
     * 
     * Parameters:
     * context - {Object}
     */      
    drawImage: function(context) {
        var width = context.image.width;
        var height = context.image.height; 
        
        // draw source image on the canvas
        context.canvas = this.createCanvas(width, height);
        context.canvasContext = context.canvas.getContext("2d");       
        context.canvasContext.drawImage(context.image, 0, 0);
    },
    
    /**
     * Method: createCanvas
     * Creates a canvas element with the given size.
     * 
     * Parameters:
     * width - {Integer}
     * height - {Integer}
     * 
     * Returns:
     * {Canvas}
     */ 
    createCanvas: function(width, height) {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        
        return canvas;    
    },

    CLASS_NAME: "OpenLayers.Tile.CanvasFilter"
  }
);

/**
 * Class: OpenLayers.Tile.CanvasFilter.CanvasBarrier
 * CanvasBarrier is a helper class, to execute an operation
 * on a canvas' pixel data in several web workers. The canvas
 * is cut into rows and each web worker independently processes
 * its part. When all web worker are finished, the method
 * 'callbackDone' is triggered.
 * 
 * Inherits from:
 *  - <OpenLayers.Class>
 */
OpenLayers.Tile.CanvasFilter.CanvasBarrier = OpenLayers.Class({

    /**
     * APIProperty: numberOfWorkers
     * {Integer} The number of web workers to use.
     */  
    numberOfWorkers: 4,

    /**
     * APIProperty: callbackDone
     * {Function} Called when all web workers are finished.
     */      
    callbackDone: null,

    /**
     * APIProperty: callbackStatus
     * {Function} Called on progress updates.
     */      
    callbackStatus: null,

    /**
     * APIProperty: canvasContext
     * {CanvasRenderingContext2D} The number of web workers to use.
     */  
    canvasContext: null,

    /**
     * APIProperty: workerScript
     * {String} The script that should be run in the web workers.
     */  
    workerScript: null,
    
    /**
     * APIProperty: parameters
     * {Object} Additional parameters passed to the web workers.
     */  
    parameters: null,
    
    /**
     * Property: runningWorkers
     * {Integer} The number of web workers that are currently active.
     */  
    runningWorkers: 0,

    /**
     * Property: error
     * {Object} Contains the error, if one web worker failed.
     */  
    error: null,
    
    /**
     * Constructor: OpenLayers.Tile.CanvasFilter.CanvasBarrier 
     * 
     * Parameters:
     * numberOfWorkers - {Integer} How many web worker should be used?
     * canvasContext - {CanvasRenderingContext2D} The canvas' drawing context.
     * workerScript - {String} Path to the script which contains the web worker code.
     * callbackDone - {Function} Triggered when all web workers are finished
     * callbackStatus - {Function} Optional, triggered on a status update.
     * parameters - {Object} Optional, additional parameters that are passed to each worker.
     */    
    initialize: function(numberOfWorkers, canvasContext, workerScript, callbackDone, 
                                                                callbackStatus, parameters) {
        this.numberOfWorkers = numberOfWorkers;
        this.callbackDone = callbackDone;
        this.callbackStatus = callbackStatus;
        this.canvasContext = canvasContext;
        this.workerScript = workerScript;
        this.parameters = parameters;
        
        this.runningWorkers = 0;
        this.error = null;
    },

    /**
     * Starts the web workers.
     */
    start: function() {
        var canvasWidth = this.canvasContext.canvas.width;
        var canvasHeight = this.canvasContext.canvas.height;
        
        this.runningWorkers = this.numberOfWorkers;
        this.progress = [];
        this.lastProgress = 0;
        
        // create a web worker for each row
        for (var i = 0; i < this.numberOfWorkers; i++) {
            this.progress.push(0);
            
            // get the position of this row
            var x = 0;
            var y = this.getRowPositionY(i, canvasHeight);
            var width =  canvasWidth;
            var height =  this.getRowPositionY(i+1, canvasHeight) - y;
            
            // get the pixel data for this row
            var imageData = this.canvasContext.getImageData(x, y, width, height);
            
            // now we could use the keyword 'let' for not having to do this cascaded closures:
            // https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Working_with_Closures#Creating_closures_in_loops.3a_A_common_mistake
            var onMessage = this.getOnMessageCallback(i, this.canvasContext, x, y, this);
            var onError = this.getOnErrorCallback(this);
            
            // start a web worker
            var worker = new Worker(this.workerScript);
            worker.onmessage = onMessage;
            worker.onerror = onError;
            
            var task = {
                parameters: this.parameters,
                imageData: imageData
            }
            
            worker.postMessage(task);   
        }    
    },
    
    /**
     * Returns the y-position for the given row. 
     * 
     * Parameters:
     * i - {Integer} Row index
     * height - {Integer} The canvas' height
     * 
     * Returns: 
     * {Integer} Y-Position
     */
    getRowPositionY: function(i,height) {
        return Math.floor(height / this.numberOfWorkers * i);    
    },
    
    /**
     * Returns a callback function that is used as
     * onmessage handler for the web worker.
     * 
     * Parameters:
     * index - {Integer} Row index
     * canvasContext - {CanvasRenderingContext2D} Canvas context
     * x - {Integer} X-Position of the row 
     * y - {Integer} Y-Position of the row
     * barrier - {<OpenLayers.Tile.CanvasFilter.CanvasBarrier>} barrier
     * 
     * Returns: 
     * {Function}
     */
    getOnMessageCallback: function(index, canvasContext, x, y, barrier) {
        var context =  {
                    index: index,
                    canvasContext: canvasContext,
                    x: x,
                    y: y,
                    barrier: barrier    
        };  
        
        return function(event) {
            if (event.data.status === "progress" && context.barrier.callbackStatus) {
                context.barrier.reportProgress(context.index, event.data.progress);
            } else if (event.data.status === "done") {
                var imageData = event.data.imageData;
                // directly write the row on the canvas
                context.canvasContext.putImageData(imageData, context.x, context.y);  
                context.barrier.checkRunningWorkers();     
            }                
        };
    },
    
    /**
     * Returns a callback function that is used as
     * onerror handler for the web worker.
     * 
     * Parameters:
     * barrier - {<OpenLayers.Tile.CanvasFilter.CanvasBarrier>} barrier
     * 
     * Returns: 
     * {Function}
     */
    getOnErrorCallback: function(barrier) {
        return function(error) {
            barrier.error = error;
            barrier.checkRunningWorkers();
        };
    },
    
    /**
     * Called from the onmessage and onerror callback. When
     * all web workers are finished, 'callbackDone' is triggered.
     */
    checkRunningWorkers: function() {
        this.runningWorkers--;
        
        if (this.runningWorkers === 0) {
            // all workers are finished
            this.callbackDone({
                    canvas: this.canvas,
                    error: this.error
                });
        }   
    },
    
    /**
     * Each web worker individually reports its progress. This method
     * calculates the overall progress and calls 'callbackStatus'.
     * 
     * Parameters:
     * index - {Integer} The row index.
     * progress - {Integer} The progress for this row.
     */
    reportProgress: function(index, progress) {
        // update the progress for this worker
        this.progress[index] = progress;
        
        // then calculate the overall progress of all workers
        var sum = 0;
        for (var i = 0; i < this.progress.length; i++) {
            sum += this.progress[i];
        }
        var overallProgress = Math.round(sum / (this.numberOfWorkers * 100) * 100);
        
        if (overallProgress > this.lastProgress) {
            this.lastProgress = overallProgress;
            this.callbackStatus(overallProgress); 
        }           
    },
    
    CLASS_NAME: "OpenLayers.Tile.CanvasFilter.CanvasBarrier"    
});
