// Tests that a base class variable used from
// within the base class is the base class,
// even if the class is a sub class

class Spin{
    int num = 1;
    int display2(){return display();}
    int display(){ return num;}
}

class SpinArm extends Spin{
  int num = 5;
}

SpinArm s = new SpinArm();
_checkEqual(1, s.display2());
