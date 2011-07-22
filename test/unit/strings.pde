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

//Testing the contains functions of the string class
String strLiteralA = "March, 13th 2011" ;
String strLiteralB = "March" ;

_checkEqual(strLiteralA.contains("") , true);
_checkEqual( strLiteralA.contains(strLiteralA), true);
_checkEqual( strLiteralA.contains("March"), true);
_checkEqual( strLiteralA.contains("2011"), true);
_checkEqual( strLiteralA.contains(strLiteralB), true);
_checkEqual( strLiteralA.contains(strLiteralB + ","), true);

_checkEqual( strLiteralA.contains(null), false);
_checkEqual( strLiteralA.contains(2011), false);
_checkEqual( strLiteralA.contains(" "), true);
_checkEqual( strLiteralA.contains(strLiteralB + " "), false);
_checkEqual( strLiteralB.contains(strLiteralA), false);
String charsStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
String result = "";

int randomCharIndex, ii;
//Generate a random string
for (ii = 0; ii < 1024; ii++)
{
  randomCharIndex = Math.floor(Math.random() * 1000) % charsStr.length;
  result = result + charsStr.substr(randomCharIndex , 1);
}

String resultCopy = result;

_checkEqual(resultCopy.contains(result) , true);
_checkEqual(result.contains(resultCopy) , true);


// startsWith and endsWith
String first = "First";
String second = "Second";
String firstString = "First string";
String emptyString = "";

_checkTrue( firstString.startsWith(emptyString) );
_checkTrue( firstString.endsWith(emptyString) );

_checkFalse( firstString.startsWith(null) );
_checkFalse( firstString.endsWith(null) );

_checkTrue( firstString.startsWith(first) );

_checkTrue( firstString.startsWith(firstString) );
_checkTrue( firstString.endsWith(firstString) );

_checkFalse( firstString.startsWith(second) );
_checkFalse( firstString.endsWith(second) );

_checkTrue( firstString.startsWith("irs", 1) );

class ClassWithStringMethods{
  bool startsWith(String prefix, int toffset) {
    return prefix == "testingStartsWith";
  }

  bool endsWith(String suffix) {
    return suffix == "testingEndsWith";
  }
}

ClassWithStringMethods cwsm = new ClassWithStringMethods();
_checkTrue( cwsm.startsWith("testingStartsWith") );
_checkTrue( cwsm.endsWith("testingEndsWith") );
