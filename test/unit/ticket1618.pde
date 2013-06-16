
DashedLine polySet = new DashedLine();
_checkTrue(!!polySet);

class Polygon {}
class DashedLine {
  boolean[][] hitPixArr;
  Polygon p;

  DashedLine() {
    hitPixArr = new boolean[width][height];
  }
}


