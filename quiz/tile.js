// I want to avoid adding a Cache instance variable.
// I need to create the temporary object to hold poitners
// to both the cache and the tile which we are waiting for
// the image to load.  The callback only gives a single reference.
function LoadTileCallback(tile,cache) {
  this.Tile = tile;
  this.Cache = cache;
}

// Which cache????????
LoadTileCallback.prototype.HandleLoadedTexture = function () {
    this.Tile.HandleLoadedTexture(this.Cache);
}

// If we cannot load a tile, we need to inform the cache so it can start 
// loading another tile.
LoadTileCallback.prototype.HandleErrorTexture = function () {
    this.Cache.LoadQueueError(this.Tile);
}


function GetLoadTextureFunction (callback) {
    return function () {callback.HandleLoadedTexture();}
}
function GetErrorTextureFunction (callback) {
    return function () {callback.HandleErrorTexture();}
}



// Three stages to loading a tile:
// 1: Create a tile object.
// 2: Initialize the texture.
// 3: onload is called indicating the image has been loaded.
function Tile(x, y, z, level, name, cache) {
  // This should be implicit.
  //this.Id = x + (y<<level)
  this.X = x;
  this.Y = y;
  this.Z = z;
  this.Level = level;
  this.Children = []; 
  this.Parent = null;
  this.LoadState = 0;
  this.Matrix = mat4.create();
  /*
  var xScale = cache.TileDimensions[0] * cache.RootSpacing[0] / (1 << level);
  var yScale = cache.TileDimensions[1] * cache.RootSpacing[1] / (1 << level);
  this.Matrix[0] = xScale;
  this.Matrix[5] = yScale;
  this.Matrix[12] = x * xScale;
  this.Matrix[13] = y * yScale;
  this.Matrix[14] = z * cache.RootSpacing[2] -(0.001 * this.Level);
  this.Matrix[15] = 1.0;
  */
  this.Name = name;
  this.Texture = null;
  this.TimeStamp = TIME_STAMP;
  this.BranchTimeStamp = TIME_STAMP;
  ++cache.NumberOfTiles;

  // Most tiles share the same buffers.  Tiles cropped
  // boy the boundary need their own unique buffers.
  // Some tiles need to be cropped to maintain bounds.
//  this.TileVertexPositionBuffer = tileVertexPositionBuffer;
//  this.TileVertexTextureCoordBuffer = tileVertexTextureCoordBuffer;
  // Crop or warp buffers if necessary.
  //this.Crop(cache.CropDimensions, cache.TileDimensions, cache.RootSpacing);   
  this.CreateLoopBuffer(cache);
};

Tile.prototype.destructor=function()
{
  --NUM_TILES;
  if (this.Texture) {
    GL.deleteTexture(this.Texture);
  }
  this.Texture = null;
  delete this.Matrix;
  this.Matrix = null;
  if (this.Image) {
    delete this.Image;
    this.Image = 0;
  }
  for (var i = 0; i < 4; ++i) {
    if (this.Children[i] != null) {
      this.Children[i].destructor();
      this.Children[i] = null;
    }
  }
}

// Find and return the intersection of two line segments.  Return null if there is no intersection.
Tile.prototype.FindIntersection = function (pa0,pa1, pb0, pb1) {
  // Project pb0 and pb1 on the normal of pa.
  var na = [pa0[1]-pa1[1], pa1[0]-pa0[0]];
  var kb0 = na[0]*(pb0[0]-pa0[0]) + na[1]*(pb0[1]-pa0[1]); 
  var kb1 = na[0]*(pb1[0]-pa0[0]) + na[1]*(pb1[1]-pa0[1]);
  if ((kb0 < 0.0 && kb1 < 0.0) || (kb0 > 0.0 && kb1 > 0.0)) {
    // Segment pb lies on one side of pa
    return null;
  }
  // Second comparison
  var nb = [pb0[1]-pb1[1], pb1[0]-pb0[0]];
  var ka0 = nb[0]*(pa0[0]-pb0[0]) + nb[1]*(pa0[1]-pb0[1]); 
  var ka1 = nb[0]*(pa1[0]-pb0[0]) + nb[1]*(pa1[1]-pb0[1]);
  if ((ka0 <= 0.0 && ka1 <= 0.0) || (ka0 >= 0.0 && ka1 >= 0.0)) {
    // Segment pa lies on one side of pb
    return null;
  }
  // The segments intersect.  Find the intersection.
  if (ka1 == ka0) {
    // Avoid divide by 0.
    return [pa0[0], pa0[1]];
  }
  var k = -ka0 /(ka1-ka0);
  return [pa0[0] + k*(pa1[0]-pa0[0]), pa0[1] + k*(pa1[1]-pa0[1])];
}

