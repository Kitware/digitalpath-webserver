//==============================================================================
// This widget will first be setup to define an arrow.
// Viewer will forward events to the arrow.
// Return value of the mouse release method will indicate
// when the handler inactivates. (I do not like this!!!!)


var ARROW_WIDGET_NEW = 0; // The arrow has just been created and is following the mouse.
var ARROW_WIDGET_DRAG = 1; // The whole arrow is being dragged.
var ARROW_WIDGET_DRAG_TIP = 2; 
var ARROW_WIDGET_DRAG_TAIL = 3;
var ARROW_WIDGET_WAITING = 4; // The normal (resting) state.
var ARROW_WIDGET_ACTIVE = 5; // Mouse is over the widget and it is receiving events.
var ARROW_WIDGET_PROPERTIES_DIALOG = 6; // Properties dialog is up



function ArrowWidget (viewer, newFlag) {
  this.Viewer = viewer;
  if (newFlag) {
    this.State = ARROW_WIDGET_NEW;
    this.Viewer.ActivateWidget(this);
    return;
  }

  this.State = ARROW_WIDGET_WAITING;
}

ArrowWidget.prototype.Serialize = function() {
  if(this.Arrow === undefined) { 
    return null; 
  }

  var obj = new Object();
  obj.type = "arrow";
  obj.origin = this.Arrow.Origin
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
  if (this.State == ARROW_WIDGET_NEW) {
    this.State = ARROW_WIDGET_DRAG_TAIL;
  }
}

// returns false when it is finished doing its work.
ArrowWidget.prototype.HandleMouseUp = function(event) {
  this.State = ARROW_WIDGET_WAITING;
  this.Viewer.SetActiveWidget(null);
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

  if (this.State == ARROW_WIDGET_NEW) {
    var viewport = this.Viewer.GetViewport();

    // Convert to viewer coordinate system.
    // It would be nice to have this before this method.
    x = x - viewport[0];
    y = y - viewport[1];
    // Now we need to convert to world coordinate system
    
    this.TipPosition = [x,y];
    // Convert (x,y) to ???
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
    eventuallyRender();
  }
  
  if (this.State == ARROW_WIDGET_DRAG_TAIL) { 
    var dx = x-this.TipPosition[0];
    var dy = y-this.TipPosition[1];
    this.Arrow.Length = Math.sqrt(dx*dx + dy*dy);
    this.Arrow.Orientation = Math.atan2(dy, dx) * 180.0 / Math.PI;
    this.Arrow.UpdateBuffers();
    eventuallyRender();
  }
  
  // I do not like having return an unrelated flag (widget still active). Fix this.
  return true;
}

// We have three states this widget is active.
// First created and folloing the mouse (actually two, head or tail following). Color nbot active.
// Active because mouse is over the arrow.  Color of arrow set to active.
// Active because the properties dialog is up. (This is how dialog know which widget is being edited).
ArrowWidget.prototype.GetActive = function() {
  if (this.State == TEXT_WIDGET_ACTIVE || this.State == TEXT_WIDGET_PROPERTIES_DIALOG) {
    return true;  
  }
  return false;
}

ArrowWidget.prototype.SetActive = function(flag) {  
  if (flag == this.GetActive()) {
    return;
  }

  if (flag) {
    this.State = ARROW_WIDGET_ACTIVE;  
    this.Arrow.Active = true;
    this.Viewer.ActivateWidget(this);
    eventuallyRender();
  } else {
    this.State = ARROW_WIDGET_WAITING;
    this.Arrow.Active = false;
    this.Viewer.DeactivateWidget(this);
    eventuallyRender();
  }
}

ArrowWidget.prototype.ShowPropertiesDialog = function () {
  $("#arrow-properties-dialog").dialog("open");
}    








