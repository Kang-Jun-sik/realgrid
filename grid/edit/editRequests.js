var CellRequest = defineClass("CellRequest", EditRequest, {
	init : function(cell) {
		this._super();
		this._cell = cell;
	},
	cell: function () {
		return this._cell;
	},
	cursor : function() {
		return null;
	},
	source : function() {
		return this._cell;
	},
	isSelectable : function() {
		return true;
	},
	isDblClickable : function() {
		return false;
	}
});
var ColumnResizeRequest = defineClass("ColumnResizeRequest", CellRequest, {
	init: function(headerCell) {
		this._super(headerCell);
	},
	delta: 0,
	headerCell: function () {
		return this._cell;
	},
	cursor: function() {
		return Cursor.HORZ_RESIZE;
	},
	isSelectable : function() {
		return false;
	},
	isDblClickable : function() {
		return true;
	}
});
var ColumnMoveRequest = defineClass("ColumnMoveRequest", CellRequest, {
	init: function(cell) {
		this._super(cell);
	}
});
var DataCellRequest = defineClass("DataCellRequest", EditRequest, {
	init: function (index) {
		this._super();
		this._index = index;
	},
	cursor: function () {
		return null;
	},
	source: function () {
		return null;
	},
	isSelectable: function () {
		return true;
	},
	isDblClickable: function () {
		return false;
	}
});
var CellButtonRequest = defineClass("CellButtonRequest", DataCellRequest, {
	init : function(dataCell, buttonIndex) {
		this._super(dataCell.index());
		this._cell = dataCell;
		this._buttonIndex = buttonIndex;
	},
	cell : function() {
		return this._cell;
	},
	buttonIndex: function() {
		return this._buttonIndex;
	}
});
var EditButtonRequest = defineClass("EditButtonRequest", CellButtonRequest, {
	init: function(dataCellView) {
		this._super(dataCellView);
	}
});
var DataButtonRequest = defineClass("DataButtonRequest", CellButtonRequest, {
    init: function(dataCellView) {
        this._super(dataCellView);
    }
});
var GridEditRequest = defineClass("GridEditRequest", EditRequest, {
	init: function(index) {
		this._super();
	},
	cursor: function() {
		return null;
	},
	source: function() {
		return null;
	},
	isSelectable: function() {
		return true;
	},
	isDblClickable: function() {
		return false;
	}
});
var HeaderResizeRequest = defineClass("HeaderResizeRequest", GridEditRequest, {
	init: function(dataCell) {
		this._super(dataCell);
	},
	cursor: function() {
		return Cursor.VERT_RESIZE;
	}
});
var HeaderSummaryResizeRequest = defineClass("HeaderSummaryResizeRequest", GridEditRequest, {
    init: function(dataCell) {
        this._super(dataCell);
    },
    cursor: function() {
        return Cursor.VERT_RESIZE;
    }
});
var FooterResizeRequest = defineClass("FooterResizeRequest", GridEditRequest, {
	init: function(dataCell) {
		this._super(dataCell);
	},
	cursor: function() {
		return Cursor.VERT_RESIZE;
	}
});
var RowResizeRequest = defineClass("RowResizeRequest", GridEditRequest, {
	init: function(itemIndex) {
		this._super();
		this._itemIndex = itemIndex;
	},
	itemIndex: function () {
		return this._itemIndex;
	},
	cursor: function() {
		return Cursor.VERT_RESIZE;
	},
	isSelectable: function() {
		return false;
	}
});