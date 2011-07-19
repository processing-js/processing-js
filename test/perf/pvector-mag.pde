PVector v1;
int m;

void setup() {
  size(100,100);
  v1 = new PVector(40, 20, 0);
  background(0,255,0);
}

void draw() {
  for(int i=0; i<1000; i++) {
    m = v1.mag();
  }
  background(0,255,0);
}
