L.TileLayer.FractalLayer = L.TileLayer.Canvas.extend({
	options: {
		async: true
	},
	initialize: function () {
        
		var _this = this;
        
		this._worker = new Worker('FractalRenderingWorker.js');
        this._messages = [];
        this._waitingMessage = null;
        
		this._worker.addEventListener('message', function(e) {
            var msg = _this._waitingMessage;
            //console.log('received', msg.id, _this._messages.length);
            msg.callback(new Uint8ClampedArray(e.data.pixels), msg.date);
            _this._waitingMessage = null;
            _this._postNextMessage();
		}, false);
        
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
            
            this._waitingMessage = msg;
            this._worker.postMessage({id: msg.id, x: msg.x, y: msg.y, z: msg.z});
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