// Split from model.pde

// 0.0
size(200,100,OPENGL);
camera();
rotateZ(PI);
_checkEqual( 0.0, modelY(10,0,0) );
