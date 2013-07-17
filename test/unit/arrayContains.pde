ArrayList balls;
balls = new ArrayList();
balls.add(9);
balls.add(10);
balls.add(45);
balls.add("Anna");
balls.add("Jason");
balls.add("Mike");

_checkEqual(balls.contains(2), false);
_checkEqual(balls.contains(45), true);
_checkEqual(balls.contains("Anna"), true);
_checkEqual(balls.contains("J"), false);

// using equals() [ticket #982]

class Test 
{
  private int i;
  Test(int a) { this.i = a; }
  boolean equals(Object obj) {
    return obj instanceof Test && this.i == (Test)obj.i;
  }
}

ArrayList list1 = new ArrayList();
list1.add(new Test(1));

_checkEqual(list1.contains(new Test(0)), false);
_checkEqual(list1.contains(new Test(1)), true);

// .. and the ticket example
class MyObject
{
  String song;
  MyObject(String s) { song = s; }
  boolean equals(Object o) {
    if(o==this) return true;
    if(o instanceof MyObject) {
      MyObject other = (MyObject) o;
      return other.song.equals(song); }
  return false; }
}

ArrayList alist = new ArrayList();
MyObject song1 = new MyObject("la");
MyObject song2 = new MyObject("dumtidum");
MyObject song3 = new MyObject("la");
if(!alist.contains(song1)) { alist.add(song1); }
if(!alist.contains(song2)) { alist.add(song2); }
if(!alist.contains(song3)) { alist.add(song3); }
_checkEqual(alist.size(), 2);
_checkEqual(song1.equals(song3), true);

