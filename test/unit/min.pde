int d = min(5, 9);            // Sets "d" to 5
int e = min(-4, -12);         // Sets "e" to -12
float f = min(12.3, 230.24);  // Sets "f" to 12.3
int g = min(4);

int[] list = { 5, 1, 2, -3 };
int h = min(list);            // Sets "h" to -3

_checkEqual(d, 5);
_checkEqual(e, -12);
_checkEqual(f, 12.3);
_checkEqual(g, 4);
_checkEqual(h, -3);
