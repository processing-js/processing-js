#!/usr/bin/env python
import sys, os, os.path, signal
from optparse import OptionParser
from subprocess import Popen, PIPE, STDOUT

# Uses jsshell https://developer.mozilla.org/en/Introduction_to_the_JavaScript_shell

class Converter(object):
  toolsdir = os.path.dirname(os.path.abspath(__file__))

  def run(self, jsshell, filename, strip=None):
    cmd = [jsshell,
           '-f', os.path.join(self.toolsdir, 'fake-dom.js'),
           '-f', os.path.join(self.toolsdir, '..', 'processing.js'),
           '-f', os.path.join(self.toolsdir, 'jsbeautify.js'),
           '-e', 'var pcode = snarf("%s"); print(js_beautify(Processing.compile(pcode).sourceCode));\n'  % os.path.relpath(filename)]

    proc = Popen(cmd)

    # allow user to kill hung subprocess with SIGINT w/o killing this script
    # - don't move this line above Popen, or child will inherit the SIG_IGN
    signal.signal(signal.SIGINT, signal.SIG_IGN)

    # |stderr == None| as |pStderr| was either |None| or redirected to |stdout|.
    stdout, stderr = proc.communicate()
    signal.signal(signal.SIGINT, signal.SIG_DFL)

def main():
    parser = OptionParser()

    parser.add_option("-s", "--strip",
                      action="store_true", dest="strip", default=False,
                      help="strip Processing.js object from output.")
    options, args = parser.parse_args()

    if len(args) < 2:
        print >>sys.stderr, """Usage: %s <path to jsshell> <pde file>
   or: %s --strip <path to jsshell> <pde file>""" % (sys.argv[0], sys.argv[0])
        sys.exit(1)

    ptests = Converter()
    ptests.run(args[0], args[1], strip=options.strip)

if __name__ == '__main__':
    main()
