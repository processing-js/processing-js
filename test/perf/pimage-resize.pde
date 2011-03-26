/* @pjs preload="ref_string.jpg"; */
PImage img;
void setup() {  // this is run once.
  img = loadImage("ref_string.jpg");
}
void draw() {
  image(img,0,0);
  img.resize(50,0);
  image(img, 50, 50);
  img.resize(0, 25);
  image(img, 0, 75);
}