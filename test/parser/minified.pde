// Parser test for minified processing code
int t,x,X,Y,c,w=255,m;void draw(){t++;background(0);set(X,Y,color(c,c,c*2));}int n(){return int(noise(x%w/99f,x/w/99f,t/99f+m++%2)*w-w/2);}
