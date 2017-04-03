var TextAlign = _enum( {
	LEFT : "left",
	CENTER : "center",
	RIGHT : "right"
});
var TextLayout = _enum( {
	TOP : "top",
	MIDDLE : "middle",
	BOTTOM : "bottom"
});
var TextWrap = _enum( {
	NONE : "none",
	NORMAL : "normal"
});
var ChartItemShapes = _enum({
	CIRCLE: "circle",
	TRIANGLE: "triangle",
	SQUARE: "square",
	DIAMOND: "diamond"
});
var ContentVisibility = _enum({
	VISIBLE: "visible",
	HIDDEN: "hidden",
	COLLAPSED: "collapsed"
});
var LabelPosition = _enum({
	DEFAULT: "default",
	FAR: "far",
	MID: "mid",
	NEAR: "near"
});
var ContentOrientation = _enum({
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
});
var HorizontalAlign = _enum({
	DEFAULT: "default",
	LEFT: "left",
	CENTER: "center",
	RIGHT: "right",
	FILL: "fill"
});
var VerticalAlign = _enum({
	DEFAULT: "default",
	TOP: "top",
	MIDDLE: "middle",
	BOTTOM: "bottom",
	FILL: "fill"
});
var OverflowPolicy = _enum({
	NONE: "none",
	JUSTIFY: "justify"
});
var Rectangle = function(x, y, width, height) {
	if (typeof x === "undefined" || x === null) {
		this.x = this.y = this.width = this.height = 0;
	} else {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
};
Rectangle.prototype = {
	constructor: Rectangle,
	clone: function() {
		return new Rectangle(this.x, this.y, this.width, this.height);
	},
	getInner: function () {
		return new Rectangle(0, 0, this.width, this.height);
	},
	equals: function(r) {
		return r === this
			|| r && this.x === r.x && this.y === r.y && this.width === r.width && this.height === r.height;
	},
	toString: function() {
		return "{x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + "}";
	},
	left: function () {
		return this.x;
	},
	setLeft: function (value) {
		var dx = value - this.x;
		this.x += dx;
		this.width -= dx;
	},
	leftBy: function(delta) {
		this.x += delta;
		this.width -= delta;
		return this;
	},
	right: function () {
		return this.x + this.width;
	},
	setRight: function (value) {
		var dx = value - (this.x + this.width);
		this.width += dx;
	},
	rightBy: function(delta) {
		this.width += delta;
		return this;
	},
	top: function () {
		return this.y;
	},
	setTop: function (value) {
		var dy = value - this.y;
		this.y += dy;
		this.height -= dy;
		return this;
	},
	topBy: function(delta) {
		this.y += delta;
		this.height -= delta;
		return this;
	},
	bottom: function () {
		return this.y + this.height;
	},
	setBottom: function (value) {
		var dy = value - (this.y + this.height);
		this.height += dy;
		return this;
	},
	bottomBy: function(delta) {
		this.height += delta;
		return this;
	},
	shrink: function (dx, dy) {
		this.width -= dx;
		this.height -= dy;
		return this;
	},
	expand: function (dx, dy) {
		this.width += dx;
		this.height += dy;
		return this;
	},
	contains: function(x, y) {
		return x >= this.x && x <= this.x + this.width
			&& y >= this.y && y <= this.y + this.height;
	},
	isEmpty: function() {
		return this.width === 0 || this.height === 0;
	},
	setEmpty: function() {
		this.width = this.height = 0;
		return this;
	},
	set: function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		return this;
	},
	copy: function (r) {
		this.x = r.x;
		this.y = r.y;
		this.width = r.width;
		this.height = r.height;
		return this;
	},
	copyHorz: function (r) {
		this.x = r.x;
		this.width = r.width;
		return this;
	},
	copyVert: function (r) {
		this.y = r.y;
		this.height = r.height;
		return this;
	},
	inflate: function(left, top, right, bottom) {
		top = arguments.length > 1 ? top : 0;
		right = arguments.length > 2 ? right : left;
		bottom = arguments.length > 3 ? bottom : top;
		if (left) this.setLeft(this.x - left);
		if (top) this.setTop(this.y - top);
		if (right) this.setRight(this.right() + right);
		if (bottom) this.setBottom(this.bottom() + bottom);
		return this;
	},
	offset: function (dx, dy) {
		this.x += dx;
		this.y += dy;
		return this;
	},
	round : function() {
		var r = this.clone();
		r.x >>>= 0;
		r.y >>>= 0;
		r.width >>>= 0;
		r.height >>>= 0;
		return r;
	},
	union: function (r) {
		var r2 = this.clone();
		r2.setLeft(Math.min(this.x, r.x));
		r2.setRight(Math.max(this.right(), r.right()));
		r2.setTop(Math.min(this.y, r.y));
		r2.setBottom(Math.max(this.bottom(), r.bottom()));
		return r2;
	},
	normalize: function () {
		if (this.width < 0) {
			this.x -= this.width;
			this.width *= -1;
		}
		if (this.height < 0) {
			this.y -= this.height;
			this.height *= -1;
		}
		return this;
	}
};
var Size = function (width, height) {
	if (arguments.length == 0) {
		this.width = this.height = 0;
	} else {
		this.width = width;
		this.height = height;
	}
};
Size.EMPTY = new Size();
Size.empty = function () {
	return new Size();
};
Size.create = function (w, h) {
	return new Size(w, h);
};
Size.prototype = {
	constructor: Size,
	clone: function() {
		return new Size(this.width, this.height);
	},
	equals: function(sz) {
		return sz === this
			|| sz && this.width === sz.width && this.height === sz.height;
	},
	toString: function() {
		return "{width: " + this.width + ", height: " + this.height + "}";
	},
	isEmpty: function() {
		return this.width === 0 || this.height === 0;
	},
	setEmpty: function() {
		this.width = this.height = 0;
		return this;
	},
	set: function(width, height) {
		this.width = width;
		this.height = height;
		return this;
	},
	round : function() {
		var sz = this.clone();
		sz.width >>>= 0;
		sz.height >>>= 0;
		return sz;
	}
};
var Point = function (x, y) {
	if (arguments.length == 0) {
		this.x = this.y = 0;
	} else {
		this.x = x;
		this.y = y;
	}
};
Point.EMPTY = new Point();
Point.empty = function () {
	return new Point();
};
Point.create = function (w, h) {
	return new Point(w, h);
};
Point.prototype = {
	constructor: Size,
	clone: function() {
		return new Point(this.x, this.y);
	},
	equals: function(pt) {
		return pt === this
			|| pt && this.width === pt.width && this.height === pt.height;
	},
	toString: function() {
		return "{x: " + this.x + ", y: " + this.y + "}";
	},
	isEmpty: function() {
		return this.x === 0 || this.y === 0;
	},
	setEmpty: function() {
		this.x = this.y = 0;
		return this;
	},
	set: function(x, y) {
		this.x = x;
		this.y = y;
		return this;
	},
	round : function() {
		var pt = this.clone();
		pt.x >>>= 0;
		pt.y >>>= 0;
		return pt;
	}
};
var SideRectangles = function () {
	this.left = new Rectangle();
	this.right = new Rectangle();
	this.top = new Rectangle();
	this.bottom = new Rectangle();
};
SideRectangles.prototype = {
	constructor: SideRectangles,
	clear: function () {
		this.left.setEmpty();
		this.right.setEmpty();
		this.top.setEmpty();
		this.bottom.setEmpty();
	},
	setLeft: function (x, y, w, h) {
		this.left.set(x, y, w, h);
	},
	setRight: function (x, y, w, h) {
		this.right.set(x, y, w, h);
	},
	setTop: function (x, y, w, h) {
		this.top.set(x, y, w, h);
	},
	setBottom: function (x, y, w, h) {
		this.bottom.set(x, y, w, h);
	}
};
var RelativeSize = function (size, fixed) {
	this._size = size;
	this._fixed = fixed;
};
RelativeSize.prototype = {
	constructor: RelativeSize,
	clone: function () {
		return new RelativeSize(this._size, this._fixed);
	},
	getSize: function (targetSize) {
		return this._fixed ? this._size : targetSize * this._size;
	}
};
RelativeSize.Empty = new RelativeSize(0, false);
RelativeSize.createFrom = function (value) {
	var v = 0;
	var f = false;
	if (value) {
		var s = String(value).trim();
		var len = s.length;
		if (len > 0) {
			if (len > 2 && s.lastIndexOf("px") == len - 2) {
				f = true;
				s = s.substr(0, len - 3);
			}
			if (s) {
				v = parseFloat(s);	
			}
		}
	}
	return new RelativeSize(v, f);
};
RelativeSize.equals = function (v1, v2) {
	return v1 instanceof RelativeSize && v2 instanceof RelativeSize && v1._size === v2.size && v1._precentage === v2._precentage;
};
var PercentSize = function (size, fixed) {
	this._size = size;
	this._fixed = fixed;
};
PercentSize.prototype = {
	constructor: PercentSize,
	clone: function () {
		return new PercentSize(this._size, this._fixed);
	},
	getSize: function (orgSize, denominator) {
		return this._fixed ? this._size : orgSize * this._size / (denominator || 100.0);
	}
};
PercentSize.Empty = new PercentSize(0, true);
PercentSize.createFrom = function (value) {
	var v = 0;
	var f = true;
	if (value) {
		var s = String(value).trim();
		var len = s.length;
		if (len > 0) {
			if (len > 1 && s.lastIndexOf("%") == len - 1) {
				f = false;
				s = s.substr(0, len - 1).trim();
			}
			if (s) {
				v = parseFloat(s);	
			}
		}
	}
	return new PercentSize(v, f);
};
PercentSize.equals = function (v1, v2) {
	return v1 instanceof PercentSize && v2 instanceof PercentSize && v1._size === v2.size && v1._precentage === v2._precentage;
};
var SizeF = function (width, height) {
	this.width = width;
	this.height = height;
};
SizeF.prototype = {
	constructor: SizeF,
	clone: function () {
		return new SizeF(this.width, this.height);
	},
	set: function (width, height) {
		this.width = parseFloat(width);
		this.height = parseFloat(height);
	}
};
SizeF.createFrom = function (value) {
	var w = 0, h = 0;
	if (value) {
		var arr = String(value).split(",");
		if (arr.length > 0 ) {
			w = h = parseFloat(arr[0]);
		}
		if (arr.length > 1) {
			h = parseFloat(arr[1]);
		}
	}
	return new SizeF(w, h);
};