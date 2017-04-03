var /* @abstract */ GridMergeRule = defineClass("GridMergeRule", null, {
	init: function() {
		this._super();
	},
	parseInit: function (items, field, start, count, flags) {
		throwAbstractError();
	},
	parseBounds: function (items, field, start, end, flags) {
		throwAbstractError();
	}
});
var RowGroupMergeRule = defineClass("RowGroupMergeRule", GridMergeRule, {
	init: function() {
		this._super();
		this._level = 0;
		this._mergeMode = false;
	},
	parseInit: function (items, field, start, count, flags) {
		var itemCount = items.itemCount();
		count = Math.min(itemCount - start, count);
		if (count < 1) {
			return;
		}
		if (this._mergeMode) {
			this.$_parseMerged(items, field, start, count, flags);
		} else {
			this.$_parseNormal(items, field, start, count, flags);
		}
	},
	parseBounds: function (items, field, start, end, flags) {
		var item;
		var itemCount = items.itemCount();
		if (itemCount < 1) return;
		start = Math.max(0, start);
		while (start >= 0 && flags[start] <= 0) {
			item = items.getItem(start);
			if (item == this.$_getAncestor(item, this._level)) {
				break;
			}
			start--;
		}
		while (start <= end && flags[start] > 0) {
			start++;
		}
		if (start <= end) {
			if (this._mergeMode) {
				this.$_parseMergedBounds(items, field, start, end, flags);
			} else {
				this.$_parseNormalBounds(items, field, start, end, flags);
			}
		}
	},
	$_getAncestor: function (item, level) {
		var group = _cast(item, GroupItem);
		if (!group) {
			group = item.parent();
		}
		while (group.level() > level) {
			group = group.parent();
		}
		return group;
	},
	$_parseNormal: function (items, field, start, count, flags) {
		var itemCount = items.itemCount();
		if (itemCount < 1) return;
		var item = items.getItem(start);
		var prev = item;
		var p = start;
		var i = p + 1;
		flags[p] = p + 1;
		while (i < itemCount) {
			item = items.getItem(i);
			if (item.level() != prev.level() || item.constructor !== prev.constructor || item instanceof GroupFooter) {
				p = i;
			}
			flags[i] = p + 1;
			i++;
			prev = item;
		}
	},
	$_parseMerged: function (items, field, start, count, flags) {
		var itemCount = items.itemCount();
		if (itemCount < 1) return;
		var item = items.getItem(start);
		var group = this.$_getAncestor(item, this._level);
		var parent;
		var p = start;
		var i = flags[p] = p + 1;
		while (i < itemCount) {
			item = items.getItem(i);
			parent = this.$_getAncestor(item, this._level);
			if (parent != group) {
				if (i >= count) {
					break;
				}
				group = parent;
				p = i;
			}
			flags[i] = p + 1;
			i++;
		}
	},
	$_parseNormalBounds: function (items, field, start, end, flags) {
		var itemCount = items.itemCount();
		if (itemCount < 1) return;
		var item = items.getItem(start);
		var prev = item;
		var p = start;
		var i = p + 1;
		flags[p] = p + 1;
		while (i < itemCount) {
			item = items.getItem(i);
			if (item.level() != prev.level() || item.constructor !== prev.constructor) {
				p = i;
			}
			flags[i] = p + 1;
			i++;
			prev = item;
		}
	},
	$_parseMergedBounds: function (items, field, start, end, flags) {
		var itemCount = items.itemCount();
		if (itemCount < 1) return;
		var item = items.getItem(start);
		var group = this.$_getAncestor(item, this._level);
		var parent;
		var p = start;
		var i = p + 1;
		flags[p] = p + 1;
		while (i < itemCount) {
			item = items.getItem(i);
			parent = this.$_getAncestor(item, this._level);
			if (parent != group) {
				if (i > end) {
					break;
				}
				group = parent;
				p = i;
			}
			flags[i] = p + 1;
			i++;
		}
	}
});
RowGroupMergeRule.$_default = new RowGroupMergeRule();
RowGroupMergeRule.INIT_COUNT = 200;
RowGroupMergeRule.getDefault = function (groupLevel, mergeMode) {
	var rule = RowGroupMergeRule.$_default;
	rule._level = groupLevel;
	rule._mergeMode = mergeMode;
	return rule;
};
var ColumnMergeRule = defineClass("ColumnMergeRule", GridMergeRule, {
	init: function(criteria) {
		this._super();
		ColumnMergeRule.$_runtime = ColumnMergeRule.$_runtime || new ColumnMergeRuntime();
		this._runtime = ColumnMergeRule.$_runtime;
		this._exprNode = null;
		this.setCriteria(criteria);
	},
	criteria: null,
	setCriteria: function (value) {
		value = value ? value.trim() : null;
		if (value != this._criteria) {
			this._criteria = value;
			this._exprNode = value ? ExpressionParser.Default.parse(value, null) : null;
			this._changed();
		}
	},
	$_isRow: function (item, header) {
		var row = item instanceof GridRow && !(item instanceof DummyEditItem);
		if (row && !header) {
			var group = item.parent();
			row = group.isExpanded() || group.firstItem() != item;
		}
		return row;
	},
	parseInit: function (items, field, start, count, flags) {
		var header = false;
		var itemCount = items.itemCount();
		var valueCount = items.dataSource()._values.length;
		count = Math.min(itemCount - start, count);
		if (count < 1 || valueCount <= 0) {
			return;
		}
		this._runtime.setDataSource(items.dataSource());
		var item = null;
		var i = start;
		while (i < itemCount) {
			item = items.getItem(i);
			if (this.$_isRow(item, header)) {
				break;
			}
			flags[i] = i + 1;
			i++;
		}
		if (i >= itemCount) {
			return;
		}
		var prev = $$_EMPTY_TEXT_VALUE, v;
		var isValue = this._exprNode.isIdentifier("value");
		var p = start = i;
		flags[p] = p + 1;
		if (item._dataRow >= valueCount) { return };
		if (isValue) {
			prev = item.getData(field);
		} else {
			this._runtime.setItem(item, field);
			prev = this._exprNode.evaluate(this._runtime);
		}				
		for (i = start + 1; i < itemCount; i++) {
			item = items.getItem(i);
			if (this.$_isRow(item, header)) {
				if (item._dataRow >= valueCount) { break };
				if (isValue) {
					v = item.getData(field);
				} else {
					this._runtime.setItem(item, field);
					v = this._exprNode.evaluate(this._runtime);
				}			
				if (v instanceof Date && prev instanceof Date ? +v != +prev : v != prev) {
					if (i >= count) {
						break;
					}
					p = i;
					prev = v;
				}
				flags[i] = p + 1;
			} else {
				if (i >= count) {
					break;
				}
				prev = $$_EMPTY_TEXT_VALUE;
				p = i;
				flags[i] = p + 1;
			}
		}
	},
	parseBounds: function (items, field, start, end, flags) {
		var header = false;
		var itemCount = items.itemCount();
		if (itemCount < 1) {
			return;
		}
		var isValue = this._exprNode.isIdentifier("value");
		var item, prev, i, y;
		var v = UNDEFINED;
		var p = Math.max(0, start);
		var s = p;
		var cont = -1;
		if (p > 0 && flags[p] <= 0) {
			item = items.getItem(p);
			if (this.$_isRow(item, header)) {
				if (isValue) {
					prev = items.getItem(p).getData(field);
				} else {
					this._runtime.setItem(item, field);
					prev = this._exprNode.evaluate(this._runtime);
				}				
				p--;
				while (p >= 0) {
					item = items.getItem(p);
					if (!this.$_isRow(item, header)) {
						break;
					}
					if (isValue) {
						v = item.getData(field);
					} else {
						this._runtime.setItem(item, field);
						v = this._exprNode.evaluate(this._runtime);
					}				
					if (v instanceof Date && prev instanceof Date ? +v != +prev : v != prev) { 
						break;
					}
					p--;
				}
				for (i = s - 1; i > p; i--) {
					flags[i] = p + 2;
				}
				if (s - 1 > p) {
					cont = p + 1;
				}
			} else {
				flags[p] = p + 1;
				for (i = s - 1; i > p; i--) {
					flags[i] = p + 2;
				}
				if (s - 1 > p + 1) {
					cont = p + 2;
				}
				p--;
				while (p >= 0 && flags[p] <= 0 && !this.$_isRow(items.getItem(p), header)) {
					flags[p] = p + 1;
					p--;
				}
			}
		}
		p = Math.max(0, start);
		while (p <= end && flags[p] > 0) {
			p++;
		}
		while (p <= end && !this.$_isRow(items.getItem(p), header)) {
			flags[p] = p + 1;
			p++;
		}
		if (p < end) {
			s = p;
			item = items.getItem(p);
			if (isValue) {
				prev = item.getData(field);
			} else {
				this._runtime.setItem(item, field);
				prev = this._exprNode.evaluate(this._runtime);
			}				
			p++;
			while (p < itemCount) {
				item = items.getItem(p);
				if (this.$_isRow(item, header)) {
					if (isValue) {
						v = item.getData(field);
					} else {
						this._runtime.setItem(item, field);
						v = this._exprNode.evaluate(this._runtime);
					}				
					if (v != prev) {
						y = s;
						if (cont >= 0) {
							y = cont;
							cont = -1;
						}
						for (i = s; i < p; i++) {
							flags[i] = y + 1;
						}
						if (p >= end) {
							break;
						}
						prev = v;
						s = p;
					} else {
						flags[p] = s + 1;
					}
					p++;
				} else {
					y = s;
					if (cont >= 0) {
						y = cont;
						cont = -1;
					}
					for (i = s; i < p; i++) {
						flags[i] = y + 1;
					}
					flags[p] = p + 1;
					p++;
					while ((p < itemCount) && !this.$_isRow(items.getItem(p), header)) {
						flags[p] = p + 1;
						p++;
					}
					s = p;
					if (p >= end) {
						break;
					}
				}
			}
			if (p == itemCount && v == prev) {
				y = (cont >= 0) ? cont : s;
				for (i = s; i < p; i++) {
					flags[i] = y + 1;
				}
			}
		}
	},
	_changed: function () {
	}
}, {
	INIT_COUNT: 200,
	createRule: function (source) {
		if (source && source.criteria) {
			return new ColumnMergeRule(source.criteria);
		}
		return null;
	}
}, function (f) {
	f.$_runtime = null;
});
var /* abstract */ GridMergeRoom = defineClass("GridMergeRoom", null, {
	init: function() {
		this._super();
	},
	scope: function () {
	},
	group: function () /* GroupItem */ {
	},
	headItem: function () {
		return -1;
	},
	tailItem: function () {
		return -1;
	},
	getHead: function (index) /* CellIndex */ {
	},
	getTail: function (index) /* CellIndex */ {
	},
	isHead: function (index) {
	},
	isTail: function (index) {
	},
	contains: function (index) {
	}
});
var ColumnMergeRoom = defineClass("ColumnMergeRoom", GridMergeRoom, {
	init: function(range) {
		this._super();
		this._column = range.C1();
		this._head = range.top();
		this._tail = range.bottom();
		this._group = null;
	},
	column: function () {
		return this._column;
	},
	head: function () {
		return this._head;
	},
	tail: function () {
		return this._tail;
	},
	scope: function () {
		return this._column;
	},
	group: function () {
		return this._group;
	},
	setGroup: function (value) {
		this._group = value;
	},
	headItem: function () {
		return this._head;
	},
	tailItem: function () {
		return this._tail;
	},
	getHead: function (index)/* CellIndex */ {
		if (!index) {
			index = this._column.grid().getIndex(this._head, this._column);
		} else {
			index.set(this._head, this._column);
		}
		return index;	
	},
	getTail: function (index)/* CellIndex */ {
		if (!index) {
			index = this._column.grid().getIndex(this._tail, this._column);
		} else {
			index.set(this._tail, this._column);
		}
		return index;	
	},
	isHead: function (index) {
		return (index.column() == this._column) && (index.I() == this._head);
	},
	isTail: function (index) {
		return (index.column() == this._column) && (index.I() == this._tail);	
	},
	contains: function (index) {
		return (index.column() == this._column) && (index.I() >= this._head) && (index.I() <= this._tail);	
	}
}, {
	$_rooms: [],
	$_roomCount: 0, // for debug
	borrow: function (range) {
		var room = ColumnMergeRoom.$_rooms.pop();
		if (!room) {
			room = new ColumnMergeRoom(range);
			_trace("########### M E R G E R O O M: " + ++ColumnMergeRoom.$_roomCount);
		} else {
			room._head = range.top();
			room._tail = range.bottom();
		}
		return room;
	},
	returnTo: function (room) {
		if (room) {
			var rooms = ColumnMergeRoom.$_rooms;
			for (var i = 0, cnt = rooms.length; i < cnt; i++) {
				if (rooms[i] === room) {
					return;
				}
			}
			rooms.push(room);
		}
	}
});
var ColumnMergeManager = defineClass("ColumnMergeManager", null, {
	init: function(column) {
		this._super();
		this._column = column;
		this._flags = null;
		this._rooms = [];
		this._inited = false;
	},
	count: function () {
		return this._rooms.length;
	},
	clear: function () {
		this._flags = null;
		this._rooms.splice(0, this._rooms.length);
		this._inited = false;
	},
	initialize: function (count) {
		if (this._inited) {
			return;
		}
		var grid = this._column.grid();
		var rowGroup = grid.rowGroup();
		var items = grid.itemSource();
		var dcolumn = _cast(this._column, DataColumn);
		var level = grid.getGroupLevel(dcolumn.dataIndex());
		var rule = grid.isGroupedColumn(dcolumn) ? RowGroupMergeRule.getDefault(level, grid.rowGroup().isMergeMode()) : this._column.mergeRule();
		if (rule) {
			var flags = this._flags = new Array(items.itemCount());
			for (var i = items.itemCount(); i--;) {
				flags[i] = 0;
			}
			rule.parseInit(items, dcolumn.dataIndex(), grid.fixedOptions().rowCount(), count, flags);
		}
        this._inited = true;
	},
	refresh: function (first, last) {
		if (!this._inited || !this._flags || last < first) {
			return;
		}
		var grid = this._column.grid();
		var fixed = grid.layoutManager().fixedItemCount();
		var items = grid.itemSource();
		var dcolumn = _cast(this._column, DataColumn);
		var level = grid.getGroupLevel(dcolumn.dataIndex());
		var rule = level > 0 ? RowGroupMergeRule.getDefault(level, grid.rowGroup().isMergeMode()) : this._column.mergeRule();
		var i = first;
		var range, room, item, group;
		var editItemMerging = grid.displayOptions().isEditItemMerging();
		this._rooms.length = 0;
		if (rule) {
			rule.parseBounds(items, dcolumn.dataIndex(), first, last, this._flags);
		}
		while (i <= last) {
			range = this.$_checkMerge(items, this._column, i, this._rooms.length == 0, fixed);
			if (range) {
				if (level < 1) { // rowGrouping이 아닐 때
					// colMerge일때는 header/footer는 merge하지 않는다.
					item = items.getItem(range.R2());
					if (item instanceof MergedGroupHeader || item instanceof MergedGroupFooter) {
					} else {
						room = new ColumnMergeRoom(range);
						this._rooms.push(room);
					}
				} else { // rowGrouping일 때
					// item = items.getItem(range.top());
					// insert 중인 경우 range가 어떻게 나오나??
					item = editItemMerging ? items.source().getItem(range.top()) : items.getItem(range.top());
					if (item.level() >= level) {
						group = (item instanceof GroupItem) ? item : item.parent();
						while (group.level() > level) {
							group = group.parent();
						}
						room = new ColumnMergeRoom(range);
						room.setGroup(group);
						this._rooms.push(room);
					}
				}
				i = range.R2() + 1;
			} else {
				i += 1;
			}
		}
	},
	getRooms: function () {
		return this._rooms.slice();
	},
	scroll: function (delta) {
	},
	getRoom: function (index) {
		var rooms = this._rooms;
		for (var i = rooms.length - 1; i >=  0; i--) {
			if (rooms[i].contains(index))
				return rooms[i];
		}
		return null;
	},
	$_checkMerge: function (items, column, start, first, fixed) {
		if (items && column && start >= 0) {
			var p = start;
			var f = this._flags[p];
			var item = items.getItem(p);
			var options = column.grid().displayOptions();
			var editMerge = options.isEditItemMerging();
			if (f <= 0 || (ItemState.isEditing(item.itemState()) && !editMerge)) {
				return null;
			}
			if (first) {
				while (p > fixed) {
					if (this._flags[p - 1] < f || ItemState.isEditing(items.getItem(p - 1).itemState())) {
						break;
					}
					p--;
				}
			}
			var count = items.itemCount();
			var i = start + 1;
			var level, editing;
			while (i < count) {
				editing = ItemState.isEditing(items.getItem(i).itemState());
				if (this._flags[i] > f || this._flags[i] <= 0 || (editing && !editMerge)) {
					//if (this._flags[i] <= 0) debugger;
					if (i > p + 1) { // 적어도 아이템이 두 개 이상
						return GridRange.createRange(p, column, i - 1, column);
					} else {
						item = items.getItem(p);
						level = (column instanceof DataColumn) ? column.groupLevel() : -1;
						if (item instanceof MergedGroupHeader && item.isCollapsed()) {
							return GridRange.createRange(p, column, i - 1, column);
						}
						/*
						if (item instanceof MergedGroupHeader && item.level() == level && item.isCollapsed()) {
							return GridRange.createRange(p, column, i - 1, column);
						}
						*/
						if (item instanceof MergedGroupFooter && item.parent().level() == level &&
							(i == start + 1 || // 첫번째 행에 footer가 있을 때 expander를 표시할 수 있도록
							 item.parent().isCollapsed())) {
							return GridRange.createRange(p, column, i - 1, column);
						}
						if ((item instanceof MergedGroupHeader || item instanceof MergedGroupFooter) && item.parent().level() > level )  {
							return GridRange.createRange(p, column, i - 1, column);
						}
						return null;
					}
				} 
				i++;
			}
			if (i > p) {
				if (i > p + 1) { 
					return GridRange.createRange(p, column, i - 1, column);
				} else {
					item = items.getItem(p);
					level = (column instanceof DataColumn) ? column.groupLevel() : -1;
					if (item instanceof MergedGroupHeader && item.isCollapsed()) {
						return GridRange.createRange(p, column, i - 1, column);
					}
					/*
					if (item instanceof MergedGroupHeader && item.level() == level && item.isCollapsed()) {
						return GridRange.createRange(p, column, i - 1, column);
					}
					*/
					if (item instanceof MergedGroupFooter && item.parent().level() == level && 
						(i == start + 1 || item.parent().isCollapsed())) {
						return GridRange.createRange(p, column, i - 1, column);
					}
					if ((item instanceof MergedGroupHeader || item instanceof MergedGroupFooter) && item.parent().level() > level )  {
						return GridRange.createRange(p, column, i - 1, column);
					}
					return null;
				}
			}
		}
		return null;
	}
}, {
	MERGE_ROOMS: "mergeRooms"
});
var MergedGroupFooter = defineClass("MergedGroupFooter", GroupFooter, {
	init: function() {
		this._super();
	},
	isMerged: function () {
		return true;
	}
});
var MergedGroupHeader = defineClass("MergedGroupHeader", GroupItem, {
	init: function(groupField) {
		this._super();
		this._groupField = groupField;
		this._footer = null;
	},
	groupField: function () {
		return this._groupField;
	},
	footer: function () {
		return this._footer;
	},
	isMerged: function () {
		return true;
	},
	_addChild: function (item, index) {
		this._super(item, index);
		if (item instanceof GroupFooter) {
			this._footer = item;
		}
	}
});
var MergedDataCell = defineClass("MergedDataCell", DataCell, {
	init: function(name) {
		this._super(name || "mergedDataCell");
	},
	value: function() {
		var index = this.index();
		var item = index.item();
		if (item instanceof GridRow) {
			return this._super();
		} else {
			var group = (item instanceof GroupItem) ? item : item.parent();
			item = group.firstItem();
			return item.getData(index.dataField());
		}
	}
});
var MergedSeriesCell = defineClass("MergedSeriesCell", GridCell, {
	init: function() {
		this._super("mergedSeriesCell");
	},
	displayText: function () {
		return null;
	},
	value: function () {
		return UNDEFINED;
	}
});
var MergedDataCellElement = defineClass("MergedDataCellElement", DataCellElement, {
	init: function(dom) {
		this._super(dom, "mergedDataCellView");
		this._values = null;
		this._mergeRoom = null;
        this._topIndex = -1;
        this._bottomIndex = -1;
	},
	mergeRoom: function () {
		return this._mergeRoom;
	},
	setFocused: function (value) {
		if (value != this._focused) {
			this._focused = value;
			this._doLayoutHandles && this._doLayoutHandles();
			this.invalidate(false, true);
		}
	},	
	$_setMergeRoom: function (value) {
		this._mergeRoom = value;
	},
	_getButtonVisible: function (visibility) {
		var grid = this.grid();
		var vis;
		switch (visibility) {
			case ButtonVisibility.ROWFOCUSED:
				var focusedIndex = grid.focusedIndex() ? grid.focusedIndex()._itemIndex : -1;
				vis = this._mergeRoom ? this._mergeRoom._head <= focusedIndex && this._mergeRoom._tail >= focusedIndex : this._super(visibility);
				vis = vis && this._mergeRoom ? grid.getItem(focusedIndex) instanceof GridRow : this._super(visibility);
				break;
			default:
				vis = this._super(visibility);	
		}

		if (vis) {
			if (visibility == ButtonVisibility.VISIBLE || (visibility == ButtonVisibility.DEFAULT && !this._mouseEntered)) {
				var focusIndex = grid.focusedIndex();
				if (this._innerIndex > 0) {
					var focusIndex = focusIndex.clone();
					focusIndex.incRow(-this._innerIndex);
				}
	            if (!CellIndex.areEquals(focusIndex, this._index)) 
	            	return false;
			}

			var index = this._innerIndex == -1 ? 0 : this._innerIndex;
			var item = grid.getItem(this._mergeRoom.headItem()+index);
			if (this._innerIndex == -1 && this.group() instanceof MergedGroupHeader ) {
				index = 0;
				for(var i = this._mergeRoom.headItem(), last = this._mergeRoom.tailItem(); i < last; i++) {
					item = grid.getItem(this._mergeRoom.headItem()+index); 
					if (item instanceof GridRow)
						break;
					index++;
				}
			}
			return item.canEdit();
		} else {
			return false;
		}
	},
	_doPrepareValue: function (cell) {
		this._super(cell);
	},
	_doPrepareElement: function (styles) {
		this._super(styles);
	},
	_doUpdateContent: function (cell) {
		this._super(cell);
	},
	_doRender: function (g, r) {
		this._super(g, r);
		/*
		if (this._innerIndex >= 0) {
			var room = this._mergeRoom;
			var h = r.height / (room.tail() - room.head() + 1);
			r.y += h * this._innerIndex;
			r.height = h;
			g.drawRectI(null, SolidPen.RED, r);
		}
		*/
	},
	/*merged일 경우에는 Blank 상태와 상관없이 선을 그림 - redmine #246.*/
	_drawBordersWithBlank: function (g, r, blankState) {
		this._super(g, r, BlankState.NONE);
	},
	clip: function (g) {

		var grid = this.grid();
		if (grid.fixedOptions().colCount() > 0) {
			this._super(g);
		} else {
			var gr = grid.layoutManager()._gridBounds;
			var br = this.boundsBy();
			this.getClientRect(this._drawRect);
			var dr = this._drawRect.clone();
			if (br.x < gr.x) {
				var sx = gr.x - br.x + grid._x;
				dr.x += sx;
				dr.width -= sx;
			}
			g.clipRect(dr);
		}
	},
});
var MergedSeriesCellElement = defineClass("MergedSeriesCellElement", SeriesCellElement, {
	init: function(dom) {
		this._super(dom, "mergedSeriesCellElement");
		this._values = null;
		this._mergeRoom = null;
        this._topIndex = -1;
        this._bottomIndex = -1;
	},
	value: function() {
		return this._values;
	},
	setValue: function (value) {
		if (_isArray(value) && !_equalsArray(value, this._values)) {
			this._values = value;
			this.invalidate();
		}
	},
	mergeRoom: function () {
		return this._mergeRoom;
	},
	$_setMergeRoom: function (value) {
		this._mergeRoom = value;
	}
});
var MergedHeaderElement = defineClass("MergedHeaderElement", ItemElement, {
	init: function(dom) {
		this._super(dom, "mergedHeaderView");
		this._cellView = new RowGroupHeaderCellElement(dom);
		this.addElement(this._cellView);
	},
	setFixed: function (fixed) {
	},
	setRightFixed: function (fixed) {
	},
	_doUpdateElement: function (styles) {
		this._super(styles);
	},
	_doMeasure: function (grid, hintWidth, hintHeight) {
		return new Size(hintWidth, hintHeight);	
	},
	_doLayoutContent: function (lm) {
		this._cellView.updateCell(this.grid().rowGroup().getHeaderCell(this.index()));
		this._cellView.setRect(this.clientRect());
	},
	_doRender: function (g, r) {
		/*
		g.beginFill(0xffff00, 0.2);
		g.drawRect(r.x, r.y, r.width, r.height);
		g.endFill();
		*/
	}
});
var MergedFooterElement = defineClass("MergedFooterElement", ItemElement, {
	init: function(dom, fixed) {
		this._super(dom, "mergedFooterView");
		this._fixed = fixed;
		this._cells = [];
	},
	destroy:  function() {
		this._destroying = true;
		this._cells = null;
		this._super();
	},
	fixed: false,
	rightFixed: false,
    setFixed: function(value) {
        this._fixed = value;
    },
    setRightFixed: function (value) {
    	this._rightFixed = value;
    },
	_doUpdateElement: function(styles) {
		this._super(styles);
		this._level = this.item().parent().level();
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
		return new Size(hintWidth, hintHeight);
	},
	_doLayoutContent: function(lm) {
		this.$_prepareCells(lm);
		this.$_layoutCells(lm);
	},
	_doRender: function(g, r) {
	},
	$_prepareCells: function (lm) {
		var grid = this.grid();
        var start = Math.max(this._level, lm.firstCol(this._fixed, this._rightFixed));
        var end = lm.lastCol(this._fixed, this._rightFixed);
        var rowGroup = this._rowGroup = grid.rowGroup();
		var mergeManager = grid.groupFooterMergeManager();
		var merged = mergeManager.count() > 0;

		if (grid.isColumnLayoutChanged()) {
			this.clear();
			this._cells = [];
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
	$_layoutCells: function (lm) {
		var view;
		var r, sr, er;
		var fixed = lm.fixedColCount();
		var start = Math.max(this._level, lm.firstCol(this._fixed, this._rightFixed));
		var end = lm.lastCol(this._fixed, this._rightFixed);
		var x = this.x();
		var h = this.height();
		var mergeManager = this.grid().groupFooterMergeManager();
		var merged = mergeManager.count() > 0;
		for (var i = start; i <= end; i++) {
			var view = this._cells[lm.getColumn(i).$_hash];
			var r = lm.columnBounds(i);
			if (merged && (room = mergeManager.findRoom(this._level, i))) {
				sr = lm.columnBounds(room.start());
				er = lm.columnBounds(room.last());

				r.width = er.right() - sr.x;
				r.x = sr.x;
			}
			r.x -= x;
			r.height = h;
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
					r.height = h;
					r.x -= x;
					view = this._cells[lm.getColumn(room.base()).$_hash];
					view.setRect(r);
					view.layoutContent(lm);	
				}
			}		
		}
	}
});
var GridMergeHeaderElement = defineClass("GridMergeHeaderElement", VisualObjectElement, {
	init: function(dom) {
		this._super(dom, "mergedGroupHeadersContainer", null);
		this._views = [];
		this._headerMap = {};
		this._headIndex = null;
		this._tailIndex = null;
	},
	destroy: function() {
		this._destroying = true;
		this._views = null;
		this._headerMap = null;
		this._headIndex = null;
		this._tailIndex = null;
		this._super();
	},
	clearHeaders: function() {
		var i;
		var view;
		this._views = [];
		this._headerMap = {};
		for (i = this.childCount() - 1; i >= 0; i--) {
			view = this.getChild(i);
			view.setVisible(false);
			this._views.push(view);
		}
	},
	addHeader: function(header) {
		var view = this._headerMap[header._id];
		if (!view) {
			view = this._views.length > 0 ? this._views.pop() : null;
			if (!view) {
				view = new MergedHeaderElement(this._dom);
				this.addElement(view);
				_trace("########### M E R G E H E A D E R: " + this.childCount());
			}
			view._item = header;
			this._headerMap[header._id] = view;
		}
		view.setVisible(true);
	},
	getHeaderView: function(header) {
		return this._headerMap[header._id];
	},
	getCellView: function(index) {
		var header = _cast(index.item(), MergedGroupHeader);
		if (header) {
			return this._headerMap[header._id];
		}
		return null;
	},
	isLayer: function () {
		return true;
	},
	_doAttached: function (parent) {
		this._super(parent);
		this._headIndex = new CellIndex(this.grid());
		this._tailIndex = new CellIndex(this.grid());
	},
	_doMeasure: function (grid, hintWidth, hintHeight) {
		return new Size(hintWidth, hintHeight);	
	},
	_doLayoutContent: function (lm) {
		this.$_layoutHeaders(lm);
	},
	_doDraw: function(g) {
	},
	$_layoutHeaders: function (lm) {
		var grid = this.grid();
		var styles = grid.rowGroup().headerStyles();
		var leftPos = lm.leftPos();
		var topIndex = grid.topIndex();
		var fixedCols = lm.fixedColCount();
		var fixedItems = lm.fixedItemCount();
		var fixedWidth = lm.fixedWidth();
		var w = this.width();
		for (var h in this._headerMap) {
			var view = this._headerMap[h];
			var header = view.item();
            var idx = header.index();
			view.updateElement(header, styles);
			idx = (idx < fixedItems) ? idx : idx - topIndex;
			var r = lm.itemBounds(idx);
			r.width = w;
			var c = header.level() - 1;
			var x = lm.columnBounds(c).right();
			if (fixedCols > 0) {
				if (c >= fixedCols) {
					x = Math.max(x + fixedWidth - leftPos, fixedWidth);
				} else if (c == fixedCols - 1) {
					x = fixedWidth;
				}
			} else if (fixedCols == 0) {
				x -= leftPos;
			}
			r.setLeft(x);
			r.width -= leftPos;
			view.setRectI(r);
			view.layoutContent(lm);
		}
		this._views = null;
	}
});
var GridMergeElement = defineClass("GridMergeElement", VisualObjectElement, {
	init: function (dom, fixed, rightFixed) {
		this._super(dom, "mergeLayer", null);
		this._fixed = fixed;
		this._rightFixed = rightFixed;
		this._footerLayer = new LayerElement(dom, "mergedFooterLayer");
		this.addElement(this._footerLayer);
		this._cellLayer = new LayerElement(dom, "mergedCellLayer");
		this.addElement(this._cellLayer);
		this._roomMap = {};
		this._scopeViews = {};
		this._footerMap = {};
		this._footerViews = [];
	},
	destroy: function() {
		this._destroying = true;
		this._roomMap = null;
		this._scopeViews = null;
		this._footerMap = null;
		this._footerViews = null;
		this._super();
	},
	isFixed: function () { return this._fixed; },
	isRightFixed: function () { return this._rightFixed; },
	clearFooters: function () {
		this._footerViews = [];
		this._footerMap = {};
		for (var i = this._footerLayer.childCount() - 1; i >= 0; i--) {
			var view = this._footerLayer.getChild(i);
			view.setVisible(false);
			this._footerViews.push(view);
		}
	},
	addFooter: function (footer) {
		var view = this._footerMap[footer._id];
		if (!view) {
			view = this._footerViews.pop();
			if (!view) {
				view = new MergedFooterElement(this._dom, this._fixed, this._rightFixed);
				this._footerLayer.addElement(view);
				_trace("########### M E R G E F O O T E R: " + this._footerLayer.childCount());
			}
			view._item = footer;
			this._footerMap[footer._id] = view;
		}
		view.setVisible(true);
	},
	clearRooms: function () {
		this._roomMap = {};
		for (var i = this._cellLayer.childCount() - 1; i >= 0; i--) {
			var view = this._cellLayer.getChild(i);
			view.setVisible(false);
			var room = view.mergeRoom();
			var views = this.$_getViews(room.scope());
			if (views.indexOf(view) < 0) {
				views.push(view);
			}
		}
	},
	addColumnRooms: function (column, rooms) {
		var views = this.$_getViews(column);
		for (var i = rooms.length - 1; i >= 0; i--) {
			var room = rooms[i];
            var view;
			if (views.length > 0) {
				view = views.pop();
			} else {
				view = this._createElement(room);
				this._cellLayer.addElement(view);
				_trace("########### M E R G E C E L L: " + this._cellLayer.childCount());
			}
			view.setVisible(true);
			view.$_setMergeRoom(room);
			this._roomMap[room.$_hash] = view;
		}
	},
	getCellView: function (index) {
		for (var r in this._roomMap) {
			var view = this._roomMap[r];
			var room = view.mergeRoom();
            if (room.contains(index)) {
				return view && view.isVisible() ? view : null;
			}
		}
		var item = index.item();
		if (item instanceof MergedGroupFooter) {
			return this._footerMap[item._id];
		}
		return null;
	},
	getFooterView: function (footer) {
		return this._footerMap[footer._id];
	},
	isLayer: function () {
		return true;
	},
	_doAttached: function (parent) {
		this._super(parent);
		var grid = this.grid();
		this._headIndex = new CellIndex(grid);
		this._tailIndex = new CellIndex(grid);
	},
	_doMeasure: function (grid, hintWidth, hintHeight) {
		return new Size(hintWidth, hintHeight);	
	},
	_doLayoutContent: function (lm) {
		this.$_layoutCells(lm);
		this.$_layoutFooters(lm);
	},
	_doDraw: function(g) {
	},
	$_getViews: function (scope) {
		var views = this._scopeViews[scope.$_hash];
		if (!views) {
			views = [];
			this._scopeViews[scope.$_hash] = views;
		}
		return views;
	},
	_createElement: function (room)/* DataCellElement */ {
		var view = null;
		if (room instanceof ColumnMergeRoom) {
			var column = room.column();
			if (column instanceof SeriesColumn) {
				view = new MergedSeriesCellElement(this._dom);
			} else if (column instanceof DataColumn) {
				view = new MergedDataCellElement(this._dom);
			}
		}
		return view;
	},
	$_layoutFooters: function (lm) {
		var rowGroup = this.grid().rowGroup();
		var styles = rowGroup.footerStyles();
		var fixedCols = lm.fixedColCount();
		var rfixedCol = lm.rfixedStartCol();
		var fixedItems = lm.fixedItemCount();
		var topIndex = lm.topIndex();
		var itemCount = lm.itemCount();
		var fixed = this.isFixed();
		var rightFixed = this.isRightFixed();
        var leftPos = fixedCols > 0 ?  lm.leftPos() : 0;
		var cellMerge = rowGroup.isFooterCellMerge();
		for (var f in this._footerMap) {
			var view = this._footerMap[f];
			var footer = view._item;
            var idx = footer.index();
            var r, c, x;
            view.updateElement(footer, styles);
			idx = (idx < fixedItems) ? idx : idx - topIndex;
			if (idx < 0 || idx >= itemCount + fixedItems) {
				throw new Error("Invalid MergedGroupFooter index: " + idx);
			}
			r = lm.itemBounds(idx, fixed, rightFixed);
			if (rightFixed) {
				c = Math.max(rfixedCol, footer.parent().level());
				x = lm.columnBounds(c).x;
				r.setLeft(x);				
			} else if (fixed) {
				c = footer.parent().level();
				x = lm.columnBounds(c).x;
				r.setLeft(x);
			} else {
				c = Math.max(fixedCols, footer.parent().level());
				x = lm.columnBounds(c).x;
				r.setLeft(x);
			}
			view.setRect(r);
            /*
            if (!fixed) {
                _trace('%%%%%%%%%%%%%%% ' + r.x);
                if (leftPos > 0 && r.x > leftPos) {
                    r.y = 0;
                    r.x = leftPos;
                    r.width -= leftPos;
                    view.setMask(r);
                } else {
                    view.setMask(null);
                }
            }
            */
            view.setFixed(this._fixed);
            view.setRightFixed(this._rightFixed);
			view.layoutContent(lm);
		}
		this._footerViews = null;
	},
	$_layoutCells: function (lm) {
		var grid = this.grid();
		var merged = grid.rowGroup().isMergeMode();
		var mergeExpander = grid.rowGroup().isMergeExpander();
		var topItem = grid.topItem();
		var topIndex = grid.topIndex();
		var itemCount = lm.itemCount();
		var fixedItems = lm.fixedItemCount();
		for (var hash in this._roomMap) {
			var view = this._roomMap[hash];
			var room = view.mergeRoom();
            var col, cell, r, x, w, i, y, i2, group, h, views;
			room.getHead(this._headIndex);
			if (this._headIndex.I() - topItem > itemCount - 1) {
				view.setVisible(false);
				views = this.$_getViews(room.column());
				if (views.indexOf(view) < 0) {
					views.push(view);
				}
				continue;
			}
			room.getTail(this._tailIndex);
			col = this._headIndex.column();
			cell = grid.body().getCell(this._headIndex, true);
			view.updateCell(cell);
			if (col.parent() instanceof RootColumn) {
				r = lm.columnBounds(col.displayIndex());
			} else {
				r = lm.dataColumnBounds(col);
			}
			x = r.x;
			w = r.width;
			i = Math.min(fixedItems + itemCount - 1, Math.max(fixedItems, this._headIndex.I() - topIndex));
			r = lm.itemBounds(i);
            view._topIndex = i;
			y = r.y;
			i2 = this._tailIndex.I();
			group = room.group();
			i2 = Math.min(fixedItems + itemCount - 1, Math.max(fixedItems, i2 - topIndex));
            view._bottomIndex = i2;
			r = lm.itemBounds(i2);
			h = r.bottom() - y;
			view.setBoundsI(x, y, w, h);
			if (view instanceof MergedDataCellElement) {
				view.setExpanderVisible(merged && mergeExpander && group != null);
			}
			view.layoutContent(lm);
		}
	}
});
