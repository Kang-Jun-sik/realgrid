var ColumnSummary = defineClass("ColumnSummary", GridObject, {
	init: function (column) {
		this._super();
		this._column = column;
		this._styles = new VisualStyles(this, "columnSummaryStyles");
		this._groupStyles = new VisualStyles(this, "columnRowGroupSummaryStyles");
		this._dynamicStyles = new DynamicStyleCollection(this);
		this._groupDynamicStyles = new DynamicStyleCollection(this);
		this._exprNode = undefined;
		this._groupExprNode = undefined;
		this._dirty = false;
	},
	destroy: function() {
		this._destroying = true;
		this._column = null;
		this._styles = null;
		this._groupStyles = null;
		this._dynamicStyles = null;
		this._super();
	},
	stylesChanged: function (styleProp) {
		this._changed();
	},
	styles: null,
	groupStyles: null,
	text: null,
	expression: null,
	groupText: null,
	groupExpression: null,
	dynamicStyles: null,
	groupDynamicStyles: null,
	callback: null,
	groupCallback: null,
	column: function () {
		return this._column;
	},
	isDirty: function () {
		return this._dirty;
	},
	setText: function (value) {
		if (value != this._text) {
			if (value instanceof Array) {
				this._text = [];
				for (var i = 0; i < value.length; i++) {
					this._text.push(value[i]);
				}
			} else {
				this._text = value;
			}
			this._changed();
		}
	},
	setGroupText: function (value) {
		if (value != this._groupText) {
			this._groupText = value;
			this._changed();
		}
	},
	setStyles: function (value) {
		if (value !== this._styles) {
			this._styles.extend(value);
		}
	},
	setGroupStyles: function (value) {
		if (value !== this._groupStyles) {
			this._groupStyles.extend(value);
		}
	},
	setExpression: function (value) {
		if (typeof value == "string") {
			value = trim(value);
		}

		if (value != this._expression) {
			if (value instanceof Array) {
				this._expression = [];
				this._exprNode = [];

				for (var i = 0; i < value.length; i++) {
					this._expression.push(value[i]);
					if (value[i]) {
						this._exprNode.push(ExpressionParser.Default.parse(value[i]));
					} else {
						this._exprNode.push(null);
					}
				}
			}  else {
				this._expression = value;
				
				if (value) {
					this._exprNode = ExpressionParser.Default.parse(value);
				} else {
					this._exprNode = undefined;
				}
			}

			this._changed();
		}
	},
	setGroupExpression: function (value) {
		value = trim(value);
		if (value != this._groupExpression) {
			this._groupExpression = value;
			if (value) {
				this._groupExprNode = ExpressionParser.Default.parse(value);
			} else {
				this._groupExprNode = undefined;
			}
			this._changed();
		}
	},
	setDynamicStyles: function (value) {
		this._dynamicStyles.setItems(value);
		this._changed();
	},
	setGroupDynamicStyles: function (value) {
		this._groupDynamicStyles.setItems(value);
		this._changed();
	},
	clean: function () {
		this._dirty = false;
	},
	/* internal */ capitalIndexers: function () {
		return null;
	},
	/* internal */ evaluate: function (runtime, index) {
		if (this._exprNode) {
			if (this._exprNode instanceof Array) {
				if (index !== undefined && this._exprNode[index]) {
					return this._exprNode[index].evaluate(runtime);
				} else {
					return;
				}
			} else {
				return this._exprNode.evaluate(runtime);
			}
		} else { 
			return;
		}
	},
	/* internal */ evaluateGroup: function (runtime) {
		return this._groupExprNode && this._groupExprNode.evaluate(runtime);
	},
	_changed: function () {
		if (!this._dirty) {
			this.dirty = true;
			if (this._column && this._column._footerChanged) {
				this._column._footerChanged();
			}
		}
	}
});
var ColumnHeaderSummary = defineClass("ColumnHeaderSummary", ColumnSummary, {
	init: function (columnHeader) {
		this._super(columnHeader._column);
	}
});
var ColumnHeader = defineClass("ColumnHeader", GridObject, {
	init: function (column) {
		GridObject$.init.call(this);
		this._column = column;
		this._summary = new ColumnHeaderSummary(this);
		this._styles = new VisualStyles(this, "columnHeaderStyles");
        this._subStyles = new VisualStyles(this, "columnHeaderSubStyles");
		this._dirty = false;
	},
	destroy: function() {
		this._destroying = true;
		this._column = null;
		this._summary = null;
		this._styles = null;
        this._subStyles = null;
        this._super();
	},
	stylesChanged: function (/*styleProp*/) {
		this._changed();
	},
	summary: null,
	styles: null,
    subStyles: null,
	text: null,
    subText: null,
    subTextGap: undefined,
    itemOffset: undefined,
    itemGap: undefined,
    subTextLocation: undefined,
    imageIndex: -1,
    imageUrl: null,
	checkLocation: ColumnHeaderItemLocation.NONE,
	imageLocation: ColumnHeaderItemLocation.NONE,
	clickBehavior: ClickBehavior.NONE,
	showTooltip:true,
	tooltip : null,	
	fixedHeight: 0,
	column: function () {
		return this._column;
	},
	setSummary: function (value) {
		if (value != this._summary) {
			this._summary.assign(value);
			this._changed();
		}
	},
	setStyles: function (value) {
		if (value !== this._styles) {
			this._styles.extend(value);
		}
	},
    setSubStyles: function (value) {
        if (value !== this._subStyles) {
            this._subStyles.extend(value);
        }
    },
	displayText: function () {
        var s = this._text;
        if (!s && this._column instanceof DataColumn) {
            var fld = this._column.getField();
            if (fld) {
                s = fld.header() || fld.orgFieldName();
            } else {
                s = this._column.fieldName();
            }
        }
        if (!s) {
            s = this._column.name();
        }
		return s;
	},
	clean: function () {
		this._dirty = false;
	},
	_changed: function () {
		if (!this._dirty) {
			this.dirty = true;
			if (this._column) {
				this._column._headerChanged();
			}
		}
	}
});
var ColumnFooter = defineClass("ColumnFooter", ColumnSummary, {
	init: function (column) {
		this._super(column);
	}
});
var Column = defineClass("Column", null, {
	init: function (config) {
		this._super();
		this._initColumn();
		config && this.assign(config);
	},
	destroy : function() {
		this._destroying = true;
		this._styles = null;
		this._header = null;
		this._states = null;
		this._layoutRect = null;
		this._super();
	},
	_initColumn: function () {
		this._header = this._createHeader();
		this._styles = new VisualStyles(this, "columnStyles");
		this._index = -1;
		this._layoutRect = new Rectangle();
		this._orgWidth = NaN;
        this._groupWidth = NaN;
        this._displayOffset = NaN;
        this._displayWidth = NaN;
		this._fitOffset = NaN;
		this._fitWidth = NaN;
		this._measuredHeight = -1;
		this._dataRoot = null;
		this._distance = 0;
		this._value = UNDEFINED;
		this._states = {};
		this._parent = null;
        this.$_grid = null;
        this.$_fixed = false;
        this.$_rightFixed = false;
	},
	stylesChanged: function (styleProp) {
		this._changed();
	},
	header: null,
	styles: null,
	dirty: false,
	name: null,
	tag: null,
	visible: true,
	width: 100,
	height: 0,
	/* @internal */ saveWidth: NaN,
	/* @internal */ fillWidth: 0,
	/* @internal */ fillHeight: 0,
	thickness: 1.0,
	resizable: true,
	movable: true,
	styleName: null,
	displayIndex: -1,
    checked: false,
	grid: function () {
		return this.$_grid || (this._parent ? this._parent.grid() : null);
	},
	parent: function () {
		return this._parent;
	},
	setParent: function (value) {
		if (value != this._parent) {
			if (this._parent) {
				this._parent._removeInternal(this);
			}
			if (value) {
				value._addInternal(this);
			}
			var grid = this.grid();
			if (grid) {
				grid._columnsReset();
			}
		}
	},
	group: function () {
		return (this._parent instanceof RootColumn) ? null : this._parent;
	},
	root: function () {
		var g = this.group();
		return g ? g.root() : this;
	},
	isRoot: function () {
		return this === this.root();
	},
	dataRoot: function () {
		return this._dataRoot;
	},
	isDataRoot: function () {
		return this._dataRoot === this;
	},
	isDirty: function () {
		return this._dirty || this._header._isDirty;
	},
	setHeader: function (value) {
		if (typeof value == "string") {
			value = { text: value };
		}
		this._header.assign(value);
	},
	setVisible: function (value) {
		if (value != this._visible) {
			this._visible = value;
			this._invalidateSize();
			if (this.isVisible() && this.canMerge && this.canMerge()) {
				var merges = this.stateFor(ColumnMergeManager.MERGE_ROOMS);
				if (merges) {
					merges.clear();
					if (this instanceof DataColumn && this.isMergeGrouped()) {
						level = this.grid().getGroupLevel(this.dataIndex());
						if (level > 0) {
							merges.initialize(RowGroupMergeRule.INIT_COUNT);
						}
					} else {
						merges.initialize(ColumnMergeRule.INIT_COUNT);
					}
				}
			}
			this._invalidateVisible();
		}
	},
	setWidth: function (value) {
		value = Math.max(0, value);
		if (value != this._width) {
			this._width = value;
            if (!this.group() || isNaN(this._groupWidth)) {
                this._displayWidth = this._groupWidth = value;
            }
			this._invalidateSize();
		}
	},
	setHeight: function (value) {
		value = Math.max(0, _int(value));
		if (value != this._height) {
			this._height = value;
			this._changed();
		}
	},
	setFillWidth: function (value) {
		value = Math.max(0, _int(value));
		if (value != this._fillWidth) {
			this._fillWidth = value;
			this._changed();
		}
	},
	setFillHeight: function (value) {
		value = Math.max(0, _int(value));
		if (value != this._fillHeight) {
			this._fillHeight = value;
			this._changed();
		}
	},
    groupWidth: function () {
        return this._groupWidth;
    },
	displayOffset: function () {
		return isNaN(this._fitOffset) ? this._displayOffset : this._fitOffset;
	},
	displayWidth: {
		get: function () {
            return isNaN(this._fitWidth) ? this._displayWidth : _int(this._fitWidth);
		},
		set: function (value) {
			value = Math.max(0, value);
			var w = this.displayWidth();
			isNaN(w) && (w = 0);
			if (!isNaN(value) && value != w) {
				ColumnGroup.changeWidth(this, value - w);
			}
			/*
			if (isNaN(w)) w = 0;
			if (value != w) {
				ColumnGroup.changeWidth(this, value - w);
			}
			*/
		}
	},
	saveWidth_: function () {
		return isNaN(this._fitWidth) ? this._groupWidth : this._fitWidth;
	},
	setSaveWidth: function (value) {
		this._saveWidth = value;
	},
	measuredHeight: function () {
		return this._measuredHeight;
	},
	index: function () {
		return this._index;
	},
	displayIndex_: function () {
		return this._visible ? this._displayIndex : -1;
	},
	setDisplayIndex: function (value) {
        if (this._parent) {
            if (value < 0) {
                this.setVisible(false);
            } else {
                value = Math.min(value, this._parent.visibleCount() - 1);
                this._parent.setVisibleIndex(this, value);
            }
        }
	},
	setStyles: function (value) {
		if (value !== this._styles) {
			this._styles.extend(value);
			this._changed();
		}
	},
    setChecked: function (value) {
        if (value != this._checked) {
            this._checked = value;
            this._changed();
            var grid = this.grid();
            grid && grid._columnCheckedChanged(this);
        }
    },
	distance: function () {
		return this._distance;
	},
	displayText: function () {
		return this._name ? this._name : this.header() ? this.header().text()  : "col:" + this._index;
	},
    isFixed: function () {
        return this.$_fixed;
    },
    isRightFixed: function () {
    	return this.$_rightFixed;
    },
	prepare: function (grid, fixed, rightFixed) {
        this.$_grid = grid;
        this.$_fixed = fixed;
        this.$_rightFixed = rightFixed;
	},
	clean: function () {
		this._dirty = false;
		this._header.clean();
	},
	$_getOffset: function () {
		var x = 0,
			c = this,
			p = c.group();
		while (p) {
			x += c.displayOffset();
			c = p;
			p = p.group();
		}
		return x;
	},
	stateFor: function (state) {
		return this._states[state];
	},
	setState: function (state, value) {
		this._states[state] = value;
	},
	propertyChanged: function (/*prop, oldValue, newValue*/) {
		this._changed();
	},
	_setParent: function (group) {
		if (group != this._parent) {
			if (group) {
				group._columnRemoved(this);
			}
			this._parent = group;
			if (group) {
				group._columnAdded(this);
			}
			this._parentChanged();
		}
	},
	_parentChanged: function () {
	},
	_createHeader: function () {
		return new ColumnHeader(this);
	},
	_headerChanged: function () {
		this._changed();
	},
	_invalidateSize: function () {
		var grid = this.grid();
		if (grid) {
			this._dirty = true;
			grid.invalidateColumnWidths();
		}
	},
	_invalidateVisible: function () {
		var grid = this.grid();
		grid && grid._columnVisibleIndexChanged(this);
	},
	_changed: function () {
		if (!this._dirty) {
			this._dirty = true;
			var grid = this.grid();
			grid &&	grid.invalidateColumns();
		}
	},
	checkGroupExist: function (orientation) {
		var c = this;
		var parent = c.group();
		while (parent) {
			if (!orientation || parent.orientation() === orientation) {
				return true;
			}
			parent = parent.group();
		}
		return false;		
	}
}, {
	compareLoc: function (col1, col2) {
		if (col1 == null || col2 == null) {
			return 0;
		}
		if (col1 == null) {
			return -1;
		}
		if (col2 == null) {
			return 1;
		}
		var idx1 = col1.root().displayIndex();
		var idx2 = col2.root().displayIndex();
		if (idx1 == idx2) {
			if (col1.group() == col2.group()) {
				idx1 = col1.displayIndex();
				idx2 = col2.displayIndex();
			} else {
				idx1 = col1.dataRoot().displayIndex();
				idx2 = col2.dataRoot().displayIndex();
			}
		}
		return idx1 - idx2;
	}
});
Column.MIN_WIDTH = 2;
var Column$ = Column.prototype;
var ColumnGroupHeader = defineClass("ColumnGroupHeader", ColumnHeader, {
	init: function (group) {
		this._super(group);
		this._fillHeight = 0; // fixedHeight가 지정된 컬럼이 포함된 그룹의 높이 계산용 
	},
	stylesChanged: function (styleProp) {
		this._changed();
	},
	visible: true,
	group: function () {
		return this._column;
	}
});
var ColumnGroup = defineClass("ColumnGroup", Column, {
	init: function (config) {
		this._super(config);
	},
	destroy: function() {
		this._destroying = true;
		this._headerLevel = null;
		this._columns && !this._columns.destroying && this._columns.destroy && this._columns.destroy();
		this._columns = null;
		this._dataLevel = null;
		this._super();
	},
	_initColumn: function() {
		this._super();
		this._columns = new ColumnCollection(this);
		this._sum = UNDEFINED;
	},
	orientation: ColumnGroupOrientation.HORIZONTAL,
    hideChildHeaders: false,
    columns: null,
	setOrientation: function (value) {
		value = value == ColumnGroupOrientation.VERTICAL ? value : ColumnGroupOrientation.HORIZONTAL;
		if (value != this._orientation) {
			this._orientation = value;
			this.resetGroupWidths();
			this._changed();
			this.grid() && this.grid()._resetColumnPositions();
		}
	},
	columns_: function () {
		return this._columns.items();
	},
	setColumns: function (value) {
		var i,
			cnt,
			column,
			columns = this._columns;
		columns.clear();
		if (value && (cnt = value.length) > 0) {
			for (i = 0; i < cnt; i++) {
				column = value[i];
				if (!(column instanceof Column)) {
					column = GridBase.createColumn(column);
					this._columns.add(column);
				} else if (columns.indexOf(column) < 0) {
					this._columns.add(column);
				}
			}
			this.$_attachChildren();
		}
		if (this.grid()) {
			this.grid()._columnsReset(this);
		}
	},
    visibleItems: function () {
        return this._columns.visibleItems();
    },
    getOrderedColumns: function () {
    	return this._columns.getOrderedColumns();
    },
    /*internal */ dataLevel: function () {
        return this._dataLevel;
    },
    /*internal */ headerLevel: function () {
        return this._headerLevel;
    },
	count: function () {
		return this._columns.count();
	},
	visibleCount: function () {
		return this._columns.visibleCount();
	},
	isVertical: function () {
		return this._orientation == ColumnGroupOrientation.VERTICAL;
	},
	isHorizontal: function () {
		return this._orientation != ColumnGroupOrientation.VERTICAL;
	},
	first: function () {
		return $_getFirstColumn(this) || this;
	},
	last: function () {
		return $_getLastColumn(this) || this;
	},
	getItem: function (index) {
		return this._columns.getItem(index);
	},
	getVisibleItem: function (index) {
        if (index < 0 || index >= this._columns.visibleCount()) {
            throw "Invalid visible index: " + index;
        }
		return this._columns.getVisibleItem(index);
	},
	isAncestorOf: function (column) {
		if (column && column !== this) {
			var p = column._parent;
			while (p) {
				if (p === this) {
					return true;
				}
				p = p._parent;
			}
		}
		return false;
	},
    setChildrenProperty: function (prop, value, recursive, visibleOnly) {
        this._columns.setChildrenProperty(prop, value, recursive, visibleOnly);
    },
	/* @internal */ calcHeaderLevels: function () {
		var levels = this.header().isVisible() ? 1 : 0;
		if (!this._hideChildHeaders) {
			var i,
				group,
				cols = this.visibleCount(),
				cnt = 0;
			if (cols > 0) {
				if (this.isHorizontal()) {
					cnt = 1;
					for (i = 0; i < cols; i++) {
						group = this.getVisibleItem(i);
						if (group instanceof ColumnGroup) {
							cnt = Math.max(cnt, group.calcHeaderLevels());
						}
					}
				} else {
					for (i = 0; i < cols; i++) {
						group = this.getVisibleItem(i);
						if (group instanceof ColumnGroup) {
							cnt += group.calcHeaderLevels();
						} else {
							cnt++;
						}
					}
				}
			}
			levels += cnt;
		}
		return this._headerLevel = levels;
	},
	/* @internal */ calcDataLevels: function () {
		var	columns = this._columns;
		var	levels = 0;
		var	cols = this.visibleCount();
		var	cnt = 0;
        var i, group;
		if (cols > 0) {
			if (this.isHorizontal()) {
				cnt = 1;
				for (i = 0; i < cols; i++) {
					group = columns.getVisibleItem(i);
					if (group instanceof ColumnGroup) {
						cnt = Math.max(cnt, group.calcDataLevels());
					}
				}
			} else {
				for (i = 0; i < cols; i++) {
					group = columns.getVisibleItem(i);
					if (group instanceof ColumnGroup) {
						cnt += group.calcDataLevels();
					} else {
						cnt++;
					}
				}
			}
		}
		return this._dataLevel = levels + cnt;
	},
	/* @interal */ calcHorz: function () {
		var	column;
		var	cnt = this.visibleCount();
		var	result = 1;
        var i;
		if (cnt >= 1) {
			if (this.isVertical()) {
				result = 1;
				for (i = 0; i < cnt; i++) {
					column = this.getVisibleItem(i);
					if (column instanceof ColumnGroup) {
						result = Math.max(result, column.calcHorz());
					}
				}
			} else {
				result = 0;
				for (i = 0; i < cnt; i++) {
					column = this.getVisibleItem(i);
					if (column instanceof ColumnGroup) {
						result += Math.max(1, column.calcHorz());
					} else {
						result++;
					}
				}
			}
		}
		return result;
	},
	right: function (column) {
		if (this.isHorizontal()) {
            try {
                var idx = this._checkVisible(column);
                if (idx < this.visibleCount() - 1) {
                    column = $_getRightColumn(this, idx + 1);
                    return column;
                }
            } catch (err) {
            }
		}
		return null;
	},
	left: function (column) {
		if (this.isHorizontal()) {
            try {
                var idx = this._checkVisible(column);
                if (idx > 0) {
                    column = $_getLeftColumn(this, idx - 1);
                    return column;
                }
            } catch (err) {
            }
		}
		return null;
	},
	next: function (column) {
        try {
            var idx = this._checkVisible(column);
            if (idx < this.visibleCount() - 1) {
                column = $_getNextColumn(this, idx + 1);
                return column;
            }
        } catch (err) {
        }
		return null;
	},
	prev: function (column) {
        try {
            var idx = this._checkVisible(column);
            if (idx > 0) {
                column = $_getPrevColumn(this, idx - 1);
                return column;
            }
        } catch (err) {
        }
		return null;
	},
	lower: function (column) {
		if (this.isVertical()) {
            try {
                var idx = this._checkVisible(column);
                if (idx < this.count() - 1) {
                    column = $_getLowerColumn(this, idx + 1);
                    return column;
                }
            } catch (err) {
            }
		}
		return null;
	},
	upper: function (column) {
		if (this.isVertical()) {
            try {
                var idx = this._checkVisible(column);
                if (idx > 0) {
                    column = $_getUpperColumn(this, idx - 1);
                    return column;
                }
            } catch (err) {
            }
		}
		return null;
	},
	getDataColumn: function (fieldIndex) {
		for (var i = 0, cnt = this.count(); i < cnt; i++) {
			var column = this.getItem(i);
			if (column instanceof DataColumn) {
				if (column.dataIndex() == fieldIndex) {
					return column;
				}
			} else if (column instanceof ColumnGroup) {
				column = column.getDataColumn(fieldIndex);
				if (column) {
					return column;
				}
			}
		}
		return null;
	},
	columnAtPoint: function (x, y) {
		var i, column, group;
		var cnt = this.visibleCount();
		if (this.isVertical()) {
			for (i = 0; i < cnt; i++) {
				column = this.getVisibleItem(i);
				if (y < column._layoutRect.bottom()) {
					group = _cast(column, ColumnGroup);
					if (group) {
						y -= column._layoutRect.y;
						return group.columnAtPoint(x, y);
					}
					return column;
				}
			}
		} else {
			for (i = 0; i < cnt; i++) {
				column = this.getVisibleItem(i);
				if (x < column._layoutRect.right()) {
					group = _cast(column, ColumnGroup);
					if (group) {
						x -= column._layoutRect.x;
						return group.columnAtPoint(x, y);
					}
					return column;
				}
			}
		}
		return this;
	},
	_addInternal: function (column, index) {
		if (!(column instanceof Column)) {
			column = GridBase.createColumn(column);
		}
		if (column && !(column instanceof ColumnGroup && column.isAncestorOf(this)) && column.parent() !== this) {
			this._columns.add(column, index);
			return column;
		}
		return null;
	},
	add: function (column, index) {
		var grid;
		var col = this._addInternal(column, index);
		if (col && (grid = this.grid())) {
			grid._columnsReset(this);
			return $$_getColumnProxy(col)
		}
		return null;
	},
	_removeInternal: function (column) {
		var index = this._columns.indexOf(column);
		if (index >= 0) {
			this._columns.removeAt(index);
			var grid = this.grid();

			var summaryView = grid._summaryView;
			var cell = summaryView && summaryView.findCell(this);
			if (cell && cell instanceof SummaryGroupCellElement) {
				var elt = cell._elements;
				cell.removeElement(cell.findCell(column));
				cell._cells && (delete cell._cells[column.$_hash]);
			}

			var footerView = grid._footerView;
			for (var i = 0 , cnt = grid.footer().count(); i < cnt; i++) {
				var cell = footerView && footerView.findCell(i, this);
				if (cell && cell instanceof FooterGroupCellElement) {
					var elt = cell._elements;
					cell.removeElement(cell.findCell(column));
					cell._cells && (delete cell._cells[column.$_hash]);
				}
			}
			return true;
		}
		return false;
	},
	remove: function (column) {
		if (this._removeInternal(column)) {
			var grid = this.grid();
			if (grid) {
				grid._columnsReset(this);
			}
			return true;
		}
		return false;
	},
	removeAt: function (index) {
		if (index >= 0 && index < this.count()) {
			this._columns.removeAt(index);
            var grid = this.grid();
			if (grid) {
				grid._columnsReset(this);
			}
            return true;
		}
        return false;
	},
	clear: function () {
		if (this.count() > 0) {
			this._columns.clear();
            var grid = this.grid();
            if (grid) {
                grid._columnsReset(this);
			}
		}
	},
	setChildIndex: function (column, newIndex) {
		var grid = this.grid();
		if (column && column.parent() === this && column.index() != newIndex) {
			if (this._columns.move(column, newIndex) && grid) {
				grid._columnIndexChanged(column);
			}
		}
	},
	setVisibleIndex: function (column, newIndex) {
		var grid = this.grid();
		if (column && column.parent() === this) {
			if (this._columns.moveVisible(column, newIndex) && grid) {
				grid._columnVisibleIndexChanged(column);
			}
		}
	},
	/* @internal */ initGroupWidths: function () {
		var cnt = this._columns.count();
		if (cnt < 1) {
			return;
		}
		for (var i = 0; i < cnt; i++) {
			var column = this._columns.getItem(i);
			column._displayWidth = column._groupWidth = NaN;
			if (column instanceof ColumnGroup) {
				column.initGroupWidths();
			}
		}
		/*
		var column, sum, i, w, len;
		var gw = this._groupWidth;
		if (this.isVertical()) {
			for (i = 0; i < cnt; i++) {
				column = this._columns.getItem(i);
				column._groupWidth = gw;
				column._displayOffset = 0;
			}
		} else {
			sum = 0;
			for (i = 0; i < cnt; i++) {
				column = this._columns.getItem(i);
				sum += column._width;
			}
			len = 0;
			for (i = 0; i < cnt - 1; i++) {
				column = this._columns.getItem(i);
				w = gw * column._width / sum;
				column._groupWidth = w;
				column._displayOffset = _int(len);
				len += w;
			}
			column = this._columns.getItem(cnt - 1);
			w = gw - len;
			column._groupWidth = w;
			column._displayOffset = _int(len);
		}
		for (i = 0; i < cnt; i++) {
			column = this._columns.getItem(i);
			if (column instanceof ColumnGroup) {
				column.initGroupWidths();
			}
		}
		*/
	},
	/* @internal */ restoreGroupWidths: function () {
		var cnt = this._columns.count();
		if (cnt < 1) {
			return;
		}
		var column, sum, i, w, len;
		var gw = this._groupWidth;
		if (this.isVertical()) {
			for (i = 0; i < cnt; i++) {
				column = this._columns.getItem(i);
				column._displayWidth = column._groupWidth = gw;
				column._displayOffset = 0;
			}
		} else {
			sum = 0;
			for (i = 0; i < cnt; i++) {
				column = this._columns.getItem(i);
				sum += column._displayWidth = !isNaN(column._saveWidth) ? column._saveWidth : column._groupWidth;
			}
			len = 0;
			for (i = 0; i < cnt - 1; i++) {
				column = this._columns.getItem(i);
				w = column._displayWidth * gw / sum;
				column._groupWidth = w;
				column._displayOffset = _int(len);
				len += w;
                column._displayWidth = _int(len) - column._displayOffset;
			}
			column = this._columns.getItem(cnt - 1);
			w = gw - len;
			column._groupWidth = w;
			column._displayOffset = _int(len);
            column._displayWidth = _int(len + w) - column._displayOffset;
		}
		for (i = 0; i < cnt; i++) {
			column = this._columns.getItem(i);
			if (column instanceof ColumnGroup) {
				column.restoreGroupWidths();
			}
		}
	},
	/* @internal */ resetGroupWidths: function () {
		var cnt = this._columns.visibleCount();
		if (cnt < 1) {
			return;
		}
		var i, column, sum, w, len, wSum;
		var gw = this._groupWidth;
		if (this.isVertical()) {
			for (i = 0; i < cnt; i++) {
				column = this._columns.getVisibleItem(i);
				column._displayWidth = column._groupWidth = gw;
				column._displayOffset = 0;
			}
		} else {
			sum = 0;
			for (i = 0; i < cnt; i++) {
				column = this._columns.getVisibleItem(i);
				sum += column._displayWidth = column._width;// isNaN(column._groupWidth) ? column._width : column._groupWidth;
			}
			len = 0;
			wSum = 0;
			for (i = 0; i < cnt - 1; i++) {
				column = this._columns.getVisibleItem(i);
				wSum += column._displayWidth;
				w = _int(gw * wSum / sum) - len;
				column._groupWidth = w;
				column._displayOffset = _int(len);
				len += w;
                column._displayWidth = _int(len) - column._displayOffset;
			}
			column = this._columns.getVisibleItem(cnt - 1);
			w = gw - len;
			column._groupWidth = w;
			column._displayOffset = _int(len);
            column._displayWidth = _int(len + w) - column._displayOffset;
		}
		for (i = 0; i < cnt; i++) {
			column = this._columns.getItem(i);
			if (column instanceof ColumnGroup) {
				column.resetGroupWidths();
			}
		}
	},
	collectColumns: function (list, columnsOnly) {
		for (var i = 0, cnt = this._columns.count(); i < cnt; i++) {
			var column = this._columns.getItem(i);
			if ((!columnsOnly || !(column instanceof ColumnGroup))) {
				list.push(column);
			}
			if (column instanceof ColumnGroup) {
				column.collectColumns(list, columnsOnly);
			}
		}
	},
	collectGroups: function (list) {
		for (var i = 0, cnt = this._columns.count(); i < cnt; i++) {
			var group = _cast(this._columns.getItem(i), ColumnGroup);
			if (group) {
				list.push(group);
				group.collectGroups(list);
			}
		}
	},
	collectColumnNames: function (list, columnsOnly) {
		for (var i = 0, cnt = this._columns.count(); i < cnt; i++) {
			var column = this._columns.getItem(i);
            var name;
			if (column && (name = column.name()) && (!columnsOnly || !(column instanceof ColumnGroup))) {
                list.push(name);
			}
			if (column instanceof ColumnGroup) {
				column.collectColumnNames(list, columnsOnly);
			}
		}
		return list;
	},
	collectGroupNames: function (list) {
		for (var i = 0, cnt = this._columns.count(); i < cnt; i++) {
			var column = this._columns.getItem(i);
			if (column instanceof ColumnGroup) {
                var name = column.name();
				name && list.push(name);
				column.collectGroupNames(list);
			}
		}
		return list;
	},
	/* @intenral */ clearMergeGrouped: function () {
		var i, column,
			cnt = this._columns.count();
		for (i = 0; i < cnt; i++) {
			column = this._columns.getItem(i);
			if (column instanceof DataColumn) {
				column._setMergeGrouped(false);
			}
			if (column instanceof ColumnGroup) {
				column.clearMergeGrouped();
			}
		}
	},
	columnByName: function (name) {
		return this._columns.columnByName(name);
	},
	valueColumnByName: function (name) {
		return this._columns.valueColumnByName(name);
	},
	columnByField: function (fieldIndex) {
		if (fieldIndex >= 0) {
			var i,
				cnt = this._columns.count(),
				column;
			for (i = 0; i < cnt; i++) {
				column = this._columns.getItem(i);
				if (column instanceof DataColumn && column.fieldName() && column.dataIndex() == fieldIndex) {
					return column;
				}
				if (column instanceof ColumnGroup) {
					column = column.columnByField(fieldIndex);
					if (column) {
						return column;
					}
				}
			}
		}
		return null;
	},
	columnByFieldName: function (fieldName) {
		if (fieldName) {
			var fld = fieldName.toLowerCase(),
				i,
				cnt = this._columns.count(),
				column;
			for (i = 0; i < cnt; i++) {
				column = this._columns.getItem(i);
				if (column instanceof DataColumn && column.fieldName() && column.fieldName().toLowerCase() == fld) {
					return column;
				}
				if (column instanceof ColumnGroup) {
					column = column.columnByFieldName(fieldName);
					if (column) {
						return column;
					}
				}
			}
		}
		return null;
	},
	collectColumnsByFieldName: function (fieldName, list) {
		if (fieldName) {
			var fld = fieldName.toLowerCase(),
				i,
				cnt = this._columns.count(),
				column;
			for (i = 0; i < cnt; i++) {
				column = this._columns.getItem(i);
				if (column instanceof DataColumn && column.fieldName() && column.fieldName().toLowerCase() == fld) {
					list.push(column);
				}
				if (column instanceof ColumnGroup) {
					column.collectColumnsByFieldName(fieldName, list);
				}
			}
		}
	},
	columnByTag: function (tag) {
		if (tag) {
			var i,
				cnt = this._columns.count(),
				column;
			for (i = 0; i < cnt; i++) {
				column = this._columns.getItem(i);
				if (column.tag() == tag) {
					return column;
				}
				if (column instanceof ColumnGroup) {
					column = column.columnByTag(tag);
					if (column) {
						return column;
					}
				}
			}
		}
		return null;
	},
	collectColumnsByTag: function (tag, list) {
		if (tag) {
			var i,
				cnt = this._columns.count(),
				column;
			for (i = 0; i < cnt; i++) {
				column = this._columns.getItem(i);
				if (column.tag() == tag) {
					list.push(column);
				}
				if (column instanceof ColumnGroup) {
					column.collectColumnsByTag(tag, list);
				}
			}
		}
	},
    getLeafItems: function (visibleOnly) {
        visibleOnly = arguments.length > 0 ? visibleOnly : true;
        var columns = [];
        $_collectColumns(this, columns, visibleOnly);
        return columns;
    },
    getHorzColumns: function (start, count) {
        var columns = [];
        var end = start != undefined && count != undefined ? start + count - 1 : undefined;
        $_collectHorzColumns(this, columns, start, end);
        return columns;
    },
    getValueColumns: function (visibleOnly) {
        visibleOnly = arguments.length > 0 ? visibleOnly : true;
        var columns = [];
        $_collectValueColumns(this, columns, visibleOnly);
        return columns;
    },
	getDataColumns: function (visibleOnly) {
		visibleOnly = arguments.length > 0 ? visibleOnly : true;
		var columns = [];
		$_collectDataColumns(this, columns, visibleOnly);
		return columns;
	},
	/* @internal */ clearFitWidths: function () {
		this._columns.$_clearFitWidths();
	},
	/* @internal */ resetFitWidths: function () {
		var cnt = this._columns.visibleCount();
		if (cnt < 1) {
			return;
		}
		var i;
		var w;
		var len;
		var column;
		var group;
		var sum = 0;
		var wSum = 0;
		var gw = this._fitWidth;
		if (this.isHorizontal()) {
			for (i = 0; i < cnt; i++) {
				column = this._columns.getVisibleItem(i);
				sum += column._groupWidth;
			}
			len = 0;
			wSum = 0;
			for (i = 0; i < cnt - 1; i++) {
				column = this._columns.getVisibleItem(i);
				wSum += column._groupWidth;
				w = _int(wSum * gw / sum) - len;
				column._fitWidth = w;
				column._fitOffset = len;
				len += w;
			}
			column = this._columns.getVisibleItem(cnt - 1);
			w = gw - len;
			column._fitWidth = w;
			column._fitOffset = len;
		} else {
			for (i = 0; i < cnt; i++) {
				column = this._columns.getVisibleItem(i);
				column._fitWidth = this._fitWidth;
				column._fitOffset = 0;
			}
		}
		for (i = 0; i < cnt; i++) {
			group = _cast(this._columns.getVisibleItem(i), ColumnGroup);
			if (group) {
				group.resetFitWidths();
			}
		}
	},
	_createHeader: function () {
		return new ColumnGroupHeader(this);
	},
	clean: function () {
		this._super();
		for (var i = this.count(); i--;) {
			this.getItem(i).clean();
		}
	},
	$_attachChildren: function () {
		var i;
		var column;
		var cnt = this.count();
		for (i = 0; i < cnt; i++) {
			column = this.getItem(i);
			column._setParent(this);
			if (column instanceof ColumnGroup) {
				column.$_attachChildren();
			}
		}
	},
	_columnAdded: function (column) {
	},
	_columnRemoved: function (column) {
	},
	initVisibles: function () {
		this._columns.$_initVisibles();
	},
	resetVisibles: function () {
		this._columns.$_resetVisibles();
	},
	resetStates: function () {
		this._columns.$_resetStates(this.grid());
	},
	resetIndicies: function (grid) {
		this._columns.$_resetIndicies(grid);
	},
	_checkVisible: function (column) {
		var i;
		if (!column || (i = column._displayIndex) < 0 || column !== this.getVisibleItem(i)) {
			throw new Error("Column is not a visible group member");
		}
		return i;
	},
	_clearSavedWidths: function () {
		for (var i = 0, cnt = this.count(); i < cnt; i++) {
			var c = this.getItem(i);
			c._saveWidth = NaN;
			if (c instanceof ColumnGroup) {
				c._clearSavedWidths();
			}
		}
	},
	_saveOrgWidths: function () {
		for (var i = 0, cnt = this.count(); i < cnt; i++) {
			var c = this.getItem(i);
			c._orgWidth = c.saveWidth();
			if (c instanceof ColumnGroup) {
				c._saveOrgWidths();
			}
		}
	},
	_restoreOrgWidths: function () {
		for (var i = 0, cnt = this.count(); i < cnt; i++) {
			var c = this.getItem(i);
			c._saveWidth = c._orgWidth;
			if (c instanceof ColumnGroup) {
				c._restoreOrgWidths();
			}
		}
	}
}, {
	getRight: function (column) {
		var group = column && column._parent;
		if (group) {
			column = group.right(column);
			if (!column) {
				column = ColumnGroup.getRight(group);
			}
			return column;
		}
		return null;
	},
	getLeft: function (column) {
		var group = column && column._parent;
		if (group) {
			column = group.left(column);
			if (!column) {
				column = ColumnGroup.getLeft(group);
			}
			return column;
		}
		return null;
	},
	getNext: function (column) {
		var group = column && column._parent;
		if (group) {
			column = group.next(column);
			if (!column) {
				column = ColumnGroup.getNext(group);
			}
			return column;
		}
		return null;
	},
	getPrev: function (column) {
		var group = column && column._parent;
		if (group) {
			column = group.prev(column);
			if (!column) {
				column = ColumnGroup.getPrev(group);
			}
			return column;
		}
		return null;
	},
	getLower: function (column) {
		var group = column && column._parent;
		if (group) {
			column = group.lower(column);
			if (!column) {
				column = ColumnGroup.getLower(group);
			}
			return column;
		}
		return null;
	},
	getUpper: function (column) {
		var group = column && column._parent;
		if (group) {
			column = group.upper(column);
			if (!column) {
				column = ColumnGroup.getUpper(group);
			}
			return column;
		}
		return null;
	},
	getTop: function (column) {
		var upper;
		var top = null;
		while (column) {
			if (ColumnGroup.isTop(column)) {
				top = column;
				break;
			}

			upper = ColumnGroup.getUpper(column);
			if (!upper) {
				top = column;
				break;
			}

			column = upper;
		}
		if (top) {
			var group = top.group();
			if (group) {
				return top; //group.first();
			} else {
				return top;
			}
		} else {
			return null;
		}
	},
	getBottom: function (column) {
		var lower;
		var bottom = null;
		while (column) {
			if (ColumnGroup.isBottom(column)) {
				bottom = column;
				break;
			}

			lower = ColumnGroup.getLower(column);
			if (!lower) {
				bottom = column;
				break;
			}

			column = lower;
		}

		if (bottom) {
			var group = bottom.group();
			if (group) {
				return bottom;//group.last();
			} else {
				return bottom;
			}
		} else {
			return null;
		}
	},
	isTop: function (column) {
		var group = column && column._parent;
		while (group) {
			if (group.isVertical() && group.visibleCount() > 1 && column._displayIndex > 0) {
				return false;
			}
			column = group;
			group = column._parent;
		}
		return true;
	},
	isBottom: function (column) {
		var group = column && column._parent;
		while (group) {
			if (group.isVertical() && group.visibleCount() > 1 && column._displayIndex < group.visibleCount() - 1) {
				return false;
			}
			column = group;
			group = column._parent;
		}
		return true;
	},
	isLeft: function (column) {
		var group = column && column._parent;
		while (group) {
			if (group.isHorizontal() && group.visibleCount() > 1 && column._displayIndex > 0) {
				return false;
			}
			column = group;
			group = column._parent;
		}
		return true;
	},
	isRight: function (column) {
		var group = column && column._parent;
		while (group) {
			if (group.isVertical() && group.visibleCount() > 1 && column._displayIndex < group.visibleCount() - 1) {
				return false;
			}
			column = group;
			group = column._parent;
		}
		return true;
	},
	getAncestors: function (column, ancestors) {
		if (!ancestors) {
			ancestors = [];
		} else {
			ancestors.length = 0;
		}
		var g = column._parent;
		while (g && !(g instanceof RootColumn)) {
			ancestors.push(g);
			g = g._parent;
		}
		return ancestors;
	},
	getFirstDataRoot: function (group) {
		var c;
		var g;
		var cnt = group.visibleCount();
		if (cnt < 1) {
			c = group;
		} else if (group.isVertical() && cnt > 1) {
			c = group;
		} else {
			c = group.getVisibleItem(0);
			if (c instanceof ColumnGroup) {
				c = ColumnGroup.getFirstDataRoot(c);
			}
		}
		return c;
	},
	getLastDataRoot: function (group) {
		var c;
		var g;
		var cnt = group.visibleCount();
		if (cnt < 1) {
			c = group;
		} else if (group.isVertical() && cnt > 1) {
			c = group;
		} else {
			c = group.getVisibleItem(group.visibleCount() - 1);
            if (c instanceof ColumnGroup) {
				c = ColumnGroup.getLastDataRoot(c);
			}
		}
		return c;
	},
	/**
	 * setWidthByRate와 달리 사용자가 실제 변경한 셀의 너비를 정확히 반영하고,
	 * 그 상태를 상위로 전달한다.
	 */
	changeWidth2: function (column, delta, fitting, minWidth) {
		if (!column || delta == 0) {
			return;
		}
        if (isNaN(minWidth)) {
            minWidth = 0;
        } else {
            minWidth = Math.max(0, minWidth);
        }
		var p = column.parent();
		var sum = 0;
		var dx = delta;
        var i, col,	cnt, cnt2;
		if (fitting) {
			var sumFit = 0;
			sum = 0;
			for (i = 0, cnt = p.visibleCount(); i < cnt; i++) {
				sum += p.getVisibleItem(i)._groupWidth;
				sumFit += p.getVisibleItem(i)._fitWidth;
			}
			dx = delta * (sum / sumFit);
			dx = delta > 0 ? Math.max(1, dx) : Math.min(-1, dx);
		}
		if (column.group()) {
			var c, group;
			column._groupWidth = Math.max(minWidth, column._groupWidth + dx);
			if (column instanceof ColumnGroup) {
				column.resetGroupWidths();
			}
			var groups = ColumnGroup.getAncestors(column);
			for (i = 0, cnt = groups.length; i < cnt; i++) {
				group = groups[i];
				if (group.isVertical()) {
					group._groupWidth = column._groupWidth;
					for (c = 0, cnt2 = group.count(); c < cnt2; c++) {
						col = group.getItem(c);
						if (col !== column) {
							col._groupWidth = column._groupWidth;
							if (col instanceof ColumnGroup) {
								col.resetGroupWidths();
							}
						}
						col._displayOffset = 0;
					}
				} else {
					sum = 0;
					for (c = 0, cnt2 = group.visibleCount(); c < cnt2; c++) {
						col = group.getVisibleItem(c);
						col._displayOffset = _int(sum);
						sum += col._groupWidth;
					}
					group._groupWidth = sum;
				}
				if (group == column.root()) {
					group.setWidth(group._groupWidth);
				} else {
					column = group;
				}
			}
		} else if (column) {
			column.setWidth(Math.max(0, column._width + dx));
		}
	},
    /**
     * setWidthByRate와 달리 사용자가 실제 변경한 셀의 너비를 정확히 반영하고,
     * 그 상태를 상위로 전달한다.
     */
    changeWidth: function (column, delta, fitting, minWidth) {
        if (!column || delta == 0) {
            return;
        }
        if (isNaN(minWidth)) {
            minWidth = 2;
        } else {
            minWidth = Math.max(0, minWidth);
        }
        if (column.displayWidth() + delta < minWidth) {
            return;
        }
        var p = column.parent();
        var sum = 0;
        var dx = delta;
        var i, g, cnt, w;
        if (fitting) {
            var sumFit = 0;
            sum = 0;
            for (i = 0, cnt = p.visibleCount(); i < cnt; i++) {
                sum += p.getVisibleItem(i)._groupWidth;
                sumFit += p.getVisibleItem(i)._fitWidth;
            }
            dx = delta * (sum / sumFit);
            dx = delta > 0 ? Math.max(1, dx) : Math.min(-1, dx);
        }
        if (g = column.group()) {
            var groups = ColumnGroup.getAncestors(column);
            if (!g.isVertical()) {
				w = column._groupWidth > 0 ? column._width * dx / column._groupWidth : 0;
                column.setWidth(Math.max(0, column._width + w));
            }
            for (i = 0; i < groups.length - 1; i++) {
                g = groups[i];
				w = g._groupWidth > 0 ? g._width * dx / g._groupWidth : 0;
                g.setWidth(Math.max(0, g._width + w));
            }
            g = groups[groups.length - 1];
            g.setWidth(Math.max(0, _int(g._width + dx)));
            for (i = groups.length; i--;) {
                g = groups[i];
                g.resetGroupWidths();
            }
            if (column instanceof ColumnGroup) {
                column.resetGroupWidths();
            }
        } else if (column) {
            column.setWidth(Math.max(0, column._width + dx));
        }
    }
});
var ColumnGroup$ = ColumnGroup.prototype;
var $_collectColumns = function (group, list, visibleOnly) {
	var cnt = visibleOnly ? group.visibleCount() : group.count();
	for (var i = 0; i < cnt; i++) {
		var column = visibleOnly ? group.getVisibleItem(i) : group.getItem(i);
		if (column._columns) {
			$_collectColumns(column, list);
		} else {
			list.push(column);
		}
	}
};
var $_collectHorzColumns = function (group, list, start, end) {
	if (group.isHorizontal()) {
		var cnt = group.visibleCount();
		start = start == undefined ? 0 : start;
		end = end == undefined ? cnt-1 : end;
		for (var i = 0; i < cnt; i++) {
			if (i >= start && i <= end) {
				var column = group.getVisibleItem(i);
				if (column._columns) {
					$_collectHorzColumns(column, list);
				} else {
					list.push(column);
				}
			}
		}
	}
};
var $_collectValueColumns = function (group, columns, visibleOnly) {
    var cnt = visibleOnly ? group.visibleCount() : group.count();
    for (var i = 0; i < cnt; i++) {
        var column = visibleOnly ? group.getVisibleItem(i) : group.getItem(i);
        if (column instanceof ValueColumn) {
            columns.push(column);
        } else if (column instanceof ColumnGroup) {
            $_collectValueColumns(column, columns, visibleOnly);
        }
    }
};
var $_collectDataColumns = function (group, columns, visibleOnly) {
    var cnt = visibleOnly ? group.visibleCount() : group.count();
    for (var i = 0; i < cnt; i++) {
        var column = visibleOnly ? group.getVisibleItem(i) : group.getItem(i);
        if (column instanceof DataColumn) {
            columns.push(column);
        } else if (column instanceof ColumnGroup) {
            $_collectDataColumns(column, columns, visibleOnly);
        }
    }
};
var $_getFirstColumn = function (group) {
	var cnt = group.visibleCount();
	for (var i = 0; i < cnt; i++) {
		var column = group.getVisibleItem(i);
		if (column instanceof ValueColumn) {
			return column;
		}
        if (column instanceof ColumnGroup) {
            column = $_getFirstColumn(column);
            if (column instanceof ValueColumn) {
                return column;
            }
        }
	}
	return null;
};
var $_getLastColumn = function (group) {
	for (var i = group.visibleCount() - 1; i >= 0; i--) {
		var column = group.getVisibleItem(i);
		if (column instanceof ValueColumn) {
			return column;
		}
        if (column instanceof ColumnGroup) {
            column = $_getLastColumn(column);
            if (column instanceof ValueColumn) {
                return column;
            }
        }
	}
	return null;
};
var $_getRightColumn = function (group, idx) {
	for (var i = idx, cnt = group.visibleCount(); i < cnt; i++) {
		var column = group.getVisibleItem(i);
		if (column instanceof ValueColumn) {
			return column;
		}
        if (column instanceof ColumnGroup) {
            column = column.first();
            if (column instanceof ValueColumn) {
                return column;
            }
        }
	}
	return null;
};
var $_getLeftColumn = function (group, idx) {
	for (var i = idx; i >= 0; i--) {
		var column = group.getVisibleItem(i);
		if (column instanceof ValueColumn) {
			return column;
		}
        if (column instanceof ColumnGroup) {
            column = column.last();
            if (column instanceof ValueColumn) {
                return column;
            }
        }
	}
	return null;
};
var $_getNextColumn = function (group, idx) {
	for (var i = idx, cnt = group.visibleCount(); i < cnt; i++) {
		var column = group.getVisibleItem(i);
		if (column instanceof ValueColumn) {
			return column;
		}
        if (column instanceof ColumnGroup) {
            column = column.first();
            if (column instanceof ValueColumn) {
                return column;
            }
        }
	}
	return null;
};
var $_getPrevColumn = function (group, idx) {
	for (var i = idx; i >= 0; i--) {
		var column = group.getVisibleItem(i);
		if (column instanceof ValueColumn) {
			return column;
		}
        if (column instanceof ColumnGroup) {
            column = column.last();
            if (column instanceof ValueColumn) {
                return column;
            }
        }
	}
	return null;
};
var $_getLowerColumn = function (group, idx) {
	for (var i = idx, cnt = group.visibleCount(); i < cnt; i++) {
		var column = group.getVisibleItem(i);
		if (column instanceof ValueColumn) {
			return column;
		}
        if (column instanceof ColumnGroup) {
            column = column.first();
            if (column instanceof ValueColumn) {
                return column;
            }
        }
	}
	return null;
};
var $_getUpperColumn = function (group, idx) {
	for (var i = idx; i >= 0; i--) {
		var column = group.getVisibleItem(i);
		if (column instanceof ValueColumn) {
			return column;
		}
        if (column instanceof ColumnGroup) {
            column = column.last();
            if (column instanceof ValueColumn) {
                return column;
            }
        }
	}
	return null;
};
var ColumnCollection = defineClass("ColumnCollection", null, {
	init: function (owner) {
		this._super();
		this._owner = owner; // ColumnGroup
		this._items = [];
		this._visibles = [];
		this._orderedColumns = [];
	},
	destroy: function() {
		this._destroying = true;
		this._items = null;
		this._visibles = null;
		this._orderedColumns = null;
		this._super();
	},
	owner: function () {
		return this._owner;
	},
	grid: function () {
		return this._owner && this._owner.grid();
	},
	count: function () {
		return this._items.length;
	},
	items: function () {
		return this._items.slice();
	},
	setItems: function (value) {
		var items = this._items;
		var orderedColumns = this._orderedColumns;
		items.length = orderedColumns.length = 0;
		if (value) {
			for (var i = 0, cnt = value.length; i < cnt; i++) {
				items.push(value[i]);
				value[i]._setParent(this._owner);
			}
			orderedColumns = items.slice();
		}
	},
    visibleItems: function () {
        return this._visibles.slice();
    },
    getOrderedColumns: function() {
    	return this._orderedColumns.slice();
    },
	visibleCount: function () {
		return this._visibles.length;
	},
	getItem: function (index) {
		return this._items[index];
	},
	getVisibleItem: function (index) {
		return this._visibles[index];
	},
	clear: function () {
		this._items.length = this._visibles.length = this._orderedColumns.length = 0;
	},
	indexOf: function (column) {
		return this._items.indexOf(column);
	},
	add: function (column, index) {
		if (column == null) {
			if ($_debug) debugger;
			throw new Error("column is null");
		}
		if (this.indexOf(column) >= 0) {
			if ($_debug) debugger;
			throw new Error("column is already contained");
		}
		index = index == null ? this._items.length : index;
		this._items.splice(index, 0, column);
		column._setParent(this._owner);
		this._orderedColumns.splice(index, 0, column);
		return this._items.length;
	},
	removeAt: function (index) {
		if (index < 0 || index >= this._items.length) {
			throw new Error("index is invalid: " + index);
		}
		var column = this._items[index];
		this._items.splice(index, 1);
		var visibleIndex = this._orderedColumns.indexOf(column);
		if (visibleIndex >= 0) {
			this._orderedColumns.splice(visibleIndex,1)
		} else {}
		column._setParent(null);
	},
	move: function (column, newIndex) {
		if (column == null) {
			throw new Error("column is null");
		}
		if (newIndex < 0 || newIndex >= this._items.length) {
			throw new Error("newIndex is invalid: " + newIndex);
		}
		if (column._parent !== this._owner || column._index == newIndex) {
			return false;
		}
		this._items.splice(column.index, 1);
		this._items.splice(newIndex, 0, column);
		return true;
	},
	moveVisible: function (column, newIndex) {
		if (column == null) {
			throw new Error("column is null");
		}
		if (newIndex < 0 || newIndex >= this._items.length) {
			return false;
		}
		if (column._parent === this._owner && column._visible) {
			if (!this.$_isVisible(column)) {
				this.$_resetVisibles(false);
				return true;
			}
			var visibles = this._visibles;
			var index = column._displayIndex;
			if (index != newIndex) {
				visibles.splice(index, 1);
				visibles.splice(newIndex, 0, column);

				var orderedColumns = this._orderedColumns;
				var idx = orderedColumns.indexOf(column);
				if (idx >= 0) {
					orderedColumns.splice(idx, 1);
				}
				orderedColumns.splice(newIndex, 0, column);
				this.$_resetVisibles(false);
				if (this._owner instanceof ColumnGroup) {
					var grid = this._owner.grid && this._owner.grid();
					if (grid) {
						grid._columnWidthsDirty = true;
					}
				}
				return true;
			}
		}
		return false;
	},
	columnByName: function (name) {
		if (name) {
			for (var i = 0, cnt = this._items.length; i < cnt; i++) {
				var column = this._items[i];
				if (column.name() == name) {
					return column;
				}
				if (column instanceof ColumnGroup) {
					column = column._columns.columnByName(name);
					if (column) {
						return column;
					}
				}
			}
		}
		return null;
	},
	valueColumnByName: function (name) {
		if (name) {
			for (var i = 0, cnt = this._items.length; i < cnt; i++) {
				var column = this._items[i];
				if (column instanceof ColumnGroup) {
					column = column._columns.valueColumnByName(name);
					if (column) {
						return column;
					}
				} else if (column.name() == name) {
					return column;
				}
			}
		}
		return null;
	},
    setChildrenProperty: function (prop, value, recursive, visibleOnly) {
        var cols = visibleOnly ? this._visibles : this._items;
        for (var i = cols.length; i--;) {
            var col = cols[i];
            col.setProperty(prop, value);
            col instanceof ColumnGroup && col.setProperty(prop, value, true, true);
        }
    },
	$_isVisible: function (column) {
		return this._visibles.indexOf(column) >= 0;
	},
	$_initVisibles: function () {
		var i,
			cnt,
			column,
			items = this._items;
		for (i = 0, cnt = items.length; i < cnt; i++) {
			column = items[i];
			column._displayIndex = i;
			if (column instanceof ColumnGroup) {
				column.initVisibles();
			}
		}
	},
	$_resetVisibles: function (recursive) {
		if (arguments.length < 1) {
			recursive = true;
		}
		var findVisibleIdx = function (cols, column) {
			var ret = -1;
			for (var i = 0, cnt=cols.length; i<cnt ; i++)
			{
				cols[i]._visible && ret++;
				if (cols[i] === column) {
					var grid = this.grid();
					if (column._parent instanceof RootColumn && !( column instanceof DataColumn && grid.isGroupedColumn(column))) {
						var groupCnt = grid.isMergedRowGrouped && grid.isMergedRowGrouped() ? grid.rowGroupFields().length : 0;
						return Math.max(ret, groupCnt);
					} else {
						return ret;
					}
				}
			}
			return -1;
		}.bind(this);
		var i,
			cnt,
			column,
			items = this._items,
			visibles = this._visibles,
			orderedColumns = this._orderedColumns;
		for (i = visibles.length - 1; i >= 0; i--) {
			column = visibles[i];
			if (!column._visible || items.indexOf(column) < 0) {
				visibles.splice(i, 1);
			}
		}
		for (i = 0, cnt = items.length; i < cnt; i++) {
			column = items[i];
			if (column._visible) {
				if (!this.$_isVisible(column)) {
					var dIdx = findVisibleIdx(this._orderedColumns, column);
					dIdx = dIdx >= 0 ? dIdx : column._displayIndex;
					if (dIdx >= 0) {
						visibles.splice(Math.min(visibles.length, dIdx), 0, column);
					} else {
						visibles.push(column);
					}
				}
				if (column instanceof ColumnGroup && recursive) {
					column.resetVisibles();
				}
			} else {
			}
		}
		for (i = visibles.length; i--;) {
			visibles[i]._displayIndex = i;
		}
	},
	$_clearFitWidths: function () {
		for (var i = this._items.length; i--;) {
			var col = this._items[i];
			col._fitWidth = NaN;
            col._fitOffset = NaN;
			if (col instanceof ColumnGroup) {
				col.clearFitWidths();
			}
		}
	},
	$_resetStates: function (grid) {
		var i,
			c,
			column,
			sortFlds,
			sortDirs,
			items = this._items,
			cols = items.length,
			itemSource = grid.itemSource();
		for (i = 0; i < cols; i++) {
			column = items[i];
			if (column instanceof DataColumn) {
				column._setSortOrder(-1);
			}
		}
		if (itemSource) {
			sortFlds = grid.getSortFields();
			if (sortFlds) {
				sortDirs = grid.getSortDirections();
				for (i = 0; i < sortFlds.length; i++) {
					for (c = 0; c < cols; c++) {
						column = items[c];
						if (column instanceof DataColumn && column.dataIndex() == sortFlds[i]) {
							column._setSortOrder(i);
							column.setSortDirection(sortDirs[i]);
						}
					}
				}
			}
		}
		for (i = 0; i < cols; i++) {
			column = items[i];
			if (column instanceof ColumnGroup) {
				column.resetStates();
			}
		}
	},
	$_resetIndicies: function (grid) {
		var i,
			column,
			items = grid.itemSource(),
			ds = items && items.dataSource(),
			cnt = this._items.length;
		for (i = 0; i < cnt; i++) {
			column = this._items[i];
			column._index = i;		// 컬렉션 상의 위치
			if (column instanceof DataColumn) {
				column._resetDataIndex(ds);
				column._resetImages(grid);
			} else if (column instanceof SeriesColumn) {
				column.resetIndicies(ds);
			} else if (column instanceof ColumnGroup) {
				column.resetIndicies(grid);
			}
		}
	}
});

