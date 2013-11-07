// creates the gameloop and provides UI control of the automaton
function Anim(canvas_id) {
  var self = this;
  this.canvas    = $('#'+ canvas_id);
  this.playing   = false;
  this.io        = new IO(this).read();
  this.automaton = this.newAutomaton().draw();
  this.io.anim = this; // set at the end because io needs anim.automaton
}

Anim.prototype = {
  newAutomaton: function(preSeed) {
    return new Automaton(this.canvas, this.io.w, this.io.h, this.io.unit, this.io.renderOptions());
  },
  start: function() {
    var self = this, cellCount = 0;
    
    setTimeout(function() {
      self.automaton.update().draw();
      cellCount = self.automaton.liveCellCount();
      self.io.outputStats(self.automaton.getStats(cellCount, this.playing));
      if (cellCount < 3) return self.playing = false;
      if (self.playing) setTimeout(arguments.callee, 1000 / self.io.fps);
    }, 1000 / this.io.fps);
    
    this.playing = true;
    this.io.showClock(true).toggle.text('Pause (space)');
  },
  stop: function() {
    this.playing = false;
    this.io.showClock(false).toggle.text('Play (space)');
  },
  toggle: function() {
    this.io.read();
    this.playing ? this.stop() : this.start();
  },
  reset: function() {
    this.stop();
    this.io.read().resetClock();
    this.automaton = this.newAutomaton().draw();
    this.io.liveCellCount.text(this.automaton.liveCellCount());
  },
  clear: function() {
    this.stop();
    this.io.read().resetClock();
    this.automaton = this.newAutomaton([]).draw();
    this.io.liveCellCount.text(0);
    return this;
  },
  update: function() {
    this.io.read().resetClock();
    this.automaton.updateOptions(this.io);
    this.io.liveCellCount.text(this.automaton.liveCellCount());
  },
  mouseX: function() {
    return Math.floor((this.e.pageX - this.canvas.offset().left) / this.automaton.unit);
  },
  mouseY: function() {
    return Math.floor((this.e.pageY - this.canvas.offset().top) / this.automaton.unit);
  },
  toggleCell: function(e) {
    if (this.playing) { this.stop(); this.wasPlaying = true; }
    else this.wasPlaying = false;
    
    this.e = e;
    this.tracedCells = [this.automaton.getCell(this.mouseX(), this.mouseY())];
    
    var x = this.mouseX(),
        y = this.mouseY(),
        cell = this.automaton.getCell(x, y).toggle();
    
    this.automaton.draw();
    this.io.liveCellCount.text(this.automaton.liveCellCount());

    if (cell.alive) c_log(x, y);
    return this;
  },
  startCellTrace: function() {
    var self = this;
    
    this.canvas.mousemove(function(e) {
      self.e = e;
      var cell = self.automaton.getCell(self.mouseX(), self.mouseY());
      
      if (cell.notIn(self.tracedCells)) {
        cell.revive();
        self.tracedCells.push(cell);
        self.automaton.draw();
      }
    });
  },
  endCellTrace: function() {
    this.canvas.unbind('mousemove');
    this.io.liveCellCount.text(this.automaton.liveCellCount());
    if (this.wasPlaying) this.start();
  },
  center:    function()         { this.automaton.center(); },
  bindEvents: function() {
    var self = this;
    
    $(document).keydown(function(e) {
      var target = e.target.tagName.toLowerCase();
      if (target == 'input' || target == 'select') return true;
      var cmd = IO.codeMap[e.which];

      switch(cmd) {
        case 'spacebar': self.toggle(); break;
        case 's':        self.random(); break;
        case 'c':        self.clear(); break;
        case 'r':        self.reset(); break;
        case 'o':        self.center(); break;
        case 'v':        self.line(true); break;
        case 'h':        self.line(false); break;
        default: return true;
      }
      return false;
    });
    
    this.io.toggle.click(function() { self.playing ? self.stop() : self.start(); });
    $('button#reset').click(function() { self.reset(); });
    $('button#clear').click(function() { self.clear(); });
    $('select#preSeed').change(function() { self.preSeed(); });
    $('select#renderStyle').change(function() { self.update(); });
    $('form#update').submit(function() { self.update(); return false; });
    $('option').click(function() { $(this).parent().blur(); });
    
    // toggle individual cells by clicking and/or click dragging
    this.canvas.mousedown(function(e) {
      self.toggleCell(e, this).startCellTrace();
    }).mouseup(function(e) {
      self.endCellTrace();
    });
    return this;
  }
}