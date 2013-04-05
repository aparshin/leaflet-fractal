


L.TileLayer.FractalLayer = L.TileLayer.Canvas.extend({
	options: {
		async: true
	},
	initialize: function () {
        var workerFunc = function(data,cb) {
    var id = data.id;
    
    var scale = Math.pow(2, data.z - 1);
    var x0 = data.x / scale - 1;
    var y0 = data.y / scale - 1;
    
    var d = 1/(256*scale);
    var pixels = [];var MAX_ITER=500;
    
    for (var py = 0; py < 256; py++) {
        for (var px = 0; px < 256; px++) {
        
            var cx = x0 + px*d;
            var cy = y0 + py*d;
        
            var x = 0, y = 0;
            var xn, yn;
            
            var isOut = false;
            
            for (var iter = 0; iter < MAX_ITER; iter++) {
                xn = x*x - y*y + cx;
                yn = 2*x*y + cy;
                
                if (xn*xn + yn*yn > 4) {
                    isOut = true;
                    break;
                }
                
                x = xn;
                y = yn;
            }
            
            var c = (iter/MAX_ITER)*255;
            
            pixels.push(0);
            pixels.push(c);
            pixels.push(0);
            pixels.push(255);
        }
    }
    
    var array = new Uint8ClampedArray(pixels);
    var buf = array.buffer;
	cb({id: id, pixels: buf},[buf]);
    
}
		var _this = this;
        
		this._worker = communist(workerFunc)
        this._messages = [];
        this._waitingMessage = null;
        
		this.cb= function(data) {
            var msg = _this._waitingMessage;
            console.log(data);
            msg.callback(new Uint8ClampedArray(data.pixels), msg.date);
            _this._waitingMessage = null;
            _this._postNextMessage();
		}
        
        this.on("tileunload", function(e) {
            var pos = e.tile._tileIndex,
                id = [pos.x, pos.y, pos.z].join(':');
                
            _this._messages.forEach(function(msg) {
                if (msg.id === id) {
                    msg.cancelled = true;
                }
            });
        })
	},
    _postNextMessage: function() {
        if (this._waitingMessage) return;
        while (this._messages.length) {
            var msg = this._messages.shift();
            
            if (msg.cancelled) {
                continue;
            }
            var _this = this;
            this._waitingMessage = msg;
            this._worker.data({id: msg.id, x: msg.x, y: msg.y, z: msg.z}).then(function(a){console.log("got it");_this.cb(a);},function(a){console.log("oh shit "+a)});
            break;
        }
    },
	_addMessage: function(callback, x, y, z) {
		var id = x + ':' + y + ':' + z;
		this._messages.push({x: x, y: y, z: z, id: id, callback: callback, date: new Date()});
        this._postNextMessage();
	},
    
	drawTile: function (canvas, tilePoint) {
        var _this = this,
            z = this._map.getZoom();
            
        canvas._tileIndex = {x: tilePoint.x, y: tilePoint.y, z: z};
		
		this._addMessage(function(array, date) {
            var ctx = canvas.getContext('2d');
            var imagedata = ctx.getImageData(0, 0, 256, 256);
			imagedata.data.set(array);
			ctx.putImageData(imagedata, 0, 0);
            _this.tileDrawn(canvas);
		}, tilePoint.x, tilePoint.y, z);
	}
});

L.TileLayer.boundaryCanvas = function (url, options) {
	return new L.TileLayer.BoundaryCanvas(url, options);
};
