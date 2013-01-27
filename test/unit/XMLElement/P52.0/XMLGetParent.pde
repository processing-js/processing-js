String xml =  "<?xml version='1.0'?>\n"+
              "<websites>\n"+
              "  <site id='0' url='processing.org'>Processing</site>\n"+
              "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
              "</websites>";

XML root = XML.parse(xml);
XML child = root.getChild(0);
XML test = child.getParent();
_checkEqual(test, root);
