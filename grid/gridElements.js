var GridElement = defineClass("GridElement", VisualElement, {
	init: function (dom, name) {
		this._super(dom, name);
		this._drawRect = new Rectangle();
		this._recycling = false;
	},
	destroy: function() {
		this._destroying = true;
		this._drawRect = null;
		this._super();
	},
	grid: function () {
		var p = this._parent;
		while (p) {
			if (p instanceof GridBase) {
				return p;
			}
			p = p._parent;
		}
		return null;
	},
	measure: function (grid, hintWidth, hintHeight) {
		return this._doMeasure(grid, hintWidth, hintHeight);
	},
	measureHeight: function(grid, hintWidth, hintHeight) {
		return this._doMeasureHeight(grid, hintWidth, hintHeight);
	},
	layoutContent: function (lm) {
		return this._doLayoutContent(lm);
	},
	refresh: function () {
		this._doRefresh();
	},
	clip: function (g) {
		this.getClientRect(this._drawRect);
		g.clipRect(this._drawRect);
	},
	_doDraw: function(g, needOpaque) {
		needOpaque && g.drawRectI(SolidBrush.WHITE, null, this._drawRect);
		this._doRender(g, this._drawRect);
	},
	_doDrawHtml: function () {
		this.getClientRect(this._drawRect);
		this._doRenderHtml(this._drawRect);
	},
	_doMeasure: function (grid, hintWidth, hintHeight) {
		return new Size(hintWidth, hintHeight);	
	},
	_doMeasureHeight: function (grid, hintWidth, hintHeight) {
		return new Size(hintWidth, hintHeight);
	},
	_doLayoutContent: function (lm) {
	},
	_doRefresh: function () {
	},
	_doRender: function (g, r) {
	},
	_doRenderHtml: function (r) {
	},
	_drawStyledBorders: function (g, r, styles) {
		var wLeft = styles.borderLeftWidth();
		var wTop = styles.borderTopWidth();
		var wRight = styles.borderRightWidth();
		var wBottom = styles.borderBottomWidth();
		if (wLeft) {
			wLeft = wLeft / 2;
			g.drawLineI(styles.borderLeft(), r.x + wLeft, r.y, r.x + wLeft, r.bottom());
		}
		if (wTop) {
			wTop = wTop / 2;
			g.drawLineI(styles.borderLeft(), r.x, r.y + wTop, r.right(), r.y + wTop);
		}
		if (wRight) {
			wRight = (wRight + 1) / 2;
			g.drawLineI(styles.borderLeft(), r.right() - wRight, r.y, r.right() - wRight, r.bottom());
		}
		if (wBottom) {
			wBottom = (wBottom + 1) / 2;
			g.drawLineI(styles.borderLeft(), r.x, r.bottom() - wBottom, r.right(), r.bottom() - wBottom);
		}
	},
	_drawStyledHtmlBorders: function (styles) {
		var bLeft = styles.borderLeft();
		var bTop = styles.borderTop();
		var bRight = styles.borderRight();
		var bBottom = styles.borderBottom();
		this._css.borderLeft = bLeft ? bLeft.css() : "";
		this._css.borderTop = bTop ? bTop.css() : "";
		this._css.borderRight = bRight ? bRight.css() : "";
		this._css.borderBottom = bBottom ? bBottom.css() : "";
	}
});
var GridElement$ = GridElement.prototype;
var /* abstract */ VisualObjectElement = defineClass("VisualObjectElement", GridElement, {
	init : function(dom, name, model) {
		this._super(dom, name);
		this._model = model;
		this._clipBounds = null;
		if (this._dom) {
			this._dom.style.pointerEvents = "none";
		}
	},
	destroy: function() {
		this._destroying = true;
		this._clipBounds = null;
		this._model = null;
		this._super();
	},
	model: null,
	setClipBounds: function (x, y, w, h) {
		var r = null;
		var bounds = _cast(x, Rectangle);
		if (bounds) {
			r = this._clipBounds || new Rectangle();
			r.x = Math.max(bounds.x, this._x);
			r.setRight(Math.min(bounds.right(), this.right()));
			r.y = Math.max(bounds.y, this._y);
			r.setBottom(Math.min(bounds.bottom(), this.bottom()));
			r.x -= this._x;
			r.y -= this._y;
		} else if (!isNaN(x)) {
			r = this._clipBounds || new Rectangle();
			r.x = Math.max(x, this._x);
			r.setRight(Math.min(x + w, this.right()));
			r.y = Math.max(y, this._y);
			r.setBottom(Math.min(y + h, this.bottom()));
			r.x -= this._x;
			r.y -= this._y;
		}
		this._clipBounds = r;
	},
	clip: function (g) {
		this.getClientRect(this._drawRect);
		g.clipRect(this._clipBounds || this._drawRect);
	}
});
var VisualObjectElement$ = VisualObjectElement.prototype;
var EmptyGridElement = defineClass("EmptyGridElement", GridElement, {
	init: function (dom, name) {
		this._super(dom, name);
	},
	_doRender: function(g, r) {
		var grid = this.grid();
		var s = grid.displayOptions().emptyMessage();
        var s2 = grid._productName;
		var fill = grid.body().emptyStyles().background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		if (s || s2) {
			r.inflate(-10, -10);
			s && g.drawTextRect(null, SolidBrush.BLACK, s, r, TextAlign.LEFT, TextLayout.TOP);
			s2 && g.drawTextRect(null, SolidBrush.BLACK, s2, r, TextAlign.LEFT, TextLayout.BOTTOM);
		}
	},
	_doRenderHtml: function (r) {
		this._dom.style.background = "#fff";
	}
});
var PanelElement = defineClass("PanelElement", VisualObjectElement, {
	init : function(dom, panel) {
		this._super(dom, "panelView", panel);
	},
	_doMeasure: function (grid, hintWidth, hintHeight) {
		return Size.create(hintWidth, this.model().minHeight());
	},
	_doRender : function(g, r) {
		var panel = this.model();
		var styles = panel.styles();
		var fill = styles.background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		this._drawStyledBorders(g, r, styles);
	},
	_doRenderHtml: function (r) {
		this._dom.style.background = "#ddd";
	}
});
var HeaderElement = defineClass("HeaderElement", VisualObjectElement, {
	init : function(dom, header, fixed, rightFixed) {
		this._super(dom, "headerView", header);
		this._fixed = fixed;
		this._rightFixed = rightFixed;
		this._cells = {};
		this._focusedColumn = null;
	},
	destroy: function() {
		this._destroying = true;
		for (var cell in this._cells) {
			this._cells[cell] = null;
		}
		this._cells = null;
		this._focusedColumn = null;
		this._super();
	},
	isFixed: function () { return this._fixed; },
	isRightFixed: function () { return this._rightFixed; },
	$_getChildAt: function (p, x, y, deep) {
		for (var i = 0, cnt = p.childCount(); i < cnt; i++) {
			var cell = p.getChild(i);
			if (cell.isVisible()) {
				if (deep && cell instanceof GroupCellElement) {
					var child = this.$_getChildAt(cell, x - cell.x(), y - cell.y(), true);
					if (child) {
						return child;
					}
				}
				if (cell.containsInBounds(x, y)) {
					return cell;
				}
			}
		}
		return null;
	},
	getCellAt: function (x, y, deep) {
		return this.$_getChildAt(this, x, y, deep);
	},
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
	_doMeasure: function (grid, hintWidth, hintHeight) {
		return Size.create(hintWidth, this.model().minHeight());
	},
	_doRender : function(g, r) {
		g.drawRectI(SolidBrush.WHITE, null, r);
		var options = this.grid().fixedOptions();
		var wbar = options.colBarWidth();
		if (wbar > 0 && this.isFixed()) {
			var styles = options.colBarStyles();
			var fill = styles.background();
			var stroke = styles.borderRight();
			var lstroke = styles.borderLeft();
			if (this.isRightFixed()) {
				r.setRight(wbar);
			} else {
				r.setLeft(r.right() - wbar);
			}

			if (fill) {
				g.drawRectI(fill, null, r);
			}
			if (stroke) {
				g.drawVertLineI(stroke, r.y, r.bottom(), r.right() - 1);
			}
			if (lstroke && this._rightFixed) {
				g.drawVertLineI(lstroke, r.y, r.bottom(), r.x);
			}
		}
	},
	_doRenderHtml: function (r) {
		this._dom.style.background = "#fff";
	},
	_doLayoutContent: function (lm) {
		this._prepareCells(lm);
		this._layoutCells(lm);
	},
	$_checkCell: function (view) {
		var cell = _cast(view, HeaderCellElement);
		if (cell) {
			cell.setFocused(this._focusedColumn == cell.index().column());
		}
		if (view instanceof HeaderGroupCellElement) {
			this.$_refreshCells(view);
		}
	},
	$_refreshCells: function (group) {
		for (var i = 0, cnt = group.childCount(); i < cnt; i++) {
			this.$_checkCell(group.getChild(i));
		}
	},
	_doRefresh: function () {
		this._focusedColumn = this.grid().focusedIndex().column();
		for (var key in this._cells) {
			this.$_checkCell(this._cells[key]);
		}
	},
	_prepareCells: function (lm) {
		var grid = this.grid();
        var header = grid.header();
		if (grid.isColumnLayoutChanged()) {
		}
		this.hideAll();
		var start = lm.firstCol(this._fixed, this._rightFixed);
		var end   = lm.lastCol(this._fixed, this._rightFixed);
		for (var i = start; i <= end; i++) {
			var column = lm.getColumn(i);
			var view = this._cells[column.$_hash];
			if (!view) {
				if (column instanceof ColumnGroup) {
					view = new HeaderGroupCellElement(this._dom);
				} else {
					view = new HeaderCellElement(grid, this._dom);
				}
				this._cells[column.$_hash] = view;
				this.addElement(view);
			}
			view.setVisible(true);
			var index = CellIndex.temp(grid, -1, column);
			var model = header.getCell(index);
			view.updateCell(model);
		}
	},
	_layoutCells: function (lm) {
		var start = lm.firstCol(this._fixed, this._rightFixed);
		var end   = lm.lastCol(this._fixed, this._rightFixed);
		for (var i = start; i <= end; i++) {
			var view = this._cells[lm.getColumn(i).$_hash];
			var r = lm.getColumnBounds(i);
			r.height = this.height();
			view.setRect(r);
			view.layoutContent(lm);
		}
	}
});
var HeaderSummaryElement = defineClass("HeaderSummaryElement", VisualObjectElement, {
	init : function(dom, summary, fixed, rightFixed) {
		this._super(dom, "headerSummaryView", summary);
		this._fixed = fixed;
		this._rightFixed = rightFixed;
		this._cells = {};
		this._mergeCells = {};
	},
	destroy: function() {
		this._destroying = true;
		this._mergeCells = null;
		this._cells = null;
		this._super();
	},
	isFixed: function () { return this._fixed; },
	isRightFixed: function () { return this._rightFixed; },
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
	_doMeasure: function (grid, hintWidth, hintHeight) {
		return Size.create(hintWidth, this.model().minHeight());
	},
	_doRender : function(g, r) {
		g.drawRectI(SolidBrush.WHITE, null, r);
		var grid = this.grid();
		var options = grid.fixedOptions();
		var wbar = options.colBarWidth();
		var styles, fill, stroke, lstroke;
		if (this.isFixed() && wbar > 0) {
			styles = options.colBarStyles();
			fill = styles.background();
			stroke = styles.borderRight();
			lstroke = styles.borderLeft();
			if (this.isRightFixed()) {
				r.setRight(wbar);
			} else {
				r.setLeft(r.right() - wbar);
			}
			if (fill) {
				g.drawRectI(fill, null, r);
			}
			if (stroke) {
				g.drawVertLine(stroke, r.y, r.bottom(), r.right() - 1);
			}
			if (lstroke && this._rightFixed) {
				g.drawVertLineI(lstroke, r.y, r.bottom(), r.x);
			}

		}
	},
	_doRenderHtml: function (r) {
		this._dom.style.background = "#fff";
	},
	_doLayoutContent : function(lm) {
		this._prepareCells(lm);
		this._layoutCells(lm);
	},
	_doRefresh : function() {
	},
	_prepareCells: function (lm) {
		var grid = this.grid();
        var summary = grid.header().summary();
        var mergeManager = grid.headerSummaryMergeManager();
        var merged = mergeManager.count() > 0;

		if (grid.isColumnLayoutChanged()) {
		}
		this.hideAll();
		var	start = lm.firstCol(this._fixed, this._rightFixed);
		var	end   = lm.lastCol(this._fixed, this._rightFixed);
		for (var i = start; i <= end; i++) {
			var room = mergeManager.findRoom(i);
			var column = room ? lm.getColumn(room.base()) : lm.getColumn(i);
			var view = this._cells[column.$_hash];
            if (!view) {
				if (column instanceof ColumnGroup) {
					view = new SummaryGroupCellElement(this._dom);
				} else {
					view = new SummaryCellElement(this._dom);
				}
				this._cells[column.$_hash] = view;
				this.addElement(view);
			}
			view.setVisible(true);
			var index = CellIndex.temp(grid, -1, column);
			var model = summary.getCell(index);
			view.updateCell(model);
		}
	},
	_layoutCells: function (lm) {
		var	start = lm.firstCol(this._fixed, this._rightFixed);
		var	end   = lm.lastCol(this._fixed, this._rightFixed);
		var	fixed = lm.fixedColCount();
		var grid = this.grid();
		var mergeManager = grid.headerSummaryMergeManager();
		for (var i = start; i <= end; i++) {
			var room = mergeManager.findRoom(i);
			var column = room ? lm.getColumn(room.base()) : lm.getColumn(i);
			var view = this._cells[column.$_hash];
			var r = lm.getColumnBounds(i);
			if (room) {
				var sr = lm.getColumnBounds(room.start());
				var er = lm.getColumnBounds(room.last());
				r.x = sr.x;
				r.width = er.right() - r.x;
			}
			r.height = this.height();
			view.setRect(r);
			view.layoutContent(lm);
		}
	}
});
var FooterElement = defineClass("FooterElement", VisualObjectElement, {
	init : function(dom, footer, fixed, rightFixed) {
		this._super(dom, "footerView", footer);
		this._fixed = fixed;
		this._rightFixed = rightFixed;
		this._cells = [];
		this._mergeCells = {};
	},
	destroy: function() {
		this._destroying = true;
		this._cells = null;
		this._mergeCells = null;
		this._super();
	},
	isFixed: function () { return this._fixed; },
	isRightFixed: function () { return this._rightFixed; },
    findCell: function (index, column) {
        if (column) {
            var root = column.root();
            var view = this._cells[index] && this._cells[index][root.$_hash];
            if (view && view.isVisible()) {
                if (root != column) {
                    view = view.findCell(index, column);
                }
                return view;
            }
        }
        return null;
    },
	_doMeasure: function (grid, hintWidth, hintHeight) {
		return Size.create(hintWidth, this.model().minHeight());
	},
	_doRender : function(g, r) {
		g.drawRectI(SolidBrush.WHITE, null, r);
		var options = this.grid().fixedOptions();
		var wbar = options.colBarWidth();
		if (this.isFixed() && wbar > 0) {
			var styles = options.colBarStyles();
			var fill = styles.background();
			var stroke = styles.borderRight();
			var lstroke = styles.borderLeft();
			if (this.isRightFixed()) {
				r.setRight(wbar);
			} else {
				r.setLeft(r.right() - wbar);
			}
			if (fill) {
				g.drawRectI(fill, null, r);
			}
			if (stroke) {
				g.drawVertLine(stroke, r.y, r.bottom(), r.right() - 1);
			}
			if (lstroke && this._rightFixed) {
				g.drawVertLineI(lstroke, r.y, r.bottom(), r.x);
			}

		}
	},
	_doRenderHtml: function (r) {
		this._dom.style.background = "#fff";
	},
	_doLayoutContent : function(lm) {
		this._prepareCells(lm);
		this._layoutCells(lm);
	},
	_doRefresh : function() {
	},
	_prepareCells: function (lm) {
		var grid = this.grid();
		if (grid.isColumnLayoutChanged()) {
		}
		this.hideAll();

		var mergeCount;
		var	start = lm.firstCol(this._fixed, this._rightFixed);
		var	end   = lm.lastCol(this._fixed, this._rightFixed);
		var mergeManager = grid.footerMergeManager();
		var merged = mergeManager.count() > 0;
		var r, i;
		var count = grid.footer().count();

		for (i = start; i <= end; i++) {
			var room = merged && mergeManager.findRoom(i);
			for (r = 0; r < count; r++) {
				this._prepareCell(lm, r, i, merged, room);
			}
		}
		if (merged) {
			var rooms = mergeManager.getRoomNames();
			for (var i = 0; i < rooms.length; i++) {
				var room = merged && mergeManager.getRoom(rooms[i]);
				if (room && ((start > room.base() && start <= room.last()) ||
					         (end   < room.base() && end   >= room.start()))) {
					for (r = 0; r < count; r++) {
						this._prepareCell(lm, r, room.base(), true, room);
					}
				}
			}
		}
	},
	_prepareCell: function (lm, row, col, merged, room) {
		var grid = this.grid();
		var footer = grid.footer();
		var column = lm.getColumn(col);
		var rowView = this._cells[row];
		if (!rowView) {
			rowView = {};
			this._cells.push(rowView);
		}
		var view = rowView[column.$_hash];
		if (!view) {
			if (column instanceof ColumnGroup) {
				view = new FooterGroupCellElement(this._dom);
			} else {
				view = new FooterCellElement(this._dom);
			}
			rowView[column.$_hash] = view;
			this.addElement(view);
		}

		view.setVisible(!merged || !room || room.base() == col);
		var index = CellIndex.temp(grid, -1, column);
		var model = footer.getCell(index, row);
		view.updateCell(model);
	},
	_layoutCells: function (lm) {
		var i, row, view, r, column, room;
		var	start = lm.firstCol(this._fixed, this._rightFixed);
		var	end   = lm.lastCol(this._fixed, this._rightFixed);
		var grid = this.grid();
		var mergeManager = grid.footerMergeManager();
		var merged = mergeManager.count() > 0;
		var count = grid.footer().count();
		var rowHeight = _int(this.height() / count);
		for (i = start; i <= end; i++) {
			column = lm.getColumn(i);
			for (row = 0; row < count; row++) {
				view = this._cells[row][column.$_hash];
				r = lm.getColumnBounds(i);
				if (merged && (room = mergeManager.findRoom(i))) {
					var sr = lm.getColumnBounds(room.start());
					var er = lm.getColumnBounds(room.last());

					r.x = sr.x;
					r.width = er.right() - r.x;
				}
				r.y = rowHeight * row; 
				if (row < count -1) {
					r.height = rowHeight;
				} else {
					r.height = this.height() - rowHeight * row;
				}
				view.setRect(r);
				view.layoutContent(lm, row);
			}
		}
		if (merged) {
			var rooms = mergeManager.getRoomNames();
			for (var i = 0; i < rooms.length; i++) {
				var room = mergeManager.getRoom(rooms[i]);
				if (room && ((start > room.base() && start <= room.last()) ||
				             (end   < room.base() && end   >= room.start()))) {
					for (row = 0; row < count; row++) {
						r = lm.columnBounds(room.start());
						r.height = this.height();
						er = lm.columnBounds(room.last());
						r.width = er.right() - r.x;
						r.y = rowHeight * row; 
						if (row < count -1) {
							r.height = rowHeight;
						} else {
							r.height = this.height() - rowHeight * row;
						}
						view = this._cells[row][lm.getColumn(room.base()).$_hash];
						view.setRect(r);
						view.layoutContent(lm);
					}			
				}
			}
		}
	}
});
var IndicatorElement = defineClass("IndicatorElement", VisualObjectElement, {
	init : function(dom, indicator) {
		this._super(dom, "IndicatorView", indicator);
		this._cells = [];
		this._fixedCount = 0;
	},
	refreshSelection: function (selections) {
	},
	_doMeasure: function (grid, hintWidth, hintHeight) {
		function calcWidth(grid, indicator) {
			var cnt = grid.itemCount();
			if (cnt <= 0) {
				return 0;
			}
			var s = new Array(String(cnt).length + 1).join('8');
			var st = indicator.styles()
			cnt = grid.container().measureText(st.font(), s);
			return cnt;
		}
		var grid = this.grid();
		var indicator = this.model();
		var w = indicator.width();
		if (w <= 0) {
			w = calcWidth(grid, indicator);
			var w2 = indicator.maxWidth();
			if (w2 > 0 && w > w2) {
				w = w2
			}
			w = Math.max(indicator.minWidth(), w);
		}
		return Size.create(w, hintHeight);
	},
	_doRender : function(g, r) {
		var indicator = this.model();
		var styles = indicator.styles();
		var fill = styles.background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		this._drawStyledBorders(g, r, styles);
	},
	_doRenderHtml: function (r) {
		var indicator = this.model();
		var styles = indicator.styles();
		var fill = styles.background();
		this._css.background = fill ? fill.css() : null;
	},
	_doLayoutContent : function(lm) {
		var view, item, i, cnt, row, index, cell, r,
			grid = this.grid(),
			indicator = this.model(),
			width = this.width(),
			topIndex = lm.topIndex(),
			fixedItemCount = lm.fixedItemCount(),
			itemCount = lm.itemCount();
		// if (fixedItemCount == this._fixedCount && itemCount == this.childCount() - this._fixedCount && this.childCount() > this._fixedCount + 1) {
		// 	view = this.getChild(this._fixedCount);
		// 	if (view && (item = view.item()) != null) {
		// 		if (item.index() == this._fixedCount + topIndex - 1) {
		// 			// view = this.removeElementAt(this._fixedCount);
		// 			// this.addElement(view);
		// 		} else if (item.index() == this._fixedCount + topIndex + 1) {
		// 			view = this.removeElementAt(this.childCount() - 1);
		// 			this.insertElement(this._fixedCount, view);
		// 		}
		// 	}
		// }
		this._fixedCount = fixedItemCount;
		while (this.childCount() < fixedItemCount + itemCount) {
			if (this._cells.length > 0) {
				view = this._cells.pop();
			} else {
				view = this._createCell();
			}
			this.addElement(view);
		}
		while (this.childCount() > fixedItemCount + itemCount) {
			view = this.removeElementAt(this.childCount() - 1);
			view.validate(true);
			this._cells.push(view);
		}
		cnt = this.childCount();
		for (i = 0; i < cnt; i++) {
			view = this.getChild(i);
			row = (i < fixedItemCount) ? i : i + topIndex;
			index = CellIndex.temp(grid, row);
			cell = indicator.getCell(index);
			view.updateCell(cell);
			r = lm.getItemBounds(i);
			r.x = 0;
			r.width = width;
			view.setRect(r);
		}
	},
	_doRefresh: function() {
		var grid = this.grid();
		var indicator = grid.indicator();
		var lm = grid.layoutManager();
		var fixed = lm.fixedItemCount();
		var cnt = this.childCount();
		for (var i = 0; i < cnt; i++) {
			var row = (i < fixed) ? i : i + lm.topIndex();
			var index = CellIndex.temp(grid, row);
			var model = indicator.getCell(index);
			var view = this.getChild(i);
			view.updateCell(model);
		}
	},
	_createCell: function () {
		return new IndicatorCellElement(this._dom);
	}
});
var StateBarElement = defineClass("StateBarElement", VisualObjectElement, {
	init : function(dom, stateBar) {
		this._super(dom, "stateBarView", stateBar);
		this._cells = [];
		this._fixedCount = 0;
	},
	refreshSelection: function (selections) {
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
		return Size.create(this.model().width(), hintHeight);
	},
	_doRender: function(g, r) {
		var stateBar = this.model();
		var styles = stateBar.styles();
		var fill = styles.background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		this._drawStyledBorders(g, r, styles);
	},
	_doRenderHtml: function (r) {
		var stateBar = this.model();
		var styles = stateBar.styles();
		var fill = styles.background();
		this._css.background = fill ? fill.css() : null;
		this._drawStyledHtmlBorders(styles);
	},
	_doLayoutContent : function(lm) {
		var view, item, i, cnt, row, index, cell, r,
			grid = this.grid(),
			stateBar = this.model(),
			width = this.width(),
			topIndex = lm.topIndex(),
			fixedItemCount = lm.fixedItemCount(),
			itemCount = lm.itemCount();
		// if (fixedItemCount == this._fixedCount && itemCount == this.childCount() - this._fixedCount && this.childCount() > this._fixedCount + 1) {
		// 	view = this.getChild(this._fixedCount);
		// 	if (view && (item = view.getItem()) != null) {
		// 		if (item.index() == this._fixedCount + topIndex - 1) {
		// 			view = this.removeElementAt(this._fixedCount);
		// 			this.addElement(view);
		// 		} else if (item.index() == this._fixedCount + topIndex + 1) {
		// 			view = this.removeElementAt(this.childCount() - 1);
		// 			this.insertElement(this._fixedCount, view);
		// 		}
		// 	}
		// }
		this._fixedCount = fixedItemCount;
		while (this.childCount() < fixedItemCount + itemCount) {
			if (this._cells.length > 0) {
				view = this._cells.pop();
			} else {
				view = this._createCell();
			}
			this.addElement(view);
		}
		while (this.childCount() > fixedItemCount + itemCount) {
			view = this.removeElementAt(this.childCount() - 1);
			view.validate(true);
			this._cells.push(view);
		}
		cnt = this.childCount();
		for (i = 0; i < cnt; i++) {
			view = this.getChild(i);
			row = (i < fixedItemCount) ? i : i + topIndex;
			index = CellIndex.temp(grid, row);
			cell = stateBar.getCell(index);
			view.updateCell(cell);
			r = lm.getItemBounds(i);
			r.x = 0;
			r.width = width;
			view.setRect(r);
		}
	},
	_doRefresh: function() {
	},
	_createCell: function () {
		return new StateBarCellElement(this._dom);
	}
});
var CheckBarElement = defineClass("CheckBarElement", VisualObjectElement, {
	init : function(dom, checkBar) {
		this._super(dom, "checkBarView", checkBar);
		this._cells = [];
		this._fixedCount = 0;
	},
	refreshSelection: function (selections) {
	},
	_doMeasure : function(grid, hintWidth, hintHeight) {
		return Size.create(this.model().width(), hintHeight);
	},
	_doRender : function(g, r) {
		var checkBar = this.model();
		var styles = checkBar.styles();
		var fill = styles.background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		this._drawStyledBorders(g, r, styles);
	},
	_doRenderHtml: function (r) {
		var checkBar = this.model();
		var styles = checkBar.styles();
		var fill = styles.background();
		this._css.background = fill ? fill.css() : null;
		this._drawStyledHtmlBorders(styles);
	},
	_doLayoutContent : function(lm) {
		var view, item, i, cnt, row, index, cell, r;
		var grid = this.grid();
		var width = this.width();
		var checkBar = this.model();
		var exclusive = checkBar.isExclusive();
		var showGroup = checkBar.isShowGroup();
		var topIndex = lm.topIndex();
		var fixedItemCount = lm.fixedItemCount();
		var itemCount = lm.itemCount();
		// if (fixedItemCount == this._fixedCount && itemCount == this.childCount() - this._fixedCount && this.childCount() > this._fixedCount + 1) {
		// 	view = this.getChild(this._fixedCount);
		// 	if (view && (item = view.getItem()) != null) {
		// 		if (item.index() == this._fixedCount + topIndex - 1) {
		// 			view = this.removeElementAt(this._fixedCount);
		// 			this.addElement(view);
		// 		} else if (item.index() == this._fixedCount + topIndex + 1) {
		// 			view = this.removeElementAt(this.childCount() - 1);
		// 			this.insertElement(this._fixedCount, view);
		// 		}
		// 	}
		// }
		this._fixedCount = fixedItemCount;
		while (this.childCount() < fixedItemCount + itemCount) {
			if (this._cells.length > 0) {
				view = this._cells.pop();
			} else {
				view = this._createCell();
			}
			this.addElement(view);
		}
		while (this.childCount() > fixedItemCount + itemCount) {
			view = this.removeElementAt(this.childCount() - 1);
			view.validate(true);
			this._cells.push(view);
		}
		cnt = this.childCount();
		for (i = 0; i < cnt; i++) {
			row = (i < fixedItemCount) ? i : i + topIndex;
			index = CellIndex.temp(grid, row);
			cell = checkBar.getCell(index);
			view = this.getChild(i);
			view.setMarkVisible(showGroup || index.dataRow() >= 0);
			view.setExclusive(exclusive);
			view.updateCell(cell);
			r = lm.getItemBounds(i);
			r.x = 0;
			r.width = width;
			view.setRect(r);
		}
	},
	_doRefresh: function() {
	},
	_createCell: function () {
		return new CheckBarCellElement(this._dom);
	}
});
var GridBodyElement = defineClass("GridBodyElement", VisualObjectElement, {
	init : function (dom, body, fixed, rightFixed) {
		this._super(dom, "gridBodyView", body);
		this._fixed = fixed;
		this._rightFixed = rightFixed;
		this._lineScrolled = false;
		this._horzScrolling = false;
		this._fixedCount = 0;
		this._items = [];
		this._rowViews = [];
		this._fill = new SolidBrush(0xffffff);
	},
	destroy: function() {
		this._destroying = true;
		this._items = null;
		this._rowViews = null;
		this._fill = null;
		this._super();
	},
	empty: false,
	isFixed: function () { return this._fixed; },
	isRightFixed: function () { return this._rightFixed; },
	isLineScrolled: function () { return this._lineScrolled; },
	checkResourceColumn: function (column, list) {
	},
	checkResourceUse: function (url, list) {
	},
	clearItems: function () {
		this._items = [];
	},
	addItem: function (item) {
		if (this._items.indexOf(item) < 0) {
			this._items.push(item);
		}
	},
	findRowView: function (itemIndex) {
        for (var i = 0, cnt = this.childCount(); i < cnt; i++) {
			var rowView = this.getChild(i);
			if (rowView instanceof RowElement && rowView.item().index() == itemIndex) {
				return rowView;
			}
		}
		return null;
	},
    findFirstRow: function () {
        var cnt = this.childCount();
        if (cnt > 0) {
            var first = null;
            for (var i = 1; i < cnt; i++) {
                var rowView = this.getChild(i);
                if (rowView instanceof RowElement) {
                    if (!first && rowView.itemIndex() < first.itemIndex()) {
                        first = rowView;
                    }
                }
            }
            return first;
        }
        return null;
    },
	_doMeasure: function(grid, hintWidth, hintHeight) {
		return {
			width : hintWidth,
			height : hintHeight
		};
	},
	_doRenderHtml: function (r) {
	},
	_doLayoutContent : function(lm) {
		this._lineScrolled = 0;
		this._super(lm);
		var i, j, item, view, styles, idx, r, topIndex;
		var fixed = this._fixed;
		var rfixed = this._rightFixed;
		var grid = this.grid();
		var cnt = this.childCount();
		var items = this._items;
		var itemCount = items.length;
		for (i = 0; i < cnt; i++) {
			this.getChild(i)._recycling = false;
		}
		/*
		this._horzScrolling = grid.isHorzScrolling();
		if (this._horzScrolling) {
		} else if (grid.isScrolling() && lm.getFixedItemCount() == fixedCount && 
				this.childCount() > fixedCount + 2 && itemCount > fixedCount + 2) {
			i = fixedCount;
			var v1 = this.getChild(i);
			var v2 = this.getChild(i + 1);
			if (v1.getItem() === items[i]) {
				v1._recycling = true;
				cnt = this.childCount();
				while (++i < cnt && i < itemCount) {
					v2 = this.getChild(i);
					if (v2.getItem() != items[i]) {
						break;
					}
					v2._recycling = true;
				}
				for (j = cnt - 1; j >= i; j--) {
					this.$_removeView(j);
				}
			} else if (v2.getItem() === items[i]) {
				this._lineScrolled = 1;
				this.$_removeView(i);
				cnt = this.childCount();
				while (i < cnt && i < itemCount) {
					v2 = this.getChildAt(i);
					if (v2.getItem() === items[i]) {
						break;
					}
					v2._recycling = true;
					i++;
				}
				for (j = cnt; j >= i; j--) {
					this.$_removeView(j);
				}
			} else if (v1.getItem() === items[i + 1]) {
				this._lineScrolled = -1;
				v2 = this.$_borrowView(items[i]);
				this.insertElement(1, v2);
				cnt = this.childCount();
				while (++i < cnt && i < itemCount) {
					v2 = this.getChild(i);
					if (v2.getItem() !== items[i]) {
						break;
					}
					v2._recycling = true;
				}
				for (j = cnt - 1; j >= i; j--) {
					this.$_removeView(j);
				}
			}
		}
		*/
		while (this.childCount() < itemCount) {
			item = items[this.childCount()];
			view = this.$_borrowView(item);
			this.addElement(view);
		}
		while (this.childCount() > itemCount) {
			this.$_removeView(this.childCount() - 1);
		}
		this._fixedCount = lm.fixedItemCount();
		styles = grid.body().styles();
		topIndex = grid.topIndex();
		for (i = 0; i < itemCount; i++) {
			item = items[i];
			view = this.getChild(i);
			view.updateElement(item, styles);
			idx = item.index();
			idx = (idx < this._fixedCount) ? idx : idx - topIndex;
			r = lm.itemBounds(idx, fixed, rfixed);
			view.setRect(r);
			if (!view._recycling) {
				view.layoutContent(lm);
			} else if (lm.isColumnMerged && this._lineScrolled != 0 && (i <= 1 || i >= itemCount - 2)) {
				view.layoutContent(lm);
			}
		}
	},
	_doRender: function(g, r) {
		if (this.isEmpty()) {
			return;
		}
		var grid = this.grid();
		var options = grid.fixedOptions();
		var wbar = options.colBarWidth();
		if (this.isFixed() && wbar > 0) {
			if (this.isRightFixed()) {
				r.setRight(wbar);
			} else {
				r.setLeft(r.right() - wbar);
			}

			r.height = grid.layoutManager().fixedBounds().height;
			var styles = options.colBarStyles();
			var fill = styles.background();
			var stroke = styles.borderRight();
			var lstroke = styles.borderLeft();
			if (fill) {
				g.drawRect(fill, null, r);
			}
			if (stroke) {
				g.drawVertLineI(stroke, r.y, r.bottom(), r.right() - 1);
			}
			if (lstroke && this._rightFixed) {
				g.drawVertLineI(lstroke, r.y, r.bottom(), r.x);
			}

		}
	},
	_doRefresh: function() {
	},
	$_removeView: function (row) {
		var view = this.removeElementAt(row);
		view.validate(true);
		this._rowViews.push(view);
	},
	$_borrowView: function (item) {
		var view = this._rowViews.pop();
		if (!view) {
			view = this.grid().delegate().borrowItemView(item, this._fixed, this._rightFixed);
		}
		assert(view != null, "view is null");
		view._recycling = false;
		return view;
	}
});
var GridLinesElement = defineClass("GridLinesElement", LayerElement, {
	init: function(dom, grid) {
		this._super(dom, "gridLinesView");
		this._grid = grid;
	},
	_doDraw: function (g) {
		var grid = this._grid;
		var lm = grid.layoutManager();
		var r = lm.bodyBounds();
		r.setRight(r.right()+lm.rfixedWidth());
		var fy = lm.footerBounds().y;
		var x2 = Math.min(r.right(), lm.gridBounds().right());
		var x, y, fill, stroke;
		var options = grid.fixedOptions();
		if (lm.fixedHeight() > 0 && options.rowBarHeight() > 0) {
			x = Math.min(lm.gridBounds().right(), r.right());
			y  = r.y + lm.fixedHeight();
			if (y < fy) {
				fill = options.rowBarStyles().background();
				stroke = options.rowBarStyles().borderBottom();
				if (fill) {
					var h = Math.min(options.rowBarHeight(), fy - y);
					g.drawBoundsI(fill, null, 0, y, x, h);
				}
				y += options.rowBarHeight() - 1;
				if (y < fy && stroke && stroke.width() > 0) {
					g.drawLineI(stroke, 0, y, x, y);
				}
			}
		}
		stroke = grid.body().styles().line();
		if (stroke && stroke.width() > 0) {
			x = r.right();
			y = r.bottom();
			if (x <= x2 && lm.columnCount() + lm.fixedColCount() > 0) {
				g.drawLineI(stroke, x - 1, 0, x - 1, y);
			}
			if (grid.itemCount() > 0 && lm.itemCount() == lm.fullItemCount() && y < fy) {
				g.drawLineI(stroke, 0, y - 1, x2, y - 1);
			}
		}
	},
	_doRenderHtml: function (r) {
	}
});

