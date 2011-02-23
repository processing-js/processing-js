// Split from model.pde

// -10.0
size(200,100,OPENGL);
camera();
rotateY(PI);
_checkEqual( -10, modelZ(0,0,10) );
