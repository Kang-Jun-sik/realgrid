var Color = function (value, strict) {
	if (typeof value === "string") {
		Color._parse(value, this, strict, false);// true);
	} else if (value instanceof Color) {
		this._r = value._r;
		this._g = value._g;
		this._b = value._b;
		this._a = value._a;
	} else if (!isNaN(value)) {
		this._a = (value >>> 24) / 255;
		this._r = (value & 0x00ff0000) >> 16;
		this._g = (value & 0x0000ff00) >> 8;
		this._b = value & 0x000000ff;
	} else {
		this._r = this._g = this._b = 0;
		this._a = strict ? NaN : 1;
	}
};
Color._ERROR = new Color(UNDEFINED, true);
Color._ERROR.error = true;
Color.createFrom = function (s, strict) {
	var colorObj = Color._parse(s, $_tempColor, strict, false);
	if (colorObj) {
		return (typeof colorObj === "object") ? colorObj : $_tempColor.clone();
	} else {
		return null;
	}
};
Color._parse = function (value, color, strict, throwError) {
	var s = String(value);
	if (s) {
        var len = s.length;
        var v;
		s = s.trim().toLowerCase();
		if (s.charAt(0) == "#") {
			s = s.substr(1);
			len--;
			if (len >= 6 && len <= 8) {
				color._b = toInt(s.substr(len - 2, 2), 16);
				color._g = toInt(s.substr(len - 4, 2), 16);
				color._r = toInt(s.substr(len - 6, 2), 16);
				color._a = (len == 6) ? (strict ? NaN : 1) : (toInt(s.substr(0, len - 6), 16) / 255.0);
			} else if (len == 3) {
				color._r = toInt(s.charAt(0) + s.charAt(0), 16);
				color._g = toInt(s.charAt(1) + s.charAt(1), 16);
				color._b = toInt(s.charAt(2) + s.charAt(2), 16);
				color._a = strict ? NaN : 1;
			} else if (throwError) {
				throw "Invalid color value text: " + value;
			} else {
				return false;
			}
		} else if (s.indexOf("rgba(") == 0 && s.charAt(len - 1) == ")") {
			s = s.substring(5, len - 1);
			v = s.split(",");
			color._r = toInt(v[0]);
			color._g = toInt(v[1]);
			color._b = toInt(v[2]);
			color._a = v[3];
		} else if (s.indexOf("rgb(") == 0 && s.charAt(len - 1) == ")") {
			s = s.substring(4, len - 1);
			v = s.split(",");
			color._r = toInt(v[0]);
			color._g = toInt(v[1]);
			color._b = toInt(v[2]);
			color._a = strict ? NaN : 1;
		} else if (strict && StrictColors.hasOwnProperty(s)) {
			return StrictColors[s];
		} else if (!strict && Colors.hasOwnProperty(s)) {
			return Colors[s];
		} else {
			var palItem = ColorPaletteItem.createFrom(s, false);
			if (palItem) {
				return palItem;
			}
			if (throwError) {
				throw new Error("Invalid color text: " + value);
			}			
			return false;
		}
		return true;
	}
	return false;
};
Color.getColorStringArray = function (value) {
	return value.trim().toLowerCase().split(/\s+|(rgba\(.*\))|(rgb\(.*\))|(pal\(.*\))/).filter(Boolean);
};
Color.getColorCsvArray = function (value) {
	return value.trim().toLowerCase().split(/\s*,\s*|\s+|(rgba\(.*\))|(rgb\(.*\))|(pal\(.*\))/).filter(Boolean);
};
Color.prototype.clone = function () {
	return new Color(this);
};
Color.prototype.copy = function (source, alpha) {
	if (source) {
		this._r = source._r;
		this._g = source._g;
		this._b = source._b;
		this._a = isNaN(source._a) ? Number(alpha) : source._a;
	} else {
		this._a = Number(alpha);
	}
	return this;
};
Color.prototype.value = function () {
	return "rgba(" + this._r + "," + this._g + "," + this._b + "," + this._a + ")";
};
Color.prototype.valueWithBrightness = function (brightness) {
	var r = this._r;
	var g = this._g;
	var b = this._b;
	var bright = Number(brightness);
	if (!isNaN(bright) && bright != 1) {
		r = _floor(Math.max(0, Math.min(0xff, r * bright)));
		g = _floor(Math.max(0, Math.min(0xff, g * bright)));
		b = _floor(Math.max(0, Math.min(0xff, b * bright)));
		if (r == 0xff && this._r < 0xff) {
			r = _floor((0xff + this._r) / 2);
		}
		if (g == 0xff && this._g < 0xff) {
			g = _floor((0xff + this._g) / 2);
		}
		if (b == 0xff && this._b < 0xff) {
			b = _floor((0xff + this._b) / 2);
		}
	}
	return "rgba(" + r + "," + g + "," + b + "," + this._a + ")";
};
Color.prototype.argb = function () {
	return (Math._floor(this._a * 255) << 24) | (this._r << 16) | (this._g << 8) | this._b;
};
Color.prototype.rgb = function () {
	return (this._r << 16) | (this._g << 8) | this._b;
};
/*
Color.prototype.set = function (a, r, g, b) {
	this._a = a;
	this._r = r;
	this._g = g;
	this._b = b;
};
Color.prototype.setRgb = function (a, r, g, b) {
	this._a = 1.0;
	this._r = r;
	this._g = g;
	this._b = b;
};
Color.prototype.setValue = function (color, alpha) {
	this._r = (color & 0x00ff0000) >> 16;
	this._g = (color & 0x0000ff00) >> 8;
	this._b = color & 0x000000ff;
	this._a = alpha;
};
*/
Color.prototype.extractAlpha = function () {
	var alpha = this._a;
	this._a = NaN;
	return alpha;
};
Color.prototype.toHex = function () {
	return "" + hex(_floor(this._a * 255)) + hex(this._r) + hex(this._g) + hex(this._b);
};
Color.prototype.toColorHex = function () {
	return "" + hex(this._r) + hex(this._g) + hex(this._b);
};
Color.prototype.toString = function () {
	return "#" + hex(_floor(this._a * 255)) + hex(this._r) + hex(this._g) + hex(this._b);
};
Color.prototype.toColorString = function () {
	return "#" + hex(this._r) + hex(this._g) + hex(this._b);
};
Color.areEqual = function (c1, c2) {
	return c1 && c2 && c1._r == c2._r && c1._g == c2._g && c1._b == c2._b && c1._a == c2._a;
};
var $_tempColor = new Color();
var $_tempColors = [new Color(), new Color()];
var Colors = {
	transparent: new Color("#00000000"),
	aqua: new Color("#00ffff"),
	black: new Color("#000000"),
	blue: new Color("#0000ff"),
	fuchsia: new Color("#ff00ff"),
	gray: new Color("#808080"),
	green: new Color("#008000"),
	lime: new Color("#00ff00"),
	maroon: new Color("#800000"),
	navy: new Color("#000080"),
	olive: new Color("#808000"),
	orange: new Color("#ffa500"),
	purple: new Color("#800080"),
	red: new Color("#ff0000"),
	silver: new Color("#c0c0c0"),
	teal: new Color("#008080"),
	white: new Color("#ffffff"),
	yellow: new Color("#ffff00"),
	dimGray: new Color("#696969"),
	ltGray: new Color("#d3d3d3")
};
var StrictColors = {
	transparent: new Color("#00000000"),
	aqua: new Color("#00ffff", true),
	black: new Color("#000000", true),
	blue: new Color("#0000ff", true),
	fuchsia: new Color("#ff00ff", true),
	gray: new Color("#808080", true),
	green: new Color("#008000", true),
	lime: new Color("#00ff00", true),
	maroon: new Color("#800000", true),
	navy: new Color("#000080", true),
	olive: new Color("#808000", true),
	orange: new Color("#ffa500", true),
	purple: new Color("#800080", true),
	red: new Color("#ff0000", true),
	silver: new Color("#c0c0c0", true),
	teal: new Color("#008080", true),
	white: new Color("#ffffff", true),
	yellow: new Color("#ffff00", true),
	dimGray: new Color("#696969", true),
	ltGray: new Color("#d3d3d3", true)
};
var ColorPaletteItem = function (palette, index) {
	this._palette = palette;
	this._index = arguments.length > 1 ? index : -1;
};
ColorPaletteItem.createFrom = function (source, convert) {
	var s = convert ? source.trim().toLowerCase() : source;
	if (s.indexOf("pal(") == 0 && s.charAt(s.length - 1) == ")") {
		s = s.substring(4, s.length - 1);
		if (s.indexOf(",") >= 1) {
			var arr = s.split(",");
			if (arr.length > 1) {
				return new ColorPaletteItem(arr[0], parseInt(arr[1]));
			} else {
				return new ColorPaletteItem(arr[0]);
			}
		} else {
			return new ColorPaletteItem(s);
		}
	}
	return null;
};
ColorPaletteItem.prototype.clone = function () {
	var item = new ColorPaletteItem(this._palette, this._index);
	return item;
};
ColorPaletteItem.prototype.getColor = function () {
	var index = this.getIndex();
	return index >= 0 ? this._palette.getColor(index) : Colors.transparent;
};
ColorPaletteItem.prototype.getIndex = function () {
	var pal = this._palette;
	if (!(pal instanceof ColorPalette)) {
		this._palette = pal = ColorPalette.getPalette(this._palette); 
	}
	if (pal) {
		if (this._index < 0 || this._index >= pal.getCount()) {
			this._index = pal.next();
		}
		return this._index;
	} else {
		return -1;
	}
};
var ColorPalette = function (source) {
	this._colors = [];
	this._next = 0;
	this._parse(source);
};
ColorPalette.register = function (name, palette) {
	if (name) {
		ColorPalette._palettes[name] = palette;
	}
};
ColorPalette.loadPalettes = function (source) {
	if (source) {
		var pals = toArray(source);
		if (pals) {
			for (var i = 0; i < pals.length; i++) {
				var name = pals[i].name;
				var colors = pals[i].colors;
				if (name && colors) {
					var palette = new ColorPalette(colors);
					ColorPalette.register(name, palette);
				}
			}
		}
	}
};
ColorPalette.getPalette = function (name) {
	if (ColorPalette._palettes.hasOwnProperty(name)) {
		return ColorPalette._palettes[name];
	}
	return ColorPalette._palettes["default"];
};
ColorPalette.prototype.getCount = function () {
	return this._colors.length;
};
ColorPalette.prototype.getColors = function () {
	return this._colors.slice();
};
ColorPalette.prototype.next = function () {
	var index = this._next;
	this._next = (this._next + 1) % this._colors.length;
	return index;
};
ColorPalette.prototype.getColor = function (index) {
	return this._colors[index];
};
ColorPalette.prototype._parse = function (source, strict) {
	this._colors = [];
	if (source) {
		var colors = source;
		if (!isArray(colors)) {
			colors = String(source).split(",");
		}
		for (var i = 0, cnt = colors.length; i < cnt; i++) {
			var color = Color.createFrom(colors[i], true);
			this._colors.push(color);
		}
	}
	if (this._colors.length < 1) {
		this._colors.push(Color.createFrom("#00000000"));
	}
};
ColorPalette._palettes = {
	"default": new ColorPalette("#eeeeee")
};