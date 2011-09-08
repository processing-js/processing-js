/* @pjs preload="arch-100.png,mask.png"; */

size(200, 100);

PImage theImg = loadImage("arch-100.png");
PImage the2ndImg = loadImage("arch-100.png");

PGraphics g = createGraphics(100, 100, JAVA2D);
g.beginDraw();
g.background(0);
g.fill(255);
g.noStroke();
g.ellipse(50, 50, 50, 50);
g.endDraw();

PImage theMask = g.get();
PImage the2ndMask = loadImage("mask.png");

theImg.mask(theMask);
the2ndImg.mask(the2ndMask);

image(theImg, 0, 0);
image(the2ndImg, 100, 0);

exit();