// Generate the gemetry buffers and tcoords by intersecting tileLoop with cacheLoop.
// This is rather complex.  It is confusing because the tile loop loks similar to the
// cache (image) loop, but they do different things.  The cache/image loop defines 
// the warping transformation.  The tile loop is for rendering a single polygon / texture.
// Tile loops are usually much smaller than the cache loop.
Tile.prototype.CreateLoopBuffer = function (cache) {
  var cacheLoop = cache.Loop;
  var cacheLoopCenter = cache.LoopCenter;
  if (cacheLoop.length <= 3) {
    // Use shared buffers and place them with the matric transformation.
    var xScale = cache.TileDimensions[0] * cache.RootSpacing[0] / (1 << this.Level);
    var yScale = cache.TileDimensions[1] * cache.RootSpacing[1] / (1 << this.Level);
    this.Matrix[0] = xScale;
    this.Matrix[5] = yScale;
    this.Matrix[12] = this.X * xScale;
    this.Matrix[13] = this.Y * yScale;
    this.Matrix[14] = this.Z * cache.RootSpacing[2] -(0.001 * this.Level);
    this.Matrix[15] = 1.0;

    // These tiles share the same buffers.  Do not crop when there is no loop.
    this.TileVertexPositionBuffer = tileVertexPositionBuffer;
    this.TileVertexTextureCoordBuffer = tileVertexTextureCoordBuffer;
    this.CellBuffer = tileCellBuffer;
    //alert("Degenerate cache loop");
    return;
  }
  // Loop uses world coordniates so no matrix transformation is necessary.
  mat4.identity(this.Matrix);
  // Create the tile loop of image points.
  var tileDimensions = cache.TileDimensions;
  var rootSpacing = cache.RootSpacing;
  var p = (1 << this.Level);
  var size = [rootSpacing[0]*tileDimensions[0]/p, rootSpacing[1]*tileDimensions[1]/p];
  var bds = [size[0]*this.X, size[0]*(this.X+1), size[1]*this.Y, size[1]*(this.Y+1)];
  var tileLoop = [[bds[0],bds[2]], [bds[1],bds[2]], [bds[1],bds[3]], [bds[0],bds[3]]];
  // Iterate over the cache loop rays (center to loop point).
  for (var i = 0; i < cacheLoop.length; ++i) {
	  // Iterate over tileLoop edges.
    var j0 = tileLoop.length - 1;
    for (var j1 = 0; j1 < tileLoop.length; ++j1) {
      // Check for intersection.
      var intersection = this.FindIntersection(cacheLoopCenter.ImagePt, cacheLoop[i].ImagePt, 
                                               tileLoop[j0], tileLoop[j1]);
      if (intersection) { // Insert a new point (continue iterating).
        tileLoop.splice(j1, 0, intersection);
        ++j1; // Skip the point just inserted.
      }
      j0 = j1;
    }
  }
  // Now clip the tile loop with cacheLoop edges.
  // Iterate over the cache loop edges.
  var i0 = cacheLoop.length - 1;
  for (var i1 = 0; i1 < cacheLoop.length; ++i1) {
    var c0 = cacheLoop[i0].ImagePt;
    var c1 = cacheLoop[i1].ImagePt;
    // Iterate over the tile loop edges.
    var j0 = tileLoop.length - 1;
    if (j0 < 0) {
      // No points in loop (entirely clipped away).
      break;
    }
    var k0 = (tileLoop[j0][1]-c0[1])*(c1[0]-c0[0]) - (tileLoop[j0][0]-c0[0])*(c1[1]-c0[1]); 
    // Build a new tileLoop.
    var clippedTileLoop = [];
    for (var j1 = 0; j1 < tileLoop.length; ++j1) {
      var k1 = (tileLoop[j1][1]-c0[1])*(c1[0]-c0[0]) - (tileLoop[j1][0]-c0[0])*(c1[1]-c0[1]);
      // Check for intersecting edges (cache and tile).      
      if ((k0 < 0.0 && k1 > 0.0) || (k0 > 0.0 && k1 < 0.0)) {
        // The tile edge crosses the cache edge. Add the intersection point.
        var k = -k0 / (k1-k0);
        clippedTileLoop.push([tileLoop[j0][0]+k*(tileLoop[j1][0]-tileLoop[j0][0]),
                              tileLoop[j0][1]+k*(tileLoop[j1][1]-tileLoop[j0][1])]);
      }
      // Check if the tile point is inside the cache loop (one edge).
      if (k1 >= 0.0) { 
        // The point is inside the cache edge.  Keep it.
        clippedTileLoop.push(tileLoop[j1]);
      }
      k0 = k1;
      j0 = j1;
    }
    tileLoop = clippedTileLoop;
    clippedTileLoop = [];
    i0 = i1;
  }
  // Create a tile center (cache center is usually not in the tile loop).
  // Just average all loop points. Assume the tile loop is convex.
  if (tileLoop.length) { // empty loops do not need a center.
    tileCenter = [0.0, 0.0];
    for (var j = 0; j < tileLoop.length; ++j) {
      tileCenter[0] += tileLoop[j][0];
      tileCenter[1] += tileLoop[j][1];
    }
    tileCenter[0] = tileCenter[0] / tileLoop.length;
    tileCenter[1] = tileCenter[1] / tileLoop.length;
    // Add the center to the end of the loop for easier processing.
    tileLoop.push(tileCenter); // draw setup to render a loop (not triangles).
  }
  // Convert the image points to world points.
  // Also create the texture coordinates.
  var vertexPositionData = [];
  var tCoordsData = [];
  for (var j = 0; j < tileLoop.length; ++j) {
    var worldPoint = cache.ImageToWorld(tileLoop[j]);
    vertexPositionData.push(worldPoint[0]);
    vertexPositionData.push(worldPoint[1]);
    vertexPositionData.push(0.0);
    var x = (tileLoop[j][0]-bds[0]) / (bds[1]-bds[0]);
    var y = (tileLoop[j][1]-bds[2]) / (bds[3]-bds[2]);
    tCoordsData.push(x);
    tCoordsData.push(y);
  }  
  this.TileVertexTextureCoordBuffer = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, this.TileVertexTextureCoordBuffer);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(tCoordsData), GL.STATIC_DRAW);
  this.TileVertexTextureCoordBuffer.itemSize = 2;
  this.TileVertexTextureCoordBuffer.numItems = tCoordsData.length / 2;
  
  this.TileVertexPositionBuffer = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, this.TileVertexPositionBuffer);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertexPositionData), GL.STATIC_DRAW);
  this.TileVertexPositionBuffer.itemSize = 3;
  this.TileVertexPositionBuffer.numItems = vertexPositionData.length / 3;

  // Now create the triangle wedges.
  var cellData = [];
  var centerId = tileLoop.length - 1;
  var i0 = centerId - 1;
  for (var i1 = 0; i1 < centerId; ++i1) {
    cellData.push(i0);
    cellData.push(i1);
    cellData.push(centerId);
    i0 = i1;
  }
  this.CellBuffer = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.CellBuffer);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(cellData), GL.STATIC_DRAW);
  this.CellBuffer.itemSize = 1;
  this.CellBuffer.numItems = cellData.length;
}

