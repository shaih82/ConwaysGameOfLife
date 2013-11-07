// used by Automaton to render to canvas using different styles
function Renderer(canvas, automaton, options) {
  this.options = $.extend({ style: 'block' }, options);
  this.automaton = automaton;
  this.increment = 0;
  this.$canvas = canvas.attr({ width: automaton.w * automaton.unit +'px', height: automaton.h * automaton.unit +'px' });
  this.canvas = this.$canvas[0];
  
  if (this.canvas.getContext) 
    this.ctx = this.canvas.getContext('2d');
  else 
    return alert('OMG This browser like totally doesn\'t support Canvas. You should like upgrade and stuff.');
}

Renderer.prototype = {
  updateOptions: function(automaton, io) {
    this.automaton = automaton;
    this.$canvas.attr({ width: automaton.w * automaton.unit +'px', height: automaton.h * automaton.unit +'px' });
    this.options.style = io.renderStyle;
  },
  clear: function() {
    var ctx = this.ctx,
        u = this.automaton.unit,
        w = this.automaton.w * u,
        h = this.automaton.h * u;
    
    // clear the entire grid
    ctx.fillStyle = 'white';
    ctx.clearRect(0, 0, w * u, h * u);
    ctx.fill();
    ctx.beginPath();
    
    // draw vertical grid lines
    for (var x = 1; x < w; x += u) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    // draw horizontal grid lines
    for (var y = 1; y < h; y += u) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = .05;
    ctx.stroke();
    ctx.closePath();
  },
  draw: function(cell) {
    this.ctx.beginPath();
    this.styles['block'].call(this, cell, this.ctx, this.automaton.unit);
    this.ctx.closePath();
  },
  styles: {
    block: function(cell, ctx, unit) {
      var color = cell.lifeColor();
      
	  ctx.fillStyle = 'rgba('+ color[0] +', '+ color[1] +', '+ color[2] +', 1)';//'+ increment/3 +')';
	  ctx.fillRect(cell.x * unit, cell.y * unit, unit, unit);
  
      ctx.fill();
      ctx.stroke();
    }
  }
}