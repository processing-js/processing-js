// Newlines in function parameters
class Obj{
  void message(int num1,
  int num2){
    println(num1 + num2);
  }
}

Obj obj = new Obj();
obj.message(1, 2); // This is where the parser will fail
