/*
from PHP:
	tileSize
	zoomLevels
	hasStartupView
	startup_view
	baseUrl
	imageName
*/

var map = (function() // Revealing Module Pattern
	{
	var pub = {};

	// Private properties
	var mapObject;
	var tms;

	// Public registration methods
	pub.addLayer = function(newLayer)
		{
		mapObject.addLayer(newLayer);
		};

	// Public mutators
	pub.moveTo = function(newCenter, newZoom, smooth)
		{
		if (newZoom === undefined)
			{
			newZoom = mapObject.getZoom();
			}
		if (smooth === undefined)
			{
			// panTo() can cause problems when the map is not already visible, don't use it by default
			smooth = false;
			}
		if (mapObject.getCenter().lon === newCenter.lon &&
			mapObject.getCenter().lat === newCenter.lat &&
			mapObject.getZoom() === newZoom)
			{
			return;
			}
		if (smooth && mapObject.getZoom() === newZoom)
			{
			mapObject.panTo(newCenter);
			}
		else
			{
			mapObject.setCenter(newCenter, newZoom, true, true);
			}
		};

	pub.rotateTo = function(newRotationDegree)
		{
		mapObject.mapRotation = newRotationDegree;
		rotate(mapObject.mapRotation);
		};

	// Private helper methods
	function rotate(num)
		{
		var stri = num + 'deg';
		$('#map').animate({rotate: stri}, 0);
		}

	function get_my_url(bounds) // TODO: can this be done faster by bitshifting / divide by 2?
		{
		var res = mapObject.getResolution();
		var xVal = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
		var yVal = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));

		zoom = mapObject.getZoom();
		maxr = mapObject.maxResolution;
		ts = mapObject.getTileSize();
		var zooml = zoom + 1;
		var zoomPow=Math.pow(2,zoom);
		var tileName = "t";
		// Uncomment to display image information
		//$("#slider_info").text( "zoom: (" + zooml + " / " + this.map.getNumZoomLevels() + ")  MaxResolution: " + maxr + ' Tilesize : ' + JSON.stringify(ts));

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
			} // END for
		var some =  baseUrl + "?image=" + imageName + "&name=" + tileName+".jpg";
		return some;
		} // END get_my_url()

	function set_startup_view() // TODO: review this
		{
		if(hasStartupView === 1)
			{
			var lonlat = new OpenLayers.LonLat(startup_view["center"][0], startup_view["center"][1]);
			mapObject.zoomTo(startup_view["zoom"]);
			mapObject.moveTo(lonlat);
			if("rotation" in startup_view)
				{
				mapObject.mapRotation = startup_view["rotation"];
				rotate(mapObject.mapRotation);
				}
			tms.redraw(true);
			mapObject.pan(1,1);
			}
		else
			{
			mapObject.zoomTo(0);
			mapObject.pan(1,1);
			}
		}

	function fixContentHeight2()
		{
		var mapcontentDiv = $("#mapcontent");
		var mapcontainerDiv = $('#mapcontainer');
		var mapDiv = $('#map');

		var viewHeight = $(window).innerHeight();
		var headerHeight = $("#mappage > [data-role='header']").outerHeight(true);
		var footerHeight = $("#mappage > [data-role='footer']").outerHeight(true);
		var actualContentHeight = mapcontentDiv.outerHeight(true);
		var idealContentHeight = viewHeight - headerHeight - footerHeight; // TODO: maybe -1 too?
		if (actualContentHeight !== idealContentHeight)
			{
			// NOTE: this is only valid if margins, borders, and padding are all 0,
			// as we calculated for outerHeight(true), but set height()
			mapcontentDiv.height(idealContentHeight);
			mapcontainerDiv.height(idealContentHeight);
			}

		// map div must be large enough to fill the corners of mapcontainer when the map div is rotated 45 degrees
		var mapcontainerHeight = mapcontainerDiv.height() ;// must use height()/width(), as this is the innermost dimension and what the map div actually has for space
		var mapcontainerWidth = mapcontainerDiv.width();
		var mapcontainerDiagonal = Math.ceil(Math.sqrt(mapcontainerHeight * mapcontainerHeight + mapcontainerWidth * mapcontainerWidth));
		var mapTopMargin = -1 * Math.ceil((mapcontainerDiagonal - mapcontainerHeight) / 2); // multiply by -1 because this is a negative offset, going outside the boundary
		var mapLeftMargin = -1 * Math.ceil((mapcontainerDiagonal - mapcontainerWidth) / 2);
		// only update if necessary, as all map tiles will be refetched after a size change
		if (mapDiv.height() !== mapcontainerDiagonal) // all 4 properties always change together, only check 1
			{
			mapDiv.css( // doesn't need to be !important; inline style overrides external style
				{
				"height": mapcontainerDiagonal,
				"width": mapcontainerDiagonal, // TODO: check this
				"margin-top": mapTopMargin,
				"margin-left": mapLeftMargin
				});
			}
		// TODO: rotate here?
		mapObject.updateSize();
		}

