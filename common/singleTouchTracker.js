var SingleTouchTracker = defineClass("SingleTouchTracker", null, {
    init: function () {
        this._super();
    },
    start: function (x, y) {
    },
    move: function (x, y) {
    },
    stop: function (x, y) {
    }
});
var $_TAP_THRESHOLD = 4;            // pixels
var $_DOUBLE_TAP_THRESHOLD = 300;   // milliseconds
var $_LONG_TAP_THRESHOLD = 500;     // milliseconds
var $_SWIPE_THRESHOLD = 20;         // pixels
var SingleTouchManager = defineClass("SingleTouchManager", TouchManager, {
    init: function (container) {
        this._super(container);
        this._touchId = undefined;
        this._started = null;
        this._seconded = null;
        this._startX = NaN;
        this._startY = NaN;
        this._tapped = 0;
        this._dragging = false;
        this._prevX = NaN;
        this._prevY = NaN;
        this._longTapTimer = undefined;
        this._tracker = null;
        this._events = [];
        this._touches = [];
    },
    touchHandler: null,
    tapHandler: null,
    doubleTapHandler: null,
    longTapHandler: null,
    dragStartHandler: null,
    dragHandler: null,
    dragEndHandler: null,
    swipeHandler: null,
    isSingleTouch: function () {
        return this._touches.length == 1;
    },
    removeTouches: function (touches) {
        var t, idx;
        for (var i = 0, len = touches.length; i < len; i++) {
            var t = touches[i];
            if ((idx = this._touches.indexOf(t.identifier)) > -1) {
                this._touches.splice(idx, 1);
            }
        }       
    },
    touchStart: function (evt/*TouchEvent*/) {
        clearTimeout(this._longTapTimer);
        var touches = evt.changedTouches;
        _trace("#### touch Start", evt.touches.length, this._touches.length);
        if (evt.touches.length > 1 || this._touches.length > 0) {
            for (var i = 0, len = touches.length; i < len; i++) {
                var t = touches[i];
                this._touches.push(t.identifier);
            }
        } else if (touches.length > 0) {
            var t = this._toOffset(touches[0]);
            if (this._tracker) {
                this._tracker.stop(t.x, t.y);
                this._tracker = null;
            }
            this._touchId = t.identifier;
            this._touches.push(t.identifier);
            this._dragging = false;
            if (this._touchHandler && (this._tracker = this._touchHandler(t.x, t.y))) {
                this._tracker.start(t.x, t.y);
                return;
            }
            if (this._tapped == 0) {
                this._started = getTimer();
                this._prevX = this._startX = t.x;
                this._prevY = this._startY = t.y;
            } else {
                this._seconded = getTimer();
                this._prevX = t.x;
                this._prevY = t.y;
            }
            this._events = [];
            this._events.push({ x: t.x, y: t.y, t: evt.timeStamp });

            this._longTapTimer = setTimeout(function () {
                if (this._longTapHandler && this._longTapHandler(this._startX, this._startY)) {
                    this._touchId = undefined;
                    this._tapped = 0;
                }
            }.bind(this), $_LONG_TAP_THRESHOLD);
        } else {
            alert("no touch ?");
        }
    },
    touchMove: function (evt) {
        var t = this.$_findTouch(evt);
        _trace("#### touch Move", t, this.isSingleTouch());
        if (t && this.isSingleTouch()) {
            evt.preventDefault();
            if (this._tracker) {
                this._tracker.move(t.x, t.y);
                return;
            }
            if (this._dragging) {
                this._dragHandler && this._dragHandler(this._prevX, this._prevY, t.x, t.y);
            } else if (Math.abs(this._prevX - t.x) > $_TAP_THRESHOLD || Math.abs(this._prevY - t.y) > $_TAP_THRESHOLD) {
                clearTimeout(this._longTapTimer);
                this._tapped = 0;
                this._dragging = true;
                this._dragStartHandler && this._dragStartHandler(this._startX, this._startY, t.x, t.y);
            }
            this._prevX = t.x;
            this._prevY = t.y;
            this._events.push({ x: t.x, y: t.y, t: evt.timeStamp });
            if (this._events.length > 30) this._events.splice(0, 15);
        }
    },
    touchEnd: function (evt) {
        clearTimeout(this._longTapTimer);
        _trace("#### touch end", this.isSingleTouch());
        if (this._touchId === undefined) {
            this.removeTouches(evt.changedTouches);
            return;
        }
        var t = this.$_findTouch(evt);
        if (t && this.isSingleTouch()) {
            evt.preventDefault();
            if (this._tracker) {
                this._tracker.stop(t.x, t.y);
            } else if (this._dragging) {
                this._touchId = undefined;
                this._tapped = 0;
                this._swipeHandler && this.$_checkSwipe();
            } else if (this._tapped == 0) {
                this._tapped = 1;
                this._tapHandler && this._tapHandler(this._startX, this._startY);
            } else if (this._tapped == 1) {
                this._touchId = undefined;
                var t = getTimer();
                if (t - this._started < $_DOUBLE_TAP_THRESHOLD) {
                    this._tapped = 0;
                    this._doubleTapHandler && this._doubleTapHandler(this._startX, this._startY);
                } else {
                    this._tapped = 1;
                    this._started = this._seconded;
                    this._startX = this._prevX;
                    this._starty = this._prevY;
                    this._tapHandler && this._tapHandler(this._prevX, this._prevY);
                }
            } else {
                alert("touch end");
            }
        }
        this._tracker = null;
        this.removeTouches(evt.changedTouches);
    },
    touchCancel: function (evt) {
        evt.preventDefault();
        this.removeTouches(evt.changedTouches);
        clearTimeout(this._longTapTimer);
        var t = this.$_findTouch(evt);
        if (t) {
            if (this._tracker) {
                this._tracker.stop(t.x, t.y);
            }
        }
    },
    $_findTouch: function (evt) {
        var touches = evt.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            var t = touches[i];
            if (t.identifier == this._touchId) {
                return this._toOffset(t);
            }
        }
        return null;
    },
    $_checkSwipe: function () {
        /*
        var d =  Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        var a = Math.round(Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI);
        if (a < 0) a = 360 + a;
        alert(a + ", " + this._velocity);
        */
        var events = this._events;
        var cnt = events.length;
        if (cnt < 2) return;
        var e2 = events[cnt - 1];
        var e1 = events[cnt - 2];
        for (var i = cnt - 3; i >= 0; i--) {
            if (e2.t - e1.t > 100) {
                break;
            }
            e1 = events[i];
        }
        var x1 = e1.x;
        var y1 = e1.y;
        var x2 = e2.x;
        var y2 = e2.y;
        var d =  Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        var dt = Math.max(16, e2.t - e1.t);
        var v = d / dt;
        var minv = 0.1;
        var friction = 0.998;
        if (v > minv) {
            var duration = Math.log(minv / v) / Math.log(friction);
            var distance = v * (1 - Math.pow(friction, duration + 1)) / (1 - friction);
            var dir = "right";
            var a = Math.round(Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI);
            if (a < 0) a = 360 + a;
            if (a > 45 && a <= 135) dir = "bottom";
            else if (a > 135 && a <= 225) dir = "left";
            else if (a > 225 && a <= 315) dir = "top";
            this._swipeHandler(duration, distance, dir);
        }
    }
});