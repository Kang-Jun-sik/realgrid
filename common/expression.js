function ExpressionSyntaxError(message, pos) {
	this.message = message;
	this.tokenPos = pos;
}
ExpressionSyntaxError.prototype = new Error();
ExpressionSyntaxError.prototype.constructor = ExpressionSyntaxError;
function ExpressionEvaluationError(message) {
	this.message = message;
}
ExpressionEvaluationError.prototype = new Error();
ExpressionEvaluationError.prototype.constructor = ExpressionEvaluationError;
var $$_createTokenArray = function () {
	var arr = [];
	for (var i = 0; i < arguments.length; i++) {
		arr[arguments[i]] = true;
	}
	return arr;
};
var TokenKind = {
	Unknown 		: 0,
	Add 			: 1,
	Slash 			: 2,
	Star 			: 3,
	Minus 			: 4,
	Plus 			: 5,
	Identifier 		: 10,
	And 			: 11,
	In 				: 12,
	Not 			: 13,
	Div 			: 14,
	Mod 			: 15,
	Shl 			: 16,
	Shr 			: 17,
	Or 				: 18,
	Xor 			: 19,
	ToStr 			: 20,
	ToNum 			: 21,
	ToBool 			: 23,
	Length 	     	: 24,
	LengthBin 	   	: 25,
	Is 				: 26,
	IsNot 			: 27,
	BraceClose 		: 30,
	BraceOpen 		: 31,
	Comma 			: 32,
	CRLF 			: 33,
	Null 			: 34,
	Defined 		: 35,
	Empty	 		: 36,
	NaN	 			: 37,
	Equal 			: 40,
	Greater 		: 41,
	GreaterEqual 	: 42,
	Lower 			: 43,
	LowerEqual 		: 44,
	NotEqual 		: 45,
	Like 			: 46,
	NotLike 		: 47,
	ILike 			: 48,
	NotILike 		: 49,
	Match 			: 50,
	NotMatch 		: 51,
	IMatch 			: 52,
	NotIMatch 		: 53,
	String 			: 60,
	StringLiteral 	: 61,
	Ascii 			: 62,
	FloatLiteral 	: 63,
	IntegerLiteral 	: 64,
	Point 			: 65,
	RoundOpen 		: 66,
	RoundClose 		: 67,
	DotDot 			: 68,
	BracketOpen 	: 69,
	BracketClose 	: 70,
	Space 			: 71,
	Symbol 			: 80,
	ToDateStr       : 90,
	ToYear          : 91,
	ToMonth         : 92,
	ToDay           : 93,
	ToHour          : 94
};
TokenKind.IS_CHECK = $$_createTokenArray(TokenKind.Is, TokenKind.IsNot);
TokenKind.IS_RELATIVE = $$_createTokenArray(TokenKind.Equal, TokenKind.NotEqual, TokenKind.Like, TokenKind.NotLike, TokenKind.ILike, TokenKind.NotILike, TokenKind.Match, TokenKind.NotMatch, TokenKind.IMatch, TokenKind.NotIMatch, TokenKind.Greater, TokenKind.GreaterEqual, TokenKind.Lower, TokenKind.LowerEqual);
TokenKind.IS_ADDITIVE = $$_createTokenArray(TokenKind.Minus, TokenKind.Plus, TokenKind.Or, TokenKind.Xor);
TokenKind.IS_MULTIPLICATIVE = $$_createTokenArray(TokenKind.And, TokenKind.Star, TokenKind.Slash, TokenKind.Div, TokenKind.Mod, TokenKind.Shl, TokenKind.Shr);
var ExpressionLexer = function () {
	var IS_IDENT = [];
	var IS_INTEGER = [];
	var IS_NUMBER = [];
	var IS_WHITE = [];
	var IS_END = [];
	var QUOTATION = 0;
	var SQUOTATION = 0;
	var BACKSLASH = 0;
	var Keywords = {};
	for (var i = 0; i < 256; i++) {
		IS_IDENT[i] = (i == "_".charCodeAt()) || 
			(i >= "0".charCodeAt() && i <= "9".charCodeAt()) ||
			(i >= "a".charCodeAt() && i <= "z".charCodeAt()) ||
			(i >= "A".charCodeAt() && i <= "Z".charCodeAt());
		IS_INTEGER[i] = 
			(i >= "0".charCodeAt() && i <= "9".charCodeAt()) ||
			(i >= "a".charCodeAt() && i <= "f".charCodeAt()) ||
			(i >= "A".charCodeAt() && i <= "F".charCodeAt());
		IS_NUMBER[i] = 
			(i >= "0".charCodeAt() && i <= "9".charCodeAt()) ||
			i == ".".charCodeAt() || i == "e".charCodeAt() || i == "E".charCodeAt();
		IS_WHITE[i] = (i >= 1 && i <= 9) || (i == 11) || (i >= 14 && i <= 32);
		IS_END[i] = (i == 0); // || (i == 10) || (i == 13); // 개행문자는 끝이 아니므로 제외
	}
	QUOTATION = "\"".charCodeAt();
	SQUOTATION = "'".charCodeAt();
	BACKSLASH = "\\".charCodeAt();
	Keywords = {};
	Keywords["str"] = TokenKind.ToStr;			
	Keywords["num"] = TokenKind.ToNum;			
	Keywords["bool"] = TokenKind.ToBool;			
	Keywords["not"] = TokenKind.Not;			
	Keywords["len"] = TokenKind.Length;			
	Keywords["lenb"] = TokenKind.LengthBin;			
	Keywords["and"] = TokenKind.And;			
	Keywords["in"] = TokenKind.In;			
	Keywords["mod"] = TokenKind.Mod;			
	Keywords["or"] = TokenKind.Or;			
	Keywords["div"] = TokenKind.Div;			
	Keywords["shl"] = TokenKind.Shl;			
	Keywords["shr"] = TokenKind.Shr;			
	Keywords["xor"] = TokenKind.Xor;		
	Keywords["is"] = TokenKind.Is;			
	Keywords["like"] = TokenKind.Like;
	Keywords["ilike"] = TokenKind.ILike;
	Keywords["match"] = TokenKind.Match;
	Keywords["imatch"] = TokenKind.IMatch;
	Keywords["defined"] = TokenKind.Defined;			
	Keywords["null"] = TokenKind.Null;			
	Keywords["empty"] = TokenKind.Empty;			
	Keywords["nan"] = TokenKind.NaN;	
	Keywords["datestr"] = TokenKind.ToDateStr;
	Keywords["year"] = TokenKind.ToYear;
	Keywords["month"] = TokenKind.ToMonth;
	Keywords["day"] = TokenKind.ToDay;
	Keywords["hour"] = TokenKind.ToHour;

	var _procs = null;
	var _source = null;
	var _len = 0;
	var _tokenId = 0;
	var _run = 0;
	var _runAhead = 0;
	var _nextRun = 0;
	var _lineNo = 0;
	var _linePos = 0;
	var _tokenPos = 0;
	function _next() {
		var c = _source.charCodeAt(_run);
		_tokenPos = _run;
		if (c < 256) {
			_procs[c]();
		} else {
			_identProc();
		}
	}
	function _unkownProc() {
		_tokenId = TokenKind.Unknown;
		_run++;
	}
	function _symbolProc() {
		_tokenId = TokenKind.Symbol;
		_run++;
	}
	function _commaProc() {
		_tokenId = TokenKind.Comma;
		_run++;
	}
	function _crProc() {
		_tokenId = TokenKind.CRLF;
		if (_source.charCodeAt(_run + 1) == 10) {
			_run += 2;
		} else {
			_run++;
		}
		_lineNo++;
		_linePos = _run;
	}
	function _lfProc() {
		_tokenId = TokenKind.CRLF;
		_run++;
		_lineNo++;
		_linePos = _run;
	}
	function _equalProc() {
		_tokenId = TokenKind.Equal;
		_run++;
	}
	function _greaterProc() {
		if (_source.charAt(_run + 1) == "=") {
			_tokenId = TokenKind.GreaterEqual;
			_run += 2;
		} else {
			_tokenId = TokenKind.Greater;
			_run++;
		}
	}
	function _lowerProc() {
		if (_source.charAt(_run + 1) == "=") {
			_tokenId = TokenKind.LowerEqual;
			_run += 2;
		} else if (_source.charAt(_run + 1) == ">") {
			_tokenId = TokenKind.NotEqual;
			_run += 2;
		} else {
			_tokenId = TokenKind.Lower;
			_run++;
		}
	}
	function _nextIdent() {
		var i = _run;
		while (i < _len && (!IS_IDENT[_source.charCodeAt(i)])) {
			i++;
		}
		var j = i;
		while (i < _len && (IS_IDENT[_source.charCodeAt(i)])) {
			i++;
		}
		if (i > j) {
			_nextRun = i;
			return _source.substr(j, i - j).toLowerCase();
		} else {
			return null;
		}
	}
	function _identProc() {
		var i = _run;
		while (_run < _len && (IS_IDENT[_source.charCodeAt(_run)] || _source.charCodeAt(_run) > 255)) {
			_run++;
		}
		var s = _source.substr(i, _run - i).toLowerCase();
		if (Keywords.hasOwnProperty(s)) {
			_tokenId = Keywords[s];
			switch (_tokenId) {
			case TokenKind.Not:
				s = _nextIdent();
				if (s) {
					switch (s) {
					case "like":
						_tokenId = TokenKind.NotLike;
						_run = _nextRun;
						break;
					case "ilike":
						_tokenId = TokenKind.NotILike;
						_run = _nextRun;
						break;
					case "match":
						_tokenId = TokenKind.NotMatch;
						_run = _nextRun;
						break;
					case "imatch":
						_tokenId = TokenKind.NotIMatch;
						_run = _nextRun;
						break;
					}
				}
				break; 
			case TokenKind.Is:
				s = _nextIdent();
				if (s == "not") {
					_tokenId = TokenKind.IsNot;
					_run = _nextRun;
				}
				break;
			}
		}
		else {
			_tokenId = TokenKind.Identifier;
		}
	}
	function _integerProc() {
		_tokenId = TokenKind.IntegerLiteral;
		_run++;
		while (_run < _len && IS_INTEGER[_source.charCodeAt(_run)]) {
			_run++;
		}
	}
	function _numberProc() {
		_tokenId = TokenKind.IntegerLiteral;
		_run++;
		while (_run < _len && IS_NUMBER[_source.charCodeAt(_run)]) {
			if (_source.charAt(_run) == ".") {
				if (_source.charAt(_run + 1) == ".") {// dotdot에서 처리함.
					break;
				}
				_tokenId = TokenKind.FloatLiteral;
			}
			_run++;
		}
	}
	function _minusProc() {
		_tokenId = TokenKind.Minus;
		_run++;
	}
	function _plusProc() {
		_tokenId = TokenKind.Plus;
		_run++;
	}
	function _pointProc() {
		var s = _source.charAt(_run + 1);
		if (s == ".") {
			_tokenId = TokenKind.DotDot;
			_run += 2;
		} else {
			_tokenId = TokenKind.Point;
			_run++;
		}
	}
	function _roundOpenProc() {
		_tokenId = TokenKind.RoundOpen;
		_run++;
	}
	function _roundCloseProc() {
		_tokenId = TokenKind.RoundClose;
		_run++;
	}
	function _slashProc() {
		_tokenId = TokenKind.Slash;
		_run++;
	}
	function _spaceProc() {
		_tokenId = TokenKind.Space;
		_run++;
		while (_run < _len && IS_WHITE[_source.charCodeAt(_run)]) {
			_run++;
		}
	}
	function _bracketOpenProc() {
		_tokenId = TokenKind.BracketOpen;
		_run++;
	}
	function _bracketCloseProc() {
		_tokenId = TokenKind.BracketClose;
		_run++;
	}
	function _starProc() {
		_tokenId = TokenKind.Star;
		_run++;
	}
	function _modProc() {
		_tokenId = TokenKind.Mod;
		_run++;
	}
	function _stringProc() {
		_tokenId = TokenKind.StringLiteral;
		do {
			var c = _source.charCodeAt(_run);
			if (IS_END[c]) {
				throw new ExpressionSyntaxError("Untermintated string", c);
			}
			if (c == BACKSLASH) {
				_run++
			}
			_run++;
		} while (_run < _len && _source.charCodeAt(_run) != QUOTATION);
		_run++;
	}
	function _smallStringProc() {
		_tokenId = TokenKind.StringLiteral;
		do {
			var c = _source.charCodeAt(_run);
			if (IS_END[c]) {
				throw new ExpressionSyntaxError("Untermintated string", c);
			}
			if (c == BACKSLASH) {
				_run++
			}
			_run++;
		} while (_run < _len && _source.charCodeAt(_run) != SQUOTATION);
		_run++;
	}
	function _initProcs() {
		var i;
		_procs = [];
		for (i = 1; i <= 255; i++) {
			_procs[i] = _symbolProc;
		}
		for (i = 1; i <= 32; i++) {
			_procs[i] = _spaceProc;
		}
		_procs[10] = _lfProc;
		_procs[13] = _crProc;
		_procs["$".charCodeAt()] = _integerProc;
		_procs[QUOTATION] = _stringProc;
		_procs[SQUOTATION] = _smallStringProc;
		for (i = 0; i <= 9; i++) {
			_procs["0".charCodeAt() + i] = _numberProc;
		}
		for (i = "A".charCodeAt(); i <= "Z".charCodeAt(); i++) {
			_procs[i] = _identProc;
		}
		for (i = "a".charCodeAt(); i <= "z".charCodeAt(); i++) {
			_procs[i] = _identProc;
		}
		_procs["_".charCodeAt()] = _identProc;
		_procs["(".charCodeAt()] = _roundOpenProc;
		_procs[")".charCodeAt()] = _roundCloseProc;
		_procs["*".charCodeAt()] = _starProc;
		_procs["+".charCodeAt()] = _plusProc;
		_procs[",".charCodeAt()] = _commaProc;
		_procs["-".charCodeAt()] = _minusProc;
		_procs[".".charCodeAt()] = _pointProc;
		_procs["/".charCodeAt()] = _slashProc;
		_procs["%".charCodeAt()] = _modProc;
		_procs["<".charCodeAt()] = _lowerProc;
		_procs["=".charCodeAt()] = _equalProc;
		_procs[">".charCodeAt()] = _greaterProc;
		_procs["[".charCodeAt()] = _bracketOpenProc;
		_procs["]".charCodeAt()] = _bracketCloseProc;
	};
	this.tokenId = function () {
		return _tokenId;
	};
	this.tokenLoc = function () {
		return { x: _tokenPos - _linePos, y: _lineNo };
	};
	this.tokenLen = function () {
		return _run - _tokenPos;
	};
	this.token = function () {
		return _source.substr(_tokenPos, this.tokenLen());
	};
	this.isSpace = function () {
		return _tokenId == TokenKind.Space;
	};
	this.init = function (source) {
		_source = source;
		_len = source.length;
		_lineNo = 0;
		_linePos = 0;
		_tokenPos = 0;
		_runAhead = _run = 0;
		_tokenId = 0;
	};
	this.charAhread = function () {
		_runAhead = _run;
		while (_runAhead < _len && _source.charCodeAt(_runAhead) > 0 && _source.charCodeAt(_runAhead) <= 32) {
			_runAhead++;
		}
		return _source.charCodeAt(this._runAhead);
	};
	this.nextId = function (tokenId) {
		do {
			_next();
		} while (_run < _len && _tokenId != tokenId);
	};
	this.nextNoSpace = function () {
		if (_run < _len) {
			do {
				_next();
			} while (_run < _len && this.isSpace());
		}
	};
	this.isFirstInLine = function () {
		if (_tokenPos == 0) {
			return true;
		}
		var c;
		var runBack = _tokenPos;
		runBack--;
		while (runBack > 0 && IS_WHITE[_source.charCodeAt(runBack)]) {
			runBack--;
		}
		if (runBack == 0) {
			return true;
		}
		c = _source.charCodeAt(runBack);
		if (c == 10 || c == 13) {
			return true;
		}
		return false;
	};
	_initProcs();
};
var /* abstract */ ExpressionNode = defineClass("ExpressionNode", null, {
	init: function () {
		this._super();
	},
	destroy: function() {
		return false;
	},
	_asLiteral: function () {
		return null;
	},
	evaluate: function (/*runtime*/) {
		throwAbstractError();
	},
	toString: function () {
		return String(this);
	}
});
var EmptyExpressionNode = defineClass("EmptyExpressionNode", ExpressionNode, {
    init: function () {
        this._super();
    },
    destroy: function() {
    	return false; // 
    },
    _asLiteral: function () {
        return null;
    },
    evaluate: function (/*runtime*/) {
        return undefined;
    },
    toString: function () {
        return "";
    }
}, null, function (f) {
    f.Default = new f();
});
var ExpressionNodeImpl = defineClass("ExpressionNodeImpl", ExpressionNode, {
	init: function() {
		this._super();
		this.leftExpr = null;
		this.rightExpr = null;
		this.operator = TokenKind.Unknown;
		this._literal = null; // LiteralNode
	},
	evaluate: function(runtime) {
		if (this._literal) {
			return this._literal.value();
		} else if (this.rightExpr) {
			var v1 = this.leftExpr.evaluate(runtime);
			var v2 = this.rightExpr.evaluate(runtime);
			switch (this.operator) {
			case TokenKind.Equal:
				return v1 == v2;
			case TokenKind.NotEqual:
				return v1 != v2;
			case TokenKind.Greater:
				return v1 > v2;
			case TokenKind.GreaterEqual:
				return v1 >= v2;
			case TokenKind.Lower:
				return v1 < v2;
			case TokenKind.LowerEqual:
				return v1 <= v2;
				/*
				 * case TokenKind.Is: case TokenKind.IsNot:
				 */
			case TokenKind.Like:
				return this._calcLike(v1, v2, false);
			case TokenKind.NotLike:
				return !this._calcLike(v1, v2, false);
			case TokenKind.ILike:
				return this._calcLike(v1, v2, true);
			case TokenKind.NotILike:
				return !this._calcLike(v1, v2, true);
			case TokenKind.Match:
				return this._calcMatch(v1, v2, false);
			case TokenKind.NotMatch:
				return !this._calcMatch(v1, v2, false);
			case TokenKind.IMatch:
				return this._calcMatch(v1, v2, true);
			case TokenKind.NotIMatch:
				return !this._calcMatch(v1, v2, true);
			default:
				throw new ExpressionEvaluationError(
						"Unknown operator: " + operator);
			}
		} else {
			return this.leftExpr.evaluate(runtime);
		}
	},
	toString: function() {
		var s = "";
		if (this._literal) {
			s = this._literal.toString();
		} else if (this.rightExpr) {
			var s1 = this.leftExpr.toString();
			var s2 = this.rightExpr.toString();
			var op;
			switch (this.operator) {
			case TokenKind.Equal:
				op = "=";
				break;
			case TokenKind.NotEqual:
				op = "<>";
				break;
			case TokenKind.Greater:
				op = ">";
				break;
			case TokenKind.GreaterEqual:
				op = ">=";
				break;
			case TokenKind.Lower:
				op = "<";
				break;
			case TokenKind.LowerEqual:
				op = "<=";
				break;
			case TokenKind.Like:
				op = "like";
				break;
			case TokenKind.NotLike:
				op = "not like";
				break;
			case TokenKind.ILike:
				op = "ilike";
				break;
			case TokenKind.NotILike:
				op = "not ilike";
				break;
			case TokenKind.Match:
				op = "match";
				break;
			case TokenKind.NotMatch:
				op = "not match";
				break;
			case TokenKind.IMatch:
				op = "imatch";
				break;
			case TokenKind.NotIMatch:
				op = "not imatch";
				break;
			default:
				op = "<<ERROR>>";
				break;
			}
			s = "(" + s1 + " " + op + " " + s2 + ")";
		} else {
			s = this.leftExpr.toString();
		}
		return s;
	},
	isIdentifier: function(value) {
		return this.leftExpr && !this.rightExpr && this.leftExpr.isIdentifier(value);
	},
	_prepareValue: function() {
		this.leftExpr._prepareValue();
		if (this.rightExpr == null) {
			this._literal = this.leftExpr._getLiteral();
		} else {
			this.rightExpr._prepareValue();
		}
	},
	_getLiteral: function() {
		return this._literal;
	},
	_calcLike: function(v1, v2, ignoreCase) {
		var s1 = String(v1);
		var s2 = String(v2);
		if (s1 && s2) {
			if (ignoreCase) {
				s1 = s1.toLowerCase();
				s2 = s2.toLowerCase();
			}
			var len = s2.length;
			if (len > 1) {
				var first = s2.charAt(0) == "%";
				var last = s2.charAt(len - 1) == "%";
				if (first && last) {
					s2 = s2.substr(1, len - 2);
					return s1.indexOf(s2, 0) >= 0;
				} else if (first) {
					s2 = s2.substr(1, len - 1);
					len = s1.length;
					return s1.lastIndexOf(s2, len - 1) == len - 1;
				} else if (last) {
					s2 = s2.substr(0, len - 1);
					return s1.indexOf(s2, 0) == 0;
				} else {
					return s1 == s2;
				}
			} else if (s2 == "%") {
				return false;
			} else {
				return s1 == s2;
			}
		}
		return false;
	},
	_calcMatch: function(v1, v2, ignoreCase) {
		var exp = new RegExp(v2, "m" + (ignoreCase ? "i" : ""));
		return exp.test(v1);
	}
});
var CheckableNode = defineClass("DefinedNode", ExpressionNode, {
	init: function() {
		this._super();
	}
});
var DefinedNode = defineClass("DefinedNode", CheckableNode, {
	init: function() {
		this._super();
	},
	value: function() {
		return UNDEFINED;
	},
	_asLiteral: function() {
		return this;
	},
	evaluate: function(runtime) {
		return UNDEFINED;
	},
	toString: function() {
		return "defined";
	}
});
var EmptyNode = defineClass("EmptyNode", CheckableNode, {
	init: function() {
		this._super();
	},
	value: function() {
		return UNDEFINED;
	},
	_asLiteral: function() {
		return this;
	},
	evaluate: function(runtime) {
		return UNDEFINED;
	},
	toString: function() {
		return "empty";
	}
});
var NullNode = defineClass("NullNode", CheckableNode, {
	init : function() {
		this._super();
	},
	value : function() {
		return UNDEFINED;
	},
	_asLiteral: function () {
		return this;
	},
	evaluate : function(runtime) {
		return null;
	},
	toString : function() {
		return "null";
	}
});
var NanNode = defineClass("NanNode", CheckableNode, {
	init: function () {
		this._super();
	},
	value: function () {
		return NaN;
	},
	_asLiteral: function () {
		return this;
	},
	evaluate: function (runtime) {
		return NaN;
	},
	toString: function () {
		return "NaN";
	}
});
var CheckNode = defineClass("CheckNode", ExpressionNodeImpl, {
	init: function (leftExpr, op, literal) {
		this._super();
		this.leftExpr = leftExpr;
		this.operator = op;
		this._isNot = op == TokenKind.IsNot;
		this._value = -1;
		if (literal instanceof DefinedNode) {
			this._value = CheckNode.DEFINED;
		} else if (literal instanceof NullNode) {
			this._value = CheckNode.NULL;
		} else if (literal instanceof EmptyNode) {
			this._value = CheckNode.EMPTY;
		} else if (literal instanceof NanNode) {
			this._value = CheckNode.NAN;
		}
	},
	_prepareValue: function () {
		this.leftExpr._prepareValue();
		this._literal = this.leftExpr._getLiteral();
	},
	_getLiteral: function () {
		return null;
	},
	evaluate: function (runtime) {
		var v = this._literal ? this._literal.value() : this.leftExpr.evaluate(runtime);
		var r;
		switch (this._value) {
		case CheckNode.DEFINED:
			r = (v !== UNDEFINED);
			break;
		case CheckNode.NULL:
			r = (v === UNDEFINED || v === null);
			break;
		case CheckNode.EMPTY:
			r = (v === UNDEFINED || v === null || String(v).length == 0);
			break;
		case CheckNode.NAN:
			r = (v === null || isNaN(v));
			break;
		default:
			return UNDEFINED;
		}
		return this._isNot ? !r : r;
	},
	toString: function () {
		var s = "<<ERROR>>";
		switch (this._value) {
			case CheckNode.DEFINED:
				s = "defined";
				break;
			case CheckNode.NULL:
				s = "null";
				break;
			case CheckNode.EMPTY:
				s = "empty";
				break;
			case CheckNode.NAN:
				s = "NaN";
				break;
		}
		return "(" + ((this._isNot ? "is not " : "is ") + s) + ")";
	}
}, {
	DEFINED	: 0,
	NULL	: 1,
	EMPTY	: 2,
	NAN		: 3
});
var FloatLiteralNode = defineClass("FloatLiteralNode", ExpressionNode, {
	init : function(literal) {
		this._super();
		this._value = Number(literal);
	},
	value : function() {
		return this._value;
	},
	_asLiteral: function () {
		return this;
	},
	evaluate : function(runtime) {
		return this._value;
	},
	toString : function() {
		return String(this._value);
	}
});
var IntegerLiteralNode = defineClass("IntegerLiteralNode", ExpressionNode, {
	init : function(literal) {
		this._super();
		this._value = parseInt(literal);
	},
	value : function() {
		return this._value;
	},
	_asLiteral : function() {
		return this;
	},
	evaluate : function(runtime) {
		return this._value;
	},
	toString : function() {
		return String(this._value);
	}
});
var StringLiteralNode = defineClass("StringLiteralNode", ExpressionNode, {
	init : function(literal) {
		this._super();
		this._value = literal.substr(1, literal.length - 2);
		var val = "";
 		var run = 0;
 		var isEscape = false;
 		while (run < this._value.length) {
 			if (this._value[run] == "\\" && !isEscape) {
 				isEscape = true;
 				run++;
 				continue;
 			}
 			isEscape = false;
 			val += this._value[run++]
 		};
 		this._value = val;		
	},
	value : function() {
		return this._value;
	},
	_asLiteral : function() {
		return this;
	},
	evaluate : function(runtime) {
		return this._value;
	},
	toString : function() {
		return this._value;
	}
});
var IdentifierNode = defineClass("IdentifierNode", ExpressionNode, {
	init : function(literal) {
		this._super();
		this._literal = literal;
		this._idKey = -651212;
	},
	identifier: function () {
		return this._literal;
	},
	evaluate : function(runtime) {
		if (this._idKey == -651212) {
			this._idKey = runtime.isIdentifier(this._literal);
		}
		return runtime.evaluateIdentifier(this._idKey);
	},
	toString : function() {
		return this._literal;
	}
});
var IndexerNode = defineClass("IndexerNode", ExpressionNode, {
	init : function(ident, expression, capital) {
		this._super();
		this._ident = ident;
		this._indexer = expression;
		this._capital = capital;
		this._idKey = -1490313;
		this._intIndex = NaN;
		this._strIndex = null;
	},
	_prepareValue: function () {
		var vnode = null;
		var lit = this._indexer._asLiteral();
		if (!lit) {
			vnode = this._indexer._prepareValue && this._indexer;
			if (vnode) {
				vnode._prepareValue();
				lit = vnode._getLiteral();
			}
		}
		if (lit) {
			var v = lit.value();
			if (typeof v === "string") {
				this._strIndex = v;
			} else {
				this._intIndex = parseInt(v);
			}
			if (this._capital && this._strIndex) {
				this._strIndex = this._strIndex.toUpperCase();
			}
		}
	},
	_getLiteral: function () {
		return null;
	},
	evaluate : function(runtime) {
		if (this._idKey == -1490313) {
			this._idKey = runtime.isIdentifier(this._ident);
		}
		if (this._strIndex) {
			return runtime.evaluateIndexerS(this._idKey, this._strIndex, this._capital);
		} else if (!isNaN(this._intIndex)) {
			return runtime.evaluateIndexerI(this._idKey, this._intIndex);
		} else {
			var index = this._indexer.evaluate(runtime);
			if (typeof index === "string") {
				return runtime.evaluateIndexerS(this._idKey, index, this._capital);
			} else {
				return runtime.evaluateIndexerI(this._idKey, index);
			}
		}
	},
	toString : function() {
		var s = this._ident + "[" + this._indexer.toString() + "]";
		return s;
	}
});
var /* abstract */ UnaryNode = defineClass("UnaryNode", ExpressionNode, {
	init : function(factor) {
		this._super();
		this._factor = factor;
		this._literal = null;
	},
	_prepareValue: function () {
		this._literal  = this._factor._asLiteral();
		if (!this._literal && this._factor._prepareValue) {
			this._factor._prepareValue();
			this._literal = this._factor._getLiteral();
		}
	},
	_getLiteral: function () {
		return null;
	}
});
var LenNode = defineClass("LenNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function (runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		return v ? v.length : 0;
	},
	toString: function () {
		return "(len " + this._factor + ")";
	}
});
var MinusNode = defineClass("MinusNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function(runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		return -v;
	},
	toString: function() {
		return "-" + this._factor;
	}
});
var PlusNode = defineClass("PlusNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function(runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		return v;
	},
	toString: function() {
		return "+" + this._factor;
	}
});
var NotNode = defineClass("NotNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function(runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		return !v;
	},
	toString: function() {
		return "(not " + this._factor + ")";
	}
});
var ToBoolNode = defineClass("ToBoolNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function(runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		return Boolean(v);
	},
	toString: function() {
		return "(bool " + this._factor + ")";
	}
});
var ToNumberNode = defineClass("ToNumberNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function(runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		return Number(v);
	},
	toString: function() {
		return "(num " + this._factor + ")";
	}
});
var ToStringNode = defineClass("ToStringNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function(runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		return String(v);
	},
	toString: function() {
		return "(str " + this._factor + ")";
	}
});
var ToDateStringNode = defineClass("ToDateStringNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function(runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		if (v instanceof Date) {
			v = _pad(v.getFullYear(),4) + 
				_pad((v.getMonth() + 1), 2) + 
				_pad(v.getDate(), 2) +
				_pad(v.getHours(),2) + 
				_pad(v.getMinutes(), 2) + 
				_pad(v.getSeconds(), 2) + 
				_pad(v.getMilliseconds(),3);
		}
		return String(v);
	},
	toString: function() {
		return "(datestr " + this._factor + ")";
	}
});
var ToYearNode = defineClass("ToYearNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function(runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		return v instanceof Date ? v.getFullYear() : null;
	},
	toString: function() {
		return "(year " + this._factor + ")";
	}
});
var ToMonthNode = defineClass("ToMonthNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function(runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		return v instanceof Date ? v.getMonth() + 1 : null;
	},
	toString: function() {
		return "(month " + this._factor + ")";
	}
});
var ToDayNode = defineClass("ToDayNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function(runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		return v instanceof Date ? v.getDate() : null;
	},
	toString: function() {
		return "(day " + this._factor + ")";
	}
});
var ToHourNode = defineClass("ToHourNode", UnaryNode, {
	init: function(factor) {
		this._super(factor);
	},
	evaluate: function(runtime) {
		var v = this._literal ? this._literal.value() : this._factor.evaluate(runtime);
		return v instanceof Date ? v.getHours() : null;
	},
	toString: function() {
		return "(hour " + this._factor + ")";
	}
});
var TermNode = defineClass("TermNode", ExpressionNode, {
	init: function() {
		this._super();
		this._factors = []; // ExpressionNode
		this._operators = [];
		this._literal = null;
	},
	addFactor: function (factor) {
		this._factors.push(factor);
	},
	addOperator: function (tokenId) {
		this._operators.push(tokenId);
	},
	isIdentifier: function (value) {
		return this._factors.length == 1 && this._factors[0] instanceof IdentifierNode && 
			this._factors[0].identifier() == value;
	},
	_prepareValue: function () {
		var i, cnt, factor;
		for (i = 0, cnt = this._factors.length; i < cnt; i++) {
			factor = this._factors[i]; 
			if (factor._prepareValue) {
				factor._prepareValue();
			}
		}
		if (this._operators.length == 0) {
			factor = this._factors[0];
			this._literal = factor._asLiteral();
			if (!this._literal && factor._prepareValue) {
				this._literal = factor._getLiteral();
			}
		}
	},
	_getLiteral: function () {
		return this._literal;
	},
	evaluate: function(runtime) {
		if (this._literal) {
			return this._literal.value();
		}
		var i;
		var v2;
		var len = this._factors.length;
		var v1 = this._factors[0].evaluate(runtime);
		for (i = 1; i < len; i++) {
			v2 = this._factors[i].evaluate(runtime);

			switch (this._operators[i - 1]) {
				case TokenKind.And:
					v1 = v1 && v2;
					break;
				case TokenKind.Star:
					v1 = v1 * v2;
					break;
				case TokenKind.Slash:
					v1 = v1 / v2;
					break;
				case TokenKind.Div:
					v1 = _int(_int(v1) / _int(v2));
					break;
				case TokenKind.Mod:
					v1 = v1 % v2;
					break;
				case TokenKind.Shl:
					v1 = v1 << v2;
					break;
				case TokenKind.Shr:
					v1 = v1 >> v2;
					break;
			}
		}
		return v1;
	},
	toString: function() {
		var s = "";
		if (this._literal) {
			s = this._literal.toString();
		} else if (this._factors.length == 1) {
			s = this._factors[0].toString();
		} else {
			var i;
			var len = this._factors.length;
			s = "(" + this._factors[0].toString();
			for (i = 1; i < len; i++) {
				switch (this._operators[i - 1]) {
					case TokenKind.And:
						s += " and ";
						break;
					case TokenKind.Star:
						s += " * ";
						break;
					case TokenKind.Slash:
						s += " / ";
						break;
					case TokenKind.Div:
						s += " / ";
						break;
					case TokenKind.Mod:
						s += " mod ";
						break;
					case TokenKind.Shl:
						s += " shl ";
						break;
					case TokenKind.Shr:
						s += " shr ";
						break;
				}
				s += this._factors[i].toString();
			}
			s += ")";
		}
		return s;
	}
});
var SimpleExpressioNode = defineClass("SimpleExpressioNode", ExpressionNode, {
	init: function() {
		this._super();
		this._terms = []; // TermNode
		this._operators = [];
		this._literal = null;
	},
	addTerm: function (term) {
		this._terms.push(term);
	},
	addOperator: function (tokenId) {
		this._operators.push(tokenId);
	},
	isIdentifier: function (value) {
		return this._terms.length == 1 && this._terms[0].isIdentifier(value);
	},
	_prepareValue: function () {
		var i;
		var cnt;
		for (i = 0, cnt = this._terms.length; i < cnt; i++) {
			this._terms[i]._prepareValue();
		}
		if (this._operators.length == 0) {
			this._literal = this._terms[0]._getLiteral();
		}
	},
	_getLiteral: function () {
		return this._literal;
	},
	evaluate: function(runtime) {
		if (this._literal) {
			return this._literal.value();
		}
		var i;
		var v2;
		var len = this._terms.length;
		var v1 = this._terms[0].evaluate(runtime);
		for (i = 1; i < len; i++) {
			v2 = this._terms[i].evaluate(runtime);
			switch (this._operators[i - 1]) {
			case TokenKind.Minus:
				v1 = v1 - v2;
				break;
			case TokenKind.Plus:
				v1 = v1 + v2;
				break;
			case TokenKind.Or:
				v1 = v1 || v2;
				break;
			case TokenKind.Xor:
				v1 = v1 ^ v2;
				break;
			}
		}
		return v1;
	},
	toString: function() {
		var s = "";
		if (this._literal) {
			s = this._literal.toString();
		} else if (this._terms.length == 1) {
			s = this._terms[0].toString();
		} else {
			var i;
			var len = this._terms.length;
			s = "(" + this._terms[0].toString();
			for (i = 1; i < len; i++) {
				switch (this._operators[i - 1]) {
					case TokenKind.Minus:
						s += " - ";
						break;
					case TokenKind.Plus:
						s += " + ";
						break;
					case TokenKind.Or:
						s += " or ";
						break;
					case TokenKind.Xor:
						s += " xor ";
						break;
					default:
						s += " <<ERROR>> ";
				}
				s += this._terms[i].toString();
			}
			s += ")";
		}
		return s;
	}
});
var ExpressionParser = function () {
	var _node = null;
	var	_capitalIndexers = null;
	var	_lexer = new ExpressionLexer();
	function _syntaxError(message, pos) {
		throw new ExpressionSyntaxError(message, pos);
	}
	function _expected(tokenId) {
		if (tokenId != _lexer.tokenId()) {
			throw new ExpressionSyntaxError("Token is not a expected kind [" + tokenId + "]: " + _lexer.tokenId(), _lexer.tokenLoc());
		}
		_nextToken();
	}
	function _nextToken() {
		_lexer.nextNoSpace();
	}
	function _doExpression() {
		var expr = null;
		var left = _doSimpleExpression();
		var right;
		var check;
		var op;
		if (TokenKind.IS_CHECK[op = _lexer.tokenId()]) {
			_nextToken();
			right = _doSimpleExpression();
			right._prepareValue();
			check = _cast(right._getLiteral(), CheckableNode);
			if (check) {
				expr = new CheckNode(left, op, check);
			} else {
				throw new ExpressionSyntaxError("is operator's operand must be defined, null or empty: " + _lexer.tokenId());
			}
		} else {
			expr = new ExpressionNodeImpl();
			expr.leftExpr = left;
			if (TokenKind.IS_RELATIVE[_lexer.tokenId()]) {
				expr.operator = _lexer.tokenId();
				_nextToken();
				expr.rightExpr = _doSimpleExpression();
			}
		}
		return expr;
	}
	function _doSimpleExpression() {
		var expr = new SimpleExpressioNode();
		expr.addTerm(_doTerm());
		while (TokenKind.IS_ADDITIVE[_lexer.tokenId()]) {
			expr.addOperator(_lexer.tokenId());
			_nextToken();
			expr.addTerm(_doTerm());
		}
		return expr;
	}
	function _doTerm() {
		var term = new TermNode();
		term.addFactor(_doFactor());
		while (TokenKind.IS_MULTIPLICATIVE[_lexer.tokenId()]) {
			term.addOperator(_lexer.tokenId());
			_nextToken();
			term.addFactor(_doFactor());
		}
		return term;
	};
	function _doFactor() {
		var tokenId = _lexer.tokenId();
		switch (tokenId) {
			case TokenKind.StringLiteral:
				return _doCharString();
			case TokenKind.RoundOpen:
				return _doRoundOpen();
			case TokenKind.Identifier:
				return _doIdentifier();
			case TokenKind.IntegerLiteral:
				return _doInteger();
			case TokenKind.FloatLiteral:
				return _doNumber();
			case TokenKind.Minus:
				return _doMinus();
			case TokenKind.Plus:
				return _doPlus();
			case TokenKind.Not:
				return _doNot();
			case TokenKind.Defined:
				return _doDefined();
			case TokenKind.Null:
				return _doNull();
			case TokenKind.Empty:
				return _doEmpty();
			case TokenKind.NaN:
				return _doNaN();
			case TokenKind.ToBool:
				return _doToBool();
			case TokenKind.ToNum:
				return _doToNumber();
			case TokenKind.ToStr:
				return _doToString();
			case TokenKind.Length:
				return _doLength();
			case TokenKind.LengthBin:
				return _doLengthBin();
			case TokenKind.ToDateStr:
				return _doToDateString();
			case TokenKind.ToYear:
				return _doToYear();
			case TokenKind.ToMonth:
				return _doToMonth();
			case TokenKind.ToDay:
				return _doToDay();
			case TokenKind.ToHour:
				return _doToHour();
		}
		throw new ExpressionSyntaxError("Unkown token: " + tokenId);
	}
	function _doCharString() {
		var literal = _lexer.token();
		_nextToken();
		return new StringLiteralNode(literal);
	}
	function _doRoundOpen() {
		_nextToken();
		var node = _doExpression();
		_expected(TokenKind.RoundClose);
		return node;
	}
	function _doIdentifier() {
		var literal = _lexer.token();
		_nextToken();
		if (_lexer.tokenId() == TokenKind.BracketOpen) {
			_nextToken();
			var node = _doExpression();
			_expected(TokenKind.BracketClose);
			return new IndexerNode(literal, node, _capitalIndexers.indexOf(literal) >= 0);
		} else {
			return new IdentifierNode(literal);
		}		
	}
	function _doNumber() {
		var literal = _lexer.token();
		_nextToken();
		return new FloatLiteralNode(literal);
	}	
	function _doInteger() {
		var literal = _lexer.token();
		_nextToken();
		return new IntegerLiteralNode(literal);
	};	
	function _doMinus() {
		_nextToken();
		return new MinusNode(_doFactor());
	}
	function _doPlus() {
		_nextToken();
		return new PlusNode(_doFactor());
	}
	function _doNot() {
		_nextToken();
		return new NotNode(_doFactor());
	}
	function _doDefined() {
		_nextToken();
		return new DefinedNode();
	}
	function _doNull() {
		_nextToken();
		return new NullNode();
	}
	function _doEmpty() {
		_nextToken();
		return new EmptyNode();
	}
	function _doNaN() {
		_nextToken();
		return new NanNode();
	}
	function _doToBool() {
		_nextToken();
		return new ToBoolNode(_doFactor());
	}
	function _doToNumber() {
		_nextToken();
		return new ToNumberNode(_doFactor());
	}
	function _doToString() {
		_nextToken();
		return new ToStringNode(_doFactor());
	}
	function _doLength() {
		_nextToken();
		return new LenNode(_doFactor());
	}
	function _doLengthBin() {
		_nextToken();
		return new LenBinNode(_doFactor());
	}
	function _doToDateString() {
		_nextToken();
		return new ToDateStringNode(_doFactor());
	}
	function _doToYear() {
		_nextToken();
		return new ToYearNode(_doFactor());
	}
	function _doToMonth() {
		_nextToken();
		return new ToMonthNode(_doFactor());
	}
	function _doToDay() {
		_nextToken();
		return new ToDayNode(_doFactor());
	}
	function _doToHour() {
		_nextToken();
		return new ToHourNode(_doFactor());
	}

	this.parse = function (source, capitalIndexers) {
		if (!source)
			return null;
			_capitalIndexers = capitalIndexers || [];
			_lexer.init(source);
			_nextToken();
			var expr = _doExpression();
			if (expr) {
				expr._prepareValue();
			}
			return expr;
		return null;
	};
	this.evaluate = function (source, runtime, capitalIndexers) {
		var expr = this.parse(source, capitalIndexers);
		return expr.evaluate(runtime);
	};
};
ExpressionParser.Default = new ExpressionParser();

var /* abstract */ ExpressionRuntime = defineClass("ExpressionRuntime", null, {
	init: function () {
		this._super();
	},
	isIdentifier: function (token) {
		throw new Error("Token is not a valid Identifier: " + token);
	},
	evaluateIdentifier: function (idKey) {
		throw new Error("Invalid identifier key: " + idKey);
	},
	evaluateIndexerI: function (idKey, index) {
		throw new Error("Invalid identifier indexer: " + idKey);
	},
	evaluateIndexerS: function (idKey, index) {
		throw new Error("Invalid identifier indexer: " + idKey);
	}
});
