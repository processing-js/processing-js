color c1, c2, c;

void setup() {
  size(100,100);
  c1 = #000000; c2 = #4080C0;
  background(0,255,0);
}

void draw() {
  for(int i=0; i<1000; i++) {
    c = lerpColor(c1, c2, 0.3);
  }
  background(0,255,0);
}
