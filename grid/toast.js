var ToastOptions = defineClass("ToastOptions", null, {
	init : function (options) {
		this._super();
		options && this.assign(options);
	},
	message: null,
	visible: true,
	zIndex: null,
	styles: null,
	setStyles: function (value) {
		if (value) {
			if (!this._styles)
				this._styles = new VisualStyles();
			this._styles.extend(value);
		} else {
			this._styles = null;
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
	},
	proxy: function () {
		var proxy = this._super();
		if (this._styles)
			proxy["styles"] = this._styles.toProxy();
		return proxy;
	}
});
var ToastView = defineClass("ToastView", EventAware, {
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
	show: function (options) {
		this._showing = true;
		try {
			this.$_show(options);
		} finally {
			this._showing = false;
		}
	},
	$_show: function (options) {
		var s = options.message();
		if (!s) {
			return;
		}
		var elt = this._element;
		if (!elt) {
			return;
		}
		var span = this._span;
		var displayOptions = this._container._gridView.displayOptions();
		span.innerHTML = s;
		elt.style.position = "absolute";
		elt.style.overflow = "hidden";
		elt.style.zIndex = options.zIndex && options.zIndex() != null ? options.zIndex() : ( displayOptions && displayOptions.toastZIndex && displayOptions.toastZIndex() != null ?  displayOptions.toastZIndex() : 3000);

		var styles = options.styles();
		var background;
		var foreground;
		var border
		var figureBackground;
		var fontFamily;
		var fontStyle;
		var fontWeight;
		var fontSize;
		var textDecoration;
		var paddingLeft;
		var paddingRight;
		var paddingTop;
		var paddingBottom;
		if (styles) {
			background = styles.background();
			foreground = styles.foreground();
			border = styles.border();
			figureBackground = styles.figureBackground();
			fontFamily = styles.fontFamily();
			fontStyle = styles.fontItalic() ? "italic" : "noramal";
			fontWidth = styles.fontBold() ? "bold" : "normal";
			textDecoration = styles.fontUnderline() ? "underline" : "";
			paddingLeft = styles.paddingLeft();
			paddingRight = styles.paddingRight();
			paddingTop = styles.paddingTop();
			paddingBottom = styles.paddingBottom();
		}
		
		if (background) {
			elt.style.background = background.css();
		} else if (_norgba) {
			new SolidBrush("rgba(33, 33, 33, 0.8)").applyToCss(elt.style);
		} else {
			elt.style.background = "rgba(33, 33, 33, 0.8)";
		}
		if (foreground) {
			elt.style.color = foreground.css();
		} else {
			elt.style.color = "rgb(255, 255, 255)";
		}

		if (border) {
			elt.style.border = border.css();
		} else {
			elt.style.border = "1px solid rgb(200, 200, 200)";
		}
		if (figureBackground) {
			elt.style.boxShadow = figureBackground.css() + " 1px 2px 5px";
		} else {
			elt.style.boxShadow = "rgb(0, 0, 0, 0.8) 1px 2px 5px";
		}

		elt.style.fontFamily = fontFamily ? fontFamily : "Tahoma";
		elt.style.fontStyle = fontStyle ? fontStyle : "normal";
		elt.style.fontWeight = fontWeight ? fontWeight : "normal";
		elt.style.fontSize = fontSize ? fontSize + "pt" : "16pt";
		elt.style.paddingTop = paddingTop ? paddingTop + "px" : "8px";
		elt.style.paddingBottom = paddingBottom ? paddingBottom + "px" : "8px";
		elt.style.paddingLeft = paddingLeft ? paddingLeft + "px" : "16px";
		elt.style.paddingRight = paddingRight ? paddingRight + "px" : "16px";
		if (textDecoration)
			elt.style.textDecoration = textDecoration;
		this._container._container.appendChild(elt);
		var cr = elt.getBoundingClientRect2();
		var w = cr.width + 10;
		var h = cr.height + 10;
		var r = new Rectangle();
		r.width = this._container.width();
		r.height = this._container.height();
		elt.style.left = ((r.width - w) / 2) + "px";
		elt.style.top =  ((r.height - h) / 2) + "px";
		/*
		_win.onmousedown = function (e) {
			var p = e.target;
			while (p) {
				if (p == this._element)
					return;
				p = p.parentNode;
			}
			this.hide();
		}.bind(this);
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
var ToastManager = defineClass("ToastManager", null, {
	init: function (grid) {
		this._super();
		this._container = grid.container();
		this._toast = null;
		this._active = false;
	},
	isVisible: function () {
		return this._active;
	},
	show: function (options, force, action) {
		if (!this._active || force) {
			this.close();
			options = options instanceof ToastOptions ? options : options ? new ToastOptions(options) : null;
			if (options && options.isVisible()) {
				if (!this._toast) {
					this._toast = new ToastView(this._container);
				}
				this._toast.show(options);
				this._active = true;
				if (action) {
					setTimeout(function () {
						try {
							action();
						} finally {
							this.close();
						}
					}.bind(this), 0);
				}
				return;
			}
		}
		action && action();
	},
	close: function () {
		if (this._active) {
			this._toast && this._toast.hide();
			this._active = false;
		}
	}
});