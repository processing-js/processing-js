void setup()
{
  size(500,500,OPENGL);
  
}

void draw() {
  background(255, 0, 0);
  pushMatrix();

  translate(width/2,height/2,1);
  sphereDetail(25,25);
  sphere(100);
  popMatrix();
}
