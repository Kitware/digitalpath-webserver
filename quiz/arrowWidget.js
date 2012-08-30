//==============================================================================
// This widget will first be setup to define an arrow.
// Viewer will forward events to the arrow.

// The arrow has just been created and is following the mouse.
// I have to differentiate from ARROW_WIDGET_DRAG because
// dragging while just created cannot be relative.  It places the tip on the mouse.
var ARROW_WIDGET_NEW = 0;
var ARROW_WIDGET_DRAG = 1; // The whole arrow is being dragged.
var ARROW_WIDGET_DRAG_TIP = 2;
var ARROW_WIDGET_DRAG_TAIL = 3;
var ARROW_WIDGET_WAITING = 4; // The normal (resting) state.
var ARROW_WIDGET_ACTIVE = 5; // Mouse is over the widget and it is receiving events.
var ARROW_WIDGET_PROPERTIES_DIALOG = 6; // Properties dialog is up



function ArrowWidget (viewer, newFlag) {
  if (viewer == null) {
    return null;
  }
  this.Viewer = viewer;

  // Wait to create this until the first move event.
  this.Shape = new Arrow();
  this.Shape.Origin = [0,0];
  this.Shape.SetFillColor([0.0, 0.0, 0.0]);
  this.Shape.OutlineColor = [1.0, 1.0, 1.0];
  this.Shape.Length = 50;
  this.Shape.Width = 8;
  viewer.WidgetList.push(this);
  viewer.AddShape(this.Shape);
  // Note: If the user clicks before the mouse is in the
  // canvas, this will behave odd.
  this.TipPosition = [0,0];
  this.TipOffset = [0,0];

  if (newFlag) {
    this.State = ARROW_WIDGET_NEW;
    this.Viewer.ActivateWidget(this);
    return;
  }

  this.State = ARROW_WIDGET_WAITING;
}

ArrowWidget.prototype.RemoveFromViewer = function() {
  if (this.Viewer == null) {
    return;
  }
  var idx = this.Viewer.ShapeList.indexOf(this.Shape);
  if(idx!=-1) { 
    this.Viewer.ShapeList.splice(idx, 1); 
  }
  var idx = this.Viewer.WidgetList.indexOf(this);
  if(idx!=-1) { 
    this.Viewer.WidgetList.splice(idx, 1); 
  }
}

ArrowWidget.prototype.Serialize = function() {
  if(this.Shape === undefined) { 
    return null; 
  }

  var obj = new Object();
  obj.type = "arrow";
  obj.origin = this.Shape.Origin
	obj.fillcolor = this.Shape.FillColor;
	obj.outlinecolor = this.Shape.OutlineColor;
	obj.length = this.Shape.Length;
	obj.width = this.Shape.Width;
  obj.orientation = this.Shape.Orientation;
  return obj;
}

ArrowWidget.prototype.HandleKeyPress = function(keyCode, shift) {
}

ArrowWidget.prototype.HandleMouseDown = function(event) {
  if (event.SystemEvent.which != 1)
    {
    return;
    }
  if (this.State == ARROW_WIDGET_NEW) {
    this.TipPosition = [event.MouseX, event.MouseY];
    this.State = ARROW_WIDGET_DRAG_TAIL;
  }
  if (this.State == ARROW_WIDGET_ACTIVE) {
    // We can get this working later.
    //if (this.ActiveLocation < this.Shape.Width) {
    //  this.State = ARROW_WIDGET_DRAG_TIP;
    //} else 
    if (this.ActiveLocation > this.Shape.Length - this.Shape.Width) {
      this.TipPosition = this.Viewer.ConvertPointWorldToViewer(this.Shape.Origin[0], this.Shape.Origin[1]);
      this.State = ARROW_WIDGET_DRAG_TAIL;
    } else {
      var tipPosition = this.Viewer.ConvertPointWorldToViewer(this.Shape.Origin[0], this.Shape.Origin[1]);
      this.TipOffset[0] = tipPosition[0] - event.MouseX;
      this.TipOffset[1] = tipPosition[1] - event.MouseY;
      this.State = ARROW_WIDGET_DRAG;
    }
  }
}

