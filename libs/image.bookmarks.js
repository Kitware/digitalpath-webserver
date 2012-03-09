/*
from PHP:
	imageName
*/

var myLog = { // TODO: is this really necessary?
	enable: true,
	send: (function(logString, logType)
		{
		logType = logType || "log"
		if (window.console && typeof logType === "string" && typeof console[logType] === "function")
			{
			console[logType](logString);
			}
		})
	};

var bookmarks = (function()
	{
	var pub = {};

	// Private properties
	var labelLayer;
	var labelFeatures;
	var shapeLayer;
	var shapeFeatures;
	var globalVisibilityState;
	var visibilityStates;
	var onBookmarkEvent;

	// Public registration methods
	pub.registerEvent = function(callbackFunc)
		{
		onBookmarkEvent = callbackFunc;
		}

	pub.unregisterEvent = function()
		{
		onBookmarkEvent = null;
		}

	// Public mutators
	pub.gotoBookmark = function(bookmarkNum)
		{
		var center = labelFeatures[bookmarkNum].attributes.center;
		map.moveTo(new OpenLayers.LonLat(center.x, center.y));
		};

	pub.setVisibilityState = function(bookmarkNum, newState, multipleCall)
		{
		if (multipleCall === undefined)
		{
		multipleCall = false;
		}
		if (visibilityStates[bookmarkNum] === newState)
			{
			return;
			}

		var newTheme;
		switch(newState)
			{
			case 0:
				newTheme = "c";
				setShapeVisibility(bookmarkNum, false);
				setLabelVisibility(bookmarkNum, false);
				break;
			case 1:
				newTheme = "b";
				setShapeVisibility(bookmarkNum, true);
				setLabelVisibility(bookmarkNum, false);
				break;
			case 2:
				newTheme = "e";
				setShapeVisibility(bookmarkNum, true);
				setLabelVisibility(bookmarkNum, true);
				break;
			default:
				break;
			}

		var bookmarkElem = $("#bookmark-item-" + bookmarkNum);
		changeButtonTheme(bookmarkElem, newTheme, false);
		var selectButtonThemeElems = $("[data-theme]", bookmarkElem);
		changeButtonTheme(selectButtonThemeElems, newTheme, !multipleCall); // if multipleCall == true, then call changeButtonTheme with hover = false

		visibilityStates[bookmarkNum] = newState;
		if (!multipleCall && onBookmarkEvent)
			{
			onBookmarkEvent();
			}
		};

	pub.setGlobalVisibilityState = function(newState)
		{
		// don't check if globalVisibilityState === newState and abort, as the global state can become inconsistant when individual bookmarks are selected
		var newTheme;
		switch(newState)
			{
			case 0:
				newTheme = "a";
				break;
			case 1:
				newTheme = "b";
				break;
			case 2:
				newTheme = "e";
				break;
			default:
				break;
			}

		changeButtonTheme($("#show-anno"), newTheme);

		for (var i = 0, len_i = visibilityStates.length; i < len_i; i++)
			{
			// this could be done faster by calling removeAllFeatures / addFeatures(labelFeatures) instead of a loop,
			// but changing global visibility is not done frequently
			pub.setVisibilityState(i, newState, true);
			}

		globalVisibilityState = newState;
		if (onBookmarkEvent)
			{
			onBookmarkEvent();
			}
		};

	// Public accessor
	pub.getState = function()
		{
		return {
			// TODO: send global state too
			bookmarks: visibilityStates.length ? visibilityStates : null // empty arrays aren't serialized properly for POST
			};
		};

	// Event handlers
	function onClickSelectBookmarkButton(event)
		{
		var bookmarkNum = event.data.bookmarkNum;
		pub.setVisibilityState(bookmarkNum, (visibilityStates[bookmarkNum] + 1) % 3);
		}

	function onClickGotoBookmarkButton(event)
		{
		pub.gotoBookmark(event.data.bookmarkNum);
		}

	function onClickAnnoButton(event)
		{
		pub.setGlobalVisibilityState((globalVisibilityState + 1) % 3);
		}

	// Private helper methods
	function setLabelVisibility(bookmarkNum, visibility)
		{
		// must always removeFeature before addFeature, to ensure duplicates are not added
		// removeFeature of a nonexistant feature is a no-op, so its safe to always do
		labelLayer.removeFeatures(labelFeatures[bookmarkNum], {silent: true});
		if (visibility)
			{
			labelLayer.addFeatures(labelFeatures[bookmarkNum], {silent: true});
			}
		}

	function setShapeVisibility(bookmarkNum, visibility)
		{
		shapeLayer.removeFeatures(shapeFeatures[bookmarkNum], {silent: true});
		if (visibility)
			{
			shapeLayer.addFeatures(shapeFeatures[bookmarkNum], {silent: true});
			}
		}

	function buildLayers(bookmarksData)
		{
		var baseFeatureStyle = OpenLayers.Util.extend(
			OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style["default"]),
			{
				fillOpacity: 0.2,
				strokeColor: "#0000ff", // blue
				strokeWidth: 3
			}
			);

		labelLayer = new OpenLayers.Layer.Vector(
			"TextLabels",
			{ // TODO: review this
				style: baseFeatureStyle,
				renderers: ["SVG"]
			}
			);
		map.addLayer(labelLayer);

		shapeLayer = new OpenLayers.Layer.Vector(
			"Annotations",
			{ // TODO: review this
				style: baseFeatureStyle,
				renderers: ["SVG"]
			}
			);
		map.addLayer(shapeLayer);

/* // TODO: deal with all this

		shapeLayer.events.register("featureselected", shapeLayer, displayAnnotation); //may not need this, could do from OpenLayers.Control.SelectFeature
		// Create control for clicking pointers	
		selControl = new OpenLayers.Control.SelectFeature( // set additional properties here
			anno, // can add an array of annotations at once, pass in that way
			{
				multiple: false, hover: false,
			}
			);
		map.addControl(selControl);
		selControl.activate();

selectControl = new OpenLayers.Control.SelectFeature(
	shapeLayer,
	{} //options
	);
map.addControl(selectControl);
selectControl.activate();

function onPopupClose(evt) {
    // 'this' is the popup.
    selectControl.unselect(this.feature);
}
function onFeatureSelect(evt) {
console.log("onFeatureSelect");
    feature = evt.feature;
    popup = new OpenLayers.Popup.Anchored("featurePopup",
                             feature.geometry.getBounds().getCenterLonLat(),
                             new OpenLayers.Size(100,100),
                             feature.attributes.title + feature.attributes.text,
                             null, true, onPopupClose);

    feature.popup = popup;
    popup.feature = feature;
    map.addPopup(popup);
}
function onFeatureUnselect(evt) {
console.log("onFeatureUnselect");
    feature = evt.feature;
    if (feature.popup) {
        popup.feature = null;
        map.removePopup(feature.popup);
        feature.popup.destroy();
        feature.popup = null;
    }
}


function displayAnnotation(evt)
	{
	// alert("Hello");
	alert(evt.feature.attributes.title + ",\n Details: " + evt.feature.attributes.details);
	// selControl.unselect(evt.feature);
	}

labelLayer.events.on({
    "featureselected": onFeatureSelect,
    "featureunselected": onFeatureUnselect
	scope: labelLayer
});
*/

		var spacing = bookmarksData["spacing"];
		var origin = bookmarksData["origin"];
		labelFeatures = [];
		shapeFeatures = [];

		for (var i = 0, len_i = bookmarksData["bookmarks"].length; i < len_i; i++)
			{
			var currBookmark = bookmarksData["bookmarks"][i];

			var center_x = (currBookmark["center"][0]-origin[0]) / spacing[0];
			var center_y = (currBookmark["center"][1]-origin[1]) / spacing[1] * -1;
			var attributes = {
				title: currBookmark["title"],
				details: currBookmark["details"],
				center: new OpenLayers.Geometry.Point(center_x,center_y)
				// TODO: 'lens' -> zoom
				};

			var pointList = [];
			for(var j = 0, len_j = currBookmark["annotation"]["points"].length; j < len_j; j++)
				{
				var p = currBookmark["annotation"]["points"][j];
				var p_x = (p[0]-origin[0]) / spacing[0];
				var p_y = (p[1]-origin[1]) / spacing[1] * -1; // reflect: database +y is downward; OpenLayers +y is upward
				pointList.push(new OpenLayers.Geometry.Point(p_x,p_y));
				}

			// Feature for text label
			var labelFeature = new OpenLayers.Feature.Vector(
				pointList[0].clone(),
				attributes,
				OpenLayers.Util.extend(
					OpenLayers.Util.extend({}, baseFeatureStyle),
					{
						fontColor: currBookmark["annotation"]["color"],
						fontSize: "18",
						fontWeight: "bolder",
						graphic: false,
						graphicZIndex: 56, // Some large number
						label: currBookmark["title"],
						labelYOffset: 25
					}
					)
				);
			labelFeatures.push(labelFeature);

			// Feature for annotation shape
			var shapeFeature;
			switch (currBookmark["annotation"]["type"])
				{
				case "pointer":
					// find out length and angle
					var dx = pointList[0].x - pointList[1].x;
					var dy = 1 * (pointList[0].y - pointList[1].y);
					var length = Math.sqrt(dx*dx + dy*dy); // TODO: not used
					var angle = Math.atan(dy / dx) * (180 / Math.PI);
					if (dx < 0)
						{
						angle += 180; // codomain of arctan is only (-180, 180)
						}
					shapeFeature = new OpenLayers.Feature.Vector(
						pointList[0].clone(),
						attributes,
						OpenLayers.Util.extend(
							OpenLayers.Util.extend({}, baseFeatureStyle),
							{
								externalGraphic: "img/centered-yellow-arrow.png",
								graphic: true,
								graphicOpacity: 1.0,
								graphicTitle: currBookmark["title"],
								graphicWidth: 60,
								graphicZIndex: 55, // Some large number
								rotation: -1 * angle // reverse direction; OpenLayers rotates clockwise
							}
							)
						);
					break;
				case "circle":
					var spacingNorm = Math.sqrt(spacing[0]*spacing[0] + spacing[1]*spacing[1]);
					var radius = currBookmark["annotation"]["radius"] / spacingNorm;
					shapeFeature = new OpenLayers.Feature.Vector(
						OpenLayers.Geometry.Polygon.createRegularPolygon(pointList[0].clone(), radius, 20),
						attributes,
						OpenLayers.Util.extend(
							OpenLayers.Util.extend({}, baseFeatureStyle),
							{
								// TODO: add more properties here
								fill: false,
								strokeColor: currBookmark["annotation"]["color"]
							}
							)
						);
					break;
				default :
					shapeFeature = new OpenLayers.Feature.Vector(
						pointList[0].clone(), // TODO: does just a point show up? // new OpenLayers.Geometry.LineString([pointList[0], pointList[0]])
						attributes,
						OpenLayers.Util.extend(
							OpenLayers.Util.extend({}, baseFeatureStyle),
							{
								// TODO: add more properties here
								strokeColor: currBookmark["annotation"]["color"]
							}
							)
						);
					break;
				} // END switch
				shapeFeatures.push(shapeFeature);
			} // END for
		} // END build_layers

	function buildList(bookmarksData)
		{
		globalVisibilityState = 0;
		visibilityStates = [];
		for (var i = 0, len_i = bookmarksData["bookmarks"].length; i < len_i; i++)
			{
			var currBookmark = bookmarksData["bookmarks"][i];

			visibilityStates.push(0);
			$("#bookmark-list").append(
				$("<li/>")
					.attr({
						"id": "bookmark-item-" + i,
						"data-theme": "c",
						"data-filtertext": currBookmark["title"] + " " + currBookmark["details"]
						})
					.append(
						$("<a/>")
							.on("vclick", {bookmarkNum: i}, onClickGotoBookmarkButton)
							.attr({
								"data-rel": "back",
								"href": "#mappage",
								"data-direction": "reverse",
								})
							.append(
								$("<h3/>").text(currBookmark["title"]),
								$("<p/>").text(currBookmark["details"])
//								$("<p/>").addClass("ui-li-aside").text("Right side extra content") // extra content can be added here
								),
						$("<a/>")
							.on("vclick", {bookmarkNum: i}, onClickSelectBookmarkButton)
							.attr({
								"data-role": "button",
								"data-theme": "c"
								})
							.text("Toggle visibility")
						)
				);
			} // END for
		} // END build_list

	// Initialization method - must be called before any others
	pub.init = function()
		{
		onBookmarkEvent = null;
		visibilityStates = [];

		$.ajax(
			{
			url: "bookmarks.php",
			data:
				{
				'id': imageName
				},
			dataType: "json",
			success: function(data, textStatus, jqXHR)
				{
				if (data["bookmarks"] !== null)
					{
					buildLayers(data);
					buildList(data);
					$("#show-anno").on("vclick", onClickAnnoButton);
					$('#show-anno').removeClass('ui-disabled');
					$('#show-bookmarks').removeClass('ui-disabled');
					}
				},
			error: function(jqXHR, textStatus, errorThrown)
				{
				myLog.send("bookmarks.fetch_bookmarks() failed, because: " + textStatus + ": " + errorThrown, "error");
				}
			});
		};

	return pub;
}());

