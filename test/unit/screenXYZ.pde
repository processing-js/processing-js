float E = 0.01;
size(500,500,OPENGL);
_checkEqual( screenX( 0, 0, 0 ) , 0, E);
_checkEqual( screenX( 10, 0, 0 ), 9.999998, E);
_checkEqual( screenX( 0, -10, 0 ), 0.0, E);
_checkEqual( screenX( 0, 0, 90 ), 3311.2964, E);
_checkEqual( screenX( 5, 5, 5 ), -2.3527145, E);
_checkEqual( screenX( -5, -5, -5 ), 2.0958707, E);

_checkEqual( screenY( 0, 0, 0 ), -5.9604645E-6, E);
_checkEqual( screenY( 10, 0, 0 ), -5.9604645E-6, E);
_checkEqual( screenY( 0, -10, 0 ), -10.000002, E);
_checkEqual( screenY( 0, 0, 90 ), 1324.5187, E);
_checkEqual( screenY( 5, 5, 5 ), 2.2427292, E);
_checkEqual( screenY( -5, -5, -5 ), -1.997906, E);

_checkEqual( screenZ( 0, 0, 0 ), 0.90909094, E);
_checkEqual( screenZ( 10, 0, 0 ), 0.90909094, E);
_checkEqual( screenZ( 0, -10, 0 ), 0.90909094, E);
_checkEqual( screenZ( 0, 0, 90 ), 3.584886, E);
_checkEqual( screenZ( 5, 5, 5 ), 0.90290177, E);
_checkEqual( screenZ( -5, -5, -5 ), 0.9146044, E);

E = 0.001;
_checkEqual( screenX( 0, 0, 0 ) , -5.9604645E-6, E);
_checkEqual( screenX( 10, 0, 0 ), 10.000006, E);
_checkEqual( screenX( 0, -10, 0 ), 0.0,E);
_checkEqual( screenX( 0, 0, 90 ), 1324.5187, E);
_checkEqual( screenX( 5, 5, 5 ), 2.2427292, E);
_checkEqual( screenX( -5, -5, -5 ), -1.997906, E);

_checkEqual( screenY( 0, 0, 0 ), 0.0,E);
_checkEqual( screenY( 10, 0, 0 ), -5.9604645E-6, E);
_checkEqual( screenY( 0, -10, 0 ), -10.000002, E);
_checkEqual( screenY( 0, 0, 90 ), 1324.5187, E);
_checkEqual( screenY( 5, 5, 5 ), 2.2427292, E);
_checkEqual( screenY( -5, -5, -5 ), -1.997906, E);

_checkEqual( screenZ( 0, 0, 0 ), 0.9090909, E);
_checkEqual( screenZ( 10, 0, 0 ), 0.9090909, E);
_checkEqual( screenZ( 0, -10, 0 ), 0.90909094, E);
_checkEqual( screenZ( 0, 0, 90 ), 3.584886, E);
_checkEqual( screenZ( 5, 5, 5 ), 0.90290177, E);
_checkEqual( screenZ( -5, -5, -5 ), 0.9146044, E);
