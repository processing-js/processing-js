PVector v = new PVector(0.0, 0.0, 0.0);
v.set(20.0, 30.0, 40.0);

PVector v2 = v.get();
v2.x = 10.0;

_checkEqual([v.x, v.y, v.z], [20.0, 30.0, 40.0]);
_checkEqual(v.array(), [20.0, 30.0, 40.0]);

_checkEqual([v2.x, v2.y, v2.z], [10.0, 30.0, 40.0]);
_checkEqual(v.mag(), 53.851646, 0.00001);

PVector v3 = new PVector(10, 20, 2);
PVector v4 = v3.get();
v3.normalize();
_checkEqual([v3.x, v3.y, v3.z], [ 0.4454354, 0.8908708, 0.089087084 ], 0.00001);

v4.limit(5);

_checkEqual([v4.x, v4.y, v4.z], [ 2.2271771, 4.4543543, 0.4454354 ], 0.00001);

PVector v1 = new PVector(10, 20);
PVector v2 = new PVector(60, 80);
float a = PVector.angleBetween(v1, v2);
_checkEqual(degrees(a), 10.304827, 0.0001);

PVector v1 = new PVector(10, 20, 2);
PVector v2 = new PVector(60, 80, 6); 
PVector v3 = v1.cross(v2);
_checkEqual(v3.array(),[ -40.0, 60.0, -400.0 ]);

PVector  v = new PVector(10, 20, 0);
float d = v.dot(60, 80, 0);
_checkEqual(d, 2200.0);

PVector  v1 = new PVector(10, 20, 0);
PVector  v2 = new PVector(60, 80, 0); 
float d = v1.dist(v2);
_checkEqual(d, 78.10249, 0.0001);
