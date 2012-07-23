
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
    // NOTE: numEdges logic will not work in world coordinates.
    // Limit numEdges to 180 to mitigate this issue.
    if (numEdges > 90 || ! this.FixedSize ) {
	numEdges = 90;
    }

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

    this.VertexPositionBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.VertexPositionBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertexPositionData), GL.STATIC_DRAW);
    this.VertexPositionBuffer.itemSize = 3;
    this.VertexPositionBuffer.numItems = vertexPositionData.length / 3;
    
    this.CellBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.CellBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(cellData), GL.STATIC_DRAW);
    this.CellBuffer.itemSize = 1;
    this.CellBuffer.numItems = cellData.length;
}
