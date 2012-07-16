/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Layer/HTTPRequest.js
 * @requires OpenLayers/Console.js
 */

/**
 * Class: OpenLayers.Layer.Grid
 * Base class for layers that use a lattice of tiles.  Create a new grid
 * layer with the <OpenLayers.Layer.Grid> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Layer.HTTPRequest>
 */
OpenLayers.Layer.Grid = OpenLayers.Class(OpenLayers.Layer.HTTPRequest, {
    
    /**
     * APIProperty: tileSize
     * {<OpenLayers.Size>}
     */
    tileSize: null,
    
    /**
     * Property: grid
     * {Array(Array(<OpenLayers.Tile>))} This is an array of rows, each row is 
     *     an array of tiles.
     */
    grid: null,

    /**
     * APIProperty: singleTile
     * {Boolean} Moves the layer into single-tile mode, meaning that one tile 
     *     will be loaded. The tile's size will be determined by the 'ratio'
     *     property. When the tile is dragged such that it does not cover the 
     *     entire viewport, it is reloaded.
     */
    singleTile: false,

    /** APIProperty: ratio
     *  {Float} Used only when in single-tile mode, this specifies the 
     *          ratio of the size of the single tile to the size of the map.
     */
    ratio: 1.5,

    /**
     * APIProperty: buffer
     * {Integer} Used only when in gridded mode, this specifies the number of 
     *           extra rows and colums of tiles on each side which will
     *           surround the minimum grid tiles to cover the map.
     */
    buffer: 2,

    /**
     * APIProperty: numLoadingTiles
     * {Integer} How many tiles are still loading?
     */
    numLoadingTiles: 0,
    
    /**
     * Property: useCanvas
     * {OpenLayers.Layer.Grid.NOCANVAS|OpenLayers.Layer.Grid.ONECANVASPERLAYER|
     *  OpenLayers.Layer.Grid.ONECANVASPERTILE} Whether or not to render a layer on a 
     *      canvas element.
     */
    useCanvas: null,
    
    /**
     * Property: canvas
     * The canvas element on which the tiles are drawn, when
     * ONECANVASPERLAYER is used.
     */
    canvas: null, 
    
    /** 
     * Property: canvasImageData
     * {ImageData} The ImageData object for the canvas.
     */
    canvasImageData: null,
    
    /**
     * Property: backBufferCanvas
     * Canvas element to create a scaled copy for the
     * transition resize effect (when ONECANVASPERLAYER is used).
     */
    backBufferCanvas: null, 
    
    /**
     * Property: lastResolution
     * The resolution when the canvas was drawn the last time.
     */
    lastResolution: null,
    
    /**
     * Property: lastCanvasPosition
     * The upper-left position of the canvas, when it 
     * was drawn the last time.
     */
    lastCanvasPosition: null,
    
    /**
     * Property: redrawCanvas
     * Indicates if the canvas element should be reset before
     * the next tile is drawn.
     */
    redrawCanvas: false,

    /**
     * APIProperty: canvasFilter
     * {OpenLayers.Tile.CanvasFilter} Only used for ONECANVASPERLAYER and ONECANVASPERTILE. Can be
     *          used to manipulate the pixel data of an image (for example to adjust the
     *          brightness of a tile).
     */
    canvasFilter: null,

    /**
     * APIProperty: canvasAsync
     * {Boolean} If set to true, the canvas filter and the reprojection (for WMS layers)
     *          will be executed in a web worker. Only supported in Chrome 6+.
     */    
    canvasAsync: false,

    /**
     * Constructor: OpenLayers.Layer.Grid
     * Create a new grid layer
     *
     * Parameters:
     * name - {String}
     * url - {String}
     * params - {Object}
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, url, params, options) {
        OpenLayers.Layer.HTTPRequest.prototype.initialize.apply(this, 
                                                                arguments);
        
        //grid layers will trigger 'tileloaded' when each new tile is 
        // loaded, as a means of progress update to listeners.
        // listeners can access 'numLoadingTiles' if they wish to keep track
        // of the loading progress
        //
        this.events.addEventType("tileloaded");
        
        // reports the progress of a tile filter
        this.events.addEventType("tileFilterProgress");

        this.grid = [];
        
        if (!this.useCanvas) {
            this.useCanvas = OpenLayers.Layer.Grid.NOCANVAS;
        }
             
        if (this.usesOneCanvasPerLayer()) {
            this.canvas = document.createElement("canvas");
            this.canvas.id = "Canvas_" + this.id;
            this.canvas.style.top = 0; 
            this.canvas.style.left = 0;
            this.canvas.style.position = "absolute";       
            this.div.appendChild(this.canvas);     
        }
    },

    /**
     * APIMethod: destroy
     * Deconstruct the layer and clear the grid.
     */
    destroy: function() {
        this.clearGrid();
        this.grid = null;
        this.tileSize = null;
        if (this.usesOneCanvasPerLayer()) {
            this.canvas = null;
        }
        OpenLayers.Layer.HTTPRequest.prototype.destroy.apply(this, arguments); 
    },

    /**
     * Method: clearGrid
     * Go through and remove all tiles from the grid, calling
     *    destroy() on each of them to kill circular references
     */
    clearGrid:function() {
        if (this.grid) {
            for(var iRow=0, len=this.grid.length; iRow<len; iRow++) {
                var row = this.grid[iRow];
                for(var iCol=0, clen=row.length; iCol<clen; iCol++) {
                    var tile = row[iCol];
                    this.removeTileMonitoringHooks(tile);
                    tile.destroy();
                }
            }
            this.grid = [];
        }
    },

    /**
     * APIMethod: clone
     * Create a clone of this layer
     *
     * Parameters:
     * obj - {Object} Is this ever used?
     * 
     * Returns:
     * {<OpenLayers.Layer.Grid>} An exact clone of this OpenLayers.Layer.Grid
     */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new OpenLayers.Layer.Grid(this.name,
                                            this.url,
                                            this.params,
                                            this.getOptions());
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.HTTPRequest.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here
        if (this.tileSize != null) {
            obj.tileSize = this.tileSize.clone();
        }
        
        // we do not want to copy reference to grid, so we make a new array
        obj.grid = [];

        return obj;
    },    

    /**
     * Method: moveTo
     * This function is called whenever the map is moved. All the moving
     * of actual 'tiles' is done by the map, but moveTo's role is to accept
     * a bounds and make sure the data that that bounds requires is pre-loaded.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * zoomChanged - {Boolean}
     * dragging - {Boolean}
     */
    moveTo:function(bounds, zoomChanged, dragging) {
        OpenLayers.Layer.HTTPRequest.prototype.moveTo.apply(this, arguments);
        
        bounds = bounds || this.map.getExtent();
        
        // when dragging do not redraw the whole canvas
        this.redrawCanvas = !dragging;
        this.dragging = dragging;
        
        if (this.usesTransition() && this.usesOneCanvasPerLayer()) {
            this.startTransition(zoomChanged, dragging);
        }
        
        if (bounds != null) {
            // if grid is empty or zoom has changed, we *must* re-tile
            var forceReTile = !this.grid.length || zoomChanged ||
                                (this.usesOneCanvasPerLayer() && !dragging);

            // total bounds of the tiles
            var tilesBounds = this.getTilesBounds();            
      
            if (this.singleTile) {
                
                // We want to redraw whenever even the slightest part of the 
                //  current bounds is not contained by our tile.
                //  (thus, we do not specify partial -- its default is false)
                if ( forceReTile || 
                     (!dragging && !tilesBounds.containsBounds(bounds))) {
                    this.initSingleTile(bounds);
                }
            } else {
             
                // if the bounds have changed such that they are not even 
                //  *partially* contained by our tiles (IE user has 
                //  programmatically panned to the other side of the earth) 
                //  then we want to reTile (thus, partial true).  
                //
                if (forceReTile || !tilesBounds.containsBounds(bounds, true)) {
                    this.initGriddedTiles(bounds);
                } else {
                    //we might have to shift our buffer tiles
                    this.moveGriddedTiles(bounds);
                }
            }
        }
    },
    
    /**
     * APIMethod: setTileSize
     * Check if we are in singleTile mode and if so, set the size as a ratio
     *     of the map size (as specified by the layer's 'ratio' property).
     * 
     * Parameters:
     * size - {<OpenLayers.Size>}
     */
    setTileSize: function(size) { 
        if (this.singleTile) {
            size = this.map.getSize();
            size.h = parseInt(size.h * this.ratio);
            size.w = parseInt(size.w * this.ratio);
        } 
        OpenLayers.Layer.HTTPRequest.prototype.setTileSize.apply(this, [size]);
    },
        
    /**
     * Method: getGridBounds
     * Deprecated. This function will be removed in 3.0. Please use 
     *     getTilesBounds() instead.
     * 
     * Returns:
     * {<OpenLayers.Bounds>} A Bounds object representing the bounds of all the
     * currently loaded tiles (including those partially or not at all seen 
     * onscreen)
     */
    getGridBounds: function() {
        var msg = "The getGridBounds() function is deprecated. It will be " +
                  "removed in 3.0. Please use getTilesBounds() instead.";
        OpenLayers.Console.warn(msg);
        return this.getTilesBounds();
    },

    /**
     * APIMethod: getTilesBounds
     * Return the bounds of the tile grid.
     *
     * Returns:
     * {<OpenLayers.Bounds>} A Bounds object representing the bounds of all the
     *     currently loaded tiles (including those partially or not at all seen 
     *     onscreen).
     */
    getTilesBounds: function() {    
        var bounds = null; 
        
        if (this.grid.length) {
            var bottom = this.grid.length - 1;
            var bottomLeftTile = this.grid[bottom][0];
    
            var right = this.grid[0].length - 1; 
            var topRightTile = this.grid[0][right];
    
            bounds = new OpenLayers.Bounds(bottomLeftTile.bounds.left, 
                                           bottomLeftTile.bounds.bottom,
                                           topRightTile.bounds.right, 
                                           topRightTile.bounds.top);
            
        }   
        return bounds;
    },

    /**
     * Method: initSingleTile
     * 
     * Parameters: 
     * bounds - {<OpenLayers.Bounds>}
     */
    initSingleTile: function(bounds) {

        //determine new tile bounds
        var center = bounds.getCenterLonLat();
        var tileWidth = bounds.getWidth() * this.ratio;
        var tileHeight = bounds.getHeight() * this.ratio;
                                       
        var tileBounds = 
            new OpenLayers.Bounds(center.lon - (tileWidth/2),
                                  center.lat - (tileHeight/2),
                                  center.lon + (tileWidth/2),
                                  center.lat + (tileHeight/2));
  
        var ul = new OpenLayers.LonLat(tileBounds.left, tileBounds.top);
        var px = this.getLayerPxFromLonLat(ul);

        if (!this.grid.length) {
            this.grid[0] = [];
        }

        var tile = this.grid[0][0];
        if (!tile) {
            tile = this.addTile(tileBounds, px);
            
            this.addTileMonitoringHooks(tile);
            tile.draw();
            this.grid[0][0] = tile;
        } else {
            tile.moveTo(tileBounds, px);
        }           
        
        //remove all but our single tile
        this.removeExcessTiles(1,1);
    },

    /** 
     * Method: calculateGridLayout
     * Generate parameters for the grid layout. This  
     *
     * Parameters:
     * bounds - {<OpenLayers.Bound>}
     * extent - {<OpenLayers.Bounds>}
     * resolution - {Number}
     *
     * Returns:
     * Object containing properties tilelon, tilelat, tileoffsetlat,
     * tileoffsetlat, tileoffsetx, tileoffsety
     */
    calculateGridLayout: function(bounds, extent, resolution) {
        var tilelon = resolution * this.tileSize.w;
        var tilelat = resolution * this.tileSize.h;
        
        var offsetlon = bounds.left - extent.left;
        var tilecol = Math.floor(offsetlon/tilelon) - this.buffer;
        var tilecolremain = offsetlon/tilelon - tilecol;
        var tileoffsetx = -tilecolremain * this.tileSize.w;
        var tileoffsetlon = extent.left + tilecol * tilelon;
        
        var offsetlat = bounds.top - (extent.bottom + tilelat);  
        var tilerow = Math.ceil(offsetlat/tilelat) + this.buffer;
        var tilerowremain = tilerow - offsetlat/tilelat;
        var tileoffsety = -tilerowremain * this.tileSize.h;
        var tileoffsetlat = extent.bottom + tilerow * tilelat;
        
        return { 
          tilelon: tilelon, tilelat: tilelat,
          tileoffsetlon: tileoffsetlon, tileoffsetlat: tileoffsetlat,
          tileoffsetx: tileoffsetx, tileoffsety: tileoffsety
        };

    },

    /**
     * Method: initGriddedTiles
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     */
    initGriddedTiles:function(bounds) {
        
        // work out mininum number of rows and columns; this is the number of
        // tiles required to cover the viewport plus at least one for panning

        var viewSize = this.map.getSize();
        var minRows = Math.ceil(viewSize.h/this.tileSize.h) + 
                      Math.max(1, 2 * this.buffer);
        var minCols = Math.ceil(viewSize.w/this.tileSize.w) +
                      Math.max(1, 2 * this.buffer);
        
        var extent = this.maxExtent;
        var resolution = this.map.getResolution();
        
        var tileLayout = this.calculateGridLayout(bounds, extent, resolution);

        var tileoffsetx = Math.round(tileLayout.tileoffsetx); // heaven help us
        var tileoffsety = Math.round(tileLayout.tileoffsety);

        var tileoffsetlon = tileLayout.tileoffsetlon;
        var tileoffsetlat = tileLayout.tileoffsetlat;
        
        var tilelon = tileLayout.tilelon;
        var tilelat = tileLayout.tilelat;

        this.origin = new OpenLayers.Pixel(tileoffsetx, tileoffsety);

        var startX = tileoffsetx; 
        var startLon = tileoffsetlon;

        var rowidx = 0;
        
        var layerContainerDivLeft = parseInt(this.map.layerContainerDiv.style.left);
        var layerContainerDivTop = parseInt(this.map.layerContainerDiv.style.top);
        
    
        do {
            var row = this.grid[rowidx++];
            if (!row) {
                row = [];
                this.grid.push(row);
            }

            tileoffsetlon = startLon;
            tileoffsetx = startX;
            var colidx = 0;
 
            do {
                var tileBounds = 
                    new OpenLayers.Bounds(tileoffsetlon, 
                                          tileoffsetlat, 
                                          tileoffsetlon + tilelon,
                                          tileoffsetlat + tilelat);

                var x = tileoffsetx;
                x -= layerContainerDivLeft;

                var y = tileoffsety;
                y -= layerContainerDivTop;

                var px = new OpenLayers.Pixel(x, y);
                var tile = row[colidx++];
                if (!tile) {
                    tile = this.addTile(tileBounds, px);
                    this.addTileMonitoringHooks(tile);
                    row.push(tile);
                } else {
                    tile.moveTo(tileBounds, px, false);
                }
     
                tileoffsetlon += tilelon;       
                tileoffsetx += this.tileSize.w;
            } while ((tileoffsetlon <= bounds.right + tilelon * this.buffer)
                     || colidx < minCols);
             
            tileoffsetlat -= tilelat;
            tileoffsety += this.tileSize.h;
        } while((tileoffsetlat >= bounds.bottom - tilelat * this.buffer)
                || rowidx < minRows);
        
        //shave off exceess rows and colums
        this.removeExcessTiles(rowidx, colidx);

        //now actually draw the tiles
        this.spiralTileLoad();
    },
    
    /**
     * Method: spiralTileLoad
     *   Starts at the top right corner of the grid and proceeds in a spiral 
     *    towards the center, adding tiles one at a time to the beginning of a 
     *    queue. 
     * 
     *   Once all the grid's tiles have been added to the queue, we go back 
     *    and iterate through the queue (thus reversing the spiral order from 
     *    outside-in to inside-out), calling draw() on each tile. 
     */
    spiralTileLoad: function() {
        var tileQueue = [];
 
        var directions = ["right", "down", "left", "up"];

        var iRow = 0;
        var iCell = -1;
        var direction = OpenLayers.Util.indexOf(directions, "right");
        var directionsTried = 0;
        
        while( directionsTried < directions.length) {

            var testRow = iRow;
            var testCell = iCell;

            switch (directions[direction]) {
                case "right":
                    testCell++;
                    break;
                case "down":
                    testRow++;
                    break;
                case "left":
                    testCell--;
                    break;
                case "up":
                    testRow--;
                    break;
            } 
    
            // if the test grid coordinates are within the bounds of the 
            //  grid, get a reference to the tile.
            var tile = null;
            if ((testRow < this.grid.length) && (testRow >= 0) &&
                (testCell < this.grid[0].length) && (testCell >= 0)) {
                tile = this.grid[testRow][testCell];
            }
            
            if ((tile != null) && (!tile.queued)) {
                //add tile to beginning of queue, mark it as queued.
                tileQueue.unshift(tile);
                tile.queued = true;
                
                //restart the directions counter and take on the new coords
                directionsTried = 0;
                iRow = testRow;
                iCell = testCell;
            } else {
                //need to try to load a tile in a different direction
                direction = (direction + 1) % 4;
                directionsTried++;
            }
        } 
        
        // now we go through and draw the tiles in forward order
        for(var i=0, len=tileQueue.length; i<len; i++) {
            var tile = tileQueue[i];
            tile.draw();
            //mark tile as unqueued for the next time (since tiles are reused)
            tile.queued = false;       
        }
    },

    /**
     * APIMethod: addTile
     * Gives subclasses of Grid the opportunity to create an 
     * OpenLayer.Tile of their choosing. The implementer should initialize 
     * the new tile and take whatever steps necessary to display it.
     *
     * Parameters
     * bounds - {<OpenLayers.Bounds>}
     * position - {<OpenLayers.Pixel>}
     *
     * Returns:
     * {<OpenLayers.Tile>} The added OpenLayers.Tile
     */
    addTile:function(bounds,position) {
        if (this.useCanvas === OpenLayers.Layer.Grid.ONECANVASPERTILE) {
            return new OpenLayers.Tile.CanvasImage(this, position, bounds, 
                                         null, this.tileSize, this.useCanvas);
        } else if (this.useCanvas === OpenLayers.Layer.Grid.ONECANVASPERLAYER) {
            return new OpenLayers.Tile.VirtualCanvasImage(this, position, bounds, 
                                         null, this.tileSize, this.useCanvas);
        } else {
            return new OpenLayers.Tile.Image(this, position, bounds, 
                                         null, this.tileSize, this.useCanvas);        
        }
    },
    
    /** 
     * Method: addTileMonitoringHooks
     * This function takes a tile as input and adds the appropriate hooks to 
     *     the tile so that the layer can keep track of the loading tiles.
     * 
     * Parameters: 
     * tile - {<OpenLayers.Tile>}
     */
    addTileMonitoringHooks: function(tile) {
        
        tile.onLoadStart = function() {
            //if that was first tile then trigger a 'loadstart' on the layer
            if (this.numLoadingTiles == 0) {
                this.events.triggerEvent("loadstart");
            }
            this.numLoadingTiles++;
        };
        tile.events.register("loadstart", this, tile.onLoadStart);
      
        tile.onLoadEnd = function() {
            this.numLoadingTiles--;
            this.events.triggerEvent("tileloaded");
            //if that was the last tile, then trigger a 'loadend' on the layer
            if (this.numLoadingTiles == 0) {
                this.events.triggerEvent("loadend");
            }
        };
        tile.events.register("loadend", this, tile.onLoadEnd);
        tile.events.register("unload", this, tile.onLoadEnd);
              
        // register an event to monitor the filter progress
        tile.onFilterProgress = function(event) {
        	// just redirect the event
            this.events.triggerEvent("tileFilterProgress", event);
        };
        tile.events.register("filterProgress", this, tile.onFilterProgress);
    },

    /** 
     * Method: removeTileMonitoringHooks
     * This function takes a tile as input and removes the tile hooks 
     *     that were added in addTileMonitoringHooks()
     * 
     * Parameters: 
     * tile - {<OpenLayers.Tile>}
     */
    removeTileMonitoringHooks: function(tile) {
        tile.unload();
        tile.events.un({
            "loadstart": tile.onLoadStart,
            "loadend": tile.onLoadEnd,
            "unload": tile.onLoadEnd,
            "filterProgress": tile.onFilterProgress,
            scope: this
        });
    },
    
    /**
     * Method: moveGriddedTiles
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     */
    moveGriddedTiles: function(bounds) {
        var buffer = this.buffer || 1;
        while (true) {
            var tlLayer = this.grid[0][0].position;
            var tlViewPort = 
                this.getViewPortPxFromLayerPx(tlLayer);
            if (tlViewPort.x > -this.tileSize.w * (buffer - 1)) {
                this.shiftColumn(true);
            } else if (tlViewPort.x < -this.tileSize.w * buffer) {
                this.shiftColumn(false);
            } else if (tlViewPort.y > -this.tileSize.h * (buffer - 1)) {
                this.shiftRow(true);
            } else if (tlViewPort.y < -this.tileSize.h * buffer) {
                this.shiftRow(false);
            } else {
                break;
            }
        };
    },

    /**
     * Method: shiftRow
     * Shifty grid work
     *
     * Parameters:
     * prepend - {Boolean} if true, prepend to beginning.
     *                          if false, then append to end
     */
    shiftRow:function(prepend) {
        var modelRowIndex = (prepend) ? 0 : (this.grid.length - 1);
        var grid = this.grid;
        var modelRow = grid[modelRowIndex];

        var resolution = this.map.getResolution();
        var deltaY = (prepend) ? -this.tileSize.h : this.tileSize.h;
        var deltaLat = resolution * -deltaY;

        var row = (prepend) ? grid.pop() : grid.shift();

        for (var i=0, len=modelRow.length; i<len; i++) {
            var modelTile = modelRow[i];
            var bounds = modelTile.bounds.clone();
            var position = modelTile.position.clone();
            bounds.bottom = bounds.bottom + deltaLat;
            bounds.top = bounds.top + deltaLat;
            position.y = position.y + deltaY;
            row[i].moveTo(bounds, position);
        }

        if (prepend) {
            grid.unshift(row);
        } else {
            grid.push(row);
        }
    },

    /**
     * Method: shiftColumn
     * Shift grid work in the other dimension
     *
     * Parameters:
     * prepend - {Boolean} if true, prepend to beginning.
     *                          if false, then append to end
     */
    shiftColumn: function(prepend) {
        var deltaX = (prepend) ? -this.tileSize.w : this.tileSize.w;
        var resolution = this.map.getResolution();
        var deltaLon = resolution * deltaX;

        for (var i=0, len=this.grid.length; i<len; i++) {
            var row = this.grid[i];
            var modelTileIndex = (prepend) ? 0 : (row.length - 1);
            var modelTile = row[modelTileIndex];
            
            var bounds = modelTile.bounds.clone();
            var position = modelTile.position.clone();
            bounds.left = bounds.left + deltaLon;
            bounds.right = bounds.right + deltaLon;
            position.x = position.x + deltaX;

            var tile = prepend ? this.grid[i].pop() : this.grid[i].shift();
            tile.moveTo(bounds, position);
            if (prepend) {
                row.unshift(tile);
            } else {
                row.push(tile);
            }
        }
    },
    
    /**
     * Method: removeExcessTiles
     * When the size of the map or the buffer changes, we may need to
     *     remove some excess rows and columns.
     * 
     * Parameters:
     * rows - {Integer} Maximum number of rows we want our grid to have.
     * colums - {Integer} Maximum number of columns we want our grid to have.
     */
    removeExcessTiles: function(rows, columns) {
        
        // remove extra rows
        while (this.grid.length > rows) {
            var row = this.grid.pop();
            for (var i=0, l=row.length; i<l; i++) {
                var tile = row[i];
                this.removeTileMonitoringHooks(tile);
                tile.destroy();
            }
        }
        
        // remove extra columns
        while (this.grid[0].length > columns) {
            for (var i=0, l=this.grid.length; i<l; i++) {
                var row = this.grid[i];
                var tile = row.pop();
                this.removeTileMonitoringHooks(tile);
                tile.destroy();
            }
        }
    },

    /**
     * Method: onMapResize
     * For singleTile layers, this will set a new tile size according to the
     * dimensions of the map pane.
     */
    onMapResize: function() {
        if (this.singleTile) {
            this.clearGrid();
            this.setTileSize();
        }
    },
    
    /**
     * APIMethod: getTileBounds
     * Returns The tile bounds for a layer given a pixel location.
     *
     * Parameters:
     * viewPortPx - {<OpenLayers.Pixel>} The location in the viewport.
     *
     * Returns:
     * {<OpenLayers.Bounds>} Bounds of the tile at the given pixel location.
     */
    getTileBounds: function(viewPortPx) {
        var maxExtent = this.maxExtent;
        var resolution = this.getResolution();
        var tileMapWidth = resolution * this.tileSize.w;
        var tileMapHeight = resolution * this.tileSize.h;
        var mapPoint = this.getLonLatFromViewPortPx(viewPortPx);
        var tileLeft = maxExtent.left + (tileMapWidth *
                                         Math.floor((mapPoint.lon -
                                                     maxExtent.left) /
                                                    tileMapWidth));
        var tileBottom = maxExtent.bottom + (tileMapHeight *
                                             Math.floor((mapPoint.lat -
                                                         maxExtent.bottom) /
                                                        tileMapHeight));
        return new OpenLayers.Bounds(tileLeft, tileBottom,
                                     tileLeft + tileMapWidth,
                                     tileBottom + tileMapHeight);
    },
    
    /**
     * Method: drawCanvasTile
     * Called when a image finished loading, draws the image
     * on the canvas element.
     * 
     * Parameters:
     * image - {<Image>} The tile to draw
     * bounds - {<OpenLayers.Bounds>} The bounds of the tile.
     */
    drawCanvasTile: function(image, bounds) {
        if (this.dragging) {
            return;
        }
        
        // if this is the first tile of a render request, move canvas back to 
        // original position and reset background
        this.resetCanvas();
        
        var upperLeft = new OpenLayers.LonLat(bounds.left, bounds.top);
        var px = this.getLayerPxFromLonLat(upperLeft);
        
        var ctx = this.canvas.getContext('2d');
        try {
            ctx.drawImage(image, px.x, px.y);
            this.canvasImageData = null;
        } catch (exc) {
            console.log('drawImage failed: ' + image.src); // todo
        }            
    },
    
    /**
     * Method: resetCanvas
     * Moves the canvas element back to its original position and 
     * resets the drawing surface.
     */
    resetCanvas: function() {
        if (this.redrawCanvas) {
            this.redrawCanvas = false;
            
            // because the layerContainerDiv has shifted position (for non canvas layers), reposition the canvas.
            this.canvas.style.left = -parseInt(this.map.layerContainerDiv.style.left) + "px";
            this.canvas.style.top = -parseInt(this.map.layerContainerDiv.style.top) + "px";
            
            // clear canvas by reseting the size
            // broken in Chrome 6.0.458.1:
            // http://code.google.com/p/chromium/issues/detail?id=49151
            this.canvas.width = this.map.viewPortDiv.clientWidth;
            this.canvas.height = this.map.viewPortDiv.clientHeight;
            
            if (this.usesTransition() && this.usesOneCanvasPerLayer()) {
                // store the current resolution and canvas position for transition
                this.lastResolution = this.map.getResolution(); 
                var canvasPosition = new OpenLayers.Pixel(this.canvas.style.left, this.canvas.style.top); 
                this.lastCanvasPosition = this.map.getLonLatFromLayerPx(canvasPosition);
            }
        }        
    },
    
    /**
     * Method: startTransition
     * Start the transition: create a copy of the 
     * canvas element, scale the copy and then draw the copy 
     * back on the original canvas.
     * 
     * Parameters:
     * zoomChanged - {<Boolean>}
     * dragging - {<Boolean>}
     */
    startTransition: function(zoomChanged, dragging) {
        if (!zoomChanged || dragging || 
            (this.lastResolution === null) || (this.lastCanvasPosition === null)) {
            return;
        }
        
        var ratio = this.lastResolution / this.map.getResolution();
        var px = this.getLayerPxFromLonLat(this.lastCanvasPosition);
        
        // create a scaled copy of the canvas
        if (this.backBufferCanvas == null) {
            this.backBufferCanvas = document.createElement('canvas');
            this.backBufferCanvas.style.display = 'none';
        }
        
        this.backBufferCanvas.width = this.canvas.width * ratio;
        this.backBufferCanvas.height = this.canvas.height * ratio;
        
        var zoomcontext = this.backBufferCanvas.getContext('2d');
        zoomcontext.scale(ratio, ratio);
        zoomcontext.drawImage(this.canvas, 0, 0);
        
        // and then draw this copy on the original canvas 
        this.resetCanvas();

        var ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.backBufferCanvas, px.x, px.y);
    },
    
    /**
     * Method: getLayerPxFromLonLat
     * A wrapper for the <OpenLayers.Map.getLayerPxFromLonLat()> method,
     * which takes into account that the canvas element has a fixed size and 
     * it always moved back to the original position.
     * 
     * Parameters:
     * lonlat - {<OpenLayers.LonLat>}
     *
     * Returns:
     * {<OpenLayers.Pixel>} 
     */
    getLayerPxFromLonLat: function(lonlat) {
        if (this.usesOneCanvasPerLayer()) {
           var viewPortPx = this.map.getPixelFromLonLat(lonlat);
           return viewPortPx;
        } else {
            return this.map.getLayerPxFromLonLat(lonlat);
        }    
    },

    /**
     * Method: getLayerPxFromLonLat
     * A wrapper for the <OpenLayers.Map.getViewPortPxFromLayerPx()> method.
     * 
     * Parameters:
     * layerPx - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {<OpenLayers.Pixel>}
     */ 
    getViewPortPxFromLayerPx: function(layerPx) {
        if (this.usesOneCanvasPerLayer()) {
            return layerPx;
        } else {
            return this.map.getViewPortPxFromLayerPx(layerPx);
        }
    },
    
    /**
     * Method: usesTransition
     * 
     * Returns:
     * {<Boolean>} True, if the layer uses a supported transition effect.
     */
    usesTransition: function() {
        return true;
        //   return (OpenLayers.Util.indexOf(this.SUPPORTED_TRANSITIONS, this.transitionEffect) != -1);
      
    },
    
    /**
     * Method: usesOneCanvasPerLayer
     * 
     * Returns:
     * {<Boolean>} True, if the layer renders its tile on a single canvas element.
     */
    usesOneCanvasPerLayer: function() {
        return (this.useCanvas === OpenLayers.Layer.Grid.ONECANVASPERLAYER);
    },

    /**
     * Method: getPixelDataForViewPortPx
     * Returns the ARGB values of the pixel at the given view-port position. 
     * The returned object has the attributes 'a', 'r', 'g' and 'b'.
     * 
     * Parameters:
     * viewPortPx - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {Object}
     */ 
    getPixelDataForViewPortPx: function(viewPortPx) {
        if (!this.grid.length || this.grid.length === 0) {
            return null;
        }
        
        if (this.usesOneCanvasPerLayer()) {
            // for ONECANVASPERLAYER we can directly use the view-port pixels
            var x = viewPortPx.x;
            var y = viewPortPx.y;
            
            if (this.cancas === null ||
                x < 0 || x >= this.canvas.width ||
                y < 0 || y >= this.canvas.height) {
                return null;
            }
            
            if (this.canvasImageData === null) {
                var canvasContext = this.canvas.getContext('2d');
                this.canvasImageData = canvasContext.getImageData(0, 0, 
                                            this.canvas.width, this.canvas.height);
            }
            
            return OpenLayers.Tile.CanvasImage.getPixelDataFromImageData(this.canvasImageData, x, y);
            
        } else {
            /* for ONECANVASPERTILE we first have to find out the tile
             * which contains the view-port pixel
             */
            
            // translate the viewPort coordinates to layer coordinates
            var layerPx = this.map.getLayerPxFromViewPortPx(viewPortPx);
            
            // and then calculate the grid position relative to the layer container
            var upperLeftTile = this.grid[0][0];
            var gridPx = new OpenLayers.Pixel(layerPx.x - upperLeftTile.position.x, layerPx.y - upperLeftTile.position.y);
            
            // get the tile which covers the pixel
            var tileX = Math.floor(gridPx.x / this.tileSize.w);
            var tileY = Math.floor(gridPx.y / this.tileSize.h);
            
            if (tileX >= 0 && tileX < this.grid[0].length &&
            tileY >= 0 &&
            tileY < this.grid.length) {
            
                var tile = this.grid[tileY][tileX];
                
                // calculate the position of the pixel on the canvas
                var canvasX = gridPx.x - (tileX * this.tileSize.w);
                var canvasY = gridPx.y - (tileY * this.tileSize.h);
                
                return tile.getPixelData(canvasX, canvasY);
            }
        }
        
        return null;
    },
    
    CLASS_NAME: "OpenLayers.Layer.Grid"
});

