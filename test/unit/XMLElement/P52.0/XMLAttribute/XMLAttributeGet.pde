String sites =  "<?xml version='1.0'?>\n"+
                "<websites number='2'>\n"+
                "  <site id='0' url='processing.org'>Processing</site>\n"+
                "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
                "</websites>";

// load XML data
XML xml  = XML.parse(sites);

String strVal   = xml.getString("number");
_checkEqual(strVal,"2");

int intVal      = xml.getInt("number");
_checkEqual(intVal,2);

float floatVal  = xml.getFloat("number");
_checkEqual(floatVal,2.0);