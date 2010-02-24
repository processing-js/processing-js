void setup()
{
  size(500,500,OPENGL);
  
}

void draw() {
  background(255, 0, 0);
  camera(0, 0, 400, mouseX - width/2, mouseY - height/2, 0.0, 0.0, 1.0, 0.0); 
  pushMatrix();

  translate(width/2,height/2,1);
  sphereDetail(25,25);
  sphere(140);
  popMatrix();
	
	pushMatrix();
	translate(100,100,1);
	sphereDetail(15,15);
  sphere(80);
  popMatrix();
	
}
