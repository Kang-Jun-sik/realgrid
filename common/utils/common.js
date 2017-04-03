var UNDEFINED;
var $_debug = /*$debugging$*/;
var $_logging = /*$debugging$*/;
var __f__ = function realgrid() {};
var $_evl = window.addEventListener;
var console = window.console;
var log = console && typeof console.log == "function" ? Function.prototype.bind.call(console.log, console) : UNDEFINED;
var __epoch = new Date().getTime();
var toString = Object.prototype.toString;
var PI = Math.PI;
var _2PI = Math.PI * 2;
var MAX_INT = Math.pow(2, 53) - 1;
var MIN_INT = -MAX_INT;
var $_temp_size = { width: 0, height: 0 };
var $_csvreg = /,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/;
var $_linereg = /\r|\n|\r\n/;
function _setDebug(debug) {
    $_debug = debug;
}
function _setLogging(logging) {
    $_logging = logging;
};
function _log() {
    log && log.apply(console, arguments);
}
function _trace() {
	$_logging && log && log.apply(console, arguments);
}
var trace = _trace;
function _throwDebug(err) {
	if ($_debug) throw err;
}
var alertOnce = (function () {
	var alerted = false;
	return function (message) {
		if (!alerted) {
			alerted = true;
			alert(message);
		}
	}
}());
function getTimer() {
	return new Date().getTime() - __epoch;
}
var _getTimer = getTimer;
function defined(obj) {
	return obj !== UNDEFINED && obj !== null;
}
function _isEmpty(value) {
	return value === UNDEFINED || value === null || value == "";
}
function _isObj(obj) {
	return typeof obj === "object";
}
function _isObject(obj) {
	if (obj === null) return false;
	return typeof obj === "object";
}
function isObject(obj) {
	return Object(obj) === obj;
}
function _isStr(str) {
	return typeof str == "string";
}
function _isString(obj) {
	return toString.call(obj) === "[object String]"; // for new String("")
}
var isString = _isString;
function _equalsText(s1, s2) {
	if (s1 && s2) {
		return s1.toLowerCase() == s2.toLowerCase();
	} else {
		return !s1 && !s2;
	}
}
function _isWhiteSpace(s) {
	return !s || !s.trim();
}
function _forceFloat(v) {
	v = parseFloat(v);
	return isNaN(v) ? 0 : v;
}
function _forceInt(v) {
	v = parseInt(v);
	return isNaN(v) ? 0 : v;
}
function _isArray(obj) {
	return Array.isArray ? Array.isArray(obj) : toString.call(obj) === '[object Array]';
}
var isArray = _isArray;
function _asArray(obj) {
	 return (Array.isArray ? Array.isArray(obj) : toString.call(obj) === '[object Array]') ? obj : null;
}
var asArray = _asArray;
function _makeArray(obj) {
	return _isArray(obj) ? obj : [obj];
}
function _equalsArray(a1, a2) {
	if (!_isArray(a1) || !_isArray(a2)) {
		return false;
	}
	var len = a1.length;
	if (a2.length != len) {
		return false;
	}
	for (var i = 0; i < len; i++) {
		if (a1[i] != a2[i]) {
			return false;
		}
	}
	return true;
}
function _csvToArray(csv) {
    var v = [];
    if (csv) {
        var arr = csv.split($_csvreg);
        for (var i = 0; i < arr.length; i++) {
            var a = arr[i];
            a && (a = a.trim());
            if (a) {
                if (a.length > 1 && a.charAt(0) == '"' && a.charAt(a.length - 1) == '"') {
                    v.push(a.substr(1, a.length - 2));
                } else if (a == "true") {
                    v.push(true);
                } else if (a == "false") {
                    v.push(false);
                } else if (a == "null") {
                    v.push(null);
                } else if (a == "undefined") {
                    v.push(undefined);
                } else {
                    var n = parseFloat(a);
                    v.push(isNaN(n) ? a : n);
                }
            } else {
                v.push("")
            }
        }
    }
    return v;
}
function _arrayToCsv(vals) {
    var s = "";
    if (vals) {
        for (var i = 0; i < vals.length; i++) {
            if (s) s += ",";
            var v = vals[i];
            if (v === undefined) {
                v = "undefined";
            } else if (v === null) {
                v = "null";
            } else if (typeof v == "number") {
                v = String(v);
            } else if (typeof v == "boolean") {
                v = v ? "true" : "false";
            } else {
                v = '"' + v + '"';
            }
            s += v;
        }
    }
    return "[" + s + "]";
}
function _asDate(d) {
    return d instanceof Date ? d : null;
}
function _tempSize(w, h) {
	$_temp_size.width = w;
	$_temp_size.height = h;
	return $_temp_size;
}
function _pick() {
	var args = arguments;
	var len = args.length;
	var v;
	for (var i = 0; i < len; i++) {
		v = args[i];
		if (v !== UNDEFINED && v !== null) {
			return v;
		}
	}
	return UNDEFINED;
}
function _included(value) {
	var args = arguments;
	var len = args.length;
	for (var i = 1; i < len; i++) {
		if (args[i] == value) {
			return true;
		}
	}
	return false;
}
function _getObj(source, path) {
	if (source && path) {
		var arr = path.split(".");
		var v = source;
		for (var i = 0, cnt = arr.length; v && i < cnt; i++) {
			v = v[arr[i]];
		}
		return v;
	}
	return null;
}
function _toStr(value) {
    if (typeof value === "number") {
        return !isNaN(value) ? String(value) : "";
    } else {
        return value !== null && value !== undefined ? String(value) : "";
    }
}
function _toLowerCase(value) {
    if (value !== undefined && value !== null) {
        return String(value).toLowerCase();
    }
    return value;
}
function _toUpperCase(value) {
    if (value !== undefined && value !== null) {
        return String(value).toUpperCase();
    }
    return value;
}
function _strLen(value) {
    if (value !== undefined && value !== null) {
        return String(value).length;
    }
	return 0;
}
function _pad(value, len, c) {
	len = Math.max(len || 2, 1);
	c = c || 0;
	return new Array(len - String(value).length + 1).join(c) + value;
}
var pad = _pad;
function hex(value, len, c) {
	len = Math.max(len || 2, 1);
	c = c || 0;
	var s = value.toString(16);
	return new Array(len - s.toString(16).length + 1).join(c) + s;
}
function toInt(v, radix) {
	return (v !== UNDEFINED && v !== null) ? parseInt(v, radix || 10) : 0;
}
function toFloat(v) {
	return (v !== UNDEFINED && v !== null) ? parseFloat(v) : 0;
}
var $$_week_days = window.RG_CONST && window.RG_CONST.WEEKDAYS ? window.RG_CONST.WEEKDAYS : ['일', '월', '화', '수', '목', '금', '토'];
var $$_month_days = [
    [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
];
function _isLeapYear(year) {
	return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}
function _incMonth(d, delta) {
    var day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + delta);
    d.setDate(Math.min(day, $$_month_days[_isLeapYear(d.getYear()) ? 1 : 0][d.getMonth()]));
    return d;
}
function _minDate(d1, d2) {
	if (d1 !== null) return d1;
	if (d2 !== null) return d2;
	return d1.getTime() < d2.getTime() ? d1 : d2;
}
function _maxDate(d1, d2) {
	if (d1 !== null) return d2;
	if (d2 !== null) return d1;
	return d1.getTime() > d2.getTime() ? d1 : d2;
}
function _toArray(v) {
	return _isArray(v) ? v : defined(v) ? [v] : null;
}
var toArray = _toArray;
function incArray(array, value) {
	array.push(value);
	return value;
}
function _getter(prop) {
	return "get" + prop.chartAt(0).toUpperCase() + prop.substr(1);
}
function _setter(prop) {
	return "set" + prop.charAt(0).toUpperCase() + prop.substr(1);
}
function _isWhitespace(c) {
	return /\s/.test(c);
}
function _trim(s) {
	return s ? s.trim() : null;
}
var trim = _trim;
function _stopEvent(e) {
	if (e.preventDefault) {
		e.preventDefault();
		e.stopPropagation();
	} else {
		e.returnValue = false;
	}
}
function _capitalize(s) {
	return s.charAt(0).toUpperCase() + s.substr(1);
}
function byteLength(str) {
	var b, i, c;
	for (b = i = 0; c = str.charCodeAt(i++); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
	return b;
}
function _createProperties(obj, props, def) {
	if (props) {
		var names = props.split(",");
		for (var i = 0, cnt = props.length; i < cnt; i++) {
			obj[names[i]] = def;
		}
	}
}
var _floor = Math.floor;
var _int = Math.floor;
var _round = Math.round;
var _ceil = Math.ceil;
var Errors = {
	NOT_YET_IMPLEMENTED: "Not yet implemented"
};
function _enum(v) {
	return Object.freeze ? Object.freeze(v) : v;
}
function _clone(v) {
	var c = new v.constructor();
	for (var p in v) {
		c[p] = v[p];
	}
	return c;
}
function _extend(obj) {
	obj = obj || {};
	for (var i = 1, len = arguments.length; i < len; i++) {
		var src = arguments[i];
		if (src) {
			for (var prop in src) {
				obj[prop] = src[prop];
			}
		}
	}
	return obj;
}
function _deepExtend(obj) {
	obj = obj || {};
	for (var i = 1, len = arguments.length; i < len; i++) {
		var src = arguments[i];
		if (src) {
			for (var prop in src) {
				var v = src[prop];
				if (_isArray(v)) {
					var arr = [];
					for (var j = 0; j < v.length; j++) {
						arr.push(_deepExtend(v[j]));
					}
					v = arr;
				} else if (_isObject(v)) {
					v = _deepExtend({}, v);
				}
				obj[prop] = v;
			}
		}
	}
	return obj;
}
function AbortError(message) {
	this.message = message;
}
var ajax = function (url, method, data) {
	method = method || "GET";
	data = data !== UNDEFINED ? data : null;
	var req = new XMLHttpRequest();
	req.open(method, url, false);
	req.send(data);
	if (req.status !== 200 && xhr.status !== 0) 
		throw "XMLHttpRequest failed: " + req.status;
    return req.responseText; // req.responsXML;
};
var asyncAjax = function (url, callback, method, data) {
	method = method || "GET";
	data = data !== UNDEFINED ? data : null;
	var req = new XMLHttpRequest;
	req.onreadystatechange = function() {
		if (req.readyState === 4) {
			var error = null;
			if (req.status !== 200 && req.status !== 0) {
				error = "XMLHttpRequest failed: " + req.status;
			}
        	callback(req.responseText, req.status, error);
      	}
    };
    req.open(method, url, true);
    req.send(data);
};
function AssertError(message) {
	this.message = message || "Assert error";
}
AssertError.prototype = new Error();
AssertError.prototype.constructor = AssertError;
var assert = function (test, message) {
	if (!test) {
		if ($_debug) debugger;
		throw new AssertError(message);
	}
};
var _assert = assert;
var _IntegerProperty = function (defaultValue) {
	this.defaultValue = defaultValue;
};
var IntProp_0 = new _IntegerProperty(0);
var IntProp = function (defaultValue) {
	return new _IntegerProperty(defaultValue);
};
var _INHERITTING = {};
var RGBase = function () {};
RGBase.$_hash = 0;
var defineClass = function (name, baseClass, members, statics, callback) {
	if (baseClass !== null && !(typeof baseClass == "function")) {
		if ($_debug) debugger;
		throw "Base class is not a function";
	}
	var f = function () {
		if (arguments[0] !== _INHERITTING) {
			this.$inited = false;
			this.init && this.init.apply(this, arguments);
			this.$inited = true;
		}
	};
	var proto = f.prototype = baseClass ? new baseClass(_INHERITTING) : new RGBase(_INHERITTING);
	var p = null;
	var v, getter, getter2, setter, fn, notifier;
	proto.constructor = f;
	proto.$base = baseClass ? baseClass.prototype : RGBase.prototype;
	proto.$name = name;
	if (members) {
		var attrs = {};
		var inits = f.$inits = {};
		for (p in members) {
			v = members[p];
			if (typeof v === "function") {
				v.$name = p;
				v.$owner = proto;
				proto[p] = v;
			} else {
				if (v && v.init) {
					v = v.init;
				}
				attrs[p] = v;
			}
		}
		f.$attrs = {};
		for (p in attrs) {
			v = members[p];
			name = _capitalize(p);
			getter = (typeof v === "boolean") ? "is" + name : p;
			setter = "set" + name;
			notifier = p + "PropChanged";
			fn = null;
			getter2 = p + "_";
			if (proto.hasOwnProperty(getter2)) {//[getter2]) { // "prop_" 함수로 getter를 지정할 수 있다.
				fn = proto[getter2];
				delete proto[getter2];
			} else if (v && v.get) {
				fn = v.get;
			} else if (!proto.hasOwnProperty(getter)) {//[getter]){
				fn = (function (p) {
					return function () {
						return this["_" + p];
					};
				})(p);
			}
			if (fn) {
				fn.$name = getter;
				fn.$owner = proto;
				proto[getter] = fn;
			}
			fn = null;
			if (v && v.set) {
				fn = v.set;
			} else if (!proto.hasOwnProperty(setter)) {//[setter]) {
				if (v instanceof _IntegerProperty) {
					fn = (function (p, getter) {
						return function (value) {
							var oldValue;
							value = parseInt(value);
							if (!isNaN(value) && proto[getter] && (oldValue = proto[getter].call(this)) != value) {
								this["_" + p] = value;
								if (this.$inited) {
									if (this[notifier]) this[notifier].call(this, p, oldValue, value);
									else this.propertyChanged(p, oldValue, value);
								}
							}
							return this;
						};
					})(p, getter);
				} else {
					fn = (function (p, getter) {
						return function (value) {
							var oldValue;
							if (proto[getter] && (oldValue = proto[getter].call(this)) != value) {
								this["_" + p] = value;
								if (this.$inited) {
									if (this[notifier]) this[notifier].call(this, p, oldValue, value);
									else this.propertyChanged(p, oldValue, value);
								}
							}
							return this;
						};
					})(p, getter);
				}
			}
			if (fn) {
				fn.$name = setter;
				fn.$owner = proto;
				proto[setter] = fn;
			}
			if (v) {
				if (v instanceof _IntegerProperty) {
					attrs[p] = v.defaultValue;
				} else	if (typeof v.init == "function") {
					inits[p] = v.init;
				} else if (v.hasOwnProperty("value")) {
					attrs[p] = v.value;
				}
			}
			f.$attrs[p] = {
				field: "_" + p,
				value: attrs[p],
				get: proto[getter],
				set: proto[setter]
			};
		}
	}
	if (statics) {
		for (p in statics) {
			f[p] = statics[p];
		}
	}
	if (typeof callback === "function") {
		callback.call(f, f);
	}
	return f;
};
RGBase.prototype.constructor = RGBase;
RGBase.prototype.init = function (nohash) {
	!nohash && (this.$_hash = String(++RGBase.$_hash));
	var f = this.constructor;
	while (f) {
		var inits = f.$inits;
		var attrs = f.$attrs;
		if (attrs) {
			for (var p in attrs) {
				/*
				var v = attrs[p];
				if (v !== UNDEFINED) {
					this["set" + _capitalize(p)].call(this, v);
				} else {
					var fld = "_" + p;
					if (!(fld in this)) {
						this[fld] = UNDEFINED;
					}
				}
				*/
				var v = inits[p];
				var attr = attrs[p];
				if (v) {
					v = v.call(this);
				} else {
					v = attr.value;
				}
				this[attr.field] = v;
			}
		}
		f = f.prototype.$base && f.prototype.$base.constructor;
	}
};
RGBase.prototype.destroy = function (hasDp) {
    var noDestroy = ["VisualStyles","GridStyleSheet"];
    if (!this.$name || noDestroy.indexOf(this.$name) >= 0) {
    	if (this instanceof VisualStyles) {
    		this._listeners = [];
    	}
        return true;
    }

    this._destroying = true;
    var attrkeys = Object.keys(this);
    for (var i = 0, len = attrkeys.length; i < len; i++) {
        var attr = attrkeys[i];
        var obj = this[attr];
        if (attr =="_grid" || attr == "_parent" || attr == "_owner") {
        	this[attr] = null;
        } else if (obj instanceof Array && obj.length > 1  && obj[0] instanceof RGBase) {
            for (var j = 0, arrlen = obj.length; j < arrlen; j++) {
			    if (!hasDp && (obj[j] instanceof DataSource || obj[j] instanceof DataField)) {
			    	// return true;
			    	continue;
			    }
                if (!obj[j]._destroying && obj[j].destroy) {
                	obj[j]._destroying = true;
                	obj[j].destroy(hasDp);
                	obj[j] = null;
                } else {
                    // return false;
                }
            }
            this[attr] = null;
        } else if (obj instanceof RGBase && attr != "_destroying") {
		    if (!hasDp && (obj instanceof DataSource || obj instanceof DataField)) {
			    	continue;
		    	// return true;
		    }
            if (!obj._destroying) {
            	obj._destroying = true;
            	obj.destroy(hasDp) 
            } else {
                // return false;
            }
           	this[attr] = null;
        } else if (_isArray(obj)) {// && obj.length > 0) {
        	// 객체의 property가 배열이면서 내용이 있는 경우 어떻게 해야할것인가? 지금은 객체내부의 destroy에서 일부 해제하고 있다.
        	// this[attr] = null;
        }
    }
    return true;
};

function _throwCallerError() {
	throw new Error("Not supported Function.caller");
}
function _throwInvalidMethod(method) {
	throw new Error("Method is not exists: " + method); 
}
var Base = RGBase.prototype;
RGBase.prototype._super = function () {
	var fn, m = this._super.caller;
	if (m) {
		fn = m.$owner.$base[m.$name];
		if (fn) {
			return fn.apply(this, arguments);
		}
	} else {
		_throwCallerError();
	}
};
RGBase.prototype._inherit = function (fnc) {
	this.constructor.prototype.$base[fnc].apply(this, Array.prototype.slice.call(arguments, 1));
};
RGBase.prototype.className = function () {
	return this.constructor.prototype.$name;
};
RGBase.prototype.baseClass = function () {
	return this.constructor.prototype.$base;
};
RGBase.prototype.baseClassName = function () {
	var base = this.constructor.prototype.$base;
	return base && base.$name;
};
RGBase.prototype.clone = function () {
	var f = this.constructor;
	var obj = new f();
	var attrs = f.$attrs;
	var attr;
	for (var p in attrs) {
		attr = attrs[p];
		obj[attr.field] = this[attr.field];
	}
	return obj;
};
RGBase.prototype.propertyChanged = function (prop, oldValue, newValue) {
};
RGBase.prototype.getAttr = function (prop) {
	var f = this.constructor;
	while (f) {
		var attrs = f.$attrs;
		if (attrs && prop in attrs) {
			return attrs[prop];
		}
		f = f.prototype.$base && f.prototype.$base.constructor;
	}
	return null;
};
RGBase.prototype.getProperty = function (prop) {
	var attr = this.getAttr(prop);
	var v = attr ? (attr.get ? attr.get.call(this) : attr) : UNDEFINED;
	return (v && v.proxy) ? v.proxy() : v;
};
RGBase.prototype.setProperty = function (prop, value) {
	var attr = this.getAttr(prop);
	attr && attr.set && attr.set.call(this, value);
};
RGBase.prototype._initProps = function (config) {
	if (config) {
		for (var prop in config) {
				var name = "_" + prop;
				if (this.hasOwnProperty(name)) {
					this[name] = config[prop];
				}
		}
	}
};
RGBase.prototype.assign = function (source) {
	if (source instanceof RGBase) {
		if (source !== this) {
			var f = source.constructor;
			while (f) {
				var attrs = f.$attrs;
				for (var p in attrs) {
					var thisAttr = this.getAttr(p);
					if (thisAttr && thisAttr.set) {
						attr = attrs[p];
						if (attr.get) {
							var v = attr.get.call(source);
							thisAttr.set.call(this, v);
						}
					}
				}
				f = f.prototype.$base && f.prototype.$base.constructor;
			}
		}
	} else if (_isObject(source)) {
		if (source !== this) {
			for (var p in source) {
				if (source[p] !== UNDEFINED) {
					var attr = this.getAttr(p);
					if (attr && attr.set) {
						attr.set.call(this, source[p]);
					}
				}
			}
		}
	} else {
		this.assignSimple(source);
	}
};
RGBase.prototype.assignSimple = function (source) {
};
RGBase.prototype.assignProps = function (source, props) {
	if (source && source !== this && props) {
		for (var i = 0, cnt = props.length; i < cnt; i++) {
			var p = props[i];
			if (source.hasOwnProperty(p)) {
				var attr = this.getAttr(p);
				if (attr && attr.set) {
					attr.set.call(this, source[p]);
				}
			}
		}
	}
};
function $$_getProxy(v) {
	if (_isArray(v)) {
		var arr = [];
		for (var i = 0, cnt = v.length; i < cnt; i++) {
			arr.push($$_getProxy(v[i]));
		}
		return arr;
	} else if (typeof v.proxy == "function") {
		return v.proxy();
	}
	return v;
}
RGBase.prototype.proxy = function () {
	var attrs;
	var attr;
	var v;
	var obj = {};
	var f = this.constructor;
	while (f) {
		attrs = f.$attrs;
		for (var p in attrs) {
			attr = attrs[p];
			if (attr.get) {
				v = attr.get.call(this);
				if (v && v.noProxy) {
				} else {
					if (v) {
						v = $$_getProxy(v);
					}
					obj[p] = v;
				}
			}
		}
		f = f.prototype.$base && f.prototype.$base.constructor;
	}
	obj.$_hash = this.$_hash;
	return obj;
};
RGBase.prototype.as = function (clazz) {
	return this instanceof clazz ? this : null;
};
var throwDebugError = function (err) {
	if ($_debug) {
		throw err;
	}
};
var _throwAbstractError = function () {
	var caller = arguments.callee.caller; // => function that call throwAbstractError 
	throw Errors.NOT_YET_IMPLEMENTED + ": " + caller.$owner.$name + "::" + caller.$name;
};
var throwAbstractError = _throwAbstractError;
var _cast = function (obj, clazz) {
	return obj instanceof clazz ? obj : null;
};
var EventAware = defineClass(null, null, {
	init: function (nohash) {
		this._super(nohash);
		this._listeners = [];
	},
	destroy: function() {
		this._destroying = true;
		this._listeners = null;
		for (var attr in this) {
			// if (this[attr] instanceof VisualStyles) {
			// 	VisualStyles의 경우 여기서는 처리하지 않는다.
			// }
			if (this[attr] instanceof Rectangle) {
				this[attr] = null;
			}
		}	
		this._super();
	},
	addListener: function (listener, index) {
		if (listener && this._listeners.indexOf(listener) < 0) {
			if (index != undefined && index >= 0)
				this._listeners.splice(index, 0, listener);
			else
				this._listeners.push(listener);
		}
		return this;
	},
	removeListener: function (listener) {
		var i;
		if (listener && (i = this._listeners.indexOf(listener)) >= 0) {
			this._listeners.splice(i, 1);
		}
		return this;
	},
	fireEvent: function (event) {
		var i, listener, callback;
		var cnt = this._listeners.length;
		var args = Array.prototype.slice.call(arguments, 0);
		args[0] = this;
		for (i = 0; i < cnt; i++) {
			listener = this._listeners[i];
			callback = listener[event];
			callback && callback.apply(listener, args);
		}
	},
	fireConfirmEvent: function (event) {
		var i, listener, callback;
		var cnt = this._listeners.length;
		var args = Array.prototype.slice.call(arguments, 0);
		args[0] = this;
		for (i = 0; i < cnt; i++) {
			listener = this._listeners[i];
			callback = listener[event];
			if (callback) {
				var ret = callback.apply(listener, args);
				if (typeof ret === "boolean" && !ret) {
					return false;
				}
			}
		}
		return true;
	},
    fireMessageEvent: function (event) {
        var i, listener, callback;
        var cnt = this._listeners.length;
        var args = Array.prototype.slice.call(arguments, 0);
        args[0] = this;
        for (i = 0; i < cnt; i++) {
            listener = this._listeners[i];
            callback = listener[event];
            if (callback) {
                var ret = callback.apply(listener, args);
                if (typeof ret === "string" && ret) {
                    return ret;
                }
            }
        }
        return null;
    },
    fireObjectEvent: function (event) {
        var i, listener, callback;
        var cnt = this._listeners.length;
        var args = Array.prototype.slice.call(arguments, 0);
        args[0] = this;
        for (i = 0; i < cnt; i++) {
            listener = this._listeners[i];
            callback = listener[event];
            if (callback) {
                var ret = callback.apply(listener, args);
                if (ret) {
                    return ret;
                }
            }
        }
        return null;
    }

});
var EventAware$ = EventAware.prototype;