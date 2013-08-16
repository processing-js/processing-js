PVector v;

void setup() {
  size(100,100);
  background(0,255,0);
}

void draw() {
  for(int i=0; i<1000; i++) {
    v = new PVector(10, 50, 20);
    v.normalize();
  }
  background(0,255,0);
}
