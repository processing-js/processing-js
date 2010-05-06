class Dragon{
  static int dragonCount = 0;
  
  Dragon(){
    dragonCount++;
  }
}

Dragon puff = new Dragon();

Dragon magic = new Dragon();

_checkEqual(2, puff.dragonCount);