/* // TODO: verify that we don't need this and new version works
	// fix height of content
	function fixContentHeight()
		{
		var header = $("div[data-role='header']:visible");
		var footer = $("div[data-role='footer']:visible");
		var content = $("div[data-role='content']:visible:visible");
		var viewHeight = $(window).height();
		var contentHeight = viewHeight - header.outerHeight() - footer.outerHeight();

		if ( (content.outerHeight() + footer.outerHeight() + header.outerHeight()) !== viewHeight )
			{
			contentHeight -= content.outerHeight() - content.height() + 1;
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
		if(mapObject != undefined)
			{
			if(mapObject.mapRotation != undefined)
				{
				rotate(mapObject.mapRotation);
				}
			}
		mapObject.updateSize(); // TODO: fixes image load problem!!!!!!
		} // END fixContentHeight()
*/

	// Initialization method - must be called before any others
	pub.init = function()
		{
		var boundSize = tileSize * Math.pow(2.0, zoomLevels-1);
		//create the map
		mapObject = new OpenLayers.Map(
			{
			div: "map",
			theme : null,
			controls:
				[
				new OpenLayers.Control.Navigation( // TODO: add options
					{
					zoomBoxEnabled: false,
					dragPanOptions:
						{
						enableKinetic: true
						},
					mouseWheelOptions:
						{
						interval: 300, // TODO: is this a good delay?
						cumulative: false
						}
					}), 
				new OpenLayers.Control.Attribution() //TODO: why, ask DJ?
				],
			maxExtent: new OpenLayers.Bounds(0,0, boundSize, boundSize),
			maxResolution: boundSize / tileSize,
			numZoomLevels: zoomLevels,
			tileSize: new OpenLayers.Size(tileSize, tileSize),
			mapRotation: 0.0,
			cenPx: new OpenLayers.Pixel(0,0)
			}); // END OpenLayers.Map

		//create custom tile manager
		tms = new OpenLayers.Layer.TMS(
			"Large Image Viewer", // Name in the layer switcher
			"http://127.0.0.1/",
			{
				'type':'jpg',
				'getURL': get_my_url,
				'isBaseLayer': true
			}
			); // END OpenLayers.Layer.TMS
		tms.transitionEffect = 'resize'; // TODO: some other Tween too?
		//add the tiles to the map
		map.addLayer(tms);

		$("#rright").on("vclick", function()
			{
			mapObject.mapRotation -= 5;
			rotate(mapObject.mapRotation);
			});

		$("#rreset").on("vclick", function()
			{
			mapObject.mapRotation = 0;
			rotate(mapObject.mapRotation);
			});

		$("#rleft").on("vclick", function()
			{
			mapObject.mapRotation += 5;
			rotate(mapObject.mapRotation);
			});

		$("#plus").on("vclick", function()
			{
			mapObject.zoomIn();
			});
		$("#minus").on("vclick", function()
			{
			mapObject.zoomOut();
			});

		$(window).on("orientationchange resize pageshow", fixContentHeight2); // run on 'pageshow' because functionality may not work if window was resized while page was hidden
		fixContentHeight2(); // TODO rename this

		var zoom = mapObject.getZoom(); // TODO: move this to startup view
		mapObject.zoomToMaxExtent();

		set_startup_view();
		}; // END init

	return pub; // return just the public parts
	}());

