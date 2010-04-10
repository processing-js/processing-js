_checkEqual(min(5, 9),5);
_checkEqual(min(-4, -12),-12)
_checkEqual(min(12.3, 230.24),12.3);
_checkEqual(min(-54, 23, -100),-100);
_checkEqual(min(-54, 23, -200, -100),-200);

float[] list = { 9, -4.1, 230.24 };
_checkEqual(min(list),-4.1);