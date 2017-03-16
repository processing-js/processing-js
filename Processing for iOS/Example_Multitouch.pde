void setup() {
   size(screen.width, screen.height);
   background(255);
}

void touchMove(TouchEvent touchEvent) {
   noStroke();
   fill(255);
   rect(0, 0, width, height);
   
   fill(180, 180, 100);
   for (int i = 0; i < touchEvent.touches.length; i++) {
      int x = touchEvent.touches[i].offsetX;
      int y = touchEvent.touches[i].offsetY;
      ellipse(x, y, 150, 150);
   }
}