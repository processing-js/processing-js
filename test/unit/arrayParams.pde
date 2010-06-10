// checks for [] inside function parameters, must be removed

int[] subdivide(int[] points){
  return points;
}

int[] subdivide2(int points[]){
  return points;
}

int[] ideas = new int[2];
ideas[0] = 1;
ideas[1] = 2;

int[] newIdeas = subdivide(ideas);

_checkEqual(2, newIdeas[1]);

newIdeas = subdivide2(ideas);

_checkEqual(1, newIdeas[0]);

