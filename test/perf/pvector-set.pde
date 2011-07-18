PVector v;

void setup() {
  size(100,100);
}

void draw() {
  v = new PVector(0.0, 0.0, 0.0);
  v.set(20.0, 30.0, 40.0);
  ellipse(v.x, v.y, 12, 12);
}
