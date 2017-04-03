var /* @abstract */ GridCell = defineClass("GridCell", null, {
	init: function (name) {
		this._super();
		this._name = name;
		this._index = new CellIndex();
	},
	styles: null,
    index: null,
	name: function () {
		return this._name;
	},
	setIndex: function (value) {
		this._index.assign(value);
	},
	getItem: function () {
		return this._index.item();
	},
	item: function () {
		return this._index.item();
	},
	error: function () {
		return null;
	},
	errorLevel: function () {
		return ValidationLevel.IGNORE;
	}
}, {
	ERROR: "<<ERROR>>"
});
var /* @abstract */ StyledCell = defineClass("StyledCell", GridCell, {
	init: function (model) {
		this._super(null);
		this._model = model;
	},
	model: null,
	displayText: function () {
		return null;
	},
	value: function () {
		return null;
	}
});
var HeaderCell = defineClass("HeaderCell", GridCell, {
	init: function () {
		this._super("headerCell");
	},
    subStyles: null,
    text: null,
    subText: null,
    subTextGap: 1,
    subLocation: SubTextLocation.LOWER,
	itemOffset: 2,
	itemGap: 2,
	imageList: null,
	imageIndex: -1,
	imageUrl: null,
	checkLocation: ColumnHeaderItemLocation.NONE,
	imageLocation: ColumnHeaderItemLocation.NONE,
	checked: false,
	showTooltip: true,
	tooltip: null
});
var HeaderSummaryCell = defineClass("HeaderSummaryCell", GridCell, {
	init: function () {
		this._super("headerSummaryCell");
		this._value = NaN;
		this._error = null;
		this._errorDetail = null;
	},
	displayText: function () {
		if (this._error) {
			return GridCell.ERROR;
		} else {
			var column;
			var s = isNaN(this._value) ? null : String(this._value);
			if (!s && (column = this.index().valueColumn())) {
				s = column.header().summary().text();
			}
			return s;
		}
	},
	value: function () {
		return this._value;
	},
	level: function () {
		return 0;
	},
	calculate: function () {
		var column = this.index().dataColumn();
		var grid = column ? column.grid() : null;
		this._value = NaN;
		this._error = null;
		if (grid && column.dataIndex() >= 0) {
			var summary = column.header().summary();
			if (grid.summaryMode() != SummaryMode.NONE && summary.expression() && grid.rowCount() > 0) {
				try {
					var runtime = grid.columnSummaryRuntime();
					runtime.setColumn(column, grid.getSummarizer());
					this._value = summary.evaluate(runtime);
				} catch (err) {
					this._error = err;
					this._errorDetail = err;
					throwDebugError(err);
				}
			} else if (summary._callback) {
				this._value = summary._callback(column.proxy());
			}
		}
	},
	error: function () {
		return this._error;
	},
	errorDetail: function () {
		return this._errorDetail;
	}
});
var FooterCell = defineClass("FooterCell", GridCell, {
	init: function () {
		this._super("footerCell");
		this._value = NaN;
		this._error = null;
		this._errorDetail = null;
	},
	footerIndex: 0,
	displayText: function () {
		if (this._error) {
			return GridCell.ERROR;
		} else {
			var column;
			var index = this._footerIndex;
			var s = isNaN(this._value) ? null : String(this._value);
			if (!s && (column = this.index().valueColumn())) {
				s = column.footer().text();
				if (s instanceof Array) {
					if (index >= 0 && s[index]) {
						s = s[index];
					} else {
						s = null;
					}
				}
			}
			return s;
		}
	},
	value: function () {
		return this._value;
	},
    level: function () {
        return 0;
    },
	calculate: function () {
		var column = this.index().dataColumn();
		var grid = column ? column.grid() : null;
		this._value = NaN;
		this._error = null;
		if (grid && column.dataIndex() >= 0) {
			var footer = column.footer();
			if (grid.summaryMode() != SummaryMode.NONE && footer.expression() && grid.rowCount() > 0) {
				try {
					var runtime = grid.columnSummaryRuntime();
					runtime.setColumn(column, grid.getSummarizer());
					this._value = footer.evaluate(runtime, this._footerIndex);
				} catch (err) {
					this._error = err;
					this._errorDetail = err;
					throwDebugError(err);
				}
			} else if (footer._callback) {
				this._value = footer._callback(column.proxy(), this._footerIndex);
			}
		}
	},
	error: function () {
		return this._error;
	},
	errorDetail: function () {
		return this._errorDetail;
	}
});
var /* @internal */ EditBarCell = defineClass("EditBarCell", GridCell, {
	init: function () {
		this._super("editBarCell");
	},
	displayText: function () {
		return null;
	},
	value: function () {
		return null;
	}
});
var IndicatorCell = defineClass("IndicatorCell", GridCell, {
	init: function (indicator) {
		this._super("indicatorCell");
		this._indicator = indicator;
	},
	indicator: null,
	itemState: ItemState.NORMAL,
	displayText: function () {
		var r;
		var indicator = this._indicator;
		var index = this.index();
		var item = index.item();
		var s = "";
		if (index.item()) {
			switch (indicator.displayValue()) {
			case IndicatorValue.INDEX:
				r = indicator._grid.getIndicatorIndex(item);
				if (r >= 0) {
					r += indicator.indexOffset();
					if (!indicator.isZeroBase()) {
						r++;
					}
					s = String(r);
				}
				break;
			case IndicatorValue.ROW:
				r = index.dataRow();
				if (r >= 0) {
					r += indicator.rowOffset();
					if (!indicator.isZeroBase()) {
						r++;
					}
					s = String(r);
				}
				break;
			}
		}
		return s;
	},
	value: function () {
		return null;
	}
});
var StateBarCell = defineClass("StateBarCell", GridCell, {
	init: function () {
		this._super("stateBarCell");
	},
	displayText: function () {
		switch (this.item().rowState()) {
		case RowState.CREATED:
			return "C";
		case RowState.UPDATED:
			return "U";
		case RowState.DELETED:
			return "D";
		case RowState.CREATE_AND_DELETED:
			return "CD";
		default:
			return "";	
		}
	},
	value: function () {
		return null;
	}
});
var CheckBarCell = defineClass("CheckBarCell", GridCell, {
	init: function () {
		this._super("checkBarCell");
	},
	displayText: function () {
		return this._index.dataRow();
	},
	value: function () {
		return UNDEFINED;
	}
});
var GroupCell = defineClass("GroupCell", GridCell, {
    init: function (name) {
        this._super(name);
    },
    setCellStyles: function (value) {
    }
});
var /* @abstract */ ValueCell = defineClass("ValueCell", GridCell, {
	init: function (name) {
		this._super(name);
	},
    cellStyles: null,
	displayText: function () {
		return this.value();
	},
	value: function () {
		return UNDEFINED;
	},
	blankState: function () {
		return BlankState.NONE;
	},
    setCellStyles: function (value) {
            this._cellStyles = value;
            value && value.assignTo(this._styles);
    }
});
var DataCell = defineClass("DataCell", ValueCell, {
	init : function(name) {
		this._super(name || "dataCell");
	},
	error: null,
	errorLevel: ValidationLevel.IGNORE,
	error_: function () {
		return this._error;
	},
	errorLevel_: function () {
		return this._errorLevel;
	},
    displayText : function() {
        var v;
        var index = this.index();
        var col = index.dataColumn();
        var item = index.item();
        if (col.isLookupDisplay()) {
            var lookup = col.lookupSource();
            if (lookup) {
                var i,
                    flds = col.lookupKeyFieldIds(),
                    cnt = flds.length,
                    keys = [];
                for (i = 0; i < cnt; i++) {
                    keys.push(item.getData(flds[i]));
                }
                v = lookup.lookup(keys, col.valueSeparator());
                v = (v !== undefined) ? v : this.value();
            } else {
                var fld = col.labelFieldIndex();
                v = (fld >= 0) ? item.getData(fld) : col.getLookupLabel(this.value());
            }
        } else {
            v = this.value();
            var exp, rep;
            if (col.valueType && col.valueType() == ValueType.NUMBER && isNaN(v)) {
            	v = col.nanText();
            } else if (v != null && (typeof v == "string" || typeof v == "number") && (v = v.toString()) && (exp = col.getDisplayRegExp()) && (rep = col.displayReplace())) {
            	v = v.replace(exp, rep);
            }
        }
        return  (v === undefined || v === null) ? "" : String(v);
    },
    value : function() {
        var idx = this.index();
        var col = idx.dataColumn();
        var fld = col.dataIndex();
        if (fld >= 0) {
            return idx.item().getData(fld);
        }
        return undefined;
    },
    blankState : function() {
        var state = BlankState.NONE,
            idx = this.index(),
            col = idx.dataColumn(),
            item = idx.item();
        if (col && col.isEqualBlank() && col.isDataRoot() && item.dataRow() >= 0 ) {
            var grid = idx.grid(),
                cnt = grid.itemCount();
            if (cnt > 1) {
                var i = idx.I(),
                    fld = col.dataIndex(),
                    v = item.getData(fld);
                if (i > 0) {
                    var prev, next, nextItem,
                        prevItem = grid.getItem(i - 1);
                    if (i < cnt - 1) {
                        nextItem = grid.getItem(i + 1);
                        if (prevItem instanceof GridRow) {
                            prev = prevItem.getData(fld);
                            if ( v instanceof Date && prev instanceof Date ? +v == +prev : v == prev) {
                                if (nextItem instanceof GridRow) {
                                    next = nextItem.getData(fld);
                                    state = ( next instanceof Date && v instanceof Date ? +next == +v : next == v) ? BlankState.BODY : BlankState.TAIL;
                                } else {
                                    state = BlankState.TAIL;
                                }
                            } else if (nextItem instanceof GridRow) {
                                next = nextItem.getData(fld);
                                if (next instanceof Date && v instanceof Date ? +next == +v : next == v) {
                                    state = BlankState.HEAD;
                                }
                            }
                        } else if (nextItem instanceof GridRow) {
                            next = nextItem.getData(fld);
                            if (next instanceof Date && v instanceof Date ? +next == +v : next == v) {
                                state = BlankState.HEAD;
                            }
                        }
                    } else if (prevItem instanceof GridRow) {
                        prev = prevItem.getData(fld);
                        if (prev instanceof Date && v instanceof Date ? +prev == +v : prev == v) {
                            state = BlankState.TAIL;
                        }
                    }
                } else {
                    nextItem = grid.getItem(i + 1);
                    if (nextItem instanceof GridRow) {
                        next = nextItem.getData(fld);
                        if (next instanceof Date && v instanceof Date ? +next == +v : next == v) {
                            state = BlankState.HEAD;
                        }
                    }
                }
            }
        }
        return state;
    },
    getTextFromItem : function(item) {
        var col = this.index().dataColumn();
        var fldVal = item.getData(col.dataIndex());
        var v;
        if (col.isLookupDisplay()) {
            var lookup = col.lookupSource();
            if (lookup) {
                var i,
                    flds = col.lookupKeyFieldIds(),
                    cnt = flds.length,
                    keys = [];
                for (i = 0; i < cnt; i++) {
                    keys.push(item.getData(flds[i]));
                }
                v = lookup.lookup(keys, col.valueSeparator());
                v = (v !== undefined) ? v : this.value();
            } else {
                var fld = col.labelFieldIndex();
                v = (fld >= 0) ? item.getData(fld) : col.getLookupLabel(fldVal);
            }
        } else {
            v = fldVal;
        }
        return  (v === undefined || v === null) ? "" : String(v);
    }
});
var LiteralCell = defineClass("LiteralCell", ValueCell, {
	init : function(name) {
		this._super(name || "literalCell");
	},
	displayText : function() {
		return this._index.column().value();
	},
	value : function() {
		return this._index.column().getValue();
	}
});
var SeriesCell = defineClass("SeriesCell", ValueCell, {
	init : function(name) {
		this._super(name || "seriesCell");
	},
	displayText : function() {
		return null;
	},
	value : function() {
		var column = this.index().column();
		if (column instanceof SeriesColumn) {
			var cnt,
				fields = column.fields();
			if (fields && (cnt = fields.length) > 0) {
				var i,
					item = this.item();
					vals = new Array(cnt);
				for (i = 0; i < cnt; i++) {
					if (fields[i] >= 0) {
						vals[i] = item.getData(fields[i]);
					}
				}
				return vals;
			}
		}
		return [];
	}
}, {
	getText: function (value) {
		return value ? value.join(",") : "";
	}
});
var RowGroupHeaderCell = defineClass("RowGroupHeaderCell", GridCell, {
	init: function(rowGroup) {
		this._super("rowGroupHeaderCell");
		this._rowGroup = rowGroup;
	},
	displayText: function () {
		var group = _cast(this.item(), GroupItem);
		if (group) {
			return this._rowGroup.getHeaderText(group);
		} else {
			return "";
		}
	},
	value: function () {
		return null;
	}
});
var RowGroupFooterCell = defineClass("RowGroupFooterCell", GridCell, {
	init: function(rowGroup) {
		this._super("rowGroupFooterCell");
		this._value = NaN;
		this._error = null;
		this._errorDetail = null;
		this._rowGroup = rowGroup;
	},
	calculate: function () {
		this._value = NaN;
		this._error = null;
		try {
			this._value = RowGroupFooterCell.$_getValue(this.item(), this.index().dataColumn());
		} catch (err) {
			this._error = err;
			this._errorDetail = err;
			throwDebugError(err);
		}
	},
	displayText: function() {
		if (this._error) {
			return GridCell.ERROR;
		} else {
			var s = isNaN(this._value) ? null : String(this._value);
			if (!s) {
				var group = _cast(this.item().parent(), GroupItem);
				var column = this.index().valueColumn();
				var groupText;
				if (group && column && column.grid().isGroupedColumn(column) && (groupText = this._rowGroup.getFooterText(group))) {
					s = groupText;
				} else if (column) {
					s = column.footer().groupText();
				}
			}
			return s;
		}
	},
	value: function() {
		return this._value;
	},
    level: function () {
        return this.index().item().level();
    }
}, {
	$_getValue: function (item, column) {
		if (column && column.dataIndex() >= 0) {
			var footer = column.footer();
			var group = item.parent();
			if (footer.groupExpression()) {
				var runtime/*RowGroupSummaryRuntime*/ = column.grid().rowGroupSummaryRuntime();
				runtime.setColumn(column, column.grid().getSummarizer());
				runtime.setItem(group);
				var v = footer.evaluateGroup(runtime);
				return v;
			} else if (footer._groupCallback) {
				return footer._groupCallback(item._index, column.proxy());
			} else if (group && column && column.grid().isGroupedColumn(column)) {
				var s = column.grid()._rowGroup.getFooterText(group);;
				return s == null ? undefined : s;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},
	getValue: function (item, column) {
		try {
			return RowGroupFooterCell.$_getValue(item, column);
		} catch (err) {
			return GridCell.ERROR;
		}
	}
});
var RowGroupBarCell = defineClass("RowGroupBarCell", GridCell, {
	init: function(rowGroup) {
		this._super("rowGroupBarCell");
	},
    level: 0,
	displayText: function() {
		return null;
	},
	value: function() {
		return null;
	}
});
var RowGroupItemBarCell = defineClass("RowGroupItemBarCell", GridCell, {
	init: function(rowGroup) {
		this._super("rowGroupItemBarCell");
	},
	displayText: function() {
		return null;
	},
	value: function() {
		return null;
	}
});
var RowGroupHeadCell = defineClass("RowGroupHeadCell", GridCell, {
	init: function(rowGroup) {
		this._super("rowGroupHeadCell");
	},
	index: function () {
		return CellIndex.NULL;
	},
	displayText: function() {
		return null;
	},
	value: function() {
		return null;
	}
});
var RowGroupFootCell = defineClass("RowGroupFootCell", GridCell, {
	init: function(rowGroup) {
		this._super("rowGroupFootCell");
	},
	displayText: function() {
		return null;
	},
	value: function() {
		return null;
	}
});
var RowGroupSummaryCell = defineClass("RowGroupSummaryCell", GridCell, {
	init: function(rowGroup) {
		this._super("rowGroupSummaryCell");
	},
	displayText: function() {
		return null;
	},
	value: function() {
		return null;
	}
});