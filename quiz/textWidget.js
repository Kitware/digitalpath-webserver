//==============================================================================
// Active widget 
// User clicks to set cursor.
// User types and text object updates.
// The user clicks (and drags) to place the center of rotation, 
// and drags to move the text.
// When the button is release, the text widget deactivates. 

// Todo: Add a cursor icon (line) (that blinks?).


var TEXT_WIDGET_PLACE_CURSOR = 0;
var TEXT_WIDGET_TYPING = 1;
var TEXT_WIDGET_PLACE_TEXT = 2;

function TextWidget (viewer) {
    this.Viewer = viewer;
    this.State = TEXT_WIDGET_PLACE_CURSOR; // place cursor.
    this.AnchorPixelPosition = [0,0];
    this.CursorLocation = 0;
}

TextWidget.prototype.Serialize = function() {
    if(this.Text === undefined){ return null; }
    var obj = new Object();
    obj.type = "text";
    obj.color = this.Text.Color;
    obj.size = this.Text.Size;
    obj.anchor = this.Text.Anchor;
    obj.position = this.Text.Position;
    obj.string = this.Text.String;
    return obj;
}

TextWidget.prototype.HandleKeyPress = function(keyCode, shift) {
    if (this.State != TEXT_WIDGET_TYPING) {
	return;
    }
    if ((keyCode >= 20 && keyCode <= 125) || keyCode == 13) {
	// All key code seem to be capitals.  Compensate with shift modifier.
	if (keyCode >= 65 && keyCode <= 90 && ! shift) {
	    keyCode += 32;
	}
	var c = String.fromCharCode(keyCode);
	// I am hacking in a cursor with the I character.
	// The last character is always I.
	this.Text.String = this.Text.String.substr(0,this.CursorLocation++) + c + "I";
	this.Text.UpdateBuffers();
	eventuallyRender();
    }
}

TextWidget.prototype.HandleMouseDown = function(x, y) {
    if (this.State == TEXT_WIDGET_TYPING) {
	this.State = TEXT_WIDGET_PLACE_TEXT;
	// Set the anchor.
	this.Text.Anchor[0] = x-this.AnchorPixelPosition[0];
	this.Text.Anchor[1] = y-this.AnchorPixelPosition[1];
	// Now we need to set the world position of the new anchor.
	this.Text.Position = this.PixelPointToWorld(x,y);
	// remove the hack cursor from the string.
	this.Text.String = this.Text.String.substr(0,this.CursorLocation);
	this.Text.UpdateBuffers();
	eventuallyRender();
    }
}

// returns false when it is finished doing its work.
TextWidget.prototype.HandleMouseUp = function(event) {
    if (this.State == TEXT_WIDGET_PLACE_CURSOR) {
	// Transition to typing state on first mouse up.
	this.State = TEXT_WIDGET_TYPING;
	return true;
    }

    return false;
}

TextWidget.prototype.PixelPointToWorld = function(x, y) {
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
    

TextWidget.prototype.HandleMouseMove = function(event) {
    if (this.Text === undefined) {
	// Wait to create this until the first move event.
	this.Text = new Text();
	// If the user clicks before the mouse in the window,
	// This will not work properly.
	// I am hacking in a cursor with the I character.
	this.Text.String = "I";
	this.Text.Position = [0,0];
	this.Text.Color = [0.0, 0.0, 0.0];
	this.Viewer.AddShape(this.Text);
    }

    var x = event.MouseX;
    var y = event.MouseY;

    if (this.State == TEXT_WIDGET_PLACE_CURSOR || this.State == TEXT_WIDGET_PLACE_TEXT) {
	// move the world location of the anchor
	this.Text.Position = this.PixelPointToWorld(x,y);
	// Save the anchor pixel location so we can compute the anchor relative location
	// when the user next presses the left  mouse button.
	this.AnchorPixelPosition = [x,y];
	eventuallyRender();
    }
}





