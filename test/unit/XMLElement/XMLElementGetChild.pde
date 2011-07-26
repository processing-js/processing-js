String xml =  "<?xml version='1.0'?>\n"+
              "<websites>\n"+
              "  <site id='0' url='processing.org'>Processing</site>\n"+
              "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
              "</websites>";

String[] urls = ["processing.org", "mobile.processing.org"];
String[] sites = ["Processing", "Processing Mobile"];

XMLElement root = XMLElement.parse(xml);
int numSites = root.getChildCount();
for (int i = 0; i < numSites; i++) {
  XMLElement child = root.getChild(i);
  int id = child.getIntAttribute("id"); 
  _checkEqual(i, id);
  String url = child.getStringAttribute("url"); 
  _checkEqual(url, urls[i]);
  String site = child.getContent();
  _checkEqual(site, sites[i]);
}