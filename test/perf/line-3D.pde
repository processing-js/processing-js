void setup() {
  size(100, 100, P3D);
  stroke(255, 0, 0);
}

void draw() {
  for(int i = 0; i < 100; i+=2){
    line(i, 0, i, 100);
  }
  for(int i = 0; i < 100; i+=2){
    line(0, i, 100, i);
  }
}