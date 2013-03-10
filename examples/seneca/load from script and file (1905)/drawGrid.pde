void drawGrid() {
  useGrey(); // located in codebase.pde
  int x, y, step = int(width/10);
  for(x=step; x<width+step; x+=step) { line(x,0,x,height); }
  step = int(height/10);
  for(y=step; y<height+step; y+=step) { line(0,y,width,y); }
}