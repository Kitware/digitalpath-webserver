//==============================================================================
// There is only one viewer that handles events.  It can forwad events
// to other objects as it see fit however.


// ParaMarine
// Weight balance.
// Resistance, powering damage stability


// VTK Simple: Quickly, Short learning curve. Drag and drop.
// Current tool (thesis) is excell / scripted based.
// Bulkheads
// Initial analysis for damage survival. (Before paramarine)
// They have code
// Intakes (turbine) must be straight.  Exhaust can have bends.
// Stacks at from bad (Salt water intake)
// Separation of engines.

// Cloud.  What does htis give you?

// Engine room assembly (group / ungroup for editing assembly).

// Initial all bounding boxes (labels).
// Assmblies can spread out to fit hull.  (Parameters).

// Constraints?
// Estimate drop.
// Constraint to deck
// Groups of objects work together.

// Export to paramarine. (paramarine has too many features (To hard to use)).

// pain in Early design
// Conduits Conneting machinery.  Need highways (space allocated for wiring and pipes)





// What do we provide initially?

//Clip deck to hull.
//Punch holes in hull.
//Assemblies.
//Pararmeter based models.
//Viewers.



function Viewer (viewport, cache) {
    // Some of these could get transitioned to view or style ...
    // Left click option: Drag in main window, place in overview.
    this.OverViewEventFlag = false;

    this.ZoomTarget;
    this.AnimateLast;
    this.AnimateDuration = 0.0;
    this.TranslateTarget = [0.0,0.0];
    this.ZoomTarget = 1.0;

    this.MainView = new View(viewport, cache);
    this.MainView.Camera.ZRange = [0,1];
    this.MainView.Camera.ComputeMatrix();
    var overViewport = [viewport[0] + viewport[2]*0.8, 
                        viewport[1] + viewport[3]*0.8,
                        viewport[2]*0.18, viewport[3]*0.18];
    this.OverView = new View(overViewport, cache);
    this.OverView.Camera.ZRange = [-1,0];
    this.OverView.Camera.FocalPoint = [13000.0, 11000.0, 10.0];
    this.OverView.Camera.Height = 22000.0;
    this.OverView.Camera.ComputeMatrix();
    this.ZoomTarget = this.MainView.Camera.GetHeight();
	
    this.AnnotationList = [];
    this.ShapeList = [];

    // Forward the events to the widget if one is active.
    this.Widget = null;
}

Viewer.prototype.DegToRad = function(degrees) {
    return degrees * Math.PI / 180;
}

Viewer.prototype.GetViewport = function() {
    return this.MainView.Viewport;
}


Viewer.prototype.Draw = function() {
    // Should the camera have the viewport in them?
    // The do not currently hav a viewport.

    // Rendering text uses blending / transparency.
    GL.disable(GL.BLEND);
    GL.enable(GL.DEPTH_TEST);

    this.MainView.Camera.Draw(this.OverView.Camera, this.OverView.Viewport);
    //
    this.OverView.DrawOutline(true);
    this.MainView.DrawOutline(false);
    this.OverView.DrawTiles();
    this.MainView.DrawTiles();

    for(i=0; i<this.AnnotationList.length; i++){
	this.AnnotationList[i].Draw(this);
    }

    for(i=0; i<this.ShapeList.length; i++){
	this.ShapeList[i].Draw(this.MainView);
    }
}

Viewer.prototype.AddAnnotation = function(position, text, color) {
    this.AnnotationList.push(new Annotation(position, text, color));
}

// A list of shapes to render in the viewer
Viewer.prototype.AddShape = function(shape) {
    this.ShapeList.push(shape);
}

