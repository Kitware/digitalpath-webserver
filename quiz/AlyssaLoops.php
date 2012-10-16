<!DOCTYPE html>

<html> 
 
<head> 


<title>Connectome Viewer</title> 

<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1"> 

<link type="text/css" href="js/css/ui-lightness/jquery-ui-1.8.22.custom.css" rel="stylesheet" />
<script type="text/javascript" src="js/js/jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="js/js/jquery-ui-1.8.22.custom.min.js"></script>
<script type="text/javascript" src="glMatrix-0.9.5.min.js"></script>
<script type="text/javascript" src="webgl-utils.js"></script>
<script type="text/javascript" src="init.js"></script>
<script type="text/javascript" src="camera.js"></script>
<script type="text/javascript" src="tile.js"></script>
<script type="text/javascript" src="cache.js"></script>
<script type="text/javascript" src="section.js"></script>
<script type="text/javascript" src="view.js"></script>
<script type="text/javascript" src="viewer.js"></script>
<script type="text/javascript" src="eventManager.js"></script>
<script type="text/javascript" src="shape.js"></script>
<script type="text/javascript" src="arrow.js"></script>
<script type="text/javascript" src="circle.js"></script>
<script type="text/javascript" src="text.js"></script>
<script type="text/javascript" src="circleWidget.js"></script>
<script type="text/javascript" src="textWidget.js"></script>


<?php
$m = new Mongo();
$d = $m->selectDb('Alyssa');
$c = $d->selectCollection('stitch');

$world_points = $c->findOne(array('type'=>'WorldPoints'));

$tiles = $c->find(array('type'=>'Image'));
$tile_arr = array();
foreach($tiles as $t){
    array_push($tile_arr, $t);
}
?>
<script type="text/javascript">
  var TILES = <?php echo json_encode($tile_arr); ?>;
  var tmp = <?php echo json_encode($world_points); ?>;
  var WORLD_POINTS = tmp.PointArray;
</script>


<script type="text/javascript">
  // These globals are used in the viewer javascript.  I need to get rid of them.	
  var origin = [0, 0, 0];
  var spacing = [1, 1, 0];
</script>

<script id="shader-poly-fs" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec3 uColor;
  void main(void) {
   gl_FragColor = vec4(uColor, 1.0);
   //gl_FragColor = vec4(0.5, 0.0, 0.0, 1.0);
  }
</script>
<script id="shader-poly-vs" type="x-shader/x-vertex">
  attribute vec3 aVertexPosition;
  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  }
</script>
<script id="shader-tile-fs" type="x-shader/x-fragment"> 
  #ifdef GL_ES
  precision highp float;
  #endif

  uniform sampler2D uSampler;
  varying vec2 vTextureCoord;
 
  void main(void) {
    gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  }
</script>  
<script id="shader-tile-vs" type="x-shader/x-vertex"> 
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  uniform mat3 uNMatrix;
  varying vec2 vTextureCoord;

  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
  }
</script> 
<script id="shader-text-fs" type="x-shader/x-fragment">
  precision mediump float;

  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  uniform vec3 uColor;

  void main(void) {
    vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    // Use the image pixel value as transparency.
    gl_FragColor = vec4(uColor, textureColor.rgb[0]);
  }
</script>
<script id="shader-text-vs" type="x-shader/x-vertex">
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;

  varying vec2 vTextureCoord;
  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
  }
