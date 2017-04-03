var $$$_DEC_SEP = ".";
var $$$_GRP_SEP = ","
function decimalPlaces(num) {
  var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) { return 0; }
  return Math.max(
       0,
       // Number of digits right of decimal point.
       (match[1] ? match[1].length : 0)
       // Adjust for scientific notation.
       - (match[2] ? +match[2] : 0));
}

var DecimalFormatter = defineClass("DecimalFormatter", null, {
	init : function(format) {
		this._super();
		this._minDigits = 0;
		this._maxDigits = 0;
		this._minInts = 0;
		this._maxInts = 0;
		this._optDecimal = false;
		this._groupPos = 0;
		this._seperator = null;
		this._groupSep = null;
		this._reg = null;
		this._regDecimal = null;
		this._replacement = "$&,";
		this._parse(format);
	},
	format: function (value) {
		var v = Number(value);
		if (isNaN(v)) {
			return "";
		} else {
			var digits = this._minDigits;
			if (this._optDecimal) {
				var dlen = decimalPlaces(v);
				digits = Math.min(Math.max(dlen, this._minDigits),this._maxDigits);
			}
			v = Number(v.toPrecision(15));

			var fixed = v.toFixed(digits);
			if (this._seperator) {
				fixed = fixed.replace($$$_DEC_SEP, this._seperator)
			}

			if (this._reg) {
				if(digits)
					return fixed.replace(this._regDecimal, this._replacement);
				else
					return fixed.replace(this._reg, this._replacement);
			} else {
				return fixed;
			}
		}
	},
	_parse: function (format) {
		if (format) {
			format = format.trim();
		}
		if (!format) {
			return;
		}
		var seperator = $$$_DEC_SEP;
		var groupSep = $$$_GRP_SEP;
		if (format.indexOf(";") > -1) {
			var fmts = format.split(";");
			format = fmts[0];
			if (fmts.length > 1 && fmts[1]) 
				seperator = fmts[1];
			if (fmts.length > 2 && fmts[2])  {
				groupSep = fmts[2];
			}
		}
		this._seperator = seperator == $$$_DEC_SEP ? null : seperator;
		this._groupSep = groupSep == $$$_GRP_SEP ? null : groupSep;
		var i;
		var c;
		var len = format.length;
		var period = format.indexOf($$$_DEC_SEP);
		this._optDecimal = format.indexOf("#",period) > 0;
		if (period >= 0) {
			for (i = period + 1; i < len; i++) {
				if (format.charAt(i) == "0") {
					this._minDigits++;
					this._maxDigits++;
				} else {
					break;
				}
			}
			for (; i < len; i++) {
				if (format.charAt(i) == "#") {
					this._maxDigits++;
				} else {
					break;
				}
			}
		
			format = format.substr(0, period);
		}
		if (format) {
			len = format.length;
			if (format.charAt(len - 1) == $$$_GRP_SEP) {
				this._groupPos = 3; // locale default
				format = format.substr(0, len - 1);
			}
		}
		if (format) {
			len = format.length;
			var zero = true;
			for (i = len - 1; i >= 0; i--) {
				c = format.charAt(i);
				if (c == "0" && zero) {
					this._minInts++;
					this._maxInts++;
				} else if (this._groupPos == 0 && c == $$$_GRP_SEP) {
					this._groupPos = len - i - 1;
				} else if (c == "#") {
					zero = false;
				} else {
					break;
				}
			}
		}
		if (this._groupPos > 0) {
			this._replacement = "$&" + groupSep;
			this._reg        = new RegExp('\\d(?=(\\d{' + this._groupPos + '})+($|\\' + seperator + '))', 'g');
			this._regDecimal = new RegExp('\\d(?=(\\d{' + this._groupPos + '})+\\' + seperator + ')', 'g');
		}
	}
}, {
	PerformTest: function (format, count) {
		var f = new DecimalFormatter(format);
		var t = _getTimer();
		for (var i = 0; i < count; i++) {
			f.format(1234567.1234);
		}
		t = _getTimer() - t;
		trace("##### DecimalFormat PerformTest Result : " + t + " msces.");
	},
	Test: function (format, value) {
		var f = new DecimalFormatter(format);
		var r = f.format(value);
		trace("##### DecimalFormat Test Result : " + r );
	}
});
var BooleanFormatter = defineClass("BooleanFormatter", null, {
	init : function(format) {
		this._super();
		this._format = format;
		this._nullText = null;
		this._trueText = null;
		this._falseText = null;
		this._parse();
	},
	format: null,
	setFormat: function (value) {
		if (value != this._format) {
			this._format = value;
			this._parse();
		}
	},
	formatValue: function (v) {
		return (v === UNDEFINED) ? this._nullText : v ? this._trueText : this._falseText;
	},
	_parse: function () {
		this._falseText = this._trueText = null;
		if (this._format) {
			var arr = this._format.split(/[;\:]/);
			this._falseText = arr[0];
			if (arr.length > 0) {
				this._trueText = arr[1];
			}
			if (arr.length > 1) {
				this._nullText = arr[2];
			}
		}
	}
});
var BooleanConverter = function (format) {
	var _format = format;
	var _values = null;
	var _sensitive = true;
	var _trueText = null;
	var _falseText = null;
	this.format = function () {
		return _format;
	};
	this.setFormat = function (value) {
		if (value != _format) {
			_format = value;
			parse(value);
		}
	};
	this.toBool = function (value) {
		if (_values) {
			if (value) {
				var s = _sensitive ? String(value) : String(value).toLowerCase();
				if (s in _values) {
					return _values[s];
				}
			}
		}
		return Boolean(value);
	};
	this.toBoolEx = function (value) {
		var s = _sensitive ? String(value) : String(value).toLowerCase();
		if (_values) {
			if (s in _values) {
				return _values[s];
			}
		}
		return s ? Boolean(s) : undefined; // s ? true : undefined 오 동일.
	};
	this.toBoolStrict = function (value) {
		if (_values) {
			var s = _sensitive ? String(value) : String(value).toLowerCase();
			if (s in _values) {
				return _values[s];
			}
		}
		return undefined;
	};
	this.toText = function (value) {
		return value ? _trueText : _falseText;
	};
	var parse = function (fmt) {
		if (fmt) {
			var s,
				i,
				arr = fmt.split(/[;\:]/),
				falses,
				trues,
				sensitive = true;
			s = arr[0];
			falses = s ? s.split(",") : null;
			if (arr.length > 1) {
				s = arr[1];
				trues = s ? s.split(",") : null;
			}
			if (arr.length > 2) {
				s = trim(arr[2]);
				if (s == "0")
					sensitive = false;
			}
			_values = {};
			_sensitive = sensitive;
			for (i = 0; i < falses.length; i++) {
				s = falses[i];
				_values[sensitive ? s : s.toLowerCase()] = false;
			}
			for (i = 0; i < trues.length; i++) {
				s = trues[i];
				_values[sensitive ? s : s.toLowerCase()] = true;
			}
			_trueText = trues && trues.length > 0 ? trues[0] : "true";
			_falseText = falses && falses.length > 0 ? falses[0] : "false";
		} else {
			_values = {};
			_values["true"] = true;
			_values["false"] = false;
			_trueText = "true";
			_falseText = "false";
		}
	};
	parse(_format);
};
BooleanConverter.Default = new BooleanConverter("false,f,0:true,t,1:0");
var DATE_SEPARATORS = "./-: ";
var DateTimeParser = defineClass("DateTimeParser", null, {
	init : function(format) {
		this._super();
		this._baseYear = 0;
		this._patterns = [];
		this.setFormat(format);
	},
	format: null,
	baseYear: 2000,
	amText: "AM",
	pmText: "PM",
	setFormat: function (value) {
		if (value != this._format) {
			if (!value) {
				throw "Invalid empty date format";
			}
			this.$_parseFormat(value);
			this._format = value;
		}
	},
	setBaseYear: function (value) {
		if (value != this._baseYear) {
			this._baseYear = value;
		}
	},
	setAmText: function (value) {
		if (value != this._amText) {
			this._amText = value;
		}
	},
	setPmText: function (value) {
		if (value != this._pmText) {
			this._pmText = value;
		}
	},
	parse: function (str) {
		try {
			var y = 0;
			var m = 1;
			var d = 1;
			var h = 0;
			var n = 0;
			var s = 0;
			var S = 0;
			var am = 0;
			var pm = 0;
			var len = this._patterns.length;
			var i;
			var p = 0;
			var strlen = str.length;
			for (i = 0; i < len && p < strlen; i++) {
				var pattern = this._patterns[i];
				var c = pattern.c;
				var l = pattern.len;
				switch (c) {
					case "y":
						y = _int(str.substr(p, l));
						break;
					case "M":
						m = _int(str.substr(p, l));
						break;
					case "d":
						d = _int(str.substr(p, l));
						break;
					case "a":
						if (this._amText && str.indexOf(this._amText, p) == p) {
							am = 12;
							l = this._amText.length;
						} else if (this._pmText && str.indexOf(this._pmText, p) == p) {
							pm = 12;
							l = this._pmText.length;
						} else {
							return null;
						}
						break;
					case "H":
						h = _int(str.substr(p, l));
						break;
					case "h":
						h = _int(str.substr(p, l));
						break;
					case "m":
						n = _int(str.substr(p, l));
						break;
					case "s":
						s = _int(str.substr(p, l));
						break;
					case "S":
						S = _int(str.substr(p, l));
						break;
					case ".":
					case "/":
					case "-":
					case ":":
					case " ":
						/*
						if (strict) {
							if (str.charAt(p) != c) {
								return null;
							}
						} else*/ if (DATE_SEPARATORS.indexOf(str.charAt(p)) < 0) {
							return null;
						}
						break;
					default:
						return null;
				}
				p += l;
			}
		} catch (err) {
			return null;
		}
		if (y < 100) {
			y += this._baseYear;
		}
		if (am > 0) {
			if (h == 12) {
				h = 0;
			}
		} else if (pm > 0 && h < 12) {
			h += 12;
		}
		return new Date(y, m - 1, d, h, n, s, S);
	},
	$_parseFormat: function (format) {
		var s = format;
		var len = s.length;
		var i = 0;
		var p;
		var c;
		var l;
		this._patterns = [];
		while (i < len) {
			p = i;
			c = s.charAt(i);
			if (_isWhitespace(c)) {
				i++;
				while (i < len && _isWhitespace(s.charAt(i))) {
					i++;
				}
				this._patterns.push({ c: " ", p: p, len: i - p });
			} else {
				l = 0;
				switch (c) {
					case "y":
						l = this.$_getPattern(s, i, c);
						if (l != 4 && l != 2) this.$_throwInvalidFormat(s);
						break;
					case "M":
					case "d":
					case "H":
					case "h":
					case "m":
					case "s":
						l = this.$_getPattern(s, i, c);
						if (l != 2) this.$_throwInvalidFormat(s);
						break;
					case "S":
						l = this.$_getPattern(s, i, c);
						if (l != 3) this.$_throwInvalidFormat(s);
						break;
					case "a":
					case ".":
					case "/":
					case "-":
					case ":":
						l = this.$_getPattern(s, i, c);
						if (l != 1) this.$_throwInvalidFormat(s);
						break;
					default:
						this.$_throwInvalidFormat(s);
				}
				if (l > 0) {
					this._patterns.push({ c: c, p: i, len: l });
					i += l;
				}
			}
		}
	},
	$_throwInvalidFormat: function (format) {
		if ($_debug) debugger;
		throw "Invalid date format: " + format;
	},
	$_throwInvalidValue: function (value) {
		if ($_debug) debugger;
		throw "Invalid date text: " + value;
	},
	$_getPattern: function (str, i, c) {
		var len = 1;
		while (++i < str.length && str.charAt(i) == c)
			len++;
		return len;
	}
});
var $$_DT_DATE_TOKENS = [
	"yy", "yyyy",
	"M", "MM",
	"d", "dd",
	"a",
	"H", "HH", "h", "hh",
	"m", "mm",
	"s", "ss",
	"S", "SS", "SSS"
];
var $$_DT_DATE_SEPARATORS = [
	".", "/", "-", ":"
];
var U_0 = "0".charCodeAt(0);
var U_9 = "9".charCodeAt(0);
var U_Z = "Z".charCodeAt(0);
var L_Z = "z".charCodeAt(0);
var U_A = "A".charCodeAt(0);
var L_A = "a".charCodeAt(0);
var U_Y = "Y".charCodeAt(0);
var L_Y = "y".charCodeAt(0);
var U_M = "M".charCodeAt(0);
var L_M = "m".charCodeAt(0);
var U_D = "D".charCodeAt(0);
var L_D = "d".charCodeAt(0);
var U_H = "H".charCodeAt(0);
var L_H = "h".charCodeAt(0);
var U_S = "S".charCodeAt(0);
var L_S = "s".charCodeAt(0);
var DateTimeWriter = function (format) {
	var _format = null;
	var _amText = null;
	var _pmText = null;
	var _baseYear = 2000;
	var _preserveTime = false;
	var _tokens = null;
	var _hasAmPm = false;
	var _formatString = null;
	var _parseDateFormatTokens = function (format) {
		var tokens = [];
		if (format) {
			var tok, p, c;
			var str = format.trim();
			var len = str.length;
			var i = 0;
			while (i < len) {
				tok = str.charAt(i);
				if ($$_DT_DATE_SEPARATORS.indexOf(tok) >= 0) {
					tokens.push(tok);
					i++;
				} else {
					p = i++;
					while (i < len && str.charAt(i) == tok) {
						i++;
					}
					tok = str.substring(p, i);
					if ($$_DT_DATE_TOKENS.indexOf(tok) < 0) {
						c = tok.charCodeAt(0);
						if (c >= U_A && c <= U_Z || c >= L_A && c <= L_Z) {
							throw new Error("Invalid datetime write format: " + format);
						}
					}
					tokens.push(tok);
				}
				if (i < len && _isWhitespace(tok = str.charAt(i))) {
					tokens.push(tok);
					while (i < len && _isWhitespace(str.charAt(i))) {
						i++;
					}
				}
			}
		}
		return tokens;
	};
	var _parse = function (fmt) {
		_amText = "AM";
		_pmText = "PM";
		if (fmt) {
			var arr = fmt.split(";");
			_format = arr[0] || DateTimeWriter.$_DefaultFormat;
			_tokens = _parseDateFormatTokens(_format);
			_hasAmPm = _tokens.indexOf("a") >= 0 || _tokens.indexOf("A") >= 0;
			if (arr.length > 1 && arr[1]) {
				var ampms = arr[1].split(",");
				if (ampms.length > 0 && ampms[0]) {
					_amText = ampms[0];
				}
				if (ampms.length > 1 && ampms[1]) {
					_pmText = ampms[1];
				}
			}
		}
	};
	var _pad = function (v) {
		return (v < 10) ? "0" + v : String(v);
	};
	this.format = function () {
		return _format;
	};
	this.formatString = function () {
		return _formatString;
	};
	this.setFormatString = function (value) {
		value = value || DateTimeWriter.$_DefaultFormat;
		if (value != _formatString) {
			_tokens = [];
			_parse(value);
			_formatString = value;
		}
	};
	this.getText = function (d) {
		if (!_tokens) {
			return "";
		}
		var date = d;
		if (!(date instanceof  Date)) {
			date = new Date(d);
		}
		var h;
		var s = "";
		for (var i = 0, cnt = _tokens.length; i < cnt; i++) {
			var t = _tokens[i];
			var len = t.length;
			switch (t.charCodeAt(0)) {
				case L_Y:
					s += len > 2 ? date.getFullYear() : _pad(date.getFullYear() % 100);
					break;
				case U_M:
					s += len > 1 ? _pad(date.getMonth() + 1) : (date.getMonth() + 1);
					break;
				case L_D:
					s += len > 1 ? _pad(date.getDate()) : date.getDate();
					break;
				case U_H:
					s += len > 1 ? _pad(date.getHours()) : date.getHours();
					break;
				case L_H:
					if (_hasAmPm) {
						h = date.getHours();
						if (h == 0) {
							h = 12
						} else if (h > 12) {
							h = h - 12;
						}
						s += len > 1 ? _pad(h) : h;
					} else {
						s += len > 1 ? _pad(date.getHours()) : date.getHours();
					}
					break;
				case L_M:
					s += len > 1 ? _pad(date.getMinutes()) : date.getMinutes();
					break;
				case L_S:
					s += len > 1 ? _pad(date.getSeconds()) : date.getSeconds();
					break;
				case L_A:
				case U_A:
					if (date.getHours() < 12) {
						s += _amText;
					} else {
						s += _pmText;
					}
					break;
				case U_S:
					s += date.getMilliseconds().toString().substr(0, len);
					break;
				/*
				 case U_Y:
				 break;
				 case U_D:
				 s += day of year
				 break;
				 */
				default:
					s += t;
			}
		}
		return s;
	};
	this.setFormatString(format || DateTimeWriter.$_DefaultFormat);
};
DateTimeWriter.$_DefaultFormat = "yyyy/MM/dd";
DateTimeWriter.Default = new DateTimeWriter(DateTimeWriter.$_DefaultFormat);
var $$_DATE_TOKENS = [
	"yy", "yyyy",
	"M", "MM",
	"d", "dd",
	"a", "A",
	"H", "HH", "h", "hh",
	"m", "mm",
	"s", "ss"
];
var $$_DATE_SEPARATORS = [
	".", "/", "-", ":"
];
var $$_ZERO_CHAR = "0".charCodeAt(0);
var $$_NINE_CHAR = "9".charCodeAt(0);
var DatetimeConverter = function (format) {
	var _formatString = null;
	var _format = null;
	var _amText = null;
	var _pmText = null;
	var _baseYear = 2000;
	var _preserveTime = false;
	var _splitWords = function (str) {
		var i, p, c, c2;
		var len = str.length;
		var words = [];
		p = i = 0;
		c = str.charAt(i++);
		while (i < len) {
			c2 = str.charAt(i);
			if (c2 != c) {
				words.push(str.substring(p, i));
				c = c2;
				p = i;
			}
			i++;
		}
		if (p < len) {
			words.push(str.substr(p));
		}
		return words;
	};
	var _parseDateFormatTokens = function (format) {
		var str;
		var tokens = [];
		if (str = _trim(format)) {
			var c, p, s, j;
			var len = str.length;
			var i = 0;
			while (i < len) {
				c = str.charAt(i);
				if ($$_DATE_SEPARATORS.indexOf(c) >= 0) {
					tokens.push(c);
					i++;
				} else {
					p = i++;
					while (i < len && str.charAt(i) == c) {
						i++;
					}
					c = str.substring(p, i);
					if ($$_DATE_TOKENS.indexOf(c) < 0) {
						throw new Error("Invalid datetime read format: " + format);
					}
					tokens.push(c == "A" ? "a" : c);
				}
				if (i < len && _isWhitespace(c = str.charAt(i))) {
					tokens.push(" ");
					while (i < len && _isWhitespace(str.charAt(i))) {
						i++;
					}
				}
			}
			var tokens2 = [];
			len = tokens.length;
			p = 0;
			for (i = 0; i < len; i++) {
				c = tokens[i];
				if (c == "a" || $$_DATE_TOKENS.indexOf(c) < 0) {
					if (p > 1) {
						tokens2.push("E");
					}
					tokens2.push(c);
					p = 0;
				} else {
					if (p == 1) {
						tokens2.splice(tokens2.length - 2, 0, "L");
					}
					tokens2.push(c);
					p++;
				}
			}
			tokens = tokens2;
		}
		return tokens;
	};
	var _parseDateValueTokens = function (date, amStr, pmStr) {
		var str;
		var tokens = [];
		var ampms = ["am", "pm", "AM", "PM", "Am", "Pm", "aM", "pM"];
		amStr && ampms.push(amStr);
		pmStr && ampms.push(pmStr);
		if (str = _trim(date)) {
			var c, p;
			var len = str.length;
			var i = 0;
			while (i < len) {
				c = str.charAt(i);
				if (DATE_SEPARATORS.indexOf(c) >= 0) {
					tokens.push(c);
					i++;
				} else if (c.charCodeAt(0) >= $$_ZERO_CHAR && c.charCodeAt(0) <= $$_NINE_CHAR) {
					p = i++;
					while (i < len && str.charCodeAt(i) >= $$_ZERO_CHAR && str.charCodeAt(i) <= $$_NINE_CHAR) {
						i++;
					}
					c = str.substring(p, i);
					tokens.push(c);
				} else {
					var idx = -1;
					for (var j = 0; j < ampms.length; j++) {
						if (str.indexOf(ampms[j], i) == i) {
							idx = j;
							break;
						}
					}
					if (idx < 0) {
						throw "Invalid date value: " + str;
					}
					tokens.push(ampms[j]);
					i += ampms[j].length;
				}
				if (i < len && _isWhitespace(c = str.charAt(i))) {
					tokens.push(" ");
					while (i < len && _isWhitespace(str.charAt(i))) {
						i++;
					}
				}
			}
		}
		return tokens;
	};
	var _validateDateFormat = function (format) {
		if (format = _trim(format)) {
			var tokens = _parseDateFormatTokens(format);
			var i = 0;
			/*
			 var str:String = StringUtil.trim(format);
			 var arr:Array = str.split(/[\s+|\.|\-|\/|\:]/);
			 for each (var s:String in arr) {
			 if (s && DATE_TOKENS.indexOf(s) < 0) {
			 var words:Array = splitWords(s);
			 var valid:Boolean = true;
			 for each (var w:String in words) {
			 if(DATE_TOKENS.indexOf(w) < 0) {
			 valid = false;
			 break;
			 }
			 }
			 if (!valid) {
			 throw new Error("Invalid datetime read format: " + format);
			 }
			 }
			 }
			 var ampm:Boolean = arr.indexOf("a") >= 0 || arr.indexOf("A") >= 0;
			 */
			var ampm = tokens.indexOf("a") >= 0;
			if (ampm && tokens.indexOf("H") >= 0) {
				throw "Invalid datetime read format - 'H'와 'a'가 같이 존재할 수 없습니다: " + format;
			}
			if (tokens.indexOf("h") >= 0 && !ampm) {
				throw "Invalid datetime read format - 'h'가 있으면 'a'가 반드시 있어야 합니다: " + format;
			}
		}
	};
	var _parse = function (fmt) {
		_amText = "am";
		_pmText = "pm";
		_baseYear = 2000;
		_preserveTime = false;
		if (fmt) {
			var arr = fmt.split(";");
			_format = arr[0] ? arr[0] : _defaultFormat;
			_validateDateFormat(_format);
			if (arr.length > 1 && arr[1]) {
				_baseYear = _int(arr[1]);
			}
			if (arr.length > 2 && arr[2]) {
				var ampms = arr[2].split(",");
				_amText = ampms[0] ? ampms[0] : "am";
				if (ampms.length > 1) {
					_pmText = ampms[1] ? ampms[1] : "pm";
				}
			}
			if (arr.length > 3) {
				_preserveTime = arr[3] ? arr[3] == "1" : false
			}
		}
	};
	this.formatString = function () {
		return _formatString;
	};
	this.setFormatString = function (value) {
		if (value != _formatString) {
			_formatString = value;
			_parse(value);
		}
	};
	this.format = function () {
		return _format;
	};
	/**
	 * 1. trim()한다.
	 * 2. 이어진 space는 하나의 space로 간주한다.
	 * 3. 일 구분자는 ".", "/", "-" 셋 중 하나면 된다.
	 */
	this.getDate = function (str) {
		var date/*Date*/ = null;
		if (str = _trim(str)) {
			var tokens = _parseDateFormatTokens(_format);
			var values = _parseDateValueTokens(str, _amText, _pmText);
			var ampm = tokens.indexOf("a") >= 0 || tokens.indexOf("A") >= 0;
			var len = tokens.length;
			var vlen = values.length;
			var y = 0;
			var m = 1;
			var d = 1;
			var h = 0;
			var n = 0;
			var s = 0;
			var am = 0;
			var pm = 0;
			var ss;
			var i = 0;
			var j = 0;
			while (i < len && j < vlen) {
				var token = tokens[i];
				var v = values[j];
				switch (token.charAt(0)) {
					case "L":
						ss = String(v);
						i++;
						while (i < len && (str = tokens[i]) != "E") {
							v = ss ? _int(ss.substr(0, str.length)) : -1;
							ss = ss.substr(str.length);
							switch (str.charAt(0)) {
								case "Y":
								case "y":
									y = Math.max(0, v);
									break;
								case "M":
									m = v >= 0 ? v : 1;
									break;
								case "D":
								case "d":
									d = v >= 0 ? v : 1;
									break;
								case "H":
								case "h":
									h = Math.max(0, v);
									break;
								case "m":
									n = Math.max(0, v);
									break;
								case "s":
									s = Math.max(0, v);
									break;
							}
							i++;
						}
						break;
					case "Y":
					case "y":
						y = _int(v);
						break;
					case "M":
						m = _int(v);
						break;
					case "D":
					case "d":
						d = _int(v);
						break;
					case "H":
					case "h":
						h = _int(v);
						break;
					case "m":
						n = _int(v);
						break;
					case "s":
						s = _int(v);
						break;
					case "a":
						str = String(v);
						if (str) {
							str = str.toLowerCase();
							if ((_amText && str == _amText.toLowerCase()) || (str == "am")) {
								am = 12;
							} else if ((_pmText && str == _pmText.toLowerCase()) || (str == "pm")) {
								pm = 12;
							}
						}
						break;
				}
				i++;
				j++;
			}
			if (y < 100 && y >= 0) {
				y += _baseYear;
			}
			/*
			 m = Math.min(12, Math.max(1, m));
			 d = Math.min(31, Math.max(1, d));
			 if (m == 2) {
			 if (d >= 28) {
			 if ((((y % 4 == 0) && (y % 100 != 0)) || (y % 400 == 0)))
			 d = 29;
			 else
			 d = 28;
			 }
			 } else {
			 if (d == 31 && (m == 4 || m == 6 || m == 9 || m == 11)) {
			 d = 30;
			 }
			 }
			 */
			if (y < 0 || y > 9999) {
				return null;
			}
			if (m < 1 || m > 12) {
				return null;
			}
			if (d < 1 || d > 31) {
				return null;
			}
			if (m == 2) {
				if (d > 29) {
					return null;
				}
				if (d == 29) {
					if (!((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)))
						return null;
				}
			}
			if (h < 0 || h > 24) {
				return null;
			}
			if ((am > 0 || pm > 0) && h > 12) {
				return null;
			}
			if (n < 0 || n > 59) {
				return null;
			}
			if (s < 0 || s > 59) {
				return null;
			}
			if (am > 0) {
				h = h % 12;
			} else if (pm > 0) {
				h = h % 12 + 12;
			}
			date = new Date(y, m - 1, d, h, n, s);
		}
		return date;
	};
    this.getDateNull = function (s) {
        try {
            return this.getDate(s);
        } catch (err) {
        }
        return null;
    };
	this.getText = function (d) {
		var date/*Date*/ = d;
		if (!(date instanceof Date)) {
			date = new Date(d);
		}
		var tokens = _parseDateFormatTokens(_format);
		var ampm = tokens.indexOf("a") >= 0 || tokens.indexOf("A") >= 0;
		var s = "";
		var h;
		for (var i = 0, cnt = tokens.length; i < cnt; i++) {
			var t = tokens[i];
			var len = t.length;
			switch (t.charAt(0)) {
				case "L":
					break;
				case "Y":
				case "y":
					s += len > 2 ? date.getFullYear() : pad(date.getFullYear() % 100);
					break;
				case "M":
					s += len > 1 ? pad(date.getMonth() + 1) : date.getMonth() + 1;
					break;
				case "D":
				case "d":
					s += len > 1 ? pad(date.getDate()) : date.getDate();
					break;
				case "H":
					s += len > 1 ? pad(date.getHours()) : date.getHours();
					break;
				case "h":
					if (ampm) {
						h = date.getHours();
						if (h == 0) {
							h = 12
						} else if (h > 12) {
							h = h - 12;
						}
						s += len > 1 ? pad(h) : h;
					} else {
						s += len > 1 ? pad(date.getHours()) : date.getHours();
					}
					break;
				case "m":
					s += len > 1 ? pad(date.getMinutes()) : date.getMinutes();
					break;
				case "s":
					s += len > 1 ? pad(date.getSeconds()) : date.getSeconds();
					break;
				case "A":
				case "a":
					if (date.getHours() < 12) {
						s += _amText;
					} else {
						s += _pmText;
					}
					break;
				default:
					s += t;
			}
		}
		return s;
	};
	this._daysOfYear = function (d) {
		var MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30];

		var days = 0;
		for (var i = 0; i < d.getMonth(); i++)
			days += MONTH_DAYS[i];
		
		if (d.getMonth() >= 2) {
			var y = d.getFullYear();
			if (y % 400 == 0 || (y % 4 == 0 && y % 100 != 0))
				days++;
		}
		
		days += d.getDate();
		
		return days;
	};
	this._daysOfPriorYears = function (y) {
		if (y <= 1900)
			return 0;
		
		y--;
		var leapDays =   
			parseInt(y / 4)   // plus julian leap days in prior years
			- parseInt(y / 100) // minus prior century years
			+ parseInt(y / 400) // plus years divisible by 400
			- 460;      // leap days in previous 1900 years
		
		return 365 * (y - 1899) + leapDays;
	};
	this.toExcelDate = function (d) {
		var DAY_MILLISECONDS = 86400000;

		var time = (((d.getHours() * 60 + d.getMinutes()) * 60 + d.getSeconds()) * 1000 + d.getMilliseconds()) / DAY_MILLISECONDS;
		var days = this._daysOfPriorYears(d.getFullYear()) + this._daysOfYear(d);
		
		var v = days + time;
		if (v >= 60) v++; // ?
		return v;
	};
	this.setFormatString(format);
};
DatetimeConverter.$_DefaultFormat = "yyyy/MM/dd";
DatetimeConverter.Default = new DatetimeConverter(DatetimeConverter.$_DefaultFormat);