/* Was for croping a rectangle.  Loops now crop all we need.
Tile.prototype.Crop = function (imageDims, tileDimensions, rootSpacing) {
  var p = (1 << this.Level);
  var size = [rootSpacing[0]*tileDimensions[0]/p, rootSpacing[1]*tileDimensions[1]/p];
  var bds = [size[0]*this.X, size[0]*(this.X+1), size[1]*this.Y, size[1]*(this.Y+1)];

  // Only the maximum bounds will crop a tile.
  if (bds[1] > imageDims[0] || bds[3] > imageDims[1]) {
    // Create cropped buffers.
    var vertexPositionData = [];
    var textureCoordData = [];

    var xSize = (imageDims[0]-bds[0])/(bds[1]-bds[0]);
    var ySize = (imageDims[1]-bds[2])/(bds[3]-bds[2]);
    if (xSize > 1.0) { xSize = 1.0;}
    if (ySize > 1.0) { ySize = 1.0;}
    
    // Make 4 points
    textureCoordData.push(0.0);
    textureCoordData.push(0.0);
    vertexPositionData.push(0.0);
    vertexPositionData.push(0.0);
    vertexPositionData.push(0.0);
    
    textureCoordData.push(xSize);
    textureCoordData.push(0.0);
    vertexPositionData.push(xSize);
    vertexPositionData.push(0.0);
    vertexPositionData.push(0.0);
    
    textureCoordData.push(0.0);
    textureCoordData.push(ySize);
    vertexPositionData.push(0.0);
    vertexPositionData.push(ySize);
    vertexPositionData.push(0.0);
    
    textureCoordData.push(xSize);
    textureCoordData.push(ySize);
    vertexPositionData.push(xSize);
    vertexPositionData.push(ySize);
    vertexPositionData.push(0.0);
    
    this.TileVertexTextureCoordBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.TileVertexTextureCoordBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(textureCoordData), GL.STATIC_DRAW);
    this.TileVertexTextureCoordBuffer.itemSize = 2;
    this.TileVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;
    
    this.TileVertexPositionBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.TileVertexPositionBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertexPositionData), GL.STATIC_DRAW);
    this.TileVertexPositionBuffer.itemSize = 3;
    this.TileVertexPositionBuffer.numItems = vertexPositionData.length / 3;    
  }
}
*/

