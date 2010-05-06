// Check for returning an array
float[] f() {
  return new float[] {{ 1, 2 }, {3, 4}};
}

float[] g = f();

_checkEqual(1, g[0][0]);
_checkEqual(4, g[1][1]);