#!/usr/bin/env python

PORT = 9914

try:
  try:
    import SimpleHTTPServer
    import SocketServer

    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    httpd = SocketServer.TCPServer(("localhost", PORT), Handler)
    print "Web Server listening on http://localhost:%s/ (stop with ctrl+c)..." % PORT
    httpd.serve_forever()

  except ImportError:
    from http.server import HTTPServer, SimpleHTTPRequestHandler

    httpd = HTTPServer(('localhost', 9914), SimpleHTTPRequestHandler)
    print "Web Server listening on http://localhost:%s/ (stop with ctrl+c)..." % PORT
    httpd.serve_forever()
except KeyboardInterrupt:
  pass
