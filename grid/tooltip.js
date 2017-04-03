var ToolTipOptions = defineClass("ToolTipOptions", null, {
	init : function (options) {
		this._super();
		this._styles = new VisualStyles();
		options && this.assign(options);
	},
	message: null,
	visible: true,
	styles: null,
	setStyles: function (value) {
		if (value != this._styles) {
			this._styles.extend(value, false);
		}
	},
	assign: function (source) {
		if (typeof source == "string") {
			this._message = source;
			if (this._message) {
				this._visible = true;
			}
		} else if (typeof source == "boolean") {
			this._visible = Boolean(source);
		} else {
			this._super(source);	
		}
	}
});
var ToolTipView = defineClass("ToolTipView", EventAware, {
	init : function (container) {
		this._super();
		this._container = container;
		this._span = null;
		this._element = this._createElement();
		this._showing = false;
	},
	minWidth: 0,
	maxWidth: 0,
	dropDownCount: 8,
	show: function (options, x, y) {
		this._showing = true;
		try {
			this.$_show(options, x, y);
		} finally {
			this._showing = false;
		}
	},
	$_show: function (options, x, y) {
		var grid = this._container.gridView();
		var s = options.message()+"";
		if (!s) {
			return;
		}
		var elt = this._element;
		if (!elt) {
			return;
		}
		var span = this._span;
		span.innerHTML = s.replace(/\n/g,"<br>");
		elt.style.position = "absolute";
		elt.style.left = x + "px";
		elt.style.top = y + "px";
		elt.style.overflow = "hidden";
		elt.style.zIndex = 3000;
		elt.style.background = options.styles().background().color().value();// "rgba(255, 255, 255, 0.9)";
		elt.style.color = "rgb(100, 100, 100)";
		elt.style.border = "1px solid rgb(100, 100, 100)";
		elt.style.borderRadius = "4px";
		elt.style.boxShadow = "5px 5px 5px rgba(100, 100, 100, 0.8)";
		elt.style.fontFamily = "Tahoma";
		elt.style.fontStyle = "normal";
		elt.style.fontVariant = "normal";
		elt.style.fontWeight = "normal";
		elt.style.fontSize = "10pt";
		elt.style.padding = "2px";
		elt.style.visibility = "hidden";
		elt.style.whiteSpace = "nowrap";
		this._container._container.appendChild(elt);
		var cr = elt.getBoundingClientRect();
		var pr = this._container._container.getBoundingClientRect();
		elt.style.left = cr.right > pr.right ? Math.max((pr.right - cr.width - pr.left -2),0)+"px": elt.style.left;
		elt.style.top = cr.bottom > pr.bottom ? Math.max(y - cr.height - grid._layoutManager.$_calcItemHeight(grid, grid.delegate(),0), 0)+"px" : elt.style.top;
		elt.style.visibility = "visible";		
		/*
		var cr = elt.getBoundingClientRect();
		var w = cr.width + 10;
		var h = cr.height + 10;
		var r = new Rectangle();
		r.width = this._container.width();
		r.height = this._container.height();
		elt.style.left = x + "px";//((r.width - w) / 2) + "px";
		elt.style.top = y + "px";// ((r.height - h) / 2) + "px";
		*/
	},
	hide: function () {
		var elt = this._element;
		if (!elt || !elt.parentNode) {
			return;
		}
		this._container._container.removeChild(elt);
	},
	_createElement: function () {
		var element = _doc.createElement("div");
		element.onkeydown = function (e) {
			if (e.keyCode == 27) {
				this.hide();
			}
		}.bind(this);
		this._disableSelection(element);
		this._span = _doc.createElement("span");
		element.appendChild(this._span);
		this._disableSelection(this._span);
		return element;
	},
	_disableSelection: function (element) {
        if (typeof element.onselectstart !== 'undefined') {
            element.onselectstart = function() { return false; };
        } else if (typeof element.style.MozUserSelect !== 'undefined') {
            element.style.MozUserSelect = 'none';
        } else {
            element.onmousedown = function() { return false; };
        }
    }
}, {
	$_labelId: 0
});
var ToolTipManager = defineClass("ToolTipManager", null, {
	init: function (grid) {
		this._super();
		this._container = grid.container();
		this._tipView = null;
		this._active = false;
		this._hintDuration = grid.displayOptions && grid.displayOptions() ? grid.displayOptions()._hintDuration : 0;
		this._showTimer = null;
	},
	isVisible: function () {
		return this._active;
	},
	show: function (options, x, y) {
		if (!this._active) {
			this.close();
			options = options instanceof ToolTipOptions ? options : options ? new ToolTipOptions(options) : null;
			if (options && options.isVisible()) {
				if (!this._tipView) {
					this._tipView = new ToolTipView(this._container);
				}
				this._tipView.show(options, x, y);
				this._active = true;
			}
		}
	},
	close: function () {
		this._showTimer && clearTimeout(this._showTimer);
		if (this._active) {
			this._tipView && this._tipView.hide();
			this._active = false;
		}
	}
});