color c1, c2, c;

void setup() {
  size(100,100);
  colorMode(HSB);
  c1 = color(180, 10, 10); c2 = color(120, 128, 128);
  background(0,255,0);
}

void draw() {
  for(int i=0; i<1000; i++) {
    c = lerpColor(c1, c2, 0.3);
  }
  background(0,255,0);
}
