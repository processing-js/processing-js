#!/usr/bin/env python
import os, os.path
import tempfile

# Uses jsshell https://developer.mozilla.org/en/Introduction_to_the_JavaScript_shell

def createEscapedFile(filename):
  """ Stringifies a file (.js, .pde) and sticks it tmp file as an escaped js string with variable __escaped_string """
  filepath = os.path.abspath(filename)
  es = 'var __escaped_string ="'
  f = open(filepath, "r");
  for line in f:
    es += line.rstrip('\r\n').replace('"', '@DQUOTE@').replace("'", '@SQUOTE@').replace("\\", "@BACKSLASH@") + "@NEWLINE@"
  f.close()
  es += '";\n'

  # write the escaped string out to a tmp file, return the filename
  tmp = tempfile.mkstemp()
  os.close(tmp[0])

  t = open(tmp[1], 'w')
  t.write(es)
  t.close()

  return tmp[1]

def cleanUp(filepath):
  os.remove(filepath)
