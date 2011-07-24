PVector v1, v2;

void setup() {
  size(100,100);
  v1 = new PVector(40, 20, 0);
  background(0,255,0);
}

void draw() {
  for(int i=0; i<1000; i++) {
    v2 = v1.get();
  }
  background(0,255,0);
}
