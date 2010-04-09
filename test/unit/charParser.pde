char c1 = '#';
char c2 = '9';

// String with single quotes
String s = 'test';

_checkEqual(hex(c1), "0023");
_checkEqual(hex(c2), "0039");
_checkEqual(s, "test");
