String xmlstring = "<root><a/><b></b></root>";
XMLElement e = XMLElement.parse(xmlstring);
String id = e.toString();
String check = "<root><a/><b/></root>";
_checkEqual(id,check);
