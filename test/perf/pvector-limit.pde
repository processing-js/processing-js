PVector v1;

void setup() {
  size(100,100);
  background(0,255,0);
}

void draw() {
  for(int i=0; i<1000; i++) {
    v1 = new PVector(40, 20, 0);
    v1.limit(15);
  }
  background(0,255,0);
}
