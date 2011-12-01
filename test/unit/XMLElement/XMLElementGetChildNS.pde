String xml =  '<?xml version="1.0"?>' + "\n"+
              '<location xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#">'+"\n"+
              '	<geo:Point>'+"\n"+
              '		<geo:lat>40</geo:lat>'+"\n"+
              '		<geo:lon>-90</geo:lon>'+"\n"+
              '	</geo:Point>'+"\n"+
              '</location>';

XMLElement root = XMLElement.parse(xml);

String ref1 = '<geo:Point>'+
              '<geo:lat>40</geo:lat>'+
              '<geo:lon>-90</geo:lon>'+
              '</geo:Point>';

_checkEqual(root.getChild("geo:Point"), ref1),
_checkIsNull(root.getChild("Point"));

String ref2 = '<geo:lat>40</geo:lat>';
_checkEqual(root.getChild("geo:Point/geo:lat"), ref2);
_checkIsNull(root.getChild("Point/lat"));
