// http://studio.sketchpad.cc/sp/pad/view/vXdcIk8XZi/latest?

int num_particles = 30;
Particle[] particles = new Particle[num_particles];
Planet planet;
 
void setup() {
//  size(700, 700);
  background(255);
  smooth();
  strokeWeight(2);
  for (int i=0; i< num_particles; i++) {
    particles[i] = new Particle(new PVector(int(random(0.25*width, 0.85*width)), int(random(0.25*height, 0.85*height))), 
                                new PVector(random(2, 5), random(-3, 3)));
  }
  planet = new Planet(new PVector(width/2, height/2), 60, 0.1);
}
 
void draw() {
  planet.update();
  for (Particle p : particles) {
    p.update();
  }
}
 
class Particle {
  PVector position, velocity, acceleration;  
  int r = int(random(0, 255));
  int g = int(random(0, 255));
  int b = int(random(0, 255));
  
  Particle(PVector pos, PVector vel) {
    position = pos;
    velocity = vel;
  }
  
  void update() {
    PVector direction = PVector.sub(planet.get_position(), position);
    direction.normalize();
    acceleration = PVector.mult(direction, planet.get_gravity());
    velocity.add(acceleration);
    position.add(velocity);
    stroke(r, g, b, 100);
    point(position.x, position.y);
  }
}
 
class Planet {
  PVector position;
  int radius;
  float gravity;
  
  Planet(PVector pos, int r, float g) {
    position = pos;
    radius = r;
    gravity = g;
  }
  
  void update() {
    noStroke();
    noFill();
    ellipse(position.x, position.y, radius, radius);
  }
  
  PVector get_position(){
    return position;
  }
  
  float get_gravity() {
    return gravity;
  }
}
