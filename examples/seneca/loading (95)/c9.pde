String lstring = "C9 loaded successfully!";

void setup()
{
  size(200,100);
  textFont(createFont("Arial",18));
  noLoop();
}

void draw()
{
  fill(0);
  float tw = textWidth(lstring);
  text(lstring, (width-tw)/2, height/2);
}