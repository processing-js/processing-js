interface I {
  int getX();
  void test();
}

I i = new I() {
  int x = 5;


  public int getX() {
    return x;
  }
  public void test() {
    x++;
  }
};

i.test();


_checkEqual(i.getX(), 6);
_checkEqual(i instanceof I, true);
_checkEqual(i instanceof Object, true);
