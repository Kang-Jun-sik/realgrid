var GridView = defineClass("GridView", GridBase, {
	init : function(dom, containerId, readMode) {
		this._super(dom, containerId, readMode);
		this._items = this._createItemSource();
		if (!this._items) {
			throw new Error("ItemProvider can not be null");
		}
		this.setItemSource(this._items);
		this.groupingOptionsChanged();
	},
	destroy: function() {
		this._destroying = true;
		this._items = null;
		this._super();
	},
    pageCount: 0,
	rowGroupLevels: function () {
		return this._items.groupLevels();
	},
	rowGroupFields: function () {
		return this._items.groupByFields();
	},
    isRowGrouped: function () {
        return this._items.isGrouped();
    },
    isMergedRowGrouped: function () {
        return this._items.isMergedRowGrouped();
    },
    page: function () {
        return this._items.page();
    },
    pageCount_: function () {
        return this._items.pageCount();
    },
    setPageCount: function (value) {
        var oldCount = this._items.pageCount();
        this._items.setPageCount(value);
        if (this._items.pageCount() != oldCount) {
            this._firePageCountChanged(this._items.pageCount());
        }
    },
	isGrouped: function (dataColumn/* DataColumn */) {
		return dataColumn && dataColumn.groupLevel() > 0;
	},
	groupByFieldNames: function (fieldNames, sorting, direction) {
		var ds = this.dataSource();
		if (ds && fieldNames && fieldNames.length > 0) {
			var i;
			var f;
			var fld;
			var flds = [];
			for (var i = 0; i < fieldNames.length; i++) {
				var f = parseInt(fieldNames[i]);
				var fld = isNaN(f) ? ds.getFieldIndex(fieldNames[i]) : f;
				if (fld >= 0) {
					flds.push(fld);
				}
			}
			if (flds.length > 0) {
				sorting = sorting == null ? this.rowGroup()._sorting : sorting;
				direction = direction == null ? SortDirection.ASCENDING : direction;
				this.groupBy(flds, sorting, direction);
			}			
		} else {
			this.ungroupBy();
		}
	},
	groupBy: function (fields, sorting, direction) {
		if (this.isItemEditing(null)) {
			return;
		}
		this._toastManager.show(this.groupingOptions().toast(), true, function () {
			this.$_doGroupBy(fields, sorting, direction);
		}.bind(this));
	},
	$_getVisibleRootByField: function (fld) {
		var i;
		var col;
		var cnt = this.visibleColumnCount();
		for (i = 0; i < cnt; i++) {
			col = _cast(this.getVisibleColumn(i), DataColumn);
			if (col && col.dataIndex() == fld) {
				return col;
			}
		}
		return null;
	},
	$_doGroupBy: function (fields, sorting, direction) {
		var ds = this.dataSource();
		var cnt;
		this.clearColumnMergeGrouped();
		if (ds && fields && (cnt = fields.length) > 0) {
			var i;
			var flds = [];
			for (i = 0; i < cnt; i++) {
				if (fields[i] >= 0 && fields[i] < ds.fieldCount()) {
					flds.push(fields[i]);
				}
			}
			if (flds.length > 0) {
				if (this.rowGroup().isMergeMode()) {
					for (i = flds.length - 1; i >= 0; i--) {
						var column = this.$_getVisibleRootByField(flds[i]);
						if (column) {
							column._setMergeGrouped(true);
						} else {
							flds.splice(i, 1);
						}
					}
				}
				if (flds.length > 0) {
					this._items.groupBy(flds, sorting, direction);
				}
			}
		} else {
			this._items.groupBy(null, true, SortDirection.ASCENDING);
		}
		this._doRowGroupFooterMergeChanged();
	},
	clearGroupBy: function () {
		if (this.isItemEditing(null)) {
			return;
		}
		this._items.groupBy(null, true, SortDirection.ASCENDING);
		this._items._groupSorting = this.rowGroup().isSorting();
		this._doRowGroupFooterMergeChanged();
	},
    /* realgrid */ ungroupBy: function () {
        this.clearGroupBy();
    },
	getGroupByFields: function () {
		return this._items.groupByFields();
	},
	addGroupBy: function (index, column) {
		if (this.isItemEditing(null)) {
			return;
		}
		if (this.isGrouped(column)) {
			return;
		}
		if (!column.isVisible()) {
			return;
		}
		if (!column.isRoot() && this.rowGroup().isMergeMode()) {
			return;
		}
		if (column.dataIndex() >= 0) {
			this._toastManager.show(this.groupingOptions().toast(), true, function () {
				this.$_doAddGroupBy(index, column);
			}.bind(this));
		}
	},
	$_doAddGroupBy: function (index, column) {
		column._setMergeGrouped(this.rowGroup().isMergeMode());
		try {
			this._items.addGroupBy(index, column.dataIndex());
			this._doRowGroupFooterMergeChanged();
		} catch (err) {
			column._setMergeGrouped(false);
			throw err;
		}
	},
	removeGroupBy: function (column) {
		if (this.isItemEditing(null)) {
			return;
		}
		if (!this.isGrouped(column)) {
			return;
		}
		var includeLower = this.groupingOptions().isRemoveIncludeLower();
		this._items.removeGroupBy(column.dataIndex(), includeLower);
		var fields = this._items._groupedProvider.getGroupedFields();
		if (fields.length <= 0) {
			this._items._groupSorting = this.rowGroup().isSorting();
		}
		this._doRowGroupFooterMergeChanged();
	},
	expand: function (group, recursive, force) {
        if (this.isItemEditing(null)) {
            return;
        }
		this._items.expand(group, recursive, force);
	},
	collapse: function (group, recursive) {
        if (this.isItemEditing(null)) {
            return;
        }
		this._items.collapse(group, recursive);
	},
    getCheckedItems: function (all) {
        var items = [];
        for (var i = 0, cnt = this.itemCount(); i < cnt; i++) {
            var item = this.getItem(i);
            if (item.isChecked() && (all || (item.dataRow() >= 0))) {
                items.push(item);
            }
        }
        return items;
    },
	getCheckedItemIndices: function (all) {
		var items = [];
		for (var i = 0, cnt = this.itemCount(); i < cnt; i++) {
			var item = this.getItem(i);
			if (item.isChecked() && (all || (item.dataRow() >= 0))) {
				items.push(item.index());
			}
		}
		return items;
	},
	getCheckedRows: function (sort, visibleOnly) {
		var r, row, rows;
		if (visibleOnly) {
			rows = [];
			for (var i = 0, cnt = this.itemCount(); i < cnt; i++) {
				row = this.getItem(i);
				if (row.isChecked() && (r = row.dataRow()) >= 0) {
					rows.push(r);
				}
			}
		} else {
			rows = this._items.getCheckedRows();
		}
		if (sort) {
			rows.sort(function (r1, r2) {
				return r1 - r2;
			});
		}
		return rows;
	},
	getMergedItems: function (itemIndex, column) {
		if (typeof column === "string") {
			column = this.columnByName(column);
		} else if (column && column.$_hash) {
			column = this.columnByHash(column.$_hash);
		}
		var index = CellIndex.temp(this, itemIndex, column); 
		var room = this.layoutManager().getMergedCell(index);
		var items = [];
		if (room) {
			for (var i = room.headItem(), last = room.tailItem(); i <= last; i++) {
				var item = this.getItem(i); 
				if (item instanceof GridRow) {
					items.push(i);
				}
			}
		}
		return items;
	},
	setPaging: function (paging, pageSize, pageCount, pageSource) {
		pageSize = arguments.length > 1 ? pageSize : 10;
		pageCount = arguments.length > 2 ? pageCount : -1;
		this._items.setPaging(paging, pageSize, pageCount, null);
	},
	setPage: function (newPage, startItem) {
		startItem = arguments.length > 1 ? startItem : -1;
		newPage = Math.max(0, Math.min(newPage, this._items.pageCount() - 1));
		if (newPage != this._items.page()) {
			var changed = false;
			if (this._firePageChanging(newPage)) {
				this._items.setPage(newPage, startItem);
				changed = true;
			}
			if (changed) {
				this._firePageChanged(this._items.page());
			}
		}
	},
	resetCheckables: function () {
		this._items.resetCheckables();
	},
	applyCheckables: function () {
		this._items.applyCheckables();
	},
	dataSource: function () {
		return  this._items && this._items.dataSource();
	},
	setDataSource: function (value) {
        var oldDs = this.dataSource();
		this._items && this._items.setDataSource(value);
        if (this.dataSource() !== oldDs && this.dataSource()) {
            this.applyFilters();
        }
	},
	maxItemCount: function () {
		return this._items.maxItemCount();
	},
	setMaxItemCount: function (value) {
		this._items.setMaxItemCount(value);
	},
	_createLayoutManager: function () {
		return new GridViewLayoutManager(this);
	},
	_createItemSource: function () {
		var items = new GridItemProvider(true);
		items.setSummaryMode(this.summaryMode());
		items.setRowGroupSummaryMode(this.rowGroup().summaryMode());
		return items;
	},
	_createPanelView: function () {
		return new GridPanelElement(this._dom);
	},
	_doColumnsReset: function (group) {
		this.ungroupBy();
		this._super(group);
	},
	_visualObjectChanged: function (obj) {
		this._super(obj);
		if (obj instanceof CheckBar) {
			this._items.setCheckableExpression(obj.checkableExpression());
		}
	},
	getSummarizer: function () {
		return this._items.summarizer();
	},
	_doSortItems: function (fields, directions, textCases) {
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
	isGroupedColumn: function (column) {
		return column && column.dataIndex && this._items.isGroupedField(column.dataIndex()); // && column.root().displayIndex() < this._items.getGroupLevels();
	},
	getGroupLevels: function () {
		return this._items.getGroupLevels();
	},
	getGroupLevel: function (field) {
		return this._items.getGroupLevel(field);
	},
	_doGroupingOptionsChanged: function () {
		this._items.setExpandWhenGrouping(this.groupingOptions().isExpandWhenGrouping());	
	},
	_doRowGroupAdornmentsChanged: function () {
		this._items.setGroupedStyle(this.rowGroup().expandedAdornments(), this.rowGroup().collapsedAdornments());
	},
	_doGroupSortingChanged: function() {
		this._items.setGroupSorting(this.rowGroup().isSorting());
	},
	_canMerge: function () {
		return true;
	},
	_doRowGroupMergeModeChanged: function () {
		this.clearColumnMergeGrouped();
		if (this.rowGroup().isMergeMode()) {
			var i;
			var flds = this._items.groupByFields();
			if (flds && flds.length > 0) {
				for (i = flds.length - 1; i >= 0; i--) {                
					var column = this.$_getVisibleRootByField(flds[i]);
					if (column) {
						column._setMergeGrouped(true);
					} else {
						flds.splice(i, 1);
					}
				}
			}
			if (flds && flds.length > 0) {
				this._items.groupByMode(flds, true);
			} else {
				this._items.groupByMode(null, true);
			}
		} else {
			this._items.setMergeMode(false);
		}
	},
	_doRowGroupFooterMergeChanged: function () {
		this._groupFooterMergeManager.buildRooms(this);
	},
	_doColumnFiltersChanged: function (filter) {
		this.applyFilters();
		this.invalidateLayout();
	},
	_doSummaryModeChanged: function () {
		this._items.setSummaryMode(this.summaryMode());
	},
	_doGroupSummaryModeChanged: function () {
		this._items.setRowGroupSummaryMode(this.rowGroup().summaryMode());
	},
	_doGroupingOptionsChanged: function () {
		this._items.setExpandWhenGrouping(this.groupingOptions().isExpandWhenGrouping());	
	},
	getIndicatorIndex: function (item) {
		return this._items.getDisplayItemIndex(item);
	},
	updatePastedRow: function (item, values, strict) {
		var row = item.dataRow();
		if (row >= 0) {
			var ds = _cast(this.dataSource(), DataProvider);
			if (ds) {
				strict ? ds.updateStrictRow(row, values) : ds.updateRow(row, values);
			}
		}
	},
	appendPastedRow: function (values) {
		var ds = _cast(this.dataSource(), DataProvider);
		if (ds) {
			ds.appendRow(values);
		}
	},
	canMoveIndex: function (index) {
		var can = this._super(index);
		if (can && this.isMergedRowGrouped() && this.groupingOptions().isFixMergedColumns()) {
			can = index >= this.rowGroupLevels();
		}
		return can;
	},
	canMoveToIndex: function (index) {
		var can = this._super(index);
		if (can && this.isMergedRowGrouped() && this.groupingOptions().isFixMergedColumns()) {
			can = index >= this.rowGroupLevels();
		}
		return can;
	},
	_firePageChanging: function (newPage) {
		return this.fireConfirmEvent(GridView.PAGE_CHANGING, newPage);
	},
	_firePageChanged: function (newPage) {
		return this.fireEvent(GridView.PAGE_CHANGED, newPage);
	},
	_firePageCountChanged: function (newCount) {
		return this.fireEvent(GridView.PAGE_COUNT_CHANGED, newCount);
	},
	_fireGrouping: function (fields) {
		return this.fireConfirmEvent(GridView.GROUPING, fields);
	},
	_fireGrouped: function () {
		return this.fireEvent(GridView.GROUPED);
	},
	_fireExpanding: function (group) {
		return this.fireConfirmEvent(GridView.EXPANDING, group);
	},
	_fireExpanded: function (group) {
		return this.fireEvent(GridView.EXPANDED, group);
	},
	_fireCollapsing: function (group) {
		return this.fireConfirmEvent(GridView.COLLAPSING, group);
	},
	_fireCollapsed: function (group) {
		return this.fireEvent(GridView.COLLAPSED, group);
	},
	onGroupedItemProviderGrouping: function (provider, fields) {
		return this._fireGrouping(fields);
	},
	$_clearGroupedIndex: function (group) {
		var i;
		var column;
		var dcolumn;
		for (i = group.count() - 1; i >= 0; i--) {
			column = group.getItem(i);
			dcolumn = _cast(column, DataColumn);
			if (dcolumn) {
				dcolumn.setGroupLevel(-1);
			}
			if (column instanceof ColumnGroup) {
				this.$_clearGroupedIndex(column);
			}
		}
	},
	$_setGroupedIndex: function (group) {
		var i;
		var column;
		var dcolumn;
		for (i = group.count() - 1; i >= 0; i--) {
			column = group.getItem(i);
			dcolumn = _cast(column, DataColumn);
			if (dcolumn) {
				dcolumn.setGroupLevel(this._items.getGroupLevel(dcolumn.dataIndex()));
			}
			if (column instanceof ColumnGroup) {
				this.$_setGroupedIndex(column);
			}
		}
	},
	onGroupedItemProviderGrouped: function (provider) {
		this.selections().clear();
		this.$_clearGroupedIndex(this._rootGroup());
		var fields = this._items.groupByFields();
		if (fields && fields.length > 0) {
			this.$_setGroupedIndex(this._rootGroup());
		}
        var cnt, i, dcolumn, merges;
		if (this.rowGroup().isMergeMode()) { // TODO: group item provider의 mergeMode만을 기준으로 해야 한다.
			var cols = [];
            cnt = this.visibleColumnCount();
			for (i = 0; i < cnt; i++) {
				dcolumn = _cast(this.getVisibleColumn(i), DataColumn);
				if (dcolumn) {
					if (dcolumn.isMergeGrouped() && dcolumn.groupLevel() <= 0) {
						merges = _cast(dcolumn.stateFor(ColumnMergeManager.MERGE_ROOMS), ColumnMergeManager);
						if (merges) {
							merges.clear();
						}
						dcolumn._setMergeGrouped(false);
					} else if (dcolumn.isMergeGrouped()) {
						merges = _cast(dcolumn.stateFor(ColumnMergeManager.MERGE_ROOMS), ColumnMergeManager);
						if (!merges) {
							merges = new ColumnMergeManager(dcolumn);
							dcolumn.setState(ColumnMergeManager.MERGE_ROOMS, merges);
						}
						cols.push(dcolumn);
					}
				}
			}
			cnt = cols.length;
			if (cnt > 0) {
				cols = cols.sort(function (col1, col2) {
					return col1.groupLevel() - col2.groupLevel();
				});
				for (i = 0; i < cnt; i++) {
					cols[i].setDisplayIndex(i);
					merges = cols[i].stateFor(ColumnMergeManager.MERGE_ROOMS);
					merges.clear();
					merges.initialize(RowGroupMergeRule.INIT_COUNT);
				}
			}
            cnt = this.visibleColumnCount();
            for (i = 0; i < cnt; i++) {
                dcolumn = _cast(this.getVisibleColumn(i), DataColumn);
                if (dcolumn && !dcolumn.isMergeGrouped()) {
                    merges = dcolumn.stateFor(ColumnMergeManager.MERGE_ROOMS);
                    if (merges) {
                        merges.clear();
                        merges.initialize(RowGroupMergeRule.INIT_COUNT);
                    }
                }
            }
		}
		return this._fireGrouped();
	},
	onGroupedItemProviderExpand: function (provider, group) {
		return this._fireExpanding(group);
	},
	onGroupedItemProviderExpanded: function (provider, group) {
		return this._fireExpanded(group);
	},
	onGroupedItemProviderCollapse: function (provider, group) {
		return this._fireCollapsing(group);
	},
	onGroupedItemProviderCollapsed: function (provider, group) {
		return this._fireCollapsed(group);
	}
});
GridView.PAGE_CHANGING = "onGridViewPageChanging";
GridView.PAGE_CHANGED = "onGridViewPageChanged";
GridView.PAGE_COUNT_CHANGED = "onGridViewPageCountChanged";
GridView.GROUPING = "onGridViewGrouping";
GridView.GROUPED = "onGridViewGrouped";
GridView.EXPANDING = "onGridViewExpanding";
GridView.EXPANDED = "onGridViewExpanded";
GridView.COLLAPSING = "onGridViewCollapsing";
GridView.COLLAPSED = "onGridViewCollapsed";
var GridViewObserver = defineClass("GridViewObserver", GridBaseObserver, {
	init: function () {
		this._super();
	},
	onGridViewPageChanging: function (grid, newPage) {
		return true;
	},
	onGridViewPageChanged: function (grid, newPage) {
	},
	onGridViewPageCountChanged: function (grid, newCount) {
	},
	onGridGrouping: function (grid, fields) {
		return true;
	},
	onGridGrouped: function (grid) {
	},
	onGridExpanding: function (grid, group) {
		return true;
	},
	onGridExpanded: function (grid, group) {
	},
	onGridCollapsing: function (grid, group) {
		return true;
	},
	onGridGCollapsed: function (grid, group) {
	}
});
var GridViewLayoutManager = defineClass("GridViewLayoutManager", GridLayoutManager, {
	init: function(grid) {
		this._super(grid);
	},
	isRowGrouped: function () {
		return !this.grid().rowGroup().isMergeMode() && this.grid().isRowGrouped();
	},
	rowGroupLevels: function () {
		return this.grid().rowGroupLevels();
	}
});
var GridViewSelectionTool = defineClass("GridViewSelectionTool", GridSelectionTool, {
	init : function(owner) {
		this._super(owner);
	},
	_getEditRequest: function (source, x, y, ctrlKey, shiftKey) {
		if (source instanceof ColumnView) {
			return new PanelCellRequest(source);
		}
		var request = this._super(source, x, y, ctrlKey, shiftKey);
		if (request) {
			return request;
		}
		var grid = this.grid();
		if (source instanceof HeaderCellElement) {
			var index = source.index();
			var dataColumn = index.dataColumn();
			if (grid.groupingOptions().isEnabled && grid.panel().isVisible() && dataColumn && dataColumn.isGroupable()) {
				return new RowGroupingRequest(source);
			}
		}
		return null;
	},
	_getDragTracker: function (request, x, y) {
		if (request instanceof PanelCellRequest) {
			return new PanelCellTracker(this.grid(), request);
		} else if (request instanceof RowGroupingRequest) {
			return new RowGroupingTracker(this.grid(), request);
		}
		return this._super(request, x, y);
	},
	_doColumnHeaderClicked: function (column, rightClicked, event) {
		this._super(column);
        if (!rightClicked) {
            var grid = this.grid();
            var dcol = _cast(column, DataColumn);
            if (!grid.isEmpty() && dcol && dcol.isSortable() && grid.sortingOptions().isEnabled()) {
                grid.sortColumn(dcol, event);
            }
        }
	},
	_doHandleClicked: function (handle) {
		var grid = this.grid();
		var group;
		if (handle instanceof HeaderSortHandle) {
			var leftPos = grid.leftPos();
			grid.sortColumn(handle.cellView().index().dataColumn());
			grid.setLeftPos(leftPos);
		} else if (handle instanceof RowGroupExpandHandle) {
			var item = handle.cellView().item();
			group = item instanceof GroupItemImpl ? item : handle.cellView().item().parent();
			group = _cast(group, GroupItemImpl);
			if (group) {
				if (group.isExpanded()) {
					grid.collapse(group);
				} else {
					grid.expand(group, false, false)
				}
			}
		} else if (handle instanceof DataCellExpandHandle) {
			group = handle.group();
			if (group) {
				if (group.isExpanded()) {
					grid.collapse(group);
				} else {
					grid.expand(group, false, false)
				}
				if (!group.isExpanded()) {
					var i = group.index() >= 0 ? group.index() : group.firstItem().index();
					if (i < 0 && group.footer()) {
						i = group.footer().index();
					}
					if (i >= 0) {
						var index = grid.getIndex(i);
						grid.makeCellVisible(index);
					}
				}
			}
		} else {
			this._super(handle);
		}
	}
});
var GridPanelElement = defineClass("GridPanelElement", PanelElement, {
	init: function(dom) {
		this._super(dom);
		this._messageView = new PanelMessageView(dom, "messageView");
		this.addElement(this._messageView);
		this._groupByView = new GroupByView(dom, "groupByView");
		this.addElement(this._groupByView);
		this._state = GridPanelElement.NORMAL;
	},
	state: 0, 
	groupingIndex: -1,
	setState: function (value) {
		if (value != this._state) {
			this._state = value;
			switch (value) {
			case GridPanelElement.NORMAL:
				this._groupingIndex = -1;
				break;
			case GridPanelElement.GROUPING:
				this._groupingIndex = this._groupByView.childCount();
				break;
			case GridPanelElement.UNGROUPING:
				this._groupingIndex = 0;
				break;
			}
			this.layoutContent(null);
			this.invalidate();
		}
	},
	setGroupingIndex: function (value) {
		if (value != this._groupingIndex) {
			this._groupingIndex = value;
			this.layoutContent(null);
			this.invalidate();
		}
	},
	_doMeasure: function (grid, hintWidth, hintHeight) {
		var sz;
		var sz2;
		var options = grid.groupingOptions();
		this._messageView.setText(options.prompt());
		this._messageView.updateStyles(this.model().styles());
		this._groupByView.setLinear(options.isLinear());
		sz = this._groupByView.measure(hintWidth, hintHeight).clone();
		if (this._groupByView.fieldCount() < 1) {
			sz = this._messageView.measure(hintWidth, hintHeight).clone();
		}
		sz2 = this._super(grid, hintWidth, hintHeight);
		sz.width = Math.max(sz.width, sz2.width);
		sz.height = Math.max(sz.height, sz2.height, 30);
		return sz;	
	},
	_doLayoutContent: function (lm) {
		var w = this.width();
		var h = this.height();
		this._messageView.setVisible((this._state == GridPanelElement.NORMAL) && !this.grid().isRowGrouped());
		if (this._messageView.isVisible()) {
			var sz = this._messageView.measure(w, h);
			this._messageView.setBounds(4, 0, sz.width + 10, h);
		}
		this._groupByView.setVisible(true);
		if (this._groupByView.isVisible()) {
			this._groupByView.setBounds(0, 0, w, h);
			this._groupByView.layoutContent(lm);
		}
	}
}, {
	NORMAL: 0,
	GROUPING: 1,
	UNGROUPING: 2
});
var PanelMessageView = defineClass("PanelMessageView", VisualElement, {
	init: function(dom, name) {
		this._super(dom, name);
		this._paddingLeft = 4;
	},
	destroy: function() {
		this._destroying = true;
		this._font = null;
		this._super();
	},
	font: null,
	foreground: SolidBrush.BLACK,
	textAlignment:Alignment.NEAR,
	text: null,
	/* @internal */ measure: function (hintWidth, hintHeight) {
		return new Size(hintWidth, 20);// hintHeight);
	},
	/* @internal */ updateStyles: function (styles) {
		this._paddingLeft = styles.paddingLeft();
		this.setForeground(styles.foreground());
		this.setFont(styles.font());
	},
	_doDraw: function (g) {
		var r = this.getClientRect();
		g.drawTextRect(this.font(), this.foreground(), this._text, r, this.textAlignment());
	},
	_doDrawHtml: function () {
		var span = this.$_prepareSpan();
		var r = this.getClientRect();
		Dom.renderTextRect(span, this.font(), this.foreground(), this._text, r, this.textAlignment());
	}
});
var ColumnView = defineClass("ColumnView", HeaderCellElement, {
	init: function(grid, dom, name) {
		this._super(grid, dom, name);
		this._acceptable = true;
		this._stroke = new SolidPen(0x88000000, 3);
		this.setShowHandles(false);
	},
	setAcceptable: function (value) {
		if (value != this._acceptable) {
			this._acceptable = value;
			this.invalidate();
		}
	},
	_doMeasure: function (grid, hintWidth, hintHeight) {
		var w = this.container().measureText(this.font(), this.text()) + this.paddingHorz() + this.borderWidth() * 2; 
		return new Size(w, hintHeight);
	},
	_doPrepareElement: function (styles) {
		this._super(styles);
		this.setShowHandles(false);
	},
	_doRender: function (g, r) {
		var border = this.border();
		var borderWidth = border ? border.width() : 0;
		var fill = null;
		if (this.isHovered()) {
			fill = this.hoveredBackground() || this.background();
		} else {
			fill = this.background();
		}
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		if (borderWidth > 0) {
			r.inflate(borderWidth, borderWidth);
		}
		fill = null;
		if (this.isHovered()) {
			fill = this.hoveredForeground();
			if (!fill) {
				fill = this.foreground();
			}
		} else {
			fill = this.foreground();
		}
		if (fill) {
			g.drawTextRect(this.font(), fill, this.text(), r, TextAlign.CENTER);
		}
		if (border) {
			r.inflate(-borderWidth, -borderWidth);
			g.drawBoundsI(null, border, r.x, r.y, r.right() - 1, r.bottom() - 1);
		}
		if (!this._acceptable) {
			r.inflate(-3, -3);
			g.drawLine(this._stroke, r.x, r.y, r.right(), r.bottom());
			g.drawLine(this._stroke, r.right(), r.y, r.x, r.bottom());
		}
	}
});
var GroupByView = defineClass("GroupByView", VisualElement, {
	init: function(dom, name) {
		this._super(dom, name);
		this._columnViews = [];
		this._fields = [];
		this._paddingLeft = 8;
		this._paddingTop = 4;
		this._paddingBottom = 5;
		this._columnWidth = 80;
		this._columnHeight = 20;
	},
	destroy: function() {
		this._destroying = true;
		this._columnViews = null;
		this._fields = null;
		this._super();
	},
	verticalGap: 12,
	horizontalGap: 12,
	linear: false,
	fieldCount: function () {
		return this._fields ? this._fields.length : 0;
	},
	/* @internal */ measure: function(hintWidth, hintHeight) {
		this._fields = this.container().gridView().getGroupByFields();
		if (this._fields && this._fields.length > 0) {
			this.$_prepareColumnViews(this._fields);
			return new Size(hintWidth, 
						this._paddingTop + this._paddingBottom + this._columnHeight + (this._linear ? 0 : (this._fields.length - 1) * this._verticalGap));
		} else {
			return new Size(hintWidth, hintHeight);
		}
	},
	/* @internal */ layoutContent: function (lm) {
		this.$_layoutColumnViews(this._fields);
		this.invalidate();
	},
	_doDraw: function(g) {
		if (!this._fields || this._fields.legnth < 1) {
			return;
		}
		var line = this.container().gridView().rowGroup().panelStyles().line();
		if (line) {
			var i;
			var cnt = this._fields.length;
			if (cnt < 1) {
				return;
			}
			var view = this._columnViews[0];
			var r1 = view.getBounds();
			var r2 = new Rectangle();
			for (i = 1; i < cnt; i++) {
				view = this._columnViews[i];
				r2 = view.getBounds();
				if (this._linear) {
					g.drawLineI(line, r1.right(), r1.y + r1.height / 2, r2.x, r1.y + r1.height / 2);
				} else {
					g.drawLinesI(line, r1.right(), r1.y + r1.height / 3, r2.x + r2.width / 4, r1.y + r1.height / 3, r2.x + r2.width / 4, r2.y);
				}
				r1.copy(r2);
			}
		}
	},
	$_prepareColumnViews: function (fields) {
		if (this._fields && this._fields.length > 0) {
			var cnt = this._fields.length;
			while (this._columnViews.length < cnt) {
				this._columnViews.push(new ColumnView(this.container().gridView(), this._dom));
			}
		}
	},
	$_layoutColumnViews: function (fields) {
		this.hideAll();
		if (!fields || fields.length < 1) {
			return;
		}
		var i;
		var column;
		var cell;
		var view;
		var w;
		var grid = this.container().gridView();
		var lm = grid.layoutManager();
		var cnt = fields.length;
		var x = this._paddingLeft;
		var y = this._paddingTop;
		for (i = 0; i < cnt; i++) {
			column = grid.getDataColumn(fields[i]);
			cell = grid.header().getGroupingCell(column);
			view = this._columnViews[i];
			if (view.parent() == this) {
				view.setVisible(true);
				view.invalidate(); // TODO: 이걸 안해주면 처음에 못 그린다.
			} else {
				this.addElement(view);
			}
			view.updateCell(cell);
			w = Math.max(this._columnWidth, view.measure(grid, this._columnWidth, this._columnHeight).width);
			view.setBounds(x, y, w, this._columnHeight);
			view.layoutContent(lm);
			x += w + this._horizontalGap;
			if (!this._linear) {
				y += this._verticalGap;
			}
		}
	}
});
var RowGroupingRequest = defineClass("RowGroupingRequest", CellRequest, {
	init: function (cell) {
		this._super(cell);
	},
	groupIndex: -1,
	column: function () {
		return _cast(this.cell().index().column(), DataColumn);
	},
	cursor: function () {
		return null;
	}
});
var RowGroupingTracker = defineClass("RowGroupingTracker", GridDragTracker, {
	init: function (grid, request) {
		this._super(grid, "rowGroupingTracker");
		this._request = request;
		this._columnView = null;
		this._panelView = grid.panelView();
	},
	request: function () {
		return this._request;
	},
	_doStart: function (x, y) {
		this._panelView.setState(GridPanelElement.GROUPING);
		return true;
	},
	_canAccept: function (x, y) {
		return y - 2 < this.grid().layoutManager().headerBounds().y;
	},
	_doCompleted: function () {
		var grid = this.grid();
		if (!grid.isGrouped(this._request.column())) {
			grid.addGroupBy(this._panelView.groupingIndex(), this._request.column());
		}
	},
	_doEnded: function () {
		this._panelView.setState(GridPanelElement.NORMAL);
	},
	_showFeedback: function (x, y) {
        var grid = this.grid();
        var index = CellIndex.temp(grid, -1, this._request.column());
        if (!this._columnView) {
			this._columnView = new ColumnView(grid, grid._dom);
		}
		this._columnView.updateCell(grid.header().getCell(index));
		this._columnView.setBounds(0, 0, 100, 20);
		this._columnView.invalidate();
		this._columnView.setAcceptable(!grid.isGrouped(this._request.column()));
		grid.addFeedbackElement(this._columnView);
		this._columnView.move(grid.containerToGridX(x) - 4, grid.containerToGridY(y) - 2);
	},
	_moveFeedback: function (x, y) {
		var grid = this.grid();
		this._columnView.move(grid.containerToGridX(x) - 4, grid.containerToGridY(y) - 2);
	},
	_hideFeedback: function () {
		this.grid().removeFeedbackElement(this._columnView);
	}
});
var PanelCellRequest = defineClass("PanelCellRequest", CellRequest, {
	init: function (cell) {
		this._super(cell);
	},
	groupIndex: -1,
	column: function () {
		return _cast(this.cell().index().column(), DataColumn);
	},
	cursor: function () {
		return null;
	}
});
var PanelCellTracker = defineClass("PanelCellTracker", GridDragTracker, {
	init: function (grid, request) {
		this._super(grid, "panelCellTracker");
		this._request = request;
		this._columnView = null;
		this._panelView = grid.panelView();
	},
	request: function () {
		return this._request;
	},
	_doStart: function (x, y) {
		this._panelView.setState(GridPanelElement.NORMAL);
		return true;
	},
	_canAccept: function (x, y) {
		return y - 2 >= this.grid().layoutManager().headerBounds().y;
	},
	_showFeedback: function (x, y) {
        var grid = this.grid();
        var index = CellIndex.temp(grid, -1, this._request.column());
        if (!this._columnView) {
			this._columnView = new ColumnView(grid, grid._dom);
		}
		this._columnView.updateCell(grid.header().getCell(index));
		this._columnView.setBounds(0, 0, 100, 20);
		this._columnView.invalidate();
		grid.addFeedbackElement(this._columnView);
		this._columnView.move(grid.containerToGridX(x) - 4, grid.containerToGridY(y) - 2);
	},
	_moveFeedback: function (x, y) {
		var grid = this.grid();
		this._columnView.move(grid.containerToGridX(x) - 4, grid.containerToGridY(y) - 2);
	},
	_hideFeedback: function () {
		var grid = this.grid();
		grid.removeFeedbackElement(this._columnView);
	},
	_doCompleted: function () {
		var grid = this.grid();
		grid.removeGroupBy(this._request.column());
	}
});