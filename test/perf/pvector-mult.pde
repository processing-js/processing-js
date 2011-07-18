PVector v1, v2;

void setup() {
  size(100,100);
  v1 = new PVector(5, 10, 0);
}

void draw() {
  v2 = new PVector(5, 2, 0);
  v1.mult(v2);
  ellipse(v1.x, v1.y, 24, 24);
}
