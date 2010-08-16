// unit test for code coverage tool to bring coverage percent up
size(500,500);

String[] a = {"a", "b"};
String[] b = {"c", "d"};
String[] c = concat(a,b);
_checkEqual(c[2], b[0]);
 	
String[] sa1 = { "OH ", "NY ", "CA ", "VA ", "CO ", "IL "};
String[] sa2 = subset(sa1, 1);
_checkEqual(sa2[1], "CA ");
String[] sa3 = subset(sa1, 2, 3);
_checkEqual(sa3[1], "VA ");

String[] animals = new String[3]; 
animals[0] = "cat"; 
animals[1] = "seal"; 
animals[2] = "bear"; 
String joinedAnimals = join(animals, " : "); 
_checkEqual(joinedAnimals, "cat : seal : bear"); // Prints "cat : seal : bear" 

String[] north = { "OH", "IN", "MI"};
String[] south = { "GA", "FL", "NC"}; 
arrayCopy(north, south, 2);
_checkEqual(south[1], "IN");  // Prints OH, IN, MI
_checkEqual(south[2], "NC");

ArrayList stuff = new ArrayList();
stuff.add(north);
stuff.add(south);
String[] s2 = (String[]) stuff.get(1);
_checkEqual(s2[2], "NC");
_checkEqual(stuff.isEmpty(), false);
stuff.clear();
_checkEqual(stuff.size(), 0);

s2 = reverse(s2);
_checkEqual(s2[0], "NC");
