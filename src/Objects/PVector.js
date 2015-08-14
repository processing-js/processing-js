module.exports = function(options, undef) {
  var PConstants = options.PConstants;

  function PVector(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  PVector.fromAngle = function(angle, v) {
    if (v === undef || v === null) {
      v = new PVector();
    }
    v.x = Math.cos(angle);
    v.y = Math.sin(angle);
    return v;
  };

  PVector.random2D = function(v) {
    return PVector.fromAngle(Math.random() * PConstants.TWO_PI, v);
  };

  PVector.random3D = function(v) {
    var angle = Math.random() * PConstants.TWO_PI;
    var vz = Math.random() * 2 - 1;
    var mult = Math.sqrt(1 - vz * vz);
    var vx = mult * Math.cos(angle);
    var vy = mult * Math.sin(angle);
    if (v === undef || v === null) {
      v = new PVector(vx, vy, vz);
    } else {
      v.set(vx, vy, vz);
    }
    return v;
  };

  PVector.dist = function(v1, v2) {
    return v1.dist(v2);
  };

  PVector.dot = function(v1, v2) {
    return v1.dot(v2);
  };

  PVector.cross = function(v1, v2) {
    return v1.cross(v2);
  };

  PVector.sub = function(v1, v2) {
    return new PVector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  };

  PVector.angleBetween = function(v1, v2) {
    return Math.acos(v1.dot(v2) / Math.sqrt(v1.magSq() * v2.magSq()));
  };

  PVector.lerp = function(v1, v2, amt) {
    // non-static lerp mutates object, but this version returns a new vector
    var retval = new PVector(v1.x, v1.y, v1.z);
    retval.lerp(v2, amt);
    return retval;
  };

  // Common vector operations for PVector
  PVector.prototype = {
    set: function(v, y, z) {
      if (arguments.length === 1) {
        this.set(v.x || v[0] || 0,
                 v.y || v[1] || 0,
                 v.z || v[2] || 0);
      } else {
        this.x = v;
        this.y = y;
        this.z = z;
      }
    },
    get: function() {
      return new PVector(this.x, this.y, this.z);
    },
    mag: function() {
      var x = this.x,
          y = this.y,
          z = this.z;
      return Math.sqrt(x * x + y * y + z * z);
    },
    magSq: function() {
      var x = this.x,
          y = this.y,
          z = this.z;
      return (x * x + y * y + z * z);
    },
    setMag: function(v_or_len, len) {
      if (len === undef) {
        len = v_or_len;
        this.normalize();
        this.mult(len);
      } else {
        var v = v_or_len;
        v.normalize();
        v.mult(len);
        return v;
      }
    },
    add: function(v, y, z) {
      if (arguments.length === 1) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
      } else if (arguments.length === 2) {
        // 2D Vector
        this.x += v;
        this.y += y;
      } else {
        this.x += v;
        this.y += y;
        this.z += z;
      }
    },
    sub: function(v, y, z) {
      if (arguments.length === 1) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
      } else if (arguments.length === 2) {
        // 2D Vector
        this.x -= v;
        this.y -= y;
      } else {
        this.x -= v;
        this.y -= y;
        this.z -= z;
      }
    },
    mult: function(v) {
      if (typeof v === 'number') {
        this.x *= v;
        this.y *= v;
        this.z *= v;
      } else {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
      }
    },
    div: function(v) {
      if (typeof v === 'number') {
        this.x /= v;
        this.y /= v;
        this.z /= v;
      } else {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;
      }
    },
    rotate: function(angle) {
      var prev_x = this.x;
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      this.x = c * this.x - s * this.y;
      this.y = s * prev_x + c * this.y;
    },
    dist: function(v) {
      var dx = this.x - v.x,
          dy = this.y - v.y,
          dz = this.z - v.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    dot: function(v, y, z) {
      if (arguments.length === 1) {
        return (this.x * v.x + this.y * v.y + this.z * v.z);
      }
      return (this.x * v + this.y * y + this.z * z);
    },
    cross: function(v) {
      var x = this.x,
          y = this.y,
          z = this.z;
      return new PVector(y * v.z - v.y * z,
                         z * v.x - v.z * x,
                         x * v.y - v.x * y);
    },
    lerp: function(v_or_x, amt_or_y, z, amt) {
      var lerp_val = function(start, stop, amt) {
        return start + (stop - start) * amt;
      };
      var x, y;
      if (arguments.length === 2) {
        // given vector and amt
        amt = amt_or_y;
        x = v_or_x.x;
        y = v_or_x.y;
        z = v_or_x.z;
      } else {
        // given x, y, z and amt
        x = v_or_x;
        y = amt_or_y;
      }
      this.x = lerp_val(this.x, x, amt);
      this.y = lerp_val(this.y, y, amt);
      this.z = lerp_val(this.z, z, amt);
    },
    normalize: function() {
      var m = this.mag();
      if (m > 0) {
        this.div(m);
      }
    },
    limit: function(high) {
      if (this.mag() > high) {
        this.normalize();
        this.mult(high);
      }
    },
    heading: function() {
      return (-Math.atan2(-this.y, this.x));
    },
    heading2D: function() {
      return this.heading();
    },
    toString: function() {
      return "[" + this.x + ", " + this.y + ", " + this.z + "]";
    },
    array: function() {
      return [this.x, this.y, this.z];
    }
  };

  function createPVectorMethod(method) {
    return function(v1, v2) {
      var v = v1.get();
      v[method](v2);
      return v;
    };
  }

  for (var method in PVector.prototype) {
    if (PVector.prototype.hasOwnProperty(method) && !PVector.hasOwnProperty(method)) {
      PVector[method] = createPVectorMethod(method);
    }
  }

  return PVector;
};
