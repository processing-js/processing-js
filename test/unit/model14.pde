// Split from model.pde

// -10.0
size(200,100,OPENGL);
camera();
rotateX(PI);
_checkEqual( -10, modelY(10,10,10) );
