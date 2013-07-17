class X {
  void draw() {
    return 1;
  }
  void draw(float x, float y) {
    return draw();
  }
  void draw(float a, float b, float c, float d) {
    return 4;
  }
}

class Y extends X {
  void draw(float a, float b, float c, float d) {
    return super.draw();
  }
}

Y y = new Y();

_checkEqual(1, y.draw(1,2,3,4));

