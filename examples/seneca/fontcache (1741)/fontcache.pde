void setup()
{
  size(200,200);
  text("",0,0);
}

void draw()
{
  float ts = random(10,60);
  textSize(ts);
  fill(255,255,0,50);
  rect(-1,-1,width+2,height+2);
  fill(0);
  float tw = textWidth("testing");
  text("testing",(width-tw)/2,(height+ts/2)/2);
  
  var cl = Processing.prototype.PFont.PFontCache.length;

  var caching = Processing.prototype.PFont.prototype.caching || false;
  if(!caching && cl) caching = "metrics only";
  document.getElementById("cache").innerHTML = caching;

  if(!cl) cl = "n/a";
  document.getElementById("log").innerHTML = cl;
}
