var RowGroupBarCellElement = defineClass("RowGroupBarCellElement", CellElement, {
	init: function(dom, name) {
		this._super(dom, name);
	},
	level:0,
	_doRender: function (g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var fill = this.background();
		_norgba ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		this._drawHtmlBorders();
	}
});
var RowGroupBarElement = defineClass("RowGroupBarElement", LayerElement, {
	init: function(dom) {
		this._super(dom, "rowGroupBarView");
		this._level = 0;
		this._cells = [];
	},
    setLevel: function(value) {
        this._level = value;
    },
	$_checkCapacity: function (count) {
		while (this._cells.length < count) {
			this._cells.push(new RowGroupBarCellElement(this._dom, "rowGroupBarCell"));
		}
	},
	$_addCell: function (grid, idx, y, w, h) {
		this.$_checkCapacity(idx + 1);
		var cell = this._cells[idx];
		cell.setBounds(0, y, w, h);
		cell.setLevel(this._level);
		this.addElement(cell);
		var model = grid.rowGroup().getBarCell(this._level);
		cell.updateCell(model);
		cell.invalidate();
	},
	$_isBarItem: function (item) {
		return item instanceof GroupItemImpl ||	(item instanceof GroupFooter && item.isExpandable());
	},
	/* @internal */ layoutCells: function (items, lm) {
		this.clear();
		var grid = this.container().gridView();
		var c = 0;
		var yTop = 0;
		var w = this.width();
		var h = this.height();
		if (lm.fixedItemCount() > 0) {
			yTop = lm.itemBounds(lm.fixedItemCount() - 1).bottom();
			this.$_addCell(grid, c, 0, w, yTop);
			c++;
		}
		if (h <= yTop) {
			return;
		}
		var top = grid.topIndex();
		var cnt = items.length;
		if (cnt < 1) {
			this.$_addCell(grid, c, yTop, w, h - yTop);
		} else {
			var i;
			var y1;
			var r;
			var item2;
			var y2;
			var item = items[0];
			if (item.level() <= this._level || item.displayLevel() <= this._level) {
				y1 = item.index();
				r = lm.itemBounds(y1 - top);
				if (y1 > grid.topItem()) {
					this.$_addCell(grid, c, yTop, w, r.y - yTop);
					c++;
				}
			}
			for (i = 0; i < cnt - 1; i++) {
				item = items[i];
				if (this.$_isBarItem(item) && (item.level() == this._level || item.displayLevel() == this._level)) {
					item2 = items[i + 1];
					y2 = item2.index();
					y1 = item.index();
					r = lm.itemBounds(y1 - top);
					y1 = r.bottom();
					r = lm.itemBounds(y2 - top);
					y2 = r.y;
					this.$_addCell(grid, c, y1, w, y2 - y1);
					c++;
				}
			}
			i = cnt - 1;
			item = items[i];
			if (this.$_isBarItem(item) && (item.level() <= this._level || item.displayLevel() <= this._level)) {
				y1 = item.index();
				r = lm.itemBounds(y1 - top);
				if (r.bottom() < this.y() + h) {
					this.$_addCell(grid, c, r.bottom(), w, this.y() + h - r.bottom());
				}
			}
		}
	}
});
var RowGroupExpandHandle = defineClass("RowGroupExpandHandle", CellHandle, {
	init: function(dom, cellView) {
		this._super(dom, cellView, "rowGroupExpandHandle");
	},
	expanded: false,
	background: null,
	isClickable: function () {
		return true;
	},
	_doDraw: function (g) {
		var r = this.clientRect();
		if (this.isExpanded()) {
			$$_drawDownArrow(g, r, 9, this.background());
		} else {
			$$_drawRightArrow(g, r, 9, this.background());
		}
	},
	_doDrawHtml: function () {
	}
});
var RowGroupExpanderElement = defineClass("RowGroupExpanderElement", CellElement, {
	init: function(dom, name) {
		this._super(dom, name);
		this._handle = new RowGroupExpandHandle(dom, this);
		this.addElement(this._handle);
	},
	setHandleVisible: function(visible) {
		this._handle.setVisible(visible);
	},
	_doUpdateContent: function (cell) {
		this._super(cell);
		var styles = cell.styles();
		this._handle.setBackground(styles.figureBackground());
		var expanded = cell.index().item() instanceof GroupItem ? cell.index().item().isExpanded() : cell.index().item() instanceof GroupFooter ? cell.index().item().parent().isExpanded() : false;
		this._handle.setExpanded(expanded);
	},
	_doLayoutContent: function (lm) {
		this._handle.setRect(this.clientRect());
	},
	_doRender: function (g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var fill = this.background();
		_norgba ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		this._drawHtmlBorders();
	}
});
var RowGroupItemBarElement = defineClass("RowGroupItemBarElement", GridElement, {
	init: function(dom, name) {
		this._super(dom, name);
		this._index = 0;
		this._expander = new RowGroupExpanderElement(dom, "RowGroup expander");
		this.addElement(this._expander);
	},
	setExpanderVisible: function (visible) {
		this._expander.setHandleVisible(visible);
	},
	setIndex: function (index) {
		this._index = index;
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
		return new Size(hintWidth, hintHeight);
	},
	_doLayoutContent: function (lm) {
		var grid = this.grid();
		var item = grid.getItem(this._index);
		var model = (item instanceof GroupItem) ? grid.rowGroup().getHeaderBarCell(CellIndex.temp(grid, this._index))
			: grid.rowGroup().getFooterBarCell(CellIndex.temp(grid, this._index));
		var expander = this._expander;
			expander.updateCell(model);
			expander.setRect(this.clientRect());
			expander.layoutContent(lm);
	},
	_doRender: function(g, r) {
		g.drawRectI(SolidBrush.WHITE, null, r);
	},
	_doRenderHtml: function (r) {
		var fill = SolidBrush.YELLOW;
		_norgba ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
	}
});
var RowGroupHeadCellElement = defineClass("RowGroupHeadCellElement", CellElement, {
	init: function(dom, name) {
		this._super(dom, name);
	},
	_doUpdateContent: function(cell) {
		this._super(cell);
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
		return new Size(hintWidth, grid.header().minHeight());
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var fill = this.background();
		_norgba ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		this._drawHtmlBorders();
	}
});
var RowGroupFootCellElement = defineClass("RowGroupFootCellElement", CellElement, {
	init: function(dom, name) {
		this._super(dom, name);
	},
	_doUpdateContent: function(cell) {
		this._super(cell);
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
		return new Size(hintWidth, grid.footer().minHeight());
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var fill = this.background();
		_norgba ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		this._drawHtmlBorders();
	}
});
var RowGroupSummaryCellElement = defineClass("RowGroupSummaryCellElement", CellElement, {
	init: function(dom, name) {
		this._super(dom, name);
	},
	_doUpdateContent: function(cell) {
		this._super(cell);
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
		return new Size(hintWidth, grid.header().summary().minHeight());
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var fill = this.background();
		_norgba ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		this._drawHtmlBorders();
	}
});
var RowGroupItemElement = defineClass("RowGroupItemElement", ItemElement, {
	init: function(dom, name) {
		this._super(dom, name);
	}
});
var RowGroupHeaderCellElement = defineClass("RowGroupHeaderCellElement", CellElement, {
	init: function(dom) {
		this._super(dom, "rowGroupHeaderCellElement");
	},
	text: null,
	borderLeft: function () {
		return null;
	},
	_doPrepareValue: function (cell) {
		this._super(cell);
		this.setText(cell.displayText());
	},
	_doPrepareElement: function (styles) {
		this._super(styles);
	},
	_doUpdateContent: function(cell) {
		this._super(cell);
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
		return new Size(hintWidth, hintHeight);
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRect(fill, null, r);
		}
		var rc = this._getRenderRect(r);
		rc = this.inflatePadding(rc);
		g.drawTextRect(this.font(), this.foreground(), this.text(), rc, this.textAlign());
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var fill = this.background();
		_norgba ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		var span = this.$_prepareSpan();
		var s = this.text();
		var rc = this._getRenderRect(r);
		rc = this.inflatePadding(rc);
		Dom.renderTextBounds(span, this.font(), this.foreground(), s, r.x, r.y, r.width, r.height, this.textAlign());
		this._drawHtmlBorders();
	}
});
var RowGroupHeaderElement = defineClass("RowGroupHeaderElement", RowGroupItemElement, {
	init: function(dom/*, rowGroup*/) {
		this._super(dom, "rowGroupHeaderView");
		this._cellView = new RowGroupHeaderCellElement(dom);
		this.addElement(this._cellView);
	},
	cellView: function() {
		return this._cellView;
	},
	_doUpdateElement: function (styles) {
		this._super(styles);
	},
	_doMeasure: function (grid, hintWidth, hintHeight) {
		return new Size(hintWidth, hintHeight);	
	},
	_doLayoutContent: function (lm) {
		this._cellView.updateCell(this.grid().rowGroup().getHeaderCell(this.index()));
		this._cellView.setBounds(0, 0, this.width(), this.height());
	},
	_doRender: function (g, r) {
	},
	_doRenderHtml: function (r) {
	}
});
var RowGroupFooterElement = defineClass("RowGroupFooterElement", RowGroupItemElement, {
	init: function(dom/*, rowGroup*/) {
		this._super(dom, "rowGroupFooterView");
		this._fixed = false;
		this._rightFixed = false;
		this._cells = {};
	},
	isFixed: function () {
		return this._fixed;
	},
	isRightFixed: function () {
		return this._rightFixed;
	},
	setFixed: function (value) {
		this._fixed = value;
	},
	setRightFixed: function (value) {
		this._rightFixed = value;
	},
	getCell: function (index) {
		return null;
	},
	_doUpdateElement: function(styles) {
		this._super(styles);
		var parent = this.item().parent();
		this._level = parent.level();
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
		return new Size(hintWidth, hintHeight);
	},
	_doLayoutContent: function(lm) {
		this._prepareCells(lm);
		this._layoutCells(lm);
	},
	_doRender: function(g, r) {
		if (this.isFixed()) {
			var options = this.grid().fixedOptions();
			var styles = options.colBarStyles();
			var fill = styles.background();
			var stroke = styles.borderRight();
			var lstroke = styles.borderLeft();
			var wbar = options.colBarWidth();
			if (this.isRightFixed()) {
				r.setRight(wbar);
			} else {
				r.setLeft(r.right() - wbar);
			}
			if (fill) {
				g.drawRectI(fill, null, r);
			}
			if (stroke) {
				var x = r.right() - 1;
				var y = r.bottom();
				g.drawVertLineI(stroke, x.y, r.bottom(), r.x);
			}
			if (lstroke && this._rightFixed) {
				g.drawVertLineI(lstroke, r.y, r.bottom(), r.x);
			}
		}
	},
	_doDraw: function (g) {
		/*
		var r = this.getClientRect();
		g.drawRectI(SolidBrush.LTGRAY, null, r);
		*/
	},
	_doDrawHtml: function (g) {
	},
	_prepareCells: function (lm) {
		var grid = this.grid();
		var rowGroup = this._rowGroup = grid.rowGroup();
		var i;

		var fixed = this.isFixed();
		var rightFixed = this.isRightFixed();
		var start = lm.firstCol(fixed, rightFixed);
		var end = lm.lastCol(fixed, rightFixed);
		var mergeManager = grid.groupFooterMergeManager();
		var merged = mergeManager.count() > 0;

		if (grid.isColumnLayoutChanged()) {
			this.clear();
			this._cells = {};
		}
		this.hideAll();

		for (i = start; i <= end; i++) {
			var room = merged && mergeManager.findRoom(this._level, i);
			this._prepareCell(lm, i, room);
		}
		if (merged) {
			var rooms = mergeManager.getRoomNames(this._level);
			for (var i = 0; i < rooms.length; i++) {
				var room = mergeManager.getRoom(this._level, rooms[i]);
				if (room && ((start > room.base() && start <= room.last()) ||
					         (end   < room.base() && end   >= room.start()))) {
					this._prepareCell(lm, room.base(), room);
				}
			}
		}
	},
	_prepareCell: function(lm, col, room) {
		var grid = this.grid();
		var rowGroup = this._rowGroup;
		var column = lm.getColumn(col);
		var view = _cast(this._cells[column.$_hash], CellElement);

		if (!view) {
			if (column instanceof ColumnGroup) {
				view = new GroupFooterGroupCellElement(this._dom);
			} else {
				view = new GroupFooterCellElement(this._dom);
			}
			this._cells[column.$_hash] = view;
			this.addElement(view);
		}

		view.setVisible(!room || room.base() == col);
		if (column instanceof ValueColumn)
			view.setTextVisible(!room || room.base() == col); 
		var index = CellIndex.temp(grid, this.index(), column);
		var model = rowGroup.getFooterCell(index);
		view.updateCell(model);
	},
	_layoutCells: function (lm) {
		var i;
		var view;	// CellElement
		var r, sr, er;
		var leftPos = this.grid().leftPos();
		var h = this.height();
		var isFixed = this.isFixed();
		var isRightFixed = this.isRightFixed();
		var start = lm.firstCol(isFixed, isRightFixed);
		var end = lm.lastCol(isFixed, isRightFixed);
		var mergeManager = this.grid().groupFooterMergeManager();
		var merged = mergeManager.count() > 0;
		var grid = this.grid();
		var groupedProvider = this.grid()._items._groupedProvider;
		var isExpanded = this._item._parent.isExpanded()
		var footerOnly =  isExpanded ? groupedProvider._expandedAdornments == RowGroupAdornments.SUMMARY : groupedProvider._collapsedAdornments == RowGroupAdornments.FOOTER;
		var hasFixed = lm.fixedColCount() > 0;
		var levelIndent = this._rowGroup.levelIndent();
		var w = (lm.rowGroupLevels() - this._item.level() + 1) * levelIndent;
		var isChangeCellPos = footerOnly && ((hasFixed && isFixed) || !hasFixed) && !isRightFixed;
		for (i = start; i <= end; i++) {
			view = this._cells[lm.getColumn(i).$_hash];
			view._shiftLeft = 0;
			r = lm.columnBounds(i);
			r.height = h;
			if (merged && (room = mergeManager.findRoom(this._level, i))) {
				sr = lm.columnBounds(room.start());
				er = lm.columnBounds(room.last());
				r.width = er.right() - sr.x;
				r.x = sr.x;
				if (isChangeCellPos){
					if (start == room.start()) {
						r.width += w;
						view._shiftLeft = w;
					} else {
						r.x += w;
						view._shiftLeft = w;
					}
				}
			} else {
				if (isChangeCellPos) {
					if (i == start) {
						r.width += w;
						view._shiftLeft = w;
					} else {
						r.x += w;
					}
				}
			}
			if (!isFixed && !isRightFixed) {
				r.x -= leftPos;
			}
			view.setRect(r);
			view.layoutContent(lm);
		}
		if (merged) {
			var rooms = mergeManager.getRoomNames(this._level);
			for (var i = 0; i < rooms.length; i++) {
				var room = mergeManager.getRoom(this._level, rooms[i]);
				if (room && ((start > room.base() && start <= room.last()) ||
					         (end   < room.base() && end   >= room.start()))) {
					sr = lm.columnBounds(room.start());
					r = sr;	
					er = lm.columnBounds(room.last());	
					r.width = er.right() - sr.x;
					if (isChangeCellPos){
						if (start == room.start()) {
							r.width += w;
							view._shiftLeft = w;
						} else {
							r.x += w;
							view._shiftLeft = w;
						}
					}
					r.height = h;
					if (!isFixed && !isRightFixed) {
						r.x -= leftPos;
					}
					view = this._cells[lm.getColumn(room.base()).$_hash];
					view.setRect(r);
					view.layoutContent(lm);	
				}
			}		
		}
	}
});
var RowGroupElement = defineClass("RowGroupElement", VisualObjectElement, {
	init: function(dom, rowGroup) {
		this._super(dom, "rowGroupView", rowGroup);
		this._headElement = new LayerElement(dom, "rowGroupHeadContainer");
		this.addElement(this._headElement);
		this._bodyElement = new LayerElement(dom, "rowGroupBodyContainer", true);
		this.addElement(this._bodyElement);
		this._headerBarElement = new LayerElement(dom, "rowGroupHeaderBarContainer");
		this.addElement(this._headerBarElement);
		this._footerBarElement = new LayerElement(dom, "rowGroupFooterBarContainer");
		this.addElement(this._footerBarElement);
		this._barElement = new LayerElement(dom, "rowGroupBarContainer");
		this.addElement(this._barElement);
		this._footElement = new LayerElement(dom, "rowGroupFootContainer");
		this.addElement(this._footElement);
		this._summaryElement = new LayerElement(dom, "rowGroupSummaryContainer");
		this.addElement(this._summaryElement);
		this._headerBuff = [];			// RowGroupHeaderElement
		this._footerBuff = [];			// RowGroupFooterElement
		this._fixedFooterBuff = [];		// RowGroupFooterElement
		this._rfixedFooterBuff = [];	// RowGroupFooterElement
		this._heads = [];				// RowGroupHeadCellElement
		this._foots = [];				// RowGroupFootCellElement
		this._headerBars = [];			// RowGroupItemBarElement
		this._footerBars = [];			// RowGroupItemBarElement
		this._bars = [];				// RowGroupBarElement
		this._headers = [];				// RowGroupHeaderElement
		this._footers = [];				// RowGroupFooterElement
		this._fixedFooters = [];		// RowGroupFooterElement
		this._rfixedFooters = [];		// RowGroupFooterElement
		this._tmpItems = [];			// IGridItem
		this._headerItems = [];			// GroupItem
		this._footerItems = [];			// GroupFooter
		this._headerViews = [];			// RowGroupHeaderElement
		this._footerViews = [];			// RowGroupFooterElement
		this._fixedFooterViews = [];	// RowGroupFooterElement
		this._rfixedFooterViews = [];	// RowGroupFooterElement
		this._summarys = [];		// RowGroupSummeryCellElement
		this.setWidth(200);
		this.setHeight(200);
	},
	destroy: function() {
		this._destroying = true;
		this._headerBuff = null;
		this._footerBuff = null;
		this._fixedFooterBuff = null;
		this._rfixedFooterBuff = null;
		this._heads = null;
		this._foots = null;
		this._headerBars = null;
		this._footerBars = null;
		this._bars = null;
		this._headers = null;
		this._footers = null;
		this._fixedFooters = null;
		this._rfixedFooters = null;
		this._tmpItems = null;
		this._headerItems = null;
		this._footerItems = null;
		this._headerViews = null;
		this._footerViews = null;
		this._fixedFooterViews = null;
		this._rfixedFooterViews = null;
		this._summarys = null;
		this._super();
	},
	model: function () {
		return this._model;
	},
	levelCount: function() {
		return this.grid().layoutManager().rowGroupLevels();
	},
	barCount: function () {
		return this._bars.length;
	},
	getBar: function (index) {
		_assert(index >= 0 && index < this._bars.length, "rowgroup indicator index is invalid: " + index);
		return this._bars[index];
	},
	clearBody: function () {
		this._headerItems = [];
		this._footerItems = [];
	},
	addHeader: function (model) {
		this._headerItems.push(model);
	},
	addFooter: function (model) {
		this._footerItems.push(model);
	},
	getCellView: function (index, fixed, rightFixed) {
		var i;
		var header;
		var footer;
		var item = index.item();
		var body = this._bodyElement;
		var cnt = body.childCount();
		if (item instanceof GroupItem || item instanceof GroupFooter) {
			for (i = 0; i < cnt; i++) {
				header = _cast(body.getChild(i), RowGroupHeaderElement);
				if (header && header.isVisible() && header.index() == index.I()) {
					return header.cellView();
				}
				footer = _cast(body.getChild(i), RowGroupFooterElement);
				if (footer && footer._fixed == fixed && footer._rightFixed == rightFixed && footer.isVisible() && footer.index() == index.I()) {
					return footer;
				}
			}
		}
		return null;
	},
	isLayer: function () {
		return true;
	},
	isClickable: function () {
		return false;
	},
	_doMeasure: function (grid, hintWidth, hintHeight) {
		this._prepareHeads();
		this._prepareFoots();
		this._prepareSummarys();
		this._prepareBars();
		return new Size(this.levelCount() * grid.rowGroup().levelIndent(), hintHeight);
	},
	_doLayoutContent: function (lm) {
		var i;
		var cnt;
		var itemBar;	// RowGroupItemBarElement
		var header;		// GroupItem
		var r;
		var footer;		// GroupFooter
		var bar;		// RowGroupBarElement
		var grid = this.grid();
		var rowGroup = this.model();
		var levelIndent = rowGroup.levelIndent();
		this._headElement.setBounds(0, 0, this.width(), lm.headerBounds().height);
		this._layoutHeads(lm);
		var h = lm.footerBounds().height;
		this._footElement.setBounds(0, this.height() - h, this.width(), h);
		this._layoutFoots(lm);

		this._summaryElement.setBounds(0, lm.headerBounds().height, this.width(),lm.summaryBounds().height)
		this._layoutSummarys(lm);

		this._layoutBars(lm);
		this._bodyElement.setBounds(0, lm.headerBounds().height + lm.summaryBounds().height, this.width(), 
			this.height() - lm.headerBounds().height - lm.footerBounds().height-lm.summaryBounds().height);
		this._layoutHeaders(lm);
		this._prepareHeaderBars();
		for (i = 0, cnt = this._headerItems.length; i < cnt; i++) {
			itemBar = this._headerBars[i];
			header = this._headerItems[i];
			itemBar.setIndex(header.index());
			r = lm.itemBounds(header.index() - grid.topIndex());
			r.setLeft((header.level() - 1) * levelIndent);
			r.width = levelIndent;
			this._headerBarElement.addElement(itemBar);
			itemBar.setRect(r);
			itemBar.setExpanderVisible(true);
			itemBar.layoutContent(lm);
		}
		this._layoutFooters(lm);
		this._prepareFooterBars();
		for (i = 0, cnt = this._footerItems.length; i < cnt; i++) {
			footer = this._footerItems[i];
			if (footer.displayLevel() <= lm.rowGroupLevels()) {
				itemBar = this._footerBars[i];
				itemBar.setIndex(footer.index());
				r = lm.itemBounds(footer.index() - grid.topIndex());
				r.setLeft((footer.displayLevel() - 1) * levelIndent);
				r.width = footer.isExpandable() ? levelIndent : (lm.rowGroupLevels() - footer.displayLevel() + 1) * levelIndent;
				// footerOnly
				// r.width = levelIndent;
				this._footerBarElement.addElement(itemBar);
				itemBar.setRect(r);
				itemBar.setExpanderVisible(footer.isExpandable());
				itemBar.layoutContent(lm);
			}
		}
		this._prepareBars();
		for (i = 0, cnt = lm.rowGroupLevels(); i < cnt; i++) {
			bar = this._bars[i];
			bar.setBounds(i * levelIndent, 0, levelIndent, this._barElement.height());
			bar.setLevel(i + 1);
			this._barElement.addElement(bar);
			this.$_collectItems(lm, i + 1);
			bar.layoutCells(this._tmpItems, lm);
		}
	},
	_doDraw: function (g) {
		/*
		g.beginFill(0xff0000, 0.5);
		var elt:VisualElement = m_footerElement;
		g.drawRect(elt.x, elt.y, elt.width, elt.height);
		g.endFill();
		*/
	},
	_doDrawHtml: function () {
	},
	_prepareHeads: function () {
		var head;
		var cnt = this.levelCount();
		while (this._heads.length < cnt) {
			head = new RowGroupHeadCellElement(this._dom, "rowGroupHeadCell");
			this._heads.push(head);
		}
		while (this._headElement.childCount() < cnt) {
			this._headElement.addElement(this._heads[this._headElement.childCount()]);
		}
		while (this._headElement.childCount() > cnt) {
			this._headElement.removeChildAt(this._headElement.childCount() - 1);
		}
	},
	_prepareFoots: function () {
		var foot;	// RowGroupFootCellElement
		var cnt = this.levelCount();
		while (this._foots.length < cnt) {
			foot = new RowGroupFootCellElement(this._dom, "rowGroupFootCell");
			this._foots.push(foot);
		}
		while (this._footElement.childCount() < cnt) {
			this._footElement.addElement(this._foots[this._footElement.childCount()]);
		}
		while (this._footElement.childCount() > cnt) {
			this._footElement.removeChildAt(this._footElement.childCount() - 1);
		}
	},
	_prepareSummarys: function () {
		var summary;	// RowGroupSummaryCellElement
		var cnt = this.levelCount();
		while (this._summarys.length < cnt) {
			summary = new RowGroupSummaryCellElement(this._dom, "rowGroupSummaryCell");
			this._summarys.push(summary);
		}
		while (this._summaryElement.childCount() < cnt) {
			this._summaryElement.addElement(this._summarys[this._summaryElement.childCount()]);
		}
		while (this._summaryElement.childCount() > cnt) {
			this._summaryElement.removeChildAt(this._summaryElement.childCount() - 1);
		}
	},
	_prepareHeaderBars: function () {
		var bar;
		this._headerBarElement.clear();
		while (this._headerBars.length < this._headerItems.length) {
			bar = new RowGroupItemBarElement(this._dom, "rowGroupHeaderBar");
			this._headerBars.push(bar);
		}
	},
	_prepareFooterBars: function () {
		var bar;
		this._footerBarElement.clear();
		while (this._footerBars.length < this._footerItems.length) {
			bar = new RowGroupItemBarElement(this._dom, "rowGroupFooterBar");
			this._footerBars.push(bar);
		}
	},
	$_collectItems: function (lm, level) {
		var i;
		var item;
		var grid = this.grid();
		var top = grid.topItem();
		var itemCount = lm.itemCount();
		this._tmpItems.splice(0, this._tmpItems.length);
		i = 0;
		while (i < itemCount) {
			item = grid.getItem(i + top);
			if (item.displayLevel() <= level) {
				this._tmpItems.push(item);
			}
			i++;
		}
	},
	_prepareBars: function () {
		var bar;	// RowGroupBarElement;
		var cnt = this.levelCount();
		this._barElement.clear();
		while (this._bars.length < cnt) {
			bar = new RowGroupBarElement(this._dom, "rowGroupBar");
			this._bars.push(bar);
		}
	},
	$_removeHeaderView: function (view/*RowGroupHeaderElement*/) {
		var idx = this._bodyElement.getChildIndex(view);
		if (idx >= 0) {
			this._bodyElement.removeChildAt(idx);
			view.validate(true);
			this._headerBuff.push(view);
		}
	},
	$_borrowHeaderView: function (header/*GroupItem*/)/*RowGroupHeaderElement*/ {
		var view; // RowGroupHeaderElement;
		if (this._headerBuff.length > 0) {
			view = this._headerBuff.pop();
		} else {
			view = this.grid().delegate().borrowItemView(header, false, false);
		}
		view.recycling = false;
		return view;
	},
	_layoutHeaders: function (lm) {
		var i;
		var view;	// RowGroupHeaderElement;
		var header;	// GroupItem;
		var dirty;
		var r;
		var w;
		var grid = this.grid();
		var rowGroup = this.model();
		var levelIndent = rowGroup.levelIndent();
		var cnt = this._headerViews.length;
		for (i = 0; i < cnt; i++) {
			this._headerViews[i].recycling = false;
		}
		while (cnt < this._headerItems.length) {
			view = this.$_borrowHeaderView(this._headerItems[cnt++]);
			this._bodyElement.addElement(view);
			this._headerViews.push(view);
		}
		while (cnt > this._headerItems.length) {
			this.$_removeHeaderView(this._headerViews[--cnt]);
			this._headerViews.pop();
		}
		for (i = 0; i < cnt; i++) {
			header = this._headerItems[i];
			view = this._headerViews[i];
			dirty = (view.item !== header);
			view.updateElement(header, rowGroup.headerStyles());
			r = lm.itemBounds(header.index() - grid.topIndex());
			w = header.level() * levelIndent;
			r.setLeft(w);
			r.width = this.width() - w - grid.leftPos();
			view.setRect(r);
			if (dirty || !view.recycling) {
				view.layoutContent(lm);
			}
		}
	},
	$_removeFooterView: function (view/*RowGroupFooterElement*/) {
		var idx = this._bodyElement.getChildIndex(view);
		if (idx >= 0) {
			this._bodyElement.removeChildAt(idx);
			view.validate(true);
			this._footerBuff.push(view);
		}
	},
	$_removeFixedFooterView: function (view/*RowGroupFooterElement*/) {
		var idx = this._bodyElement.getChildIndex(view);
		if (idx >= 0) {
			this._bodyElement.removeChildAt(idx);
			view.validate(true);
			this._fixedFooterBuff.push(view);
		}
	},
	$_removeRightFixedFooterView: function (view/*RowGroupFooterElement*/) {
		var idx = this._bodyElement.getChildIndex(view);
		if (idx >= 0) {
			this._bodyElement.removeChildAt(idx);
			view.validate(true);
			this._rfixedFooterBuff.push(view);
		}
	},
	$_borrowFooterView: function (footer/*GroupFooter*/) {
		var view;
		if (this._footerBuff.length > 0) {
			view = this._footerBuff.pop();
		} else {
			view = this.grid().delegate().borrowItemView(footer, false, false);
		}
		view.recycling = false;
		return view;
	},
	$_borrowFixedFooterView: function (footer/*GroupFooter*/) {
		var view; // RowGroupFooterElement
		if (this._fixedFooterBuff.length > 0) {
			view = this._fixedFooterBuff.pop();
		} else {
			view = this.grid().delegate().borrowItemView(footer, true, false);
		}
		view.recycling = false;
		return view;
	},
	$_borrowRightFixedFooterView: function (footer/*GroupFooter*/) {
		var view; // RowGroupFooterElement
		if (this._rfixedFooterBuff.length > 0) {
			view = this._rfixedFooterBuff.pop();
		} else {
			view = this.grid().delegate().borrowItemView(footer, true, true);
		}
		view.recycling = false;
		return view;
	},
	_layoutFooters: function (lm) {
		var grid = this.grid();
		var width = this.width();
		var rowGroup = this.model();
		var levelIndent = rowGroup.levelIndent();
		var fixCount = lm.fixedColCount();
		var rfixCount = lm.rfixedColCount();
		var hasFixed = fixCount > 0;
		var hasRightFixed = rfixCount > 0;
		var levelCount = this.levelCount();
		var cnt, i, view, footer, dirty, r, w;
		var cellMerge = grid.rowGroup().isFooterCellMerge();
		var groupedProvider = grid._items._groupedProvider;
		var footerOnly;

		cnt = this._footerViews.length;
		for (i = 0; i < cnt; i++) {
			this._footerViews[i].recycling = false;
		}
        while (cnt < this._footerItems.length) {
            view = this.$_borrowFooterView(this._footerItems[cnt]);
            this._bodyElement.addElement(view);
            this._footerViews.push(view);
            cnt++;
        }
        while (cnt > this._footerItems.length) {
            cnt--;
            this.$_removeFooterView(this._footerViews[cnt]);
            this._footerViews.pop();
        }
        for (i = 0; i < cnt; i++) {
            footer = this._footerItems[i];
            footerOnly = (footer._parent.isExpanded() ? groupedProvider._expandedAdornments == RowGroupAdornments.SUMMARY : groupedProvider._collapsedAdornments == RowGroupAdornments.FOOTER) && !hasFixed;
            // var footerFirst = footerOnly && footer._parent.isExpanded() && !hasFixed;
            view = this._footerViews[i];
            view._fixed = false;
            dirty = (view.item !== footer);
            view.updateElement(footer, rowGroup.footerStyles());
            r = lm.itemBounds(footer.index() - grid.topIndex());
            w = footerOnly ? (footer.level() - 1) * levelIndent : lm.rowGroupLevels() * levelIndent + lm.fixedWidth();
            r.setLeft(w);
            r.width = footerOnly ? width - w - grid.leftPos() + (footer.level() - 2) * levelIndent : width - w - grid.leftPos();
            view.setRect(r);
            if (dirty || !view.recycling) {
                view.layoutContent(lm);
            }
        }
		// if (hasFixed) {
			cnt = this._fixedFooterViews.length;
			for (i = 0; i < cnt; i++) {
				this._fixedFooterViews[i].recycling = false;
			}
            while (cnt < this._footerItems.length) {
                view = this.$_borrowFixedFooterView(this._footerItems[cnt]);
                this._bodyElement.addElement(view);
                this._fixedFooterViews.push(view);
                cnt++;
            }
            while (cnt > this._footerItems.length) {
                cnt--;
                this.$_removeFixedFooterView(this._fixedFooterViews[cnt]);
                this._fixedFooterViews.pop();
            }
            for (i = 0; i < cnt; i++) {
                footer = this._footerItems[i];
                footerOnly = (footer._parent.isExpanded() ? groupedProvider._expandedAdornments == RowGroupAdornments.SUMMARY : groupedProvider._collapsedAdornments == RowGroupAdornments.FOOTER) && hasFixed;
                view = this._fixedFooterViews[i];
                view._fixed = true;
                dirty = (view.item !== footer);
                view.updateElement(footer, rowGroup.footerStyles());
                r = lm.itemBounds(footer.index() - grid.topIndex());
                w = footerOnly ? (footer.level()-1) * levelIndent : lm.rowGroupLevels() * levelIndent;
                r.setLeft(w);
                r.width = footerOnly ? lm.fixedWidth() - grid.fixedOptions().colBarWidth() + (lm.rowGroupLevels() - footer.level()+1) * levelIndent :lm.fixedWidth() - grid.fixedOptions().colBarWidth();
                view.setRect(r);
                if (dirty || !view.recycling) {
                    view.layoutContent(lm);
                }
            }
		// }
		// if (hasRightFixed) {
			cnt = this._rfixedFooterViews.length;
			for (i = 0; i < cnt; i++) {
				this._rfixedFooterViews[i].recycling = false;
			}
            while (cnt < this._footerItems.length) {
                view = this.$_borrowRightFixedFooterView(this._footerItems[cnt]);
                this._bodyElement.addElement(view);
                this._rfixedFooterViews.push(view);
                cnt++;
            }
            while (cnt > this._footerItems.length) {
                cnt--;
                this.$_removeRightFixedFooterView(this._rfixedFooterViews[cnt]);
                this._rfixedFooterViews.pop();
            }
            var wbar = grid.fixedOptions().colBarWidth()
            for (i = 0; i < cnt; i++) {
                footer = this._footerItems[i];
                view = this._rfixedFooterViews[i];
                view._fixed = true;
                view._rightFixed = true;
                dirty = (view.item !== footer);
                view.updateElement(footer, rowGroup.footerStyles());
                r = lm.itemBounds(footer.index() - grid.topIndex());
                w = lm.rfixedLeft()-this._x;
                r.setLeft(w);
                r.width = lm.rfixedWidth();// - wbar;
                view.setRect(r);
                if (dirty || !view.recycling) {
                    view.layoutContent(lm);
                }
            }
		// }
	},
	_layoutHeads: function (lm) {
		var grid = this.grid();
		var x = 0;
		var w = grid.rowGroup().levelIndent();
		var h = lm.headerBounds().height;
		for (var i = 0, cnt = this._headElement.childCount(); i < cnt; i++) {
			var head = this._heads[i]; // RowGroupHeadCellElement;
			head.setBounds(x, 0, w, h);
			x += w;
			var model = grid.rowGroup().getHeadCell(i + 1);
			head.updateCell(model);
			head.layoutContent(lm);
		}
	},
	_layoutFoots: function (lm) {
		var grid = this.grid();
		var rowGroup = grid.rowGroup();
		var x = 0;
		var w = rowGroup.levelIndent();
		var h = lm.footerBounds().height;
		for (var i = 0,cnt = this._footElement.childCount(); i < cnt; i++) {
			var foot = this._foots[i]; // RowGroupFootCellElement;
			foot.setBounds(x, 0, w, h);
			x += w;
			var model = rowGroup.getFootCell(i + 1);
			foot.updateCell(model);
			foot.layoutContent(lm);
		}
	},
	_layoutSummarys: function (lm) {
		var grid = this.grid();
		var rowGroup = grid.rowGroup();
		var x = 0;
		var w = rowGroup.levelIndent();
		var h = lm.summaryBounds().height;
		for (var i = 0,cnt = this._summaryElement.childCount(); i < cnt; i++) {
			var summary = this._summarys[i]; // RowGroupSummaryCellElement;
			summary.setBounds(x, 0, w, h);
			x += w;
			var model = rowGroup.getSummaryCell(i + 1);
			summary.updateCell(model);
			summary.layoutContent(lm);
		}
	},
	_layoutBars: function (lm) {
		var y = lm.headerBounds().height + lm.summaryBounds().height;
		var w = this.grid().rowGroup().levelIndent() * lm.rowGroupLevels();
		var h = lm.indicatorBounds().height;
		this._barElement.setBounds(0, y, w, h);
		this._headerBarElement.setBounds(0, y, w, h);
		this._footerBarElement.setBounds(0, y, w, h);
	}
});