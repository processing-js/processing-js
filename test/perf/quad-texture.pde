/* @pjs preload="arch-100.jpg"; */
PImage img;

void setup(){
  size(100, 100, P3D);
  img = loadImage("arch-100.jpg");
  noStroke();
}

void draw(){
  beginShape(QUADS);
  texture(img);
  vertex(0, 100, 0, 255);
  vertex(100, 100, 255, 255);
  vertex(100, 0, 255, 0);
  vertex(0, 0, 0, 0);
  endShape();
}