/*
function GetZoomFactor () {
    var factor = 1;
    if (document.body.getBoundingClientRect) {
        var rect = document.body.getBoundingClientRect ();
        var physicalW = rect.right - rect.left;
        var logicalW = document.body.offsetWidth;
        factor = Math.round ((physicalW / logicalW) * 100) / 100;
    }
    return factor;
}
function GetScrollPositions () {
    if ('pageXOffset' in window) {  // all browsers, except IE before version 9
        var scrollLeft =  window.pageXOffset;
        var scrollTop = window.pageYOffset;
    }
    else {      // Internet Explorer before version 9
        var zoomFactor = GetZoomFactor ();
        var scrollLeft = Math.round (document.documentElement.scrollLeft / zoomFactor);
        var scrollTop = Math.round (document.documentElement.scrollTop / zoomFactor);
    }
    alert ("The current horizontal scroll amount: " + scrollLeft + "px");
    alert ("The current vertical scroll amount: " + scrollTop + "px");
}
*/
var $$_DOM = {};
var $_validated = 0;
var $_toolValidated = 0;
var _egam_ = Image;
var $_mobileEnable = true;
var UIContainer = defineClass("UIContainer", EventAware, {
    init: function (dom, containerId) {
        this._super();
        dom = !!dom;
        this.$_dom = dom ? $$_DOM : null;
        this.$_rich = !dom;
        if (!containerId) {
            throw "container is null!";
        }
        this._containerDiv = document.getElementById(containerId);
        if (!this._containerDiv) {
            throw "Invalid grid container element: " + containerId;
        }
        this._canvas = this._container = document.createElement("div");
        this._containerDiv.appendChild(this._container);
        this._container.style.position = "relative"; // 이 것 때문에...
        this._container.style.width = "100%";
        this._container.style.height = "100%";
        this._container.style.borderStyle = "none";
        this._container.style.borderWidth = "0px";
        this._container.style.overflow = "hidden";
        this._container.style["-webkit-touch-callout"] = "none";
        this._container.style["-webkit-user-select"] = "none";
        this._container.style["user-select"] = "none";
        this._container.style["-webkit-tap-highlight-color"] = "rgba(0, 0, 0, 0)";
        var clientRect = this._container.getBoundingClientRect();
        // this._width = this._container.clientWidth;
        // this._height = this._container.clientHeight;
        this._width = parseInt(clientRect.width);//this._container.clientWidth;
        this._height = parseInt(clientRect.height);//this._container.clientHeight;
        this._updateRequested = false;
        this._layoutNeeded = false;
        this._invalidated = false;
        this._defaultTool = new VisualTool(this);
        this._activeTool = this._defaultTool;
        this._captured = false;
        this._focusing = false;
        this._focusingTarget = null;
        this._hovered = null;
        this._currentX = 0;
        this._currentY = 0;
        this._rendered = 0;
        this._defaultCursor = Cursor.AUTO;
        this._drawing = false;
        this._offsetX = 0;
        this._offsetY = 0;
        this._clicked = 0;
        this._clicket = 0;
        this._children = [];
        this._rootElement = this._createRootElement(this.$_dom);
        this._containerRender = this._render.bind(this);
        this._eventHandlers = {};
        this._eventNodes = [];
        this.$_prepareContextMenu();
        this._popupMenuManager = new PopupMenuManager(this).addListener(this);
        this._contextMenu = null;
        this.onContextMenuItemClicked = null;
    },
    _registerEventHandlers: function (canvas) {
        canvas.style.cursor = this._defaultCursor;
        if (_win.addEventListener) {
            // __addWindowEventListener(this, "resize", this._resizeHandler.bind(this), false);
            // __addWindowEventListener(this, "mousemove", this._mouseMoveHandler.bind(this), false);
            // __addWindowEventListener(this, "mouseup", this._mouseUpHandler.bind(this), false);
            // __addWindowEventListener(this, "focus", this._focusHandlerFireFox.bind(this), true);
            // __addWindowEventListener(this, "focusin", this._focusinHandler.bind(this), true);
            this.$_addListener(_win, "resize", this._resizeHandler.bind(this), false);
            this.$_addListener(_win, "mousemove", this._mouseMoveHandler.bind(this), false);
            this.$_addListener(_win, "mouseup", this._mouseUpHandler.bind(this), false);
            this.$_addListener(_win, "focus", this._focusHandlerFireFox.bind(this), true);
            this.$_addListener(_win, "focusin", this._focusinHandler.bind(this), true);

            // canvas.addEventListener("keydown", this._keyDownHandler.bind(this), false);
            // canvas.addEventListener("keyup", this._keyUpHandler.bind(this), false);
            // canvas.addEventListener("keypress", this._keyPressHandler.bind(this), false);
            // canvas.addEventListener("click", this._clickHandler.bind(this), false);
            // canvas.addEventListener("dblclick", this._dblclickHandler.bind(this), false);
            // canvas.addEventListener("mousedown", this._mouseDownHandler.bind(this), false);
            // canvas.addEventListener("mouseenter", this._mouseEnterHandler.bind(this), false);
            // canvas.addEventListener("mouseleave", this._mouseLeaveHandler.bind(this), false);
            // canvas.addEventListener("mouseover", this._mouseOverHandler.bind(this), false);
            // canvas.addEventListener("focus", this._focusHandler.bind(this), false);
            // canvas.addEventListener("blur", this._blurHandler.bind(this), false);

            this.$_addListener(canvas, "keydown", this._keyDownHandler.bind(this), false);
            this.$_addListener(canvas, "keyup", this._keyUpHandler.bind(this), false);
            this.$_addListener(canvas, "keypress", this._keyPressHandler.bind(this), false);
            this.$_addListener(canvas, "click", this._clickHandler.bind(this), false);
            this.$_addListener(canvas, "dblclick", this._dblclickHandler.bind(this), false);
            this.$_addListener(canvas, "mousedown", this._mouseDownHandler.bind(this), false);
            this.$_addListener(canvas, "mouseenter", this._mouseEnterHandler.bind(this), false);
            this.$_addListener(canvas, "mouseleave", this._mouseLeaveHandler.bind(this), false);
            this.$_addListener(canvas, "mouseover", this._mouseOverHandler.bind(this), false);
            this.$_addListener(canvas, "focus", this._focusHandler.bind(this), false);
            this.$_addListener(canvas, "blur", this._blurHandler.bind(this), false);

            // if (_isFirefox) {
            //     canvas.addEventListener("DOMMouseScroll", this._mouseScrollHandler.bind(this), false);
            // } else {
            //     canvas.addEventListener("mousewheel", this._mouseWheelHandler.bind(this), false);
            // }
            if (_isFirefox) {
                this.$_addListener(canvas,"DOMMouseScroll", this._mouseScrollHandler.bind(this), false);
            } else {
                this.$_addListener(canvas,"mousewheel", this._mouseWheelHandler.bind(this), false);
            }

            if ($_mobileEnable) {
                canvas.addEventListener("touchstart", this._touchStartHandler.bind(this), false);
                canvas.addEventListener("touchmove", this._touchMoveHandler.bind(this), false);
                canvas.addEventListener("touchend", this._touchEndHandler.bind(this), false);
                canvas.addEventListener("touchcancel", this._touchCancelHandler.bind(this), false);
                canvas.addEventListener("touchleave", this._touchLeaveHandler.bind(this), false);
            }
        } else {
            _win.attachEvent ("onresize", this._resizeHandler.bind(this), false);
            _win.attachEvent("onmousemove", this._mouseMoveHandler.bind(this), false);
            _win.attachEvent("onmouseup", this._mouseUpHandler.bind(this), false);
            canvas.attachEvent("onkeydown", this._keyDownHandler.bind(this), false);
            canvas.attachEvent("onkeyup", this._keyUpHandler.bind(this), false);
            canvas.attachEvent("onkeypress", this._keyPressHandler.bind(this), false);
            canvas.attachEvent("onclick", this._clickHandler.bind(this), false);
            canvas.attachEvent("ondblclick", this._dblclickHandler.bind(this), false);
            canvas.attachEvent("onmousedown", this._mouseDownHandler.bind(this), false);
            canvas.attachEvent("onmouseenter", this._mouseEnterHandler.bind(this), false);
            canvas.attachEvent("onmouseleave", this._mouseLeaveHandler.bind(this), false);
            canvas.attachEvent("onmouseover", this._mouseOverHandler.bind(this), false);
            if (_isFirefox) {
                canvas.attachEvent("onDOMMouseScroll", this._mouseScrollHandler.bind(this), false);
            } else {
                canvas.attachEvent("onmousewheel", this._mouseWheelHandler.bind(this), false);
            }
            canvas.attachEvent("onfocus", this._focusHandler.bind(this), false);
            canvas.attachEvent("onblur", this._blurHandler.bind(this), false);
            if ($_mobileEnable) {
                canvas.attachEvent("ontouchstart", this._touchStartHandler.bind(this), false);
                canvas.attachEvent("ontouchmove", this._touchMoveHandler.bind(this), false);
                canvas.attachEvent("ontouchend", this._touchEndHandler.bind(this), false);
                canvas.attachEvent("ontouchcancel", this._touchCancelHandler.bind(this), false);
                canvas.attachEvent("ontouchleave", this._touchLeaveHandler.bind(this), false);
            }
        }
        // var self=this;
        // var type = _isChrome && !_isEdge ? "beforeunload" : "unload"
        // var type = "unload";  // chrome의 경우 form tag가 있는 경우 beforeunload를 사용해서는 안된다.  // chrome의 경우 화면이 종료(close)되는 경우 unload가 실행되지 않는다.
        // if (_win.addEventListener) {
        //     // __addWindowEventListener(this, type, this._unloadHandler.bind(this), false);
        //     _win.addEventListener(this, type, this._unloadHandler.bind(this), false);
        // }
    },
    $_addListener: function(node, event, handler, capture) {
        if(!(node in this._eventHandlers)) {
            this._eventHandlers[node] = {};
        }
        if(!(event in this._eventHandlers[node])) {
            this._eventHandlers[node][event] = [];
        }
        this._eventHandlers[node][event].push([handler, capture]);
        node.addEventListener(event, handler, capture);
        if (this._eventNodes.indexOf(node) < 0) {
            this._eventNodes.push(node);
        }
    },
    $_removeListener: function(node, event) {
        if(node in this._eventHandlers) {
            var handlers = this._eventHandlers[node];
            if(event in handlers) {
                var eventHandlers = handlers[event];
                for(var i = eventHandlers.length; i--;) {
                    var handler = eventHandlers[i];
                    node.removeEventListener(event, handler[0], handler[1]);
                }
            }
        }        
    },
    $_removeListenerAll: function(node) {
        var nodes = node ? [node] : this._eventNodes;
        for (var i = 0, cnt = nodes.length; i < cnt ; i++) {
            var elt = nodes[i];
            if(elt in this._eventHandlers) {
                var events = this._eventHandlers[elt];
                for (var event in events) {
                    var handlers = events[event];
                    for (var j = handlers.length; j--;) {
                        var handler = handlers[j];
                        elt.removeEventListener(event, handler[0], handler[1])
                    }
                }
            }        
        }
    },
    _unloadHandler: function() {
        if (_win.addEventListener) {
            this._canvas.removeEventListener("keydown", this._keyDownHandler);
            this._canvas.removeEventListener("keyup", this._keyUpHandler);
            this._canvas.removeEventListener("keypress", this._keyPressHandler);
            this._canvas.removeEventListener("click", this._clickHandler);
            this._canvas.removeEventListener("dblclick", this._dblclickHandler);
            this._canvas.removeEventListener("mousedown", this._mouseDownHandler);
            this._canvas.removeEventListener("mouseenter", this._mouseEnterHandler);
            this._canvas.removeEventListener("mouseleave", this._mouseLeaveHandler);
            this._canvas.removeEventListener("mouseover", this._mouseOverHandler);
            if (_isFirefox) {
                this._canvas.removeEventListener("DOMMouseScroll", this._mouseScrollHandler);
            } else {
                this._canvas.removeEventListener("mousewheel", this._mouseWheelHandler);
            }
            this._canvas.removeEventListener("focus", this._focusHandler);
            this._canvas.removeEventListener("blur", this._blurHandler);
            if ($_mobileEnable) {
                this._canvas.removeEventListener("touchstart", this._touchStartHandler);
                this._canvas.removeEventListener("touchmove", this._touchMoveHandler);
                this._canvas.removeEventListener("touchend", this._touchEndHandler);
                this._canvas.removeEventListener("touchcancel", this._touchCancelHandler);
                this._canvas.removeEventListener("touchleave", this._touchLeaveHandler);
            };
        }
        if (this.unloadProc) {
            this.unloadProc();
        }
        this._containerDiv = null;
        this._container = null;
        this._canvas = null;
    },
    destroy: function() {
        this._destroying = true;

        this.$_removeListenerAll();
        this._currentX = this._currentY = null;
        Dom.clearElements(this._container);
        if (this._container.addEventListener) {
            this._container.removeEventListener("contextmenu",this.$_contextMenuHandler);
        }
        if (this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }        
        this.$_contextMenuHandler = null;
        this._container = null;
        this._containerRender = null;
        this._clicket = null;
        this._eventHandlers = null;
        this._eventNodes = null;
        this._super();
    },
    unloadProc: function() {
    },
    containerElement: function () {
        return this._container;
    },
    isVisible: function () {
        return this._container.style.visibility != "hidden";
    },
    setVisible: function (value) {
        this._container.style.visibility = value ? "visible" : "hidden";
    },
    width: function () {
        return this._width;
    },
    height: function () {
        return this._height;
    },
    defaultTool: function () {
        return this._defaultTool;
    },
    setDefaultTool: function (tool, activate) {
        this._defaultTool = tool;
        if (activate && tool) {
            this.setActiveTool(tool);
        }
        return this;
    },
    activeTool: function () {
        return this._activeTool;
    },
    setActiveTool: function (tool) {
        if (tool !== this._activeTool) {
            if (this._activeTool) {
                this._activeTool.deactivate();
            }
            this._activeTool = tool;
            if (this._activeTool) {
                this._activeTool.activate();
            }
        }
        return this;
    },
    mouseX: function () {
        return this._currentX;
    },
    mouseY: function () {
        return this._currentY;
    },
    popupMenuManager: function () {
        return this._popupMenuManager;
    },
    contextMenu: function () {
        return this._contextMenu;
    },
    setContextMenu: function (value) {
        if (value != this._contextMenu) {
            if (value instanceof PopupMenu) {
                this._contextMenu = value;
            } else if (value) {
                this._contextMenu = new PopupMenu("gridContextMenu", this, value);
            } else {
                this._contextMenu = null;
            }
        }
    },
    addChild: function (control) {
        if (control && this._children.indexOf(control) < 0) {
            this._children.push(control);
            control.attached(this);
        }
        return control;
    },
    removeChild: function (control) {
        var i;
        if (control && (i = this._children.indexOf(control)) >= 0) {
            this._children.splice(i, 1);
            control.detached();
        }
    },
    addElement: function (element, context) {
        return this._rootElement.addElement(element, context);
    },
    removeElement: function (element) {
        this._rootElement.removeElement(element);
    },
    findElementAt: function (x, y, hitTesting) {
        return this._rootElement.findChildAt(x - this._rootElement._x, y - this._rootElement._y, hitTesting);
    },
    setFocus: function () {
        this._setFocusAndScroll(this._canvas);
    },
    updateNow: function () {
        this._render(_getTimer());
    },
    invalidateLayout: function () {
        this._layoutNeeded = true;
        this.invalidate(true);
    },
    invalidate: function (force) {
        if ((!this._updateRequested || !this._invalidated) && (force || !this._drawing)) {
            window.requestAnimationFrame(this._containerRender);
            this._updateRequested = true;
            this._invalidated = true;
        }
    },
    setCursor: function (cursor) {
        this._canvas.style.cursor = cursor || this._defaultCursor;
    },
    _createChildren: function (containerElement) {
    },
    _layoutChildren: function (bounds) {
    },
    _createRootElement: function (dom) {
        return null;
    },
    _render: function (timestamp) {
        if (this._destroying) {
            return;
        }
        this._updateRequested = false;
        this._offsetX = this._canvas.offsetLeft;
        this._offsetY = this._canvas.offsetTop;
        var op = this._canvas.offsetParent;
        while (op) {
            this._offsetX += op.offsetLeft;
            this._offsetY += op.offsetTop;
            op = op.offsetParent;
        }
        this._drawing = true;
        try {
            this.$_dom ? this.$$_renderHtml(timestamp, null, 0, 0) : this.$$_render(timestamp, null, 0, 0);
            if (this._resetSizeCallback) {
                this._resetSizeCallback();
                delete this._resetSizeCallback;
            }
        } finally {
            this._drawing = false;
            this._invalidated = false;
        }
    },
    $$_render: function (timestamp, scrollRect, scrollX, scrollY) {
    },
    $$_renderHtml: function (timestamp, scrollRect, scrollX, scrollY) {
    },
    _setFocusAndScroll: function (target) {
        if (target) {
            if (!this._focusing) {
                this._focusing = true;
                this._focusingTarget = target;
                try {
                    var x = _win.pageXOffset;
                    var y = _win.pageYOffset;
                    var p, st, sl; 
                    if (_isFirefox || _isChrome || _isOpera) {
                        p = this._containerDiv && this._containerDiv.parentElement;
                        st = p && p.scrollTop;
                        sl = p && p.scrollLeft;
                    }                    
                    // target에 canvas이면 focus를 주지 않는다. 그럼 스크롤되지 않는다.
                    target.setFocus ? target.setFocus() : target instanceof HTMLCanvasElement ? null : target.focus();
                    if (_win.pageXOffset != x || _win.pageYOffset != y) {
                        _win.scrollTo(x, y);
                    }
                    if ((_isFirefox || _isChrome || _isOpera) && p && ( p.scrollTop != st || p.scrollLeft !=sl)) {
                        p.scrollTop = st;
                        p.scrollLeft = sl;
                    }
                } finally {
                    this._focusing = false;
                    this._focusingTarget = null;
                    p = null;
                }
            } else if (target != this._focusingTarget) {
                target.setFocus ? target.setFocus() : target instanceof HTMLCanvasElement ? null : target.focus();
            }
        }
    },
    checkClicked: function (x, y) {
        if ($_debug) {
            var dx = this._width - x, dy = this._height - y, t = getTimer();
            if (dx < 3 && dy < 3) {
                if (t < this._clicket + 300) {
                    this._clicked++;
                    if (this._clicked == 3) {
                        alert(this);
                    }
                } else {
                    this._clicked = 0;
                }
            }
            this._clicket = t;
        }
    },
    toOffset: function (event) {
        /*
         event.mouseX = event.clientX - _offsetX;
         event.mouseY = event.clientY - _offsetY;
         */
        var elt = this._canvas; // event.target; // canvas로 간주하면 window로 이벤트 핸들링을 해도 동일하게 적용된다.
        var r = elt.getBoundingClientRect();
        event.mouseX = event.clientX - r.left;
        event.mouseY = event.clientY - r.top;
        return event;
    },
    toScreen: function (r) {
        r.x += this._offsetX;
        r.y += this._offsetY;
        return r;
    },
    $_prepareContextMenu: function () {
        this.$_contextMenuHandler = function (e) {
            var menu = this._contextMenu;
            if (!menu) {
                var handler = this.onGetContextMenu;
                if (handler) {
                    var menuItems = handler(this, e.offsetX, e.offsetY);
                    if (menuItems && menuItems.length > 0) {
                        menu = new PopupMenu("gridContextMenu", this, menuItems);
                    }
                }
            }
            if (menu) {
                    e.preventDefault();
                    var target = e.target || e.srcElement;
                    var r = target.getBoundingClientRect();
                    var x = e.clientX - r.left;
                    var y = e.clientY - r.top;
                    this._popupMenuManager.showContext(menu, x, y);
            }
        }.bind(this);
        if ($_evl) {
            this._container.addEventListener("contextmenu", this.$_contextMenuHandler);
        } else {
            this._container.attachEvent("contextmenu", this.$_contextMenuHandler);
        }
    },
    _resizeHandler: function (event) {
    },
    _keyDownHandler: function (event) {
        if (this._activeTool) {
            var ctrl = _isMac && event.metaKey || !_isMac && event.ctrlKey;
            this._activeTool.keyDown(event.keyCode, event.ctrlKey, event.shiftKey, event.altKey);
            this._gridView && this._gridView.isReadMode() && 
                _included(event.keyCode,Keys.SPACE, Keys.TAB, Keys.HOME, Keys.END, Keys.RIGHT, Keys.LEFT, Keys.DOWN, Keys.UP, Keys.PAGEDOWN, Keys.PAGEUP) && event.preventDefault && event.preventDefault();
        }
    },
    _keyUpHandler: function (event) {
        if (this._activeTool) {
            var ctrl = _isMac && event.metaKey || !_isMac && event.ctrlKey;
            this._activeTool.keyUp(event.keyCode, event.ctrlKey, event.shiftKey, event.altKey);
        }
    },
    _keyPressHandler: function (event) {
        if (this._activeTool) {
            this._activeTool.keyPress(event.keyCode);
        }
    },
    _clickHandler: function (event) {
        this.checkClicked(event.clientX - this._offsetX, event.clientY - this._offsetY);
        if (this._activeTool) {
            this._activeTool.click(this.toOffset(event));
        }
    },
    _dblclickHandler: function (event) {
        this.checkClicked(event.clientX - this._offsetX, event.clientY - this._offsetY);
        if (this._activeTool) {
            this._activeTool.dblclick(this.toOffset(event));
        }
    },
    _mouseDownHandler: function (event) {
        this._popupMenuManager.close();
        if (event.target === this._canvas) {
            this._canvas.setAttribute('tabindex', '0');
            this._captured = true;
            this.checkClicked(event.clientX - this._offsetX, event.clientY - this._offsetY);
            this.toOffset(event);
            this._currentX = event.mouseX;
            this._currentY = event.mouseY;
            if (this._activeTool) {
                this._activeTool.mouseDown(event);
            }
            /*
            _stopEvent(event);
            */
            if (_isIE && (!this._activeTool || this._activeTool.isEditing())) {
                _stopEvent(event);
            }
        }
    },
    _mouseMoveHandler: function (event) {
        if (!this._captured && event.target !== this._canvas) {
            if (this._hovered) {
                this._hovered.setHovered(false);
                this._hovered = null;
            }
            if (this._activeTool) {
                this._activeTool.mouseOutside();
            }
            return;
        }

        this.toOffset(event);
        var x = event.mouseX;
        var y = event.mouseY;
        if (x != this._currentX || y != this._currentY) { // 같은 위치여도 발생하고 있다.
            this._currentX = x;
            this._currentY = y;
            var elt = this.findElementAt(x, y, true);

            if (!this._activeTool || !this._activeTool.isDragging()) {
                if (elt && elt.canHover() && elt != this._hovered ) {
                    var hovered = this._hovered;
                    if (hovered) {
                        hovered.setHovered(false);
                        if (hovered instanceof HeaderCellHandle) {
                            hovered.invalidate();
                             if (!(elt instanceof HeaderCellHandle))
                                hovered._owner.invalidate();
                        }
                    }

                    this._hovered = elt;
                    if (this._hovered && this._hovered._mouseEnabled) {
                        this._hovered.setHovered(true);
                        if (this._hovered instanceof HeaderCellHandle)
                            this._hovered.invalidate();

                    }
                }
            }
        }
        if (this._activeTool) {
            this._activeTool.mouseMove(event);
        }
    },
    _mouseUpHandler: function (event) {
        if (!this._captured && event.target !== this._canvas) {
            return;
        }
        this._captured = false;
        if (this._activeTool) {
            this._activeTool.mouseUp(this.toOffset(event));
        }
    },
    _mouseEnterHandler: function (event) {
        if (this._activeTool) {
            this._activeTool.mouseEnter(this.toOffset(event));
        }
    },
    _mouseLeaveHandler: function (event) {
        if (this._activeTool) {
            this._activeTool.mouseLeave(this.toOffset(event));
        }
    },
    _mouseOverHandler: function (event) {
        if (this._activeTool) {
            this._activeTool.mouseLeave(this.toOffset(event));
        }
    },
    _mouseWheelHandler: function (event) {
        if (this._activeTool) {
            if (this._activeTool.mouseWheel(this.toOffset(event))) {
                _stopEvent(event);
            }
        }
    },
    _mouseScrollHandler: function (event) {
        if (this._activeTool) {
            event.wheelDelta = -event.detail;
            if (this._activeTool.mouseWheel(this.toOffset(event))) {
                _stopEvent(event);
            }
        }
    },
    _focusHandler: function (event) {
    },
    _blurHandler: function (event) {
    },
    _focusinHandler: function (event) {
        _trace("focusin to " + event.target);
        if (event.target === this._canvas) {
            this._activeTool && this._activeTool.setFocus();
        }
    },
    _focusHandlerFireFox: function (event) {
        _trace("focus to " + event.target);
        if (event.target === this._canvas) {
            this._activeTool && this._activeTool.setFocus();
        }
    },
    _focusoutHandler: function (event) {
        _trace("focusout from " + event.target);
    },
    _touchStartHandler: function (event) {
        if (this._activeTool) {
            this._activeTool.touchStart(event);
        }
    },
    _touchMoveHandler: function (event) {
        if (this._activeTool) {
            this._activeTool.touchMove(event);
        }
    },
    _touchEndHandler: function (event) {
        if (this._activeTool) {
            this._activeTool.touchEnd(event);
        }
    },
    _touchCancelHandler: function (event) {
        if (this._activeTool) {
            this._activeTool.touchCancel(event);
        }
    },
    _touchLeaveHandler: function (event) {
        if (this._activeTool) {
            this._activeTool.touchEnd(event);
        }
    },
    onMenuItemClick: function (menuItem) {
        this.onContextMenuItemClicked && this.onContextMenuItemClicked(this, menuItem);
        this.fireEvent(UIContainer.CONTEXT_MENU_ITEM_CLICKED, menuItem);
    }
});
UIContainer.CONTEXT_MENU_ITEM_CLICKED = "onUIContainerContextMenuItemClicked";
