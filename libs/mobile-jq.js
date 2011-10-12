// Start with the map page
//window.location.replace(window.location.href.split("#")[0] + "#mappage");

var selectedFeature = null;
var showAnno = 0;
var map;
var anno;
var labels;
var tms;
var origin;
var spacing;
var vector_styles;
var selControl;


// variables for leading 
var isLeading = false;
var curcenx;
var curceny;
var curzoom;
var currotation;

// variables for following 
var timersec;
var seccount = 0;
var isFollowing = false;
var isWaiting = false;
var whomToFollow = '';


// Some variables come directly from the php and will 
// get modified if the server modifies them


$(document).bind("mobileinit", function()
		{
	
	$.mobile.ajaxFormsEnabled = false;

});


$(document).ready(function()
{

// Large image view related scripts 
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

function get_annotations()
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

			if(data["bookmarks"] !== null)
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
							var local_style2 = OpenLayers.Util.extend({}, vector_styles);

							for(var j = 0; j < annot["annotation"]["points"].length ; j ++)
								{
								var p = annot["annotation"]["points"][j];

								var x = (p[0]-origin[0]) / spacing[0];
								var y = (p[1]-origin[1]) / spacing[1];
								// Flipping for the first time to get correct location on screen
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
							var angle = awithx * 180 / 3.14159;

							if (dx < 0)
								{
								angle = angle + 180;
								}	 

//							if (angle > 360)
//								{
//									angle = angle - 360;
//								}
//							if (angle < 0) 
//								{
//									angle = angle + 360;
//								}
											
							local_style.graphic = true; 
							local_style.externalGraphic = "img/centered-yellow-arrow.png";
							local_style.graphicWidth = 60; 
							local_style.graphicOpacity = 1.;
							local_style.zIndex = 55; // Some large number
							local_style.rotation = angle; 
							local_style.graphicTitle = annot["title"];
							var attrib = { "title" :  annot["title"], "text" : annot["details"]};
							var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(pointList[0].x, -1 * pointList[0].y),attrib, local_style );
							anno.addFeatures(feature);
						
							// Create label features
							local_style2.zIndex = 56; // Some large number
							local_style2.graphic = false; 
							local_style2.fontColor = annot["annotation"]["color"];
							local_style2.fontSize = "18";
							local_style2.fontWeight = "bolder";
							local_style2.labelYOffset = 25;
							local_style2.label = annot["title"]
							var feature2 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(pointList[0].x, -1 * pointList[0].y),attrib, local_style2 );
							labels.addFeatures(feature2);
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
							var local_style4 = OpenLayers.Util.extend({}, vector_styles);

							local_style4.strokeColor = annot["annotation"]["color"];
							
							
							var attrib = { "title" :  annot["title"], "text" : annot["details"]};
							
							var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(pointList), attrib, local_style4 );
							anno.addFeatures(feature);
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

function mapEvent(event)
	{
	if(isLeading === true)
		{
		curzoom = map.getZoom();
		curlatlon = map.getCenter();
		currotation = map.mapRotation;
		$.post(
			"lead.php",
				{
				zoom :curzoom,
				cenx : curlatlon.lon,
				ceny : curlatlon.lat,
				rotation : currotation,
				image : imageName
				},
				function(data, textStatus, jqXHR)
				{
				// obj is the javascript object
				}
			);
		}
	}

	
