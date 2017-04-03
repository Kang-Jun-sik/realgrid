var GridItemProvider = defineClass("GridItemProvider", EditableItemProviderImpl, {
	init: function (indexing) {
		this._super(null, indexing);
		this._groupSorting = true;
		this._groupSortDirection = SortDirection.ASCENDING;
        this._groupSortCase = SortCase.SENSITIVE;
		this._itemProvider = new DefaultItemProvider(false);
		this._itemProvider.addListener(this);
		this._groupedProvider = new GroupedItemProvider(this._itemProvider, false);
		this.setSource(this._groupedProvider);
		this._summarizer = new DefaultSummarizer(this._itemProvider);
	},
	destroy: function() {
		this._destroying = true;
		this.setSource(null);
		this._itemProvider.removeListener(this);
		this._super();
	},
	isHideDeleted: function () {
		return this._itemProvider.hideDeleted();
	},
	setHideDeleted: function (value) {
		this._itemProvider.setHideDeleted(value);
	},
	setSummaryMode: function (value) {
		this._itemProvider.setSummaryMode(value);
	},
	setRowGroupSummaryMode: function (value) {
		this._groupedProvider.setSummaryMode(value);
	},
	setMergeMode: function (value) {
		this._groupedProvider.setMergeMode(value);
	},
	sortMode: function () {
		return this._itemProvider.sortMode();
	},
    setSortMode: function (value) {
        this._itemProvider.setSortMode(value);
    },
    filterMode: function (value) {
    	return this._itemProvider.filterMode();
    },
    setFilterMode: function (value) {
        this._itemProvider.setFilterMode(value);
    },
	isGrouped: function () {
		return this._groupedProvider.isGrouped();
	},
	groupLevels: function () {
		return this._groupedProvider.groupCount();
	},
	groupByFields: function () {
		return this._groupedProvider.getGroupedFields();
	},
	summarizer: function () {
		return this._summarizer;
	},
    canGrouping: function (fields) {
        return this._fireGrouping(fields);
    },
	setDataSource: function (value) {
		this._itemProvider.setDataSource(value);
	},
	getFieldDomain: function (field) {
		this._itemProvider.getFieldDomain(field);
	},
	isFiltered: function (field) {
		this._itemProvider.hasFilter(field);
	},
	addFilter: function (field, criteria) {
		this._itemProvider.addFilter(field, criteria);
	}, 
	removeFilter: function (field, filter) {
		this._itemProvider.removeFilter(filter);
	},
	clearFilters: function (field) {
		this._itemProvider.clearFilters(field);
	},
	clearAllFilters: function () {
		this._itemProvider.clearAllFilters();
	},
	beginFiltering: function () {
		this._itemProvider.beginFilter();
	},
	endFiltering: function () {
		this._itemProvider.endFilter();
	},
	setHideDeletedRows: function (value) {
		this._itemProvider.setHideDeleted(value);
	},
	orderBy: function (fields, directions, cases) {
		if (this._groupedProvider.isGrouped() && this._groupSorting) {
            var len = directions ? directions.length : 0;
            var clen = cases ? cases.length : 0;
			var groupFields = this._groupedProvider.getGroupedFields();
			var groupDirs = this._itemProvider.getSortDirections();
            var groupCases = this._itemProvider.getSortCases();
			var list = [];
            var i, cnt, fld, g, dir, c;
			for (i = 0, cnt = groupFields.length; i < cnt; i++) {
				list.push(groupFields[i]);
			}
			for (i = 0, cnt = fields.length; i < cnt; i++) {
				fld = fields[i];
				g = list.indexOf(fld);
				if (len > i) {
					dir = directions[i];
				} else if (len > 0) { // 바로 앞의 것을 따라간다.
					dir = directions[len - 1];
				} else {
					dir = SortDirection.ASCENDING;
				}
                if (clen > i) {
                    c = cases[i];
                } else if (clen > 0) {
                    c = cases[clen - 1];
                } else {
                    c = SortCase.SENSITIVE;
                }
				if (g < 0) {
					list.push(fld);
					groupDirs[list.length - 1] = dir;
                    groupCases[list.length - 1] = c;
				} else {
					groupDirs[g] = dir;
                    groupCases[g] = c;
				}
			}
			groupFields = list;
			this._itemProvider.orderBy(groupFields, groupDirs, groupCases);
		} else {
			this._itemProvider.orderBy(fields, directions, cases);
		}
	},
	getSortFields: function () {
		return this._itemProvider.getSortFields();
	},
	getSortDirections: function () {
		return this._itemProvider.getSortDirections();
	},
    getSortCases: function () {
        return this._itemProvider.getSortCases();
    },
	groupBy: function (fields, sorting, direction, textCase) {
		if ((!fields || fields.length < 1) && !this._groupedProvider.isGrouped()) {
			return;
		}
        if (!this._groupedProvider.canGrouping(fields)) {
            return;
        }
		this._groupSorting = sorting;
		this._groupSortDirection = direction;
        this._groupSortCase = textCase || SortCase.SENSITIVE;
		if (sorting) {// && fields && fields.length > 0) {
			this._itemProvider.orderBy(fields, [direction], [textCase], false);
		}
		this._groupedProvider.groupBy(fields);
	},
	groupByMode: function (fields, mergeMode) {
		if (this._groupSorting) {// && fields && fields.length > 0) {
			this._itemProvider.orderBy(fields, [this._groupSortDirection], [this._groupSortCase], false);
		}
        if (!this._groupedProvider.canGrouping(fields)) {
            return;
        }
		this._groupedProvider.groupByMode(fields, mergeMode);
	},
	addGroupBy: function (index, field) {
		var fields;
		var dirs = [this._groupSortDirection];
		if (this._groupedProvider.groupCount() < 1) {
			fields = [field];
		} else {
			fields = this._groupedProvider.getGroupedFields();
			fields.splice(index, 0, field);
		}
        if (!this._groupedProvider.canGrouping(fields)) {
            return;
        }
		if (this._groupSorting) {
			this._itemProvider.orderBy(fields, dirs, null, false);
		}
		this._groupedProvider.groupBy(fields);
	},
	removeGroupBy: function (field, includeLower) {
		if (!this._groupedProvider.isGrouped()) {
			return;
		}
		var idx = -1;
		var fields = this._groupedProvider.getGroupedFields();
		var cnt = fields.length;
        var i, rcnt = 0;
		for (i = cnt - 1; i >= 0; i--) {
			rcnt++;
			if (fields[i] == field) {
				idx = i;
				break;
			}
		}
		if (idx >= 0) {
			fields.splice(idx, includeLower? rcnt : 1);
            if (!this._groupedProvider.canGrouping(fields)) {
                return;
            }
            if (this._groupSorting) {
				this._itemProvider.orderBy(fields, [this._groupSortDirection], null, false);
			}
			this._groupedProvider.groupBy(fields);
		} else {
            if (!this._groupedProvider.canGrouping(null)) {
                return;
            }
            if (this._groupSorting) {
				this._itemProvider.orderBy(null, null, null, false);
			}
		}
	},
	isGrouped: function () {
		return this._groupedProvider.isGrouped();
	},
	isMergedRowGrouped: function () {
		return this._groupedProvider.isGrouped() && this._groupedProvider.isMergeMode();
	},
	getGroupLevels: function () {
		return this._groupedProvider.groupCount();
	},
	isGroupedField: function (field) {
		return this._groupedProvider.isGroupedField(field);
	},
	getGroupLevel: function (field) {
		return this._groupedProvider.getGroupLevel(field);
	},
	getGroupByFieldCount: function () {
		return this._groupedProvider.groupCount();
	},
	setExpandWhenGrouping: function (value) {
		this._groupedProvider.setExpandWhenGrouping(value);
	},
	setGroupedStyle: function (expandedAdornments, collapsedAdornments) {
		this._groupedProvider.setExpandedAdornments(expandedAdornments);
		this._groupedProvider.setCollapsedAdornments(collapsedAdornments);
	},
	setGroupSorting: function (value) {
		this._groupSorting = value;
		this._groupedProvider._groupSorting = value;
	},
	expand: function (group, recursive, force) {
		this._groupedProvider.expand(group, recursive, force);
	},
	collapse: function (group, recursive) {
		this._groupedProvider.collapse(group, recursive);
	},
	setPaging: function (paging, pageSize, pageCount, pageSource) {
		this._itemProvider.setPaging(paging, pageSize, pageCount, pageSource);
	},
	page: function () {
		return this._itemProvider.page();
	},
	setPage: function (value, startRow) {
		this._itemProvider.setPage(value, startRow);
	},
	pageCount: function () {
		return this._itemProvider.pageCount();
	},
	setPageCount: function (value) {
		this._itemProvider.setPageCount(value);
	},
	getDisplayItemIndex: function (item) {
		return this._itemProvider.isPaging() ? item.index() + this._itemProvider.pageStartIndex() : item.index(); 
	},
	setExpandWhenGrouping: function (value) {
		this._groupedProvider.setExpandWhenGrouping(value);
	},
	getCheckedRows: function () {
		return this._itemProvider.getCheckedRows();
	},
	setCheckableExpression: function (expr) {
		this._itemProvider.setCheckableExpression(expr);
	},
	resetCheckables: function () {
		this._itemProvider.resetCheckables();
	},
	applyCheckables: function () {
		this._itemProvider.applyCheckables();
	},
	dataSource: function () {
		return this._itemProvider.dataSource();
	},
	setDataSource: function (value) {
		this._itemProvider.setDataSource(value);
	},
	getAllItems: function () {
		return this._groupedProvider.getAllItems();
	},
	findItem: function (fields, values, options, startIndex, endIndex) {
		return this._groupedProvider.findItem(fields, values, options, startIndex, endIndex);
	},
	findCell: function (fields, value, options, startIndex, endIndex, startFieldIndex) {
		return this._groupedProvider.findCell(fields, value, options, startIndex, endIndex, startFieldIndex);
	},
	checkItem: function (item, checked, exclusive, checkEvent) {
		this._groupedProvider.checkItem(item, checked, exclusive, checkEvent);
	},
	checkAll: function (checked, visibleOnly, checkableOnly, checkEvent) {
		this._groupedProvider.checkAll(checked, visibleOnly, checkableOnly, checkEvent);
	},
	hasCellStyle: function () {
		return this._itemProvider.hasCellStyle();
	},
	setCellStyle: function (row, field, style) {
		this._itemProvider.setCellStyle(row, field, style);
	},
	setCellStyles: function (provider, rows, fieldMap) {
		this._itemProvider.setCellStyles(provider, rows, fieldMap);
	},
	clearCellStyles: function () {
		this._itemProvider.clearCellStyles();
	},
	removeCellStyle: function (style) {
		this._itemProvider.removeCellStyle(style);
	},
	getCellStyle: function (dataRow, field) {
		return this._itemProvider.getCellStyle(dataRow, field);
	},
	checkCellStyle: function (dataRow, field) {
		return this._itemProvider.checkCellStyle(dataRow, field);
	},
	getItemOfRow: function (dataRow) {
		return this._itemProvider.getItemOfRow(dataRow);
	},
	_doBeginUpdate: function (item) {
		var editItem = this._super(item);
		this._groupedProvider._setEditItem(editItem);
		return editItem;
	},
	_doBeginAppendDummy: function() {
		var dummyEditItem = this._super();
		this._groupedProvider._setDummyEditItem(dummyEditItem);
		return dummyEditItem;
	},
	_doBeginAppend: function (defaultValues) {
		var editItem = this._super(defaultValues);
		this._groupedProvider._setEditItem(editItem);
		return editItem;
	},
	_doBeginInsert: function (item, defaultValues, shift, ctrl) {
		var editItem = this._super(item, defaultValues, shift, ctrl);
		this._groupedProvider._setEditItem(editItem);
		return editItem;
	},
	_doCancelDummyEdit:function() {
		this._super();
		this._groupedProvider._setDummyEditItem(null);
	},
	_doCancelEdit: function (state, orgItem) {
		this._super(state, orgItem);
		this._groupedProvider._setEditItem(null);
	},
	_doCommitEdit: function (state, orgItem) {
		this._super(state, orgItem);
		this._groupedProvider._setEditItem(null);
	},
	onGroupedItemProviderGrouping: function (provider, fields) {
		return this.fireConfirmEvent(GroupedItemProvider.GROUPING, fields);
	},
	onGroupedItemProviderGrouped: function (provider) {
		this.fireEvent(GroupedItemProvider.GROUPED);
	},
	onGroupedItemProviderExpand: function (provider, group) {
		this.fireEvent(GroupedItemProvider.EXPAND, group);
	},
	onGroupedItemProviderExpanded: function (provider, group) {
		this.fireEvent(GroupedItemProvider.EXPANDED, group);
	},
	onGroupedItemProviderCollapse: function (provider, group) {
		this.fireEvent(GroupedItemProvider.COLLAPSE, group);
	},
	onGroupedItemProviderCollapsed: function (provider, group) {
		this.fireEvent(GroupedItemProvider.COLLAPSED, group);
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