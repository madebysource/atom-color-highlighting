module.exports = {
  activate: function(state) {
    var getValue = function(element, style) {
      return window.getComputedStyle(element).getPropertyValue(style);
    };

    var rgbStringToValues = function(rgb) {
      return rgb.slice(4).slice(0, -1).split(',').map(function(value) {
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
        atom.workspaceView.view().find('.color, .rgb-value').each(function(i, el) {
            el.style.backgroundColor = el.innerText;
            var backgroundColor = getValue(el, 'background-color');
            el.style.color = contrast(rgbStringToValues(backgroundColor));
        });
    };

    if (atom.workspaceView.length) {
      applyColor();
    }
    atom.workspaceView.eachEditorView(function(editorView) {
      editorView.on('editor:display-updated', function() {
        applyColor();
      });
    });
  }
};
