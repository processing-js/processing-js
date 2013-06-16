class Bezier2 extends Segment {}
class Bezier3 extends Bezier2 { }
class ConvexHull {}
class Coordinate extends Point {}
class Line extends Segment {}
class Point {}
class PointSegment extends Segment {}
class Segment {}

Object o1 = new Bezier2();
boolean f1 = o1 instanceof Line;
_checkTrue(!f1);
