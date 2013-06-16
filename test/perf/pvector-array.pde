PVector v;
float[] f;

void setup() {
  size(100,100);
  v = new PVector(40, 20, 10);
  background(0,255,0);
}

void draw() {
  for(int i=0; i<1000; i++) {
    f = v.array();
  }
  background(0,255,0);
}
