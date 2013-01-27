String xmlstring = "<top><first id='lol' name='cat' severance='pay'></first><top>";
XML e = XML.parse(xmlstring);
String[] attributes = e.getChild(0).listAttributes();
_checkEqual(attributes,["id", "name", "severance"]);
