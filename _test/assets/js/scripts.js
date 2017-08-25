$(document).ready(function() {
    $('input[type=file]').on('change', function() {
      var files = this.files;

      var _url = window.location.href;
          _url = _url.replace('/edit', '');
          _url = _url.split('/').slice(-1)[0];

      // FileReader support
      if (FileReader && files && files.length) {
          var fr = new FileReader();

          for (var i = 0; i < files.length; i++) {
             var _file = files[i];

             fr.onload = function () {
                returnPos(fr.result);
            }
             fr.readAsDataURL(_file);
          }

      }
    });
});

var returnPos = function(file) {
	var canvas = $('#source')[0],
      ctx = canvas.getContext('2d'),
      img = new Image;
      img.src = file;

    img.onload = function(){
        var _w = img.width;
        var _h = img.height;
        canvas.width = _w;
        canvas.height = _h;

        ctx.drawImage(img, 0, 0);

        var _p = focus(canvas, { debug: true }),
        	_propX = _p.x / _w,
        	_propY = _p.y / _h,
        	_propX = (Math.round(_propX * 100)/100).toFixed(2),
        	_propY = (Math.round(_propY * 100)/100).toFixed(2),
        	_coordinates = '{"x":'+ _propX +',"y":'+ _propY +'}';

        console.log(_coordinates);
    }
}
    


var edges = [
  [0, -1, 0],
  [-1, 4, -1],
  [0, -1, 0]
];

function focus(canvas, options){
  options = options || {};
  var debug = options.debug;

  // setup
  var w = canvas.width;
  var h = canvas.height;
  var ctx = canvas.getContext('2d');
  var data = ctx.getImageData(0, 0, w, h);
  var res = ctx.createImageData(w, h);

  // edge detection
 Filter(edges)
    .width(w)
    .height(h)
    .apply(data, res);

  // edge debugging
  if (debug) {
    canvas.width *= 2;
    ctx.putImageData(res, 0, 0);
  }

  // single-pass
  var segs = segments(res.data, w, h);

  // segment debugging
  if (debug) {
    debugSegments(segs, ctx);
    ctx.translate(w, 0);
    ctx.putImageData(data, w, 0);
    debugSegments(segs, ctx);
  }


  return focalSegment(segs).midpoint();
}
// Draw debug segments.
function debugSegments(segs, ctx) {
  for (var i = 0; i < segs.length; ++i) segs[i].draw(ctx);
  focalSegment(segs).drawFocus(ctx);
}
// Return the most "intense" segment.
function focalSegment(segs) {
  var seg;
  var ret = segs[0];
  for (var i = 1; i < segs.length; ++i) {
    seg = segs[i];
    if (seg.intensity > ret.intensity) ret = seg;
  }
  return ret;
}
// Return segments for `data`
function segments(data, w, h){
  var segs = [];
  var size = 20;
  var hx = w / 2;
  var hy = h / 2;

  function factor(x, y) {
    x = Math.abs(x - hx) / hx;
    y = Math.abs(y - hy) / hy;
    x /= 2;
    y /= 2;
    return 1 - (x + y);
  }

  for (var x = 0; x < w; ++x) {
    for (var y = 0; y < h; ++y) {
      var focus = factor(x + size / 2, y + size / 2) * .15;
      var width = Math.min(w - x, size);
      var height = Math.min(h - y, size);
      var pixels = size * size;
      var sum = 0;

      for (var sx = 0; sx < width; ++sx) {
        for (var sy = 0; sy < height; ++sy) {
          var px = ((y + sy) * w + (x + sx)) * 4;
          var r = data[px + 0];
          var g = data[px + 1];
          var b = data[px + 2];
          var n = r + g + b;
          var intensity = n / 765;
          sum += intensity;
        }
      }

      focus += (sum / pixels) * .85;
      segs.push(new Segment(x, y, width, height, focus * 5));
      y += size;
    }
    x += size;
  }

  return segs;
};


/* Point
------------------------*/

function Point(x, y) {
  this.x = x;
  this.y = y;
}
Point.prototype.toString = function(){

  return '(' + this.x + ', ' + this.y + ')';
};


/* Segment
------------------------*/

function Segment(x, y, w, h, intensity) {
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

function Filter(matrix) {
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

/* File
-------------------------*/

function file(file) {
  return new File(file);
}
// Initialize a new `File` wrapper.
function File(file) {
  Emitter.call(this);
  // this.file = file;
  for (var key in file) this[key] = file[key];
}
//Inherits from `Emitter.prototype`.
Emitter(File.prototype);
// Check if the mime type matches `type`
File.prototype.is = function(type){
  var real = this.file.type;

  // identical
  if (type == real) return true;

  real = real.split('/');
  type = type.split('/');

  // type/*
  if (type[0] == real[0] && type[1] == '*') return true;

  // */subtype
  if (type[1] == real[1] && type[0] == '*') return true;

  return false;
};
// Convert to `type` and invoke `fn(err, result)`
File.prototype.to = function(type, fn){
  if (!window.FileReader) return fn();
  var reader = Reader();
  reader.on('error', fn);
  reader.on('end', function(res){ fn(null, res) });
  reader.read(this.file, type);
  return reader;
};
// Convert to an `ArrayBuffer`
File.prototype.toArrayBuffer = function(fn){

  return this.to('ArrayBuffer', fn);
};
// Convert to text.
File.prototype.toText = function(fn){

  // TODO: encoding
  return this.to('Text', fn);
};
// Convert to a data uri.
File.prototype.toDataURL = function(fn){

  return this.to('DataURL', fn);
};


/* Emitter
-------------------------*/

// Expose `Emitter`
if (typeof module !== 'undefined') {

  module.exports = Emitter;
}
// Initialize a new `Emitter`
function Emitter(obj) {

  if (obj) return mixin(obj);
}
// Mixin the emitter properties.
function mixin(obj) {
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

