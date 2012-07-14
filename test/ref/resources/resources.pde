void setup() {
  size(100, 100);
}

void draw() {

  ellipseMode(CORNER);
  arc(20, 30, 50, 50, 0, PI/2);
  noFill();
  arc(10, 20, 60, 60, PI/2, PI);
  arc(10, 10, 70, 70, PI, TWO_PI-PI/2);
  arc(10, 10, 80, 80, TWO_PI-PI/2, TWO_PI);

  dump2d();
  exit();
}
