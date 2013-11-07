// represents the grid, updates cells states and draws
function Automaton(canvas, w, h, unit, renderOptions) {
  this.w = w;
  this.h = h;
  //cell size in pixels
  this.unit = unit || 10;
  this.grid = [];
  this.liveCells = [];
  this.lastLiveCellNum = 0;
  this.maxPopulation = 0;
  this.renderer = new Renderer(canvas, this, renderOptions);
  
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
	//Tow tracerseGrid, one for flag cells
    return this.traverseGrid(function(cell, x, y) {
      cell.flagYourselfForDeathMaybe();
    })
	//Second for actual kill or revive
	.traverseGrid(function(cell, x, y) {
      cell.update();
	  /*
	  if (cell.flaggedForDeath) {
        cell.kill().flaggedForDeath = false;
      } else if (!cell.alive && cell.flaggedForRevive) {
        cell.revive().flaggedForRevive = false;
      }*/
    });
  },
  draw: function() {
    this.renderer.clear();
    return this.traverseGrid(function(cell, x, y) {
      this.renderer.draw(cell);
    });
  },
  liveCellCount: function() {
    this.lastLiveCellNum = this.liveCellNum; 
    this.liveCellNum = 0;
    this.traverseGrid(function(cell, x, y) {
      if (cell.alive) this.liveCellNum++;
    });
    return this.liveCellNum;
  },
  evolving: function() {
    return this.lastLiveCellNum != this.liveCellNum;
  },
  getOldestCell: function() {
    var cells = this.getLiveCells();
    
    for (var i = 0, len = cells.length; i < len; i++) {
      var cell = cells[i],
          age = this.oldestCell ? this.oldestCell.age : 0;
      if (cell.age > age) this.oldestCell = cell;
    }
    return this.oldestCell || {age:0};
  },
  getMaxPopulation: function(liveCellCount) {
    return this.maxPopulation = (liveCellCount > this.maxPopulation) ? liveCellCount : this.maxPopulation;
  },
  // find a cell by the collision of a click with a cell on the coordinate space
  getCell: function(x, y) {
    return this.grid[x][y];
  },
  getLiveCells: function() {
    this.liveCells = [];
    this.traverseGrid(function(cell, x, y) {
      if (cell.alive) this.liveCells.push(cell);
    });
    return this.liveCells;
  },
  getStats: function(cellCount) {
    var oldestCell = this.getOldestCell();
    return { 
      liveCellCount: cellCount, 
      maxPopulation: this.getMaxPopulation(cellCount),
      oldestCell:    oldestCell.age + ' <code>{x: '+ oldestCell.x +', y:'+ oldestCell.y +'}</code>',
      evolving:      this.evolving() ? 'Evolving' : 'Stabilized'
    }
  },
}