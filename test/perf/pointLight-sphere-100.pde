void setup() {
  size(100,100,P3D);
  background(0);
  noStroke();
  sphereDetail(100);
}

void draw() {
  pointLight(51, 102, 126, 35, 40, 36);
  translate(80, 50, 0);
  sphere(30);
}