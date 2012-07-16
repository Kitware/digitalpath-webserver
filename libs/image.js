// Start with the map page
//window.location.replace(window.location.href.split("#")[0] + "#mappage");

OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;

// Some variables come directly from the php and will 
// get modified if the server modifies them
/*
var toFollow = 
var tileSize = 
var baseUrl = 
var zoomLevels = 
var baseName = 
var imageName = 
var sessionName = 
var image_name = 
var image_label = 
*/

// Utility functions
function changeButtonTheme(buttonElement, newTheme, hover)
	{
	if (hover === undefined)
		{
		hover = true;
		}

	var oldTheme = buttonElement.attr("data-theme");
	buttonElement.removeClass("ui-btn-up-"+oldTheme).removeClass("ui-btn-hover-"+oldTheme).removeClass("ui-btn-down-"+oldTheme);
	buttonElement.attr("data-theme", newTheme);
	if (hover)
		{
		buttonElement.addClass("ui-btn-hover-"+newTheme);
		}
	else
		{
		buttonElement.addClass("ui-btn-up-"+newTheme);
		}
	}


$(document).bind( // TODO: review this, http://jquerymobile.com/test/docs/api/globalconfig.html
	"mobileinit",
	function()
		{
// TODO: https://github.com/jquery/jquery-mobile/commit/8929ac33b9f73d0a8cb5d3476682f8c3d2423830
// TODO: http://jquerymobile.com/test/docs/forms/forms-sample.html
//		$.mobile.ajaxFormsEnabled = false; // doesn't work
		}
	);

$(document).ready(function()
{
	$("#logo").on("vclick", function(event)
		{
		window.open("http://www.kitware.com");
		});

	map.init()
	bookmarks.init();
	// init_operations(); //TODO: review this
	follow.init();

}); // END $(document).ready(function()


// TODO: deal with this
/*
	markers = new OpenLayers.Layer.Markers("Markers");
	map.addLayer(markers);
	markers.setVisibility(false);

	icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png');

	OpenLayers.Control.Click = OpenLayers.Class(
		OpenLayers.Control,
		{
			defaultHandlerOptions:
				{
				'single': true,
				'double': false,
				'pixelTolerance': 0,
				'stopSingle': false,
				'stopDouble': false
				},
			initialize: function(options)
				{
				this.handlerOptions = OpenLayers.Util.extend( {}, this.defaultHandlerOptions );
				OpenLayers.Control.prototype.initialize.apply( this, arguments );
				this.handler = new OpenLayers.Handler.Click(
					this,
					{
						'click': this.trigger
					},
					this.handlerOptions
					);
				},
			trigger: function(e)
				{
				curxy = map.getLonLatFromViewPortPx(e.xy);
				mapEvent();
				display_marker();
				}
		}
		); // END OpenLayers.Class
	var click = new OpenLayers.Control.Click();

	map.addControl(click);
	click.activate();
	

	tms.redraw(true);

function display_marker()
	{
	if(amarker != undefined)
		{
		markers.removeMarker(amarker);
		//amarker.destroy();
		//amarker = undefined;
		}
	amarker =  new OpenLayers.Marker(curxy, icon);
	markers.addMarker(amarker);
	}

*/

