<!DOCTYPE html>

<?php

$id = $_GET['id'];

$m = new Mongo();
//$d = $m.selectDB("database");
$c = $m->selectDB("demo")->selectCollection("images");

$img = $c->findOne(array('_id'=>new MongoId($id)));

?>

<html> 
 
<head> 
<title>Connectome Viewer</title> 
<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1"> 
 
<script src="js/jquery-1.5.1.min.js"></script>
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
<script type="text/javascript" src="annotation.js"></script> 
<script type="text/javascript" src="cache.js"></script> 
<script type="text/javascript" src="viewer.js"></script> 
<script type="text/javascript" src="eventManager.js"></script> 



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

    function initViews(id) {
        //VIEWER = new Viewer(CANVAS,
        //                    [0,0,GL.viewportWidth, GL.viewportHeight],
        //                    source);

        //http://localhost:81/tile.php?image=4ecb20134834a302ac000001&name=tqsts.jpg
        var source1 = new Cache("http://localhost:81/tile.php?image="+id+"&name=");
        VIEWER1 = new Viewer([0,0, 1000,700], source1);

        EVENT_MANAGER.AddViewer(VIEWER1);

        //VIEWER1.AddAnnotation([10000, 10000], "Annotation1", [1.0,0.2,0.2]);
        //VIEWER1.AddAnnotation([12000, 11000], "Annotation2", [0,1,0.2]);
        
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

    function webGLStart(id) {
        CANVAS = document.getElementById("viewer-canvas");
        initGL(CANVAS);
        EVENT_MANAGER = new EventManager(CANVAS);
        initViews(id);
        initShaderPrograms();
        initOutlineBuffers();
        initImageTileBuffers();

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
	
    <canvas id="viewer-canvas" style="border: none;" width="1000" height="700"></canvas> 
	
	<script type="text/javascript">
		webGLStart(<?php echo json_encode($id);?>);
		
		var origin = <?php echo json_encode($img['origin']); ?>;
		var spacing = <?php echo json_encode($img['spacing']); ?>;
	</script>
	
	<?php
		//var_dump($img);
		//exit;
		foreach($img['bookmarks'] as $annotation){
			if($annotation['annotation']['type']=='pointer'){
			?>
			<script>
			var coord = <?php echo json_encode($annotation['annotation']['points']); ?>;
			var text = <?php echo json_encode($annotation['title']); ?>;
			var color = <?php echo json_encode($annotation['annotation']['color']); ?>;
			var pos = [];
			pos[0] = (coord[0][0]-origin[0])/(2*spacing[0]);
			pos[1] = -(coord[0][1]-origin[1])/(2*spacing[1]);
			VIEWER1.AddAnnotation(pos, text, color);
			</script>
			<?php
			}
		}
		
	?>

</body> 
 
</html> 
