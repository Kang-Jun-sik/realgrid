var /* @internal */ BarCode = defineClass("BarCode", null, {
	init: function () {
		this._super();
		this._value = null;
		this._error = null;
	},
	value: function () {
		return this._value;
	},
	setValue: function (v) {
		if (v != this._value) {
			this._value = v;
			try {
				this._error = null;
				this._parse(v);
			} catch (err) {
				this._error = err;
			}
		}
	},
	error: function () {
		return this._error;
	},
	render: function (g, r) {
		if (!this._error) {
			this._doRender(g, r);
		} else {
			trace("Barocde error: " + this._error);
		}
	},
	_parse: function (value) {
	},
	_doRender: function(g, r) {
	}
});
var /* @internal */ LinearBarcode = defineClass("LinearBarcode", BarCode, {
	init: function () {
		this._super();
	},
	barFill: null,
	integralBar: true,
	minBarWidth: 1,
	maxBarWidth: 0,
	barWidth: 0,
	_doRender: function (g, r) {
		if (!this._barFill) {
			return;
		}
		var len = this._getBarLength();
		if (len < 1) {
			return;
		}
		var w = this._barWidth;
		if (w <= 0) {
			if (this._integralBar) {
				w = Math.floor(r.width / len);
			} else {
				w = r.width / len;
			}
			w = Math.max(this._minBarWidth, w);
			if (this._maxBarWidth > 0) {
				w = Math.min(this._maxBarWidth, w);
			}
		}
		len = w * len;
		r.x += (r.width - len) / 2;
		if (this._integralBar) {
			r.x = Math.floor(r.x);
		}
		this._drawBars(g, this._barFill, r.x, r.y, w, r.height);
	},
	_getBarLength: function () {
		return 0;
	},
	_drawBars: function(g, fill, x, y, barWidth, barHeight) {
	}
});
var $$_C128_BAR_WEIGHTS = [
	0x212222, 0x222122, 0x222221, 0x121223, 0x121322, 0x131222, 0x122213, 0x122312, 0x132212, 0x221213, 
	0x221312, 0x231212, 0x112232, 0x122132, 0x122231, 0x113222, 0x123122, 0x123221, 0x223211, 0x221132, 
	0x221231, 0x213212, 0x223112, 0x312131, 0x311222, 0x321122, 0x321221, 0x312212, 0x322112, 0x322211, 
	0x212123, 0x212321, 0x232121, 0x111323, 0x131123, 0x131321, 0x112313, 0x132113, 0x132311, 0x211313, 
	0x231113, 0x231311, 0x112133, 0x112331, 0x132131, 0x113123, 0x113321, 0x133121, 0x313121, 0x211331, 
	0x231131, 0x213113, 0x213311, 0x213131, 0x311123, 0x311321, 0x331121, 0x312113, 0x312311, 0x332111, 
	0x314111, 0x221411, 0x431111, 0x111224, 0x111422, 0x121124, 0x121421, 0x141122, 0x141221, 0x112214, 
	0x112412, 0x122114, 0x122411, 0x142112, 0x142211, 0x241211, 0x221114, 0x413111, 0x241112, 0x134111, 
	0x111242, 0x121142, 0x121241, 0x114212, 0x124112, 0x124211, 0x411212, 0x421112, 0x421211, 0x212141, 
	0x214121, 0x412121, 0x111143, 0x111341, 0x131141, 0x114113, 0x114311, 0x411113, 0x411311, 0x113141, 
	0x114131, 0x311141, 0x411131, 0x211412, 0x211214, 0x211232, 0x2331112
];
var $$_C128_STOP_CODE = 106;
var $$_C128_TYPE_A = 0;
var $$_C128_TYPE_B = 1;
var $$_C128_TYPE_C = 2;
var $$_C128_START_CODES = [103, 104, 105];
var $$_C128_MASKS = [
	0xF000000, 0x0F00000, 0x00F0000, 0x000F000, 0x0000F00, 0x00000F0, 0x000000F
];
var /* @internal */ Code128 = defineClass("Code128", LinearBarcode, {
	init: function() {
		this._super();
		this._weights = [];
	},
	quietZoneWidth: 10,
	_parse: function(value) {
		this._weigthts = [];
		var len = value ? value.length : 0;
		if (len < 1) {
			return;
		}
		var type = this._detectType(value);
		if (type == $$_C128_TYPE_C && len % 2 == 1) {
			value = "0" + value;
			len++;
		}
		var i, s;
		var c = $$_C128_START_CODES[type];
		var w = $$_C128_BAR_WEIGHTS[c];
		var check = c;
		this._weigthts.push(w);
		if (type == $$_C128_TYPE_C) {
			for (i = 0; i < len; i += 2) {
				s = value.substr(i, 2);
				c = parseInt(s);
				c = this._convert(type, c);
				w = $$_C128_BAR_WEIGHTS[c];
				this._weigthts.push(w);
				check += c * (i + 1);
			}
		} else {
			for (i = 0; i < len; i++) {
				c = value.charCodeAt(i);
				c = this._convert(type, c);
				w = $$_C128_BAR_WEIGHTS[c];
				this._weigthts.push(w);
				check += c * (i + 1);
			}
		}
		check = check % 103;
		this._weigthts.push($$_C128_BAR_WEIGHTS[check]);
		this._weigthts.push($$_C128_BAR_WEIGHTS[$$_C128_STOP_CODE]);
	},
	_getBarLength: function() {
		return this._quietZoneWidth + (this._weigthts.length - 1) * 11 + 13 + this._quietZoneWidth;
	},
	_drawBars: function(g, fill, x, y, barWidth, barHeight) {
		x += 10 * barWidth;
		var i, j, code, b;
		var cnt = this._weigthts.length - 1;
		for (i = 0; i < cnt; i++) {
			code = this._weigthts[i];
			for (j = 0; j < 6; j ++) {
				b = (code & $$_C128_MASKS[j + 1]) >> ((5 - j) * 4);
				b *= barWidth;
				if (j % 2 == 0) {
					this._integralBar ?
					g.drawBoundsI(fill, null, x, y, b, barHeight) :
					g.drawBounds(fill, null, x, y, b, barHeight);
				}
				x += b;
			}
		}
		code = this._weigthts[cnt];
		for (j = 0; j < 7; j ++) {
			b = (code & $$_C128_MASKS[j]) >> ((6 - j) * 4);
			b *= barWidth;
			if (j % 2 == 0) {
				this._integralBar ?
				g.drawBoundsI(fill, null, x, y, b, barHeight) :
				g.drawBounds(fill, null, x, y, b, barHeight);
			}
			x += b;
		}
	},
	_convert: function (type, char) {
		switch (type) {
		case $$_C128_TYPE_A:
			if (char >= 0 && char < 32) 
				return char + 64;
			if (char >= 32 && char < 96) 
				return char - 32;
		case $$_C128_TYPE_B:
			if (char >= 32 && char < 128) 
				return char - 32;
		case $$_C128_TYPE_C:
			if (char >= 0 && char <= 99)
				return char;
		}
		throw new Error("Invalid code128 charactor: " + char);
	},
	_detectType: function (value) {
		var pattern = /^[0-9]+$/;
		if (pattern.test(value)) {
			return $$_C128_TYPE_C;
		}
		pattern = /[a-z]/;
		if (pattern.test(value)) {
			return $$_C128_TYPE_B;
		}
		return $$_C128_TYPE_A;
	}
});
var $$_C39_CODES = {
	"0": "nnnwwnwnn",
	"1": "wnnwnnnnw",
	"2": "nnwwnnnnw",
	"3": "wnwwnnnnn",
	"4": "nnnwwnnnw",
	"5": "wnnwwnnnn",
	"6": "nnwwwnnnn",
	"7": "nnnwnnwnw",
	"8": "wnnwnnwnn",
	"9": "nnwwnnwnn",
	"A": "wnnnnwnnw",
	"B": "nnwnnwnnw",
	"C": "wnwnnwnnn",
	"D": "nnnnwwnnw",
	"E": "wnnnwwnnn",
	"F": "nnwnwwnnn",
	"G": "nnnnnwwnw",
	"H": "wnnnnwwnn",
	"I": "nnwnnwwnn",
	"J": "nnnnwwwnn",
	"K": "wnnnnnnww",
	"L": "nnwnnnnww",
	"M": "wnwnnnnwn",
	"N": "nnnnwnnww",
	"O": "wnnnwnnwn",
	"P": "nnwnwnnwn",
	"Q": "nnnnnnwww",
	"R": "wnnnnnwwn",
	"S": "nnwnnnwwn",
	"T": "nnnnwnwwn",
	"U": "wwnnnnnnw",
	"V": "nwwnnnnnw",
	"W": "wwwnnnnnn",
	"X": "nwnnwnnnw",
	"Y": "wwnnwnnnn",
	"Z": "nwwnwnnnn",
	"-": "nwnnnnwnw",
	".": "wwnnnnwnn",
	" ": "nwwnnnwnn",
	"$": "nwnwnwnnn",
	"/": "nwnwnnnwn",
	"+": "nwnnnwnwn",
	"%": "nnnwnwnwn",
	"*": "nwnnwnwnn"
};
var /* @internal */ Code39 = defineClass("Code39", LinearBarcode, {
	init: function() {
		this._super();
		this._codes = [];
		this._wideWidth = 3;
	},
	_parse: function(value) {
		this._codes = [];
		if (!value) {
			return;
		}
		var i, c, code;
		var cnt = value.length;
		this._codes.push($$_C39_CODES["*"]);
		for (i = 0; i < cnt; i++) {
			c = value.charAt(i);
			code = $$_C39_CODES[c];
			if (!code) {
				throw new Error("Invalid Code39 character: " + c);
			}
			this._codes.push(code);
		}
		this._codes.push($$_C39_CODES["*"]);
	},
	_getBarLength: function() {
		var len = this._codes.length;
		return len * (3 * this._wideWidth + 6) + (len - 1);
	},
	_drawBars: function(g, fill, x, y, barWidth, barHeight) {
		var i, code, j, b;
		var cnt = this._codes.length;
		for (i = 0; i < cnt; i++) {
			code = this._codes[i];
			for (j = 0; j < 9; j ++) {
				b = code.charAt(j) == "n" ? 1 : this._wideWidth;
				b *= barWidth;
				if (j % 2 == 0) {
					this._integralBar ?
					g.drawBoundsI(fill, null, x, y, b, barHeight) :
					g.drawBounds(fill, null, x, y, b, barHeight);
				}
				x += b;
			}
			if (i < cnt - 1) {
				x += barWidth;
			}
		}
	}
});