/* @pjs crisp=true; */

void setup() {
  size(100,100);
  stroke(0,255,0);
}

void draw() {
  background(255);
  for (int i=0; i<width; i+=2) {
    line(i, 0, i, height);
  }
}
