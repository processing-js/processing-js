PVector v;
float[] f;

void setup() {
  size(100,100);
  v = new PVector(110.0, 220.0, 30.0);
}

void draw() {
  f = v.array();
  background(f[0], f[1], f[2]);
}
