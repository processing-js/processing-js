PVector v1, v2, v3;

void setup() {
  size(100,100);
  v1 = new PVector(10, 2, -2);
  v2 = new PVector(6, 8, -6);
}

void draw() {
  v3 = v1.cross(v2);
  ellipse(v3.x, v3.y, 24, 24);
}
