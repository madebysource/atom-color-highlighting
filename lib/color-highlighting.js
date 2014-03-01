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

      var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return (yiq >= 128) ? '#000' : '#fff';
    };

    var applyColor = function() {
      if (selectedTextLen) {
        return;
      }
      // CSS hexa and rgb
      atom.workspaceView.find('.css.color, .rgb-value, .w3c-standard-color-name').each(function(i, el) {
        var colorType = $(this).prevAll('.support.function').text();
        var css = {};
        if (colorType == 'rgb' || colorType == 'rgba') {
          css['background-color'] = colorType + '(' + el.innerText + ')';
        } else {
          css['background-color'] = el.innerText
        }
        $(this).css(css);
        var backgroundColor = getValue(el, 'background-color');
        css['color'] = contrast(rgbStringToValues(backgroundColor));
        var $editorColors = $('.editor-colors');
        if (colorType == 'rgba' && $editorColors.length) {
          css['color'] = contrast(rgbStringToValues(getValue($editorColors[0], 'background-color')));
        }
        $(this).css(css);
        $(el).find('.css, .scss').css('color', el.style.color);
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
        var colorType = $(this).find('.builtin').text();
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

    var selectedTextLen = 0;
    var selectionFn = function(editor) {
      var selectedTextRange = editor.getSelectedScreenRange();
      selectedTextLen = editor.getSelectedText().length;
      if (!selectedTextLen) {
        return;
      }
      var start = selectedTextRange.start.row;
      var end = selectedTextRange.end.row;
      var $lines = $('.line');
      $lines.each(function(i) {
        if (i >= start && i <= end) {
          $(this).find('.css.color, .rgb-value, .w3c-standard-color-name, .css.color .css').css({
            'background-color': 'transparent',
            'color': '#FFFFFF'
          });
        }
      });
    };

    applyColor();
    atom.workspaceView.eachEditorView(function(editorView) {
      editorView.on('editor:display-updated', applyColor);
      editorView.editor.selections.forEach(function(selection) {
        selection.on('screen-range-changed', function() {
          selectionFn(editorView.editor);
        });
      });
    });
  }
};
