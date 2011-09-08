
// Large image view related scripts 

var map;
var anno;
var origin;
var spacing;
var vector_styles;
var selControl;

//baseName = 'pathdemo';
//imageName = '939';

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
	var some =  baseUrl + "?image=" + imageName + "&name=" + tileName+".jpg";
	return some
  }

function get_annotations(lay)
	{
	// Get the json full of bookmarks of current image
	$.ajax({
		url: "bookmarks.php?id="+imageName,
		dataType: 'json',
		success:  
			function(data, textStatus, jqXHR)
			{
			// obj is the javascript object
			spacing = data["spacing"];
			origin = data["origin"];

		//	try 	
				{
				for (var i = 0; i < data["bookmarks"].length ; i ++)
					{		
					var annot = data["bookmarks"][i];
					switch (annot["annotation"]["type"])
						{
						case "pointer":
							//create pointlist for the arrow
							// Blue style
							var lineList = [];
							var pointList = [];	
							var ratio = 0.5;
							var orig_pointlist = [];

							var local_style = OpenLayers.Util.extend({}, vector_styles);
							local_style.strokeColor = annot["annotation"]["color"];
							local_style.label = annot["title"];
							//local_style.labelAlign = "mt";
							local_style.fontColor = annot["annotation"]["color"];
              local_style.fontSize = "18";
							local_style.fontWeight = "bolder";
							local_style.labelYOffset = 15;
							//local_style.fontStyle="italic";
	

							for(var j = 0; j < annot["annotation"]["points"].length ; j ++)
								{
								var p = annot["annotation"]["points"][j];

								var x = (p[0]-origin[0]) / spacing[0];
								var y = (p[1]-origin[1]) / spacing[1];
								orig_pointlist.push(new OpenLayers.Geometry.Point(x, -1 * y));
								pointList.push(new OpenLayers.Geometry.Point(x,y));
								}
							// Add two more line segments
							lineList.push(new OpenLayers.Geometry.LineString(orig_pointlist));
							// find out length and angle

							var dx = pointList[0].x - pointList[1].x;
							var dy = pointList[0].y - pointList[1].y;
				
							var length = Math.sqrt(dx*dx + dy*dy);
							var awithx = Math.atan(dy / dx);
	
							//awithx = Math.abs(awithx);
							// find one line 
							var line1_points = [];
							line1_points.push(orig_pointlist[0]);

							var ang1 = awithx +  (Math.PI / 4.0);
							line1_points.push(new OpenLayers.Geometry.Point(
								pointList[0].x + length * ratio * Math.cos(ang1),
								-1 * (pointList[0].y + length  * ratio * Math.sin(ang1))));
							
	
							// find one line 
							var line2_points = [];
							line2_points.push(orig_pointlist[0]);

							var ang2 = awithx - (Math.PI / 4.0);
							line2_points.push(new OpenLayers.Geometry.Point(
								pointList[0].x + length * ratio * Math.cos(ang2),
								-1 * (pointList[0].y + length  * ratio * Math.sin(ang2))));

							
							lineList.push(new OpenLayers.Geometry.LineString(line1_points));
							lineList.push(new OpenLayers.Geometry.LineString(line2_points));
					
							var angle = awithx * 180 / 3.14159;
							if (angle > 360)
								{
									angle = angle - 360;
								}							

							local_style.label = annot["title"] + " " + JSON.stringify(angle);
							local_style.strokeColor = annot["annotation"]["color"];
							local_style.graphic = true; 
							local_style.externalGraphic = "img/centered-yellow-arrow.png";
							local_style.graphicWidth = 80; 
							local_style.graphicOpacity = 1.;
							local_style.zIndex = 0;
							//local_style.graphicXOffset = 21;
							//local_style.graphicYOffset = 25;
							local_style.rotation = - 1 * angle + 180; 
							
							
							var attrib = { "title" :  annot["title"], "text" : annot["details"]};
	
							var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(pointList[0].x, -1 * pointList[0].y),attrib, local_style );
							lay.addFeatures(feature);
	
						  var feature2 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.MultiLineString(lineList), attrib, local_style );
							// lay.addFeatures(feature2);
							break;

						default : 
							var pointList = [];
		
							for(var j = 0; j < annot["annotation"]["points"].length ; j ++)
								{
								var p = annot["annotation"]["points"][j];

								var x = (p[0]-origin[0]) / spacing[0];
								var y = (p[1]-origin[1]) / spacing[1] * -1;
								
								pointList.push(new OpenLayers.Geometry.Point(x,y));
								}
						
							pointList.push(pointList[0]);
							// Blue style
							var local_style = OpenLayers.Util.extend({}, vector_styles);

							local_style.strokeColor = annot["annotation"]["color"];
							local_style.label = "Hurray"; //annot["title"];
							
							local_style.fontColor = annot["annotation"]["color"];
              local_style.fontSize = "12px";
              local_style.fontFamily = "Courier New, monospace";
							
							var attrib = { "title" :  annot["title"], "text" : annot["details"]};
							
							var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(pointList), attrib, local_style );
							lay.addFeatures(feature);
						} // End switch
					}	
				}
			//catch(err)
				//{
				//TODO: give some indication on annotations 
				//alert("error");
				//}
			},
		error: 
			function(obj)
			{
			//alert("Annotations could not be loaded");
			}
		});

	}

function displayAnnotation(evt)
  {
	// alert("Hello");
  alert(evt.feature.attributes.title + ",\n Details: " + evt.feature.attributes.text);
  // selControl.unselect(evt.feature);
  }

	
function init()
  {
  
	var boundSize = tileSize *  Math.pow(2,zoomLevels-1); 
  //create the map  
  map = new OpenLayers.Map( {
			div: 'map',
			theme : null,
			controls: [
					new OpenLayers.Control.Attribution(),
					new OpenLayers.Control.TouchNavigation({
							dragPanOptions: {
									enableKinetic: false
							}
					}),
			],
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
		  
	
  // we want opaque external graphics and non-opaque internal graphics
	vector_styles = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
	vector_styles.fillOpacity = 0.2
	vector_styles.strokeColor = "blue";
	vector_styles.strokeWidth = 3;

	
	// Uncomment for display Annotations 
	anno = new OpenLayers.Layer.Vector("Annotations", {style: vector_styles, renderers: ["SVG"]});
	
	anno.events.register("featureselected", anno, displayAnnotation);
	get_annotations(anno);
	map.addLayer(anno);
	anno.setVisibility(false);
	
	selControl = new OpenLayers.Control.SelectFeature(
		anno,
		{
		multiple: false, hover: false,
		});
 

	map.addControl(selControl);
	selControl.activate();

  var zoom = this.map.getZoom();
  // Uncomment to display zoom information 
	//$(".slider_info").text(
  //  "slice: (" + currentSlice + " / " + maximumSlice + "), , zoom: (" + zoom +
  //  " / " + this.map.getNumZoomLevels() + ")");
} 




