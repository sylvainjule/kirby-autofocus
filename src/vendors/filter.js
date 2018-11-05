export default function Filter(matrix) {
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