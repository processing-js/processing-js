float gyroscopeX, gyroscopeY, gyroscopeZ;


void setup() {
   size(screen.width, screen.height, P3D);
}

void draw() {
   background(0,0,255);
   translate(width/2,height/2,0);
   translate(100*gyroscopeX,100*gyroscopeY,100*gyroscopeZ);
   box(30);
   
}

//experimental feature
void gyroscopeUpdated(float x, float y, float z) {

}

//experimental feature
void accelerometerUpdated(float x, float y, float z) {
   gyroscopeX = x;
   gyroscopeY = y;
   gyroscopeZ = z;	   
}
