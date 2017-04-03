var SelectTracker = defineClass("SelectTracker", GridDragTracker, {
	init: function(request, name) {
		this._super(request.cell().grid(), name);
		this._request = request;
	},
	isStartWhenCreated: function () {
		if (this._request.cell() instanceof GroupFooterCellElement ||
			this._request.cell() instanceof RowGroupHeaderCellElement) {
			return false;
		} else {
			return true;
		}
	},
	_doEnded: function() {
		var item = this._getItem();
		if (item) {
			this.grid()._fireSelectionEnded(item);
		}
	},
	_getItem: function () {
		return null;
	}
});
var BlockSelectTracker = defineClass("BlockSelectTracker", SelectTracker, {
	init : function(request) {
		this._super(request, "blockSelectTracker");
		this._item = null;
		this._timer = null;
		this._currx = NaN;
		this._curry = NaN;
		this._rowPrevLoop = 0;
		this._rowLoop = 0;
		this._colPrevLoop = 0;
		this._colLoop = 0;
		this._interval = 0;
	},
	_getItem: function () {
		return this._item;
	},
	_doStart: function (x, y, shift) {
		var activeTool = this.container().activeTool();
		var manager = this._request.manager();
		var lm = manager && manager._grid && manager._grid.layoutManager();		
		var idx = activeTool && activeTool instanceof GridViewSelectionTool ? activeTool.findElementAt(x,y,false).index() : this.grid().pointToIndex(_int(x), _int(y), true);
		if (lm.isMergedCell(idx)) {
			idx = this.grid().pointToIndex(_int(x), _int(y), true);
		}
		manager.setItemStyle(SelectionStyle.BLOCK);
		if (shift) {
		} else {
			manager.clear();
			this._item = manager.add(idx, idx, SelectionStyle.BLOCK);
		}
		return Boolean(this._item);
	},
	_doDrag: function (x, y) {
		if (this._item) {
			var elt;
			var index;
			var grid = this.grid();
			var lm = grid.layoutManager();
			this._currx = x = grid.containerToGridX(x);
			this._curry = y = grid.containerToGridY(y);
			if (y > lm.footerBounds().y || y < lm.gridBounds().y ||	x < lm.gridBounds().x || x > lm.clientRect().right()) {
				this._startTimer();
			} else {
				this._stopTimer();
				index = this.grid().pointToIndex(x, y, true);
				if (index.column() && index.I() >= 0) {
					this._item.resizeTo(index);
				}
			}
			return true;
		}
		return false;
	},
	_doEnded: function () {
		this._stopTimer();
		this._super();
	},
	_startTimer: function () {
		if (!this._timer) {
			this._rowLoop = this._rowPrevLoop = this._colLoop = this._colPrevLoop = 0;
			this._timer = setInterval(this._timerHandler.bind(this), 30);
			this._grid.selections().lock();
		}
	},
	_stopTimer: function () {
		if (this._timer) {
			clearInterval(this._timer);
			this._timer = null;
			this._grid.selections().unlock();
		}
	},
	_timerHandler: function () {
		var grid = this._grid;
		var x = this._currx;
		var y = this._curry;
		var lm = grid.layoutManager();
		var cx = 0;
		var cy = 0;
		if (y > lm.footerBounds().y) {
			cy = Math.max(0, Math.min(3, (y - lm.footerBounds().y) / 40));
			this._interval = 4 - cy;
			this._rowLoop++;
		} else if (y < lm.gridBounds().y) {
			cy = Math.max(0, Math.min(3, (lm.gridBounds().y - y) / 40));
			this._interval = 4 - cy;
			this._rowLoop++;
		}
		if (x > lm.clientRect().right()) {
			cx = Math.max(0, Math.min(3, (x - lm.clientRect().right()) / 40));
			this._interval = 4 - cx;
			this._colLoop++;
		} else if (x < lm.gridBounds().x) {
			cx = Math.max(0, Math.min(3, (lm.gridBounds().x - x) / 40));
			this._interval = 4 - cx;
			this._colLoop++;
		}
		var scrolled = false;
		var cnt = Math.max(cx, cy);
		if (cnt > 0) {
			this._interval = 4 - Math.max(cx, cy);
		}
		if (this._rowLoop - this._rowPrevLoop >= this._interval) {
			this._rowPrevLoop = this._rowLoop;
			if (y > lm.footerBounds().y) {
				if (grid.topItem() + lm.fullItemCount() < grid.itemCount()) {
					grid.setTopIndex(grid.topIndex() + 1);
					scrolled = true;
				}
			} else if (y < lm.gridBounds().y) {
				if (grid.topItem() > lm.fixedItemCount()) {
					grid.setTopIndex(grid.topIndex() - 1);
					scrolled = true;
				}
			}
		}
		if (!scrolled) {
			if (this._colLoop - this._colPrevLoop >= this._interval * 2) {
				this._colPrevLoop = this._colLoop;
				if (x > lm.clientRect().right()) {
					grid.setLeftCol(grid.leftCol() + 1);
					scrolled = true;
				} else if (x < lm.gridBounds().left() && grid.leftPos() > 0) {
					grid.setLeftCol(grid.leftCol() - 1);
					scrolled = true;
				}
			}
		}
		if (scrolled) {
			var index = grid.pointToIndex(this._currx, this._curry, false);
			if (index.column()) {
				index.itemIndex(Math.min(Math.max(0, index.I(), grid.topIndex()), grid.itemCount() - 1));
				this._item.resizeTo(index);
			}
		}
	}
});
var RowsSelectTracker = defineClass("RowsSelectTracker", SelectTracker, {
	init: function (request) {
		this._super(request, "rowsSelectTracker");
		this._item = null;
		this._timer = null;
		this._currx = NaN;
		this._curry = NaN;
		this._prevLoop = 0;
		this._loop = 0;
		this._colPrevLoop = 0;
		this._colLoop = 0;
		this._interval = 0;
	},
	_getItem: function () {
		return this._item;
	},
	_doStart: function (x, y, shift) {
		var activeTool = this.container().activeTool();
		var manager = this._request.manager();
		var lm = manager && manager._grid && manager._grid.layoutManager();		
		var idx = activeTool && activeTool instanceof GridSelectionTool ? activeTool.findElementAt(x,y,false).index() : idx = this.grid().pointToIndex(_int(x), _int(y), true);
		if (lm.isMergedCell(idx)) {
			idx = this.grid().pointToIndex(_int(x), _int(y), true);
		}
		manager.setItemStyle(SelectionStyle.ROWS);
		if (shift) {
		} else {
			manager.clear();
			this._item = manager.add(idx, idx, SelectionStyle.ROWS);
		}
		return Boolean(this._item);
	},
	_doDrag: function (x, y) {
		if (this._item) {
			var index;
			var grid = this.grid();
			var lm = grid.layoutManager();
			this._currx = x = grid.containerToGridX(x);
			this._curry = y = grid.containerToGridY(y);
			if (y > lm.footerBounds().y || y < lm.gridBounds().y || x < 0 || x > lm.clientRect().right()) {
				this._startTimer();
			} else {
				this._stopTimer();
				index = grid.pointToIndex(x, y, false);
				if (index.I() >= 0) {
					this._item.resizeTo(index);
				}
			}
			return true;
		}
		return false;
	},
	_doEnded: function () {
		this._stopTimer();
		this._super();
	},
	_startTimer: function () {
		if (!this._timer) {
			this._loop = this._prevLoop = this._colLoop = this._colPrevLoop = 0;
			this._interval = 1;
			this._timer = setInterval(this._timerHandler.bind(this), 30);
			this._grid.selections().lock();
		}
	},
	_stopTimer: function () {
		if (this._timer) {
			clearInterval(this._timer);
			this._timer = null;
			this._grid.selections().unlock();
		}
	},
	_timerHandler: function () {
		var grid = this._grid;
		var x = this._currx;
		var y = this._curry;
		var lm = grid.layoutManager();
		var index;
		var cnt;
		if (y > lm.footerBounds().y) {
			cnt = Math.max(0, Math.min(3, (y - lm.footerBounds().y) / 40));
			this._interval = 4 - cnt;
			this._loop++;
		} else if (y < lm.gridBounds().y) {
			cnt = Math.max(0, Math.min(3, (lm.gridBounds().y - y) / 40));
			this._interval = 4 - cnt;
			this._loop++;
		}
		if (this._loop - this._prevLoop >= this._interval) {
			this._prevLoop = this._loop;
			if (y > lm.footerBounds().y) {
				grid.setTopIndex(grid.topIndex() + 1);
			} else if (y < lm.gridBounds().y) {
				grid.setTopIndex(grid.topIndex() - 1);
			}
			index = grid.pointToIndex(this._currx, this._curry, false); // 이 함수가 한 칸씩 밀어준다.
				index.itemIndex(Math.min(Math.max(0, index.I(), grid.topIndex()), grid.itemCount() - 1));
				this._item.resizeTo(index);
		} else {
			if (x > lm.clientRect().right()) {
				cnt = Math.max(0, Math.min(3, (x - lm.clientRect().right()) / 40));
				this._interval = 4 - cnt;
				this._colLoop++;
			} else if (x < 0) {
				cnt = Math.max(0, Math.min(3, (lm.gridBounds().x - x) / 40));
				this._interval = 4 - cnt;
				this._colLoop++;
			}
			if (this._colLoop - this._colPrevLoop >= this._interval * 2) {
				this._colPrevLoop = this._colLoop;
				if (x > lm.clientRect().right()) {
					grid.setLeftCol(grid.leftCol() + 1);
				} else if (x < lm.gridBounds().x && grid.leftPos() > 0) {
					grid.setLeftCol(grid.leftCol() - 1);
				}
				index = grid.pointToIndex(this._currx, this._curry, false);
				if (index.I() >= 0) {
					index.itemIndex(Math.min(Math.max(0, index.I(), grid.topIndex()), grid.itemCount() - 1));
					this._item.resizeTo(index);
				}
			}
		}
	}
});
var ColumnsSelectTracker = defineClass("ColumnsSelectTracker", SelectTracker, {
	init: function (request) {
		this._super(request, "columnsSelectTracker");
		this._item = null;
		this._timer = null;
		this._currx = NaN;
		this._curry = NaN;
		this._prevLoop = 0;
		this._loop = 0;
		this._rowPrevLoop = 0;
		this._rowLoop = 0;
		this._interval = 0;
	},
	_getItem: function () {
		return this._item;
	},
	_doStart: function (x, y, shift) {
		var activeTool = this.container().activeTool();
		var idx = activeTool && activeTool instanceof GridViewSelectionTool ? activeTool.findElementAt(x,y,false).index() : this.grid().pointToIndex(_int(x), _int(y), true);
		var manager = this._request.manager();
		manager.setItemStyle(SelectionStyle.COLUMNS);
		if (shift) {
		} else {
			manager.clear();
			this._item = manager.add(idx, idx, SelectionStyle.COLUMNS);
		}
		return Boolean(this._item);
	},
	_doDrag: function (x, y) {
		if (this._item) {
			var grid = this.grid();
			var lm = grid.layoutManager();
			this._currx = x = grid.containerToGridX(x);
			this._curry = y = grid.containerToGridY(y);
			if (x < lm.gridBounds().x || x > lm.clientRect().right() || y > lm.footerBounds().y || y < 0) {
				this._startTimer();
			} else {
				this._stopTimer();
				var index = grid.pointToIndex(x, y, false);
				if (index.column()) {
					this._item.resizeTo(index);
				}
			}
			return true;
		}
		return false;
	},
	_doEnded: function () {
		this._stopTimer();
		this._super();
	},
	_startTimer: function () {
		if (!this._timer) {
			this._loop = this._prevLoop = this._rowLoop = this._rowPrevLoop = 0;
			this._interval = 1;
			this._timer = setInterval(this._timerHandler.bind(this), 30);
			this._grid.selections().lock();
		}
	},
	_stopTimer: function () {
		if (this._timer) {
			clearInterval(this._timer);
			this._timer = null;
			this._grid.selections().unlock();
		}
	},
	_timerHandler: function () {
		var grid = this._grid;
		var x = this._currx;
		var y = this._curry;
		var lm = grid.layoutManager();
		var index;
		var cnt;
		if (x > lm.clientRect().right()) {
			cnt = Math.max(0, Math.min(3, (x - lm.clientRect().right()) / 40));
			this._interval = 4 - cnt;
			this._loop++;
		} else if (x < lm.gridBounds().x) {
			cnt = Math.max(0, Math.min(3, (lm.gridBounds().x - x) / 40));
			this._interval = 4 - cnt;
			this._loop++;
		}
		if (this._loop - this._prevLoop >= this._interval * 2) {
			this._prevLoop = this._loop;
			if (x > lm.clientRect().right()) {
				grid.setLeftCol(grid.leftCol() + 1);
			} else if (x < lm.gridBounds().x && grid.leftPos() > 0) {
				grid.setLeftCol(grid.leftCol() - 1);
			}
			index = grid.pointToIndex(this._currx, this._curry, false);
			if (index.column) {
				this._item.resizeTo(index);
			}
		} else {
			if (y > lm.footerBounds().y) {
				cnt = Math.max(0, Math.min(3, (y - lm.footerBounds().y) / 40));
				this._interval = 4 - cnt;
				this._rowLoop++;
			} else if (y < 0) {
				cnt = Math.max(0, Math.min(3, (lm.gridBounds().y - y) / 40));
				this._interval = 4 - cnt;
				this._rowLoop++;
			}
			if (this._rowLoop - this._rowPrevLoop >= this._interval) {
				this._rowPrevLoop = this._rowLoop;
				if (y > lm.footerBounds().y) {
					grid.setTopIndex(grid.topIndex() + 1);
				} else if (y < lm.gridBounds().y) {
					grid.setTopIndex(grid.topIndex() - 1);
				}
				index = grid.pointToIndex(this._currx, this._curry, false);
				if (index.column()) {
					this._item.resizeTo(index);
				}
			}
		}
	}
});