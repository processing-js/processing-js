class Broken extends ArrayList {
}

Broken b = new Broken();
b.add(1);
_checkEqual(b.get(0), 1);
