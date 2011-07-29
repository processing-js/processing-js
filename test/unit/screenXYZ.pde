float E = 0.001;
size(500,500,OPENGL);

_checkEqual( screenX( 0, 0, 0 ) , 0, E);
_checkEqual( screenX( 10, 0, 0 ), 10, E);
_checkEqual( screenX( 0, -10, 0 ), 0.0, E);
_checkEqual( screenX( 0, 0, 90 ), -65.59524, E);
_checkEqual( screenX( 5, 5, 5 ), 2.1379292, E);
_checkEqual( screenX( -5, -5, -5 ), -2.089113, E);

_checkEqual( screenY( 0, 0, 0 ), 0, E);
_checkEqual( screenY( 10, 0, 0 ), 0, E);
_checkEqual( screenY( 0, -10, 0 ), -10, E);
_checkEqual( screenY( 0, 0, 90 ), -65.59524, E);
_checkEqual( screenY( 5, 5, 5 ), 2.1379292, E);
_checkEqual( screenY( -5, -5, -5 ), -2.089113, E);

_checkEqual( screenZ( 0, 0, 0 ), 0.9090909, E);
_checkEqual( screenZ( 10, 0, 0 ), 0.9090909, E);
_checkEqual( screenZ( 0, -10, 0 ), 0.9090909, E);
_checkEqual( screenZ( 0, 0, 90 ), 0.8825878, E);
_checkEqual( screenZ( 5, 5, 5 ), 0.90791094, E);
_checkEqual( screenZ( -5, -5, -5 ), 0.910244, E);
