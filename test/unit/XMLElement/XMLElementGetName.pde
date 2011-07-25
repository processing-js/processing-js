String menu =   "<?xml version='1.0'?>\n"+
                "<menu>\n"+
                "  <breakfast-menu> \n"+
                "    <food> \n"+
                "      <name id='0'>Belgian Waffles</name> \n"+
                "      <price id='1'>$5.95</price> \n"+
                "      <description id ='2'>two of our famous Belgian Waffles with plenty of real maple syrup</description> \n"+
                "      <calories id='3'>650</calories> \n"+
                "    </food> \n"+
                "    <food> \n"+
                "      <name>Strawberry Belgian Waffles</name> \n"+
                "      <price>$7.95</price> \n"+
                "      <description>light Belgian waffles covered with strawberrys and whipped cream</description> \n"+
                "      <calories>900</calories> \n"+
                "    </food> \n"+
                "  </breakfast-menu> \n"+
                "</menu>";

XMLElement xml = XMLElement.parse(menu);
XMLElement[] children = xml.getChildren("breakfast-menu/food");
for (int i=0; i<children.length; i++) {
  String name = children[i].getName();
  _checkEqual(name,"food");
}
