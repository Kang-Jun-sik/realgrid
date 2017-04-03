var VisualContainer = defineClass("VisualContainer", UIContainer, {
	init: function (dom, containerId, readMode) {
		this._super(dom, containerId);
        var container = this._container;
        this._deviceScale = Math.max(Math.floor(window.devicePixelRatio)||1 , 1);
        if (dom) {
            this._createChildren(container);
            this.invalidateLayout();
            this._registerEventHandlers(container);
        } else {
            var canvas = this._canvas = document.createElement("canvas");
            this._ctx = canvas.getContext('2d');
            container.appendChild(canvas);
            var clientRect = container.getBoundingClientRect();
            canvas.width = parseInt(clientRect.width) * this._deviceScale;//container.clientWidth;
            canvas.height = parseInt(clientRect.height) * this._deviceScale;//container.clientHeight;
            canvas.style.position = "absolute";
            canvas.style.left = "0px";
            canvas.style.top = "0px";
            canvas.style.background = "#fff"; // 이렇게 하지 않으면 상위 div의 값을 따라간다.
            canvas.style.borderStyle = "none";
            canvas.style.borderWidth = "0px";
            if (this._deviceScale > 1) {
	            canvas.style.width = "100%";
	            canvas.style.height = "100%";
	            canvas.style["-webkit-transform"] = "translateZ(0)";
	        };
            canvas.innerText = readMode ? "" : "Your browser does not support HTML5 Canvas.";
            canvas.setAttribute('tabindex', '0');
            canvas.setAttribute('role', 'application');
            this._defContext = new CanvasContext("defaultContext", this);
            this._defContext.resize(this._width, this._height);
            this._contexts = null;
            this._createChildren(container);
            this.invalidateLayout();
            this._registerEventHandlers(canvas);
        }
        this._imagePool = new ImagePool();
        this._imagePool.addListener(this);
		/*
		setInterval(function () {
			this.resetSize();
		}.bind(this), 100);
		*/
	},
	destroy: function() {
		this._destroying = true;
		this._imagePool.removeListener(this);
		Dom.clearElements(this._canvas);
		if (this._canvas.parentNode) {
			this._canvas.parentNode.removeChild(this._canvas);
		};
		this._ctx = null;
		this._canvas = null;
		this._imagePool = null;
		this._super();
	},
    onImageLoaded: function (url) {
        var img = this._imagePool.getImage(url);
        trace("Image loaded at " + url + " [" + img.width + "," + img.height + "]");
        this.invalidateLayout();
    },
    getCanvasImage: function () {
        return this._canvas && this._canvas.toDataURL();
    },
    getContext: function (contextName) {
        if (this._contexts) {
            for (var i = this._contexts.length; i--;) {
                if (this._contexts[i].name() == contextName) {
                    return this._contexts[i];
                }
            }
        }
        return null;
    },
	addContext: function (context) {
		if (context) {
			if (!this._contexts) {
				this._contexts = [];
			}
			if (this._contexts.indexOf(context) < 0) {
				this._contexts.push(context);
				context.resize(this._width, this._height);
			}
		}
	},
    getImage: function (url) {
        return this._imagePool.getImage(url);
    },
	measureText: function (font, text) {
        if (this.$_dom) {
            return text ? text.length * 8 : 0;
        } else {
            this._ctx.font = font.font;
            return this._ctx.measureText(text).width;
        }
	},
	measureTextRect:function (font, text, x, y, w, h, align, layout, textWrap, rect) {
        var sz;
        switch (textWrap) {
            case TextWrapMode.EXPLICIT:
                sz = this._defContext._graphics.getExplicitTextRect(font, text, x, y, w, h, align, layout, rect);
                break;
            case TextWrapMode.NORMAL:
                sz = this._defContext._graphics.getWrapTextRect(font, text, x, y, w, h, align, layout, rect);
                break;
            default:
                sz = this._defContext._graphics.getTextRect(font, text, x, y, w, h, align, layout, rect);
                break;
        }
        return sz.height;
	},

	invalidateElement: function (element) {
        if (!element._dom) {
            var ctx = element._context || this._defContext;
            ctx.invalidate(element);
        }
		if (!this._drawing && !this._updateRequested) {
			window.requestAnimationFrame(this._containerRender);
			this._updateRequested = true;
		}
	},
	validateElement: function (element) {
	},
	scroll: function (bounds, deltaX, deltaY) {
		this.$$_render(_getTimer(), bounds, deltaX, deltaY);
	},
	resetSize: function (callback) {
		this._resetSizeCallback = callback;
		var clientRect = this._container.getBoundingClientRect();
		if (this._width != parseInt(clientRect.width) /*this._container.clientWidth*/ || this._height != parseInt(clientRect.height) /*this._container.clientHeight*/) {
            if (this._defContext) {
            	var clientRect = this._container.getBoundingClientRect();
            	this._width = parseInt(clientRect.width);
            	this._height = parseInt(clientRect.height);
                this._canvas.width = parseInt(clientRect.width) * this._deviceScale;//this._container.clientWidth;
                this._canvas.height = parseInt(clientRect.height) * this._deviceScale;//this._container.clientHeight;
                this._defContext.resize(this._width, this._height);
                if (this._contexts) {
                    for (var i = 0; i < this._contexts.length; i++) {
                        this._contexts[i].resize(this._width, this._height);
                    }
                }
            }
			this.invalidateLayout();
			trace("resized: " + this._width + ", " + this._height);
		} else {
			this.invalidateLayout();
		}
	},
	_createRootElement: function (dom) {
        if (dom) {
            var elt = new RootElement(dom, "root", this);
            this._container.appendChild(elt._dom);
            return elt;
        } else {
            return new RootElement(false, "root", this, this._defContext);
        }
	},
	$_validateChildren: function (element) {
		var elts = element._elements;
		if (elts) {
			for (var i = elts.length; i--;) {
				var elt = elts[i];
				elt._dirty = elt._nodraw = false;
				this.$_validateChildren(elt);
			}
		}
	},
	_doLayout: function (r) {
	},
    _doPrepareRender: function (r) {
    },
	_beforeRender: function (bounds) {
	},
	_doRender: function (bounds) {
		this._doDrawContainer(this._defContext._graphics, bounds);
        if (this._defContext._dirty) {
            this._drawElement(this._rootElement, null, this._invalidated);
        }
        if (this._contexts) {
            for (var i = 0, cnt = this._contexts.length; i < cnt; i++) {
                if (this._contexts[i]._dirty) {
                    this._drawElement(this._rootElement, this._contexts[i], true);
                }
            }
        }
		this.$_validateChildren(this._rootElement);
	},
    _doRenderHtml: function (bounds) {
        this._doDrawContainerHtml(bounds);
        this._drawElementHtml(this._rootElement);
        this.$_validateChildren(this._rootElement);
    },
	_doDrawContainer: function (g, bounds) {
	},
    _doDrawContainerHtml: function (g, bounds) {
    },
	_drawElement: function (element, context, force) {
        if (element._nodraw) return;
        var i, cnt, elt;
        if (element._dom) {
            element.draw();
            for (i = 0, cnt = element.childCount(); i < cnt; i++) {
                elt = element.getChild(i);
                if (elt.isVisible()) {
                    this._drawElement(elt);
                }
            }
        } else {
            var g = context ? context._graphics : this._defContext._graphics;
            g.save();
            g.translate(element.x(), element.y());
            if (element._mask) {
                if (element._mask instanceof VisualElement) {
                    element._mask._doDraw(g);
                    g.clip();
                } else if (element._mask instanceof Rectangle) {
                    g.clipRect(element._mask);
                }
            } else {
                element.clip(g);
            }
            g.setAlpha(element._alpha);
            if (element._context == context && (force || element._dirty)) {
                var cache = element._cache;
                if (cache) {
                    element.drawCache(g, cache);
                } else {
                    element._graphics = g;
                    element.draw(g, !this._invalidated);
                }
            }
            var elts = element._elements;
            if (elts) {
                for (i = 0, cnt = elts.length; i < cnt; i++) {
                    elt = elts[i];
                    if (elt._visible) {
                        this._drawElement(elt, context, force);
                    }
                }
            }
            g.restore();
        }
	},
    _drawElementHtml: function (element) {
        element.draw();
        for (var i = 0, cnt = element.childCount(); i < cnt; i++) {
            var elt = element.getChild(i);
            if (elt.isVisible()) {
                this._drawElementHtml(elt);
            }
        }
    },
	$$_render: function (timestamp, scrollRect, scrollX, scrollY) {
		var t = _getTimer();
		var w = this._width;
		var h = this._height;
        var i;
		this._layoutChildren(new Rectangle(0, 0, w, h));
		if ($_debug) {
			trace("rendering[" + ++this._rendered + "] at " + timestamp);
			t = getTimer();
		}
		if (this._layoutNeeded) {
			this._layoutNeeded = false;
			this._doLayout(new Rectangle(0, 0, w, h));
			if ($_debug) {
				t = _getTimer() - t;
				_trace("layouted in [" + t + "]");
			}
		} else {
            this._doPrepareRender(new Rectangle(0, 0, w, h));
        }
		if ($_debug) {
			t = _getTimer();
		}
		if (this._invalidated) {
			this._defContext._dirty = true;
			if (this._contexts) {
				for (var i = 0, cnt = this._contexts.length; i < cnt; i++) {
					this._contexts[i]._dirty = true;
				}
			}
		}
		this._defContext.prepare(scrollRect, scrollX, scrollY, this._invalidated);
		if (this._contexts) {
			for (i = 0; i < this._contexts.length; i++) {
				this._contexts[i].prepare(null, 0, 0, this._contexts[i]._dirty);
			}
		}
		try {
			$_validated = 0;
			var r = new Rectangle(0, 0, w, h);
			this._beforeRender(r);
			this._doRender(r);
			this._ctx.clearRect(0, 0, w, h);
			if (w > 0 && h > 0) {
				w *= this._deviceScale;
				h *= this._deviceScale;
				this._ctx.clearRect(0, 0, w, h);
				this._ctx.drawImage(this._defContext._canvas, 0, 0, w, h, 0, 0, w, h);
				if (this._contexts) {
					for (i = 0; i < this._contexts.length; i++) {
						this._ctx.drawImage(this._contexts[i]._canvas, 0, 0, w, h, 0, 0, w, h);
					}
				}
			}
		} finally {
			if (this._contexts) {
				for (i = 0; i < this._contexts.length; i++) {
					this._contexts[i].restore();
				}
			}
			this._defContext.restore();
		}
		if ($_debug) {
			t = _getTimer() - t;
			_trace("rendered elements2[" + $_validated + "] in [" + t + "]");
		}
		for (var i = 0, cnt = this._children.length; i < cnt; i++) {
			var c = this._children[i];
			if (c._visible && c._width > 0 && c._height > 0) {
				c.resize();
				c.layoutContent();
				if (c._dirty) {
					c.draw();
				}
				this._ctx.drawImage(c._canvas, 0, 0, c._width, c._height, c._x, c._y, c._width, c._height);
			}
		}
	},
    $$_renderHtml: function (timestamp, scrollRect, scrollX, scrollY) {
        var t = getTimer();
        var i;
        var w = this._width;
        var h = this._height;
        this._layoutChildren(new Rectangle(0, 0, w, h));
        this._drawing = true;
        try {
            if ($_debug) {
                trace("rendering[" + ++this._rendered + "] at " + timestamp);
                t = getTimer();
            }
            if (this._layoutNeeded) {
                this._layoutNeeded = false;
                trace("layout...");
                this._doLayout(new Rectangle(0, 0, w, h));
                if ($_debug) {
                    t = getTimer() - t;
                    trace("layouted at [" + t + "]");
                }
            }
            if ($_debug) {
                t = getTimer();
            }
            $_validated = 0;
            this._doRenderHtml(new Rectangle(0, 0, w, h));
            if ($_debug) {
                t = getTimer() - t;
                trace("rendered elements2[" + $_validated + "] at [" + t + "]");
            }
        } finally {
            this._drawing = false;
        }
        /*
         for (var i = 0, cnt = this._children.length; i < cnt; i++) {
         var c = this._children[i];
         if (c._visible && c._width > 0 && c._height > 0) {
         c.resize();
         c.layoutContent();
         if (c._dirty) {
         c.draw();
         }
         this._ctx.drawImage(c._canvas, 0, 0, c._width, c._height, c._x, c._y, c._width, c._height);
         }
         }
         */
    },
	_resizeHandler: function (event) {
		this.resetSize();
	}
});
var VisualContainer$ = VisualContainer.prototype;
var VisualElement = defineClass("VisualElement", EventAware, {
	init: function (dom, name) {
		this._super();
        this._name = name;
        this._parent = null;
        this._elements = null;
        this._dirty = false;
        this._mouseEnabled = true;
        this._hovered = false;
        this._mask = null;
        this._nodraw = false;
        if (dom) {
            this._dom = document.createElement("div");
            this._dom.$_owner = this;
            this._css = this._dom.style;
            this._css.position = "absolute";
            this._css.padding = "0px";
            this._css.margin = "0px";
			this._css["-webkit-print-color-adjust"] = "exact"; // for chrome printing
        } else {
            this._context = null;
            this._graphics = null;
            this._drawings = new Drawings();
            this._cache = null;
        }
	},
	destroy: function() {
		var elt;
		this._destroying = true;
        this._context = null;
        this._graphics = null;
		this._drawings = null;
		if (this._elements && _isArray(this._elements)) {
			for (var cnt = this._elements.length; cnt--;) {
				elt =this.removeElementAt(cnt);
				elt && !elt.destroying && elt.destroy && elt.destroy();
			}
			elt = null;
		}
		this._name = null;
        this._elements = null;
        this._cache = null;
        this._mask = null;
		this._x = null;
		this._y = null;
		this._width = null;
		this._height = null;
		this._rotation = null;
		this._super();
	},
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	rotation: 0,
	visible: true,
	alpha: 1,
	renderCallback: null,
	right: function () {
		return this._x + this._width;
	},
	bottom: function () {
		return this._y + this._height;
	},
	setWidth: function (value) {
		value = Math.max(0, value);
		if (value != this._width) {
			this._width = value;
			this.invalidate();
		}
        return this;
	},
	setHeight: function (value) {
		value = Math.max(0, value);
		if (value != this._height) {
			this._height = value;
			this.invalidate();
		}
        return this;
	},
	setVisible: function (value) {
		if (value != this._visible) {
			this._visible = value;
			this.invalidate(true);
            if (this._dom) {
                this._css.display = value ? "block" : "none";
            } else {
            }
		}
        return this;
	},
	isCached: function () {
		return this._cache != null;
	},
	setCached: function (value) {
		if (value && !this._cache) {
			this._cache = new CanvasCache(_doc, this);
			this._cache.resize(this._width, this._height);
		} else if (!value && this._cache) {
			this._cache.dispose();
			this._cahce = null;
		}
	},
	isClickable: function () {
		return false;
	},
	name: function () {
		return this._name;
	},
	setName: function (value) {
		this._name = value;
	},
	container: function() {
		return this._parent && this._parent.container();
	},
	parent: function () {
		return this._parent;
	},
	childCount: function () {
		return this._elements ? this._elements.length : 0;
	},
	isSingleton: function () {
		return this._parent.childCount() == 1;
	},
	position: function () {
		return { x: this._x, y: this._y };
	},
	bounds: function() {
		return new Rectangle(this._x, this._y, this._width, this._height);
	},
	clientRect: function() {
		return new Rectangle(0, 0, this._width, this._height);
	},
	mouseX: function () {
		var container = this.container();
		if (container) {
			var x = container._currentX;
			var p = this;
			while (p && p !== UNDEFINED) {
				x -= p._x;
				p = p._parent;
			}
			return x;
		} else {
			return NaN;
		}
	},
	mouseY: function () {
		var container = this.container();
		if (container) {
			var y = container._currentY;
			var p = this;
			while (p && p !== UNDEFINED) {
				y -= p._y;
				p = p._parent;
			}
			return y;
		} else {
			return NaN;
		}
	},
	mask: function () {
		return this._mask;
	},
	setMask: function (value) {
		this._mask = value ? value.clone() : null;
	},
	isLayer: function () {
		return false;
	},
	setMouseEnabled: function (value) {
		this._mouseEnabled = value;
	},
    canHover: function () {
        return true;
    },
	isHovered: function () {
		return this._hovered;
	},
	setHovered: function (value) {
		if (value != this._hovered) {
			this._hovered = value;
			if (this._hoveredChanged) {
				this._hoveredChanged();
			}
		}
	},
	propertyChanged: function (prop, newValue) {
		this.invalidate();
	},
	getChildren: function () {
		return this._elements && this._elements.concat();
	},
	getChild: function (index) {
		return this._elements ? this._elements[index] : null;
	},
	getChildIndex: function (child) {
		return this._elements ? this._elements.indexOf(child) : -1;
	},
	contains: function (child) {
		return this._elements ? this._elements.indexOf(child) >= 0 : false;
	},
	addChild: function (child, context) {
		return this.insertChild(-1, child, context);
	},
	addElement: function (child, context) {
		return this.addChild(child, context);
	},
	addContextElement: function (child) {
		return this.addChild(child, this._context);
	},
	insertChild: function (index, child, context) {
		if (child instanceof VisualElement && !this.contains(child)) {
			if (!this._elements) {
				this._elements = [];
			}
			if (index < 0) {
                if (this._dom) {
                    this._dom.appendChild(child._dom);
                } else {
                    child._context = context;
                }
                this._elements.push(child);
            } else {
                if (this._dom) {
                    this._elements.length > index ? this._dom.insertBefore(child._dom, this._elements[index]._dom) : this._dom.appendChild(child._dom);
                } else {
                    child._context = context;
                }
                this._elements.splice(index, 0, child);
            }
			child._parent = this;
			child.$_attached(this);
		}
		return child;
	},
	insertElement: function (index, child, context) {
		return this.insertChild(index, child, context);
	},
	removeChild: function (child) {
		if (child && this._elements) {
			var i = this._elements.indexOf(child);
			if (i >= 0) {
				return this.removeChildAt(i);
			}
		}
		return null;
	},
	removeElement: function (child) {
		return this.removeChild(child);
	},
	removeChildAt: function (index) {
		if (index >= 0 && index < this.childCount()) {
			var child = this._elements[index]; 
			this._elements.splice(index, 1);
            if (this._dom && child._dom) {
                this._dom.removeChild(child._dom);
            } else {
                child._context = null;
            }
			child._parent = null;
            child._dirty = false;
			child.$_detached(this);
			return child;
		}
		return null;
	},
	removeElementAt: function (index) {
		return this.removeChildAt(index);
	},
	clear: function () {
		var i,
			elts = this._elements,
			cnt = elts ? elts.length : 0;
		if (cnt > 0) {
			for (i = 0; i < cnt; i++) {
				elts[i]._parent = null;
				elts[i].$_detached(this);
			}
			this._elements = [];
            if (this._dom) {
                while (this._dom.lastChild) {
                    this._dom.removeChild(this._dom.lastChild);
                }
            }
			this.invalidate();
		}
	},
	hideAll: function () {
		var i,
			elts = this._elements,
			cnt = elts ? elts.length : 0;
        if (this._dom) {
            for (i = 0; i < cnt; i++) {
                elts[i].setVisible(false);
            }
        } else {
            for (i = 0; i < cnt; i++) {
                elts[i]._visible = false;
            }
        }
	},
	setTool: function (tool) {
        var i;
		var elts = this._elements;
		var cnt = elts ? elts.length : 0;
		if (tool) {
			this.$_tool = true;
			for (i = 0; i < cnt; i++) {
				elts[i].setTool(true);
			}
		} else if (this.$_tool) {
			this.$_tool = false;
			for (i = 0; i < cnt; i++) {
				elts[i].setTool(false);
			}
		}
	},
	invalidate: function (force, invalidteChildren) {
		if (force || !this._dirty) {
			var container = this.container();
			if (container) {
				container.invalidateElement(this);
				this._dirty = true;
			}
		}
		if (invalidteChildren) {
			var elts = this._elements;
            if (elts) {
                for (var i = elts.length; i--;) {
                    elts[i].invalidate(force, true);
                }
            }
		}
	},
	validate: function () {
		if (this._dirty) {
			this._dirty = false;
			var container = this.container();
			if (container) {
				container.validateElement(this);
			}
		}
	},
	invalidateLayout: function () {
		var container = this.container();
		if (container) {
			container.invalidateLayout();
		}
	},
	clip: function (g) {
	},
	getBounds: function(r) {
		if (!r) {
			return new Rectangle(this._x, this._y, this._width, this._height);
		} else {
			return r.set(this._x, this._y, this._width, this._height);
		}
	},
	getClientRect: function(r) {
		if (!r) {
			return new Rectangle(0, 0, this._width, this._height);
		} else {
			return r.set(0, 0, this._width, this._height);
		}
	},
	containsInBounds: function (x, y) {
		return (x >= this._x && x < this._x + this._width && y >= this._y && y < this._y + this._height);
	},
	containsInClient: function (x, y) {
		return (x >= 0 && x < this._width && y >= 0 && y < this._height);
	},
	parentToElement: function (parent, x, y) {
		var p = this;
		while (p && p != parent) {
			x -= p._x;
			y -= p._y;
			p = p._parent;
		}
		return { x: x, y: y };
	},
	translateBy: function (descendant, r) {
		var p = descendant;
		if (!r) {
			r = new Rectangle(0, 0, this._width, this._height);
		}
		while (p && p !== this) {
			r.x -= p._x;
			r.y -= p._y;
			p = p._parent;
		}
		return r;
	},
    topBy: function (parent, top) {
        var y = this._y + top;
        var p = this._parent;
        while (p && p !== parent) {
            y += p._y;
            p = p._parent;
        }
        return y;
    },
	boundsBy: function (parent, r) {
		var x = this._x;
		var y = this._y;
		var p = this._parent;
		if (r) {
			x += r.x;
			y += r.y;
		}
		while (p && p !== parent) {
			x += p._x;
			y += p._y;
			p = p._parent;
		}
		return r ? new Rectangle(x, y, r.width, r.height) : new Rectangle(x, y, this._width, this._height);
	},
	boundsByContainer: function (r) {
		var x = this._x;
		var y = this._y;
		if (r) {
			x += r.x;
			y += r.y;
		}
		var p = this._parent;
		while (p && p._x !== UNDEFINED) {
			x += p._x;
			y += p._y;
			p = p._parent;
		}
		return r ? new Rectangle(x, y, r.width, r.height) : new Rectangle(x, y, this._width, this._height);
	},
	boundsByScreen: function (r) {
		r = this.boundsByContainer(r);
		r = this.container().toScreen(r);
		return r;
	},
	containerToElement: function (x, y) {
		var p = this;
		while (p) {
			x -= p._x;
			y -= p._y;
			p = p._parent;
		}
		return { x: x, y: y };
	},
	move: function (x, y) {
		this.setX(x);
		this.setY(y);
	},
	resize: function (width, height) {
		this.setWidth(width);
		this.setHeight(height);
	},
	setSize: function (width, height) {
		this.setWidth(width);
		this.setHeight(height);
	},
	setPosition: function (x, y) {
		this.setX(x);
		this.setY(y);
	},
	setBounds: function (x, y, width, height) {
		this.setX(x);
		this.setY(y);
		this.setWidth(width);
		this.setHeight(height);
	},
	setBoundsI: function (x, y, width, height) {
		/*
		this.setX(x >>> 0);
		this.setY(y >>> 0);
		this.setWidth(width >>> 0);
		this.setHeight(height >>> 0);
		*/
		this.setX(x >> 0);
		this.setY(y >> 0);
		this.setWidth(width >> 0);
		this.setHeight(height >> 0);
	},
	setRect: function (r) {
		this.setX(r.x);
		this.setY(r.y);
		this.setWidth(r.width);
		this.setHeight(r.height);
	},
	setRectI: function (r) {
		this.setX(_floor(r.x));
		this.setY(_floor(r.y));
		this.setWidth(_floor(r.width));
		this.setHeight(_floor(r.height));
	},
	drawCache: function (g, cache) {
		if (this._dirty) {
			var cg = cache._graphics;
			this._dirty = false;
			this._graphics = cg;
			if (cache._element = this) {
				cache.resize(this._width, this._height);
				cache.prepare();
			} else {
				cg.save();
			}
			this._renderCallback ? this._renderCallback(cg) : this._doDraw(cg);
			cache.restore();
			$_validated++;
		}
		g.drawImage(cache._canvas, 0, 0, this._width, this._height, 0, 0, this._width, this._height);
	},
	draw: function (g, needOpaque) {
        if (this._dom) {
            if (this._dirty) {
                this._dirty = false;
                this._css.left = this._x + "px";
                this._css.top = this._y + "px";
                this._css.width = this._width + "px";
                this._css.height = this._height + "px";
                this._css.boxSizing = "border-box";
                this._doDrawHtml();
                $_validated++;
            }
        } else {
            this._dirty = false;
            this._renderCallback ? this._renderCallback(g) : this._doDraw(g, needOpaque);
            $_validated++;
        }
	},
	moveDom: function () {
		this._css.left = this._x + "px";
		this._css.top = this._y + "px";
		this._css.width = this._width + "px";
		this._css.height = this._height + "px";
		this._css.boxSizing = "border-box";
	},
	draw2: function (g) {
		if (this._dirty) {
			this._dirty = false;
			this._drawings.clear(g);
			this._renderCallback ? this._renderCallback(this._drawings) : this._doDraw(this._drawings);
			$_validated++;
		} 
		this._drawings._render();
	},
	hitTest: function (x, y) {
		return x >= 0 && x < this._width && y >= 0 && y < this._height;
	},
	containerToLocal: function (pt) {
		var x = pt.x;
		var y = pt.y;
		var p = this;
		while (p) {
			x -= p._x;
			y -= p._y;
			p = p._parent;
		}
		return { x: x, y: y };
	},
	localToContainer: function (pt) {
		var x = pt.x;
		var y = pt.y;
		var p = this;
		while (p) {
			x += p._x;
			y += p._y;
			p = p._parent;
		}
		return { x: x, y: y };
	},
	findChildAt: function (x, y, hitTesting) {
		var i, elt, child, cx, cy;
		var elts = this._elements;
		var cnt = elts ? elts.length : 0;
		if (cnt > 0) {
			for (i = cnt - 1; i >= 0; i--) {
				elt = elts[i];
				if (elt.isVisible()) {
					cx = x - elt._x; 
					cy = y - elt._y;
					if (hitTesting || elt._mouseEnabled) {
						if (elt.isLayer() || elt.hitTest(cx, cy)) {
							child = elt.findChildAt(cx, cy, hitTesting);
							if (child) { 
								return child;
							}
							if (!elt.isLayer() && elt._mouseEnabled) {
								return elt;
							}
						}
					}
				}
			}
		}
		return null;
	},
	$_attached: function (parent) {
		this._doAttached(parent);
	},
	_doAttached: function (parent) {
	},
	$_detached: function (parent) {
		this._doDetached(parent);
	},
	/*
	_setContexted: function () {
		this._contexted = true;
	},
	*/
	_doDetached: function (parent) {
	},
	_doDraw: function (g, needOpaque) {
	},
    _doDrawHtml: function () {
    },
	_hoveredChanged: function () {
	},
    $_prepareSpan: function () {
        if (!this._span) {
            this._span = document.createElement("span");
            this._span.style.position = "absolute";
            this._dom.appendChild(this._span);
        }
        return this._span;
    },
    $_setCssFill: function (fill) {
        if (_norgba) {
            if (fill) {
                fill.applyToCss(this._css);
            } else {
                this._css.background = ""
                this._css.filter = "";
            }
        } else {
            if (fill instanceof LinearGradient) {
                fill.applyToCss(this._css);
            } else {
                this._css.background = fill ? fill.css() : "";
                this._css.filter = "";
            }
        }
    }
}, {
    addChild: function (parent, child) {
        parent.addChild(child);
    }
	/*
	addChild: function (parent, child, context) {
		if (child instanceof VisualElement && !parent.contains(child)) {
			if (!parent._elements) {
				parent._elements = [];
			}
			parent._elements.push(child);
			child._parent = parent;
			child._context = context;
			if (child._contexted) {
				VisualElement.$_setContexted(child);
			}
			child.$_attached(this);
		}
		return child;
	},
	$_setContexted: function (element) {
		var elts = element._elements;
		if (elts) {
			for (var i = elts.length; i--;) {
				elts[i]._context = element._context;
				VisualElement.$_setContexted(elts[i]);
			}
		}
	}
	*/
});
var VisualElement$ = VisualElement.prototype;
var RootElement = defineClass("RootElement", VisualElement, {
	init: function (dom, name, container, context) {
		this._super(dom, name);
		this._container = container;
		this._context = context;
	},
	container: function () {
		return this._container;
	}
});
var MaskElement = defineClass("MaskElement", VisualElement, {
	init: function (name, target, render) {
		this._super(false, name);
		this._target = target;
		this._render = render;
	},
	_doDraw: function (g) {
		if (this._render) {
			this._render(g, this._target);
		}
	}
});
var LayerElement = defineClass("LayerElement", VisualElement, {
	init: function (dom, name, clip) {
		this._super(dom, name);
        if (dom) {
            this._dom.style.pointerEvents = "none";
        } else {
            this._clip = clip;
            this._drawRect = null;
        }
	},
	destroy: function() {
		this._destroying = true;
		this._drawRect = null;
		this._super();
	},
	isLayer: function () {
		return true;
	},
	clip: function (g) {
		if (this._clip) {
			var r = this._drawRect = this._drawRect || new Rectangle();
			this.getClientRect(r);
			g.clipRect(r);
		}
	}
});