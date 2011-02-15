class Dragon{
  static int dragonCount = 0;
  
  Dragon(){
    dragonCount++;
  }
}

Dragon puff = new Dragon();

Dragon magic = new Dragon();

_checkEqual(2, puff.dragonCount);

static class ClassA {
  static class ClassB {
    static class ClassC {
      static int d = 3;
    }
  }
}

_checkEqual(3, ClassA.ClassB.ClassC.d);

