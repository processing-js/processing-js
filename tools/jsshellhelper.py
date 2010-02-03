#!/usr/bin/env python
import os.path

# Uses jsshell https://developer.mozilla.org/en/Introduction_to_the_JavaScript_shell

def stringify(filename):
  """ Loads a file (.js, .pde) and stringifies it, escaping anything that can't get passed to js -e '...' """
  filepath = os.path.abspath(filename)
  pcode = ''
  f = open(filepath, "r");
  for line in f:
    pcode += line.rstrip('\r\n').replace('"', '@DQUOTE@').replace("'", '@SQUOTE@').replace("\\", "@BACKSLASH@") + "@NEWLINE@"
  f.close()

  return pcode
