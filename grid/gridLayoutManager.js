var $$_FONT_HEIGHT_EX = 3;
var /* @internal */ HeightMeasurer = defineClass("HeightMeasurer", null, {
	init : function() {
		this._super();
		this._itemHeight = 0;
		this._headerHeight = 0;
		this._footerHeight = 0;
        this._summaryHeight = 0;
	},
	destroy: function() {
		return false;
	},
    itemHeight: function () { return this._itemHeight; },
    headerHeight: function () { return this._headerHeight; },
    footerHeight: function () { return this._footerHeight; },
    summaryHeight: function () { return this._summaryHeight; },
    calculate: function (grid, body, header, footer, summary) {
    },
	_calcItemLine: function (grid) {
		var styles = grid.body().styles();
		var h = styles.fontSize() + $$_FONT_HEIGHT_EX;
		var indicator = grid.indicator();
		var statebar = grid.stateBar();
		if (indicator.isVisible()) {
			h = Math.max(h, indicator.styles().fontSize() + $$_FONT_HEIGHT_EX);
		}
		if (statebar.isVisible()) {
			h = Math.max(h, statebar.styles().fontSize() + $$_FONT_HEIGHT_EX);
		}
		h = h + Math.max(1, styles.borderTopWidth()) + Math.max(1, styles.borderBottomWidth()) +
			Math.max(1, styles.paddingTop()) + Math.max(1, styles.paddingBottom());
		return _int(h);
	},
	_calcHeaderLine: function (grid) {
		var styles = grid.header().styles();
		var h = styles.fontSize() + $$_FONT_HEIGHT_EX;
		h = h + Math.max(1, styles.borderTopWidth()) + Math.max(1, styles.borderBottomWidth()) +
			Math.max(1, styles.paddingTop()) + Math.max(1, styles.paddingBottom());
		return _int(h);
	},
	_calcFooterLine: function (grid) {
		var styles = grid.footer().styles();
		var h = styles.fontSize() + $$_FONT_HEIGHT_EX;
		h = h + Math.max(1, styles.borderTopWidth()) + Math.max(1, styles.borderBottomWidth()) +
			Math.max(1, styles.paddingTop()) + Math.max(1, styles.paddingBottom());
		return _int(h);
	},
    _calcSummaryLine: function (grid) {
        var styles = grid.header().summary().styles();
        var h = styles.fontSize() + $$_FONT_HEIGHT_EX;
        h = h + Math.max(1, styles.borderTopWidth()) + Math.max(1, styles.borderBottomWidth()) +
        Math.max(1, styles.paddingTop()) + Math.max(1, styles.paddingBottom());
        return _int(h);
    },
	_setMeasuredHeight: function (column, value) {
		column._measuredHeight = value;
	},
	_getRootColumn: function (grid) {
		return grid._rootGroup();
	}
});
var /* @internal */ SimpleHeightsMeasurer = defineClass("SimpleHeightsMeasurer", HeightMeasurer, {
	init : function() {
		this._super();
	},
	calculate: function (grid, body, header, footer, summary) {
		grid.calcGroupLevels();
		this._itemHeight = body ? this.$_calcItemHeights(grid, grid.getDataLevel()) : 0;
		this._headerHeight = header ? this.$_calcHeaderHeights(grid, grid.getHeaderLevel()) : 0;
		this._footerHeight = footer ? this.$_calcFooterHeights(grid, grid.getDataLevel()) : 0;
        this._summaryHeight = summary ? this.$_calcSummaryHeights(grid, grid.getDataLevel()) : 0;
	},
	$_arrangeItemHeights: function (group, hConst) {
		var i, h, column;
		var	total = 0;
		var cnt = group.visibleCount();
		if (group.isVertical()) {
			var hLevel = _int(hConst / group.dataLevel());
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				if (i == cnt - 1) {
					h = Math.max(0, hConst - total);
				} else if (column instanceof ColumnGroup) {
					h = hLevel * column.dataLevel();
					total += h;
				} else {
					h = hLevel;
					total += h;
				}
				this._setMeasuredHeight(column, h);
				if (column instanceof ColumnGroup) {
					this.$_arrangeItemHeights(column, h);
				}
			}
		} else {
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				this._setMeasuredHeight(column, hConst);
				if (column instanceof ColumnGroup) {
					this.$_arrangeItemHeights(column, hConst);
				}
			}
		}
	},
	$_calcItemHeights: function (grid, levels) {
		var h;
		var options = grid.displayOptions();
		var hItem = _int(options.rowHeight());
		if (hItem <= 0) {
			h = this._calcItemLine(grid);
			hItem = levels * h;
		}
		hItem = _int(Math.max(options.minRowHeight(), hItem));
		if ((h = options.maxRowHeight()) > 0 && hItem > h) {
			hItem = h;
		}
		var root = this._getRootColumn(grid);
		this.$_arrangeItemHeights(root, hItem);
		return hItem;
	},
	$_calcHeaderHeights: function (grid, levels) {
		var h;
		var header = grid.header();
		var hItem = _int(header.height());
		if (hItem <= 0) {
			h = this._calcHeaderLine(grid);
			hItem = levels * h;
		}
		hItem = _int(Math.max(header.minHeight(), hItem));
		return hItem;
	},
	$_calcFooterHeights: function (grid, levels) {
		var footer = grid.footer();
		var hItem = _int(footer.height());
		if (hItem <= 0) {
			hItem = levels * this._calcFooterLine(grid);
		}
		hItem = _int(Math.max(footer.minHeight(), hItem));
		return hItem;
	},
    $_calcSummaryHeights: function (grid, levels) {
        var summary = grid.header().summary();
        var hItem = _int(summary.height());
        if (hItem <= 0) {
            hItem = levels * this._calcSummaryLine(grid);
        }
        hItem = _int(Math.max(summary.minHeight(), hItem));
        return hItem;
    }
});
SimpleHeightsMeasurer.Default = new SimpleHeightsMeasurer();
var /* @internal */ FixedHeightsMeasurer = defineClass("FixedHeightsMeasurer", HeightMeasurer, {
	init : function() {
		this._super();
	},
	calculate: function (grid, body, header, footer) {
		this._itemHeight = body ? this.$_calcItemHeights(grid) : 0;
		if (header || footer) {
			grid.calcGroupLevels();
			if (header) {
				this._headerHeight = header ? this.$_calcHeaderHeights(grid, grid.getHeaderLevel()) : 0;
			}
			if (footer) {
				this._footerHeight = footer ? this.$_calcFooterHeights(grid, grid.getDataLevel()) : 0;
			}
		}
	},
	$_checkHeight: function (group, hLine) {
		var cnt = group.visibleCount();
		for (var i = 0; i < cnt; i++) {
			var column = group.getVisibleItem(i);
			column._value = column.height() > 0 ? column.height() : hLine;
			if (column instanceof ColumnGroup) {
				this.$_checkHeight(column, hLine);
			}
		}
	},
	/**
	 * 밑에서 위로
	 */
	$_calcGroupHeight: function (group) {
		var i, column;
		var h = 0;
		var cnt = group.visibleCount();
		if (group.isVertical()) {
			for (var i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				if (column instanceof ColumnGroup) {
					h += this.$_calcGroupHeight(column);
				} else {
					h += column._value;
				}
			}
		} else {
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				if (column instanceof ColumnGroup) {
					h = Math.max(h, this.$_calcGroupHeight(column));
				} else {
					h = Math.max(h, column._value);
				}
			}
		}
		group._sum = h;
		return h;
	},
	/**
	 * 위에서 아래로
	 */
	$_arrangeHeights: function (group, hConst) {
		var i, h, column, hFill;
		var cnt = group.visibleCount();
		if (group.isVertical()) {
			var total = 0;
			if (group._sum > hConst) {
				for (i = 0; i < cnt; i++) {
					var column = group.getVisibleItem(i);
					if (i < cnt - 1) {
						h = _int(hConst * column._value / group._sum);
						total += h;
					} else {
						h = Math.max(0, hConst - total);
					}
					this._setMeasuredHeight(column, h);
					if (column instanceof ColumnGroup) {
						this.$_arrangeHeights(column, h);
					}
				}
			} else if (group._sum < hConst) {
				var fillSum = 0;
				for (i = 0; i < cnt; i++) {
					column = group.getVisibleItem(i);
					if ((hFill = column.fillHeight()) > 0) {
						fillSum += hFill;
					}
				}
				if (fillSum > 0) {
					var surplus = hConst - group._sum;
					for (i = 0; i < cnt; i++) {
						column = group.getVisibleItem(i);
						if (i < cnt - 1) {
							h = column._value;
							if ((hFill = column.fillHeight()) > 0) {
								h += _int(surplus * hFill / fillSum);
							}
							total += h;
						} else {
							h = Math.max(0, hConst - total);
						}
						this._setMeasuredHeight(column, h);
						if (column instanceof ColumnGroup) {
							this.$_arrangeHeights(column, h);
						}
					}
				} else {
					for (i = 0; i < cnt; i++) {
						column = group.getVisibleItem(i);
						if (i < cnt - 1) {
							h = _int(hConst * column._value / group._sum);
							total += h;
						} else {
							h = Math.max(0, hConst - total);
						}
						this._setMeasuredHeight(column, h);
						if (column instanceof ColumnGroup) {
							this.$_arrangeHeights(column, h);
						}
					}
				}
			} else {
				for (i = 0; i < cnt; i++) {
					column = group.getVisibleItem(i);
					if (i < cnt - 1) {
						h = column._value;
						total += h;
					} else {
						h = Math.max(0, hConst - total);
					}
					this._setMeasuredHeight(column, h);
					if (column instanceof ColumnGroup) {
						this.$_arrangeHeights(column, column._value);
					}
				}
			}
		}
		else {
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				this._setMeasuredHeight(column, hConst);
				if (column instanceof ColumnGroup) {
					this.$_arrangeHeights(column, hConst);
				}
			}
		}
	},
	$_calcItemHeights: function (grid, levels) {
		var hLine = this._calcItemLine(grid);
		var root = this._getRootColumn(grid);
		this.$_checkHeight(root, hLine);
		var options = grid.displayOptions();
		var hItem = this.$_calcGroupHeight(root);
		var h = _int(options.rowHeight());
		if (h > 0) {
			hItem = h;
		}
		hItem = _int(Math.max(hItem, options.minRowHeight()));
		if ((h = _int(options.maxRowHeight())) > 0 && hItem > h) {
			hItem = h;
		}
		this.$_arrangeHeights(root, hItem);
		return hItem;
	},
	$_calcHeaderHeights: function (grid, levels) {
		var header = grid.header();
		var hItem = _int(header.height());
		if (hItem <= 0) {
			var h = this._calcHeaderLine(grid);
			hItem = levels * h;
		}
		hItem = _int(Math.max(header.minHeight(), hItem));
		return hItem;
	},
	$_calcFooterHeights: function (grid, levels) {
		var footer = grid.footer();
		var hItem = _int(footer.height());
		if (hItem <= 0) {
			var h = this._calcFooterLine(grid);
			hItem = levels * h;
		}
		hItem = _int(Math.max(footer.minHeight(), hItem));
		return hItem;
	}
});
FixedHeightsMeasurer.Default = new FixedHeightsMeasurer();
var LM_RECT = new Rectangle();
var GridLayoutManager = defineClass("GridLayoutManager", null, {
	init: function (grid) {
		this._super();
		this._grid = grid;
        this._options = null;
		this._items = null;
		this._panelBounds = null;
		this._indicatorBounds = null;
		this._stateBarBounds = null;
		this._checkBarBounds = null;
		this._rowGroupBounds = null;
		this._rowGroupBarWidth = 0;
		this._fixedBounds = null;
		this._nonfixedBounds = null;
		this._headerBounds = null;
		this._fixedHeaderBounds = null;
        this._summaryBounds = null;
        this._fixedSummaryBounds = null;
		this._editBarBounds = null;
		this._footerBounds = null;
		this._fixedFooterBounds = null;
		this._bodyBounds = null;
		this._gridBounds = null;
		this._scrollBounds = null;
		this._columnGrouped = false;
		this._columnCount = 0;
		this._columns = [];
		this._fixedColumnPoints = [];
		this._rfixedColumnPoints = [];
		this._columnPoints = [];
		this._fixedItemCount = 0;
		this._itemCount = 0;
		this._fullItemCount = 0;
		this._availableItemCount = 0;
		this._fixedItemPoints = [];
		this._itemPoints = [];
		this._itemHeights = {};
		this._fixedCols = 0;
		this._rfixedCols = 0;
		this._fixedRows = 0;
		this._fixedWidth = 0;
		this._fixedHeight = 0;
		this._rfixedWidth = 0;
		this._focusIndex = null;
		this._columnFitted = false;
		this._columnsLength = 0;
		this._prevFirst = 0;
		this._prevLast = 0;
		this._firstCol = 0;
		this._lastCol = 0;
		this._clientRect = null;
		this._leftPos = 0;
		this._topIndex = 0;
		this._hscrollBar = false;
		this._vscrollBar = false;
		this._heightMeasurer = null;
		this._columnMerged = false;
	},
	destroy: function() {
		this._destroying = true;
		this._columns = null;
		this._fixedColumnPoints = null;
		this._rfixedColumnPoints = null;
		this._columnPoints = null;
		this._fixedItemPoints = null;
		this._itemPoints = null;
		this._itemHeights = null;
		this._grid = null;
		this._topIndex = null;
		this._leftPos = null;
		this._super();
	},
	heightMeasurer: null,
	grid: function () {
		return this._grid;
	},
	isColumnGrouped: function () {
		return this._columnGrouped;
	},
	isColumnMerged: function () {
		return this._columnMerged;
	},
	itemCount: function () {
		return this._itemCount;
	},
	fullItemCount: function () {
		return this._fullItemCount;
	},
	columnCount: function () {
		return this._columnCount;
	},
	isHscrollBar: function () {
		return this._hscrollBar;
	},
	isVscrollBar: function () {
		return this._vscrollBar;
	},
	columnsLength: function () {
		return this._columnsLength;
	},
	topIndex: function () {
		return this._topIndex;
	},
	leftPos: function () {
		return this._leftPos;
	},
	prevFirst: function (fixed, rfixed) {
		return fixed ? rfixed ? this.rfixedStartCol() : 0 : this._prevFirst;
	},
	prevLast: function (fixed, rfixed) {
		return fixed ? rfixed ? this._columnCount - 1 : this._fixedCols - 1 : this._prevLast;
	},
	firstCol: function (fixed, rfixed) {
		return fixed ? rfixed ? this.rfixedStartCol() : 0 : this._firstCol;
	},
	lastCol: function (fixed, rfixed) {
		return fixed ? rfixed ? this._columnCount - 1 : this._fixedCols - 1 : this._lastCol;
	},
	fixedItemCount: function () {
		return this._fixedItemCount;
	},
	fixedColCount: function () {
		return this._fixedCols;
	},
	rfixedColCount: function () {
		return this._rfixedCols;
	},
	rfixedStartCol: function () {
		return this._columnCount - this._rfixedCols;
	},
	fixedRowCount: function () {
		return this._fixedRows;
	},
	isRowGrouped: function () {
		return false;
	},
	rowGroupLevels: function () {
		return 0;
	},
	isColumnMerged: function () {
		return this._columnMerged;
	},
	panelBounds: function () {
		return this._panelBounds.clone();
	},
	indicatorBounds: function () {
		return this._indicatorBounds.clone();
	},
	stateBarBounds: function () {
		return this._stateBarBounds.clone();
	},
	checkBarBounds: function () {
		return this._checkBarBounds.clone();
	},
	rowGroupBounds: function () {
		return this._rowGroupBounds.clone();
	},
	headerBounds: function () {
		return this._headerBounds.clone();
	},
    fixedHeaderBounds: function () {
        return this._fixedHeaderBounds.clone();
    },
    summaryBounds: function () {
        return this._summaryBounds.clone();
    },
    fixedSummaryBounds: function () {
        return this._fixedSummaryBounds.clone();
    },
	editorBounds: function () {
		return this._editorBounds.clone();
	},
	footerBounds: function () {
		return this._footerBounds.clone();
	},
    fixedFooterBounds: function () {
        return this._fixedFooterBounds.clone();
    },
	fixedBounds: function () {
		return this._fixedBounds.clone();
	},
	rfixedBounds: function () {
		return this._rfixedBounds.clone();
	},
	nonfixedBounds: function () {
		return this._nonfixedBounds.clone();
	},
	bodyBounds: function () {
		return this._bodyBounds.clone();
	},
	gridBounds: function () {
		return this._gridBounds.clone();
	},
	clientRect: function () {
		return this._clientRect.clone();
	},
	fixedWidth: function () {
		return this._fixedWidth;
	},
	rfixedLeft: function () {
		return this._rfixedBounds.x;
	},
	rfixedWidth: function () {
		return this._rfixedWidth;
	},
	fixedHeight: function () {
		return this._fixedHeight;
	},
	setHeightMeasurer: function (value) {
		this._heightMeasurer = value;
	},
	cellIsVisible: function (index) {
		var i = index.I();
		var fixed = this._fixedItemCount;
		if (i >= fixed) {
			if (i < this._topIndex + fixed) {
				return false;
			}
			if (this._fullItemCount == 0 && i == this._topIndex + fixed) {
				return true;
			}
			if (i >= this._topIndex + fixed + this._fullItemCount) {
				return false;
			}
		}
		var x;
		var column = index.column();
		if (!column) {
			if ($_debug) debugger;
		}
		var root = column.root();
		var c = root.displayIndex();
		fixed = this._fixedCols;
		if (c >= fixed) {
			x = this.columnBounds(c).x;
			while (column != root) {
				x += column.displayOffset();
				column = column.parent();
			}
			if (x < this._leftPos) {
				return false;
			}
			if (x + index.column().displayWidth() - this._leftPos > this._nonfixedBounds.width) {
				return false;
			}
		}
		return true;
	},
	makeCellVisible: function (index) {
		this._focusIndex = index.clone();
	},
	getColumn: function (index) {
		return this._columns[index];
	},
	getColumnBounds: function (index) {
        return this.columnBounds(index);
	},
    columnBounds: function (index) {
        var r, i;
        var rfixedCol = this.rfixedStartCol();
        if (index < this._fixedCols) {
            r = new Rectangle(this._fixedColumnPoints[index], 0, this._fixedColumnPoints[index + 1] - this._fixedColumnPoints[index], 0);
        } else if (index >= rfixedCol) {
        	r = new Rectangle(this._rfixedColumnPoints[index-rfixedCol], 0, this._rfixedColumnPoints[index - rfixedCol + 1] - this._rfixedColumnPoints[index-rfixedCol], 0);
        	r.offset(this._grid.fixedOptions().colBarWidth(),0);
        } else {
            i = index - this._fixedCols;
            r = new Rectangle(this._columnPoints[i], 0, this._columnPoints[i + 1] - this._columnPoints[i], 0);
        }
        return r;
    },
    getDataColumnBounds: function (column) {
        return this.dataColumnBounds(column);
    },
    dataColumnBounds: function (column) {
		var root = column.root();
		var	dataRoot = column.dataRoot();
		var	r = this.columnBounds(root.displayIndex());
		if (dataRoot !== root) {
			r.x += column.$_getOffset(dataRoot);
			r.width = !isNaN(dataRoot._fitWidth) ? _int(dataRoot._fitWidth) : dataRoot.groupWidth();
		}
		return r;
	},
	yU: function () {
		return this._grid._feedbackLayer;
	},
	getColumnRect: function (index) {
		return this.columnRect(index);
	},
	columnRect: function (index) {
		var sx, i, r;
		var rfixedCol = this.rfixedStartCol();
		if (index < this._fixedCols) {
			sx = this._gridBounds.x; 
			i = index;
			r = new Rectangle(this._fixedColumnPoints[i] + sx, 0, this._fixedColumnPoints[i + 1] - this._fixedColumnPoints[i], 0);
		} else if (index >= rfixedCol) {
			sx = this._rfixedBounds.x + this._grid.fixedOptions().colBarWidth(); 
			i = index - rfixedCol;
			r = new Rectangle(this._rfixedColumnPoints[i] + sx, 0, this._rfixedColumnPoints[i + 1] - this._rfixedColumnPoints[i], 0);
		} else {
			sx = this._bodyBounds.x; //this._fixedCols > 0 ? this._bodyBounds.x - this._leftPos : this._bodyBounds.x; // fixed Column이 존재하면 _bodyBounds에 _leftPos를 빼지 않는다.
			i = index - this._fixedCols;
			r = new Rectangle(this._columnPoints[i] + sx, 0, this._columnPoints[i + 1] - this._columnPoints[i], 0);
		}
		return r;
	},
	getDataColumnRect: function (column) {
        return this.dataColumnRect(column);
    },
    dataColumnRect: function (column) {
		var root = column.root();
		var	dataRoot = column.dataRoot();
		var	r = this.columnBounds(root.displayIndex());
		if (dataRoot !== root) {
			r.leftBy(column.$_getOffset(dataRoot));
			r.width = dataRoot.groupWidth();
		}
		return r;
	},
	dataRootBounds: function (column) {
		var root = column.root();
		var dataRoot = column.dataRoot();
		var r = this.columnBounds(root.displayIndex());
		if (dataRoot != root) {
			this._getColumnRectInRoot(dataRoot, LM_RECT);
			r.leftBy(LM_RECT.x);
			r.setWidth(dataRoot.displayWidth());
		}
		return r;
	},
	dataRootRect: function (column) {
		var root = column.root();
		var dataRoot = column.dataRoot();
		var r = this.columnRect(root.displayIndex());
		if (dataRoot != root) {
			var p = column.parent();
			var offset = column.displayOffset();
			while(p) {
				var pOffset = p.displayOffset();
				offset += isNaN(pOffset) ? 0 : pOffset;
				p = p.parent();
				if (p instanceof RootColumn) break;
			}
			r.setLeft(r.x + offset);
			r.width = dataRoot.displayWidth();
		}
		return r;
	},
	itemBounds: function (index, fixed, rfixed) {
		var r = rfixed ? this._rfixedBounds : fixed ? this._fixedBounds : this._bodyBounds;
		if (index < this._fixedItemCount) {
			return new Rectangle(0, this._fixedItemPoints[index], r.width, this._fixedItemPoints[index + 1] - this._fixedItemPoints[index]);
		} else {
			return new Rectangle(0, this._itemPoints[index - this._fixedItemCount], r.width, this._itemPoints[index - this._fixedItemCount + 1] - this._itemPoints[index - this._fixedItemCount]);
		}
	},
	getItemBounds: function (index, fixed) {
		return this.itemBounds(index, fixed);
	},
	itemRect: function (index, fixed) {
		var r = fixed ? this._fixedBounds : this._bodyBounds;
		var sy = r.y;
		if (index < this._fixedItemCount) {
			return new Rectangle(0, this._fixedItemPoints[index] + sy, r.width, this._fixedItemPoints[index + 1] - this._fixedItemPoints[index]);
		} else {
			return new Rectangle(0, this._itemPoints[index - this._fixedItemCount] + sy, r.width, this._itemPoints[index - this._fixedItemCount + 1] - this._itemPoints[index - this._fixedItemCount]);
		}
	},
	getItemRect: function (index, fixed) {
		return this.itemRect(index, fixed);
	},
	dataCellRect: function (index) {
		var grid = this._grid;
		if (!grid.isValid(index) || this._fixedItemCount + this._itemCount < 1) {
			return new Rectangle();
		}
		var column = index.C(),
			root = column.group() ? column.root() : index.C(),
			r = this.columnRect(root.displayIndex()),
			rc = null,
			row;
		if (index.I() < this._fixedItemCount) {
			rc = this.getItemBounds(index.I());
			r.y = rc.y + this._bodyBounds.y;
			r.height = rc.height;
		} else {
			row = index.I() - grid.topIndex();
			if (row < 0 || row >= this._itemCount + this._fixedItemCount) {
				r.y = this.getItemBounds(0).y + this._bodyBounds.y;
				r.height = 0;
			} else {
				rc = this.getItemBounds(row);
				r.y = rc.y + this._bodyBounds.y;
				r.height = rc.height;
			}
		}
		if (column !== root) {
			if (!rc) {
				rc = new Rectangle();
			}
			this._getColumnRectInRoot(column, rc);
			rc.offset(r.x, r.y);
			r.copy(rc);
		}
		return r;
	},
	mouseToIndex: function (x, y, index) {
		index.itemIndex(-1);
		index.column(null);
		if (this._columnCount < 1) {
			return;
		}
		var i,
			r = -1,
			grid = this.grid(),
			h = this._summaryBounds.bottom();
		if (y >= h && y < this._footerBounds.y) {
			for (i = 0; i < this._fixedItemCount; i++) {
				if (y >= h + this._fixedItemPoints[i] && y < h + this._fixedItemPoints[i + 1]) {
					r = i;
					y -= h + this._fixedItemPoints[i];
					break;
				}
			}
			if (r < 0 && this._itemCount > 0) {
				for (i = 0; i < this._itemCount; i++) {
					if (y >= h + this._itemPoints[i] && y < h + this._itemPoints[i + 1]) {
						r = i;
						y -= h + this._itemPoints[i];
						break;
					}
				}
				if (r >= 0) {
					r += grid.topItem();
				}
			}
		} else if (y >= this._footerBounds.y) { // footer
			r = -2;
		} else if (y < this._headerBounds.y) { // panel
			r = -3;
		}
		index.itemIndex(r);
		var c = -1,
			w = this._gridBounds.x;
		if (x >= w && x <= this._clientRect.width) {
			x = x - w;
			for (i = 0; i < this._fixedCols; i++) {
				if (x >= this._fixedColumnPoints[i] && x < this._fixedColumnPoints[i + 1]) {
					c = i;
					x -= this._fixedColumnPoints[i];
					break;
				}
			}
			if (c < 0 && this._rfixedCols > 0) {
				var rx = x - this._rfixedBounds.x + this._grid.fixedOptions().colBarWidth() + w;
				for (i = 0; i < this._rfixedCols; i++) {
					if (rx >= this._rfixedColumnPoints[i] && rx < this._rfixedColumnPoints[i+1]) {
						c = i + this.rfixedStartCol();
						x = rx -= this._rfixedColumnPoints[i];
						break;
					}
				}
			}
			if (c < 0) {
				x = x - this._fixedWidth + this._leftPos;
				for (i = this._firstCol; i <= this._lastCol; i++) {
					if (x >= this._columnPoints[i - this._fixedCols] && x < this._columnPoints[i - this._fixedCols + 1]) {
						c = i;
						x -= this._columnPoints[i - this._fixedCols];
						break;
					}
				}
			}
		}
		if (c >= 0 && c < grid.visibleColumnCount()) {
			index.column(grid.getVisibleColumn(c));
			var root = _cast(index.column().root(), ColumnGroup);
			if (root) {
				index.column(root.columnAtPoint(x, y));
			}
		} else {
			index.column(null);
			index.itemIndex(-1);
		}
        return index;
	},
	mouseToIndexEx: function (x, y, index) {
		if (this._columnCount < 1) {
			return index;
		}
		var i;
		var r = 0;
		var grid = this.grid();
		var topItem = this._topIndex + this._fixedItemCount;
		var h = this._bodyBounds.y;
		if (y < h) { 
			r = -1;
		} else if (y >= this._bodyBounds.bottom() && y < this._footerBounds.y) {
			r = topItem + this._fullItemCount;
		} else if (y >= this._footerBounds.y) {
			r = topItem + this._fullItemCount;
		} else {
			r = -1;
			for (i = 0; i < this._fixedItemCount; i++) {
				if (y >= h + this._fixedItemPoints[i] && y < h + this._fixedItemPoints[i + 1]) {
					r = i;
					break;
				}
			}
			if (r < 0 && this._itemCount > 0) {
				for (i = 0; i < this._itemCount; i++) {
					if (y >= h + this._itemPoints[i] && y < h + this._itemPoints[i + 1]) {
						r = i;
						break;
					}
				}
				if (r >= 0) {
					r += topItem;
				}
			}
		}
		index.itemIndex(r);
		var c = -1;
		var w = this._gridBounds.x;
		if (x < w) {
			c = Math.max(0, this._firstCol - 1);
		} else if (x >= this._bodyBounds.right() && x < this._clientRect.right()) {
			c = grid.visibleColumnCount() - 1;
		} else if (x > this._clientRect.right()) {
			c = Math.min(grid.visibleColumnCount() - 1, this._lastCol + 1);
		} else {
			x = x - w;
			for (i = 0; i < this._fixedCols; i++) {
				if (x >= this._fixedColumnPoints[i] && x < this._fixedColumnPoints[i + 1]) {
					c = i;
					break;
				}
			}
			if (c < 0 && this._rfixedCols > 0) {
				var rx = x - this._rfixedBounds.x + this._grid.fixedOptions().colBarWidth() + w;
				for (i = 0; i < this._rfixedCols; i++) {
					if (rx >= this._rfixedColumnPoints[i] && rx < this._rfixedColumnPoints[i+1]) {
						c = i + this.rfixedStartCol();
						break;
					}
				}
			}
			if (c < 0) {
				x = x - this._fixedWidth + this._leftPos;
				for (i = this._firstCol; i <= this._lastCol; i++) {
					if (x >= this._columnPoints[i - this._fixedCols] && x < this._columnPoints[i - this._fixedCols + 1]) {
						c = i;
						break;
					}
				}
			}
		}
		if (c >= 0 && c < grid.visibleColumnCount()) {
			index.column(grid.getVisibleColumn(c));
		} else {
			index.column(null);
		}
        return index;
	},
	measure: function (bounds, leftPos, topIndex, scrollBarWidth, scrollBarHeight) {
		this._items = this._grid.itemSource();
        this._options = this._grid.displayOptions();
		this._leftPos = leftPos;
		this._topIndex = topIndex;
		this._columnMerged = false;
		this._doMeasure(bounds, scrollBarWidth, scrollBarHeight);
		this._focusIndex = null;
	},
	layout: function (bounds) {
		this._doLayout(bounds);
	},
	fitColumnWidth: function (column, visibleOnly, minWidth, maxWidth) {
		if (column instanceof ColumnGroup) {
			this._doFitGroupWidth(column, visibleOnly, minWidth, maxWidth);
		} else if (column instanceof ValueColumn) {
			this._doFitColumnWidth(column, visibleOnly, minWidth, maxWidth, false);
		}
	},
	fitRowHeight: function (itemIndex, maxHeight, textOnly, refresh) {
		var grid = this.grid();
		var dMaxHeight = grid.displayOptions().maxRowHeight();
		var item = this._items.getItem(itemIndex);
		var dataId = item.dataId ? item.dataId() : -1;
		if (dataId < 0) {
			return;
		}
		delete this._itemHeights[dataId];
		var dHeight = this._heightMeasurer.$_calcItemHeights(grid, 1);
		var mHeight = Math.max(dHeight, (itemIndex < this._fixedItemCount ? this._gridBounds.height - 3 : this._gridBounds.height - this._fixedHeight - 3));
		mHeight = dMaxHeight && mHeight > dMaxHeight ? dMaxHeight : mHeight;
		if (!maxHeight) {
			maxHeight = mHeight;
		} else {
			maxHeight = Math.min(Math.max(dHeight, maxHeight), mHeight);
		}
		var cols = grid.getLeafColumns(true);
		var sz;
		var h = dHeight;
		for (var cnt=cols.length; cnt--; ) {
			var cw = cols[cnt].width();
			if (!textOnly || (cols[cnt].renderer && (!cols[cnt].renderer() || cols[cnt].renderer().type == "text"))) {
				sz = this.$_dofitCellHeight(itemIndex, cols[cnt], cw, maxHeight);
				h = sz.height ? Math.max(h, sz.height) : h;
			}
		}
		if (h > dHeight) {
			this._itemHeights[dataId] = h;
		}
		!!refresh && grid.refreshView();
	},
	fitRowHeightAll: function(maxHeight, textOnly) {
		var grid = this.grid();
		var dMaxHeight = grid.displayOptions().maxRowHeight();
		var dHeight = this._heightMeasurer.$_calcItemHeights(grid, 1);
		var item;
		var mHeight;
		var cols = grid.getLeafColumns(true);
		var sz;
		var h;
		var dataId;
		this._itemHeights = {};
		for (var itemIndex = 0, itemCount = grid.itemCount(); itemIndex < itemCount; itemIndex++) {
			item = grid.getItem(itemIndex);
			if (item && item instanceof GridRow && item.dataId) {
				dataId = item.dataId();
				if (dataId < 0) {
					continue;
				}
				mHeight = Math.max(dHeight, (itemIndex < this._fixedItemCount ? this._gridBounds.height - 3 : this._gridBounds.height - this._fixedHeight - 3));
				mHeight = dMaxHeight && mHeight > dMaxHeight ? dMaxHeight : mHeight;
				if (!maxHeight) {
					maxHeight = mHeight;
				} else {
					maxHeight = Math.min(Math.max(dHeight, maxHeight), mHeight);
				}
				h = dHeight;
				for (var cnt=cols.length; cnt--; ) {
					var cw = cols[cnt].width();
					if (!textOnly || (cols[cnt].renderer && (!cols[cnt].renderer() || cols[cnt].renderer().type == "text"))) {
						sz = this.$_dofitCellHeight(itemIndex, cols[cnt], cw, maxHeight);
						h = sz.height ? Math.max(h, sz.height) : h;
					}
				}
				if (h > dHeight) {
					this._itemHeights[dataId] = h;
				} else {
					delete this._itemHeights[dataId];
				}
			}
		}
		grid.refreshView();
	},
	$_dofitCellHeight: function (itemIndex, column, cw, maxHeight) {
		var grid = this._grid;
		var body = grid.body();
		var cellView = (column instanceof SeriesColumn) ? new TestSeriesCellElement(grid) : new TestDataCellElement(grid);
		cellView.updateCell(body.getCell(CellIndex.temp(grid, itemIndex, column)));
		return cellView.measureHeight(grid, cw, maxHeight);
	},
	setRowHeight:function (itemIndex, height, refresh) {
		var item = this._items.getItem(itemIndex);
		if (!item.dataId || item.dataId() < 0) {
			return;
		}
		var grid = this.grid();
		var displayOptions = grid.displayOptions();
		if (!displayOptions.isEachRowResizable()) {
			return;
		}
		var minHeight = displayOptions.minRowHeight();
		var maxHeight = displayOptions.maxRowHeight();
		this.$_doSetRowHeight(item, height, minHeight, maxHeight, refresh);
	},
	$_doSetRowHeight: function (item, height, minHeight, maxHeight, refresh) {
		var grid = this.grid();
		height = Math.min(height, this._gridBounds.width - this._fixedHeight);
		var h = Math.max(height, minHeight);
		var dataId = item.dataId();
		this._itemHeights[dataId] = h;
		refresh ? grid.refreshView() : null;
	},
	clearRowHeights: function (refresh) {
		var grid = this.grid();
		this._itemHeights = {};
		refresh ? grid.refreshView() : null;
	},
	isMergedCell: function (index) {
        var grid = this._grid;
		if (grid.rowGroup().isMergeMode()) {
			if (grid.isGroupedColumn(index.dataColumn())) {
				return true;
			}
		}
		var column = index.column();
		if (column instanceof ValueColumn && column.canMerge()) {
			var merges = column.stateFor(ColumnMergeManager.MERGE_ROOMS);
			if (merges) {
				return merges.getRoom(index) != null;
			}
		}
		return false;
	},
	getMergedCell: function (index) {
		var column = index.column();
		if (column instanceof ValueColumn && column.canMerge()) {
			var merges = column.stateFor(ColumnMergeManager.MERGE_ROOMS);
			if (merges) {
				return merges.getRoom(index);
			}
		}
		return null;
	},
	scrollToNextColumn: function () {
		for (var i = 0; i < this._columnCount; i++) {
			if (this._columnPoints[i] > this._leftPos) {
				return this._columnPoints[i];
			}
		}
		return this._leftPos;
	},
	scrollToPrevColumn: function () {
		for (var i = this._columnCount - 1; i >= 0; i--) {
			if (this._columnPoints[i] < this._leftPos) {
				return this._columnPoints[i];
			}
		}
		return this._leftPos;
	},
	_isColumnsDirty: function () {
		return this._grid._isColumnsDirty();
	},
	_isHeaderDirty: function () {
		return this._grid._isStylesDirty() || this._grid.header().isDirty() || this._grid._isColumnsDirty();
	},
	_isFooterDirty: function () {
		return this._grid._isStylesDirty() || this._grid.footer().isDirty() || this._grid._isColumnsDirty();
	},
	_getFixedRowCount: function () {
		var items = this._grid.itemSource();
		if (items) {
			return Math.min(items.fixedCount(), items.itemCount());
		} else {
			return 0;
		}
	},
	_getItem: function (index) {
		return this._items.getItem(index);
	},
	_doMeasure: function (bounds, sw, sh) {
        var	grid = this._grid;
        var	r = bounds.clone();
		var view, sz, y;
		this._hscrollBar = this._vscrollBar = false;
		this._prevFirst = this._firstCol;
		this._prevLast = this._lastCol;
		this._firstCol = 0;
		this._lastCol = -1;
		this.$_checkColumnGrouping();
		this.$_calcFixedColumnPoints();
		this.$_calcColumnPoints();
		this.$_calcRightFixedColumnPoints();
		this._heightMeasurer.calculate(grid, true, grid.header().isVisible(), grid.footer().isVisible(), grid.header().summary().isVisible());
		this._panelBounds = r.clone();
		if (grid.panel().isVisible() && (view = grid.panelView())) {
			view.setModel(grid.panel());
			sz = view.measure(grid, r.width, r.height);		
		} else { 
			sz = Size.EMPTY;
		}
		grid._panel._realHeight = sz.height;
		this._panelBounds.height = sz.height;
		r.topBy(sz.height);

		this._indicatorBounds = r.clone();
		if (grid.indicator().isVisible()) {
			view = grid.indicatorView();
			sz = view.measure(grid, r.width, r.height);
		} else {
			sz = Size.EMPTY;
		}
		grid._indicator._realWidth = sz.width;
		this._indicatorBounds.width = sz.width;
		r.leftBy(sz.width);
		this._stateBarBounds = r.clone();
		if (grid.stateBar().isVisible()) {
			view = grid.stateBarView();
			sz = view.measure(grid, r.width, r.height);
		} else {
			sz = Size.EMPTY;
		}
		this._stateBarBounds.width = sz.width;
		r.leftBy(sz.width);
		this._checkBarBounds = r.clone();
		if (grid.checkBar().isVisible()) {
			view = grid.checkBarView();
			sz = view.measure(grid, r.width, r.height);
		} else {
			sz = Size.EMPTY;
		}
		this._checkBarBounds.width = sz.width;
		r.leftBy(sz.width);
		this._rowGroupBounds = r.clone();
		if (this.isRowGrouped()) {
			sz = grid.rowGroupView().measure(grid, r.width, r.height);
		} else {
			sz = Size.EMPTY;
		}
		this._rowGroupBounds.width = sz.width;
		r.leftBy(sz.width);
		this._fixedBounds = r.clone();
		this._fixedBounds.width = this._fixedWidth;
		r.leftBy(this._fixedWidth);
		this._rfixedBounds = r.clone();
		this._rfixedBounds.x = Math.min(r.x+this._columnsLength+this._rfixedWidth, r.right())-this._rfixedWidth;
		this._rfixedBounds.width = this._rfixedWidth;
		r.width -= this._rfixedWidth;

		this._headerBounds = r.clone();
		if (grid.header().isVisible()) {
			view = grid.headerView();
			sz = view.measure(grid, r.width, r.height);
			sz.height = Math.max(sz.height, this._heightMeasurer.headerHeight());
		} else {
			sz = Size.EMPTY;
		}
		grid._header._realHeight = sz.height;
		this._headerBounds.height = sz.height;
		this._headerBounds.width = sz.width;
		this._fixedHeaderBounds = new Rectangle(this._fixedBounds.x, this._headerBounds.y, this._fixedBounds.width, this._headerBounds.height);
        this._rfixedHeaderBounds = new Rectangle(this._rfixedBounds.x, this._headerBounds.y, this._rfixedBounds.width, this._headerBounds.height);
        r.topBy(sz.height);
        this._summaryBounds = r.clone();
        if (grid.header().summary().isVisible()) {
            view = grid.summaryView();
            sz = view.measure(grid, r.width, r.height);
            sz.height = Math.max(sz.height, this._heightMeasurer.summaryHeight());
        } else {
            sz = Size.EMPTY;
        }
        this._summaryBounds.height = sz.height;
        this._summaryBounds.width = sz.width;
        this._fixedSummaryBounds = new Rectangle(this._fixedBounds.x, this._summaryBounds.y, this._fixedBounds.width, this._summaryBounds.height);
		this._rfixedSummaryBounds = new Rectangle(this._rfixedBounds.x, this._summaryBounds.y, this._rfixedBounds.width, this._summaryBounds.height);
		
		this._editBarBounds = r.clone();
		this._editBarBounds.y += this._summaryBounds.height;
		if (grid.editBar().isVisible()) {
			view = grid.editBarRenderer();
			view.setModel(grid.getEditBar());
			sz = view.measure(grid, r.width, r.height);
			sz.height = Math.max(sz.height, this._heightMeasurer.itemHeight(0));
		} else {
			sz = Size.EMPTY;
		}
		this._editBarBounds.height = sz.height;
		this._editBarBounds.width = sz.width;
		this._footerBounds = r.clone();
		if (grid.footer().isVisible()) {
			view = grid.footerView();
			sz = view.measure(grid, r.width, r.height);
			sz.height = Math.max(sz.height, this._heightMeasurer.footerHeight());
		} else {
			sz = Size.EMPTY;
		}
		grid._footer._realHeight = sz.height;
		this._footerBounds.y = r.bottom() - sz.height;
		this._footerBounds.width = sz.width;
		this._footerBounds.height = sz.height;
		this._fixedFooterBounds = new Rectangle(this._fixedBounds.x, this._footerBounds.y, this._fixedBounds.width, this._footerBounds.height);
		this._rfixedFooterBounds = new Rectangle(this._rfixedBounds.x, this._footerBounds.y, this._rfixedBounds.width, this._footerBounds.height);
		this._gridBounds = new Rectangle(this._fixedBounds.x, this._editBarBounds.bottom(), 
			bounds.right() - this._fixedBounds.x, this._footerBounds.y - this._editBarBounds.bottom());
		var rBody = new Rectangle(this._headerBounds.x, this._editBarBounds.bottom(), 
			this._headerBounds.width, this._footerBounds.y - this._editBarBounds.bottom() + 1);
		this.$_calcHorzScroll(sh, rBody, this._gridBounds);
		if (this._hscrollBar) {
			rBody.bottomBy(-sh);
		}
		this._calcItemPoints(rBody);
		this._bodyBounds = rBody.clone();
		this.$_updateScrollInfo(bounds, sw, sh);
		this.$_checkColumnMerging();

		if (this._vscrollBar && this._rfixedBounds.right() > this._gridBounds.right()) {
			 this._rfixedBounds.x = this._gridBounds.right()-this._rfixedWidth;
			 this._rfixedHeaderBounds.x = this._rfixedFooterBounds.x = this._rfixedSummaryBounds.x = this._rfixedBounds.x;
		}
		
		this._fixedBounds.y = this._rfixedBounds.y = this._bodyBounds.y;
		this._fixedBounds.height = this._rfixedBounds.height = this._bodyBounds.height;
		this._nonfixedBounds = this._gridBounds.clone();
		this._nonfixedBounds.setLeft(this._nonfixedBounds.x + this._fixedWidth);
		this._nonfixedBounds.rightBy(-this._rfixedWidth);
		if (this._fixedHeight > 0) {
			this._nonfixedBounds.setTop(this._nonfixedBounds.y + this._fixedHeight + grid.fixedOptions().rowBarHeight());
		}
		this.$_measureFitting(this._nonfixedBounds, this._vscrollBar ? sw : 0);
		if (this._columnFitted) {
			this.$_fitColumns(this._nonfixedBounds.width);
			this._bodyBounds.width = this._columnsLength;
			this._rfixedBounds.x = r.x+this._columnsLength;
			this._rfixedBounds.width = this._rfixedWidth;
	        this._rfixedHeaderBounds = new Rectangle(this._rfixedBounds.x, this._headerBounds.y, this._rfixedBounds.width, this._headerBounds.height);
			this._rfixedSummaryBounds = new Rectangle(this._rfixedBounds.x, this._summaryBounds.y, this._rfixedBounds.width, this._summaryBounds.height);
			this._rfixedFooterBounds = new Rectangle(this._rfixedBounds.x, this._footerBounds.y, this._rfixedBounds.width, this._footerBounds.height);
		} else {
			this._clearFitWidths();
		}
		this.$_calcLeftPos();
		if (this.isRowGrouped()) {
			this._rowGroupBounds.setRight(this._bodyBounds.right()+this._rfixedWidth);
			this._rowGroupBounds.setTop(this._headerBounds.y);
			this._rowGroupBounds.setBottom(this._footerBounds.bottom());
		}
		this._bodyBounds.x -= this._leftPos;
		var bwidth = this._bodyBounds.width+this._rfixedWidth;
		this._panelBounds.setRight(this._bodyBounds.right()+this._rfixedWidth);
		this._headerBounds.x = this._bodyBounds.x;
		this._headerBounds.width = bwidth;
        this._summaryBounds.x = this._bodyBounds.x;
        this._summaryBounds.width = bwidth;
		this._editBarBounds.x = this._bodyBounds.x;
		this._editBarBounds.width = bwidth;
		this._footerBounds.x = this._bodyBounds.x;
		this._footerBounds.width = bwidth;
        y = Math.min(this._footerBounds.y, this._bodyBounds.bottom());
		this._indicatorBounds.y = this._bodyBounds.y;
		this._indicatorBounds.setBottom(y);
		this._stateBarBounds.y = this._bodyBounds.y;
		this._stateBarBounds.setBottom(y);
		this._checkBarBounds.y = this._bodyBounds.y;
		this._checkBarBounds.setBottom(y);
	},
	$_calcHorzScroll: function (sh, rBody, bounds) {
		this._hscrollBar = sh > 0 && this._options.fitStyle() != GridFitStyle.EVEN_FILL;
        if (this._hscrollBar) {
            if (this._fixedWidth + this._rfixedWidth >= bounds.width) {
                this._hscrollBar = this._columnsLength > 0;
            } else {
                this._hscrollBar = this._columnsLength > bounds.width - this._fixedWidth - this._rfixedWidth;
            }
        }
		rBody.width = this._columnsLength;
	},
	/**
	 * 고정 영역을 제외하고 계산한다.
	 */
	$_updateScrollInfo: function (bounds, sw, sh) {
		var even = this._options.fitStyle() == GridFitStyle.EVEN_FILL;
		var grid = this.grid();
		var rBody = this._bodyBounds;
		var bodyRight = rBody.right()+this._rfixedWidth;
		var rFooter = this._footerBounds;
		var hscroll = !even && sw > 0 && this._columnsLength > 0 && (this._leftPos > 0 || bodyRight > bounds.right());
		var vscroll = sh > 0 && this._itemCount > 0 && (this._topIndex > 0 || rBody.bottom() > rFooter.y);
        var i, w, h, y, dy;
		if (hscroll) {
			w = vscroll ? sw : 0;
			if (this._columnsLength < this._gridBounds.width - this._fixedBounds.width - this._rfixedBounds.width - w) {
				hscroll = false;
			}
		}
		if (hscroll != vscroll) {
			if (hscroll) {
				vscroll = sh > 0 && this._itemCount > 0 && rBody.bottom() > rFooter.y - sh;
			} else { // vscroll
				hscroll = !even && sw > 0 && this._columnsLength > 0 && bodyRight > bounds.right() - sw;
			}
		}
		if (!hscroll) {
			this._leftPos = 0;
		} else /*if (this._itemCount > 0)*/ {
			if (!this._hscrollBar && this._itemCount > 0) { // vscrollbar로 인해 hscrollbar가 생긴 경우
				var r = rBody.clone();
				r.setBottom(rFooter.y - sh);
				this._calcItemPoints(r);
				if (this._itemCount > 0) {
					rBody.height = this._itemPoints[this._itemCount];
				}
			}
			this._rfixedFooterBounds.y = this._fixedFooterBounds.y = rFooter.y -= sh;
			rBody.setBottom(Math.min(rBody.bottom(), rFooter.y));
			this._gridBounds.setBottom(rFooter.y);
			if (this._itemCount > 0) {
				i = this._fullItemCount;
				while (i > 0 && rBody.y + this._itemPoints[i] > rFooter.y) {
					this._fullItemCount--;
					i--;
				}
				i = this._itemCount;
				while (i > 0 && rBody.y + this._itemPoints[i - 1] > rFooter.y) {
					this._itemCount--;
					this._itemPoints.pop();
					i--;
				}
			}
		}
		y = rBody.bottom();
		if (this._itemCount > 0 && y < this._fixedFooterBounds.y) {
			var eachRowResizable = grid.displayOptions().isEachRowResizable() && grid._rootColumn._dataLevel == 1;
			if (eachRowResizable) {
				var points = this._itemPoints;
				var item ,
					dataId, 
					dummyIdx;
				h = this._itemHeights[dataId] ? this._itemHeights[dataId] : this._heightMeasurer.itemHeight(0);
				while (this._topIndex > 0 && y < this._fixedFooterBounds.y) {
					dummyIdx = this._topIndex - 1;
					item = this._getItem(dummyIdx + this._fixedItemCount);
					dataId = item && item.dataId();
					h = this._itemHeights[dataId] ? this._itemHeights[dataId] : this._heightMeasurer.itemHeight(0);
					if (y+h < this._fixedFooterBounds.y ) {
						rBody.bottomBy(h);
						y = rBody.bottom();
						points.splice(1,0,points[0]+h);
						for (var i = 2; i<points.length;i++) {
							points[i]+=h
						}
						this._topIndex = dummyIdx;
						this._itemCount++;
						this._fullItemCount++;
					} else {
						break;
					}
				}
				if (vscroll && this._topIndex == 0 && y < this._fixedFooterBounds.y) {
					vscroll = false;
					if (hscroll) {
						hscroll = bodyRight > bounds.right();
					}
				}
			} else {
			h = this._heightMeasurer.itemHeight(0);
			dy = _int((this._fixedFooterBounds.y - y) / h);
			this._availableItemCount = this._fullItemCount + dy;
			while (this._topIndex >  0 && dy > 0) {
				this._topIndex--;
				this._itemCount++;
				this._fullItemCount++;
				this._itemPoints.push(this._itemPoints[this._itemPoints.length - 1] + h);
				rBody.bottomBy(h);
				dy--;
			}
			if (vscroll && this._topIndex == 0 && this._availableItemCount >= this._fullItemCount) {
				vscroll = false;
				if (hscroll) {
					hscroll = bodyRight > bounds.right();
				}
			}
			}
		} else {
			this._availableItemCount = this._fullItemCount;
		}
		this._clientRect = bounds.clone();
		this._clientRect.width -= vscroll ? sw : 0;
		this._clientRect.height -= hscroll ? sh : 0;
		this._gridBounds.setRight(this._clientRect.right());
		this._gridBounds.setBottom(this._footerBounds.y);
		this._hscrollBar = hscroll;
		this._vscrollBar = vscroll;
	},
	$_calcLeftPos: function () {
		var column;
		var root;
		var i;
		var dx;
		var x;
		if (this._leftPos > 0) {
			i = this._columnPoints.length - 1;
			dx = this._nonfixedBounds.width - (this._columnPoints[i] - this._leftPos);
			if (dx > 0) {
				this._leftPos = Math.max(0, this._leftPos - dx);
			}
		}
		if (this._focusIndex && (column = this._focusIndex.column())) {
            root = column.root();
            i = root.displayIndex();
            if (i >= this._fixedCols && i < this.rfixedStartCol()) {
                x = this._columnPoints[i - this._fixedCols];
                while (column != root) {
                    x += column.displayOffset();
                    column = column.parent();
                }
                if (x < this._leftPos) {
                    this._leftPos = x;
                } else {
                    dx = x + this._focusIndex.column().displayWidth() - this._leftPos - this._nonfixedBounds.width;
                    if (dx > 0) {
                        this._leftPos = Math.min(x, this._leftPos + dx);
                    }
                }
            }
		}
		var leftPos = this._leftPos;
		var cw = this._clientRect.width;
		this._firstCol = this._fixedCols;
		this._lastCol = -1;
		for (i = this._fixedCols; i < this._columnCount; i++) {
			if (this._columnPoints[i + 1 - this._fixedCols] > leftPos) {
				this._firstCol = i;
				break;
			}
		}
		for (i = this._columnCount - this._rfixedCols - 1; i >= this._fixedCols; i--) {
			if (this._columnPoints[i - this._fixedCols] - leftPos < cw - this._headerBounds.x) {
				this._lastCol = i;
				break;
			}
		}
	},
	_doLayout: function (bounds) {
		var elt, r,
			gr = this._gridBounds,
			grid = this._grid,
			header = grid.header(),
            summary = header.summary(),
			footer = grid.footer(),
			indicator = grid.indicator(),
			stateBar = grid.stateBar(),
			checkBar = grid.checkBar(),
			fixed = this._fixedCols > 0,
			rfixed = this._rfixedCols > 0;
		if ((elt = grid.panelView())) {
			elt.setVisible(grid.panel().isVisible());
			if (elt.isVisible()) {
				elt.setRect(this._panelBounds);
				elt.layoutContent(this);
			}
		}
		elt = grid.indicatorView();
		elt.setVisible(indicator.isVisible());
		if (elt.isVisible()) {
			elt.setRect(this._indicatorBounds);
			elt.layoutContent(this);
		}
		elt = grid.stateBarView();
		elt.setVisible(stateBar.isVisible());
		if (elt.isVisible()) {
			elt.setRect(this._stateBarBounds);
			elt.layoutContent(this);
		}
		elt = grid.checkBarView();
		elt.setVisible(checkBar.isVisible());
		if (elt.isVisible()) {
			elt.setRect(this._checkBarBounds);
			elt.layoutContent(this);
		}
		elt = grid.rowGroupView();
		elt.setVisible(this.isRowGrouped());
		if (elt.isVisible()) {
			elt.setRect(r = this._rowGroupBounds);
			elt.setClipBounds(r.x, r.y, gr.right() - r.x, r.height);
		}
		elt = grid.headerView();
		elt.setVisible(header.isVisible());
		if (elt.isVisible()) {
			elt.setRect(this._headerBounds);
			elt.setClipBounds(this._nonfixedBounds.x, 0, this._nonfixedBounds.width, bounds.height);
			elt.layoutContent(this);
		}
		elt = grid.fixedHeaderView();
		elt.setVisible(fixed && header.isVisible());
		if (elt.isVisible()) {
			elt.setRect(this._fixedHeaderBounds);
			elt.layoutContent(this);
		}
		elt = grid.rfixedHeaderView();
		elt.setVisible(rfixed && header.isVisible());
		if (elt.isVisible()) {
			elt.setRect(this._rfixedHeaderBounds);
			elt.layoutContent(this);
		}
        elt = grid.summaryView();
        elt.setVisible(summary.isVisible());
        if (elt.isVisible()) {
            elt.setRect(this._summaryBounds);
            elt.setClipBounds(this._nonfixedBounds.x, 0, this._nonfixedBounds.width, bounds.height);
            elt.layoutContent(this);
        }
        elt = grid.fixedSummaryView();
        elt.setVisible(fixed && summary.isVisible());
        if (elt.isVisible()) {
            elt.setRect(this._fixedSummaryBounds);
            elt.layoutContent(this);
        }
        elt = grid.rfixedSummaryView();
        elt.setVisible(rfixed && summary.isVisible());
        if (elt.isVisible()) {
            elt.setRect(this._rfixedSummaryBounds);
            elt.layoutContent(this);
        }
		elt = grid.indicatorHeadView();
		elt.setVisible(indicator.isVisible() && header.isVisible());
		if (elt.isVisible()) {
			elt.updateCell(indicator.getHeadCell());
			elt.setBounds(this._indicatorBounds.x, this._headerBounds.y, this._indicatorBounds.width, this._headerBounds.height);
			elt.layoutContent(this);
		}
		elt = grid.stateBarHeadView();
		elt.setVisible(stateBar.isVisible() && header.isVisible());
		if (elt.isVisible()) {
			elt.updateCell(stateBar.getHeadCell());
			elt.setBounds(this._stateBarBounds.x, this._headerBounds.y, this._stateBarBounds.width, this._headerBounds.height);
			elt.layoutContent(this);
		}
		elt = grid.checkBarHeadView();
		elt.setVisible(checkBar.isVisible() && header.isVisible());
		if (elt.isVisible()) {
			elt.updateCell(checkBar.getHeadCell());
			elt.setBounds(this._checkBarBounds.x, this._headerBounds.y, this._checkBarBounds.width, this._headerBounds.height);
			elt.layoutContent(this);
		}
		elt = grid.footerView();
		elt.setVisible(footer.isVisible());
		if (elt.isVisible()) {
			elt.setRect(this._footerBounds);
			elt.setClipBounds(this._nonfixedBounds.x, 0, this._nonfixedBounds.width, this._footerBounds.bottom());
			elt.layoutContent(this);
		}
		elt = grid.fixedFooterView();
		elt.setVisible(fixed && footer.isVisible());
		if (elt.isVisible()) {
			elt.setRect(this._fixedFooterBounds);
			elt.layoutContent(this);
		}
		elt = grid.rfixedFooterView();
		elt.setVisible(rfixed && footer.isVisible());
		if (elt.isVisible()) {
			elt.setRect(this._rfixedFooterBounds);
			elt.layoutContent(this);
		}
		elt = grid.indicatorFootView();
		elt.setVisible(indicator.isVisible() && footer.isVisible());
		if (elt.isVisible()) {
			elt.updateCell(indicator.getFootCell());
			elt.setBounds(this._indicatorBounds.x, this._footerBounds.y, this._indicatorBounds.width, this._footerBounds.height);
			elt.layoutContent(this);
		}
		elt = grid.stateBarFootView();
		elt.isVisible = stateBar.isVisible && footer.isVisible;
		if (elt.isVisible()) {
			elt.updateCell(stateBar.getFootCell());
			elt.setBounds(this._stateBarBounds.x, this._footerBounds.y, this._stateBarBounds.width, this._footerBounds.height);
			elt.layoutContent(this);
		}
		elt = grid.checkBarFootView();
		elt.setVisible(checkBar.isVisible() && footer.isVisible());
		if (elt.isVisible()) {
			elt.updateCell(checkBar.getFootCell());
			elt.setBounds(this._checkBarBounds.x, this._footerBounds.y, this._checkBarBounds.width, this._footerBounds.height);
			elt.layoutContent(this);
		}
        elt = grid.indicatorSummaryView();
        elt.setVisible(indicator.isVisible() && summary.isVisible());
        if (elt.isVisible()) {
            elt.updateCell(indicator.getSumCell());
            elt.setBounds(this._indicatorBounds.x, this._summaryBounds.y, this._indicatorBounds.width, this._summaryBounds.height);
            elt.layoutContent(this);
        }
        elt = grid.stateBarSummaryView();
        elt.isVisible = stateBar.isVisible && summary.isVisible;
        if (elt.isVisible()) {
            elt.updateCell(stateBar.getSumCell());
            elt.setBounds(this._stateBarBounds.x, this._summaryBounds.y, this._stateBarBounds.width, this._summaryBounds.height);
            elt.layoutContent(this);
        }
        elt = grid.checkBarSummaryView();
        elt.setVisible(checkBar.isVisible() && summary.isVisible());
        if (elt.isVisible()) {
            elt.updateCell(checkBar.getSumCell());
            elt.setBounds(this._checkBarBounds.x, this._summaryBounds.y, this._checkBarBounds.width, this._summaryBounds.height);
            elt.layoutContent(this);
        }
		var fixedView = grid.fixedBodyView();
		var rfixedView = grid.rfixedBodyView();
		elt = grid.bodyView();
		if (this._fixedItemCount + this._itemCount > 0) {
			if (this._fixedCols > 0) {
				fixedView.setVisible(true);
				fixedView.setRect(this._fixedBounds);
                fixedView.setClipBounds(this._fixedBounds.x, this._gridBounds.y, this._fixedBounds.width, this._gridBounds.height);
			} else {
				fixedView.setVisible(false);
			}
			if (this._rfixedCols > 0) {
				rfixedView.setVisible(true);
				rfixedView.setRect(this._rfixedBounds);
                rfixedView.setClipBounds(this._rfixedBounds.x, this._gridBounds.y, this._rfixedBounds.width, this._gridBounds.height);
			} else {
				rfixedView.setVisible(false);
			}
			elt.setRect(this._bodyBounds);
			elt.setClipBounds(this._nonfixedBounds.x, this._gridBounds.y, this._nonfixedBounds.width, this._gridBounds.height);
			this.$_layoutItems(elt, this._bodyBounds);
			fixedView.setEmpty(false);
			rfixedView.setEmpty(false);
			elt.setEmpty(false);
		} else {
			fixedView.setBounds(0, this._fixedBounds.y, this._fixedBounds.width, this._footerBounds.y - this._bodyBounds.y);
			rfixedView.setBounds(0, this._rfixedBounds.y, this._rfixedBounds.width, this._footerBounds.y - this._bodyBounds.y);
			elt.setBounds(0, this._bodyBounds.y, this._bodyBounds.width, this._footerBounds.y - this._bodyBounds.y);
			this.$_layoutItems(elt, this._bodyBounds);
			fixedView.setEmpty(true);
			rfixedView.setEmpty(true);
			elt.setEmpty(true);
		}
		elt = grid.fixedMergeView();
		elt.setVisible(fixed);
		if (fixed) {
			r = this._fixedBounds;
			elt.setRect(r);
			elt.setClipBounds(r.x, r.y, Math.min(r.width, gr.right() - r.x), Math.min(r.height, gr.bottom() - r.y));
		}
		elt = grid.rfixedMergeView();
		elt.setVisible(rfixed);
		if (rfixed) {
			r = this._rfixedBounds;
			elt.setRect(r);
			elt.setClipBounds(r.x, r.y, Math.min(r.width, gr.right() - r.x), Math.min(r.height, gr.bottom() - r.y));
		}
		elt = grid.mergeView();
		r = this._bodyBounds.clone();
		r.width += this._rfixedWidth;
		elt.setRect(r);
        if (fixed) {
            r.x = Math.max(r.x, this._fixedBounds.right());
            elt.setClipBounds(r.x, r.y, Math.min(r.width, gr.right() - r.x), Math.min(r.height, gr.bottom() - r.y));
        } else {
            elt.setClipBounds(r.x, r.y, Math.min(r.width, gr.right() - r.x), Math.min(r.height, gr.bottom() - r.y));
        }
		r = this._fixedBounds;
		grid.mergeHeaderView().setBounds(r.x, r.y, r.width + this._bodyBounds.width + this._rfixedWidth, r.height);
		grid.mergeHeaderView().setClipBounds(r.x, r.y, Math.min(r.width + this._bodyBounds.width + this._rfixedWidth, gr.right() - r.x), Math.min(r.height, gr.bottom() - r.y));
		this.$_layoutMerges();
		/*
		elt = grid.getEditBarRenderer();
		elt.setVisible(editBar.isVisible());
		if (elt.isVisible()) {
			elt.setRect(this._editBarBounds);
			elt.layoutContent(this);
		}
		*/
	},
	$_checkColumnGrouping: function () {
		var i, cnt, column, grid = this._grid;
		this._columnGrouped = false;
		for (i = 0, cnt = grid.visibleColumnCount(); i < cnt; i++) {
			column = grid.getVisibleColumn(i);
			if (column instanceof ColumnGroup) {
				this._columnGrouped = true;
				break;
			}
		}
	},
	$_calcFixedColumnPoints: function () {
		var i, x, column;
		var grid = this._grid;
		var fixed = grid.fixedOptions();
		this._columnCount = grid.visibleColumnCount();
		this._fixedCols = Math.min(fixed.colCount(), this._columnCount);
		this._rfixedCols = Math.min(fixed.rightColCount(), this._columnCount - this._fixedCols);
		this._columns = [];
		this._fixedColumnPoints = [];
		this._fixedWidth = 0;
		if (this._fixedCols > 0) {
			x = 0;
			this._fixedColumnPoints.push(x);
			for (i = 0; i < this._fixedCols; i++) {
				column = grid.getVisibleColumn(i);
				this._columns.push(column);
				x += column.width();
				this._fixedColumnPoints.push(x);
			}
			this._fixedWidth = this._fixedColumnPoints[this._fixedCols] + grid.fixedOptions().colBarWidth();
		}
	},
	$_calcRightFixedColumnPoints: function () {
		var i, x, column;
		var grid = this._grid;
		var fixed = grid.fixedOptions();
		this._rfixedColumnPoints = [];
		this._rfixedWidth = 0;
		if (this._rfixedCols > 0) {
			x = 0;
			var cols = this._columnCount;
			this._rfixedColumnPoints.push(x);
			for (i = cols - this._rfixedCols; i < cols; i++) {
				column = grid.getVisibleColumn(i);
				this._columns.push(column);
				x += column.width();
				this._rfixedColumnPoints.push(x);
			}
			var wbar = grid.fixedOptions().colBarWidth();
			this._rfixedWidth = x + wbar;
		}
	},
	$_calcColumnPoints: function () {
		var cnt, 
			i,	
			x, 
			column,
			grid = this._grid;
        this._columnsLength = 0;
		this._columnPoints = [];
		cnt = grid.visibleColumnCount() - this._fixedCols - this._rfixedCols;
		if (cnt < 1) {
			return;
		}
		x = 0;
		this._columnPoints.push(x);
		for (i = 0; i < cnt; i++) {
			column = grid.getVisibleColumn(i + this._fixedCols);
			this._columns.push(column);
			x += column.width();
			this._columnPoints.push(x);
		}
		this._columnsLength = x;
	},
	$_measureFitting: function (bounds) {
		var grid = this.grid();
		this._columnFitted = this._options.fitStyle() != GridFitStyle.NONE;
		if (this._columnFitted) {
			var cnt = this._columnPoints.length;
			if (cnt > 0) {
                var w = bounds.width;
				if (this._options.fitStyle() == GridFitStyle.EVEN_FILL) {
					for (var i = 1; i < cnt; i++) {
						this._columnPoints[i] = this._columnPoints[i] * w / this._columnsLength;
					}
					this._columnPoints[cnt - 1] = w;
					this._columnsLength = w;
				} else {
					this._columnFitted = w - this._columnPoints[cnt - 1] > 0;
				}
			} else {
				this._columnFitted = false;
			}
		}
	},
	$_fitColumns: function (w) {
        if (!this._columnFitted) return;
		var i, dx, column, sum, fsum;
		var cw = this._columnsLength;
		var cnt = this._columnPoints.length;
		var grid = this.grid();
		var options = this._options;
		var fitStyle = options.fitStyle();
		if (cnt > 0) {
			if (fitStyle == GridFitStyle.EVEN || fitStyle == GridFitStyle.EVEN_FILL) {
				for (i = 1; i < cnt; i++) {
					this._columnPoints[i] = _int(this._columnPoints[i] * w / cw);
				}
			} else if (fitStyle == GridFitStyle.FILL) {
				sum = 0;
				fsum = 0;
				for (i = 0; i < cnt - 1; i++) {
					if ((dx = this._columns[i].fillWidth()) > 0) {
						fsum += dx;
					} else {
						sum += this._columns[i].width();
					}
				}
				if (fsum > 0) {
					sum = w - sum;
					for (i = 1; i < cnt; i++) {
						if ((dx = this._columns[i - 1].fillWidth()) > 0) {
							this._columnPoints[i] = _int(this._columnPoints[i - 1] + dx * sum / fsum);
						} else {
							this._columnPoints[i] = _int(this._columnPoints[i - 1] + this._columns[i - 1].width());
						}
					}
				} else {
					for (i = 1; i < cnt; i++) {
						this._columnPoints[i] = _int(this._columnPoints[i] * w / cw);
					}
				}
			}
			//columnPoints[i]의 값이 컬럼 최소넓이 보다 작을 때 이를 교정하기 위한 로직
			var correction = 0;
			for (i = 1; i < cnt - 1; i++) {
				var colw = this._columnPoints[i] - this._columnPoints[i-1];
				if (colw < Column.MIN_WIDTH) {
					correction = Column.MIN_WIDTH - colw;
					this._columnPoints[i] += Column.MIN_WIDTH - colw;
				} else if (correction > 0 && colw > Column.MIN_WIDTH + correction) {
					this._columnPoints[i] -= correction;
					correction = 0;
				}
			}

			for (i = 0; i < cnt - 1; i++) {
				column = this._columns[this._fixedCols + i];
				this._setFitWidth(column, this._columnPoints[i + 1] - this._columnPoints[i]);
			}
		}
		this._columnPoints[cnt - 1] = w;
		this._columnsLength = w;
	},
	$_calcItemHeight: function (grid, delegate, index) {
		var item = this._items.getItem(index);
		var view = delegate.borrowItemView(item, false, false);
		var styles = null;
		if (view instanceof RowGroupHeaderElement && item instanceof GroupItem) {
			styles = grid.rowGroup().headerStyles();
		} else if (item instanceof GridItem) {
			styles = grid.body().styles();
		} 
		if (!view) {
			if ($_debug) debugger;
		}
		view.updateElement(item, styles		);
		var h = this._heightMeasurer.itemHeight(0);
		var eachRowResizable = grid.displayOptions().isEachRowResizable() && grid._rootColumn._dataLevel == 1;
		if (eachRowResizable) {
			var dataId = item.dataId();
			if (this._itemHeights[dataId]) {
				h = this._itemHeights[dataId];
			}
		}
		var sz = view.measure(grid, 10000, h);
		delegate.returnItemView(view);
		return sz.height;
	},
	$_compensateItems: function (bounds) {
		var i, y, h, cnt;
		var grid = this.grid();
		var delegate = grid.delegate();
		var focusIndex = this._focusIndex ? this._focusIndex.I() : -1;
		var eachRowResizable = grid.displayOptions().isEachRowResizable() && grid._rootColumn._dataLevel == 1;
		if (focusIndex >= this._topIndex + this._fixedItemCount + this._fullItemCount) {
			if (this.fixedItemCount() > 0) {
				y = this._fixedHeight + grid.fixedOptions().rowBarHeight();
			} else {
				y = 0;
			}
			if (eachRowResizable) {
				h = this.$_calcItemHeight(grid, delegate, focusIndex);
				if (h >= bounds.height - this._fixedHeight) {
					this._topIndex = focusIndex - this._fixedItemCount;
				} else {
					for (i=focusIndex-1;i >= this._fixedItemCount ;i--) {
						h += this.$_calcItemHeight(grid, delegate, i);
						if (h >= bounds.height - y) {
							this._topIndex = Math.max(i-this._fixedItemCount+1,0);
							break;
						}
					}
				}
			} else {
				this._topIndex = focusIndex - this._fixedItemCount - Math.max(0, this._fullItemCount - 1); // fullItemCount가 0일 수 있다.
			}
			this._itemPoints = [y];
			this._itemCount = 0;
			this._fullItemCount = 0;
			this._availableItemCount = 0;
			cnt = grid.itemCount() - this._fixedItemCount;
			for (i = this._topIndex; i < cnt && y < bounds.height; i++) {
				h = this.$_calcItemHeight(grid, delegate, i + this._fixedItemCount);
				y += h;
				this._itemCount++;
				this._itemPoints.push(y);
			}
			this._fullItemCount = this._itemCount - (y >= bounds.height ? 1 : 0);
			return y;
		} else {
			return -1;
			y =  this._itemPoints[this._itemCount];
			while (this._topIndex > 0 && y < bounds.height) {
				h = this.$_calcItemHeight(grid, delegate, this._topIndex + this._fixedItemCount);
				if (y + h <= bounds.height) {
					this._topIndex--;
					this._itemCount++;
					this._fullItemCount++;
					this._itemPoints.unshift(this._itemPoints[0] - h);
				}
				y += h;
			}
			h = this._itemPoints[0];
			if (h < 0) {
				for (i = 0, cnt = this._itemPoints.length; i < cnt; i++) {
					this._itemPoints[i] += -h;
				}
			}
		}
	},
	_calcItemPoints: function (bounds) {
		var i, cnt, h, top,
			focusIndex = -1,
			grid = this._grid,
			delegate = grid.delegate(),
			y = 0;
		this._fixedRows = this._getFixedRowCount();
		this._fixedItemCount = 0;
		this._fixedHeight = 0;
		this._fixedItemPoints = [];
		if (this._fixedRows > 0) {
			this._fixedItemPoints.push(y);
			for (i = 0; i < this._fixedRows && y < bounds.height; i++) {
				h = this.$_calcItemHeight(grid, delegate, i);
				y += h;
				this._fixedItemPoints.push(y);
				this._fixedItemCount++;
			}
			this._fixedHeight = y;
			y += grid.fixedOptions().rowBarHeight();
		}
		cnt = grid.itemCount() - this._fixedItemCount;
		this._itemPoints = [];
		this._itemCount = 0;
		this._fullItemCount = 0;
		this._availableItemCount = 0;
		if (cnt > 0 && y < bounds.height) {
			this._itemPoints.push(y);
			top = this._topIndex;
			if (this._focusIndex) {
				focusIndex = this._focusIndex.I();
				if (focusIndex >= this._fixedItemCount && focusIndex < top + this._fixedItemCount) {
					top = this._topIndex = focusIndex - this._fixedItemCount;
				}
			}	
			for (i = top; i < cnt && y < bounds.height; i++) {
				h = this.$_calcItemHeight(grid, delegate, i + this._fixedItemCount);
				y += h;
				this._itemCount++;
				this._itemPoints.push(y);
			}
			this._fullItemCount = this._itemCount - (y >= bounds.height ? 1 : 0);
			h = this.$_compensateItems(bounds);
			if (h >= 0) y = h;
		}
		bounds.height = y;
	},
	$_checkColumnMerging: function () {
		var	grid = this._grid;
		var	mergeView = grid.mergeView();
		var	fixedMergeView = grid.fixedMergeView();
		var rfixedMergeView = grid.rfixedMergeView();
		var	first = this._fixedItemCount + this._topIndex;
		var	last = Math.min(grid.itemCount() - 1, this._fixedItemCount + this._topIndex + this._itemCount - 1);
		var	fixed = this._fixedCols > 0;
		var rfixed = this._rfixedCols > 0;
        var i, cnt, col, merges, rooms;
		mergeView.clearRooms();
		if (fixed) {
			fixedMergeView.clearRooms();
		}
		if (rfixed) {
			rfixedMergeView.clearRooms();
		}
		// left fixed merge view
		var horzColumns = grid.getHorzColumns(0, this._fixedCols);
		for (i = 0, cnt = horzColumns.length; i < cnt; i++) {
			col = horzColumns[i];
			if (col instanceof ValueColumn && col.canMerge()) {
				merges = col.stateFor(ColumnMergeManager.MERGE_ROOMS);
				if (!merges) {
					merges = new ColumnMergeManager(col);
					col.setState(ColumnMergeManager.MERGE_ROOMS, merges);
				}
				merges.refresh(first, last);
				rooms = merges.getRooms();
				fixedMergeView.addColumnRooms(col, rooms);
				this._columnMerged = true;
			}
		}
		// right fixed merge view
		horzColumns = grid.getHorzColumns(this.rfixedStartCol(), this._rfixedCols);
		for (i = 0, cnt = horzColumns.length; i < cnt; i++) {
			col = horzColumns[i];
			if (col instanceof ValueColumn && col.canMerge()) {
				merges = col.stateFor(ColumnMergeManager.MERGE_ROOMS);
				if (!merges) {
					merges = new ColumnMergeManager(col);
					col.setState(ColumnMergeManager.MERGE_ROOMS, merges);
				}
				merges.refresh(first, last);
				rooms = merges.getRooms();
				rfixedMergeView.addColumnRooms(col, rooms);
				this._columnMerged = true;
			}			
		}
		// body merge view
		horzColumns = grid.getHorzColumns(this._fixedCols, this._columns.length - this._fixedCols - this._rfixedCols);
		for (i = 0, cnt = horzColumns.length; i < cnt; i++) {
			col = horzColumns[i];
			if (col instanceof ValueColumn && col.canMerge()) {
				merges = col.stateFor(ColumnMergeManager.MERGE_ROOMS);
				if (!merges) {
					merges = new ColumnMergeManager(col);
					col.setState(ColumnMergeManager.MERGE_ROOMS, merges);
				}
				merges.refresh(first, last);
				rooms = merges.getRooms();
				mergeView.addColumnRooms(col, rooms);
				this._columnMerged = true;
			}
		}
		mergeView.clearFooters();
		if (fixed) {
			fixedMergeView.clearFooters();
		}
		if (rfixed) {
			rfixedMergeView.clearFooters();
		}
		grid.mergeHeaderView().clearHeaders();
	},
	$_layoutItems: function (parent, r) {
		var i, model, top;
		var grid = this._grid;
		var isTree = this._grid instanceof TreeView;
		var rowGroupView = grid.rowGroupView();
		var bodyView = grid.bodyView();
		var fixedView = grid.fixedBodyView();
		var rfixedView = grid.rfixedBodyView();
		var fixed = this._fixedCols > 0;
		var rfixed = this._rfixedCols > 0;
		rowGroupView.clearBody();
		bodyView.clearItems();
		fixedView.clearItems();
		rfixedView.clearItems();
		for (i = 0; i < this._fixedItemCount; i++) {
			model = this._items.getItem(i);
			if (model instanceof GroupItemImpl) {
				rowGroupView.addHeader(model);
			} else if (model instanceof GroupFooter) {
				rowGroupView.addFooter(model);
			} else if (!model.isMerged()) {
				bodyView.addItem(model);
				if (fixed) {
					fixedView.addItem(model);
				}
				if (rfixed) {
					rfixedView.addItem(model);
				}
			}
		}
		top = this._topIndex + this._fixedRows;
		for (i = 0; i < this._itemCount; i++) {
			model = this._items.getItem(i + top);
			if (model instanceof GroupItemImpl) {
				rowGroupView.addHeader(model);
			} else if (model instanceof GroupFooter) {
				rowGroupView.addFooter(model);
			} else if (!model.isMerged()) {
				bodyView.addItem(model);
				if (fixed) {
					fixedView.addItem(model);
				}
				if (rfixed) {
					rfixedView.addItem(model);
				}
			}
		}
		bodyView.layoutContent(this);
		if (fixed || (fixedView.childCount() > 0 && !isTree)) {
			fixedView.layoutContent(this);
		}
		if (rfixed || (rfixedView.childCount() > 0 && !isTree)) {
			rfixedView.layoutContent(this);
		}
		if (this.isRowGrouped() || (rowGroupView.childCount() > 0 && !isTree)) {
			rowGroupView.layoutContent(this);
		}
	},
	$_layoutMerges: function () {
		var i,
			mergeView,
			top,
			model,
			fixedView,
			rfixedView,
			headerView,
			grid = this._grid,
			fixed = this._fixedCols > 0,
			rfixed = this._rfixedCols > 0;
		mergeView = grid.mergeView();
		top = this._topIndex + this._fixedRows;
		for (i = 0; i < this._itemCount; i++) {
			model = this._items.getItem(i + top);
			if (model instanceof MergedGroupFooter) {
				mergeView.addFooter(model);
			}
		}
		mergeView.layoutContent(this);
		if (fixed) {
			fixedView = grid.fixedMergeView();
			for (i = 0; i < this._itemCount; i++) {
				model = this._items.getItem(i + top);
				if (model instanceof MergedGroupFooter) {
					fixedView.addFooter(model);
				}
			}
			fixedView.layoutContent(this);
		}
		if (rfixed) {
			rfixedView = grid.rfixedMergeView();
			for (i = 0; i < this._itemCount; i++) {
				model = this._items.getItem(i + top);
				if (model instanceof MergedGroupFooter) {
					rfixedView.addFooter(model);
				}
			}
			rfixedView.layoutContent(this);
		}
		headerView = grid.mergeHeaderView();
		for (i = 0; i < this._itemCount; i++) {
			model = this._items.getItem(i + top);
			if (model instanceof MergedGroupHeader) {
				headerView.addHeader(model);
			}
		}
		headerView.layoutContent(this);
	},
	_doFitGroupWidth: function (group, visibleOnly, minWidth, maxWidth) {
		var grid = this._grid;
		var itemCount = grid.itemCount();
		if (itemCount < 1) {
			return 2;
		}
		var maxw = 0;
		for (var i = group.visibleCount(); i--;) {
			var column = group.getVisibleItem(i);
			var w;
			if (column instanceof ColumnGroup) {
				w = this._doFitGroupWidth(column, visibleOnly, minWidth, maxWidth);
			} else {
				w = this._doFitColumnWidth(column, visibleOnly, minWidth, maxWidth, true);
			}
			if (group.orientation() == ColumnGroupOrientation.HORIZONTAL) {
				ColumnGroup.changeWidth(column, w - column.groupWidth(), false);
				maxw += w;
			} else {
				maxw = Math.max(maxw, w);
			}
		}
		if (group.orientation() == ColumnGroupOrientation.VERTICAL) {
			if (maxWidth > 0) {
				maxw = Math.min(maxw, maxWidth);
			}
			if (minWidth > 0) {
				maxw = Math.max(maxw, minWidth);
			}
			maxw = Math.max(maxw,2);
			ColumnGroup.changeWidth(group, maxw - group.groupWidth(), false);
		}
		return maxw;
	},
	_doFitColumnWidth: function (column, visibleOnly, minWidth, maxWidth, calcOnly) {
		var i, cellView, renderer, sz,
			w = 2,
			grid = this._grid,
			body = grid.body(),
			defWidth = this._options.defaultColumnWidth(),
			itemCount = grid.itemCount();
		if (itemCount < 1) {
			return w;
		}
		cellView = (column instanceof SeriesColumn) ? new TestSeriesCellElement(grid) : new TestDataCellElement(grid);
		var start = 0;
		var end = itemCount;
		if (visibleOnly) {
			start = grid.topItem();
			end = start + this.itemCount();
			if ((itemCount = this.fixedItemCount()) > 0) {
				for (i = 0; i < itemCount; i++) {
					cellView.updateCell(body.getCell(CellIndex.temp(grid, i, column)));
					sz = cellView.measure(grid, defWidth, MAX_INT);
					w = Math.max(w, sz.width);
				}
			}
		}
		for (i = start; i < end; i++) {
			var index = CellIndex.temp(grid, i, column);
			if (index.dataRow() > -1) {
				cellView.updateCell(body.getCell(index));
				sz = cellView.measure(grid, defWidth, MAX_INT);
				w = Math.max(w, sz.width);
			}		
		}
		if (maxWidth > 0) {
			w = Math.min(w, maxWidth);
		}
		if (minWidth > 0) {
			w = Math.max(w, minWidth);
		}
		!calcOnly && ColumnGroup.changeWidth(column, w - column.groupWidth(), false);
		return w;
	},
	_getColumnRectInRoot: function (column, r) {
		var root = column.root();
		var c = column.parent();
		r.copy(column.layoutRect());
		while (c != root) {
			r.offset(c.layoutRect().x, c.layoutRect().y);
			c = c.parent();
		}
	},
	_clearFitWidths: function () {
		this.grid()._clearFitWidths();
	},
	_getColumnWidth: function (index) {
		var rfixedCol = this.rfixedStartCol();
		return index < this._fixedCols ? (this._fixedColumnPoints[index + 1] - this._fixedColumnPoints[index]) :
			index >= rfixedStart ? (this._rfixedColumnPoints[index - rfixedCol + 1] - this._rfixedColumnPoints[index - rfixedCol]) :
				this._columnPoints[index - this._fixedCols + 1] - this._columnPoints[index - this._fixedCols];
	},
	_setFitWidth: function (column, w) {
		column._fitWidth = w;
		var group = _cast(column, ColumnGroup);
		if (group) {
			group.resetFitWidths();
		}
	}
});
var TestDataCellElement = defineClass("TestDataCellElement", DataCellElement, {
	init : function(grid) {
		this._super();
		this._grid = grid;
	},
	grid: function () {
		return this._grid;
	}
});
var TestSeriesCellElement = defineClass("TestSeriesCellElement", SeriesCellElement, {
	init : function(grid) {
		this._super();
		this._grid = grid;
	},
	grid: function () {
		return this._grid;
	}
});