PVector v1, v2;

void setup() {
  size(100,100);
  v1 = new PVector(10, 20);
  v2 = new PVector(60, 80);
}

void draw() {
  float a = PVector.angleBetween(v1, v2);
  background(int(a));
}
