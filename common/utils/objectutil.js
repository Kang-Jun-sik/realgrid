var $$_compareTextValue = function (v1, v2, caseSensitive, partialMatch) {
	if (v1 === v2) {
		return true;
	}
	var s1 = String(v1);
	var s2 = String(v2);
	if (!s1 && !s2) {
		return true;
	}
	if (!s1 || !s2) {
		return false;
	}
	if (!caseSensitive) {
		s1 = s1.toLowerCase();
		s2 = s2.toLowerCase();
	}
	if (partialMatch) {
		return s2.indexOf(s1) >= 0;
	} else {
		return s1 == s2;
	}
};
var $$_get_obj = function (source, props) {
	var obj = source;
	for (var i = 0, cnt = props.length - 1; i < cnt; i++) {
		var p = props[i];
		var obj2 = obj[p];
		if (obj2 === UNDEFINED) {
			obj2 = obj[p] = {};
		}
		obj = obj2;
	}
	return obj;
};
var $$_expand_object = function (obj) {
	var list = [];
	for (var p in obj) {
		var i = p.indexOf(".");
		if (i >= 0) {
			list.push(p);
		}
	}
	if (list.length > 0) {
		var obj2 = {};
		for (var p in obj) {
			obj2[p] = obj[p];
		}
		obj = obj2;
		for (var j = list.length; j--;) {
			p = list[j];
			var arr = p.split(".");
			var s = arr[0];
			if (s) {
				obj2 = $$_get_obj(obj, arr);
				obj2[arr[arr.length - 1]] = obj[p]; 
			}
		}
	} 
	return obj;
};
var Dictionary = function () {
	this._values = {};
	this._keys = {};
};
Dictionary.prototype = {
	constructor: Dictionary,
	containsKey: function (key) {
		return key && this._values.hasOwnProperty(key.$_hash);
	},
	isEmpty: function () {
		for (var v in this._values) {
			return false;
		}
		return true;
	},
	set: function (key, value) {
		if (!key || !key.$_hash) {
			throw "Invalid key";
		}
		this._values[key.$_hash] = value;
		this._keys[key.$_hash] = key;
	},
	unset: function (key) {
		if (key && this._values.hasOwnProperty(key.$_hash)) {
			delete this._values[key.$_hash];
			delete this._keys[key.$_hash];
			return true;
		}
		return false;
	},
	clear: function () {
		this._values = {};
		this._keys = {};
	},
	get: function (key) {
		return key ? this._values[key.$_hash] : undefined;
	},
	keys: function () {
		var a = [];
		for (var k in this._values) {
			a.push(this._keys[k]);
		}
		return a;
	},
	values: function () {
		var a = [];
		for (var k in this._values) {
			a.push(this._values[k]);
		}
		return a;
	},
	each: function (iterator) {
		for (var k in this._values) {
			iterator.call(null, this._keys[k], this._values[k]);
		}
	},
	checkTrue: function (iterator) {
		for (var k in this._values) {
			if (iterator.call(null, this._keys[k], this._values[k])) {
				return true;
			}
		}
		return false;
	},
	checkFalse: function (iterator) {
		for (var k in this._values) {
			if (!iterator.call(null, this._keys[k], this._values[k])) {
				return true;
			}
		}
		return false;
	}
};