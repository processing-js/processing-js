void setup(){
  size(100, 100, P3D);
  noFill();
}

void draw(){
  background(100);

  float fov = PI/2.0;
  float cameraZ = (height/2.0) / tan(fov/2.0);
  perspective(fov - float(mouseX)/width, float(width)/float(height), cameraZ/10.0, cameraZ*10.0);
  translate(50, 50, 0);

  box(45);
}

