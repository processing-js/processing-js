//import processing.opengl.*;

int startX;
int startY;
int x;
int y;
int boxCounter = 0;

void setup()
{
  size(500,500,OPENGL);

  startX = width/2 - 70;
  startY = height/2 - 60;
 
  x = startX;
  y = startY;
}

void draw()
{
  background(100,135,100);
  drawBoxes();
}

void drawBoxes()
{
  camera();

  fill(255);
  drawNextBox();

  // single value
  noFill();
  drawNextBox();

  // single value
  fill(1);
  drawNextBox();
  
  fill(50);
  drawNextBox();

  fill(128);
  drawNextBox();

  fill(200);
  drawNextBox();

  fill(255);
  drawNextBox();
 
  ////////////////////////////////////////////////
  // single values for color, color - single value
  ////////////////////////////////////////////////
  fill(color(0));
  drawNextBox();
    
  fill(color(1));
  drawNextBox();
  
  fill(color(50));
  drawNextBox();

  fill(color(200));
  drawNextBox();
  
  fill(color(255));
  drawNextBox();
  
  ///////////////////////////////  
  // single value - hex no alpha
  ///////////////////////////////
  fill(#000000);
  drawNextBox();
  
  fill(#808080);
  drawNextBox();
    
  fill(#FFFFFF);
  drawNextBox();
    
  noFill();
  drawNextBox();
    
  fill(#00FF00);
  drawNextBox();
  
  fill(#0000FF);
  drawNextBox();
  
  fill(#FFFF00);
  drawNextBox();
  
  fill(#FF00FF);
  drawNextBox();
  
  fill(#00FFFF);
  drawNextBox();
  
  fill(#214263);
  drawNextBox();
  
  ///////////////////////////////////////////////
  // single value - color, color multiple values
  //////////////////////////////////////////////
  fill(color(0,0,0));
  drawNextBox();
  
  fill(color(128,128,128));
  drawNextBox();
  
  fill(color(255,255,255));
  drawNextBox();
  
  fill(color(255,0,0));
  drawNextBox();
  
  fill(color(0,255,0));
  drawNextBox();
  
  fill(color(0,0,255));
  drawNextBox();
  
  fill(color(255,255,0));
  drawNextBox();
  
  fill(color(255,0,255));
  drawNextBox();
  
  fill(color(0,255,255));
  drawNextBox();
  
  fill(color(33,66,99)); 
  drawNextBox();
  
  /////////////////////////////////
  // double values - color + alpha
  /////////////////////////////////
  fill(color(0,0,0),0);
  drawNextBox();
  
  fill(color(128,128,128),0);
  drawNextBox();
  
  fill(color(255,255,255),0);
  drawNextBox();
  
  fill(color(255,0,0),255);
  drawNextBox();
  
  fill(color(0,255,0),255);
  drawNextBox();
  
  fill(color(0,0,255),128);
  drawNextBox();
  
  fill(color(255),0);
  drawNextBox();
  
  fill(color(0,0,255),0);
  drawNextBox();
  
  fill(color(0,255,0),128);
  drawNextBox();
  
  fill(color(255,0,0),0);
  drawNextBox();
  
  fill(color(255),128);
  drawNextBox();
  
  fill(color(255),0);
  drawNextBox();
  
  fill(color(255),255);
  drawNextBox();
  
  fill(color(128),255);
  drawNextBox();
  
  fill(color(128),128);
  drawNextBox();
  
  // hex + alpha
  fill(#000000,128);
  drawNextBox();
  
  fill(#808080,255);
  drawNextBox();
  
  fill(#FFFFFF,0);
  drawNextBox();
  
  fill(#FF0000,255);
  drawNextBox();
  
  fill(#00FF00,255);
  drawNextBox();
  
  fill(#0000FF,128);
  drawNextBox();
  
  fill(#FFFF00,255);
  drawNextBox();
  
  fill(#FF00FF,128);
  drawNextBox();
  
  fill(#00FFFF,0);
  drawNextBox();
  
  fill(#214263,128);
  drawNextBox();

  ////////////////
  // gray + alpha
  ////////////////
  fill(0,0);
  drawNextBox();
  
  fill(0,128);
  drawNextBox();
  
  fill(0,255);
  drawNextBox();
  
  fill(1,0);
  drawNextBox();
  
  fill(1,128);
  drawNextBox();
  
  fill(1,255);
  drawNextBox();
  
  fill(50,0);
  drawNextBox();
  
  fill(50,128);
  drawNextBox();
  
  fill(50,255);
  drawNextBox();
  
  fill(128,0);
  drawNextBox();
  
  fill(128,128);
  drawNextBox();
  
  fill(128,255);
  drawNextBox();
  
  fill(255,255);
  drawNextBox();
  
  fill(255,128);
  drawNextBox();
  
  fill(255,0);
  drawNextBox();
  
  ///////////////////////
  // triple values r,g,b
  //////////////////////
  fill(0,0,0);
  drawNextBox();
  
  fill(128,128,128);
  drawNextBox();
  
  fill(255,255,255);
  drawNextBox();
  
  fill(255,0,0);
  drawNextBox();
  
  noFill();
  drawNextBox();
  
  fill(0,0,255);
  drawNextBox();
  
  fill(255,255,0);
  drawNextBox();
  
  fill(255,0,255);
  drawNextBox();
  
  fill(0,255,255);
  drawNextBox();
  
  fill(33,66,99);
  drawNextBox();
  
  ///////////////
  // quad values
  ///////////////
  fill(0,0,0,0);
  drawNextBox();
  
  fill(0,0,0,128);
  drawNextBox();
  
  fill(0,0,0,255);
  drawNextBox();
  
  fill(128,128,128,0);
  drawNextBox();
  
  fill(128,128,128,128);
  drawNextBox();
  
  fill(128,128,128,255);
  drawNextBox();
  
  fill(255,255,255,0);
  drawNextBox();
  
  // !!
  fill(255,255,255,53);
  drawNextBox();
  
  fill(255,255,255,255);
  drawNextBox();
  
  fill(255,0,0,0);
  drawNextBox();
  
  fill(255,0,0,128);
  drawNextBox();
  
  fill(255,0,0,255);
  drawNextBox();
  
  fill(0,255,0,0);
  drawNextBox();
  
  fill(0,255,0,128);
  drawNextBox();
  
  fill(0,255,0,255);
  drawNextBox();
  
  fill(33,66,99,0);
  drawNextBox();
  
  fill(33,66,99,128);
  drawNextBox();
  
  fill(33,66,99,255);
  drawNextBox();
}

void drawNextBox()
{
  x += 10;
  
  if(boxCounter != 0 && boxCounter % 10 == 0)
  {
    y += 10;
    x =  startX + 10;
  }

  if(boxCounter == 100)
  {
    boxCounter = 0;
    x =  startX + 10;
    y =  startY;
  }
  
  pushMatrix();
  translate(x, y, 320);
 // translate(200, 250, 320);
  box(5,5,5);
  popMatrix();
  
  boxCounter++;
}