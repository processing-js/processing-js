/* @pjs preload="perf_string.jpg,perf_lake.jpg"; */
PImage img;
PImage img2;

void setup() {
  img = loadImage("perf_string.jpg");
  img2 = loadImage("perf_lake.jpg");
}

void draw() {
  img.copy(img2, 25, 25, 50, 50, 25, 25, 50, 50);
  image(img, 0, 0);
}