var ValueColumn = defineClass("ValueColumn", Column, {
	init: function (config) {
		this._super(config);
	},
	_initColumn: function () {
		this._super();
		this._footer = new ColumnFooter(this);
		this._rendererChanged = false;
		this._rendererObj = null;
	},
	footer: null,
	renderer: null,
	mergeRule: null,
	cursor: null,
    ignoreDefaultDynamicStyles: false,
	blankWhenCopy: false,
	blankWhenExport: false,
	textInputCase: TextInputCase.NORMAL,
	setFooter: function (value) {
		this._footer.assign(value);
	},
	rendererObj: function () {
		return this._rendererObj || this._defaultRenderer();
	},
	setRenderer: function (value) {
		//if (value != this._renderer) { renderer가 proxy가 아니므로 외부에서 변경시 즉시 변경됨. 따라서 비교가 불가능
		this._renderer = value;
		this._rendererChanged = true;
		this._changed();
		//}
	},
	setMergeRule: function (value) {
		if (value != this._mergeRule) {
			if (!(value instanceof GridMergeRule)) {
				value = ColumnMergeRule.createRule(value);
			}
			this._mergeRule = value;
			var grid = this.grid();
			if (grid) {
				grid._columnMergeRuleChanged(this);
			}
		}
	},
	isWritable: function () {
		return false;
	},
	canMerge: function () {
		return this._mergeRule !== null;
	},
	assign: function (source) {
		this._super(source);
	},
	prepare: function (grid, fixed, rightFixed) {
		Column$.prepare.call(this, grid, fixed, rightFixed);
		var delegate = grid.delegate();
		if (this._rendererChanged) {
			this._rendererObj = delegate.createRenderer(this._renderer);
			this._rendererChanged = false;
		}
	},
	clean: function () {
		this._super();
		this._footer.clean();
	},
	_footerChanged: function () {
		this._changed();
	},
	_defaultRenderer: function () {
		return TextCellRenderer.Default;
	}
}); 
var ValueColumn$ = ValueColumn.prototype;
var DataColumn = defineClass("DataColumn", ValueColumn, {
	init: function (config) {
		this._super(config);
	},
	_initColumn: function () {
		this._super();
		this._dataIndex = -1;
		this._baseIndex = -1;
		this._valueType = ValueType.TEXT;
		this._sortOrder = -1;
		this._menu = null;
		this._images = null;
		this._lookupSource = null;
		this._lookupKeyFields = null;
		this._lookupKeyFieldIds = null;
		this._lookupMap = null;
		this._labelFieldIndex = -1;
		this._mergeGrouped = false;
		this._editorOptions = null;
		this._filters = new ColumnFilterCollection(this);
		this._filters.addListener(this);
		this._filterActions = [];
		this._dynamicStyles = new DynamicStyleCollection(this);
		this._validations = new EditValidationCollection();
		this._imageButtonsRenderer = null;
		this._displayRegExpObj = null;
	},
	destroy: function() {
		this._destroying = true;
		this._filters.removeListener(this);
		this._filters && !this._filters._destroying && this._filters.destroy && this._filters.destroy();
		this._filterActions = null;
		this._filters = null;
		this._dynamicStyles = null;
		this._validations = null;
		this._displayRegExpObj = null;
		this._super();
	},
	capitalIndexers: function () {
		return DataColumn.CAPITAL_INDEXERS;
	},
	fieldIndex: -1,
	fieldName: null,
	editable: true,
	readOnly: false,
	sortable: true,
	filterable: true,
	sortDirection: SortDirection.ASCENDING,
	groupable: true,
	button: CellButton.NONE,
	alwaysShowButton: false,
	alwaysShowEditButton: false,
    buttonVisibility: ButtonVisibility.DEFAULT,
    editButtonVisibility: ButtonVisibility.DEFAULT,
	popupMenu: null,
	imageButtons: null,
	defaultValue: UNDEFINED,
	required: false,
	requiredMessage: null,
	requiredLevel: ValidationLevel.ERROR,
	nanText: null,
	dynamicStyles: null,
	validations: null,
	autoFilter: false,
	lookupDisplay: false,
	lookupCase: LookupCase.SENSITIVE,
	lookupValues: null,
	lookupLabels: null,
	labelField: null,
	lookupSourceId: null,
	lookupKeyFields: null,
	valueSeparator: null,
	editor: null,
	imageList: null,
	equalBlank: false,
	groupLevel: -1,
	filters: null,
	filterActions: null,
	error: null,
	errorLevel: ValidationLevel.IGNORE,
	excelFormat: undefined,
	displayRegExp: null,
	displayReplace: null,
	setEditable: function (value) {
		if (value != this._editable) {
			this._editable = value;
			var grid = this.grid();
			if (grid) {
				grid._dataColumnChanged(this);
			}
		}
	},
	setReadOnly: function (value) {
		if (value != this._readOnly) {
			this._readOnly = value;
			var grid = this.grid();
			if (grid) {
				grid._dataColumnChanged(this);
			}
		}
	},
	setDisplayRegExp: function (value) {
		if (value) {
			this._displayRegExp = value;
			if (typeof value == "string") {
				this._displayRegExpObj = new RegExp(value);
			} else {
				this._displayRegExpObj = value;
			}
		} else {
			this._displayRegExp = null;
			this._displayRegExpObj = null;
		}
	},
	getDisplayRegExp: function () {
		return this._displayRegExpObj;
	},
    alwaysShowButton_: function () {
        return this._buttonVisibility == ButtonVisibility.ALWAYS;
    },
    setAlwaysShowButton: function (value) {
        if (value) {
            this.setButtonVisibility(ButtonVisibility.ALWAYS);
        } else if (this._buttonVisibility == ButtonVisibility.ALWAYS) {
            this.setButtonVisibility(ButtonVisibility.DEFAULT);
        }
    },
    alwaysShowEditButton_: function () {
        return this._editButtonVisibility == ButtonVisibility.ALWAYS;
    },
    setAlwaysShowEditButton: function (value) {
        if (value) {
            this.setEditButtonVisibility(ButtonVisibility.ALWAYS);
        } else if (this._editButtonVisibility == ButtonVisibility.ALWAYS) {
            this.setEditButtonVisibility(ButtonVisibility.DEFAULT);
        }
    },
    getImageButtonRenderer: function () {
    	return this._imageButtonsRenderer;
    },
    setImageButtons: function (value) {
    	if (value && typeof value == "object" && value.hasOwnProperty("images")) {
    		this._imageButtons = value;
    		if (!this._imageButtonsRenderer) {
    			this._imageButtonsRenderer = new ImageButtonsRenderer();
    		}
    		this._imageButtonsRenderer.setImageUrls(value.images);
    		if (value.hasOwnProperty("width")) {
    			this._imageButtonsRenderer.setImageWidth(value.width);
    		}
    		if (value.hasOwnProperty("height")) {
    			this._imageButtonsRenderer.setImageHeight(value.height);
    		}
    	} else {
    		this._imageButtonsRenderer = null;
    	}
    },
	dataIndex: function () {
		return this._dataIndex;
	},
	baseIndex: function () {
		return this._baseIndex;
	},
	valueType: function () {
		return this._valueType;
	},
	sortOrder: function () {
		return this._sortOrder;
	},
	setValidations: function (value) {
		this._validations.assign(value);
	},
    getFilters: function () {
        return this._filters.items();
    },
	hasFilters: function () {
		return this._filters.count() > 0 || this._filterActions.length > 0;
	},
	isFiltered: function () {
		return this._filters.activeCount() > 0;
	},
	filters_: function () {
		return this._filters.items();
	},
	setFilters: function (value) {
        var grid = this.grid();
        if (!grid || grid.canFiltering()) {
            this._filters.assign(value);
        }
	},
	filterActions_: function () {
		return this._filterActions.concat();
	},
	setFilterActions: function (value) {
		if (value != this._filterActions) {
			if (value !== this._filterActions) {
				this._filterActions = [];
				if (value) {
					value = _isArray(value) ? value : [value];
					for (var i = 0, cnt = value.length; i < cnt; i++) {
						if (value[i]) {
							var fa = new ColumnFilterAction(this);
							fa.assign(value[i]);
							this._filterActions.push(fa);
						}
					};
				}
			}
			var grid = this.grid();
			grid && grid.$_columnFilterActionsChanged(this);
		}
	},
	hasFilterAction: function () {
		return this._filterActions.length > 0;
	},
	setLookupValues: function (value) {
		if (value != this._lookupValues) {
			this._lookupValues = value && value.slice();
			this._lookupMap = null;
			this._changed();
		}
	},
	setLookupLabels: function (value) {
		if (value != this._lookupLabels) {
			this._lookupLabels = value && value.slice();
			this._lookupMap = null;
			this._changed();
		}
	},
	setValueSeparator: function (value) {
		if (value != this._valueSeparator) {
			this._valueSeparator = value;
			this._changed();
		}
	},
	labelFieldIndex: function () {
		return this._labelFieldIndex;
	},
	lookupSource: function () {
		return this._lookupSource;
	},
	setLookupKeyFields: function (value) {
		if (value != this._lookupKeyFields) {
			if (value && !isArray(value)) {
				value = [value];
			}
			this._lookupKeyFields = value;
			this._changed();
		}
	},
	lookupKeyFieldIds: function () {
		return this._lookupKeyFieldIds;
	},
	setDynamicStyles: function (value) {
		this._dynamicStyles.setItems(value);
		this._changed();
	},
	setEditor: function (value) {
		if (typeof value == "string") {
			this._editor = value;
		} else if (value) {
			if (value.hasOwnProperty("type")) {
				this._editor = value.type;
			}
			this._editorOptions = this._editorOptions || {};
			for (var prop in value) {
				var v = value[prop];
				if (_isArray(v)) {
					this._editorOptions[prop] = v.slice();
				} else {
					this._editorOptions[prop] = v;
				}
			}
		}
	},
	editorOptions: function () {
		return this._editorOptions;
	},
	hasDomain: function () {
		return this._lookupValues && this._lookupLabels;
	},
	setImageList: function (value) {
		if (value != this._imageList) {
			this._imageList = value;
			var grid = this.grid();
			if (grid) {
				this._images = grid.getImageList(this._imageList);
			}
		}
	},
	images: function () {
		return this._images;
	},
	_resetImages: function (grid) {
		if (this._imageList) {
			this._images = grid.getImageList(this._imageList);
		} else {
			this._images = null;
		}
	},
	getImages: function () {
		return this._images;
	},
	isMergeGrouped: function () {
		return this._mergeGrouped;
	},
	_setMergeGrouped: function (value) {
		this._mergeGrouped = value;
	},
    getField: function () {
        var f = this._dataIndex;
        if (f >= 0) {
            var grid = this.grid();
            var ds = grid.dataSource();
            if (ds) {
                return ds.getField(f);
            }
        }
        return null;
    },
	getLookupLabel: function (value) {
		if (!this._lookupMap) {
			var lookupValues = this._lookupValues;
			var lookupLabels = this._lookupLabels;
			if (lookupValues && lookupValues.length > 0) {
				this._lookupMap = {};
				for (var i = 0; i < lookupValues.length; i++) {
					if (lookupLabels && lookupLabels.length > i) {
						this._lookupMap[lookupValues[i]] = lookupLabels[i];
					} else {
						this._lookupMap[lookupValues[i]] = lookupValues[i];
					}
				}
			}
		}
		var label;
		if (value && this._valueSeparator) {
			var values = value.split(this._valueSeparator);
			var labels = [];
			for (var i = 0, cnt = values.length; i < cnt; i++) {
				labels.push(this._lookupMap && this._lookupMap[values[i]] ? this._lookupMap[values[i]] : values[i]);
			}
			if (labels.length <= 0) {
				return "";
			}
			label = labels.join(this._valueSeparator);
		} else {
			label = this._lookupMap ? this._lookupMap[value] : undefined;
		}
		
		return label ? label : value;
	},
	getLookupIndex: function (value) {
		if (this._lookupValues && this._lookupValues.length > 0) {
			for (var i = 0, cnt = this._lookupValues.length; i < cnt; i++) {
				if (this._lookupValues[i] == value) {
					return i;
				}
			}
		}
		return -1;
	},
	getLookupIndices: function (value) {
		var indices = [];
		if (value && this._lookupValues && this._lookupValues.length > 0) {
			var values = _isArray(value) ? value : value.split(this._valueSeparator);
			for (var i = 0, cnt = values.length; i < cnt ; i++) {
				if (this._lookupValues.indexOf(values[i]) >= 0) {
					indices.push(this._lookupValues.indexOf(values[i]));
				}
			}
		}
		return indices;
	},
	getLookupValue: function (index) {
		if (this._lookupValues && this._lookupValues.length > 0) {
			return this._lookupValues[index];
		}
		return undefined;
	},
	getLookupValues: function (indices) {
		var ret = [];
		if (this._lookupValues && this._lookupValues.length > 0) {
			for (var i = 0, cnt = indices.length; i < cnt ; i++) {
				if (indices[i] >= 0 && indices[i] < this._lookupValues.length) {
					ret.push(this._lookupValues[indices[i]]);
				}
			}
		}
		return ret;
	},
	getSourceValue: function (label) {
		var lookupValues = this._lookupValues;
		var lookupLabels = this._lookupLabels;
		if (lookupLabels && lookupValues) {
			var i = lookupLabels.indexOf(label);
			if (i >= 0 && lookupValues.length > i) {
				return lookupValues[i];
			}
			i = lookupValues.indexOf(label);
			if (i >= 0) {
				return lookupValues[i];
			}
		}
		return undefined;
	},
	getSourceValues: function(labels) {
		var lookupValues = this._lookupValues;
		var lookupLabels = this._lookupLabels;
		if (lookupLabels && lookupValues) {
			var idx;
			var values = [];
			var vs = this._valueSeparator;
			var labels = _isArray(labels) ? labels : vs && labels ? labels.split(vs) : [labels];
			for (var i = 0, cnt = labels.length; i < cnt ; i++) {
				idx = lookupLabels.indexOf(labels[i]);
				if (idx >= 0 && lookupValues.length > idx) {
					values.push(lookupValues[idx]);
				} else {
					values.push(labels[i])
				}
			}
			if (values.length > 0 && vs) {
				return values.join(vs);
			} else if (values.length > 0) {
				return values.join();
			}
		}
		return undefined;
	},
	clearFilters: function () {
		this.setFilters(null);
	},
	addFilters: function (filters, overwrite) {
		if (filters) {
            var grid = this.grid();
            if (!grid || grid.canFiltering()) {
                this._filters.addItems(_makeArray(filters), overwrite);
            }
		}
	},
	removeFilters: function (filterNames) {
		if (filterNames) {
            var grid = this.grid();
            if (!grid || grid.canFiltering()) {
                this._filters.removeItems(_makeArray(filterNames));
            }
		}
	},
	activateFilters: function (filterNames, active) {
		if (filterNames) {
            var grid = this.grid();
            if (!grid || grid.canFiltering()) {
                this._filters.activateItems(_makeArray(filterNames), active);
            }
		}
	},
	activateAllFilters: function (active) {
        var grid = this.grid();
        if (!grid || grid.canFiltering()) {
            this._filters.activateAll(active);
        }
	},
	toggleFilters: function (filterNames) {
		if (filterNames) {
            var grid = this.grid();
            if (!grid || grid.canFiltering()) {
                this._filters.toggleItems(_makeArray(filterNames));
            }
		}
	},
	toggleAllFilters: function () {
        var grid = this.grid();
        if (!grid || grid.canFiltering()) {
            this._filters.toggleAll();
        }
	},
	getFilter: function (filterName) {
		return this._filters.getItem(filterName);
	},
	getActiveFilters: function (active) {
		return this._filters.getActiveItems(active);
	},
	assign: function (source) {
		this._super(source);
	},
	canMerge: function () {
		return this._mergeGrouped || this._super();
	},
	prepare: function (grid, fixed, rightFixed) {
		ValueColumn$.prepare.call(this, grid, fixed, rightFixed);
		this._menu = grid.popupMenuManager().getMenu(this.popupMenu());
		var ds = grid.dataSource();
		if (this._saveFieldName != this._fieldName || this._saveLabelField != this._labelField) {
			this._resetDataIndex(ds);
		}
		var i, len;
		if (this._lookupKeyFields && (len = this._lookupKeyFields.length) > 0) {
			this._lookupKeyFieldIds = new Array(len);
			for (i = 0; i < len; i++) {
				this._lookupKeyFieldIds[i] = ds.getFieldIndex(this._lookupKeyFields[i]); 
			}
			if (this._lookupSourceId) {
				this._lookupSource = grid.lookupProvider().getSource(this._lookupSourceId);
			} else {
				this._lookupSource = null;
			}
		} else {
			this._lookupKeyFieldIds = null;
			this._lookupSource = null;
		}
		if (this._imageButtonsRenderer) {
    		this._imageButtonsRenderer.prepare(grid);
		}
	},
	getAdapter: function (adapter) {
		if (adapter === ColumnFilterCollection) {
			return this._filters;
		}
		return this._super(adapter);
	},
	isWritable: function () {
		var w = this._editable && !this._readOnly;
        if (w && this.$_grid) {
            w = !this.$_fixed || !this.$_rightFixed || this.$_grid.$_fixedColEditable;
        }
        return w;
	},
	menu: function () {
		return this._menu;
	},
	_setSortOrder: function (value) {
		this._sortOrder = value;
	},
	_resetDataIndex: function (dataSource) {
		this._dataIndex = -1;
		this._baseIndex = -1;
		this._labelFieldIndex = -1;
		if (dataSource) {
			if (this._fieldName) { 
				this._dataIndex = dataSource.getFieldIndex(this._fieldName);
			} else {
				this._dataIndex = this._fieldIndex;
			}
			if (this._dataIndex >= 0) {
				this._baseIndex = dataSource.getBaseField(this._dataIndex);
				this._valueType = dataSource.getValueType(this._dataIndex);
			}
			this._labelFieldIndex = dataSource.getFieldIndex(this._labelField);
			this._saveFieldName = this._fieldName;
			this._saveLabelField = this._labelField;
		}
	},
	$_filterActionClick: function (action, x, y) {
		this.grid() && this.grid().$_columnFilterActionClicked(action, x, y);
	},
	onColumnFilterChanged: function (filter) {
		if (this.grid()) {
			this.grid().$_columnFiltersChanged(filter);
		}
	}
}, {
	CAPITAL_INDEXERS: ["value", "values"]
}); 