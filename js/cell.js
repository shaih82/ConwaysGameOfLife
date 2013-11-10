function Cell(x, y, automaton) {
  var populationMean = 50;
  this.x = x;
  this.y = y;
  this.automaton = automaton;
  this.age = 0;
  
  //population equally distributed around populationMean
  this.population = populationMean + 5-Math.round(Math.random()*10);
  this.exposure = 0.1;//0.2 percent Math.round(0.2*this.population);
  this.nextState = {sens:0, cont:0, sick:0, immune:0 }; //The next state
  this.sens = 1.0;
  this.cont = 0.0;
  this.sick = 0.0;
  this.immune = 0.0;
  }

Cell.prototype = {
  random: function(){
	var rnd = [];
    for(var i =0;i<4;i++){rnd[i] = Math.random();}
    rnd.sort();
    this.sens = rnd[0]/rnd[3];
    this.cont = (rnd[1]-rnd[0])/rnd[3];
    this.sick = (rnd[2]-rnd[1])/rnd[3];
    this.immune = (rnd[3]-rnd[2])/rnd[3];
  },
  // this is where the magic happens
  flagStep: function() {
    var convToSick = 0,
	    convToCont = 0,
		convToSens = 0,
		convToImmune = 0;
    var neigborStat = this.diseaseStats();
    if(neigborStat.cont > 0.8 ){
	  convToSick = this.exposure*this.sens*0.5;
	  convToCont = this.exposure*this.sens*0.5;
	}
	else if(neigborStat.cont > 0.5 && 
			neigborStat.cont <= 0.8){
	  convToSick = this.exposure*this.sens*0.3;
	  convToCont = this.exposure*this.sens*0.3;
	}
	else if(neigborStat.cont > 0.2 && 
			neigborStat.cont <= 0.5){
	  convToSick = this.exposure*this.sens*0.2;
	  convToCont = this.exposure*this.sens*0.2;
	  convToImmune = this.exposure*this.sick*0.1+
					 this.exposure*this.cont*0.1;
	}
	else if(neigborStat.cont > 0 && 
			neigborStat.cont <= 0.2){
	  convToSick = this.exposure*this.sens*0.05;
	  convToCont = this.exposure*this.sens*0.05;
	  convToImmune = this.exposure*this.sick*0.1+
					 this.exposure*this.cont*0.1;
	}
	else { //cont == 0
	  convToImmune = this.exposure*this.sick*0.01+
					 this.exposure*this.cont*0.01;
	}

	this.nextState.sens = this.sens - (convToSick+convToCont);
	this.nextState.sick = this.sick + convToSick - convToImmune/2;
	this.nextState.cont = this.cont + convToCont - convToImmune/2;
	this.nextState.immune = this.immune + convToImmune;
	
  },
  updateStep: function(){
	this.sens = this.nextState.sens;
	this.sick = this.nextState.sick;
	this.cont = this.nextState.cont;
	this.immune = this.nextState.immune;
  },
  diseaseStats: function() {
	
    var stat = {sick:0,sens:0,cont:0,immune:0},
	    j=0;

    for (var i = 0; i < 8; i++) {
      var targetX = this.x + Automaton.adjust[Automaton.wheres[i]]['x'],
          targetY = this.y + Automaton.adjust[Automaton.wheres[i]]['y'];

      if (this.automaton.grid[targetX] && 
		  this.automaton.grid[targetX][targetY]){
		j++;
		stat['sens'] += this.automaton.grid[targetX][targetY].sens;
		stat['sick'] += this.automaton.grid[targetX][targetY].sick;
		stat['cont'] += this.automaton.grid[targetX][targetY].cont;
		stat['immune'] += this.automaton.grid[targetX][targetY].immune;
	  }
	  
    }
	stat['sens'] = stat['sens']/j;
    stat['sick'] = stat['sick']/j;
    stat['cont'] = stat['cont']/j
    stat['immune'] = stat['immune']/j;
	  
    return stat;
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