var MobileSelectionTool = defineClass("MobileSelectionTool", GridTool, {
	init: function (owner) {
		this._super(owner, "mobileSelectionTool");
		this._clickElement = null;
		this._clickCell = null;
		this._clickHandle = null;
		this._tapTracker = null;
		this._touchManager = new SingleTouchManager(owner);
		this._swipeTimer = null;
		this._swipeDistance = 0;
		this._swipeDuration = 0;
		this._swipeStarted = null;
		this._swipePrev = undefined;
		this._swipeAmount = 0;
		this._tapX = this._tapY = NaN;
		this._touchManager.setTouchHandler(function (x, y) {
			return this.onTouch(x, y);
		}.bind(this));
		this._touchManager.setTapHandler(function (x, y) {
			return this.onTap(x, y);
		}.bind(this));
		this._touchManager.setDoubleTapHandler(function (x, y) {
			return this.onDoubleTap(x, y);
		}.bind(this));
		this._touchManager.setLongTapHandler(function (x, y) {
			return this.onLongTap(x, y);
		}.bind(this));
		this._touchManager.setDragStartHandler(function (startX, startY, x, y) {
			return this.onDragStart(startX, startY, x, y);
		}.bind(this));
		this._touchManager.setDragHandler(function (prevX, prevY, x, y) {
			return this.onDrag(prevX, prevY, x, y);
		}.bind(this));
		this._touchManager.setSwipeHandler(function (duration, distance, dir) {
			return this.onSwipe(duration, distance, dir);
		}.bind(this));
	},
	touchManager: function () {
		return this._touchManager;
	},
	_doActivate: function () {
		this._super();
	},
	_doDeactivate: function () {
		this._super();
	},
	_doMouseDown: function (x, y, ctrlKey, shiftKey) {
		this.onTouch(x, y);
	},
	_doMouseMove: function (x, y) {
	},
	_doMouseUp: function (x, y) {
		this.onTap(x, y);
	},
	_doLayoutChanged: function (x, y) {
	},
	_doFocusedIndexChanging: function (newIndex) {
	},
	_doFocusedIndexChanged: function (oldIndex, newIndex) {
	},
	_doDblClick: function (x, y) {
		this.onDoubleTap(x, y);
	},
	_resetFocusedView: function () {
		var grid = this._grid;
		var index = this.focused();
		if (grid.displayOptions().isFocusVisible() && grid.isValid(index)) {
			var cell = this._grid.getFocusedCellView();
			if (cell) {
				var r = cell.boundsBy(grid);
				if (r.width > 0 && r.height > 0) {
					if (grid._container.$_rich) {
						r.x++;
						r.y++;
					}
					this._focusView.setRect(r);
					this._focusView.setEditing(grid.isEditing(), cell.getButtonWidth ? cell.getButtonWidth() : 0);
					this._focusView.setVisible(true);
				} else {
					this._focusView.setVisible(false);
				}
			} else {
				this._focusView.setVisible(false);
			}
		} else {
			this._focusView.setVisible(false);
		}
	},
	_stopTapTracker: function (accept) {
		if (this._tapTracker) {
			try {
				accept ? this._tapTracker.drop(x, y) : this._tapTracker.cancel();
			} finally {
				this._tapTracker = null;
			}
		}
	},
	onTouch: function (x, y) {
		clearInterval(this._swipeTimer);
		this._stopTapTracker(false);
		var grid = this._grid;
		this._clickCell = this._clickHandle = null;
		var clickElement = this._clickElement = this.findElementAt(x, y, false);
		this._clickHandle = _cast(clickElement, HandleElement);
		this._clickCell = _cast(clickElement, CellElement);
		if (clickElement instanceof ScrollThumb) {
			return new TabScrollThumbTracker(grid, clickElement);
		} else if (clickElement instanceof ScrollButton) {
			return new ScrollButtonTimer(clickElement);
		} else if (clickElement instanceof ScrollBar) {
			/*
			if (clickElement.ptInTrack(x, y, true)) {
				return new ScrollTrackTimer(clickElement, true);
			} else if (clickElement.ptInTrack(x, y, false)) {
				return new ScrollTrackTimer(clickElement, false);
			}
			*/
		}
	},
	onTap: function (x, y) {
		var grid = this._grid;
		var selections = grid._selections;
		var clickCell = this._clickCell;
		var clickElement = this._clickElement;
		var index = clickCell ? clickCell.index() : null;
		var col = clickCell ? index.column() : null;
		selections.clear();
		grid.closeFilterSelector();
		if (clickCell instanceof DataCellElement) {
			index.normalize(grid);
			this.setFocused(index, true);
            this.dataCellClicked(index);
		} else if (clickCell instanceof HeaderCellElement && clickCell.isClickable()) {
			if (!grid.isEmpty() && col instanceof DataColumn && col.isSortable() && grid.sortingOptions().isEnabled()) {
				grid.sortColumn(col);
			}
		} else if (clickElement instanceof IndicatorCellElement) {
			selections.add(index, index, SelectionStyle.ROWS);
		} else if (clickElement instanceof IndicatorHeadElement) {
			this._indicatorCellClicked(-1);
		} else if (clickElement instanceof IndicatorFootElement) {
			this._indicatorCellClicked(-2);
        } else if (clickElement instanceof CheckBarCellElement) {
			this._checkCellClicked(clickElement);
		} else if (clickElement instanceof CheckBarHeadElement) {
			this._checkAllClicked(clickElement);
		} else if (clickElement instanceof CheckBarFootElement) {
			this._checkBarFootClicked(clickCell);
		} else if (clickElement instanceof StateBarCellElement) {
			this._stateBarCellClicked(clickCell.index().itemIndex());
		} else if (clickElement instanceof StateBarHeadElement) {
			this._stateBarCellClicked(-1);
		} else if (clickElement instanceof StateBarFootElement) {
			this._stateBarCellClicked(-2);
		} else if (clickElement instanceof RowGroupHeadCellElement) {
			this._rowGroupHeadClicked();
		} else if (clickElement instanceof RowGroupFootCellElement) {
			this._rowGroupFootClicked();
		} else if (clickElement instanceof RowGroupHeaderCellElement) {
			this._rowGroupHeaderFooterClicked(-1, clickElement.index());
		} else if (clickElement instanceof GroupFooterCellElement) {
			this._rowGroupHeaderFooterClicked(-2, clickElement.index());
		} else if (clickElement instanceof RowGroupBarCellElement) {
			this._rowGroupBarClicked(elt.level());
		} else if (clickElement instanceof RowGroupExpandHandle) {
			this._rowGroupBarClicked(-1);
		} else if (clickElement instanceof RowGroupExpanderElement) {
			this._rowGroupBarClicked(-2);
		} else if (clickElement instanceof GroupByView) {
			this._panelClicked(0);
		} else if (clickElement instanceof FooterCellElement) {
			this._footerCellClicked(clickElement.index().column());
		} else if (clickElement instanceof HeaderFilterHandle && grid.filteringOptions().isEnabled()) {
			var parent = clickElement.parent();
			col = parent.column();
			if (grid.isFilterSelecting(col)) {
				grid.closeFilterSelector();
			} else {
	 			grid.selectColumnFilters(clickElement.parent());
			}
		} else if (clickElement instanceof MobileSelectionHandle) {
		}
	},
	onLongTap: function (x, y) {
		var grid = this._grid;
		var clickCell = this._clickCell;
		var clickElement = this._clickElement;
		var index = clickCell ? clickCell.index() : null;
		var col = clickCell ? index.column() : null;
		var renderer;
		if (clickElement instanceof DataCellElement || clickElement instanceof MobileSelectionHandle) {
			if (clickElement instanceof MobileSelectionHandle) {
				clickCell = grid.getFocusedCellView();
				index = grid.focusedIndex();
				col = index.column();
			}
			if (col.button() != CellButton.NONE && clickCell._getButtonVisible(col.buttonVisibility())) {
				this.cellButtonClicked(index);
				return false;
			} else if ((renderer = col.rendererObj()) && (renderer instanceof LinkCellRenderer || renderer instanceof CheckCellRenderer)) {
				this._performRendererClick(index, clickCell, x, y, false, true);
			} 
        } else if (clickElement instanceof HeaderCellElement && clickElement.parent() instanceof GroupByView) {
        	if (grid.groupingOptions().isEnabled() && index.dataColumn() && index.dataColumn().isGroupable() && grid.panel().isVisible()) {
        		var panelView = grid.panelView();
        		if (panelView) {

	        		panelView.setState(GridPanelElement.UNGROUPING);
		        	if (grid.isGrouped(col)) {
						grid.removeGroupBy(col);
					}
					panelView.setState(GridPanelElement.NORMAL);
					return false;
				}
        	}
        }
		return true;
	},
	onDoubleTap: function (x, y) {
		if (this._clickElement instanceof DataCellElement) {
            this.dataCellDblClicked(this._clickElement.index());
		} else if (this._clickElement instanceof RowGroupHeaderCellElement) {
			var groupItem = _cast(this._clickElement.item(), GroupItemImpl);
			if (groupItem) {
				groupItem.setExpanded(!groupItem.isExpanded());
			}
		} else if (this._clickElement instanceof HeaderCellElement) {
			if (this._clickElement.parent() instanceof HeaderElement) {
				this._grid._fireColumnHeaderDblClicked(this._clickElement.index().column());
			} else {
				this._grid._fireRowGroupPanelDblClicked(this._clickElement.index().column());
			}
		} else if (this._clickCell instanceof FooterCellElement) {
			if (this._clickCell.error()) {
				this._grid.alertCellError(this._clickCell, this._clickCell.errorDetail() || this._clickCell.error());
			} else {
				this._grid._fireFooterCellDblClicked(this._clickCell.index().column());
			}
		} else if (this._clickCell instanceof GroupFooterCellElement && this._clickCell.error()) {
			this._grid.alertCellError(this._clickCell, this._clickCell.errorDetail() || this._clickCell.error());
		} else if (this._clickCell instanceof IndicatorHeadElement) {
			this._grid._fireIndicatorCellDblClicked(-1);
		} else if (this._clickCell instanceof IndicatorFootElement) {
			this._grid._fireIndicatorCellDblClicked(-2);
		} else if (this._clickCell instanceof StateBarHeadElement) {
			this._grid._fireStateBarCellDblClicked(-1);
		} else if (this._clickCell instanceof StateBarFootElement) {
			this._grid._fireStateBarCellDblClicked(-2);
		} else if (this._clickCell instanceof StateBarCellElement) {
			this._grid._fireStateBarCellDblClicked(this._clickCell.index().itemIndex());
		} else if (this._clickCell instanceof CheckBarFootElement) {
			this._grid._fireCheckBarFootDblClicked(-2);
		} else if (this._clickCell instanceof RowGroupHeadCellElement) {
			this._grid._fireRowGroupHeadDblClicked();
		} else if (this._clickCell instanceof RowGroupFootCellElement) {
			this._grid._fireRowGroupFootDblClicked();
		} else if (this._clickCell instanceof RowGroupHeaderCellElement) {
			this._grid._fireRowGroupHeaderFooterDblClicked(-1, this._clickCell.index());
		} else if (this._clickCell instanceof GroupFooterCellElement) {
			this._grid._fireRowGroupHeaderFooterDblClicked(-2, this._clickCell.index());
		} else if (this._clickCell instanceof RowGroupBarCellElement) {
			this._grid._fireRowGroupBarDblClicked(this._clickCell.level());
		} else if (this._clickCell instanceof RowGroupExpandHandle) {
			this._grid._fireRowGroupBarDblClicked(-1);
		} else if (this._clickCell instanceof RowGroupExpanderElement) {
			this._grid._fireRowGroupBarDblClicked(-2);
		} else if (this._clickElement instanceof GroupByView) {
			this._grid._firePanelDblClicked(0);
		}
	},
	onDragStart: function (startX, startY, currX, currY) {
		var elt = this._clickElement;
		var tracker = null;
		if (elt instanceof DataCellElement) {
			tracker = new MobileScrollTracker(this._grid);
		} else if (elt instanceof IndicatorCellElement) {
			tracker = new MobileRowSelectTracker(this._grid, elt);
		} else if (elt instanceof HeaderCellElement) {
			tracker = new MobileColumnSelectTracker(this._grid, elt);
		} else if (elt instanceof MobileSelectionHandle) {
			tracker = new MobileSelectHandleTracker(this._grid, elt);
		} else if (elt instanceof ScrollThumb) {
		}
		if (tracker && tracker.start(startX, startY, currX, currY)) {
			this._tapTracker = tracker;
		}
	},
	onDrag: function (prevX, prevY, currX, currY) {
		var tracker = this._tapTracker;
		if (tracker) {
			if (!tracker.drag(prevX, prevY, currX, currY)) {
				tracker.cancel();
				this._tapTracker = null;
			}
		}
	},
	onSwipe: function (duration, distance, dir) {
		if (!(this._clickElement instanceof DataCellElement)) {
			return;
		}
		var grid = this._grid;
		var delta = 1;
		switch (dir) {
			case "right":
				grid.setLeftPos(grid.leftPos() - distance / 20);
				break;
			case "left":
				grid.setLeftPos(grid.leftPos() + distance / 20);
				break;
			case "bottom":
				delta = -1;
			case "top":
				this._swipeDistance = delta * distance / 20;
				this._swipeDuration = duration;
				this._swipePrev = this._swipeStarted = getTimer();
				this._swipeAmount = 0;
				this._swipeTimer = setInterval(this.$_scrollRow.bind(this), 50);
				break;
		}
	},
	_checkCellClicked: function (cell) {
		var grid = this.grid();
		if (grid.editOptions().isCheckable()) {
			var checkBar = grid.checkBar();
			var item = cell.item();
			if (item.isCheckable() && (checkBar.isShowGroup() || item.dataRow() >= 0)) {
                grid.makeItemVisible(item.index());
				grid.itemSource().checkItem(item, !item.isChecked(), checkBar.isExclusive(), true);
			}
		}
	},
	_checkAllClicked: function (cell) {
		var grid = this.grid();
		var checkBar = grid.checkBar();
		if (!grid.isEmpty() && grid.editOptions().isCheckable()) {
			if (checkBar.isShowAll() && !checkBar.isExclusive()) {
				cell.setChecked(!cell.isChecked());
				grid.itemSource().checkAll(cell.isChecked(), checkBar.isVisibleOnly(), checkBar.isCheckableOnly(), true);
			} else {
				this._checkBarHeadClicked();
			}
		}
	},
	_performRendererClick: function (index, cell, x, y) {
		var grid = this.grid();
		if (!grid.isEditing() && index.isValid() && cell) {
			var column = index.dataColumn();
			if (column) {
				var renderer = cell.renderer(); // column.renderer;

				if (!grid.isReadOnly(index) && renderer.isEditable()) {
					var item = index.item();
					if ((grid.isItemEditing(item) || grid.canUpdate(item, index.dataField())) && grid.canWrite(index)) {
						if (grid.edit(index)) {
							renderer.performEdit(index);
						}
					}
				} else if (renderer.isClickable(index)) {
					renderer.performClick(cell, x, y);
				}

			}
		}
	},
	_footerCellClicked: function (cell) {
		this.grid()._fireFooterCellClicked(cell);
	},
	_checkBarHeadClicked: function (cell) {
		this.grid()._fireCheckBarHeadClicked(cell);
	},
	_checkBarFootClicked: function (cell) {
		this.grid()._fireCheckBarFootClicked(cell);
	},
	_indicatorCellClicked: function (index) {
		this.grid()._fireIndicatorCellClicked(index);
	},
	_stateBarCellClicked: function (index) {
		this.grid()._fireStateBarCellClicked(index);
	},
	_rowGroupHeadFootClicked: function () {
		this.grid()._fireRowGroupHeadFootClicked();
	},
	_rowGroupHeaderFooterClicked: function (kind, index) {
		this.grid()._fireRowGroupHeaderFooterClicked(kind, index);
	},
	_rowGroupBarClicked: function (index) {
		this.grid()._fireRowGroupBarClicked(index);
	},
	_panelClicked: function (index) {
		this.grid()._firePanelClicked(index);
	},
	_rowGroupPanelClicked: function (cell) {
		this.grid()._fireRowGroupPanelClicked(cell);
	},
	$_scrollRow: function () {
		var t = getTimer();
		if (t - this._swipeStarted < this._swipeDuration) {
			var dt = getTimer() - this._swipePrev;
			var rows = (this._swipeDistance - this._swipeAmount) * dt / this._swipeDuration;
			this._swipeAmount -= rows;
			this._swipePrev = t;
			this._grid.setTopIndex(this._grid.topIndex() + rows);
		} else {
			clearInterval(this._swipeTimer);
		}
	}
});
var MobileFocusView = defineClass("MobileFocusView", LayerElement, {
	init: function () {
		this._super("focusView");
		this._border = new SolidPen(0xff333333, 2);
		this._editBorder = new SolidPen(0xff000000 + (82 << 16) + (146 << 8) + 247, 2);
		this._editing = false;
	},
	setEditing: function (editing, buttonWidth) {
		if (editing != this._editing) {
			this._editing = editing;
			this._buttonWidth = buttonWidth;
			this.invalidate();
		}
	},
	_doDraw: function (g) {
		var w = this.width() - (this._editing ? this._buttonWidth : 0);
		g.drawBoundsI(null, this._editing ? this._editBorder : this._border, -1, -1, w - 1, this.height() - 1);
	}
});
var MobileContextMenu = defineClass("MobileContextMenu", LayerElement, {
	init: function () {
		this._super("focusView");
		this._border = new SolidPen(0xff333333, 2);
		this._editBorder = new SolidPen(0xff000000 + (82 << 16) + (146 << 8) + 247, 2);
		this._editing = false;
	},
	setMenu: function (menu) {
	},
	_doDraw: function (g) {
		var w = this.width() - (this._editing ? this._buttonWidth : 0);
		g.drawBoundsI(null, this._editing ? this._editBorder : this._border, -1, -1, w - 1, this.height() - 1);
	}
});
var MobileEditController = defineClass("MobileEditController", null, {
	init: function (grid) {
		this._super();
		this._grid = grid;
		this._editIndex = new CellIndex();
		this._editor = null;
	},
	editIndex: function () {
		return this._editIndex.clone();
	},
	isEditing: function () {
		return this._editor && this._editor.isEditing();
	},
	setFocus: function () {
		return false;
	},
	resetEditor: function (resetValue) {
	},
	reprepareEditor: function (index) {
	},
	invalidateEditor: function () {
	},
	closeList: function () {
	},
	focusedIndexChanging: function () {
		return true;
	},
	focusedIndexChanged: function (oldIndex, newIndex) {
	},
	showEditor: function (index) {
	},
	hideEditor: function () {
	},
	commitEditor: function (hideEditor) {
	},
	cancelEditor: function (hideEditor) {
		return false;
	},
	fillSearchItems: function (column, searchKey, values, labels) {
	},
	buttonClicked: function (index) {
	},
	dataColumnChanged: function (column) {
	},
	_focusHandler: function (event) {
	},
	onEditorStart: function (editor) {
	},
	onEditorKeyDown: function (editor, keyCode, ctrl, shift) {
	},
	onEditorChange: function (editor) {
	},
	onEditorSearch: function (editor, text) {
	}
});
var MobileSelectionHandle = defineClass("MobileSelectionHandle", VisualElement, {
	init: function (selectionView, dir) {
		this._super(selectionView._dom, "mobileSelectionHandle");
		this._view = selectionView;
		this._dir = dir;
		//this._background = new SolidBrush(0xff333333);
		//this._border = new SolidPen(0xffdddddd, 1);
		this.setWidth(21);
		this.setHeight(21);
	},
	view: function () {
		return this._view;
	},
	dir: function () {
		return this._dir;
	},
	propertyChanged: function (/*prop, value*/) {
		this.invalidate();
	},
	_doDraw: function (g) {
		g.drawBounds(this._background, this._border, 5, 5, 11, 11);
	}
});
var MobileSelectionView = defineClass("MobileSelectionView", LayerElement, {
	init : function(dom) {
		this._super(dom, "mobileSelectionView");
		this._item = null;
		this._background = MobileSelectionView.$$_defBackground;
		this._border = MobileSelectionView.$$_defBorder;
		this.addElement(this._leftHandle = new MobileSelectionHandle(this, "left"));
		this.addElement(this._rightHandle = new MobileSelectionHandle(this, "right"));
		this.addElement(this._topHandle = new MobileSelectionHandle(this, "top"));
		this.addElement(this._bottomHandle = new MobileSelectionHandle(this, "bottom"));
	},
	background: null,
	border: null,
	item: function () {
		return this._item;
	},
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
	setHandleBackground: function (value) {
		this._leftHandle._background = value;
		this._rightHandle._background = value;
		this._topHandle._background = value;
		this._bottomHandle._background = value;
	},
	setHandleBorder: function (value) {
		this._leftHandle._border = value;
		this._rightHandle._border = value;
		this._topHandle._border = value;
		this._bottomHandle._border = value;
	},
	updateElement: function (item, styles) {
		this._item = item;
		this.setBackground(styles.background());
		this.setBorder(styles.border());
		this.setHandleBackground(styles.figureBackground());
		this.setHandleBorder(styles.figureBorder());
		var cw = this.width();
		var ch = this.height();
		var w = this._leftHandle.width();
		var h = this._leftHandle.height();
		var x = (cw - w) / 2;
		var y = (ch - h) / 2;
		var st = item.style();
		var isBlock = st == SelectionStyle.BLOCK || st == SelectionStyle.SINGLE;
		this._leftHandle._context = this._context;
		this._rightHandle._context = this._context;
		this._topHandle._context = this._context;
		this._bottomHandle._context = this._context;
		this._leftHandle.setVisible(isBlock || SelectionStyle.isColumn(st));
		this._rightHandle.setVisible(this._leftHandle.isVisible());
		this._topHandle.setVisible(isBlock || SelectionStyle.isRow(st));
		this._bottomHandle.setVisible(this._topHandle.isVisible());
		this._leftHandle.isVisible() && this._leftHandle.move(-w / 2, y);
		this._rightHandle.isVisible() && this._rightHandle.move(cw - w / 2, y);
		this._topHandle.isVisible() && this._topHandle.move(x, -h / 2);
		this._bottomHandle.isVisible() && this._bottomHandle.move(x, ch - h / 2);
		this._leftHandle.invalidate();
		this._rightHandle.invalidate();
		this._topHandle.invalidate();
		this._bottomHandle.invalidate();
	},
	_doDraw: function (g) {
		var grid = this.container().gridView();
		var lm = grid.layoutManager();
		var r = lm.gridBounds();
		r = grid.translateBy(this, r);
		g.clipRectEx(r);
		g.drawBoundsI(this._background, this._border, 0, 0, this.width(), this.height());
	}
});
MobileSelectionView.$$_defBackground = new SolidBrush(0x10000000);
MobileSelectionView.$$_defBorder = new SolidPen(0xff333333, 2);