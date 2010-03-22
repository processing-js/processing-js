var m1 = new PMatrix2D();

_checkEqual( 
[ 1.0000,  0.0000,  0.0000,
 0.0000,  1.0000,  0.0000
], m1.array() );

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

var m3 = new PMatrix2D(m1);
_checkEqual( m3.array(), m1.array() );

var m4 = new PMatrix2D(7,8,9,10,11,12);
_checkEqual( 
[ 7.0000,  8.0000,  9.0000,
 10.0000,  11.0000,  12.0000
], m4.array() );