var ISODateTimeParser = function () {
}
var $$_zoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
ISODateTimeParser.parse = function (str, check) {
	var finalDate = null;
	try	{
		var t = str.indexOf("T");
		var dateStr = str.substring(0, t);
		var timeStr = str.substring(t + 1);
		var arr = dateStr.split("-");
		var len = arr.length;
		var year = _int(arr[0]);
		var month = len > 1 ? _int(arr[1]) : 1;
		var date = len > 2 ? _int(arr[2]) : 1;
		var multiplier;
		var offsetHours;
		var offsetMinutes;
		var offsetStr;
		if (timeStr.indexOf("Z") != -1) {
			multiplier = 1;
			offsetHours = 0;
			offsetMinutes = 0;
			timeStr = timeStr.replace("Z", "");
		} else if (timeStr.indexOf("+") != -1) {
			multiplier = 1;
			offsetStr = timeStr.substring(timeStr.indexOf("+") + 1, timeStr.length);
			offsetHours = Number(offsetStr.substring(0, offsetStr.indexOf(":")));
			offsetMinutes = Number(offsetStr.substring(offsetStr.indexOf(":") + 1, offsetStr.length));
			timeStr = timeStr.substring(0, timeStr.indexOf("+"));
		} else if (timeStr.indexOf("-") != -1) {
			multiplier = -1;
			offsetStr = timeStr.substring(timeStr.indexOf("-")+1, timeStr.length);
			offsetHours = Number(offsetStr.substring(0, offsetStr.indexOf(":")));
			offsetMinutes = Number(offsetStr.substring(offsetStr.indexOf(":") + 1, offsetStr.length));
			timeStr = timeStr.substring(0, timeStr.indexOf("-"));
		} else {
			multiplier = 0;
		}
		var timeArr = timeStr.split(":");
		len = timeArr ? timeArr.length : 0;
		var hour = len > 0 ? _int(timeArr[0]) : 0;
		var minutes = len > 1 ? _int(timeArr[1]) : 0;
		var secondsArr = (len > 2) ? String(timeArr[2]).split(".") : null;
		var seconds = (secondsArr && secondsArr.length > 0) ? _int(secondsArr[0]) : 0;
		var milliseconds = (secondsArr && secondsArr.length > 1) ? 1000 * parseFloat("0." + secondsArr[1]) : 0;
		var utc = Date.UTC(year, month-1, date, hour, minutes, seconds, milliseconds);
		var offset = multiplier ? (((offsetHours * 3600000) + (offsetMinutes * 60000)) * multiplier) : -$$_zoneOffset;
		finalDate = new Date(utc - offset);
		if (check && isNaN(finalDate.getTime())) {
			throw "Invalidate date text: " + str;
		}
	} catch (e) {
		if (check) {
			var eStr = "Invalid date Text: " + str;
			eStr += "\nError: " + e.toString();
			throw eStr;
		}
	}
	return finalDate;
};

