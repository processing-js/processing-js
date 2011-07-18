PVector v;

void setup() {
  size(100,100);
}

void draw() {
  v = new PVector(10, 50, 20);
  v.limit(15);
  ellipse(v.x, v.y, 20, 20);
}
