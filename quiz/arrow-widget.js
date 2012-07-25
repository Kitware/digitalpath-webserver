//==============================================================================
// This widget will first be setup to define an arrow.
// Editing will be later.
// Viewer will forward events to the arrow.
// Return value of the mouse release method will indicate
// when the handler inactivates.

// I was thinking of naming this ArrowHandler instead of ArrowWidget.


function ArrowWidget (viewer) {
    this.Viewer = viewer;

    // Maybe wait to create this until the first move event.
    this.Arrow = new Arrow();
    // TODO: Set this to camera focal point maybe
    this.Arrow.Origin = [0,0];
    this.Arrow.SetFillColor([0.0, 0.0, 0.0]);
    this.Arrow.OutlineColor = [1.0, 1.0, 1.0];
    this.Arrow.Length = 50;
    this.Arrow.width = 8;
    this.Viewer.AddShape(this.Arrow);
}

//ArrowWidget.prototype.DegToRad = function(degrees) {
//    return degrees * Math.PI / 180;
//}

ArrowWidget.prototype.HandleMouseDown = function(x, y) {

}

// returns false when it is finished doing its work.
ArrowWidget.prototype.HandleMouseUp = function(event) {
    return false;
}

ArrowWidget.prototype.HandleMouseMove = function(event) {
    var x = event.MouseX;
    var y = event.MouseY;

    // Convert to viewer coordinate system.
    // It would be nice to have this before this method.
    x = x - this.Viewer.Viewport[0];
    y = y - this.Viewer.Viewport[1];
    // Now we need to convert to world coordinate system

    // Compute focal point from inverse overview camera.
    x = x/this.Viewer.Viewport[2];
    y = y/this.Viewer.Viewport[3];
    var cam = this.Viewer.MainView.Camera;
    x = (x*2.0 - 1.0)*cam.Matrix[15];
    y = (y*2.0 - 1.0)*cam.Matrix[15];
    var m = cam.Matrix;
    var det = m[0]*m[5] - m[1]*m[4];
    var xNew = (x*m[5]-y*m[4]+m[4]*m[13]-m[5]*m[12]) / det;
    var yNew = (y*m[0]-x*m[1]-m[0]*m[13]+m[1]*m[12]) / det;

    this.Arrow.Origin = [xNew, yNew];
    eventuallyRender();
}









