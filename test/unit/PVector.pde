var round_tolerance = 0.00001;

// SET
PVector v = new PVector(0.0, 0.0, 0.0);
v.set(20.0, 30.0, 40.0);

// GET
PVector v2 = v.get();
v2.x = 10.0;

_checkEqual([v.x, v.y, v.z], [20.0, 30.0, 40.0]);

// ARRAY
_checkEqual(v.array(), [20.0, 30.0, 40.0]);

_checkEqual([v2.x, v2.y, v2.z], [10.0, 30.0, 40.0]);

// MAG
float m = 53.851648;
_checkEqual(v.mag(), m, round_tolerance);

// MAGSQ
_checkEqual(v.magSq(), m*m, Math.sqrt(round_tolerance));

PVector v3 = new PVector(10, 20, 2);
PVector v4 = v3.get();

// NORMALIZE
v3.normalize();
_checkEqual([v3.x, v3.y, v3.z], [ 0.4454354, 0.8908708, 0.089087084 ], round_tolerance);

// LIMIT
v4.limit(5);
_checkEqual([v4.x, v4.y, v4.z], [ 2.2271771, 4.4543543, 0.4454354 ], round_tolerance);

// ANGLE BETWEEN
PVector v1 = new PVector(10, 20);
PVector v2 = new PVector(60, 80); 
float a = PVector.angleBetween(v1, v2);
_checkEqual(degrees(a), 10.304846, round_tolerance);

v1 = new PVector(2, 3);
a = PVector.angleBetween(v1, v1);
_checkEqual(a, 0, round_tolerance);

v1 = new PVector(2, 4);
a = PVector.angleBetween(v1, v1);
_checkEqual(a, 0, round_tolerance);

// CROSS
PVector v1 = new PVector(10, 20, 2);
PVector v2 = new PVector(60, 80, 6); 
PVector v3 = v1.cross(v2);
_checkEqual(v3.array(),[ -40.0, 60.0, -400.0 ]);

// DOT  
PVector  v = new PVector(10, 20, 0);
float d = v.dot(60, 80, 0);
_checkEqual(d, 2200.0);

// DIST
PVector  v1 = new PVector(10, 20, 0);
PVector  v2 = new PVector(60, 80, 0); 
float d = v1.dist(v2);
_checkEqual(d, 78.10249, round_tolerance);

// ADD
PVector v1, v2;
v1 = new PVector(40, 20, 0);
v2 = new PVector(25, 50, 0); 

v2.add(v1);
  
_checkEqual(v2.x, 65);
_checkEqual(v2.y, 70);
_checkEqual(v2.z, 0);

PVector v3 = PVector.add(v1, v2);

_checkEqual(v3.x, 105);
_checkEqual(v3.y, 90);
_checkEqual(v3.z, 0);

PVector v4 = new PVector(10, 10, 10);

PVector v1, v2;
v1 = new PVector(40, 20, 15);
v2 = new PVector(25, 50, 10); 

// DIV
v2.div(v1);
  
_checkEqual(v2.x, 0.625);
_checkEqual(v2.y, 2.5);
_checkEqual(v2.z, 0.6666667, round_tolerance);

PVector v3 = PVector.div(v1, v2);

_checkEqual(v3.x, 64.0);
_checkEqual(v3.y, 8.0);
_checkEqual(v3.z, 22.5);

// MULT
PVector v1, v2;
v1 = new PVector(15, 80.5, 5);
v2 = new PVector(20, 15, 10); 

v2.mult(v1);

_checkEqual(v2.x, 300.0);
_checkEqual(v2.y, 1207.5);
_checkEqual(v2.z, 50.0);

PVector v3 = PVector.mult(v1, v2);

_checkEqual(v3.x, 4500.0);
_checkEqual(v3.y, 97203.75);
_checkEqual(v3.z, 250.0);

// Zero out
PVector v1 = new PVector(0, 1, 0);
PVector v2 = new PVector();
v2.set(v1);

_checkEqual(v1.array(), v2.array());

// FROM ANGLE
PVector v1 = PVector.fromAngle(HALF_PI);
_checkEqual(v1.array(), [0, 1, 0], round_tolerance);

v1 = PVector.fromAngle(PI);
_checkEqual(v1.array(), [-1, 0, 0], round_tolerance);

float over_root_2 = 1. / Math.sqrt(2);
PVector.fromAngle(PI/4, v1); // specifying target
_checkEqual(v1.array(), [over_root_2, over_root_2, 0], round_tolerance);

PVector v2 = PVector.fromAngle(3*PI/4, null); // should return new vector
_checkEqual(v2.array(), [-over_root_2, over_root_2, 0], round_tolerance);

