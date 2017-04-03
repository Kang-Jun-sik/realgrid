var ColumnResizeTracker = defineClass("ColumnResizeTracker", GridDragTracker, {
	init: function(request) {
		this._super(request.cell().grid(), "columnResizeTracker");
		this._request = request;
		var cell = request.headerCell();
		var column = cell.index().column();
		if (column.group()) {
			this._cell = GroupCellElement.getRootOf(cell);
		} else {
			this._cell = cell;
		}
		this._startWidth = this._cell.width();
		this._offset = this.container().mouseX() - this._startWidth;
	},
	_doStart: function (x, y) {
		return true;
	},
	_doDrag: function (x, y) {
		var cell = this._request.headerCell();
		var column = cell.index().column();
		var x = this.container().mouseX() - this._offset;
		if (x >= 2) {
			ColumnGroup.changeWidth(column, x - this._startWidth, false, Column.MIN_WIDTH);
			this._startWidth = x;
		}
		return true;
	},
	_doEnded: function() {
		var cell = this._request.headerCell();
		var grid = this.grid();
		var column = cell.index().column();
		grid._fireColumnPropertyChanged(column, "width", column.width());
	}
});
var RowResizeTracker = defineClass("RowResizeTracker", GridDragTracker, {
	init: function(grid, request, x, y) {
		this._super(grid, "rowResizeTracker");
		this._request = request;
		var r = grid.layoutManager().getItemBounds(request.itemIndex());
		r.x += grid.x();
		r.y += grid.y();
		this._rowTop = r.y;
		this._rowBottom = r.bottom();
		this._offset = y - r.bottom();
	},
	_doStart: function(x, y) {
		return true;
	},
	_doDrag: function(x, y) {
		var h = y - this._offset - this._rowTop;
		if (h >= 2) {
			var request = this._request;
			var grid = this.grid();
			var opts = grid.displayOptions();
			if (opts.isEachRowResizable() && grid._rootColumn._dataLevel == 1) {
				if (request && request.itemIndex() >= 0) {
					var lm = grid.layoutManager();
					var itemIndex = request._itemIndex >= lm._fixedItemCount ? request._itemIndex + grid._topIndex : request._itemIndex;
					var item = lm._items.getItem(itemIndex);
					var dMaxHeight = opts.maxRowHeight();
					h = dMaxHeight && dMaxHeight < h ? dMaxHeight : h;
					var dataId = item.dataId();
					lm._itemHeights[dataId] = h;
					grid.refreshView();
				}
			} else {
				grid.displayOptions().setRowHeight(h);
			}
		}
		return true;
	}
});
var HeaderResizeTracker = defineClass("HeaderResizeTracker", GridDragTracker, {
	init : function(grid, request, x, y) {
		this._super(grid, "headerResizeTracker");
		this._request = request;
		var r = grid.layoutManager().headerBounds();
		this._headerTop = r.y;
		this._headerBottom = r.bottom();
		this._offset = y - r.bottom();
	},
	_doStart : function(x, y) {
		return true;
	},
	_doDrag : function(x, y) {
		if (this._grid.footer().isVisible() && y >= this._grid.layoutManager().footerBounds().y) {
			return false;
		}
		if (y >= this._grid.layoutManager().gridBounds().bottom()) {
			return false;
		}
		var h = y - this._offset - this._headerTop;
		if (h >= 2) {
			this._grid.header().setHeight(h);
		}
		return true;
	}
});
var HeaderSummaryResizeTracker = defineClass("HeaderSummaryResizeTracker", GridDragTracker, {
    init : function(grid, request, x, y) {
        this._super(grid, "headerResizeTracker");
        this._request = request;
        var r = grid.layoutManager().summaryBounds();
        this._summaryTop = r.y;
        this._summaryBottom = r.bottom();
        this._offset = y - r.bottom();
    },
    _doStart : function(x, y) {
        return true;
    },
    _doDrag : function(x, y) {
        if (this._grid.footer().isVisible() && y >= this._grid.layoutManager().footerBounds().y) {
            return false;
        }
        if (y >= this._grid.layoutManager().gridBounds().bottom()) {
            return false;
        }
        var h = y - this._offset - this._summaryTop;
        if (h >= 2) {
            this._grid.header().summary().setHeight(h);
        }
        return true;
    }
});
var FooterResizeTracker = defineClass("FooterResizeTracker", GridDragTracker, {
	init : function(grid, request, x, y) {
		this._super(grid, "footerResizeTracker");
		this._request = request;
		var r = grid.layoutManager().footerBounds();
		this._footerTop = r.y;
		this._footerBottom = r.bottom();
		this._offset = y - r.y;
	},
	_doStart : function(x, y) {
		return true;
	},
	_doDrag : function(x, y) {
		if (this._grid.header().isVisible() && y < this._grid.layoutManager().headerBounds().bottom()) {
			return false;
		}
		if (this._grid.panel() && this._grid.panel().isVisible() && y < this._grid.layoutManager().panelBounds().bottom()) {
			return false;
		}
		if (y < 0) {
			return false;
		}
		var h = this._footerBottom - y + this._offset;
		if (h >= 2) {
			this._grid.footer().setHeight(h);
		}
		return true;
	}
});
var ColumnMoveTracker2 = defineClass("ColumnMoveTracker2", GridDragTracker, {
	init: function(request, x, y) {
		this._super(request.cell().grid(), "columnMoveTracker2");
		this._request = request;
		this._sourceFeedback = new HeaderCellElement(this._grid, this._grid._dom, "columnMoveFeedback");
		this._sourceFeedback.setAlpha(0.7);
		this._targetFeedback = new ColumnMoveFeedback(this._grid._dom, "columnMoveTargetFeedback");
		this._targetFeedback.setAlpha(0.5);
		var p = request.cell().index().column().parent();
		if (p.isHorizontal()) {
			this._startPos = x;
			this._orgPos = request.cell().boundsByContainer().x;
		} else {
			this._startPos = y;
			this._orgPos = request.cell().boundsByContainer().y;
		}
	},
	_canAccept: function (x, y) {
		var cell = _cast(this._request.cell(), HeaderCellElement);
		return cell != this._target;
	},
	_doStart: function (x, y) {
		var cell = this._request.cell();
		var grid = this.grid();
		var r = cell.boundsBy(grid);
		grid.addFeedbackElement(this._sourceFeedback);
		grid.addFeedbackElement(this._targetFeedback);
		this._sourceFeedback.setBounds(r.x, r.y, cell.width(), cell.height());
		this._sourceFeedback.updateCell(grid.header().getCell(cell.index()));
		this.$_setTarget(null);
		return true;
	},
	_doDrag: function (x, y) {
		var grid = this.grid();
		var lm = grid.layoutManager();
		if (grid.panel().isVisible() && y >= lm.panelBounds().y && y < lm.panelBounds().bottom()) {
			return false;
		}
		var column = this._request.cell().index().column();
		var target = null;
		var group;
		var r;
		var headerView;
		if (column.group()) {
			target = this._request.cell();
			if (column instanceof ColumnGroup) {
				target = target.parent();
			}
			if (column.parent().isHorizontal()) {
				this._sourceFeedback.setX(this._orgPos + (this._currentX - this._startPos));
			} else {
				this._sourceFeedback.setY(this._orgPos + (this._currentY - this._startPos));
			}
			group = _cast(target.parent(), HeaderGroupCellElement);
			r = group.boundsByContainer();
			x -= r.x;
			y -= r.y;
			target = group.getCellAt(x, y);
		} else { // 최상위 셀들.
			if (column.parent().isHorizontal()) {
				this._sourceFeedback.setX(this._orgPos + (x - this._startPos));
			} else {
				this._sourceFeedback.setY(this._orgPos + (y - this._startPos));
			}
			headerView = grid.headerView();
			r = headerView.boundsByContainer();
			x -= r.x;
			y -= r.y;
			target = headerView.getCellAt(x, y);
		}
		var column2 = target ? target.index().column() : null;
		if (target && column2.isRoot() && !grid.canMoveToIndex(column2.root().displayIndex())) {
			target = null;
		}
		if (!target || column2.group() == column.group()) {
			this.$_setTarget(target);
		}
		return true;
	},
	_doCanceled: function () {
	},
	_doCompleted: function () {
		if (this._target) {
			var source = _cast(this._request.cell(), HeaderCellElement);
			var column = source.index().column();
			column.setDisplayIndex(this._target.index().column().displayIndex());
		}
	},
	_doEnded: function () {
		var grid = this.grid();
		grid.removeFeedbackElement(this._targetFeedback);
		grid.removeFeedbackElement(this._sourceFeedback);
		if (this._completed) {
			var cell = this._request.cell();
			var column = cell && cell.index && cell.index().column();
			grid._fireColumnPropertyChanged(column, "displayIndex", column.displayIndex());
		}
	},
	getNextRequest: function (x, y) {
		var grid = this.grid();
		var index = this._request.cell().index();
		if (grid.groupingOptions().isEnabled() && index.dataColumn() && index.dataColumn().isGroupable() && grid.panel().isVisible()) { 
			y -= grid.y();
			if (y < grid.layoutManager().headerBounds().y && y >= 0) {
				return new RowGroupingRequest(this._request.cell());
			}
		}
		return null;
	},
	$_setTarget: function (cell) {
		if (cell == this._target) {
			return;
		}
		var source = this._request.cell();
		var column = source.index().column();
		var group = _cast(column, ColumnGroup);
		var target = this._target = cell;
		if (target) {
			var grid = this.grid();
			var oldPos = grid.leftPos();
			grid.makeCellVisible(target.index());
			if (grid.leftPos() != oldPos) {
				grid.refreshView();
				grid.container().updateNow();
			}
			var r = target.boundsBy(grid);
			if (target === source) {
				this._targetFeedback._direction = "none";
			} else if (group && group === target.index().column()) {
				this._targetFeedback.direction = "none";
			} else if (!column.group() || column.group().isHorizontal()) {
				var x1 = target.x();
				var x2 = group ? source.parent().x() : source.x();
				this._targetFeedback._direction = "horz";
				this._targetFeedback._reversed = x1 > x2;
			} else {
				var y1 = target.y();
				var y2 = group ? source.parent().y() : source.y();
				this._targetFeedback._direction = "vert";
				this._targetFeedback._reversed = y1 > y2;
			}
			this._targetFeedback.setBounds(r.x, r.y, target.width(), target.height());
			this._targetFeedback.setVisible(true);
			this._targetFeedback.invalidate();
		} else {
			this._targetFeedback.setVisible(false);
		}
	}
});
var ColumnMoveTracker3 = defineClass("ColumnMoveTracker3", GridDragTracker, {
	init: function(request, x, y) {
		this._super(request.cell().grid(), "columnMoveTracker3");
		this._request = request;
		this._sourceFeedback = new HeaderCellElement(this._grid, this._grid._dom, "columnMoveFeedback");
		this._sourceFeedback.setAlpha(0.7);
		this._targetFeedback = new ColumnMoveFeedback(this._grid._dom, "columnMoveTargetFeedback");
		this._targetFeedback.setAlpha(0.5);
		this._startX = y;
		this._startY = y;
		var r = request.cell().boundsByContainer();
		this._orgX = r.x;
		this._orgY = r.y;
		this._target = null;
		this._dir = null;
	},
	_canAccept: function (x, y) {
		var cell = _cast(this._request.cell(), HeaderCellElement);
		return cell != this._target;
	},
	_doStart: function(x, y) {
		var cell = this._request.cell();
		var grid = this.grid();
		var r = cell.boundsBy(grid);
		grid.addFeedbackElement(this._sourceFeedback);
		grid.addFeedbackElement(this._targetFeedback);
		this._sourceFeedback.setBounds(r.x, r.y, cell.width(), cell.height());
		this._sourceFeedback.updateCell(grid.header().getCell(cell.index()));
		this.$_setTarget(null);
		return true;
	},
	_doDrag: function(x, y) {
		var grid = this.grid();
		var lm = grid.layoutManager();
		if (grid.panel().isVisible() && y >= lm.panelBounds().y && y < lm.panelBounds().bottom()) {
			return false;
		}
		if (this._request.cell().index().column().parent().count() < 2) {
			return true;
		}
		this._sourceFeedback.setX(x);
		this._sourceFeedback.setY(y);
		var header = grid.headerView();
		var r = header.boundsByContainer();
		x -= r.x;
		y -= r.y;
		var target = header.getCellAt(x, y, true);
		var column = target ? target.index().column() : null;
		if (target && column.isRoot() && !grid.canMoveToIndex(column.root().displayIndex())) {
			target = null;
		}
		this.$_setTarget(target);
		return true;
	},
	_doCanceled: function() {
	},
	_doCompleted: function() {
		if (this._target) {
			var source = _cast(this._request.cell(), CellElement);
			var colSource = source.index().column();
			var colTarget = this._target.index().column();
			if (colTarget.parent() === colSource.parent()) {
				colSource.setDisplayIndex(colTarget.displayIndex());
			} else {
				colSource.setParent(colTarget.parent());
				colSource.setDisplayIndex(colTarget.displayIndex() + (this._dir == "r" ? 1 : 0));
			}
		}
	},
	_doEnded: function() {
		var grid = this.grid();
		grid.removeFeedbackElement(this._targetFeedback);
		grid.removeFeedbackElement(this._sourceFeedback);
		if (this._completed) {
			var cell = this._request.cell();
			var column = cell && cell.index && cell.index().column();
			grid._fireColumnPropertyChanged(column, "displayIndex", column.displayIndex());
		}
	},
	getNextRequest: function(x, y) {
		var grid = this.grid();
		var index = this._request.cell().index();
		if (grid.groupingOptions().isEnabled() && index.dataColumn() && index.dataColumn().isGroupable()
				&& grid.panel().isVisible()) {
			y -= grid.y();
			if (y < grid.layoutManager().headerBounds().y && y >= 0) {
				return new RowGroupingRequest(this._request.cell());
			}
		}
		return null;
	},
	$_setTarget: function(cell) {
		var x = this.currentX();
		var y = this.currentY();
		var source = this._request.cell();
		var sourceColumn = source.index().column();
		var column = cell ? cell.index().column() : null;
		if (sourceColumn instanceof ColumnGroup && sourceColumn.isAncestorOf(column)) {
			return;
		}
		var equals = cell == this._target;
		var target = this._target = cell;
		if (target) {
			var grid = this.grid();
			var oldPos = grid.leftPos();
			if (!equals) {
				grid.makeCellVisible(target.index());
				if (grid.leftPos != oldPos) {
					grid.refreshView();
					grid.updateNow();
				}
			}
			var dir;
			var r = target.boundsBy(grid);
			if (target === source) {
				this._targetFeedback._direction = "none";
			} else if (!column.group() || column.group().isHorizontal()) {
				var x1, x2;
				this._targetFeedback._direction = "horz";
				if (column.parent() == sourceColumn.parent() && !(column instanceof ColumnGroup)) {
					if (!equals) {
						x1 = target.x();
						x2 = (sourceColumn instanceof ColumnGroup) ? source.parent().x() : source.x();
						this._targetFeedback._reversed = x1 > x2;
					} 
				} else {
					x1 = target.width() / 2;
					x2 = x - r.x;
					dir = x2 > x1 ? "r" : "n";
					if (!equals || dir != this._dir) {
						this._dir = dir;
						if (column instanceof ColumnGroup) {
							r.height = target.parent().height();
						}
						this._targetFeedback._reversed = dir == "r";
					}
				}
			} else {
				var y1, y2;
				this._targetFeedback._direction = "vert";
				if (column.parent() == sourceColumn.parent() && !(column instanceof ColumnGroup)) {
					y1 = target.y();
					y2 = (sourceColumn instanceof ColumnGroup) ? source.parent().y() : source.y();
					this._targetFeedback._reversed = y1 > y2;
				} else {
					y1 = target.height() / 2;
					y2 = y - r.y;
					dir = y2 > y1 ? "r" : "n";
					if (!equals || dir != this._dir) {
						this._dir = dir;
						if (column instanceof ColumnGroup) {
							r.width = target.parent().width();
							r.height = target.parent().height();
						}
						this._targetFeedback._reversed = dir == "r";
					}
				}
			}
			this._targetFeedback.setRect(r);
			this._targetFeedback.setVisible(true);
		} else {
			this._targetFeedback.setVisible(false);
		}
	}
});
var ColumnMoveFeedback = defineClass("ColumnMoveFeedback", VisualElement, {
	init: function (dom, name) {
		this._super(dom, name);
		this._direction = "none";	// "horz", "vert"
		this._reversed = false;
		this._lineNone = new SolidPen("rgba(0, 0, 0, 0.7)", 2);
		this._fillNone = new SolidBrush("rgba(0, 0, 0, 0.2)");
		this._line = new SolidPen("rgba(0, 0, 0, 1)", 2);
		this._fill = new SolidBrush(0xff000000);
	},
	_doDraw: function(g) {
		var x;
		var y;
		var r = this.clientRect();
		switch (this._direction) {
		case "horz":
			if (!this._reversed) {
				y = r.height - 2;
				g.drawBoundsI(this._fill, null, 0, 1, 3, y);
				g.drawLineI(this._line, 1, 1, 7, 1);
				g.drawLineI(this._line, 1, y, 7, y);
			} else {
				x = r.width;
				y = r.height - 2;
				g.drawBoundsI(this._fill, null, x - 3, 1, 3, y);
				g.drawLineI(this._line, x - 1, 1, x - 7, 1);
				g.drawLineI(this._line, x - 1, y, x - 7, y);
			}
			break;
		case "vert":
			if (!this._reversed) {
				w = r.width - 2;
				g.drawBoundsI(this._fill, null, 1, 0, w, 3);
				g.drawLineI(this._line, 1, 1, 1, 7);
				g.drawLineI(this._line, w, 1, w, 7);
			} else {
				x = r.width - 2;
				y = r.height;
				g.drawBoundsI(this._fill, null, 1, y - 3, x, 3);
				g.drawLineI(this._line, 1, y - 1, 1, y - 7);
				g.drawLineI(this._line, x, y - 1, x, y - 7);
			}
			break;
		default:
			g.drawRectI(this._fillNone, this._lineNone, r);
			break;
		}
	}
});
var CellButtonTracker = defineClass("CellButtonTracker", GridDragTracker, {
	init: function (request) {
		this._super(request.cell().grid(), "cellButtonTracker");
		this._request = request;
		this._buttonIndex = request.buttonIndex();
	},
	isStartWhenCreated: function () {
		return true;
	},
	_doStart: function (x, y) {
		this._request.cell().setButtonState(true, true, this._buttonIndex);
		return true;
	},
	_doDrag: function (x, y) {
		var cell = this._request.cell();
		var hit = cell.ptInButton(cell.mouseX(), cell.mouseY());
		cell.setButtonState(hit, hit);
		return true;
	},
	_canAccept: function (x, y) {
		var cell = this._request.cell();
		var p = cell.containerToElement(x, y);
		return cell.ptInButton(p.x, p.y);
	},
	_doCanceled: function () {
	},
	_doCompleted: function () {
		this._request.cell().grid().activeTool().cellButtonClicked(this._request.cell().index(), this._buttonIndex);
	},
	_doEnded: function () {
		this._request.cell().setButtonState(false, false, this._buttonIndex);
	}
});
var EditButtonTracker = defineClass("EditButtonTracker", GridDragTracker, {
	init: function (request) {
		this._super(request.cell().grid(), "editButtonTracker");
		this._request = request;
	},
	isStartWhenCreated: function () {
		return true;
	},
	_doStart: function (x, y) {
		this._request.cell().setEditButtonState(true, true);
		return true;
	},
	_doDrag: function (x, y) {
		var cell = this._request.cell();
		var hit = cell.ptInButton(cell.mouseX(), cell.mouseY());
		cell.setEditButtonState(hit, hit);
		return true;
	},
	_canAccept: function (x, y) {
		var cell = this._request.cell();
		var p = cell.containerToElement(x, y);
		return cell.ptInEditButton(p.x, p.y);
	},
	_doCanceled: function () {
	},
	_doCompleted: function () {
		var cell = this._request.cell();
		var index = cell.index().clone();
		if (cell instanceof MergedDataCellElement) {
			if (cell.innerIndex() >= 0) {
				index.setItemIndex(index.itemIndex() + cell.innerIndex());
			}
		}
		cell.grid().activeTool().editButtonClicked(index);
	},
	_doEnded: function () {
		this._request.cell().setEditButtonState(false, false);
	}
});
var DataButtonTracker = defineClass("DataButtonTracker", GridDragTracker, {
    init: function (request) {
        this._super(request.cell().grid(), "dataButtonTracker");
        this._request = request;
    },
    isStartWhenCreated: function () {
        return true;
    },
    _doStart: function (x, y) {
        this._request.cell().setPressed(true);
        return true;
    },
    _doDrag: function (x, y) {
        var cell = this._request.cell();
        var hit = cell.ptInDataButton(cell.mouseX(), cell.mouseY());
        cell.setPressed(hit);
        return true;
    },
    _canAccept: function (x, y) {
        var cell = this._request.cell();
        var p = cell.containerToElement(x, y);
        return cell.ptInDataButton(p.x, p.y);
    },
    _doCanceled: function () {
    },
    _doCompleted: function () {
         this._request.cell().grid().activeTool().imageButtonClicked(this._request.cell().index());
    },
    _doEnded: function () {
        this._request.cell().setPressed(false);
    }
});