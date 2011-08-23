String xmlstring = "<top><xmle>This is an .xml string test</xmle><svge>This is an .svg string test</svge></top>";
XMLElement el = XMLElement.parse(xmlstring);
// if there is no attempt to fetch from file, this test passes