#!/usr/bin/env python
# inspired by - http://mxr.mozilla.org/mozilla-central/source/testing/xpcshell/runxpcshelltests.py
import sys, os, os.path, signal, re
import jsshellhelper
from optparse import OptionParser
from subprocess import Popen, PIPE, STDOUT

# Assumes all tests are in same dir as runtests.py
# Uses jsshell https://developer.mozilla.org/en/Introduction_to_the_JavaScript_shell

class ProcessingTests(object):
  testharnessdir = os.path.dirname(os.path.abspath(__file__))
  toolsdir = os.path.dirname(os.path.abspath(__file__))
  testsPassed = 0
  testsFailed = 0

  def runParserTests(self, jsshell, testPath=None, summaryOnly=False):
      """Get all .pjs in test/parser/ files as JSON, and run through the test harness, faking a DOM"""
      jsshell = os.path.abspath(jsshell)
      parsertestdir = os.path.join(self.toolsdir, '..', 'test', 'parser')
      if testPath:
        testPath = os.path.abspath(testPath)

      for root, dirs, filenames in os.walk(parsertestdir):
          for filename in filenames:
              sys.stdout.flush()
              sys.stderr.flush()

              # If a single test file name is given, only test that file
              fullpath = os.path.join(root, filename)
              if testPath and not fullpath.startswith(testPath):
                  continue
              if filename.endswith('.pde'):
                  tmpFile = jsshellhelper.createEscapedFile(fullpath)
                  one_test = 'var parserTest = {name:"' + fullpath + '", body: __unescape_string()};\n'

                  testCmd = [jsshell,
                             '-f', os.path.join(self.toolsdir, 'fake-dom.js'),
                             '-f', os.path.join(self.toolsdir, '..', 'processing.js'),
                             '-f', os.path.join(self.toolsdir, 'cleaner.js'),
                             '-f', tmpFile,
                             '-e', one_test,
                             '-f', os.path.join(self.toolsdir, 'test-harness.js')]
                  proc = Popen(testCmd, stdout=PIPE, stderr=PIPE)
                  stdout, stderr = proc.communicate()

                  if stderr:
                    # we failed to parse, and died in the js shell
                    self.testsFailed += 1
                    if summaryOnly:
                      sys.stdout.write('F')
                      sys.stdout.flush()
                    else:
                      print "TEST-FAILED: " + fullpath
                      print stderr
                  elif stdout:
                    # TEST-SUMMARY: passed/failed
                    m = re.search('^TEST-SUMMARY: (\d+)/(\d+)', stdout, re.MULTILINE)
                    if m and m.group:
                      self.testsPassed += int(m.group(1))
                      self.testsFailed += int(m.group(2))
                      if int(m.group(2)) > 0:
                        if summaryOnly:
                          sys.stdout.write('F')
                          sys.stdout.flush()
                        else:
                          print "TEST-FAILED: " + fullpath
                          print re.sub("\n?TEST-SUMMARY: (\d+)\/(\d+)\n?", "", stdout)
                          print stderr
                      else:
                        if summaryOnly:
                          sys.stdout.write('.')
                          sys.stdout.flush()
                        else:
                          print "TEST-PASSED: " + fullpath
                    else:
                      # Shouldn't happen!
                      self.testsFailed += 1
                      if summaryOnly:
                        sys.stdout.write('F')
                        sys.stdout.flush()
                      else:
                        print "TEST-FAILED: " + fullpath + ". Test died:"
                        print stdout

                  jsshellhelper.cleanUp(tmpFile)

  def runUnitTests(self, jsshell, testPath=None, summaryOnly=False):
      """Run all .js unit tests in test/unit through the test harness."""
      # TODO: add support for doing .pjs unit tests.
      unittestdir = os.path.join(self.toolsdir, '..', 'test', 'unit')
      jsshell = os.path.abspath(jsshell)
      if testPath:
        testPath = os.path.abspath(testPath)

      for root, dirs, filenames in os.walk(unittestdir):
          for filename in filenames:
              sys.stdout.flush()
              sys.stderr.flush()

              # If a single test file name is given, only test that file
              fullpath = os.path.join(root, filename)
              if testPath and not fullpath.startswith(testPath):
                  continue

              tmpFile = None
              testCmd = None

              if filename.endswith('.js'):
                  # Read the test file so we can wrap it properly:
                  f = open(fullpath, 'r')
                  testFile = ''.join(f.readlines()).replace("'", "\'").replace('"', '\"');
                  f.close()
                  # We wrap all tests in a function so as to replace the context with the Processing context
                  wrapper = "function _testWrapper(ctx) { with (ctx) { %s \n _runTest(); }}\n" % testFile

                  testCmd = [jsshell, '-e', 'var _testName = "%s"; %s;' % (fullpath, wrapper),
                             '-f', os.path.join(self.toolsdir, 'fake-dom.js'),
                             '-f', os.path.join(self.toolsdir, '..', 'processing.js'),
                             '-f', os.path.join(self.toolsdir, 'test-harness.js')]
              elif filename.endswith('.pde'):
                  tmpFile = jsshellhelper.createEscapedFile(fullpath)
                  testCmd = [jsshell,
                             '-f', os.path.join(self.toolsdir, 'fake-dom.js'),
                             '-f', os.path.join(self.toolsdir, '..', 'processing.js'),
                             '-f', os.path.join(self.toolsdir, 'test-harness-lib.js'),
                             '-f', os.path.join(self.toolsdir, 'cleaner.js'),
                             '-f', tmpFile,
                             '-e', 'eval(Processing(canvas, \'UnitTests();\' + __unescape_string() + \'_printTestSummary();\'));']
              else:
                continue

              proc = Popen(testCmd, stdout=PIPE, stderr=PIPE)
              stdout, stderr = proc.communicate()

              if stdout:
                # TEST-SUMMARY: passed/failed
                m = re.search('^TEST-SUMMARY: (\d+)\/(\d+)', stdout, re.MULTILINE)
                if m and m.group:
                  self.testsPassed += int(m.group(1))
                  self.testsFailed += int(m.group(2))
                  if int(m.group(2)) > 0:
                    if summaryOnly:
                      sys.stdout.write('F')
                      sys.stdout.flush()
                    else:
                      print "TEST-FAILED: " + fullpath
                      print re.sub("\n?TEST-SUMMARY: (\d+)\/(\d+)\n?", "", stdout)
                      print stderr
                  else:
                    if summaryOnly:
                      sys.stdout.write('.')
                      sys.stdout.flush()
                    else:
                      print "TEST-PASSED: " + fullpath
                else:
                  # This shouldn't happen, so we died early...not good!
                  self.testsFailed += 1
                  if summaryOnly:
                    sys.stdout.write('F')
                    sys.stdout.flush()
                  else:
                    print "TEST-FAILED: " + fullpath + ". Test exited early:"
                    print stdout
              elif stderr:
                # Shouldn't happen!
                self.testsFailed += 1
                if summaryOnly:
                  sys.stdout.write('F')
                  sys.stdout.flush()
                else:
                  print "TEST-FAILED: " + fullpath + ". Test exited early:"
                  print stderr

              if tmpFile:
                jsshellhelper.cleanUp(tmpFile)

