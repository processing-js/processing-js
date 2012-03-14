class Dollar$ign {
  public int first = 0;
  public int second = 0;
  public Dollar$ign(int first, int second) {
    this.first = first;
    this.second = second;
  }
}

void setupTest() {
  Dollar$ign d = new Dollar$ign(200, 300);
  _checkEqual(200, d.first);
  _checkEqual(300, d.second);
}
setupTest();