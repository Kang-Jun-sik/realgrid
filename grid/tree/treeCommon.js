var TreeOptions = defineClass("TreeOptions", GridObject, {
	init : function(treeView) {
		this._super(treeView);
		this._expanderStyles = new VisualStyles(treeView, "expanderStyles");
		this._footerStyles = new VisualStyles(treeView, "footerStyles");
		this._icons = null;
	},
	expanderStyles: null,
	expanderWithCellStyles: true,
	footerStyles: null,
	expanderWidth: 17,
	lineVisible: true,
	lineStyle: null,
	showCheckBox: false,
	checkBoxSize: 17,
	iconImages: null,
	/**
	 * 0 보다 큰 값으로 지정하면 아이콘이 존재하지 않아도 그 너비를 차지한다.
	 */
	iconWidth: 0,
	iconHeight: 0,
	aggregateMode: TreeAggregateMode.LEAF,
	collapseWhenLeftArrow: true,
	collapseWhenCtrlArrow: true,
	expandWhenRightArrow: true,
	expandWhenCtrlArrow: true,
	icons: function () {
		return this._icons;
	},
	setLinseVisible: function (value) {
		if (value != this._linesVisible) {
			this._linesVisible = value;
			this._changed();
		}
	},
	setExpanderWidth: function (value) {
		if (value != this._expanderWidth) {
			this._expanderWidth = value;
			this._changed();
		}
	},
	setShowCheckBox: function (value) {
		if (value != this._showCheckBox) {
			this._showCheckBox = value;
			this._changed();
		}
	},
	setCheckBoxSize: function (value) {
		value = Math.max(0, value);
		if (value != this._checkBoxSize) {
			this._checkBoxSize = value;
			this._changed();
		}
	},
	setIconImages: function (value) {
		if (value != this._iconImages) {
			this._iconImages = value;
			this._icons = this.owner().getImageList(value);
			this._changed();
		}
	},
	setIconWidth: function (value) {
		value = Math.max(0, value);
		if (value != this._iconWidth) {
			this._iconWidth = value;
			this._changed();
		}
	},
	setIconHeight: function (value) {
		value = Math.max(0, value);
		if (value != this._iconHeight) {
			this._iconHeight = value;
			this._changed();
		}
	},
	setLineStyle: function (value) {
		if (this._lineStyle != value) {
			this._lineStyle = value;
			this._expanderStyles.line(value);
		}
	}
});
var TreeItemExpanderCell = defineClass("TreeItemExpanderCell", GridCell, {
	init : function() {
		this._super("treeItemExpanderCell");
	},
	displayText: function () {
		return null;
	},
	value: function () {
		return null;
	}
});
var TreeItemFooterCell = defineClass("TreeItemFooterCell", GridCell, {
	init : function() {
		this._super("treeItemFooterCell");
	},
	displayText: function () {
		var s = String(this.value());
		if (!s) {
            var index = this.index();
            if (index.dataColumn()) {
                s = index().column().footer().groupText();
            }
		}
		return s;
	},
	value: function () {
		return null;
	}
});
var TreeGridDelegate = defineClass("TreeGridDelegate", GridDelegate, {
	init : function(tree) {
		this._super(tree);
		this._rowViews = [];
		this._footerViews = [];
	},
	borrowItemView: function (model, fixed, rightFixed) {
		var i, row, footer;
		if (model instanceof TreeItem) {
			if (this._rowViews.length == 0) {
				this._rowViews.push(new TreeItemElement());
			}
			i = this._rowViews.length - 1;
			row = this._rowViews[i];
			row.setFixed(fixed);
			row.setRightFixed(rightFixed);
			this._rowViews.pop();
			return row;
		} else if (model instanceof TreeItemFooter) {
			if (this._footerViews.length == 0) {
				this._footerViews.push(new TreeItemFooterElement());
			}
			i = this._footerViews.length - 1;
			footer = this._footerViews[i];
			footer.setFixed(fixed);
			row.setRightFixed(rightFixed);
			this._footerViews.pop();
			return footer;
		}
		return null;
	}
});
var TreeGridLayoutManager = defineClass("TreeGridLayoutManager", GridLayoutManager, {
	init: function(tree) {
		this._super(tree);
	},
	_doLayout: function (bounds) {
		this._super(bounds);
		var tree = this.grid();
		var elt = tree.treeLinesRenderer();
		if (elt) {
			var r = this.fixedColCount() > 0 ? this.fixedBounds() : this.bodyBounds();
			if (this.columnCount() > 0) {
				r.width = Math.max(0, this.columnRect(0).width);
			} else {
				r.width = 0;
			}
			elt.setRect(r);
			elt.setLevelWidth(tree.treeOptions().expanderWidth());
			elt.setRange(tree, this.topIndex(), Math.min(tree.itemCount(), this.topIndex() + this.itemCount()) - 1);
		}
	}
});