module.exports = activate: (state) ->
  getValue = (element, style) ->
    window.getComputedStyle(element).getPropertyValue style

  rgbStringToValues = (rgb) ->
    rgb.slice(4).slice(0, -1).split(",").map (value) ->
      parseInt value

  contrast = (color) ->
    r = color[0]
    g = color[1]
    b = color[2]
    yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    (if (yiq >= 128) then "#000" else "#fff")

  applyColor = ->
    atom.workspaceView.view().find(".color,.rgb-value").each (i, el) ->
      el.style.backgroundColor = el.innerText
      backgroundColor = getValue(el, "background-color")
      el.style.color = contrast(rgbStringToValues(backgroundColor))

  applyColor() if atom.workspaceView.length
  atom.workspaceView.eachEditorView (editorView) ->
    editorView.on "editor:display-updated", ->
      applyColor()
