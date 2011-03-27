randomSeed(0);
void draw() {
  fill(random(255), random(255), random(255));

  int topX = random(width - 10);
  int topY = random(height - 10);

  rect(topX, topY, topX + 10, topY + 10);
}
