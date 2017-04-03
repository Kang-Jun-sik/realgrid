var /* @internal */ GroupedVisibleItems = function (provider) {
	var _provider = provider;
	var _fixedCount = 0;
	var _items = [];
	var _list = [];
	var _collectChildren = function (parent, list, recursive, setFlag) {
		var i;
		var cnt;
		var item;
		var group;
		if (setFlag && parent instanceof GroupItem) {
			parent._setExpanded(true);
		}
		if (_provider.isMergeMode()) {
			if (!(parent instanceof RootItem) && 
				(_provider.expandedAdornments() == RowGroupAdornments.HEADER || _provider.expandedAdornments() == RowGroupAdornments.BOTH)) {
				list.push(parent);
			}
			for (i = 0, cnt = parent.count(); i < cnt; i++) {
				item = parent.getItem(i);
				if (item instanceof GroupItem) {
					group = item;
					if (recursive || group.isExpanded()) {
						_collectChildren(group, list, recursive, setFlag);
					} else {
						switch (_provider.collapsedAdornments()) {
							case RowGroupAdornments.BOTH:
								list.push(group);
								if (group.footer) {
									list.push(group.footer());
								}
								break;
							case RowGroupAdornments.FOOTER:
								list.push(group.footer());
								break;
							case RowGroupAdornments.HEADER:
							default:
								list.push(group);
								break;
							/*
							case ROWGROUPADORNMENTS.NONE:
								list.push(group.firstItem());
								break;
							*/
						}
					}
				} else if (item != parent.footer()) { 
					list.push(item);
				}
			}
			if (!(parent instanceof RootItem) && 
				(_provider.expandedAdornments() == RowGroupAdornments.FOOTER || _provider.expandedAdornments() == RowGroupAdornments.BOTH || _provider.expandedAdornments() == RowGroupAdornments.SUMMARY)) {
				list.push(parent.footer());
			}
		} else {
			if (!(parent instanceof RootItem)) {
				if (_provider.expandedAdornments() == RowGroupAdornments.SUMMARY) {
					var footer = parent.footer();
					footer._expandable = true;
					list.push(footer) 
				} else {
					list.push(parent);
				}
			}
			for (i = 0, cnt = parent.count(); i < cnt; i++) {
				item = parent.getItem(i);
				if (item instanceof GroupItem) {
					group = item;
					if (recursive || group.isExpanded()) {
						_collectChildren(group, list, recursive, setFlag);
					} else {
						switch (_provider.collapsedAdornments()) {
						case RowGroupAdornments.HEADER:
							list.push(group);
							break;
						case RowGroupAdornments.FOOTER:
							var footer = group.footer();
							footer._expandable = true;
							list.push(footer);
							break;
						case RowGroupAdornments.BOTH:
						default:
							list.push(group);
							if (group.footer()) {
								var footer = group.footer();
								footer._expandable = false;
								list.push(group.footer());
							}
							break;
						}
					}
				} else if (!(item instanceof GroupFooter)) { // footer는 제일 마지막에
					list.push(item);
				}
			}
			if (!(parent instanceof RootItem)) {
				if (_provider.expandedAdornments() == RowGroupAdornments.BOTH) {
					var footer = parent.footer();
					footer._expandable = false;
					list.push(footer);
				}
			}
		}
	};
	var _expandItem = function (group, recursive, setFlag) {
		var idx;				
		if (group instanceof RootItem) {
			idx = _fixedCount;
		} else if (_provider.isMergeMode()) {
			/*
			 * 현재, collapsed 상태에서만 여기가 호출된다고 가정한다.
			 * group item 이 포함되지 않는 경우가 있다.
			 * collapsed style 별로 기존 아이템들을 제거한다.
		     */
			switch (_provider.collapsedAdornments()) {
				case RowGroupAdornments.BOTH:
					idx = group.index();
					_items.splice(idx, 2);
					break;
				case RowGroupAdornments.FOOTER:
					idx = group.footer().index();
					_items.splice(idx, 1);
					break;
				case RowGroupAdornments.HEADER:
				default:
					idx = group.index();
					_items.splice(idx, 1);
					break;
			}
			if (setFlag) {
				group._index = -1;
			}
		} else {
			if (_provider.collapsedAdornments() == RowGroupAdornments.FOOTER) {
				idx = group.footer().index();
				_items.splice(idx,1);
			} else {
				idx = group.index();
				/*
				 * 현재, collapsed 상태에서만 여기가 호출된다고 가정한다.
				 * 기존 group header와 footer를 제거한다.
				 */
				_items.splice(idx, 1);
				var collapsedAdornment = _provider.collapsedAdornments();
				if (collapsedAdornment == RowGroupAdornments.BOTH || collapsedAdornment == RowGroupAdornments.FOOTER) {
					_items.splice(idx, 1);
				}
			}
		}
		_list.splice(0, _list.length);
		_collectChildren(group, _list, recursive, setFlag);
		for (var i = 0, cnt = _list.length; i < cnt; i++) {
			_items.splice(idx + i, 0, _list[i]);
		}
	};
	var _firstIndex = function (group) {
		var idx = group.index();
		if (idx >= 0) { 
			return idx;
		}
		for (var i = 0, cnt = group.count(); i < cnt; i++) {
			var item = group.getItem(i);
			if (item.index() >= 0) {
				return item.index();
			}
			var g = _cast(item, GroupItem);
			if (g) {
				idx = _firstIndex(g);
				if (idx >= 0) {
					return idx;
				}
			}
		}
		return -1;
	};
	this.provider = function () {
		return _provider;
	};
	this.count = function () {
		return _items.length;
	};
	this.fixedCount = function () {
		return _fixedCount;
	};
	this.getItems = function () {
		return _items.slice();
	};
	this.getItem = function (index) {
		return _items[index];
	},
	this.clear = function (items) {
		items = items ? items : _items;
		for (var i = 0, cnt = items.length; i < cnt; i++) {
			items[i]._parent = provider._rootItem;
			if (items[i] instanceof GroupItemImpl && items[i]._children) {
				this.clear(items[i]._children)
			}
		}
		items.splice(0, items.length);
	};
	this.expand = function (group, recursive, setFlag) {
		setFlag = arguments.length > 2 ? setFlag : true;
		_expandItem(group, recursive, setFlag);
		return true;
	};
	this.collapse = function (group, recursive) {
		var idx;
		var item;
		if (group instanceof GroupItem) {
			group._setExpanded(false);
		}
		if (_provider.isMergeMode()) {
			idx = group.index();
			if (idx >= 0) {
				_items.splice(idx, 1);
				group._index = -1;
			} else {
				idx = _firstIndex(group);
			}
			while (idx < _items.length) {
				item = _items[idx];
				if (!item.isDescendantOf(group)) {
					break;
				}
				_items.splice(idx, 1);
				item._index = -1;
				if (recursive && item instanceof GroupItem) {
					item._setExpanded(false);
				}
			}
			switch (_provider.collapsedAdornments()) {
			case RowGroupAdornments.BOTH:
				group._index = idx;
				_items.splice(idx, 0, group);
				_items.splice(idx + 1, 0, group.footer());
				break;
			case RowGroupAdornments.FOOTER:
				_items.splice(idx, 0, group.footer());
				break;
			case RowGroupAdornments.HEADER:
			default:
				group._index = idx;
				_items.splice(idx, 0, group);
				break;
			}
		} else {
			idx = group.index();
			if (idx >= 0) {
				_items.splice(idx, 1);
				group._index = -1;
			} else {
				var footer = group.footer();
				idx = footer.index();
				_items.splice(idx,1);
				footer._index = -1;
			}
			while (idx < _items.length) {
				item = _items[idx];
				if (!item.isDescendantOf(group)) {
					break;
				}
				_items.splice(idx, 1);
				item._index = -1;
				if (recursive && item instanceof GroupItem) {
					item._setExpanded(false);
				}
			}
			switch (_provider.collapsedAdornments()) {
			case RowGroupAdornments.BOTH:
				group._index = idx;
				_items.splice(idx, 0, group);
				var footer = group.footer();
				footer._index = idx;
				footer._expandable = false;
				_items.splice(idx + 1, 0, group.footer());
				break;
			case RowGroupAdornments.FOOTER:
				var footer = group.footer();
				footer._index = idx;
				footer._expandable = true;
				_items.splice(idx, 0, footer);
				break;
			case RowGroupAdornments.HEADER:
			default:
				group._index = idx;
				_items.splice(idx, 0, group);
				break;
			}
/*
			if (_provider.expandedAdornments() == RowGroupAdornments.FOOTER) {
				idx = group.footer().index();
				while (idx < _items.length) {
					item = _items[idx];
					if (!item.isDescendantOf(group)) {
						break;
					}
					_items.splice(idx, 1);
					item._index = -1;
					if (recursive && item instanceof GroupItem) {
						item._setExpanded(false);
					}
				}
				switch (_provider.collapsedAdornments()) {
				case RowGroupAdornments.BOTH:
					group._index = idx;
					_items.splice(idx, 0, group);
					_items.splice(idx + 1, 0, group.footer());
					break;
				case RowGroupAdornments.FOOTER:
					_items.splice(idx, 0, group.footer());
					break;
				case RowGroupAdornments.HEADER:
				default:
					group._index = idx;
					_items.splice(idx, 0, group);
					break;
				}
			} else {
				idx = group.index();
				switch (_provider.collapsedAdornments()) {
				case RowGroupAdornments.HEADER:
					idx++;
					while (idx < _items.length && _items[idx].level() > group.level()) {
						item = _items[idx];
						_items.splice(idx, 1);
						if (recursive && item instanceof GroupItem) {
							item._setExpanded(false);
						}
					}
					break;
				case RowGroupAdornments.FOOTER:
					while (idx < _items.length && _items[idx].level() > group.level()) {
						if (_items[idx] == group.footer()) {
							break;
						}
						item = _items[idx];
						_items.splice(idx, 1);
						if (recursive && item instanceof GroupItem) {
							item._setExpanded(false);
						}
					}
					break;
				case RowGroupAdornments.BOTH:
				default:
					idx++;
					while (idx < _items.length && _items[idx].level() > group.level()) {
						if (_items[idx] == group.footer()) {
							break;
						}
						item = _items[idx];
						_items.splice(idx, 1);
						if (recursive && item instanceof GroupItem) {
							item._setExpanded(false);
						}
					}
					if (idx >= _items.length || _items[idx] != group.footer()) {
						item = _items[idx];
						_items.splice(idx, 0, group.footer());
						if (recursive && item instanceof GroupItem) {
							item._setExpanded(false);
						}
					}
					break;
				}
			}
*/			
		}
		return true;
	};
	this.getNext = function (item) {
		if (item != null && item.isVisible() && item.index() < this.count() - 1) {
			return _items[item.index() + 1];
		}
		return null;
	};
	this.getPrior = function (item) {
		if (item != null && item.isVisible() && item.index() > 0) {
			return _items[item.index() - 1];
		}
		return null;
	};
	this._clearAndInit = function (source/* ItemProvider */, fixedCount) {
		this.clear();
		if (source) {
			_fixedCount = Math.min(fixedCount, source.itemCount());
			for (var i = 0; i < _fixedCount; i++) {
				_items.push(source.getItem(i));
			}
		} else {
			_fixedCount = 0;
		}
	};
	this._resetIndices = function (fromIndex) {
		fromIndex = arguments.length > 0 ? fromIndex : 0;
		var i,
			cnt = _items.length;
		for (i = fromIndex; i < cnt; i++) {
			_items[i]._index = i;
		}
	};
};
var GroupInfo = function (startIndex, endIndex) {
	this.level = 0;
	this.startIndex = startIndex;
	this.endIndex = endIndex;
	this.children = [];
};
var GroupedItemProvider = defineClass("GroupedItemProvider", ProxyItemProvider, {
	init: function (source, indexing) {
		this._visibleItems = null;
		this._rootItem = null;
		this._groupFields = null;
		this._groupSorting = true;
		this._sortDirection = SortDirection.ASCENDING;
		this._summarizing = false;
		this._grouped = false;
		this._editItem = null;
		this._super(source, indexing);
		this._groupList = {};
	},
	destroy: function() {
		this._destroying = true;
		this._groupList = null;
		this._visibleItems = null;
		this._groupFields = null;
		this._super();
	},
	treeMode: false,
	expandedAdornments: RowGroupAdornments.BOTH,
	collapsedAdornments: RowGroupAdornments.HEADER,
	expandWhenGrouping: false,
	mergeMode: false,
	summaryMode: SummaryMode.AGGREGATE,
	isGrouped: function () {
		return this._grouped;
	},
	groupCount: function () {
		return this._groupFields ? this._groupFields.length : 0;
	},
	setExpandedAdornments: function (value) {
		if (value != this._expandedAdornments) {
			this._expandedAdornments = value;
			if (this.isGrouped()) {
				this._populateItems();
				this._fireRefresh();
			}
		}
	},
	setCollapsedAdornments: function (value) {
		if (value != this._collapsedAdornments) {
			this._collapsedAdornments = value;
			if (this.isGrouped()) {
				this._populateItems();
				this._fireRefresh();
			}
		}
	},
	setMergeMode: function (value) {
		if (value != this._mergeMode) {
			this._mergeMode = value;
			if (!value) {
				this._clearDisplayLevels();
			}
			this._populateItems();
			this._fireRefresh();
		}
	},
	setSummaryMode: function (value) {
		if (value != this._summaryMode) {
			this._summaryMode = value;
			this._populateItems();
			this._fireRefresh();
		}
	},
    canGrouping: function (fields) {
        return this._fireGrouping(fields);
    },
	groupBy: function (fields) {
		this.groupByMode(fields, this._mergeMode);
	},
	groupByMode: function (fields, mergeMode) {
		this._mergeMode = mergeMode;
		this._groupFields = fields ? fields.concat() : null;
		if (!mergeMode) {
			this._clearDisplayLevels();
		}
		this._populateItems();
		try {
			this._fireRefresh();
		} finally {
			this._fireGrouped();
		}
	},
	isGroupedField: function (field) {
		if (this._groupFields) {
			for (var i = this._groupFields.length; i--;) {
				if (this._groupFields[i] == field) {
					return true;
				}
			}
		}
		return false;
	},
	getGroupLevel: function (field) {
		if (this._groupFields && field >= 0) {
			for (var i = this._groupFields.length; i--;) {
				if (this._groupFields[i] == field) {
					return i + 1;
				}
			}
		}
		return 0;
	},
	getGroupedFields: function () {
		return this._groupFields ? this._groupFields.concat(): null;
	},
	expand: function (group, recursive, force) {
		if (group && (!group.isExpanded() || force)) {
			this._fireExpand(group);
			if (group.isExpanded()) {
				this._visibleItems.collapse(group, false);
			}
			if (this._visibleItems.expand(group, recursive)) {
				this._resetItemIndicies(group.index());
				try {
					this._fireRefresh();
				} finally {
					this._fireExpanded(group);
				}
			}
		}
	},
	collapse: function (group, recursive) {
		if (!group || !group.isExpanded()) {
			return;
		}
		this._fireCollapse(group);
		if (this._visibleItems.collapse(group, recursive)) {
			this._resetItemIndicies(group.index());
			try {
				this._fireRefresh();
			} finally {
				this._fireCollapsed(group);
			}
		}
	},
	itemCount: function () {
		return this._grouped ? this._visibleItems.count() : this.source().itemCount();
	},
	getItem: function (index) {
		if (this.isGrouped()) {
			if (index >= 0 && index < this._visibleItems.count()) {
				return this._visibleItems.getItem(index);
			} else {
				return null;
			}
		} else {
			return this.source().getItem(index);
		}
	},
	getItems: function (index, count) {
		if (this.isGrouped()) {
			var i;
			var item;
			var items = [];
			var end = Math.min(this._visibleItems.count(), index + count - 1);
			for (i = index; i < end; i++) {
				item = this._visibleItems.getItem(i);
				items.push(item);
			}
			return items;
		} else {
			return this.source().getItems(index, count);
		}
	},
	getAllItems: function () {
		if (this.isGrouped()) {
			var items = new GroupedVisibleItems(this);
			items.expand(this._rootItem, true, false);
			return items.getItems();
		} else if (this.source()) {
			return this.source().getAllItems();
		} else {
			return null;
		}
	},
	getIndexOfRow: function (dataRow) {
		if (this.isGrouped()) {
			for (var i = 0, cnt = this._visibleItems.count(); i < cnt; i++) {
				if (this._visibleItems.getItem(i).dataRow() == dataRow) {
					return i;
				}
			}
			return -1;
		} else {
			return this.source().getIndexOfRow(dataRow);
		}
	},
	getItemOfRow: function (dataRow) {
		if (this.isGrouped()) {
			for (var i = 0, cnt = this._visibleItems.count(); i < cnt; i++) {
				var item = this._visibleItems.getItem(i);
				if (item.dataRow() == dataRow) {
					return item;
				}
			}
			return null;
		} else {
			return this.source().getItemOfRow(dataRow);
		}
	},
	setFixed: function (count, sorting, filtering) {
		this._super(count, sorting, filtering);
	},
	_initialize: function () {
		this._super();
		this._visibleItems = new GroupedVisibleItems(this);
		this._rootItem = new RootItem(this);
	},
	_clearItems: function () {
		this._visibleItems.clear();
		this._rootItem.clear();
		this._groupList = {};
	},

	_saveExpand: function(parent, map) {
		for (var i=0, cnt=parent._children.length; i< cnt ; i++) {
			var child = parent._children[i];
			if (child instanceof GroupItemImpl || child instanceof MergedGroupHeader) {
				var row = child.firstItem().dataRow();
				var field = child._groupField;
				if (row >= 0 && field >= 0) {
					var value = this.dataSource().getValue(row, field);
					map[value] = {
						expanded:child._expanded,
						children:[]
					}
					this._saveExpand(child,map[value].children);
				}
			}
		};
	},

	_restoreExpand: function(parent, map) {
		for (var i=0, cnt=parent._children.length; i<cnt;i++) {
			var child = parent._children[i];
			if (child instanceof GroupItemImpl || child instanceof MergedGroupHeader) {
				var row = child.firstItem().dataRow();
				var field = child._groupField;
				if (row >= 0 && field >= 0) {
					var value = this.dataSource().getValue(row, field);
					if (map[value]) {
						child._setExpanded(map[value].expanded);
						this._restoreExpand(child,map[value].children);	
					}
				}
			}
		}
	},
	_restoreExpand2: function(parent, map) {
		for (var i=0, cnt=parent._children.length; i<cnt;i++) {
			var child = parent._children[i];
			if (child instanceof GroupItemImpl || child instanceof MergedGroupHeader) {
				var row = child.firstItem().dataRow();
				var field = child._groupField;
				if (row >= 0 && field >= 0) {
					var value = this.dataSource().getValue(row, field);
					if (map[value]) {
						child.setExpanded(map[value].expanded, true, false);
						this._restoreExpand2(child,map[value].children);	
					}
				}
			}
		}
	},

	_populateItems: function (saveExpand) {
		var expandMap = {};
		saveExpand && this._rootItem && this._saveExpand(this._rootItem, expandMap);
		this._clearItems();
		if (!this.source()) {
			return;
		}
		if (this._groupFields) {
			for (var i = this._groupFields.length - 1; i >= 0; i--) {
				if (this._groupFields[i] >= this.dataSource().fieldCount()) {
					this._groupFields.splice(i, 1);
				}
			}
			this._grouped = this._groupFields.length > 0;
		} else {
			this._grouped = false;
		}
		var srcCount = this.source().itemCount();
		if (this._grouped && srcCount > 0) {
			this._buildGroupItems(srcCount);
			saveExpand && this._restoreExpand(this._rootItem, expandMap)
			this.$_resetVisibleItems();
		}
	},
	_resetItemIndicies: function (fromIndex) {
		if (this.isIndexing() && this.isGrouped()) {
			this._visibleItems._resetIndices(fromIndex);
		} else {
			this._super(fromIndex);
		}
	},
	$_checkChildren: function (p, checked, checkableOnly) {
		var i, item;
		var cnt = p.count();
		for (i = 0; i < cnt; i++) {
			item = _cast(p.getItem(i), GridItem);
			if (item) {
				if (checkableOnly) {
					item.isCheckable() && item.$_setChecked(checked);
				} else {
					item.$_setChecked(checked);
				}
			}
			if (item instanceof  GroupItem) {
				this.$_checkChildren(item, checked, checkableOnly);
			}
		}
	},
	_clearChecked: function () {
		if (this.isGrouped()) {
			this.$_checkChildren(this._rootItem, false, false);
		} else {
			this._super();
		}
		this._editItem && this._editItem.$_setChecked(false);
	},
	checkAll: function (checked, visibleOnly, checkableOnly, checkEvent) {
		if (this._editItem) {
			if (checkableOnly) {
				this._editItem.isCheckable() && this._editItem.$_setChecked(checked);
			} else {
				this._editItem.$_setChecked(checked);
			}
		}
		if (visibleOnly || !this.isGrouped()) {
			this._super(checked, visibleOnly, checkableOnly, checkEvent);
		} else {
			var i;
			var cnt = this._visibleItems.fixedCount();
			if (cnt > 0) {
				if (checkableOnly) {
					for (i = cnt; i--;) {
						var item = this.getItem(i);
						item.isCheckable() && item.$_setChecked(checked);
					}
				} else {
					for (i = cnt; i--;) {
						this.getItem(i).$_setChecked(checked);
					}
				}
			}
			this.$_checkChildren(this._rootItem, checked, checkableOnly);
			checkEvent ? this._fireItemAllChecked(checked):this._fireRefreshClient();	
		}
	},
	findItem: function (fields, values, options, startIndex, endIndex) {
		var ds = this.dataSource();
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
		var i, item, found, c;
		var all = !options || options.allFields;
		var sensitive = options && options.caseSensitive;
		var partial = options && options.partialMatch;
		startIndex = Math.max(0, startIndex);
		endIndex = Math.min(rows - 1, endIndex);
		for (i = startIndex; i <= endIndex; i++) {
			item = this.$_getItem(i);
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
		endIndex = Math.min(rows - 1, endIndex);
		startFieldIndex = Math.max(0, startFieldIndex);
		if (startFieldIndex >= fields.length) {
			startIndex++;
			startFieldIndex = 0;
		}
		for (i = startIndex; i <= endIndex; i++) {
			item = this.$_getItem(i);
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
	onItemProviderReset: function (itemProvider) {
		this._super(itemProvider);
	},
	onItemProviderRefresh: function (itemProvider) {
		this._super(itemProvider);
	},
	onItemProviderItemInserted: function (itemProvider, item) {
		if (this.isGrouped()){
			this._populateItems(true);
			this._fireRefresh();
		} else {
			this._resetItemIndicies(0);
			this._super(itemProvider, item);
		}
	},
	onItemProviderItemDeleted: function (itemProvider, item) {
		if (this.isGrouped()) {
			this._populateItems(true);
			this._fireRefresh();
		} else {
			this._resetItemIndicies(0);
			this._super(itemProvider, item);
		}
	},
	onItemProviderItemUpdated: function (itemProvider, item) {
		if (this.isGrouped()) {
			this._populateItems(true);
			this._fireRefresh();
		} else {
			this._resetItemIndicies(0);
			this._super(itemProvider, item);
		}
	},
	$_getItem: function (index) {
		return this._grouped ? this._visibleItems.getItem(index) : this.source().getItem(index);
	},
	$_resetVisibleItems: function () {
		this._visibleItems._clearAndInit(this.source(), this.fixedCount());
		if (this.source()) {
			if (this.source().itemCount() > this._visibleItems.fixedCount()) {
				this._visibleItems.expand(this._rootItem, false);
			}
		}
		this._resetItemIndicies(0);
	},
	_buildGroupItems: function (sourceCount) {
		if (sourceCount > this.fixedCount()) {
			var ginfo = new GroupInfo(this.fixedCount(), sourceCount - 1);
			this._buildGroups(ginfo, this.source(), this._groupFields);
			this._groupList = {};
			this._buildItems(this._rootItem, ginfo, this._groupFields);
			if (this.isMergeMode()) {
				this._clearDisplayLevels();
				this.$_resetDisplayLevels(this._rootItem);
			}
			ginfo = null;
		}
	},
	$_resetDisplayLevels: function (group) {
		var i;
		var g;
		var row;
		var cnt = group.count();
		for (i = 0; i < cnt; i++) {
			g = _cast(group.getItem(i), GroupItem);
			if (g) {
				row = _cast(g.firstItem, GridRow);
				if (row && row._displayLevel < 0) {
					row._displayLevel = g.level;
				}
				this.$_resetDisplayLevels(g);
			}
		}
	},
	_buildGroups: function (parent/*GroupInfo*/, source/*IItemProvider*/, groupFields) {
		if (groupFields.length <= parent.level) {
			return;
		}
		var startIndex = parent.startIndex;
		var endIndex = parent.endIndex;
		if (endIndex < startIndex) {
			return;
		}
		var level = parent.level + 1;
		var field = groupFields[parent.level];
        var fld = this.dataSource().getField(field);
		var ginfo = new GroupInfo(startIndex, startIndex);
		ginfo.level = level;
		parent.children.push(ginfo);
		var priorVal = source.getItem(startIndex).getData(field);
		for (var i = startIndex + 1; i <= endIndex; i++) {
			var val = source.getItem(i).getData(field);
            if (!fld.equalValues(val, priorVal)) {
				if (ginfo) {
					ginfo.endIndex = i - 1;
				}
				ginfo = new GroupInfo(i, i);
				ginfo.level = level;
				parent.children.push(ginfo);
			}
			priorVal = val;
		}
		if (ginfo) {
			ginfo.endIndex = endIndex;
		}
		var cnt = parent.children.length;
		for (i = 0; i < cnt; i++) {
			this._buildGroups(parent.children[i], source, groupFields);
		}
		ginfo = null;
	},
	_buildItems: function (parent/*IGroupItem*/, info, groupFields) {
		var mergeMode = this.isMergeMode();
		var cnt = info.children.length;
		if (cnt > 0) {
			var field = groupFields[info.level];
			for (var i = 0; i < cnt; i++) {
				var group = mergeMode ? new MergedGroupHeader(field) : new GroupItemImpl(field);
				this._groupList[group.id()] = group;
				group._setExpanded(this.isExpandWhenGrouping());
				parent.add(group);
				this._buildItems(group, info.children[i], groupFields);
			}
		} else {
			var rows = info.endIndex - info.startIndex + 1;
			var items = this.source().getItems(info.startIndex, rows);
			parent.addAll(items);
			this._incDescendents(parent, rows);
		}
		var level = parent.level();
		if (level > 0) { // excepts root
			var footer = mergeMode ? new MergedGroupFooter() : new GroupFooter();
			parent.add(footer);
		}
	},
	_setEditItem: function (item) {
		this._editItem = item;
	},
	_setDummyEditItem: function(item) {
		this._dummyEditItem = item;
	},
	_fireGrouping: function (fields) {
		return this.fireConfirmEvent(GroupedItemProvider.GROUPING, fields);
	},
	_fireGrouped: function (fields) {
		this.fireEvent(GroupedItemProvider.GROUPED);
	},
	_fireExpand: function (group) {
		this.fireEvent(GroupedItemProvider.EXPAND, group);
	},
	_fireExpanded: function (group) {
		this.fireEvent(GroupedItemProvider.EXPANDED, group);
	},
	_fireCollapse: function (group) {
		this.fireEvent(GroupedItemProvider.COLLAPSE, group);
	},
	_fireCollapsed: function (group) {
		this.fireEvent(GroupedItemProvider.COLLAPSED, group);
	}
});
GroupedItemProvider.GROUPING = "onGroupedItemProviderGrouping";
GroupedItemProvider.GROUPED = "onGroupedItemProviderGrouped";
GroupedItemProvider.EXPAND = "onGroupedItemProviderExpand";
GroupedItemProvider.EXPANDED = "onGroupedItemProviderExpanded";
GroupedItemProvider.COLLAPSE = "onGroupedItemProviderCollapse";
GroupedItemProvider.COLLAPSED = "onGroupedItemProviderCollapsed";