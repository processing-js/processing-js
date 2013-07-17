// SETUP - Subtract using class method 2D
PVector v1 = new PVector(10, 20);
PVector v2 = new PVector(40, 50);

PVector res = PVector.sub(v1, v2);
_checkEqual([res.x, res.y], [-30, -30]);



// SETUP - Subtract using class method 2D
v1 = new PVector(-5,  90);
v2 = new PVector(40, -20);

res = PVector.sub(v2, v1);
_checkEqual([res.x, res.y], [45, -110]);



// SETUP - Subtract using instance method 2D
v1 = new PVector(1, 2, 3);
v2 = new PVector(10, 20, 30);

v1.sub(v2);
_checkEqual([v1.x, v1.y, v1.z], [-9,  -18, -27]);



// SETUP - Subtract using instance method 2D
v1 = new PVector(1, 2);
v2 = new PVector(10, 20);

v2.sub(v1);
_checkEqual([v2.x, v2.y], [9,  18]);



// SETUP - Subtract using class method 3D
v1 = new PVector(10, 20, 30);
v2 = new PVector(40, 50, 60);

PVector res = PVector.sub(v1, v2);
_checkEqual([res.x, res.y, res.z], [-30, -30, -30]);



// SETUP - Subtract using class method 3D
v1 = new PVector(-15,  30, 45);
v2 = new PVector(70, -40, -60);

res = PVector.sub(v2, v1);
_checkEqual([res.x, res.y, res.z], [85, -70, -105]);



// SETUP - Subtract using class method with different vector dimensions
v1 = new PVector(10, 20);
v2 = new PVector(40, 50, 60);

PVector res = PVector.sub(v1, v2);
_checkEqual([res.x, res.y, res.z], [-30, -30, -60]);



// SETUP - Subtract using class method with different vector dimensions
v1 = new PVector(-5,  90, 20);
v2 = new PVector(40, -20);

res = PVector.sub(v2, v1);
_checkEqual([res.x, res.y, res.z], [45, -110, -20]);



// SETUP - Subtract using instance method 3D
v1 = new PVector(1, 2, 3);
v2 = new PVector(10, 20, 30);

v1.sub(v2);
_checkEqual([v1.x, v1.y, v1.z], [-9,  -18, -27]);



// SETUP - Subtract using instance method 3D
v1 = new PVector(1, 2, 3);
v2 = new PVector(10, 20, 30);

v2.sub(v1);
_checkEqual([v2.x, v2.y, v2.z], [9,  18, 27]);



// SETUP - Subtract using instance method with x,y,z
v1 = new PVector(1, 2, 3);

v1.sub(10, 20, 30);
_checkEqual([v1.x, v1.y, v1.z], [-9,  -18, -27]);



// SETUP - Subtract using instance method with x,y,z
v1 = new PVector(10, 20, 30);

v1.sub(1, 2, 3);
_checkEqual([v2.x, v2.y, v2.z], [9,  18, 27]);



// SETUP - Subtract vectors of different dimensions
v1 = new PVector(1, 2, 3);
v2 = new PVector(10, 20);

v1.sub(v2);
_checkEqual([v1.x, v1.y, v1.z], [-9,  -18, 3]);



// SETUP - Subtract vectors of different dimensions
v1 = new PVector(5, 10);
v2 = new PVector(5, 10, 15);

v1.sub(v2);
_checkEqual([v1.x, v1.y, v1.z], [0,  0, -15]);