Viewer.prototype.Animate = function() {
    if (this.AnimateDuration <= 0.0) {
	return;
    }
    var timeNow = new Date().getTime();
    if (timeNow >= (this.AnimateLast + this.AnimateDuration)) {
        // We have past the target. Just set the target values.
	this.MainView.Camera.Height = this.ZoomTarget;
	this.MainView.Camera.FocalPoint[0] = this.TranslateTarget[0];
	this.MainView.Camera.FocalPoint[1] = this.TranslateTarget[1];
    } else {
	// Interpolate
        var currentHeight = this.MainView.Camera.GetHeight();
        var currentCenter = this.MainView.Camera.FocalPoint;
        this.MainView.Camera.Height 
	    = currentHeight + (this.ZoomTarget-currentHeight)
            *(timeNow-this.AnimateLast)/this.AnimateDuration;
        this.MainView.Camera.FocalPoint[0]
	    = currentCenter[0] + (this.TranslateTarget[0]-currentCenter[0])
            *(timeNow-this.AnimateLast)/this.AnimateDuration;
        this.MainView.Camera.FocalPoint[1]
	    = currentCenter[1] + (this.TranslateTarget[1]-currentCenter[1])
            *(timeNow-this.AnimateLast)/this.AnimateDuration;	    
	// We are not finished yet.
	// Schedule another render
	eventuallyRender();
    }
    this.MainView.Camera.ComputeMatrix();
    this.AnimateDuration -= (timeNow-this.AnimateLast);
    this.AnimateLast = timeNow;  
}    


Viewer.prototype.OverViewPlaceCamera = function(x, y) {
    // Compute focal point from inverse overview camera.
    x = x/this.OverView.Viewport[2];
    y = y/this.OverView.Viewport[3];
    x = (x*2.0 - 1.0)*this.OverView.Camera.Matrix[15];
    y = (y*2.0 - 1.0)*this.OverView.Camera.Matrix[15];
    var m = this.OverView.Camera.Matrix;
    var det = m[0]*m[5] - m[1]*m[4];
    var xNew = (x*m[5]-y*m[4]+m[4]*m[13]-m[5]*m[12]) / det;
    var yNew = (y*m[0]-x*m[1]-m[0]*m[13]+m[1]*m[12]) / det;

    // Animate to get rid of jerky panning (overview to low resolution).
    this.TranslateTarget[0] = xNew;
    this.TranslateTarget[1] = yNew;
    this.AnimateLast = new Date().getTime();
    this.AnimateDuration = 100.0;
    eventuallyRender();
}

Viewer.prototype.HandleMouseDown = function(x, y) {
    // Forward the events to the widget if one is active.
    if (this.Widget != null) {
	this.Widget.HandleMouseDown(x,y);
	return;
    }
   
   // Are we in the overview or the main view?
    this.OverViewEventFlag = false;
    if (x > this.OverView.Viewport[0] && y > this.OverView.Viewport[1] &&
	x < this.OverView.Viewport[0]+this.OverView.Viewport[2] &&
	y < this.OverView.Viewport[1]+this.OverView.Viewport[3]) {
	this.OverViewEventFlag = true;
	// Transform to view's coordinate system.
	x = x - this.OverView.Viewport[0];
	y = y - this.OverView.Viewport[1];
	this.OverViewPlaceCamera(x, y);
    }
}

Viewer.prototype.HandleMouseUp = function(event) {
    // Forward the events to the widget if one is active.
    if (this.Widget != null) {
        if (this.Widget.HandleMouseUp(event) == false) {
            if(this.AnnotationCallback != undefined) {
                this.AnnotationCallback(this.Widget);
            }
            this.Widget = null;
        }
	return;
    }
   
}



