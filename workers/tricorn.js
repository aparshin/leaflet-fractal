var workerFunc = function(data,cb) {
    		var scale = Math.pow(2, data.z - 1);
			var x0 = data.x / scale - 1;
			var y0 = data.y / scale - 1;
			var d = 1/(scale<<8);
			var pixels = new Array(262144);
			var MAX_ITER=500;
			var isOut,c,cx,cy,x,y,xn,yn,iii=0;
			for (var py = 0; py < 256; py++) {
				for (var px = 0; px < 256; px++) {
					cx = x0 + px*d;
					cy = y0 + py*d;
					x = 0; y = 0;
					isOut=0;
					for (var iter = 0; iter < MAX_ITER; iter++) {
					xn =  x*x - y*y - cx;
    				yn =(x+x)*(-y) + cy;
						if (xn*xn + yn*yn > 4) {
							isOut=0.75;
							break;
						}
						x = xn;
						y = yn;
					}
				c = (iter/MAX_ITER)*360;
				(function(h,s){
					//from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
					var v = 0.75;
					var rgb, i, data = [];
					if (s === 0) {
						rgb = [0.75, 0.1875, 0.75];
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
						}}
						pixels[iii++]=(rgb[0]*255);
						pixels[iii++]=(rgb[1]*255);
						pixels[iii++]=(rgb[2]*255);
						pixels[iii++]=(255);
					
				})(c,c===360?0:0.75)
				}
			}
			var array = new Uint8ClampedArray(pixels);
 			var buf = array.buffer;
			cb({pixels: buf,id:data.id},[buf]);
		}
function callBack(a,b){
    self.postMessage(a,b);
}
self.onmessage=function(e){
    workerFunc(e.data,callBack);
};