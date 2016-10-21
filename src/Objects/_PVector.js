module.exports = function(options, undef) {
  "use strict";

  const TAU = 2 * Math.PI,
        lerp = (start, stop, amt) => +start + amt*(stop - start),
        sq = n => n*n,
        pjsCheck = obj => obj != null && 'random' in obj,
        argsErr = (mtd, len, min) => {
          throw `Too few args passed to ${mtd}() [${len} < ${min}].`;
        };

  function PVector(x, y, z) {
    this.x = x || 0, this.y = y || 0, this.z = z || 0;
  }

  PVector.fromAngle = (angle, t) =>
    t? t.set(Math.cos(angle), Math.sin(angle))
     : new PVector(Math.cos(angle), Math.sin(angle));

  PVector.random2D = (t, p) => {
    const isPjs = pjsCheck(t), rnd = p? p : isPjs && t || Math;
    return PVector.fromAngle(TAU * rnd.random(), !isPjs && t || void 0);
  };

  PVector.random3D = (t, p) => {
    const isPjs = pjsCheck(t),
          rnd = p? p : isPjs && t || Math,
          ang = TAU * rnd.random(),
          vz  = 2*rnd.random() - 1,
          vzr = Math.sqrt(1 - vz*vz),
          vx  = vzr * Math.cos(ang),
          vy  = vzr * Math.sin(ang);
    return t && !isPjs? t.set(vx, vy, vz) : new PVector(vx, vy, vz);
  };

  PVector.dist = (v1, v2) => Math.sqrt(PVector.distSq(v1, v2));
  PVector.distSq = (v1, v2) => sq(v1.x-v2.x) + sq(v1.y-v2.y) + sq(v1.z-v2.z);
  PVector.dot = (v1, v2) => v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;

  PVector.cross = (v1, v2, t) => {
    const cx = v1.y*v2.z - v2.y*v1.z,
          cy = v1.z*v2.x - v2.z*v1.x,
          cz = v1.x*v2.y - v2.x*v1.y;
    return t && t.set(cx, cy, cz) || new PVector(cx, cy, cz);
  };

  PVector.angleBetween = (v1, v2) => {
    if (!v1.x && !v1.y && !v1.z || !v2.x && !v2.y && !v2.z)  return 0;
    const amt = PVector.dot(v1, v2) / Math.sqrt(v1.magSq() * v2.magSq());
    return amt <= -1? Math.PI : amt >= 1? 0 : Math.acos(amt);
  };

  PVector.lerp = (v1, v2, amt, t) =>
    (t && t.set(v1) || v1.copy()).lerp(v2, amt);

  PVector.add = (v1, v2, t) =>
    t? t.set(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
     : new PVector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);

  PVector.sub = (v1, v2, t) =>
    t? t.set(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
     : new PVector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);

  PVector.mult = (v, n, t) => {
    if (typeof n === 'object')
      return t? t.set(v.x*n.x, v.y*n.y, v.z*n.z)
              : new PVector(v.x*n.x, v.y*n.y, v.z*n.z);
    else
      return t? t.set(v.x*n, v.y*n, v.z*n)
              : new PVector(v.x*n, v.y*n, v.z*n);
  };

  PVector.div = (v, n, t) => {
    if (typeof n === 'object')
      return t? t.set(v.x/n.x, v.y/n.y, v.z/n.z)
              : new PVector(v.x/n.x, v.y/n.y, v.z/n.z);
    else
      return t? t.set (v.x/n, v.y/n, v.z/n)
              : new PVector(v.x/n, v.y/n, v.z/n);
  };

  PVector.mod = (v, n, t) => {
    if (typeof n === 'object')
      return t? t.set(v.x%n.x, v.y%n.y, v.z%n.z)
              : new PVector(v.x%n.x, v.y%n.y, v.z%n.z);
    else
      return t? t.set(v.x%n, v.y%n, v.z%n)
              : new PVector(v.x%n, v.y%n, v.z%n);
  };

  PVector.compare = (a, b) => a.x - b.x || a.y - b.y || a.z - b.z;

  PVector.prototype = {
    compareTo: function(v) {
      return this.x - v.x || this.y - v.y || this.z - v.z;
    },
    array: function() { return [this.x, this.y, this.z]; },
    object: function() { return { x: this.x, y: this.y, z: this.z }; },
    copy: function() { return new PVector(this.x, this.y, this.z); },
    clone: null,
    get: function(t) {
      if (!t)  return t === void 0 && this.copy() || this.array();
      else if ('z' in t)  t.x  = this.x, t.y  = this.y, t.z  = this.z;
      else t[0] = this.x, t[1] = this.y, t[2] = this.z;
      return t;
    },
    set: function(v, y, z) {
      if (y != void 0)  this.x = +v, this.y = +y, z != void 0 && (this.z = +z);
      else this.set(v[0] || v.x || 0, v[1] || v.y || 0, v[2] || v.z);
      return this;
    },
    normalize: function(t, mag) {
      const m = +mag || this.mag(), canDivide = m === m && m !== 0 && m !== 1;
      if (!arguments.length)  return canDivide && this.div(m) || this;
      return canDivide? PVector.div(this, m, t)
                      : t && t.set(this) || this.copy();
    },
    limit: function(max, t, magSq) {
      const mSq = magSq || this.magSq(), overMax = mSq > max*max;
      t === null && (t = new PVector);
      return !t? overMax && this.normalize().mult(max) || this
               : overMax && this.normalize(t, Math.sqrt(mSq)).mult(max)
               || t.set(this);
    },
    heading: function() { return Math.atan2(this.y, this.x); },
    heading2D: null, // @Deprecated
    mag: function() { return Math.sqrt(this.magSq()); },
    magSq: function() { return this.x*this.x + this.y*this.y + this.z*this.z; },
    setMag: function(t, len, mag) {
      return typeof t === 'object'?
             this.normalize(t, mag).mult(len) : this.normalize().mult(t);
    },
    rotate: function(angle, t) {
      const c = Math.cos(angle),
            s = Math.sin(angle),
            x = c*this.x - s*this.y,
            y = s*this.x + c*this.y;
      t === null && (t = new PVector);
      return (t || this).set(x, y);
    },
    rotateX: function(angle, t) {
      const c = Math.cos(angle),
            s = Math.sin(angle),
            y = c*this.y - s*this.z,
            z = s*this.y + c*this.z;
      t === null && (t = new PVector);
      return (t || this).set(this.x, y, z);
    },
    rotateY: function(angle, t) {
      const c = Math.cos(angle),
            s = Math.sin(angle),
            x = s*this.z + c*this.x,
            z = c*this.z - s*this.x;
      t === null && (t = new PVector);
      return (t || this).set(x, this.y, z);
    },
    rotateZ: null,
    fromAngle: function(angle, t) {
      return PVector.fromAngle(angle, t || this);
    },
    random2D: function(t, p) {
      return pjsCheck(t) && PVector.random2D(this, t)
                         || PVector.random2D(t === void 0 && this || t, p);
    },
    random3D: function(t, p) {
      return pjsCheck(t) && PVector.random3D(this, t)
                         || PVector.random3D(t === void 0 && this || t, p);
    },
    dist: function(v1, v2) {
      return v2? PVector.dist(v1, v2) : PVector.dist(this, v1);
    },
    distSq: function(v1, v2) {
      return v2? PVector.distSq(v1, v2) : PVector.distSq(this, v1);
    },
    dot: function(v, y, z) {
      return typeof v != 'object'? this.x*v + this.y*+y + this.z*z :
                    y == void 0? PVector.dot(this, v) : PVector.dot(v, y);
    },
    cross: function(v1, v2, t) {
      return t && PVector.cross(v1, v2, t) || PVector.cross(this, v1, v2);
    },
    angleBetween: function(v) { return PVector.angleBetween(this, v); },
    lerp: function(a, b, c, d) {
      let x, y, z, amt;
      const len = arguments.length;
      if ((len | 1) === 1)  argsErr('lerp', len, 2);
      if (len === 2) { // given vector and amt
        ({x, y, z} = a), amt = b;
      } else if (len === 3) { // given vector 1, vector 2 and amt
        return PVector.lerp(a, b, c);
      } else { // given x, y, z and amt
        x = a, y = b, z = c, amt = d;
      }
      return this.set(lerp(this.x, x, amt),
                      lerp(this.y, y, amt),
                      lerp(this.z, z, amt));
    },
    add: function(v, y, z) {
      if (y != void 0) {
        if (typeof y === 'object')  return PVector.add(v, y, z);
        this.x += +v, this.y += +y, z != void 0 && (this.z += +z);
      } else if (typeof v === 'object')
          this.x += v.x, this.y += v.y, this.z += v.z;
        else
          this.x += +v,  this.y += +v,  this.z += +v;
      return this;
    },
    sub: function(v, y, z) {
      if (y != void 0) {
        if (typeof y === 'object')  return PVector.sub(v, y, z);
        this.x -= v, this.y -= y, z != void 0 && (this.z -= z);
      } else if (typeof v === 'object')
          this.x -= v.x, this.y -= v.y, this.z -= v.z;
        else
          this.x -= v,  this.y -= v,  this.z -= v;
      return this;
    },
    mult: function(v, n, t) {
      if (n != void 0)  return PVector.mult(v, n, t);
      if (typeof v === 'object')  this.x *= v.x, this.y *= v.y, this.z *= v.z;
      else                        this.x *= v,   this.y *= v,   this.z *= v;
      return this;
    },
    div: function(v, n, t) {
      if (n != void 0)  return PVector.div(v, n, t);
      if (typeof v === 'object')  this.x /= v.x, this.y /= v.y, this.z /= v.z;
      else                        this.x /= v,   this.y /= v,   this.z /= v;
      return this;
    },
    mod: function(v, n, t) {
      if (n != void 0)  return PVector.mod(v, n, t);
      if (typeof v === 'object')  this.x %= v.x, this.y %= v.y, this.z %= v.z;
      else                        this.x %= v,   this.y %= v,   this.z %= v;
      return this;
    },
    negate: function() {
      this.x *= -1, this.y *= -1, this.z *= -1;
      return this;
    },
    clear: function() {
      this.x = this.y = this.z = 0;
      return this;
    },
    isNaN: function() {
      return this.x !== this.x || this.y !== this.y || this.z !== this.z;
    },
    toString: function() { return `[ ${this.x}, ${this.y}, ${this.z} ]`; },
    valueOf: function() { return this.x; },
    hashCode: function() { return this.x + this.y + this.z; },
    equals: function(o) {
      return o === this? true : o instanceof PVector &&
      o.x === this.x && o.y === this.y && o.z === this.z;
    }
  };

  PVector.prototype.clone = PVector.prototype.copy;
  PVector.prototype.heading2D = PVector.prototype.heading; // @Deprecated
  PVector.prototype.rotateZ = PVector.prototype.rotate;

  return PVector;
};
