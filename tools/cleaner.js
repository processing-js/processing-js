// Swap escaped bits in code.  See jsshellhelper.py
function clean(s) {
  return s.replace(/@DQUOTE@/g, '"').
           replace(/@SQUOTE@/g, "'").
           replace(/@NEWLINE@/g, '\n').
           replace(/@BACKSLASH@/g, '\\');
}
