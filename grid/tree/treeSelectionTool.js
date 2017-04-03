var TreeSelectionTool = defineClass("TreeSelectionTool", GridSelectionTool, {
	init: function(tree) {
		this._super(tree);
	},
	_doKeyDown: function (key, ctrl, shift, alt) {
		var item;
		var idx = this.focused().clone();
		var treeOptions = this.grid()._treeOptions;
		if (idx && (item = idx.item())) {
			switch (key) {
				case Keys.RIGHT:
					if (item.isExpanded()) {
						if (ctrl && item.count() > 0 && treeOptions.isExpandWhenCtrlArrow()) {
							idx.down();
							this.setFocused(idx, true);
							return true;
						}
					} else {
						if ( (this.grid().visibleColumnCount() == 1 && idx.isRight() && treeOptions.isExpandWhenRightArrow()) || ( ctrl && treeOptions.isExpandWhenCtrlArrow()) ) {
							item.setExpanded(true);
							return true;
						}
					}
					break;
				case Keys.LEFT:
					if (item.isExpanded()) {
						if ( (idx.isLeft() && treeOptions.isCollapseWhenLeftArrow()) || ( ctrl && treeOptions.isCollapseWhenCtrlArrow()) ) {
							item.setExpanded(false);
							return true;
						}
					} else {
						if (idx.isLeft() || ctrl) {
							if ( ctrl && !treeOptions.isCollapseWhenCtrlArrow()) {

							} else {
								if (!(item.parent() instanceof RootTreeItem)) {
									idx.itemIndex(item.parent().index());
									this.setFocused(idx, true);
									return true;
								}
							}
						}								
					}
					break;
			}
		}
		return this._super(key, ctrl, shift, alt);
	},
	_doColumnHeaderClicked: function (column, rightClicked, event) {
		this._super(column);
		var tree = this.grid();
		var dcol = _cast(column, DataColumn);
		if (!tree.isEmpty() && dcol && dcol.isSortable() && tree.sortingOptions().isEnabled()) {
			tree.sortColumn(dcol,event);
		}
	},
	_doElementClicked: function (element) {
		this._super(element);
		if (element instanceof TreeCheckElement) {
			var tree = this.grid();
			if (tree.editOptions().isCheckable()) {
				var item = element.item();
				item && item.isCheckable() && tree.itemSource().checkItem(item, !item.isChecked(), tree.checkBar().isExclusive(), true);
			}
		}
	},
	_doHandleClicked: function (handle) {
		if (handle instanceof TreeExpandHandle) {
			var item = handle.cellView().item();
			if (item) {
				item.setExpanded(!item.isExpanded());
			}
		} else {
			this._super(handle);
		}
	}
});