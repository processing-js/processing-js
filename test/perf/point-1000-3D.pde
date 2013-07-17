void setup() {
  size(100, 100, P3D);
  stroke(255, 0, 0);
  background(0);
  strokeWeight(3);
}

void draw() {
  for(int i = 0; i < 1000; i++){
    point(50, 50, 0);
  }
}