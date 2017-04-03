var ITEM_EXT_CHECKED 	= 0x00000001;
var ITEM_EXT_SAVECHECK 	= 0x00000002;
var ITEM_UNCHECKABLE    = 0x00000004;
var ITEM_EXT_READONLY	= 0x00000008;
var ITEM_EXT_SAVEEXPAND = 0x00000010;
var ITEM_EXT_FILTERED   = 0x00000020;
var ITEM_EXT_HEIGHT		= 0xFF800000;
var $$_grid_item_id = 0;
var GridItem = defineClass("GridItem", null, {
	init: function () {
		this._super(true);
		this._id = $$_grid_item_id++;
		this._index = -1;
		this._parent = null;
		this._extents = 0;
	},
	id: function () {
		return this._id;
	},
	index: function () {
		return this._index;
	},
	parent: function () {
		return this._parent;
	},
	parentIndex: function () {
		return this._parent ? this._parent._index : -1;
	},
	root: function () {
		var p = this;
		while (p.level() > 1) {
			p = p.parent();
		}
		return p;
	},
	childIndex: function () {
		return this._parent ? this._parent.indexOf(this) : -1;
	},
	level: function () {
		return this._parent.level() + 1;
	},
	isLeaf: function () {
		return true;
	},
	isVisible: function () {
        return this._parent && this._index >= 0;
	},
	displayLevel: function () {
		return this.level();
	},
	provider: function () {
		return this._parent.provider();
	},
	dataSource: function () {
		return this._parent.dataSource();
	},
	dataRow: function () {
		return -1;
	},
	dataId: function () {
		return -1;
	},
	rowState: function () {
		var ds,
			row = this.dataRow();
		if (row >= 0) {
			ds = this.dataSource();
			return ds ? ds.getRowState(row) : RowState.NONE;
		} else {
			return RowState.NONE;
		}
	},
	itemState: function () {
		return ItemState.NORMAL;
	},
	isChecked: function () {
		return (this._extents & ITEM_EXT_CHECKED) != 0;
	},
	setChecked: function (value, checkEvent) {
		this._parent.provider().checkItem(this, value, undefined, checkEvent);
	},
	$_setChecked: function (value) {
		this._extents = value ? (this._extents | ITEM_EXT_CHECKED) : (this._extents & ~ITEM_EXT_CHECKED);
	},
	/*
	saveCheck: function (value) {
		this._extents = value ? (this._extents | ITEM_EXT_SAVECHECK) : (this._extents & ~ITEM_EXT_SAVECHECK);
	},
	restoreCheck: function () {
		this._extents = (this._extents & ITEM_EXT_SAVECHECK) ? (this._extents | ITEM_EXT_CHECKED) : (this._extents & ~ITEM_EXT_CHECKED);
	},
	*/
	isCheckable: function () {
		return (this._extents & ITEM_UNCHECKABLE) == 0;
	},
	setCheckable: function (value) {
		this._parent.provider().setCheckable(this, value);
	},
	$_setCheckable: function (value) {
		this._extents = value ? (this._extents & ~ITEM_UNCHECKABLE) : (this._extents | ITEM_UNCHECKABLE);
	},
	isEditable: function () {
		return false;
	},
	isReadOnly: function () {
		return (this._extents & EXT_READONLY) != 0;
	},
	setReadOnly: function (value) {
		this._extents = value ? (this._extents | EXT_READONLY) : (this._extents & ~EXT_READONLY);
	},
	isResizable: function () {
		return false;
	},
	getAncestor: function (level) {
		if (level < this.level()) {
			var p = this._parent;
			while (p.level() > level) {
				p = p._parent;
			}
			return p;
		}
		return null;
	},
	getAncestors: function () {
		var items = null;
		var p = this._parent;
		if (p) {
			items = [];
			do {
				items.push(p);
				p = p._parent;
			} while (p);
		}
		return items;
	},
	isDescendantOf: function (group) {
		if (group) {
			var p = this._parent;
			while (p && p != group) {
				p = p._parent;
			}
			return p === group;
		}
		return false;
	},
	getData: function (field) {
		var ds = this.dataSource();
		var dataRow = this instanceof MergedGroupHeader ? this.firstItem().dataRow() : ( this instanceof MergedGroupFooter ? this.parent().firstItem().dataRow() : this.dataRow() );
		return ds ? ds.getValue(dataRow, field) : UNDEFINED;
		// return ds ? ds.getValue(this.dataRow(), field) : UNDEFINED;
	},
	setData: function (field, value) {
		var ds = this.dataSource();
		if (ds) {
			ds.setValue(dataRow, field, value);
		}
	},
	getRowData: function () {
		var row = this.dataRow();
		if (row >= 0) {
			var ds = this.dataSource();
			if (ds) {
				return ds.getRow(row);
			}
		}
		return null;
	},
	getRowObject: function () {
		var ds = this.dataSource();
		if (ds) {
			return ds.getRowObject(dataRow);
		}
		return null;
	},
	canEdit: function () {
		return false;
	},
	makeVisible: function () {
		this._parent.setExpanded(true);
		this._parent.makeVisible();
	},
	isMerged: function () {
		return false;
	},
	setIndex: function (value) {
		this._index = value;
	}
});
var GridRow = defineClass("GridRow", GridItem, {
	init: function (dataRow) {
		this._super();
		this._dataRow = dataRow;
		this._displayLevel = -1;
	},
	getDataRow: function () {
		return this._dataRow;
	},
	dataRow: function () {
		return this._dataRow;
	},
	dataId: function () {
		return this.dataSource().getRowId(this._dataRow);
	},
	isEditable: function () {
		return true;
	},
	isResizable: function () {
		return true;
	},
	displayLevel: function () {
		return this._displayLevel >= 0 ? this._displayLevel : this.level();
	},
	canEdit: function () {
		return true;
	},
	getData: function (field) {
		return this.dataSource().getValue(this._dataRow, field);
	},
	setData: function (field, value) {
		this.dataSource().setValue(this._dataRow, field, value);
	}
});
var GroupItem = defineClass("GroupItem", GridItem, {
	init: function () {
		this._super();
		this._children = [];
		this._descendantCount = 0;
		this._summaries = null;
		this._rows = null;
	},
	expanded: false,
	count: function () {
		return this._children.length;
	},
	children: function () {
		return this._children.slice();
	},
	setExpanded: function (value, recursive, force) {
		if (value != this._expanded || force) {
			if (value) {
				this.provider().expand(this, recursive, force);
			} else {
				this.provider().collapse(this, recursive);
			}
		}
	},
	isCollapsed: function () {
		return !this.isExpanded();
	},
	footer: function () {
		return null;
	},
	first: function () {
		return this._children.length > 0 ? this._children[0] : null;
	},
	last: function () {
		var len = this._children.length;
		return len > 0 ? this._children[len - 1] : null;
	},
	firstItem: function () {
		if (this._children.length > 0) {
			var item = this._children[0];
			return (item instanceof GroupItem) ? item.firstItem() : item;
		}
		return null;
	},
	lastItem: function () {
		if (this._children.length > 0) {
			var item = this._children[this._children.length - 1];
			return (item instanceof GroupItem) ? item.lastItem() : item;
		}
		return null;
	},
	descendantCount: function () {
		return this._descendantCount;
	},
    firstVisibleItem: function () {
        for (var i = 0, len = this._children.length; i < len; i++) {
            var item = this._children[i];
            if (item.isVisible()) {
                return item;
            }
        }
        return null;
    },
	isExpandable: function () {
		return true;
	},
	isCollapsable: function () {
		return true;
	},
	getItem: function (index) {
		if (index < 0 || index >= this._children.length)
			throw new RangeError("index is invalid: " + index);
		return this._children[index];
	},
	itemOfRow: function (dataRow) {
		for (var i = this._children.length; i--;) {
			if (this._children[i].dataRow() == dataRow) {
				return this._children[i];
			}
		}
		return null;
	},
	indexOf: function (item) {
		var i,
			cnt = this._children.length;
		for (i = 0; i < cnt; i++) {
			if (this._children[i] == item) {
				return i;
			}
		}
		return -1;
	},
	isDescendant: function (item) {
		if (item && item !== this) {
			var g = item._parent;
			while (g && g != this) {
				g = g._parent;
			}
			return g === this;
		}
		return false;
	},
	getDescendants: function (visibleOnly) {
		function collectItems(p/*GroupItem*/, items/*[GridItem]*/) {
			var i, item, g;
			var cnt = p.count();
			for (i = 0; i < cnt; i++) {
				items.push(item = p.getItem(i));
				g = _cast(item, GroupItem);
				if (g && (!visibleOnly || g.isExpanded())) {
					collectItems(g, items);
				}
			}
		}
		if ((!visibleOnly || this._expanded) && this._children && this._children.length > 0) {
			var items = [];
			collectItems(this, items);
			return items;
		}
		return null;
	},
	clear: function () {
		this._summaries = null;
		this._children.splice(0, this._children.length);
	},
	insert: function (index, item) {
		this._addChild(item, index);
	},
	add: function (item) {
		this._addChild(item, -1);
	},
	addAll: function (items) {
		this._addChildren(items);
	},
	remove: function (item) {
		var idx = this.indexOf(item);
		if (idx >= 0) {
			this._children.splice(idx, 1);
			if (item instanceof GridItem) {
				item._parent = null;
			}
		}
	},
	setItem: function (item, newItem) {
		if (item && newItem && item != newItem) {
			var idx = this._removeChild(item);
			this._insertChild(idx, newItem);
			if (newItem instanceof GridItem) {
				newItem._index = item.index();
			}
		}
	},
	getNumber: function (field) {
		var summary = this.$_getSummary(field);
		if (summary instanceof FieldSummary) {
			return summary.count;
		} else if (summary) {
			return summary.length;
		}
		return this._descendantCount;
	},
	getSum: function (field) {
		var summary = this.$_getSummary(field);
		if (summary instanceof FieldSummary) {
			return summary.sum;
		} else if (summary) {
			var ds = this.dataSource();
			var cnt = summary.length;
			var v = 0;
			var v2;
			var i;
			for (i = 0; i < cnt; i++) {
				v2 = ds.getValue(summary[i], field);
				if (!isNaN(v2)) {
					v += v2;
				}
			}
			return v;
		}
		return NaN;
	},
	getMax: function (field) {
		var summary = this.$_getSummary(field);
		if (summary instanceof FieldSummary) {
			return summary.max;
		} else if (summary) {
			var ds = this.dataSource();
			var cnt = summary.length;
			var v;
			var v2;
			var i;
			if (cnt > 1) {
				v = NaN;
				i = 0;
				do {
					v = ds.getValue(summary[i++], field);
				} while (isNaN(v = v == null ? undefined : v) && i < cnt);
				while (i < cnt) {
					v2 = ds.getValue(summary[i++], field);
					if (!isNaN(v2 = v2 == null ? undefined : v2) && v2 > v) {
						v = v2;
					}
				}
				return v;
			} else if (cnt == 1) {
				v = ds.getValue(summary[0], field);
				return v == null ? undefined : v;
			}
		}
		return NaN;
	},
	getMin: function (field) {
		var summary = this.$_getSummary(field);
		if (summary instanceof FieldSummary) {
			return summary.min;
		} else if (summary) {
			var ds = this.dataSource();
			var cnt = summary.length;
			var v;
			var v2;
			var i;
			if (cnt > 1) {
				v = NaN;
				i = 0;
				do {
					v = ds.getValue(summary[i++], field);
				} while (isNaN(v = v == null ? undefined : v) && i < cnt);
				while (i < cnt) {
					v2 = ds.getValue(summary[i++], field);
					if (!isNaN(v2 = v2 == null ? undefined : v2) && v2 < v) {
						v = v2;
					}
				}
				return v;
			} else if (cnt == 1) {
				v = ds.getValue(summary[0], field);
				return v == null ? undefined : v;
			}
		}
		return NaN;
	},
	getAvg: function (field) {
		var summary = this.$_getSummary(field);
		if (summary instanceof FieldSummary) {
			return summary.avg;
		} else if (summary) {
			var ds = this.dataSource();
			var cnt = summary.length;
			var v;
			var i;
			if (cnt > 1) {
				v = 0;
				for (i = 0; i < cnt; i++) {
					v += ds.getValue(summary[i], field);
				}
				return v / cnt;
			} else if (cnt == 1) {
				v = ds.getValue(summary[0], field);
				return v;
			}
		}
		return NaN;
	},
	getVar: function (field, n) {
		var summary = this.$_getSummary(field);
		if (summary instanceof FieldSummary) {
			return n = 0 ? summary.varsp : summary.vars;
		} else if (summary && this.summaryMode() == SummaryMode.STATISTICAL) {
			var ds = this.dataSource();
			var cnt = summary.length;
			var v;
			var i;
			var avg;
			if (cnt > 1) {
				v = 0;
				for (i = 0; i < cnt; i++) {
					v += ds.getValue(summary[i], field);
				}
				avg = v / cnt;
				v = 0;
				for (i = 0; i < cnt; i++) {
					v += Math.pow(ds.getValue(summary[i], field) - avg, 2);
				}
				v = v / (cnt - n);
				return v;
			} else if (cnt == 1) {
				return 0;
			}
		}
		return NaN;
	},
	getStdev: function (field, n) {
		var summary = this.$_getSummary(field);
		if (summary instanceof FieldSummary) {
			return n == 0 ? Math.sqrt(summary.varsp) : Math.sqrt(summary.vars);
		} else if (summary && this.summaryMode() == SummaryMode.STATISTICAL) {
			var ds = this.dataSource();
			var cnt = summary.length;
			var v;
			var i;
			var avg;
			if (cnt > 1) {
				v = 0;
				for (i = 0; i < cnt; i++) {
					v += ds.getValue(summary[i], field);
				}
				avg = v / cnt;
				v = 0;
				for (i = 0; i < cnt; i++) {
					v += Math.pow(ds.getValue(summary[i], field) - avg, 2);
				}
				v = Math.sqrt(v / (cnt - n));
				return v;
			} else if (cnt == 1) {
				return 0;
			}
		}
		return NaN;
	},
	summaryMode: function () {
		return this.provider().summaryMode();
	},
	_setExpanded: function (value) {
		this._expanded = value;
	},
	_incDescendants: function (inc) {
		this._descendantCount += inc;
	},
	_insertChild: function (index, item) {
		this._children.splice(index, 0, item);
		if (item instanceof GridItem) {
			item._parent = this;
		}
	},
	_addChild: function (item, index) {
		if (item && this.indexOf(item) < 0) {
			if (index < 0) {
				this._children.push(item);
			} else {
				this._children.splice(index, 0, item);
			}
			item._parent = this;
		}
	},
	_addChildren: function (items) {
		var cnt;
		if (items && (cnt = items.length) > 0) {
			var i, item;
			for (i = 0; i < cnt; i++) {
				item = items[i];
				if (item && this.indexOf(item) < 0) {
					item._parent = this;
					this._children.push(item);
				}
			}
		}
	},
	_removeChild: function (item) {
		var idx = this.indexOf(item);
		if (idx >= 0) {
			this._children.splice(idx, 1);
			if (item instanceof GridItem) {
				item._parent = null;
			}
		}
		return idx;
	},
	attachItem: function (item) {
		if (item) {
			item._parent = this;
		}
	},
	detachItem: function (item) {
		if (item && item_parent == this) {
			item._parent = null;
		}
	},
	_exchangeItems: function (index1, index2) {
		if (index1 < 0 || index1 >= this._children.length)
			throw new RangeError("index1 is out of range: " + index1);
		if (index2 < 0 || index2 >= this._children.length)
			throw new RangeError("index2 is out of range: " + index2);
		if (index1 === index2)
			return;
		var t = this._children[index1];
		this._children[index1] = this._children[index2];
		this._children[index2] = t;
	},
	_moveChild: function (index, delta) {
		var count = this._children.length;

		if (index < 0 || index >= count)
			throw new RangeError("index is out of range: " + index);

		var newIndex = Math.min(Math.max(index+delta,0),count-1);
		var child = this._children[index];
		if (delta < 0) {
			for (var i = index; i > newIndex; i--) 
				this._children[i] = this._children[i-1];
		} else {
			for (var i = index; i < newIndex; i++)
				this._children[i] = this._children[i+1];			
		}
		this._children[newIndex] = child;
	},
	_changeParent: function (parent, index, expand) {
		var old = this._parent;
		old.remove(this);
		parent._addChild(this, index);
		if (expand)
			parent.setExpanded(true);
	},
	$_getRows: function () {
		var rows = [];
		this.$_collectRows(this, rows);
		return rows;
	},
	$_collectRows: function (group, rows) {
		var i,
			cnt = group.count(),
			item;
		for (i = 0; i < cnt; i++) {
			item = group.getItem(i);
			if (item instanceof GroupItem) {
				this.$_collectRows(item, rows);
			} else {
				var row = item.dataRow();
				if (row >= 0) {
					rows.push(row);
				}
			}
		}
	},
	$_getSummary: function (field) {
		var ds = _cast(this.dataSource(), DataProvider);
		if (!ds) {
			return null;
		}
		if (this._summaries == null) {
			this._summaries = {};
		}
		var fs = this._summaries ? this._summaries[field] : null;
		if (!fs) {
			if (ds.canSummarize(field)) {
				fs = this.$_summarize(field, ds);
				if (fs) {
					this._summaries[field] = fs;
				}
			}
		}
		return fs;
	},
	$_summarize: function (field, ds) {
		var THRESHOLD = 3;
		var mode = this.summaryMode();
		if (mode != SummaryMode.NONE) {
			if (this._rows == null) {
				this._rows = [];
				this.$_collectRows(this, this._rows);
			}
			if (this._rows.length > THRESHOLD && ds.canSummarize(field)) {
				var fs = new FieldSummary(field);
				ds.summarizeRange(fs, this._rows, mode == SummaryMode.STATISTICAL);
				return fs;
			} else {
				return this._rows;
			}
		}
		return null;
	}
});
var GroupItemImpl = defineClass("GroupItemImpl", GroupItem, {
	init: function (field) {
		this._super();
		this._groupField = field;
		this._footer = null;
		this._header = null;
	},
	groupField: function () {
		return this._groupField;
	},
	footer: function () {
		return this._footer;
	},
	_addChild: function (item, index) {
		this._super(item, index);
		if (item instanceof GroupFooter) {
			this._footer = item;
		}
	}
});
var GroupFooter = defineClass("GroupFooter", GridItem, {
	init: function() {
		this._super();
	},
	expandable: false,
	displayLevel: function() {
		return this._expandable ? this.level() - 1 : this.level();
	}
});
var /* @internal */ RootItem = defineClass("RootItem", GroupItemImpl, {
	init: function(provider) {
		this._super(-1);
		this._provider = provider;
	},
	provider: function () { return this._provider; },
	level: function() { return 0; },
	isExpanded: function () { return false; },
	isLeaf: function () { return false; },
	isVisible: function () { return true; },
	dataSource: function () { return this._provider.dataSource(); },
	isExpandable: function () { return false; },
	isCollapsable: function () { return false; }
});
var /* @abstract */ ItemProvider = defineClass("ItemProvider", EventAware, {
	init: function (indexing) {
		this._super();
		this._indexing = indexing;
		this._rootItem = this._createRootItem();
		this._eventLock = 0;
	},
	hideDeleted: false,
	dataSource: function () {
		throwAbstractError();
	},
	itemCount: function () {
		throwAbstractError();
	},
	getItem: function (index) {
		throwAbstractError();
	},
	getItems: function (index, count) {
		throwAbstractError();
	},
	attachItem: function (item) {
		if (item) {
			item._parent = this._rootItem;
		}
	},
	refreshItems: function () {
		throwAbstractError();
	},
	getItemsByIndices: function (indices) {
		var items = [];
		if (indices) {
			for (var i = 0, cnt = indices.length; i < cnt; i++) {
				var item = this.getItem(indices[i]);
				item && items.push(item);
			}
		}
		return items;
	},
	getIndexOfRow: function (dataRow) {
		var item = this.getItemOfRow(dataRow);
		return item ? item.index() : -1;
	},
	getIndicesOfRows: function (dataRows) {
		var items = [];
		var cnt = dataRows ? dataRows.length : 0;
		if (cnt) {
			for (var i = 0; i < cnt; i++) {
				var item = this.getItemOfRow(dataRows[i]);
				items.push(item ? item.index() : -1);
			}
		}
		return items;
	},
	getItemOfRow: function (dataRow) {
		throwAbstractError();
	},
	getItemsByRows: function (dataRows) {
		var i, item;
		var items = [];
		var cnt = dataRows ? dataRows.length : 0;
		for (i = 0; i < cnt; i++) {
			item = this.getItemOfRow(dataRows[i]);
			if (item) {
				items.push(item);
			}
		}
		return items;
	},
	exchange: function (index1, index2) {
		throwAbstractError();
	},
	setCheckable: function (item, value) {
		if (item) {
			if (value != item.isCheckable()) {
				item.$_setCheckable(value);
				this._fireCheckableChanged(item);
			}
		}
	},
	_clearChecked: function () {
		for (var i = 0, cnt = this.itemCount(); i < cnt; i++) {
			this.getItem(i).$_setChecked(false);
		}
	},
	checkItem: function (item, checked, exclusive, checkEvent) {
		if (item ) {
			var prev = item.isChecked();
			if (exclusive) {
				this._clearChecked();
				if (checked) {
					item.$_setChecked(true);
				}
				if ((checked != prev) && checkEvent) {
					this._fireItemChecked(item);
				}
				this._fireRefreshClient();
			} else if (checked != prev) {
				item.$_setChecked(checked);

				checkEvent ? this._fireItemChecked(item):this._fireRefreshClient();				
			}
		}
	},
	checkItems: function (items, checked, checkEvent) {
		if (items && items.length > 0) {
			for (var i = 0, cnt = items.length; i < cnt; i++) {
				var item = items[i];
				item instanceof GridItem && item.$_setChecked(checked);
			}

			checkEvent ? this._fireItemsChecked(items, checked):this._fireRefreshClient();	
		}
	},
	checkAll: function (checked, visibleOnly, checkableOnly, checkEvent) {
		var i, item, cnt = this.itemCount();
		if (checkableOnly) {
			for (i = 0; i < cnt; i++) {
				item = this.getItem(i);
				if (item.isCheckable()) {
					item.$_setChecked(checked);
				}
			}
		} else {
			for (i = 0; i < cnt; i++) {
				this.getItem(i).$_setChecked(checked);
			}
		}
		checkEvent ? this._fireItemAllChecked(checked):this._fireRefreshClient();	
	},
	_setCheckItem: function (item, checked) {
		item.$_setChecked(checked);
	},
	_clearDisplayLevels: function () {
	},
	hasCellStyle: function () {
		return false;
	},
	setCellStyle: function (row, field, style) {
	},
	setCellStyles: function (provider, rows, fieldMap) {
	},
	clearCellStyles: function () {
	},
	removeCellStyle: function (style) {
	},
	getCellStyle: function (dataRow, field) {
		return null;
	},
	canUpdate: function (item, field) {
		if (item) {
			var row = item.dataRow();
			var ds = this.dataSource();
			var state = item.itemState();
            var inserting = ItemState.isInserting(state) || state === ItemState.DUMMY;
			return (row >= 0 || inserting) && ds && (inserting || ds.canUpdateRow(row)) && ds.canUpdateField(row, field);
		}
		return false;
	},
	canAppend: function () {
		var ds = this.dataSource();
		return ds && ds.canAppendRow();
	},
	canInsert: function (item) {
		if (item) {
			var	row = item.dataRow();
			var ds = this.dataSource();
			return /*(row >= 0) &&*/ ds && ds.canInsertRow(row);
		}
		return false;
	},
	canDelete: function (item) {
		if (item) {
			var row = item.dataRow();
			var ds = this.dataSource();
			return (row >= 0) && ds && ds.canDeleteRow(row);
		}
		return false;
	},
	getAllItems: function () {
		throwAbstractError();
	},
	findItem: function (fields, values, options, startIndex, endIndex) {
		throwAbstractError();
	},
	getSum: function (field) {
		return NaN;
	},
	getMax: function (field) {
		return NaN;
	},
	getMin: function (field) {
		return NaN;
	},
	getAvg: function (field) {
		return NaN;
	},
	getVar: function (field) {
		return NaN;
	},
	getStdev: function (field) {
		return NaN;
	},
	isIndexing: function () {
		return this._indexing;
	},
	_createRootItem: function () {
		return new RootItem(this);
	},
	_resetItemIndicies: function (fromIndex) {
		if (this._indexing) {
			var i = fromIndex,
				cnt = this.itemCount();
			for (; i < cnt; i++) {
				this.getItem(i)._index = i;
			}
		}
	},
	_setExpanded: function (group, value) {
		group._setExpanded(value);
	},
	_resetItemIndex: function (index) {
		var item = this.getItem(index);
		if (item) {
			item._index = index;
		}
	},
	_incDescendents: function (group, count) {
		group._descendantCount += count;
		if (group.parent()) {
			this._incDescendents(group.parent(), count);
		}
	},
	_copyExtents: function (source, target) {
		if (source instanceof GridItem && target instanceof GridItem) {
			target._extents = source._extents;
		}
	},
	_fireReset: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.RESET);
		}
	},
	_fireRefresh: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.REFRESH);
		}
	},
	_fireRefreshClient: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.REFRESH_CLIENT);
		}
	},
	_fireItemInserted: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.ITEM_INSERTED, item);
		}
	},
	_fireItemDeleted: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.ITEM_DELETED, item);
		}
	},
	_fireItemUpdated: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.ITEM_UPDATED, item);
		}
	},
	_fireCheckableChanged: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.CHECKABLE_CHANGED, item);
		}
	},
	_fireItemChecked: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.ITEM_CHECKED, item);
		}
	},
	_fireItemsChecked: function (items, checked) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.ITEMS_CHECKED, items, checked);
		}
	},
	_fireItemAllChecked: function (checked) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.ITEM_ALL_CHECKED, checked);
		}
	},
	_fireRowStateChanged: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.ROW_STATE_CHANGED, item);
		}
	},
	_fireRowStatesChanged: function (items) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.ROW_STATES_CHANGED, items);
		}
	},
	_fireRowStatesCleared: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.ROW_STATES_CLEARED);
		}
	},
	_fireSort: function (fields, directions, cases) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.SORT, fields, directions, cases);
		}
	},
	_fireSorted: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.SORTED);
		}
	},
	_fireFilterAdded: function (field, criteria) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.FILTER_ADDED, field, criteria);
		}
	},
	_fireFilterRemoved: function (field, filter) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.FILTER_REMOVED, field, filter);
		}
	},
	_fireFilterCleared: function (field) {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.FILTER_CLEARED, field);
		}
	},
	_fireFilterAllCleared: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.FILTER_ALL_CLEARED);
		}
	},
	_fireFiltered: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(ItemProvider.FILTERED);
		}
	}
});
ItemProvider.RESET = "onItemProviderReset";
ItemProvider.REFRESH = "onItemProviderRefresh";
ItemProvider.REFRESH_CLIENT = "onItemProviderRefreshClient";
ItemProvider.ITEM_INSERTED = "onItemProviderItemInserted";
ItemProvider.ITEM_DELETED = "onItemProviderItemDeleted";
ItemProvider.ITEM_UPDATED = "onItemProviderItemUpdated";
ItemProvider.CHECKABLE_CHANGED = "onItemProviderCheckableChanged";
ItemProvider.ITEM_CHECKED = "onItemProviderItemChecked";
ItemProvider.ITEMS_CHECKED = "onItemProviderItemsChecked";
ItemProvider.ITEM_ALL_CHECKED = "onItemProviderItemAllChecked";
ItemProvider.ROW_STATE_CHANGED = "onItemProviderRowStateChanged";
ItemProvider.ROW_STATES_CHANGED = "onItemProviderRowStatesChanged";
ItemProvider.ROW_STATES_CLEARED = "onItemProviderRowStatesCleared";
ItemProvider.SORT = "onItemProviderSort";
ItemProvider.SORTED = "onItemProviderSorted";
ItemProvider.FILTER_ADDED = "onItemProviderFilterAdded";
ItemProvider.FILTER_REMOVED = "onItemProviderFilterRemoved";
ItemProvider.FILTER_CLEARED = "onItemProviderFilterCleared";
ItemProvider.FILTER_ALL_CLEARED = "onItemProviderFilterAllCleared";
ItemProvider.FILTERED = "onItemProviderFiltered";
var /* @internal */ CellStyleMap = defineClass("CellStyleMap", DataTag, {
	init: function(itemProvider) {
		this._super();
		this._owner = itemProvider;
		this._styleMap = [];
	},
	destroy: function() {
		this._destroying = true;
		this._styleMap = null;
		this._super();
	},
	isEmpty: function () {
		return this._styleMap.length == 0 && !this._styleMap[-1];
	},
	setCellStyle: function (row, field, style) {
		if (field < 0) {
			this._styleMap[row] = style;
		} else {
			var styles,
				oldStyle = this._styleMap[row];
			if (oldStyle) {
				if (_isArray(oldStyle)) {
					oldStyle[field] = style;
				} else {
					var i,
						cnt = this._owner.dataSource().fieldCount();
					styles = [];
					for (i = 0; i < cnt; i++) {
						styles[i] = oldStyle;
					}
					this._styleMap[row] = styles;
				}
			}
			styles = this._styleMap[row];
			if (!styles) {
				styles = [];
			}
			styles[field] = style;
			this._styleMap[row] = styles;
		}
	},
	setCellStyles: function (provider, rows, fieldMap) {
		function setArray(self, ds, rows, fields) {
			var r;
			var cnt = rows.length;
			var flds = Math.min(fields.length, ds.fieldCount());
			var f;
			var fld;
			var style;
			var vals;
			for (r = 0; r < cnt; r++) {
				vals  = rows[r];
				if (_isArray(vals)) {
					for (f = 0; f < flds; f++) {
						fld = fields[f];
						if (fld >= 0) {
							style = provider.getStyle(vals[fld]);
							if (style) {
								self.setCellStyle(r, f, style);
							}
						}
					}
				}
			}
		}
		function setObjects(self, rows, fields) {
			for (var r = 0, cnt = rows.length; r < cnt; r++) {
				var row  = rows[r];
				if (row) {
					for (var f in fields) {
						var fld = fields[f];
						var style = provider.getStyle(row[f]);
                        if (style) {
							self.setCellStyle(r, fld, style);
						}
					}
				}
			}
		}
		if (!rows || rows.length < 1 || !fieldMap) {
			return;
		}
		var ds = this._owner.dataSource();
		var fldCount = ds.fieldCount();
		var fields = fieldMap;
        var i, fld, cnt;
		if (_isArray(fields)) {
			fields = fields.concat();
			cnt = Math.min(fldCount, fields.length);
			for (i = 0; i < cnt; i++) {
				fld = parseInt(fields[i]);
				if (isNaN(fld) || fld < 0) {
					fields[i] = -1;
				} else {
					fields[i] = fld;
				}
			}
			setArray(this, ds, rows, fields);
		} else {
			fields = {};
			for (var f in fieldMap) {
				fld = parseInt(fieldMap[f]);
				if (isNaN(fld)) {
					fld = ds.getFieldIndex(fieldMap[f]);
				}
				if (fld >= 0 && fld < fldCount) {
					fields[f] = fld;
				}
			}
			setObjects(this, rows, fields);
		}
	},
	removeCellStyle: function (style) {
		for (var r = 0, cnt = this._styleMap.length; r < cnt; r++) {
			var styles = this._styleMap[r];
			if (_isArray(styles)) {
				for (var i = styles.length - 1; i >= 0; i--) {
					if (styles[i] === style) {
						styles[i] = null;
					}
				}
			} else {
				if (this._styleMap[r] === style) {
					delete this._styleMap[r];
				}
			}
		}
	},
	clearCellStyles: function () {
		this._styleMap = [];
	},
	checkCellStyle: function (dataRow, field) {
		var style = this._styleMap[dataRow];
		if (_isArray(style)) {
			return !!style[field];
		} else {
			return !!style;
		}
	},
	getCellStyle: function (dataRow, field) {
		var style = this._styleMap[dataRow];
		if (_isArray(style)) {
			return style[field];
		} else {
			return style;
		}
	},
	connect: function (provider) {
	},
	disconnect: function () {
	},
	clearRows: function () {
		this._styleMap = [];
	},
	setRows: function () {
		if (this._owner.dataSource()) {
			this._styleMap.length = Math.min(this._styleMap.length, this._owner.dataSource().rowCount());
		}
	},
	setRowCount: function (newCount) {
		this._styleMap.length = newCount;
	},
	insertRow: function (row) {
		this._styleMap.splice(row, 0, null);
	},
	insertRows: function (row, count) {
		for (var i = 0; i < count; i++) {
			this._styleMap.splice(row, 0, null);
		}
	},
	removeRow: function (row) {
		this._styleMap.splice(row, 1);
	},
	removeRows: function (rows) {
		for (var i = rows.length - 1; i >= 0; i--) {
			this._styleMap.splice(rows[i], 1);
		}
	},
	updateRow: function () {
	},
	updateRows: function (row, count) {
	},
	setValue: function (row, field) {
	},
	moveRow: function (row, newRow) {
		var styles = this._styleMap.splice(row, 1);
		this._styleMap.splice(newRow, styles[0]);
	},
	moveRows: function (row, count, newRow) {
		var styles = this._styleMap.splice(row, count);
		for (var i = 0; i < count; i++) {
			this._styleMap.splice(newRow + i, 0, styles[i]);
		}
	}
});
var /* @internal */ ItemCheckableTag = defineClass("ItemCheckableTag", null, {
	init : function(owner, expression) {
		this._super();
		this._owner = owner;
		this._exprNode = ExpressionParser.Default.parse(expression, ["value", "values"]);
		this._runtime = new CheckableExpressionRuntime();
	},
	connect: function (provider) {
		this._runtime.setDataSource(provider);
	},
	disconnect: function () {
	},
	clearRows: function () {
		ItemCheckableTag.clearCheckables(this._owner);
	},
	setRows: function () {
		for (var i = this._owner.itemCount(); i--;) {
			this.$_setCheckable(this._owner.getItem(i));
		}
	},
	insertRow: function (row) {
		this.$_setCheckable(row);
	},
	insertRows: function (row, count) {
		for (var i = 0; i < count; i++) {
			var item = this._owner.getItemOfRow(row + i);
			if (item instanceof GridItem) {
				this.$_setCheckable(item);
			}
		}
	},
	updateRow: function (row) {
		this.$_setCheckable(row);
	},
	updateRows: function (row, count) {
		for (var i = 0; i < count; i++) {
			var item = this._owner.getItemOfRow(row + i);
			if (item instanceof GridItem) {
				this.$_setCheckable(item);
			}
		}
	},
	changeStates: function (rows) {
		if (rows) {
			for (var i = rows.length; i--;) {
				var item = this._owner.getItemOfRow(rows[i]);
				if (item instanceof GridItem) {
					this.$_setCheckable(item);
				}
			}
		}
	},
	$_setCheckable: function (item) {
		this._runtime.setItem(item);
		item.$_setCheckable(this._exprNode.evaluate(this._runtime));
	}
}, {
	clearCheckables: function (items) {
		for (var i = items.itemCount(); i--;) {
			items.getItem(i).$_setCheckable(true);
		}
	}
});