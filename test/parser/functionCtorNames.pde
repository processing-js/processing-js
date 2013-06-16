// Ctors and functions can have the same names
class Spot{
  Spot (){}
  void Spot(){}
}
Spot spt = new Spot();

spt.Spot(); // This will break the parser
