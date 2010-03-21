void setup()
{
  size(500,500,OPENGL);
  setInterval(function() { println(FRAME_RATE.toFixed(2) + " fps"); }, 2000);
}

void draw() {
  background(200);
  
  fill(255, 0, 200);
  stroke(255, 200, 0);

  pushMatrix();
    translate(width/2,height/2,1);
    rotateX(frameCount/20.0);
    sphereDetail(25,25);
    sphere(140);
  popMatrix();
	
  fill(255, 200, 0);
  stroke(255, 0, 200);

	pushMatrix();
	  translate(100,100,1);
    rotateX(-frameCount/20.0);
	  sphereDetail(15,15);
    sphere(80);
  popMatrix();
}
