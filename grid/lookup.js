var /* abstract */ LookupSource = defineClass("LookupSource", EventAware, {
	init: function (id) {
		this._super();
		this._id = id;
	},
	id: function () {
		return this._id;
	},
	clear: function () {
	},
	load: function (options) {
	},
	exists: function (/*keys*/) {
		return false;
	},
	fill: function (keys, values) {
	},
	fillRows: function (rows) {
	},
	add: function (keys, value) {
	},
	addRow: function (row) {
	},
	lookup: function () {
		return undefined;
	},
	getDomain: function (/*keys*/) {
		return null;
	},
	getTextDomain: function (/*keys*/) {
		return null;
	},
	_changed: function () {
		this.fireEvent(LookupSource.CHANGED);
	}
});
LookupSource.CHANGED = "onLookupSourceChanged";
var /* abstract */ LookupSourceProvider = defineClass("LookupSourceProvider", EventAware, {
	init: function (id) {
		this._super();
		this._id = id;
	},
	getSource: function (id) {
		return null;
	},
	_changed: function () {
		this.fireEvent(LookupSourceProvider.CHANGED);
	}
});
LookupSourceProvider.CHANGED = "onLookupSourceProviderChanged";
var LocalLookupSourceProvider = defineClass("LocalLookupSourceProvider", LookupSourceProvider, {
	init: function (config) {
		this._super();
		this._sources = {};
		config && this.load(config);
	},
	/**
	 * [{
	 * 		id: "id",
	 * 		type: "table" | "tree",
	 * 		levels: 2 // for tree
	 * }, {
	 * }]
	 */
	load: function (config) {
		if (config !== this) {
			this._sources = {};
			if (_isArray(config)) {
				for (var i = 0, cnt = config.length; i < cnt; i++) {
					this.$_add(config[i]);
				}
			} else if (config) {
				this.$_add(config);
			}
			this._changed();
		}
	},
	add: function (config) {
		var source = this.$_add(config);
		source && this._changed();
		return source;
	},
	remove: function (id) {
		if (this.$_remove(id)) {
			this._changed();
		}
	},
	getSource: function (id) {
		return this._sources[id];
	},
	$_createSource: function (src) {
		var source = null;
		if (src) {
			var type = src.type;
			type = type ? type.toLowerCase() : null;
				var tree = new LookupTree(src.id, src.levels, src.ordered);
				tree.fill(src.keys, src.values);
				source = tree;
		}
		return source;
	},
	$_add: function (config) {
		if (config && config.id) {
			if (this._sources[config.id] !== config) {
				var source = this.$_createSource(config);
				if (source) {
					this.$_remove(config.id);
					this._sources[config.id] = source;
					source.addListener(this);
					return source;
				}
			}
		}
		return null;
	},
	$_remove: function (id) {
		if (id) {
			var source = this._sources[id];
			if (source) {
				source.removeListener(this);
				delete this._sources[id];
				return true;
			}
		}
		return false;
	},
	onLookupSourceChanged: function (source) {
		this._changed();
	}
});
var LookupTree = defineClass("LookupTree", LookupSource, {
	init: function (id, levels, ordered) {
		id = arguments.length > 0 ? id : null;
		levels = arguments.length > 1 ? levels : -1;
		ordered = arguments.length > 2 ? ordered : false;
		this._super(id);
		if (levels < 1 ) {
			throw "LookupTable levels must be equals or greater than 1";
		}
		this._levels = levels;
		this._tree = {};
		this._listMap = ordered ? {} : null;
	},
	clear: function () {
		this._tree = {};
		this._changed();
	},
	load: function (options) {
	},
	exists: function (keys) {
		var len;
		if (keys && (len = keys.length) > 0 && len <= this._levels) {
			len = Math.min(len, this._levels) - 1;
			if (len > 0) {
				var key;
				var map = this._tree;
				for (var i = 0; i < len; i++) {
					key = keys[i];
					map = map[key];
					if (!map) {
						break;
					}
				}
				return map != null && map.hasOwnProperty(keys[len]);
			} else {
				return this._tree.hasOwnProperty(keys[0]);
			}
		}
		return false;
	},
	fill: function (keys, values) {
		if (keys && keys.length > 0 && values && values.length > 0) {
			var cnt = Math.min(keys.length, values.length);
			for (var i = 0; i < cnt; i++) {
				var k = keys[i];
				if (!_isArray(k)) {
					k = [k];
				}
				this.$_add(k, values[i]);
			}
			this._changed();
		}
	},
	fillRows: function (rows) {
		var cnt;
		if (rows && (cnt = rows.length) > 0) {
			for (var i = 0; i < cnt; i++) {
				this.$_addRow(rows[i]);
			}
			this._changed();
		}
	},
	add: function (keys, value) {
		if (keys) {
			this.$_add(keys, value);
			this._changed();
		}
	},
	addRow: function (row) {
		if (row) {
			this.$_addRow(row);
			this._changed();
		}
	},
	lookup: function (keys, valueSeparator) {
		if (this._levels > 1) {
			var i, key;
			var map = this._tree;
			var len = this._levels - 1;
			for (i = 0; i < len; i++) {
				key = keys[i];
				map = map[key];
				if (!map) {
					break;
				}
			}
		} else {
			map = this._tree;
		}
		key = keys[keys.length-1];
		if (map && key && valueSeparator) {
			var values = key.split(valueSeparator);
			var ret = [];
			for (var i = 0, cnt = values.length; i < cnt ; i++) {
				ret.push(map[values[i]] ? map[values[i]] : values[i]);
			}
			return ret.join(valueSeparator);
		} else {
			return map ? map[key] : undefined;
		}
	},
	getDomain: function (keys) {
		if (!keys || keys.length != this._levels - 1) {
			throw "Keys length must be " + (this._levels - 1);
		}
		var i, cnt, k;
		var domain = [];
		var values = [];
		var key;
		var dic = this._tree;
		if (this._levels > 1) {
			cnt = keys.length;
			for (i = 0; i < cnt; i++) {
				key = keys[i];
				dic = dic[keys[i]];
				if (!dic) {
					return {
						keys: domain,
						values: values
					};
				}
			}
		}
		if (this._listMap) {
			var list = this._listMap[key];
			cnt = list.length;
			for (i = 0; i < cnt; i++) {
				domain.push(list[i]);
				values.push(dic[list[i]]);
			}
		} else {
			for (k in dic) {
				domain.push(k);
				values.push(dic[k]);
			}
		}
		return {
			keys: domain,
			values: values
		}
	},
	getTextDomain: function (keys) {
		var i, cnt;
		var domain = this.getDomain(keys);
		var keys = domain.keys;
		var vals = domain.values;
		for (i = 0, cnt = keys.length; i < cnt; i++) {
			keys[i] = keys[i] ? String(keys[i]) : null;
			vals[i] = vals[i] ? String(vals[i]) : null;
		}
		return domain;
	},
	$_add: function (keys, value) {
		if (!keys) {
			return;
		}
		var k;
		var levels = this._levels;
		var len = _isArray(keys) ? keys.length : 1;
		if (len < levels) {
			throw Error("Keys length must be equals or greater than " + levels);
		}
		if (levels > 1) {
			var i, key, node;
			var map = this._tree;
			for (i = 0, len = levels - 1; i < len; i++) {
				key = keys[i];
				node = map[key];
				if (!node) {
					node = {};
					map[key] = node;
				}
				map = node;
			}
			map[k = keys[len]] = value;
		} else {
			this._tree[k = keys] = value;
		}
		if (this._listMap) {
			var list = this._listMap[key];
			if (!_isArray(list)) {
				list = [];
				this._listMap[key] = list;
			}
			list.push(k);
		}
	},
	$_addRow: function (row) {
		if (row) {
			var len = row.length;
			if (len - 1 < this._levels ) {
				throw Error("Keys length must be equals or greater than " + this._levels);
			}
			var v = row[this._levels];
			row = row.slice(0, this._levels);
			this.$_add(row, v);
		}
	}
});