/* @pjs preload="construct.jpg,wash.jpg"; */

PImage a, b;
float offset;
int xPos = 0;

void setup()
{
  size(100,100);
  a = loadImage("construct.jpg");
  b = loadImage("wash.jpg");
}

void draw()
{
  xPos++;
  if (xPos == width) {
    xPos = 0;
  }
  image(a, 0, 0);
  float offsetTarget = map(xPos, 0, width, -b.width/2 - width/2, 0);
  offset += (offsetTarget-offset)*0.05;
  tint(255, 153);
  image(b, offset, 20);
}
