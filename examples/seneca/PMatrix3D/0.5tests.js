void setup()
{
  size(500,500,OPENGL);
  
  //if(testPMatrix3D())
  //{
  //}
}

void draw() {
  background(255, 0, 0);
  //frustum(-width/2, width/2, 10, height/2, -200, 200.0);

  pushMatrix();

  translate(width/2,height/2,1);
  rotateY(sin(frameCount/100.0));
  rotateX(cos(frameCount/100.0));

  box(100);
  popMatrix();
}
