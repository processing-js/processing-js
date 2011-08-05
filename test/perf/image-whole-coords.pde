/* @pjs preload="arch-100.jpg"; */
PImage img;

int x = 0;

void setup() {
  size(100,100);
  img = loadImage("arch-100.jpg");
}

void draw() {
  background(0);
  // drawing the image multiple times to induce noticeable lag
  image(img, x, 5);
  image(img, x, 5);
  image(img, x, 5);
  x += 1;
  if (x == width) {
    x = 0;
  }
}
