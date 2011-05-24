/* @pjs preload="perf_string.jpg,perf_lake.jpg"; */
PImage img;
PImage maskImg;

void setup() {
  img = loadImage("perf_string.jpg");
  maskImg = loadImage("perf_lake.jpg");
}

void draw() {
  img.mask(maskImg);
  image(img, 0, 0);
}
