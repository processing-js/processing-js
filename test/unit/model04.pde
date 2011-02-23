// Split from model.pde

// -9.0
size(200,100,OPENGL);
camera();
rotateY(PI);
_checkEqual( -9, modelZ(10,5,9) );
