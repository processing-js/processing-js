module.exports = function(options, undef) {

  // FIXME: hack
  var p = options.p;

  /**
   * PMatrix3D is a 4x4  matrix implementation. The constructor accepts another PMatrix3D or a list of six or sixteen float elements.
   * If no parameters are provided the matrix is set to the identity matrix.
   */
  var PMatrix3D = function() {
    // When a matrix is created, it is set to an identity matrix
    this.reset();
  };

  /**
   * PMatrix3D methods
   */
  PMatrix3D.prototype = {
    /**
     * @member PMatrix2D
     * The set() function sets the matrix elements. The function accepts either another PMatrix3D, an array of elements, or a list of six or sixteen floats.
     *
     * @param {PMatrix3D} matrix    the initial matrix to set to
     * @param {float[]} elements    an array of elements to set this matrix to
     * @param {float} m00           the first element of the matrix
     * @param {float} m01           the second element of the matrix
     * @param {float} m02           the third element of the matrix
     * @param {float} m03           the fourth element of the matrix
     * @param {float} m10           the fifth element of the matrix
     * @param {float} m11           the sixth element of the matrix
     * @param {float} m12           the seventh element of the matrix
     * @param {float} m13           the eight element of the matrix
     * @param {float} m20           the nineth element of the matrix
     * @param {float} m21           the tenth element of the matrix
     * @param {float} m22           the eleventh element of the matrix
     * @param {float} m23           the twelveth element of the matrix
     * @param {float} m30           the thirteenth element of the matrix
     * @param {float} m31           the fourtheenth element of the matrix
     * @param {float} m32           the fivetheenth element of the matrix
     * @param {float} m33           the sixteenth element of the matrix
     */
    set: function() {
      if (arguments.length === 16) {
        this.elements = Array.prototype.slice.call(arguments);
      } else if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
        this.elements = arguments[0].array();
      } else if (arguments.length === 1 && arguments[0] instanceof Array) {
        this.elements = arguments[0].slice();
      }
    },
    /**
     * @member PMatrix3D
     * The get() function returns a copy of this PMatrix3D.
     *
     * @return {PMatrix3D} a copy of this PMatrix3D
     */
    get: function() {
      var outgoing = new PMatrix3D();
      outgoing.set(this.elements);
      return outgoing;
    },
    /**
     * @member PMatrix3D
     * The reset() function sets this PMatrix3D to the identity matrix.
     */
    reset: function() {
      this.elements = [1,0,0,0,
                       0,1,0,0,
                       0,0,1,0,
                       0,0,0,1];
    },
    /**
     * @member PMatrix3D
     * The array() function returns a copy of the element values.
     * @addon
     *
     * @return {float[]} returns a copy of the element values
     */
    array: function array() {
      return this.elements.slice();
    },
    /**
     * @member PMatrix3D
     * The translate() function translates this matrix by moving the current coordinates to the location specified by tx, ty, and tz.
     *
     * @param {float} tx  the x-axis coordinate to move to
     * @param {float} ty  the y-axis coordinate to move to
     * @param {float} tz  the z-axis coordinate to move to
     */
    translate: function(tx, ty, tz) {
      if (tz === undef) {
        tz = 0;
      }

      this.elements[3]  += tx * this.elements[0]  + ty * this.elements[1]  + tz * this.elements[2];
      this.elements[7]  += tx * this.elements[4]  + ty * this.elements[5]  + tz * this.elements[6];
      this.elements[11] += tx * this.elements[8]  + ty * this.elements[9]  + tz * this.elements[10];
      this.elements[15] += tx * this.elements[12] + ty * this.elements[13] + tz * this.elements[14];
    },
    /**
     * @member PMatrix3D
     * The transpose() function transpose this matrix.
     */
    transpose: function() {
      var temp = this.elements[4];
      this.elements[4] = this.elements[1];
      this.elements[1] = temp;

      temp = this.elements[8];
      this.elements[8] = this.elements[2];
      this.elements[2] = temp;

      temp = this.elements[6];
      this.elements[6] = this.elements[9];
      this.elements[9] = temp;

      temp = this.elements[3];
      this.elements[3] = this.elements[12];
      this.elements[12] = temp;

      temp = this.elements[7];
      this.elements[7] = this.elements[13];
      this.elements[13] = temp;

      temp = this.elements[11];
      this.elements[11] = this.elements[14];
      this.elements[14] = temp;
    },
    /**
     * @member PMatrix3D
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
      var x, y, z, w;
      if (source instanceof PVector) {
        x = source.x;
        y = source.y;
        z = source.z;
        w = 1;
        if (!target) {
          target = new PVector();
        }
      } else if (source instanceof Array) {
        x = source[0];
        y = source[1];
        z = source[2];
        w = source[3] || 1;

        if ( !target || (target.length !== 3 && target.length !== 4) ) {
          target = [0, 0, 0];
        }
      }

      if (target instanceof Array) {
        if (target.length === 3) {
          target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
          target[1] = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
          target[2] = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
        } else if (target.length === 4) {
          target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3] * w;
          target[1] = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7] * w;
          target[2] = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11] * w;
          target[3] = this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15] * w;
        }
      }
      if (target instanceof PVector) {
        target.x = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
        target.y = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
        target.z = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
      }
      return target;
    },
    /**
     * @member PMatrix3D
     * The preApply() function applies another matrix to the left of this one. Note that either a PMatrix3D or elements of a matrix can be passed in.
     *
     * @param {PMatrix3D} matrix    the matrix to apply this matrix to
     * @param {float} m00           the first element of the matrix
     * @param {float} m01           the second element of the matrix
     * @param {float} m02           the third element of the matrix
     * @param {float} m03           the fourth element of the matrix
     * @param {float} m10           the fifth element of the matrix
     * @param {float} m11           the sixth element of the matrix
     * @param {float} m12           the seventh element of the matrix
     * @param {float} m13           the eight element of the matrix
     * @param {float} m20           the nineth element of the matrix
     * @param {float} m21           the tenth element of the matrix
     * @param {float} m22           the eleventh element of the matrix
     * @param {float} m23           the twelveth element of the matrix
     * @param {float} m30           the thirteenth element of the matrix
     * @param {float} m31           the fourtheenth element of the matrix
     * @param {float} m32           the fivetheenth element of the matrix
     * @param {float} m33           the sixteenth element of the matrix
     */
    preApply: function() {
      var source;
      if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
        source = arguments[0].array();
      } else if (arguments.length === 16) {
        source = Array.prototype.slice.call(arguments);
      } else if (arguments.length === 1 && arguments[0] instanceof Array) {
        source = arguments[0];
      }

      var result = [0, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0];
      var e = 0;
      for (var row = 0; row < 4; row++) {
        for (var col = 0; col < 4; col++, e++) {
          result[e] += this.elements[col + 0] * source[row * 4 + 0] + this.elements[col + 4] *
                       source[row * 4 + 1] + this.elements[col + 8] * source[row * 4 + 2] +
                       this.elements[col + 12] * source[row * 4 + 3];
        }
      }
      this.elements = result.slice();
    },
    /**
     * @member PMatrix3D
     * The apply() function multiplies the current matrix by the one specified through the parameters. Note that either a PMatrix3D or a list of floats can be passed in.
     *
     * @param {PMatrix3D} matrix    the matrix to apply this matrix to
     * @param {float} m00           the first element of the matrix
     * @param {float} m01           the second element of the matrix
     * @param {float} m02           the third element of the matrix
     * @param {float} m03           the fourth element of the matrix
     * @param {float} m10           the fifth element of the matrix
     * @param {float} m11           the sixth element of the matrix
     * @param {float} m12           the seventh element of the matrix
     * @param {float} m13           the eight element of the matrix
     * @param {float} m20           the nineth element of the matrix
     * @param {float} m21           the tenth element of the matrix
     * @param {float} m22           the eleventh element of the matrix
     * @param {float} m23           the twelveth element of the matrix
     * @param {float} m30           the thirteenth element of the matrix
     * @param {float} m31           the fourtheenth element of the matrix
     * @param {float} m32           the fivetheenth element of the matrix
     * @param {float} m33           the sixteenth element of the matrix
     */
    apply: function() {
      var source;
      if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
        source = arguments[0].array();
      } else if (arguments.length === 16) {
        source = Array.prototype.slice.call(arguments);
      } else if (arguments.length === 1 && arguments[0] instanceof Array) {
        source = arguments[0];
      }

      var result = [0, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0];
      var e = 0;
      for (var row = 0; row < 4; row++) {
        for (var col = 0; col < 4; col++, e++) {
          result[e] += this.elements[row * 4 + 0] * source[col + 0] + this.elements[row * 4 + 1] *
                       source[col + 4] + this.elements[row * 4 + 2] * source[col + 8] +
                       this.elements[row * 4 + 3] * source[col + 12];
        }
      }
      this.elements = result.slice();
    },
    /**
     * @member PMatrix3D
     * The rotate() function rotates the matrix.
     *
     * @param {float} angle         the angle of rotation in radiants
     */
    rotate: function(angle, v0, v1, v2) {
      if (!v1) {
        this.rotateZ(angle);
      } else {
        // TODO should make sure this vector is normalized
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var t = 1.0 - c;

        this.apply((t * v0 * v0) + c,
                   (t * v0 * v1) - (s * v2),
                   (t * v0 * v2) + (s * v1),
                   0,
                   (t * v0 * v1) + (s * v2),
                   (t * v1 * v1) + c,
                   (t * v1 * v2) - (s * v0),
                   0,
                   (t * v0 * v2) - (s * v1),
                   (t * v1 * v2) + (s * v0),
                   (t * v2 * v2) + c,
                   0,
                   0, 0, 0, 1);
      }
    },
    /**
     * @member PMatrix3D
     * The invApply() function applies the inverted matrix to this matrix.
     *
     * @param {float} m00           the first element of the matrix
     * @param {float} m01           the second element of the matrix
     * @param {float} m02           the third element of the matrix
     * @param {float} m03           the fourth element of the matrix
     * @param {float} m10           the fifth element of the matrix
     * @param {float} m11           the sixth element of the matrix
     * @param {float} m12           the seventh element of the matrix
     * @param {float} m13           the eight element of the matrix
     * @param {float} m20           the nineth element of the matrix
     * @param {float} m21           the tenth element of the matrix
     * @param {float} m22           the eleventh element of the matrix
     * @param {float} m23           the twelveth element of the matrix
     * @param {float} m30           the thirteenth element of the matrix
     * @param {float} m31           the fourtheenth element of the matrix
     * @param {float} m32           the fivetheenth element of the matrix
     * @param {float} m33           the sixteenth element of the matrix
     *
     * @return {boolean} returns true if the operation was successful.
     */
    invApply: function() {
      if (inverseCopy === undef) {
        inverseCopy = new PMatrix3D();
      }
      var a = arguments;
      inverseCopy.set(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8],
                      a[9], a[10], a[11], a[12], a[13], a[14], a[15]);

      if (!inverseCopy.invert()) {
        return false;
      }
      this.preApply(inverseCopy);
      return true;
    },
    /**
     * @member PMatrix3D
     * The rotateZ() function rotates the matrix.
     *
     * @param {float} angle         the angle of rotation in radiants
     */
    rotateX: function(angle) {
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      this.apply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
    },
    /**
     * @member PMatrix3D
     * The rotateY() function rotates the matrix.
     *
     * @param {float} angle         the angle of rotation in radiants
     */
    rotateY: function(angle) {
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      this.apply([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
    },
    /**
     * @member PMatrix3D
     * The rotateZ() function rotates the matrix.
     *
     * @param {float} angle         the angle of rotation in radiants
     */
    rotateZ: function(angle) {
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      this.apply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    },
    /**
     * @member PMatrix3D
     * The scale() function increases or decreases the size of a matrix by expanding and contracting vertices. When only one parameter is specified scale will occur in all dimensions.
     * This is equivalent to a three parameter call.
     *
     * @param {float} sx  the amount to scale on the x-axis
     * @param {float} sy  the amount to scale on the y-axis
     * @param {float} sz  the amount to scale on the z-axis
     */
    scale: function(sx, sy, sz) {
      if (sx && sy === undef && sz === undef) {
        sy = sz = sx;
      } else if (sx && sy && sz === undef) {
        sz = 1;
      }

      if (sx && sy && sz) {
        this.elements[0]  *= sx;
        this.elements[1]  *= sy;
        this.elements[2]  *= sz;
        this.elements[4]  *= sx;
        this.elements[5]  *= sy;
        this.elements[6]  *= sz;
        this.elements[8]  *= sx;
        this.elements[9]  *= sy;
        this.elements[10] *= sz;
        this.elements[12] *= sx;
        this.elements[13] *= sy;
        this.elements[14] *= sz;
      }
    },
    /**
     * @member PMatrix3D
     * The skewX() function skews the matrix along the x-axis the amount specified by the angle parameter.
     * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
     *
     * @param {float} angle  angle of skew specified in radians
     */
    skewX: function(angle) {
      var t = Math.tan(angle);
      this.apply(1, t, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    },
    /**
     * @member PMatrix3D
     * The skewY() function skews the matrix along the y-axis the amount specified by the angle parameter.
     * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
     *
     * @param {float} angle  angle of skew specified in radians
     */
    skewY: function(angle) {
      var t = Math.tan(angle);
      this.apply(1, 0, 0, 0, t, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    },
    /**
     * @member PMatrix3D
     * The shearX() function shears the matrix along the x-axis the amount specified by the angle parameter.
     * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
     *
     * @param {float} angle  angle of shear specified in radians
     */
    shearX: function(angle) {
      var t = Math.tan(angle);
      this.apply(1, t, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    },
    /**
     * @member PMatrix3D
     * The shearY() function shears the matrix along the y-axis the amount specified by the angle parameter.
     * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
     *
     * @param {float} angle  angle of shear specified in radians
     */
    shearY: function(angle) {
      var t = Math.tan(angle);
      this.apply(1, 0, 0, 0, t, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    },
    multX: function(x, y, z, w) {
      if (!z) {
        return this.elements[0] * x + this.elements[1] * y + this.elements[3];
      }
      if (!w) {
        return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
      }
      return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3] * w;
    },
    multY: function(x, y, z, w) {
      if (!z) {
        return this.elements[4] * x + this.elements[5] * y + this.elements[7];
      }
      if (!w) {
        return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
      }
      return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7] * w;
    },
    multZ: function(x, y, z, w) {
      if (!w) {
        return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
      }
      return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11] * w;
    },
    multW: function(x, y, z, w) {
      if (!w) {
        return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15];
      }
      return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15] * w;
    },
    /**
     * @member PMatrix3D
     * The invert() function inverts this matrix
     *
     * @return {boolean} true if successful
     */
    invert: function() {
      var fA0 = this.elements[0] * this.elements[5] - this.elements[1] * this.elements[4];
      var fA1 = this.elements[0] * this.elements[6] - this.elements[2] * this.elements[4];
      var fA2 = this.elements[0] * this.elements[7] - this.elements[3] * this.elements[4];
      var fA3 = this.elements[1] * this.elements[6] - this.elements[2] * this.elements[5];
      var fA4 = this.elements[1] * this.elements[7] - this.elements[3] * this.elements[5];
      var fA5 = this.elements[2] * this.elements[7] - this.elements[3] * this.elements[6];
      var fB0 = this.elements[8] * this.elements[13] - this.elements[9] * this.elements[12];
      var fB1 = this.elements[8] * this.elements[14] - this.elements[10] * this.elements[12];
      var fB2 = this.elements[8] * this.elements[15] - this.elements[11] * this.elements[12];
      var fB3 = this.elements[9] * this.elements[14] - this.elements[10] * this.elements[13];
      var fB4 = this.elements[9] * this.elements[15] - this.elements[11] * this.elements[13];
      var fB5 = this.elements[10] * this.elements[15] - this.elements[11] * this.elements[14];

      // Determinant
      var fDet = fA0 * fB5 - fA1 * fB4 + fA2 * fB3 + fA3 * fB2 - fA4 * fB1 + fA5 * fB0;

      // Account for a very small value
      // return false if not successful.
      if (Math.abs(fDet) <= 1e-9) {
        return false;
      }

      var kInv = [];
      kInv[0]  = +this.elements[5] * fB5 - this.elements[6] * fB4 + this.elements[7] * fB3;
      kInv[4]  = -this.elements[4] * fB5 + this.elements[6] * fB2 - this.elements[7] * fB1;
      kInv[8]  = +this.elements[4] * fB4 - this.elements[5] * fB2 + this.elements[7] * fB0;
      kInv[12] = -this.elements[4] * fB3 + this.elements[5] * fB1 - this.elements[6] * fB0;
      kInv[1]  = -this.elements[1] * fB5 + this.elements[2] * fB4 - this.elements[3] * fB3;
      kInv[5]  = +this.elements[0] * fB5 - this.elements[2] * fB2 + this.elements[3] * fB1;
      kInv[9]  = -this.elements[0] * fB4 + this.elements[1] * fB2 - this.elements[3] * fB0;
      kInv[13] = +this.elements[0] * fB3 - this.elements[1] * fB1 + this.elements[2] * fB0;
      kInv[2]  = +this.elements[13] * fA5 - this.elements[14] * fA4 + this.elements[15] * fA3;
      kInv[6]  = -this.elements[12] * fA5 + this.elements[14] * fA2 - this.elements[15] * fA1;
      kInv[10] = +this.elements[12] * fA4 - this.elements[13] * fA2 + this.elements[15] * fA0;
      kInv[14] = -this.elements[12] * fA3 + this.elements[13] * fA1 - this.elements[14] * fA0;
      kInv[3]  = -this.elements[9] * fA5 + this.elements[10] * fA4 - this.elements[11] * fA3;
      kInv[7]  = +this.elements[8] * fA5 - this.elements[10] * fA2 + this.elements[11] * fA1;
      kInv[11] = -this.elements[8] * fA4 + this.elements[9] * fA2 - this.elements[11] * fA0;
      kInv[15] = +this.elements[8] * fA3 - this.elements[9] * fA1 + this.elements[10] * fA0;

      // Inverse using Determinant
      var fInvDet = 1.0 / fDet;
      kInv[0]  *= fInvDet;
      kInv[1]  *= fInvDet;
      kInv[2]  *= fInvDet;
      kInv[3]  *= fInvDet;
      kInv[4]  *= fInvDet;
      kInv[5]  *= fInvDet;
      kInv[6]  *= fInvDet;
      kInv[7]  *= fInvDet;
      kInv[8]  *= fInvDet;
      kInv[9]  *= fInvDet;
      kInv[10] *= fInvDet;
      kInv[11] *= fInvDet;
      kInv[12] *= fInvDet;
      kInv[13] *= fInvDet;
      kInv[14] *= fInvDet;
      kInv[15] *= fInvDet;

      this.elements = kInv.slice();
      return true;
    },
    toString: function() {
      var str = "";
      for (var i = 0; i < 15; i++) {
        str += this.elements[i] + ", ";
      }
      str += this.elements[15];
      return str;
    },
    /**
     * @member PMatrix3D
     * The print() function prints out the elements of this matrix
     */
    print: function() {
      var digits = printMatrixHelper(this.elements);

      var output = ""   + p.nfs(this.elements[0], digits, 4)  + " " + p.nfs(this.elements[1], digits, 4)  +
                   " "  + p.nfs(this.elements[2], digits, 4)  + " " + p.nfs(this.elements[3], digits, 4)  +
                   "\n" + p.nfs(this.elements[4], digits, 4)  + " " + p.nfs(this.elements[5], digits, 4)  +
                   " "  + p.nfs(this.elements[6], digits, 4)  + " " + p.nfs(this.elements[7], digits, 4)  +
                   "\n" + p.nfs(this.elements[8], digits, 4)  + " " + p.nfs(this.elements[9], digits, 4)  +
                   " "  + p.nfs(this.elements[10], digits, 4) + " " + p.nfs(this.elements[11], digits, 4) +
                   "\n" + p.nfs(this.elements[12], digits, 4) + " " + p.nfs(this.elements[13], digits, 4) +
                   " "  + p.nfs(this.elements[14], digits, 4) + " " + p.nfs(this.elements[15], digits, 4) + "\n\n";
      p.println(output);
    },
    invTranslate: function(tx, ty, tz) {
      this.preApply(1, 0, 0, -tx, 0, 1, 0, -ty, 0, 0, 1, -tz, 0, 0, 0, 1);
    },
    invRotateX: function(angle) {
      var c = Math.cos(-angle);
      var s = Math.sin(-angle);
      this.preApply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
    },
    invRotateY: function(angle) {
      var c = Math.cos(-angle);
      var s = Math.sin(-angle);
      this.preApply([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
    },
    invRotateZ: function(angle) {
      var c = Math.cos(-angle);
      var s = Math.sin(-angle);
      this.preApply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    },
    invScale: function(x, y, z) {
      this.preApply([1 / x, 0, 0, 0, 0, 1 / y, 0, 0, 0, 0, 1 / z, 0, 0, 0, 0, 1]);
    }
  };

  return PMatrix3D;
};