var DateTimeReader = function (format) {
	var _format = null;
	var _type = 0;
	var _parser = new DateTimeParser();
	var _parse = function (fmt) {
		if (fmt) {
			var s = fmt.toLowerCase();
			_type = Math.max(0, DateTimeReader.FORMATS.indexOf(s));
			if (_type == 0) {
				_parser.setFormat(fmt);
			}
		}
	};
	this.format = function () {
		return _format;
	};
	this.setFormat = function (value) {
		if (value != _format) {
			_format = value;
			_parse(value);
		}
	};
	this.amText = function () {
		return _parser.amText();
	};
	this.setAmText = function (value) {
		_parser.setAmText(value);
	};
	this.pmText = function () {
		return _parser.pmText();
	};
	this.setPmText = function (value) {
		_parser.setPmText(value);
	};
	this.baseYear = function () {
		return _parser.baseYear();
	};
	this.setBaseYear = function (value) {
		_parser.setBaseYear(value);
	};
	this.toDate = function (value) {
        if (value === undefined || value === null || value === "") {
            return null;
        }
		var d = value;
		if (!(d instanceof Date)) {
			var s = String(value);
			if (s) {
				switch (_type) {
					case 0:
						d = _parser.parse(s/*, strict*/);
						break;
					case 1:
						d = ISODateTimeParser.parse(s);
						break;
					case 2:
					default:
						d = new Date(s);
						break;
				}
			}
		}
        if (d) {
            return isNaN(d.getTime()) ? null : d;
        }
        return null;
	};
	this.setFormat(format);
};
DateTimeReader.FORMATS = ["custom", "iso", "platform"];
DateTimeReader.Default = new DateTimeReader("yyyy/MM/dd HH:mm:ss");
DateTimeReader.Default.setAmText("AM");
DateTimeReader.Default.setPmText("PM");
DateTimeReader.Default.setBaseYear(2000);

ExcelFormatConverter = defineClass("ExcelFormatConverter", null, {}, {
	convertNumberFormat: function (format) {
		if (format.indexOf(".#") > 0)
			return format.replace(".#", ".0");
		else 
			return format;
	},
	convertDateFormat: function (format) {
		var result = "";
		var l = format.length;
		for (var i = 0; i < l; i++) {
			var c = format.charAt(i);
			switch (c) {
				case "y":
				case "d":
				case "m":
				case "s":
				case ":":
					result = result + c;
					break;
				case "M":
					result = result + "m";
					break;
				case "a":
					result = result + "AM/PM"
					break;
				case "H":
					result = result + "h";
					if (i >= l-1 || format.charAt(i+1) != "H")
						result = result + "h";
					break;
				case "h":
					if (i == 0 || format.charAt(i-1) != "h")
						result = result + "h";
					break;
				case "S":
					break;
				case ".":
				case "/":
				case "-":
				case " ":
					if (i >= l-1 || format.charAt(i+1) != "S")
						result = result + "\\" + c;
					break;
				default:
					result = result + "\"" + c + "\"";
			}
		}

		return result;
	}
});
ExcelFormatConverter.Default = new ExcelFormatConverter();