//==============================================================================
// This widget will first be setup to define an arrow.
// Editing will be later.
// Viewer will forward events to the arrow.
// Return value of the mouse release method will indicate
// when the handler inactivates.

// I was thinking of naming this ArrowHandler instead of ArrowWidget.


function ArrowWidget (viewer) {
    this.Viewer = viewer;
}

ArrowWidget.prototype.Serialize = function() {
    if(this.Arrow === undefined){ return null; }
    var obj = new Object();
    obj.type = "arrow";
    obj.origin = this.Arrow.Origin;
	obj.fillcolor = this.Arrow.FillColor;
	obj.outlinecolor = this.Arrow.OutlineColor;
	obj.length = this.Arrow.Length;
	obj.width = this.Arrow.Width;
    obj.orientation = this.Arrow.Orientation;
    return obj;
}

ArrowWidget.prototype.HandleKeyPress = function(keyCode, shift) {
}

ArrowWidget.prototype.HandleMouseDown = function(x, y) {
    this.TipPosition = [x,y];    
}

// returns false when it is finished doing its work.
ArrowWidget.prototype.HandleMouseUp = function(event) {
    return false;
}

ArrowWidget.prototype.HandleMouseMove = function(event) {
    if (this.Arrow === undefined) {
	// Wait to create this until the first move event.
	this.Arrow = new Arrow();
	this.Arrow.Origin = [0,0];
	this.Arrow.SetFillColor([0.0, 0.0, 0.0]);
	this.Arrow.OutlineColor = [1.0, 1.0, 1.0];
	this.Arrow.Length = 50;
	this.Arrow.Width = 8;
	this.Viewer.AddShape(this.Arrow);
	// Note: If the user clicks before the mouse is in the
	// canvas, this will behave odd.
	this.TipPosition = [0,0];
    }

    var x = event.MouseX;
    var y = event.MouseY;

    if (event.MouseDown) {
	var dx = x-this.TipPosition[0];
	var dy = y-this.TipPosition[1];
	this.Arrow.Length = Math.sqrt(dx*dx + dy*dy);
	this.Arrow.Orientation = Math.atan2(dy, dx) * 180.0 / Math.PI;
	this.Arrow.UpdateBuffers();
    } else {
	// Convert to viewer coordinate system.
	// It would be nice to have this before this method.
	var viewport = this.Viewer.GetViewport();
	x = x - viewport[0];
	y = y - viewport[1];
	// Now we need to convert to world coordinate system
	
	// Compute focal point from inverse overview camera.
	x = x/viewport[2];
	y = y/viewport[3];
	var cam = this.Viewer.MainView.Camera;
	x = (x*2.0 - 1.0)*cam.Matrix[15];
	y = (y*2.0 - 1.0)*cam.Matrix[15];
	var m = cam.Matrix;
	var det = m[0]*m[5] - m[1]*m[4];
	var xNew = (x*m[5]-y*m[4]+m[4]*m[13]-m[5]*m[12]) / det;
	var yNew = (y*m[0]-x*m[1]-m[0]*m[13]+m[1]*m[12]) / det;
	
	this.Arrow.Origin = [xNew, yNew];
    }
    eventuallyRender();
}









