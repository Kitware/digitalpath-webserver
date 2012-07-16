// Openlayers must be loaded
// This modifies openlayers

// Pixastic library must be loaded before loading this file

//$.getScript("my_lovely_script.js", function(){
//
//
//   alert("Script loaded and executed.");
//   // here you can use anything you defined in the loaded script
//
//});


// Returns two functions which accept the form and set the processing filter for the layer
//
//
//

// Modify openlayers Grid
// Modify openlayers TMS
// Modify other tile images needed 

// # Requires the layers to use USEONECANVASPERTILE 
 
// TODO: Make this work with webworkers
//

var filter;

BrightnessFilter = OpenLayers.Class(OpenLayers.Tile.CanvasFilter, {
    brightness: -50,
    contrast:0,
    red:0,
    blue:0,
    green:0,

    webworkerScript: "canvasfilter-webworker.js",
    numberOfWebWorkers: 1, // per tile
    
    process: function(image) {
        var white = {
              brightness: this.brightness,
              contrast: this.contrast
            };

        var rgb = {
              red: this.red,
              green: this.green,
              blue: this.blue
            };
       
        
        // directly calling 'Pixastic.applyAction' instead of 'Pixastic.process'
        // works better in Chromium when using a proxy
        Pixastic.applyAction(image, image, "coloradjust", rgb);
        Pixastic.applyAction(rgb.resultCanvas, rgb.resultCanvas, "brightness", white) ;
        

        if (!white.resultCanvas) {
            // if something went wrong, return the original image
            return image;
        } else {
            return white.resultCanvas;
        }                
    },
    
    supportsAsync: function() {
        return false;    
    },

    getParameters: function() {
        // these parameters are passed to the web worker script
        return {
            brightness: this.brightness,
            contrast: this.contrast,

            red: this.red,
            green: this.green,
            blue: this.blue,
        };    
    },
    
    CLASS_NAME: "BrightnessFilter"    
});
  
filter = new BrightnessFilter();

resetFilter = function(form, layer) 
  {
  $("#brightness").val(0).slider("refresh");
  $("#contrast").val(0).slider("refresh");
  $("#red").val(0).slider("refresh");
  $("#green").val(0).slider("refresh");
  $("#blue").val(0).slider("refresh");


  layer.canvasFilter = null; 
  layer.redraw();
  }

setFilter = function(form, layer) 
  {
  var brightness = parseInt(form.brightness.value * 150. / 100.);
  var contrast = parseFloat(form.contrast.value);

  var red = parseFloat(form.red.value);
  var green = parseFloat(form.green.value);
  var blue = parseFloat(form.blue.value);

  filter.brightness = brightness;
  
  // Map contrast between -1 and 5  
  if(contrast < 0)
    {
    contrast = contrast / 100
    }
  else
    {
    contrast = contrast / 20
    }

  filter.contrast = contrast;
  filter.red = red / 100.;
  filter.green = green/ 100.;
  filter.blue = blue / 100.;
  
  // refresh map  
  layer.canvasFilter = filter;
  layer.redraw();  
  };

