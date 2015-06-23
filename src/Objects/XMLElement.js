/**
 * XMLElement is a representation of an XML object. The object is able to parse XML code
 *
 * @param {PApplet} parent   typically use "this"
 * @param {String} filename  name of the XML/SVG file to load
 * @param {String} xml       the xml/svg string
 * @param {String} fullname  the full name of the element
 * @param {String} namespace the namespace  of the URI
 * @param {String} systemID  the system ID of the XML data where the element starts
 * @param {Integer }lineNr   the line in the XML data where the element starts
 */
module.exports = function(options, undef) {

  var Browser = options.Browser,
      ajax = Browser.ajax,
      window = Browser.window,
      XMLHttpRequest = window.XMLHttpRequest,
      DOMParser = window.DOMParser,
      XMLAttribute = options. XMLAttribute;

  var XMLElement = function(selector, uri, sysid, line) {
    this.attributes = [];
    this.children   = [];
    this.fullName   = null;
    this.name       = null;
    this.namespace  = "";
    this.content = null;
    this.parent    = null;
    this.lineNr     = "";
    this.systemID   = "";
    this.type = "ELEMENT";

    if (selector) {
      if (typeof selector === "string") {
        if (uri === undef && selector.indexOf("<") > -1) {
          // load XML from text string
          this.parse(selector);
        } else {
          // XMLElement(fullname, namespace, sysid, line) format
          this.fullName = selector;
          this.namespace = uri;
          this.systemId = sysid;
          this.lineNr = line;
        }
      } else {
        // XMLElement(this, file uri) format
        this.parse(uri, true);
      }
    }
  };
  /**
   * XMLElement methods
   * missing: enumerateAttributeNames(), enumerateChildren(),
   * NOTE: parse does not work when a url is passed in
   */
  XMLElement.prototype = {
    /**
     * @member XMLElement
     * The parse() function retrieves the file via ajax() and uses DOMParser()
     * parseFromString method to make an XML document
     * @addon
     *
     * @param {String} filename name of the XML/SVG file to load
     *
     * @throws ExceptionType Error loading document
     *
     * @see XMLElement#parseChildrenRecursive
     */
    parse: function(textstring, stringIsURI) {
      var xmlDoc;
      try {
        if (stringIsURI) {
          textstring = ajax(textstring);
        }
        xmlDoc = new DOMParser().parseFromString(textstring, "text/xml");
        var elements = xmlDoc.documentElement;
        if (elements) {
          this.parseChildrenRecursive(null, elements);
        } else {
          throw ("Error loading document");
        }
        return this;
      } catch(e) {
        throw(e);
      }
    },
    /**
     * @member XMLElement
     * Internal helper function for parse().
     * Loops through the
     * @addon
     *
     * @param {XMLElement} parent                      the parent node
     * @param {XML document childNodes} elementpath    the remaining nodes that need parsing
     *
     * @return {XMLElement} the new element and its children elements
     */
    parseChildrenRecursive: function (parent, elementpath){
      var xmlelement,
        xmlattribute,
        tmpattrib,
        l, m,
        child;
      if (!parent) { // this element is the root element
        this.fullName = elementpath.localName;
        this.name     = elementpath.nodeName;
        xmlelement    = this;
      } else { // this element has a parent
        xmlelement         = new XMLElement(elementpath.nodeName);
        xmlelement.parent  = parent;
      }

      // if this is a text node, return a PCData element (parsed character data)
      if (elementpath.nodeType === 3 && elementpath.textContent !== "") {
        return this.createPCDataElement(elementpath.textContent);
      }

      // if this is a CDATA node, return a CData element (unparsed character data)
      if (elementpath.nodeType === 4) {
       return this.createCDataElement(elementpath.textContent);
      }

      // bind all attributes, if there are any
      if (elementpath.attributes) {
        for (l = 0, m = elementpath.attributes.length; l < m; l++) {
          tmpattrib    = elementpath.attributes[l];
          xmlattribute = new XMLAttribute(tmpattrib.getname,
                                          tmpattrib.nodeName,
                                          tmpattrib.namespaceURI,
                                          tmpattrib.nodeValue,
                                          tmpattrib.nodeType);
          xmlelement.attributes.push(xmlattribute);
        }
      }

      // bind all children, if there are any
      if (elementpath.childNodes) {
        for (l = 0, m = elementpath.childNodes.length; l < m; l++) {
          var node = elementpath.childNodes[l];
          child = xmlelement.parseChildrenRecursive(xmlelement, node);
          if (child !== null) {
            xmlelement.children.push(child);
          }
        }
      }

      return xmlelement;
    },
    /**
     * @member XMLElement
     * The createElement() function Creates an empty element
     *
     * @param {String} fullName   the full name of the element
     * @param {String} namespace  the namespace URI
     * @param {String} systemID   the system ID of the XML data where the element starts
     * @param {int} lineNr    the line in the XML data where the element starts
     */
    createElement: function (fullname, namespaceuri, sysid, line) {
      if (sysid === undef) {
        return new XMLElement(fullname, namespaceuri);
      }
      return new XMLElement(fullname, namespaceuri, sysid, line);
    },
    /**
     * @member XMLElement
     * The createPCDataElement() function creates an element to be used for #PCDATA content.
     * Because Processing discards whitespace TEXT nodes, this method will not build an element
     * if the passed content is empty after trimming for whitespace.
     *
     * @return {XMLElement} new "pcdata" XMLElement, or null if content consists only of whitespace
     */
    createPCDataElement: function (content, isCDATA) {
      if (content.replace(/^\s+$/g,"") === "") {
        return null;
      }
      var pcdata = new XMLElement();
      pcdata.type = "TEXT";
      pcdata.content = content;
      return pcdata;
    },
    /**
     * @member XMLElement
     * The createCDataElement() function creates an element to be used for CDATA content.
     *
     * @return {XMLElement} new "cdata" XMLElement, or null if content consists only of whitespace
     */
    createCDataElement: function (content) {
      var cdata = this.createPCDataElement(content);
      if (cdata === null) {
        return null;
      }

      cdata.type = "CDATA";
      var htmlentities = {"<": "&lt;", ">": "&gt;", "'": "&apos;", '"': "&quot;"},
          entity;
      for (entity in htmlentities) {
        if (!Object.hasOwnProperty(htmlentities,entity)) {
          content = content.replace(new RegExp(entity, "g"), htmlentities[entity]);
        }
      }
      cdata.cdata = content;
      return cdata;
    },
    /**
     * @member XMLElement
     * The hasAttribute() function returns whether an attribute exists
     *
     * @param {String} name      name of the attribute
     * @param {String} namespace the namespace URI of the attribute
     *
     * @return {boolean} true if the attribute exists
     */
    hasAttribute: function () {
      if (arguments.length === 1) {
        return this.getAttribute(arguments[0]) !== null;
      }
      if (arguments.length === 2) {
        return this.getAttribute(arguments[0],arguments[1]) !== null;
      }
    },
    /**
     * @member XMLElement
     * The equals() function checks to see if the XMLElement being passed in equals another XMLElement
     *
     * @param {XMLElement} rawElement the element to compare to
     *
     * @return {boolean} true if the element equals another element
     */
    equals: function(other) {
      if (!(other instanceof XMLElement)) {
        return false;
      }
      var i, j;
      if (this.fullName !== other.fullName) { return false; }
      if (this.attributes.length !== other.getAttributeCount()) { return false; }
      // attributes may be ordered differently
      if (this.attributes.length !== other.attributes.length) { return false; }
      var attr_name, attr_ns, attr_value, attr_type, attr_other;
      for (i = 0, j = this.attributes.length; i < j; i++) {
        attr_name = this.attributes[i].getName();
        attr_ns = this.attributes[i].getNamespace();
        attr_other = other.findAttribute(attr_name, attr_ns);
        if (attr_other === null) { return false; }
        if (this.attributes[i].getValue() !== attr_other.getValue()) { return false; }
        if (this.attributes[i].getType() !== attr_other.getType()) { return false; }
      }
      // children must be ordered identically
      if (this.children.length !== other.getChildCount()) { return false; }
      if (this.children.length>0) {
        var child1, child2;
        for (i = 0, j = this.children.length; i < j; i++) {
          child1 = this.getChild(i);
          child2 = other.getChild(i);
          if (!child1.equals(child2)) { return false; }
        }
        return true;
      }
      return (this.content === other.content);
    },
    /**
     * @member XMLElement
     * The getContent() function returns the content of an element. If there is no such content, null is returned
     *
     * @return {String} the (possibly null) content
     */
    getContent: function(){
      if (this.type === "TEXT" || this.type === "CDATA") {
        return this.content;
      }
      var children = this.children;
      if (children.length === 1 && (children[0].type === "TEXT" || children[0].type === "CDATA")) {
        return children[0].content;
      }
      return null;
    },
    /**
     * @member XMLElement
     * The getAttribute() function returns the value of an attribute
     *
     * @param {String} name         the non-null full name of the attribute
     * @param {String} namespace    the namespace URI, which may be null
     * @param {String} defaultValue the default value of the attribute
     *
     * @return {String} the value, or defaultValue if the attribute does not exist
     */
    getAttribute: function (){
      var attribute;
      if (arguments.length === 2) {
        attribute = this.findAttribute(arguments[0]);
        if (attribute) {
          return attribute.getValue();
        }
        return arguments[1];
      } else if (arguments.length === 1) {
        attribute = this.findAttribute(arguments[0]);
        if (attribute) {
          return attribute.getValue();
        }
        return null;
      } else if (arguments.length === 3) {
        attribute = this.findAttribute(arguments[0],arguments[1]);
        if (attribute) {
          return attribute.getValue();
        }
        return arguments[2];
      }
    },
    /**
     * @member XMLElement
     * The getStringAttribute() function returns the string attribute of the element
     * If the <b>defaultValue</b> parameter is used and the attribute doesn't exist, the <b>defaultValue</b> value is returned.
     * When calling the function without the <b>defaultValue</b> parameter, if the attribute doesn't exist, the value 0 is returned.
     *
     * @param name         the name of the attribute
     * @param defaultValue value returned if the attribute is not found
     *
     * @return {String} the value, or defaultValue if the attribute does not exist
     */
    getStringAttribute: function() {
      if (arguments.length === 1) {
        return this.getAttribute(arguments[0]);
      }
      if (arguments.length === 2) {
        return this.getAttribute(arguments[0], arguments[1]);
      }
      return this.getAttribute(arguments[0], arguments[1],arguments[2]);
    },
    /**
     * Processing 1.5 XML API wrapper for the generic String
     * attribute getter. This may only take one argument.
     */
    getString: function(attributeName) {
      return this.getStringAttribute(attributeName);
    },
    /**
     * @member XMLElement
     * The getFloatAttribute() function returns the float attribute of the element.
     * If the <b>defaultValue</b> parameter is used and the attribute doesn't exist, the <b>defaultValue</b> value is returned.
     * When calling the function without the <b>defaultValue</b> parameter, if the attribute doesn't exist, the value 0 is returned.
     *
     * @param name         the name of the attribute
     * @param defaultValue value returned if the attribute is not found
     *
     * @return {float} the value, or defaultValue if the attribute does not exist
     */
    getFloatAttribute: function() {
      if (arguments.length === 1 ) {
        return parseFloat(this.getAttribute(arguments[0], 0));
      }
      if (arguments.length === 2 ) {
        return this.getAttribute(arguments[0], arguments[1]);
      }
      return this.getAttribute(arguments[0], arguments[1],arguments[2]);
    },
    /**
     * Processing 1.5 XML API wrapper for the generic float
     * attribute getter. This may only take one argument.
     */
    getFloat: function(attributeName) {
      return this.getFloatAttribute(attributeName);
    },
    /**
     * @member XMLElement
     * The getIntAttribute() function returns the integer attribute of the element.
     * If the <b>defaultValue</b> parameter is used and the attribute doesn't exist, the <b>defaultValue</b> value is returned.
     * When calling the function without the <b>defaultValue</b> parameter, if the attribute doesn't exist, the value 0 is returned.
     *
     * @param name         the name of the attribute
     * @param defaultValue value returned if the attribute is not found
     *
     * @return {int} the value, or defaultValue if the attribute does not exist
     */
    getIntAttribute: function () {
      if (arguments.length === 1) {
        return this.getAttribute( arguments[0], 0 );
      }
      if (arguments.length === 2) {
        return this.getAttribute(arguments[0], arguments[1]);
      }
      return this.getAttribute(arguments[0], arguments[1],arguments[2]);
    },
    /**
     * Processing 1.5 XML API wrapper for the generic int
     * attribute getter. This may only take one argument.
     */
    getInt: function(attributeName) {
      return this.getIntAttribute(attributeName);
    },
    /**
     * @member XMLElement
     * The hasChildren() function returns whether the element has children.
     *
     * @return {boolean} true if the element has children.
     */
    hasChildren: function () {
      return this.children.length > 0 ;
    },
    /**
     * @member XMLElement
     * The addChild() function adds a child element
     *
     * @param {XMLElement} child the non-null child to add.
     */
    addChild: function (child) {
      if (child !== null) {
        child.parent = this;
        this.children.push(child);
      }
    },
    /**
     * @member XMLElement
     * The insertChild() function inserts a child element at the index provided
     *
     * @param {XMLElement} child  the non-null child to add.
     * @param {int} index     where to put the child.
     */
    insertChild: function (child, index) {
      if (child) {
        if ((child.getLocalName() === null) && (! this.hasChildren())) {
          var lastChild = this.children[this.children.length -1];
          if (lastChild.getLocalName() === null) {
              lastChild.setContent(lastChild.getContent() + child.getContent());
              return;
          }
        }
        child.parent = this;
        this.children.splice(index,0,child);
      }
    },
    /**
     * @member XMLElement
     * The getChild() returns the child XMLElement as specified by the <b>index</b> parameter.
     * The value of the <b>index</b> parameter must be less than the total number of children to avoid going out of the array storing the child elements.
     * When the <b>path</b> parameter is specified, then it will return all children that match that path. The path is a series of elements and sub-elements, separated by slashes.
     *
     * @param {int} index     where to put the child.
     * @param {String} path       path to a particular element
     *
     * @return {XMLElement} the element
     */
    getChild: function (selector) {
      if (typeof selector === "number") {
        return this.children[selector];
      }
      if (selector.indexOf('/') !== -1) {
        // path traversal is required
        return this.getChildRecursive(selector.split("/"), 0);
      }
      var kid, kidName;
      for (var i = 0, j = this.getChildCount(); i < j; i++) {
        kid = this.getChild(i);
        kidName = kid.getName();
        if (kidName !== null && kidName === selector) {
            return kid;
        }
      }
      return null;
    },
    /**
     * @member XMLElement
     * The getChildren() returns all of the children as an XMLElement array.
     * When the <b>path</b> parameter is specified, then it will return all children that match that path.
     * The path is a series of elements and sub-elements, separated by slashes.
     *
     * @param {String} path       element name or path/to/element
     *
     * @return {XMLElement} array of child elements that match
     *
     * @see XMLElement#getChildCount()
     * @see XMLElement#getChild()
     */
    getChildren: function(){
      if (arguments.length === 1) {
        if (typeof arguments[0] === "number") {
          return this.getChild( arguments[0]);
        }
        if (arguments[0].indexOf('/') !== -1) { // path was given
          return this.getChildrenRecursive( arguments[0].split("/"), 0);
        }
        var matches = [];
        var kid, kidName;
        for (var i = 0, j = this.getChildCount(); i < j; i++) {
          kid = this.getChild(i);
          kidName = kid.getName();
          if (kidName !== null && kidName === arguments[0]) {
            matches.push(kid);
          }
        }
        return matches;
      }
      return this.children;
    },
    /**
     * @member XMLElement
     * The getChildCount() returns the number of children for the element.
     *
     * @return {int} the count
     *
     * @see XMLElement#getChild()
     * @see XMLElement#getChildren()
     */
    getChildCount: function() {
      return this.children.length;
    },
    /**
     * @member XMLElement
     * Internal helper function for getChild().
     *
     * @param {String[]} items   result of splitting the query on slashes
     * @param {int} offset   where in the items[] array we're currently looking
     *
     * @return {XMLElement} matching element or null if no match
     */
    getChildRecursive: function (items, offset) {
      // terminating clause: we are the requested candidate
      if (offset === items.length) {
        return this;
      }
      // continuation clause
      var kid, kidName, matchName = items[offset];
      for(var i = 0, j = this.getChildCount(); i < j; i++) {
          kid = this.getChild(i);
          kidName = kid.getName();
          if (kidName !== null && kidName === matchName) {
            return kid.getChildRecursive(items, offset+1);
          }
      }
      return null;
    },
    /**
     * @member XMLElement
     * Internal helper function for getChildren().
     *
     * @param {String[]} items   result of splitting the query on slashes
     * @param {int} offset   where in the items[] array we're currently looking
     *
     * @return {XMLElement[]} matching elements or empty array if no match
     */
    getChildrenRecursive: function (items, offset) {
      if (offset === items.length-1) {
        return this.getChildren(items[offset]);
      }
      var matches = this.getChildren(items[offset]);
      var kidMatches = [];
      for (var i = 0; i < matches.length; i++) {
        kidMatches = kidMatches.concat(matches[i].getChildrenRecursive(items, offset+1));
      }
      return kidMatches;
    },
    /**
     * @member XMLElement
     * The isLeaf() function returns whether the element is a leaf element.
     *
     * @return {boolean} true if the element has no children.
     */
    isLeaf: function() {
      return !this.hasChildren();
    },
    /**
     * @member XMLElement
     * The listChildren() function put the names of all children into an array. Same as looping through
     * each child and calling getName() on each XMLElement.
     *
     * @return {String[]} a list of element names.
     */
    listChildren: function() {
      var arr = [];
      for (var i = 0, j = this.children.length; i < j; i++) {
        arr.push( this.getChild(i).getName());
      }
      return arr;
    },
    /**
     * @member XMLElement
     * The removeAttribute() function removes an attribute
     *
     * @param {String} name        the non-null name of the attribute.
     * @param {String} namespace   the namespace URI of the attribute, which may be null.
     */
    removeAttribute: function (name , namespace) {
      this.namespace = namespace || "";
      for (var i = 0, j = this.attributes.length; i < j; i++) {
        if (this.attributes[i].getName() === name && this.attributes[i].getNamespace() === this.namespace) {
          this.attributes.splice(i, 1);
          break;
        }
      }
    },
    /**
     * @member XMLElement
     * The removeChild() removes a child element.
     *
     * @param {XMLElement} child      the the non-null child to be renoved
     */
    removeChild: function(child) {
      if (child) {
        for (var i = 0, j = this.children.length; i < j; i++) {
          if (this.children[i].equals(child)) {
            this.children.splice(i, 1);
            break;
          }
        }
      }
    },
    /**
     * @member XMLElement
     * The removeChildAtIndex() removes the child located at a certain index
     *
     * @param {int} index      the index of the child, where the first child has index 0
     */
    removeChildAtIndex: function(index) {
      if (this.children.length > index) { //make sure its not outofbounds
        this.children.splice(index, 1);
      }
    },
    /**
     * @member XMLElement
     * The findAttribute() function searches an attribute
     *
     * @param {String} name        fullName the non-null full name of the attribute
     * @param {String} namespace   the name space, which may be null
     *
     * @return {XMLAttribute} the attribute, or null if the attribute does not exist.
     */
    findAttribute: function (name, namespace) {
      this.namespace = namespace || "";
      for (var i = 0, j = this.attributes.length; i < j; i++) {
        if (this.attributes[i].getName() === name && this.attributes[i].getNamespace() === this.namespace) {
           return this.attributes[i];
        }
      }
      return null;
    },
    /**
     * @member XMLElement
     * The setAttribute() function sets an attribute.
     *
     * @param {String} name        the non-null full name of the attribute
     * @param {String} namespace   the non-null value of the attribute
     */
    setAttribute: function() {
      var attr;
      if (arguments.length === 3) {
        var index = arguments[0].indexOf(':');
        var name  = arguments[0].substring(index + 1);
        attr      = this.findAttribute(name, arguments[1]);
        if (attr) {
          attr.setValue(arguments[2]);
        } else {
          attr = new XMLAttribute(arguments[0], name, arguments[1], arguments[2], "CDATA");
          this.attributes.push(attr);
        }
      } else {
        attr = this.findAttribute(arguments[0]);
        if (attr) {
          attr.setValue(arguments[1]);
        } else {
          attr = new XMLAttribute(arguments[0], arguments[0], null, arguments[1], "CDATA");
          this.attributes.push(attr);
        }
      }
    },
    /**
     * Processing 1.5 XML API wrapper for the generic String
     * attribute setter. This must take two arguments.
     */
    setString: function(attribute, value) {
      this.setAttribute(attribute, value);
    },
    /**
     * Processing 1.5 XML API wrapper for the generic int
     * attribute setter. This must take two arguments.
     */
    setInt: function(attribute, value) {
      this.setAttribute(attribute, value);
    },
    /**
     * Processing 1.5 XML API wrapper for the generic float
     * attribute setter. This must take two arguments.
     */
    setFloat: function(attribute, value) {
      this.setAttribute(attribute, value);
    },
    /**
     * @member XMLElement
     * The setContent() function sets the #PCDATA content. It is an error to call this method with a
     * non-null value if there are child objects.
     *
     * @param {String} content     the (possibly null) content
     */
    setContent: function(content) {
      if (this.children.length > 0) {
        Processing.debug("Tried to set content for XMLElement with children"); }
      this.content = content;
    },
    /**
     * @member XMLElement
     * The setName() function sets the full name. This method also sets the short name and clears the
     * namespace URI.
     *
     * @param {String} name        the non-null name
     * @param {String} namespace   the namespace URI, which may be null.
     */
    setName: function() {
      if (arguments.length === 1) {
        this.name      = arguments[0];
        this.fullName  = arguments[0];
        this.namespace = null;
      } else {
        var index = arguments[0].indexOf(':');
        if ((arguments[1] === null) || (index < 0)) {
            this.name = arguments[0];
        } else {
            this.name = arguments[0].substring(index + 1);
        }
        this.fullName  = arguments[0];
        this.namespace = arguments[1];
      }
    },
    /**
     * @member XMLElement
     * The getName() function returns the full name (i.e. the name including an eventual namespace
     * prefix) of the element.
     *
     * @return {String} the name, or null if the element only contains #PCDATA.
     */
    getName: function() {
      return this.fullName;
    },
    /**
     * @member XMLElement
     * The getLocalName() function returns the local name (i.e. the name excluding an eventual namespace
     * prefix) of the element.
     *
     * @return {String} the name, or null if the element only contains #PCDATA.
     */
    getLocalName: function() {
      return this.name;
    },
    /**
     * @member XMLElement
     * The getAttributeCount() function returns the number of attributes for the node
     * that this XMLElement represents.
     *
     * @return {int} the number of attributes in this XMLElement
     */
    getAttributeCount: function() {
      return this.attributes.length;
    },
    /**
     * @member XMLElement
     * The toString() function returns the XML definition of an XMLElement.
     *
     * @return {String} the XML definition of this XMLElement
     */
    toString: function() {
      // shortcut for text and cdata nodes
      if (this.type === "TEXT") {
        return this.content || "";
      }

      if (this.type === "CDATA") {
        return this.cdata || "";
      }

      // real XMLElements
      var tagstring = this.fullName;
      var xmlstring =  "<" + tagstring;
      var a,c;

      // serialize the attributes to XML string
      for (a = 0; a<this.attributes.length; a++) {
        var attr = this.attributes[a];
        xmlstring += " "  + attr.getName() + "=" + '"' + attr.getValue() + '"';
      }

      // serialize all children to XML string
      if (this.children.length === 0) {
        if (this.content === "" || this.content === null || this.content === undefined) {
          xmlstring += "/>";
        } else {
          xmlstring += ">" + this.content + "</"+tagstring+">";
        }
      } else {
        xmlstring += ">";
        for (c = 0; c<this.children.length; c++) {
          xmlstring += this.children[c].toString();
        }
        xmlstring += "</" + tagstring + ">";
      }
      return xmlstring;
     }
  };

  /**
   * static Processing 1.5 XML API wrapper for the
   * parse method. This may only take one argument.
   */
  XMLElement.parse = function(xmlstring) {
    var element = new XMLElement();
    element.parse(xmlstring);
    return element;
  };

  return XMLElement;
};
