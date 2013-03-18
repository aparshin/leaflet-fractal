var MAX_ITER = 500;

//The following parameters are expected:
// * id - unique message identificator
// * x, y, z: tile index to generate picture for

// Return message has the folloing parameters:
// * id - same identificator
// * array - Uint8ClampedArray array with tile's data
self.addEventListener('message', function(e) {
    var id = e.data.id;
    
    var scale = Math.pow(2, e.data.z - 1);
    var x0 = e.data.x / scale - 1;
    var y0 = e.data.y / scale - 1;
    
    var d = 1/(256*scale);
    var pixels = [];
    
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
            
            var c = iter/MAX_ITER*255;
            
            pixels.push(0);
            pixels.push(c);
            pixels.push(0);
            pixels.push(255);
        }
    }
    
    var array = new Uint8ClampedArray(pixels);
    var buf = array.buffer;
	self.postMessage({id: id, pixels: buf},[buf]);
    
}, false);