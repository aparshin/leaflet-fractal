var paletteController = {
    //each generator receives index from 0 to 1 and return RGBA values (as array of 4 numbers 0<= x <= 255)
    _paletteGenerators: {
        'hsv': function(colorIndex) {
            var h = colorIndex * 360;
            var s = (1 - colorIndex < 1e-2) ? 0 : 0.75;
            //from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
            var v = 0.75*255;
            var vi = Math.floor(v);
            var rgb, i, data = [];
            if (s === 0) {
                rgb = [Math.floor(0.75*255), Math.floor(0.1875*255), Math.floor(0.75*255)];
            } else {
                h = h / 60;
                i = Math.floor(h);
                data = [Math.floor(v*(1-s)), Math.floor(v*(1-s*(h-i))), Math.floor(v*(1-s*(1-(h-i))))];
                switch(i) {
                    case 0:
                        rgb = [vi, data[2], data[0]];
                        break;
                    case 1:
                        rgb = [data[1], vi, data[0]];
                        break;
                    case 2:
                        rgb = [data[0], vi, data[2]];
                        break;
                    case 3:
                        rgb = [data[0], data[1], vi];
                        break;
                    case 4:
                        rgb = [data[2], data[0], vi];
                        break;
                    default:
                        rgb = [vi, data[0], data[1]];
                        break;
                }
            }
            rgb[3] = 255;
            return rgb;
        },
        'green': function(colorIndex) {
            return [0, Math.floor(colorIndex * 255), 0, 255]
        }
    },
    addPalette: function(paletteName, paletteGenerator) {
        this._paletteGenerators[paletteName] = paletteGenerator;
    },
    getPaletteAsBuffer: function(paletteName, numIndexes) {
        if (!(paletteName in this._paletteGenerators)) {
            return;
        }
        
        var generator = this._paletteGenerators[paletteName];
        
        var res = new Array(numIndexes+1);
        
        
        for (var c = 0; c < numIndexes+1; c++) {
            var color = generator(c / numIndexes);
            res[c] = color[0] + (color[1]<<8) + (color[2]<<16) + (color[3]<<24);
        }
        
        return (new Uint32Array(res)).buffer;
    },
    forEach: function(callback) {
        for (var p in this._paletteGenerators) {
            callback(p);
        }
    }
}