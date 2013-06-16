var __testFiles = {
  "test1.svg" : "<svg xmlns='http://www.w3.org/2000/svg' width='819' height='819'><g><path d='M35,25 L256,10' /></g></svg>",
  "test2.svg" : "<svg width='200' height='200' viewbox='0 0 200 200' version='1.0' xmlns='http://www.w3.org/2000/svg'> "
                +"<rect x='10' y='10' width='180' height='180' style='fill:#00F; stroke-width:1; stroke:#000; color: #F00;'/></svg>"
};

externals.window.XMLHttpRequest.prototype = {
  open: function(method, url) { this.responseText = __testFiles[url]; },
  status: 200,
  send: function() {},
  setRequestHeader: function() {}
};

PShape s1 = loadShape("test1.svg");
_checkEqual(819, s1.height);
_checkEqual(1, s1.children[0].children.length);

var s1_g = s1.children[0];
_checkEqual(0, s1_g.family); // GROUP
_checkEqual(1, s1_g.children.length);

var s1_g_path = s1_g.children[0];
_checkEqual(21, s1_g_path.family); // PATH
_checkEqual(0, s1_g_path.children.length);
_checkEqual([[35,25],[256,10]], s1_g_path.vertices);
_checkEqual([0, 0], s1_g_path.vertexCodes);

PShape s2 = loadShape("test2.svg");
_checkEqual(200, s2.width);
_checkEqual(1, s2.children.length);

var s2_rect = s2.children[0];
_checkEqual(1, s2_rect.family); // PRIMITIVE
_checkEqual(30, s2_rect.kind); // RECT
_checkEqual(0, s2_rect.children.length);
_checkEqual([10,10,180,180], s2_rect.params);
