importScripts("../colors.js");
var workerFunc = function(data,cb) {
    		var scale = Math.pow(2, data.z - 1);
			var x0 = data.x / scale - 1;
			var y0 = data.y / scale - 1;
			var d = 1/(scale<<8);
			var pixels = new Array(262144);
			var MAX_ITER=data.maxIter;
			var isOut,c,cx,cy,x,y,xn,yn,iii=0;
			for (var py = 0; py < 256; py++) {
				for (var px = 0; px < 256; px++) {
					cx = x0 + px*d;
					cy = y0 + py*d;
					x = 0; y = 0;
					isOut=0;
					for (var iter = 0; iter < MAX_ITER; iter++) {
						xn=Math.pow(x,3)-3*x*Math.pow(y,2) + cx;
    				yn=3*Math.pow(x,2)*y-Math.pow(y,3) + cy;
						if (xn*xn + yn*yn > 4) {
							isOut=0.75;
							break;
						}
						x = xn;
						y = yn;
					}
				    c = Math.floor((iter/MAX_ITER)*360);
                    pixels[iii++]=colors[c][0];
					pixels[iii++]=colors[c][1];
						pixels[iii++]=colors[c][2];
						pixels[iii++]=255;
				}
			}
			var array = new Uint8ClampedArray(pixels);
 	    data.pixels = array.buffer;
    		cb(data,[data.pixels]);
		}
function callBack(a,b){
    self.postMessage(a,b);
}
self.onmessage=function(e){
    workerFunc(e.data,callBack);
};