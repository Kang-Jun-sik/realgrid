var /* internal */ ColumnArrayItem = function (column) {
    this.column = column;
    this.dataColumn = _cast(column, DataColumn);
    this.colIndex = 0;
    this.colSpan = 0;
    this.rowIndex = 0;
    this.rowSpan = 0;
    this.width = 0;
    this.valueType = 's';
    this.tag = undefined;
    this.data = undefined;
};
var /* internal */ ColumnArray = defineClass("ColumnArray", null, {
    init: function (grid, linearize) {
        this._super();
        this._grid = grid;
        this._headerRows = [];
        this._dataRows = [];
        this.$_parse(grid, linearize);
    },
    destroy: function() {
        this._destroying = true;
        this._grid = null;
        this._headerRows = null;
        this._dataRows = null;
        this._super();
    },
    grid: function () {
        return this._grid;
    },
    colCount: function () {
        return this._headerRows.length && this._headerRows[0].length;
    },
    headerRowCount: function () {
        return this._headerRows.length;
    },
    dataRowCount: function () {
        return this._dataRows.length;
    },
    getHeader: function (row, col)/*ColumnArrayItem*/ {
        return this._headerRows[row][col];
    },
    getItem: function (row, col)/*ColumnArrayItem*/ {
        return this._dataRows[row][col];
    },
    setItem: function (row, col, item) {
        this._dataRows[row][col] = item;
    },
    $_parse: function (grid, linearize) {
        var headerLevels = 1;
        var dataLevels = 1;
        var cnt = grid.visibleColumnCount();
        if (!linearize) {
            for (var i = 0; i < cnt; i++) {
                var col = grid.getVisibleColumn(i);
                if (col instanceof ColumnGroup) {
                    headerLevels = Math.max(headerLevels, col.calcHeaderLevels());
                    dataLevels = Math.max(dataLevels, col.calcDataLevels());
                }
            }
        }
        for (i = 0; i < headerLevels; i++) {
            this._headerRows.push([]);
        }
        for (i = 0; i < dataLevels; i++) {
            this._dataRows.push([]);
        }
        this.$_parseRows(grid, true, this._headerRows, linearize);
        this.$_parseRows(grid, false, this._dataRows, linearize);
    },
    $_parseRows: function (grid, includeHeader, rows, linearize) {
        function addColumn(x, y, w, h, column) {
            var r, c, item/*ColumnArrayItem*/;
            for (r = 0; r < h; r++) {
                for (c = 0; c < w; c++) {
                    item = new ColumnArrayItem(column);
                    item.colIndex = c;
                    item.colSpan = w;
                    item.rowIndex = r;
                    item.rowSpan = h;
                    if (item instanceof DataColumn) {
                        switch (column.valueType()) {
                            case ValueType.NUMBER:
                                item.valueType = 'n';
                                break;
                            case ValueType.BOOLEAN:
                                item.valueType = 'b';
                                break;
                            case ValueType.DATETIME:
                                item.valueType = 'd';
                                break;
                            default:
                                item.valueType = 's';
                                break;
                        }
                    } else {
                        item.valueType = 's';
                    }
                    rows[y + r][x + c] = item;
                }
            }
        }
        function addGroup(x, y, w, h, group) {
            var cnt = group.visibleCount();
            if (cnt < 1) {
                addColumn(x, y, w, h, group);
                return;
            }
            if (includeHeader && group.header().isVisible()) {
                if (group.isHideChildHeaders()) {
                    addColumn(x, y, w, h, group);
                    return;
                }
                addColumn(x, y, w, 1, group);
                y++;
                h--;
            }
            if (includeHeader && group.isHideChildHeaders()) {
                addColumn(x, y, w, h, group);
                return;
            }
            var i, column, hh, ww;
            if (group.isVertical()) {
                for (i = 0; i < cnt; i++) {
                    column = group.getVisibleItem(i);
                    if (column instanceof ColumnGroup) {
                        if (i < cnt - 1) {
                            hh = includeHeader ? column.calcHeaderLevels() : column.calcDataLevels();
                        } else {
                            hh = h;
                        }
                        addGroup(x, y, w, hh, column);
                        y += hh;
                        h -= hh;
                    } else if (i < cnt - 1) {
                        addColumn(x, y, w, 1, column);
                        y++;
                        h--;
                    } else {
                        addColumn(x, y, w, h, column);
                    }
                }
            } else {
                for (i = 0; i < cnt; i++) {
                    column = group.getVisibleItem(i);
                    if (column instanceof ColumnGroup) {
                        if (i < cnt - 1) {
                            ww = column.calcHorz();
                        } else {
                            ww = w;
                        }
                        addGroup(x, y, ww, h, column);
                        x += ww;
                        w -= ww;
                    } else if (i < cnt - 1) {
                        addColumn(x, y, 1, h, column);
                        x++;
                        w--;
                    } else {
                        addColumn(x, y, w, h, column);
                    }
                }
            }
        }
        var h = rows.length;
        var w = 0;
        var x = 0;
        var y = 0;
        if (linearize) {
            var columns = grid.getLeafColumns(true);
            for (var i = 0, cnt = columns.length; i < cnt; i++) {
                addColumn(x+i, y, 1, h, columns[i]);
            }
        } else {
            var cnt = grid.visibleColumnCount();
            for (var i = 0; i < cnt; i++) {
                var column = grid.getVisibleColumn(i);
                if (column instanceof ColumnGroup) {
                    w = column.calcHorz();
                    addGroup(x, y, w, h, column);
                } else {
                    w = 1;
                    addColumn(x, y, w, h, column);
                }
                x += w;
            }
        }

    }
});
var VIS_DEFAULT = "default";
var VIS_HIDDEN = "hidden";
var VIS_VISIBLE = "visible";
var INDICATOR_DEFAULT = "default";
var INDICATOR_ITEM = "item";
var INDICATOR_ROW = "row";
var PIXELS_PER_CHAR = 7;

