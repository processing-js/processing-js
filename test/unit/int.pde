float f = 65.0;
_checkEqual(int(f), 65);

char c = 'E';
_checkEqual(int(c), 69);

// Test that we do NOT convert hex and octal numbers
// NOTE: p5 does not convert these and returns the values stated below
// We want int to work exactly like p5
_checkEqual(int("0xFF"), 0);
_checkEqual(int("010"), 10);
