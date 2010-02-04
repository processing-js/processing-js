// Swap escaped bits in code.  See jsshellhelper.py for creation of __escaped_string
function __unescape_string() {
  return __escaped_string.replace(/@DQUOTE@/g, '"').
                          replace(/@SQUOTE@/g, "'").
                          replace(/@NEWLINE@/g, '\n').
                          replace(/@BACKSLASH@/g, '\\');
}
