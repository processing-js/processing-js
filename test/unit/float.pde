// Tests for Processing float() function - http://processing.org/reference/float_.html

int i = 65;
byte b = 65;

byte inByte=12;

float[] inFloatArr={10.5,-11.5,12.5};
float[] outFloatArr={undefined,undefined,undefined};

int[] inIntArr={-11,-1,23,45};
float[] outIntArr={-11.0,-1.0,23.0,45.0};

_checkEqual(float(inByte),12.0);
_checkEqual(float(65),65.0);
_checkEqual(float('E'),69.0);
_checkThrows(function(){float(123.456);});
_checkEqual(float(45.0),45.0);
_checkEqual(float(true),1.0);
_checkEqual(float(false),0.0);
_checkIsNaN(float("aa"));
_checkEqual(float("10.00049"),10.00049);
_checkEqual(float("10.0005"),10.0005);
_checkEqual(float("11.00049"),11.00049);

for (var i = 0; i < inFloatArr.length; i++) {
  _checkThrows(function(){float(inFloatArr[i]);});
}
_checkEqual(float(inIntArr),outIntArr);
