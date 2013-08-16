var http = require("http"),
    express = require("express"),
    nunjucks = require("nunjucks"),
    app = express(),
    nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
nunjucksEnv.express(app);

app.use(express.static('test'));
app.use(express.static('test/tools'));
var js = function(_, res, next) {
  res.header('Content-Type', 'application/javascript');
  next();
};

app.get("/",                       function(req, res) { res.render("test.html");             });
app.get("/processing.js",     js,  function(req, res) { res.render("processing.js");         });
app.get("/processing.min.js", js,  function(req, res) { res.render("processing.min.js");     });

// parameters for the termination route
app.param('failed',      function(req, res, next, failed) {
  app.locals.failed = parseInt(failed, 10);
  next();
});

app.param('knownfailed', function(req, res, next, knownfailed) {
  app.locals.knownfailed = parseInt(knownfailed, 10);
  next();
});

app.param('passed', function(req, res, next, passed) {
  app.locals.passed = parseInt(passed, 10);
  next();
});

// termination route
app.get("/stopserver/:failed/:knownfailed/:passed", function(req, res) {
  console.log(app.locals.failed + "." + app.locals.knownfailed + "." + app.locals.passed);
  process.exit(0);
});

app.listen(3000, function() { console.log('Express server listening on port 3000'); });
