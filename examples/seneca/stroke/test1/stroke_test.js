/*
Syntax	

stroke(gray)
stroke(gray, alpha)
stroke(value1, value2, value3)
stroke(value1, value2, value3, alpha)
stroke(color)
stroke(color, alpha)
stroke(hex)
stroke(hex, alpha)

Parameters	
gray	int or float: specifies a value between white and black
alpha	int or float: opacity of the stroke
value1	int or float: red or hue value (depending on the current color mode)
value2	int or float: green or saturation value (depending on the current color mode)
value3	int or float: blue or brightness value (depending on the current color mode)
color	color: any value of the color datatype
hex	int: color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)

*/
//import processing.opengl.*;

int startX;
int startY;
int x;
int y;
int boxCounter = 0;

void setup()
{
 size(500,500,OPENGL);
 
 // select a color unlike others so transparency
 // is visible.

 startX = width/2 - 70;
 startY = height/2 - 60;
 
 x = startX;
 y = startY;
}

void draw()
{
  drawBoxes();
}

void drawBoxes()
{
  camera();

  noStroke();
  drawNextBox();

  stroke(0);
  drawNextBox();

  // single value
  stroke(1);
  drawNextBox();
  
  stroke(50);
  drawNextBox();

  stroke(128);
  drawNextBox();

  stroke(200);
  drawNextBox();

  stroke(255);
  drawNextBox();
 
  ////////////////////////////////////////////////
  // single values for color, color - single value
  ////////////////////////////////////////////////
  stroke(color(0));
  drawNextBox();
    
  stroke(color(1));
  drawNextBox();
  
  stroke(color(50));
  drawNextBox();

  stroke(color(200));
  drawNextBox();
  
  stroke(color(255));
  drawNextBox();
  
  ///////////////////////////////  
  // single value - hex no alpha
  ///////////////////////////////
  stroke(#000000);
  drawNextBox();
  
  stroke(#808080);
  drawNextBox();
    
  stroke(#FFFFFF);
  drawNextBox();
    
  stroke(#FF0000);
  drawNextBox();
    
  stroke(#00FF00);
  drawNextBox();
  
  stroke(#0000FF);
  drawNextBox();
  
  stroke(#FFFF00);
  drawNextBox();
  
  stroke(#FF00FF);
  drawNextBox();
  
  stroke(#00FFFF);
  drawNextBox();
  
  stroke(#214263);
  drawNextBox();
  
  ///////////////////////////////////////////////
  // single value - color, color multiple values
  //////////////////////////////////////////////
  stroke(color(0,0,0));
  drawNextBox();
  
  stroke(color(128,128,128));
  drawNextBox();
  
  stroke(color(255,255,255));
  drawNextBox();
  
  stroke(color(255,0,0));
  drawNextBox();
  
  stroke(color(0,255,0));
  drawNextBox();
  
  stroke(color(0,0,255));
  drawNextBox();
  
  stroke(color(255,255,0));
  drawNextBox();
  
  stroke(color(255,0,255));
  drawNextBox();
  
  stroke(color(0,255,255));
  drawNextBox();
  
  stroke(color(33,66,99)); 
  drawNextBox();
  
  /////////////////////////////////
  // double values - color + alpha
  /////////////////////////////////
  stroke(color(0,0,0),0);
  drawNextBox();
  
  stroke(color(128,128,128),0);
  drawNextBox();
  
  stroke(color(255,255,255),0);
  drawNextBox();
  
  stroke(color(255,0,0),255);
  drawNextBox();
  
  stroke(color(0,255,0),255);
  drawNextBox();
  
  stroke(color(0,0,255),128);
  drawNextBox();
  
  stroke(color(255),0);
  drawNextBox();
  
  stroke(color(0,0,255),0);
  drawNextBox();
  
  stroke(color(0,255,0),128);
  drawNextBox();
  
  stroke(color(255,0,0),0);
  drawNextBox();
  
  stroke(color(255),128);
  drawNextBox();
  
  stroke(color(255),0);
  drawNextBox();
  
  stroke(color(255),255);
  drawNextBox();
  
  stroke(color(128),255);
  drawNextBox();
  
  stroke(color(128),128);
  drawNextBox();
  
  // hex + alpha
  stroke(#000000,128);
  drawNextBox();
  
  stroke(#808080,255);
  drawNextBox();
  
  stroke(#FFFFFF,0);
  drawNextBox();
  
  stroke(#FF0000,255);
  drawNextBox();
  
  stroke(#00FF00,255);
  drawNextBox();
  
  stroke(#0000FF,128);
  drawNextBox();
  
  stroke(#FFFF00,255);
  drawNextBox();
  
  stroke(#FF00FF,128);
  drawNextBox();
  
  stroke(#00FFFF,0);
  drawNextBox();
  
  stroke(#214263,128);
  drawNextBox();

  ////////////////
  // gray + alpha
  ////////////////
  stroke(0,0);
  drawNextBox();
  
  stroke(0,128);
  drawNextBox();
  
  stroke(0,255);
  drawNextBox();
  
  stroke(1,0);
  drawNextBox();
  
  stroke(1,128);
  drawNextBox();
  
  stroke(1,255);
  drawNextBox();
  
  stroke(50,0);
  drawNextBox();
  
  stroke(50,128);
  drawNextBox();
  
  stroke(50,255);
  drawNextBox();
  
  stroke(128,0);
  drawNextBox();
  
  stroke(128,128);
  drawNextBox();
  
  stroke(128,255);
  drawNextBox();
  
  stroke(255,255);
  drawNextBox();
  
  stroke(255,128);
  drawNextBox();
  
  stroke(255,0);
  drawNextBox();
  
  ///////////////////////
  // triple values r,g,b
  //////////////////////
  stroke(0,0,0);
  drawNextBox();
  
  stroke(128,128,128);
  drawNextBox();
  
  stroke(255,255,255);
  drawNextBox();
  
  stroke(255,0,0);
  drawNextBox();
  
  stroke(0,255,0);
  drawNextBox();
  
  stroke(0,0,255);
  drawNextBox();
  
  stroke(255,255,0);
  drawNextBox();
  
  stroke(255,0,255);
  drawNextBox();
  
  stroke(0,255,255);
  drawNextBox();
  
  stroke(33,66,99);
  drawNextBox();
  
  ///////////////
  // quad values
  ///////////////
  stroke(0,0,0,0);
  drawNextBox();
  
  stroke(0,0,0,128);
  drawNextBox();
  
  stroke(0,0,0,255);
  drawNextBox();
  
  stroke(128,128,128,0);
  drawNextBox();
  
  stroke(128,128,128,128);
  drawNextBox();
  
  stroke(128,128,128,255);
  drawNextBox();
  
  stroke(255,255,255,0);
  drawNextBox();
  
  // !!
  stroke(255,255,255,53);
  drawNextBox();
  
  stroke(255,255,255,255);
  drawNextBox();
  
  stroke(255,0,0,0);
  drawNextBox();
  
  stroke(255,0,0,128);
  drawNextBox();
  
  stroke(255,0,0,255);
  drawNextBox();
  
  stroke(0,255,0,0);
  drawNextBox();
  
  stroke(0,255,0,128);
  drawNextBox();
  
  stroke(0,255,0,255);
  drawNextBox();
  
  stroke(33,66,99,0);
  drawNextBox();
  
  stroke(33,66,99,128);
  drawNextBox();
  
  stroke(33,66,99,255);
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