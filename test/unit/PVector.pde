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
_checkEqual(v.mag(), 53.851646, 0.00001);

PVector v3 = new PVector(10, 20, 2);
PVector v4 = v3.get();

// NORMALIZE
v3.normalize();
_checkEqual([v3.x, v3.y, v3.z], [ 0.4454354, 0.8908708, 0.089087084 ], 0.00001);

// LIMIT
v4.limit(5);
_checkEqual([v4.x, v4.y, v4.z], [ 2.2271771, 4.4543543, 0.4454354 ], 0.00001);

// ANGLE BETWEEN
PVector v1 = new PVector(10, 20);
PVector v2 = new PVector(60, 80); 
float a = PVector.angleBetween(v1, v2);
_checkEqual(degrees(a), 10.304827, 0.0001);

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
_checkEqual(d, 78.10249, 0.0001);

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

// SUB
v3.sub(v4);

_checkEqual(v3.x, 95);
_checkEqual(v3.y, 80);
_checkEqual(v3.z, -10);

PVector v5 = PVector.sub(v3,v4);

_checkEqual(v5.x, 85);
_checkEqual(v5.y, 70);
_checkEqual(v5.z, -20);

PVector v1, v2;
v1 = new PVector(40, 20, 15);
v2 = new PVector(25, 50, 10); 

// DIV
v2.div(v1);
  
_checkEqual(v2.x, 0.625);
_checkEqual(v2.y, 2.5);
_checkEqual(v2.z, 0.6666667, 0.00001);

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
