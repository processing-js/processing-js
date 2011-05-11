void setup()
{
	size(400,400);
	println("random print");
}

void draw()
{
	background(155, 155, 0);
	stroke(255,0,0);
	line(0,0,width,height);
	stroke(0,0,255);
	line(width,0,0,height);
}
