#!/usr/bin/env python
 
PORT = 9914
SERVER = '0.0.0.0'
 
import SimpleHTTPServer
import BaseHTTPServer
import SocketServer

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

class Server(SocketServer.ThreadingMixIn, BaseHTTPServer.HTTPServer):
    pass

httpd = Server((SERVER, PORT), Handler)
print "Web Server listening on http://%s:%s/ (stop with ctrl+c)..." % (SERVER, PORT)

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print "Going down..."