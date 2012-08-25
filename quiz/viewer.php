<!DOCTYPE html>




<html> 
 
<head> 


<title>Connectome Viewer</title> 

<link rel="stylesheet" type="text/css" href="viewer.css" />

<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1"> 

<link type="text/css" href="js/css/ui-lightness/jquery-ui-1.8.22.custom.css" rel="stylesheet" />
<script type="text/javascript" src="js/js/jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="js/js/jquery-ui-1.8.22.custom.min.js"></script>

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
$qid = $_GET['id'];

$m = new Mongo();
$d = $m->selectDb("demo");
$c = $d->selectCollection("questions");

$mongo_question = $c->findOne(array('qid'=>new MongoId($qid)));
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
                        var ff = new FreeForm();
                        ff.FixedSize = false;
                        ff.Origin[0] = parseFloat(QUESTION.annotations[i].origin[0]);
                        ff.Origin[1] = parseFloat(QUESTION.annotations[i].origin[1]);
                        ff.OutlineColor[0] = parseFloat(QUESTION.annotations[i].outlinecolor[0]);
                        ff.OutlineColor[1] = parseFloat(QUESTION.annotations[i].outlinecolor[1]);
                        ff.OutlineColor[2] = parseFloat(QUESTION.annotations[i].outlinecolor[2]);
                        ff.LineWidth = parseFloat(QUESTION.annotations[i].LineWidth);
                        for(var n=0; i<QUESTION.annotations[i].Points.length; n++){
                            ff.Points[n][0] = parseFloat(QUESTION.annotations[i].Points[n][0]);
                            ff.Points[n][1] = parseFloat(QUESTION.annotations[i].Points[n][1]);
                        }
                        VIEWER1.AddShape(ff);
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
    
    
    
    
    
    function NewArrow() {
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
        $("#dialog-form").dialog("open");
    }
    
    function NewTextCallBack() {
      VIEWER1.Widget = new TextWidget(VIEWER1);
      VIEWER1.Widget.Text.String = document.getElementById("textwidgetcontent").value;
	  VIEWER1.Widget.Text.UpdateBuffers();
	  eventuallyRender();
    }
    
    function NewFreeForm() {
      // When the text button is pressed, create the widget.
      VIEWER1.Widget = new FreeFormWidget(VIEWER1);
    }
    
    
    
    
    
    //********************************************************
    
    function saveConstants() {
        var questionchoices = [];
        var questiontext = document.getElementById("qtext").value;
        var questiontitle = document.getElementById("title").value;
        
        var numAnswers = $('.answer').length;
    
        for(var i=0; i < numAnswers; i++){
            questionchoices[i] = $('.answer')[i].value;
        }
        
        var qid = QUESTION.qid.$id;
        var cam = VIEWER1.MainView.Camera;
        var camValues = {'roll':cam.Roll, 'fp':cam.FocalPoint, 'height':cam.Height};
        
        var correct = findChecked();
        
        correct = correct + '';
        
        $.post("setquestion.php", {qid: qid, qtitle:questiontitle, qtext: questiontext, choices: questionchoices, cam: camValues, corr: correct});
    }
    
    function findChecked(){
        var span = document.getElementById("choicelist");
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
        
        return 0;
    }
    
    function addanswer() {
        saveConstants();
        
        var numAnswers = $('.answer').length;
        var liststring = (numAnswers+1)+': <input type="text" class="answer" /><input type="radio" name="correct" >Correct?</input><br />';
        $('#choicelist').append(liststring); 
    }
    
    function savequestion() {
        saveConstants();
        //window.location = "lessonmaker.php";
    }
    
    $(document).ready(function() {
        if (QUESTION.choices) {
            document.getElementById("qtext").innerHTML = QUESTION.qtext;
            document.getElementById("title").innerHTML = QUESTION.title;
            for (var i = 0; i < QUESTION.choices.length; ++i) {
                var liststring = (i+1)+': <input type="text" class="answer" value="'+QUESTION.choices[i]+'" /><input type="radio" name="correct" >Correct?</input><br />';
                if(QUESTION.correct == (i+'')){
                    liststring = (i+1)+': <input type="text" class="answer" value="'+QUESTION.choices[i]+'" /><input type="radio" name="correct" checked="checked" >Correct?</input><br />';
                }
                $('#choicelist').append(liststring);    
            }
        }
        else {
            var liststring = '1: <input type="text" class="answer" /><input type="radio" name="correct" checked="checked" >Correct?</input><br />';
            $('#choicelist').append(liststring);
        }
        
        $("#dialog-form").dialog({
            autoOpen:false,
            height:200,
            width:350,
            modal:true,
            buttons:{
                OK: function() {
                    NewTextCallBack();
                    $(this).dialog("close");
                }
            },
            
            close: function() {
				$("#textwidgetcontent").val( "" ).removeClass( "ui-state-error" );
			}
            
        });
        
    });
 
</script> 
 
 
</head> 
 
 
<body onload="webGLStart();">
    <div class="container" >
    <div class="viewer" >
        <canvas id="viewer-canvas" style="border: none;" width="1000" height="700"></canvas> 
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
    </div>
    <div class="form" >
        Title:<br />
        <textarea id="title" ></textarea><br />
        Question:<br />
        <textarea id="qtext" ></textarea><br /><br />
        <button id="addanswer" onclick="addanswer();" >Add Answer Choice</button><br />
        <button id="savequestion" onclick="savequestion();" >Save Question</button><br />
        Answers:<br />
        <div id="choicelist" >
        </div>
    </div>
    </div>
    
    <div id="dialog-form" title="Create new user" >
        <form>
            <fieldset>
                <textarea id="textwidgetcontent" rows="2" cols="20" ></textarea>
            </fieldset>
        </form>
    </div>
    
</body> 
 
</html> 
