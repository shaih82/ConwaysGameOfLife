// represents the grid, updates cells states and draws
function Automaton(canvas, w, h, unit, renderOptions) {
  this.w = w;
  this.h = h;
  //cell size in pixels
  this.unit = unit || 10;
  this.grid = [];
  this.renderer = new Renderer(canvas, this, renderOptions);
  this.totalSick = 0;
  this.totalHealthy = 0;
  // build grid and add cells to it (all dead)
  this.traverseGrid(function(cell, x, y) {
    this.grid[x][y] = new Cell(x, y, this);    
  }, function(x) { // this callback runs first
    this.grid[x] = [];
  });
}

// helps us find a cell's neighbors
Automaton.wheres = ['aboveLeft', 'above', 'aboveRight', 'right', 'belowRight', 'below', 'belowLeft', 'left'];
Automaton.adjust = {
  'aboveLeft':  { x: -1, y: -1 },
  'above':      { x:  0, y: -1 },    
  'aboveRight': { x:  1, y: -1 },
  'right':      { x:  1, y:  0 },
  'belowRight': { x:  1, y:  1 },    
  'below':      { x:  0, y:  1 },
  'belowLeft':  { x: -1, y:  1 },
  'left':       { x: -1, y:  0 }
}

Automaton.prototype = {
  traverseGrid: function(yCallback, xCallback) {
    for (var x = 0; x < this.w; x++) {
      if (typeof xCallback == 'function') 
        xCallback.call(this, x);
      for (var y = 0; y < this.h; y++)
        yCallback.call(this, this.grid[x][y], x, y);
    }
    return this;
  },
  updateOptions: function(io) {
    this.w = io.w;
    this.h = io.h;
    this.unit = io.unit;
    this.renderer.updateOptions(this, io);
    this.draw();
  },
  update: function() {
	var totalHealthy = 0.0,
	       totalSick = 0.0;
    this.totalHealthy =0;
    this.totalSick = 0; 
	//Tow tracerseGrid, one for flag cells
    return this.traverseGrid(function(cell, x, y) {
      cell.flagStep();
    })
	//Second for actual kill or revive
	.traverseGrid(function(cell, x, y) {
      cell.updateStep();
	  this.totalHealthy += (cell.sens + cell.immune);
	  this.totalSick += (cell.sick + cell.cont);
    });
	return this;
  },
  draw: function() {
    this.renderer.clear();
    return this.traverseGrid(function(cell, x, y) {
      this.renderer.draw(cell);
    });
  },
  // find a cell by the collision of a click with a cell on the coordinate space
  getCell: function(x, y) {
    return this.grid[x][y];
  },
  getStats: function(cellCount) {
    return { 
      sick: this.totalSick, 
      healthy: this.totalHealthy,
      evolving:      'Evolving' //: 'Stabilized'
    }
  },
}