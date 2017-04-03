var TreeContainer = defineClass("TreeContainer", GridContainer, {
	init : function(dom, containerId, readMode) {
		GridContainer.prototype.init.call(this, dom, containerId, readMode);
	},
	treeView: function () {
		return this._gridView;
	},
	_createGridView: function(dom, container, readMode)  {
		return new TreeView(dom, container, readMode);
	},
	_createDefaultTool: function () {
		return new TreeSelectionTool(this);
	}
});
var /* abstract */ TreeHandler = function () {
	this.onTreeItemExpanding = function (handler, itemIndex, rowId) {
		return true;
	};
};
var TreeView = defineClass("TreeView", GridBase, {
	init : function(dom, container, readMode) {
		this._treeLinesView = null;
		this._treeOptions = null;
		this._focusedRow = -1;
		this._super(dom, container, readMode);
		this._expanderCell = new TreeItemExpanderCell();
		this._footerCell = new TreeItemFooterCell();
		this.panel().setVisible(false);
		this.setItemSource(this._items = this._createItemSource());
	},
	treeLinesRenderer: function () {
		return this._treeLinesView;
	},
	treeOptions: function () {
		return this._treeOptions;
	},
	getOptions: function () {
		var options = this._super();
		return options;
	},
	setOptions: function (source) {
		this._super(source);
	},
	getLevels: function (visibleOnly) {
		return this._items.getLevels(visibleOnly);
	},
	getExpanderCell: function (index) {
		this._expanderCell.setStyles(this._treeOptions.expanderStyles());
		this._expanderCell.setIndex(CellIndex.temp(this, index));
		return this._expanderCell;
	},
	getFooterCell: function (index) {
		this._footerCell.setStyles(this._treeOptions.footerStyles());
		this._footerCell.setIndex(index);
		return this._footerCell;
	},
	expand: function (item, recursive, force) {
        if (this.isItemEditing(null)) {
            return;
        }
		this._items.expand(item, recursive, force);
	},
	collapse: function (item, recursive) {
        if (this.isItemEditing(null)) {
            return;
        }
		this._items.collapse(item, recursive);
	},
	expandAll: function (level) {
        if (this.isItemEditing(null)) {
            return;
        }
		level = arguments.length > 0 ? level : 0;
		this._items.expandAll(level);
	},
	collapseAll: function () {
        if (this.isItemEditing(null)) {
            return;
        }
		this._items.collapseAll();
	},
	getTreeIcon: function (item) {
		var images = this._treeOptions.icons();
		if (images) {
			var idx = item.iconIndex();
			if (idx >= 0 && idx < images.count()) {
				return images.getImage(idx);
			}
		}
		return null;
	},
	getCheckedItems: function () {
		var items = [];
		for (var i = 0, cnt = this.itemCount(); i < cnt; i++) {
			var item = this.getItem(i);
			item.isChecked() && items.push(item);
		}
		return items;
	},
	getCheckedItemIndices: function () {
		var items = [];
		for (var i = 0, cnt = this.itemCount(); i < cnt; i++) {
			var item = this.getItem(i);
			item.isChecked() && items.push(item.index());
		}
		return items;
	},
	getCheckedRows: function (visibleOnly) {
		var rows = null;
		if (visibleOnly) {
			rows  = [];
			for (var i = 0, cnt = this.itemCount(); i < cnt; i++) {
				var item = this.getItem(i);
				item.isChecked() && rows.push(item.row());
			}
		} else {
			rows = this._items.getCheckedRows();
		}
		return rows;
	},
	getCheckedRowIds: function (visibleOnly) {
		var rows = null;
		if (visibleOnly) {
			rows  = [];
			for (var i = 0, cnt = this.itemCount(); i < cnt; i++) {
				var item = this.getItem(i);
				item.isChecked() && rows.push(item.dataRow());
			}
		} else {
			rows = this._items.getCheckedRowIds();
		}
		return rows;
	},
	checkChildren: function (parent, checked, recursive, visibleOnly, checkableOnly, checkEvent) {
		visibleOnly = arguments.length > 3 ? visibleOnly : true;
		if (parent) {
			var i, item,
				cnt = parent.count();
			for (i = 0; i < cnt; i++) {
				item = parent.getItem(i);
				if (checkableOnly) {
					item.isCheckable() && item.setChecked(checked, checkEvent);
				} else {
					item.setChecked(checked, checkEvent);
				}
				if (recursive && (item.isExpanded() || !visibleOnly)) {
					this.checkChildren(item, checked, true, visibleOnly, checkableOnly, checkEvent);
				}
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
        return this._items ? this._items.dataSource() : null;
    },
    setDataSource: function (value) {
        if (this._items) {
            this._items.setDataSource(value);
        }
    },
    maxItemCount: function () {
        return this._items ? this._items.maxItemCount() : 0;
    },
    setMaxItemCount: function (value) {
        if (this._items) {
            this._items.setMaxItemCount(value);
        }
    },
	_addGroupView: function () {
		this._treeLinesView = new TreeLinesElement(this._dom, this);
		this.addElement(this._treeLinesView);
	},
	addMasks: function () {
		/*
		m_linesMask = new Shape();
		addMask(m_linesMask);
		m_treeLinesView.mask = m_linesMask;
		*/
	},
	_createDelegate: function () {
		return new TreeGridDelegate(this);
	},
	_createLayoutManager: function () {
		return new TreeGridLayoutManager(this);
	},
	_createBodyView: function (dom, body, fixed, rfixed) {
		return new TreeBodyElement(dom, body, fixed, rfixed);
	},
	_visualObjectChanged: function (obj) {
		this._super(obj);
		if (obj instanceof CheckBar) {
			this._items.setCheckableExpression(obj.checkableExpression());
		}
	},
	append: function () {
		return this.insert(this._items.rootItem(), false, true);
	},
	_doCanInsert: function (item, shift, ctrl) {
		return item && (item.count() > 0 || !ctrl || item.level() == 0 || this.editOptions().isAppendable());
	},
	getSummarizer: function () {
		return this._items.summarizer();
	},
	_doMaxRowCountChanged: function () {
		this._items.setMaxItemCount(this.maxItemCount());
	},
	onImageListImageLoaded: function (images, index) {
		this._super(images, index);
		if (images === this._treeOptions.icons()) {
			this.refreshView();
			this._treeLinesView.invalidate();
		}
	},
	onImageLoaded: function (url) {
		this._super(url);
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
	_doSortItems: function (fields, directions, textCases) {
		this._items.orderBy(fields, directions, textCases);
	},
	_doColumnFiltersChanged: function (column) {
		this.applyFilters();
	},
	initStyles: function () {
		this._super();
		this._addGridObject(this._treeOptions = new TreeOptions(this));
		this._treeOptions.expanderStyles().setParent(this.body().styles());
		var sheet = GridStyleSheet.Default;
		this._treeOptions.expanderStyles().setSysDefault(sheet.treeExpander());
	},
	$_doLayout: function (bounds) {
		var treeOptions = this._treeOptions;
		treeOptions.expanderStyles().setParent(this.fixedOptions().colCount() > 0 ? this.fixedOptions().styles() : this.body().styles(), false);
		var rslt = this._super(bounds);
		if (treeOptions.isLineVisible()) {
			this._treeLinesView.setVisible(true);
			this._treeLinesView.setStroke(treeOptions.expanderStyles().line());
			this._treeLinesView.invalidate();
		} else {
			this._treeLinesView.setVisible(false);
		}
		/*
		var r = m_treeLinesView.getGlobalBounds();
		var g = m_linesMask.graphics;
		g.clear();
		if (r.width > 0 && r.height > 0) {
			g.beginFill(0, 0);
			g.drawRect(r.x, r.y, r.width, r.height);
			g.endFill();
		}
		*/
		return rslt;
	},
	assignImageList: function (list) {
		this._super(list);
		if (this.treeOptions().iconImages() == list.name()) {
			this.treeOptions._icons = list;
		}
	},
	refreshView: function () {
		if (this._treeLinesView) {
			this._treeLinesView.invalidate();
		}
		this._super();
	},
	getEditBounds: function (index) {
		/*
		if (index.column().root().displayIndex() == 0) {
			var view = this.getFocusedCellView();
			if (view) {
				var r = view.boundsByContainer();
				if (view instanceof DataCellElement) {
					r.width -= view.getButtonsWidth();
				}
				r.width = Math.max(2, r.width);
				return r;
			}
		}
		*/
		return this._super(index);
	},
	updatePastedRow: function (item, values, strict) {
		if (item instanceof TreeItem) {
			var row = item.row();
			if (row) {
				strict ? row.updateStrict(values) : row.update(values);
			}
		}
	},
	appendPastedRow: function (values) {
		var ds = this.dataSource();
		if (ds) {
			var row = ds.createRow(values, -1, false);
			ds.rootRow().addChild(row);
		}
	},
	_createItemSource: function () {
		var items = new TreeGridItemProvider(true);

		items._addParentNodeOnFiltering  = this._filteringOptions ? this._filteringOptions._addParentNodeOnFiltering : undefined;
		return items;
	},
	$_getVisibleAncestor: function (rowId) {
		var item = this._items.getItemOfRow(rowId);
		if (item) {
			while (item && !item.isVisible()) {
				item = item.parent();
			}
			return item;
		} else {
			return null;
		}
	},
	onTreeItemProviderItemChanged: function (provider, item) {
		this._treeLinesView.invalidate();
		this.invalidateLayout();
		this.fireEvent(TreeView.CHANGED, item);
	},
	onTreeItemProviderExpanding: function (provider, item) {
		this._focusedRow = this.focusedIndex() ? this.focusedIndex().dataRow : -1;
		if (this.editController().isEditing() && !this._items.isEditing()) {
			this.editController().cancelEditor(true);
		}
		return !this.editController().isEditing() && !this._items.isEditing() &&
			this.fireConfirmEvent(TreeView.EXPANDING, item);
	},
	onTreeItemProviderExpanded: function (provider, item) {
		if (this._focusedRow >= 0) {
			var index = this.focusedIndex().clone();
			var item = this.$_getVisibleAncestor(this._focusedRow);
			index._itemIndex = item ? item.index() : -1;
			this.setFocusedIndex(index, true);
		}
		this.fireEvent(TreeView.EXPANDED, item);
	},
	onTreeItemProviderCollapsing: function (provider, item) {
		this._focusedRow = this.focusedIndex() ? this.focusedIndex().dataRow : -1;
		if (this.editController().isEditing() && !this._items.isEditing()) {
			this.editController().cancelEditor(true);
		}
		return !this.editController().isEditing() && !this._items.isEditing() &&
			this.fireConfirmEvent(TreeView.COLLAPSING, item);
	},
	onTreeItemProviderCollapsed: function (provider, item) {
		if (this._focusedRow >= 0) {
			var index = this.focusedIndex().clone();
			var item = this.$_getVisibleAncestor(this._focusedRow);
			index._itemIndex = item ? item.index() : -1;
			this.setFocusedIndex(index, true);
		}
		this.fireEvent(TreeView.COLLAPSED, item);
	}
});
TreeView.EXPANDING = "onTreeViewExpanding";
TreeView.EXPANDED = "onTreeViewExpanded";
TreeView.COLLAPSING = "onTreeViewCollapsing";
TreeView.COLLAPSED = "onTreeViewCollapsed";
TreeView.CHANGED = "onTreeViewChanged";

// dummy class, 실체는 TreeViewRealObserver
var /* internal */ TreeViewObserver = defineClass("TreeViewObserver", GridBaseObserver, {
	init: function () {
		this._super();
	},
	onTreeViewExpanding: function (tree, item) {
	},
	onTreeViewExpanded: function (tree, item) {
	},
	onTreeViewCollapsing: function (tree, item) {
	},
	onTreeViewCollapsed: function (tree, item) {
	},
	onTreeViewChanged: function (tree, item) {
	}
}); 