// returns false when it is finished doing its work.
ArrowWidget.prototype.HandleMouseUp = function(event) {
  if (this.State == ARROW_WIDGET_ACTIVE && event.SystemEvent.which == 3) {
    // Right mouse was pressed.
    // Pop up the properties dialog.
    // Which one should we popup?
    // Add a ShowProperties method to the widget. (With the magic of javascript). 
    this.State = ARROW_WIDGET_PROPERTIES_DIALOG;
    this.ShowPropertiesDialog();
  } else if (this.State != ARROW_WIDGET_PROPERTIES_DIALOG) {
    this.SetActive(false);
  }
}

ArrowWidget.prototype.HandleMouseMove = function(event) {
  var x = event.MouseX;
  var y = event.MouseY;

  if (event.MouseDown == false && this.State == ARROW_WIDGET_ACTIVE) {
    this.CheckActive(event);
    return;
  }

  if (this.State == ARROW_WIDGET_NEW || this.State == ARROW_WIDGET_DRAG) {
    var viewport = this.Viewer.GetViewport();    
    this.Shape.Origin = this.Viewer.ConvertPointViewerToWorld(x+this.TipOffset[0], y+this.TipOffset[1]);
    eventuallyRender();
  }

  if (this.State == ARROW_WIDGET_DRAG_TAIL) { 
    var dx = x-this.TipPosition[0];
    var dy = y-this.TipPosition[1];
    this.Shape.Length = Math.sqrt(dx*dx + dy*dy);
    this.Shape.Orientation = Math.atan2(dy, dx) * 180.0 / Math.PI;
    this.Shape.UpdateBuffers();
    eventuallyRender();
  }

  if (this.State == ARROW_WIDGET_WAITING) { 
    this.CheckActive(event);
  }
}

ArrowWidget.prototype.CheckActive = function(event) {
  var viewport = this.Viewer.GetViewport();
  var cam = this.Viewer.MainView.Camera;
  var m = cam.Matrix;
  // Compute tip point in screen coordinates.
  var x = this.Shape.Origin[0];
  var y = this.Shape.Origin[1];
    // Convert from world coordinate to view (-1->1);
  var h = (x*m[3] + y*m[7] + m[15]);
  var xNew = (x*m[0] + y*m[4] + m[12]) / h;
  var yNew = (x*m[1] + y*m[5] + m[13]) / h;
  // Convert from view to screen pixel coordinates.
  xNew = (xNew + 1.0)*0.5*viewport[2] + viewport[0];
  yNew = (yNew + 1.0)*0.5*viewport[3] + viewport[1];
  // Use this point as the origin.
  x = event.MouseX - xNew;
  y = event.MouseY - yNew;
  // Rotate so arrow lies along the x axis.
  var tmp = this.Shape.Orientation * Math.PI / 180.0;
  var ct = Math.cos(tmp);
  var st = Math.sin(tmp);
  xNew = x*ct + y*st;
  yNew = -x*st + y*ct;
  tmp = this.Shape.Width / 2.0;
  if (xNew > 0.0 && xNew < this.Shape.Length && yNew < tmp && yNew > -tmp) {
    this.SetActive(true);
    // Save the position along the arrow to decide which drag behavior to use.
    this.ActiveLocation = xNew;
    return true;
  } else {
    this.SetActive(false);
    this.ActiveLocation = 0.0;
    return false;
  }
}

// We have three states this widget is active.
// First created and folloing the mouse (actually two, head or tail following). Color nbot active.
// Active because mouse is over the arrow.  Color of arrow set to active.
// Active because the properties dialog is up. (This is how dialog know which widget is being edited).
ArrowWidget.prototype.GetActive = function() {
  if (this.State == ARROW_WIDGET_WAITING) {
    return false;  
  }
  return true;
}

ArrowWidget.prototype.SetActive = function(flag) {  
  if (flag == this.GetActive()) {
    return;
  }

  if (flag) {
    this.State = ARROW_WIDGET_ACTIVE;  
    this.Shape.Active = true;
    this.Viewer.ActivateWidget(this);
    eventuallyRender();
  } else {
    this.State = ARROW_WIDGET_WAITING;
    this.Shape.Active = false;
    this.Viewer.DeactivateWidget(this);
    eventuallyRender();
  }
}

ArrowWidget.prototype.ShowPropertiesDialog = function () {
  $("#arrow-properties-dialog").dialog("open");
}    








