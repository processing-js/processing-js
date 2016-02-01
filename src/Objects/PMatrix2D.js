module.exports = function(options, undef) {

  // FIXME: hack
  var p = options.p;

  /**
   * PMatrix2D is a 3x2 affine matrix implementation. The constructor accepts another PMatrix2D or a list of six float elements.
   * If no parameters are provided the matrix is set to the identity matrix.
   *
   * @param {PMatrix2D} matrix  the initial matrix to set to
   * @param {float} m00         the first element of the matrix
   * @param {float} m01         the second element of the matrix
   * @param {float} m02         the third element of the matrix
   * @param {float} m10         the fourth element of the matrix
   * @param {float} m11         the fifth element of the matrix
   * @param {float} m12         the sixth element of the matrix
   */
  var PMatrix2D = function() {
    if (arguments.length === 0) {
      this.reset();
    } else if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
      this.set(arguments[0].array());
    } else if (arguments.length === 6) {
      this.set(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
    }
  };

  /**
   * PMatrix2D methods
   */
  PMatrix2D.prototype = {
    /**
     * @member PMatrix2D
     * The set() function sets the matrix elements. The function accepts either another PMatrix2D, an array of elements, or a list of six floats.
     *
     * @param {PMatrix2D} matrix    the matrix to set this matrix to
     * @param {float[]} elements    an array of elements to set this matrix to
     * @param {float} m00           the first element of the matrix
     * @param {float} m01           the third element of the matrix
     * @param {float} m10           the fourth element of the matrix
     * @param {float} m11           the fith element of the matrix
     * @param {float} m12           the sixth element of the matrix
     */
    set: function() {
      if (arguments.length === 6) {
        var a = arguments;
        this.set([a[0], a[1], a[2],
                  a[3], a[4], a[5]]);
      } else if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
        this.elements = arguments[0].array();
      } else if (arguments.length === 1 && arguments[0] instanceof Array) {
        this.elements = arguments[0].slice();
      }
    },
    /**
     * @member PMatrix2D
     * The get() function returns a copy of this PMatrix2D.
     *
     * @return {PMatrix2D} a copy of this PMatrix2D
     */
    get: function() {
      var outgoing = new PMatrix2D();
      outgoing.set(this.elements);
      return outgoing;
    },
    /**
     * @member PMatrix2D
     * The reset() function sets this PMatrix2D to the identity matrix.
     */
    reset: function() {
      this.set([1, 0, 0, 0, 1, 0]);
    },
    /**
     * @member PMatrix2D
     * The array() function returns a copy of the element values.
     * @addon
     *
     * @return {float[]} returns a copy of the element values
     */
    array: function array() {
      return this.elements.slice();
    },
    /**
     * @member PMatrix2D
     * The translate() function translates this matrix by moving the current coordinates to the location specified by tx and ty.
     *
     * @param {float} tx  the x-axis coordinate to move to
     * @param {float} ty  the y-axis coordinate to move to
     */
    translate: function(tx, ty) {
      this.elements[2] = tx * this.elements[0] + ty * this.elements[1] + this.elements[2];
      this.elements[5] = tx * this.elements[3] + ty * this.elements[4] + this.elements[5];
    },
    /**
     * @member PMatrix2D
     * The invTranslate() function translates this matrix by moving the current coordinates to the negative location specified by tx and ty.
     *
     * @param {float} tx  the x-axis coordinate to move to
     * @param {float} ty  the y-axis coordinate to move to
     */
    invTranslate: function(tx, ty) {
      this.translate(-tx, -ty);
    },
     /**
     * @member PMatrix2D
     * The transpose() function is not used in processingjs.
     */
    transpose: function() {
      // Does nothing in Processing.
    },
    /**
     * @member PMatrix2D
     * The mult() function multiplied this matrix.
     * If two array elements are passed in the function will multiply a two element vector against this matrix.
     * If target is null or not length four, a new float array will be returned.
     * The values for vec and target can be the same (though that's less efficient).
     * If two PVectors are passed in the function multiply the x and y coordinates of a PVector against this matrix.
     *
     * @param {PVector} source, target  the PVectors used to multiply this matrix
     * @param {float[]} source, target  the arrays used to multiply this matrix
     *
     * @return {PVector|float[]} returns a PVector or an array representing the new matrix
     */
    mult: function(source, target) {
      var x, y;
      if (source instanceof PVector) {
        x = source.x;
        y = source.y;
        if (!target) {
          target = new PVector();
        }
      } else if (source instanceof Array) {
        x = source[0];
        y = source[1];
        if (!target) {
          target = [];
        }
      }
      if (target instanceof Array) {
        target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2];
        target[1] = this.elements[3] * x + this.elements[4] * y + this.elements[5];
      } else if (target instanceof PVector) {
        target.x = this.elements[0] * x + this.elements[1] * y + this.elements[2];
        target.y = this.elements[3] * x + this.elements[4] * y + this.elements[5];
        target.z = 0;
      }
      return target;
    },
    /**
     * @member PMatrix2D
     * The multX() function calculates the x component of a vector from a transformation.
     *
     * @param {float} x the x component of the vector being transformed
     * @param {float} y the y component of the vector being transformed
     *
     * @return {float} returnes the result of the calculation
     */
    multX: function(x, y) {
      return (x * this.elements[0] + y * this.elements[1] + this.elements[2]);
    },
    /**
     * @member PMatrix2D
     * The multY() function calculates the y component of a vector from a transformation.
     *
     * @param {float} x the x component of the vector being transformed
     * @param {float} y the y component of the vector being transformed
     *
     * @return {float} returnes the result of the calculation
     */
    multY: function(x, y) {
      return (x * this.elements[3] + y * this.elements[4] + this.elements[5]);
    },
    /**
     * @member PMatrix2D
     * The skewX() function skews the matrix along the x-axis the amount specified by the angle parameter.
     * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
     *
     * @param {float} angle  angle of skew specified in radians
     */
    skewX: function(angle) {
      this.apply(1, 0, 1, angle, 0, 0);
    },
    /**
     * @member PMatrix2D
     * The skewY() function skews the matrix along the y-axis the amount specified by the angle parameter.
     * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
     *
     * @param {float} angle  angle of skew specified in radians
     */
    skewY: function(angle) {
      this.apply(1, 0, 1,  0, angle, 0);
    },
    /**
     * @member PMatrix2D
     * The shearX() function shears the matrix along the x-axis the amount specified by the angle parameter.
     * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
     *
     * @param {float} angle  angle of skew specified in radians
     */
    shearX: function(angle) {
      this.apply(1, 0, 1, Math.tan(angle) , 0, 0);
    },
    /**
     * @member PMatrix2D
     * The shearY() function shears the matrix along the y-axis the amount specified by the angle parameter.
     * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
     *
     * @param {float} angle  angle of skew specified in radians
     */
    shearY: function(angle) {
      this.apply(1, 0, 1,  0, Math.tan(angle), 0);
    },
    /**
     * @member PMatrix2D
     * The determinant() function calvculates the determinant of this matrix.
     *
     * @return {float} the determinant of the matrix
     */
    determinant: function() {
      return (this.elements[0] * this.elements[4] - this.elements[1] * this.elements[3]);
    },
    /**
     * @member PMatrix2D
     * The invert() function inverts this matrix
     *
     * @return {boolean} true if successful
     */
    invert: function() {
      var d = this.determinant();
      if (Math.abs( d ) > PConstants.MIN_INT) {
        var old00 = this.elements[0];
        var old01 = this.elements[1];
        var old02 = this.elements[2];
        var old10 = this.elements[3];
        var old11 = this.elements[4];
        var old12 = this.elements[5];
        this.elements[0] =  old11 / d;
        this.elements[3] = -old10 / d;
        this.elements[1] = -old01 / d;
        this.elements[4] =  old00 / d;
        this.elements[2] = (old01 * old12 - old11 * old02) / d;
        this.elements[5] = (old10 * old02 - old00 * old12) / d;
        return true;
      }
      return false;
    },
    /**
     * @member PMatrix2D
     * The scale() function increases or decreases the size of a shape by expanding and contracting vertices. When only one parameter is specified scale will occur in all dimensions.
     * This is equivalent to a two parameter call.
     *
     * @param {float} sx  the amount to scale on the x-axis
     * @param {float} sy  the amount to scale on the y-axis
     */
    scale: function(sx, sy) {
      if (sx && sy === undef) {
        sy = sx;
      }
      if (sx && sy) {
        this.elements[0] *= sx;
        this.elements[1] *= sy;
        this.elements[3] *= sx;
        this.elements[4] *= sy;
      }
    },
     /**
      * @member PMatrix2D
      * The invScale() function decreases or increases the size of a shape by contracting and expanding vertices. When only one parameter is specified scale will occur in all dimensions.
      * This is equivalent to a two parameter call.
      *
      * @param {float} sx  the amount to scale on the x-axis
      * @param {float} sy  the amount to scale on the y-axis
      */
    invScale: function(sx, sy) {
      if (sx && !sy) {
        sy = sx;
      }
      this.scale(1 / sx, 1 / sy);
    },
    /**
     * @member PMatrix2D
     * The apply() function multiplies the current matrix by the one specified through the parameters. Note that either a PMatrix2D or a list of floats can be passed in.
     *
     * @param {PMatrix2D} matrix    the matrix to apply this matrix to
     * @param {float} m00           the first element of the matrix
     * @param {float} m01           the third element of the matrix
     * @param {float} m10           the fourth element of the matrix
     * @param {float} m11           the fith element of the matrix
     * @param {float} m12           the sixth element of the matrix
     */
    apply: function() {
      var source;
      if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
        source = arguments[0].array();
      } else if (arguments.length === 6) {
        source = Array.prototype.slice.call(arguments);
      } else if (arguments.length === 1 && arguments[0] instanceof Array) {
        source = arguments[0];
      }

      var result = [0, 0, this.elements[2],
                    0, 0, this.elements[5]];
      var e = 0;
      for (var row = 0; row < 2; row++) {
        for (var col = 0; col < 3; col++, e++) {
          result[e] += this.elements[row * 3 + 0] * source[col + 0] +
                       this.elements[row * 3 + 1] * source[col + 3];
        }
      }
      this.elements = result.slice();
    },
    /**
     * @member PMatrix2D
     * The preApply() function applies another matrix to the left of this one. Note that either a PMatrix2D or elements of a matrix can be passed in.
     *
     * @param {PMatrix2D} matrix    the matrix to apply this matrix to
     * @param {float} m00           the first element of the matrix
     * @param {float} m01           the third element of the matrix
     * @param {float} m10           the fourth element of the matrix
     * @param {float} m11           the fith element of the matrix
     * @param {float} m12           the sixth element of the matrix
     */
    preApply: function() {
      var source;
      if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
        source = arguments[0].array();
      } else if (arguments.length === 6) {
        source = Array.prototype.slice.call(arguments);
      } else if (arguments.length === 1 && arguments[0] instanceof Array) {
        source = arguments[0];
      }
      var result = [0, 0, source[2],
                    0, 0, source[5]];
      result[2] = source[2] + this.elements[2] * source[0] + this.elements[5] * source[1];
      result[5] = source[5] + this.elements[2] * source[3] + this.elements[5] * source[4];
      result[0] = this.elements[0] * source[0] + this.elements[3] * source[1];
      result[3] = this.elements[0] * source[3] + this.elements[3] * source[4];
      result[1] = this.elements[1] * source[0] + this.elements[4] * source[1];
      result[4] = this.elements[1] * source[3] + this.elements[4] * source[4];
      this.elements = result.slice();
    },
    /**
     * @member PMatrix2D
     * The rotate() function rotates the matrix.
     *
     * @param {float} angle         the angle of rotation in radiants
     */
    rotate: function(angle) {
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      var temp1 = this.elements[0];
      var temp2 = this.elements[1];
      this.elements[0] =  c * temp1 + s * temp2;
      this.elements[1] = -s * temp1 + c * temp2;
      temp1 = this.elements[3];
      temp2 = this.elements[4];
      this.elements[3] =  c * temp1 + s * temp2;
      this.elements[4] = -s * temp1 + c * temp2;
    },
    /**
     * @member PMatrix2D
     * The rotateZ() function rotates the matrix.
     *
     * @param {float} angle         the angle of rotation in radiants
     */
    rotateZ: function(angle) {
      this.rotate(angle);
    },
    /**
     * @member PMatrix2D
     * The invRotateZ() function rotates the matrix in opposite direction.
     *
     * @param {float} angle         the angle of rotation in radiants
     */
    invRotateZ: function(angle) {
      this.rotateZ(angle - Math.PI);
    },
    /**
     * @member PMatrix2D
     * The print() function prints out the elements of this matrix
     */
    print: function() {
      var digits = printMatrixHelper(this.elements);
      var output = "" + p.nfs(this.elements[0], digits, 4) + " " +
                        p.nfs(this.elements[1], digits, 4) + " " +
                        p.nfs(this.elements[2], digits, 4) + "\n" +
                        p.nfs(this.elements[3], digits, 4) + " " +
                        p.nfs(this.elements[4], digits, 4) + " " +
                        p.nfs(this.elements[5], digits, 4) + "\n\n";
      p.println(output);
    }
  };

  return PMatrix2D;
};
