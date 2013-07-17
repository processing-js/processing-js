// Split from model.pde

// 49.999996
size(200,100,P3D);
rotateX(PI);
translate(5,9,0);
_checkEqual( 50, modelZ(30,40,-50), 0.0000000000001 );
