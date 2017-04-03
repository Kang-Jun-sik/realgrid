var _vm__ = "goAAAANSUhEUgAAA";
var $$_getColumnProxy = function (column) {
	if (column instanceof Column) {
		var proxy = {
			name : column.name(),
			tag : column.tag(),
			parent : column.parent() ? column.parent().name() : null,
			visible : column.isVisible(),
			resizable : column.isResizable(),
			movable: column.isMovable(),
			width: column.width(),
			displayIndex: column.displayIndex(),
			displayWidth: column.displayWidth(),
			fillWidth: column.fillWidth(),
			fillHeight: column.fillHeight(),
            checked: column.isChecked(),
			$_hash: column.$_hash
		};
		if (column instanceof DataColumn) {
			proxy.type = "data";
			proxy.editor = column.editor();
			proxy.fieldIndex = column.fieldIndex();
			proxy.fieldName = column.fieldName();
			proxy.dataIndex = column.dataIndex();
			proxy.sortable = column.isSortable();
			proxy.button = column.button();
            proxy.buttonVisibility = column.buttonVisibility();
            proxy.editButtonVisibility = column.editButtonVisibility();
			proxy.defaultValue = column.defaultValue();
			proxy.required = column.isRequired();
			proxy.requiredLevel = column.requiredLevel();
			proxy.requiredMessage = column.requiredMessage();
			proxy.textInputCase = column.textInputCase();
			proxy.nanText = column.nanText();
			proxy.lookupDisplay = column.isLookupDisplay();
			proxy.labels = column.lookupLabels() || [];
			proxy.values = column.lookupValues() || [];
			proxy.labelField = column.labelField();
			proxy.lookupSourceId = column.lookupSourceId();
			proxy.lookupKeyFields = column.lookupKeyFields();
			proxy.imageList = column.imageList();
			proxy.imeMode = "";//column.imeMode();
		} else if (column instanceof ColumnGroup) {
			proxy.type = "group";
			proxy.orientation = column.orientation();
			proxy.hideChildHeaders = column.isHideChildHeaders();
		} else if (column instanceof SeriesColumn) {
			proxy.type = "series";
			proxy.fieldNames = column.fieldNames();
		}
		return proxy;
	}
	return null;
};
var $$_getFieldProxy = function (field) {
	if (field instanceof DataField) {
		var proxy = {
	        fieldName : field.fieldName(),
	        dataType : field.dataType(),
	        subType : field.subType(),
			subtypeEnabled: field.isSubtypeEnabled(),
	        length : field.length(),
			set: field.set(),
			minimum: field.minimum(),
			maximum: field.maximum(),
			required: field.isRequired(),
		    updatable: field.isUpdatable(),
	        defaultValue : field.defaultValue(),
			booleanFormat: field.booleanFormat(),
			datetimeFormat: field.datetimeFormat(),
			amText: field.amText(),
			pmText: field.pmText(),
			baseYear: field.baseYear(),
	        header : field.header(),
			baseField : field.baseField(),
			calculateExpression: field.calculateExpression(),
			calculateCallback: field.calculateCallback() && field.calculateCallback().toString && field.calculateCallback().toString(),
			$_hash: field.$_hash
		};
		return proxy;
	}
	return null;
};
var $$_getColumnGroupProxy = function (column) {
	var proxy = $$_getColumnProxy(column);
	if (column instanceof ColumnGroup) {
		var cols = proxy.columns = [];
		for (var i = 0, cnt = column.count(); i < cnt; i++) {
			cols.push($$_getColumnGroupProxy(column.getItem(i)));
		}
	}
	return proxy;
};
var $$_getSelectionProxy = function (grid, item) {
	var range = item.getBounds();
	var item1 = grid.getItem(range.R1());
	var item2 = grid.getItem(range.R2());
	return {
		style: item.style(),
		startItem: range.R1(),
		startRow: item1 ? item1.dataRow() : -1,
		startColumn: range.C1().name(),
		endItem: range.R2(),
		endRow: item2 ? item2.dataRow() : -1,
		endColumn: range.C2().name()
	};
};
var $$_getSelectionItems = function (grid, item) {
	var range = item.getBounds();
	var item1 = grid.getItem(range.R1());
	var item2 = grid.getItem(range.R2());
	var i = item1.index();
	var i2 = item2.index();
	var rows = [];
	for (; i <= i2; i++) {
		rows.push(i);
	}
	return rows;
};
var $$_getSelectionRows = function (grid, item) {
	var range = item.getBounds();
	var item1 = grid.getItem(range.R1());
	var item2 = grid.getItem(range.R2());
	var i = item1.index();
	var i2 = item2.index();
	var rows = [];
	var items = grid.itemSource();
	for (; i <= i2; i++) {
		item1 = items.getItem(i);
		if (item1.dataRow() >= 0) {
			rows.push(item1.dataRow());
		}
	}
	return rows;
};
var $$_getItemIndicies = function (items) {
	var idxs = [];
	for (var i = 0, cnt = items.length; i < cnt; i++) {
		idxs.push(items[i].index());
	}
	return idxs;
}
var $$_getTreeRowIds = function (rows) {
	var idxs = [];
	for (var i = 0, cnt = rows.length; i < cnt; i++) {
		idxs.push(rows[i].rowId());
	}
	return idxs;
}
var RealGridHelper = function () {
    this.createGrid = function (containerId, handler, readMode) {
        var gridContainer = new GridContainer(false, containerId, readMode);
        handler._gv = gridContainer.gridView();
        this.initGrid(handler._gv);
        this.setGridHandler(handler);
    };
    this.createHtmlGrid = function (containerId, handler) {
        var gridContainer = new GridContainer(true, containerId);
        handler._gv = gridContainer.gridView();
        this.initGrid(handler._gv);
        this.setGridHandler(handler);
    };
    this.createTree = function (containerId, handler, readMode) {
        var treeContainer = new TreeContainer(false, containerId, readMode);
        handler._gv = treeContainer.gridView();
        handler._gv._productName = "RealGridJS v1.0";
        this.initGrid(handler._gv);
        this.setTreeHandler(handler);
    };
    this.createHtmlTree = function (containerId, handler) {
        var treeContainer = new TreeContainer(true, containerId);
        handler._gv = treeContainer.gridView();
        handler._gv._productName = "RealGridJS v1.0";
        this.initGrid(handler._gv);
        this.setTreeHandler(handler);
    };
	var _createField = function (provider, source) {
		var field = null;
		if (typeof source == "string") {
			field = new DataField(source, ValueType.TEXT, 0);
		} else if (source && source.fieldName) {
			field = new DataField(source.fieldName, source.dataType, source.length);
			if (source.datetimeFormat && source.datetimeFormat == "flash") {
				source.datetimeFormat = "platform";
			}
			field._typeLock = true;
			try {
				field.assign(source);
				if (source) {
					if (!source.hasOwnProperty("minimum") && source.hasOwnProperty("min")) {
						field.setMinimum(source.min);
					}
					if (!source.hasOwnProperty("maximum") && source.hasOwnProperty("max")) {
						field.setMaximum(source.max);
					}
				}
			} finally {
				field._typeLock = false;
			}
			return field;
		}
		return field;
	};
	var _createFields = function (provider, source) {
		if (_isArray(source)) {
			var fields = [];
			for (var i = 0, cnt = source.length; i < cnt; i++) {
				var fld = _createField(provider, source[i]);
				fld && fields.push(fld);
			}
			return fields;
		}
		return null;
	};
	this.setDataFields = function (provider, source) {
		var flds = _createFields(provider, source);
		provider.setFields(flds);
	};
	var _getItemProxy = function (item, extended) {
		var p = item._parent;
		var obj = {
			type: undefined,
			id: item._id,
			parentId: p && !(p instanceof RootItem) ? p.id() : NaN,
			itemIndex: item._index,
			dataRow: -1,
			checked: item.isChecked()
		};
		if (extended) {
			obj.childIndex = item.childIndex();
			obj.level = item.level();
		}
		if (item instanceof GridRow) {
			obj.type = "row";
			obj.dataRow = item.dataRow();
		} else if (item instanceof GroupItem) {
			obj.count = item._children.length;
			obj.expanded = item._expanded;
			if (item instanceof GroupItemImpl || item instanceof MergedGroupHeader) {
				obj.type = "group";
				obj.footerId = item._footer ? item._footer.id() : NaN;
			} else if (item instanceof TreeItem) {
				obj.type = "tree";
				obj.dataRow = item._dataRow ? item._dataRow.rowId() : -1;
			}
            obj.$_child = obj.count > 0 ? item._children[0]._index : -1;
		} else if (item instanceof GroupFooter) {
			obj.type = "footer";
		}
		return obj;
	};
	this.$_setMobile = function (value) {
		$$_setMobile(value);
	};
	this.$_isMobile = function () {
		return _isMobile();
	};
	this.toProxy = function (values) {
		if (_isArray(values)) {
			var proxies = [];
			for (var i = 0, cnt = values.length; i < cnt; i++) {
				var v = values[i];
				proxies.push(v instanceof Column ? $$_getColumnProxy(v) : v && v.proxy());
			}
			return proxies;
		} else if (values) {
			return values instanceof Column ? $$_getColumnProxy(values) : values.proxy();
		}
		return null;
	};
	this.setDataProviderHandler = function (handler) {
		new RealGridDataObserver(handler);
	};
	this.setGridHandler = function (handler) {
		new RealGridObserver(handler);
	};
	this.setTreeDataProviderHandler = function (handler) {
		new RealTreeDataObserver(handler);
	};
	this.setTreeHandler = function (handler) {
		new RealTreeObserver(handler);
	};
	this.ping = function (grid, message) {
		if (grid instanceof GridBase) {
			alert(message);
		}
	};
	this.refreshGrid = function (grid) {
		grid.refreshView();
	};
	this.getDataOptions = function (provider) {
		var options = provider.proxy();
		options.datetimeFormat = options.datetimeFormat || options.dateFormat; 
		delete options.dateFormat;
		return options;
	};
	this.setDataOptions = function (provider, options) {
		provider.assign(options);
		if (options.hasOwnProperty("datetimeFormat")) {
			provider.setDateFormat(options.datetimeFormat);
		}
	};
	this.getDataFields = function (provider) {
		var fields = provider.getFields();
		var flds = [];
		for (var i = 0; i < fields.length; i++) {
			var f = fields[i];
			flds.push(f.proxy())
			// flds.push({
			// 	fieldName: f.fieldName(),
			// 	orgFieldName: f.orgFieldName(),
			// 	dataType: f.dataType(),
			// 	length: f.length(),
			// 	defaultValue: f.defaultValue(),
			// 	baseField: f.baseField()
			// });
		}
		return flds;
	};
	this.getDataValues = function (provider, row) {
		if (provider instanceof LocalTreeDataProvider) {
			var r = provider.rowById(row);
			return r ? r.values() : null;
		} else {
			return provider.getRow(row);
		}
	};
	this.loadData = function (provider, type, data, options) {
		new DataLoader(provider).load(type, data, options);
	};
	this.getDataValue = function (provider, row, field) {
		if (typeof field == "string") {
			field = provider.getFieldIndex(field);
		}
		return provider.getValue(row, field);
	};
	this.setDataValue = function (provider, row, field, newValue) {
		if (typeof field == "string") {
			field = provider.getFieldIndex(field);
		}
		return provider.setValue(row, field, newValue);
	};
	this.initGrid = function (grid) {
		grid.displayOptions()._emptyMessage = "Load data...";
        grid._productName = 'RealGridJS v1.0';
	};
	this.resetSize = function (grid, callback) {
		grid.container().resetSize(callback);
	};
	this.setOptions = function (grid, options) {
        options && grid.setOptions(options);
        /*
		if (options) {
			grid.setOptions(options);
			grid.displayOptions().assign(options.display);
			grid.editOptions().assign(_pick(options.editing, options.edit));
			grid.fixedOptions().assign(options.fixed);
			grid.selectOptions().assign(_pick(options.selecting, options.select, options.selection));
			grid.sortingOptions().assign(_pick(options.sorting, options.sort));
			grid.filteringOptions().assign(_pick(options.filtering, options.filter));
			grid.groupingOptions().assign(options.grouping);
			grid.copyOptions().assign(options.copy);
			grid.pasteOptions().assign(options.paste);
			grid.setBody(options.body);
			grid.setPanel(options.panel);
			grid.setIndicator(options.indicator);
			grid.setStateBar(options.stateBar);
			grid.setCheckBar(options.checkBar);
			grid.setEditBar(options.editBar);
			grid.setHeader(options.header);
			grid.setFooter(options.footer);
			grid.setRowGroup(options.rowGroup);
		}
         */
	};
	this.isVisible = function (grid) {
		return grid._container.isVisible();
	};
	this.setVisible = function (grid, value) {
		grid._container.setVisible(value);
	};
	this.mouseToIndex = function (grid, x, y) {
		var index = grid.pointToIndex(x, y, true);
		return index ? index.proxy() : CellIndex.nullProxy();
	};
	this.getCellBounds = function (grid, itemIndex, column, outer) {
		var col = this.$_getColumn(grid, column);
		var cell = CellIndex.temp(grid, itemIndex, col, outer);
		var bound = grid.getCellBounds(cell, outer);
		if (bound) {
			return {
				x: bound.x,
				y: bound.y,
				width: bound.width,
				height: bound.height
			};
		} else {
			return null;
		}
	};
	this.getColumns = function (grid) {
		var root = grid._rootColumn;
		var columns = [];
		for (var i = 0, cnt = root.count(); i < cnt; i++) {
			columns.push($$_getColumnGroupProxy(root.getItem(i)));
		}
		return columns;
	};
	this.$_getColumn = function (grid, column) {
		if (!grid) {
			if ($_debug) debugger;
		}
		if (typeof column === "string") {
			return grid.columnByName(column);
		} else if (column && column.$_hash) {
			return grid.columnByHash(column.$_hash);
		}
		return null;
	};
	this.getColumnProperty = function (grid, column, prop) {
		var col = this.$_getColumn(grid, column);
		if (col && prop) {
			var v = prop == "styles" ? col.styles().toProxy() : col.getProperty(prop);
            return v;
		}
		return undefined;
	};
	this.$_fireColumnPropertyChanged = function (grid, col, prop, value) {
		var fireEventProps = ["displayIndex","width","visible"];
		fireEventProps.indexOf(prop) >= 0 && grid._fireColumnPropertyChanged(col, prop, value);
	};
	this.setColumnProperty = function (grid, column, prop, value) {
		var col = this.$_getColumn(grid, column);
		if (col && prop) {
			var oldValue = col.getProperty(prop);
            prop == "styles" ? col.styles().extend(value) : col.setProperty(prop, value);
            oldValue !== col.getProperty(prop) && this.$_fireColumnPropertyChanged(grid, col ,prop ,col.getProperty(prop));
		}
	};
	this.setColumn = function (grid, value) {
		var col = this.$_getColumn(grid, value);
		if (col) {
			var keys = Object.keys(value);
			var key;
			var v = {};
			for (var i = 0, cnt = keys.length; i < cnt ; i++) {
				key = keys[i];
				if (col.getProperty(key) != undefined && col.getProperty(key) !== value[key]) {
					(v[key] = value[key]);
				}
			}
			col.assign(value);
			if (col instanceof DataColumn) {
				if (value.hasOwnProperty("values") || value.hasOwnProperty("labels")) {
					var obj = {};
					if (value.hasOwnProperty("values")) {
						obj.lookupValues = value.values;
					}
					if (value.hasOwnProperty("labels")) {
						obj.lookupLabels = value.labels;
					}
					col.assign(obj);
				}
			}
			for (key in v) {
				this.$_fireColumnPropertyChanged(grid, col, key ,v[key]);
			}
		}
	},
	this.fieldByName = function (provider, name) {
		var field = provider.fieldByName(name);
		return field && $$_getFieldProxy(field);
	};
	this.columnByName = function (grid, name) {
		var column = grid.columnByName(name);
		return column && $$_getColumnProxy(column);
	};
	this.columnByField = function (grid, fieldName) {
		var column = grid.columnByFieldName(fieldName);
		return column && $$_getColumnProxy(column);
	};
	this.columnsByField = function (grid, fieldName) {
		var columns = grid.columnsByFieldName(fieldName);
		if (columns) {
			var proxies = [];
			for (var i = 0, cnt = columns.length; i < cnt; i++) {
				proxies.push($$_getColumnProxy(columns[i]));
			}
			return proxies;
		}
		return null;
	};
	this.columnByTag = function (grid, tag) {
		var column = grid.columnByTag(tag);
		return column && $$_getColumnProxy(column);
	};
	this.columnsByTag = function (grid, tag) {
		var columns = grid.columnsByTag(tag);
		if (columns) {
			var proxies = [];
			for (var i = 0, cnt = columns.length; i < cnt; i++) {
				proxies.push($$_getColumnProxy(columns[i]));
			}
			return proxies;
		}
		return null;
	};
	this.getDisplayColumns = function (grid) {
		function getGroupLayout(group) {
			var groupLayout = {
				name: group.name(),
				orientation: group.orientation(),
				saveWidth: group.saveWidth(),
				columns: []
			};
			if (group.header && group.header()) {
				groupLayout.header = group.header().text();
			}
			for (var i = 0, cnt = group.visibleCount(); i < cnt; i++) {
				var c = group.getVisibleItem(i);
				if (c.isVisible()) {
					if (c instanceof ColumnGroup) {
						groupLayout.columns.push(getGroupLayout(c));
					} else if (c.name()) {
						groupLayout.columns.push(c.name());
					}
				}
			}
			return groupLayout;
		}
		var columnLayout = [];
		if (grid) {
			for (var i = 0, cnt = grid.visibleColumnCount(); i < cnt; i++) {
				var c = grid.getVisibleColumn(i);
				if (c.isVisible()) {
					if (c instanceof ColumnGroup) {
						columnLayout.push(getGroupLayout(c));
					} else if (c.name()) {
						columnLayout.push(c.name());
					}
				}
			}
		}
		return columnLayout;
	};
    this.getColumnGroupNames = function (grid) {
        var names = [];
        var groups = grid.collectGroups();
        if (groups) {
            for (var i = 0, cnt = groups.length; i < cnt; i++) {
                var group = groups[i];
                var name;
                if (group && (name = group.name())) {
                    names.push(name);
                }
            }
        }
        return names;
    };
	this.saveColumnLayout = function (grid) {
		function getColumnLayout(column) {
			var layout = {
				name: column.name(),
				saveWidth: column.saveWidth() ? column.saveWidth() : column.width(),
				visible: column.isVisible()
			};
			var header = column.header && column.header();
			if (header && header.fixedHeight() > 0) {
				layout.header = {fixedHeight: header.fixedHeight()}
			};
			return layout;
		}
		function getGroupLayout(group) {
			var groupLayout = {
				type:"group",
				name: group.name(),
				orientation: group.orientation(),
				saveWidth: group.saveWidth() ? group.saveWidth() : group.width(),
				width:group.saveWidth() ? group.saveWidth() : group.width(),
				visible: group.isVisible(),
				hideChildHeaders: group.isHideChildHeaders(),
				columns: []
			};
			var header = group.header && group.header();
			var v;
			if (header) {
				groupLayout.header = {text: header.text(), visible: header.isVisible()};
				if ((v = header.fixedHeight()) > 0) {
					groupLayout.header.fixedHeight = v;
				}
			}
			var cols = group._columns._orderedColumns;
			for (var i = 0, cnt = cols.length; i < cnt; i++) {
				var c = cols[i];
				if (c instanceof ColumnGroup) {
					groupLayout.columns.push(getGroupLayout(c));
				} else if (c.name) {
					groupLayout.columns.push(getColumnLayout(c));
				}
			}
			return groupLayout;
		}
		if (!grid) {
			return;
		}

		var orgColumn = grid.getOrderedColumns();
		var columnLayout = [];

		for (var i = 0, cnt = orgColumn.length; i < cnt; i++) {
			var c = orgColumn[i];
			if (c instanceof ColumnGroup) {
				columnLayout.push(getGroupLayout(c));
			} else if (c.name) {
				columnLayout.push(getColumnLayout(c));
			}
		}

		return columnLayout;
	};
	this.fitColumnWidth = function (grid, column, maxWidth, minWidth, visibleOnly) {
		var lm = grid.layoutManager();
		if (!column) {
			for (var i = grid.visibleColumnCount(); i--;) {
				lm.fitColumnWidth(grid.getVisibleColumn(i), visibleOnly, minWidth, maxWidth);
			}
		} else {
			column = this.$_getColumn(grid, column);
			column && lm.fitColumnWidth(column, visibleOnly, minWidth, maxWidth);
		}
	};
	this.fitRowHeight = function(grid, itemIndex, maxHeight, textOnly, refresh) {
		var lm = grid.layoutManager();
		if (itemIndex >= 0) {
			lm.fitRowHeight(itemIndex, maxHeight, textOnly, refresh);
		}
	};
	this.fitRowHeightAll = function(grid, maxHeight, textOnly) {
		var lm = grid.layoutManager();
		return lm.fitRowHeightAll(maxHeight, textOnly);
	};
	this.setRowHeight = function (grid, itemIndex, height, refresh) {
		var lm = grid.layoutManager();
		if (itemIndex >= 0) {
			lm.setRowHeight(itemIndex, height, refresh);
		}
	};
	this.clearRowHeights = function (grid, refresh) {
		var lm = grid.layoutManager();
		lm.clearRowHeights(refresh);
	}
	this.getGroupLevel = function (grid, field) {
		var fld = Number(field);
		if (isNaN(fld)) {
			fld = grid.dataSource().getFieldIndex(field);
		}
		return fld >= 0 ? grid.getGroupLevel(fld) : -1;
	};
	this.getDataRow = function (grid, itemIndex) {
		var item = grid.getItem(itemIndex);
		return item ? item.dataRow() : -1;
	};
	this.getRowsOfItems = function (grid, items) {
		var rows = [];
		if (items) {
			for (var i = 0, cnt = items.length; i < cnt; i++) {
				var item = grid.getItem(items[i]);
				item && rows.push(item.dataRow());
			}
		}
		return rows;
	};
	this.setValues = function (grid, itemIndex, values, strict) {
		var item = grid.getItem(itemIndex);
		var ds = item.dataSource();
		if (item && ds) {
			var i, fld, row;
			var cnt = ds.fieldCount();
			var diff = false;
			var oldValues;
			if (grid.isItemEditing(item)) {
				var editItem = _cast(item, EditItem);
				if (editItem) {
					editItem.setValues(values);
				} else {
					for (i = 0; i < cnt; i++) {
						fld = ds.getOrgFieldName(i);
						if (values.hasOwnProperty(fld)) {
							item.setData(i, values[fld]);
						}
					}
				}
			} else if ((row = item.dataRow()) >= 0) {
				if (ds instanceof TreeDataProvider) {
					var r = ds.rowById(row);
					if (r) {
						diff = false;
						oldValues = r.values();
						if (_isArray(values)) {
							for (i=0;i<values.length;i++) {
								if (diff = !ds.getField(i).equalValues(oldValues[i],values[i])) {
									break;
								}
							}
						} else {
							for (i=0;i < cnt;i++){
								fld = ds.getOrgFieldName(i);
								if (values.hasOwnProperty(fld)) {
									if (diff = !ds.getField(i).equalValues(oldValues[i],values[fld])) {										
										break;
									}
								}
							}
						}
						if (!diff) {
							return;
						}
						strict ? r.updateStrict(values) : r.update(values);
					}
				} else {
					/* grid.setValue의 경우 checkDiff와 strictDiff의 영향을 받지 않는다. setValues도 영향을 받지 않도록 한다. */
					diff = false;
					oldValues = ds._values[row];
					if (_isArray(values)) {
						for (i=0;i<values.length;i++) {
							if (diff = !ds.getField(i).equalValues(oldValues[i],values[i])) {
								break;
							}
						}
					} else {
						for (i=0;i < cnt;i++){
							fld = ds.getOrgFieldName(i);
							if (values.hasOwnProperty(fld)) {
								if (diff = !ds.getField(i).equalValues(oldValues[i],values[fld])) {										
									break;
								}
							}
						}
					}
					if (!diff) {
						return;
					}
					strict ? ds.updateStrictRow(row, values) : ds.updateRow(row, values);
				}
			}
		}
	};
	this.getValues = function (grid, itemIndex) {
		var item = grid.getItem(itemIndex);
		if (item) {
			var row;
			if (grid.isItemEditing(item)) {
				row = item.getRowObject();
				row["__rowId"] = item.dataRow();
				return row;
			} else {
				if (item.dataRow() >= 0) {
					var ds = item.dataSource();
					if (ds) {
						var vals = ds.getRowObject(item.dataRow());
						row = { __rowId: item.dataRow() };
						for (var fld in vals) {
							row[fld] = vals[fld];
						}
						return row;
					}
				}
			}
		}
		return null;
	};
	this.getDisplayValues = function (grid, row, itemIndex, applyStyle) {
		var ret = row ? _clone(row) : {};
		if (row) {
			var body = grid.body();
			var columns = grid.getLeafColumns();
			for (var i = 0, cnt = columns.length; i < cnt; i++) {
				var column = columns[i];
				var valueType = column.valueType();
				var field = column.getField();
				var styles = column.styles();

				var numberFormatter = applyStyle && styles.numberFormat() && new DecimalFormatter(styles.numberFormat());
				var datetimeWriter = applyStyle && styles.datetimeFormat() && new DateTimeWriter(styles.datetimeFormat());
				var booleanFormatter = applyStyle && styles.booleanFormat() && new BooleanFormatter(styles.booleanFormat());
				var prefix = applyStyle && styles.prefix();
				var suffix = applyStyle && styles.suffix();

				var value = row[field.orgFieldName()];
				var s = null;
				if (valueType == ValueType.NUMBER) {
					var v = Number(value);
					if (isNaN(v)) {
						s = column.nanText();
					} else if (numberFormatter) {
						s = numberFormatter.format(v);
					}
				} else if (valueType == ValueType.DATETIME && value instanceof Date) {
					s = datetimeWriter ? datetimeWriter.getText(value) : DateTimeWriter.Default.getText(value);
				} else if (valueType == ValueType.BOOLEAN && booleanFormatter) {
					s = booleanFormatter.formatValue(value);
				}
				if (!s) {
					var index = CellIndex.temp(grid, itemIndex, column);
					var cell = body.getCell(index);
					s = cell.displayText();
				}
				if (s != null) {
					if (prefix)
						s = prefix + s;
					if (suffix)
						s = s + suffix;
				}
				ret[field.orgFieldName()] = s;
			}
		}
		return ret;
	};
	this.getSelectionItem = function (grid, item) {
		if (item) {
			var range = item.getBounds();
			var item1 = grid.getItem(range.R1());
			var item2 = grid.getItem(range.R2());
			return {
				style: item.style(),
				startItem: range.R1(),
				startRow: item1 ? item1.dataRow() : -1,
				startColumn: range.C1().name(),
				endItem: range.R2(),
				endRow: item2 ? item2.dataRow() : -1,
				endColumn: range.C2().name()
			}
		}
		return null;
	};
	this.getSelectionItems = function (grid, item) {
		if (item) {
			var range = item.getBounds();
			var item1 = grid.getItem(range.R1());
			var item2 = grid.getItem(range.R2());
			var i = item1.index();
			var i2 = item2.index();
			var items = [];
			for (; i <= i2; i++) {
				items.push(i);
			}
			return items;
		}
		return null;
	};
	this.getSelectionRows = function (grid, item) {
		if (item) {
			var range = item.getBounds();
			var item1 = grid.getItem(range.R1());
			var item2 = grid.getItem(range.R2());
			var i = item1.index();
			var i2 = item2.index();
			var rows = [];
			var r;
			for (; i <= i2; i++) {
				item1 = grid.getItem(i);
				(r = item1.dataRow()) >= 0 && rows.push(r);
			}
			return rows;
		}
		return null;
	};
	this.getSelectionData = function (grid, maxRows) {
		if (grid.selections().count() > 0) {
			var item = grid.selections().getItem(0);
			var data = item.getData(maxRows);
			return data;
		}
		return null;
	};
	this.setSelectionItem = function (grid, item) {
		if (item.hasOwnProperty("style")) {
			var style = item.style;
			var startItem = 0;
			if (item.hasOwnProperty("startItem")) {
				startItem = item.startItem;
			} else if (item.hasOwnProperty("startRow")) {
				startItem = grid.getItemIndexOfRow(item.startRow);
			} else if (style != 'singleColumn' && style != 'columns') {
				return;
			}
			var startCell = new CellIndex(grid, startItem, grid.columnByName(item.startColumn));
			var endItem = 0;
			if (item.hasOwnProperty("endItem")) {
				endItem = item.endItem;
			} else if (item.hasOwnProperty("endRow")) {
				endItem = grid.getItemIndexOfRow(item.endRow);
			} else if (style != 'singleColumn' && style != 'columns') {
				return;
			}
			var endCell = new CellIndex(grid, endItem, grid.columnByName(item.endColumn));
			grid.setFocusedIndex(startCell, true);
			grid.selections().clear();
			grid.selections().add(startCell, endCell, style);
		}
	};
	this.resetCheckables = function (grid, clearExpr) {
		grid.resetCheckables();
		if (clearExpr) {
			grid.setCheckBar({
				checkableExpression: null
			});
		}
	};
	this.setCheckableExpression = function (grid, expression, apply) {
		grid.setCheckBar({
			checkableExpression: expression
		});
		apply && grid.applyCheckables();
	};
	this.createColumns = function (columns) {
		return GridBase.createColumns(columns);
	};
    this.orderBy = function (grid, fieldNames, sortDirs, textCases) {
        if (fieldNames) {
            var dirs = [];
            if (sortDirs) {
                for (var i = 0; i < sortDirs.length; i++) {
                    dirs.push(sortDirs[i]);
                }
            }
            grid.orderByFields(fieldNames, dirs, textCases);
        }
    };
    this.setColumnFilters = function (grid, column, filters) {
        var col = this.$_getColumn(grid, column);
        col && col.setFilters(filters);
    };
    this.clearColumnFilters = function (grid, column) {
        var col = this.$_getColumn(grid, column);
        col && col.clearFilters();
    };
    this.addColumnFilters = function (grid, column, filters, overwrite) {
        var col = this.$_getColumn(grid, column);
        col && col.addFilters(filters, overwrite);
    };
    this.removeColumnFilters = function (grid, column, filterNames) {
        var col = this.$_getColumn(grid, column);
        col && col.removeFilters(filterNames);
    };
    this.activateColumnFilters = function (grid, column, filterNames, active) {
        var col = this.$_getColumn(grid, column);
        col && col.activateFilters(filterNames, active);
    };
    this.activateAllColumnFilters = function (grid, column, active) {
        var col = this.$_getColumn(grid, column);
        col && col.activateAllFilters(active);
    };
    this.toggleColumnFilters = function (grid, column, filterNames) {
        var col = this.$_getColumn(grid, column);
        col && col.toggleFilters(filterNames);
    };
    this.toggleAllColumnFilters = function (grid, column) {
        var col = this.$_getColumn(grid, column);
        col && col.toggleAllFilters();
    };
    this.getColumnFilter = function (grid, column, filterName) {
        var col = this.$_getColumn(grid, column);
        var filter = col && col.getFilter(filterName);
        return filter && filter.proxy();
    };
    this.getColumnFilters = function (grid, column) {
        var col = this.$_getColumn(grid, column);
        return col && this.toProxy(col.getFilters());
    };
    this.getActiveColumnFilters = function (grid, column, active) {
        var col = this.$_getColumn(grid, column);
        return col && this.toProxy(col.getActiveFilters(active));
    };
    this.setFilterActions = function (grid, column, actions) {
        var col = this.$_getColumn(grid, column);
        if (col && actions) {
            col.setFilterActions(actions);
        }
    };
    this.clearFilterActions = function (grid, column) {
        var col = this.$_getColumn(grid, column);
        if (col) {
            col.setFilterActions(null);
        }
    };
	this.getGroupIndex = function (grid, itemIndex) {
		var item = grid.getItem(itemIndex);
		if (item) {
			var group = item.parent();
			return group ? group.index() : -1;
		}
		return -1;
	};
	this.isGroupItem = function (grid, itemIndex) {
		var item = grid.getItem(itemIndex);
		return item && item instanceof GroupItem;
	};
    this.isParentVisible = function (grid, itemIndex) {
        var item = grid.getItem(itemIndex);
        return item && item.parent() && item.parent().isVisible();
    };
	this.expandGroup = function (grid, itemIndex, recursive, force) {
		var group = grid.getItem(itemIndex);
		if (group instanceof GroupItem) {
			group && grid.expand(group, recursive, force);
		}
	};
	this.collapseGroup = function (grid, itemIndex, recursive) {
		var group = grid.getItem(itemIndex);
		if (group instanceof GroupItem) {
			group && grid.collapse(group, recursive);
        }
	};
    this.expandParent = function (grid, itemIndex, recursive, force) {
        var group = grid.getItem(itemIndex);
        if (group) {
            var p = group.parent();
            if (p && p.isExpandable() && p.isCollapsed()) {
                grid.expand(p, recursive);
                var idx = grid.focusedIndex();
                idx.setItemIndex(p.isVisible() ? p.index() : p.firstVisibleItem().index());
                grid.setFocusedIndex(idx);
                grid.makeCellVisible(idx);
            }
        }
    };
    this.collapseParent = function (grid, itemIndex, recursive) {
        var group = grid.getItem(itemIndex);
        if (group) {
            var p = group.parent();
            if (p && p.isCollapsable() && p.isExpanded()) {
                grid.collapse(p, recursive);
                var idx = grid.focusedIndex();
                idx.setItemIndex(p.isVisible() ? p.index() : p.firstVisibleItem().index());
                grid.setFocusedIndex(idx);
                grid.makeCellVisible(idx);
            }
        }
    };
	this.getModel = function (grid, itemIndex, extended) {
		var item = grid.getItem(itemIndex);
		return item ? _getItemProxy(item, extended) : null;
	};
	this.getModelAs = function (grid, itemIndex, itemType, extended) {
		var item = grid.getItem(itemIndex);
		switch (itemType) {
			case "row":
				item = _cast(item, GridRow);
				break;
			case "group":
				item = _cast(item, GroupItem);
				break;
			case "footer":
				item = _cast(item, GroupFooter);
				break;
			case "tree":
				item = _cast(item, TreeItem);
				break;
		}
		return item ? _getItemProxy(item, extended) : null;
	};
    this.getGroupModel = function (grid, itemIndex, extended) {
        var item = grid.getItem(itemIndex);
        if (item && !(item instanceof GroupItem)) {
            item = item.parent();
        }
        return item ? _getItemProxy(item, extended) : null;
    };
	this.getParentModel = function (grid, model, extended) {
		if (model) {
			var item = grid.getItem(model.itemIndex);
			if (item) {
				var group = item.parent();
				if (group && !isNaN(group.id())) {
					return _getItemProxy(group, extended);
				}
			}
		}
		return null;
	};
	this.getRootModel = function (grid, model, extended) {
		if (model) {
			var item = grid.getItem(model.itemIndex);
			if (item) {
				var root = item.root();
				if (root) {
					return _getItemProxy(root, extended);
				}
			}
		}
		return null;
	};
	this.getChildModels = function (grid, model, extended) {
		if (model) {
			var group = grid.getItem(model.itemIndex);
            if (!(group instanceof GroupItem) && model.$_child >= 0) {
                var item = grid.getItem(model.$_child);
                if (item) {
                    group = item instanceof EditItem ? null : item.parent();
                }
            };
            if (!(group instanceof GroupItem)) {
				var groupProvider = grid.itemSource && grid.itemSource().source && grid.itemSource().source();
				group = groupProvider ? groupProvider._groupList[model.id] : null;
            }
			if (group instanceof GroupItem) {
				var cnt = group.count();
				var items = [];
				for (var i = 0; i < cnt; i++) {
					items.push(_getItemProxy(group.getItem(i), extended));
				}
				return items;
			}
		}
		return null;
	};
	this.getChildModel = function (grid, model, index, extended) {
		if (model) {
			var group = grid.getItem(model.itemIndex);
            if (!(group instanceof GroupItem) && model.$_child >= 0) {
                var item = grid.getItem(model.$_child);
                if (item) {
                    group = item instanceof EditItem ? null : item.parent();
                }
            };
            if (!(group instanceof GroupItem)) {
				var groupProvider = grid.itemSource && grid.itemSource().source && grid.itemSource().source();
				group = groupProvider ? groupProvider._groupList[model.id] : null;
            }
			if (group instanceof GroupItem) {
				if (index >= 0 && index < group.count()) {
					return _getItemProxy(group.getItem(index), extended);
				}
			}
		}
		return null;
	};
	this.getModels = function (grid, itemIndices, extended) {
		if (itemIndices) {
			var models = [];
			for (var i = 0, cnt = itemIndices.length; i < cnt; i++) {
				var item = grid.getItem(itemIndices[i]);
				if (item) {
					models.push(_getItemProxy(item, extended));
				}
			}
			return models;
		}
		return null;
	};
	this.getModelOfRow = function (grid, dataRow, extended) {
		var item = grid.getItemOfRow(dataRow);
		return item ? _getItemProxy(item, extended) : null;
	};
	this.getModelsOfRows = function (grid, dataRows, extended) {
		if (dataRows) {
			var models = [];
			for (var i = 0, cnt = dataRows.length; i < cnt; i++) {
				var item = grid.getItemOfRow(dataRows[i]);
				if (item) {
					models.push(_getItemProxy(item, extended));
				}
			}
			return models;
		}
		return null;
	};
	this.getGroupSummary = function (grid, model, field, statistical) {
		if (model) {
			var group = grid.getItem(model.itemIndex);
			if (!group) {
				var groupProvider = grid.itemSource && grid.itemSource().source && grid.itemSource().source();
				group = groupProvider ? groupProvider._groupList[model.id] : null;
			}
			var fld = isNaN(field) ? grid.dataSource().getFieldIndex(field) : field;
			if (group instanceof GroupItem && fld >= 0) {
				var summary = {
					count: group.getNumber(fld),
					sum: group.getSum(fld),
					max: group.getMax(fld),
					min: group.getMin(fld),
					avg: group.getAvg(fld)
				};
				if (statistical) {
					summary["var"] = group.getVar(fld, 1);
					summary["varp"] = group.getVar(fld, 0);
					summary["stdev"] = group.getStdev(fld, 1);
					summary["stdevp"] = group.getStdev(fld, 0);
				}
				return summary;
			}
		}
		return undefined;
	};
	this.expandModel = function (grid, model, recursive, force) {
		if (model) {
			var group = grid.getItem(model.itemIndex)
			if (group instanceof GroupItem) {
				grid.expand(group, recursive, force);
			}
		}
	};
	this.collapseModel = function (grid, model, recursive) {
		if (model) {
			var group = grid.getItem(model.itemIndex);
			if (group instanceof GroupItem) {
				grid.collapse(group, recursive);
			}
		}
	};
	this.getSortedFields = function (grid) {
		var cnt;
		var flds = grid.getSortFields();
		var dirs = grid.getSortDirections();
		if (flds && (cnt = flds.length) > 0) {
			var ds = grid.dataSource();
			var fields = [];
			for (var i = 0; i < cnt; i++) {
				fields.push({
					fieldName: ds.getFieldName(flds[i]),
					orgFieldName: ds.getOrgFieldName(flds[i]),
					direction: dirs[i]
				})
			}
			return fields;
		}
		return null;
	};
	this.getGroupFieldNames = function (grid, orgName) {
		var flds = grid.getGroupByFields();
		if (flds) {
			var ds = grid.dataSource();
			if (ds) {
				var names = [];
				for (var i = 0; i < flds.length; i++) {
					names.push(orgName ? ds.getOrgFieldName(flds[i]) : ds.getFieldName(flds[i]));
				}
				return names;
			} else {
				return flds;
			}
		}
		return null;
	},
	this.getStyles = function (grid, region, all) {
		var styles = grid.getStylesOf(region);
		if (styles) {
			var names = VisualStyles.STYLE_NAMES;
			var obj = {};
			for (var p in names) {
				var check = all || styles.hasValue(names[p]);
				if (check) {
					var v = styles[p]();
					obj[p] = v && v.toText ? v.toText() : v;
				}
			}
			return obj;
		}
		return null;
	};
	this.hasCellStyle = function (grid, id) {
		return Boolean(grid.dataCellStyles().get(id));
	};
	this.addCellStyle = function (grid, id, style, overwrite) {
		if (overwrite) {
			grid.dataCellStyles().set(id, style);
		} else {
			grid.dataCellStyles().add(id, style);
		}
	};
	this.addCellStyles = function (grid, styles, overwrite) {
		if (_isArray(styles)) {
			for (var i = 0, cnt = styles.length; i < cnt; i++) {
				var s = styles[i];
				if (s && s.id) {
					if (overwrite) {
						grid.dataCellStyles().set(s.id, s);
					} else {
						grid.dataCellStyles().add(s.id, s);
					}
				}
			}
		} else if (styles && styles.id) {
			if (overwrite) {
				grid.dataCellStyles().set(styles.id, styles);
			} else {
				grid.dataCellStyles().add(styles.id, styles);
			}
		}
	};
	this.removeCellStyles = function (grid, styleIds) {
		if (_isArray(styleIds)) {
			for (var i = styleIds.length; i--;) {
				grid.dataCellStyles().set(styleIds[i], null);
			}
		} else if (styleIds) {
			grid.dataCellStyles().set(styleIds, null);
		}
	};
	this.removeAllCellStyles = function (grid) {
		grid.dataCellStyles().clear();
	};
	this.getCellApplyStyles = function (grid, itemIndex, column) {
		var col = this.$_getColumn(grid, column);
		var item = grid.getItem(itemIndex);
		var cs;
		if (!col || !item) {
			return null;
		}
		var index = CellIndex.temp(grid, itemIndex, col);
		var styles;
		if (item instanceof GridRow) {
			var lm = grid.layoutManager();
			var room = lm.getMergedCell(index);
			var cell = grid.body().getCell(index, !!room, item);
			cs = grid.getDataCellStyle(index.dataRow(), col.dataIndex());
			styles = cell._styles;
		} else if (item instanceof GroupItemImpl) {
	        styles = grid.rowGroup().getHeaderCell(itemIndex)._styles;
		} else if (item instanceof GroupFooter) {
			styles = grid.rowGroup().getFooterCell(index)._styles;
		}
		var ret = styles ? styles.toProxy() : null;
		if (cs && cs._props) {
			for (var p in cs._props) {
				ret[p] = cs._props[p];
			}
		}
		return ret;
	};
	this.beginUpdateRow = function (grid, itemIndex) {
		var index = grid.focusedIndex().clone();
		var item = grid.getItem(itemIndex);
		item && index.itemIndex(item.index());
		grid.edit(index);
	};
	this.getEditingItem = function (grid) {
		var item = grid.getEditingItem();
		if (item) {
			var ds = item.dataSource();
			var obj = {};
			var values = item.values();
			if (values) {
				for (var i = ds.fieldCount(), j = values.length; i-- && j--;) {
					obj[ds.getOrgFieldName(i)] = values[i];
				}
			}
			return {
				itemIndex: item.index(),
				dataRow: item.dataRow(),
				values: obj
			};
		}
		return null;
	};
	this.getItemState = function (grid, itemIndex) {
		var item = grid.getItem(itemIndex);
		if (item) {
			var state = item.itemState();
			if (state == ItemState.NORMAL && grid.focusedIndex().I() == item.index()) {
				state = ItemState.FOCUSED;
			}
			return state;
		}
		return ItemState.NORMAL;
	};
	this.getCurrent = function (grid) {
		var index = grid.focusedIndex();
		return index ? index.proxy() : CellIndex.nullProxy();
	};
	this.setCurrent = function (grid, current, select) {
		grid.setCurrent(current, select);
	};
	this.resetCurrent = function (grid) {
		var index = grid.getIndex(0, grid.getFirstColumn());
		grid.setFocusedIndex(index);
		grid.makeCellVisible(grid.focusedIndex());
	};
    this.addPopupMenu = function (grid, name, menuItems) {
        return grid.popupMenuManager().addMenu(name, menuItems);
    };
	this.exportGrid = function (grid, options) {
		if (options.type == "html") {
			new GridHtmlExporter()["export"](grid, options);
		} else {
			new GridExcelExporter()["export"](grid, options);
		}
	};
	var _extractTreeRowIds = function (rows) {
		if (rows) {
			var cnt = rows.length;
			var ids = new Array(cnt);
			for (var i = 0; i  <cnt; i++) {
				ids[i] = rows[i].rowId();
			}
			return ids;
		}
		return null;
	};
	this.loadTreeData = function (provider, type, data, options) {
		new TreeDataLoader(provider).load(type, data, options);
	};
	this.getTreeChildCount = function (treeProvider, rowId) {
		if (rowId >= 0) {
			var row = treeProvider.rowById(rowId);
			return row ? row.count() : 0;
		} else {
			return treeProvider.getChildCount(null);
		}
	};
	this.getTreeChildren = function (treeProvider, rowId) {
		var rows = null;
		if (rowId >= 0) {
			var row = treeProvider.rowById(rowId);
			rows = row ? row.children() : 0;
		} else {
			rows = treeProvider.getRows(null);
		}
		return rows ? _extractTreeRowIds(rows) : null;
	};
	this.getTreeDescendantCount = function (treeProvider, rowId) {
		if (rowId >= 0) {
			var row = treeProvider.rowById(rowId);
			return row ? row.descendantCount() : 0;
		} else {
			return treeProvider.getDescendantCount(null);
		}
	};
	this.getTreeDescendants = function (treeProvider, rowId, maxLevel) {
		var row = null;
		if (rowId >= 0) {
			row = treeProvider.rowById(rowId);
		}
		return _extractTreeRowIds(treeProvider.getDescendants(row, maxLevel));
	};
	this.getTreeAncestors = function (treeProvider, rowId) {
		var row = treeProvider.rowById(rowId);
		return row ? _extractTreeRowIds(row.ancestors()) : null;
	};
	this.getTreeIconIndex = function (treeProvider, rowId) {
		var row = treeProvider.rowById(rowId);
		return row ? row.iconIndex() : -1;
	};
	this.getTreeJsonRow = function (provider, rowId) {
		var row = provider.rowById(rowId);
		return row ? row.getObject() : null;
	};
	this.getTreeJsonRows = function (provider, rowId, recursive, childRowsProp, iconProp) {
		var row = (rowId === undefined || rowId < 0) ? provider.rootRow() : provider.rowById(rowId);
		return row ? row.getChildObjects(recursive, childRowsProp, iconProp) : null;
	};
	this.getTreeOutuputRow = function (provider, options, rowId, iconProp) {
		var row = (rowId === undefined || rowId < 0) ? provider.rootRow() : provider.rowById(rowId);
		return row ? row.getOutput(options, iconProp) : null;
	};
    this.getTreeOutputRows = function (provider, options, rowId, recursive, childRowsProp, iconProp) {
        var row = (rowId === undefined || rowId < 0) ? provider.rootRow() : provider.rowById(rowId);
        return row ? row.getChildOutputObjects(options, recursive, childRowsProp, iconProp) : null;
    };
	this.addTreeRow = function (provider, rowId, values, iconIndex, hasChildren) {
		var row = provider.rowById(rowId);
		var child = provider.createRow(values, iconIndex, hasChildren);
		var added = false;
		if (row) {
			added = row.addChild(child);
		} else {
			added = provider.rootRow().addChild(child);
		}
		return added ? child.rowId() : -1;
	};
	this.insertTreeRow = function (provider, rowId, index, values, iconIndex, hasChildren) {
		var row = provider.rowById(rowId);
		var child = provider.createRow(values, iconIndex, hasChildren);
		var added = false;
		if (row) {
			added = row.insertChild(index, child);
		} else {
			added = provider.rootRow().insertChild(index, child);
		}
		return added ? child.rowId() : -1;
	};
	this.removeTreeRow = function (provider, rowId) {
		var row = provider.rowById(rowId);
		if (row) {
			row.parent().removeChild(row);
		}
	};
	this.removeTreeRows = function (provider, rowIds) {
		if (rowIds && rowIds.length > 0) {
			var rows = [];
			for (var i = rowIds.length; i--;) {
				var row = provider.rowById(rowIds[i]);
				row && rows.push(row);
			}
			provider.removeRows(rows);
		}
	};
	this.updateTreeRow = function (provider, rowId, values) {
		var row = provider.rowById(rowId);
		if (row) {
			row.update(values);
		}
	};
	this.updateStrictTreeRow = function (provider, rowId, values) {
		var row = provider.rowById(rowId);
		if (row) {
			row.updateStrict(values);
		}
	};
	this.getTreeDataValue = function (provider, rowId, field) {
		if (typeof field == "string") {
			field = provider.getFieldIndex(field);
		}
		var row = provider.rowById(rowId);
		if (row) {
			return row.getValue(field);
		}
		return undefined;
	};
	this.setTreeDataValue = function (provider, rowId, field, newValue) {
		if (typeof field == "string") {
			field = provider.getFieldIndex(field);
		}
		var row = provider.rowById(rowId);
		if (row) {
			return row.setValue(field, newValue);
		}
	};
	this.moveRowSibling = function (provider, rowId, delta) {
		var row = provider.rowById(rowId);
		if (row) {
			provider.moveRowSibling(row, delta);
		}	
	};
	this.changeRowParent = function (provider, rowId, parentId, childIndex) {
		var row = provider.rowById(rowId);
		var parent = parentId < 0 ? provider.rootRow() : provider.rowById(parentId);
		if (row && parent) {
			provider.changeRowParent(row, parent, childIndex);
		}
	};
	this.getTreeOptions = function (tree) {
		return tree.treeOptions().proxy();
	};
	this.setTreeOptions = function (tree, options) {
		this.setOptions(tree, options);
		tree.treeOptions().assign(options);
	};
	this.getTreeParentIndex = function (tree, itemIndex) {
		var item = tree.getItem(itemIndex);
		return item ? item.parentIndex() : -1;
	};
	this.getTreeChildIndices = function (tree, itemIndex) {
		var item = tree.getItem(itemIndex);
		if (item) {
			var items = item.children();
			for (var i = 0, cnt = items.length; i < cnt; i++) {
				items[i] = items[i].index();
			}
			return items;
		}
		return null;
	};
	this.getTreeDescendantIndices = function (tree, itemIndex) {
		var item = tree.getItem(itemIndex);
		if (item) {
			var items = item.getDescendants(true);
			if (items && items.length > 0) {
				for (var i = items.length - 1; i >= 0; i--) {
					if (!(items[i] instanceof TreeItem)) {
						items.splice(i, 1);
					}
				}
				if (items.length > 0) {
					for (i = 0, cnt = items.length; i < cnt; i++) {
						items[i] = items[i].index();
					}
					return items;
				}
			}
		}
		return null;
	};
	this.getTreeAncestorIndices = function (tree, itemIndex, includeRoot) {
		var item = tree.getItem(itemIndex);
		if (item) {
			var items = item.getAncestors();
			if (items && items.length > 0) {
				var i, cnt;
				for (i = items.length - 1; i >= 0; i--) {
					if (!(items[i] instanceof TreeItem)) {
						items.splice(i, 1);
					}
				}
				if (!includeRoot && items.length > 0 && items[items.length - 1] instanceof RootTreeItem) {
					items.pop();
				}
				if (items.length > 0) {
					for (i = 0, cnt = items.length; i < cnt; i++) {
						items[i] = items[i].index();
					}
					return items;
				}
			}
		}
		return null;
	};
	this.expandTreeItem = function (tree, itemIndex, recursive, force) {
		var item = tree.getItem(itemIndex);
		item && tree.expand(item, recursive, force);
	};
	this.collapseTreeItem = function (tree, itemIndex, recursive) {
		var item = tree.getItem(itemIndex);
		item && tree.collapse(item, recursive);
	};
	this.checkTreeChildren = function (tree, itemIndex, checked, recursive, visibleOnly, checkableOnly, checkEvent) {
		var item = tree.getItem(itemIndex);
		item && tree.checkChildren(item, checked, recursive, visibleOnly, checkableOnly, checkEvent);
	};
	this.getTreeIconIndex = function (tree, rowId) {
		var row = tree.rowById(rowId);
		return row ? row.iconIndex() : -1;
	};
	this.setTreeIconIndex = function (tree, rowId, iconIndex) {
		var row = tree.rowById(rowId);
		row && row.setIconIndex(iconIndex);
	};
	this.getTreeParentId = function (tree, rowId) {
		var row = tree.rowById(rowId);
		if (row) {
			var p = row.parent();
			return p ? p.rowId() : -1;
		}
		return -1;
	};
	this.getTreeLevel = function (tree, rowId) {
		var row = tree.rowById(rowId);
		return row ? row.level() : 0;
	};
	this.getTreeValues = function (tree, itemIndex) {
		var item = tree.getItem(itemIndex);
		if (item instanceof TreeItem) {
			var row;
			if (tree.isItemEditing(item)) {
				row = item.getRowObject();
				row["__rowId"] = item.dataRow;
				return row;
			} else {
				var ds = item.dataSource();
				var treeRow = item.row();
				var values = treeRow.values();
				row = { __rowId: treeRow.rowId() };
				for (var i = 0, cnt = ds.fieldCount(); i < cnt; i++) {
					var fld = ds.getOrgFieldName(i);
					var v = values[i];
					row[fld] = v;
				}
				return row;
			}
		}
		return null;
	};
};
var DataObserverBase = defineClass("DataObserverBase", null, {
	init: function (handler) {
		this._super();
		this._handler = handler;
		this._handler._dp.addListener(this);
	}
});
var RealGridDataObserver = defineClass("RealGridDataObserver", DataObserverBase, {
	init: function (handler) {
		this._super(handler);
	},
	onDataProvderDisposed: function (provider) {
	},
	onDataProviderReset: function (provider) {
	},
	onDataProviderRefresh: function (provider) {
	},
	onDataProviderRefreshClient: function (provider) {
	},
	onDataProviderRowCountChanged: function (provider) {
		this._handler.onRowCountChanged && this._handler.onRowCountChanged(this._handler, provider.rowCount());
	},
	onDataProviderRowUpdating: function (provider, row, values) {
		return !this._handler.onRowUpdating || this._handler.onRowUpdating(this._handler, row);
	},
	onDataProviderRowUpdated: function (provider, row) {
		this._handler.onRowUpdated && this._handler.onRowUpdated(this._handler, row);
	},
	onDataProviderRowsUpdated: function (provider, row, count) {
		this._handler.onRowsUpdated && this._handler.onRowsUpdated(this._handler, row, count);
	},
	onDataProviderRowInserting: function (provider, row, values) {
		return !this._handler.onRowInserting || this._handler.onRowInserting(this._handler, row, values);
	},
	onDataProviderRowInserted: function (provider, row) {
		this._handler.onRowInserted && this._handler.onRowInserted(this._handler, row);
	},
	onDataProviderRowsInserted: function (provider, row, count) {
		this._handler.onRowsInserted && this._handler.onRowsInserted(this._handler, row, count);
	},
	onDataProviderRowRemoving: function (provider, row) {
		return !this._handler.onRowDeleting || this._handler.onRowDeleting(this._handler, row);
	},
	onDataProviderRowRemoved: function (provider, row) {
		this._handler.onRowDeleted && this._handler.onRowDeleted(this._handler, row);
	},
	onDataProviderRowsRemoving: function (provider, rows) {
		return true;
	},
	onDataProviderRowsRemoved: function (provider, rows) {
		this._handler.onRowsDeleted && this._handler.onRowsDeleted(this._handler, rows);
	},
	onDataProviderRowMoving: function (provider, row, newRow) {
		return !this._handler.onRowMoving || this._handler.onRowMoving(this._handler, row, newRow);
	},
	onDataProviderRowMoved: function (provider, row, newRow) {
		this._handler.onRowMoved && this._handler.onRowMoved(this._handler, row, newRow);
	},
	onDataProviderRowsMoving: function (provider, row, count, newRow) {
		return !this._handler.onRowsMoving || this._handler.onRowsMoving(this._handler, row, count, newRow);
	},
	onDataProviderRowsMoved: function (provider, row, count, newRow) {
		this._handler.onRowsMoved && this._handler.onRowsMoved(this._handler, row, count, newRow);
	},
	onDataProviderValueChanging: function (/*provider, row, field, value*/) {
		return true;
	},
	onDataProviderValueChanged: function (provider, row, field) {
		this._handler.onValueChanged && this._handler.onValueChanged(this._handler, row, field);
	},
	onDataProviderDataChanged: function(provider) {
		this._handler.onDataChanged && this._handler.onDataChanged(this._handler);
	},
	onDataProviderStateChanged: function (provider, row) {
		this._handler.onRowStateChanged && this._handler.onRowStateChanged(this._handler, row);
	},
	onDataProviderStatesChanged: function (provider, rows) {
		this._handler.onRowStatesChanged && this._handler.onRowStatesChanged(this._handler, rows);
	},
	onDataProviderStatesCleared: function (provider) {
		this._handler.onRowStatesCleared && this._handler.onRowStatesCleared(this._handler);
	},
	onDataProviderRestoreRows: function(provider, rows) {
		this._handler.onRestoreRows && this._handler.onRestoreRows(this._handler, rows);
	}
});
var RealTreeDataObserver = defineClass("RealTreeDataObserver", LocalTreeDataProviderObserver, {
	init: function (handler) {
		this._super();
		this._handler = handler;
		this._handler._dp.addListener(this);
	},
	onTreeDataProvderDisposed: function (provider) {
	},
	onTreeDataProviderReset: function (provider) {
	},
	onTreeDataProviderRefresh: function (provider) {
	},
	onTreeDataProviderRefreshClient: function (provider) {
	},
	onTreeDataProviderRowCountChanged: function (provider) {
		this._handler.onRowCountChanged && this._handler.onRowCountChanged(this._handler, provider.rowCount());
	},
	onTreeDataProviderCleared: function (provider) {
	},
	onTreeDataProviderRowAdding: function (provider, row, index, child) {
		return !this._handler.onRowAdding || this._handler.onRowAdding(this._handler, row.rowId(), index, child._values);
	},
	onTreeDataProviderRowAdded: function (provider, row) {
		this._handler.onRowAdded && this._handler.onRowAdded(this._handler, row.rowId());
	},
	onTreeDataProviderRowsAdded: function (provider, parent, rows) {
		this._handler.onRowsAdded && this._handler.onRowsAdded(this._handler, parent.rowId(), $$_getTreeRowIds);
	},
	onTreeDataProviderRowRemoving: function (provider, row) {
		return !this._handler.onRowDeleting || this._handler.onRowDeleting(this._handler, row.rowId());
	},
	onTreeDataProviderRowRemoved: function (provider, row) {
		this._handler.onRowDeleted && this._handler.onRowDeleted(this._handler, row.rowId());
	},
	onTreeDataProviderRowsRemoving: function (provider, rows) {
		return !this._handler.onRowsDeleting || this._handler.onRowsDeleting(this._handler, $$_getTreeRowIds(rows));
	},
	onTreeDataProviderRowsRemoved: function (provider, rows) {
		this._handler.onRowsDeleted && this._handler.onRowsDeleted(this._handler, $$_getTreeRowIds(rows));
	},
	onTreeDataProviderRowUpdating: function (provider, row) {
		return !this._handler.onRowUpdating || this._handler.onRowUpdating(this._handler, row.rowId());
	},
	onTreeDataProviderRowUpdated: function (provider, row) {
		this._handler.onRowUpdated && this._handler.onRowUpdated(this._handler, row.rowId());
	},
	onTreeDataProviderValueChanging: function (provider, row, field, newValue) {
		return true;
	},
	onTreeDataProviderValueChanged: function (provider, row, field) {
		this._handler.onValueChanged && this._handler.onValueChanged(this._handler, row.rowId(), field);
	},
	onTreeDataProviderIconIndexChanged: function (provider, row) {
	},
	onTreeDataProviderHasChildrenChanged: function (provider, row) {
	},
	onTreeDataProviderRowStateChanged: function (provider, row) {
		this._handler.onRowStateChanged && this._handler.onRowStateChanged(this._handler, row.rowId());
	},
	onTreeDataProviderRowStatesChanged: function (provider, rows) {
		this._handler.onRowStatesChanged && this._handler.onRowStatesChanged(this._handler, $$_getTreeRowIds(rows));
	},
	onTreeDataProviderRowSiblingMoving: function (provider, row, delta) {
		return !this._handler.onRowSiblingMoving || this._handler.onRowSiblingMoving(this._handler, row.rowId(), delta);
	},
	onTreeDataProviderRowSiblingMoved: function (provider, row, delta) {
		this._handler.onRowSiblingMoved && this._handler.onRowSiblingMoved(this._handler, row.rowId(), delta);
	}, 
	onTreeDataProviderRowParentChanging: function (provider, row, parent, childIndex) {
		return !this._handler.onRowParentChanging || this._handler.onRowParentChanging(this._handler, row.rowId(), parent.rowId(), childIndex);
	}, 
	onTreeDataProviderRowParentChanged: function (provider, row, parent, childIndex) {
		this._handler.onRowParentChanged && this._handler.onRowParentChanged(this._handler, row.rowId(), parent.rowId(), childIndex);
	}
});
var RealGridObserverBase = defineClass("RealGridObserverBase", null, {
	init: function (handler) {
		this._super();
		this._handler = handler;
		this._handler._gv.addListener(this);
	},
	onGridBaseCurrentChanging: function (grid, oldIndex, newIndex) {
		return !this._handler.onCurrentChanging || this._handler.onCurrentChanging(this._handler, oldIndex.proxy(), newIndex.proxy());
	},
	onGridBaseCurrentChanged: function (grid, newIndex) {
		this._handler.onCurrentChanged && this._handler.onCurrentChanged(this._handler, newIndex.proxy());
	},
	onGridBaseCurrentRowChanged: function (grid, oldRow, newRow) {
		this._handler.onCurrentRowChanged && this._handler.onCurrentRowChanged(this._handler, oldRow, newRow);
	},
	onGridBaseValidateCell: function (grid, index, inserting, value) {
		if (this._handler.onValidateColumn) {
			var err = this._handler.onValidateColumn(this._handler, $$_getColumnProxy(index.column()), inserting, value);
			if (err && err.level && err.message) {
				throw new ValidationError(err.level, err.message, index.column && index.column(), err.message);
			} else if (typeof err == "string" || typeof err == "number") {
				throw new ValidationError(ValidationLevel.ERROR, err, index.column && index.column(), err);
			}
		}
	},
	onGridBaseValidateRow: function (grid, item, inserting, values) {
		if (this._handler.onValidateRow) {
			var err = this._handler.onValidateRow(this._handler, item.index(), item.dataRow(), inserting, values);
			if (err && err.level && err.message) {
				throw new ValidationError(err.level, err.message, null, err.message);
			} else if (typeof err == "string" || typeof err == "number") {
				throw new ValidationError(ValidationLevel.ERROR, err, null, err);
			}
		}
	},
	onGridBaseValidationFail: function(grid, itemIndex, column, err) {
		if (this._handler.onValidationFail) {
			var retErr = this._handler.onValidationFail(this._handler, itemIndex, $$_getColumnProxy(column), {level:err.level, message:err.message});
			if (retErr && retErr.level && retErr.message) {
				err.level = retErr.level;
				err.message = retErr.message;
				err.userMessage = retErr.message;
				return err;
			} else if (typeof retErr == "string" || typeof retErr == "number") {
				err.message = retErr;
				err.userMessage = retErr;
				return err;
			}
		} else {
			return err;
		}
	},
	onGridBaseColumnHeaderClicked: function (grid, column) {
		this._handler.onColumnHeaderClicked && this._handler.onColumnHeaderClicked(this._handler, $$_getColumnProxy(column));
	},
	onGridBaseColumnHeaderDblClicked: function (grid, column) {
		this._handler.onColumnHeaderDblClicked && this._handler.onColumnHeaderDblClicked(this._handler, $$_getColumnProxy(column));
	},
    onGridBaseColumnCheckedChanged: function (grid, column) {
        this._handler.onColumnCheckedChanged && this._handler.onColumnCheckedChanged(this._handler, $$_getColumnProxy(column), column.isChecked());
    },
	onGridBaseFooterCellClicked: function (grid, column) {
		this._handler.onFooterCellClicked && this._handler.onFooterCellClicked(this._handler, $$_getColumnProxy(column));
	},
	onGridBaseFooterCellDblClicked: function (grid, column) {
		this._handler.onFooterCellDblClicked && this._handler.onFooterCellDblClicked(this._handler, $$_getColumnProxy(column));
	},
	onGridBaseHeaderSummaryCellClicked: function (grid, column) {
		this._handler.onHeaderSummaryCellClicked && this._handler.onHeaderSummaryCellClicked(this._handler, $$_getColumnProxy(column));
	},
	onGridBaseHeaderSummaryCellDblClicked: function (grid, column) {
		this._handler.onHeaderSummaryCellDblClicked && this._handler.onHeaderSummaryCellDblClicked(this._handler, $$_getColumnProxy(column));
	},
	onGridBaseCheckBarHeadClicked: function (grid) {
		this._handler.onCheckBarHeadClicked && this._handler.onCheckBarHeadClicked(this._handler);
	},
	onGridBaseCheckBarFootClicked: function (grid) {
		this._handler.onCheckBarFootClicked && this._handler.onCheckBarFootClicked(this._handler);
	},
	onGridBaseIndicatorCellClicked: function (grid, itemIndex) {
		this._handler.onIndicatorCellClicked && this._handler.onIndicatorCellClicked(this._handler, itemIndex);
	},
	onGridBaseStateBarCellClicked: function (grid, itemIndex) {
		this._handler.onStateBarCellClicked && this._handler.onStateBarCellClicked(this._handler, itemIndex);
	},
	onGridBaseRowGroupHeadClicked: function (grid) {
		this._handler.onRowGroupHeadClicked && this._handler.onRowGroupHeadClicked(this._handler);
	},
	onGridBaseRowGroupFootClicked: function (grid) {
		this._handler.onRowGroupFootClicked && this._handler.onRowGroupFootClicked(this._handler);
	},
	onGridBaseRowGroupHeaderFooterClicked: function (grid, kind, index) {
		this._handler.onRowGroupHeaderFooterClicked && this._handler.onRowGroupHeaderFooterClicked(this._handler, kind, index.proxy());
	},
	onGridBaseRowGroupBarClicked: function (grid, index) {
		this._handler.onRowGroupBarClicked && this._handler.onRowGroupBarClicked(this._handler, index);
	},
	onGridBaseCheckBarFootDblClicked: function (grid, index) {
		this._handler.onCheckBarFootDblClicked && this._handler.onCheckBarFootDblClicked(this._handler, index);
	},
	onGridBaseIndicatorCellDblClicked: function (grid, itemIndex) {
		this._handler.onIndicatorCellDblClicked && this._handler.onIndicatorCellDblClicked(this._handler, itemIndex);
	},
	onGridBaseStateBarCellDblClicked: function (grid, itemIndex) {
		this._handler.onStateBarCellDblClicked && this._handler.onStateBarCellDblClicked(this._handler, itemIndex);
	},
	onGridBaseRowGroupHeadDblClicked: function (grid) {
		this._handler.onRowGroupHeadDblClicked && this._handler.onRowGroupHeadDblClicked(this._handler);
	},
	onGridBaseRowGroupFootDblClicked: function (grid) {
		this._handler.onRowGroupFootDblClicked && this._handler.onRowGroupFootDblClicked(this._handler);
	},
	onGridBaseRowGroupHeaderFooterDblClicked: function (grid, kind, index) {
		this._handler.onRowGroupHeaderFooterDblClicked && this._handler.onRowGroupHeaderFooterDblClicked(this._handler, kind, index.proxy());
	},
	onGridBaseRowGroupBarDblClicked: function (grid, index) {
		this._handler.onRowGroupBarDblClicked && this._handler.onRowGroupBarDblClicked(this._handler, index);
	},
	onGridBasePanelClicked: function (grid) {
		this._handler.onPanelClicked && this._handler.onPanelClicked(this._handler);
	},
	onGridBasePanelDblClicked: function (grid) {
		this._handler.onPanelDblClicked && this._handler.onPanelDblClicked(this._handler);
	},
	onGridBaseRowGroupPanelClicked: function (grid, column) {
		this._handler.onRowGroupPanelClicked && this._handler.onRowGroupPanelClicked(this._handler, $$_getColumnProxy(column));
	},
	onGridBaseRowGroupPanelDblClicked: function (grid, column) {
		this._handler.onRowGroupPanelDblClicked && this._handler.onRowGroupPanelDblClicked(this._handler, $$_getColumnProxy(column));
	},
	onGridBaseMenuItemClicked: function (grid, menuItem, index) {
		this._handler.onMenuItemClicked && this._handler.onMenuItemClicked(this._handler, menuItem.proxy(), index.proxy());
	},
	onGridBaseContextMenuPopup: function (grid, x, y, eltName) {
		return this._handler.onContextMenuPopup && this._handler.onContextMenuPopup(this._handler, x, y, eltName);
	},
    onGridBaseContextMenuItemClicked: function (grid, menuItem, index) {
        this._handler.onContextMenuItemClicked && this._handler.onContextMenuItemClicked(this._handler, menuItem.proxy(), index.proxy());
    },
	onGridBaseCellButtonClicked: function (grid, index) {
		this._handler.onCellButtonClicked && this._handler.onCellButtonClicked(this._handler, index.itemIndex(), $$_getColumnProxy(index.column()));
	},
	onGridBaseEditButtonClicked: function (grid, index) {
	},
	onGridBaseImageButtonClicked: function (grid, index, buttonIndex, name) {
		this._handler.onImageButtonClicked && this._handler.onImageButtonClicked(this._handler, index.itemIndex(), $$_getColumnProxy(index.column()), buttonIndex, name);
	},
	onGridBaseClickableCellClicked: function (grid, index, source, data) {
		if (source == ClickableCellRenderer.LINKABLE_CELL) {
			this._handler.onLinkableCellClicked && this._handler.onLinkableCellClicked(this._handler, index.proxy(), data);
		}
	},
	onGridBaseScrollToBottom: function (grid) {
		this._handler.onScrollToBottom && this._handler.onScrollToBottom(this._handler);
	},
	onGridBaseTopItemIndexChanged: function (grid, itemIndex) {
		this._handler.onTopItemIndexChanged && this._handler.onTopItemIndexChanged(this._handler, itemIndex);
	},
	onGridBaseDataCellClicked: function (grid, index) {
		this._handler.onDataCellClicked && this._handler.onDataCellClicked(this._handler, index.proxy());
	},
	onGridBaseDataCellDblClicked: function (grid, index) {
		this._handler.onDataCellDblClicked && this._handler.onDataCellDblClicked(this._handler, index.proxy());
	},
	onGridBaseRowsDeleting: function (grid, rows) {
		if (this._handler.onRowsDeleting) {
			var ret = this._handler.onRowsDeleting(this._handler, rows);
			if (typeof ret == "string" && ret) {
				throw ret;
			}
			return ret;
		}
	},
	onGridBaseRowInserting: function (grid, itemIndex, dataRow) {
		if (this._handler.onRowInserting) {
			var ret = this._handler.onRowInserting(this._handler, itemIndex, dataRow);
			if (typeof ret == "string" && ret) {
				throw ret;
			}
			return ret;
		}
	},
	onGridBaseSelectionChanged: function (grid) {
		this._handler.onSelectionChanged && this._handler.onSelectionChanged(this._handler);
	},
	onGridBaseSelectionAdded: function (grid, selection) {
		this._handler.onSelectionAdded && this._handler.onSelectionAdded(this._handler, $$_getSelectionProxy(grid, selection));
	},
	onGridBaseSelectionEnded: function (grid) {
		this._handler.onSelectionEnded && this._handler.onSelectionEnded(this._handler);
	},
    onGridBaseShowEditor: function (grid, index, attrs) {
        return this._handler.onShowEditor && this._handler.onShowEditor(this._handler, index.proxy(), attrs);
    },
	onGridBaseHideEditor: function (grid) {
		return this._handler.onHideEditor && this._handler.onHideEditor(this._handler);
	},
	onGridBaseEditChange: function (grid, index, value) {
		this._handler.onEditChange && this._handler.onEditChange(this._handler, index.proxy(), value);
	},
    onGridBaseGetEditValue: function (grid, index, editResult) {
        this._handler.onGetEditValue && this._handler.onGetEditValue(this._handler, index.proxy(), editResult);
    },
	onGridBaseEditCommit: function (grid, index, oldValue, newValue) {
        if (this._handler.onEditCommit) {
            var msg = this._handler.onEditCommit(this._handler, index.proxy(), oldValue, newValue);
            if (typeof msg == "string" && msg) {
                if (grid.editOptions().isShowCommitError()) {
                    alert(msg);
                }
                return false;
            }
        }
	},
	onGridBaseEditCanceled: function (grid, index) {
		return this._handler.onEditCanceled && this._handler.onEditCanceled(this._handler, index.proxy());
	},
	onGridBaseItemEditCanceled: function (grid, item) {
		return this._handler.onItemEditCanceled && this._handler.onItemEditCanceled(this._handler, item.index(), item.itemState());
	},
	onGridBaseItemEditCancel: function (grid, item) {
		return this._handler.onItemEditCancel && this._handler.onItemEditCancel(this._handler, item.index(), item.itemState());
	},
	onGridBaseEditSearch: function (grid, index, text) {
		return this._handler.onEditSearch && this._handler.onEditSearch(this._handler, index.proxy(), text);
	},
	onGridBaseSearchCellButtonClick: function (grid, index, text) {
		return this._handler.onSearchCellButtonClick ? this._handler.onSearchCellButtonClick(this._handler, index.proxy(), text) : true;
	}, 
	onGridBaseCellEdited: function (grid, item, field) {
		return this._handler.onCellEdited && this._handler.onCellEdited(this._handler, item.index(), item.dataRow(), field);
	},
	onGridBaseEditRowChanged: function (grid, item, field, oldValue, newValue) {
		return this._handler.onEditRowChanged && this._handler.onEditRowChanged(this._handler, item.index(), item.dataRow(), field, oldValue, newValue);
	},
	onGridBaseEditRowPasted: function (grid, item, fields, oldValues, newValues) {
		return this._handler.onEditRowPasted && this._handler.onEditRowPasted(this._handler, item.index(), item.dataRow(), fields, oldValues, newValues);
	},
	onGridBaseRowsPasted: function (grid, items) {
		return this._handler.onRowsPasted && this._handler.onRowsPasted(this._handler, items);	
	},
	onGridBaseItemChecked: function (grid, item, checked) {
		return this._handler.onItemChecked && this._handler.onItemChecked(this._handler, item.index(), checked);
	},
	onGridBaseItemsChecked: function (grid, items, checked) {
		return this._handler.onItemsChecked && this._handler.onItemsChecked(this._handler, $$_getItemIndicies(items), checked);
	},
	onGridBaseItemAllChecked: function (grid, checked) {
		return this._handler.onItemAllChecked && this._handler.onItemAllChecked(this._handler, checked);
	},
	onGridBaseErrorClicked: function (grid, error) {
		this._handler.onErrorClicked && this._handler.onErrorClicked(this._handler, error);
	},
    onGridBaseSorting: function (grid, fields, directions) {
        return this._handler.onSorting && this._handler.onSorting(this._handler, fields, directions);
    },
	onGridBaseSortingChanged: function (grid) {
		return this._handler.onSortingChanged && this._handler.onSortingChanged(this._handler);
	},
    onGridBaseFiltering: function (grid) {
        return this._handler.onFiltering && this._handler.onFiltering(this._handler);
    },
	onGridBaseFilteringChanged: function (grid) {
		return this._handler.onFilteringChanged && this._handler.onFilteringChanged(this._handler);
	},
	onGridBaseFilterActionClicked: function (grid, action, x, y) {
		this._handler.onFilterActionClicked && this._handler.onFilterActionClicked(this._handler, action.column().name(), action.name(), x, y);
	},
	onGridBaseKeyDown: function (grid, key, ctrl, shift, alt) {
		return this._handler.onKeyDown && this._handler.onKeyDown(this._handler, key, ctrl, shift, alt);
	},
	onGridBaseKeyPress: function (grid, key) {
		this._handler.onKeyPress && this._handler.onKeyPress(this._handler, key);
	},
	onGridBaseKeyUp: function (grid, key, ctrl, shift, alt) {
		return this._handler.onKeyUp && this._handler.onKeyUp(this._handler, key, ctrl, shift, alt);
	},
	onGridBaseShowTooltip: function (grid, index, value) {
		return this._handler.onShowTooltip ? this._handler.onShowTooltip(this._handler, index.proxy(), value) : value;
	},
	onGridBaseShowHeaderTooltip: function (grid, column, value) {
		return this._handler.onShowHeaderTooltip ? this._handler.onShowHeaderTooltip(this._handler, column.proxy(), value) : value;
	},
	onGridBaseColumnPropertyChanged: function (grid, column, property, value) {
		return this._handler.onColumnPropertyChanged && this._handler.onColumnPropertyChanged(this._handler, column.proxy(), property, value);
	},

});
var RealGridObserver = defineClass("RealGridObserver", RealGridObserverBase, {
	init: function (handler) {
		this._super(handler);
	},
	onGridViewPageChanging: function (grid, newPage) {
		return !this._handler.onPageChanging || this._handler.onPageChanging(this._handler, newPage);
	},
	onGridViewPageChanged: function (grid, page) {
		this._handler.onPageChanged && this._handler.onPageChanged(this._handler, page);
	},
	onGridViewPageCountChanged: function (grid, newCount) {
		this._handler.onPageCountChanged && this._handler.onPageCountChanged(this._handler, newCount);
	},
	onGridViewGrouping: function (grid, fields) {
        return this._handler.onGrouping && this._handler.onGrouping(this._handler, fields);
	},
	onGridViewGrouped: function (grid) {
		this._handler.onGroupingChanged && this._handler.onGroupingChanged(this._handler);
	},
	onGridViewExpanding: function (grid, group) {
		return true;
	},
	onGridViewExpanded: function (grid, group) {
	},
	onGridViewCollapsing: function (grid, group) {
		return true;
	},
	onGridViewCollapsed: function (grid, group) {
	}
});
var RealTreeObserver = defineClass("RealTreeObserver", RealGridObserverBase, {
	init: function (handler) {
		this._super(handler);
	},
	onTreeViewExpanding: function (tree, item) {
		return !this._handler.onTreeItemExpanding || this._handler.onTreeItemExpanding(this._handler, item.index(), item.dataRow());
	},
	onTreeViewExpanded: function (tree, item) {
		this._handler.onTreeItemExpanded && this._handler.onTreeItemExpanded(this._handler, item.index(), item.dataRow());
	},
	onTreeViewCollapsing: function (tree, item) {
		return !this._handler.onTreeItemCollapsing || this._handler.onTreeItemCollapsing(this._handler, item.index(), item.dataRow());
	},
	onTreeViewCollapsed: function (tree, item) {
		this._handler.onTreeItemCollapsed && this._handler.onTreeItemCollapsed(this._handler, item.index(), item.dataRow());
	},
	onTreeViewChanged: function (tree, item) {
		this._handler.onTreeItemChanged && this._handler.onTreeItemChanged(this._handler, item.index(), item.dataRow());
	}
});
