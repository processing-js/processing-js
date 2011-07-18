PVector v;

void setup() {
  size(100,100);
}

void draw() {
  v = new PVector(20.0, 30.0, 40.0);
  background(int(v.mag()));
}
