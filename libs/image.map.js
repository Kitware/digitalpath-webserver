/*
from PHP:
	tileSize
	zoomLevels
	hasStartupView
	startup_view
	baseUrl
	imageName
	sessionName
*/

var tms;

var map = (function() // Revealing Module Pattern
	{
	var pub = {};

	// Private properties
	var mapObject;
	var rotationDegree;

	// Public registration methods
	pub.addLayer = function(newLayer)
		{
		mapObject.addLayer(newLayer);
		};

	pub.registerMapEvents = function(eventListeners)
		{
		mapObject.events.on(eventListeners);
		mapObject.eventListeners = eventListeners; // allows eventListeners to be destroyed properly
		};

	pub.registerLayerEvents = function(eventListeners)
		{
		// only registers on the base layer
		tms.events.on(eventListeners);
		tms.eventListeners = eventListeners;
		}

	pub.unregisterAllEvents = function()
		{
		if (mapObject.eventListeners)
			{
			mapObject.events.un(mapObject.eventListeners);
			mapObject.eventListeners = null;
			}
		if (tms.eventListeners)
			{
			tms.events.un(tms.eventListeners);
			tms.eventListeners = null;
			}
		}

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
		if (rotationDegree === newRotationDegree)
			{
			return;
			}
		rotationDegree = newRotationDegree;
		updateRotation();
		};

	// Public accessor
	pub.getState = function()
		{
		var centerValue = mapObject.getCenter()
		return {
			img: imageName,
			sess: sessionName,
			zoom : mapObject.getZoom(),
			cenx : centerValue.lon,
			ceny : centerValue.lat,
			rotation : rotationDegree,
			};
		};

	// OpenLayers callback
	pub.rotateEventCoords = (function() // this function self-executes once to provide the closure for a 'static' cache
		{
		var cachedRotationDegree;
		var cachedSine; // trig functions are slow, and rotateEventCoords is called on every mousemove event
		var cachedCosine;
		return function(evt) // this is the actual rotateEventCoords()
			{
			if (rotationDegree !== 0)
				{
				if (cachedRotationDegree !== rotationDegree)
					{
					cachedRotationDegree = rotationDegree;
					cachedSine = Math.sin(cachedRotationDegree * Math.PI / 180.0); // JQuery rotates CW; to counter this, rotate CCW, or + degrees
					cachedCosine = Math.cos(cachedRotationDegree * Math.PI / 180.0);
					}

				var centerX = $(window).innerWidth() / 2;
				var centerY = $(window).innerHeight() / 2;

				var oldDx = evt.clientX - centerX; // pixel origin is top-left, rotation origin is exact center
				var oldDy = centerY - evt.clientY;
				var newDx = oldDx * cachedCosine - oldDy * cachedSine;
				var newDy = oldDx * cachedSine + oldDy * cachedCosine;
				evt.clientXr = newDx + centerX;
				evt.clientYr = centerY - newDy;
				}
			else
				{
				evt.clientXr = evt.clientX;
				evt.clientYr = evt.clientY;
				}

			if (evt.touches)
				{
				for(var i = 0, len_i = evt.touches.length; i < len_i; i++)
					{
					if (rotationDegree !== 0)
						{
						var oldDx = evt.touches[i].clientX - centerX;
						var oldDy = centerY - evt.touches[i].clientY;
						var newDx = oldDx * cachedCosine - oldDy * cachedSine;
						var newDy = oldDx * cachedSine + oldDy * cachedCosine;
						evt.touches[i].clientXr = newDx + centerX; //TODO: make sure we can assign to this
						evt.touches[i].clientYr = centerY - newDy;
						}
					else
						{
						evt.touches[i].clientXr = evt.touches[i].clientX;
						evt.touches[i].clientYr = evt.touches[i].clientY;
						}
					}
				}
			}
		})();

	// Event handlers
	function onClickRotateButton(event)
		{
		switch(event.data.rotateDirection)
			{
			case "cw":
				rotationDegree += 5;
				break;
			case "ccw":
				rotationDegree -= 5;
				break;
			case "reset":
				rotationDegree = 0;
				break;
			default:
				break;
			}
		updateRotation();
		}

	// Private helper methods
	function updateRotation()
		{
		var stri = rotationDegree + 'deg';
		$('#map').animate({rotate: stri}, 0); // TODO: review this
		mapObject.events.triggerEvent("moveend");
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
				rotationDegree = startup_view["rotation"];
				updateRotation();
				}
			tms.redraw(true);
			}
		else
			{
			mapObject.zoomTo(0);
      tms.clearGrid();
      tms.redraw();
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
			$("#mappage").height(idealContentHeight);
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
		// tms.transitionEffect = 'resize'; // TODO: some other Tween too?
		//
    tms.canvasAsync = false;
    tms.useCanvas = OpenLayers.Layer.Grid.ONECANVASPERTILE;
    tms.buffer = 0;
    tms.canvasFilter = filter;
		//add the tiles to the map
		map.addLayer(tms);

		rotationDegree = 0;
		$("#rright").on("vclick", {rotateDirection: "ccw"}, onClickRotateButton);
		$("#rreset").on("vclick", {rotateDirection: "reset"}, onClickRotateButton);
		$("#rleft").on("vclick", {rotateDirection: "cw"}, onClickRotateButton);
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
    // mapObject.zoomTo(0);

    tms.redraw();
		set_startup_view();
		}; // END init

	return pub; // return just the public parts
	}());

