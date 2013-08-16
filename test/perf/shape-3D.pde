void setup() {
  size( 100, 100, P3D );
}

void draw(){
  translate(width/2, height/2);
  
  beginShape();
  float r;
  for(r = 0.0; r <= TWO_PI; r += 0.01){
    vertex(sin(r) * 50, cos(r) * 50);
  }
  endShape(TRIANGLE_FAN);
}