</script>
<script type="text/javascript"> 
 

  var CANVAS;
  var EVENT_MANAGER;
  var VIEWER1;
  var SECTIONS = [];

  function initViews() {
    var tileDims = [256,256];
    // For cropping
    var imageDims = [16384,16384];
    // Used to compute the bounds.
    //var montageDims = [5,3];
    var montageDims = [5,3];
    var imageOverlap = 1200;
    //
    var numberOfLevels = 7;
    var dataBaseName = "Alyssa";


    VIEWER1 = new Viewer([0,0, CANVAS.width,CANVAS.height]);
    VIEWER1.SetOverviewBounds(0,montageDims[0]*(imageDims[0]-imageOverlap),
                              0,montageDims[1]*(imageDims[1]-imageOverlap));
    var section = [];    

    section = new Section();
    for (var i = 0; i < TILES.length; ++i) {
      tileMetaData = TILES[i];
      sourceName = "http://localhost:81/quiz/tile.php?db=" + dataBaseName 
        + "&image=" + tileMetaData.imageCollection + "&name=";
      source = new Cache(sourceName, numberOfLevels, imageDims, tileDims);
      //source.SetOrigin(tileMetaData.centerX-(imageDims[0]/2.0),tileMetaData.centerY-(imageDims[1]/2));
      var loop = [];
      for (var j = 0; j < tileMetaData.Loop.length; ++j) {
        var loopPt = new Object();
        loopPt.ImagePt = [tileMetaData.Loop[j].xLocation, tileMetaData.Loop[j].yLocation];
        loopPt.WorldPt = [WORLD_POINTS[tileMetaData.Loop[j].worldPointId].xLocation, WORLD_POINTS[tileMetaData.Loop[j].worldPointId].yLocation];
        loop.push(loopPt);
      }
      // center will not always be in the exact cetner of the image.
      // TODO: We need to store the center more robustly.
      var centerPt = new Object();
      centerPt.ImagePt = [tileMetaData.dimensionsX/2,tileMetaData.dimensionsY/2];
      centerPt.WorldPt = [tileMetaData.centerX, tileMetaData.centerY];
      source.SetLoop(loop, centerPt);
      
      section.Caches.push(source);
    }
    //
    var matrix = mat4.create();
    mat4.identity(matrix);
    section.Matrix = matrix;
    SECTIONS.push(section);
    
    VIEWER1.SetSection(SECTIONS[0]);

    EVENT_MANAGER = new EventManager(CANVAS);
    EVENT_MANAGER.AddViewer(VIEWER1); 
  }

  function draw() {
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    // This just changes the camera based on the current time.
    VIEWER1.Animate();
    VIEWER1.Draw();	
  }

  function handleMouseDown(event) {EVENT_MANAGER.HandleMouseDown(event);}
  function handleMouseUp(event) {EVENT_MANAGER.HandleMouseUp(event);}
  function handleMouseMove(event) {EVENT_MANAGER.HandleMouseMove(event);}
  function handleKeyDown(event) {EVENT_MANAGER.HandleKeyDown(event);}
  function handleKeyUp(event) {EVENT_MANAGER.HandleKeyUp(event);}

  function webGLStart() {
    CANVAS = document.getElementById("viewer-canvas");
    initGL(CANVAS);
    initImageTileBuffers();
    initViews();
    initShaderPrograms();
    initOutlineBuffers();

    GL.clearColor(0.9, 0.9, 0.9, 1.0);
    GL.enable(GL.DEPTH_TEST);

    CANVAS.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    eventuallyRender();
  }

 
  function zoomIn() {
    VIEWER1.AnimateZoom(0.5);
  }
  
  function zoomOut() {
    VIEWER1.AnimateZoom(2.0);
  }
  
  function rotateRight() {
    VIEWER1.AnimateRoll(-12.0); // degrees
  }
  
  function rotateLeft() {
    VIEWER1.AnimateRoll(12.0); // degrees
  }

  
  function newCircle() {
    var widget = new CircleWidget(VIEWER1, true);
  }
  
  function newText() {
    var widget = new TextWidget(VIEWER1, "Some Text");
    widget.SetAnchorShapeVisibility(true);
    widget.SetPosition(6000,6000);
    widget.SetTextOffset(30,100);
  }

  
  
</script> 
 
</head> 
 
 
<body onload="webGLStart();">
  <canvas id="viewer-canvas" style="border: none;" width="1000" height="500"></canvas>
  </br>
  <table border="1" id="rotatebuttons" >
    <tr>
      <td type="button" onclick="zoomIn();" style="width:20px;height:20px;background-color:white;text-align:center;" >+</td>
      <td type="button" onclick="zoomOut();" style="width:20px;height:20px;background-color:white;text-align:center;" >-</td>
      <td type="button" onclick="rotateRight();" style="width:20px;height:20px;background-color:white;text-align:center;" >R</td>
      <td type="button" onclick="rotateLeft();" style="width:20px;height:20px;background-color:white;text-align:center;" >L</td>
      <td type="button" onclick="newCircle();" style="width:20px;height:20px;background-color:white;text-align:center;" >O</td>
      <td type="button" onclick="newText();" style="width:20px;height:20px;background-color:white;text-align:center;" >T</td>
    </tr>
  </table>
 </body> 
 
</html> 
