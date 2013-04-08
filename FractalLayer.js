L.TileLayer.FractalLayer = L.TileLayer.Canvas.extend({
	options: {
		async: true,
		maxZoom:23,
        continuousWorld:true
	},
	initialize: function (workers,fractalType) {
        this.fractalType = fractalType||"mandlebrot";
		this.workers=workers;
		this._workers = new Array(this.workers);
        this.messages={};
        
	},
    onAdd:function(map){
        var _this=this;
    	var i = 0;
		while(i<this.workers){
		    this._workers[i]=new Worker("workers/"+this.fractalType+".js");
            this._workers[i].onmessage=function(e) {
        var canvas;
        if(e.data.id in _this.messages){
            canvas = _this.messages[e.data.id];
        }else{
            return;
        }
        	var array=new Uint8ClampedArray(e.data.pixels);
			var ctx = canvas.getContext('2d');
			var imagedata = ctx.getImageData(0, 0, 256, 256);
			imagedata.data.set(array);
			ctx.putImageData(imagedata, 0, 0);
			_this.tileDrawn(canvas);
		};
		    i++;
		}
        this.on("tileunload", function(e) {
            var pos = e.tile._tileIndex,
                id = [pos.x, pos.y, pos.z].join(':');
                if(id in _this.messages){
                    delete _this.messages[id];
                }
        });
       return L.TileLayer.Canvas.prototype.onAdd.call(this,map);
    },
    onRemove:function(map){
        this.messages={};
        var len = this._workers.length;
    var i =0;
	while(i<len){
	this._workers[i].terminate();
	i++;
	}
	return L.TileLayer.Canvas.prototype.onRemove.call(this,map);
    },
	drawTile: function (canvas, tilePoint) {
		var z = this._map.getZoom();
		canvas._tileIndex = {x: tilePoint.x, y: tilePoint.y, z: z};
        var tileID=tilePoint.x+":"+tilePoint.y+":"+z;
        this.messages[tileID]=canvas;
		this._workers[parseInt((Math.random()*this.workers),10)].postMessage({x: tilePoint.x, y:tilePoint.y, z: z,id:tileID});
	}
});
L.tileLayer.fractalLayer=function(workers,t){
	return new L.TileLayer.FractalLayer(workers,t);
}
