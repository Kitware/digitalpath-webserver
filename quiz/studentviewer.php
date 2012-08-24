<!DOCTYPE html>




<html> 
 
<head> 


<title>Connectome Viewer</title> 

<link rel="stylesheet" type="text/css" href="studentviewer.css" />

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
$lessonid = $_GET['id'];
$index = $_GET['index'];

$m = new Mongo();
$d = $m->selectDb("demo");
$c1 = $d->selectCollection("questions");
$c2 = $d->selectCollection("lessons");

$lesson = $c2->findOne(array('_id'=>new MongoId($lessonid)));

$qid = $lesson['questions'][$index];

$mongo_question = $c1->findOne(array('qid'=>$qid));
$image_collection = $d->selectCollection("images");
$mongo_image = $image_collection->findOne(array('_id'=> new MongoId($mongo_question['imageid'])));

/* DOCUMENTATION

Collection 'questions':
    'qid' - question ID - MONGOID
    'imageid' - image ID
    'qtext'
    'cam'
    array 'choices'(
        choice 1 text,
        choice 2 text,
        choice 3 text,
        ...
        )
    array 'annotations'(
        annotation 1 - array(
            type
            other
            )
        annotation 2 - array(
            type
            other
            )
        )
        
To start, we

setquestion.php
    - 

*/

?>

<script type="text/javascript" >

var LESSON = <?php echo json_encode($lesson); ?>;
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

