module.exports = function(options, undef) {
  'use strict';

  const TAU = 2 * Math.PI,
        //TAU = options.PConstants.TAU,
        lerp = function(start, stop, amt) {
          return amt * (stop - start) + start;
        },
        sq = function(n) {
          return n*n;
        },
        argsErr = function(mtd, len, min) {
          throw 'Too few args passed to ' + mtd +
                '() [' + len + ' < ' + min + '].';
        };

  function _PVector(x, y, z) {
    this.x = +x || 0;
    this.y = +y || 0;
    this.z = +z || 0;
  }

  _PVector.fromAngle = function(angle, target) {
    return target? target.set(Math.cos(angle), Math.sin(angle))
                 : new _PVector(Math.cos(angle), Math.sin(angle));
  };

  _PVector.random2D = function(target, parent) {
    //const rnd = parent? parent : target instanceof Processing? target : Math;
    const rnd = parent? parent : target && target.random? target : Math;
    return _PVector.fromAngle(TAU * rnd.random(), target);
  };

  _PVector.random3D = function(target, parent) {
    //const rnd = parent? parent : target instanceof Processing? target : Math,
    const rnd = parent? parent : target && target.random? target : Math,
          ang = TAU * rnd.random(),
          vz  = 2 * rnd.random() - 1,
          vzr = Math.sqrt(1 - vz*vz),
          vx  = vzr * Math.cos(ang),
          vy  = vzr * Math.sin(ang);
    return target? target.set(vx, vy, vz) : new _PVector(vx, vy, vz);
  };

  _PVector.dist = function(v1, v2) {
    return Math.sqrt(_PVector.distSq(v1, v2));
  };

  _PVector.distSq = function(v1, v2) {
    return sq(v1.x - v2.x) + sq(v1.y - v2.y) + sq(v1.z - v2.z);
  };

  _PVector.dot = function(v1, v2) {
    return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
  };

  _PVector.cross = function(v1, v2, target) {
    const cx = v1.y*v2.z - v2.y*v1.z,
          cy = v1.z*v2.x - v2.z*v1.x,
          cz = v1.x*v2.y - v2.x*v1.y;
    return target? target.set(cx, cy, cz) : new _PVector(cx, cy, cz);
  };

  _PVector.angleBetween = function(v1, v2) {
    if (!v1.x && !v1.y && !v1.z || !v2.x && !v2.y && !v2.z) { return 0; }
    const amt = _PVector.dot(v1, v2) / Math.sqrt(v1.magSq() * v2.magSq());
    return amt <= -1? Math.PI : amt >= 1? 0 : Math.acos(amt);
  };

  _PVector.lerp = function(v1, v2, amt) {
    return v1.copy().lerp(v2, amt);
  };

  _PVector.add = function(v1, v2, target) {
    return target? target.set(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
                 : new _PVector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  };

  _PVector.sub = function(v1, v2, target) {
    return target? target.set(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
                 : new _PVector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  };

  _PVector.mult = function(v, n, target) {
    if (typeof n === 'number') {
      return target? target.set(v.x*n, v.y*n, v.z*n)
                   : new _PVector(v.x*n, v.y*n, v.z*n);
    }
    return target? target.set(v.x*n.x, v.y*n.y, v.z*n.z)
                 : new _PVector(v.x*n.x, v.y*n.y, v.z*n.z);
  };

  _PVector.div = function(v, n, target) {
    if (typeof n === 'number') {
      return target? target.set(v.x/n, v.y/n, v.z/n)
                   : new _PVector(v.x/n, v.y/n, v.z/n);
    }
    return target? target.set(v.x/n.x, v.y/n.y, v.z/n.z)
                 : new _PVector(v.x/n.x, v.y/n.y, v.z/n.z);
  };

  _PVector.prototype = {
    copy: function() {
      return new _PVector(this.x, this.y, this.z);
    },
    get: function(target) {
      if (!arguments.length) { return this.copy(); } // @Deprecated
      if (typeof target !== 'object') { return this.array(); }
      target[0] = this.x;
      target[1] = this.y;
      target[2] = this.z;
      return target;
    },
    set: function(v, y, z) {
      const len = arguments.length;
      if (len > 1) {
        this.x = v;
        this.y = y;
        if (len > 2) { this.z = z; }
      } else if (len === 1) {
        this.set(v.x || v[0] || 0,
                 v.y || v[1] || 0,
                 v.z || v[2] || 0);
      } else { argsErr('set', len, 1); }
      return this;
    },
    array: function() {
      return [this.x, this.y, this.z];
    },
    normalize: function(target) {
      const m = this.mag(),
            canDivide = m !== 0 && m !== 1;
      if (!arguments.length) { return canDivide? this.div(m) : this; }
      return canDivide? _PVector.div(this, m, target)
                      : target? target.set(this) : this.copy();
    },
    limit: function(max) {
      return this.magSq() > max*max? this.normalize().mult(max) : this;
    },
    heading: function() {
      //return -Math.atan2(-this.y, this.x);
      return Math.atan2(this.y, this.x);
    },
    heading2D: null, // @Deprecated
    mag: function() {
      return Math.sqrt(this.magSq());
    },
    magSq: function() {
      return sq(this.x) + sq(this.y) + sq(this.z);
    },
    setMag: function(target, length) {
      const len = arguments.length;
      return len === 1? this.normalize().mult(target) :
             len > 1? this.normalize(target).mult(length) :
             argsErr('setMag', len, 1);
    },
    rotate: function(angle) {
      const prev_x = this.x,
            c = Math.cos(angle),
            s = Math.sin(angle);
      this.x = c*this.x - s*this.y;
      this.y = s*prev_x + c*this.y;
      return this;
    },
    dist: function(v1, v2) {
      return v2? _PVector.dist(v1, v2) : _PVector.dist(this, v1);
    },
    distSq: function(v1, v2) {
      return v2? _PVector.distSq(v1, v2) : _PVector.distSq(this, v1);
    },
    dot: function(v, y, z) {
      const len = arguments.length;
      return len === 1? _PVector.dot(this, v) :
             len === 2? _PVector.dot(v, y) :
             len > 2? this.x*v + this.y*y + this.z*z :
             argsErr('dot', len, 1);
    },
    cross: function(v1, v2, target) {
      return target? _PVector.cross(v1, v2, target)
                   : _PVector.cross(this, v1, v2);
    },
    lerp: function() {
      var x, y, z, amt;
      const len = arguments.length;
      if ((len | 1) === 1) { argsErr('lerp', len, 2); }
      if (len === 2) { // given vector and amt
        const v = arguments[0];
        x = v.x;
        y = v.y;
        z = v.z;
        amt = arguments[1];
      } else if (len === 3) { // given vector 1, vector 2 and amt
        return _PVector.lerp(arguments[0], arguments[1], arguments[2]);
      } else { // given x, y, z and amt
        x = arguments[0];
        y = arguments[1];
        z = arguments[2];
        amt = arguments[3];
      }
      this.x = lerp(this.x, x, amt);
      this.y = lerp(this.y, y, amt);
      this.z = lerp(this.z, z, amt);
      return this;
    },
    add: function(v, y, z) {
      if (y instanceof _PVector) { return _PVector.add(v, y, z); }
      const len = arguments.length;
      if (len === 1) {
        //_PVector.add(this, v, this);
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
      } else if (len > 1) {
        this.x += v;
        this.y += y;
        if (len > 2) { this.z += z };
      } else { argsErr('add', len, 1); }
      return this;
    },
    sub: function(v, y, z) {
      if (y instanceof _PVector) { return _PVector.sub(v, y, z); }
      const len = arguments.length;
      if (len === 1) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
      } else if (len > 1) {
        this.x -= v;
        this.y -= y;
        if (len > 2) { this.z -= z; }
      } else { argsErr('sub', len, 1); }
      return this;
    },
    mult: function(v, n, target) {
      const len = arguments.length;
      if (len === 1) {
        if (typeof v === 'number') {
          this.x *= v;
          this.y *= v;
          this.z *= v;
        } else {
          this.x *= v.x;
          this.y *= v.y;
          this.z *= v.z;
        }
        return this;
      } else if (len > 1) { return _PVector.mult(v, n, target); }
      argsErr('mult', len, 1);
    },
    div: function(v, n, target) {
      const len = arguments.length;
      if (len === 1) {
        if (typeof v === 'number') {
          this.x /= v;
          this.y /= v;
          this.z /= v;
        } else {
          this.x /= v.x;
          this.y /= v.y;
          this.z /= v.z;
        }
        return this;
      } else if (len > 1) { return _PVector.div(v, n, target); }
      argsErr('div', len, 1);
    },
    toString: function() {
      return '[' + this.x + ', ' + this.y + ', ' + this.z + ']';
    },
    equals: function(o) {
      return o === this? true : o instanceof _PVector?
             o.x === this.x && o.y === this.y && o.z === this.z : false;
    },
    hashCode: function() {
      var hash = 1;
      hash = 31*hash + this.x;
      hash = 31*hash + this.y;
      return 31*hash + this.z;
    }
  };

  _PVector.prototype.heading2D = _PVector.prototype.heading; // @Deprecated
  return _PVector;
};
