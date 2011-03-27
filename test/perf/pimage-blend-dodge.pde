/* @pjs preload="perf_string.jpg,perf_lake.jpg"; */
PImage img;
PImage img2;
void setup() {  // this is run once.
  img = loadImage("perf_lake.jpg");
  img2 = loadImage("perf_string.jpg");
}
void draw() {
  image(img2,0,0);
  blend(img,0,0,100,100,0,0,100,100, DODGE);
}