boolean moving = false;
void mouseMoved() {
  if(moving) return;
  moving = true;
  redraw();
  ellipse(mouseX,mouseY,10,10);
  moving = false;
}
