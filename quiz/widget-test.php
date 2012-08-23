<!DOCTYPE html>

<html> 
 
<head> 
<title>Connectome Viewer</title> 

<link rel="stylesheet" type="text/css" href="viewer.css" />

<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1"> 
 
<script src="../libs/jquery/jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="glMatrix-0.9.5.min.js"></script> 
<script type="text/javascript" src="webgl-utils.js"></script> 
<script type="text/javascript" src="init.js"></script> 
<script type="text/javascript" src="camera.js"></script> 
<script type="text/javascript" src="view.js"></script> 
<script type="text/javascript" src="tile.js"></script> 
<script type="text/javascript" src="text.js"></script> 
<script type="text/javascript" src="shape.js"></script> 
<script type="text/javascript" src="arrow.js"></script> 
<script type="text/javascript" src="circle.js"></script> 
<script type="text/javascript" src="freeForm.js"></script> 
<script type="text/javascript" src="arrowWidget.js"></script> 
<script type="text/javascript" src="circleWidget.js"></script> 
<script type="text/javascript" src="textWidget.js"></script> 
<script type="text/javascript" src="freeFormWidget.js"></script> 
<script type="text/javascript" src="annotation.js"></script> 
<script type="text/javascript" src="cache.js"></script> 
<script type="text/javascript" src="viewer.js"></script> 
<script type="text/javascript" src="eventManager.js"></script> 


<?php 
   $id = $_GET['id'];
   if ( ! $id) {
     $id = "4e6ec90183ff8d11c8000001";
   }
?>

<script type="text/javascript"> 
  var IMAGE_ID = "<?php echo $id?>";
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


    function handleMouseDown(event) {EVENT_MANAGER.HandleMouseDown(event);}
    function handleMouseUp(event) {EVENT_MANAGER.HandleMouseUp(event);}
    function handleMouseMove(event) {EVENT_MANAGER.HandleMouseMove(event);}
    function handleKeyDown(event) {EVENT_MANAGER.HandleKeyDown(event);}
    function handleKeyUp(event) {EVENT_MANAGER.HandleKeyUp(event);}

     

    function draw() {
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        // This just changes the camera based on the current time.
        VIEWER1.Animate();
        VIEWER1.Draw();	
    }
    
    
    function NewArrow() {
      var obj = new Object();
      obj.Question = "How do you create a blank object";
      obj.Answers = [];
      obj.Answers.push("Just start using it.");
      obj.Answers.push("I do not know.");
      jsonObj = JSON.stringify(obj);
      alert(jsonObj);


      //alert("New Arrow");
      // When the arrow button is pressed, create the widget.
      VIEWER1.Widget = new ArrowWidget(VIEWER1);
    }

    function NewCircle() {
      // When the circle button is pressed, create the widget.
      VIEWER1.Widget = new CircleWidget(VIEWER1);
    }

    function NewText() {
      // When the text button is pressed, create the widget.
      VIEWER1.Widget = new TextWidget(VIEWER1);
    }

    function NewFreeForm() {
      // When the text button is pressed, create the widget.
      VIEWER1.Widget = new FreeFormWidget(VIEWER1);
    }

    function webGLStart() {
        CANVAS = document.getElementById("viewer-canvas");
        initGL(CANVAS);
        EVENT_MANAGER = new EventManager(CANVAS);
    
        var imageRoot= "http://localhost:81/tile.php?image="+IMAGE_ID+"&name="; 
        var source1 = new Cache(imageRoot);
        VIEWER1 = new Viewer([0,0, 900,700], source1);

        EVENT_MANAGER.AddViewer(VIEWER1);


        initShaderPrograms();
        initOutlineBuffers();
        initImageTileBuffers();

        //var ff = new FreeForm();
        //ff.FixedSize = false;
        //ff.Origin = [6000,6000];
        //ff.Points.push([1000.0, 0.0]);
        //ff.Points.push([0.0, 1000.0]);
        //ff.Points.push([-1000.0, 0.0]);
        //ff.Points.push([0.0, -1000.0]);
        //ff.LineWidth = 100.0;
        //ff.OutlineColor = [0,0,0];
        //ff.UpdateBuffers();
        //VIEWER1.AddShape(ff);

        //var c = new Circle();
        //c.FixedSize = false;
        //c.Origin = [6000,6000];
        //c.Radius = 1000.0;
        //c.LineWidth = 200.0;
        //c.OutlineColor = [0,0,0];
        //c.FillColor = [1,0,0];
        //c.UpdateBuffers();
        //VIEWER1.AddShape(c);

        var t = new Text();
        t.Position = [6000,6000];
        t.Color = [0,0,0];
        t.String = "Hello\nWorld";
        t.UpdateBuffers();
        VIEWER1.AddShape(t);

        GL.clearColor(0.9, 0.9, 0.9, 1.0);
        GL.enable(GL.DEPTH_TEST);
 
        CANVAS.onmousedown = handleMouseDown;
        document.onmouseup = handleMouseUp;
        document.onmousemove = handleMouseMove;

        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
 
        eventuallyRender();
    }
 
</script> 
 
 
</head> 
 
 
<body> 
	
  <div class="container" >
    <div class="viewer" >
    <canvas id="viewer-canvas" style="border: none;" width="900" height="700"></canvas> 
    <br/> 

    <table border="1">
	<tr>
            <td>
                <img src="Arrow.gif" id="arrow" type="button" onclick="NewArrow();" />
            </td>
            <td>
                <img src="Circle.gif" id="arrow" type="button" onclick="NewCircle();" />
            </td>
            <td>
                <img src="FreeForm.gif" id="text" type="button" onclick="NewFreeForm();" />
            </td>
            <td>
                <img src="Text.gif" id="text" type="button" onclick="NewText();" />
            </td>
	</tr>
    </table>

    <br/> 
	
	<script type="text/javascript">
		webGLStart();
		
		var origin = [9663763,7643791.5,0];
		var spacing = [226.17269405242,227.53127170139,0];
	</script>
    </div>
  </div>
			
</body> 
 
</html> 
