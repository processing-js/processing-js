void setup(){
  size(100, 100, P3D);
  noStroke();
}

void draw(){
  beginShape(QUADS);
  vertex(0, 100);
  vertex(100, 100);
  vertex(100, 0);
  vertex(0, 0);
  endShape();
}