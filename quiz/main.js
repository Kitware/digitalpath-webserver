// Windows expand to fill browser.
// Zoom:
//     double click
//     widget
// Annotation
//     see text.js todo
// Fix interploation problem with tiles.  There is an artifact due to wrap
//     around to the other side of the image.
// Fix interactor translate.  Mouse moves farther than the image.



var SLICE = 1;

// globals (for now)
var imageProgram;
var textProgram;
var polyProgram;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var squareOutlinePositionBuffer;
var squarePositionBuffer;
var tileVertexPositionBuffer;
var tileVertexTextureCoordBuffer;
var tileCellBuffer;
 

var VIEWER1;

function initViews() {
    //VIEWER = new Viewer(CANVAS,
    //                    [0,0,gl.viewportWidth, gl.viewportHeight],
    //                    source);

	//http://localhost:81/tile.php?image=4ecb20134834a302ac000001&name=tqsts.jpg
    var source1 = new Cache("http://localhost:81/tile.php?image=4ecb20134834a302ac000001&name=");
    VIEWER1 = new Viewer(CANVAS, [0,0, 1400,1000], source1);

    EVENT_MANAGER.AddViewer(VIEWER1);

	//VIEWER1.AddAnnotation([10000, 10000], "Annotation1", [1.0,0.2,0.2]);
	//VIEWER1.AddAnnotation([12000, 11000], "Annotation2", [0,1,0.2]);
    
}



// WebGL Initialization
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }
    
    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }
    
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }
    
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    
    return shader;
}


 
function initShaderPrograms() {
    polyProgram = createProgram("shader-poly-fs", "shader-poly-vs");
    polyProgram.colorUniform = gl.getUniformLocation(polyProgram, "uColor");

    imageProgram = createProgram("shader-tile-fs", "shader-tile-vs");
    // Texture coordinate attribute and texture image uniform
    imageProgram.textureCoordAttribute 
        = gl.getAttribLocation(imageProgram,"aTextureCoord");
    gl.enableVertexAttribArray(imageProgram.textureCoordAttribute); 
    imageProgram.samplerUniform = gl.getUniformLocation(imageProgram, "uSampler");    



    textProgram = createProgram("shader-text-fs", "shader-text-vs");
    textProgram.textureCoordAttribute 
    	= gl.getAttribLocation(textProgram, "aTextureCoord");
    gl.enableVertexAttribArray(textProgram.textureCoordAttribute);    
    textProgram.samplerUniform 
    	= gl.getUniformLocation(textProgram, "uSampler");
    textProgram.colorUniform = gl.getUniformLocation(textProgram, "uColor");
}


function createProgram(fragmentShaderID, vertexShaderID) {
    var fragmentShader = getShader(gl, fragmentShaderID);
    var vertexShader = getShader(gl, vertexShaderID);
    
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    
    program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);
    
    // Camera matrix
    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
    // Model matrix
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
    
    return program;
}
 
function initOutlineBuffers() {
    // Outline Square
    vertices = [
        0.0,  0.0,  0.0,
        0.0,  1.0,  0.0,
        1.0, 1.0,  0.0,
        1.0, 0.0,  0.0,
        0.0, 0.0,  0.0];
    squareOutlinePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareOutlinePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareOutlinePositionBuffer.itemSize = 3;
    squareOutlinePositionBuffer.numItems = 5;

    // Filled square
    squarePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squarePositionBuffer);
    vertices = [
        1.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        1.0,  0.0,  0.0,
        0.0,  0.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squarePositionBuffer.itemSize = 3;
    squarePositionBuffer.numItems = 4;
}




//==============================================================================



function initImageTileBuffers() {
    var vertexPositionData = [];
    var textureCoordData = [];
    
    // Make 4 points
    textureCoordData.push(0.0);
    textureCoordData.push(0.0);
    vertexPositionData.push(0.0);
    vertexPositionData.push(0.0);
    vertexPositionData.push(0.0);
    
    textureCoordData.push(1.0);
    textureCoordData.push(0.0);
    vertexPositionData.push(1.0);
    vertexPositionData.push(0.0);
    vertexPositionData.push(0.0);
    
    textureCoordData.push(0.0);
    textureCoordData.push(1.0);
    vertexPositionData.push(0.0);
    vertexPositionData.push(1.0);
    vertexPositionData.push(0.0);
    
    textureCoordData.push(1.0);
    textureCoordData.push(1.0);
    vertexPositionData.push(1.0);
    vertexPositionData.push(1.0);
    vertexPositionData.push(0.0);
    
    // Now create the cell.
    var cellData = [];
    cellData.push(0);
    cellData.push(1);
    cellData.push(2);
    
    cellData.push(2);
    cellData.push(1);
    cellData.push(3);
    
    tileVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tileVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    tileVertexTextureCoordBuffer.itemSize = 2;
    tileVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;
    
    tileVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tileVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    tileVertexPositionBuffer.itemSize = 3;
    tileVertexPositionBuffer.numItems = vertexPositionData.length / 3;
    
    tileCellBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tileCellBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cellData), gl.STATIC_DRAW);
    tileCellBuffer.itemSize = 1;
    tileCellBuffer.numItems = cellData.length;
}




// Stuff for drawing
var RENDER_PENDING = false;
function eventuallyRender() {
    if (! RENDER_PENDING) {
	RENDER_PENDING = true;
	requestAnimFrame(tick);
    }
}

function tick() {
    RENDER_PENDING = false;
    VIEWER1.Animate();
    draw();
}
 
function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    VIEWER1.Draw();
	
}