var DocumentTitle = defineClass("DocumentTitle", null, {
    init: function (source) {
        if (typeof source == "string") {
            this._message = source;
            this._styles = new VisualStyles(null, "DocumentTitleStyle");
            this.$_initStyles();
            this._visible = true;
            this._spaceTop = 0;
            this._spaceBottom = 0;
            this._height = -1;
        } else if (typeof source == "object") {
            this._message = source.message;
            this._visible = source.hasOwnProperty('visible') ? source.visible : true;
            this._styles = new VisualStyles(null, "DocumentTitleStyle");
            this.$_initStyles();
            source.styles && this._styles.extend(source.styles);
            this._spaceTop = source.spaceTop ? (isNaN(parseInt(source.spaceTop)) ? 0 : parseInt(source.spaceTop)) : 0;
            this._spaceBottom = source.spaceBottom ? (isNaN(parseInt(source.spaceBottom)) ? 0 : parseInt(source.spaceBottom)): 0;
            this._height = source.height ? (isNaN(parseInt(source.height)) ? -1 : parseInt(source.height)) : -1;
        }
    },
    $_initStyles: function() {
        var border = "#ff555555,1px";
        this._styles.borderLeft(border);
        this._styles.borderRight(border);
        this._styles.borderTop(border);
        this._styles.borderBottom(border);
    },
    proxy: function () {
        var obj = {
            message: this._message,
            visible: this._visible
        };
        if (this._styles)
            obj.styles = this._styles.toProxy();
        return obj;
    },
    message: null,
    visible: true,
    styles: null,
    spaceTop: 0,
    spaceBottom: 0,
    height: -1
});

