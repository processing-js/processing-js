int y;
interface Javascript {}
Javascript javascript=null;
void bindJavascript(Javascript js) { javascript=js; }

void setup()
{
	size(200,200);
	y = height/2;
	frameRate(60);
}

float off = 0;
float ostep = PI/180;
void draw()
{
	background(255);
	off = off+ostep;
	float dval = abs(255*sin(off));
	int val = (int) dval;
	int c = 255 - val;
	stroke(0,100);
	ellipse(width/2, height/2, c, c);
	stroke(0);
	line(100,y,200,y);
}

void keyPressed()
{
	// Processing vs Processing.js
	if( (javascript==null && key=='+' && keyCode==61) || (javascript!=null && (key==187 || key==119))) { up(); }
	else if( (javascript==null && key=='-' && keyCode==45) || (javascript!=null && (key==189 || key==115))) { down(); }
}

int step = 2;
void up() { if(y>0) y-=step; }
void down() { if(y<height) y+=step; }
