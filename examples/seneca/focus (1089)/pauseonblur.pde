/* @pjs pauseOnBlur="true"; */

interface Javascript {}
Javascript javascript=null;
void bindJavascript(Javascript js) { javascript=js; }

void setup()
{
	size(200,200);
	frameRate(60);
	text("",0,0);
}

float off = 0;
float ostep = PI/180;
void draw()
{
	if(focused) { background(250,255,250); }
	else { background(255,250,250); }
	off = off+ostep;
	float dval = abs(255*sin(off));
	int val = (int) dval;
	int c = 255 - val;
	stroke(0,100);
	noFill();
	ellipse(width/2, height/2, c, c);
	fill(0);
	String f = (focused? "focused" : "unfocused");
	float w = textWidth(f);
	text(f, (width-w)/2, height/2);
}