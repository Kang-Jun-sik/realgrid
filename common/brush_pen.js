var SolidBrush = function (color) {
	this._color = color instanceof Color ? color : new Color(color);
};
SolidBrush.prototype.color = function () {
	return this._color;
};
SolidBrush.prototype.applyTo = function (g, x, y, w, h) {
	g.setFill(this._color.value());
	return true;
};
SolidBrush.prototype.toText = function () {
	return this._color.toString();
};
SolidBrush.prototype.toColorText = function () {
	return this._color.toColorString();
};
SolidBrush.prototype.css = _norgba ? function () {
	return this._color.toColorString();
} : function () {
	return this._color.value();
};
SolidBrush.prototype.applyToCss = function (css) {
	if (this._color._a < 1) {
		var c = this._color.toString();
		c = "progid:DXImageTransform.Microsoft.gradient(startColorstr=" + c + ",endColorstr=" + c + ")";
		css.filter = c;
		css.background = "";
	} else {
		css.filter = "";
		css.background = this._color.toColorString();
	}
};
SolidBrush.WHITE = new SolidBrush(Colors.white);
SolidBrush.BLACK = new SolidBrush(Colors.black);
SolidBrush.GRAY = new SolidBrush(Colors.gray);
SolidBrush.DKGRAY = new SolidBrush(Colors.dimGray);
SolidBrush.LTGRAY = new SolidBrush(Colors.ltGray);
SolidBrush.RED = new SolidBrush(Colors.red);
SolidBrush.YELLOW = new SolidBrush(Colors.yellow);
SolidBrush.GREEN = new SolidBrush(Colors.green);
SolidBrush.BLUE = new SolidBrush(Colors.blue);
SolidBrush.NULL = {
	applyTo: function (g, x, y, w, h) {
		g.setFill("rgba(0, 0, 0, 0)");
		return true;
	}
};
SolidBrush.Null = SolidBrush.NULL;
SolidBrush.areEqual = function (b1, b2)	 {
	return b1 && b2 && Color.areEqual(b1._color, b2._color);
};
var FillGradient = defineClass(null, null, {
	init: function (source) {
		this._super();
		var s = source ? source.trim().toLowerCase() : null;
		this.parse(s);
	},
	parse: function (source) {
	}
});
FillGradient.createFrom = function (value) {
	if (value) {
		var s = value.trim().toLowerCase();
		if (s.indexOf("linear") == 0) {
			return new LinearGradient(s);
		} else if (s.indexOf("radial") == 0) {
			return new RadialGradient(s);
		} else if (s.indexOf("glass") == 0) {
			return new GlassGradient(s);
		}
	}
	return null;
};
var LinearGradient = defineClass(null, FillGradient, {
	init: function (source) {
		this._super(source);
		this._context = null;
	},
	parse: function (source) {
		this._colors = [];
		this._ratios = [];
		this._angle = 0;
		if (source) {
			var arr = Color.getColorCsvArray(source);
			var cnt = arr.length;
			if (cnt < 2 || arr[0] != "linear") {
				if ($_debug) debugger;
				throw "Invalid linear gradient text";
			}
			var i = 1;
			while (i < cnt) {
				var s = String(arr[i]);
				var color = Color.createFrom(s);
				if (color) {
					this._colors[i - 1] = color;
				} else {
					break;
				}
				i++;
			}
			if (i < cnt) {
				this._angle = parseFloat(arr[i]);
			}
			if (this._colors.length == 1) {
				this._colors[1] = this._colors[0].clone();
			}
			cnt = this._colors.length;
			var inc = 0xff / (cnt - 1);
			var r = 0;
			this._ratios = [0];
			for (i = 1; i < cnt - 1; i++) {
				r += inc;
				this._ratios.push(r / 255.0);
			}
			this._ratios.push(1);
		}
	},
	clone: function () {
		var gradient = new LinearGradient(null);
		gradient._colors = this._colors.slice();
		gradient._ratios = this._ratios.slice();
		gradient._angle = this._angle;
		return gradient;	
	},
	prepare: function (styles) {
		this._context = styles;
	},
	applyTo: function (g, x, y, w, h) {
		var gradient;
		switch (this._angle) {
		case 90:
			gradient = g.createLinearGradient(x, y, x, y + h);
			break;
		case 45:
			gradient = g.createLinearGradient(x, y, x + w, y + h);
			break;
		default:
			gradient = g.createLinearGradient(x, y, x + w, y);
		}
		for (var i = 0, cnt = this._colors.length; i < cnt; i++) {
			var v = this._colors[i].value();
			gradient.addColorStop(this._ratios[i], v);
		}
		g.setFill(gradient);
		return true;
	},
	applyToEx: function (g, alpha, brightness, x, y, w, h) {
		var gradient;
		switch (this._angle) {
		case 90:
			gradient = g.createLinearGradient(x, y, x, y + h);
			break;
		case 45:
			gradient = g.createLinearGradient(x, y, x + w, y + h);
			break;
		default:
			gradient = g.createLinearGradient(x, y, x + w, y);
		}
		for (var i = 0, cnt = this._colors.length; i < cnt; i++) {
			var v = this._context.getColorValue(this._colors[i], alpha, brightness);
			gradient.addColorStop(this._ratios[i], v);
		}
		g.setFill(gradient);
		return true;
	},
	toText: function () {
		var s = "linear";
		for (var i = 0, cnt = this._colors.length; i < cnt; i++) {
			s += "," + this._colors[i].toString();
		}
		return s + "," + this._angle;
	},
	css: _norgba ? function () {
		return this._colors[0].toColorString();
	} : function () {
		var deg;
		switch (this._angle) {
		case 90:
			deg = 180;
			break;
		case 45:
			deg = 135;
			break;
		default:
			deg = 90;
		}

		var s = "linear-gradient(" + deg +"deg" + "," + this._colors[0].value() + "," + this._colors[1].value() + ")";
		return s;
	},
	applyToCss: function (css) {
		var c1 = this._colors[0].toString();
		var c2 = this._colors[1].toString();
		var c = "progid:DXImageTransform.Microsoft.gradient(startColorstr=" + c1 + ",endColorstr=" + c2 + ")";
		css.filter = c;
		css.background = "";
	}
});
LinearGradient.areEqual = function (g1, g2) {
	var v = g1 && g2;
	if (v) {
		v = g1._colors.length == g2._colors.length;
		if (v) {
			for (var i = 0; i < g1._colors.length; i++) {
				v = Color.areEqual(g1._colors[i], g2._colors[i]);
				if (!v) break;
			}
		}
		if (v) {
			v = g1._ratios.length == g2._ratios.length;
			if (v) {
				for (var i = 0; i < g1._ratios.length; i++) {
					if (g1._ratios[i] != g2._ratios[i]) break;
				}
			}
			if (v) {
				v = g1._angle == g2._angle;
			}
		}
	}
	return v;
};
var RadialGradient = defineClass(null, FillGradient, {
	init: function (source) {
		this._super(source);
	},
	parse: function (source) {
		this._colors = [];
		this._ratios = [];
		if (source) {
			var arr = Color.getColorStringArray(source);
			var cnt = arr.length;
			if (cnt < 2 || arr[0] != "radial") {
				throw "Invalid radial gradient text";
			}
			var i = 1;
			while (i < cnt) {
				var s = String(arr[i]);
				var color = Color.createFrom(s);
				if (color) {
					this._colors[i - 1] = color;
				} else {
					break;
				}
				i++;
			}
			if (i < cnt) {
				this._angle = parseFloat(arr[i]);
			}
			if (this._colors.length == 1) {
				this._colors[1] = this._colors[0].clone();
			}
			cnt = this._colors.length;
			var inc = 0xff / (cnt - 1);
			var r = 0;
			this._ratios = [0];
			for (i = 1; i < cnt - 1; i++) {
				r += inc;
				this._ratios.push(r / 255.0);
			}
			this._ratios.push(1);
		}
	},
	clone: function () {
		var gradient = new RadialGradient(null);
		gradient._colors = this._colors.slice();
		gradient._ratios = this._ratios.slice();
		return gradient;	
	},
	prepare: function (styles) {
	},
	applyTo: function (g, x, y, w, h) {
		var gradient = g.createRadialGradient(x, y, x + w, y + h);
		for (var i = 0, cnt = this._colors.length; i < cnt; i++) {
			var v = this._colors[i].value();
			gradient.addColorStop(this._ratios[i], v);
		}
		g.setFill(gradient);
		return true;
	},
	applyToEx: function (g, alpha, brightness, x, y, w, h) {
		var gradient = g.createRadialGradient(x, y, x + w, y + h);
		for (var i = 0, cnt = this._colors.length; i < cnt; i++) {
			var tcolor = $_tempColors[i] || incArray($_tempColors, new Color());
			tcolor.copy(this._colors[i], alpha);
			gradient.addColorStop(this._ratios[i], tcolor.valueWithBrightness(brightness));
		}
		g.setFill(gradient);
		return true;
	}
});
var GlassGradient = defineClass(null, FillGradient, {
	init: function (source) {
		this._super();
	},
	parse: function (source) {
	}
});
var PROP_STYLE 		= "Style";
var PROP_COLOR 		= "Color";
var PROP_ALPHA 		= "Alpha";
var PROP_BRIGHTNESS = "Brightness";
var PROP_WIDTH 		= "Width";
var PROP_GRADIENT 	= "Gradient";
var PROP_IMAGE 		= "Image";
var PROP_BLUR		= "Blur";
var PROP_OFFSET_X	= "OffsetX";
var PROP_OFFSET_Y	= "OffsetY";
var SolidPen = function (color, width, dash) {
	this._color = new Color(color);
	this._width = width !== undefined ? Math.max(0, parseInt(width)) : 1;
	if (dash) this._dash = dash;
};
SolidPen.WHITE = new SolidPen(Colors.white);
SolidPen.BLACK = new SolidPen(Colors.black);
SolidPen.GRAY = new SolidPen(Colors.gray);
SolidPen.DKGRAY = new SolidPen(Colors.dimGray);
SolidPen.LTGRAY = new SolidPen(Colors.ltGray);
SolidPen.RED = new SolidPen(Colors.red);
SolidPen.GREEN = new SolidPen(Colors.green);
SolidPen.BLUE = new SolidPen(Colors.blue);
SolidPen.FOCUS = new SolidPen(Colors.gray, 1, [1,1]);
SolidPen.prototype.applyTo = function (g) {
	g.setStroke(this._color.value(), this._width, this._dash);
	return true;
};
SolidPen.prototype.width = function () {
	return this._width;
};
SolidPen.prototype.getWidth = function () {
	return this._width;
};
SolidPen.prototype.toText = function () {
	return this._color.toString() + "," + this._width + "px";
};
SolidPen.prototype.css = _norgba ? function () {
	return this._width + "px " + "solid " + this._color.toColorString();
} : function () {
	return this._width + "px " + "solid " + this._color.value();
};
SolidPen.areEqual = function (p1, p2) {
	var v = p1 && p2 && Color.areEqual(p1._color, p2._color) && p1._width == p2._width;
	if (v) {
		v = !p1._dash == !p2._dash;
		if (v && p1) {
			for (var i = p1._dash.length; i--;) {
				if (p1._dash[i] != p2._dash[i]) break;
			}
		}
	}
	return v;
};