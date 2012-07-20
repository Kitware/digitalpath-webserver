// TODO:
// make a shape superclass.


function Shape() {
    this.Orientation = 0.0; // in degrees, counter clockwise, 0 is left
    this.Origin = [10000,10000]; // Anchor in world coordinates.
};

Shape.prototype.destructor=function() {
    // Get rid of the buffers?
}

Shape.prototype.Draw = function (view) {
    var program = polyProgram;

    if (this.Matrix == undefined) {
	this.UpdateBuffers();
    }

    gl.useProgram(program);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);

    // These are the same for every tile.
    // Vertex points (shifted by tiles matrix)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
    // Needed for outline ??? For some reason, DrawOutline did not work
    // without this call first.
    gl.vertexAttribPointer(program.vertexPositionAttribute, 
                           this.VertexPositionBuffer.itemSize, 
                           gl.FLOAT, false, 0, 0);     // Texture coordinates
    // Cell Connectivity
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.CellBuffer);
    
    // Local view.
    gl.viewport(view.Viewport[0], view.Viewport[1], 
                view.Viewport[2], view.Viewport[3]);

    var viewFrontZ = view.Camera.ZRange[0]+0.01;

    // Lets use the camera to change coordinate system to pixels.
    // TODO: Put this camera in the view or viewer to avoid creating one each render.
    var camMatrix = mat4.create();
    mat4.identity(camMatrix);
    camMatrix[0] = 2.0 / view.Viewport[2];
    camMatrix[12] = -1.0;
    camMatrix[5] = 2.0 / view.Viewport[3];
    camMatrix[13] = -1.0;
    camMatrix[14] = viewFrontZ; // In front of tiles in this view
    gl.uniformMatrix4fv(program.pMatrixUniform, false, camMatrix);

    // Place the origin of the shape.
    // First transform the world to view.
    var m = view.Camera.Matrix;
    var x = (this.Origin[0]*m[0] + this.Origin[1]*m[4] + m[12])/m[15];
    var y = (this.Origin[0]*m[1] + this.Origin[1]*m[5] + m[13])/m[15];
    // convert view to pixels (view coordinate ssytem).
    x = view.Viewport[2]*(0.5*(x+1.0));
    y = view.Viewport[3]*(0.5*(y+1.0));
    // Rotate based on ivar orientation.
    var theta = this.Orientation * 3.1415926536 / 180.0;
    this.Matrix[0] =  Math.cos(theta);
    this.Matrix[1] =  Math.sin(theta);
    this.Matrix[4] = -Math.sin(theta);
    this.Matrix[5] =  Math.cos(theta);
    // Translate to place the origin.
    this.Matrix[12] = x;
    this.Matrix[13] = y;
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, this.Matrix);

    // Fill color
    if (this.FillColor != undefined) {
	gl.uniform3f(program.colorUniform, this.FillColor[0], 
		     this.FillColor[1], this.FillColor[2]);
	gl.drawElements(gl.TRIANGLES, this.CellBuffer.numItems, 
			gl.UNSIGNED_SHORT,0);
    }
    // Outline.
    if (this.OutlineColor != undefined) {
	gl.uniform3f(program.colorUniform, this.OutlineColor[0], 
		     this.OutlineColor[1], this.OutlineColor[2]);
	gl.drawArrays(gl.LINE_STRIP, 0, this.VertexPositionBuffer.numItems);
    }
}



//Shape.prototype.UpdateBuffers = function() {
//    // The superclass does not implement this method.
//}