/**
 * Constant: NOCANVAS
 * {Integer} Constant used to mark that a layer should not be rendered
 *      on a canvas element.
 */
OpenLayers.Layer.Grid.NOCANVAS = 1;
/**
 * Constant: ONECANVASPERLAYER
 * {Integer} Constant used to render the layer on a single canvas element.
 */
OpenLayers.Layer.Grid.ONECANVASPERLAYER = 2;
/**
 * Constant: ONECANVASPERTILE
 * {Integer} Constant used to render every tile in its own canvas element.
 */
OpenLayers.Layer.Grid.ONECANVASPERTILE = 4;

    /**
     * Method: clone
     *
     * Parameters:
     * obj - {<OpenLayers.Tile>} The tile to be cloned
     *
     * Returns:
     * {<OpenLayers.Tile>} An exact clone of this <OpenLayers.Tile>
     */
    OpenLayers.Tile.prototype.clone = function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Tile(this.layer, 
                                      this.position, 
                                      this.bounds, 
                                      this.url, 
                                      this.size);
        } 
        
        // catch any randomly tagged-on properties
        OpenLayers.Util.applyDefaults(obj, this);
        
        return obj;
    };

    OpenLayers.Tile.Image.prototype.clone =   function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Tile.Image(this.layer, 
                                            this.position, 
                                            this.bounds, 
                                            this.url, 
                                            this.size);        
        } 
        
        //pick up properties from superclass
        obj = OpenLayers.Tile.prototype.clone.apply(this, [obj]);
        
        //dont want to directly copy the image div
        obj.imgDiv = null;
            
        
        return obj;
    };
    























