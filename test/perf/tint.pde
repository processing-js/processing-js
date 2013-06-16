/* @pjs preload="arch-100.jpg"; */
PImage b;

void setup() {
  b = loadImage("arch-100.jpg");
}

void draw() {
  image(b, 0, 0);
  // Tint blue
  tint(0, 153, 204);
}
