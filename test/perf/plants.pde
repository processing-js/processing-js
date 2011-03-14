
	var winW = 150, winH = 150;

	float branchWidth = 6;
	float angle = 0;
	int count = 0;
	int total = 64;
	float sizeVelocity = 0.05;
	int wavieness = 100;
	int greenColor;
	
	void setup()
	{
//		size(winW, winH);
		smooth();
		background(0);
		stroke(20,20,20,255);
		rectMode(CENTER_RADIUS); 
		ellipseMode(CENTER_RADIUS);
		translate(width/2, height/2);
		init();
	}

	void init()
	{
		if(count == total)
		{
			count = 0;
			sizeVelocity += 0.00001;
			//branchWidth -= 0.01;
		}
		count++;
		branch = new Branches(0, 0, branchWidth);
		angle ++;
	}

	void draw()
	{
		rotate(radians(angle));
		branch.draw();
	}

	class Branches
	{
		float x;
		float y;
		float curLength;
		float lengthVelocity;
		float waveIncrementer;
		float waveIncrementerAmount;
		float size;
		int opacity;
		float curX;
		boolean shoot;
		float oldX;
		float oldY;
		float offset;
		
		Branches(int xPos, int yPos, float branchWidth)
		{
			x = xPos;
			y = yPos;
			curX = x;
			
			curLength = 0;
			size = branchWidth + random(10) - random(10);
			lengthVelocity = 2;
			waveIncrementer = random(5, 2*PI);
			waveIncrementerAmount = random(-0.01, 0.01) + random(0.002, 0.05);
			opacity = 0;
			
			float shootWaveIncrementer;
			float shootWaveIncrementerAmount;
			
			greenColor = random(10,255)
		}

		void draw()
		{			
			curX = noise(waveIncrementer * 0.2) * wavieness + sin(waveIncrementer) * wavieness/2;
			y -= lengthVelocity;			
			
			if(size < 3 && !shoot)
			{
				shoot = true;
				oldX = curX;
				oldY = y;
				offset = random(30, 50);
			}
			
			if(shoot)
			{
				//Draw thorns / shoots
				noStroke();
				fill(100, greenColor, 0, 300 - opacity);
				oldX += (2 * PI) / curX;
				oldY -= (2 * PI) / offset;
				ellipse(oldX, oldY, size/2, size/2);
			}
			
			//Draw the stalk shadow
			noStroke();
			fill(0, 0, 0, 10);
			ellipse(curX+10, y+10, size, size);
			
			//Draw the stalk
			stroke(20,20,20, 150 - opacity);
			fill(100, greenColor, 0, 320 - opacity);
			ellipse(curX, y, size, size);			
			
			//Draw stalk highlights
			noStroke();
			fill(100, greenColor+40, 0, 250 - opacity);
			ellipse(curX, y+5, size/2, size/2);
			
			
			//Increment / Decrement the properties
			curLength -= lengthVelocity;
			size -= sizeVelocity;
			waveIncrementer += waveIncrementerAmount;
			opacity ++;
						
			float r = random(0,5);
			
			if(r > 4.95)
			{
				
				//Flowers
				if(size < 3) {flower(curX, y);}
				
				if(size > 6)
				{
					//knots
					stroke(100, greenColor + 50, 0);
					fill(100, greenColor, 0, 255);
					ellipse(curX, y, 5 + size, 5 + size);
					noStroke();

					fill(100, greenColor + 10, 0, 255);
					ellipse(curX, y, 4 + size, 4 + size);

					fill(100, greenColor + 20, 0, 255);
					ellipse(curX, y, 3 + size, 3 + size);

					fill(100, greenColor + 30, 0, 255);
					ellipse(curX, y, 2 + size, 2 + size);

					fill(100, greenColor, 0, 255);
					
					translate(curX, y);
					for (float rot = 0; rot < (2 * PI); rot += (2 * PI) / 8)
					{
						
						pushMatrix();
						rotate(rot);
						beginShape(TRIANGLES);
						vertex(0, 0);
						vertex(10, 0);
						vertex(30, 5);
						endShape();
						popMatrix();
						
					}
				}
			}

			
			// start next branch
			if(size <= 0)
			{
				init();
			}
			
			
		}
	}	
	
	void flower(float x, float y)
	{ 
		color clr = color(100,greenColor,0); 
		float trans = 220;
		stroke(100,greenColor+20,0,200);
		fill(clr,trans);
		translate(x, y); 
		float numPetals = round(random(16, 40)); 
		float petalLength = random(10, 40);
		scale(random(0.3,0.6),random(0.3,0.6));
		
		for (float rot = 0; rot < (2 * PI); rot += (2 * PI) / numPetals)
		{
			pushMatrix();
			rotate(rot);
			beginShape();
			vertex(10,10); 
			vertex(10 + petalLength, 10 + petalLength,20,50,10,10);
			endShape(); 
			popMatrix(); 
		}
		fill(100,greenColor-30,0);
		ellipse(0,0,12,12);
		fill(255,255,255,120);
		ellipse(0,0,5,5);
		ellipse(0,0,2,2);
	}
	
	void noise(float x, float y)
	{
		float n = x + y * 57;
		n = ( n << 13 ) ^ n;
		float result = abs( 1.0 - ( ( ( n * ( ( n * n * 15731 ) + 789221 ) + 1376312589 ) & 0x7fffffff ) / 1073741824.0 ) );
		return result;
	}