var LESSON;
var QUESTION;
var IMAGE;

    function initViews() {
        //VIEWER = new Viewer(CANVAS,
        //                    [0,0,GL.viewportWidth, GL.viewportHeight],
        //                    source);

        //http://localhost:81/tile.php?image=4ecb20134834a302ac000001&name=tqsts.jpg
        var source1 = new Cache("http://localhost:81/tile.php?image="+QUESTION.imageid+"&name=");
        VIEWER1 = new Viewer([0,0, 900,700], source1);
        VIEWER1.AnnotationCallback = function(widget) {
            var json = widget.Serialize();
            $.post("saveannotation.php?id="+QUESTION.qid.$id, {widget:json}, function(){
                saveConstants();
            });
        }
        var cam = QUESTION.cam;
        if(cam){
            VIEWER1.MainView.Camera.Height = parseFloat(cam.height);
            VIEWER1.MainView.Camera.FocalPoint[0] = parseFloat(cam.fp[0]);
            VIEWER1.MainView.Camera.FocalPoint[1] = parseFloat(cam.fp[1]);
            VIEWER1.MainView.Camera.FocalPoint[2] = parseFloat(cam.fp[2]);
            VIEWER1.MainView.Camera.Roll = parseFloat(cam.roll);
            VIEWER1.OverView.Camera.Roll = parseFloat(cam.roll);
            VIEWER1.MainView.Camera.ComputeMatrix();
            VIEWER1.OverView.Camera.ComputeMatrix();
        }
        
        EVENT_MANAGER.AddViewer(VIEWER1);
        if(QUESTION.annotations != undefined){
            for(var i=0; i < QUESTION.annotations.length; i++){
                switch(QUESTION.annotations[i].type){
                    case "arrow":
                        var arrow = new Arrow();
                        arrow.Origin = QUESTION.annotations[i].origin;
                        arrow.FillColor = QUESTION.annotations[i].fillcolor;
                        arrow.OutlineColor = QUESTION.annotations[i].outlinecolor;
                        arrow.Length = QUESTION.annotations[i].length;
                        arrow.Width = QUESTION.annotations[i].width;
                        arrow.Orientation = QUESTION.annotations[i].orientation;
                        arrow.UpdateBuffers();
                        VIEWER1.AddShape(arrow);
                        break;
                    case "text":
                        var text = new Text();
                        text.Color = QUESTION.annotations[i].color;
                        text.Size = QUESTION.annotations[i].size;
                        text.Anchor = QUESTION.annotations[i].anchor;
                        text.Position = QUESTION.annotations[i].position;
                        text.String = QUESTION.annotations[i].string;
                        text.UpdateBuffers();
                        VIEWER1.AddShape(text);
                        break;
                    case "circle":
                        var circle = new Circle();
                        circle.Origin[0] = parseFloat(QUESTION.annotations[i].origin[0]);
                        circle.Origin[1] = parseFloat(QUESTION.annotations[i].origin[1]);
                        circle.OutlineColor[0] = parseFloat(QUESTION.annotations[i].outlinecolor[0]);
                        circle.OutlineColor[1] = parseFloat(QUESTION.annotations[i].outlinecolor[1]);
                        circle.OutlineColor[2] = parseFloat(QUESTION.annotations[i].outlinecolor[2]);
                        circle.Radius = parseFloat(QUESTION.annotations[i].radius);
                        circle.LineWidth = parseFloat(QUESTION.annotations[i].linewidth);
                        circle.FixedSize = false;
                        circle.UpdateBuffers();
                        VIEWER1.AddShape(circle);
                        break;
                    case "freeform":
                        break;
                }
            }
        }
        
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
    
    
    /*function NewArrow() {
      //alert("New Arrow");
      // When the arrow button is pressed, create the widget.
      //alert("CLICK!");
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
    }*/
    
    
    
    //********************************************************
    
    function findChecked(){
        var span = document.getElementById("form");
        var inputs = span.getElementsByTagName("input");
        var radios = [];
        for (var i = 0; i < inputs.length; ++i){
            if (inputs[i].type.toLowerCase() === "radio") {
                radios.push(inputs[i]);
            }
        }
        for (var i = 0; i < radios.length; ++i) {
            if (radios[i].checked) {
                return i;
            }
        }
        
        return -1;
    }
    
    function saveAnswer(){
        var loc = findChecked();
        var index = <?php echo $index; ?>;
        var msg='<span style="color:#';
        if(loc == QUESTION.correct){
            msg += '00ff00" >Correct!</span><br />';
        } else {
            msg += 'ff0000" >Incorrect!</span><br />';
        }
        $('#form').append(msg);
    }
    
    $(document).ready(function() {
        
        var liststring = '';
        
        var index = <?php echo $index; ?>;
        
        if(index > 0){
            $('#prev').append('<a href="studentviewer.php?id='+LESSON._id.$id+'&index='+(index-1)+'">Previous Question</a>');
        }
        
        if(index < LESSON.questions.length-1){
            $('#next').append('<a href="studentviewer.php?id='+LESSON._id.$id+'&index='+(index+1)+'">Next Question</a>');
        }
        
        liststring = liststring +
            '<h4>'+QUESTION.title+'</h4><br /><br />'+
            '#'+index+':<br />'+
            QUESTION.qtext+'<br /><br />';
        
        for(var i=0; i<QUESTION.choices.length; i++){
            liststring = liststring+'<input type="radio" name="choices" id="choice'+i+'" value="'+QUESTION.choices[i]+'" />'+QUESTION.choices[i]+'<br />';
        }
        
        liststring = liststring+'<button id="saveanswer" >Submit Answer</button>';
        
        $("#form").append(liststring);
        
        $('#saveanswer').click(function(){
            saveAnswer();
        });
        
    });
 
</script> 
 
 
</head> 
 
 
<body onload="webGLStart();">
    <div class="container" >
    <div class="header" >
        <div style="float:left;width:75px;height:100%;" id="prev" >
            <!-- Previous Question link -->
        </div>
        <div style="float:left;width:1060px;height:100%;" id="dir" >
        Site map and links
        </div>
        <div style="float:right;width:75px;height:100%;" id="next" >
            <!-- Next Question link -->
        </div>
    </div>
    <div class="viewer" >
        <canvas id="viewer-canvas" style="border: none;" width="1000" height="700"></canvas>
    </div>
    <div id="form" >
    </div>
    </div>
    
    
    
</body> 
 
</html> 