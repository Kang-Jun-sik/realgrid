var TapDragTracker = defineClass("TapDragTracker", null, {
	init: function(grid, name) {
		this._super();
		this._grid = grid;
		this._name = name;
	},
	grid: function () {
		return this._grid;
	},
	name: function () {
		return this._name;
	},
	start: function(startX, startY, currX, currY) {
		return this._doStart(startX, startY, currX, currY);
	},
	drag: function(startX, startY, currX, currY) {
		return this._doDrag(startX, startY, currX, currY);
	},
	drop: function (x, y) {
		this._doDrop(x, y);
	},
	cancel: function () {
		this._doCancel();
	},
	_doStart: function(startX, startY, currX, currY) {
		return true;
	},
	_doDrag: function(startX, startY, currX, currY) {
		return true;
	},
	_doDrop: function (x, y) {
	},
	_doCancel: function () {
	}
});
var MobileScrollTracker = defineClass("MobileScrollTracker", TapDragTracker, {
	init: function(grid) {
		this._super(grid, "mobileScrollTracker");
		this._tapX = this._tapY = NaN;
		this._vertical = true;
	},
	_doStart: function(startX, startY, currX, currY) {
		var dx = currX - startX;
		var dy = currY - startY;
		this._vertical = Math.abs(dy) >= Math.abs(dx);
		if (this._vertical) {
			this._grid.setTopIndex(this._grid.topIndex() + (dy > 0 ? -1 : 1));
		} else {
			this._grid.setLeftPos(this._grid.leftPos() - dx);
		}
		this._tapX = currX;
		this._tapY = currY;
		return true;
	},
	_doDrag: function(prevX, prevY, currX, currY) {
		var dx = currX - this._tapX;
		var dy = currY - this._tapY;
		var vertical = Math.abs(dy) >= Math.abs(dx);
		if (vertical != this._vertical) {
			if (vertical && Math.abs(dy) > Math.abs(dx) * 2 || !vertical && Math.abs(dx) > Math.abs(dy) * 2) {
				this._vertical = vertical;
			}
		}
		if (this._vertical) {
			if (Math.abs(dy) > 5) {
				this._grid.setTopIndex(this._grid.topIndex() + (dy > 0 ? -1 : 1));
				this._tapY = currY;
			}
		} else {
			this._grid.setLeftPos(this._grid.leftPos() - dx);
			this._tapX = currX;
		}
		return true;
	}
});
var MobileRowSelectTracker = defineClass("MobileRowSelectTracker", TapDragTracker, {
	init: function(grid, cell) {
		this._super(grid, "mobileRowSelectTracker");
		this._cell = cell;
		this._item = null;
	},
	_doStart: function(startX, startY, currX, currY) {
		var grid = this._grid;
		var selections = grid._selections;
		var index = this._cell.index();
		selections.clear();
		this._item = selections.add(index, index, SelectionStyle.ROWS);
		return true;
	},
	_doDrag: function(prevX, prevY, currX, currY) {
		var grid = this._grid;
		var index = grid.pointToIndex(currX, currY, false);
		if (index.I() >= 0) {
			this._item.resizeTo(index);
		}
		return true;
	}
});
var MobileColumnSelectTracker = defineClass("MobileColumnSelectTracker", TapDragTracker, {
	init: function(grid, cell) {
		this._super(grid, "mobileColumnSelectTracker");
		this._cell = cell;
		this._item = null;
	},
	_doStart: function(startX, startY, currX, currY) {
		var grid = this._grid;
		var selections = grid._selections;
		var index = this._cell.index();
		selections.clear();
		this._item = selections.add(index, index, SelectionStyle.COLUMNS);
		return true;
	},
	_doDrag: function(prevX, prevY, currX, currY) {
		var grid = this._grid;
		var index = grid.pointToIndex(currX, currY, false);
		if (grid.groupingOptions().isEnabled() && index.dataColumn() && index.dataColumn().isGroupable() && grid.panel().isVisible()) {
			//currY -= grid.y();
			if (currY < grid.layoutManager().headerBounds().y) {
        		var panelView = grid.panelView();
        		if (panelView) {
	        		panelView.setState(GridPanelElement.GROUPING);
		        	if (!grid.isGrouped(index.column())) {
						grid.addGroupBy(panelView.groupingIndex(), index.column());
					}
					panelView.setState(GridPanelElement.NORMAL);
					return false;
				}
			}
		}
		if (index.column()) {
			this._item.inflate(currX > prevX ? "right" : "left", index);
		}
		return true;
	}
});
var MobileSelectHandleTracker = defineClass("MobileSelectHandleTracker", TapDragTracker, {
	init: function(grid, handle) {
		this._super(grid, "mobileSelectHandleTracker");
		this._handle = handle;
	},
	_doStart: function(startX, startY, currX, currY) {
		return true;
	},
	_doDrag: function(prevX, prevY, currX, currY) {
		var grid = this._grid;
		var index = grid.pointToIndex(currX, currY, false);
		if (index.I() >= 0) {
			var item = this._handle.view().item();
			item.inflate(this._handle.dir(), index);
		}
		return true;
	}
});
var /* internal */ TabScrollThumbTracker = defineClass("TabScrollThumbTracker", null, {
	init: function (grid, thumbView) {
		this._super();
		this._grid = grid;
		this._thumb = thumbView;
	},
	start: function (x, y) {
		this._thumb.setPressed(true);
		var bar = this._thumb.scrollBar();
		var p = bar.containerToElement(x, y);
		if (bar.isVertical()) {
			this._offset = p.y - this._thumb.y();
		} else {
			this._offset = p.x - this._thumb.x();
		}
	},
	move: function (x, y) {
		this.$_doScroll(x, y, ScrollEventType.THUMB_TRACK);
	},
	stop: function (x, y) {
		this._thumb.setPressed(false);
		this.$_doScroll(x, y, ScrollEventType.THUMB_END);
	},
	$_doScroll: function (x, y, eventType) {
		var bar = this._thumb.scrollBar();
		var len = bar._maxPosition - bar._min + 1;
		var szBtn = bar._buttonSize;
		var p = bar.containerToElement(x, y);
		if (bar.isVertical()) {
			p.y -= this._offset;
			p.y = (p.y - szBtn) * len / (bar.height() - szBtn * 2 - this._thumb.height());
			bar._doScroll(eventType, 0, _int(p.y));
		} else {
			p.x -= this._offset;
			p.x = (p.x - szBtn) * len / (bar.width() - szBtn * 2 - this._thumb.width());
			bar._doScroll(eventType, 0, _int(p.x));
		}
	}
});
var /* internal */ MobileResizer = defineClass("MobileResizer", LayerElement, {
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