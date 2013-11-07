function Cell(x, y, automaton) {
  var populationMean = 50;
  this.x = x;
  this.y = y;
  this.automaton = automaton;
  this.flaggedForDeath = false;
  this.flaggedForRevive = false;
  this.age = 0;
  
  this.population = populationMean + 5-Math.round(Math.random()*10)
  var rnd = []
  for(var i =0;i<4;i++){rnd[i] = Math.random()}
  rnd.sort()
  
  this.sens = rnd[0]/rnd[3];
  this.cont = (rnd[1]-rnd[0])/rnd[3];
  this.sick = (rnd[2]-rnd[1])/rnd[3];
  this.immune = (rnd[3]-rnd[2])/rnd[3];
}

Cell.prototype = {
  getColor: function(){
	
  },
  
  // this is where the magic happens
  flagYourselfForDeathMaybe: function(grid) {
    var num = this.numLiveNeighbors();

    if (this.alive) {
      // 1. Any live cell with fewer than two live neighbours dies, as if caused by under-population.
      if (num < 2) this.flaggedForDeath = true;
      // 2. Any live cell with two or three live neighbours lives on to the next generation.
      // so we do nothing here.
      // 3. Any live cell with more than three live neighbours dies, as if by overcrowding.
      else if (num > 3) this.flaggedForDeath = true;
    } else {
      // 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
      var r = 3;
      //if (cell.age) r = rand(3) < 3 ? 3 : 2;
      if (num == r) this.flaggedForRevive = true;
    }
  },
  numLiveNeighbors: function() {
    var liveNeighborsCount = 0;

    for (var i = 0; i < 8; i++) {
      var targetX = this.x + Automaton.adjust[Automaton.wheres[i]]['x'],
          targetY = this.y + Automaton.adjust[Automaton.wheres[i]]['y'],
          alive = false;

      if (this.automaton.grid[targetX] && this.automaton.grid[targetX][targetY])
        alive = this.automaton.grid[targetX][targetY].alive;
      if (alive) liveNeighborsCount++;
    }

    return liveNeighborsCount;
  },
  notIn: function(array) {
    for (var i = 0, len = array.length; i < len; i++) {
      var cell = array[i];
      if (this.x == cell.x && this.y == cell.y) return false;
    }
    return true;
  },
  lifeColor: function() { 
	//return Cell.lifeColors[this.numLiveNeighbors()]; 
	r = Math.floor((this.sick + this.cont)*255);
	g = Math.floor((this.sens)*255);
	b = Math.floor((this.immune)*255);
	return [r,g,b];
	},
  toggle:    function() { this.alive = !this.alive; return this; },
  revive:    function() { this.alive = true; return this; },
  kill:      function() { this.alive = false; this.age = 0; return this; }
}