var GridDebugElement = defineClass("GridDebugElement", LayerElement, {
	init: function (dom, grid) {
		this._super(dom, "gridDebugView");
		this._grid = grid;
		this._drawRect = new Rectangle();
		this._strokes = {
			"grid": SolidPen.RED,
			"body": SolidPen.BLUE,
			"fixed": SolidPen.RED,
			"nonfixed": SolidPen.GREEN
		}
	},
	destroy: function() {
		this._destroying = true;
		this._grid = null;
		this._super();
	},
	gridBounds: false,
	bodyBounds: false,
	fixedBounds: false,
	nonfixedBounds: false,
	_doDraw: function(g, needOpaque) {
		this.getClientRect(this._drawRect);
		this._doRender(g, this._drawRect);
	},
	_doRender: function (g, bounds) {
		var r;
		var lm = this._grid.layoutManager();
		if (this._gridBounds) {
			r = lm.gridBounds();
			g.drawRect(null, this._strokes["grid"], r);
		}
		if (this._bodyBounds) {
			r = lm.bodyBounds();
			trace("### B O D Y: " + r.x + ", " + r.width);
			g.drawRect(null, this._strokes["body"], r);
		}
		if (this._fixedBounds) {
			r = lm.fixedBounds();
			g.drawRect(null, this._strokes["fixed"], r);
		}
		if (this._nonfixedBounds) {
			r = lm.nonfixedBounds();
			g.drawRect(null, this._strokes["nonfixed"], r);
		}
	}
});