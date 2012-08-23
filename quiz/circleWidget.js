//==============================================================================
// Mouse down defined the center.
// Drag defines the radius.


function CircleWidget (viewer) {
    this.Viewer = viewer;
}

CircleWidget.prototype.Serialize = function() {
    if(this.Circle === undefined){ return null; }
    var obj = new Object();
    obj.type = "circle";
    obj.origin = this.Circle.Origin;
    obj.outlinecolor = this.Circle.OutlineColor;
    obj.radius = this.Circle.Radius;
    obj.linewidth = this.Circle.LineWidth;
    return obj;
}

CircleWidget.prototype.HandleKeyPress = function(keyCode, shift) {
}

CircleWidget.prototype.HandleMouseDown = function(x, y) {
    this.Origin = [x,y];    
}

// returns false when it is finished doing its work.
CircleWidget.prototype.HandleMouseUp = function(event) {
    return false;
}

CircleWidget.prototype.HandleMouseMove = function(event) {
    var viewport = this.Viewer.GetViewport();
    var cam = this.Viewer.MainView.Camera;
    if (this.Circle === undefined) {
	// Wait to create this until the first move event.
	this.Circle = new Circle();
	this.Circle.FixedSize = false;
	// Note: If the user clicks before the mouse is in the
	// canvas, this will behave oddly.
	this.Circle.Origin = [0,0];
	this.Circle.OutlineColor = [0.0, 0.0, 0.0];
	this.Circle.Radius = 200;
	this.Circle.LineWidth =  5.0*cam.Height/viewport[3];
	this.Viewer.AddShape(this.Circle);
	this.Origin = [0,0];
    }

    var x = event.MouseX;
    var y = event.MouseY;

    if (event.MouseDown) {
	var dx = x-this.Origin[0];
	var dy = y-this.Origin[1];
	// Change units from pixels to world.
	this.Circle.Radius = Math.sqrt(dx*dx + dy*dy) * cam.Height / viewport[3];
	this.Circle.UpdateBuffers();
    } else {
	// Convert from canvas/pixels to  coordinate system.
	// It would be nice to have this before this method.
	x = x - viewport[0];
	y = y - viewport[1];
	// Now we need to convert to world coordinate system
	
	// Compute focal point from inverse overview camera.
	x = x/viewport[2];
	y = y/viewport[3];
	x = (x*2.0 - 1.0)*cam.Matrix[15];
	y = (y*2.0 - 1.0)*cam.Matrix[15];
	var m = cam.Matrix;
	var det = m[0]*m[5] - m[1]*m[4];
	var xNew = (x*m[5]-y*m[4]+m[4]*m[13]-m[5]*m[12]) / det;
	var yNew = (y*m[0]-x*m[1]-m[0]*m[13]+m[1]*m[12]) / det;
	
	this.Circle.Origin = [xNew, yNew];
    }
    eventuallyRender();
}





