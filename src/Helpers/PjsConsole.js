// the logger for print() and println()
module.exports = function PjsConsole(document) {
  var e = { BufferMax: 200 },
      style = document.createElement("style"),
      added = false;

  style.textContent = [
    ".pjsconsole.hidden {",
    "  display: none!important;",
    "}"
  ].join('\n');

  e.wrapper = document.createElement("div");
  style.textContent += [
    "",
    ".pjsconsole {",
    "  opacity: .75;",
    "  display: block;",
    "  position: fixed;",
    "  bottom: 0px;",
    "  left: 0px;",
    "  right: 0px;",
    "  height: 50px;",
    "  background-color: #aaa;",
    "}"
  ].join('\n');
  e.wrapper.classList.add("pjsconsole");

  e.dragger = document.createElement("div");
  style.textContent += [
    "",
    ".pjsconsole .dragger {",
    "  display: block;",
    "  border: 3px black raised;",
    "  cursor: n-resize;",
    "  position: absolute;",
    "  top: 0px;",
    "  left: 0px;",
    "  right: 0px;",
    "  height: 5px;",
    "  background-color: #333;",
    "}"
  ].join('\n');
  e.dragger.classList.add("dragger");

  e.closer = document.createElement("div");
  style.textContent += [
    "",
    ".pjsconsole .closer {",
    "  opacity: .5;",
    "  display: block;",
    "  border: 3px black raised;",
    "  position: absolute;",
    "  top: 10px;",
    "  right: 30px;",
    "  height: 20px;",
    "  width: 20px;",
    "  background-color: #ddd;",
    "  color: #000;",
    "  line-height: 20px;",
    "  text-align: center;",
    "  cursor: pointer",
    "}"
  ].join('\n');
  e.closer.classList.add("closer");
  e.closer.innerHTML = "&#10006;";

  e.javaconsole = document.createElement("div");
  style.textContent += [
    "",
    ".pjsconsole .console {",
    "  overflow-x: auto;",
    "  display: block;",
    "  position: absolute;",
    "  left: 10px;",
    "  right: 0px;",
    "  bottom: 5px;",
    "  top: 10px;",
    "  overflow-y: scroll;",
    "  height: 40px;",
    "}"
  ].join('\n');
  e.javaconsole.setAttribute("class", "console");

  e.wrapper.appendChild(e.dragger);
  e.wrapper.appendChild(e.javaconsole);
  e.wrapper.appendChild(e.closer);

  e.dragger.onmousedown = function (t) {
    e.divheight = e.wrapper.style.height;
    if (document.selection) document.selection.empty();
    else window.getSelection().removeAllRanges();
    var n = t.screenY;
    window.onmousemove = function (t) {
      e.wrapper.style.height = parseFloat(e.divheight) + (n - t.screenY) + "px";
      e.javaconsole.style.height = parseFloat(e.divheight) + (n - t.screenY) - 10 + "px";
    };
    window.onmouseup = function (t) {
      if (document.selection) document.selection.empty();
      else window.getSelection().removeAllRanges();
      e.wrapper.style.height = parseFloat(e.divheight) + (n - t.screenY) + "px";
      e.javaconsole.style.height = parseFloat(e.divheight) + (n - t.screenY) - 10 + "px";
      window.onmousemove = null;
      window.onmouseup = null;
    };
  };

  e.BufferArray = [];

  e.print = e.log = function () {
    if(!added) {
      document.body.appendChild(style);
      document.body.appendChild(e.wrapper);
      added = true;
    }
    var args = Array.prototype.slice.call(arguments);
    t = args.map(function(t, idx) { return t + (idx+1 === args.length ? "" : " "); }).join('');
    if (e.BufferArray[e.BufferArray.length - 1]) e.BufferArray[e.BufferArray.length - 1] += (t) + "";
    else e.BufferArray.push(t);
    e.javaconsole.innerHTML = e.BufferArray.join('');
    e.showconsole();
  };

  e.println = function () {
    var args = Array.prototype.slice.call(arguments);
    args.push('<br>');
    e.print.apply(e, args);
    if (e.BufferArray.length > e.BufferMax) {
      e.BufferArray.splice(0, 1);
    } else {
      e.javaconsole.scrollTop = e.javaconsole.scrollHeight;
    }
  };

  e.showconsole = function () { e.wrapper.classList.remove("hidden"); };
  e.hideconsole = function () { e.wrapper.classList.add("hidden"); };

  e.closer.onclick = function () { e.hideconsole(); };

  e.hideconsole();

  return e;
};
