ArrayList balls;
balls = new ArrayList();
balls.add(9);
balls.add(10);
balls.add(45);
balls.add("Anna");
balls.add("Jason");
balls.add("Mike");

_checkEqual(balls.size(), 6);
_checkEqual(balls.remove(1), 10);
_checkEqual(balls.remove(balls.size() - 1), "Mike");
_checkEqual(balls.size(), 4);
