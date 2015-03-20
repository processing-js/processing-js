String xmlstring = "<root>test</root>";
XMLElement e = parseXML(xmlstring);
String id = e.toString();
String check = "<root>test</root>";
_checkEqual(id,check);
