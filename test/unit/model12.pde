// Split from model.pde

// -49.0
size(200,100,OPENGL);
camera();
rotateX(PI);
translate(5,9,0);
_checkEqual( -49, modelY(0,40,0) );
