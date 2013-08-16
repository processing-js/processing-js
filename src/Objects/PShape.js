module.exports = function(options) {
  var PConstants = options.PConstants,
      PMatrix2D = options.PMatrix2D,
      PMatrix3D = options.PMatrix3D;

  /**
   * Datatype for storing shapes. Processing can currently load and display SVG (Scalable Vector Graphics) shapes.
   * Before a shape is used, it must be loaded with the <b>loadShape()</b> function. The <b>shape()</b> function is used to draw the shape to the display window.
   * The <b>PShape</b> object contain a group of methods, linked below, that can operate on the shape data.
   * <br><br>The <b>loadShape()</b> method supports SVG files created with Inkscape and Adobe Illustrator.
   * It is not a full SVG implementation, but offers some straightforward support for handling vector data.
   *
   * @param {int} family the shape type, one of GROUP, PRIMITIVE, PATH, or GEOMETRY
   *
   * @see #shape()
   * @see #loadShape()
   * @see #shapeMode()
   */
  var PShape = function(family) {
    this.family    = family || PConstants.GROUP;
    this.visible   = true;
    this.style     = true;
    this.children  = [];
    this.nameTable = [];
    this.params    = [];
    this.name      = "";
    this.image     = null;  //type PImage
    this.matrix    = null;
    this.kind      = null;
    this.close     = null;
    this.width     = null;
    this.height    = null;
    this.parent    = null;
  };
  /**
    * PShape methods
    * missing: findChild(), apply(), contains(), findChild(), getPrimitive(), getParams(), getVertex() , getVertexCount(),
    * getVertexCode() , getVertexCodes() , getVertexCodeCount(), getVertexX(), getVertexY(), getVertexZ()
    */
  PShape.prototype = {
    /**
     * @member PShape
     * The isVisible() function returns a boolean value "true" if the image is set to be visible, "false" if not. This is modified with the <b>setVisible()</b> parameter.
     * <br><br>The visibility of a shape is usually controlled by whatever program created the SVG file.
     * For instance, this parameter is controlled by showing or hiding the shape in the layers palette in Adobe Illustrator.
     *
     * @return {boolean}  returns "true" if the image is set to be visible, "false" if not
     */
    isVisible: function(){
      return this.visible;
    },
    /**
     * @member PShape
     * The setVisible() function sets the shape to be visible or invisible. This is determined by the value of the <b>visible</b> parameter.
     * <br><br>The visibility of a shape is usually controlled by whatever program created the SVG file.
     * For instance, this parameter is controlled by showing or hiding the shape in the layers palette in Adobe Illustrator.
     *
     * @param {boolean} visible "false" makes the shape invisible and "true" makes it visible
     */
    setVisible: function (visible){
      this.visible = visible;
    },
    /**
     * @member PShape
     * The disableStyle() function disables the shape's style data and uses Processing's current styles. Styles include attributes such as colors, stroke weight, and stroke joints.
     * Overrides this shape's style information and uses PGraphics styles and colors. Identical to ignoreStyles(true). Also disables styles for all child shapes.
     */
    disableStyle: function(){
      this.style = false;
      for(var i = 0, j=this.children.length; i<j; i++) {
        this.children[i].disableStyle();
      }
    },
    /**
     * @member PShape
     * The enableStyle() function enables the shape's style data and ignores Processing's current styles. Styles include attributes such as colors, stroke weight, and stroke joints.
     */
    enableStyle: function(){
      this.style = true;
      for(var i = 0, j=this.children.length; i<j; i++) {
        this.children[i].enableStyle();
      }
    },
    /**
     * @member PShape
     * The getFamily function returns the shape type
     *
     * @return {int} the shape type, one of GROUP, PRIMITIVE, PATH, or GEOMETRY
     */
    getFamily: function(){
      return this.family;
    },
    /**
     * @member PShape
     * The getWidth() function gets the width of the drawing area (not necessarily the shape boundary).
     */
    getWidth: function(){
      return this.width;
    },
    /**
     * @member PShape
     * The getHeight() function gets the height of the drawing area (not necessarily the shape boundary).
     */
    getHeight: function(){
      return this.height;
    },
    /**
     * @member PShape
     * The setName() function sets the name of the shape
     *
     * @param {String} name the name of the shape
     */
    setName: function(name){
      this.name = name;
    },
    /**
     * @member PShape
     * The getName() function returns the name of the shape
     *
     * @return {String} the name of the shape
     */
    getName: function(){
      return this.name;
    },
    /**
     * @member PShape
     * Called by the following (the shape() command adds the g)
     * PShape s = loadShapes("blah.svg");
     * shape(s);
     */
    draw: function(renderContext) {
      if(!renderContext) {
        throw "render context missing for draw() in PShape";
      }
      if (this.visible) {
        this.pre(renderContext);
        this.drawImpl(renderContext);
        this.post(renderContext);
      }
    },
    /**
     * @member PShape
     * the drawImpl() function draws the SVG document.
     */
    drawImpl: function(renderContext) {
      if (this.family === PConstants.GROUP) {
        this.drawGroup(renderContext);
      } else if (this.family === PConstants.PRIMITIVE) {
        this.drawPrimitive(renderContext);
      } else if (this.family === PConstants.GEOMETRY) {
        this.drawGeometry(renderContext);
      } else if (this.family === PConstants.PATH) {
        this.drawPath(renderContext);
      }
    },
    /**
     * @member PShape
     * The drawPath() function draws the <path> part of the SVG document.
     */
    drawPath: function(renderContext) {
      var i, j;
      if (this.vertices.length === 0) { return; }
      renderContext.beginShape();
      if (this.vertexCodes.length === 0) {  // each point is a simple vertex
        if (this.vertices[0].length === 2) {  // drawing 2D vertices
          for (i = 0, j = this.vertices.length; i < j; i++) {
            renderContext.vertex(this.vertices[i][0], this.vertices[i][1]);
          }
        } else {  // drawing 3D vertices
          for (i = 0, j = this.vertices.length; i < j; i++) {
            renderContext.vertex(this.vertices[i][0],
                                 this.vertices[i][1],
                                 this.vertices[i][2]);
          }
        }
      } else {  // coded set of vertices
        var index = 0;
        if (this.vertices[0].length === 2) {  // drawing a 2D path
          for (i = 0, j = this.vertexCodes.length; i < j; i++) {
            if (this.vertexCodes[i] === PConstants.VERTEX) {
              renderContext.vertex(this.vertices[index][0], this.vertices[index][1], this.vertices[index].moveTo);
              renderContext.breakShape = false;
              index++;
            } else if (this.vertexCodes[i] === PConstants.BEZIER_VERTEX) {
              renderContext.bezierVertex(this.vertices[index+0][0],
                                         this.vertices[index+0][1],
                                         this.vertices[index+1][0],
                                         this.vertices[index+1][1],
                                         this.vertices[index+2][0],
                                         this.vertices[index+2][1]);
              index += 3;
            } else if (this.vertexCodes[i] === PConstants.CURVE_VERTEX) {
              renderContext.curveVertex(this.vertices[index][0],
                                        this.vertices[index][1]);
              index++;
            } else if (this.vertexCodes[i] ===  PConstants.BREAK) {
              renderContext.breakShape = true;
            }
          }
        } else {  // drawing a 3D path
          for (i = 0, j = this.vertexCodes.length; i < j; i++) {
            if (this.vertexCodes[i] === PConstants.VERTEX) {
              renderContext.vertex(this.vertices[index][0],
                                   this.vertices[index][1],
                                   this.vertices[index][2]);
              if (this.vertices[index].moveTo === true) {
                vertArray[vertArray.length-1].moveTo = true;
              } else if (this.vertices[index].moveTo === false) {
                vertArray[vertArray.length-1].moveTo = false;
              }
              renderContext.breakShape = false;
            } else if (this.vertexCodes[i] ===  PConstants.BEZIER_VERTEX) {
              renderContext.bezierVertex(this.vertices[index+0][0],
                                         this.vertices[index+0][1],
                                         this.vertices[index+0][2],
                                         this.vertices[index+1][0],
                                         this.vertices[index+1][1],
                                         this.vertices[index+1][2],
                                         this.vertices[index+2][0],
                                         this.vertices[index+2][1],
                                         this.vertices[index+2][2]);
              index += 3;
            } else if (this.vertexCodes[i] === PConstants.CURVE_VERTEX) {
              renderContext.curveVertex(this.vertices[index][0],
                                        this.vertices[index][1],
                                        this.vertices[index][2]);
              index++;
            } else if (this.vertexCodes[i] === PConstants.BREAK) {
              renderContext.breakShape = true;
            }
          }
        }
      }
      renderContext.endShape(this.close ? PConstants.CLOSE : PConstants.OPEN);
    },
    /**
     * @member PShape
     * The drawGeometry() function draws the geometry part of the SVG document.
     */
    drawGeometry: function(renderContext) {
      var i, j;
      renderContext.beginShape(this.kind);
      if (this.style) {
        for (i = 0, j = this.vertices.length; i < j; i++) {
          renderContext.vertex(this.vertices[i]);
        }
      } else {
        for (i = 0, j = this.vertices.length; i < j; i++) {
          var vert = this.vertices[i];
          if (vert[2] === 0) {
            renderContext.vertex(vert[0], vert[1]);
          } else {
            renderContext.vertex(vert[0], vert[1], vert[2]);
          }
        }
      }
      renderContext.endShape();
    },
    /**
     * @member PShape
     * The drawGroup() function draws the <g> part of the SVG document.
     */
    drawGroup: function(renderContext) {
      for (var i = 0, j = this.children.length; i < j; i++) {
        this.children[i].draw(renderContext);
      }
    },
    /**
     * @member PShape
     * The drawPrimitive() function draws SVG document shape elements. These can be point, line, triangle, quad, rect, ellipse, arc, box, or sphere.
     */
    drawPrimitive: function(renderContext) {
      if (this.kind === PConstants.POINT) {
        renderContext.point(this.params[0], this.params[1]);
      } else if (this.kind === PConstants.LINE) {
        if (this.params.length === 4) {  // 2D
          renderContext.line(this.params[0], this.params[1],
                            this.params[2], this.params[3]);
        } else {  // 3D
          renderContext.line(this.params[0], this.params[1], this.params[2],
                             this.params[3], this.params[4], this.params[5]);
        }
      } else if (this.kind === PConstants.TRIANGLE) {
        renderContext.triangle(this.params[0], this.params[1],
                               this.params[2], this.params[3],
                               this.params[4], this.params[5]);
      } else if (this.kind === PConstants.QUAD) {
        renderContext.quad(this.params[0], this.params[1],
                           this.params[2], this.params[3],
                           this.params[4], this.params[5],
                           this.params[6], this.params[7]);
      } else if (this.kind === PConstants.RECT) {
        if (this.image !== null) {
          var imMode = imageModeConvert;
          renderContext.imageMode(PConstants.CORNER);
          renderContext.image(this.image,
                              this.params[0],
                              this.params[1],
                              this.params[2],
                              this.params[3]);
          imageModeConvert = imMode;
        } else {
          var rcMode = renderContext.curRectMode;
          renderContext.rectMode(PConstants.CORNER);
          renderContext.rect(this.params[0],
                             this.params[1],
                             this.params[2],
                             this.params[3]);
          renderContext.curRectMode = rcMode;
        }
      } else if (this.kind === PConstants.ELLIPSE) {
        var elMode = renderContext.curEllipseMode;
        renderContext.ellipseMode(PConstants.CORNER);
        renderContext.ellipse(this.params[0],
                              this.params[1],
                              this.params[2],
                              this.params[3]);
        renderContext.curEllipseMode = elMode;
      } else if (this.kind === PConstants.ARC) {
        var eMode = curEllipseMode;
        renderContext.ellipseMode(PConstants.CORNER);
        renderContext.arc(this.params[0],
                          this.params[1],
                          this.params[2],
                          this.params[3],
                          this.params[4],
                          this.params[5]);
        curEllipseMode = eMode;
      } else if (this.kind === PConstants.BOX) {
        if (this.params.length === 1) {
          renderContext.box(this.params[0]);
        } else {
          renderContext.box(this.params[0], this.params[1], this.params[2]);
        }
      } else if (this.kind === PConstants.SPHERE) {
        renderContext.sphere(this.params[0]);
      }
    },
    /**
     * @member PShape
     * The pre() function performs the preparations before the SVG is drawn. This includes doing transformations and storing previous styles.
     */
    pre: function(renderContext) {
      if (this.matrix) {
        renderContext.pushMatrix();
        renderContext.transform(this.matrix);
      }
      if (this.style) {
        renderContext.pushStyle();
        this.styles(renderContext);
      }
    },
    /**
     * @member PShape
     * The post() function performs the necessary actions after the SVG is drawn. This includes removing transformations and removing added styles.
     */
    post: function(renderContext) {
      if (this.matrix) {
        renderContext.popMatrix();
      }
      if (this.style) {
        renderContext.popStyle();
      }
    },
    /**
     * @member PShape
     * The styles() function changes the Processing's current styles
     */
    styles: function(renderContext) {
      if (this.stroke) {
        renderContext.stroke(this.strokeColor);
        renderContext.strokeWeight(this.strokeWeight);
        renderContext.strokeCap(this.strokeCap);
        renderContext.strokeJoin(this.strokeJoin);
      } else {
        renderContext.noStroke();
      }

      if (this.fill) {
        renderContext.fill(this.fillColor);

      } else {
        renderContext.noFill();
      }
    },
    /**
     * @member PShape
     * The getChild() function extracts a child shape from a parent shape. Specify the name of the shape with the <b>target</b> parameter or the
     * layer position of the shape to get with the <b>index</b> parameter.
     * The shape is returned as a <b>PShape</b> object, or <b>null</b> is returned if there is an error.
     *
     * @param {String} target   the name of the shape to get
     * @param {int} index   the layer position of the shape to get
     *
     * @return {PShape} returns a child element of a shape as a PShape object or null if there is an error
     */
    getChild: function(child) {
      var i, j;
      if (typeof child === 'number') {
        return this.children[child];
      }
      var found;
      if(child === "" || this.name === child){
        return this;
      }
      if(this.nameTable.length > 0) {
        for(i = 0, j = this.nameTable.length; i < j || found; i++) {
          if(this.nameTable[i].getName === child) {
            found = this.nameTable[i];
            break;
          }
        }
        if (found) { return found; }
      }
      for(i = 0, j = this.children.length; i < j; i++) {
        found = this.children[i].getChild(child);
        if(found) { return found; }
      }
      return null;
    },
    /**
     * @member PShape
     * The getChildCount() returns the number of children
     *
     * @return {int} returns a count of children
     */
    getChildCount: function () {
      return this.children.length;
    },
    /**
     * @member PShape
     * The addChild() adds a child to the PShape.
     *
     * @param {PShape} child the child to add
     */
    addChild: function( child ) {
      this.children.push(child);
      child.parent = this;
      if (child.getName() !== null) {
        this.addName(child.getName(), child);
      }
    },
    /**
     * @member PShape
     * The addName() functions adds a shape to the name lookup table.
     *
     * @param {String} name   the name to be added
     * @param {PShape} shape  the shape
     */
    addName: function(name,  shape) {
      if (this.parent !== null) {
        this.parent.addName( name, shape );
      } else {
        this.nameTable.push( [name, shape] );
      }
    },
    /**
     * @member PShape
     * The translate() function specifies an amount to displace the shape. The <b>x</b> parameter specifies left/right translation, the <b>y</b> parameter specifies up/down translation, and the <b>z</b> parameter specifies translations toward/away from the screen.
     * Subsequent calls to the method accumulates the effect. For example, calling <b>translate(50, 0)</b> and then <b>translate(20, 0)</b> is the same as <b>translate(70, 0)</b>.
     * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
     * <br><br>Using this method with the <b>z</b> parameter requires using the P3D or OPENGL parameter in combination with size.
     *
     * @param {int|float} x left/right translation
     * @param {int|float} y up/down translation
     * @param {int|float} z forward/back translation
     *
     * @see PMatrix2D#translate
     * @see PMatrix3D#translate
     */
    translate: function() {
      if(arguments.length === 2)
      {
        this.checkMatrix(2);
        this.matrix.translate(arguments[0], arguments[1]);
      } else {
        this.checkMatrix(3);
        this.matrix.translate(arguments[0], arguments[1], 0);
      }
    },
    /**
     * @member PShape
     * The checkMatrix() function makes sure that the shape's matrix is 1) not null, and 2) has a matrix
     * that can handle <em>at least</em> the specified number of dimensions.
     *
     * @param {int} dimensions the specified number of dimensions
     */
    checkMatrix: function(dimensions) {
      if(this.matrix === null) {
        if(dimensions === 2) {
          this.matrix = new PMatrix2D();
        } else {
          this.matrix = new PMatrix3D();
        }
      }else if(dimensions === 3 && this.matrix instanceof PMatrix2D) {
        this.matrix = new PMatrix3D();
      }
    },
    /**
     * @member PShape
     * The rotateX() function rotates a shape around the x-axis the amount specified by the <b>angle</b> parameter. Angles should be specified in radians (values from 0 to TWO_PI) or converted to radians with the <b>radians()</b> method.
     * <br><br>Shapes are always rotated around the upper-left corner of their bounding box. Positive numbers rotate objects in a clockwise direction.
     * Subsequent calls to the method accumulates the effect. For example, calling <b>rotateX(HALF_PI)</b> and then <b>rotateX(HALF_PI)</b> is the same as <b>rotateX(PI)</b>.
     * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
     * <br><br>This method requires a 3D renderer. You need to pass P3D or OPENGL as a third parameter into the <b>size()</b> method as shown in the example above.
     *
     * @param {float}angle angle of rotation specified in radians
     *
     * @see PMatrix3D#rotateX
     */
    rotateX: function(angle) {
      this.rotate(angle, 1, 0, 0);
    },
    /**
     * @member PShape
     * The rotateY() function rotates a shape around the y-axis the amount specified by the <b>angle</b> parameter. Angles should be specified in radians (values from 0 to TWO_PI) or converted to radians with the <b>radians()</b> method.
     * <br><br>Shapes are always rotated around the upper-left corner of their bounding box. Positive numbers rotate objects in a clockwise direction.
     * Subsequent calls to the method accumulates the effect. For example, calling <b>rotateY(HALF_PI)</b> and then <b>rotateY(HALF_PI)</b> is the same as <b>rotateY(PI)</b>.
     * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
     * <br><br>This method requires a 3D renderer. You need to pass P3D or OPENGL as a third parameter into the <b>size()</b> method as shown in the example above.
     *
     * @param {float}angle angle of rotation specified in radians
     *
     * @see PMatrix3D#rotateY
     */
    rotateY: function(angle) {
      this.rotate(angle, 0, 1, 0);
    },
    /**
     * @member PShape
     * The rotateZ() function rotates a shape around the z-axis the amount specified by the <b>angle</b> parameter. Angles should be specified in radians (values from 0 to TWO_PI) or converted to radians with the <b>radians()</b> method.
     * <br><br>Shapes are always rotated around the upper-left corner of their bounding box. Positive numbers rotate objects in a clockwise direction.
     * Subsequent calls to the method accumulates the effect. For example, calling <b>rotateZ(HALF_PI)</b> and then <b>rotateZ(HALF_PI)</b> is the same as <b>rotateZ(PI)</b>.
     * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
     * <br><br>This method requires a 3D renderer. You need to pass P3D or OPENGL as a third parameter into the <b>size()</b> method as shown in the example above.
     *
     * @param {float}angle angle of rotation specified in radians
     *
     * @see PMatrix3D#rotateZ
     */
    rotateZ: function(angle) {
      this.rotate(angle, 0, 0, 1);
    },
    /**
     * @member PShape
     * The rotate() function rotates a shape the amount specified by the <b>angle</b> parameter. Angles should be specified in radians (values from 0 to TWO_PI) or converted to radians with the <b>radians()</b> method.
     * <br><br>Shapes are always rotated around the upper-left corner of their bounding box. Positive numbers rotate objects in a clockwise direction.
     * Transformations apply to everything that happens after and subsequent calls to the method accumulates the effect.
     * For example, calling <b>rotate(HALF_PI)</b> and then <b>rotate(HALF_PI)</b> is the same as <b>rotate(PI)</b>.
     * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
     * If optional parameters x,y,z are supplied, the rotate is about the point (x, y, z).
     *
     * @param {float}angle  angle of rotation specified in radians
     * @param {float}x      x-coordinate of the point
     * @param {float}y      y-coordinate of the point
     * @param {float}z      z-coordinate of the point
     * @see PMatrix2D#rotate
     * @see PMatrix3D#rotate
     */
    rotate: function() {
      if(arguments.length === 1){
        this.checkMatrix(2);
        this.matrix.rotate(arguments[0]);
      } else {
        this.checkMatrix(3);
        this.matrix.rotate(arguments[0],
                           arguments[1],
                           arguments[2],
                           arguments[3]);
      }
    },
    /**
     * @member PShape
     * The scale() function increases or decreases the size of a shape by expanding and contracting vertices. Shapes always scale from the relative origin of their bounding box.
     * Scale values are specified as decimal percentages. For example, the method call <b>scale(2.0)</b> increases the dimension of a shape by 200%.
     * Subsequent calls to the method multiply the effect. For example, calling <b>scale(2.0)</b> and then <b>scale(1.5)</b> is the same as <b>scale(3.0)</b>.
     * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
     * <br><br>Using this fuction with the <b>z</b> parameter requires passing P3D or OPENGL into the size() parameter.
     *
     * @param {float}s      percentage to scale the object
     * @param {float}x      percentage to scale the object in the x-axis
     * @param {float}y      percentage to scale the object in the y-axis
     * @param {float}z      percentage to scale the object in the z-axis
     *
     * @see PMatrix2D#scale
     * @see PMatrix3D#scale
     */
    scale: function() {
      if(arguments.length === 2) {
        this.checkMatrix(2);
        this.matrix.scale(arguments[0], arguments[1]);
      } else if (arguments.length === 3) {
        this.checkMatrix(2);
        this.matrix.scale(arguments[0], arguments[1], arguments[2]);
      } else {
        this.checkMatrix(2);
        this.matrix.scale(arguments[0]);
      }
    },
    /**
     * @member PShape
     * The resetMatrix() function resets the matrix
     *
     * @see PMatrix2D#reset
     * @see PMatrix3D#reset
     */
    resetMatrix: function() {
      this.checkMatrix(2);
      this.matrix.reset();
    },
    /**
     * @member PShape
     * The applyMatrix() function multiplies this matrix by another matrix of type PMatrix3D or PMatrix2D.
     * Individual elements can also be provided
     *
     * @param {PMatrix3D|PMatrix2D} matrix   the matrix to multiply by
     *
     * @see PMatrix2D#apply
     * @see PMatrix3D#apply
     */
    applyMatrix: function(matrix) {
      if (arguments.length === 1) {
        this.applyMatrix(matrix.elements[0],
                         matrix.elements[1], 0,
                         matrix.elements[2],
                         matrix.elements[3],
                         matrix.elements[4], 0,
                         matrix.elements[5],
                         0, 0, 1, 0,
                         0, 0, 0, 1);
      } else if (arguments.length === 6) {
        this.checkMatrix(2);
        this.matrix.apply(arguments[0], arguments[1], arguments[2], 0,
                          arguments[3], arguments[4], arguments[5], 0,
                          0,   0,   1,   0,
                          0,   0,   0,   1);

      } else if (arguments.length === 16) {
        this.checkMatrix(3);
        this.matrix.apply(arguments[0],
                          arguments[1],
                          arguments[2],
                          arguments[3],
                          arguments[4],
                          arguments[5],
                          arguments[6],
                          arguments[7],
                          arguments[8],
                          arguments[9],
                          arguments[10],
                          arguments[11],
                          arguments[12],
                          arguments[13],
                          arguments[14],
                          arguments[15]);
      }
    }
  };

  return PShape;
};