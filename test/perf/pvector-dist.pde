PVector v1, v2;

void setup() {
  size(100,100);
  v1 = new PVector(10, 20, 0);
  v2 = new PVector(60, 80, 0);
}

void draw() {
  background(int(v1.dist(v2)));
}
