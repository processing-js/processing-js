PVector v1, v2;
float a;

void setup() {
  size(100,100);
  v1 = new PVector(40, 20, 0);
  v2 = new PVector(25, 50, 0);
  background(0,255,0);
}

void draw() {
  for(int i=0; i<1000; i++) {
    a = PVector.angleBetween(v1, v2);
  }
  background(0,255,0);
}
