//==============================================================================
// PLAN: for the new behavior.
// The widget gets created in its waiting state.
// It monitors mouse movements and decides when to become active.
// It becomes active when the mouse is over the center or edge.
// I think we should have a method other than handleMouseMove check this
// because we need to handle overlapping widgets.
// When active, the user can move the circle, or change the radius.
// I do not know what to do about line thickness yet.
// When active, we will respond to right clicks which bring up a menu.
// One item in the menu will be delete.

//==============================================================================
// Active widget 
// User clicks to set cursor.
// User types and text object updates.
// The user clicks (and drags) to place the center of rotation, 
// and drags to move the text.
// When the button is release, the text widget deactivates. 

// Todo: Add a cursor icon (line) (that blinks?).


var TEXT_WIDGET_WAITING = 0;
var TEXT_WIDGET_ACTIVE = 1;
var TEXT_WIDGET_DRAG = 2;
var TEXT_WIDGET_PROPERTIES_DIALOG = 3;

function TextWidget (viewer, string) {
  this.Viewer = viewer;
  this.State = TEXT_WIDGET_WAITING;
  this.CursorLocation = 0; // REMOVE

  var cam = this.Viewer.MainView.Camera;

  this.Shape = new Text();
  this.Shape.String = string;
  this.Shape.UpdateBuffers(); // Needed to get the bounds.
  this.Shape.Color = [0.0, 0.0, 0.0];
  this.Shape.Anchor = [0.5*(this.Shape.PixelBounds[0]+this.Shape.PixelBounds[1]),
                      0.5*(this.Shape.PixelBounds[2]+this.Shape.PixelBounds[3])];

  // I would like to setup the ancoh in the middle of the screen,
  // And have the Anchor in the middle of the text.
  this.Shape.Position = [cam.FocalPoint[0], cam.FocalPoint[1]];

  this.Viewer.AddShape(this.Shape);
}

TextWidget.prototype.Serialize = function() {
  if(this.Shape === undefined){ return null; }
  var obj = new Object();
  obj.type = "text";
  obj.color = this.Shape.Color;
  obj.size = this.Shape.Size;
  obj.anchor = this.Shape.Anchor;
  obj.position = this.Shape.Position;
  obj.string = this.Shape.String;
  return obj;
}


TextWidget.prototype.HandleKeyPress = function(keyCode, shift) {
}


TextWidget.prototype.HandleMouseDown = function(event) {
  if (this.State == TEXT_WIDGET_ACTIVE) {
    var x = event.MouseX;
    var y = event.MouseY;
    this.State = TEXT_WIDGET_DRAG;
    // Set the anchor.
    // Covert mouse screen point to text coordinate system.
    this.Shape.Anchor = this.ScreenPixelToTextPixelPoint(x,y);
    // Now we need to set the world position of the new anchor.
    this.Shape.Position = this.Viewer.ConvertPointViewerToWorld(x,y);
    eventuallyRender();
  }
}

// returns false when it is finished doing its work.
TextWidget.prototype.HandleMouseUp = function(event) {
  if (this.State == TEXT_WIDGET_DRAG) {
    // Transition to typing state on first mouse up.
    this.State = TEXT_WIDGET_ACTIVE;
    // We should save the widget in the database here.
    }
  
  if (this.State == TEXT_WIDGET_ACTIVE && event.SystemEvent.which == 3) {
    // Right mouse was pressed.
    // Pop up the properties dialog.
    // Which one should we popup?
    // Add a ShowProperties method to the widget. (With the magic of javascript). 
    this.State = TEXT_WIDGET_PROPERTIES_DIALOG;
    this.ShowPropertiesDialog();
    }
}


// I need to convert mouse screen point to coordinates of text buffer
// to see if the mouse position is in the bounds of the text.
TextWidget.prototype.ScreenPixelToTextPixelPoint = function(x,y) {
  var textOriginScreenPixelPosition = this.Viewer.ConvertPointWorldToViewer(this.Shape.Position[0],this.Shape.Position[1]);
  x = (x - textOriginScreenPixelPosition[0]) + this.Shape.Anchor[0];  
  y = (y - textOriginScreenPixelPosition[1]) + this.Shape.Anchor[1];  

  return [x,y];
}

TextWidget.prototype.HandleMouseMove = function(event) {
  if (this.State == TEXT_WIDGET_DRAG) {
    this.Shape.Position = this.Viewer.ConvertPointViewerToWorld(event.MouseX, event.MouseY);
    eventuallyRender();
    return true;
  }
  // We do not want to deactivate the widget while the properties dialog is showing.
  if (this.State != TEXT_WIDGET_PROPERTIES_DIALOG) {
    return this.CheckActive(event);
  }
  return true;
}

TextWidget.prototype.CheckActive = function(event) {
  var tMouse = this.ScreenPixelToTextPixelPoint(event.MouseX, event.MouseY);

  // check to see if the point is no the bounds of the text.
  if (tMouse[0] > this.Shape.PixelBounds[0] && tMouse[0] < this.Shape.PixelBounds[1] &&
      tMouse[1] > this.Shape.PixelBounds[2] && tMouse[1] < this.Shape.PixelBounds[3]) {
    this.SetActive(true);
    return true;
  } else {
    this.SetActive(false);
    return false;
  }
}

TextWidget.prototype.GetActive = function() {
  if (this.State == TEXT_WIDGET_ACTIVE || this.State == TEXT_WIDGET_PROPERTIES_DIALOG) {
    return true;  
  }
  return false;
}

TextWidget.prototype.SetActive = function(flag) {
  // Dialog state is tricky because the widget is still active.
  // SetActive is used to clear the dialog state.
  if (this.State == TEXT_WIDGET_PROPERTIES_DIALOG) {
    this.State == TEXT_WIDGET_ACTIVE;
  }
  
  if (flag == this.GetActive()) {
    return;
  }

  if (flag) {
    this.State = TEXT_WIDGET_ACTIVE;  
    this.Shape.Active = true;
    this.Viewer.ActivateWidget(this);
    eventuallyRender();
  } else {
    this.State = TEXT_WIDGET_WAITING;
    this.Shape.Active = false;
    this.Viewer.DeactivateWidget(this);
    eventuallyRender();
  }
}

TextWidget.prototype.ShowPropertiesDialog = function () {
  var ta = document.getElementById("textwidgetcontent");
  ta.value = this.Shape.String;       
  $("#text-properties-dialog").dialog("open");
}    






