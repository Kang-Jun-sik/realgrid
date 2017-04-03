/*
var  ExpressionRuntime = defineClass("ExpressionRuntime", null, {
	init: function () {
		this._super();
	},
	isIdentifier: function (token) {
		throw new ExpressionSyntaxError("Token is not a valid Identifier: " + token, null);
	},
	evaluateIdentifier: function (idKey) {
	},
	evaluateIndexerI: function (idKey, index) {
	},
	evaluateIndexerS: function (idKey, index, capitalized) {
	},
	_invalidIdentError: function (idKey) {
		throw "Invalid identifier key: " + idKey;
	}
});
*/

var DataRowExpressionRuntime = defineClass("DataRowExpressionRuntime", ExpressionRuntime, {
	init: function () {
		this._super();
		this._item = null;
		this._group = null;
		this._dataSource = null;
		this._fieldCount = null;
	},
	index: function () {
		return this._item.index();
	},
	item: function () {
		return this._item;
	},
	setDataSource: function (value) {
		this._dataSource = value;
		this._fieldCount = value ? value.fieldCount() : 0;
	},
	setItem: function (item) {
		if (!item) {
			if ($_debug) debugger;
		}
		this._item = item;
		this._group = _cast(item, GroupItem);
	},
	isIdentifier: function (token) {
		token = token.toLowerCase();
		if (DataRowExpressionRuntime.IDENTS.hasOwnProperty(token)) {
			return DataRowExpressionRuntime.IDENTS[token];
		} 
		return this._super(token);
	},
	evaluateIdentifier: function (idKey) {
		assert(this._item != null, "item is null");
		switch (idKey) {
		case DataRowExpressionRuntime.ID_ROW:
			return this._item.index();
		case DataRowExpressionRuntime.ID_DATA_ROW:
			return this._item.dataRow();
		case DataRowExpressionRuntime.ID_CHECKED:
			return this._item.isChecked();
		case DataRowExpressionRuntime.ID_STATE:
			switch (this._item.rowState()) {
			case RowState.CREATED:
				return "c";
			case RowState.UPDATED:
				return "u";
			case RowState.DELETED:
				return "d";
			case RowState.CREATE_AND_DELETED:
				return "x";
			}
			return UNDEFINED;
		case DataRowExpressionRuntime.ID_COUNT:
			return this._group ? this._group.count() : 0;
		case DataRowExpressionRuntime.ID_DCOUNT:
			return this._group ? this._group.descendantCount() : 0;
		}
		throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
	},
	evaluateIndexerI: function (idKey, index) {
		if (this._item) {
			if (idKey == DataRowExpressionRuntime.ID_VALUE || idKey == DataRowExpressionRuntime.ID_VALUES) {
				if (index < 0 || index >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field index out of bounds:" + index);
				}
				return this._item.getData(index);
			}
			throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
		} else {
			return UNDEFINED;
		}
	},
	evaluateIndexerS: function (idKey, index, capitalized) {
		if (idKey == DataRowExpressionRuntime.ID_VALUE || idKey == DataRowExpressionRuntime.ID_VALUES) {
			if (this._dataSource) {
				var idx = capitalized ? this._dataSource.getFieldIndexC(index) : this._dataSource.getFieldIndex(index);
				if (idx < 0 || idx >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field is not exists:" + index);
				}
				return this._item.getData(idx);
			} else {
				return UNDEFINED;
			}
		}
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	}
}, {
	ID_ROW: 0,
	ID_DATA_ROW: 1,
	ID_CHECKED: 2,
	ID_VALUE: 3,
	ID_VALUES: 4,
	ID_STATE: 5,
	ID_COUNT: 6,
	ID_DCOUNT: 7
}, function (f) {
	f.IDENTS = {
		row: f.ID_ROW,
		datarow: f.ID_DATA_ROW,
		checked: f.ID_CHECKED,
		value: f.ID_VALUE,
		values: f.ID_VALUES,
		state: f.ID_STATE,
		count: f.ID_COUNT,
		dcount: f.ID_DCOUNT
	};
});
var DataCellExpressionRuntime = defineClass("DataCellExpressionRuntime", ExpressionRuntime, {
	init: function () {
		this._super();
		this._cell = null;
		this._item = null;
		this._dataSource = null,
		this._fieldCount = 0;
	},
	setDataSource: function (value) {
		this._dataSource = value;
		this._fieldCount = value ? value.fieldCount() : 0;
	},
	setCell: function (value) {
		this._cell = value;
		this._item = value.index().item();
	},
	isIdentifier: function (token) {
		token = token.toLowerCase();
		if (DataCellExpressionRuntime.IDENTS.hasOwnProperty(token)) {
			return DataCellExpressionRuntime.IDENTS[token];
		}
		return this._super(token);
	},
	evaluateIdentifier: function (idKey) {
		switch (idKey) {
		case DataCellExpressionRuntime.ID_VALUE:
			return this._cell.value();
		case DataCellExpressionRuntime.ID_ROW:
			return this._cell.index().I();
		case DataCellExpressionRuntime.ID_DATA_ROW:
			return this._cell.index().dataRow();
		case DataCellExpressionRuntime.ID_INDEX:
			return this._cell.index().column().index();
		case DataCellExpressionRuntime.ID_FIELD:
			return this._cell.index().dataField();
		case DataCellExpressionRuntime.ID_CHECKED:
			return this._item.isChecked();
		case DataCellExpressionRuntime.ID_STATE:
			switch (this._item.rowState()) {
			case RowState.CREATED:
				return "c";
			case RowState.UPDATED:
				return "u";
			case RowState.DELETED:
				return "d";
			case RowState.CREATE_AND_DELETED:
				return "x";
			}
			return UNDEFINED;
		case DataCellExpressionRuntime.ID_TAG:
			return this._cell.index().C().tag();
		case DataCellExpressionRuntime.ID_BASE:
			var idx = this._cell.index().dataColumn().baseIndex();
			return idx >= 0 ? this._item.getData(idx) : UNDEFINED;
		case DataCellExpressionRuntime.ID_COUNT:
			return this._item instanceof GroupItem ? this._item.count() : 0;
		case DataCellExpressionRuntime.ID_DCOUNT:
			return this._item instanceof GroupItem ? this._item.descendantCount() : 0;
		}
		if ($_debug) debugger;
		throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
	},
	evaluateIndexerI: function (idKey, index) {
		if (this._item) {
			if (idKey == DataCellExpressionRuntime.ID_VALUE || idKey == DataCellExpressionRuntime.ID_VALUES) {
				if (index < 0 || index >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field index out of bounds:" + index);
				}
				return this._item.getData(index);
			}
			throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
		} else {
			return undefined;
		}
	},
	evaluateIndexerS: function (idKey, index, capitalized) {
		if (idKey == DataCellExpressionRuntime.ID_VALUE || idKey == DataCellExpressionRuntime.ID_VALUES) {
			if (this._dataSource) {
				var idx = capitalized ? this._dataSource.getFieldIndexC(index) : this._dataSource.getFieldIndex(index);
				if (idx < 0 || idx >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field is not exists:" + index);
				}
				return this._item.getData(idx);
			} else {
				return undefined;
			}
		}
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	}
}, {
	ID_VALUE: 0,
	ID_ROW: 1,
	ID_DATA_ROW: 2,
	ID_INDEX: 3,
	ID_FIELD: 4,
	ID_CHECKED: 5,
	ID_STATE: 6,
	ID_TAG: 7,
	ID_BASE: 8,
	ID_VALUES: 9,
	ID_COUNT: 10,
	ID_DCOUNT: 11
}, function (f) {
	f.IDENTS = {
		value: f.ID_VALUE,
		row: f.ID_ROW,
		datarow: f.ID_DATA_ROW,
		index: f.ID_INDEX,
		field: f.ID_FIELD,
		checked: f.ID_CHECKED,
		state: f.ID_STATE,
		tag: f.ID_TAG,
		base: f.ID_BASE,
		values: f.ID_VALUES,
		count: f.ID_COUNT,
		dcount: f.ID_DCOUNT
	};
});
var FooterExpressionRuntime = defineClass("FooterExpressionRuntime", ExpressionRuntime, {
    init: function () {
        this._super();
        this._cell = null;
    },
    setCell: function (cell) {
        this._cell = cell;
    },
    isIdentifier: function (token) {
        token = token.toLowerCase();
        if (FooterExpressionRuntime.IDENTS.hasOwnProperty(token)) {
            return FooterExpressionRuntime.IDENTS[token];
        }
        return this._super(token);
    },
    evaluateIdentifier: function (idKey) {
        switch (idKey) {
            case FooterExpressionRuntime.ID_VALUE:
                return this._cell.value();
            case FooterExpressionRuntime.ID_FIELD:
                return this._cell.index().dataField();
            case FooterExpressionRuntime.ID_LEVEL:
                return this._cell.level();
        }
        if ($_debug) debugger;
        throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
    },
    evaluateIndexerI: function (idKey, index) {
        return undefined;
    },
    evaluateIndexerS: function (idKey, index, capitalized) {
        return undefined;
    }
}, {
    ID_VALUE: 0,
    ID_FIELD: 1,
    ID_LEVEL: 2
}, function (f) {
    f.IDENTS = {
        value: f.ID_VALUE,
        field: f.ID_FIELD,
        level: f.ID_LEVEL
    };
});
var RowGroupStatementRuntime = defineClass("RowGroupStatementRuntime", ExpressionRuntime, {
	init : function() {
		this._super();
		this._grid = null;
		this._group = null;
	},
	destroy: function() {
		this._destroying = true;
		this._grid = null;
		this._group = null;
		this._super();
	},
	setGrid: function (value) {
		this._grid = value;
	},
	setGroup: function (value) {
		this._group = value;
	},
	isIdentifier : function(token) {
		token = token.toLowerCase();
		if (RowGroupStatementRuntime.IDENTS.hasOwnProperty(token)) {
			return RowGroupStatementRuntime.IDENTS[token];
		}
		return this._super(token);
	},
	evaluateIdentifier : function(idKey) {
		assert(this._group != null, "group is null");
		var field;
		var column;
		switch (idKey) {
		case RowGroupStatementRuntime.ID_GROUP_FIELD:
			field = this._group.dataSource().getField(this._group.groupField());
			return field ? field.fieldName() : "";
		case RowGroupStatementRuntime.ID_FIELD_HEADER:
			field = this._group.dataSource().getField(this._group.groupField());
			return field ? field.header() : "";
		case RowGroupStatementRuntime.ID_GROUP_COLUMN:
			column = this._grid ? this._grid.columnByField(this._group.groupField()) : null;
			return column ? column.displayText() : this._group.dataSource().getFieldName(this._group.groupField());
		case RowGroupStatementRuntime.ID_COLUMN_HEADER:
			column = this._grid ? this._grid.columnByField(this._group.groupField()) : null;
			if (column) {
				var header = column.header();
				return header ? header.text() : column.displayText();
			} else {
				return this._group.dataSource().getFieldName(this._group.groupField());
			}
		case RowGroupStatementRuntime.ID_COLUMN_FOOTER:
			column = this._grid ? this._grid.columnByField(this._group.groupField()) : null;
			if (column) {
				var footer = column.footer();
				return footer ? footer.groupText() : column.displayText();
			} else {
				return this._group.dataSource().getFieldName(this._group.groupField());
			}
		case RowGroupStatementRuntime.ID_GROUP_VALUE:
			var item = this._group.firstItem();
			return item ? item.getData(this._group.groupField()) : UNDEFINED;
		case RowGroupStatementRuntime.ID_ROW_COUNT:
			return this._group.descendantCount();
		}
		throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
	}
}, {
	ID_GROUP_FIELD	: 0,
	ID_FIELD_HEADER	: 1,
	ID_GROUP_COLUMN	: 2,
	ID_COLUMN_HEADER: 3,
	ID_COLUMN_FOOTER: 4,
	ID_GROUP_VALUE	: 5,
	ID_ROW_COUNT	: 6
}, function (f) {
	f.IDENTS = {
		groupfield	: f.ID_GROUP_FIELD,
		fieldheader	: f.ID_FIELD_HEADER,
		groupcolumn	: f.ID_GROUP_COLUMN,
		columnheader: f.ID_COLUMN_HEADER,
		columnfooter: f.ID_COLUMN_FOOTER,
		groupvalue	: f.ID_GROUP_VALUE,
		rowcount	: f.ID_ROW_COUNT
	};
});
var ColumnMergeRuntime = defineClass("ColumnMergeRuntime", ExpressionRuntime, {
	init: function () {
		this._super();
		this._item = null;
		this._field = -1;
		this._dataSource = null;
		this._fieldCount = 0;
	},
    setDataSource: function (value) {
        this._dataSource = value;
        this._fieldCount = value ? value.fieldCount() : 0;
    },
	setCell: function(index) {
		this._item = index.item();
		this._field = index.dataField();
	},
	setItem: function (item, field) {
		this._item = item;
		this._field = field;
	},
	isIdentifier: function(token) {
		token = token.toLowerCase();
		if (ColumnMergeRuntime.IDENTS.hasOwnProperty(token)) {
			return ColumnMergeRuntime.IDENTS[token];
		}
		return this._super(token);
	},
	evaluateIdentifier: function(idKey) {
		if (this._item) {
			switch (idKey) {
			case ColumnMergeRuntime.ID_VALUE:
				return this._item.getData(this._field);
			case ColumnMergeRuntime.ID_ROW:
				return this._item.index();
			case ColumnMergeRuntime.ID_DATA_ROW:
				return this._item.dataRow();
			case ColumnMergeRuntime.ID_CHECKED:
				return this._item.isChecked();
			case ColumnMergeRuntime.ID_GROUP:
				return this._item.parent();
			}
			throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
		} else {
			return UNDEFINED;
		}
	},
	evaluateIndexerI: function(idKey, index) {
		if (this._item) {
			if (idKey == ColumnMergeRuntime.ID_VALUE || idKey == ColumnMergeRuntime.ID_VALUES) {
				if (index < 0 || index >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field index out of bounds:" + index);
				}
				return this._item.getData(index);
			}
			throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
		} else {
			return UNDEFINED;
		}
	},
	evaluateIndexerS: function(idKey, index, capitalized) {
		if (this._item && this._dataSource) {
			if (idKey == ColumnMergeRuntime.ID_VALUE || idKey == ColumnMergeRuntime.ID_VALUES) {
				var idx = capitalized ? this._dataSource.getFieldIndexC(index) : this._dataSource.getFieldIndex(index);
				if (idx < 0 || idx >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field index out of bounds:" + index);
				}
				return this._item.getData(idx);
			}
			throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
		} else {
			return UNDEFINED;
		}
	}
}, {
	ID_ROW: 0,
	ID_DATA_ROW: 1,
	ID_CHECKED: 2,
	ID_VALUE: 3,
	ID_VALUES: 4,
	ID_GROUP: 5
}, function (f) {
	f.IDENTS = {
		row: f.ID_ROW,
		datarow: f.ID_DATA_ROW,
		checked: f.ID_CHECKED,
		value: f.ID_VALUE,
		values: f.ID_VALUES,
		group: f.ID_GROUP
	};
});
var ColumnFilterRuntime = defineClass("ColumnFilterRuntime", ExpressionRuntime, {
	init: function() {
		this._super();
		this._item = null;
		this._field = -1;
		this._dataSource = null;
		this._fieldCount = 0;
	},
	setDataSource: function(dataSource) {
		this._dataSource = dataSource;
		this._fieldCount = this._dataSource ? this._dataSource.fieldCount() : 0;
	},
	setData: function (item, field) {
		this._item = item;
		this._field = field;
	},
	isIdentifier: function(token) {
		token = token.toLowerCase();
		if (ColumnFilterRuntime.IDENTS.hasOwnProperty(token)) {
			return ColumnFilterRuntime.IDENTS[token];
		}
		return this._super(token);
	},
	evaluateIdentifier: function(idKey) {
		switch (idKey) {
		case ColumnFilterRuntime.ID_VALUE:
			return this._item.getData(this._field);
		case ColumnFilterRuntime.ID_FIELD:
			return this._field;
		case ColumnFilterRuntime.ID_MAX:
			return 0;
		case ColumnFilterRuntime.ID_MIN:
			return 0;
		case ColumnFilterRuntime.ID_MEAN:
			return 0;
		}
		throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
	},
	evaluateIndexerI: function(idKey, index) {
		if (this._item) {
			if (idKey == ColumnFilterRuntime.ID_VALUE || idKey == ColumnFilterRuntime.ID_VALUES) {
				if (index < 0 || index >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field index out of bounds:" + index);
				}
				return this._item.getData(index);
			}
			throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
		} else {
			return undefined;
		}
	},
	evaluateIndexerS: function (idKey, index, capitalized) {
		if (idKey == ColumnFilterRuntime.ID_VALUE || idKey == ColumnFilterRuntime.ID_VALUES) {
			if (this._dataSource) {
				var idx = capitalized ? this._dataSource.getFieldIndexC(index) : this._dataSource.getFieldIndex(index);
				if (idx < 0 || idx >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field is not exists:" + index);
				}
				return this._item.getData(idx);
			} else {
				return undefined;
			}
		}
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	}
}, {
	ID_VALUE: 0,
	ID_FIELD: 1,
	ID_VALUES: 2,
	ID_MAX	: 10,
	ID_MIN	: 11,
	ID_MEAN	: 12
}, function(f) {
	f.IDENTS = {
		value: f.ID_VALUE,
		field: f.ID_FIELD,
		values: f.ID_VALUES,
		min: f.ID_MAX,
		max: f.ID_MIN,
		mean: f.ID_MEAN
	};
});
var /* abstract */ SummaryExpressionRuntime = defineClass("SummaryExpressionRuntime", ExpressionRuntime, {
	init: function() {
		this._super();
	},
	isIdentifier: function(token) {
		token = token.toLowerCase();
		if (SummaryExpressionRuntime.IDENTS.hasOwnProperty(token)) {
			return SummaryExpressionRuntime.IDENTS[token];
		}
		return this._super(token);
	},
	evaluateIdentifier: function(idKey) {
		switch (idKey) {
		case SummaryExpressionRuntime.ID_COUNT:
			return this._getCount();
		case SummaryExpressionRuntime.ID_SUM:
			return this._getSum();
		case SummaryExpressionRuntime.ID_MAX:
			return this._getMax();
		case SummaryExpressionRuntime.ID_MIN:
			return this._getMin();
		case SummaryExpressionRuntime.ID_AVG:
			return this._getAvg();
		case SummaryExpressionRuntime.ID_VAR:
			return this._getVar();
		case SummaryExpressionRuntime.ID_VARP:
			return this._getVarp();
		case SummaryExpressionRuntime.ID_STDEV:
			return this._getStdev();
		case SummaryExpressionRuntime.ID_STDEVP:
			return this._getStdevp();
		}
		throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
	},
	evaluateIndexerI: function(idKey, index) {
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	},
	evaluateIndexerS: function(idKey, index, capitalized) {
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	},
	_getCount: function () {
		return NaN;
	},
	_getSum: function () {
		return NaN;
	},
	_getMax: function () {
		return NaN;
	},
	_getMin: function () {
		return NaN;
	},
	_getAvg: function () {
		return NaN;
	},
	_getVar: function () {
		return NaN;
	},
	_getVarp: function () {
		return NaN;
	},
	_getStdev: function () {
		return NaN;
	},
	_getStdevp: function () {
		return NaN;
	}
}, {
	ID_COUNT: 0,
	ID_SUM: 1,
	ID_MAX: 2,
	ID_MIN: 3,
	ID_AVG: 4,
	ID_VAR: 5,
	ID_VARP: 6,
	ID_STDEV: 7,
	ID_STDEVP: 8
}, function(f) {
	f.IDENTS = {
		count: f.ID_COUNT,
		sum: f.ID_SUM,
		max: f.ID_MAX,
		min: f.ID_MIN,
		avg: f.ID_AVG,
		"var": f.ID_VAR,
		varp: f.ID_VARP,
		stdev: f.ID_STDEV,
		stdevp: f.ID_STDEVP
	};
});
var ColumnSummaryRuntime = defineClass("ColumnSummaryRuntime", SummaryExpressionRuntime, {
	init: function() {
		this._super();
		this._grid = null;
        this._dataSource = null;
		this._column = null;
		this._summarizer = null;
	},
	destroy: function() {
		this._destroying = true;
		this._grid = null;
        this._dataSource = null;
		this._column = null;
		this._summarizer = null;
		this._super();
	},
	setColumn: function(column, summarizer) {
		this._column = column;
		this._grid = column && column.grid();
        this._dataSource = this._grid ? this._grid.dataSource() : null;
        this._fieldCount = this._dataSource ? this._dataSource.fieldCount() : 0;
		this._summarizer = this._grid ? summarizer : null;
	},
	_getCount: function () {
		return this._summarizer ? this._summarizer.getCount(this._column.dataIndex()) : 0;
	},
	_getSum: function () {
		return this._summarizer ? this._summarizer.getSum(this._column.dataIndex()) : 0;
	},
	_getMax: function () {
		return this._summarizer ? this._summarizer.getMax(this._column.dataIndex()) : NaN;
	},
	_getMin: function () {
		return this._summarizer ? this._summarizer.getMin(this._column.dataIndex()) : NaN;
	},
	_getAvg: function () {
		return this._summarizer ? this._summarizer.getAvg(this._column.dataIndex()) : NaN;
	},
	_getVar: function () {
		return this._summarizer ? this._summarizer.getVar(this._column.dataIndex()) : NaN;
	},
	_getVarp: function () {
		return this._summarizer ? this._summarizer.getVarp(this._column.dataIndex()) : NaN;
	},
	_getStdev: function () {
		return this._summarizer ? this._summarizer.getStdev(this._column.dataIndex()) : NaN;
	},
	_getStdevp: function () {
		return this._summarizer ? this._summarizer.getStdevp(this._column.dataIndex()) : NaN;
	},
    evaluateIndexerI: function (idkey, index) {
        if (this._summarizer) {
            if (index < 0 || index >= this._fieldCount) {
                throw new ExpressionEvaluationError("Data field index out of bounds: " + index);
            }
            switch(idkey) {
                case SummaryExpressionRuntime.ID_SUM:
                    return this._summarizer.getSum(index);
                case SummaryExpressionRuntime.ID_COUNT:
                    return this._summarizer.getCount(index);
                case SummaryExpressionRuntime.ID_MAX:
                    return this._summarizer.getMax(index);
                case SummaryExpressionRuntime.ID_MIN:
                    return this._summarizer.getMin(index);
                case SummaryExpressionRuntime.ID_AVG:
                    return this._summarizer.getAvg(index);
                case SummaryExpressionRuntime.ID_VAR:
                    return this._summarizer.getVar(index);
                case SummaryExpressionRuntime.ID_VARP:
                    return this._summarizer.getVarp(index);
                case SummaryExpressionRuntime.ID_STDEV:
                    return this._summarizer.getStdev(index);
                case SummaryExpressionRuntime.ID_STDEVP:
                    return this._summarizer.getStdevp(index);
            }
            throw new ExpressionEvaluationError("Invalid identifier indexer: " + idkey);
        } else {
            switch(idkey) {
                case SummaryExpressionRuntime.ID_SUM:
                case SummaryExpressionRuntime.ID_COUNT:
                    return 0;
                case SummaryExpressionRuntime.ID_MAX:
                case SummaryExpressionRuntime.ID_MIN:
                case SummaryExpressionRuntime.ID_AVG:
                case SummaryExpressionRuntime.ID_VAR:
                case SummaryExpressionRuntime.ID_VARP:
                case SummaryExpressionRuntime.ID_STDEV:
                case SummaryExpressionRuntime.ID_STDEVP:
                    return NaN;
            }
            return undefined;
        }
    },
    evaluateIndexerS: function (idkey, index, capitalized) {
        if (this._summarizer && this._dataSource) {
            var idx = capitalized ? this._dataSource.getFieldIndexC(index) : this._dataSource.getFieldIndex(index);
            if (idx < 0 || idx >= this._fieldCount) {
                throw new ExpressionEvaluationError("Data field index out of bounds: " + idx);
            }
            switch(idkey) {
                case SummaryExpressionRuntime.ID_SUM:
                    return this._summarizer.getSum(idx);
                case SummaryExpressionRuntime.ID_COUNT:
                    return this._summarizer.getCount(idx);
                case SummaryExpressionRuntime.ID_MAX:
                    return this._summarizer.getMax(idx);
                case SummaryExpressionRuntime.ID_MIN:
                    return this._summarizer.getMin(idx);
                case SummaryExpressionRuntime.ID_AVG:
                    return this._summarizer.getAvg(idx);
                case SummaryExpressionRuntime.ID_VAR:
                    return this._summarizer.getVar(idx);
                case SummaryExpressionRuntime.ID_VARP:
                    return this._summarizer.getVarp(idx);
                case SummaryExpressionRuntime.ID_STDEV:
                    return this._summarizer.getStdev(idx);
                case SummaryExpressionRuntime.ID_STDEVP:
                    return this._summarizer.getStdevp(idx);
            }
            throw new ExpressionEvaluationError("Invalid identifier indexer: " + idkey);
        } else {
            switch(idkey) {
                case SummaryExpressionRuntime.ID_SUM:
                case SummaryExpressionRuntime.ID_COUNT:
                    return 0;
                case SummaryExpressionRuntime.ID_MAX:
                case SummaryExpressionRuntime.ID_MIN:
                case SummaryExpressionRuntime.ID_AVG:
                case SummaryExpressionRuntime.ID_VAR:
                case SummaryExpressionRuntime.ID_VARP:
                case SummaryExpressionRuntime.ID_STDEV:
                case SummaryExpressionRuntime.ID_STDEVP:
                    return NaN;
            }
            return undefined;
        }
    }
});
var RowGroupSummaryRuntime = defineClass("RowGroupSummaryRuntime", ColumnSummaryRuntime, {
	init: function() {
		this._super();
		this._item = null;
	},
	item: null,
	setItem: function (value) {
		this._item = value;
	},
	_getCount: function() {
		return this._item.getNumber(this._column.dataIndex());
	},
	_getSum: function() {
		return this._item.getSum(this._column.dataIndex());
	},
	_getMax: function() {
		return this._item.getMax(this._column.dataIndex());
	},
	_getMin: function() {
		return this._item.getMin(this._column.dataIndex());
	},
	_getAvg: function() {
		return this._item.getAvg(this._column.dataIndex());
	},
	_getVar: function() {
		return this._item.getVar(this._column.dataIndex(), 1);
	},
	_getVarp: function() {
		return this._item.getVar(this._column.dataIndex(), 0);
	},
	_getStdev: function() {
		return this._item.getStdev(this._column.dataIndex(), 1);
	},
	_getStdevp: function() {
		return this._item.getStdev(this._column.dataIndex(), 0);
	}
});
var CheckableExpressionRuntime = defineClass("CheckableExpressionRuntime", DataRowExpressionRuntime, {
	init : function() {
		this._super();
	}
});
var DataCellRendererRuntime = defineClass("DataCellRendererRuntime", ExpressionRuntime, {
	init: function () {
		this._super();
		this._target = null; // DataCellElement
		this._item = null; // GridItem
		this._dataSource = null;
		this._fieldCount = 0;
	},
	setDataSource: function (value) {
		this._dataSource = value;
		this._fieldCount = value ? value.fieldCount() : 0;
	},
	setTarget: function (value) {
		this._target = value;
		this._item = value.index().item();
	},
	isIdentifier: function (token) {
		token = token.toLowerCase();
		if (DataCellRendererRuntime.IDENTS.hasOwnProperty(token)) {
			return DataCellRendererRuntime.IDENTS[token];
		}
		return this._super(token);
	},
	evaluateIdentifier: function (idKey) {
		assert(this._target != null, "target is null");
		switch (idKey) {
			case DataCellRendererRuntime.ID_VALUE:
				return this._target.value();
			case DataCellRendererRuntime.ID_ROW:
				return this._target.index().I();
			case DataCellRendererRuntime.ID_DATA_ROW:
				return this._target.index().dataRow();
			case DataCellRendererRuntime.ID_INDEX:
				return this._target.index().column().index();
			case DataCellRendererRuntime.ID_FIELD:
				return this._target.index().dataField();
			case DataCellRendererRuntime.ID_CHECKED:
				return this._item && this._item.isChecked();
			case DataCellRendererRuntime.ID_STATE:
				if (this._item) {
					switch (this._item.rowState()) {
						case RowState.CREATED:
							return "c";
						case RowState.UPDATED:
							return "u";
						case RowState.DELETED:
							return "d";
						case RowState.CREATE_AND_DELETED:
							return "x";
					}
				}
				return UNDEFINED;
			case DataCellRendererRuntime.ID_TAG:
				return this._target.index().C().tag();
			case DataCellRendererRuntime.ID_BASE:
				var idx = this._target.index().dataColumn().baseIndex();
				return idx >= 0 ? this._item.getData(idx) : UNDEFINED;
			case DataCellRendererRuntime.ID_COUNT:
				return this._target.index().childCount();
			case DataCellRendererRuntime.ID_DCOUNT:
				return this._target.index().descendantCount();
		}
		if ($_debug) debugger;
		throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
	},
	evaluateIndexerI: function (idKey, index) {
		if (idKey == DataCellRendererRuntime.ID_VALUE) { // for series
			var vals = this._target.value();
			if (_isArray(vals) && index < vals.length) {
				return vals[index];
			} else {
				throw new ExpressionEvaluationError("Value index out of bounds:" + index);
			}
		} else if (idKey == DataCellRendererRuntime.ID_VALUES) {
			if (this._dataSource) {
				if (index < 0 || index >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field index out of bounds:" + index);
				}
				return this._item.getData(index);
			} else {
				return undefined;
			}
		}
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	},
	evaluateIndexerS: function (idKey, index, capitalized) {
		if (idKey == DataCellRendererRuntime.ID_VALUES) {
			if (this._dataSource) {
				var idx = capitalized ? this._dataSource.getFieldIndexC(index) : this._dataSource.getFieldIndex(index);
				if (idx < 0 || idx >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field is not exits:" + index);
				}
				return this._item.getData(idx);
			} else {
				return undefined;
			}
		}
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	}
}, {
	ID_VALUE: 0,
	ID_ROW: 1,
	ID_DATA_ROW: 2,
	ID_INDEX: 3,
	ID_FIELD: 4,
	ID_CHECKED: 5,
	ID_STATE: 6,
	ID_TAG: 7,
	ID_BASE: 8,
	ID_VALUES: 9,
	ID_COUNT: 10,
	ID_DCOUNT: 11
}, function (f) {
	f.IDENTS = {
		value: f.ID_VALUE,
		row: f.ID_ROW,
		datarow: f.ID_DATA_ROW,
		index: f.ID_INDEX,
		field: f.ID_FIELD,
		checked: f.ID_CHECKED,
		state: f.ID_STATE,
		tag: f.ID_TAG,
		base: f.ID_BASE,
		values: f.ID_VALUES,
		count: f.ID_COUNT,
		dcount: f.ID_DCOUNT
	};
});
var LinkCellRendererRuntime = defineClass("LinkCellRendererRuntime", ExpressionRuntime, {
	init : function() {
		this._super();
		this._item = null;
		this._dataSource = null;
		this._requiredFields = null;
	},
	setIndex: function (index) {
		this._item = index.item();
		this._dataSource = index.grid().dataSource();
	},
	setRequiredFields: function (value) {
		this._requiredFields = value;
	},
	isIdentifier: function (token) {
		if (this._dataSource) {
			var fld = this._dataSource.getFieldIndex(token);
			if (fld >= 0) {
				return fld;
			}
		}
		return this._super(token);
	},
	evaluateIdentifier: function (idKey) {
		if (idKey >= 0) {
			var cnt, f;
			var v = this._item.getData(idKey);
			var field = this._dataSource.getField(idKey);
			if (field.isEmpty(v) && this._requiredFields && (cnt = this._requiredFields.length) > 0) {
				var fld = this._dataSource.getFieldName(idKey);
				if (fld) {
					for (var i = 0; i < cnt; i++) {
						f = this._requiredFields[i];
						if (f == fld) {
							throw new Error("Required field error: " + fld);
						}
					}
				}
			}
			return v;
		}
		this._invalidIdentError(idKey);
	}
});
var CalculateExpressionRuntime = defineClass("CalculateExpressionRuntime", ExpressionRuntime, {
	init: function () {
		this._super();
		this._values = null;
		this._fields = null;
		this._fieldCount = 0;
	},
	setValues: function (values, fields) {
		this._values = values;
		this._fields = fields;
		this._fieldCount = fields ? fields.length : 0;
	},
	isIdentifier: function (token) {
		token = token.toLowerCase();
		if (CalculateExpressionRuntime.IDENTS.hasOwnProperty(token)) {
			return CalculateExpressionRuntime.IDENTS[token];
		}
		return this._super(token);
	},
	evaluateIdentifier: function (idKey) {
		throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
	},
	evaluateIndexerI: function (idKey, index) {
		if (this._values) {
			if (idKey == CalculateExpressionRuntime.ID_VALUE || idKey == CalculateExpressionRuntime.ID_VALUES) {
				if (index < 0 || index >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field index out of bounds:" + index);
				}
				return this._values[index];
			}
			throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
		} else {
			return undefined;
		}
	},
	evaluateIndexerS: function (idKey, index, capitalized) {
		if (idKey == CalculateExpressionRuntime.ID_VALUE || idKey == CalculateExpressionRuntime.ID_VALUES) {
			if (this._values && this._fields) {
				var idx = this._fields.indexOf(index);
				if (idx < 0 || idx >= this._fieldCount) {
					throw new ExpressionEvaluationError("Data field is not exists:" + index);
				}
				return this._values[idx];
			} else {
				return undefined;
			}
		}
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	}
}, {
	ID_VALUE: 0,
	ID_VALUES: 1
}, function (f) {
	f.IDENTS = {
		value: f.ID_VALUE,
		values: f.ID_VALUES
	};
});
var EditorTitleExpressionRuntime = defineClass("EditorTitleExpressionRuntime", ExpressionRuntime, {
	init: function () {
		this._super();
		this._value = null;
		this._cell = null;
	},
	setValue: function (value) {
		this._value = value;
	},
	setCell: function(value) {
		this._cell = value;
	},
	isIdentifier: function (token) {
		token = token.toLowerCase();
		if (EditorTitleExpressionRuntime.IDENTS.hasOwnProperty(token)) {
			return EditorTitleExpressionRuntime.IDENTS[token];
		}
		return this._super(token);
	},
	evaluateIdentifier : function(idKey) { 
		switch (idKey) {
			case EditorTitleExpressionRuntime.ID_VALUE:
				return this._value;
			case EditorTitleExpressionRuntime.ID_ROW:
				return String(this._cell.index().I() + 1);
			case EditorTitleExpressionRuntime.ID_COLUMN_HEADER:
				column = this._cell && this._cell.index().column();
				return column && column.header && column.header().text() ? column.header().text() : column.displayText();
		}
	}
}, {
	ID_VALUE : 0,
	ID_ROW : 1,
	ID_COLUMN_HEADER: 2
}, function (f) {
	f.IDENTS = {
		value : f.ID_VALUE,
		row : f.ID_ROW,
		columnheader : f.ID_COLUMN_HEADER
	}
});