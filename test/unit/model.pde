// Andor Salga
// Tests for modelX(), modelY(), modelZ()
//

// modelX

// 1.0
size(100,100,OPENGL);
modelX(1,1,1);

// 0.0
size(100,100,OPENGL);
rotateY(3.14);
modelX(0,0,0);

// -0.99840546
size(100,100,OPENGL);
rotateY(3.14);
modelX(1,1,1);

// 0.0
size(200,100,OPENGL);
rotateY(3.14);
modelX(0,0,0);

// -10
size(200,100,OPENGL);
rotateY(PI);
modelX(10,0,0);

// -10
size(200,100,OPENGL);
rotateZ(PI);
modelX(10,0,0);

// -15
size(200,100,OPENGL);
rotateZ(PI);
translate(5,0,0);
modelX(10,0,0);

// -122.71631
size(200,100,OPENGL);
camera(100,50,0,0,-1,0,0,1,0);
modelX(0,0,0);

// -427.12918
size(500,500,OPENGL);
camera(250,250,0,0,-1,0,0,1,0);
modelX(0,0,0);





// modelY








// modelZ

