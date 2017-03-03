/**
 * Touch and Mouse event handling
 */
module.exports = function withTouch(p, curElement, attachEventHandler, detachEventHandlersByType, document, PConstants, undef) {

  // List of mouse event types
  var mouseTypes = ['mouseout','mousemove','mousedown','mouseup','DOMMouseScroll','mousewheel','touchstart'];

  /**
   * Determine the location of the (mouse) pointer.
   */
  function calculateOffset(curElement, event) {
    var element = curElement,
      offsetX = 0,
      offsetY = 0;

    p.pmouseX = p.mouseX;
    p.pmouseY = p.mouseY;

    // Find element offset
    if (element.offsetParent) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while (!!(element = element.offsetParent));
    }

    // Find Scroll offset
    element = curElement;
    do {
      offsetX -= element.scrollLeft || 0;
      offsetY -= element.scrollTop || 0;
    } while (!!(element = element.parentNode));

    // Get padding and border style widths for mouse offsets
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    if (document.defaultView && document.defaultView.getComputedStyle) {
      stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(curElement, null).paddingLeft, 10)      || 0;
      stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(curElement, null).paddingTop, 10)       || 0;
      styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(curElement, null).borderLeftWidth, 10)  || 0;
      styleBorderTop   = parseInt(document.defaultView.getComputedStyle(curElement, null).borderTopWidth, 10)   || 0;
    }

    // Add padding and border style widths to offset
    offsetX += stylePaddingLeft;
    offsetY += stylePaddingTop;

    offsetX += styleBorderLeft;
    offsetY += styleBorderTop;

    // Take into account any scrolling done
    offsetX += window.pageXOffset;
    offsetY += window.pageYOffset;

    return {'X':offsetX,'Y':offsetY};
  }

  // simple relative position
  function updateMousePosition(curElement, event) {
    var offset = calculateOffset(curElement, event);
    // Dropping support for IE clientX and clientY, switching to pageX and pageY
    // so we don't have to calculate scroll offset.
    // Removed in ticket #184. See rev: 2f106d1c7017fed92d045ba918db47d28e5c16f4
    p.mouseX = event.pageX - offset.X;
    p.mouseY = event.pageY - offset.Y;
  }

  /**
   * Return a TouchEvent with canvas-specific x/y co-ordinates
   */
  function addTouchEventOffset(t) {
    var offset = calculateOffset(t.changedTouches[0].target, t.changedTouches[0]),
        i;

    for (i = 0; i < t.touches.length; i++) {
      var touch = t.touches[i];
      touch.offsetX = touch.pageX - offset.X;
      touch.offsetY = touch.pageY - offset.Y;
    }
    for (i = 0; i < t.targetTouches.length; i++) {
      var targetTouch = t.targetTouches[i];
      targetTouch.offsetX = targetTouch.pageX - offset.X;
      targetTouch.offsetY = targetTouch.pageY - offset.Y;
    }
    for (i = 0; i < t.changedTouches.length; i++) {
      var changedTouch = t.changedTouches[i];
      changedTouch.offsetX = changedTouch.pageX - offset.X;
      changedTouch.offsetY = changedTouch.pageY - offset.Y;
    }

    return t;
  }

  /**
   * Touch event support.
   */
  attachEventHandler(curElement, "touchstart", function (t) {
    // Removes unwanted behaviour of the canvas when touching canvas
    curElement.setAttribute("style","-webkit-user-select: none");
    curElement.setAttribute("onclick","void(0)");
    curElement.setAttribute("style","-webkit-tap-highlight-color:rgba(0,0,0,0)");

    // Remove mouse-type event listeners
    detachEventHandlersByType(curElement, mouseTypes);

    // If there are any native touch events defined in the sketch, connect all of them
    // Otherwise, connect all of the emulated mouse events
    if (p.touchStart !== undef || p.touchMove !== undef ||
        p.touchEnd !== undef || p.touchCancel !== undef) {
      attachEventHandler(curElement, "touchstart", function(t) {
        if (p.touchStart !== undef) {
          t = addTouchEventOffset(t);
          p.touchStart(t);
        }
      });

      attachEventHandler(curElement, "touchmove", function(t) {
        if (p.touchMove !== undef) {
          t.preventDefault(); // Stop the viewport from scrolling
          t = addTouchEventOffset(t);
          p.touchMove(t);
        }
      });

      attachEventHandler(curElement, "touchend", function(t) {
        if (p.touchEnd !== undef) {
          t = addTouchEventOffset(t);
          p.touchEnd(t);
        }
      });

      attachEventHandler(curElement, "touchcancel", function(t) {
        if (p.touchCancel !== undef) {
          t = addTouchEventOffset(t);
          p.touchCancel(t);
        }
      });

    } else {
      // Emulated touch start/mouse down event
      attachEventHandler(curElement, "touchstart", function(e) {
        updateMousePosition(curElement, e.touches[0]);

        p.__mousePressed = true;
        p.mouseDragging = false;
        p.mouseButton = PConstants.LEFT;

        if (typeof p.mousePressed === "function") {
          p.mousePressed();
        }
      });

      // Emulated touch move/mouse move event
      attachEventHandler(curElement, "touchmove", function(e) {
        e.preventDefault();
        updateMousePosition(curElement, e.touches[0]);

        if (typeof p.mouseMoved === "function" && !p.__mousePressed) {
          p.mouseMoved();
        }
        if (typeof p.mouseDragged === "function" && p.__mousePressed) {
          p.mouseDragged();
          p.mouseDragging = true;
        }
      });

      // Emulated touch up/mouse up event
      attachEventHandler(curElement, "touchend", function(e) {
        p.__mousePressed = false;

        if (typeof p.mouseClicked === "function" && !p.mouseDragging) {
          p.mouseClicked();
        }

        if (typeof p.mouseReleased === "function") {
          p.mouseReleased();
        }
      });
    }
  });

  /**
   * Context menu toggles. Most often you will not want the
   * browser's context menu to show on a right click, but
   * sometimes, you do, so we add two unofficial functions
   * that can be used to trigger context menu behaviour.
   */
  (function() {
    var enabled = true,
        contextMenu = function(e) {
          e.preventDefault();
          e.stopPropagation();
        };

    p.disableContextMenu = function() {
      if (!enabled) {
        return;
      }
      attachEventHandler(curElement, 'contextmenu', contextMenu);
      enabled = false;
    };

    p.enableContextMenu = function() {
      if (enabled) {
        return;
      }
      detachEventHandler({elem: curElement, type: 'contextmenu', fn: contextMenu});
      enabled = true;
    };
  }());

  /**
   * Mouse moved or dragged
   */
  attachEventHandler(curElement, "mousemove", function(e) {
    updateMousePosition(curElement, e);
    if (typeof p.mouseMoved === "function" && !p.__mousePressed) {
      p.mouseMoved();
    }
    if (typeof p.mouseDragged === "function" && p.__mousePressed) {
      p.mouseDragged();
      p.mouseDragging = true;
    }
  });

  /**
   * Unofficial mouse-out handling
   */
  attachEventHandler(curElement, "mouseout", function(e) {
    if (typeof p.mouseOut === "function") {
      p.mouseOut();
    }
  });

  /**
   * Mouse over
   */
  attachEventHandler(curElement, "mouseover", function(e) {
    updateMousePosition(curElement, e);
    if (typeof p.mouseOver === "function") {
      p.mouseOver();
    }
  });

  /**
   * Disable browser's default handling for click-drag of a canvas.
   */
  curElement.onmousedown = function () {
    // make sure focus happens, but nothing else
    curElement.focus();
    return false;
  };

  /**
   * Mouse pressed or drag
   */
  attachEventHandler(curElement, "mousedown", function(e) {
    p.__mousePressed = true;
    p.mouseDragging = false;
    switch (e.which) {
    case 1:
      p.mouseButton = PConstants.LEFT;
      break;
    case 2:
      p.mouseButton = PConstants.CENTER;
      break;
    case 3:
      p.mouseButton = PConstants.RIGHT;
      break;
    }

    if (typeof p.mousePressed === "function") {
      p.mousePressed();
    }
  });

  /**
   * Mouse clicked or released
   */
  attachEventHandler(curElement, "mouseup", function(e) {
    p.__mousePressed = false;

    if (typeof p.mouseClicked === "function" && !p.mouseDragging) {
      p.mouseClicked();
    }

    if (typeof p.mouseReleased === "function") {
      p.mouseReleased();
    }
  });

  /**
   * Unofficial scroll wheel handling.
   */
  var mouseWheelHandler = function(e) {
    // do not handle scroll wheel if initiated outside of the sketch
    if (e.target !== curElement) return;

    var delta = 0;

    if (e.wheelDelta) {
      delta = e.wheelDelta / 120;
      if (window.opera) {
        delta = -delta;
      }
    } else if (e.detail) {
      delta = -e.detail / 3;
    }

    p.mouseScroll = delta;

    if (delta && typeof p.mouseScrolled === 'function') {
      // If this sketch has explicit scroll handling,
      // prevent scroll from kicking in globally before
      // calling the scroll handler.
      e.stopPropagation();
      e.preventDefault();   
      p.mouseScrolled();
    }
  };

  // Support Gecko and non-Gecko scroll events
  attachEventHandler(document, 'DOMMouseScroll', mouseWheelHandler);
  attachEventHandler(document, 'mousewheel', mouseWheelHandler);

};

