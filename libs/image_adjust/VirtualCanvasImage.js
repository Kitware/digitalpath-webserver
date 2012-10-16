/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/CanvasImage.js
 */

/**
 * Class: OpenLayers.Tile.VirtualCanvasImage
 * Instances of OpenLayers.Tile.VirtualCanvasImage are used when the
 * canvas type is OpenLayers.Layer.ONECANVASPERLAYER.
 * A VirtualCanvasImage does not have a canvas itself, it just loads
 * a tile and then the image is drawn by the <OpenLayers.Layer.Grid>
 * layer.
 * 
 * Inherits from:
 *  - <OpenLayers.CanvasImage>
 */
OpenLayers.Tile.VirtualCanvasImage = OpenLayers.Class(OpenLayers.Tile.CanvasImage, {


    /** TBD 3.0 - reorder the parameters to the init function to remove 
     *             URL. the getUrl() function on the layer gets called on 
     *             each draw(), so no need to specify it here.
     * 
     * Constructor: OpenLayers.Tile.VirtualCanvasImage
     * Constructor for a new <OpenLayers.Tile.VirtualCanvasImage> instance.
     * 
     * Parameters:
     * layer - {<OpenLayers.Layer>} layer that the tile will go in.
     * position - {<OpenLayers.Pixel>}
     * bounds - {<OpenLayers.Bounds>}
     * url - {<String>} Deprecated. Remove me in 3.0.
     * size - {<OpenLayers.Size>}
     * canvasType - {<OpenLayers.Layer.Grid.ONECANVASPERLAYER|OpenLayers.Layer.Grid.ONECANVASPERTILE>}
     */   
    initialize: function(layer, position, bounds, url, size, canvasType) {
        // note that we are not calling the <OpenLayers.Tile.CanvasImage>
        // constructor, we don't need a frame element
        OpenLayers.Tile.prototype.initialize.apply(this, arguments);

        this.url = url; //deprecated remove me
        this.canvasType = canvasType;
    },

    /** 
     * APIMethod: destroy
     * nullify references to prevent circular references and memory leaks
     */
    destroy: function() {
        OpenLayers.Tile.CanvasImage.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: clone
     *
     * Parameters:
     * obj - {<OpenLayers.Tile.Image>} The tile to be cloned
     *
     * Returns:
     * {<OpenLayers.Tile.Image>} An exact clone of this <OpenLayers.Tile.Image>
     */
    clone: function (obj) {
        obj = OpenLayers.Tile.CanvasImage.prototype.clone.apply(this, arguments);
        return obj;
    },
    
    initCanvas: function() {
        // no canvas to initialize
    },
    
    /**
     * Method: positionImage
     * Sets the position and size of the tile's frame and
     * canvas element.
     */
    positionImage: function() {
        // if the this layer doesn't exist at the point the image is
        // returned, do not attempt to use it for size computation
        if (this.layer == null) {
            return;
        }
        
        this.createImage();
    },
    
    /**
     * Method: onLoadFunction
     * Called when an image successfully finished loading. Draws the
     * image on the canvas.
     * 
     * Parameters:
     * context - {<Object>} The context from the onload event.
     */
    onLoadFunction: function(context) {
        if ((this.layer === null) ||
                (context.viewRequestID !== this.layer.map.viewRequestID) ||
                (context.image !== this.lastImage)) {
            return;
        }   
        
        var image = context.image;
        this.displayImage(image);
    },
    
        /**
     * Method: displayImage
     * Takes care of resizing the canvas and then draws the 
     * canvas.
     * 
     * Parameters:
     * image - {Image/Canvas} The image to display
     */
    displayImage: function(image) {
        if (this.layer.canvasFilter && !image.filtered) {
            // if a filter is set, apply the filter first and
            // then use the result
            this.filter(image);
            return;
        } 
        
        this.layer.drawCanvasTile(image, this.lastBounds);
        
        this.isLoading = false; 
        this.events.triggerEvent("loadend"); 
    },
    
    /**
     * Method: startTransition
     * Creates a backbuffer tile (if it does not exist already)
     * and then displays this tile. 
     * 
     * Parameters:
     * drawTile - {<Boolean>} Should the tile be drawn?
     */
    startTransition: function(drawTile) {
        // <OpenLayers.Layer.Grid> takes care about the transition  
    },
    
    CLASS_NAME: "OpenLayers.Tile.VirtualCanvasImage"
  }
);
