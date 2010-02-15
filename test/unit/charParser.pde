char c1 = '#';
char c2 = '9';

// String with single quotes
String s = 'test';

_checkEqual(hex(c1), "00000023");
_checkEqual(hex(c2), "00000039");
_checkEqual(s, "test");
