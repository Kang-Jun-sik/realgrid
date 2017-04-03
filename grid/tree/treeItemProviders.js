var TreeItem = defineClass("TreeItem", GroupItem, {
	init: function(dataRow) {
		this._super();
		this._dataRow = dataRow;
		this._footer = null;
	},
	destroy: function() {
		this._destroying = true;
		this._dataRow = null;
		this._super();
	},
	iconHeight: 0,
	row: function () {
		return this._dataRow;
	},
	rowId: function () {
		return this._dataRow ? this._dataRow.rowId() : -1;
	},
	iconIndex: function () {
		return this._dataRow.iconIndex();
	},
	hasChildren: function () {
		return this.count() > 0 || this._dataRow.hasChildren();
	},
	rootItem: function () {
		var p = this;
		while (p.level() > 1) {
			p = p.parent();
		}
		return p;
	},
	lastVisible: function () {
		return (this.isExpanded() && this.count() > 0) ? this.isLastVisible() : this;
	},
	createFooter: function () {
		if (!this._footer) {
			this._footer = new TreeItemFooter();
			this._attachItem(this._footer);
		}
	},
	dataRow: function () {
		return this._dataRow ? this._dataRow.rowId() : -1;
	},
	dataId: function () {
		return this._dataRow ? this._dataRow.rowId() : -1;
		//return this._dataRow.rowId();
	},
	descendantCount: function () {
		return this._dataRow.descendantCount();
	},
	rowState: function () {
		return this._dataRow.rowState();
	},
	isLeaf: function () {
		return this.count() == 0;
	},
	footer: function () {
		return this._footer;
	},
	isEditable: function () {
		return true;
	},
	summaryMode: function () {
		return SummaryMode.AGGREGATE;
	},
	setExpanded: function (value) {
		var provider;
		if (value != this.isExpanded() && (provider = this.provider())) {
			if (value) {
				provider.expand(this, false, false);
			} else {
				provider.collapse(this);
			}
		}
	},
	isResizable: function () {
		return true;
	},
	canEdit: function () {
		return true;
	},
	getData: function (field) {
		return this._dataRow.getValue(field);
	},
	setData: function (field, value) {
		this._dataRow.setValue(field, value);
	},
	setItem: function (item, newItem) {
		this._super(item, newItem);
		newItem._addChildren(item.children());
		item.clear();
	},
	exchange: function (index1, index2) {
		this.exchangeItems(index1, index2);
	},
	moveChild: function (index, delta) {
		var newIndex = index+delta;
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
	changeParent: function(parent, index) {
		var old = this._parent;
		old.remove(this);
		if (parent) {
			parent.insert(index, this);
		}
	},
	getRowData: function() {
		return this._dataRow && this._dataRow._values.concat();
	}
});
TreeItem.$_tempTreeItem = new TreeItem();
TreeItem.getTemp = function (row) {
	TreeItem.$_tempTreeItem._dataRow = row;
	return TreeItem.$_tempTreeItem;
};
var TreeItem$ = TreeItem.prototype;
var RootTreeItem = defineClass("RootTreeItem", TreeItem, {
	init: function(provider) {
		this._super(null);
		this._provider = provider;
	},
	id: function () {
		return NaN;
	},
	provider: function () {
		return this._provider;
	},
	level: function () {
		return 0;
	},
	isExpanded: function () {
		return true;
	},
	setExpanded: function (value) {
	},
	isLeaf: function () {
		return false;
	},
	isVisible: function () {
		return true;
	},
	dataSource: function () {
		return this._provider.dataSource();
	}
});
var HierarchicalVisibleItems = function (provider) {
	_assert(provider != null && provider !== undefined, "provider is null");
	var _provider = provider;
	var _fixedCount = 0;
	var _items = [];
	var _list = [];
	this.provider = function () {
		return _provider;
	};
	this.count = function () {
		return _items.length;
	};
	this.fixedCount = function () {
		return _fixedCount;
	},
	this.getItem = function (index) {
		return _items[index];
	};
	this.setItem = function (index, newItem) {
		_items[index] = newItem;
	};
	this.indexOf = function (item) {
		return _items.indexOf(item);
	};
	this.clear = function () {
		_items.length = 0;
	};
	var collectChildren = function (parent, list, recursive, level) {
		var i, item;
		var cnt = parent.count();
		for (i = 0; i < cnt; i++) {
			item = parent.getItem(i);
			if (item) {
				list.push(item);
				if ((recursive && item.level() < level) || item.isExpanded()) {
					collectChildren(item, list, recursive, level);
				}
			}
		}
		var footer = parent.footer();
		if (footer) {
			list.push(parent.footer());
		}
	};
	var expandItem = function (item, recursive, level) {
		var i, cnt, idx;
		var list = _list;
		if (item instanceof RootTreeItem) {
			idx = _fixedCount;
		} else {
			idx = item.index() + 1;
		}
		level = Math.max(0, level);
		list.length = 0;
		collectChildren(item, list, recursive, level > 0 ? item.level() + level : 1000000);
		if (recursive) {
			for (i = idx, cnt = _items.length; i < cnt; i++) {
				if (_items[i].level() <= item.level()) {
					break;
				}
			}
			_items.splice(idx, i - idx);
		}
		for (i = 0, cnt = list.length; i < cnt; i++) {
			_items.splice(idx + i, 0, list[i]);
		}
	};
	this.expand = function (item, recursive, level) {
		level = arguments.length > 0 ? level : 0;
		if (item) {
			expandItem(item, recursive, level);
		}
	};
	this.collapse = function (item) {
		if (item) {
			var idx = item.index() + 1;
			while (idx < _items.length && _items[idx].level() > item.level()) {
				if (_items[idx] == item.footer()) {
					if (!_provider.footerWhenCollapsed()) {
						_items.splice(idx, 1);
					}
					break;
				}
				_items.splice(idx, 1);
			}
		}
	};
	this.getNext = function (item) {
		if (item && item.isVisible() && item.index() < this.count() - 1) {
			return _items[item.index() + 1];
		}
		return null;
	};
	this.getPrior = function (item) {
		if (item && item.isVisible() && item.index() > 0) {
			return _items[item.index() - 1];
		}
		return null;
	};
	this.insert = function (item, index) {
		_items.splice(index, 0, item);
	};
	this.remove = function (item) {
		var i = _items.indexOf(item);
		if (i >= 0) {
			_items.splice(i, 1);
			if (item.isExpanded()) {
				while (i < _items.length && item.isDescendant(_items[i])) {
					_items.splice(i, 1);
				}
			}
		}
	};
	this._clearAndInit = function (fixedCount) {
		this.clear();
		_fixedCount = Math.min(fixedCount, _provider.itemCount());
		for (var i = 0; i < _fixedCount; i++) {
			_items.push(_provider.getItem(i));
		}
	};
};
var TreeItemProvider = defineClass("TreeItemProvider", ItemProvider, {
	init: function () {
		this._super(true);
		this._cellStyles = new TreeCellStyleMap(this);
		this._filters = {};
		this._filterRuntime = new ColumnFilterRuntime();
		this._filtered = false;
		this._sorter = new TreeItemsSorter();
		this._sortFields = [];
		this._sortDirections = [];
        this._sortCases = [];
		this._visibleItems = new HierarchicalVisibleItems(this);
		this._itemMap = [];
		this._itemCount = 0;
		this._summaryMap = null;
		this._checkableExpression = null;
		this._checkableTag = null;
	},
	destroy: function() {
		this._destroying = true;
		this._sortFields = null;
		this._sortDirections = null;
        this._sortCases = null;
		this._super();
	},
	onTreeDataProviderDisposed: function (provider/*TreeDataProvider*/) {
		this.provider().removeTag(this._cellStyls);
		this.$_clearItems();
		this.$_resetSummary();
		this._fireReset();
		this.setDataSource(null);
	}, 
	onTreeDataProviderReset: function (provider) {
		this.$_clearItems();
		this.$_resetSummary();
		this.$_buildTree();
		this._fireReset();
	},
	onTreeDataProviderRefresh: function (provider) {
		this._refreshItems();
	},
	onTreeDataProviderRefreshClient: function (provider) {
		this._fireRefreshClient();
	},
	onDataProvderCleared: function (provider) {
		this._refreshItems();
	},
	onTreeDataProviderRowCountChanged: function (provider, newCount) {
	},
	onTreeDataProviderRowAdding: function (provider, row, index) {
		return true;
	},
	onTreeDataProviderRowAdded: function (provider, row) {
		if (this.isSorted()) {
			this._saveAndRefresh();
		} else {
			var p/*TreeItem*/ = this._itemMap[row.parent().rowId()];
			var item/*TreeItem*/ = this.$_internalAddItem(p, row);
			if (item) {
				this.$_buildItems(item);
				this.$_clearSummary();
				if (p.isExpanded()) {
					this._expandItem(p, true, false, 0, false);
				} else {
					this._fireItemChanged(p);
				}
			}
		}
		if (this._checkableTag) {
			this._checkableTag.addRow(row);
			if (row.parent().level() > 0) {
				this._checkableTag.addRow(row.parent());
			}
		}
	},
	$_buildItems: function (p/*TreeItem*/) {
		var i, child, item;
		var row = p.row();
		var cnt = row.count();
		for (i = 0; i < cnt; i++) {
			child = row.getChild(i);
			item = this.$_internalAddItem(p, child);
			if (item) {
				if (child.count() > 0) {
					this.$_buildItems(item);
				}
			}
		}
	},
	onTreeDataProviderRowsAdded: function (provider, parent, rows) {
		if (this.isSorted()) {
			this._saveAndRefresh();
			return;
		}
		var i, row, item, cnt;
		var p = this._itemMap[parent.rowId()];
		if (p && rows && (cnt = rows.length) > 0) {
			for (i = 0; i < cnt; i++) {
				row = rows[i];
				item = this.$_internalAddItem(p, row);
				if (item) {
					this.$_buildItems(item);
				}
			}
			this.$_clearSummary();
			if (p.isExpanded()) {
				this._expandItem(p, true, false, 0, false);
			} else {
				this._fireItemChanged(p);
			}
			if (this._checkableTag) {
				this._checkableTag.addRows(rows);
				if (parent.level() > 0) {
					this._checkableTag.addRow(parent);
				}
			}
		}
	},
	onTreeDataProviderRowRemoving: function (provider, row) {
		return true;
	},
	onTreeDataProviderRowRemoved: function (provider, row) {
		var item = this._itemMap[row.rowId()];
		if (item) {
			var p = item.parent();
			this.$_internalRemoveItem(item);
			this.$_clearSummary();
			if (p.isExpanded() && p.isVisible()) {
				this._visibleItems.remove(item);
				this._fireRefresh();
			}
		}
	},
	onTreeDataProviderRowsRemoving: function (provider, rows) {
		return true;
	},
	onTreeDataProviderRowsRemoved: function (provider, rows) {
		var i, row, item, p;
		var cnt = rows.length;
		var removed = false;
		for (i = 0; i < cnt; i++) {
			row = rows[i];
			item = this._itemMap[row.rowId()];
			if (item) {
				p = item.parent();
				this.$_internalRemoveItem(item);
				if (p.isExpanded() && p.isVisible()) {
					this._visibleItems.remove(item);
					removed = true;
				}
			}
		}
		this.$_clearSummary();
		if (removed) {
			this._fireRefresh();
		}
	},
	onTreeDataProviderRowUpdating: function (provider, row) {
		return true;
	},
	onTreeDataProviderRowUpdated: function (provider, row) {
		if (this.isSorted()) {
			this._saveAndRefresh();
		} else {
			var item = this._itemMap[row.rowId()];
			this.$_clearSummary();
			this._fireItemUpdated(item);
		}
		if (this._checkableTag) {
			this._checkableTag.updateRow(row);
		}
	},
	onTreeDataProviderValueChanging: function (provider, row, field) {
		return true;
	},
	onTreeDataProviderValueChanged: function (provider, row, field) {
		if (this.isSorted()) {
			this._saveAndRefresh();
		} else {
			var item = this._itemMap[row.rowId()];
			this.$_clearSummary();
			this._fireItemUpdated(item);
		}
		if (this._checkableTag) {
			this._checkableTag.updateRow(row);
		}
	},
	onTreeDataProviderIconIndexChanged: function (provider, row) {
		var item = this._itemMap[row.rowId()];
		if (item && item.isVisible()) {
			this._fireItemChanged(item);
		}
	},
	onTreeDataProviderHasChildrenChanged: function (provider, row) {
		var item = this._itemMap[row.rowId()];
		if (item && item.isVisible()) {
			this._fireItemChanged(item);
		}
	},
	onTreeDataProviderRowStateChanged: function (provider, row) {
		var item = this._itemMap[row.rowId()];
		this.$_internalRowStateChanged(item);
		if (this._checkableTag) {
			this._checkableTag.updateRow(row);
		}
	},
	onTreeDataProviderRowStatesChanged: function (provider, rows) {
		var p, item, row, i, cnt, removed;
		var len = rows.length;
		if (len == 1) {
			row = rows[0];
			item = this._itemMap[row.rowId()];
			this.$_internalRowStateChanged(item);
			if (this._checkableTag) {
				this._checkableTag.updateRow(row);
			}
		} else if (len > 0) {
			removed = false;
			if (this._hideDeleted) {
				for (i = 0, cnt = rows.length; i < cnt; i++) {
					item = this._itemMap[rows[i].rowId()];
					if (item && RowState.isDeleted(item.rowState())) {
						p = item.parent();
						this.$_internalRemoveItem(item);
						if (p.isExpanded() && p.isVisible()) {
							this._visibleItems.remove(item);
						}
						removed = true;
					}
				}
			}
			if (this._checkableTag) {
				this._checkableTag.changeStates(rows);
			}
			if (removed) {
				this.$_clearSummary();
			}
			this._fireRefresh();
		}
	},
	onTreeDataProviderRowSiblingMoved: function (provider, row, delta) {
		if (!this.isSorted()) {
			var item = this._itemMap[row.rowId()];
			if (item) {
				var parent = item.parent();
				parent.moveChild(item.childIndex(), delta);
				this.$_resetVisibleItems();
				this._fireRefresh();
			}
		}
	},
	onTreeDataProviderRowParentChanged: function (provider, row, parent, childIndex) {
		var item = this._itemMap[row.rowId()];
		if (item) {
			var p = this._itemMap[parent.rowId()];
			if (this.isSorted())
				childIndex = p ? p.count() : 0;
			item.changeParent(p, childIndex);
			this.$_resetVisibleItems();
			this._fireRefresh();
		}
	},
	dataSource: function () {
		return this._dataSource;
	},
	setDataSource: function (value) {
		if (value === this._dataSource) {
			return;
		}
		this.$_clearItems();
		this.$_resetSummary();
		if (this._dataSource) {
			this._dataSource.removeTag(this._cellStyles);
			this._dataSource.removeListener(this);
		}
		this._dataSource = _cast(value, TreeDataProvider);
		if (this._dataSource) {
			this.$_buildTree();
			this._dataSource.addTag(this._cellStyles);
			this._dataSource.addListener(this, 0);
		}
		this._fireReset();
	},
	itemCount: function () {
		return this._visibleItems.count();
	},
	rowCount: function () {
		return this._itemCount;
	},
	getItem: function (index) {
		if (index >= 0 && index < this._visibleItems.count()) {
			return this._visibleItems.getItem(index);
		} else {
			return null;
		}
	},
	_refreshItems: function () {
		this.$_clearItems();
		this.$_buildTree();
		this._fireRefresh();
	},
	_saveAndRefresh: function () {
		var save = [];
		this.$_saveExpanded(save, this._rootItem);
		this.$_clearItems();
		this.$_buildTree(save);
		this._fireRefresh();
	},
	getIndexOfRow: function (dataRow) {
		var item = this._itemMap[dataRow];
		return item && item.isVisible() ? item.index() : -1;
	},
	getItemOfRow: function (dataRow) {
		return this._itemMap[dataRow];
	},
	fixedCount: function () {
		return 0;
	},
	setFixed: function (count, sorting, filtering) {
	},
	maxItemCount: function () {
		return 0;
	},
	setMaxItemCount: function (value) {
	},
	findItem: function (fields, values, options, startIndex, endIndex) {
		var ds = _cast(this.dataSource(), TreeDataProvider);
		if (!ds) {
			return -1;
		}
		var rows = this.itemCount();
		if (rows < 1) {
			return -1;
		}
		var flds = Math.min(fields.length, values.length);
		if (flds < 1) {
			return -1;
		}
		var i, item, found, c, 
			all = !options || options.allFields,
			sensitive = options && options.caseSensitive,
			partial = options && options.partialMatch;
		startIndex = Math.max(0, startIndex);
		endIndex = Math.min(this._visibleItems.count() - 1, endIndex);
		for (i = startIndex; i <= endIndex; i++) {
			item = this._visibleItems.getItem(i);
			found = item.dataRow() >= 0;
			if (found) {
				for (c = 0; c < flds; c++) {
					found = $$_compareTextValue(values[c], item.getData(fields[c]), sensitive, partial);
					if (found && !all) {
						return i;
					}
					if (!found && all) {
						break;
					}
				}
			}
			if (found) {
				return i;
			}
		}
		return -1;
	},
    findCell: function (fields, value, options, startIndex, endIndex, startFieldIndex) {
        var ds = this.dataSource();
        if (!ds) {
            return null;
        }
        var rows = this.itemCount();
        if (rows < 1) {
            return null;
        }
        var i, item, found, c;
        var sensitive = options && options.caseSensitive;
        var partial = options && options.partialMatch;
        var fldCount = this.dataSource().fieldCount();
        var fldLen = fields.length;
        startIndex = Math.max(0, startIndex);
        endIndex = Math.min(this._visibleItems.count() - 1, endIndex);
        startFieldIndex = Math.max(0, startFieldIndex);
        if (startFieldIndex >= fields.length) {
            startIndex++;
            startFieldIndex = 0;
        }
        for (i = startIndex; i <= endIndex; i++) {
            item = this._visibleItems.getItem(i);
            if (item.dataRow() >= 0) {
                c = (i > startIndex) ? 0 : startFieldIndex;
                for (; c < fldLen; c++) {
                    var f = fields[c];
                    if (f >= 0 && f < fldCount) {
                        found = $$_compareTextValue(value, item.getData(f), sensitive, partial);
                        if (found) {
                            var returnObj = {
                                itemIndex: i,
                                fieldIndex: f,
                                searchFieldIndex: c
                            };
                            return returnObj;
                        }
                    }
                }
            }
        }
        return null;
    },
	expandWhenGrouping: true,
	footerWhenExpanded: true,
	setFooterWhenExpanded: function (value) {
		if (value != this._footerWhenExpanded) {
			this._footerWhenExpanded = value;
			this.$_resetVisibleItems();
			this._resetItemIndicies();
			this._fireRefresh();
		}
	},
	footerWhenCollapsed: true,
	setFooterWhenCollapsed: function (value) {
		if (value != this._footerWhenCollapsed) {
			this._footerWhenCollapsed = value;
			this.$_resetVisibleItems();
			this._resetItemIndicies();
			this._fireRefresh();
		}
	},
	aggregateMode: "leaf",
	setAggregateMode: function () {
		if (value != this._aggregateMode) {
			this._aggregateMode = value;
			this.$_resetSummary();
			this._fireRefresh();
		}
	},
	summaryMode: "aggregate",
	setSummaryMode: function (value) {
		if (value != this._summaryMode) {
			this._summaryMode = value;
			this.$_resetSummary();
			this._fireRefresh();
		}
	},
	groupSummaryMode: "aggregate",
	setGroupSummaryMode: function (value) {
		if (value != this._groupSummaryMode) {
			this._groupSummaryMode = value;
			this.$_resetGroupSummary();
			this._fireRefresh();
		}
	},
	hideDeleted: false,
	setHideDeleted: function (value) {
		if (value != this._hideDeleted) {
			this._hideDeleted = value;
			this._saveAndRefresh();
		}
	},
	checkableExpression: null,
	setCheckableExpression: function (value) {
		if (value != this._checkableExpression) {
			this._checkableExpression = value;
			if (this._checkableTag) {
				this._checkableTag.disconnect();
				this._checkableTag = null;
			}
			if (value) {
				this._checkableTag = new TreeCheckableTag(this, value);
				if (this._dataSource) {
					this._checkableTag.connect(this._dataSource);
				}
			}
		}
	},
	isSorted: function () {
		return this._sortFields && this._sortFields.length > 0;
	},
	addObserver: function (observer) {
		if (observer && this._observers.indexOf(observer) < 0) {
			this._observers.push(observer);
		}
	},
	removeObserver: function (observer) {
		var index = this._observers.indexOf(observer);
		if (index >= 0) {
			this._observers.splice(index, 1);
		}
	},
	insertItem: function (parent, item, index, after) {
		var visibles = this._visibleItems;
		if (parent.isCollapsed()) {
			visibles.expand(parent, false);
		}
		var i = visibles.indexOf(parent.getItem(index));
		if (after) {
			parent.insert(index + 1, item);
			var cnt = visibles.count();
			var lev = parent.level() + 1;
			while (++i < cnt) {
				if (visibles.getItem(i).level() <= lev) {
					break;
				}
			}
			visibles.insert(item, i);
		} else {
			parent.insert(index, item);
			visibles.insert(item, i);
		}
	},
	appendItem: function (parent, item) {
		var visibles = this._visibleItems;
		if (parent.isCollapsed()) {
			visibles.expand(parent, false);
		}
		var i;
		if (parent.count() > 0) {
			i = visibles.indexOf(parent.getItem(parent.count() - 1));
		} else {
			i = visibles.indexOf(parent);
		}
		var cnt = visibles.count();
		var lev = parent.level();
		while (++i < cnt) {
			if (visibles.getItem(i).level() <= lev) {
				break;
			}
		}
		parent.add(item);
		visibles.insert(item, i);
	},
	removeItem: function (item) {
		this._visibleItems.remove(item);
		item.parent().remove(item);
	},
	$_calcLevel: function (item, level, visibleOnly) {
		var i, child;
		var cnt = item.count();
		var lev = level;
		for (i = 0; i < cnt; i++) {
			child = item.getItem(i);
			if (child) {
				lev = Math.max(lev, level + 1);
				if (!visibleOnly || child.isExpanded()) {
					lev = Math.max(lev, this.$_calcLevel(child, level + 1, visibleOnly));
				}
			}
		}
		return lev;
	},
	getLevels: function (visibleOnly) {
		return this.$_calcLevel(this._rootItem, 0, visibleOnly);
	},
	$_setExpanded: function (item, recursive, level) {
		this._setExpanded(item, true);
		this._dataSource.setHasChildren(item.row(), false);
		if (recursive) {
			var i, child;
			var cnt = item.count();
			for (i = 0; i < cnt; i++) {
				child = item.getItem(i);
				if (child instanceof TreeItem && (child.isExpanded() || child.level() < level)) {
					this.$_setExpanded(child, true, level);
				}
			}
		}
	},
	_expandItem: function (item, force, recursive, level, fireEvents) {
		if (item && (force || !item.isExpanded())) {
			if (fireEvents && !this._fireExpanding(item)) {
				return;
			}
			this._visibleItems.collapse(item);
			this._visibleItems.expand(item, recursive, level);
			this._resetItemIndicies(item === this._rootItem ? 0 : item.index());
			this.$_setExpanded(item, recursive, level > 0 ? item.level() + level : 1000000);
			try {
				this._fireRefresh();
			} finally {
				if (fireEvents) {
					this._fireExpanded(item);
				}
			}
		}
	},
	expand: function (item, recursive, force) {
		this._expandItem(item, force, recursive, 0, true);
	},
	expandAll: function (level) {
		this._expandItem(this._rootItem, true, true, level > 0 ? level + 1 : 0, true);
	},
	$_setCollapsed: function (item, recursive) {
		this._setExpanded(item, false);
		if (recursive) {
			var i, child;
			var cnt = item.count();
			for (i = 0; i < cnt; i++) {
				child = item.getItem(i);
				if (child instanceof TreeItem) {
					this.$_setCollapsed(child, true);
				}
			}
		}
	},
	_collapseItem: function (item, force, recursive, fireEvents) {
		if (item && (force || item.isExpanded())) {
			if (fireEvents && !this._fireCollapsing(item)) {
				return;
			}
			this._visibleItems.collapse(item);
			this.$_setCollapsed(item, recursive);
			if (item == this._rootItem) {
				this._visibleItems.expand(this._rootItem, false);
			}
			this._resetItemIndicies(item === this._rootItem ? 0 : item.index());
			try {
				this._fireRefresh();
			} finally {
				if (fireEvents) {
					this._fireCollapsed(item);
				}
			}
		}
	},
	collapse: function (item, recursive) {
		this._collapseItem(item, false, recursive, true);
	},
	collapseAll: function () {
		this._collapseItem(this._rootItem, true, true, true);			
	},
	$_saveExpanded: function (map, item) {
		var i, child;
		var cnt = item.count();
		for (i = 0; i < cnt; i++) {
			child = _cast(item.getItem(i), TreeItem);
			if (child) {
				child._extents = child.isExpanded() ? (child._extents | ITEM_EXT_SAVEEXPAND) : (child._extents & ~ITEM_EXT_SAVEEXPAND);
				map[child.rowId()] = child._extents;
				if (child.count() > 0) {
					this.$_saveExpanded(map, child);
				}
			}
		}
	},
	orderBy: function (fields, directions, textCases, fireEvent) {
		fireEvent = arguments.length > 3 ? fireEvent : true;
		this._fireSort(fields, directions, textCases);
		this._sortFields = [];
		this._sortDirections = [];
        this._sortCases = [];
		var cnt = fields ? fields.length : 0;
		var len = directions ? directions.length : 0;
        var clen = textCases ? textCases.length : 0;
		for (var i = 0; i < cnt; i++) {
			this._sortFields.push(fields[i]);
			if (len > i) {
				this._sortDirections.push(directions[i]);
			} else if (len > 0) {
				this._sortDirections.push(directions[len - 1]);
			} else {
				this._sortDirections.push(SortDirection.ASCENDING);
			}
            if (clen > i) {
                this._sortCases.push(textCases[i]);
            } else if (clen > 0) {
                this._sortCases.push(textCases[clen - 1]);
            } else {
                this._sortCases.push(SortCase.SENSITIVE);
            }
		}
		var map = [];
		this.$_saveExpanded(map, this._rootItem);
		this.$_clearItems();
		this.$_buildTree(map);
		try {
			if (fireEvent) {
				this._fireRefresh();
			}
		} finally {
			this._fireSorted();
		}
	},
	getSortFields: function () {
		return this._sortFields.concat();
	},
	getSortDirections: function () {
		return this._sortDirections.concat();
	},
    getSortCases: function () {
        return this._sortCases.concat();
    },
	beginFiltering: function () {
		this._filterLock = true;
	},

	$_prepareFiltering: function (map, item) {
		// var i, child;
		var cnt = item._dataRow.count();
		var rowId = item.rowId();
		var filtered = rowId <= -1 ? true : this.$_selectItem(item);

		for (var i = 0; i < cnt; i++) {
			child = new TreeItem(item._dataRow._children[i]);
			if (child) {
				filtered = this.$_prepareFiltering(map, child) || filtered;
			}
		}
		map[rowId] = filtered && rowId >= 0 ? map[rowId] | ITEM_EXT_FILTERED : map[rowId] & ~ITEM_EXT_FILTERED;	// expand //check.
		return filtered;
	},

	endFiltering: function (apply) {
		apply = arguments.length > 0 ? apply : true;
		var prepareMap = [];
		if (apply) {
			// this.$_saveExpanded(prepareMap, this._rootItem); // check, expanded가 정리될때.
			this._addParentNodeOnFiltering && this.$_prepareFiltering(prepareMap, this._rootItem);
		}
		if (this._filterLock) {
			this._filterLock = false;
			apply && this.applyFilters(prepareMap);
		}
	},
	hasFilter: function (field/*int*/) {
		var filters = this._filters[field];
		return filters ? filters.length > 0 : false;
	},
	addFilter: function (field, criteria) {
		this._fireFilterAdded();
		var filters = this._filters[field];
		if (!filters) {
			filters = [];
			this._filters[field] = filters;
		}
		var filter = new ColumnFilterRun(criteria);
		filters.push(filter);
		this.applyFilters();
		return filter;
	},
	removeFilter: function (field, filter/*ColumnFilter*/) {
		if (this._filtered && this._filters[field]) {
			this._fireFilterRemoved(field, filter);
			var filters = this._filters[field];
			for (var i = filters.length; i--;) {
				if (filters[i] === filter) {
					filters.splice(i, 1);
					this.applyFilters();
					break;
				}
			}
		}
	},
	clearFilters: function (field) {
		if (this._filtered && this._filters[field]) {
			this._fireFilterCleared(field);
			var filters = this._filters[field];
			if (filters && filters.length > 0) {
				filters.splice(0, filters.length);
				this._filters[field] = null;
				this.applyFilters();
			}
		}
	},
	clearAllFilters: function () {
		if (this._filtered) {
			this._fireFilterAllCleared();
			this._filters = {};
			this.applyFilters();
		}
	},
	hasFilters: function () {
		for (var fld in this._filters) {
			var filters = this._filters[fld];
			if (filters && filters.length > 0) {
				return true;
			}
		}
		return false;
	},
	applyFilters: function (map) {
		var ds = this.dataSource();
		var cnt = ds.fieldCount();
		for (var fld in this._filters) {
			if (fld >= cnt) {
				this._filters[fld] = null;
			}
		}
		this._filtered = this.hasFilters();
		if (this._filtered) {
			for (var f in this._filters) {
				var filters = this._filters[f];
				if (filters) {
					for (var i = filters.length; i--;) {
						filters[i].prepare(this._filterRuntime, this._dataSource);
					}
				}
			}
		};

		// if (!this._filterLock) {  // check, expanded가 정리될때.
			this.$_clearItems();
			this.$_buildTree(map);
			try {
				this._fireRefresh();
			} finally {
				this._fireFiltered();
			}
		// }
	},
	getItemByRow: function (row) {
		return row ? this._itemMap[row.rowId()] : null;
	},
	getCheckedRows: function () {
		function collectCheckedRows(parent, rows) {
			if (parent instanceof TreeItem) {
				var i, r, item;
				var cnt = parent.count();
				for (i = 0; i < cnt; i++) {
					item = parent.getItem(i);
					item.isChecked() && (r = item.row()) && rows.push(r);
					collectCheckedRows(item, rows);
				}
			}
		}
		var rows = [];
		collectCheckedRows(this._rootItem, rows);
		return rows;
	},
	getCheckedRowIds: function () {
		function collectCheckedRows(parent, rows) {
			if (parent instanceof TreeItem) {
				var i, r, item;
				var cnt = parent.count();
				for (i = 0; i < cnt; i++) {
					item = parent.getItem(i);
					if (item.isChecked() && (r = item.dataRow()) >= 0) {
						rows.push(r);
					}
					collectCheckedRows(item, rows);
				}
			}
		}
		var rows = [];
		collectCheckedRows(this._rootItem, rows);
		return rows;
	},
	resetCheckables: function () {
		if (this._checkableTag) {
			this._checkableTag.clearRows();
			this._fireRefresh();
		}
	},
	applyCheckables: function () {
		if (this._checkableTag) {
			this._checkableTag.setRows();
		} else {
			TreeCheckableTag.clearCheckables(this);
		}
		this._fireRefresh();
	},
	_createRootItem: function () {
		this._rootItem = new RootTreeItem(this);
		this._setExpanded(this._rootItem, true);
		return this._rootItem;
	},
	$_collectItems: function (item, list) {
		var i, child;
		var cnt = item.count();
		for (i = 0; i < cnt; i++) {
			child = item.getItem(i);
			if (child instanceof TreeItem) {
				list.push(child);
				this.$_collectItems(child, list);		
			}
		}
	},
	getAllItems: function () {
		var items = [];
		this.$_collectItems(this._rootItem, items);
		return items;
	},
	$_checkChildren: function (parent, checked, checkableOnly) {
		var i, item;
		var cnt = parent.count();
		for (i = 0; i < cnt; i++) {
			item = parent.getItem(i);
			if (item) {
				if (checkableOnly) {
					if (item.isCheckable()) {
						this._setCheckItem(item, checked);
					}
				} else {
					this._setCheckItem(item, checked);
				}
			}
			if (item instanceof TreeItem) {
				this.$_checkChildren(item, checked, checkableOnly);
			}
		}
	},
	_clearChecked: function () {
		this.$_checkChildren(this._rootItem, false, false);
	},
	checkAll: function (checked, visibleOnly, checkableOnly, checkEvent) {
		if (visibleOnly) {
			this._super(checked, visibleOnly, checkableOnly, checkEvent);
		} else {
			this.$_checkChildren(this._rootItem, checked, checkableOnly);
			checkEvent ? this._fireItemAllChecked(checked):this._fireRefreshClient();			
		}
	},
	hasCellstyle: function () {
		return !this._cellStyles.isEmpty();
	},
	setCellStyle: function (row, field, style) {
		this._cellStyles.setCellStyle(row, field, style);		
	},
	setCellStyles: function (provider, rows, fieldMap) {
		this._cellStyles.setCellStyles(provider, rows, fieldMap);
	},
	removeCellStyle: function (style) {
		this._cellStyles.removeCellStyle(style);
	},
	clearCellStyles: function () {
		this._cellStyles.clearCellStyles();
	},
	checkCellStyle: function (rowId, field) {
		return this._cellStyles.checkCellStyle(rowId, field);
	},
	getCellStyle: function (dataRow, field) {
		return this._cellStyles.getCellStyle(dataRow, field);
	},
	getSum: function (field) {
		var fs = this.$_getSummary(field);
		return fs ? fs.sum : NaN;
	},
	getMax: function (field) {
		var fs = this.$_getSummary(field);
		return fs ? fs.max : NaN;
	},
	getMin: function (field) {
		var fs = this.$_getSummary(field);
		return fs ? fs.min : NaN;
	},
	getAvg: function (field) {
		var fs = this.$_getSummary(field);
		return fs ? fs.avg : NaN;
	},
	getVar: function (field) {
		var fs = this.$_getSummary(field);
		return fs ? fs.vars : NaN;
	},
	getVarp: function (field) {
		var fs = this.$_getSummary(field);
		return fs ? fs.varsp : NaN;
	},
	getStdev: function (field) {
		var fs = this.$_getSummary(field);
		return fs ? Math.sqrt(fs.vars) : NaN;
	},
	getStdevp: function (field) {
		var fs = this.$_getSummary(field);
		return fs ? Math.sqrt(fs.varsp) : NaN;
	},
	$_internalAddItem: function (parent, row, expandedMap) {
		var item = TreeItem.getTemp(row);
		if (this._hideDeleted && RowState.isDeleted(item.rowState())) {
			item = null;
		}
		if ( (expandedMap && (expandedMap[row.rowId()] & ITEM_EXT_FILTERED)) || this.$_selectItem(item)) {
			var item = new TreeItem(row);
			parent.insert(row.index(), item);
			this._itemCount++;
			this._itemMap[row.rowId()] = item;
			return item;
		}
		return null;
	},
	$_internalRemoveItem: function (item) {
		if (item) {
			item.parent().remove(item);
			this._itemCount--;
			this._itemMap[item.row().rowId()] = undefined;
		}
	},
	$_internalRowStateChanged: function (item) {
		if (item && item.isVisible()) {
			if (this._hideDeleted && RowState.isDeleted(item.rowState())) {
				var p = item.parent();
				this.$_internalRemoveItem(item);
				this.$_clearSummary();
				if (p.isExpanded() && p.isVisible()) {
					this._visibleItems.remove(item);
					this._fireRefresh();
				}
			} else {
				this._fireItemChanged(item);
			}
		}
	},
	_setItem: function (item, newItem) {
		this._visibleItems.setItem(item.index(), newItem);
		this._resetItemIndex(item.index());
	},
	$_resetVisibleItems: function () {
		this._visibleItems._clearAndInit(this.fixedCount());
		this._visibleItems.expand(this._rootItem, false);
		this._setExpanded(this._rootItem, true);
		this._resetItemIndicies(0);
	},
	$_clearItems: function () {
		this._visibleItems.clear();
		this._rootItem.clear();
		this._itemMap = [];
		this._itemCount = 0;
	},
	$_selectField: function (filters, item, field) {
		var i, filter;
		var cnt = filters.length;
		for (i = 0; i < cnt; i++) {
			filter = filters[i];
			if (filter.select(this._filterRuntime, item, field)) {
				return true;						
			}
		}
		return false;
	},
	$_selectItem: function (item) {
		var filters;
		for (var fld in this._filters) {
			filters = this._filters[fld];
			if (filters && !this.$_selectField(filters, item, fld)) {
				return false;
			}
		}
		return true;
	},
	$_buildItems: function (parent, expandedMap) {
		var i, child, item;
		var row = parent.row();
		var cnt = row.count();
		for (i = 0; i < cnt; i++) {
			child = row.getChild(i);
			item = this.$_internalAddItem(parent, child, expandedMap);
			if (item) {
				if (expandedMap) {
					item._extents = expandedMap[child.rowId()] ? (expandedMap[child.rowId()] & ~ITEM_EXT_SAVEEXPAND) : 0;
					this._setExpanded(item, (expandedMap[child.rowId()] & ITEM_EXT_SAVEEXPAND) != 0);
				}
				if (child.count() > 0) {
					this.$_buildItems(item, expandedMap);
				}
			}
		}
	},
	$_sortItem: function (parent) {
		var i, child;
		var cnt = parent.count();
		if (cnt > 1) {
			this.$_sort(parent, 0, 0, cnt - 1);
		}
		for (i = 0; i < cnt; i++) {
			child = parent.getItem(i);
			if (child instanceof TreeItem) {
				this.$_sortItem(child);
			}
		}
	},
	$_sort: function (parent, level, startIndex, endIndex) {
		var field = this._sortFields[level];
		var dir = this._sortDirections[level];
        var ds = this._dataSource;
        var ignoreCase = this._sortCases[level] == SortCase.INSENSITIVE;
		this._sorter.run(parent, field, dir, ignoreCase, startIndex, endIndex, level + 1 == this._sortFields.length);
        var t = ds.getField(field).dataType();
        var equalFunc;
        if (t == ValueType.TEXT && ignoreCase) {
            equalFunc = ds.equalTexts.bind(ds);
        } else {
            equalFunc = ds.equalValues.bind(ds);
        }
		if (level + 1 < this._sortFields.length) {
			var i = startIndex;
			var pi = i;
			while (i < endIndex) {
				i++;
				if (!equalFunc(field, parent.getItem(i).row(), parent.getItem(i - 1).row())) {
					this.$_sort(parent, level + 1, pi, i - 1);
					pi = i;
				}
			}
			if (pi < endIndex) {
				this.$_sort(parent, level + 1, pi, endIndex);
			}
		}
	},
	$_buildTree: function (expandedMap) {
		this._rootItem._dataRow = this._dataSource.rootRow();
		this._itemMap[this._rootItem._dataRow.rowId()] = this._rootItem;
		this.$_buildItems(this._rootItem, expandedMap);
		this.$_clearSummary();
		var flds = this._dataSource.fieldCount();
		var sortFlds = this._sortFields;
		var sortDirs = this._sortDirections;
        var sortCases = this._sortCases;
		for (var i = sortFlds.length; i--;) {
			if (sortFlds[i] < 0 ||  sortFlds[i] >= flds) {
				sortFlds.splice(i, 1);
				sortDirs.splice(i, 1);
                sortCases.splice(i, 1);
			}
		}
		if (this.isSorted() && this._rootItem.count() > 1) {
			this.$_sortItem(this._rootItem);
		}
		this.$_resetVisibleItems();
		if (this._checkableTag) {
			this._checkableTag.setRows();
		}
	},
	$_resetSummary: function () {
		this._summaryMap = [];
	},
	$_resetGroupSummary: function () {
	},
	$_clearSummary: function () {
		if (this._summaryMap) {
			for (var i = this._summaryMap.length; i--;) {
				this._summaryMap[i] && this._summaryMap[i].clear();
			}
		}
	},
	$_getSummary: function (field) {
		var summary = this._summaryMap[field];
		if (!summary) {
			var ds = this.dataSource();
			if (ds && ds.canSummarize(field)) {
				summary = new FieldSummary(field);
				this._summaryMap[field] = summary;
			}
		}
		if (summary && summary.count == 0 && this.itemCount() > 0) {
			this.$_summarize(summary);
		}
		return summary;
	},
	$_summarize: function (fldSummary) {
		var ds = this.dataSource();
		if (ds) {
			if (this._filtered) {
				var items = this._rootItem.getDescendants(false);
				var cnt = items.length;
				var rows = [];
				for (var i = 0; i < cnt; i++) {
					var ti = items[i];
					if (ti instanceof TreeItem) {
						rows.push(ti.row());
					}
				}
				fldSummary.count = rows.length;
				ds.summarizeRange(fldSummary, rows, this._summaryMode == SummaryMode.STATISTICAL);
			} else {
				fldSummary.count = ds.rowCount();
				ds.summarize(fldSummary, this._summaryMode == SummaryMode.STATISTICAL);
			}
		}
	},
	_fireItemChanged: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(TreeItemProvider.ITEM_CHANGED, item);
		} 
	},
	_fireExpanding: function (item) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(TreeItemProvider.EXPANDING, item);
		} 
		return true;
	},
	_fireExpanded: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(TreeItemProvider.EXPANDED, item);
		} 
	},
	_fireCollapsing: function (item) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(TreeItemProvider.COLLAPSING, item);
		} 
		return true;
	},
	_fireCollapsed: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(TreeItemProvider.COLLAPSED, item);
		} 
	},
	_fireParentChanging: function (itemIndex, parent, childIndex) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(TreeItemProvider.PARENT_CHANGING, itemIndex, parent, childIndex);
		}
		return true;
	},
	_fireParentChanged: function (item, oldIndex, parent) {
		if (this._eventLock <= 0) {
			this.fireEvent(TreeItemProvider.PARENT_CHANGED, item, oldIndex, parent);
		} 		
	}
});
TreeItemProvider.ITEM_CHANGED = "onTreeItemProviderItemChanged";
TreeItemProvider.EXPANDING = "onTreeItemProviderExpanding";
TreeItemProvider.EXPANDED = "onTreeItemProviderExpanded";
TreeItemProvider.COLLAPSING = "onTreeItemProviderCollapsing";
TreeItemProvider.COLLAPSED = "onTreeItemProviderCollapsed";
var TreeEditItem = defineClass("TreeEditItem", TreeItem, {
	init: function (provider, item, state) {
		this._super(item ? item.row() : null);
		this._provider = provider;
		this._item = item;
		this._state = state;
		this._values = [];
		this._started = false;
		this._checkDiff = false;
        this._strictDiff = false;
	},
	destroy: function() {
		this._destroying = true;
		this._values = null;
		this._super();
	},
	values: function () {
		return this._values.concat();
	},
	setValues: function (vals) {
		var i, f, fld, oldValue, newValue,
			ds = this.dataSource(),
			cnt = ds.fieldCount();
		if (_isArray(arr)) {
			cnt = Math.min(cnt, vals.length);
			for (i = 0; i < cnt; i++) {
				fld = ds.getField(i);
				oldValue = this._values[i];
				newValue = fld.readValue(arr[i]);
				this._values[i] = newValue;
				if (this._started && parent && !fld.equalValues(oldValue, newValue)) {
					this._provider._editItemCellUpdated(this, i, oldValue, newValue);
				}
			}
		} else if (vals) {
			for (i = 0; i < cnt; i++) {
				f = ds.getOrgFieldName(i);
				if (vals.hasOwnProperty(f)) {
					fld = ds.getField(i);
					oldValue = this._values[i];
					newValue = fld.readValue(vals[f]);
					this._values[i] = newValue;
					if (this._started && parent && !fld.equalValues(oldValue, newValue)) {
						this._provider._editItemCellUpdated(this, i, oldValue, newValue);
					}
				}
			}
		}
	},
	beginEdit: function (checkDiff, strictDiff) {
		this._started = true;
		this._checkDiff = checkDiff;
        this._strictDiff = strictDiff;
	},
	setValue: function (field, value) {
		var ds = this.dataSource();
		if (field < 0 && field >= ds.fieldCount()) {
			throw new RangeError("field index is out of bounds: " + field);
		}
		var fld = ds.getField(field); 
		var oldValue = this._values[field];
		value = fld.readValue(value);
		this._values[field] = value; 
		if (this._started && this.parent() && !fld.equalValues(oldValue, value)) {
			this._provider._editItemCellUpdated(this, field, oldValue, value);
		}
	},
	dataSource: function () {
		return this._provider.dataSource();
	},
	itemState: function () {
		return this._state;
	},
	rowState: function () {
		return this._item ? this._item.rowState() : RowState.NONE;
	},
	iconIndex: function () {
		return this._item ? this._super() : -1;
	},
	hasChildren: function () {
		return this._item ? this._super() : false;
	},
	dataRow: function () {
		return this._item ? this._super() : -1;
	},
	isExpanded: function () {
		return this._item ? this._item.isExpanded() : false;
	},
	getData: function (field) {
		if (field < 0 && field >= this.dataSource().fieldCount()) {
			throw new RangeError("field index is out of bounds: " + field);
		}
		return this._values[field];
	},
	setData: function (field, value) {
		var ds = this.dataSource();
		if (field < 0 && field >= ds.fieldCount()) {
			throw new RangeError("field index is out of bounds: " + field);
		}
		var fld = ds.getField(field); 
		var oldValue = this._values[field];
		value = fld.readValue(value);
        var can = !this._checkDiff;
        if (!can) {
            if (this._strictDiff) {
                can = !fld.equalValues(oldValue, value);
            } else {
                can = !fld.sameValues(oldValue, value);
            }
        }
		if (can) {
			this._values[field] = value;
			if (this.parent()) {
				this._provider._editItemCellUpdated(this, field, oldValue, value);
				this._provider._editItemCellEdited(this, field);
			}
		}
	},
	getRowData: function () {
		return this._values.concat();
	},
	getRowObject: function () {
		var ds = this.dataSource();
		if (ds) {
			var i, fld, 
				cnt = ds.fieldCount(),
				row = {};
			for (i = 0; i < cnt; i++) {
				fld = ds.getOrgFieldName(i);
				row[fld] = this._values[i];
			}
			return row;
		} else {
			return null;
		}
	}
});
var TreeCellStyleMap = defineClass("TreeCellStyleMap", null, {
	init: function(owner) {
		this._super();
		this._owner = owner; // TreeItemProvider
		this._styleMap = {};
	},
	isEmpty: function () {
		for (var p in this._styleMap) {
			return false;
		}
		return true;
	},
	connect: function (provider) {
	},
	disconnect: function () {
	},
	clearRows: function () {
		this._styleMap = {};
	},
	setRows: function () {
	},
	addRow: function (row/*TreeDataRow*/) {
	},
	addRows: function (row) {
	},
	removeRow: function (row) {
		if (row) {
			var children = row.descendants();
			if (children) {
				for (var i = children.length; i--;) {
					delete this._styleMap[children[i].rowId];
				}
				delete this._styleMap[row.rowId()];
			}
		}
	},
	removeRows: function (rows) {
		for (var i = rows.length; i--;) {
			this.removeRow(rows[i]);
		}
	},
	updateRow: function () {
	},
	setCellStyle: function (row, field, style) {
		var item = this._owner.getItemOfRow(row);
		var dataRow = item ? item.row() : null;
		if (dataRow == null) {
			return;
		}
		if (field < 0) {
			this._styleMap[dataRow.rowId()] = style;
		} else {
			var styles;
			var oldStyle = this._styleMap[dataRow.rowId()];
			if (oldStyle) {
				if (_isArray(oldStyle)) {
					oldStyle[field] = style;
				} else {
					var i;
					var cnt = this._owner.dataSource().fieldCount();
					styles = [];
					for (i = 0; i < cnt; i++) {
						styles[i] = oldStyle;
					}
					this._styleMap[dataRow.rowId()] = styles;
				}
			}
			styles = this._styleMap[dataRow.rowId()];
			if (!_isArray(styles)) {
				styles = [];
			}
			styles[field] = style;
			this._styleMap[dataRow.rowId()] = styles;
		}
	},
	setCellStyles: function (provider/*DataCellStyleProvider*/, rows, fieldMap) {
		function setArray(self, ds, rows, fields) {
			var r, f, fld, style, vals;
			var cnt = rows.length;
			var flds = Math.min(fields.length, ds.fieldCount());
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
		function setObjects(self, ds, rows, fields) {
			var r, f, fld, style, row;
			var cnt = rows.length;
			for (r = 0; r < cnt; r++) {
				row  = rows[r];
				if (row) {
					for (f in fields) {
						fld = fields[f];
						style = provider.getStyle(row[f]);
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
		var i, fld, cnt, fields;
		var ds = this._owner.dataSource();
		var fldCount = ds.fieldCount();
		if (_isArray(fieldMap)) {
			fields = fieldMap.concat();
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
			setObjects(this, ds, rows, fields);
		}
	},
	removeCellStyle: function (style) {
		for (var rowId in this._styleMap) {
			var styles = this._styleMap[rowId];
			if (_isArray(styles)) {
				for (var i = styles.length; i--;) {
					if (styles[i] === style) {
						styles[i] = null;
					}
				}
			} else {
				if (this._styleMap[rowId] === style) {
					delete this._styleMap[rowId];
				}
			}
		}
	},
	clearCellStyles: function () {
		this._styleMap = {};
	},
	checkCellStyle: function (rowId, field) {
		var style = this._styleMap[rowId];
		if (_isArray(style)) {
			return !!style[field];
		} else {
			return !!style;
		}
	},
	getCellStyle: function (row, field) {
		var item/*TreeItem*/ = this._owner.getItemOfRow(row);
		var dataRow/*ITreeDataRow*/ = item ? item.row() : null;
		if (dataRow) {
			var style = this._styleMap[dataRow.rowId()];
			if (_isArray(style)) {
				return style[field];
			} else {
				return style;
			}
		}
		return null;
	}
});
var TreeCheckableTag = defineClass("TreeCheckableTag", null, {
	init: function (owner, expression) {
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
		TreeCheckableTag.clearCheckables(this._owner);
	},
	setRows: function () {
		for (var i = this._owner.itemCount(); i--;) {
			var item = this._owner.getItem(i);
			if (item instanceof TreeItem) {
				this.$_setCheckable(item);
			}
		}
	},
	addRow: function(row/*TreeDataRow*/) {
		var item = this._owner.getItemOfRow(row.rowId());
		if (item instanceof TreeItem) {
			this.$_setCheckable(item);
		}
	},
	addRows: function (rows) {
		for (var i = rows.length; i--;) {
			var item = this._owner.getItemOfRow(rows[i].rowId());
			if (item instanceof TreeItem) {
				this.$_setCheckable(item);
			}
		}
	},
	updateRow: function (row) {
		var item = this._owner.getItemOfRow(row.rowId());
		if (item instanceof TreeItem) {
			this.$_setCheckable(item);
		}
	},
	changeStates: function (rows) {
		for (var i = rows.length; i--;) {
			var item = this._owner.getItemOfRow(rows[i].rowId());
			if (item instanceof TreeItem) {
				this.$_setCheckable(item);
			}
		}
	},
	$_setCheckable: function (item/*TreeItem*/) {
		if (item) {
			this._runtime.setItem(item);
			item.setCheckable(this._exprNode.evaluate(this._runtime));
			for (var i = item.count(); i--;) {
				var child = item.getItem(i);
				child instanceof TreeItem && this.$_setCheckable(child);
			}
		}
	}
}, {
	clearCheckables: function (items) {
		var clearCheckable = function (item) {
			if (item) {
				item.setCheckable(true);
				for (var i = item.count(); i--;) {
					var child = item.getItem(i);
					child instanceof TreeItem && clearCheckable(child);
				}
			}
		};
		for (var i = items.itemCount(); i--;) {
			var item = items.getItem(i);
			if (item instanceof TreeItem) {
				clearCheckable(item);
			}
		}
	}
});
var TreeGridItemProvider = defineClass("TreeGridItemProvider", EditableItemProvider, {
	init: function (indexing) {
		this._super(null, indexing);
		this._observers = [];
		this._items = new TreeItemProvider();
		this.setSource(this._items);
		this._summarizer = new DefaultSummarizer(this._items);
		this._editingItem = null;
		this._appending = false;
		this._insertAfter = false;
		this._insertIndex = -1;
	},
	onItemProviderFilterAdd: function (provider, field, criteria) {
	},
	onItemProviderFilterRemove: function (provider, field, filter) {
	},
	onItemProviderFilterClear: function (provider, field) {
	},
	onItemProviderFilterClearAll: function (provider) {
	},
	onItemProviderFiltered: function (provider) {
	},
	onItemProviderSort: function (provider, fields, directions) {
		this._fireSort(fields, directions);
	},	
	onItemProviderSorted: function (provider) {
		this._fireSorted();
	},
	setAggregateMode: function (value) {
		this._items.setAggregateMode(value);
	},
	setSummaryMode: function (value) {
		this._items.setSummaryMode(value);
	},
	setGroupSummaryMode: function (value) {
		this._items.setGroupSummaryMode(value);
	},
	summarizer: function () {
		return this._summarizer;
	},
	getLevels: function (visibleOnly) {
		return this._items.getLevels(visibleOnly);
	},
	orderBy: function (fields, directions, textCases) {
		this._items.orderBy(fields, directions, textCases);
	},
	getSortFields: function () {
		return this._items.getSortFields();
	},
	getSortDirections: function () {
		return this._items.getSortDirections();
	},
    getSortCases: function () {
        return this._items.getSortCases();
    },
	addFilter: function (field, criteria) {
		this._items.addFilter(field, criteria);
	},
	removeFilter: function (field, filter) {
		this._items.removeFilter(field, filter);
	},
	clearFilters: function (field) {
		this._items.clearFilters(field);
	},
	clearAllFilters: function () {
		this._items.clearAllFilters();
	},
	beginFiltering: function () {
		this._items.beginFiltering();
	},
	endFiltering: function () {
		this._items._addParentNodeOnFiltering = this._addParentNodeOnFiltering;
		this._items.endFiltering();
	},
	expand: function (item, recursive, force) {
		this._items.expand(item, recursive, force);
	},
	collapse: function (item, recursive) {
		this._items.collapse(item, recursive);
	},
	expandAll: function (level) {
		this._items.expandAll(level);
	},
	collapseAll: function () {
		this._items.collapseAll();
	},
	getCheckedRows: function () {
		return this._items.getCheckedRows();
	},
	getCheckedRowIds: function () {
		return this._items.getCheckedRowIds();
	},
	setCheckableExpression: function (expr) {
		this._items.setCheckableExpression(expr);
	},
	resetCheckables: function () {
		this._items.resetCheckables();
	},
	applyCheckables: function () {
		this._items.applyCheckables();
	},
	hideDeleted: function () {
		return this._items.hideDeleted;
	},
	setHideDeleted: function (value) {
		this._items.setHideDeleted(value);			
	},
	getAllItems: function () {
		return this._items.getAllItems();
	},
	getItem: function (index) {
		return this._items.getItem(index);
	},
	getItemOfRow: function (dataRow) {
		return this._items.getItemOfRow(dataRow);
	},
	findItem: function (fields, values, options, startIndex, endIndex) {
		return this._items.findItem(fields, values, options, startIndex, endIndex);
	},
    findCell: function (fields, value, options, startIndex, endIndex, startFieldIndex) {
        return this._items.findCell(fields, value, options, startIndex, endIndex, startFieldIndex);
    },
	checkItem: function (item, checked, exclusive, checkEvent) {
		this._items.checkItem(item, checked, exclusive, checkEvent);
	},
	checkAll: function (checked, visibleOnly, checkableOnly, checkEvent) {
		this._items.checkAll(checked, visibleOnly, checkableOnly, checkEvent);
	},
	hasCellStyle: function () {
		return this._items.hasCellstyle();
	},
	setCellStyle: function (row, field, style) {
		this._items.setCellStyle(row, field, style);
	},
	setCellStyles: function (provider, rows, fieldMap) {
		this._items.setCellStyles(provider, rows, fieldMap);
	},
	removeCellStyle: function (style) {
		this._items.removeCellStyle(style);
	},
	clearCellStyles: function () {
		this._items.clearCellStyles();
	},
	checkCellStyle: function(rowId, field) {
		return this._items.checkCellStyle(rowId, field);
	},
	getCellStyle: function (dataRow, field) {
		return this._items.getCellStyle(dataRow, field);
	},
	/*
	canUpdate: function (item, field) {
		if (item) {
			return true;
		}
		return false;
	},
	*/
	canAppend: function () {
		return false;
	},
	canInsert: function (item, field) {
		if (item) {
			return true;
		}
		return false;
	},
	canDelete: function (item, field) {
		if (item) {
			return true;
		}
		return false;
	},
	$_replaceItem: function (item, newItem) {
		var parent = item.parent();
		parent.setItem(item, newItem);
		this._items._setItem(item, newItem);
	},
	_doBeginUpdate: function (item) {
		this._editingItem = this._createEditItem(item, ItemState.UPDATING, null);
		this.$_replaceItem(item, this._editingItem);
		return this._editingItem;
	},
	_doBeginAppend: function (defaultValues) {
		this._editingItem = this._createEditItem(null, ItemState.APPENDING, defaultValues);
		return this._editingItem;
	},
	_doBeginInsert: function (item, defaultValues, shift, ctrl) {
		if (ctrl) {
			this._appending = true;
			item.setExpanded(true);
			this._editingItem = this._createEditItem(null, ItemState.INSERTING, defaultValues);
			this._items.appendItem(item, this._editingItem);
		} else {
			var p = item.parent();
			this._appending = false;
			this._insertAfter = shift;
			this._insertIndex = p.indexOf(item);
			this._editingItem = this._createEditItem(item, ItemState.INSERTING, defaultValues);
			this._items.insertItem(p, this._editingItem, this._insertIndex, this._insertAfter);
		}
		return this._editingItem;
	},
	_doCompleteUpdate: function (orgItem) {
		var rslt = false;
		var ds = this.dataSource();
		if (ds) {
			this.$_replaceItem(this._editingItem, orgItem);
			var row = this._editingItem.row();
			try {
				rslt = row.update(this._editingItem.values());
			} catch (e) {
				this.$_replaceItem(orgItem, this._editingItem);
				throw e;
			}
			if (rslt) {
				// this._copyExtents(this._editingItem, orgItem);
				/* update(..)에서 orgItem에 checkable을 변경한다. 위문장은 주석처리 2016.04.04*/
			} else {
				this.$_replaceItem(orgItem, this._editingItem);
			}
		}
		return rslt;
	},
	_doCompleteInsert: function (appending) {
		var rslt = false;
		var ds = this.dataSource();
		if (ds) {
			var parent = this._editingItem.parent();
			var row = parent.row();
			var child = ds.createRow(this._editingItem.values(), -1, false);
			var index = this._editingItem.parent().indexOf(this._editingItem);
			this._items.removeItem(this._editingItem);
			try {
				if (this.isAppending()) {
					rslt = row.addChild(child);
				} else {
					rslt = row.insertChild(index, child);
				}
			} catch (e) {
				if (this._appending) {
					this._items.appendItem(parent, this._editingItem);
				} else {
					this._items.insertItem(parent, this._editingItem, this._insertIndex, this._insertAfter);
				}
				throw e;
			}
			if (rslt) {
				var item = parent.itemOfRow(child.rowId);
				this._copyExtents(this._editingItem, item);
			} else {
				if (this._appending) {
					this._items.appendItem(parent, this._editingItem);
				} else {
					this._items.insertItem(parent, this._editingItem, this._insertIndex, this._insertAfter);
				}
			}
		}
		return rslt;
	},
	_doCancelEdit: function (state, orgItem) {
		if (state == ItemState.UPDATING) {
			this.$_replaceItem(this._editingItem, orgItem);
			this._copyExtents(this._editingItem, orgItem);
		} else if (state == ItemState.INSERTING) {
			if (this._editingItem.parent()) {
				this._items.removeItem(this._editingItem);
			}
		}
		this._super(state, orgItem);
	},
	_doCommitEdit: function (state, orgItem) {
		if (state == ItemState.UPDATING) {
		} else if (state == ItemState.INSERTING) {
		}
		this._super(state, orgItem);
	},
	remove: function (item) {
		if (item instanceof TreeItem) {
			var row = item.row();
			if (row) {
				row.parent().removeChild(row);
			}
		}
	},
	removeAll: function (items) {
		if (items && items.length > 0) {
			var rows = [];
			for (var i = 0, cnt = items.length; i < cnt; i++) {
				var item = this._items.getItem(items[i]);
				if (item instanceof TreeItem) {
					rows.push(item.row());
				}
			}
			this.dataSource().removeRows(rows);
		}
	},
	getRemovableRows: function (items) {
		if (items.length > 0) {
			var rows = [];
			for (var i = 0, cnt = items.length; i < cnt; i++) {
				var item = this._items.getItem(items[i]);
				if (item instanceof TreeItem) {
					rows.push(item.row());
				}
			}
			return rows;
		}
	},
	removeRows: function (rows) {
		if (rows) {
			this.dataSource().removeRows(rows);
		}
	},
	dataSource: function () {
		return this._items.dataSource();
	},
	setDataSource: function (value) {
		this._items.setDataSource(value);
	},
	rootItem: function () {
		return this._items._rootItem;
	},
	_createEditItem: function (target, state, defaultValues) {
		this._editingItem = null;
		var ds = this.dataSource();
		if (!ds) {
			return null;
		}
		var i,
			flds = ds.fieldCount();
		switch (state) {
			case ItemState.UPDATING:
				this._editingItem = new TreeEditItem(this, target, state);
				for (i = 0; i < flds; i++) {
					this._editingItem.setValue(i, target.getData(i));
				}
				this._copyExtents(target, this._editingItem);
				break;
			case ItemState.INSERTING:
			case ItemState.APPENDING:
				this._editingItem = new TreeEditItem(this, null, state);
				if (defaultValues) {
					for (i = 0; i < flds; i++) {
						if (defaultValues.length > i) {
							this._editingItem.setValue(i, defaultValues[i]);
						}
					}
				}
				break;
		}
		return this._editingItem;
	},
	onTreeItemProviderItemChanged: function (provider, item) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(TreeItemProvider.ITEM_CHANGED, item);
		} 
	},
	onTreeItemProviderExpanding: function (provider, item) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(TreeItemProvider.EXPANDING, item);
		} 
		return true;
	},
	onTreeItemProviderExpanded: function (provider, item) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(TreeItemProvider.EXPANDED, item);
		} 
	},
	onTreeItemProviderCollapsing: function (provider, item) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(TreeItemProvider.COLLAPSING, item);
		} 
		return true;
	},
	onTreeItemProviderCollapsed: function (provider, item) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(TreeItemProvider.COLLAPSED, item);
		} 
	},
	onItemProviderFilterAdded: function (provider, field, criteria) {
		this._fireFilterAdded(field, criteria);
	},
	onItemProviderFilterRemoved: function (provider, field, filter) {
		this._fireFilterRemoved(field, filter);
	},
	onItemProviderFilterCleared: function (provider, field) {
		this._fireFilterCleared(field);
	},
	onItemProviderFilterAllCleared: function (provider) {
		this._fireFilterAllCleared();
	},
	onItemProviderFiltered: function (provider) {
		this._fireFiltered(ItemProvider.FILTERED);
	},
	onItemProviderSort: function (provider, fields, directions) {
		this._fireSort(fields, directions);
	},
	onItemProviderSorted: function (provider) {
		this._fireSorted();
	}
});
