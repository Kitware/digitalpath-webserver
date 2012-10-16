// TODO:
// make a shape superclass.


function Shape() {
    this.Orientation = 0.0; // in degrees, counter clockwise, 0 is left
    this.Origin = [10000,10000]; // Anchor in world coordinates.
    this.FixedSize = true;
    this.LineWidth = 0; // Line width has to be in same coordiantes as points.
    this.Highlight = false;
    this.HighlightColor = [1.0, 1.0, 0.0];
};

Shape.prototype.destructor=function() {
    // Get rid of the buffers?
}

Shape.prototype.Draw = function (view) {
    var program = polyProgram;

    if (this.Matrix == undefined) {
	this.UpdateBuffers();
    }

    GL.useProgram(program);
    GL.disable(GL.BLEND);
    GL.enable(GL.DEPTH_TEST);

    // This does not work.
    // I will need to make thick lines with polygons.
    //GL.lineWidth(5);

    // These are the same for every tile.
    // Vertex points (shifted by tiles matrix)
    GL.bindBuffer(GL.ARRAY_BUFFER, this.VertexPositionBuffer);
    // Needed for outline ??? For some reason, DrawOutline did not work
    // without this call first.
    GL.vertexAttribPointer(program.vertexPositionAttribute, 
                           this.VertexPositionBuffer.itemSize, 
                           GL.FLOAT, false, 0, 0);     // Texture coordinates
    // Local view.
    GL.viewport(view.Viewport[0], view.Viewport[1], 
                view.Viewport[2], view.Viewport[3]);

    var viewFrontZ = view.Camera.ZRange[0]+0.01;

    // Lets use the camera to change coordinate system to pixels.
    // TODO: Put this camera in the view or viewer to avoid creating one each render.
    var camMatrix = mat4.create();
    mat4.identity(camMatrix);
    if (this.FixedSize) {
	// This camera matric changes pixel/ screen coordinate sytem to
	// view [-1,1],[-1,1],z
	camMatrix[0] = 2.0 / view.Viewport[2];
	camMatrix[12] = -1.0;
	camMatrix[5] = 2.0 / view.Viewport[3];
	camMatrix[13] = -1.0;
	camMatrix[14] = viewFrontZ; // In front of tiles in this view
	GL.uniformMatrix4fv(program.pMatrixUniform, false, camMatrix);
    } else {
	// Use main views camera to convert world to view.
        GL.uniformMatrix4fv(program.pMatrixUniform, false, view.Camera.Matrix);
    }

    // The actor matrix that rotates to orientation and shift (0,0) to origin.
    // Rotate based on ivar orientation.
    var theta = this.Orientation * 3.1415926536 / 180.0;
    this.Matrix[0] =  Math.cos(theta);
    this.Matrix[1] =  Math.sin(theta);
    this.Matrix[4] = -Math.sin(theta);
    this.Matrix[5] =  Math.cos(theta);
    // Place the origin of the shape.
    x = this.Origin[0];
    y = this.Origin[1];
    if (this.FixedSize) {
	// For fixed size, translation mus be in view/pixel coordinates.
	// First transform the world to view.
	var m = view.Camera.Matrix;
	var x = (this.Origin[0]*m[0] + this.Origin[1]*m[4] + m[12])/m[15];
	var y = (this.Origin[0]*m[1] + this.Origin[1]*m[5] + m[13])/m[15];
	// convert view to pixels (view coordinate ssytem).
	x = view.Viewport[2]*(0.5*(x+1.0));
	y = view.Viewport[3]*(0.5*(y+1.0));
    }
    // Translate to place the origin.
    this.Matrix[12] = x;
    this.Matrix[13] = y;
    GL.uniformMatrix4fv(program.mvMatrixUniform, false, this.Matrix);


    // Fill color
    if (this.FillColor != undefined) {

	if (this.Highlight) {
	    GL.uniform3f(program.colorUniform, this.HighlightColor[0], 
			 this.HighlightColor[1], this.HighlightColor[2]);
	} else {
	    GL.uniform3f(program.colorUniform, this.FillColor[0], 
			 this.FillColor[1], this.FillColor[2]);
	}
	// Cell Connectivity
	GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.CellBuffer);
    
	GL.drawElements(GL.TRIANGLES, this.CellBuffer.numItems, 
			GL.UNSIGNED_SHORT,0);
    }
    // Outline.
    if (this.OutlineColor != undefined) {
	if (this.Highlight) {
	    GL.uniform3f(program.colorUniform, this.HighlightColor[0], 
			 this.HighlightColor[1], this.HighlightColor[2]);
	} else {
	    GL.uniform3f(program.colorUniform, this.OutlineColor[0], 
		     this.OutlineColor[1], this.OutlineColor[2]);
	}
	if (this.LineWidth == 0) {
	    GL.drawArrays(GL.LINE_STRIP, 0, this.VertexPositionBuffer.numItems);
	} else {
	    // Cell Connectivity
	    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.LineCellBuffer);
	    GL.drawElements(GL.TRIANGLES, this.LineCellBuffer.numItems, 
			    GL.UNSIGNED_SHORT,0);
	}
    }
}

Shape.prototype.SetOutlineColor = function (c) {
    this.OutlineColor = this.ConvertColor(c);
}

Shape.prototype.SetFillColor = function (c) {
    this.FillColor = this.ConvertColor(c);
}

// Make sure the color is an array of values 0->1
Shape.prototype.ConvertColor = function (color) {
    // Deal with color in hex format i.e. #0000ff
    if ( typeof(color)=='string' && color.length == 7 && color[0] == '#') {
	var floatColor = [];
	var idx = 1;
	for (var i = 0; i < 3; ++i) {
	    var val = ((16.0 * this.HexDigitToInt(color[idx++])) + this.HexDigitToInt(color[idx++])) / 255.0; 
	    floatColor.push(val);
	}
	return floatColor;
    }
    // No other formats for now.
    return color;
}

// 0-f hex digit to int
Shape.prototype.HexDigitToInt = function (hex) {
    if (hex == '1') {
	return 1.0;
    } else if (hex == '2') {
	return 2.0;
    } else if (hex == '3') {
	return 3.0;
    } else if (hex == '4') {
	return 4.0;
    } else if (hex == '5') {
	return 5.0;
    } else if (hex == '6') {
	return 6.0;
    } else if (hex == '7') {
	return 7.0;
    } else if (hex == '8') {
	return 8.0;
    } else if (hex == '9') {
	return 9.0;
    } else if (hex == 'a' || hex == 'A') {
	return 10.0;
    } else if (hex == 'b' || hex == 'B') {
	return 11.0;
    } else if (hex == 'c' || hex == 'C') {
	return 12.0;
    } else if (hex == 'd' || hex == 'D') {
	return 13.0;
    } else if (hex == 'e' || hex == 'E') {
	return 14.0;
    } else if (hex == 'f' || hex == 'F') {
	return 15.0;
    }
    return 0.0;
}

Shape.prototype.HandleMouseMove = function(event, dx,dy) {
    // superclass does nothing
    return false;
}

//Shape.prototype.UpdateBuffers = function() {
    //    // The superclass does not implement this method.
//}
