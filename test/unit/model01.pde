// Split from model.pde

// -250.0
size(500,500,P3D);
camera(250,250,0,0,-1,0,0,1,0);
_checkEqual( -250, modelZ(0,0,0) );
