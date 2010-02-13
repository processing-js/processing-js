// Tests for Processing char() function - http://processing.org/reference/char_.html

int i = 65;
byte b = 65;

_checkEqual('A', char(i));
_checkEqual('A', char(b));