_checkEqual(max(5, 9),9);
_checkEqual(max(-4, -12),-4)
_checkEqual(max(12.3, 230.24),230.24);
_checkEqual(max(-54, 23, -100),23);
_checkEqual(max(-54, 23, 234, -100),234);

float[] list = { 9, -4, 230.24 };
_checkEqual(max(list),230.24);