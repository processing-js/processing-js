/**
 * XMLAttribute is an attribute of a XML element.
 *
 * @param {String} fname     the full name of the attribute
 * @param {String} n         the short name of the attribute
 * @param {String} namespace the namespace URI of the attribute
 * @param {String} v         the value of the attribute
 * @param {String }t         the type of the attribute
 *
 * @see XMLElement
 */
module.exports = function() {

  var XMLAttribute = function (fname, n, nameSpace, v, t){
    this.fullName = fname || "";
    this.name = n || "";
    this.namespace = nameSpace || "";
    this.value = v;
    this.type = t;
  };

  XMLAttribute.prototype = {
    /**
     * @member XMLAttribute
     * The getName() function returns the short name of the attribute
     *
     * @return {String} the short name of the attribute
     */
    getName: function() {
      return this.name;
    },
    /**
     * @member XMLAttribute
     * The getFullName() function returns the full name of the attribute
     *
     * @return {String} the full name of the attribute
     */
    getFullName: function() {
      return this.fullName;
    },
    /**
     * @member XMLAttribute
     * The getNamespace() function returns the namespace of the attribute
     *
     * @return {String} the namespace of the attribute
     */
    getNamespace: function() {
      return this.namespace;
    },
    /**
     * @member XMLAttribute
     * The getValue() function returns the value of the attribute
     *
     * @return {String} the value of the attribute
     */
    getValue: function() {
      return this.value;
    },
    /**
     * @member XMLAttribute
     * The getValue() function returns the type of the attribute
     *
     * @return {String} the type of the attribute
     */
    getType: function() {
      return this.type;
    },
    /**
     * @member XMLAttribute
     * The setValue() function sets the value of the attribute
     *
     * @param {String} newval the new value
     */
    setValue: function(newval) {
      this.value = newval;
    }
  };

  return XMLAttribute;
};
