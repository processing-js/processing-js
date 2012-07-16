String xmlstring1 = "<xml test='monkey'>lalalas<b>moobles</b>ginger beer</xml>";
String xmlstring2 = "<xml test='monkey'>lalalas<b>moobles</b>ginger beeeer</xml>";

// test for different XML
XML xml1 = XML.parse(xmlstring1);
XML xml2 = XML.parse(xmlstring2);
_checkEqual(xml1.toString().equals(xml2.toString()), false);
_checkEqual(xml1.equals(xml2), false);

// test for equal XML
xml2 = XML.parse(xmlstring1);
_checkEqual(xml1.toString().equals(xml2.toString()), true);
_checkEqual(xml1.equals(xml2), true);

// test for self-copy construction
xml2 = XML.parse(xml1.toString());
_checkEqual(xml1.equals(xml2), true);

// test for functionally equal XML, with differently ordered attributes
xmlstring1 = "<xml a='a' e='e'>lalalas<b c='c' d='d'>moobles</b></xml>";
xmlstring2 = "<xml e='e' a='a'>lalalas<b d='d' c='c'>moobles</b></xml>";
XML xml1 = XML.parse(xmlstring1);
XML xml2 = XML.parse(xmlstring2);
_checkEqual(xml1.equals(xml2), true);
