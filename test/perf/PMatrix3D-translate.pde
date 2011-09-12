PMatrix3D mat = new PMatrix3D();

void setup(){
  size(100, 100, P3D);
}

void draw() {
  for(int i = 0; i < 1000; i++){
    mat.translate(11, 22, 33);
  }
}