// Tests for Processing str() function - http://processingjs.org/reference/str%28%29

boolean b = false;
byte y = -28;
char c = 'R';
float f = -32.6;
int i = 1024;

_checkEqual('false', str(b));
_checkEqual('-28', str(y));
_checkEqual('R', str(c));
_checkEqual('-32.6', str(f));
_checkEqual('1024', str(i));