def main():
    parser = OptionParser()

    parser.add_option("-s", "--summary-only",
                      action="store_true", dest="summaryOnly", default=False,
                      help="only print test summary info.")
    parser.add_option("-p", "--parser-only",
                      action="store_true", dest="parserOnly", default=False,
                      help="only run parser tests.")
    parser.add_option("-u", "--unit-only",
                      action="store_true", dest="unitOnly", default=False,
                      help="only run unit tests.")
    parser.add_option("-t", "--single-test",
                      type="string", dest="testPath", default=None,
                      help="single test filename or dir to be tested")
    options, args = parser.parse_args()

    if len(args) < 1:
        print >>sys.stderr, """Usage: %s <path to jsshell>
   or: %s --test singletest.pjs <path to jsshell>""" % (sys.argv[0], sys.argv[0])
        sys.exit(1)

    ptests = ProcessingTests()

    if options.parserOnly:
        ptests.runParserTests(args[0], testPath=options.testPath, summaryOnly=options.summaryOnly)
    elif options.unitOnly:
        ptests.runUnitTests(args[0], testPath=options.testPath, summaryOnly=options.summaryOnly)
    else:
        ptests.runParserTests(args[0], testPath=options.testPath, summaryOnly=options.summaryOnly)
        ptests.runUnitTests(args[0], testPath=options.testPath, summaryOnly=options.summaryOnly)

    print "\nTEST SUMMARY: %s passed, %s failed, %s total" % (ptests.testsPassed, ptests.testsFailed, (ptests.testsPassed + ptests.testsFailed))

if __name__ == '__main__':
    main()
