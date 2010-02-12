// Andor Salga
//
// Test screenX, screenY, screenZ
//
//

// 0.0
size(250,250,OPENGL);
print(screenX(0,0,0));

// 9.999996
size(100,100,OPENGL);
print(screenX(0,0,0));

// -5.9604645E-6
size(100,100,OPENGL);
print(screenY(0,0,0));

// 0.90909094
size(100,100,OPENGL);
print(screenZ(0,0,0));

// 2.9802322E-6
size(100,500,OPENGL);
print(screenX(0,0,0));

// 9.999999
size(100,500,OPENGL);
print(screenX(10,0,0));

// 115.014435
size(100,500,OPENGL);
print(screenX(100,100,100));

// 136.267
size(250,250,OPENGL);
perspective(60,1,0.01,1000);
print(screenX(0,0,0));

// 0.99994993
size(250,250,OPENGL);
perspective(60,1,0.01,1000);
print(screenZ(50,50,50));

// 133.79019
size(250,250,OPENGL);
perspective(60,1,0.01,1000);
print(screenY(50,50,50));

// 215.80107
size(250,400,OPENGL);
perspective(60,1,0.01,1000);
print(screenY(50,50,50));