var GridExportOptions = defineClass("GridExportOptions", null, {
    init: function (source) {
        this._super();
        this._datetimeWriter = null;
        source && this.assign(source);
    },
    target: "remote",   // "remote" | "local"
    url: undefined,
    fileName: null,
    linear: false,
    allItems: true,
    indicator: VIS_DEFAULT,
    checkBar: VIS_HIDDEN,
    header: VIS_DEFAULT,
    footer: VIS_DEFAULT,
    headerSummary:VIS_DEFAULT,
    indicatorValue: INDICATOR_DEFAULT,
    checkMark: "v",
    indenting: true,
    checkNumber: false,
    datetimeFormat: undefined,
    nullDateText: "",
    datetimeCallback: null,
    numberFormat: undefined,
    numberCallback: null,
    booleanFormat: null,
    booleanCallback: null,
    separateRows: false,
    showConfirm: true,
    confirmMessage: "Excel 문서로 저장하시겠습니까?",
    confirmTitle: "Excel 저장",
    lookupDisplay: false,
    compatibility: false,
    showLevelOutline: true,
    documentTitle: null,
    documentSubtitle: null,
    documentTail: null,
    start: 0,
    count: -1,
    showProgress: false,
    progressMessage:null,
    applyDynamicStyles: false,
    applyDefaultColumnFormat: false,
    done: null,
    setFileName: function (value) {
        value = _trim(value);
        if (value && value.indexOf(".") < 0) {
            value = value + ".xlsx";
        }
        this._fileName = value;
    },
    setDatetimeFormat: function (value) {
        if (value != this._datetimeFormat) {
            this._datetimeFormat = value;
        }
    },
    setBooleanFormat: function (value) {
        if (value != this._booleanFormat) {
            this._booleanFormat = value;
            if (value) {
                this._booleanFormatter = new BooleanFormatter(value);
            } else {
                this._booleanFormatter = null;
            }
        }
    },
    setNumberFormat: function (value) {
        if (value != this._numberFormat) {
            this._numberFormat = value;
        }
    },
    isIndicatorVisible: function (grid) {
        if (grid) {
            switch (this._indicator) {
                case VIS_VISIBLE:
                    return true;
                case VIS_HIDDEN:
                    return false;
                case VIS_DEFAULT:
                default:
                    return grid.indicator().isVisible();
            }
        }
        return false;
    },
    isCheckBarVisible: function (grid) {
        if (grid) {
            switch (this._checkBar) {
                case VIS_VISIBLE:
                    return true;
                case VIS_HIDDEN:
                    return false;
                case VIS_DEFAULT:
                default:
                    return grid.checkBar().isVisible();
            }
        }
        return false;
    },
    isHeaderVisible: function (grid) {
        if (grid) {
            switch (this._header) {
                case VIS_VISIBLE:
                    return true;
                case VIS_HIDDEN:
                    return false;
                case VIS_DEFAULT:
                default:
                    return grid.header().isVisible();
            }
        }
        return false;
    },
    isHeaderSummaryVisible: function (grid) {
        // header와 독립적으로 표시되도록 한다.
        if (grid) {
            switch (this._headerSummary) {
                case VIS_VISIBLE:
                    return true;
                case VIS_HIDDEN:
                    return false;
                case VIS_DEFAULT:
                default:
                    return grid.header().summary().isVisible();
            }
        }
        return false;
    },
    isFooterVisible: function (grid) {
        if (grid) {
            switch (this._footer) {
                case VIS_VISIBLE:
                    return true;
                case VIS_HIDDEN:
                    return false;
                case VIS_DEFAULT:
                default:
                    return grid.footer().isVisible();
            }
        }
        return false;
    },
    isIndicatorDataRow: function (grid) {
        if (grid) {
            switch (this._indicatorValue) {
                case INDICATOR_ITEM:
                    return false;
                case INDICATOR_ROW:
                    return true;
                case INDICATOR_DEFAULT:
                default:
                    return grid.indicator().displayValue() == IndicatorValue.ROW;
            }
        }
        return false;
    },
    setDocumentTitle: function (value) {
        this._documentTitle = value ? new DocumentTitle(value) : null; 
    },
    setDocumentSubtitle: function (value) {
        this._documentSubtitle = value ? new DocumentTitle(value) : null;
    },
    setDocumentTail: function (value) {
        this._documentTail = value ? new DocumentTitle(value) : null;
    }
});