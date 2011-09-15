// Split from model.pde

// -100.0
size(200,100,P3D);
camera(100,50,0,0,-1,0,0,1,0);
_checkEqual( -100, modelZ(0,0,0) );
