//==============================================================================
// View Object
// Viewport (x_lowerleft, y_lowerleft, width, height)
// A view has its own camera and list of tiles to display.
// Views can share a cache for tiles.

// Cache is the source for the image tiles.
function View (viewport) {
  this.Section = new Section;
  this.Viewport = viewport;
  this.Camera = new Camera(viewport[2], viewport[3]);
  this.OutlineMatrix = mat4.create();
  this.OutlineCamMatrix = mat4.create();
}

View.prototype.AddCache = function(cache) {
  this.Section.Caches.push(cache);
}

View.prototype.SetViewport = function(viewport) {
  this.Viewport = viewport;
  this.Camera.ViewportWidth = viewport[2];
  this.Camera.ViewportHeight = viewport[3];
}

// Note: Tile in the list may not be loaded yet.
View.prototype.DrawTiles = function () {
  GL.viewport(this.Viewport[0], this.Viewport[1], 
              this.Viewport[2], this.Viewport[3]);
  this.Section.Draw(this); // Too bad we need to pass the view (camera & viewport).
}


View.prototype.DrawOutline = function(backgroundFlag) {
    program = polyProgram;
    GL.useProgram(program);
    GL.viewport(this.Viewport[0], this.Viewport[1], this.Viewport[2], this.Viewport[3]);

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
    
    GL.uniformMatrix4fv(program.mvMatrixUniform, false, this.OutlineMatrix);

    if (backgroundFlag) {
	// White background fill
	this.OutlineCamMatrix[14] = viewBackZ; // back plane
	GL.uniformMatrix4fv(program.pMatrixUniform, false, this.OutlineCamMatrix);
	GL.uniform3f(program.colorUniform, 1.0, 1.0, 1.0);
	GL.bindBuffer(GL.ARRAY_BUFFER, squarePositionBuffer);
	GL.vertexAttribPointer(program.vertexPositionAttribute, 
			       squarePositionBuffer.itemSize, 
			       GL.FLOAT, false, 0, 0);
	GL.drawArrays(GL.TRIANGLE_STRIP, 0, squarePositionBuffer.numItems);
    }

    // outline
    this.OutlineCamMatrix[14] = viewFrontZ; // force in front
    GL.uniformMatrix4fv(program.pMatrixUniform, false, this.OutlineCamMatrix);
    GL.uniform3f(program.colorUniform, 1.0, 0.0, 0.0);
    GL.bindBuffer(GL.ARRAY_BUFFER, squareOutlinePositionBuffer);
    GL.vertexAttribPointer(program.vertexPositionAttribute, 
			   squareOutlinePositionBuffer.itemSize, 
			   GL.FLOAT, false, 0, 0);
    GL.drawArrays(GL.LINE_STRIP, 0, squareOutlinePositionBuffer.numItems);
}










