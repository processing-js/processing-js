class Particle{
  float xPos, yPos, zPos;
  float xVel, yVel, zPos;
  float age;
  float lifeTime;
  float opacity;
  float size;
  
  Particle(){
    xPos = 0;
    yPos = 0;
    zPos = 0;
    xVel = 1.4;
    yVel = 1.2;
    zVel = 2.0;
    age = 0;
    lifeTime = 0;
    opacity = 255;
    size = 20;
  }
  
  float getAge(){return age;}
  float getLifeTime(){return lifeTime;}
  float getX(){return xPos;}
  float getY(){return yPos;}
  float getZ(){return zPos;}

  void setAge(a){age = a;}

  void setX(float x){xPos = x;}
  void setY(float y){yPos = y;}
  void setZ(float z){zPos = z;}
  
  void setXVelocity(float x){xVel = x;}
  void setYVelocity(float y){yVel = y;}
  void setZVelocity(float z){zVel = z;}
  
  void setLifeTime(float l){lifeTime = l;}
  
  void reset(){
    opacity = 255;
    size = 20;
  }
  
  void update(){
    age += 0.1; //fix
    
    yVel += 0.1;
    
    xPos += xVel;
    yPos += yVel;
    zPos += zVel;
    
    opacity = 255 - 250*(age/lifeTime);
    size = 20 - 20*(age/lifeTime);
  }
  
  void draw(){
    strokeWeight(size);
    stroke(opacity-50, 0, 255-opacity,opacity/3);
    point(xPos,yPos,zPos);
  }
}

int NUM_PARTICLES = 500;

class ParticleSystem{
  ArrayList p;

  ParticleSystem(){
    p = new ArrayList();
    for(var i = 0; i < NUM_PARTICLES; i++){
      var particle = new Particle(); 
      p.push(particle);
      resetParticle(i);
    }
  }
  
  void resetParticle(int i){
    p[i].reset();
    p[i].setX(mouseX);
    p[i].setY(mouseY);
    p[i].setZ(0);
    p[i].setXVelocity(random(0,2));
    p[i].setYVelocity(random(0,2));
    p[i].setLifeTime(random(1,15));
    p[i].setAge(0);
  }
  
  void update(){
    for(int i=0; i < NUM_PARTICLES; i++){
      p[i].update();
      if(p[i].getAge() > p[i].getLifeTime()){
        resetParticle(i);
      }
    }
  }
  
  void draw(){
    for(int i=0; i < NUM_PARTICLES; i++){
      p[i].draw();
    }
  }
}

ParticleSystem psys;

void setup(){
  size(500,500,OPENGL);
  psys = new ParticleSystem();
}


void draw(){
  background(0);
  stroke(255);
  psys.update();
  psys.draw();
}