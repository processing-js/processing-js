/**
 * SVG stands for Scalable Vector Graphics, a portable graphics format. It is
 * a vector format so it allows for infinite resolution and relatively small
 * file sizes. Most modern media software can view SVG files, including Adobe
 * products, Firefox, etc. Illustrator and Inkscape can edit SVG files.
 *
 * @param {PApplet} parent     typically use "this"
 * @param {String} filename    name of the SVG file to load
 * @param {XMLElement} xml     an XMLElement element
 * @param {PShapeSVG} parent   the parent PShapeSVG
 *
 * @see PShape
 */
module.exports = function(options) {
  var CommonFunctions = options.CommonFunctions,
      PConstants = options.PConstants,
      PShape = options.PShape,
      XMLElement = options.XMLElement,
      colors = options.colors;

  var PShapeSVG = function() {
    PShape.call(this);                // PShape is the base class.
    if (arguments.length === 1) {     // xml element coming in
      this.element  = arguments[0];

      // set values to their defaults according to the SVG spec
      this.vertexCodes         = [];
      this.vertices            = [];
      this.opacity             = 1;

      this.stroke              = false;
      this.strokeColor         = PConstants.ALPHA_MASK;
      this.strokeWeight        = 1;
      this.strokeCap           = PConstants.SQUARE;  // BUTT in svg spec
      this.strokeJoin          = PConstants.MITER;
      this.strokeGradient      = null;
      this.strokeGradientPaint = null;
      this.strokeName          = null;
      this.strokeOpacity       = 1;

      this.fill                = true;
      this.fillColor           = PConstants.ALPHA_MASK;
      this.fillGradient        = null;
      this.fillGradientPaint   = null;
      this.fillName            = null;
      this.fillOpacity         = 1;

      if (this.element.getName() !== "svg") {
        throw("root is not <svg>, it's <" + this.element.getName() + ">");
      }
    }
    else if (arguments.length === 2) {
      if (typeof arguments[1] === 'string') {
        if (arguments[1].indexOf(".svg") > -1) { //its a filename
          this.element = new XMLElement(true, arguments[1]);
          // set values to their defaults according to the SVG spec
          this.vertexCodes         = [];
          this.vertices            = [];
          this.opacity             = 1;

          this.stroke              = false;
          this.strokeColor         = PConstants.ALPHA_MASK;
          this.strokeWeight        = 1;
          this.strokeCap           = PConstants.SQUARE;  // BUTT in svg spec
          this.strokeJoin          = PConstants.MITER;
          this.strokeGradient      = "";
          this.strokeGradientPaint = "";
          this.strokeName          = "";
          this.strokeOpacity       = 1;

          this.fill                = true;
          this.fillColor           = PConstants.ALPHA_MASK;
          this.fillGradient        = null;
          this.fillGradientPaint   = null;
          this.fillOpacity         = 1;

        }
      } else { // XMLElement
        if (arguments[0]) { // PShapeSVG
          this.element             = arguments[1];
          this.vertexCodes         = arguments[0].vertexCodes.slice();
          this.vertices            = arguments[0].vertices.slice();

          this.stroke              = arguments[0].stroke;
          this.strokeColor         = arguments[0].strokeColor;
          this.strokeWeight        = arguments[0].strokeWeight;
          this.strokeCap           = arguments[0].strokeCap;
          this.strokeJoin          = arguments[0].strokeJoin;
          this.strokeGradient      = arguments[0].strokeGradient;
          this.strokeGradientPaint = arguments[0].strokeGradientPaint;
          this.strokeName          = arguments[0].strokeName;

          this.fill                = arguments[0].fill;
          this.fillColor           = arguments[0].fillColor;
          this.fillGradient        = arguments[0].fillGradient;
          this.fillGradientPaint   = arguments[0].fillGradientPaint;
          this.fillName            = arguments[0].fillName;
          this.strokeOpacity       = arguments[0].strokeOpacity;
          this.fillOpacity         = arguments[0].fillOpacity;
          this.opacity             = arguments[0].opacity;
        }
      }
    }

    this.name      = this.element.getStringAttribute("id");
    var displayStr = this.element.getStringAttribute("display", "inline");
    this.visible   = displayStr !== "none";
    var str = this.element.getAttribute("transform");
    if (str) {
      this.matrix = this.parseMatrix(str);
    }
    // not proper parsing of the viewBox, but will cover us for cases where
    // the width and height of the object is not specified
    var viewBoxStr = this.element.getStringAttribute("viewBox");
    if ( viewBoxStr !== null ) {
      var viewBox = viewBoxStr.split(" ");
      this.width  = viewBox[2];
      this.height = viewBox[3];
    }

    // TODO if viewbox is not same as width/height, then use it to scale
    // the original objects. for now, viewbox only used when width/height
    // are empty values (which by the spec means w/h of "100%"
    var unitWidth  = this.element.getStringAttribute("width");
    var unitHeight = this.element.getStringAttribute("height");
    if (unitWidth !== null) {
      this.width  = this.parseUnitSize(unitWidth);
      this.height = this.parseUnitSize(unitHeight);
    } else {
      if ((this.width === 0) || (this.height === 0)) {
        // For the spec, the default is 100% and 100%. For purposes
        // here, insert a dummy value because this is prolly just a
        // font or something for which the w/h doesn't matter.
        this.width  = 1;
        this.height = 1;

        //show warning
        throw("The width and/or height is not " +
              "readable in the <svg> tag of this file.");
      }
    }
    this.parseColors(this.element);
    this.parseChildren(this.element);

  };
  /**
   * PShapeSVG methods are inherited from the PShape prototype
   */
  PShapeSVG.prototype = new PShape();
  /**
   * @member PShapeSVG
   * The parseMatrix() function parses the specified SVG matrix into a PMatrix2D. Note that PMatrix2D
   * is rotated relative to the SVG definition, so parameters are rearranged
   * here. More about the transformation matrices in
   * <a href="http://www.w3.org/TR/SVG/coords.html#TransformAttribute">this section</a>
   * of the SVG documentation.
   *
   * @param {String} str text of the matrix param.
   *
   * @return {PMatrix2D} a PMatrix2D
   */
  PShapeSVG.prototype.parseMatrix = (function() {
    function getCoords(s) {
      var m = [];
      s.replace(/\((.*?)\)/, (function() {
        return function(all, params) {
          // get the coordinates that can be separated by spaces or a comma
          m = params.replace(/,+/g, " ").split(/\s+/);
        };
      }()));
      return m;
    }

    return function(str) {
      this.checkMatrix(2);
      var pieces = [];
      str.replace(/\s*(\w+)\((.*?)\)/g, function(all) {
        // get a list of transform definitions
        pieces.push(CommonFunctions.trim(all));
      });
      if (pieces.length === 0) {
        return null;
      }

      for (var i = 0, j = pieces.length; i < j; i++) {
        var m = getCoords(pieces[i]);

        if (pieces[i].indexOf("matrix") !== -1) {
          this.matrix.set(m[0], m[2], m[4], m[1], m[3], m[5]);
        } else if (pieces[i].indexOf("translate") !== -1) {
          var tx = m[0];
          var ty = (m.length === 2) ? m[1] : 0;
          this.matrix.translate(tx,ty);
        } else if (pieces[i].indexOf("scale") !== -1) {
          var sx = m[0];
          var sy = (m.length === 2) ? m[1] : m[0];
          this.matrix.scale(sx,sy);
        } else if (pieces[i].indexOf("rotate") !== -1) {
          var angle = m[0];
          if (m.length === 1) {
            this.matrix.rotate(CommonFunctions.radians(angle));
          } else if (m.length === 3) {
            this.matrix.translate(m[1], m[2]);
            this.matrix.rotate(CommonFunctions.radians(m[0]));
            this.matrix.translate(-m[1], -m[2]);
          }
        } else if (pieces[i].indexOf("skewX") !== -1) {
          this.matrix.skewX(parseFloat(m[0]));
        } else if (pieces[i].indexOf("skewY") !== -1) {
          this.matrix.skewY(m[0]);
        } else if (pieces[i].indexOf("shearX") !== -1) {
          this.matrix.shearX(m[0]);
        } else if (pieces[i].indexOf("shearY") !== -1) {
          this.matrix.shearY(m[0]);
        }
      }
      return this.matrix;
    };
  }());

  /**
   * @member PShapeSVG
   * The parseChildren() function parses the specified XMLElement
   *
   * @param {XMLElement}element the XMLElement to parse
   */
  PShapeSVG.prototype.parseChildren = function(element) {
    var newelement = element.getChildren();
    var base = new PShape();
    var i, j;
    for (i = 0, j = newelement.length; i < j; i++) {
      var kid = this.parseChild(newelement[i]);
      if (kid) {
        base.addChild(kid);
      }
    }
    for (i = 0, j = base.children.length; i < j; i++) {
      this.children.push(base.children[i]);
    }
  };
  /**
   * @member PShapeSVG
   * The getName() function returns the name
   *
   * @return {String} the name
   */
  PShapeSVG.prototype.getName = function() {
    return this.name;
  };
  /**
   * @member PShapeSVG
   * The parseChild() function parses a child XML element.
   *
   * @param {XMLElement} elem the element to parse
   *
   * @return {PShape} the newly created PShape
   */
  PShapeSVG.prototype.parseChild = function( elem ) {
    var name = elem.getName();
    var shape;
    if (name === "g") {
      shape = new PShapeSVG(this, elem);
    } else if (name === "defs") {
      // generally this will contain gradient info, so may
      // as well just throw it into a group element for parsing
      shape = new PShapeSVG(this, elem);
    } else if (name === "line") {
      shape = new PShapeSVG(this, elem);
      shape.parseLine();
    } else if (name === "circle") {
      shape = new PShapeSVG(this, elem);
      shape.parseEllipse(true);
    } else if (name === "ellipse") {
      shape = new PShapeSVG(this, elem);
      shape.parseEllipse(false);
    } else if (name === "rect") {
      shape = new PShapeSVG(this, elem);
      shape.parseRect();
    } else if (name === "polygon") {
      shape = new PShapeSVG(this, elem);
      shape.parsePoly(true);
    } else if (name === "polyline") {
      shape = new PShapeSVG(this, elem);
      shape.parsePoly(false);
    } else if (name === "path") {
      shape = new PShapeSVG(this, elem);
      shape.parsePath();
    } else if (name === "radialGradient") {
      //return new RadialGradient(this, elem);
      unimplemented('PShapeSVG.prototype.parseChild, name = radialGradient');
    } else if (name === "linearGradient") {
      //return new LinearGradient(this, elem);
      unimplemented('PShapeSVG.prototype.parseChild, name = linearGradient');
    } else if (name === "text") {
      unimplemented('PShapeSVG.prototype.parseChild, name = text');
    } else if (name === "filter") {
      unimplemented('PShapeSVG.prototype.parseChild, name = filter');
    } else if (name === "mask") {
      unimplemented('PShapeSVG.prototype.parseChild, name = mask');
    } else {
      // ignoring
    }
    return shape;
  };
  /**
   * @member PShapeSVG
   * The parsePath() function parses the <path> element of the svg file
   * A path is defined by including a path element which contains a d="(path data)" attribute, where the d attribute contains
   * the moveto, line, curve (both cubic and quadratic Beziers), arc and closepath instructions.
   **/
  PShapeSVG.prototype.parsePath = function() {
    this.family = PConstants.PATH;
    this.kind = 0;
    var pathDataChars = [];
    var c;
    //change multiple spaces and commas to single space
    var pathData = CommonFunctions.trim(this.element.getStringAttribute("d").replace(/[\s,]+/g,' '));
    if (pathData === null) {
      return;
    }
    pathData = pathData.split('');
    var cx     = 0,
        cy     = 0,
        ctrlX  = 0,
        ctrlY  = 0,
        ctrlX1 = 0,
        ctrlX2 = 0,
        ctrlY1 = 0,
        ctrlY2 = 0,
        endX   = 0,
        endY   = 0,
        ppx    = 0,
        ppy    = 0,
        px     = 0,
        py     = 0,
        i      = 0,
        valOf  = 0;
    var str = "";
    var tmpArray = [];
    var flag = false;
    var lastInstruction;
    var command;
    var j, k;
    while (i< pathData.length) {
      valOf = pathData[i].charCodeAt(0);
      if ((valOf >= 65 && valOf <= 90) || (valOf >= 97 && valOf <= 122)) {
        // if it's a letter
        // populate the tmpArray with coordinates
        j = i;
        i++;
        if (i < pathData.length) { // don't go over boundary of array
          tmpArray = [];
          valOf = pathData[i].charCodeAt(0);
          while (!((valOf >= 65 && valOf <= 90) ||
                   (valOf >= 97 && valOf <= 100) ||
                   (valOf >= 102 && valOf <= 122)) && flag === false) { // if its NOT a letter
            if (valOf === 32) { //if its a space and the str isn't empty
              // sometimes you get a space after the letter
              if (str !== "") {
                tmpArray.push(parseFloat(str));
                str = "";
              }
              i++;
            } else if (valOf === 45) { //if it's a -
              // allow for 'e' notation in numbers, e.g. 2.10e-9
              if (pathData[i-1].charCodeAt(0) === 101) {
                str += pathData[i].toString();
                i++;
              } else {
                // sometimes no space separator after (ex: 104.535-16.322)
                if (str !== "") {
                  tmpArray.push(parseFloat(str));
                }
                str = pathData[i].toString();
                i++;
              }
            } else {
              str += pathData[i].toString();
              i++;
            }
            if (i === pathData.length) { // don't go over boundary of array
              flag = true;
            } else {
              valOf = pathData[i].charCodeAt(0);
            }
          }
        }
        if (str !== "") {
          tmpArray.push(parseFloat(str));
          str = "";
        }
        command = pathData[j];
        valOf = command.charCodeAt(0);
        if (valOf === 77) {  // M - move to (absolute)
          if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
            // need one+ pairs of co-ordinates
            cx = tmpArray[0];
            cy = tmpArray[1];
            this.parsePathMoveto(cx, cy);
            if (tmpArray.length > 2) {
              for (j = 2, k = tmpArray.length; j < k; j+=2) {
                // absolute line to
                cx = tmpArray[j];
                cy = tmpArray[j+1];
                this.parsePathLineto(cx,cy);
              }
            }
          }
        } else if (valOf === 109) {  // m - move to (relative)
          if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
            // need one+ pairs of co-ordinates
            cx += tmpArray[0];
            cy += tmpArray[1];
            this.parsePathMoveto(cx,cy);
            if (tmpArray.length > 2) {
              for (j = 2, k = tmpArray.length; j < k; j+=2) {
                // relative line to
                cx += tmpArray[j];
                cy += tmpArray[j + 1];
                this.parsePathLineto(cx,cy);
              }
            }
          }
        } else if (valOf === 76) { // L - lineto (absolute)
          if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
            // need one+ pairs of co-ordinates
            for (j = 0, k = tmpArray.length; j < k; j+=2) {
              cx = tmpArray[j];
              cy = tmpArray[j + 1];
              this.parsePathLineto(cx,cy);
            }
          }
        } else if (valOf === 108) { // l - lineto (relative)
          if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
            // need one+ pairs of co-ordinates
            for (j = 0, k = tmpArray.length; j < k; j+=2) {
              cx += tmpArray[j];
              cy += tmpArray[j+1];
              this.parsePathLineto(cx,cy);
            }
          }
        } else if (valOf === 72) { // H - horizontal lineto (absolute)
          for (j = 0, k = tmpArray.length; j < k; j++) {
            // multiple x co-ordinates can be provided
            cx = tmpArray[j];
            this.parsePathLineto(cx, cy);
          }
        } else if (valOf === 104) { // h - horizontal lineto (relative)
          for (j = 0, k = tmpArray.length; j < k; j++) {
            // multiple x co-ordinates can be provided
            cx += tmpArray[j];
            this.parsePathLineto(cx, cy);
          }
        } else if (valOf === 86) { // V - vertical lineto (absolute)
          for (j = 0, k = tmpArray.length; j < k; j++) {
            // multiple y co-ordinates can be provided
            cy = tmpArray[j];
            this.parsePathLineto(cx, cy);
          }
        } else if (valOf === 118) { // v - vertical lineto (relative)
          for (j = 0, k = tmpArray.length; j < k; j++) {
            // multiple y co-ordinates can be provided
            cy += tmpArray[j];
            this.parsePathLineto(cx, cy);
          }
        } else if (valOf === 67) { // C - curve to (absolute)
          if (tmpArray.length >= 6 && tmpArray.length % 6 === 0) {
            // need one+ multiples of 6 co-ordinates
            for (j = 0, k = tmpArray.length; j < k; j+=6) {
              ctrlX1 = tmpArray[j];
              ctrlY1 = tmpArray[j + 1];
              ctrlX2 = tmpArray[j + 2];
              ctrlY2 = tmpArray[j + 3];
              endX   = tmpArray[j + 4];
              endY   = tmpArray[j + 5];
              this.parsePathCurveto(ctrlX1,
                                    ctrlY1,
                                    ctrlX2,
                                    ctrlY2,
                                    endX,
                                    endY);
              cx = endX;
              cy = endY;
            }
          }
        } else if (valOf === 99) { // c - curve to (relative)
          if (tmpArray.length >= 6 && tmpArray.length % 6 === 0) {
            // need one+ multiples of 6 co-ordinates
            for (j = 0, k = tmpArray.length; j < k; j+=6) {
              ctrlX1 = cx + tmpArray[j];
              ctrlY1 = cy + tmpArray[j + 1];
              ctrlX2 = cx + tmpArray[j + 2];
              ctrlY2 = cy + tmpArray[j + 3];
              endX   = cx + tmpArray[j + 4];
              endY   = cy + tmpArray[j + 5];
              this.parsePathCurveto(ctrlX1,
                                    ctrlY1,
                                    ctrlX2,
                                    ctrlY2,
                                    endX,
                                    endY);
              cx = endX;
              cy = endY;
            }
          }
        } else if (valOf === 83) { // S - curve to shorthand (absolute)
          if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) {
            // need one+ multiples of 4 co-ordinates
            for (j = 0, k = tmpArray.length; j < k; j+=4) {
              if (lastInstruction.toLowerCase() ===  "c" ||
                  lastInstruction.toLowerCase() ===  "s") {
                ppx    = this.vertices[ this.vertices.length-2 ][0];
                ppy    = this.vertices[ this.vertices.length-2 ][1];
                px     = this.vertices[ this.vertices.length-1 ][0];
                py     = this.vertices[ this.vertices.length-1 ][1];
                ctrlX1 = px + (px - ppx);
                ctrlY1 = py + (py - ppy);
              } else {
                //If there is no previous curve,
                //the current point will be used as the first control point.
                ctrlX1 = this.vertices[this.vertices.length-1][0];
                ctrlY1 = this.vertices[this.vertices.length-1][1];
              }
              ctrlX2 = tmpArray[j];
              ctrlY2 = tmpArray[j + 1];
              endX   = tmpArray[j + 2];
              endY   = tmpArray[j + 3];
              this.parsePathCurveto(ctrlX1,
                                    ctrlY1,
                                    ctrlX2,
                                    ctrlY2,
                                    endX,
                                    endY);
              cx = endX;
              cy = endY;
            }
          }
        } else if (valOf === 115) { // s - curve to shorthand (relative)
          if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) {
            // need one+ multiples of 4 co-ordinates
            for (j = 0, k = tmpArray.length; j < k; j+=4) {
              if (lastInstruction.toLowerCase() ===  "c" ||
                  lastInstruction.toLowerCase() ===  "s") {
                ppx    = this.vertices[this.vertices.length-2][0];
                ppy    = this.vertices[this.vertices.length-2][1];
                px     = this.vertices[this.vertices.length-1][0];
                py     = this.vertices[this.vertices.length-1][1];
                ctrlX1 = px + (px - ppx);
                ctrlY1 = py + (py - ppy);
              } else {
                //If there is no previous curve,
                //the current point will be used as the first control point.
                ctrlX1 = this.vertices[this.vertices.length-1][0];
                ctrlY1 = this.vertices[this.vertices.length-1][1];
              }
              ctrlX2 = cx + tmpArray[j];
              ctrlY2 = cy + tmpArray[j + 1];
              endX   = cx + tmpArray[j + 2];
              endY   = cy + tmpArray[j + 3];
              this.parsePathCurveto(ctrlX1,
                                    ctrlY1,
                                    ctrlX2,
                                    ctrlY2,
                                    endX,
                                    endY);
              cx = endX;
              cy = endY;
            }
          }
        } else if (valOf === 81) { // Q - quadratic curve to (absolute)
          if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) {
            // need one+ multiples of 4 co-ordinates
            for (j = 0, k = tmpArray.length; j < k; j+=4) {
              ctrlX = tmpArray[j];
              ctrlY = tmpArray[j + 1];
              endX  = tmpArray[j + 2];
              endY  = tmpArray[j + 3];
              this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
              cx = endX;
              cy = endY;
            }
          }
        } else if (valOf === 113) { // q - quadratic curve to (relative)
          if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) {
            // need one+ multiples of 4 co-ordinates
            for (j = 0, k = tmpArray.length; j < k; j+=4) {
              ctrlX = cx + tmpArray[j];
              ctrlY = cy + tmpArray[j + 1];
              endX  = cx + tmpArray[j + 2];
              endY  = cy + tmpArray[j + 3];
              this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
              cx = endX;
              cy = endY;
            }
          }
        } else if (valOf === 84) {
          // T - quadratic curve to shorthand (absolute)
          if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
            // need one+ pairs of co-ordinates
            for (j = 0, k = tmpArray.length; j < k; j+=2) {
              if (lastInstruction.toLowerCase() ===  "q" ||
                  lastInstruction.toLowerCase() ===  "t") {
                ppx   = this.vertices[this.vertices.length-2][0];
                ppy   = this.vertices[this.vertices.length-2][1];
                px    = this.vertices[this.vertices.length-1][0];
                py    = this.vertices[this.vertices.length-1][1];
                ctrlX = px + (px - ppx);
                ctrlY = py + (py - ppy);
              } else {
                // If there is no previous command or if the previous command
                // was not a Q, q, T or t, assume the control point is
                // coincident with the current point.
                ctrlX = cx;
                ctrlY = cy;
              }
              endX  = tmpArray[j];
              endY  = tmpArray[j + 1];
              this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
              cx = endX;
              cy = endY;
            }
          }
        } else if (valOf === 116) {
          // t - quadratic curve to shorthand (relative)
          if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
            // need one+ pairs of co-ordinates
            for (j = 0, k = tmpArray.length; j < k; j+=2) {
              if (lastInstruction.toLowerCase() ===  "q" ||
                  lastInstruction.toLowerCase() ===  "t") {
                ppx   = this.vertices[this.vertices.length-2][0];
                ppy   = this.vertices[this.vertices.length-2][1];
                px    = this.vertices[this.vertices.length-1][0];
                py    = this.vertices[this.vertices.length-1][1];
                ctrlX = px + (px - ppx);
                ctrlY = py + (py - ppy);
              } else {
                // If there is no previous command or if the previous command
                // was not a Q, q, T or t, assume the control point is
                // coincident with the current point.
                ctrlX = cx;
                ctrlY = cy;
              }
              endX  = cx + tmpArray[j];
              endY  = cy + tmpArray[j + 1];
              this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
              cx = endX;
              cy = endY;
            }
          }
        } else if (valOf === 90 || valOf === 122) { // Z or z (these do the same thing)
          this.close = true;
        }
        lastInstruction = command.toString();
      } else { i++;}
    }
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parsePath() helper function
   *
   * @see PShapeSVG#parsePath
   */
  PShapeSVG.prototype.parsePathQuadto = function(x1, y1, cx, cy, x2, y2) {
    if (this.vertices.length > 0) {
      this.parsePathCode(PConstants.BEZIER_VERTEX);
      // x1/y1 already covered by last moveto, lineto, or curveto
      this.parsePathVertex(x1 + ((cx-x1)*2/3), y1 + ((cy-y1)*2/3));
      this.parsePathVertex(x2 + ((cx-x2)*2/3), y2 + ((cy-y2)*2/3));
      this.parsePathVertex(x2, y2);
    } else {
      throw ("Path must start with M/m");
    }
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parsePath() helper function
   *
   * @see PShapeSVG#parsePath
   */
  PShapeSVG.prototype.parsePathCurveto = function(x1,  y1, x2, y2, x3, y3) {
    if (this.vertices.length > 0) {
      this.parsePathCode(PConstants.BEZIER_VERTEX );
      this.parsePathVertex(x1, y1);
      this.parsePathVertex(x2, y2);
      this.parsePathVertex(x3, y3);
    } else {
      throw ("Path must start with M/m");
    }
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parsePath() helper function
   *
   * @see PShapeSVG#parsePath
   */
  PShapeSVG.prototype.parsePathLineto = function(px, py) {
    if (this.vertices.length > 0) {
      this.parsePathCode(PConstants.VERTEX);
      this.parsePathVertex(px, py);
      // add property to distinguish between curContext.moveTo
      // or curContext.lineTo
      this.vertices[this.vertices.length-1].moveTo = false;
    } else {
      throw ("Path must start with M/m");
    }
  };

  PShapeSVG.prototype.parsePathMoveto = function(px, py) {
    if (this.vertices.length > 0) {
      this.parsePathCode(PConstants.BREAK);
    }
    this.parsePathCode(PConstants.VERTEX);
    this.parsePathVertex(px, py);
    // add property to distinguish between curContext.moveTo
    // or curContext.lineTo
    this.vertices[this.vertices.length-1].moveTo = true;
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parsePath() helper function
   *
   * @see PShapeSVG#parsePath
   */
  PShapeSVG.prototype.parsePathVertex = function(x,  y) {
    var verts = [];
    verts[0]  = x;
    verts[1]  = y;
    this.vertices.push(verts);
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parsePath() helper function
   *
   * @see PShapeSVG#parsePath
   */
  PShapeSVG.prototype.parsePathCode = function(what) {
    this.vertexCodes.push(what);
  };
  /**
   * @member PShapeSVG
   * The parsePoly() function parses a polyline or polygon from an SVG file.
   *
   * @param {boolean}val true if shape is closed (polygon), false if not (polyline)
   */
  PShapeSVG.prototype.parsePoly = function(val) {
    this.family    = PConstants.PATH;
    this.close     = val;
    var pointsAttr = CommonFunctions.trim(this.element.getStringAttribute("points").replace(/[,\s]+/g,' '));
    if (pointsAttr !== null) {
      //split into array
      var pointsBuffer = pointsAttr.split(" ");
      if (pointsBuffer.length % 2 === 0) {
        for (var i = 0, j = pointsBuffer.length; i < j; i++) {
          var verts = [];
          verts[0]  = pointsBuffer[i];
          verts[1]  = pointsBuffer[++i];
          this.vertices.push(verts);
        }
      } else {
        throw("Error parsing polygon points: odd number of coordinates provided");
      }
    }
  };
  /**
   * @member PShapeSVG
   * The parseRect() function parses a rect from an SVG file.
   */
  PShapeSVG.prototype.parseRect = function() {
    this.kind      = PConstants.RECT;
    this.family    = PConstants.PRIMITIVE;
    this.params    = [];
    this.params[0] = this.element.getFloatAttribute("x");
    this.params[1] = this.element.getFloatAttribute("y");
    this.params[2] = this.element.getFloatAttribute("width");
    this.params[3] = this.element.getFloatAttribute("height");
    if (this.params[2] < 0 || this.params[3] < 0) {
      throw("svg error: negative width or height found while parsing <rect>");
    }
  };
  /**
   * @member PShapeSVG
   * The parseEllipse() function handles parsing ellipse and circle tags.
   *
   * @param {boolean}val true if this is a circle and not an ellipse
   */
  PShapeSVG.prototype.parseEllipse = function(val) {
    this.kind   = PConstants.ELLIPSE;
    this.family = PConstants.PRIMITIVE;
    this.params = [];

    this.params[0] = this.element.getFloatAttribute("cx") | 0 ;
    this.params[1] = this.element.getFloatAttribute("cy") | 0;

    var rx, ry;
    if (val) {
      rx = ry = this.element.getFloatAttribute("r");
      if (rx < 0) {
        throw("svg error: negative radius found while parsing <circle>");
      }
    } else {
      rx = this.element.getFloatAttribute("rx");
      ry = this.element.getFloatAttribute("ry");
      if (rx < 0 || ry < 0) {
        throw("svg error: negative x-axis radius or y-axis radius found while parsing <ellipse>");
      }
    }
    this.params[0] -= rx;
    this.params[1] -= ry;

    this.params[2] = rx*2;
    this.params[3] = ry*2;
  };
  /**
   * @member PShapeSVG
   * The parseLine() function handles parsing line tags.
   *
   * @param {boolean}val true if this is a circle and not an ellipse
   */
  PShapeSVG.prototype.parseLine = function() {
    this.kind = PConstants.LINE;
    this.family = PConstants.PRIMITIVE;
    this.params = [];
    this.params[0] = this.element.getFloatAttribute("x1");
    this.params[1] = this.element.getFloatAttribute("y1");
    this.params[2] = this.element.getFloatAttribute("x2");
    this.params[3] = this.element.getFloatAttribute("y2");
  };
  /**
   * @member PShapeSVG
   * The parseColors() function handles parsing the opacity, strijem stroke-width, stroke-linejoin,stroke-linecap, fill, and style attributes
   *
   * @param {XMLElement}element the element of which attributes to parse
   */
  PShapeSVG.prototype.parseColors = function(element) {
    if (element.hasAttribute("opacity")) {
      this.setOpacity(element.getAttribute("opacity"));
    }
    if (element.hasAttribute("stroke")) {
      this.setStroke(element.getAttribute("stroke"));
    }
    if (element.hasAttribute("stroke-width")) {
      // if NaN (i.e. if it's 'inherit') then default
      // back to the inherit setting
      this.setStrokeWeight(element.getAttribute("stroke-width"));
    }
    if (element.hasAttribute("stroke-linejoin") ) {
      this.setStrokeJoin(element.getAttribute("stroke-linejoin"));
    }
    if (element.hasAttribute("stroke-linecap")) {
      this.setStrokeCap(element.getStringAttribute("stroke-linecap"));
    }
    // fill defaults to black (though stroke defaults to "none")
    // http://www.w3.org/TR/SVG/painting.html#FillProperties
    if (element.hasAttribute("fill")) {
      this.setFill(element.getStringAttribute("fill"));
    }
    if (element.hasAttribute("style")) {
      var styleText   = element.getStringAttribute("style");
      var styleTokens = styleText.toString().split( ";" );

      for (var i = 0, j = styleTokens.length; i < j; i++) {
        var tokens = CommonFunctions.trim(styleTokens[i].split( ":" ));
        if (tokens[0] === "fill") {
            this.setFill(tokens[1]);
        } else if (tokens[0] === "fill-opacity") {
            this.setFillOpacity(tokens[1]);
        } else if (tokens[0] === "stroke") {
            this.setStroke(tokens[1]);
        } else if (tokens[0] === "stroke-width") {
            this.setStrokeWeight(tokens[1]);
        } else if (tokens[0] === "stroke-linecap") {
            this.setStrokeCap(tokens[1]);
        } else if (tokens[0] === "stroke-linejoin") {
            this.setStrokeJoin(tokens[1]);
        } else if (tokens[0] === "stroke-opacity") {
            this.setStrokeOpacity(tokens[1]);
        } else if (tokens[0] === "opacity") {
            this.setOpacity(tokens[1]);
        } // Other attributes are not yet implemented
      }
    }
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parseColors() helper function
   *
   * @param {String} opacityText the value of fillOpacity
   *
   * @see PShapeSVG#parseColors
   */
  PShapeSVG.prototype.setFillOpacity = function(opacityText) {
    this.fillOpacity = parseFloat(opacityText);
    this.fillColor   = this.fillOpacity * 255  << 24 |
                       this.fillColor & 0xFFFFFF;
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parseColors() helper function
   *
   * @param {String} fillText the value of fill
   *
   * @see PShapeSVG#parseColors
   */
  PShapeSVG.prototype.setFill = function (fillText) {
    var opacityMask = this.fillColor & 0xFF000000;
    if (fillText === "none") {
      this.fill = false;
    } else if (fillText.indexOf("#") === 0) {
      this.fill      = true;
      if (fillText.length === 4) {
        // convert #00F to #0000FF
        fillText = fillText.replace(/#(.)(.)(.)/,"#$1$1$2$2$3$3");
      }
      this.fillColor = opacityMask |
                       (parseInt(fillText.substring(1), 16 )) &
                       0xFFFFFF;
    } else if (fillText.indexOf("rgb") === 0) {
      this.fill      = true;
      this.fillColor = opacityMask | this.parseRGB(fillText);
    } else if (fillText.indexOf("url(#") === 0) {
      this.fillName = fillText.substring(5, fillText.length - 1 );
    } else if (colors[fillText]) {
      this.fill      = true;
      this.fillColor = opacityMask |
                       (parseInt(colors[fillText].substring(1), 16)) &
                       0xFFFFFF;
    }
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parseColors() helper function
   *
   * @param {String} opacity the value of opacity
   *
   * @see PShapeSVG#parseColors
   */
  PShapeSVG.prototype.setOpacity = function(opacity) {
    this.strokeColor = parseFloat(opacity) * 255 << 24 |
                       this.strokeColor & 0xFFFFFF;
    this.fillColor   = parseFloat(opacity) * 255 << 24 |
                       this.fillColor & 0xFFFFFF;
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parseColors() helper function
   *
   * @param {String} strokeText the value to set stroke to
   *
   * @see PShapeSVG#parseColors
   */
  PShapeSVG.prototype.setStroke = function(strokeText) {
    var opacityMask = this.strokeColor & 0xFF000000;
    if (strokeText === "none") {
      this.stroke = false;
    } else if (strokeText.charAt( 0 ) === "#") {
      this.stroke      = true;
      if (strokeText.length === 4) {
        // convert #00F to #0000FF
        strokeText = strokeText.replace(/#(.)(.)(.)/,"#$1$1$2$2$3$3");
      }
      this.strokeColor = opacityMask |
                         (parseInt( strokeText.substring( 1 ), 16 )) &
                         0xFFFFFF;
    } else if (strokeText.indexOf( "rgb" ) === 0 ) {
      this.stroke = true;
      this.strokeColor = opacityMask | this.parseRGB(strokeText);
    } else if (strokeText.indexOf( "url(#" ) === 0) {
      this.strokeName = strokeText.substring(5, strokeText.length - 1);
    } else if (colors[strokeText]) {
      this.stroke      = true;
      this.strokeColor = opacityMask |
                         (parseInt(colors[strokeText].substring(1), 16)) &
                         0xFFFFFF;
    }
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parseColors() helper function
   *
   * @param {String} weight the value to set strokeWeight to
   *
   * @see PShapeSVG#parseColors
   */
  PShapeSVG.prototype.setStrokeWeight = function(weight) {
    this.strokeWeight = this.parseUnitSize(weight);
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parseColors() helper function
   *
   * @param {String} linejoin the value to set strokeJoin to
   *
   * @see PShapeSVG#parseColors
   */
  PShapeSVG.prototype.setStrokeJoin = function(linejoin) {
    if (linejoin === "miter") {
      this.strokeJoin = PConstants.MITER;

    } else if (linejoin === "round") {
      this.strokeJoin = PConstants.ROUND;

    } else if (linejoin === "bevel") {
      this.strokeJoin = PConstants.BEVEL;
    }
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parseColors() helper function
   *
   * @param {String} linecap the value to set strokeCap to
   *
   * @see PShapeSVG#parseColors
   */
  PShapeSVG.prototype.setStrokeCap = function (linecap) {
    if (linecap === "butt") {
      this.strokeCap = PConstants.SQUARE;

    } else if (linecap === "round") {
      this.strokeCap = PConstants.ROUND;

    } else if (linecap === "square") {
      this.strokeCap = PConstants.PROJECT;
    }
  };
  /**
   * @member PShapeSVG
   * PShapeSVG.parseColors() helper function
   *
   * @param {String} opacityText the value to set stroke opacity to
   *
   * @see PShapeSVG#parseColors
   */
  PShapeSVG.prototype.setStrokeOpacity =  function (opacityText) {
    this.strokeOpacity = parseFloat(opacityText);
    this.strokeColor   = this.strokeOpacity * 255 << 24 |
                         this.strokeColor &
                         0xFFFFFF;
  };
  /**
   * @member PShapeSVG
   * The parseRGB() function parses an rbg() color string and returns a color int
   *
   * @param {String} color the color to parse in rbg() format
   *
   * @return {int} the equivalent color int
   */
  PShapeSVG.prototype.parseRGB = function(color) {
    var sub    = color.substring(color.indexOf('(') + 1, color.indexOf(')'));
    var values = sub.split(", ");
    return (values[0] << 16) | (values[1] << 8) | (values[2]);
  };
  /**
   * @member PShapeSVG
   * The parseUnitSize() function parse a size that may have a suffix for its units.
   * Ignoring cases where this could also be a percentage.
   * The <A HREF="http://www.w3.org/TR/SVG/coords.html#Units">units</A> spec:
   * <UL>
   * <LI>"1pt" equals "1.25px" (and therefore 1.25 user units)
   * <LI>"1pc" equals "15px" (and therefore 15 user units)
   * <LI>"1mm" would be "3.543307px" (3.543307 user units)
   * <LI>"1cm" equals "35.43307px" (and therefore 35.43307 user units)
   * <LI>"1in" equals "90px" (and therefore 90 user units)
   * </UL>
   */
  PShapeSVG.prototype.parseUnitSize = function (text) {
    var len = text.length - 2;
    if (len < 0) { return text; }
    if (text.indexOf("pt") === len) {
      return parseFloat(text.substring(0, len)) * 1.25;
    }
    if (text.indexOf("pc") === len) {
      return parseFloat( text.substring( 0, len)) * 15;
    }
    if (text.indexOf("mm") === len) {
      return parseFloat( text.substring(0, len)) * 3.543307;
    }
    if (text.indexOf("cm") === len) {
      return parseFloat(text.substring(0, len)) * 35.43307;
    }
    if (text.indexOf("in") === len) {
      return parseFloat(text.substring(0, len)) * 90;
    }
    if (text.indexOf("px") === len) {
      return parseFloat(text.substring(0, len));
    }
    return parseFloat(text);
  };

  return PShapeSVG;
};
