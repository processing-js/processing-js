ArrayList balls;
balls = new ArrayList();
balls.add(9);
balls.add(10);
balls.add(45);
balls.add("Anna");
balls.add("Jason");
balls.add("Mike");
String[] list2 = {"Anna", "Jason","Mike"};

_checkEqual(balls.contains(2), false);
_checkEqual(balls.contains(45), true);
_checkEqual(balls.contains("Anna"), true);
_checkEqual(balls.contains("J"), false);