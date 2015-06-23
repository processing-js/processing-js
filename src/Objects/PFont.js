// module export
module.exports = function(options,undef) {
  var window = options.Browser.window,
      document = options.Browser.document,
      noop = options.noop;

  /**
   * [internal function] computeFontMetrics() calculates various metrics for text
   * placement. Currently this function computes the ascent, descent and leading
   * (from "lead", used for vertical space) values for the currently active font.
   */
  function computeFontMetrics(pfont) {
    var emQuad = 250,
        correctionFactor = pfont.size / emQuad,
        canvas = document.createElement("canvas");
    canvas.width = 2*emQuad;
    canvas.height = 2*emQuad;
    canvas.style.opacity = 0;
    var cfmFont = pfont.getCSSDefinition(emQuad+"px", "normal"),
        ctx = canvas.getContext("2d");
    ctx.font = cfmFont;

    // Size the canvas using a string with common max-ascent and max-descent letters.
    // Changing the canvas dimensions resets the context, so we must reset the font.
    var protrusions = "dbflkhyjqpg";
    canvas.width = ctx.measureText(protrusions).width;
    ctx.font = cfmFont;

    // for text lead values, we meaure a multiline text container.
    var leadDiv = document.createElement("div");
    leadDiv.style.position = "absolute";
    leadDiv.style.opacity = 0;
    leadDiv.style.fontFamily = '"' + pfont.name + '"';
    leadDiv.style.fontSize = emQuad + "px";
    leadDiv.innerHTML = protrusions + "<br/>" + protrusions;
    document.body.appendChild(leadDiv);

    var w = canvas.width,
        h = canvas.height,
        baseline = h/2;

    // Set all canvas pixeldata values to 255, with all the content
    // data being 0. This lets us scan for data[i] != 255.
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "black";
    ctx.fillText(protrusions, 0, baseline);
    var pixelData = ctx.getImageData(0, 0, w, h).data;

    // canvas pixel data is w*4 by h*4, because R, G, B and A are separate,
    // consecutive values in the array, rather than stored as 32 bit ints.
    var i = 0,
        w4 = w * 4,
        len = pixelData.length;

    // Finding the ascent uses a normal, forward scanline
    while (++i < len && pixelData[i] === 255) {
      noop();
    }
    var ascent = Math.round(i / w4);

    // Finding the descent uses a reverse scanline
    i = len - 1;
    while (--i > 0 && pixelData[i] === 255) {
      noop();
    }
    var descent = Math.round(i / w4);

    // set font metrics
    pfont.ascent = correctionFactor * (baseline - ascent);
    pfont.descent = correctionFactor * (descent - baseline);

    // Then we try to get the real value from the browser
    if (document.defaultView.getComputedStyle) {
      var leadDivHeight = document.defaultView.getComputedStyle(leadDiv,null).getPropertyValue("height");
      leadDivHeight = correctionFactor * leadDivHeight.replace("px","");
      if (leadDivHeight >= pfont.size * 2) {
        pfont.leading = Math.round(leadDivHeight/2);
      }
    }
    document.body.removeChild(leadDiv);

    // if we're caching, cache the context used for this pfont
    if (pfont.caching) {
      return ctx;
    }
  }

  /**
   * Constructor for a system or from-file (non-SVG) font.
   */
  function PFont(name, size) {
    // according to the P5 API, new PFont() is legal (albeit completely useless)
    if (name === undef) {
      name = "";
    }
    this.name = name;
    if (size === undef) {
      size = 0;
    }
    this.size = size;
    this.glyph = false;
    this.ascent = 0;
    this.descent = 0;
    // For leading, the "safe" value uses the standard TEX ratio
    this.leading = 1.2 * size;

    // Note that an italic, bold font must used "... Bold Italic"
    // in P5. "... Italic Bold" is treated as normal/normal.
    var illegalIndicator = name.indexOf(" Italic Bold");
    if (illegalIndicator !== -1) {
      name = name.substring(0, illegalIndicator);
    }

    // determine font style
    this.style = "normal";
    var italicsIndicator = name.indexOf(" Italic");
    if (italicsIndicator !== -1) {
      name = name.substring(0, italicsIndicator);
      this.style = "italic";
    }

    // determine font weight
    this.weight = "normal";
    var boldIndicator = name.indexOf(" Bold");
    if (boldIndicator !== -1) {
      name = name.substring(0, boldIndicator);
      this.weight = "bold";
    }

    // determine font-family name
    this.family = "sans-serif";
    if (name !== undef) {
      switch(name) {
        case "sans-serif":
        case "serif":
        case "monospace":
        case "fantasy":
        case "cursive":
          this.family = name;
          break;
        default:
          this.family = '"' + name + '", sans-serif';
          break;
      }
    }
    // Calculate the ascent/descent/leading value based on
    // how the browser renders this font.
    this.context2d = computeFontMetrics(this);
    this.css = this.getCSSDefinition();
    if (this.context2d) {
      this.context2d.font = this.css;
    }
  }

  /**
   * regulates whether or not we're caching the canvas
   * 2d context for quick text width computation.
   */
  PFont.prototype.caching = true;

  /**
   * This function generates the CSS "font" string for this PFont
   */
  PFont.prototype.getCSSDefinition = function(fontSize, lineHeight) {
    if(fontSize===undef) {
      fontSize = this.size + "px";
    }
    if(lineHeight===undef) {
      lineHeight = this.leading + "px";
    }
    // CSS "font" definition: font-style font-variant font-weight font-size/line-height font-family
    var components = [this.style, "normal", this.weight, fontSize + "/" + lineHeight, this.family];
    return components.join(" ");
  };

  /**
   * Rely on the cached context2d measureText function.
   */
  PFont.prototype.measureTextWidth = function(string) {
    return this.context2d.measureText(string).width;
  };

  /**
   * FALLBACK FUNCTION -- replaces Pfont.prototype.measureTextWidth
   * when the font cache becomes too large. This contructs a new
   * canvas 2d context object for calling measureText on.
   */
  PFont.prototype.measureTextWidthFallback = function(string) {
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");
    ctx.font = this.css;
    return ctx.measureText(string).width;
  };

  /**
   * Global "loaded fonts" list, internal to PFont
   */
  PFont.PFontCache = { length: 0 };

  /**
   * This function acts as single access point for getting and caching
   * fonts across all sketches handled by an instance of Processing.js
   */
  PFont.get = function(fontName, fontSize) {
    // round fontSize to one decimal point
    fontSize = ((fontSize*10)+0.5|0)/10;
    var cache = PFont.PFontCache,
        idx = fontName+"/"+fontSize;
    if (!cache[idx]) {
      cache[idx] = new PFont(fontName, fontSize);
      cache.length++;

      // FALLBACK FUNCTIONALITY 1:
      // If the cache has become large, switch over from full caching
      // to caching only the static metrics for each new font request.
      if (cache.length === 50) {
        PFont.prototype.measureTextWidth = PFont.prototype.measureTextWidthFallback;
        PFont.prototype.caching = false;
        // clear contexts stored for each cached font
        var entry;
        for (entry in cache) {
          if (entry !== "length") {
            cache[entry].context2d = null;
          }
        }
        return new PFont(fontName, fontSize);
      }

      // FALLBACK FUNCTIONALITY 2:
      // If the cache has become too large, switch off font caching entirely.
      if (cache.length === 400) {
        PFont.PFontCache = {};
        PFont.get = PFont.getFallback;
        return new PFont(fontName, fontSize);
      }
    }
    return cache[idx];
  };

  /**
   * FALLBACK FUNCTION -- replaces PFont.get when the font cache
   * becomes too large. This function bypasses font caching entirely.
   */
  PFont.getFallback = function(fontName, fontSize) {
    return new PFont(fontName, fontSize);
  };

  /**
   * Lists all standard fonts. Due to browser limitations, this list is
   * not the system font list, like in P5, but the CSS "genre" list.
   */
  PFont.list = function() {
    return ["sans-serif", "serif", "monospace", "fantasy", "cursive"];
  };

  /**
   * Loading external fonts through @font-face rules is handled by PFont,
   * to ensure fonts loaded in this way are globally available.
   */
  PFont.preloading = {
    // template element used to compare font sizes
    template: {},
    // indicates whether or not the reference tiny font has been loaded
    initialized: false,
    // load the reference tiny font via a css @font-face rule
    initialize: function() {
      var generateTinyFont = function() {
        var encoded = "#E3KAI2wAgT1MvMg7Eo3VmNtYX7ABi3CxnbHlm" +
                      "7Abw3kaGVhZ7ACs3OGhoZWE7A53CRobXR47AY3" +
                      "AGbG9jYQ7G03Bm1heH7ABC3CBuYW1l7Ae3AgcG" +
                      "9zd7AI3AE#B3AQ2kgTY18PPPUACwAg3ALSRoo3" +
                      "#yld0xg32QAB77#E777773B#E3C#I#Q77773E#" +
                      "Q7777777772CMAIw7AB77732B#M#Q3wAB#g3B#" +
                      "E#E2BB//82BB////w#B7#gAEg3E77x2B32B#E#" +
                      "Q#MTcBAQ32gAe#M#QQJ#E32M#QQJ#I#g32Q77#";
        var expand = function(input) {
                       return "AAAAAAAA".substr(~~input ? 7-input : 6);
                     };
        return encoded.replace(/[#237]/g, expand);
      };
      var fontface = document.createElement("style");
      fontface.setAttribute("type","text/css");
      fontface.innerHTML =  "@font-face {\n" +
                            '  font-family: "PjsEmptyFont";' + "\n" +
                            "  src: url('data:application/x-font-ttf;base64,"+generateTinyFont()+"')\n" +
                            "       format('truetype');\n" +
                            "}";
      document.head.appendChild(fontface);

      // set up the template element
      var element = document.createElement("span");
      element.style.cssText = 'position: absolute; top: -1000; left: 0; opacity: 0; font-family: "PjsEmptyFont", fantasy;';
      element.innerHTML = "AAAAAAAA";
      document.body.appendChild(element);
      this.template = element;

      this.initialized = true;
    },
    // Shorthand function to get the computed width for an element.
    getElementWidth: function(element) {
      return document.defaultView.getComputedStyle(element,"").getPropertyValue("width");
    },
    // time taken so far in attempting to load a font
    timeAttempted: 0,
    // returns false if no fonts are pending load, or true otherwise.
    pending: function(intervallength) {
      if (!this.initialized) {
        this.initialize();
      }
      var element,
          computedWidthFont,
          computedWidthRef = this.getElementWidth(this.template);
      for (var i = 0; i < this.fontList.length; i++) {
        // compares size of text in pixels. if equal, custom font is not yet loaded
        element = this.fontList[i];
        computedWidthFont = this.getElementWidth(element);
        if (this.timeAttempted < 4000 && computedWidthFont === computedWidthRef) {
          this.timeAttempted += intervallength;
          return true;
        } else {
          document.body.removeChild(element);
          this.fontList.splice(i--, 1);
          this.timeAttempted = 0;
        }
      }
      // if there are no more fonts to load, pending is false
      if (this.fontList.length === 0) {
        return false;
      }
      // We should have already returned before getting here.
      // But, if we do get here, length!=0 so fonts are pending.
      return true;
    },
    // fontList contains elements to compare font sizes against a template
    fontList: [],
    // addedList contains the fontnames of all the fonts loaded via @font-face
    addedList: {},
    // adds a font to the font cache
    // creates an element using the font, to start loading the font,
    // and compare against a default font to see if the custom font is loaded
    add: function(fontSrc) {
      if (!this.initialized) {
       this.initialize();
      }
      // fontSrc can be a string or a javascript object
      // acceptable fonts are .ttf, .otf, and data uri
      var fontName = (typeof fontSrc === 'object' ? fontSrc.fontFace : fontSrc),
          fontUrl = (typeof fontSrc === 'object' ? fontSrc.url : fontSrc);

      // check whether we already created the @font-face rule for this font
      if (this.addedList[fontName]) {
        return;
      }

      // if we didn't, create the @font-face rule
      var style = document.createElement("style");
      style.setAttribute("type","text/css");
      style.innerHTML = "@font-face{\n  font-family: '" + fontName + "';\n  src:  url('" + fontUrl + "');\n}\n";
      document.head.appendChild(style);
      this.addedList[fontName] = true;

      // also create the element to load and compare the new font
      var element = document.createElement("span");
      element.style.cssText = "position: absolute; top: 0; left: 0; opacity: 0;";
      element.style.fontFamily = '"' + fontName + '", "PjsEmptyFont", fantasy';
      element.innerHTML = "AAAAAAAA";
      document.body.appendChild(element);
      this.fontList.push(element);
    }
  };

  return PFont;
};