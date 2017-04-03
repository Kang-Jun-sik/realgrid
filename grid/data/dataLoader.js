var /* @internal */ DataPath = defineClass("DataPath", null, {
    init : function() {
        Base.init.call(this);
    }
}, {
    extractJson: function (source, path) {
        var data = source;
        path = path && path.trim(path);
        if (path) {
            var segs = path.split(".");
            for (var k = 0; k < segs.length; k++) {
                var seg = segs[k] && segs[k].trim();
                if (seg) {
                    var i = seg.indexOf("[");
                    var j = seg.lastIndexOf("]");
                    if (i > 0 && j > i) {
                        var s = seg.substring(0, i);
                        var arr = (s != "$") ? data[s] : data;
                        if (_isArray(arr)) {
                            s = seg.substring(i + 1, j);
                            var idx = parseInt(s);
                            if (idx >= 0 && idx < arr.length) {
                                data = arr[idx];
                            } else {
                                data = null;
                            }
                        } else {
                            data = null;
                        }
                    } else if (seg != "$") {
                        data = data[seg];
                    }
                    if (!data) {
                        break;
                    }
                }
            }
        }
        return _isArray(data) ? data : null;
    },
    /**
     * row => root의 "row" elements
     * row.row => root -> row[0] -> "row" elements 즉, row[0].row 와 같다.
     * row[0].row => root -> row[0] -> "row"
     */
    extractXml: function (root, path) {
        var data = null;
        path = path && path.trim();
        if (path) {
            var segs = path.split(".");
            for (var k = 0; k < segs.length; k++) {
                var seg = segs[k] && segs[k].trim();
                if (seg) {
                    var i = seg.indexOf("[");
                    var j = seg.lastIndexOf("]");
                    if (i > 0 && j > i) {
                        var s = seg.substring(0, i);
                        var idx;
                        if (data) {
                            data = _getXmlList(data[0], s);
                        } else {
                            data = _getXmlList(root, s);
                        }
                        if (data) {
                            s = seg.substring(i + 1, j);
                            idx = parseInt(s);
                            data = data[idx];
                        }
                    } else {
                        if (data) {
                            data = _getXmlList(data[0], seg);
                        } else {
                            data = _getXmlList(root, seg);
                        }
                    }
                    if (!data) {
                        break;
                    }
                }
            }
        }
        return data;
    }
});
var DataPath$ = DataPath.prototype;
var DataFillMode = _enum({
	SET: "set",
	APPEND: "append",
	INSERT: "insert",
	UPDATE: "update"
});
var /* @internal */ DataFillOptions = function (source) {
	this.fillMode = DataFillMode.SET;
	this.fillPos = 0;
	this.count = -1;
	this.rootArray = true;
	this.rows = "row";
	this.start = 0;
	this.delimiter = ",";
	this.quoted = false;
	this.parentId = 0;;
	this.childrenField = null;
	this.treeField = null;
	this.iconField = null;
	this.needSorting = false;
	if (source) {
		if (source.hasOwnProperty("append")) {
			this.fillMode = DataFillMode.APPEND;
		}
		if (source.hasOwnProperty("fillMode")) {
			this.fillMode = source.fillMode;
		}
		if (source.hasOwnProperty("fillPos")) {
			this.fillPos = source.fillPos;
		}
		if (source.hasOwnProperty("count")) {
			this.count = source.count;
		}
		if (source.hasOwnProperty("rootArray")) {
			this.rootArray = source.rootArray;
		}
		if (source.hasOwnProperty("rows")) {
			this.rows = source.rows;
		}
		if (source.hasOwnProperty("start")) {
			this.start = source.start;
		}
		if (source.hasOwnProperty("delimiter")) {
			this.delimiter = source.delimiter;
		}
		if (source.hasOwnProperty("quoted")) {
			this.quoted = source.quoted;
		}
		for (var p in source) {
			if (source[p] !== undefined) {
				this[p] = source[p];
			}
		}
		this.parentId = source.parentId || source.parent;
		this.childrenField = source.childrenField || source.children;
		this.treeField = source.treeField || source.tree;
		this.iconField = source.iconField || source.icon;
		this.needSorting = source.needSorting || source.sorting;
	}
};
var DataLoader = defineClass("DataLoader", null, {
	init: function (provider) {
		Base.init.call(this);
		this._provider = provider;
	},
	load: function (type, data, options) {
		options = new DataFillOptions(options);
		if (this.$_checkEmpty(data, options)) {
			return 0;
		}
		this.$_prepareLoad(data, options);
		type = type && type.toLowerCase();
		switch (type) {
			case "json": return this.$_loadJson(data, options);
			case "xml": return this.$_loadXml(data, options);
			case "csv": return this.$_loadCsv(data, options);
		}
		return 0;
	},
	/**
	 * @param data Json array 이거나 Json object.
	 * @param options DataLoadOptions.
	 */
	$_loadJson: function (data, options) {
		if (typeof data === "string") {
			data = JSON.parse(data);
		}
		var rows = null;
		if (options.rootArray) {
			rows = _asArray(data);
		}
		if (!rows) {
			rows = DataPath.extractJson(data, options.rows);
		}
		if (rows) {
			var fillPos = options.fillPos;
			var start = options.start;
			var count = options.count;
			switch (options.fillMode) {
				case DataFillMode.APPEND:
					this._provider.addRows(rows, start, count);
					break;
				case DataFillMode.INSERT:
					this._provider.insertRows(fillPos, rows, start, count);
					break;
				case DataFillMode.UPDATE:
					this._provider.updateRows(fillPos, rows, start, count);
					break;
				case DataFillMode.SET:
				default:
					this._provider.setRows(rows, start, count);
					break;
			}
			return rows.length;
		} else {
			this.$_fillEmpty(options)
			return 0;
		}
	},
	/**
	 * @param data Xml dom 객체이거나 Xml string.
	 * @param options DataLoadOptions.
	 */
	$_loadXml: function (data, options) {
		if (typeof data === "string") {
			data = _parseXml(data);
		}
		if (data && data.documentElement) {
			var fillPos = options.fillPos;
			var start = options.start;
			var count = options.count;
			var rowProp = options.rows;
			var rows = DataPath.extractXml(data.documentElement, rowProp);
			switch (options.fillMode) {
				case DataFillMode.APPEND:
					this._provider.appendXmlRows(rows, start, count);
					break;
				case DataFillMode.INSERT:
					this._provider.insertXmlRows(fillPos, rows, start, count);
					break;
				case DataFillMode.UPDATE:
					this._provider.updateXmlRows(fillPos, rows, start, count);
					break;
				case DataFillMode.SET:
				default:
					this._provider.setXmlRows(rows, start, count);
					break;
			}
			return rows.length;
		} else {
			this.$_fillEmpty(options);
			return 0;
		}
	},
	/**
	 * @param data csv text.
	 * @param options DataLoadOptions.
	 */
	$_loadCsv: function (data, options) {
		var fillPos = options.fillPos;
		var start = options.start;
		var count = options.count;
		var quoted = options.quoted;
		var delimiter = options.delimiter;
		var rows = DataHelper.csvToArray(this._provider, data, start, count, quoted, delimiter);
		if (rows && (count = rows.length) > 0) {
			switch (options.fillMode) {
				case DataFillMode.APPEND:
					this._provider.addRows(rows, 0, count);
					break;
				case DataFillMode.INSERT:
					this._provider.insertRows(fillPos, rows, 0, count);
					break;
				case DataFillMode.UPDATE:
					this._provider.updateRows(fillPos, rows, 0, count);
					break;
				case DataFillMode.SET:
				default:
					this._provider.setRows(rows, 0, count);
					break;
			}
			return rows.length;
		} else {
			this.$_fillEmpty(options);
			return 0;
		}
	},
	$_fillEmpty: function (options) {
		if (options.fillMode === DataFillMode.SET) {
			this._provider.setRows(null);
		}
	},
	$_checkEmpty: function (data, options) {
		if (!data) {
			this.$_fillEmpty(options);
			return true;
		}
		return false;
	},
	$_prepareLoad: function (options) {
		var filters = null;
		if (options.filters) {
			filters = new DataFilterCollection(this._provider.filterRuntime(), options.filters);
			options.filterMode && filters.setFilterMode(options.filterMode);
		}
	}
});