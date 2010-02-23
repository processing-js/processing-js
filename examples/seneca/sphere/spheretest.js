void setup()
{
  size(500,500,OPENGL);
  setInterval(function() { println(FRAME_RATE.toFixed(2) + " fps"); }, 2000);
}

void draw() {
  background(255, 0, 0);
  
  translate(width/2,height/2,1);
  rotateX(frameCount/20.0);
  sphereDetail(25,25);
  sphere(100);
}
