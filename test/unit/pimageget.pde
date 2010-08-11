// unit test for code coverage tool to bring coverage percent up
size(500,500);

PImage greenSquare = createImage(100, 100, ARGB);
for (int i = 0; i < greenSquare.pixels.length; i++) {
 // make greenSquare green
  greenSquare.pixels[i] = color(0,255,0);
}
image(greenSquare, 0, 0);
_checkEqual(greenSquare.pixels[0], color(0, 255, 0));

PImage blueSquare = createImage(100, 100, ARGB);
for (int i = 0; i < blueSquare.pixels.length; i++) {
 // make blueSquare blue
  blueSquare.pixels[i] = color(0,0,255);
}
image(blueSquare, 100, 0);
_checkEqual(blueSquare.pixels[0], color(0, 0, 255));

// draw red square inside green then get() and put it in blue
PImage redSquare = createImage(40,40,ARGB);
for (int i = 0; i < redSquare.pixels.length; i++) {
 // make redSquare red
  redSquare.pixels[i] = color(255,0,0);
}
image(redSquare,30,30);
_checkEqual(redSquare.pixels[0], color(255, 0, 0));

PImage getRedSquare = createImage(40,40,ARGB);
getRedSquare = get(30,30,40,40);
image(getRedSquare, 130,30);

PImage testGet4arg = createImage(100,40,ARGB);
testGet4arg = get(50,30,100,40);
image(testGet4arg, 50,100);

PImage testGet5arg = createImage(100,40,ARGB);
testGet5arg = testGet4arg.get(0,0,100,40);
image(testGet4arg, 50,150);

int testGet3arg = 0;
testGet3arg = testGet4arg.get(40,0);

int testGet2arg = 0;
testGet2arg = get(150,45);

PImage testGet1arg = createImage(100,40,ARGB);
testGet1arg = testGet4arg.get();
image(testGet1arg, 50,200);

PImage testGet0arg = createImage(100,40,ARGB);
testGet0arg = get(100,50,100,40);
image(testGet0arg, 0,50);
