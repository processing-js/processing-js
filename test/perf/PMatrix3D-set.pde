PMatrix3D mat = new PMatrix3D(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16);

void setup(){
  size(100, 100, P3D);
}

void draw() {
  for(int i = 0; i < 1000; i++){
    mat.set([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  }
}