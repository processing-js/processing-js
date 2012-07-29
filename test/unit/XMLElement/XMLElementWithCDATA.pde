String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"+
             "<content>"+
             "    <title><![CDATA[The \"<Battle lol='cat'>\" of t' Brooklyn]]></title>"+
             "</content>";
XMLElement root = XMLElement.parse(xml);

_checkEqual(root.getChild(0).toString(), "<title>The &quot;&lt;Battle lol=&apos;cat&apos;&gt;&quot; of t&apos; Brooklyn</title>");
_checkEqual(root.getChild(0).getContent(), "The \"<Battle lol='cat'>\" of t' Brooklyn");
