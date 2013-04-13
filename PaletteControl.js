var PaletteControl = L.Control.extend({
    options: {
        initPalette: 'hsv'
    },
    initialize: function(fractalLayers, options) {
        L.setOptions(this, options);
        this._fractalLayers = fractalLayers;
    },

    onAdd: function (map) {
        // create the control container with a particular class name
        var container = L.DomUtil.create('div', 'leaflet-control-layers leaflet-control-layers-expanded');
        var _this = this;
        
        var title = document.createElement('span');
		title.innerHTML = 'Palette ';

        var buttonsContainer = L.DomUtil.create('div', 'fractal-palette-buttons');
        
        this._buttons = [];
        
        paletteController.forEach(function(paletteName) {
            var paletteButton = L.DomUtil.create('button', 'fractal-palette-button', buttonsContainer);
            paletteButton.innerHTML = paletteName;
            paletteButton.paletteName = paletteName;
            
            _this._buttons.push(paletteButton);
            
            L.DomEvent.on(paletteButton, 'click', function() {
                _this._update(this.paletteName);
            });
        })
        
        this._update(this.options.initPalette);
        
		container.appendChild(title);
        container.appendChild(buttonsContainer);

        return container;
    },
    
    _update: function(activePaletteName) {
        this._buttons.forEach(function(button) {
            if (button.paletteName !== activePaletteName) {
                L.DomUtil.removeClass(button, 'fractal-palette-button-active');
            } else  {
                L.DomUtil.addClass(button, 'fractal-palette-button-active');
            }
        })
        
        for (var l in this._fractalLayers) {
            this._fractalLayers[l].setPalette(activePaletteName);
        }
    }
});