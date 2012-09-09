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
  //this is just for debugging
  //this.Id = x + (y<<level)
  //
  this.X = x;
  this.Y = y;
  this.Level = level;
  this.Children = []; 
  this.Parent = null;
  this.LoadState = 0;
  var xScale = cache.TileDimensions[0] * cache.RootSpacing[0] / (1 << level);
  var yScale = cache.TileDimensions[1] * cache.RootSpacing[1] / (1 << level);
  this.Matrix = mat4.create();
  this.Matrix[0] = xScale;
  this.Matrix[5] = yScale;
  this.Matrix[12] = x * xScale;
  this.Matrix[13] = y * yScale;
  this.Matrix[14] = z * cache.RootSpacing[2] -(0.001 * this.Level);
  this.Matrix[15] = 1.0;
  this.Name = name;
  this.Texture = null;
  this.TimeStamp = TIME_STAMP;
  this.BranchTimeStamp = TIME_STAMP;
  ++cache.NumberOfTiles;

  // Most tiles share the same buffers.  Tiles cropped
  // boy the boundary need their own unique buffers.
  // Some tiles need to be cropped to maintain bounds.
  this.TileVertexPositionBuffer = tileVertexPositionBuffer;
  this.TileVertexTextureCoordBuffer = tileVertexTextureCoordBuffer;
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
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, tileCellBuffer);

  // Texture
  GL.activeTexture(GL.TEXTURE0);
  GL.bindTexture(GL.TEXTURE_2D, this.Texture);

  GL.uniform1i(program.samplerUniform, 0);
  // Matrix that tranforms the vertex p
  GL.uniformMatrix4fv(program.mvMatrixUniform, false, this.Matrix);

  GL.drawElements(GL.TRIANGLES, tileCellBuffer.numItems, GL.UNSIGNED_SHORT, 0);
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






