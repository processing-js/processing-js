void setup() {
  size(100,100,P3D);
  background(0);
  noStroke();
}

void draw() {
  for(int i = 0; i < 8; i++){
    pointLight(51, 102, 126, 35, 40, 36);
  }
  sphere(30);
}