function init()
  {
	var boundSize = tileSize *  Math.pow(2.0,zoomLevels-1); 
  //create the map  
  map = new OpenLayers.Map( {
			div: 'map',
			theme : null,
			eventListeners: 
				{
				"moveend": mapEvent,
				"zoomend": mapEvent
				},
			controls: [
				new OpenLayers.Control.Attribution(),
				new OpenLayers.Control.TouchNavigation(
							{
							dragPanOptions: 
								{
								enableKinetic: true
								}
							}),
				],
      maxExtent: new OpenLayers.Bounds(0,0, boundSize, boundSize),
	    maxResolution: boundSize / tileSize, 
	    numZoomLevels: zoomLevels, 
			tileSize: new OpenLayers.Size(tileSize, tileSize),
			mapRotation:0.0
    }
  );
 
  //create custom tile manager
  tms = new OpenLayers.Layer.TMS( 
					"Large Image Viewer",  // Name in the layer switcher
					"http://127.0.0.1/",
    {
    'type':'jpg',
    'getURL':get_my_url,
		'isBaseLayer':true,
			'eventListeners': 
				{
				"dragend": mapEvent
				}
}
  );

  tms.transitionEffect = 'resize';
  //add the tiles to the map

  map.addLayer(tms);
  //map.zoomToMaxExtent();
		  
  // we want opaque external graphics and non-opaque internal graphics
	vector_styles = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
	vector_styles.fillOpacity = 0.2
	vector_styles.strokeColor = "blue";
	vector_styles.strokeWidth = 3;

	
	// Uncomment for display Annotations 
	anno = new OpenLayers.Layer.Vector("Annotations", {style: vector_styles, renderers: ["SVG"]});
	
	anno.events.register("featureselected", anno, displayAnnotation);
	map.addLayer(anno);
	anno.setVisibility(false);

	// Create control for clicking pointers	
	selControl = new OpenLayers.Control.SelectFeature(
		anno,
		{
		multiple: false, hover: false,
		});

	map.addControl(selControl);
	selControl.activate();
 
	// Layer for text labels
	labels = new OpenLayers.Layer.Vector("TextLabels", {style: vector_styles, renderers: ["SVG"]});
	map.addLayer(labels);

	anno.setVisibility(true);
	labels.setVisibility(true);

  var zoom = this.map.getZoom();
	get_annotations();

	anno.setVisibility(false);
	labels.setVisibility(false);
	map.zoomToMaxExtent();

  // Uncomment to display zoom information 
	//$(".slider_info").text(
  //  "slice: (" + currentSlice + " / " + maximumSlice + "), , zoom: (" + zoom +
  //  " / " + this.map.getNumZoomLevels() + ")");

		// Call the set startup view
	}

	function rotate(num)
		{
			var stri = "+=" + num + 'deg';
			if (num < 0)
				var stri = "-=" + (-num) + 'deg';
				
			mapdiv.animate({rotate: stri}, 0); 
			map.mapRotation -= num;
		} // rotate end

	function set_startup_view()
		{

		if(hasStartupView == 1)
			{
			var lonlat = new OpenLayers.LonLat(startup_view["center"][0], startup_view["center"][1]);
			map.moveTo(lonlat);
			map.zoomTo(startup_view["zoom"]);
			tms.redraw(true);
			if("rotation" in startup_view)
				{
				rotate(-1*parseInt(startup_view["rotation"]));
				}
			}

		} // set startup view end


    // fix height of content
    function fixContentHeight() 
		{
        var header = $("div[data-role='header']:visible"),
            footer = $("div[data-role='footer']:visible"),
            content = $("div[data-role='content']:visible:visible"),
            viewHeight = $(window).height(),
            contentHeight = viewHeight - header.outerHeight() - footer.outerHeight();

        if ((content.outerHeight() +footer.outerHeight()+ header.outerHeight()) !== viewHeight) {
							contentHeight -= (content.outerHeight() - content.height() + 1);
							content.height(contentHeight);
					}

			mapcontainer = $('#mapcontainer');
			mapdiv = $('#map');
			mapcontainer.height(contentHeight);

			var boundSize = tileSize *  Math.pow(2,zoomLevels-1); 
			
			var containwidth = parseFloat($('#mapcontainer').css('width'))
			var containheight = parseFloat($('#mapcontainer').css('height'))

			var hyp = parseInt(Math.sqrt(containheight * containheight + containwidth * containwidth))
			var map_top_margin = parseInt((hyp - containheight) / -2);
			var map_left_margin = parseInt((hyp - containwidth) / -2);
			
		mapdiv.css('width',hyp + "px");
		mapdiv.css('height',hyp + "px");
		mapdiv.css('cssText', 'margin-top :' + map_top_margin + 'px !important; margin-left :' + map_left_margin + 'px !important; height : ' + hyp + 'px !important; width : ' + hyp + 'px !important;');
			} // Fix content ends


    $(window).bind("orientationchange resize pageshow", fixContentHeight);
		fixContentHeight();

		init();
    // Map zoom  
    $("#plus").click(function(){
        map.zoomIn();
    });

    $("#minus").click(function(){
        map.zoomOut();
    });

		$("#rright").bind( "vclick", function(event, ui) {
			map.mapRotation -= 5;
			rotate(map.mapRotation);
		});

		$("#rreset").bind( "vclick", function(event, ui) {
			map.mapRotation = 0;
			rotate(map.mapRotation);
		});

		$("#rleft").bind( "vclick", function(event, ui) {
			map.mapRotation += 5;
			rotate(map.mapRotation);
		});

		// Most follow functionality is here 
		timersec = $.timer(function()
			{
			seccount++;

			// If following
			if(isFollowing == true)
				{
				// if not already waiting 
				if(isWaiting == false)		
					{
					isWaiting = true;
					// Send an ajax query to server to get new image parameters 
		
					$.ajax({
						url: "follow.php?username=dhandeo@gmail.com",
						dataType: 'json',
						success:function(data, textStatus, jqXHR)
							{
							// change the variables 
							if("zoom" in data)
								{
								var curzoom = map.getZoom();
								if(curzoom != data["zoom"])
									{	
									map.zoomTo(data["zoom"]);	
									}
								}

							if("cenx" in data && "ceny" in data)
								{
								var curlatlon = map.getCenter();
								if(curlatlon.lon != data["cenx"] || curlatlon.lat != data["ceny"])
									{
									var lonlat = new OpenLayers.LonLat(data["cenx"], data["ceny"]);
									map.panTo(lonlat);
									}
								}

							if("image" in data)
								{
								if(imageName != data["image"])
									{	
									imageName = data["image"];
									tms.redraw(true);
									}
								}

							if("rotation" in data)
								{
								if(map.rotation != data["rotation"])
									{	
									// find the difference
									rotate(-1*parseInt(map.mapRotation - data["rotation"]));
									}
								}
								// panTo
								// change imageName
								// refresh the layer
							isWaiting = false;
							},
						error:function(jqXHR, textStatus, errorThrown)
							{
							isWaiting = false;
							}
						})
					}
				}

			});

		timersec.set({ time : 1000});	

		$("#follow").bind("vclick", function(event, ui){
			// start a timer and 
			if(isFollowing === true)
				{
				isFollowing = false
				}
			else
				{
				isFollowing = true;
				}

			timersec.toggle();
		});

		$("#lead").bind("vclick", function(event, ui){
			// start a timer and 
			if(isLeading === true)
				{
				isLeading = false
				}
			else
				{
				isLeading = true;
				// Register for the events 

				}
			

		});


		$("#show-anno").bind( "vclick", function(event, ui) {
			var themes = ["a","b","e"];
			var oldtheme = themes[showAnno];
			showAnno = showAnno + 1;
			if(showAnno === 3)
				{
				showAnno = 0;
				}					
			var newtheme = themes[showAnno];
			$('#show-anno').attr("data-theme", newtheme).removeClass("ui-btn-up-"+oldtheme).removeClass("ui-btn-hover-"+oldtheme).addClass("ui-btn-up-"+newtheme);
			switch(showAnno)
				{
				case 0:
					anno.setVisibility(false);
					labels.setVisibility(false);
					break;
				case 1:
					anno.setVisibility(true);
					labels.setVisibility(false);
					break;
				case 2:
					anno.setVisibility(true);
					labels.setVisibility(true);
					break;
				default:
					break;
				}
			});

			//$("#checkbox-2").live();
			init_operations();
			tms.redraw(true);

			var timer2 = $.timer(function() 
					{
					set_startup_view();
					});

        timer2.once(300);
});


