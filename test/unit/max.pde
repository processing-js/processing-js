int a = max(5, 9);            // Sets "a" to 9
int b = max(-4, -12);         // Sets "b" to -4
float c = max(12.3, 230.24);  // Sets "c" to 230.24

int[] list = { 9, -4, 230.24 };
int h = max(list);            // Sets "h" to 230.24

_checkEqual(a, 9);
_checkEqual(b, -4);
_checkEqual(h, 230.24);