// This starts the loading of the tile.
// Loading is asynchronous, so the tile will not 
// immediately change its state.
Tile.prototype.StartLoad = function (cache) {
  if (this.Texture != null) {
    return;
  }

  var imageSrc = cache.GetSource() + this.Name + ".jpg"; 

  this.Texture = GL.createTexture();
  // Reusing the image caused problems.
  //if (this.Image == null) {
    this.Image = new Image();
    var callback = new LoadTileCallback(this, cache);
    this.Image.onload = GetLoadTextureFunction(callback); 
    this.Image.onerror = GetErrorTextureFunction(callback); 
  //}
  // This starts the loading.
  this.Image.src = imageSrc;
};


Tile.prototype.Draw = function (program) {
  // Load state 0 is: Not loaded and not scheduled to be loaded yet.
  // Load state 1 is: not loaded but in the load queue.
  if ( this.LoadState != 3) {
    // The tile is not available.
    // render the lower resolution tile as a place holder.
    if (this.Parent) {
	    this.Parent.Draw(program);
    }
    // Keep rendering until all nodes are available.
    eventuallyRender();
    return;
  }
    
  // These are the same for every tile.
  // Vertex points (shifted by tiles matrix)
  GL.bindBuffer(GL.ARRAY_BUFFER, this.TileVertexPositionBuffer);
  // Needed for outline ??? For some reason, DrawOutline did not work
  // without this call first.
  GL.vertexAttribPointer(program.vertexPositionAttribute, 
                         this.TileVertexPositionBuffer.itemSize, 
                         GL.FLOAT, false, 0, 0);     // Texture coordinates
  GL.bindBuffer(GL.ARRAY_BUFFER, this.TileVertexTextureCoordBuffer);
  GL.vertexAttribPointer(program.textureCoordAttribute, 
                         this.TileVertexTextureCoordBuffer.itemSize, 
                         GL.FLOAT, false, 0, 0);
  // Cell Connectivity
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.CellBuffer);

  // Texture
  GL.activeTexture(GL.TEXTURE0);
  GL.bindTexture(GL.TEXTURE_2D, this.Texture);

  GL.uniform1i(program.samplerUniform, 0);
  // Matrix that tranforms the vertex p
  GL.uniformMatrix4fv(program.mvMatrixUniform, false, this.Matrix);

  GL.drawElements(GL.TRIANGLES, this.CellBuffer.numItems, GL.UNSIGNED_SHORT, 0);
}


Tile.prototype.HandleLoadedTexture = function (cache) {
  var texture = this.Texture;
  //alert(tile);
  GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
  GL.bindTexture(GL.TEXTURE_2D, texture);
  GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.Image);
  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
  GL.bindTexture(GL.TEXTURE_2D, null);
  // There is an issue: Tiles call this method when their image gets loaded.
  // How does the tile know which cache it belongs too.
  cache.LoadQueueLoaded(this);
}






