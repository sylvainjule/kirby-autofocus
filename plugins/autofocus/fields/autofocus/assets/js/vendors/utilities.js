/* Edges
------------------------*/

var edges = [[0, -1, 0],[-1, 4, -1],[0, -1, 0]];


/* Point
------------------------*/

var Point = function(x, y) {
  this.x = x;
  this.y = y;
}
Point.prototype.toString = function(){

  return '(' + this.x + ', ' + this.y + ')';
};


/* Segment
------------------------*/

var Segment = function(x, y, w, h, intensity) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.intensity = intensity || 0;
}
Segment.prototype.midpoint = function(){
  return new Point(
    this.x + this.w / 2,
    this.y + this.h / 2);
};
Segment.prototype.draw = function(ctx){
  var n = 255 * this.intensity | 0;
  var rad = this.w / 2 * this.intensity;
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(' + n + ',0,0, .5)';
  ctx.arc(this.x + this.w / 2, this.y + this.h / 2, rad, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.restore();
};
Segment.prototype.drawFocus = function(ctx){
  var n = 255 * this.intensity | 0;
  var rad = this.w / 2 * this.intensity;
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(0,0,' + n + ', .5)';
  ctx.arc(this.x + this.w / 2, this.y + this.h / 2, rad, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.restore();
};


/* Filter
------------------------*/

var Filter = function(matrix) {
  if (!(this instanceof Filter)) return new Filter(matrix);
  if (!matrix) throw new TypeError('convolution matrix required');
  this.matrix = matrix;
  this.factor(1);
  this.bias(0);
}

Filter.prototype.width = function(n){
  this.w = n;
  return this;
};
Filter.prototype.height = function(n){
  this.h = n;
  return this;
};
Filter.prototype.factor = function(n){
  this._factor = n;
  return this;
};
Filter.prototype.bias = function(n){
  this._bias = n;
  return this;
};
Filter.prototype.apply = function(input, result){
  var data = input.data;
  var out = result.data;
  var width = this.w;
  var height = this.h;
  var matrix = this.matrix;
  var w = matrix[0].length;
  var h = matrix.length;
  var half = Math.floor(h / 2);
  var factor = this._factor;
  var bias = this._bias;

  for (var y = 0; y < height - 1; y++) {
    for (var x = 0; x < width - 1; x++) {
      var px = (y * width + x) * 4;
      var r = 0, g = 0, b = 0;

      for (var cy = 0; cy < w; ++cy) {
        for (var cx = 0; cx < h; ++cx) {
          var cpx = ((y + (cy - half)) * width + (x + (cx - half))) * 4;
          r += data[cpx + 0] * matrix[cy][cx];
          g += data[cpx + 1] * matrix[cy][cx];
          b += data[cpx + 2] * matrix[cy][cx];
        }
      }

      out[px + 0] = factor * r + bias;
      out[px + 1] = factor * g + bias;
      out[px + 2] = factor * b + bias;
      out[px + 3] = data[px + 3];
    }
  }
};
Filter.prototype.canvas = function(canvas){
  var w = canvas.width;
  var h = canvas.height;
  var ctx = canvas.getContext('2d');
  var data = ctx.getImageData(0, 0, w, h);
  var result = ctx.createImageData(w, h);
  this.width(w);
  this.height(h);
  this.apply(data, result);
  ctx.putImageData(result, 0, 0);
};


/* Emitter
-------------------------*/

// Expose `Emitter`
if (typeof module !== 'undefined') {

  module.exports = Emitter;
}
// Initialize a new `Emitter`
var Emitter = function(obj) {

  if (obj) return mixin(obj);
}
// Mixin the emitter properties.
var mixin = function(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}
// Listen on the given `event` with `fn`
Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};
//Adds an `event` listener that will be invoked a single time then automatically removed.
Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};
// Remove the given callback for `event` or all registered callbacks.
Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};
// Emit `event` with the given args.
Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};
// Return array of callbacks for `event`
Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};
//Check if this emitter has `event` handlers
Emitter.prototype.hasListeners = function(event){

  return !! this.listeners(event).length;
};