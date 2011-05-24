String check = "abc";
String xmlstring = "<top><first id='"+check+"'></first><top>";
XMLElement e = XMLElement.parse(xmlstring);
String id = e.getChild(0).getString("id");
_checkEqual(id,check);
