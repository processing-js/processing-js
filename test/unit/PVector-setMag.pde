PVector v1, v2;

v1 = new PVector();
v1.setMag(0);
_checkEqual([v1.x, v1.y, v1.z], [0, 0, 0]);

v1 = new PVector();
v1.setMag(10);
_checkEqual([v1.x, v1.y, v1.z], [0, 0, 0]);

v1 = new PVector(1, 0, 0);
v1.setMag(10);
_checkEqual([v1.x, v1.y, v1.z], [10, 0, 0]);

v1 = new PVector(1, 0, 0);
v1.setMag(-10);
_checkEqual([v1.x, v1.y, v1.z], [-10, 0, 0]);

v1 = new PVector(3, 4, 0);
v1.setMag(10);
_checkEqual([v1.x, v1.y, v1.z], [6, 8, 0]);

v1 = new PVector(3, 4);
v2 = v1.setMag(null, 10);
_checkEqual([v1.x, v1.y, v1.z], [3, 4, 0]);
_checkEqual([v2.x, v2.y, v2.z], [6, 8, 0]);

// User shouldn't do this, but make sure we don't break.
v1 = new PVector(3, 4);
v1 = v1.setMag(v1, 10);
_checkEqual([v1.x, v1.y, v1.z], [6, 8, 0]);