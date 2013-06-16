// See bug https://processing-js.lighthouseapp.com/projects/41284/tickets/1223

PImage imgcreated;

void setup() {
  size(100, 100);
  imgcreated = createImage(32, 32, ARGB);
  for (int i = 0; i < imgcreated.pixels.length; i++) {
    imgcreated.pixels[i] = color(random(255), random(255), random(255));
  }
  imgcreated.updatePixels();
}

void draw() {
  background(.2f);
  for(int i=0;i<100;i++) {
    image(imgcreated, random(100), random(100));
  }
}
