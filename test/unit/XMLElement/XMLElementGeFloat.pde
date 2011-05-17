float check = "123.456";
String xmlstring = "<top><first id='"+check+"'></first><top>";
XMLElement e = XMLElement.parse(xmlstring);
String id = e.getChild(0).getFloat("id");
_checkEqual(id,check);
