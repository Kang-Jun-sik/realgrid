var /* @internal */ ColumnGroupProxy = defineClass("ColumnGroupProxy", ColumnGroup, {
	init: function (source) {
		ColumnGroup$.init.call(this);
		this._items = null;
		if (source) {
			this.assignProps(source, [
				"name", "tag", "saveWidth", "width", "fillWidth", "fillHeight",
				"visible", "resizable", "movable",
				"styles",
				"orientation", "hideChildHeaders"
			]);
			var header = source.header;
			if (typeof header == "string") {
				this.header().setText(header);
			} else if (header) {
				this.header().assign(header);
			}
		}
	},
	build: function (grid) {
		var columns = ColumnGroupProxy.buildColumns(grid, this._items);
		ColumnGroup$.setColumns.call(this, columns);
	},
	setColumns: function (value) {
		this._items = value;
	}
}, {
	buildColumns: function (grid, items) {
		var columns = [];
		if (items) {
			var item;
			var column;
			for (var i = 0, cnt = items.length; i < cnt; i++) {
				item = items[i];
				if (item instanceof ColumnGroupProxy) {
					item.build(grid);
					columns.push(item);
				} else if (item instanceof Column) {
					columns.push(item);
				} else if (typeof item == "string") {
					column = grid.layoutColumnByName(item);
					if (column) {
						columns.push(column);
					}
				} else if (item && item.name) {
					column = grid.layoutColumnByName(item.name);
					if (column) {
						column.assignProps(item, [
							"tag", "saveWidth", "width", "fillWidth", "fillHeight",
							"visible", "resizable", "movable",
							"styles"
						]);
						columns.push(column);
					}
				}
			}
		}
		return columns;
	}
}); 
var ColumnLayout = defineClass("ColumnLayout", null, {
	init: function (name) {
		Base.init.call(this);
		this._name = name;
	},
	name: null,
	items: null,
	build: function (grid) {
		var columns = ColumnGroupProxy.buildColumns(grid, this._items);
		this.$_validate(columns);
		return columns;
	},
	$_validate: function (columns) {
		if (columns && columns.length > 0) {
			var list = [];
			this.$_validateColumns(columns, list);
		}
	},
	$_validateColumns: function (columns, list) {
		for (var i = columns.length - 1; i >= 0; i--) {
			var column = columns[i];
			if (list.indexOf(column) >= 0) {
				throw new Error("Column is dupulicated: " + column.name());
			}
			list.push(column);
			if (column instanceof ColumnGroup) {
				this.$_validateColumns(column.columns(), list);
			}
		}
	}
}, {
	create: function (source) {
		if (source) {
			var items = _isArray(source) ? source : source.columns;
			var colMap = {};
			items = ColumnLayout.$_parseColumns(items, colMap);
			if (items) {
				var layout = new ColumnLayout(_isArray(source) ? null : source.name);
				layout.setItems(items);
				return layout;
			}
		}
		return null;
	},
	$_parseColumns: function (items, colMap) {
		var columns = [];
		if (items) {
			for (var i = 0, cnt = items.length; i < cnt; i++) {
				var c = items[i];
				var col = null;
				if (typeof c == "string") {
					if (!colMap.hasOwnProperty(c)) {
						colMap[c] = 1;
						col = c;
					}
				} else if (c) {
					if (c.type == "group") {
						col = ColumnLayout.$_parseGroup(c, colMap);
					} else if (c.hasOwnProperty("columns") && _isArray(c.columns) && c.columns.length > 0) {
						col = ColumnLayout.$_parseGroup(c, colMap);
					} else if (c.name) {
						if (!colMap.hasOwnProperty(c.name)) {
							colMap[c.name] = 1;
							col = c;
						}
					}
				}
				if (col) {
					columns.push(col);
				}
			}
		}
		return columns;
	},
	$_parseGroup: function (source, colMap) {
		var group = new ColumnGroupProxy(source);
		var columns = source.columns;
		if (columns) {
			columns = ColumnLayout.$_parseColumns(columns, colMap);
			group.setColumns(columns);
		}
		return group;
	}
}); 
var ColumnLayoutCollection = defineClass("ColumnLayoutCollection", null, {
	init : function() {
		Base.init.call(this);
		this._layouts = [];
	},
	items: function () {
		return this._layouts.concat();
	},
	count: function () {
		return this._layouts.length;
	},
	getItem: function (index) {
		if (index < 0 || index >= this._layouts.length) {
			throw "Invalid ColumnLayoutCollection index: " + index;
		}
		return this._layouts[index];
	},
	find: function (name) {
		for (var i = 0, cnt = this._layouts.length; i < cnt; i++) {
			if (this._layouts[i].name() == name) {
				return this._layouts[i];
			}
		}
		return null;
	},
	clear: function () {
		this._layouts = [];
	},
	load: function (source) {
		if (source) {
			var layout;
			if (_isArray(source)) {
				for (var i = 0, cnt = source.length; i < cnt; i++) {
					layout = ColumnLayout.create(source[i]);
					if (layout) {
						this._layouts.push(layout);
					}
				}
			} else {
				layout = ColumnLayout.create(source);
				if (layout) {
					this._layouts.push(layout);	
				}
			}
		}
	}
}); 