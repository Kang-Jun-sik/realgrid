var SelectionItem = defineClass("SelectionItem", null, {
	init: function(manager) {
		this._super();
		this._manager = manager;
	},
	style: function () {
		throwAbstractError();
	},
	isSingleCell: function () {
		return false;
	},
	getBounds: function () {
		return null;
	},
	contains: function (index) {
		return false;
	},
	inflate: function (dir, newIndex) {
		switch (dir) {
			case "left": return this._inflateLeft(newIndex);
			case "right": return this._inflateRight(newIndex);
			case "top": return this._inflateTop(newIndex);
			case "bottom": return this._inflateBottom(newIndex);
		}
		return false;
	},
	resizeTo: function (endIndex) {
	},
	intersectsWith: function (item) {
		throwAbstractError();
	},
	mergeWith: function (item) {
		throwAbstractError();
	},
	getData: function (maxRows) {
		throwAbstractError();
	},
	_resized: function () {
		this._manager && this._manager._itemResized(this);
	},
	_inflateLeft: function (newLeft) {
	},
	_inflateRight: function (newRight) {
	},
	_inflateTop: function (newTop) {
	},
	_inflateBottom: function (newBottom) {
	}
});
var SelectionManager = defineClass("SelectionManager", EventAware, {
	init: function(grid) {
		this._super();
		this._grid = grid;
		this._items = [];
		this._locked = false;
	},
	destroy: function() {
		this._destroying = true;
		this._grid = null;
		this._items = null;
		this._super();
	},
	exclusiveMode: true,
	itemStyle: SelectionStyle.BLOCK,
	setExclusiveMode: function (value) {
		if (value != this._exclusive) {
			this._exclusive = value;
			this.clear();
		}
	},
	setItemStyle: function (value) {
		if (value != this._itemStyle) {
			this._itemStyle = value;
			this.clear();
		}
	},
	count: function () {
		return this._items.length;
	},
	isSingleCell: function () {
		return this._items.length == 1 && this._items[0].isSingleCell();
	},
	lock: function () {
		this._locked = true;
	},
	unlock: function () {
		this._locked = false;
	},
	getItem: function (index) {
		return this._items[index];
	},
	add: function (start, end, style) {
		if (this._locked) {
			return null;
		}
		if (style == SelectionStyle.NONE) {
			this.clear();
			return null;
		}
		if (this._exclusiveMode && style != this._style) {
			this.clear();
		}
		var item = null;
		switch (style) {
		case SelectionStyle.COLUMNS:
			item = new ColumnSelection(this, start.column(), end.column());
			break;
		case SelectionStyle.SINGLE_COLUMN:
			item = new ColumnSelection(this, start.column(), start.column());
			break;
		case SelectionStyle.ROWS:
			item = new RowSelection(this._grid, start.I(), end.I());
			break;
		case SelectionStyle.SINGLE_ROW:
			item = new RowSelection(this._grid, start.I(), start.I());
			break;
		case SelectionStyle.BLOCK:
			item = new BlockSelection(this, start, end);
			break;
		case SelectionStyle.SINGLE:
			item = new BlockSelection(this, start, start);
			break;
		}
		return this._addItem(item);
	},
	remove: function (item) {
		if (this._locked) {
			return;
		}
		var index = this._items.indexOf(item);
		if (index >= 0) {
			this._items.splice(index, 1);
			this.fireEvent(SelectionManager.REMOVED, item);
		}
	},
	clear: function () {
		if (this._locked) {
			return;
		}
		if (this._items.length > 0) {
			this._items.length = 0;
			this.fireEvent(SelectionManager.CLEARED);
		}
	},
	containsItem: function (itemIndex) {
		return false;
	},
	containsColumn: function (column) {
		return false;
	},
	contains: function(index) {
		for (var i = 0, cnt = this._items.length; i < cnt; i++) {
			if (this._items[i].contains(index))
				return true;
		}
		return false;
	},
	normalize: function () {
	},
	_addItem: function (item) {
		if (!item)
			throw new Error("item is null");
		if (this._items.indexOf(item) < 0) {
			this._items.push(item);
			this.fireEvent(SelectionManager.ADDED, item);
		}
		return item;
	},
	_itemResized: function (item) {
		this.fireEvent(SelectionManager.RESIZED, item);
	}
});
SelectionManager.CHANGED = "onSelectionChanged";
SelectionManager.ADDED = "onSelectionAdded";
SelectionManager.REMOVED = "onSelectionRemoved";
SelectionManager.CLEARED = "onSelectionCleared";
SelectionManager.RESIZED = "onSelectionResized";
SelectionManager.ENDED = "onSelectionEnded";
var BlockSelection = defineClass("BlockSelection", SelectionItem, {
	init: function(manager, startIndex, endIndex) {
		this._super(manager);
		this._grid = startIndex.grid();
		this._startIndex = startIndex.clone();
		this._endIndex = endIndex.clone();
	},
	startIndex: function () {
		return this._startIndex;
	},
	endIndex: function () {
		return this._endIndex;
	},
	style: function () {
		return SelectionStyle.BLOCK;
	},
	isSingleCell: function () {
		return CellIndex.areEquals(this._startIndex, this._endIndex);
	},
	getBounds: function () {
		this._startIndex.normalize(this._grid);
		this._endIndex.normalize(this._grid);
		if (CellIndex.areEquals(this._startIndex, this._endIndex)) {
			return GridRange.create(this._startIndex);
		} else {
			var c1 = this._startIndex.C() ? this._startIndex.C().dataRoot() : null;
			var c2 = this._endIndex.C() ? this._endIndex.C().dataRoot() : null;
			return GridRange.createRange(this._startIndex.I(), c1, this._endIndex.I(), c2);
		}
	},
	contains: function (index) {
		return this.getBounds().containsIndex(index);
	},
	_inflateLeft: function (newLeft) {
		if (this._startIndex.C().distance() <= this._endIndex.C().distance()) {
			if (newLeft.C() !== this._startIndex.C()) {
				this._startIndex.column(newLeft.C());
				this._resized();
			}
		} else {
			if (newLeft.C() !== this._endIndex.C()) {
				this._endIndex.column(newLeft.C());
				this._resized();
			}
		}
	},
	_inflateRight: function (newRight) {
		if (this._startIndex.C().distance() > this._endIndex.C().distance()) {
			if (newRight.C() !== this._startIndex.C()) {
				this._startIndex.column(newRight.C());
				this._resized();
			}
		} else {
			if (newRight.C() !== this._endIndex.C()) {
				this._endIndex.column(newRight.C());
				this._resized();
			}
		}
	},
	_inflateTop: function (newTop) {
		var i = Math.max(0, Math.min(this._grid.itemCount() - 1, newTop.I()));
		if (this._startIndex.I() <= this._endIndex.I()) {
			if (i !== this._startIndex.I()) {
				this._startIndex.itemIndex(i);
				this._resized();
			}
		} else {
			if (i !== this._endIndex.I()) {
				this._endIndex.itemIndex(i);
				this._resized();
			}
		}
	},
	_inflateBottom: function (newBottom) {
		var i = Math.max(0, Math.min(this._grid.itemCount() - 1, newBottom.I()));
		if (this._startIndex.I() > this._endIndex.I()) {
			if (i !== this._startIndex.I()) {
				this._startIndex.itemIndex(i);
				this._resized();
			}
		} else {
			if (i !== this._endIndex.I()) {
				this._endIndex.itemIndex(i);
				this._resized();
			}
		}
	},
	resizeTo: function (newEnd) {
		if (this._grid.isValid(newEnd) && !CellIndex.areEquals(newEnd, this._endIndex)) {
			this._endIndex.assign(newEnd);
			this._resized();
		}
	},
	intersectsWith: function (item) {
		return this.getBounds().intersectsWith(item.getBounds());
	},
	mergeWith: function (item) {
	},
	getData: function (maxRows) {
		maxRows = arguments.length > 0 ? maxRows : -1;
		if (maxRows == 0) {
			return null;
		}
		var cnt;
        var grid = this._grid;
		var columns = grid.collectDataColumns(this._startIndex.C(), this._endIndex.C());
		if (!columns || (cnt = columns.length) < 1) {
			return null;
		}
		var r, row, item, c, col,
			r1 = Math.min(this._startIndex.I(), this._endIndex.I()),
			r2 = Math.max(this._startIndex.I(), this._endIndex.I()),
			rows = [];
		for (r = r1; r <= r2; r++) {
			item = grid instanceof GridView ? _cast(grid.getItem(r), GridRow) : ( grid instanceof TreeView ? _cast(grid.getItem(r), TreeItem) : null);
			if (item) {
				row = {};
				for (c = 0; c < cnt; c++) {
					col = columns[c];
					row[col.fieldName()] = item.getData(col.dataIndex());
				}
				rows.push(row);
				if (maxRows > 0 && rows.length == maxRows) {
					break;
				}
			}
		}
		return rows;
	}
});
var RowSelection = defineClass("RowSelection", SelectionItem, {
	init : function(grid, startRow, endRow) {
		this._super(grid.selections());
		this._grid = grid;
		this._startRow = Math.min(startRow, endRow);
		this._endRow = Math.max(startRow, endRow);
	},
	startRow: function() {
		return this._startRow;
	},
	endRow: function() {
		return this._endRow;
	},
	topRow: function () {
		return Math.min(this._startRow, this._endRow);
	},
	bottomRow: function () {
		return Math.max(this._startRow, this._endRow);
	},
	style : function() {
		return SelectionStyle.ROWS;
	},
	getBounds: function () {
		var itemCount = this._grid.itemCount();
		this._startRow = Math.max(0, Math.min(itemCount - 1, this._startRow));
		this._endRow = Math.max(0, Math.min(itemCount - 1, this._endRow));
		if (this._startRow <= this._endRow) {
			return GridRange.createRange(this._startRow, this._grid.getVisibleColumn(0), this._endRow, this._grid.getVisibleColumn(this._grid.visibleColumnCount() - 1));
		} else {
			return GridRange.createRange(this._endRow, this._grid.getVisibleColumn(0), this._startRow, this._grid.getVisibleColumn(this._grid.visibleColumnCount() - 1));
		}
	},
	contains: function (index) {
		return (index.I() >= this._startRow) && (index.I() <= this._endRow);
	},
	_inflateTop: function (newTop) {
		var i = newTop.I();
		if (i != this.topRow()) {
			if (this._startRow <= this._endRow) {
				this._startRow = Math.max(0, Math.min(this._grid.itemCount() - 1, i));
			} else {
				this._endRow = Math.max(0, Math.min(this._grid.itemCount() - 1, i));
			}
			this._resized();
		}
	},
	_inflateBottom: function (newBottom) {
		var i = newBottom.I();
		if (i != this.bottomRow()) {
			if (this._startRow > this._endRow) {
				this._startRow = Math.max(0, Math.min(this._grid.itemCount() - 1, i));
			} else {
				this._endRow = Math.max(0, Math.min(this._grid.itemCount() - 1, i));
			}
			this._resized();
		}
	},
	resizeTo: function (endIndex) {
		var row = Math.max(0, endIndex.I());
		if (row != this._endRow) {
			this._endRow = Math.max(0, Math.min(this._grid.itemCount() - 1, row));
			this._resized();
		}
	},
	intersectsWith: function (item) {
		return this.getBounds().intersectsWith(item.getBounds());
	},
	mergeWith: function (item) {
	},
	getData: function (maxRows) {
		maxRows = arguments.length > 0 ? maxRows : -1;
		if (maxRows == 0) {
			return null;
		}
		var grid = this._grid;
		var columns = grid.collectDataColumns(grid.getVisibleColumn(0), grid.getVisibleColumn(grid.visibleColumnCount() - 1));
		if (!columns) {
			return null;
		}
		var cnt = columns.length; 
		if (cnt < 1) {
			return null;
		}
		var item;
		var row;
		var c;
		var col;
		var r;
		var r1 = Math.max(0, Math.min(this._startRow, this._endRow));
		var r2 = Math.min(this._grid.itemCount() - 1, Math.max(this._startRow, this._endRow));
		var rows = [];
		for (r = r1; r <= r2; r++) {
			item = grid instanceof GridView ? _cast(grid.getItem(r), GridRow) : ( grid instanceof TreeView ? _cast(grid.getItem(r), TreeItem) : null);
			if (item) {
				row = {};
				for (c = 0; c < cnt; c++) {
					col = columns[c];
					row[col.fieldName()] = item.getData(col.dataIndex()); 
				}
				rows.push(row);
				if (maxRows > 0 && rows.length == maxRows) {
					break;
				}
			}
		}
		return rows;
	}
});
var ColumnSelection = defineClass("ColumnSelection", SelectionItem, {
	init: function(manager, startColumn, endColumn) {
		this._super(manager);
		if (Column.compareLoc(startColumn, endColumn) <= 0) {
			this._startColumn = startColumn;
			this._endColumn = endColumn;
		} else {
			this._startColumn = endColumn;
			this._endColumn = startColumn;
		}
	},
	startColumn: function() {
		return this._startColumn;
	},
	endColumn: function() {
		return this._endColumn;
	},
	leftColumn: function () {
		return this._startColumn.distance() <= this._endColumn.distance() ? this._startColumn : this._endColumn;
	},
	rightColumn: function () {
		return this._startColumn.distance() > this._endColumn.distance() ? this._startColumn : this._endColumn;
	},
	style: function() {
		return SelectionStyle.COLUMNS;
	},
	getBounds: function() {
		if (this._startColumn.distance() <= this._endColumn.distance()) {
			return GridRange.createRange(0, this._startColumn, this._startColumn.grid().itemCount() - 1, this._endColumn);
		} else {
			return GridRange.createRange(0, this._endColumn, this._endColumn.grid().itemCount() - 1, this._startColumn);
		}
	},
	contains: function(index) {
		var column = index.column();
		return Column.compareLoc(column, this._startColumn) >= 0 && Column.compareLoc(column, this._endColumn) <= 0;
	},
	_inflateLeft: function (newLeft) {
		var c = newLeft.column();
		if (c !== this.leftColumn()) {
			if (this._startColumn.distance() <= this._endColumn.distance()) {
				this._startColumn = c;
			} else {
				this._endColumn = c;
			}
			this._resized();
		}
	},
	_inflateRight: function (newRight) {
		var c = newRight.column();
		if (c !== this.rightColumn()) {
			if (this._startColumn.distance() > this._endColumn.distance()) {
				this._startColumn = c;
			} else {
				this._endColumn = c;
			}
			this._resized();
		}
	},
	resizeTo: function(newEnd) {
		if (newEnd.column() !== this._endColumn) {
			this._endColumn = newEnd.column();
			this._resized();
		}
	},
	intersectsWith: function(item) {
		return this.getBounds().intersectsWith(item.getBounds());
	},
	mergeWith: function(item) {
	},
	getData: function(maxRows) {
		maxRows = arguments.length > 0 ? maxRows : -1;
		if (maxRows == 0) {
			return null;
		}
		var grid = this._startColumn.grid();
		var columns = grid.collectDataColumns(this._startColumn, this._endColumn);
		if (!columns) {
			return null;
		}
		var r, item, row, c, cols;
		var cnt = grid.itemCount();
		var rows = [];
		for (r = 0; r < cnt; r++) {
			item = grid instanceof GridView ? _cast(grid.getItem(r), GridRow) : ( grid instanceof TreeView ? _cast(grid.getItem(r), TreeItem) : null);
			if (item) {
				row = {};
				for (c = 0, cols = columns.length; c < cols; c++) {
					row[columns[c].fieldName()] = item.getData(columns[c].dataIndex());
				}
				rows.push(row);
				if (maxRows > 0 && rows.length == maxRows) {
					break;
				}
			}
		}
		return rows;
	}
});
var SelectionView = defineClass("SelectionView", LayerElement, {
	init : function(dom) {
		this._super(dom, "selectionView");
		this._item = null;
		this._background = SelectionView.$$_defBackground;
		this._border = SelectionView.$$_defBorder;
	},
	background: null,
    border: null,
	setBackground: function (value) {
		if (value !== this._background) {
			this._background = value;
			this.invalidate();
		}
	},
	setBorder: function (value) {
		if (value != this._border) {
			this._border = value;
			this.invalidate();
		}
	},
	updateElement: function (item, styles) {
		this._item = item;
		this.setBackground(styles.background());
		this.setBorder(styles.border());
	},
	_doDraw: function (g) {
		var grid = this.container().gridView();
		var lm = grid.layoutManager();
		var r = lm.gridBounds();
		r = grid.translateBy(this, r);
		g.clipRectEx(r);
		g.drawBoundsI(this._background, this._border, 0, 0, this.width(), this.height());
	},
	_doDrawHtml: function (g) {
		var fill = this._background;
		/*
		g.clipRectEx(r);
		g.drawBoundsI(this._background, this._border, 0, 0, this.width(), this.height());
		*/
		_ieOld ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		this._css.border = this._border ? this._border.css() : "none";
	}
});
SelectionView.$$_defBackground = new SolidBrush(0x2F1E90FF);
SelectionView.$$_defBorder = new SolidPen(0xaa1E90FF, 1);