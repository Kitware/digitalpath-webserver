
// Large image view related scripts 

var lmap;
var annotations;

// Need to get these definitions
var tileSize;
var zoomLevels;

function get_my_url (bounds)
  {
  var res = this.map.getResolution();
  var xVal = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
  var yVal = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));

  zoom = this.map.getZoom();
	maxr = this.map.maxResolution;
	ts = this.map.getTileSize();
  var zooml = zoom + 1;
  var zoomPow=Math.pow(2,zoom);
  var tileName = "t";
  // Uncomment to display image information
	// $("#slider_info").text( "zoom: (" + zooml + " / " + this.map.getNumZoomLevels() + ")  MaxResolution: " + maxr + ' Tilesize : ' + JSON.stringify(ts));
  
	for(var g=0; g < zoom; g++)
    {
    zoomPow = zoomPow / 2;
    if(yVal < zoomPow)
      {
      if(xVal < zoomPow)
        {
        tileName += "q";
        }
      else
        {
        tileName += "r";
        xVal -= zoomPow;
        }
      }
    else
      {
      if(xVal < zoomPow)
        {
        tileName += "t";
        yVal -= zoomPow;
        }
      else
        {
        tileName += "s";
        xVal -= zoomPow;
        yVal -= zoomPow;
        }
      }
    }
	var some = "http://paraviewweb.kitware.com:82/tile.py/" + baseName + "/" + imageName + "/" + tileName+".jpg";
	return some
  }



function init()
  {
  
	var boundSize = tileSize *  Math.pow(2,zoomLevels-1); 
  //create the map  
  lmap = new OpenLayers.Map('map',
    {
    // Need to set proper extent using number of zoom levels
      maxExtent: new OpenLayers.Bounds(0,0, boundSize, boundSize),
	    maxResolution: boundSize / tileSize, 
	    numZoomLevels: zoomLevels, 
			tileSize: new OpenLayers.Size(tileSize, tileSize)
    }
  );
 
  //create custom tile manager
  var tms = new OpenLayers.Layer.TMS( 
					"Large Image Viewer",  // Name in the layer switcher
					"http://127.0.0.1/",
    {
    'type':'jpg',
    'getURL':get_my_url,
    }
  );

  tms.transitionEffect = 'resize';
  //add the tiles to the map

  map.addLayer(tms);
  map.zoomToMaxExtent();
	
		  
	// Uncomment for display Annotations 
	//annotations = new OpenLayers.Layer.Vector("Annotations");
  //annotations.events.register("featureselected", vector_layer, displayAnnotation);
	//annotations.transitionEffect = 'resize';
  //map.addLayer(annotations);
  
  var zoom = this.map.getZoom();
  // Uncomment to display zoom information 
	//$(".slider_info").text(
  //  "slice: (" + currentSlice + " / " + maximumSlice + "), , zoom: (" + zoom +
  //  " / " + this.map.getNumZoomLevels() + ")");
} 
