char c = 'E';
byte b = byte(c);
_checkEqual(b, 69);

int i = 130;
b = byte(i);
_checkEqual(b, -126);