// RANDOM2D
PVector v1 = PVector.random2D();
PVector v2 = PVector.random2D();
PVector v3 = new PVector();
_checkEqual(v1.z, 0);
_checkEqual(v2.z, 0);
_checkNotEqual(v1.array(), v2.array());
_checkNotEqual(v1.array(), v3.array());
_checkNotEqual(v2.array(), v3.array());

PVector v4 = new PVector(v1.x, v1.y, v1.z);
PVector.random2D(v4); // pass in target
// should have changed from initial v1 values
_checkNotEqual(v1.array(), v4.array());

PVector v5 = PVector.random2D(null); // should return new vector
_checkEqual(v5.z, 0);
_checkNotEqual(v4.array(), v5.array());

// RANDOM3D
PVector v1 = PVector.random3D();
PVector v2 = PVector.random3D();
PVector v3 = new PVector();
_checkNotEqual(v1.array(), v2.array());
_checkNotEqual(v1.array(), v3.array());
_checkNotEqual(v2.array(), v3.array());

PVector v4 = new PVector(v1.x, v1.y, v1.z);
PVector.random3D(v4); // pass in target
// should have changed from initial v1 values
_checkNotEqual(v1.array(), v4.array());

PVector v5 = PVector.random3D(null); // should return new vector
_checkNotEqual(v4.array(), v5.array());

// LERP
PVector v1 = new PVector(10, 20, 30);
PVector v2 = new PVector(20, 30, 40);
PVector vlerp1 = PVector.lerp(v1, v2, 0);
PVector vlerp2 = PVector.lerp(v1, v2, 0.5);
PVector vlerp3 = PVector.lerp(v1, v2, 1);
_checkEqual(vlerp1.array(), v1.array());
_checkEqual(vlerp2.array(), [15, 25, 35]);
_checkEqual(vlerp3.array(), v2.array());

// non-static version 1, another vector
v1.lerp(v2, 0.5); // changes v1
_checkEqual(vlerp2.array(), v1.array());

// non-static version 2, xyz values
PVector v3 = new PVector(-v2.x, -v2.y, -v2.z);
v3.lerp(v2.x, v2.y, v2.z, 0.5);
_checkEqual(v3.array(), [0, 0, 0]);

// SETMAG
void setMagTest(PVector v, float m) {
  v.setMag(m);
  _checkEqual(v.mag(), m, round_tolerance);
}
void setMagNoop(PVector v) {
  float[] a = v.array();
  setMagTest(v, v.mag());
  _checkEqual(a, v.array(), round_tolerance);
}
PVector v1 = new PVector(-1, 0, 0);
setMagTest(v1, 10);
_checkEqual(v1.array(), [-10, 0, 0]);

setMagNoop(new PVector(-0.05, 2013, 2.718), 10);
setMagNoop(new PVector(578, 123, 432));
setMagNoop(PVector.random3D());

// vector arg version
void setMagTest2(PVector unused, PVector v, float m) {
  unused.setMag(v, m);
  _checkEqual(v.mag(), m, round_tolerance);
}
setMagTest2(v1, new PVector(-1, -1, -1), 1);
setMagTest2(v1, new PVector(9812, 38, 1.65), 193);
// according to p5 docs, giving setMag a null first argument should
// cause it to create a new vector. however, this will have a
// magnitude of 0, regardless of the second argument (this is even the
// case in p5). that's probably not correct, so no test for it.

// ROTATE
PVector v1 = new PVector(100, 0, 0);
v1.rotate(HALF_PI);
_checkEqual(v1.array(), [0, 100, 0], round_tolerance);
v1.rotate(PI);
_checkEqual(v1.array(), [0, -100, 0], round_tolerance);
v1.rotate(-1.5*PI);
_checkEqual(v1.array(), [100, 0, 0], round_tolerance);
v1.rotate(QUARTER_PI);
_checkEqual(v1.array(), [100*over_root_2, 100*over_root_2, 0], round_tolerance);

// HEADING
void headingTest(float angle) {
  // angle needs to be between [-PI, PI]. otherwise, the numerical
  // values may be off by a multiple of 2PI.
  PVector v = PVector.fromAngle(angle);
  _checkEqual(v.heading(), angle, round_tolerance);
}
_checkEqual((new PVector(128, 0, 0)).heading(), 0);
_checkEqual((new PVector(0, 0.1, 0)).heading(), HALF_PI);
headingTest(Math.random() * TWO_PI - PI);
headingTest(Math.random() * TWO_PI - PI);
headingTest(Math.random() * TWO_PI - PI);
