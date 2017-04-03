var Progress = defineClass("Progress", EventAware, {
    init: function () {
        this._super();
        this._view = new ProgressView();
        this._runner = null;
        this._next = 0;
        this._completed = false;
        this._timer = undefined;
    },
    min: 0,
    max: 100,
    step: 1,
    execute: function (runner) {
        if (runner) {
            this._runner = runner;
            this._next = this._min;
            if (runner.container instanceof HTMLElement) {
                this._view.setProperties(this._min, this._max, this._min);
                this._view.show(runner.container);
            }
            this.$_runNext();
        }
    },
    $_runNext: function () {
        if (this._next < this._max) {
            var msg = this._runner.run(this._next);
            this._next += this._step;
            this._view.setPosition(this._next, msg);
            _trace("P R O G R E S S : " + this._min + " > " + this._next + " > " + this._max);
            if (this._next < this._max) {
                setTimeout(function () {
                    this.$_runNext();
                }.bind(this), 0)
                return;
            }
        }
        !this.$_completed && this.$_complete();
    },
    $_complete: function () {
        try {
            this._runner.complete && this._runner.complete();
        } finally {
            _trace("P R O G R E S S : " + "completed : " + +this._min + " > " + this._next + " > " + this._max);
            this.$_completed = true;
            this._view.close();
        }
    }
});
var ProgressView = defineClass("ProgressView", null, {
    init: function () {
        this._super();
        this._container = null;
        this._dom = new Dom(this.$_createElement());
        this._min = 0;
        this._max = 0;
        this._pos = 0;
    },
    modal: false,
    message: "Load data...",
    position: function () {
        return this._pos;
    },
    setPosition: function (value, message) {
        value = Math.max(this._min, Math.min(this._max, value));
        if (value != this._pos) {
            this._pos = value;
            this._message = message;
            this.$_refreshView();
        }
    },
    setProperties: function (min, max, pos, message, refresh) {
        this._min = min;
        this._max = Math.max(min, max);
        if (this._max == this._min) this._max = this._min + 1;
        this._pos = Math.max(this._min, Math.min(this._max, pos));
        this._message = message;
        refresh && this.$_refreshView();
    },
    show: function (container, message) {
        this._container = container;
        message && this.$_setMessage(message);
        container.appendChild(this._dom.element());
        var r = container.getBoundingClientRect();
        var sz = this._dom.size();
        this._dom.move((r.width - sz.width) / 2, (r.height - sz.height) / 3);
    },
    close: function () {
        this._dom.detach();
    },
    $_createElement: function () {
        var div = Dom.createElement("div", {
            position: "absolute",
            zIndex: 3001,
            minWidth: "250px",
            padding: "8px 10px",
            backgroundColor: "rgba(0, 111, 245, 0.05)",
            border: "1px solid #ddd"
        });
        div.appendChild(div.$_bar = this.$_createBar());
        div.appendChild(div.$_msg = this.$_createMsg());
        return div;
    },
    $_createBar: function () {
        var div = Dom.createElement("div", {
            width: "100%",
            height: "13px",
            marginBottom: "4px",
            background: "linear-gradient(#aaa, #ccc)",
            border: "1px solid #333"
        });
        var led = Dom.createElement("div", {
            height: "100%",
            width: "0px",
            background: "linear-gradient(#fff, #ddd)",
            borderRight: "1px solid #333"
        });
        div.appendChild(led);
        div.$_led = led;
        return div;
    },
    $_createMsg: function () {
        var div = Dom.createElement("div", {
            width: "100%",
            textAlign: "center"
        });
        var span = Dom.createElement("span", {
            fontSize: "11px",
            fontFamily: "Tahoma",
            fontWeight: "bold"
        });
        div.appendChild(div.$_span = span);
        return div;
    },
    $_refreshView: function () {
        var elt = this._dom.element();
        var bar = elt.$_bar;
        var led = bar.$_led;
        var msg = elt.$_msg.$_span;
        msg.innerHTML = Dom.htmlEncode(this._message);
        var r = Dom.getSize(bar);
        led.style.width = Math.min(r.width - 1, _int(r.width * (this._pos - this._min) / (this._max - this._min))) + "px";
    },
    $_setMessage: function (s) {
        var msg = this._dom.element().$_msg.$_span;
        msg.innerHTML = Dom.htmlEncode(this._message);
    }
});
var ProgressManager = defineClass("ProgressManager", null, {
    init: function (container) {
        this._super();
        this._container = container;
        this._title = null;
        this._view = null;
    },
    show: function (container, title, modal) {
        if (!this._view) {
            this._view = new ProgressView();
        }
        this._view.show(container || this._container, title || "Load data...");
    },
    close: function () {
        this._view && this._view.close();
    },
    setProperties: function (min, max, pos, message) {
        if (!message) {
            message = this._title || "Load data... ";
            if (max > min) {
                message += parseInt((pos - min) * 100 / (max - min)) + "% " + "(" + pos + " / " + max + ")";
            }
        }
        this._view && this._view.setProperties(min, max, pos, message, true);
    }
});