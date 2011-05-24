int check = "123";
String xmlstring = "<top><first id='"+check+"'></first><top>";
XMLElement e = XMLElement.parse(xmlstring);
String id = e.getChild(0).getInt("id");
_checkEqual(id,check);
