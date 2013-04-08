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
        this.queue={total:workers};
	},
    onAdd:function(map){
        var _this=this;
    	var i = 0;
        var next;
        this.queue.free=[];
        this.queue.len =0;
        this.queue.tiles=[];
    	while(i<this.workers){
            this.queue.free.push(i);
		    this._workers[i]=new Worker("workers/"+this.fractalType+".js");
            this._workers[i].onmessage=function(e) {
        var canvas;
        if(_this.queue.len){
            _this.queue.len--;
            next = _this.queue.tiles.shift();
            _this.renderTile(next[0],next[1],e.data.workerID);
        }else{
            _this.queue.free.push(e.data.workerID);
        }
        if(e.data.tileID in _this.messages){
            canvas = _this.messages[e.data.tileID];
        }else{
            return;
        }
        console.log(e.data.workerID+ " out "+e.data.tileID);
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
            if(e.tile._tileIndex){
            var pos = e.tile._tileIndex,
                tileID = [pos.x, pos.y, pos.z].join(':');
                if(tileID in _this.messages){
                    delete _this.messages[tileID];
                }
        }});
         map.on("zoomstart",function(){
        this.queue.len =0;
        this.queue.tiles=[];
    },this);
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
        if(!this.queue.free.length){
            this.queue.tiles.push([canvas,tilePoint]);
            this.queue.len++;
        }else{
		
        this.renderTile(canvas, tilePoint,this.queue.free.pop());
		
	}
	},
    renderTile: function (canvas, tilePoint,workerID) {
        var z = this._map.getZoom();
    	canvas._tileIndex = {x: tilePoint.x, y: tilePoint.y, z: z};
        var tileID=tilePoint.x+":"+tilePoint.y+":"+z;
        this.messages[tileID]=canvas;
        this._workers[workerID].postMessage({x: tilePoint.x, y:tilePoint.y, z: z,tileID:tileID,workerID:workerID});
        console.log(workerID + " in "+tileID);
    }
});
L.tileLayer.fractalLayer=function(workers,t){
	return new L.TileLayer.FractalLayer(workers,t);
}
