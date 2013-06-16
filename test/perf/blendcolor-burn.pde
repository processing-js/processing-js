void draw() {
  color orange = color(204, 102, 0);
  color blue = color(0, 102, 153);
  color orangeblue = blendColor(orange, blue, BURN);
  background(51);
  noStroke();
  fill(orange);
  rect(14, 20, 20, 60);
  fill(orangeblue);
  rect(40, 20, 20, 60);
  fill(blue);
  rect(66, 20, 20, 60);
}