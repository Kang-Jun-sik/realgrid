var /* abstract */ VisualCache = defineClass("VisualCache", EventAware, {
	init : function() {
		this._super();
	}
});
var CanvasCache = defineClass("CanvasCache", VisualCache, {
	init : function(doc, element) {
		this._super();
		this._element = element;
		this._canvas = doc.createElement("canvas");
		this._ctx = this._canvas.getContext('2d');
		this._graphics = new Graphics(this._ctx);
	},
	destroy: function () {
		this._destroying = true;
		this._element = null;
		this._canvas = null;
		this._ctx = null;
		this._graphics = null;
		this._super();
	},
	dispose: function () {
	},
	resize: function (w, h) {
		if (w > this._canvas.width) {
			this._canvas.width = w;
		}
		if (h > this._canvas.height) {
			this._canvas.height = h;
		}
	},
	prepare: function () {
		this._graphics.clear(0, 0, this._canvas.width, this._canvas.height);
		this._graphics.save();
	},
	restore: function () {
		this._graphics.restore();
	},
	invalidate: function (element) {
		if (!this._dirty) {
			this._dirty = true;
			this._container.invalidate();
		}
	}
});