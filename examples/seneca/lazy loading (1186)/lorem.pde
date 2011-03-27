void setup()
{
	size((int)random(100,400),(int)random(100,400));
	text("",0,0);
	takeTime();
	noLoop();
}

void takeTime()
{
	// this will take roughly 400ms to complete
	float stop = millis() + 400;
	while(millis() < stop) {
		String s = "lalala";
		textWidth(s); }
}

void draw()
{
	background(255,200,200);
	fill(0);
	String loadtext = "Sketch loaded as "+width+"/"+height;
	text(loadtext, (width-textWidth(loadtext))/2, height/2);
}