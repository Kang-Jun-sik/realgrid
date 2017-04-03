var ValueType = _enum({
	TEXT: "text",
	NUMBER: "number",
	BOOLEAN: "boolean",
	DATETIME: "datetime",
	OBJECT: "object",
	CHAR: "char",
	UNUM: "unum",
	INT: "int",
	UINT: "uint",
	DATE: "date"
});
var RowState = _enum({
	NONE: "none",
	CREATED: "created",
	UPDATED: "updated",
	DELETED: "deleted",
	CREATE_AND_DELETED: "createAndDeleted",
	isDeleted: function (value) {
		return value == RowState.DELETED || value == RowState.CREATE_AND_DELETED;
	}
});
var RestoreMode = _enum({
	NONE: "none",
	AUTO: "auto",
	EXPLICIT: "explicit"
});
var TextInputCase = _enum({
	NORMAL: "normal",
	UPPER: "upper",
	LOWER: "lower",
	DEFAULT: "default"
});
var ItemState = _enum({
	NORMAL: "normal",
	FOCUSED: "focused",
	UPDATING: "updating",
	INSERTING: "inserting",
	APPENDING: "appending",
	DUMMY:"dummy",
	isEditing: function (state) {
		return state == ItemState.UPDATING || state == ItemState.INSERTING || state == ItemState.APPENDING;
	},
	isInserting: function (state) {
		return state == ItemState.INSERTING || state == ItemState.APPENDING;
	}
});
var PagingSource = _enum({
	ROWS: "rows",
	ITEMS: "items"
});
var ColumnGroupOrientation = _enum({
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
});
var ButtonState = _enum({
	UP: "up",
	HOVER: "hover",
	DOWN: "down"
});
var ClickBehavior = _enum({
	NONE: 0,
	SORT: 1
});
var HandleVisibility = _enum({
	VISIBLE: "visible",
	HOVERED: "hovered",
	ALWAYS: "always",
	HIDDEN: "hidden"
});
var SortMode = _enum({
    AUTO: "auto",
    EXPLICIT: "explicit"
});
var SortStyle = _enum({
	NONE: "none",
	EXCLUSIVE: "exclusive",
	INCLUSIVE: "inclusive",
	REVERSE: "reverse"
});
var SortDirection = _enum({
	ASCENDING: "ascending",
	DESCENDING: "descending"
});
var SortCase = _enum({
    SENSITIVE: "sensitive",
    INSENSITIVE: "insensitive"
});
var FilterMode = _enum({
    AUTO: "auto",
    EXPLICIT: "explicit"
});
var CellButton = _enum({
	NONE: "none",
	ACTION: "action",
	POPUP: "popup",
	IMAGE: "image"
});
var ButtonVisibility = _enum({
    ALWAYS: "always",
    DEFAULT: "default",
    VISIBLE: "visible",
    HIDDEN: "hidden",
    ROWFOCUSED:"rowfocused"
});
var LookupCase = _enum({
	SENSITIVE: "sensitvie",
	INSENSITIVE: "insensitive",
	LOWER: "lower",
	UPPER: "upper"
});
var ValidationLevel = _enum({
	ERROR: "error",
	WARNING: "warning",
	INFO: "info",
	IGNORE: "ignore"
});
var IndicatorValue = _enum({
	NONE: "none",
	INDEX: "index",
	ROW: "row"
});
var GridFitStyle = _enum({
	NONE: "none",
	EVEN: "even",
	EVEN_FILL: "evenFill",
	FILL: "fill"
});
var RowGroupAdornments = _enum({
	BOTH: "both",
	HEADER: "header",
	FOOTER: "footer",
	NONE: "none",
	SUMMARY:"summary",
	isHeader: function (v) {
		return v == "both" || v == "header";
	},
	isFooter: function (v) {
		return v == "both" || v == "footer";
	}
});
var RowGroupCellDisplay = _enum({
	NORMAL: "normal",
	MERGE: "merge",
	HIDE: "hide"
});
var RowGroupFooterVisibility = _enum({
	ALWAYS: "always",
	MULTI_ROWS_ONLY: "multiRowsOnly"
});
var SummaryMode = _enum({
	NONE: "none",
	AGGREGATE: "aggregate",
	STATISTICAL: "statistical"
});
var SelectionMode = _enum({
	NONE: "none",
	SINGLE: "single",
	EXTENDED: "extended"
});
var SelectionStyle = _enum({
	BLOCK: "block",
	ROWS: "rows",
	COLUMNS: "columns",
	SINGLE_ROW: "singleRow",
	SINGLE_COLUMN: "singleColumn",
	SINGLE: "single",
	NONE: "none",
	isSingle: function (value) {
		return value && (value == SelectionStyle.SINGLE_ROW || value == SelectionStyle.SINGLE_COLUMN || value == SelectionStyle.SINGLE);
	},
	isRow: function (value) {
		return value && (value == SelectionStyle.ROWS || value == SelectionStyle.SINGLE_ROW);			
	},
	isColumn: function (value) {
		return value && (value == SelectionStyle.COLUMNS || value == SelectionStyle.SINGLE_COLUMN);			
	}
});
var BlankState = _enum({
	NONE: "none",
	HEAD: "head",
	BODY: "body",
	TAIL: "tail"
});
var MenuItemType = _enum({
    NORMAL: "normal",
    CHECK: "check",
    RADIO: "radio",
    SEPARATOR: "separator"
});
var ColumnHeaderItemLocation = _enum({
    NONE: "none",
    LEFT_EDGE: "leftEdge",
    RIGHT_EDGE: "rightEdge",
    TOP_EDGE: "topEdge",
    BOTTOM_EDGE: "bottomEdge",
    LEFT: "left",
    RIGHT: "right",
    TOP: "top",
    BOTTOM: "bottom",
    CENTER: "center"
});
var SubTextLocation = _enum({
    DEFAULT: "default",
    NONE: "none",
    LEFT: "left",
    RIGHT: "right",
    UPPER: "upper",
    LOWER: "lower",
	LEFT_FILL: "leftFill",
	RIGHT_FILL: "rightFill",
	UPPER_FILL: "upperFill",
	LOWER_FILL: "lowerFill"
});
var TextWrapMode = _enum({
	NONE: "none",
	EXPLICIT: "explicit",
	NORMAL: "normal"
});
var TextOverflow = _enum({
	CLIP: "clip",
	ELLIPSIS: "ellipsis",
	PATH: "path"
});
var Alignment = _enum({
	NEAR: "near",
	CENTER: "center",
	FAR: "far"
});
var IconLocation = _enum({
	LEFT: "left",
	RIGHT: "right",
	TOP: "top",
	BOTTOM: "bottom",
	CENTER: "center",
	NONE: "none"
});
var ContentFit = _enum({
	NONE: "none",
	CENTER: "center",
	BOTH: "both",
	WIDTH: "width",
	HEIGHT: "height",
	AUTO: "auto"
});
var SelectionDisplay = _enum({
	MASK: "mask",
	INVERSION: "inversion"
});
var ValidationLevel = {
	ERROR: "error",
	WARNING: "warning",
	INFO: "info",
	IGNORE: "ignore"
};
var ValidationMode = {
	ALWAYS: "always", 
	UPDATE: "update",
	INSERT: "insert"
};

var VerticalMovingStep = _enum({
	ROW: "row",
	CELL: "cell",
	DEFAULT: "default"
});

var StateMark = _enum({
	DEFAULT: "default",
	TEXT: "text"
});

var HeaderHeightFill = _enum({
	DEFAULT: "default",
	FIXED: "fixed"
})

var RowFocusMask = _enum({
	ROW: "row",
	DATA: "data",
	FILL: "fill"
});
