
float ang = 0, ang2 = 0, ang3 = 0, ang4 = 0;	
float px = 0, py = 0, pz = 0;	
float flapSpeed = 0.2;	

int LAME = 64;
PVector points[][];

void setup() {	
	size(640, 480, OPENGL);
	frameRate(50);
	noStroke();	

	console.log( 'creating sphere' );
	points = [];
	for ( int i = 0 ; i < LAME ; i++ ) {
		PVector row = [];
		points.push( row );

		float ratio = i / ( LAME - 1 ); // from 0 to 1
		ratio = ratio * 2 - 1; // between -1 and +1

		float y = ratio;
		float radius = Math.sqrt( 1 - y * y );

		for ( float j = 0 ; j < LAME ; j++ ) {
			float angle = ( 44.0 / 7.0 ) * ( j / ( LAME - 1 ) );
			row.push( new PVector( radius * Math.cos( angle ) , radius * Math.sin( angle ) , y ) );
		}
	}
	console.log( 'created sphere' );
}	

PVector vertexAt( int i, int j ) {
	if ( i < 0 ) i = LAME - 1;
	if ( j < 0 ) j = LAME - 1;
	if ( i >= LAME ) i = 0;
	if ( j >= LAME ) j = 0;
	return points[ i ][ j ];
}

void vert( PVector pt ) {
	normal( pt.x, pt.y, pt.z );
	vertex( pt.x, pt.y, pt.z, 0,0 );
}

void draw(){	
	background(0);	
	camera();	

	// Flight	
	px = sin(radians(ang3)) * 170;	
	py = cos(radians(ang3)) * 300;	
	pz = sin(radians(ang4)) * 500;	

	translate(width/2 + px, height/2 + py, -700+pz);	

	rotateX(sin(radians(ang2)) * 120);	
	rotateY(sin(radians(ang2)) * 50);	
	rotateZ(sin(radians(ang2)) * 65);	
	
	// Increment angles	
	ang2 += 0.01;	
	ang3 += 2.0;	
	ang4 += 0.75;	

	beginShape( TRIANGLES );
	scale( 200 );

	int add = 1;
	for ( int i = 0 ; i < LAME - 1 ; i++ ) {
		for ( int j = 0 ; j < LAME ; j++ ) {
			vert( vertexAt( i + 0,   j + 0 ) );
			vert( vertexAt( i + 0,   j + 1 ) );
			vert( vertexAt( i + add, j + 0 ) );

			vert( vertexAt( i + 0,   j + 1 ) );
			vert( vertexAt( i + add, j + 1 ) );
			vert( vertexAt( i + add, j + 0 ) );
		}
	}

	endShape();

	println(frameRate);
}	
