void setup(){
  size(100, 100, P3D); 
  noStroke();
  background(0);
  fill(0, 51, 102); 
}

void draw(){
  lightSpecular(204, 204, 204);
  directionalLight(102, 102, 102, 0, 0, -1);
  specular(255, 255, 255);
  shininess(5.0);
  sphere(20);
}
