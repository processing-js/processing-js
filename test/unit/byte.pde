char c = 'E';
byte b = byte(c);
_checkEqual(b, 69);

int i = 130;
b = byte(i);
_checkEqual(b, -126);

_checkEqual(byte(300), 44);
_checkEqual(byte(-256), 0);
_checkEqual(byte(-129), 127);
_checkEqual(byte(1000), -24);
_checkEqual(byte(-1000), 24);

_checkEqual(byte([100, -100, 200, -200, 'e', 'E']), [100, -100, -56, 56, 101, 69]); 
