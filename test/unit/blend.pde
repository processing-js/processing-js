// unit test for code coverage tool to bring coverage percent up
size(500,500);

PImage img = createImage(100,100,ARGB); 
PImage img2 = createImage(100,100,ARGB); 
image(img, 0, 0);
blend(img, 0, 0, 10, 26, 37, 0, 10, 26, BLEND);
blend(img, 0, 0, 10, 26, 27, 0, 10, 26, ADD);
blend(img, 0, 0, 10, 26, 17, 0, 10, 26, SUBTRACT);
blend(img, 0, 0, 10, 26, 7, 0, 10, 26, LIGHTEST);
blend(img, 0, 0, 10, 26, 37, 0, 10, 26, DARKEST);
blend(img, 0, 0, 10, 26, 37, 0, 10, 26, DIFFERENCE);
blend(img, 0, 0, 10, 26, 37, 0, 10, 26, EXCLUSION);
blend(img, 0, 0, 10, 26, 37, 0, 10, 26, MULTIPLY);
blend(img, 0, 0, 10, 26, 37, 0, 10, 26, SCREEN);
blend(img, 0, 0, 10, 26, 37, 0, 10, 26, OVERLAY);
blend(img, 0, 0, 10, 26, 37, 0, 10, 26, HARD_LIGHT);
blend(img, 0, 0, 10, 26, 37, 0, 10, 26, SOFT_LIGHT);
blend(0, 0, 10, 26, 37, 0, 10, 26, DODGE);
blend(0, 0, 10, 26, 37, 0, 10, 26, BURN);

img2.blend(img, 0, 0, 10, 26, 37, 0, 10, 26, BLEND);
img2.blend(img, 0, 0, 10, 26, 27, 0, 10, 26, ADD);
img2.blend(img, 0, 0, 10, 26, 17, 0, 10, 26, SUBTRACT);
img2.blend(img, 0, 0, 10, 26, 7, 0, 10, 26, LIGHTEST);
img2.blend(img, 0, 0, 10, 26, 37, 0, 10, 26, DARKEST);
img2.blend(img, 0, 0, 10, 26, 37, 0, 10, 26, DIFFERENCE);
img2.blend(img, 0, 0, 10, 26, 37, 0, 10, 26, EXCLUSION);
img2.blend(img, 0, 0, 10, 26, 37, 0, 10, 26, MULTIPLY);
img2.blend(img, 0, 0, 10, 26, 37, 0, 10, 26, SCREEN);
img2.blend(img, 0, 0, 10, 26, 37, 0, 10, 26, OVERLAY);
img2.blend(img, 0, 0, 10, 26, 37, 0, 10, 26, HARD_LIGHT);
img2.blend(img, 0, 0, 10, 26, 37, 0, 10, 26, SOFT_LIGHT);
img2.blend(0, 0, 10, 26, 37, 0, 10, 26, DODGE);
img2.blend(0, 0, 10, 26, 37, 0, 10, 26, BURN);
