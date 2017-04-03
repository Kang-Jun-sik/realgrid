var TreeDataLoader = defineClass("TreeDataLoader", null, {
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
		if (data) {
			var childrenField = options.childrenField || options.children;
			var iconField = options.iconField || options.icon;
			if (options.fillMode == DataFillMode.APPEND) {
				var parent = this._provider.rowById(options.parentId);
				return this._provider.appendJsonRows(parent, data, options.rows, childrenField, iconField);
			} else {
				return this._provider.setJsonRows(data, options.rows, childrenField, iconField);
			}
			/*
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
			*/
		}/* else {
			this.$_fillEmpty(options)
			return 0;
		}
		*/
		return 0;
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
			var childrenField = options.childrenField || options.children;
			var iconField = options.iconField || options.icon;
			if (options.fillMode == DataFillMode.APPEND) {
				var parent = this._provider.rowById(options.parentId);
				return this._provider.appendXmlRows(parent, data, options.rows, childrenField, iconField);
			} else {
				return this._provider.setXmlRows(data, options.rows, childrenField, iconField);
			}
			/*
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
			*/
		} else {
			/*
			this.$_fillEmpty(options);
			return 0;
			*/
		}
		return 0;
	},
	/**
	 * @param data csv text.
	 * @param options DataLoadOptions.
	 */
	$_loadCsv: function (data, options) {
		var start = options.start;
		var count = options.count;
		var quoted = options.quoted;
		var delimiter = options.delimiter;
		var rows = DataHelper.csvToArray(this._provider, data, start, count, quoted, delimiter);
		if (rows && (count = rows.length) > 0) {
			var treeField = options.treeField || options.tree;
			var childrenField = options.childrenField || options.children;
			var iconField = options.iconField || options.icon;
			var needSorting = options.needSorting || options.sorting;
			if (options.fillMode == DataFillMode.APPEND) {
				var parent = this._provider.rowById(options.parentId);
				return this._provider.appendDataRows(parent, rows, treeField, needSorting, childrenField, iconField);
			} else {
				return this._provider.setRows(rows, treeField, needSorting, childrenField, iconField);
			}
			/*
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
			*/
		}/* else {
			this.$_fillEmpty(options);
			return 0;
		}
		*/
		return 0;
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
