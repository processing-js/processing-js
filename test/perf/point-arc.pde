void setup() {
  size(100,100);
  stroke(0,255,0);
  strokeWeight(2);
}

void draw() {
  background(255);
  for (int i = 0; i < width; i++) {
    for (int j = 0; j < height; j++) {
      point(i, j);
    }
  }
}
