<!DOCTYPE html>




<html> 
 
<head> 


<title>Connectome Viewer</title> 

<link rel="stylesheet" type="text/css" href="viewer.css" />

<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1"> 
 
<script src="js/js/jquery-1.7.2.min.js"></script>
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

<?php
$qid = $_GET['id'];

$m = new Mongo();
$d = $m->selectDb("demo");
$c = $d->selectCollection("questions");

$mongo_question = $c->findOne(array('_id'=>new MongoId($qid)));
$image_collection = $d->selectCollection("images");
$mongo_image = $image_collection->findOne(array('_id'=> new MongoId($mongo_question['imageid'])));
?>

<script type="text/javascript">
    var QUESTION = <?php echo json_encode($mongo_question);?>;
    var IMAGE = <?php echo json_encode($mongo_image);?>;
	// These globals are used in the viewer javascript.  I need to get rid of them.	
    var origin = IMAGE.origin;
    var spacing = IMAGE.spacing;
    // Could there be a problem with body not loaded yet?
    //$('body').data('ID', QUESTION.imageid);
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

    function initViews() {
        //VIEWER = new Viewer(CANVAS,
        //                    [0,0,GL.viewportWidth, GL.viewportHeight],
        //                    source);

        //http://localhost:81/tile.php?image=4ecb20134834a302ac000001&name=tqsts.jpg
        var source1 = new Cache("http://localhost:81/tile.php?image="+QUESTION.imageid+"&name=");
        VIEWER1 = new Viewer([0,0, 900,700], source1);

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

    function webGLStart() {
        CANVAS = document.getElementById("viewer-canvas");
        initGL(CANVAS);
        EVENT_MANAGER = new EventManager(CANVAS);
        initViews();
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
    
    
    //********************************************************
    
    
    function addanswer() {
            var questionchoices = [];
            var questiontext = document.getElementById("qtext").value;
            
            var numAnswers = $('.answer').length;
            
            for(var i=0; i < numAnswers; i++){
                questionchoices[i] = $('.answer')[i].value;
            }
            
            var imgid = $("body").data("ID");
            
            $.post("setquestion.php?qid="+imgid, {qtext:questiontext, choices:questionchoices});
            
            var liststring = '1: <input type="text" class="answer" /><br />';
            $('#choicelist').append(liststring); 
        }
        
        function savequestion() {
            var questionchoices = [];
            var questiontext = document.getElementById("qtext").value;
            
            var numAnswers = $('.answer').length;
            
            for(var i=0; i < numAnswers; i++){
                questionchoices[i] = $('.answer')[i].value;
            }
            
            var imgid = $("body").data("ID");
            $.post("setquestion.php?qid="+imgid, {qtext:questiontext, choices:questionchoices});
            
            window.location = "lessonmaker.php";
        }
    
    $(document).ready(function() {
            if (QUESTION.choices) {
                document.getElementById("qtext").innerHTML = QUESTION.qtext;
                for (var i = 0; i < QUESTION.choices.length; ++i) {
                    var liststring = i+': <input type="text" class="answer" value="'+QUESTION.choices[i]+'" /><br />';
                    $('#choicelist').append(liststring);    
                }
            }            
    });
 
</script> 
 
 
</head> 
 
 
<body onload="webGLStart();">

    <script>
        $('body').data({'ID': '<?php echo $qid; ?>'});
    </script>
    <div class="container" >
    <div class="viewer" >
        <canvas id="viewer-canvas" style="border: none;" width="1000" height="700"></canvas> 
    </div>
    <div class="form" >
        <textarea id="qtext" ></textarea><br /><br />
        <div id="choicelist" >
        </div>
        <br />
        <button id="addanswer" onclick="addanswer();" >Add Answer Choice</button><br />
        <button id="savequestion" onclick="savequestion();" >Save Question</button>
    </div>
    </div>
    
    
    
</body> 
 
</html> 
