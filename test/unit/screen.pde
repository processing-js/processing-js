// Andor Salga
//
// Test screenX, screenY, screenZ
//
//

// 0.0
size(250,250,OPENGL);
_checkEqual( 0.0, screenX(0,0,0) );

// 9.999996
size(100,100,OPENGL);
_checkEqual( 9.999996, screenX(0,0,0) );

// -5.9604645E-6
size(100,100,OPENGL);
_checkEqual( 0, screenY(0,0,0) );

// 0.90909094
size(100,100,OPENGL);
_checkEqual( 0.9090909090909092, screenZ(0,0,0) );

// 2.9802322E-6
size(100,500,OPENGL);
_checkEqual( 0, screenX(0,0,0) );

// 9.999999
size(100,500,OPENGL);
_checkEqual( 10.000000000000004, screenX(10,0,0) );

// 115.014435
size(100,500,OPENGL);
_checkEqual( 115.01444230682307, screenX(100,100,100) );

// 136.267
size(250,250,OPENGL);
perspective(60,1,0.01,1000);
_checkEqual( 136.267, screenX(0,0,0) );

// 0.99994993
size(250,250,OPENGL);
perspective(60,1,0.01,1000);
_checkEqual( 0.99994994173019, screenZ(50,50,50) );

// 133.79019
size(250,250,OPENGL);
perspective(60,1,0.01,1000);
_checkEqual( 133.79020255503204, screenY(50,50,50) );

// 215.80107
size(250,400,OPENGL);
perspective(60,1,0.01,1000);
_checkEqual( 215.80107, screenY(50,50,50) );