Viewer.prototype.HandleMouseMove = function(event, dx,dy) {
    // Many shapes, widgets and interactors will need the mouse in world coodinates.
    var x = event.MouseX;
    var y = event.MouseY;
    var viewport = this.GetViewport();
    var cam = this.MainView.Camera;
    x = x - viewport[0];
    y = y - viewport[1];
    // Compute world point from inverse overview camera.
    x = x/viewport[2];
    y = y/viewport[3];
    x = (x*2.0 - 1.0)*cam.Matrix[15];
    y = (y*2.0 - 1.0)*cam.Matrix[15];
    var m = cam.Matrix;
    var det = m[0]*m[5] - m[1]*m[4];
    event.MouseWorldX = ((x*m[5]-y*m[4]+m[4]*m[13]-m[5]*m[12]) / det);
    event.MouseWorldY = ((y*m[0]-x*m[1]-m[0]*m[13]+m[1]*m[12]) / det);
    
    // Forward the events to the widget if one is active.
    if (this.Widget != null) {
	this.Widget.HandleMouseMove(event);
	return;
    }
   
    if ( ! event.MouseDown) {
	// Give the shapes a chance to react to the mose over them.
	// They will change color to indicate they can be selected or modified.
	for (var i = 0; i < this.ShapeList.length; ++i) {
	    if (this.ShapeList[i].HandleMouseMove(event, dx, dy)) {
		// Only one shape can be active at a time.
		return;
	    }
	}
	return;
    }

    var x = event.MouseX;
    var y = event.MouseY;
    var shiftKeyPressed = event.ShiftKeyPressed;
    if (this.OverViewEventFlag) {
	x = x - this.OverView.Viewport[0];
	y = y - this.OverView.Viewport[1];
	this.OverViewPlaceCamera(x, y);
	// Animation handles the render.
	return;
    }
    
    // Drag camera in main view.
    x = x - this.MainView.Viewport[0];
    y = y - this.MainView.Viewport[1];
    if (shiftKeyPressed) {
	// Rotate
        // Origin in the center.
	// GLOBAL GL will use view's viewport instead.
        var cx = x - (this.MainView.Viewport[2]*0.5);
        var cy = y - (this.MainView.Viewport[3]*0.5);
	// GLOBAL views will go away when views handle this.
        this.MainView.Camera.HandleRoll(cx, cy, dx, dy);
        this.OverView.Camera.HandleRoll(cx, cy, dx, dy);
    } else {
	// Translate
        // Convert to view [-0.5,0.5] coordinate system.
        // Note: the origin gets subtracted out in delta above.
        dx = -dx / this.MainView.Viewport[2];
        dy = -dy / this.MainView.Viewport[2];    
        this.MainView.Camera.HandleTranslate(dx, dy, 0.0);
    }
    eventuallyRender();
}

Viewer.prototype.HandleKeyPress = function(keyCode, shift) {
    if (this.Widget != null) {
	this.Widget.HandleKeyPress(keyCode, shift);
	return;
    }

    if (String.fromCharCode(keyCode) == 'R') {
        //this.MainView.Camera.Reset();
        this.MainView.Camera.ComputeMatrix();
        this.ZoomTarget = this.MainView.Camera.GetHeight();
	eventuallyRender();
    }

    // Cursor keys just move around the view.
    if (keyCode == 37) {
        // Left cursor key
        if (SLICE > 1) {
            this.MainView.Camera.Translate(0,0,-ROOT_SPACING[2]);
            --SLICE;
            eventuallyRender();
        }
    } else if (keyCode == 39) {
        // Right cursor key
        ++SLICE;
        this.MainView.Camera.Translate(0,0,ROOT_SPACING[2]);
        eventuallyRender();
    } else if (keyCode == 38) {
        // Up cursor key
        this.ZoomTarget *= 2;
	this.TranslateTarget[0] = this.MainView.Camera.FocalPoint[0];
	this.TranslateTarget[1] = this.MainView.Camera.FocalPoint[1];
        this.AnimateLast = new Date().getTime();
        this.AnimateDuration = 200.0;
        eventuallyRender();
    } else if (keyCode == 40) {
        // Down cursor key
        if (this.ZoomTarget > 0.9 / (1 << 5)) {
            this.ZoomTarget *= 0.5;
	    this.TranslateTarget[0] = this.MainView.Camera.FocalPoint[0];
	    this.TranslateTarget[1] = this.MainView.Camera.FocalPoint[1];
            this.AnimateLast = new Date().getTime();
            this.AnimateDuration = 200.0;
            eventuallyRender();
	}
    }
}








