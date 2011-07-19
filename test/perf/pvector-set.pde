PVector v1;

void setup() {
  size(100,100);
  background(0,255,0);
}

void draw() {
  for(int i=0; i<1000; i++) {
    v = new PVector(0.0, 0.0, 0.0);
    v.set(20.0, 30.0, 40.0);
  }
  background(0,255,0);
}
