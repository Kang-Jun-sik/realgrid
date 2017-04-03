var /* abstract */ ItemElement = defineClass("ItemElement", GridElement, {
	init: function (dom, name) {
		this._super(dom, name);
		this._item = null;
	},
	item: function () { return this._item; },
	index: function () { return this._item.index(); },
    itemIndex: function () { return this._item.index(); },
	updateElement: function (item, styles) {
		this._item = item;
		this._doUpdateElement(styles);
	},
	propertyChanged: function (prop, value) {
		this.invalidate();
	},
	_doLayoutContent: function (lm) {
		this._doLayoutHandles();
	},
	_doRender: function (g, r) {
	},
	_doUpdateElement: function (styles) {
	}
}, {
});
var RowElement = defineClass("RowElement", ItemElement, {
	init: function (dom, name) {
		this._super(dom, name);
		this._cells = {};
	},
	fixed: false,
	rightFixed: false,
	findCell: function (column) {
		if (column) {
			var root = column.root();
			var view = this._cells[root.$_hash];
			if (view && view.isVisible()) {
				if (root != column) {
					view = view.findCell(column);
				}
				return view;
			}
		}
		return null;
	},
	checkMerged: function (lm) {
		var	start = lm.firstCol(this._fixed, this.rightFixed);
		var	end   = lm.lastCol(this._fixed, this.rightFixed);
		for (var i = start; i <= end; i++) {
			var cellView = this._cells[lm.getColumn(i).$_hash];
			if (cellView) {
				if (lm.getMergedCell(cellView.index())) {
                    cellView.setVisible(false);
				} else {
                    cellView.setVisible(true);
				}
			}
		}
	},
	_doUpdateElement: function (styles) {
		this._super(styles);
	},
	_doMesasure: function (grid, hintWidth, hintHeight) {
		return { width: hintWidth, height: hintHeight };
	},
	_doLayoutContent: function (lm) {
		this._prepareCells(lm);
		this._layoutCells(lm);
	},
	_doRender: function (g, r) {
	},
	_doRenderHtml: function (r) {
		this._css.background = "#fff";
	},
	_getCellView: function (column) {
		return this._cells[column.$_hash];
	},
	_getFirstCell: function (lm) {
		var start = lm.firstCol(this._fixed, this._rightFixed);
		return this._cells[lm.getColumn(start).$_hash];
	},
	_clearChildren: function () {
		this.clear();
		this._cells = {};
	},
	_prepareCells: function (lm) {
		var i, cnt, column, index, cellView, room, start, end, cell, expander, group;
		var grid = this.grid();
		var body = grid.body();
		var rowGroup = grid.rowGroup();
		var fixedCols = lm.fixedColCount();
		var horzScrolling = grid.isHorzScrolling();
		var merged = lm.isColumnMerged();
		var mergeExpander = rowGroup.isMergeExpander();
		var adorned = rowGroup.expandedAdornments() == RowGroupAdornments.BOTH;
		if (grid.isColumnLayoutChanged()) {
			this._clearChildren();
			this._cells = {};
		}
		if (horzScrolling) {
			for (var c in  this._cells) {
				this._cells[c]._recycling = false;
			}
			start = lm.prevFirst(this._fixed, this._rightFixed); //lm.getPrevFirst();
			end = lm.prevLast(this._fixed, this._rightFixed); //lm.getPrevLast();
			for (i = start; i < end; i++) {
				column = lm.getColumn(i);
				cellView = this._cells[column.$_hash];
				if (cellView) {
					cellView._recycling = true;
				}
			}
		}
		this.hideAll();
		start = lm.firstCol(this._fixed, this._rightFixed);
		end = lm.lastCol(this._fixed, this._rightFixed);
		for (i = start; i <= end; i++) {
			column = lm.getColumn(i);
			index = CellIndex.temp(grid, this._item.index(), column);
			room = lm.getMergedCell(index);
			if (room) {
				cellView = grid.getCellView(grid._mergeView, index);
				cellView && cellView.setFocused(false);
				continue;
			}
			cell = body.getCell(index);
			cellView = this._cells[column.$_hash];
			if (!cellView) {
				if (column instanceof ColumnGroup) {
					cellView = new DataGroupCellElement(this._dom);
				} else if (column instanceof SeriesColumn) {
					cellView = new SeriesCellElement(this._dom);
				} else {
					cellView = new DataCellElement(this._dom);
				}
				this._cells[column.$_hash] = cellView;
				this.addElement(cellView);
			}
			cellView.setVisible(true);
			if (cellView instanceof DataCellElement) {
				expander = false;
				if (merged && mergeExpander) {
					if (column instanceof DataColumn && column.isMergeGrouped()) {
						group = this._item.parent();
						cnt = group.count() - (adorned ? 0 : 1);
						expander = cnt > 1 && group.firstItem() == this._item;
					}
				}
				cellView.setExpanderVisible(expander);
			}
			if (!horzScrolling || cellView._recycling) {
				cellView.updateCell(cell);
			}
			cellView.setMouseEntered(false);
			if (cellView instanceof DataCellElement) {
				cellView.setFocused(false);
			} else {
			}
		}
	},
	_layoutCells: function (lm) {
		var i, cellView, r;
		var horzScrolling = this.grid().isHorzScrolling();
		var fixedCols = lm.fixedColCount();
		var start = lm.firstCol(this._fixed, this._rightFixed);
		var end = lm.lastCol(this._fixed, this._rightFixed);
		for (i = start; i <= end; i++) {
			cellView = this._cells[lm.getColumn(i).$_hash];
			if (cellView && cellView.isVisible()) {
				cellView._fixed = this._fixed;
				r = lm.getColumnBounds(i);
				r.height = this.height();
				cellView.index().column()._layoutRect.copy(r);
				cellView.setRect(r);
				if (!horzScrolling || !cellView._recycling) {
					cellView.layoutContent(lm);
				}
			}
		}
	}
}, {
});