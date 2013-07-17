void setup() {
  size(100, 100, OPENGL);
  background(127);
}

void draw() {
  color c;
  for (int i = 0; i < height / 4; i++) {
    for (int j = 0; j < width / 4; j++) {
      c = get(j, i);
    }
  }
}
