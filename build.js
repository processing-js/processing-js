// build script for generating processing.js

var Browser = {
  isDomPresent: true,
  navigator: navigator,
  window: window,
  document: document,
  ajax: function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/plain");
    }
    xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT");
    xhr.send(null);
    // failed request?
    if (xhr.status !== 200 && xhr.status !== 0) { throw ("XMLHttpRequest failed, status code " + xhr.status); }
    return xhr.responseText;
  }
};

window.Processing = require('./src/')(Browser);
