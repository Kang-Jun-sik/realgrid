ValidationLevel.$_levels = {
	error: 1,
	warning: 2,
	info: 3,
	ignore: 4
};
ValidationLevel.compare = function (level1, level2) {
	return ValidationLevel.$_levels[level1] - ValidationLevel.$_levels[level2];
};
var ValidationError = function (level, message, column, userMessage) {
	this.level = level;
	this.message = message;
	this.column = column;
	this.userMessage = userMessage;
	AbortError.call(this, message);
};
ValidationError.prototype = new AbortError();
ValidationError.prototype.toString = function () {
	return "Validation failed[" + this.level + "]: " + this.message;
};
var EditValidation = defineClass("EditValidation", null, {
	init: function (name) {
		this._super();
		this._name = name;
	},
	name: null,
	active: true,
	mode: ValidationMode.ALWAYS,
	level: ValidationLevel.ERROR,
	criteria: null,
	message: null,
	description: null,
	setCriteria: function (value) {
		if (value != this._criteria) {
			this._criteria = value;
			if (value) {
				this._exprNode = ExpressionParser.Default.parse(value, EditValidation.CAPITAL_INDEXERS);
			} else {
				this._exprNode = null;
			}
		}
	},
	validate: function (runtime) {
		if (this._exprNode && !this._exprNode.evaluate(runtime)) {
			var s = this._message || this._description || this._name || this._criteria;
			throw new ValidationError(this._level, s, null, this._message);
		}
	}
}, {
	CAPITAL_INDEXERS: ["value", "values"]
});
var EditValidationCollection = defineClass("EditValidationCollection", null, {
	init: function() {
		this._super();
		this._items = [];
	},
	count: function () {
		return this._items.length;
	},
	items_: function () {
		return this._items.slice();
	},
	setItems: function (value) {
		this.assign(value);
	},
	clear: function () {
		this._items = [];
	},
	addAll: function (items) {
		if (items && items.length > 0) {
			for (var i = 0, cnt = items.length; i < cnt; i++) {
				this._items.push(items[i]);
			}
		}
	},
	assign: function (source) {
		if (source !== this) {
			this.clear();
			if (source) {
				if (!_isArray(source)) {
					source = [source];
				}
				for (var i = 0, cnt = source.length; i < cnt; i++) {
					var ev = new EditValidation();
					ev.assign(source[i]);
					this._items.push(ev);
				}
			}
		}
	},
	validate: function (mode, runtime, checkLevel, commitLevel) {
		for (var i = 0; i < this._items.length; i++) {
			var item = this._items[i];
			if (item.isActive() && (item.mode() == mode || item.mode() == ValidationMode.ALWAYS)) {
				try {
					item.validate(runtime);
				} catch (err) {
					if (!checkLevel || (ValidationLevel.compare(item.level(), commitLevel) < 0)) {
						if (err instanceof ValidationError) {
							err.level = item.level();
							throw err;
						} else {
							throw new ValidationError(item.level(), err);
						}
					}
				}
			}
		}
	}
});
var DataRowValidationRuntime = defineClass("DataRowValidationRuntime", ExpressionRuntime, {
	init: function() {
		this._super();
		this._item = null;
		this._dataSource = null;
		this._fieldCount = null;
	},
	item: null,
	setItem: function (value) {
		this._item = value;
		this._dataSource = this._item.dataSource();
		this._fieldCount = this._dataSource ? this._dataSource.fieldCount() : 0;
	},
	isIdentifier: function (token) {
		token = token.toLowerCase();
		if (DataRowValidationRuntime.IDENTS.hasOwnProperty(token)) {
			var v = DataRowValidationRuntime.IDENTS[token];
			return v;
		} 
		return this._super(token);
	},
	evaluateIdentifier: function (idKey) {
		switch (idKey) {
			case DataRowValidationRuntime.ID_ROW:
				return this._item.index();
			case DataRowValidationRuntime.ID_DATA_ROW:
				return this._item.dataRow();
			case DataRowValidationRuntime.ID_CHECKED:
				return this._item.isChecked();
		}
		throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
	},
	evaluateIndexerI: function (idKey, index) {
		if (index < 0 || index >= this._fieldCount) {
			throw new ExpressionEvaluationError("Data field index out of bounds:" + index);
		}
		switch (idKey) {
		case DataRowValidationRuntime.ID_VALUE:
		case DataRowValidationRuntime.ID_VALUES:
			return this._item.getData(index);
		}
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	},
	evaluateIndexerS: function (idKey, index, capitalized) {
		var idx = capitalized ? this._dataSource.getFieldIndexC(index) : this._dataSource.getFieldIndex(index);
		if (idx < 0 || idx >= this._fieldCount) {
			throw new ExpressionEvaluationError("Data field is not exists:" + index);
		}
		switch (idKey) {
			case DataRowValidationRuntime.ID_VALUE:
			case DataRowValidationRuntime.ID_VALUES:
				return this._item.getData(idx);
		}
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	}
}, {
	ID_ROW: 0,
	ID_DATA_ROW: 1,
	ID_CHECKED: 2,
	ID_VALUE: 3,
	ID_VALUES: 4
}, function (f) {
	f.IDENTS = {
		row: f.ID_ROW,
		datarow: f.ID_DATA_ROW,
		checekd: f.ID_CHECKED,
		value: f.ID_VALUE,
		values: f.ID_VALUES
	};
});
var DataCellValidationRuntime = defineClass("DataCellValidationRuntime", ExpressionRuntime, {
	init: function() {
		this._super();
		this._index = null;
		this._value = null;
	},
	setIndex: function (value) {
		this._index = value;
		this._value = this._index.item().getData(this._index.column().dataIndex());
	},
	isIdentifier: function (token) {
		token = token.toLowerCase();
		if (DataCellValidationRuntime.IDENTS.hasOwnProperty(token)) {
			var v = DataCellValidationRuntime.IDENTS[token];
			return v;
		} 
		return this._super(token);
	},
	evaluateIdentifier: function (idKey) {
		switch (idKey) {
			case DataCellValidationRuntime.ID_VALUE:
				return this._value;
			case DataCellValidationRuntime.ID_ROW:
				return this._index.I();
			case DataCellValidationRuntime.ID_DATA_ROW:
				return this._index.item().dataRow();
			case DataCellValidationRuntime.ID_INDEX:
				return this._index.column().index();
			case DataCellValidationRuntime.ID_FIELD:
				return this._index.column().dataIndex();
			case DataCellValidationRuntime.ID_CHECKED:
				var item = this._index.item();
				return item ? item.isChecked() : false;
			case DataCellValidationRuntime.ID_TAG:
				return this._index.column().tag();
			case DataCellValidationRuntime.ID_BASE:
				var idx = this._index.dataColumn().baseIndex();
				return idx >= 0 ? this._index.item().getData(idx) : UNDEFINED;
		}
		throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
	},
	evaluateIndexerI: function (idKey, index) {
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	},
	evaluateIndexerS: function (idKey, index, capitalized) {
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	}
}, {
	ID_VALUE: 0,
	ID_ROW: 1,
	ID_DATA_ROW: 2,
	ID_INDEX: 3,
	ID_FIELD: 4,
	ID_CHECKED: 5,
	ID_TAG: 6,
	ID_BASE: 7
}, function (f) {
	f.IDENTS = {
		value: f.ID_VALUE,
		row: f.ID_VAID_ROWLUE,
		datarow: f.ID_DATA_ROW,
		index: f.ID_INDEX,
		field: f.ID_FIELD,
		checked: f.ID_CHECKED,
		tag: f.ID_TAG,
		base: f.ID_BASE
	};
});
var ValidationManager = defineClass("ValidationManager", null, {
	init: function(owner) {
		this._super();
		this._owner = owner;
		this._userValidations = false;
		this._validateCellList = {};		
	},
	owner: function () {
		return this._owner;
	},
	hasRowValidation: function () {
		return this._owner.validations() && this._owner.validations().count() > 0;
	},
	validateCell: function (index/*CellIndex*/, inserting) {
		this.$_validateCell(index, inserting, true, this._owner.editOptions().commitLevel());
	},
	validateRow: function (item/*GridItem*/, inserting, rowOnly) {
		var level/*ValidationLevel*/ = this._owner.editOptions().commitLevel();
		if (!rowOnly) {
			var columns/*[DataColumn]*/ = this._owner.getDataColumns();
			for (var i = 0, cnt = columns.length; i < cnt; i++) {
				var column = columns[i];
				var index = CellIndex.temp(this._owner, item.index(), column);
				this.$_validateCell(index, inserting, true, level);
			}
		}
		var validations/*EditValidationCollection*/ = this._owner.validations();
		if (validations && validations.count() > 0) {
			var runtime/*DataRowValidationRuntime*/ = this._owner.rowValidationRuntime();
			runtime.setItem(item);
			validations.validate(inserting ? ValidationMode.INSERT : ValidationMode.UPDATE, runtime, false, level);
		}
	},
	$_validateCell: function (index, inserting, levelCheck, level) {
		var column = _cast(index.dataColumn(), DataColumn);
		if (column) {
			var value = index.item().getData(column.dataIndex());
			if (column.isRequired()) {
				var grid = column.grid();
				var fld = grid && grid.dataSource() && grid.dataSource().getField(column.dataIndex());
				if (fld && fld.isEmpty(value)) {
					var level = column.requiredLevel() || ValidationLevel.ERROR;
					var msg = column.requiredMessage() || "Value is required: " + column.fieldName();
					throw new ValidationError(level, msg, column, column.requiredMessage());
				}
			}
			var validations = column.validations();
			if (validations && validations.count() > 0) {
				var runtime/*DataCellValidationRuntime*/ = this._owner.columnValidationRuntime();
				runtime.setIndex(index);
				try {
					validations.validate(inserting ? ValidationMode.INSERT : ValidationMode.UPDATE, runtime, levelCheck, level);
					this.$_clearInvalidateCell(index);
				} catch (err) {
					if (err instanceof ValidationError) {
						err.column = column;
					}
					throw err;
				}
			}
		}
	},
	$_addInvalidateCell: function(index, err) {
		var dataId = index.dataId && index.dataId();
		var dataIndex = index.dataColumn && index.dataColumn().dataIndex();
		if (dataId == undefined || dataIndex <= -1) {
			return;
		};
		var validateList = this._validateCellList;
		var row = validateList[dataId] ? validateList[dataId] : (validateList[dataId] = {});
		row[dataIndex] = {dataRow:index.dataRow(), message:err.message, userMessage:err.userMessage, level:err.level, column:index.dataColumn().name()}
	},
	$_clearInvalidateCell: function(index) {
		var dataId = index.dataId();
		var dataIndex = index.dataColumn().dataIndex();
		var row = this._validateCellList[dataId];
		if (row && row[dataIndex]) {
			delete row[dataIndex];
		}
	},
	$_clearInvalidateList: function() {
		this._validateCellList = {};
		this._userValidations = false;
		var grid = this._owner;
		grid.refreshView();
	},
	addInvalidateCell: function(index, err) {
		this.$_addInvalidateCell(index, err)
	},
	getInvalidCellList: function () {
		var ret = [];
		var invalidList = this._validateCellList;
		for (var r in invalidList) {
			var row = invalidList[r];
			for (var c in row) {
				var cell = row[c];
				ret.push(
					{column: cell.column, dataRow: cell.dataRow, message:cell.message, level:cell.level}
				)
			}
		}
		return ret.length > 0 ? ret : null;
	},	
	checkValidateCells: function (itemIndices) {
		var grid = this._owner;
		var columns = grid.getDataColumns();
		if (itemIndices != null) {
			itemIndices = _makeArray(itemIndices);
			for (var i = 0; i < itemIndices.length; i++) {
				var item = grid.getItem(itemIndices[i]);
				item.dataId() != null ? delete this._validateCellList[item.dataId()] : null;
			}
		} else {
			itemIndices = [];
			for (var i=0,cnt=grid.itemCount(); i < cnt; i++ ) {
				itemIndices.push(i);
			};
			this._validateCellList = {};
		}
		for (var idx = 0, rCnt = itemIndices.length;  idx < rCnt; idx++) {
			var item = grid.getItem(itemIndices[idx]);
			var dataId = item ? item.dataId() : undefined;
			if (dataId == undefined) { continue };
			for (var col = 0, cnt = columns.length; col < cnt; col++) {
				try {
					var column = columns[col];
					var dataIndex = column.dataIndex();
					var index = CellIndex.temp(grid, itemIndices[idx], column);
					this.$_validateCell(index, false, false, "ignore");
					grid._fireValidateCell(index, false, index.item().getData(dataIndex));
				} catch (err) {
					this.$_addInvalidateCell(index, err);
					this._userValidations = true;
				}
			}
		};
		grid.refreshView();
		return this.getInvalidCellList();
	}
});
