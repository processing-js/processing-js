// Split from model.pde

// 49.999996
size(200,100,OPENGL);
camera();
rotateX(PI);
translate(5,9,0);
_checkEqual( 50.00000000000001, modelZ(30,40,-50) );
