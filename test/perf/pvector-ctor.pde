PVector v;

void setup() {
  size(100,100);
}

void draw() {
  v = new PVector(40, 20, 0);
  ellipse(v.x, v.y, 12, 12);
}
