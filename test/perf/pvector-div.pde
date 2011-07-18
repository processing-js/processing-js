PVector v1, v2;

void setup() {
  size(100,100);
  v1 = new PVector(90, 80, 0);
}

void draw() {
  v2 = new PVector(2, 10, 0);
  v1.div(v2);
  ellipse(v1.x, v1.y, 24, 24);
}
