PVector v1, v2, v3;

void setup() {
  size(100,100);
  v1 = new PVector(40, 20, 0);
  v2 = new PVector(25, 50, 0);
}

void draw() {
  v3 = PVector.add(v1, v2);
  ellipse(v3.x, v3.y, 12, 12);
}
