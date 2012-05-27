var m1 = new PMatrix2D();

_checkEqual( 
[ 1.0000,  0.0000,  0.0000,
 0.0000,  1.0000,  0.0000
], m1.array() );

//////////////////
//   SET
//////////////////

m1.set(1,2,3,4,5,6);
_checkEqual( 
[ 1.0000,  2.0000,  3.0000,
 4.0000,  5.0000,  6.0000
], m1.array() );

var m2 = new PMatrix2D();
m2.set(m1);
_checkEqual( 
[ 1.0000,  2.0000,  3.0000,
 4.0000,  5.0000,  6.0000
], m2.array() );

m2 = new PMatrix2D(m1);
_checkEqual( m2.array(), m1.array() );

m1 = new PMatrix2D(7,8,9,10,11,12);
_checkEqual( 
[ 7.0000,  8.0000,  9.0000,
 10.0000,  11.0000,  12.0000
], m1.array() );

//////////////////
//   SKEWX/SKEWY
//////////////////

m1.reset();
m1.skewY(0.5);
_checkEqual( 
[ 1.0000,  0.0000,  1.0000,
 0.0000,  0.5000,  0.0000
], m1.array() );

m1.reset();

m1.skewX(0.5);
_checkEqual( 
[ 1.0000,  0.0000,  1.0000,
 0.5000,  0.0000,  0.0000
], m1.array() );

m1.skewY(0.5);
_checkEqual( 
[ 1.0000,  0.0000,  2.0000,
 0.5000,  0.0000,  0.5000
], m1.array() );

//////////////////
//  SHEARX/SHEARY
//////////////////

m1.reset();
m1.shearY(0.5);
_checkEqual( 
[ 1.0000,  0.0000,  1.0000,
 0.0000,  0.5463,  0.0000
], m1.array(), 0.00001 );

m1.reset();

m1.shearX(0.5);
_checkEqual( 
[ 1.0000,  0.0000,  1.0000,
 0.5463,  0.0000,  0.0000
], m1.array(), 0.00001 );

m1.shearY(0.5);
_checkEqual( 
[ 1.0000,  0.0000,  2.0000,
 0.5463,  0.0000,  0.5463
], m1.array(), 0.00001 );

//////////////////
//   APPLY
//////////////////

m1.reset();
m1.set([1,2,3,4,5,6]);
m1.apply(16,15,14,13,12,11);
_checkEqual( 
[ 42.0000, 39.0000,  39.0000,
 129.0000,  120.0000,  117.0000
], m1.array() );

m1.reset();
m1.set([1,2,3,4,5,6]);
m1.apply([16,15,14,13,12,11]);
_checkEqual( 
[ 42.0000, 39.0000,  39.0000,
 129.0000,  120.0000,  117.0000
], m1.array() );

m1.reset();
m1.set([1,2,3,4,5,6]);
m2.set([16,15,14,13,12,11]);
m1.apply(m2);
_checkEqual( 
[ 42.0000, 39.0000,  39.0000,
 129.0000,  120.0000,  117.0000
], m1.array() );

//////////////////
//   TRANSLATE
//////////////////

m1.reset();
m1.set([1,2,3,4,5,6]);
m1.translate(9,11);
_checkEqual( 
[ 1.0000, 2.0000,  34.0000,
  4.0000, 5.0000,  97.0000
], m1.array() );

//////////////////
//   TRANSPOSE
//////////////////

m1.reset();
m1.set([1,2,3,4,5,6]);
m1.transpose();
_checkEqual( 
[ 1.0000, 2.0000,  3.0000,
  4.0000, 5.0000,  6.0000
], m1.array() );

//////////////////
//   MULTX
//////////////////

m1.reset();
m1.set([1,2,3,4,5,6]);
_checkEqual( 34.0, m1.multX(9,11) );

//////////////////
//   MULTY
//////////////////

m1.reset();
m1.set([1,2,3,4,5,6]);
_checkEqual( 97.0, m1.multY(9,11) );

//////////////////
//   MULT
//////////////////

m1.reset();
m1.set([1,2,3,4,5,6]);
_checkEqual( 
[ 34.0, 97.0], m1.mult([9,11],null) );

m1.reset();
m1.set([1,2,3,4,5,6]);
float[] fArr=[99,99];
m1.mult([9,11],fArr)
_checkEqual( [ 34.0, 97.0], fArr );

m1.reset();
m1.set([1,2,3,4,5,6]);
PVector vect1=new PVector(9,11,0);
PVector vect2=new PVector(34,97,0);
_checkEqual( vect2, m1.mult(vect1,null) , 0.01);

m1.reset();
m1.set([1,2,3,4,5,6]);
vect1=new PVector(9,11,0);
vect2=new PVector(99,99,99);
PVector vect3=new PVector(34,97,0);
m1.mult(vect1,vect2)
_checkEqual( vect3, vect2 , 0.10);

//////////////////
//   DETERMINANT
//////////////////

m1.reset();
m1.set([12,34,56,78,90,12]);
_checkEqual( -1572, m1.determinant() );

//////////////////
//   INVERT
//////////////////

m1.reset();
m1.set(12,34,56,78,90,12);
m1.invert();
_checkEqual([-0.0573, 0.0216, 2.9466, 0.0496, -0.0076, -2.6870
],m1.array(), 0.0001 );

//////////////////
//   SCALE
//////////////////

m1.reset();
m1.set([1,2,3,4,5,6]);
m1.scale(2);
_checkEqual( [ 2, 4, 3, 8, 10, 6],m1.array());

m1.reset();
m1.set([1,2,3,4,5,6]);
m1.scale(2,4);
_checkEqual( [ 2, 8, 3, 8, 20, 6],m1.array());

//////////////////
//   PREAPPLY
//////////////////

m1.reset();
m1.set(2,4,6,8,10,12);
m2.reset();
m2.set(14,16,18,20,22,24);
m1.preApply(m2);
_checkEqual( [ 156, 216, 294, 216, 300, 408],m1.array());

m1.reset();
m1.set(2,4,6,8,10,12);
m1.preApply(14,16,18,20,22,24);
_checkEqual( [ 156, 216, 294, 216, 300, 408],m1.array());

m1.reset();
m1.set(2,4,6,8,10,12);
m1.preApply([14,16,18,20,22,24]);
_checkEqual( [ 156, 216, 294, 216, 300, 408],m1.array());

//////////////////
//   ROTATE/ROTATEZ
//////////////////

m1.reset();
m1.set(2,4,6,8,10,12);
m1.rotate(30);
_checkEqual( [ -3.6436, 2.5931, 6, -8.6463, 9.4468, 12],
m1.array(), 0.0009 );

m1.reset();
m1.set(2,4,6,8,10,12);
m1.rotateZ(30);
_checkEqual( [ -3.6436, 2.5931, 6, -8.6463, 9.4468, 12],
m1.array(), 0.0009 );