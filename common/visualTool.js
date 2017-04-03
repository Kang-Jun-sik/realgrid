var Keys = _enum({
    BACK: 8,
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    ESCAPE: 27,
    SPACE: 32,
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    INSERT: 45,
    DELETE: 46,
    F2: 113,
    F3: 114,
    D: 68,
    I: 73,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90
});
var Cursor = _enum({
    DEFAUT: "default",
    AUTO: "auto",
    POINTER: "pointer",
    WAIT: "wait",
    MOVE: "move",
    COL_RESIZE: "col-resize",
    ROW_RESIZE: "row-resize",
    CROSSHAIR: "crosshair",
    HORZ_RESIZE: "ew-resize",
    VERT_RESIZE: "ns-resize",
    NESW_RESIZE: "nesw-resize",
    NWSE_RESIZE: "nwse-resize",
    NO_DROP: "no-drop",
    NOT_ALLOWED: "not-allowed"
});
var _touchToOffset = function (container, touch) {
    if (!touch) { alert("no touch"); return; }
    if (!container) { alert('no container'); return; }
    if (!container._canvas) { alert('no canvas'); return; }
    /*
     이렇게 하면 값이 틀어지는 browser가 있다. androdi tab...
     var r = this._container._canvas.getBoundingClientRect();
     touch.x = touch.clientX - r.left;
     touch.y = touch.clientY - r.top;
     */
    var r = container._canvas.getBoundingClientRect();
    // touch.x = touch.pageX - (r.left + window.scrollX);
    // touch.y = touch.pageY - (r.top + window.scrollY);
     touch.x = touch.clientX - r.left;
     touch.y = touch.clientY - r.top;
    return touch;
}
var TouchManager = defineClass("TouchManager", null, {
    init: function (container) {
        this._super();
        this._container = container;
    },
    touchStart: function (event) {
    },
    touchMove: function (event) {
    },
    touchEnd: function (event) {
    },
    touchCancel: function (event) {
    },
    _toOffset: function (touch) {
        return _touchToOffset(this._container, touch);
    }
});
var DRAG_THRESHOLD = 3;
var VisualTool = defineClass("VisualTool", null, {
    init: function (owner, name) {
        this._super();
        this._owner = owner;
        this._name = name;
        this._dragTracker = null;
        this._clickX = 0;
        this._clickY = 0;
        this._currX = 0;
        this._currY = 0;
    },
    destroy: function() {
        this._destroying = true;
        this._currX = this._currY = this._clickX = this._clickY =  null;
        this._super();
    },
    dragTracker: null,
    owner: function () {
        return this._owner;
    },
    setDragTracker: function (value) {
        if (value !== this._dragTracker) {
            if (this._dragTracker) {
                this._dragTracker.deactivate();
            }
            this._dragTracker = value;
            if (this._dragTracker) {
                this._dragTracker.activate();
            }
        }
    },
    isDragging: function () {
        return this._dragTracker && this._dragTracker.isDragging();
    },
    clickX: function () {
        return this._clickX;
    },
    clickY: function () {
        return this._clickY;
    },
    currX: function () {
        return this._currX;
    },
    currY: function () {
        return this._currY;
    },
    isEditing: function () {
        return false;
    },
    touchManager: function () {
        return null;
    },
    activate: function () {
        this._doActivate();
    },
    deactivate: function () {
        this._doDeactivate();
    },
    keyDown: function (key, ctrl, shift, alt) {
        return this._doKeyDown(key, ctrl, shift, alt);
    },
    keyUp: function (key, ctrl, shift, alt) {
        return this._doKeyUp(key, ctrl, shift, alt);
    },
    keyPress: function(key) {
        return this._doKeyPress(key);
    },
    click: function (event) {
        if (event.offsetX && event.offsetY) {
            this._doClick(event.offsetX, event.offsetY);
        } else {
            this._doClick(event.mouseX, event.mouseY);
        }
    },
    dblclick: function (event) {
        if (event.offsetX && event.offsetY) {
            this._doDblClick(event.offsetX, event.offsetY);
        } else {
            this._doDblClick(event.mouseX, event.mouseY)
        }
    },
    mouseDown: function (event) {
        var x = this._currX = this._clickX = event.mouseX;
        var y = this._currY = this._clickY = event.mouseY;
        if (this.isDragging()) {
            this._stopDragTracker(x, y, false);
            this.setDragTracker(null);
        }
        this._doMouseDown(event.mouseX, event.mouseY, event.ctrlKey, event.shiftKey, event.button, event);
    },
    mouseMove: function (event) {
        var x = this._currX = event.mouseX;
        var y = this._currY = event.mouseY;
        var tracker = this.dragTracker();
        var request;
        if (tracker) {
            if (tracker.isDragging()) {
                if (event.buttons == undefined || event.buttons > 0 || (_ieOld && event.buttons >= 0)) {
                    if (!tracker.drag(x, y)) {
                        request = tracker.getNextRequest(x, y);
                        if (request) {
                            this._stopDragTracker(x, y, true);
                            this.setDragTracker(this._getDragTracker(request));
                            this._startDragTracker(x, y);
                        }
                    }
                } else {
                    this._stopDragTracker(x, y, true);
                }
            } else if (Math.abs(x - this._clickX) >= DRAG_THRESHOLD || Math.abs(y - this._clickY) >= DRAG_THRESHOLD) {
                this._startDragTracker(x, y);
            } else {
                this._doMouseMove(x, y);
            }
        } else {
            this._doMouseMove(x, y);
        }
    },
    mouseUp: function (event) {
        var x = this._currX = event.mouseX;
        var y = this._currY = event.mouseY;
        if (this.isDragging()) {
            this._stopDragTracker(x, y, false);
            return;
        } else {
            this._doMouseUp(x, y, event);
        }
    },
    mouseEnter: function (event) {
        this._doMouseEnter(event.mouseX, event.mouseY);
    },
    mouseLeave: function (event) {
        this._doMouseLeave(event.mouseX, event.mouseY);
    },
    mouseOver: function (event) {
        this._doMouseOver(event.mouseX, event.mouseY);
    },
    mouseOutside: function () {
        this._doMouseOutside();
    },
    mouseWheel: function (event) {
        return this._doMouseWheel(event.mouseX, event.mouseY, event.wheelDelta, event.wheelDelta);
    },
    touchStart: function (event) {
        this.touchManager() ? this.touchManager().touchStart(event) : this._doTouchStart(event);
    },
    touchMove: function (event) {
        this.touchManager() ? this.touchManager().touchMove(event) : this._doTouchMove(event);
    },
    touchEnd: function (event) {
        this.touchManager() ? this.touchManager().touchEnd(event) : this._doTouchEnd(event);
    },
    touchCancel: function (event) {
        this.touchManager() ? this.touchManager().touchCancel(event) : this._doTouchCancel(event);
    },
    findElementAt: function (x, y, hitTesting) {
        return this._owner.findElementAt(x, y, hitTesting);
    },
    setFocus: function () {
        return this._doSetFocus();
    },
    _doActivate: function () {
        trace("tool: " + "activated");
    },
    _doDeactivate: function () {
        trace("tool: " + "deactivated");
    },
    _doKeyDown: function (key, ctrl, shift, alt) {
        trace("tool: " + "keyDown(" + key + ")");
        return false;
    },
    _doKeyUp: function (key, ctrl, shift, alt) {
        trace("tool: " + "keyUp(" + key + ")");
        return false;
    },
    _doKeyPress: function(key) {
        trace("tool: " + "keyPress("+ key + ")");
    },
    _doClick: function (x, y) {
        trace("tool: " + "click(" + x + "," + y + ")");
    },
    _doDblClick: function (x, y) {
        trace("tool: " + "dblClick(" + x + "," + y + ")");
    },
    _doMouseDown: function (x, y) {
        trace("tool: " + "mouseDown(" + x + "," + y + ")");
    },
    _doMouseMove: function (x, y) {
        trace("tool: " + "mouseMove(" + x + "," + y + ")");
    },
    _doMouseUp: function (x, y) {
        trace("tool: " + "mouseUp(" + x + "," + y + ")");
    },
    _doMouseEnter: function (x, y) {
        trace("tool: " + "mouseEnter(" + x + "," + y + ")");
    },
    _doMouseLeave: function (x, y) {
        trace("tool: " + "mouseLeave(" + x + "," + y + ")");
    },
    _doMouseOver: function (x, y) {
        trace("tool: " + "mouseOver(" + x + "," + y + ")");
    },
    _doMouseOutside: function () {
    },
    _doMouseWheel: function (x, y, deltaX, deltaY) {
        trace("tool: " + "mouseWheel(" + deltaX + "," + deltaY + ")");
        return false;
    },
    _doTouchStart: function (event) {
        trace("tool: " + "touchStart");
    },
    _doTouchMove: function (event) {
        trace("tool: " + "touchMove");
    },
    _doTouchEnd: function (event) {
        trace("tool: " + "touchEnd");
    },
    _doTouchCancel: function (event) {
        trace("tool: " + "touchCancel");
    },
    _startDragTracker: function (x, y) {
        if (this._dragTracker) {
            if (this._dragTracker.start(x, y)) {
                this._doDragTrackerStarted(this._dragTracker);
            } else {
                this._dragTracker = null;
            }
        }
    },
    _stopDragTracker: function (x, y, canceled) {
        if (this.isDragging()) {
            var tracker = this._dragTracker;
            if (canceled) {
                tracker.cancel();
            } else {
                tracker.drop(x, y);
            }
            this.setDragTracker(null);
            this._doDragTrackerFinished(tracker, canceled);
            this._owner && this._owner.invalidate && this._owner.invalidate();
        }
    },
    _doDragTrackerStarted: function (dragTracker) {
        trace("dragTracker started: " + dragTracker.name());
    },
    _doDragTrackerFinished: function (dragTracker, canceled) {
        trace("dragTracker stopped: " + dragTracker.name() + ", " + (canceled ? "canceled" : "completed"));
    },
    _doSetFocus: function () {
    }
});
var EditRequest = defineClass("EditRequest", null, {
    init : function() {
        this._super();
    },
    cursor: function () { return Cursor.AUTO; },
    source: function () { return null; },
    isSelectable: function () { return false; },
    isDblClickable: function () { return false; }
});
var DragTracker = defineClass("DragTracker", null, {
    init : function(container, name, x, y) {
        this._super();
        this._container = container;
        this._name = name;
        this._active = false;
        this._completed = false;
        this._dragging = false;
        this._startX = x;
        this._startY = y;
        this._currentX = 0;
        this._currentY = 0;
    },
    cancelabel: false,
    container: function () {
        return this._container;
    },
    name: function () {
        return this._name;
    },
    isActive: function () {
        return this._active;
    },
    isDragging: function () {
        return this._dragging;
    },
    startWhenCreated: function () {
        return false;
    },
    isCompleted: function () {
        return this._completed;
    },
    activate : function() {
        if (!this._active) {
            this._doActivate();
            this._active = true;
        }
    },
    deactivate : function() {
        if (this._active) {
            this.cancel();
            this._doDeactivate();
            this._active = false;
        }
    },
    start: function (x, y) {
        this.cancel();
        if (this._active && this._doStart(x, y)) {
            this._currentX = this._startX = x;
            this._currentY = this._startY = y;
            this._dragging = true;
            this._completed = false;
            this._showFeedback(x, y);
            return true;
        }
        return false;
    },
    drag: function (x, y) {
        if (this._dragging) {
            this._currentX = x;
            this._currentY = y;
            if (this._doDrag(x, y)) {
                this._moveFeedback(x, y);
                return true;
            }
        }
        return false;
    },
    cancel: function () {
        try {
            if (this._dragging) {
                try {
                    this._dragging = false;
                    this._doCanceled();
                } finally {
                    this._doEnded();
                }
            }
        } finally {
            this._hideFeedback();
        }
    },
    drop: function (x, y) {
        try {
            if (this._dragging) {
                try {
                    this._currentX = x;
                    this._currentY = y;
                    this._dragging = false;
                    if (this._canAccept(x, y)) {
                        this._doCompleted(x, y);
                        this._completed = true;
                    } else {
                        this._doCanceled(x, y);
                    }
                } finally {
                    this._doEnded();
                }
            }
        } finally {
            this._hideFeedback();
        }
    },
    getNextRequest: function (x, y) {
        return null;
    },
    startX: function () {
        return this._startX;
    },
    startY: function () {
        return this._startY;
    },
    currentX: function () {
        return this._currentX;
    },
    currentY: function () {
        return this._currentY;
    },
    offsetX: function () {
        return this._currentX - this._startX;
    },
    offsetY: function () {
        return this._currentY - this._startY;
    },
    _showFeedback: function (x, y) {
    },
    _moveFeedback: function (x, y) {
    },
    _hideFeedback: function () {
    },
    _doActivate : function () {
        trace(this._name + " activated");
    },
    _doDeactivate : function () {
        trace(this._name + " deactivated");
    },
    _doStart: function (x, y) {
        return true;
    },
    _doDrag: function (x, y) {
        return true;
    },
    _doCanceled: function () {
    },
    _canAccept: function (x, y) {
        return true;
    },
    _doCompleted: function () {
    },
    _doEnded: function () {
    },
    _findElementAt: function (x, y, hitTesting) {
        return this._container.findElementAt(x, y, hitTesting);
    }
});