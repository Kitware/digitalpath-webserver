//==============================================================================
// View Object
// Viewport (x_lowerleft, y_lowerleft, width, height)
// A view has its own camera and list of tiles to display.
// Views can share a cache for tiles.

// Cache is the source for the image tiles.
function View (viewport, cache) {
    this.Cache = cache;
    this.Viewport = viewport;
    this.Camera = new Camera(viewport[2], viewport[3]);
    this.Tiles = [];
    this.OutlineMatrix = mat4.create();
    this.OutlineCamMatrix = mat4.create();
}

// Note: Tile in the list may not be loaded yet.
View.prototype.DrawTiles = function () {
    // Select the tiles to render first.
    this.Tiles = this.Cache.ChooseTiles(this, SLICE, this.Tiles);

    var program = imageProgram;
    gl.useProgram(program);
    
    // These are the same for every tile.
    // Vertex points (shifted by tiles matrix)
    gl.bindBuffer(gl.ARRAY_BUFFER, tileVertexPositionBuffer);
    // Needed for outline ??? For some reason, DrawOutline did not work
    // without this call first.
    gl.vertexAttribPointer(program.vertexPositionAttribute, 
                           tileVertexPositionBuffer.itemSize, 
                           gl.FLOAT, false, 0, 0);     // Texture coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, tileVertexTextureCoordBuffer);
    gl.vertexAttribPointer(program.textureCoordAttribute, 
                           tileVertexTextureCoordBuffer.itemSize, 
                           gl.FLOAT, false, 0, 0);
    // Cell Connectivity
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tileCellBuffer);
    
    // Draw tiles.
    gl.viewport(this.Viewport[0], this.Viewport[1], 
                this.Viewport[2], this.Viewport[3]);
    gl.uniformMatrix4fv(program.pMatrixUniform, false, this.Camera.Matrix);
    for (var i = 0; i < this.Tiles.length; ++i) {
        this.Tiles[i].Draw(program); // Debugging outline
    }
}


View.prototype.DrawOutline = function(backgroundFlag) {
    program = polyProgram;
    gl.useProgram(program);
    gl.viewport(this.Viewport[0], this.Viewport[1], this.Viewport[2], this.Viewport[3]);

    // Draw a line around the viewport, so move (0,0),(1,1) to (-1,-1),(1,1)
    mat4.identity(this.OutlineCamMatrix);
    this.OutlineCamMatrix[0] = 2.0; // width x
    this.OutlineCamMatrix[5] = 2.0; // width y
    this.OutlineCamMatrix[10] = 0;
    this.OutlineCamMatrix[12] = -1.0;
    this.OutlineCamMatrix[13] = -1.0;
    var viewFrontZ = this.Camera.ZRange[0]+0.001; 
    var viewBackZ = this.Camera.ZRange[1]-0.001; 
    this.OutlineCamMatrix[14] = viewFrontZ; // front plane

    mat4.identity(this.OutlineMatrix);
    
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, this.OutlineMatrix);

    if (backgroundFlag) {
	// White background fill
	this.OutlineCamMatrix[14] = viewBackZ; // back plane
	gl.uniformMatrix4fv(program.pMatrixUniform, false, this.OutlineCamMatrix);
	gl.uniform3f(program.colorUniform, 1.0, 1.0, 1.0);
	gl.bindBuffer(gl.ARRAY_BUFFER, squarePositionBuffer);
	gl.vertexAttribPointer(program.vertexPositionAttribute, 
			       squarePositionBuffer.itemSize, 
			       gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, squarePositionBuffer.numItems);
    }

    // outline
    this.OutlineCamMatrix[14] = viewFrontZ; // force in front
    gl.uniformMatrix4fv(program.pMatrixUniform, false, this.OutlineCamMatrix);
    gl.uniform3f(program.colorUniform, 1.0, 0.0, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareOutlinePositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, 
			   squareOutlinePositionBuffer.itemSize, 
			   gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, squareOutlinePositionBuffer.numItems);
}










