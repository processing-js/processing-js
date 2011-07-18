PVector v1, v2, v3;

void setup() {
  size(100,100);
  v1 = new PVector(5, 5, 0);
  v2 = new PVector(25, 50, 0);
}

void draw() {
  v3 = PVector.sub(v2, v1);
  ellipse(v3.x, v3.y, 12, 12);
}
