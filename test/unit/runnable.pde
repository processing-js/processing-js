int i = 0;

void test() {
 i++;
}

Runnable r = new Runnable() {
  void run() {
    i = 1;
  }
};
r.run();

_checkEqual(i, 1);
