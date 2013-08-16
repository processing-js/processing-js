// Tests for Processing float() function - http://processing.org/reference/float_.html

int i = 65;
byte b = 65;

byte inByte=12;

int[] inIntArr={-11,-1,23,45};
float[] outIntArr={-11.0,-1.0,23.0,45.0};

_checkEqual(float(inByte),12.0);
_checkEqual(float(65),65.0);
_checkEqual(float('E'),69.0);
_checkEqual(float(45.0),45.0);
_checkEqual(float(true),1.0);
_checkEqual(float(false),0.0);
_checkIsNaN(float("aa"));
_checkEqual(float("10.00049"),10.00049);
_checkEqual(float("10.0005"),10.0005);
_checkEqual(float("11.00049"),11.00049);

_checkEqual(float(inIntArr),outIntArr);
