// methods before constructors break
class Spot {
  int item;
  void add(int item2) { item = item2; }
  Spot(int item2){ item = item2; }
}

Spot spt = new Spot(1);

_checkEqual(1, spt.item);

spt.add(2);

_checkEqual(2, spt.item);
