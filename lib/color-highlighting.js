var $ = require('atom');
$ = $.$;

module.exports = {
  activate: function(state) {
    var getValue = function(element, style) {
      return window.getComputedStyle(element).getPropertyValue(style);
    };

    var rgbStringToValues = function(rgb) {
      var sliceNum = 4;
      if (/rgba|hsla/.test(rgb)) {
        sliceNum = 5;
      }
      return rgb.slice(sliceNum).slice(0, -1).split(',').map(function(value) {
        return parseInt(value);
      });
    };

    var contrast = function(color) {
      var r = color[0];
      var g = color[1];
      var b = color[2];

      var yiq = ((r*299)+(g*587)+(b*114))/1000;
      return (yiq >= 128) ? '#000' : '#fff';
    };

    var applyColor = function() {
      // CSS hexa and rgb
        atom.workspaceView.find('.css.color, .rgb-value, .w3c-standard-color-name').each(function(i, el) {
            var colorType = $(this).prevAll('.support.function').text();
            if (colorType == 'rgb' || colorType == 'rgba') {
              el.style.backgroundColor = colorType + '(' + el.innerText + ')';
            } else {
              el.style.backgroundColor = el.innerText;
            }
            var backgroundColor = getValue(el, 'background-color');
            el.style.color = contrast(rgbStringToValues(backgroundColor));
        });
        // CSS hsl
        atom.workspaceView.find('.meta.property-value.css').each(function(i, el) {
          var colorType = $(this).find('.support.function, .misc.css').text();
          var selectorCache = $(this).find('.numeric.css');
          if (colorType == 'hsl' || colorType == 'hsla') {
            var temp = '';
            var hslValues = selectorCache.each(function() {
              temp += $(this).text() + ',';
            });
            if (temp.length) {
              temp = temp.slice(0, temp.length - 1);
              selectorCache.each(function() {
                $(this)[0].style.backgroundColor = colorType + '(' + temp + ')';
                var backgroundColor = getValue(this, 'background-color');
                $(this)[0].style.color = contrast(rgbStringToValues(backgroundColor));
              });
            }
          }
        });
        // LESS rgb
        atom.workspaceView.find('.less').each(function() {
          var colorType =  $(this).find('.builtin').text();
          var selectorCache = $(this).find('.numeric.css');
          if (colorType == 'rgb' || colorType == 'rgba') {
            var temp = '';
            var rgbValues = selectorCache.each(function() {
              temp += $(this).text() + ',';
            });
            if (temp.length) {
              temp = temp.slice(0, temp.length - 1);
              selectorCache.each(function() {
                $(this)[0].style.backgroundColor = colorType + '(' + temp + ')';
                var backgroundColor = getValue(this, 'background-color');
                $(this)[0].style.color = contrast(rgbStringToValues(backgroundColor));
              });
            }
          }
        });

    };

    applyColor();
    atom.workspaceView.eachEditorView(function(editorView) {
      editorView.on('editor:display-updated', applyColor);
    });
  }
};
