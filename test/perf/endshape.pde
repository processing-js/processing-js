void draw(){
  beginShape();
  vertex(30, 20);
  vertex(85, 20);
  vertex(85, 75);
  vertex(30, 75);
  endShape(CLOSE);

  beginShape(POINTS);
  vertex(30, 20);
  vertex(85, 20);
  vertex(85, 75);
  vertex(30, 75);
  endShape();

  beginShape(LINES);
  vertex(30, 20);
  vertex(85, 20);
  vertex(85, 75);
  vertex(30, 75);
  endShape();

  noFill();
  beginShape();
  vertex(30, 20);
  vertex(85, 20);
  vertex(85, 75);
  vertex(30, 75);
  endShape();

  noFill();
  beginShape();
  vertex(30, 20);
  vertex(85, 20);
  vertex(85, 75);
  vertex(30, 75);
  endShape(CLOSE);

  beginShape(TRIANGLES);
  vertex(30, 75);
  vertex(40, 20);
  vertex(50, 75);
  vertex(60, 20);
  vertex(70, 75);
  vertex(80, 20);
  endShape();

  beginShape(TRIANGLE_STRIP);
  vertex(30, 75);
  vertex(40, 20);
  vertex(50, 75);
  vertex(60, 20);
  vertex(70, 75);
  vertex(80, 20);
  vertex(90, 75);
  endShape();

  beginShape(TRIANGLE_FAN);
  vertex(57.5, 50);
  vertex(57.5, 15); 
  vertex(92, 50); 
  vertex(57.5, 85); 
  vertex(22, 50); 
  vertex(57.5, 15); 
  endShape();

  beginShape(QUADS);
  vertex(30, 20);
  vertex(30, 75);
  vertex(50, 75);
  vertex(50, 20);
  vertex(65, 20);
  vertex(65, 75);
  vertex(85, 75);
  vertex(85, 20);
  endShape();

  beginShape(QUAD_STRIP); 
  vertex(30, 20); 
  vertex(30, 75); 
  vertex(50, 20);
  vertex(50, 75);
  vertex(65, 20); 
  vertex(65, 75); 
  vertex(85, 20);
  vertex(85, 75); 
  endShape();

  beginShape();
  vertex(20, 20);
  vertex(40, 20);
  vertex(40, 40);
  vertex(60, 40);
  vertex(60, 60);
  vertex(20, 60);
  endShape(CLOSE);
}