
function Circle() {
    Shape.call(this);
    this.Radius = 10; // Radius in pixels
    this.Origin = [10000,10000]; // Center in world coordinates.
};
Circle.prototype = new Shape;


Circle.prototype.destructor=function() {
    // Get rid of the buffers?
}

Circle.prototype.UpdateBuffers = function() {
    var vertexPositionData = [];
    var cellData = [];
    var numEdges = Math.floor(this.Radius/2)+10;

    this.Matrix = mat4.create();
    mat4.identity(this.Matrix);
    
    for (var i = 0; i <= numEdges; ++i) {
	var theta = i*2*3.14159265359/numEdges;
	vertexPositionData.push(this.Radius*Math.cos(theta));
	vertexPositionData.push(this.Radius*Math.sin(theta));
	vertexPositionData.push(0.0);
    }
    
    // Now create the triangles    
    // It would be nice to have a center point, 
    // but this would mess up the outline.
    for (var i = 2; i < numEdges; ++i) {
	cellData.push(0);
	cellData.push(i-1);
	cellData.push(i);
    }

    this.VertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    this.VertexPositionBuffer.itemSize = 3;
    this.VertexPositionBuffer.numItems = vertexPositionData.length / 3;
    
    this.CellBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.CellBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cellData), gl.STATIC_DRAW);
    this.CellBuffer.itemSize = 1;
    this.CellBuffer.numItems = cellData.length;
}
