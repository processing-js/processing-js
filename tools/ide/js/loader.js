$(document).ready(function(){

  tinylogLite = (function() {
    "use strict";
    var tinylogLite = {},undef = "undefined",func = "function",False = !1,True = !0,log = "log";
    if (typeof tinylog !== undef && typeof tinylog[log] === func) {
      tinylogLite[log] = tinylog[log];
    } else if (typeof document !== undef && !document.fake) {
      (function() {
        var doc = document,$div = "div",$style = "style",$title = "title",
        containerStyles = {zIndex: 10000,position: "fixed",bottom: "0px",width: "100%",height: "15%",fontFamily: "sans-serif",color: "#c00",backgroundColor: "black"},
        outputStyles = {position: "relative",fontFamily: "monospace",overflow: "auto",height: "100%",paddingTop: "5px"},
        resizerStyles = {height: "5px",marginTop: "-5px",cursor: "n-resize",backgroundColor: "#818b95"},
        closeButtonStyles = {position: "absolute",top: "5px",right: "20px",color: "#111",MozBorderRadius: "4px",webkitBorderRadius: "4px",borderRadius: "4px",cursor: "pointer",fontWeight: "normal",textAlign: "center",padding: "3px 5px",backgroundColor: "#333",fontSize: "12px",visibility:"hidden"},
        entryStyles = {minHeight: "16px"},
        entryTextStyles = {fontSize: "12px",margin: "0 8px 0 8px",maxWidth: "100%",whiteSpace: "pre-wrap",overflow: "auto"},
        view = doc.defaultView,docElem = doc.documentElement,docElemStyle = docElem[$style],
        setStyles = function() {
          var i = arguments.length,
            elemStyle, styles, style;
          while (i--) {
            styles = arguments[i--];
            elemStyle = arguments[i][$style];
            for (style in styles) {
              if (styles.hasOwnProperty(style)) {
                elemStyle[style] = styles[style];
              }
            }
          }
        },
        observer = function(obj, event, handler) {
          if (obj.addEventListener) {
            obj.addEventListener(event, handler, False);
          } else if (obj.attachEvent) {
            obj.attachEvent("on" + event, handler);
          }
          return [obj, event, handler];
        },
        unobserve = function(obj, event, handler) {
          if (obj.removeEventListener) {
            obj.removeEventListener(event, handler, False);
          } else if (obj.detachEvent) {
            obj.detachEvent("on" + event, handler);
          }
        },
        clearChildren = function(node) {
          var children = node.childNodes,
            child = children.length;
          while (child--) {
            node.removeChild(children.item(0));
          }
        },
        append = function(to, elem) {
          return to.appendChild(elem);
        },
        createElement = function(localName) {
          return doc.createElement(localName);
        },
        createTextNode = function(text) {
          return doc.createTextNode(text);
        },
        createLog = tinylogLite[log] = function(message) {
          // don't show output log until called once
          var uninit, 
            originalPadding = docElemStyle.paddingBottom,
            container = createElement($div),
            containerStyle = container[$style],
            resizer = append(container, createElement($div)),
            output = append(container, createElement($div)),
            closeButton = append(container, createElement($div)),
            resizingLog = False,
            previousHeight = False,
            previousScrollTop = False,
            updateSafetyMargin = function() {
              // have a blank space large enough to fit the output box at the page bottom
              docElemStyle.paddingBottom = container.clientHeight + "px";                               
            },
            setContainerHeight = function(height) {
              var viewHeight = view.innerHeight,
                resizerHeight = resizer.clientHeight;
              // constrain the container inside the viewport's dimensions
              if (height < 0) {
                height = 0;
              } else if (height + resizerHeight > viewHeight) {
                height = viewHeight - resizerHeight;
              }
              containerStyle.height = height / viewHeight * 100 + "%";                                                
              updateSafetyMargin();
              resized();
            },
            observers = [
              observer(doc, "mousemove", function(evt) {
                if (resizingLog) {
                  setContainerHeight(view.innerHeight - evt.clientY);
                  output.scrollTop = previousScrollTop;                      
                }
              }),
              observer(doc, "mouseup", function() {
                if (resizingLog) {
                  resizingLog = previousScrollTop = False;
                  resized();
                }
              }),
              observer(resizer, "dblclick", function(evt) {
                evt.preventDefault();
                if (previousHeight) {
                  setContainerHeight(previousHeight);
                  previousHeight = False;
                } else {
                  previousHeight = container.clientHeight;
                  containerStyle.height = "0px";
                }
                resized();
              }),
              observer(resizer, "mousedown", function(evt) {
                evt.preventDefault();
                resizingLog = True;
                previousScrollTop = output.scrollTop;
              }),
              observer(resizer, "contextmenu", function() { resizingLog = False; }),
              observer(closeButton, "click", function() { uninit(); })
            ];
          container.setAttribute('id', "tinyLog");            
          uninit = function() {
            var i = observers.length;
            while (i--) {
              unobserve.apply(tinylogLite, observers[i]);
            }
            docElem.removeChild(container);
            docElemStyle.paddingBottom = originalPadding;
            clearChildren(output);
            clearChildren(container);
            tinylogLite[log] = createLog;
          };
          setStyles(container, containerStyles, output, outputStyles, resizer, resizerStyles, closeButton, closeButtonStyles);
          closeButton[$title] = "Close Log";
          append(closeButton, createTextNode("\u2716"));
          resizer[$title] = "Double-click to toggle log minimization";
          docElem.insertBefore(container, docElem.firstChild);
          tinylogLite[log] = function(message) {
            var entry = append(output, createElement($div)),
              entryText = append(entry, createElement($div));
            entry[$title] = (new Date()).toLocaleTimeString();
            setStyles(
            entry, entryStyles, entryText, entryTextStyles);
            append(entryText, createTextNode(message));
            output.scrollTop = output.scrollHeight;
          };
          tinylogLite[log](message);
        };
      }());
    } else if (typeof print === func) { // JS shell
      tinylogLite[log] = print;
    }
    return tinylogLite;
  }());
  logBuffer = [];
  tinylogLite.log('');
  
  

  var source;
  
  window.onBespinLoad = function(){
    window.bespin = document.getElementById("editor").bespin
    resized();
  };
  
  function runSketch() {
     //use sancho's PJSBox Bookmarklet
     var e=document.createElement('script');
     e.setAttribute('type','text/javascript');
     e.setAttribute('src','js/pjs-box.js?'+ new Date());
     document.body.appendChild(e);
  };



  $('#Run').click(function(){runSketch();});

  var resized=function(){
    if(window.bespin){
      var newHeight = (
                        $('#tinyLog').position().top - 
                        $('.bespin').position().top
                        + 10
                      ) +"px";
                      
      $('.bespin').css({height:newHeight, width:(window.innerWidth+2)+'px'});
      window.bespin.dimensionsChanged();
    };  
  };

  window.addEventListener('resize',function(){resized();},false);

});
