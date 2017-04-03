var ScrollEventType = {
	LINE_UP: "lineUp",
	LINE_DOWN: "lineDown",
	LINE_LEFT: "lineLeft",
	LINE_RIGHT: "lineRight",
	PAGE_UP: "pageUp",
	PAGE_DOWN: "pageDown",
	PAGE_LEFT: "pageLeft",
	PAGE_RIGHT: "pageRight",
	THUMB_TRACK: "thumbTrack",
	THUMB_END: "thumbEnd"
};
var ScrollBar = defineClass("ScrollBar", GridElement, {
	init: function (dom, vertical) {
		this._super(dom, "scrollBar");
		this._nearButton = new ScrollButton(dom, this, false);
		this.addElement(this._nearButton);
		this._farButton = new ScrollButton(dom, this, true);
		this.addElement(this._farButton);
		this._thumb = new ScrollThumb(dom, this);
		this.addElement(this._thumb);
		this._vertical = vertical;
		this._buttonSize = 20;
		this._min = 0;
		this._max = 0;
		this._pos = 0;
		this._page = 0;
		this._maxPosition = 0;
	},
	lineScrollSize: 1,
	pageScrollSize: 1,
	minThumbSize: 20,
	isVertical: function () {
		return this._vertical;
	},
	maxPosition: function () {
		return this._maxPosition;
	},
	setProperties: function (min, max, page) {
		min = Math.max(0, min);
		max = Math.max(min, max);
		if (min != this._min || max != this._max || page != this._page) {
			this._min = min;
			this._max = max;
			this._page = page;
			this._pos = Math.min(this._max, Math.max(this._min, this._pos));
			this._maxPosition = Math.max(0, this._max - this._page);
			this.invalidate();
		}
	},
	setPosition: function (value, layout) {
		value = Math.min(this._maxPosition, Math.max(this._min, value));
		if (value != this._pos) {
			this._pos = value;
			this.invalidate();
			layout && this._doLayoutContent();
		}
	},
	ptInTrack: function (x, y, isFar) {
		var p = this.containerToElement(x, y);
		if (this._vertical) {
			if (p.y >= this._nearButton.height() && p.x < this._farButton.y()) {
				return !isFar && p.y < this._thumb.y() || isFar && p.y >= this._thumb.bottom();
			}
		} else {
			if (x >= this._nearButton.width() && x < this._farButton.x()) {
				return !isFar && p.x < this._thumb.x() || isFar && p.x >= this._thumb.right();
			}
		}
		return false;
	},
	_doLayoutContent: function (lm) {
		var vertical = this._vertical;
		var szBtn = this._buttonSize;
		var szTrack = (vertical ? this._height : this._width) - szBtn * 2;
		var szThumb = Math.min(szTrack, Math.max(this._minThumbSize, _int(szTrack * this._page / (this._max - this._min + 1))));
		var pos = szBtn + Math.min(szTrack - szThumb, Math.max(0, _int((szTrack - szThumb) * this._pos / (this._maxPosition - this._min))));
		if (vertical) {
			this._nearButton.setBounds(0, 0, this._width, szBtn);
			this._farButton.setBounds(0, this._height - szBtn, this._width, szBtn);
			if (szThumb <= szTrack) {
				this._thumb.setBounds(1, pos, this._width - 2, szThumb);
			}
		} else {
			this._nearButton.setBounds(0, 0, szBtn, this._height);
			this._farButton.setBounds(this._width - szBtn, 0, szBtn, this._height);
			if (szThumb <= szTrack) {
				this._thumb.setBounds(pos, 1, szThumb, this._height - 2);
			}
		}
	},
	_doRender: function(g, r) {
		var fill = new SolidBrush("#fff0f0f0");
		g.drawRectI(fill, null, r);
		if (this._vertical) {
		} else {
		}
	},
	_doRenderHtml: function () {
		var fill = new SolidBrush("#fff0f0f0");
		_ieOld ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
	},
	_doScroll: function (eventType, delta, position) {
		this.fireEvent(ScrollBar.SCROLLED, eventType, delta, position);
	},
	_mouseOut: function () {
		this._nearButton.setPressed(false);
		this._farButton.setPressed(false);
		this._thumb.setPressed(false);
	}
});
ScrollBar.SCROLLED = "onScrollBarScrolled";
var ScrollButton = defineClass("ScrollButton", VisualElement, {
	init: function (dom, scrollBar, far) {
		this._super(dom);
		this._scrollBar = scrollBar;
		this._far = far;
		this._enabled = true;
	},
	pressed: false,
	enabled: true,
	isVertical: function () {
		return this._scrollBar._vertical;
	},
	isFar: function () {
		return this._far;
	},
	scrollBar: function () {
		return this._scrollBar;
	},
	_hoveredChanged: function () {
		this.invalidate();
	},
	_doDraw: function(g) {
		var r = this.getClientRect();
		var x = _int(r.width / 2);
		var y = _int(r.height / 2);
		var fill = this._pressed ? new SolidBrush("#ff808080") : this.isHovered() ? new SolidBrush("#ffd0c0d0") : new SolidBrush("#fff0f0f0");
		var s = this._pressed ? new SolidPen("#ffffffff") : new SolidPen("#ff333333");
		g.drawRectI(fill, null, r);
		if (this._scrollBar._vertical) {
			if (this._far) {
				g.drawVertLineI(s, y - 1, y + 3, x);
				g.drawHorzLineI(s, x - 3, x + 4, y - 1);
				g.drawHorzLineI(s, x - 2, x + 3, y);
				g.drawHorzLineI(s, x - 1, x + 2, y + 1);
			} else {
				g.drawVertLineI(s, y - 2, y + 1, x);
				g.drawHorzLineI(s, x - 3, x + 4, y + 1);
				g.drawHorzLineI(s, x - 2, x + 3, y);
				g.drawHorzLineI(s, x - 1, x + 2, y - 1);
			}
		} else {
			if (this._far) {
				g.drawHorzLineI(s, x - 1, x + 3, y);
				g.drawVertLineI(s, y - 3, y + 4, x - 1);
				g.drawVertLineI(s, y - 2, y + 3, x);
				g.drawVertLineI(s, y - 1, y + 2, x + 1);
			} else {
				g.drawHorzLineI(s, x - 2, x + 1, y);
				g.drawVertLineI(s, y - 3, y + 4, x + 1);
				g.drawVertLineI(s, y - 2, y + 3, x);
				g.drawVertLineI(s, y - 1, y + 2, x - 1);
			}
		}
	},
	_doDrawHtml: function () {
		var r = this.getClientRect();
		var x = _int(r.width / 2);
		var y = _int(r.height / 2);
		var fill = this._pressed ? new SolidBrush("#ff808080") : this.isHovered() ? new SolidBrush("#ffd0c0d0") : new SolidBrush("#fff0f0f0");
		_ieOld ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
	}
});
var ScrollThumb = defineClass("ScrollThumb", VisualElement, {
	init: function (dom, scrollBar) {
		this._scrollBar = scrollBar;
		this._super(dom);
	},
	pressed: false,
	scrollBar: function () {
		return this._scrollBar;
	},
	isVertical: function () {
		return this._scrollBar._vertical;
	},
	_hoveredChanged: function () {
		this.invalidate();
	},
	_doDraw: function(g) {
		var r = this.getClientRect();
		var fill = this._pressed ? new SolidBrush("#ff808080") : this.isHovered() ? new SolidBrush("#ffa0a0a0") : new SolidBrush("#ffc0c0c0");
		g.drawRectI(fill, null, r);
	},
	_doDrawHtml: function(g) {
		var r = this.getClientRect();
		var fill = this._pressed ? new SolidBrush("#ff808080") : this.isHovered() ? new SolidBrush("#ffa0a0a0") : new SolidBrush("#ffc0c0c0");
		_ieOld ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
	}
});
var ScrollThumbRequest = defineClass("ScrollThumbRequest", GridEditRequest, {
	init: function (thumb) {
		this._super();
		this._thumb = thumb;
	},
	thumb: function () {
		return this._thumb;
	},
	scrollBar: function () {
		return this._thumb.scrollBar();
	},
	cursor: function () {
		return Cursor.ARROW;
	},
	isSelectable: function () {
		return false;
	}
});
var ScrollThumbTracker = defineClass("ScrollThumbTracker", GridDragTracker, {
	init: function (request, x, y) {
		this._super(request.scrollBar().grid(), "scrollThumbTracker");
		this._request = request;
		this._thumb = request.thumb();
		this._scrollBar = request.scrollBar();
		this._vertical = this._scrollBar.isVertical();
		var p = this._scrollBar.containerToElement(x, y);
		if (this._scrollBar.isVertical()) {
			this._offset = p.y - this._thumb.y();
		} else {
			this._offset = p.x - this._thumb.x();
		}
	},
	isStartWhenCreated: function () {
		return true;
	},
	_doStart: function (x, y) {
		this._thumb.setPressed(true);
		return true;
	},
	_doDrag: function (x, y) {
		return this.$_doScroll(x, y, ScrollEventType.THUMB_TRACK);
	},
	_doCompleted: function (x, y) {
		return this.$_doScroll(x, y, ScrollEventType.THUMB_END);
	},
	_doCanceled: function (x, y) {
	},
	_doEnded: function () {
		this._thumb.setPressed(false);
	},
	$_doScroll: function (x, y, eventType) {
		var len = this._scrollBar._maxPosition - this._scrollBar._min + 1;
		var szBtn = this._scrollBar._buttonSize;
		var p = this._scrollBar.containerToElement(x, y);
		if (this._scrollBar.isVertical()) {
			var scrLen = this._scrollBar.height() - szBtn * 2 - this._thumb.height();
			if ( scrLen <= 0 ) {
				return;
			};
			p.y -= this._offset;
			p.y = (p.y - szBtn) * len / scrLen;
			this._scrollBar._doScroll(eventType, 0, _int(p.y));
		} else {
			var scrLen = this._scrollBar.width() - szBtn * 2 - this._thumb.width();
			if (scrLen <= 0) {
				return;
			}
			p.x -= this._offset;
			p.x = (p.x - szBtn) * len / scrLen;
			this._scrollBar._doScroll(eventType, 0, _int(p.x));
		}
		return true;
	}
});
var ScrollButtonTimer = defineClass("ScrollButtonTimer", EventAware, {
	init: function (button) {
		this._super();
		this._button = button;
		this._scrollBar = button.scrollBar();
		this._active = false;
		this._timer = UNDEFINED;
		this._ready = false;
	},
	start: function () {
		this._button.setPressed(true);
		this._active = true;
		this.$_fireEvent();
		setTimeout( function () {
			if (this._ready) {
				this._ready = false;
				this._timer = setInterval(function () {
					if (this._active) {
						this.$_fireEvent();
					}
				}.bind(this), 50);
			}
		}.bind(this), 200);
		this._ready = true;
	},
	move: function (x, y) {
		var p = this._button.containerToElement(x, y);
		this._active = this._button.containsInClient(p.x, p.y);
	},
	stop: function (x, y) {
		this._ready = false; // 위 setTimeout callback이 실행되기 전에 stop()이 호출되면 무시해야 한다.
		if (this._timer) {
			clearInterval(this._timer);
		}
		this._button.setPressed(false);
	},
	$_fireEvent: function () {
		var type = null;
		var delta = 1;
		if (this._scrollBar.isVertical()) {
			if (this._button.isFar()) {
				type = ScrollEventType.LINE_DOWN;
			} else {
				type = ScrollEventType.LINE_UP;
				delta = -1;
			}
		} else {
			if (this._button.isFar()) {
				type = ScrollEventType.LINE_RIGHT;
			} else {
				type = ScrollEventType.LINE_LEFT;
				delta = -1;
			}
		}
		this._scrollBar._doScroll(type, this._scrollBar.lineScrollSize() * delta, 0);
	}
});
var ScrollTrackTimer = defineClass("ScrollTrackTimer", EventAware, {
	init: function (bar, isFar) {
		this._super(bar);
		this._scrollBar = bar;
		this._isFar = isFar;
		this._active = false;
		this._timer = UNDEFINED;
		this._ready = false;
	},
	start: function () {
		this._active = true;
		this.$_fireEvent();
		setTimeout( function () {
			if (this._ready) {
				this._ready = false;
				this._timer = setInterval(function () {
					if (this._active) {
						this.$_fireEvent();
					}
				}.bind(this), 50);
			}
		}.bind(this), 200);
		this._ready = true;
	},
	move: function (x, y) {
		var p = this._scrollBar.containerToElement(x, y);
		this._active = this._scrollBar.ptInTrack(p.x, p.y, this._isFar);
	},
	stop: function (x, y) {
		this._ready = false;
		if (this._timer) {
			clearInterval(this._timer);
		}
	},
	$_fireEvent: function () {
		var type = null;
		var delta = 0;
		var thumb = this._scrollBar._thumb;
		if (this._scrollBar.isVertical()) {
			var y = this._scrollBar.mouseY();
			if (this._isFar && y > thumb.bottom()) {
				type = ScrollEventType.PAGE_DOWN;
				delta = 1;
			} else if (y < thumb.y()) {
				type = ScrollEventType.PAGE_UP;
				delta = -1;
			}
		} else {
			var x = this._scrollBar.mouseX();
			if (this._isFar && x > thumb.right()) {
				delta = 1;
				type = ScrollEventType.PAGE_RIGHT;
			} else if (x < thumb.x()) {
				type = ScrollEventType.PAGE_LEFT;
				delta = -1;
			}
		}
		delta != 0 && this._scrollBar._doScroll(type, this._scrollBar.pageScrollSize() * delta, 0);
	}
});
