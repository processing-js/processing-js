// import processing.opengl.*;
// Andor Salga
// Tests for modelX(), modelY(), modelZ()
//

// I'll need to look at why camera needs to be called here.

/////////////
// modelX
/////////////

// 1.0
size(100,100,OPENGL);
camera();
_checkEqual( 1.0, modelX(1,1,1));

// 0.0
size(100,100,OPENGL);
rotateY(3.14);
_checkEqual( 0.0, modelX(0,0,0) );

// -0.99840546
size(100,100,OPENGL);
rotateY(3.14);
_checkEqual( -0.9984060788110511, modelX(1,1,1) );

// 0.0
size(200,100,OPENGL);
rotateY(3.14);
_checkEqual( 0.0, modelX(0,0,0) );

// -10
size(200,100,OPENGL);
rotateY(PI);
_checkEqual( -10, modelX(10,0,0) );

// -10
size(200,100,OPENGL);
rotateZ(PI);
_checkEqual( -10, modelX(10,0,0) );

// -15
size(200,100,OPENGL);
rotateZ(PI);
translate(5,0,0);
_checkEqual( -15, modelX(10,0,0) );

// -122.71631
size(200,100,OPENGL);
camera(100,50,0,0,-1,0,0,1,0);
_checkEqual( -122.71630413980063, modelX(0,0,0) );

// -427.12918
size(500,500,OPENGL);
camera(250,250,0,0,-1,0,0,1,0);
_checkEqual( -427.1291901466046, modelX(0,0,0) );

/////////////
// modelY
/////////////

// 1.0
size(100,100,OPENGL);
_checkEqual( 1.0, modelY(1,1,1) );

// 0.0
size(100,100,OPENGL);
rotateX(3.14);
_checkEqual( 0.0, modelY(0,0,0) );

// -1.0015907
size(100,100,OPENGL);
rotateX(3.14);
_checkEqual( -1.0015913846440299, modelY(1,1,1) );

// 0.0
size(200,100,OPENGL);
rotateY(3.14);
_checkEqual( 0.0, modelY(0,0,0) );

// 0.0
size(200,100,OPENGL);
rotateZ(PI);
_checkEqual( 0.0, modelY(10,0,0) );

// -10.0
size(200,100,OPENGL);
rotateX(PI);
_checkEqual( -10, modelY(10,10,10) );

// 5.0
size(200,100,OPENGL);
rotateY(PI);
_checkEqual( 5, modelY(10,5,9) );

// -49.0
size(200,100,OPENGL);
rotateX(PI);
translate(5,9,0);
_checkEqual( -49, modelY(0,40,0) );

// -5.458229
size(200,100,OPENGL);
camera(100,50,0,0,-1,0,0,1,0);
_checkEqual( -5.458227176861527, modelY(0,0,0) );

// -73.57651
size(500,500,OPENGL);
camera(250,250,0,0,-1,0,0,1,0);
_checkEqual( -73.57650383804321, modelY(0,0,0) );

/////////////
// modelZ
/////////////

// 1.0
size(100,100,OPENGL);
_checkEqual( 1.0, modelZ(1,1,1) );

// 0.0
size(100,100,OPENGL);
rotateX(3.14);
_checkEqual(0.0, modelZ(0,0,0) );

// -0.99840546
size(100,100,OPENGL);
rotateX(3.14);
_checkEqual( -0.9984060788110583, modelZ(1,1,1) );

// 0.0
size(200,100,OPENGL);
rotateY(3.14);
_checkEqual(0.0, modelZ(0,0,0) );

// -10.0
size(200,100,OPENGL);
rotateY(PI);
_checkEqual( -10, modelZ(0,0,10) );

// -9.0
size(200,100,OPENGL);
rotateY(PI);
_checkEqual( -9, modelZ(10,5,9) );

// 49.999996
size(200,100,OPENGL);
rotateX(PI);
translate(5,9,0);
_checkEqual( 50.00000000000001, modelZ(30,40,-50) );

// -100.0
size(200,100,OPENGL);
camera(100,50,0,0,-1,0,0,1,0);
_checkEqual( -100, modelZ(0,0,0) );

// -250.0
size(500,500,OPENGL);
camera(250,250,0,0,-1,0,0,1,0);
_checkEqual( -250, modelZ(0,0,0) );