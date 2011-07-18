PVector v1;

void setup() {
  size(100,100);
  v1 = new PVector(20, 30, 40);
}

void draw() {
  PVector v = v1.get();
  ellipse(v.x, v.y, 12, 12);
}
