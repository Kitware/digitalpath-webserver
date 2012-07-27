//==============================================================================
// Mouse click places a point.
// When a point duplicates an end point, the widget is done.


function FreeFormWidget (viewer) {
    this.Viewer = viewer;
    this.Drawing = true;
    // Was the last segment drawn part of a curve (drag with mouse down).
    this.Curve = false;
}

FreeFormWidget.prototype.CityBlockDistance = function(p0, p1) {
    return Math.abs(p1[0]-p0[0]) + Math.abs(p1[1]-p0[1]);
}

// This method is also in TextWidget.  
// TODO: Find a better place for the method.
FreeFormWidget.prototype.PixelPointToWorld = function(x, y) {
    var viewport = this.Viewer.GetViewport();
    var cam = this.Viewer.MainView.Camera;

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
    
    return [xNew, yNew];
}   

FreeFormWidget.prototype.HandleKeyPress = function(keyCode, shift) {
}

FreeFormWidget.prototype.HandleMouseDown = function(x, y) {
    this.Curve = false;
    // Update the first points used to determine when to stop.
    // Lst point has to be set in the mouse up because that where
    // the stop condition is checked.
    if (this.FreeForm.Points.length == 1) {
	this.FirstPixelPosition[0] = x;
	this.FirstPixelPosition[1] = y;
    } 

    // Add a point by duplicating the last point in the list.
    // The last point always tracks the mouse (HandleMouseMove).
    var lastIdx = this.FreeForm.Points.length - 1;
    this.FreeForm.Points.push(this.FreeForm.Points[lastIdx]);
}

// Returns false when it is finished doing its work.
FreeFormWidget.prototype.HandleMouseUp = function(event) {
    var x = event.MouseX;
    var y = event.MouseY;


    if (this.FreeForm.Points.length > 2) {
	var gap = this.CityBlockDistance(this.FirstPixelPosition, [x,y]);
        if (gap <= 4) {
	    // Close the loop and end the widget.
	    var lastIdx = this.FreeForm.Points.length - 1;
	    this.FreeForm.Points[lastIdx] = this.FreeForm.Points[0];
	    this.FreeForm.UpdateBuffers();
	    eventuallyRender();
	    return false;
        }
        if (! this.Curve &&
    	    this.CityBlockDistance(this.LastPixelPosition, [x,y]) < 2) {
	    return false;
	}
	
    }

    this.LastPixelPosition = [x,y];
    this.Curve = false;
    return true;
}


FreeFormWidget.prototype.HandleMouseMove = function(event) {
    var x = event.MouseX;
    var y = event.MouseY;
    var viewport = this.Viewer.GetViewport();
    var cam = this.Viewer.MainView.Camera;

    if (this.FreeForm === undefined) {
	// Wait to create this until the first move event.
	this.FreeForm = new FreeForm();
        this.FreeForm.FixedSize = false;
	this.FreeForm.Origin = [0,0]; // Keep the origin 0,0,0
	this.FreeForm.OutlineColor = [0.0, 0.0, 0.0];
	this.FreeForm.LineWidth =  5.0*cam.Height/viewport[3];
	this.Viewer.AddShape(this.FreeForm);
	// Note: If the user clicks before the mouse is in the
	// canvas, this will behave odd.
	// Keep pixel location for first and last to know when to quit.
	this.FirstPixelPosition = [x,y];
	this.LastPixelPosition = [x,y];
	this.FreeForm.Points.push(this.PixelPointToWorld(x, y));
    }
    
    // Convert to viewer coordinate system.
    // Replace the last point.
    var wPt = this.PixelPointToWorld(x, y);
    var position = this.FreeForm.Points.length-1;
    this.FreeForm.Points[position] = wPt;
    this.FreeForm.UpdateBuffers();

    // If mouse down, draw a curve instead of a line.
    if (event.MouseDown && 
        this.CityBlockDistance(this.LastPixelPosition, [x,y]) > 4) {
	// We need to record this to avoid acidentally ending the widget
	// on the next mouse up.
	this.Curve = true;
	this.LastPixelPosition = [x,y];
	// Add a point by duplicating the last point in the list.
	// The last point always tracks the mouse (HandleMouseMove).
	var lastIdx = this.FreeForm.Points.length - 1;
	this.FreeForm.Points.push(this.FreeForm.Points[lastIdx]);
    }

    eventuallyRender();
}









