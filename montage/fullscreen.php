<?php

@$image = $_GET["image"];
@$zoomLevels = $_GET["levels"];
$tileSize = 256;
$baseName = 'tera';

?>


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
 "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">  
  <title> Rotated full screen digital pathology view </title>
  <style type="text/css" media="screen">
			body{
				height : 100%;
				width : 100%;
				background-color:white;
				border:'6px'!important;
				padding:'1'!important;
				opacity:1.;
				}
			#mapcontainer{
		    display:block;
		    /*set the div in the top-left corner of the screen*/
				position:absolute;
				overflow:hidden!important;
				top:0;
				left:0;
				/*set the width and height to 100% of the screen*/
				width:100%;
				height:100%;
			}	
			.button
				{
				z-index: 1000; 
				border:'25px'!important;
				padding:'25px'!important;
				width:'8em';
				position:absolute;
				background-color:rgba(255,150,150,.5);
				}
			div#plus
				{
				bottom: 400px;
				left: 10px;
				}
			#minus
				{
				bottom: 300px;
				left: 10px;
				}
			#rotater
				{
				bottom: 200px;
				left: 10px;
				}
			#rotatel
				{
				bottom: 100px;
				left: 10px;
				}
	</style>
</head>

<body onload="initialize();" >
		<div id="mapcontainer"><div id="map"></div>
		<div id="plus" class='button' onclick="zoom2(1);"> Zoom In </div>
		<div id="minus" class='button' onclick="zoom2(-1);"> Zoom Out </div>
		<div id="rotatel" class='button' onclick="rotate(5);"> Rotate Right </div>
		<div id="rotater" class='button' onclick="rotate(-5);"> Rotate Left </div>
</div>
	
	<script src="http://code.jquery.com/jquery-1.4.1.min.js"></script>
	<script src="css-transform.js"></script>
	<script src="css-rotate.js"></script>
	<script src="OpenLayers.mobile.js"></script>
	
	<script>

	// Default config parameters
	var map;
	var zoomLevels = <?php echo($zoomLevels); ?>;
	var baseName = '<?php echo($baseName); ?>';
	var imageName = '<?php echo($image); ?>';
	var tileSize = 256;

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
//      var some = "http://paraviewweb.kitware.com:82/tile.py/" + baseName + "/" + imageName + "/" + tileName+".jpg";
      var some = "chunk.php?db=" + baseName + "&image=" + imageName + "&name=" + tileName+".jpg";
	return some
     
  }

function initialize() 
	{
	mapcontainer = $('#mapcontainer');
	mapdiv = $('#map');

	var boundSize = tileSize *  Math.pow(2,zoomLevels-1); 
	
	var containwidth = parseFloat($('#mapcontainer').css('width'))
	var containheight = parseFloat($('#mapcontainer').css('height'))

	var hyp = parseInt(Math.sqrt(containheight * containheight + containwidth * containwidth))
	var map_top_margin = parseInt((hyp - containheight) / -2);
	var map_left_margin = parseInt((hyp - containwidth) / -2);
	
	mapdiv.css('width',hyp + "px");
	mapdiv.css('height',hyp + "px");
	mapdiv.css('cssText', 'margin-top :' + map_top_margin + 'px !important; margin-left :' + map_left_margin + 'px !important; height : ' + hyp + 'px !important; width : ' + hyp + 'px !important;');
	//mapdiv.css('margin-left',map_left_margin + "px!important");

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
			tileSize: new OpenLayers.Size(tileSize, tileSize),
			mapRotation:0.0
    }
  );

  //create custom tile manager
  var tms = new OpenLayers.Layer.TMS( "Biology TMS", "http://127.0.0.1/connectome",
    {
    'type':'jpg',
    'getURL':get_my_url,
    }
  );

  tms.transitionEffect = 'resize';
  //add the tiles to the map
 
  map.addLayer(tms);
  map.zoomToMaxExtent();


	//map.setCenter(new google.maps.LatLng(37.4419, -122.1419), 13);
	setFocus();
  
   function setFocus(){
       mapcontainer.attr('tabIndex','-1');
       mapcontainer.focus();
     }
     mapcontainer.keydown(function(event){
       switch(event.keyCode){
         case 82: 
						rotate(5);
						break;
         case 76: 
						rotate(-5);
						break;
         case 40: map.panDirection(0,-1); break;
         case 38: map.panDirection(0,1); break;
         case 39: map.panDirection(-1,0); break;
         case 37: map.panDirection(1,0); break;
         case 107: case 187: map.setZoom(map.getZoom()+1); break;
         case 109: case 189: map.setZoom(map.getZoom()-1); break;
         case 61: mapdiv.animate({rotate: '0'}, 0); break;
       }
     });
   }
	
	function zoom2(num)
		{
			if(num > 0)
				{
				map.zoomIn();
				}
			else
				{
				map.zoomOut();
				}
		}

	function rotate(num)
		{
			var stri = "+=" + num + 'deg';
			if (num < 0)
				var stri = "-=" + (-num) + 'deg';
				
			mapdiv.animate({rotate: stri}, 0); 
			map.mapRotation -= num;
		}
 </script>
 
</body>
</html>
