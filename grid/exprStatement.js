function ExpressionStatementError(message, pos) {
	this.message = message;
	this.tokenPos = pos;
};
ExpressionStatementError.prototype = new Error();
ExpressionStatementError.prototype.constructor = ExpressionStatementError;
var $$_SEP_HEAD = "${";
var $$_SEP_TAIL = "}";
var /* internal */ ExpressionStatement = function (source, silentError) {
	var _source = null;
	var _silentError = silentError;
	var _tokens = [];
	var _createLiteral = function (literal) {
		return {
			literal: literal,
			evaluate: function (token, runtime) {
				return token.literal;
			}
		};
	};
	var _createIdent = function (ident) {
		return {
			ident: ident,
			idKey: -1,
			evaluate: function (token, runtime) {
				if (token.idKey < 0) {
					token.idKey = runtime.isIdentifier(token.ident);
				}
				return runtime.evaluateIdentifier(token.idKey);
			}
		};
	}
	var _parse = function (str) {
		_tokens.splice(0, _tokens.length);
		if (!str) {
			return;
		}
		var p, q, s, token;
		var len = str.length;
		var i = 0;
		while (i < len) {
			p = str.indexOf($$_SEP_HEAD, i);
			if (p >= 0) {
				q = str.indexOf($$_SEP_TAIL, p + 2);
				if (q >= 0) {
					if (p > i) {
						s = str.substring(i, p);
						token = _createLiteral(s);
						_tokens.push(token);
					}
					s = str.substring(p + 2, q).trim();
					if (s) {
						token = _createIdent(s);	
						_tokens.push(token);
					}
					i = q + 1;
				} else {
					p = -1;
				}
			} 
			if (p < 0) {
				s = str.substr(i, len);
				token = _createLiteral(s);
				_tokens.push(token);
				break;
			}
		}
	};
	this.source = function () {
		return _source;
	};
	this.setSource = function (value) {
		if (value != _source) {
			_source = value;
			_parse(value);
		}
	};
	this.evaluate = function (runtime) {
		try {
			var v;
			var s = "";
			for (var i = 0, cnt = _tokens.length; i < cnt; i++) {
				v = _tokens[i].evaluate(_tokens[i], runtime);
				s += v || "";
			}
			return s;
		} catch (err) {
			if (!_silentError) {
				throw err;
			}
		}
		return null;
	};
	_parse(source);
};