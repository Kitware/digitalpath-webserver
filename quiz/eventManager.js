// Singleton instance delegates events to viewers based on their viewport.
// I assume that multiple threads will not access the manager.

function EventManager (canvas) {
    this.Canvas = canvas;
    this.Viewers = [];
    this.CurrentViewer = null;
    this.ShiftKeyPressed = false;
    this.Key = '';
    this.MouseX;
    this.MouseY;
    this.LastMouseX = null;
    this.LastMouseY = null;
    this.MouseDown = false;
}

EventManager.prototype.AddViewer = function(viewer) {
    this.Viewers.push(viewer);
}

EventManager.prototype.ChooseViewer = function() {
    this.CurrentViewer = null;
    for (var i = 0; i < this.Viewers.length; ++i) {
	var vport = this.Viewers[i].GetViewport();
	if (this.MouseX > vport[0] && this.MouseX < vport[0]+vport[2] &&
	    this.MouseY > vport[1] && this.MouseY < vport[1]+vport[3]) {
	    this.CurrentViewer = this.Viewers[i];
	    return;
	}
    }
}

EventManager.prototype.HandleMouseDown = function(event) {
    // Translate to coordinate of canvas
    // Change origin to lower left.
    this.MouseX = event.clientX-this.Canvas.offsetLeft;
    this.MouseY = this.Canvas.height - (event.clientY-this.Canvas.offsetTop);
    this.MouseDown = true;
    this.ChooseViewer();
    if (this.CurrentViewer) {
	this.CurrentViewer.HandleMouseDown(this.MouseX, this.MouseY);
    }
}

EventManager.prototype.HandleMouseUp = function(event) {
    this.MouseDown = false;
    this.OverViewFlag = false;
    this.CurrentViewer = null; 
}

// Forward even to view.
EventManager.prototype.HandleMouseMove = function(event) {
    this.LastMouseX = this.MouseX;
    this.LastMouseY = this.MouseY;
    // Translate to coordinate of canvas
    // Change origin to lower left.
    this.MouseX = event.clientX-this.Canvas.offsetLeft;
    this.MouseY = this.Canvas.height - (event.clientY-this.Canvas.offsetTop);
    // Viewers do not process move events unless the mouse is pressed.
    if ( ! this.MouseDown) {
	return;
    }
    this.ChooseViewer();
    if (this.CurrentViewer) {
	var deltaX = this.MouseX - this.LastMouseX;
	var deltaY = this.MouseY - this.LastMouseY;
	this.CurrentViewer.HandleMouseMove(this.MouseX, this.MouseY,
					       deltaX, deltaY,
					       this.ShiftKeyPressed);
    }
}



//------------- Keys ---------------

EventManager.prototype.HandleKeyDown = function(event) { 
    if (event.keyCode == 16) {
        // Shift key modifier.
        this.ShiftKeyPressed = true;
    }

    this.ChooseViewer();
    if (this.CurrentViewer) {
	this.CurrentViewer.HandleKeyPress(event.keyCode);
    }
}

EventManager.prototype.HandleKeyUp = function(event) {
    if (event.keyCode == 16) {
        // Shift key modifier.
        this.ShiftKeyPressed = false;
    }
}






