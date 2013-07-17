/* @pjs preload="spouch.png"; */

// See bug https://processing-js.lighthouseapp.com/projects/41284/tickets/1223
PImage imgloaded;

void setup() {
  size(100, 100);
  imgloaded = loadImage("spouch.png");
}

void draw() {
  background(.2f);
  for(int i=0;i<100;i++) {
    image(imgloaded, random(100), random(100));
  }
}
