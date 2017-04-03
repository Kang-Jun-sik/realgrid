var /* abstract */ VisualContext = defineClass("VisualContext", EventAware, {
	init : function() {
		this._super();
	}
});
var CanvasContext = defineClass("CanvasContext", VisualContext, {
	init : function(name, container) {
		this._super();
		this._name = name;
		this._container = container;
		this._canvas = document.createElement("canvas");
		this._ctx = this._canvas.getContext('2d');
		this._graphics = new Graphics(this._ctx);
		this._dirty = false;
		this._buffer = null;
		this._bufferCtx = null;
		this._deviceScale = Math.max(Math.floor(window.devicePixelRatio)||1 , 1);
	},
	destroy: function() {
		this._destroying = true;
		this._container = null;
		this._canvas = null;
		this._ctx = null;
		this._graphics = null;
		this._buffer = null;
		this._bufferCtx = null;
		this._super();
	},
    name: function () {
        return this._name;
    },
	isDirty: function () {
		return this._dirty;
	},
	resize: function (w, h) {
		if (w * this._deviceScale > this._canvas.width) {
			this._canvas.width = w * this._deviceScale;
		}
		if (h * this._deviceScale > this._canvas.height) {
			this._canvas.height = h * this._deviceScale;
		}
	},
	prepare: function (bounds, scrollX, scrollY, clear) {
		if (bounds && (scrollX || scrollY)) {
			var r = bounds;
			var buff = this._buffer;
			if (!buff) {
				this._buffer = buff = _doc.createElement("canvas");
				this._bufferCtx = buff.getContext("2d");
			}
			if (r.width > buff.width) {
				buff.width = r.width;
			}
			if (r.height > buff.height) {
				buff.height = r.height;
			}
			var x = r.x;
			var y = r.y;
			var w = r.width;
			var h = r.height;
			this._bufferCtx.drawImage(this._canvas, x, y, w, h, 0, 0, w, h);
			clear && this._graphics.clear(0, 0, this._canvas.width, this._canvas.height);
			if (scrollX > 0) {
				r.x += scrollX;
				w -= scrollX;
			} else if (scrollX < 0) {
				x -= scrollX;
				w += scrollX;
			}
			if (scrollY > 0) {
				r.y += scrollY;
				h -= scrollY;
			} else if (scrollY < 0) {
				y -= scrollY;
				h += scrollY;
			}
			this._ctx.drawImage(this._buffer, x, y, w, h, r.x, r.y, w, h);
			this._dirty = true;
		} else if (clear) {
			this._graphics.clear(0, 0, this._canvas.width, this._canvas.height);
		}
		this._graphics.save();
		(this._deviceScale > 1) && this._graphics.scale(this._deviceScale, this._deviceScale);
	},
	restore: function () {
		if (this._dirty) {
			this._dirty = false;
		}
		this._graphics.restore();
	},
	invalidate: function (element) {
		if (!this._dirty) {
			this._dirty = true;
		}
	}
});