
float f3 = .3f;
float f4 = 4.f;
float f5 = 000.5f;
float f6 = 0010f;

_checkEqual(0.3, f3);
_checkEqual(4.0, f4);
_checkEqual(0.5, f5);
_checkEqual(10, f6);

// checking oct int (in case if we broke it)
int i = 0010;
_checkEqual(8, i);

