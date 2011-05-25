void setup() { size(200,200); noLoop(); }
void draw() { background(255); }
void keyPressed() { println("[" + key + "] "+int(key)+"/"+keyCode); }
