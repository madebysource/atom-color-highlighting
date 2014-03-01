$ = require("atom")
$ = $.$
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

    # CSS hexa and rgb
    atom.workspaceView.find(".css.color, .rgb-value, .w3c-standard-color-name").each (i, el) ->
      colorType = $(this).prevAll(".support.function").text()
      if colorType is "rgb" or colorType is "rgba"
        el.style.backgroundColor = colorType + "(" + el.innerText + ")"
      else
        el.style.backgroundColor = el.innerText
      backgroundColor = getValue(el, "background-color")
      el.style.color = contrast(rgbStringToValues(backgroundColor))

    # CSS hsl
    atom.workspaceView.find(".meta.property-value.css").each (i, el) ->
      colorType = $(this).find(".support.function, .misc.css").text()
      selectorCache = $(this).find(".numeric.css")
      if colorType is "hsl" or colorType is "hsla"
        temp = ""
        hslValues = selectorCache.each(->
          temp += $(this).text() + ","
        )
        if temp.length
          temp = temp.slice(0, temp.length - 1)
          selectorCache.each ->
            $(this)[0].style.backgroundColor = colorType + "(" + temp + ")"
            backgroundColor = getValue(this, "background-color")
            $(this)[0].style.color = contrast(rgbStringToValues(backgroundColor))

    # LESS rgb
    atom.workspaceView.find(".less").each ->
      colorType = $(this).find(".builtin").text()
      selectorCache = $(this).find(".numeric.css")
      if colorType is "rgb" or colorType is "rgba"
        temp = ""
        rgbValues = selectorCache.each(->
          temp += $(this).text() + ","
        )
        if temp.length
          temp = temp.slice(0, temp.length - 1)
          selectorCache.each ->
            $(this)[0].style.backgroundColor = colorType + "(" + temp + ")"
            backgroundColor = getValue(this, "background-color")
            $(this)[0].style.color = contrast(rgbStringToValues(backgroundColor))

  applyColor()
  atom.workspaceView.eachEditorView (editorView) ->
    editorView.on "editor:display-updated", applyColor
