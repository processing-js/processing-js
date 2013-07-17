int i = 0;
randomSeed(0);
void setup() {  // this is run once.
    // set the background color
    background(255);

    // smooth edges
    smooth();

    // set the width of the line.
    strokeWeight(12);
}

void draw() {  // this is run repeatedly.
    // set the color
    stroke(random(50), random(255), random(255), 100);

    // draw the line
    line(i, 0, random(0, width), height);

    // move over a pixel
    if (i < width) {
        i++;
    } else {
        i = 0;
    }
}
