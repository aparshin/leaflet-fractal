L.TileLayer.FractalLayer = L.TileLayer.Canvas.extend({
	options: {
		async: true
	},
	initialize: function () {
		var workerFunc = function(data,cb) {
			var scale = Math.pow(2, data.z - 1);
			var x0 = data.x / scale - 1;
			var y0 = data.y / scale - 1;
			var d = 1/(scale<<8);
			var pixels = [];
			var MAX_ITER=500;
			var isOut,c,cx,cy,x,y,xn,yn;
			for (var py = 0; py < 256; py++) {
				for (var px = 0; px < 256; px++) {
					cx = x0 + px*d;
					cy = y0 + py*d;
					x = 0; y = 0;
					for (var iter = 0; iter < MAX_ITER; iter++) {
						xn = x*x - y*y + cx;
						yn = ((x*y)*2) + cy;
						if (xn*xn + yn*yn > 4) {
							break;
						}
						x = xn;
						y = yn;
					}
				c = (iter/MAX_ITER)*360;
				(function(h){
					//from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
					var s = 0.75, v = 0.75;
					var rgb, i, data = [];
					if (s === 0) {
						rgb = [v,v,v];
					} else {
						h = h / 60;
						i = Math.floor(h);
						data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
						switch(i) {
							case 0:
								rgb = [v, data[2], data[0]];
								break;
							case 1:
								rgb = [data[1], v, data[0]];
								break;
							case 2:
								rgb = [data[0], v, data[2]];
								break;
							case 3:
								rgb = [data[0], data[1], v];
								break;
							case 4:
								rgb = [data[2], data[0], v];
								break;
							default:
								rgb = [v, data[0], data[1]];
								break;
						}
						pixels.push(rgb[0]*255);
						pixels.push(rgb[1]*255);
						pixels.push(rgb[2]*255);
						pixels.push(255);
					}
				})(c)
				}
			}
			var array = new Uint8ClampedArray(pixels);
 			var buf = array.buffer;
			cb({pixels: buf},[buf]);
		}
		var _this = this;
		this._worker = communist(workerFunc)
	},
	drawTile: function (canvas, tilePoint) {
		var _this = this,
		z = this._map.getZoom();
		canvas._tileIndex = {x: tilePoint.x, y: tilePoint.y, z: z};
		this._worker.data({x: tilePoint.x, y:tilePoint.y, z: z}).then(function(data) {
			var array=new Uint8ClampedArray(data.pixels);
			var ctx = canvas.getContext('2d');
			var imagedata = ctx.getImageData(0, 0, 256, 256);
			imagedata.data.set(array);
			ctx.putImageData(imagedata, 0, 0);
			_this.tileDrawn(canvas);
		});
	}
});
L.tileLayer.fractalLayer=function(){
	return new L.TileLayer.FractalLayer();
}
