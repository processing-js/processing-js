// Split from model.pde

// -10
size(200,100,OPENGL);
camera();
rotateY(PI);
_checkEqual( -10, modelX(10,0,0) );
