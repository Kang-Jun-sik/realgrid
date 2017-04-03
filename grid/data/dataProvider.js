var DataSourceError = defineClass("DataSourceError", null, {
	init: function (message) {
		this._super();
		this._message = message;
	},
	message: function () {
		return this._message;
	}
});
var /* @internal */ SimpleDataComparer = defineClass("SimpleDataComparer", null, {
	init: function () {
		this._super();
	},
	dataType: ValueType.TEXT,
	compare: function (field, value1, value2) {
		if (field._dataType == ValueType.NUMBER) {
			return Number(value1) - Number(value2);
		} else {
			return value1 > value2 ? 1 : (value1 < value2 ? -1 : 0);
		}
	}
});
var DataOutputOptions = defineClass("DataOutputOptions", null, {
    init: function (config) {
        this._super();
        this._datetimeWriter = null;
        this._booleanFormatter = null;
        this._numberFormatter = null;
        config && this.assign(config);
    },
    datetimeFormat: undefined,
    booleanFormat: undefined,
    numberFormat: undefined,
    datetimeCallback: null,
    booleanCallback: null,
    numberCallback: null,
    nullDateText: null,
    nullText: null,
    nanText: null,
    setDatetimeFormat: function (value) {
        if (value != this._datetimeFormat) {
            this._datetimeFormat = value;
            if (value) {
                this._datetimeWriter = new DateTimeWriter(value);
            } else {
                this._datetimeWriter = null;
            }
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
            if (value) {
                this._numberFormatter = new DecimalFormatter(value);
            } else {
                this._numberFormatter = null;
            }
        }    	
    }
});
var ClientEditingError = function () {
	this.message = ClientEditingError.message;
};
ClientEditingError.message = "Client is editing (call grid.commit() or grid.cancel() first)";

var /* abstract */ DataSource = defineClass("DataSource", EventAware, {
	init: function () {
		this._super();
		this._fields = [];
		this._calcFields = [];
		this._fieldNames = [];
		this._fieldMap = {};
		this._defComparer = new SimpleDataComparer();
		this._comparers = [];
		this._boolParser = BooleanConverter.Default;
		this._dateParser = DateTimeReader.Default;
		this._eventLock = 0;
		this._clients = [];
		this._calculateRuntime = null;
	},
	destroy: function() {
		this._destroying = true;
		try {
			this.$_internalClearFields();
			this._fieldMap = null;
		} catch (err) {

		}
		this._fields = null;
		this._calcFields = null;
		this._fieldNames = null;
		this._comparers = null;
		this._clients = null;
		this._super(true);
	},
	subTypeEnabled: true,
	subtypeEnabled: true,
	insertable: true,
	updatable: true,
	deletable: true,
	softDeleting: false,
	deleteCreated: false,
	checkStates: true,
	restoreMode: RestoreMode.NONE,
    strictRestore: false,
	booleanFormat: null,
	datetimeFormat: null,
	dateFormat: null,
	baseYear: 2000,
	amText: "AM",
	pmText: "PM",
	alertClientError: true,
	throwClientError: false,
	commitBeforeDataEdit: false,
	calculateRuntime: function () {
		if (!this._calculateRuntime) {
			this._calculateRuntime = new CalculateExpressionRuntime();
		}
		return this._calculateRuntime;
	},
	setSubTypeEnabled: function (value) {
		if (value != this._subTypeEnabled) {
			this._subTypeEnabled = value;
			for (var i = this._fields.length; i--;) {
				this._fields[i]._resetTypes();
			}
		}
	},
	subtypeEnabled_: function () {
		return this._subTypeEnabled;
	},
	setSubtypeEnabled: function (value) {
		this.setSubtypeEnabled(value);
	},
	setCheckStates: function (value) {
		if (value != this._checkStates) {
			this._checkStates = value;
			this._doCheckStatesChanged();
		}
	},
	setRestoreMode: function (value) {
		if (value != this._restoreMode) {
			var old = this._restoreMode;
			this._restoreMode = value;
			this._doRestoreModeChanged(old, value);
		}
	},
	fieldCount: function () {
		return this._fields.length;
	},
    rowCount: function () {
        throwAbstractError();
    },
	setBooleanFormat: function (value) {
		if (value != this._booleanFormat) {
			this._booleanFormat = value;
			this._boolParser = value ? new BooleanConverter(value) : BooleanConverter.Default;	
		}
	},
	$_createDateReader: function () {
		if (this._datetimeFormat) {
			this._dateParser = new DateTimeReader(this._datetimeFormat);
			this._dateParser.setAmText(this._amText);
			this._dateParser.setPmText(this._pmText);
			this._dateParser.setBaseYear(this._baseYear);
		} else {
			this._dateParser = DateTimeReader.Default;
		}
	},
	setDateFormat: function (value) {
		if (value != this._datetimeFormat) {
			this._datetimeFormat = value;
			this.$_createDateReader();
		}
	},
	setAmText: function (value) {
		if (value != this._amText) {
			this._amText = value;
			this.$_createDateReader();
		}
	},
	setPmText: function (value) {
		if (value != this._pmText) {
			this._pmText = value;
			this.$_createDateReader();
		}
	},
	
	getDatetimeFormat_: function () {
		return this._dateFormat;
	},
	setDatetimeFormat: function (value) {
		this.setDateFormat(value);
	},
	
	getField: function (index) {
		if (index >= 0 && index < this._fields.length) {
			return this._fields[index];
		}
		return null;
	},
	isLocal: function () {
		return true;
	},
	isImmediateUpdate: function () {
		return false;
	},
	isSummarized: function () {
		return false;
	},
	$_addField: function (fieldName, dataType, length) {
		if (!fieldName) {
			throw new Error("fieldName must be exists.");
		}
		if (this.getFieldIndex(fieldName) >= 0) {
			throw new Error("fieldName is already exists: " + fieldName);
		}
		var field = new DataField(fieldName, dataType, length);
		this.$_internalInsertField(this._fields.length, field);
		return field;
	},
	$_internalAddField:function(fld) {
		var field = null;
		if (typeof fld === "string") {
			field = this.$_addField(fld, ValueType.TEXT, 0);
		} else if (fld instanceof DataField) {
			field = fld.clone();
			this.$_internalInsertField(this._fields.length, field);
		} else {
			field = this.$_addField(fld.fieldName, fld.dataType || ValueType.TEXT, fld.length);
			if ("defaultValue" in fld) {
				field._defaultValue = fld.defaultValue;
			}
			if ("baseField" in fld) {
				field._baseField = fld.baseField;
			}
			if ("booleanFormat" in fld) {
				field.setBooleanFormat(fld.booleanFormat);
			}
			if ("datetimeFormat" in fld) {
				field.setDatetimeFormat(fld.datetimeFormat);
			}
			if ("amText" in fld) {
				field._amText = fld.amText;
			}
			if ("pmText" in fld) {
				field._pmText = fld.pmText;
			}
			if ("baseYear" in fld) {
				field._baseYear = fld.baseYear;				
			}
			if ("header" in fld) {
			   field._header = fld.header;
			}
		}
		return field;
	},
	addField: function (fieldInfo, resetData) {
		if (!this._checkClientState()) return;
		this.beginUpdate();
		try {
			var field = this.$_internalAddField(fieldInfo);
			field && field._resetTypes(this);
		} finally {
			this.endUpdate();
			resetData && this._doFieldsReset();
		}
		return field && $$_getFieldProxy(field);
	},
	clearFields: function () {
		if (this._fields.length > 0) {
			if (!this._checkClientState()) return;
			this.$_internalClearFields();
			this._doFieldsReset();
		}
	},
	setFields: function (fields) {
		if (!this._checkClientState()) return;
		this.beginUpdate();
		try {
			this.$_internalClearFields();
			if (_isArray(fields)) {
				var i,
					cnt = fields.length,
					field;
				for (i = 0; i < cnt; i++) {
					field = null;
					field = this.$_internalAddField(fields[i]);
					if (field) {
						field._resetTypes(this);
					}
				}
			}
		} finally {
			this.endUpdate();
			this._doFieldsReset();
		}
	},
	getFields: function () {
		return this._fields.slice();
	},
	fieldByName: function (name) {
		if (name) {
			var uppname = name.toUpperCase();
			for (var i = 0, cnt = this._fields.length; i < cnt; i++) {
				var field = this._fields[i];
				if (field.fieldName() == uppname) {
					return field;
				}
			}
		}
		return null;
	},
	getFieldNames: function () {
		var i,
			cnt = this._fields.length,
			names = [];
		for (i = 0; i < cnt; i++) {
			names.push(this._fields[i]._fieldName);
		}
		return names;
	},
	getOrgFieldNames: function () {
		var i,
			cnt = this._fields.length,
			names = [];
		for (i = 0; i < cnt; i++) {
			names.push(this._fields[i]._orgFieldName);
		}
		return names;
	},
	getFieldName: function (field) {
		this._checkFieldIndex(field);
		return this._fields[field]._fieldName;
	},
	getOrgFieldName: function (field) {
		this._checkFieldIndex(field);
		return this._fields[field]._orgFieldName;
	},
	getFieldIndex: function (fieldName) {
		if (fieldName) {
			var s = fieldName.toUpperCase();
			if (s in this._fieldMap) {
				return this._fieldMap[s];
			}
		}
		return -1;
	},
	getFieldIndexC: function (fieldName) {
		if (fieldName in this._fieldMap) {
			return this._fieldMap[fieldName];
		}
		return -1;
	},
	getBaseField: function (field) {
		if (field >= 0 && field < this._fields.length) {
			return this.getFieldIndex(this._fields[field]._baseField);
		} else {
			return -1;
		}
	},
	getFieldIndexOf: function (field) {
		return typeof field == "string" ? this.getFieldIndex(field) : parseInt(field);
	},
	getValueType: function (field) {
		return this._fields[field]._dataType;
	},
	getDefaultValue: function (field) {
		return this._fields[field]._defaultValue;
	},
	getRowState: function (row) {
		throwAbstractError();
	},
	setRowState: function (row, state, force) {
		throwAbstractError();
	},
	clearRowStates: function (deleteRows, rowEvents) {
		throwAbstractError();
	},
	getStateRows: function (state) {
		throwAbstractError();
	},
	getAllStateRows: function () {
		throwAbstractError();
	},
	setRowStates: function (rows, state, force, rowEvents) {
		throwAbstractError();
	},
	getRowStateCount: function (states) {
		throwAbstractError();
	},
	restoreUpdatedStates: function (rows) {
		throwAbstractError();
	},
	restoreUpdatedRows: function (rows) {
		throwAbstractError();
	},
	getUpdatedCells:function(rows) {
		throwAbstractError();	
	},
	beginUpdate: function () {
		this._checkClientState();
		this._eventLock++;
	},
	endUpdate: function (refresh) {
		this._checkClientState();
		refresh = arguments.length > 0 ? refresh : true;
		this._eventLock = Math.max(0, this._eventLock - 1);
		if (this._eventLock == 0 && refresh) {
			this._fireRefresh();
		}	
	},
	hasData: function (row) {
		return false;
	},
	canUpdateField: function (row, field) {
		if (field >= 0 && field < this._fields.length) {
            var fld = this._fields[field];
            if (!fld._updatable && row >= 0) {
                try {
                    var st = this.getRowState(row);
                    return !st || st == RowState.CREATED || st == RowState.CREATE_AND_DELETED;
                } catch (err) {
                    return false;
                }
            }
            return true;
        }
        return false;
	},
	getDataComparer: function (field) {
		if (field >= 0) {
			var comparer = this._comparers[field];
			if (comparer) {
				return comparer;
			} else {
				return null;
			}
		}
		// this._defComparer.dataType = field >= 0 ? this.getValueType(field) : ValueType.TEXT;
		// return this._defComparer;
	},
	setDataComparer: function (field, comparer) {
		if (comparer) {
			this._comparers[field] = comparer;
		} else {
			this._comparers[field] = undefined;
		}
	},
	canSummarize: function (field) {
		if (field >= 0 && field < this.fieldCount()) {
			var t = this.getValueType(field);
			if (t == ValueType.BOOLEAN || t == ValueType.NUMBER || ValueType.DATE) {
				return true;
			}
		}
		return false;
	},
	findRow: function (fields, values) {
		return -1;
	},
	getDistinctValues: function (field, maxCount) {
		return null;
	},
	exportToJson: function () {
	},
	exportToCsv: function () {
	},
	exportToXml: function () {
	},
	registerClient: function (client) {
		if (client && this._clients.indexOf(client) < 0) {
			this._clients.push(client);
		}
	},
	unregisterClient: function (client) {
		if (client) {
			var index = this._clients.indexOf(client);
			index >= 0 && this._clients.splice(index, 1);
		}
	},
	cancelClients: function () {
		for (var i = this._clients.length; i--;) {
			this._clients[i].cancelDataEditing();
		}
	},
	commitClients: function () {
		for (var i = this._clients.length; i--;) {
			this._clients[i].commitDataEditing();
		}
	},
	refreshClients: function () {
		this._fireRefreshClients();
	},
	_checkClientState: function () {
		var busyInfo = this.$_isClientsBusy();
		if (busyInfo.busy) {
			// 편집중인 그리드가 1개인경우 편집중인 그리드를 commit한다.
			// 2개이상인 경우 clientError발생.//
			if (this._commitBeforeDataEdit && busyInfo.cnt == 1) {
				listeners = busyInfo.client._listeners;
				var hasCommit = true;
				for (var i=0, cnt = listeners.length; i< cnt; i++) {
					var isCommit = listeners[i].commit(false,true);
					hasCommit = hasCommit && (isCommit || (listeners[i].isEditing && !listeners[i].isEditing()));
				}
				if (hasCommit) return true;
			}
			if (this._throwClientError) {
				throw new ClientEditingError();
			}
			if (this._alertClientError) {
				alert(ClientEditingError.message);
			}
			return false;
		}
		return true;
	},
	_doCheckStatesChanged: function () {
	},
	_doRestoreModeChanged: function (oldMode, newMode) {
	},
	$_isClientsBusy: function () {
		var ret = {busy:false, cnt:0, client:null}
		if (this._destroying) {
			return ret;
		};
		for (var i = this._clients.length; i--;) {
			if (this._clients[i].isDataEditing()) {
				ret.busy = true;
				ret.cnt++;
				ret.client = this._clients[i];
			}
		}
		return ret;
	},
	_checkFieldIndex: function (field) {
		if (field < 0 || field >= this._fields.length) {
			throw new Error("Invalid field index: " + field);
		}
	},
	$_internalClearFields: function () {
		this._checkClientState();
		for (var i = this._fields.length; i--;) {
			this._fields[i].$_setIndex(-1);
		}
		this._fields.splice(0, this._fields.length);
		this._calcFields.splice(0, this._calcFields.length);
		this._fieldNames.splice(0, this._fieldNames.length);
		this._fieldMap = {};
	},
	$_internalInsertField: function (index, field) {
		this._checkClientState();
		var len = this._fields.length;
		if (index < 0 || index > len) {
			if ($_debug) debugger;
			throw new Error("index is out of bounds:" + index);
		}
		if (field) {
			field._prepare(this);
			this._fields.splice(index, 0, field);
			this._fieldNames.splice(index, 0, field._fieldName);
			if (field.isCalculated())
				this._calcFields.push(field);
			field.$_setIndex(index);
			this._fieldMap[field.fieldName()] = index;
			for (var i = index + 1; i <= len; i++) {
				field = this._fields[i];
				field.$_setIndex(i);
				this._fieldMap[field.fieldName()] = i;
			}
			return index;
		}
		return -1;
	},
	$_internalCalculateValues: function (values, row) {
		var fields = this._calcFields;
		if (fields.length > 0) {
			var rvalues = [];
			for (var i = 0; i < values.length; i++) {
				rvalues[i] = this.getField(i).readValue(values[i]);
			}
			for (i = 0, len = fields.length; i < len; i++) {
				var field = fields[i];
				var fldIdx = this._fieldMap[field.fieldName()];
				values[fldIdx] = rvalues[fldIdx] = field.readValue(field._calculateValue(this._calculateRuntime, row, field.orgFieldName(), this._fieldNames, this.getOrgFieldNames(), rvalues));
			}
		}
	},
	refreshFieldFormats: function () {
		for (var i = this._fields.length; i--;) {
			this._fields[i]._refreshFormats(this);
		}
	},
	refreshFieldFormat: function (field) {
		field && field._refreshFormats(this);
	},
	_doFieldsReset: function () {
	},
    $_createOutputRows: function (rows, options, startIdx) {
		startIdx = arguments.length > 2 ? startIdx : 0;
        var fldCount = this.fieldCount();
        var rowCount = rows.length;
        var r, row;
        if (!(options instanceof DataOutputOptions)) {
            options = new DataOutputOptions(options);
        }
        var nullDate = options.nullDateText();
        var nullText = options.nullText();
        var nanText = options.nanText();
        for (var i = 0; i < fldCount; i++) {
            var field = this.getField(i);
            var prop = field.orgFieldName();
            var callback, writer;
            if (field._dataType == ValueType.DATETIME && ((callback = options._datetimeCallback) || (writer = options._datetimeWriter) || (nullDate != null && nullDate != undefined) )) {
                if (callback) {
                    for (r = 0; r < rowCount; r++) {
                        row = rows[r];
                        row[prop] = callback(r + startIdx, prop, row[prop]);
                    }
                } else {
                    for (r = 0; r < rowCount; r++) {
                        row = rows[r];
                        var d = row[prop];
                        row[prop] = d ? writer ? writer.getText(row[prop]) : d : nullDate;
                    }
                }
            } else if (field._dataType == ValueType.BOOLEAN && ((callback = options._booleanCallback) || (writer = options._booleanFormatter))) {
                if (callback) {
                    for (r = 0; r < rowCount; r++) {
                        row = rows[r];
                        row[prop] = callback(r + startIdx, prop, row[prop]);
                    }
                } else {
                    for (r = 0; r < rowCount; r++) {
                        row = rows[r];
                        row[prop] = writer.formatValue(row[prop]);
                    }
                }
            } else if (field._dataType == ValueType.NUMBER && ((callback = options._numberCallback) || (writer = options._numberFormatter) || (nanText != null && nanText != undefined))) {
                if (callback) {
                    for (r = 0; r < rowCount; r++) {
                        row = rows[r];
                        row[prop] = callback(r + startIdx, prop, row[prop]);
                    }
                } else {
                    for (r = 0; r < rowCount; r++) {
                        row = rows[r];
                        var v = row[prop];
                        row[prop] = v == null || isNaN(v) ? nanText : writer ? writer.format(v) : v;
                    }
                }
            } else if (nullText != null && nullText != undefined) {
                for (r = 0; r < rowCount; r++) {
                    row = rows[r];
                    var v = row[prop];
                    row[prop] = v == null || v == undefined ? nullText : v;
                }
            }
        }
    },
	$_sortRows: function (rows, field, compFunc, left, right) {
		var i, j, row, m, r, v, t;
		do {
			i = left;
			j = right;
			row = _int((left + right) / 2);
			m = rows[row];
			do {
				while (i <= j) {
					r = rows[i];
					v = compFunc(field, m, r);
					if (v <= 0)
						break;
					i++;
				}
				while (i <= j) {
					r = rows[j];
					v = compFunc(field, m, r);
					if (v >= 0)
						break;
					j--;
				}
				if (i <= j) {
					if (i != j) {
						t = rows[i];
						rows[i] = rows[j];
						rows[j] = t;
					}
					i++;
					j--;
				}
			} while (i <= j);
			if (left < j) {
				this.$_sortRows(rows, field, compFunc, left, j);
			}
			left = i;
		} while (left < right);
	}
});
var DataSource$ = DataSource.prototype;
var /* @abstract */ DataProvider = defineClass("DataProvider", DataSource, {
	init: function () {
		this._super();
		this._eventLock = 0;
		this._resetLock = 0;
		this._countLock = 0;
		this._tags = new DataTagCollection(this);
		this._filters = null;
		this._filterRuntime = null;
	},
	filterRuntime: function () {
		if (!this._filterRuntime) {
			this._filterRuntime = new DataFilterRuntime(this);
		}
		return this._filterRuntime;
	},
	addTag: function (tag) {
		this._tags.add(tag);
	},
	removeTag: function (tag) {
		this._tags.remove(tag);
	},
	deletedCount: function () {
		return 0;
	},
	setFilters: function (filters, filterMode) {
        filterMode = arguments.length > 0 ? filterMode : "and";
        if (!filters || filters instanceof DataFilterCollection) {
			this._filters = filters;
			if (filterMode) {
				this._filters.setFilterMode(filterMode);
			}
		} else {
			this._filters = new DataFilterCollection(this.filterRuntime(), filters, filterMode);
		}
	},
	beginUpdate: function () {
		if (!this._checkClientState()) return;
		this._eventLock++;
	},
	endUpdate: function (refresh) {
		if (!this._checkClientState()) return;
		refresh = arguments.length > 0 ? refresh : true;
		this._eventLock = Math.max(0, this._eventLock - 1);
		if (this._eventLock == 0 ) {
			if (refresh) {
				if (this._resetLock > 0) {
					this._fireReset();
				} else {
					this._fireRefresh();
				}
				if (this._countLock > 0) {
					this._fireRowCountChanged();
				}
			}
			this._resetLock = this._countLock = 0;
		}
	},
	setRowCount: function (count, fillDefaults, defaultValues, rowState) {
		throwAbstractError();
	},
	clearRows: function () {
		throwAbstractError();
	},
	setRows: function (rows, start, count) {
		throwAbstractError();
	},
	setXmlRows: function (rows, start, count) {
		throwAbstractError();
	},
	addRows: function (rows, start, count, rowEvents) {
		throwAbstractError();
	},
	insertRows: function (row, rows, start, count, rowEvents) {
		throwAbstractError();
	},
	insertXmlRows: function (row, rows, start, count, rowEvents) {
		throwAbstractError();
	},
	updateRows: function (row, rows, start, count, rowEvents) {
		throwAbstractError();
	},
	updateStrictRows: function (row, rows, start, count, rowEvents) {
		throwAbstractError();
	},
	updateXmlRows: function (row, rows, start, count, rowEvents) {
		throwAbstractError();
	},
	appendXmlRows: function (rows, start, count, rowEvents) {
		throwAbstractError();
	},
	getRows: function (startRow, endRow) {
		throwAbstractError();
	},
	getRowObjects: function (startRow, endRow) {
		throwAbstractError();
	},
    getOutputObject: function (options, startRow, endRow) {
        throwAbstractError();
    },
	getValue: function (row, fieldIndex) {
		throwAbstractError();
	},
	setValue: function (row, fieldIndex, value) {
		throwAbstractError();
	},
	getRow: function (row) {
		throwAbstractError();
	},
	getRowObject: function (row) {
		if (row < 0 || row >= this.getRowCount())
			throw new RangeError("row is out of range: " + row);
		var i,
			fld,
			v,
			cnt = this.fieldCount(),
			vals = {};
		for (i = 0; i < cnt; i++) {
			fld = this.getOrgFieldName(i);
			v = this.getValue(row, i);
			vals[fld] = v;
		}
		return vals;
	},
	getColumn: function (field, startRow, endRow) {
		throwAbstractError();
	},
	hasData: function (row) {
		throwAbstractError();
	},
	insertRow: function (row, values) {
		throwAbstractError();
	},
	appendRow: function (values) {
		throwAbstractError();
	},
	removeRow: function (row) {
		throwAbstractError();
	},
	removeRows: function (rows) {
		throwAbstractError();
	},
	updateRow: function (row, values) {
		throwAbstractError();
	},
	updateStrictRow: function (row, values) {
		throwAbstractError();
	},
	moveRow: function (row, newRow) {
		throwAbstractError();
	},
	moveRows: function (row, count, newRow) {
		throwAbstractError();
	},
	canUpdateRow: function (row) {
		return false;
	},
	canAppendRow: function () {
		return false;
	},
	canInsertRow: function (row) {
		return false;
	},
	canDeleteRow: function (row) {
		return false;
	},
	objectToRow: function (values) {
		var row = [];
		if (values) {
			var i, fld,
				cnt = this.fieldCount();
			for (i = 0; i < cnt; i++) {
				fld = this.getOrgFieldName(i);
				if (values.hasOwnProperty(fld)) {
					row[i] = values[fld];
				}
			}
		}
		return row;
	},
	equalValues: function (field, row1, row2) {
		if (row1 !== row2) {
			var fld = this._fields[field];
			var v1 = this.getValue(row1, field);
			var v2 = this.getValue(row2, field);
			return fld.equalValues(v1, v2);
		} else {
			return true;
		}
	},
    equalTexts: function (field, row1, row2) {
        if (row1 !== row2) {
            var fld = this._fields[field];
            var v1 = this.getValue(row1, field);
            var v2 = this.getValue(row2, field);
            if (v1 === undefined || v1 === null) {
                return v2 === undefined || v2 === null;
            }
            if (v2 === undefined || v2 === null) {
                return false;
            }
            return v1.toLowerCase() == v2.toLowerCase();
        } else {
            return true;
        }
    },
    sameValues: function (field, row1, row2) {
        if (row1 !== row2) {
            var fld = this._fields[field];
            var v1 = this.getValue(row1, field);
            var v2 = this.getValue(row2, field);
            return fld.sameValues(v1, v2);
        } else {
            return true;
        }
    },
	compareValues: function (field, row1, row2) {
		return 0;
	},
	compareTexts: function (field, row1, row2) {
		return 0;
	},
	compareNumbers: function (field, row1, row2) {
		return 0;
	},
	compareBools: function (field, row1, row2) {
		return 0;
	},
	summarize: function (field, calcVars) {
		return false;
	},
	summarizeRange: function (field, rows, calcVars) {
		return false;
	},
    copyRows: function (sourceRow, count, targetRow, noStates) {
    },
	_doFieldsReset: function () {
		this._fireReset();
	},
	refreshClients: function () {
		this._fireRefreshClients();
	},
	tags: function () {
		return this._tags;
	},
	isEventLocked: function () {
		return this._eventLock > 0;
	},
	filters: function () {
		return this._filters || null;
	},
	_fireDisposed: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.DISPOSED);
		} 
	},
	_fireReset: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.RESET);
		} else {
			this._resetLock++;
		}
	},
	_fireRefresh: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.REFRESH);
		}
	},
	_fireRefreshClients: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.REFRESH);
		} 
	},
	_fireRowCountChanged: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.ROW_COUNT_CHANGED);
		} else {
			this._countLock++;
		}
	},
	_fireRowInserting: function (row, values) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(DataProvider.ROW_INSERTING, row, values);
		} 
		return true; 
	},
	_fireRowInserted: function (row) {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.ROW_INSERTED, row);
			this.fireEvent(DataProvider.DATA_CHANGED);
		}
	},
	_fireRowsInserted: function (row, count) {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.ROWS_INSERTED, row, count);
			this.fireEvent(DataProvider.DATA_CHANGED);
		}
	},
	_fireRowRemoving: function (row) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(DataProvider.ROW_REMOVING, row);
		} 
		return true; 
	},
	_fireRowRemoved: function (row) {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.ROW_REMOVED, row);
			this.fireEvent(DataProvider.DATA_CHANGED);
		}
	},
	_fireRowsRemoving: function (rows) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(DataProvider.ROWS_REMOVING, rows);
		} 
		return true; 
	},
	_fireRowsRemoved: function (rows) {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.ROWS_REMOVED, rows);
			this.fireEvent(DataProvider.DATA_CHANGED);
		}
	},
	_fireRowUpdating: function (row, values) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(DataProvider.ROW_UPDATING, row, values);
		}
		return true; 
	},
	_fireRowUpdated: function (row) {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.ROW_UPDATED, row);
			this.fireEvent(DataProvider.DATA_CHANGED);
		}
	},
	_fireRowsUpdated: function (row, count) {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.ROWS_UPDATED, row, count);
			this.fireEvent(DataProvider.DATA_CHANGED);
		}
	},
	_fireRowMoving: function (row, newRow) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(DataProvider.ROW_MOVING, row, newRow);
		} 
		return true; 
	},
	_fireRowMoved: function (row, newRow) {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.ROW_MOVED, row, newRow);
		} 
	},
	_fireRowsMoving: function (row, count, newRow) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(DataProvider.ROWS_MOVING, row, count, newRow);
		} 
		return true; 
	},
	_fireRowsMoved: function (row, count, newRow) {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.ROWS_MOVED, row, count, newRow);
		} 
	},
	fireValueChanging: function (row, field, value) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(DataProvider.VALUE_CHANGING, row, field, value);
		}
		return true; 
	},
	_fireValueChanged: function (row, field) {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.VALUE_CHANGED, row, field);
			this.fireEvent(DataProvider.DATA_CHANGED);
		}
	},
	_fireRowStateChanged: function (row) {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.STATE_CHANGED, row);
		} 
	},
	_fireRowStatesChanged: function (rows) {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.STATES_CHANGED, rows);
		} 
	},
	_fireRowStatesCleared: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.STATES_CLEARED);
		} 
	},
	_fireRestoreRows: function() {
		if (this._eventLock <= 0) {
			this.fireEvent(DataProvider.RESTOREROWS);
		}
	}

});
DataProvider.DISPOSED = "onDataProvderDisposed";
DataProvider.RESET = "onDataProviderReset";
DataProvider.REFRESH = "onDataProviderRefresh";
DataProvider.REFRESH_CLIENT = "onDataProviderRefreshClient";
DataProvider.ROW_COUNT_CHANGED = "onDataProviderRowCountChanged";
DataProvider.ROW_INSERTING = "onDataProviderRowInserting";
DataProvider.ROW_INSERTED = "onDataProviderRowInserted";
DataProvider.ROWS_INSERTED = "onDataProviderRowsInserted";
DataProvider.ROW_REMOVING = "onDataProviderRowRemoving";
DataProvider.ROW_REMOVED = "onDataProviderRowRemoved";
DataProvider.ROWS_REMOVING = "onDataProviderRowsRemoving";
DataProvider.ROWS_REMOVED = "onDataProviderRowsRemoved";
DataProvider.ROW_UPDATING = "onDataProviderRowUpdating";
DataProvider.ROW_UPDATED = "onDataProviderRowUpdated";
DataProvider.ROWS_UPDATED = "onDataProviderRowsUpdated";
DataProvider.ROW_MOVING = "onDataProviderRowMoving";
DataProvider.ROW_MOVED = "onDataProviderRowMoved";
DataProvider.ROWS_MOVING = "onDataProviderRowsMoving";
DataProvider.ROWS_MOVED = "onDataProviderRowsMoved";
DataProvider.VALUE_CHANGING = "onDataProviderValueChanging";
DataProvider.VALUE_CHANGED = "onDataProviderValueChanged";
DataProvider.DATA_CHANGED = "onDataProviderDataChanged";
DataProvider.STATE_CHANGED = "onDataProviderStateChanged";
DataProvider.STATES_CHANGED = "onDataProviderStatesChanged";
DataProvider.STATES_CLEARED = "onDataProviderStatesCleared";
DataProvider.RESTOREROWS = "onDataProviderRestoreRows";

var DataProvider$ = DataProvider.prototype;
var /* @internal */ DataProviderObserver = defineClass("DataProviderObserver", null, {
	init: function () {
		this._super();
	},
	onDataProvderDisposed: function (provider) {
	},
	onDataProviderReset: function (provider) {
	},
	onDataProviderRefresh: function (provider) {
	},
	onDataProviderRefreshClient: function (provider) {
	},
	onDataProviderRowCountChanged: function (provider, newCount) {
	},
	onDataProviderRowInserting: function (provider, row, values) {
		return true;
	},
	onDataProviderRowInserted: function (provider, row) {
	},
	onDataProviderRowsInserted: function (provider, row, count) {
	},
	onDataProviderRowRemoving: function (provider, row) {
		return true;
	},
	onDataProviderRowRemoved: function (provider, row) {
	},
	onDataProviderRowsRemoving: function (provider, rows) {
		return true;
	},
	onDataProviderRowsRemoved: function (provider, rows) {
	},
	onDataProviderRowUpdating: function (provider, row, values) {
		return true;
	},
	onDataProviderRowUpdated: function (provider, row) {
	},
	onDataProviderRowsUpdated: function (provider, row, count) {
	},
	onDataProviderRowMoving: function (provider, row, newRow) {
		return true;
	},
	onDataProviderRowMoved: function (provider, row, newRow) {
	},
	onDataProviderRowsMoving: function (provider, row, count, newRow) {
		return true;
	},
	onDataProviderRowsMoved: function (provider, row, count, newRow) {
	},
	onDataProviderValueChanging: function (provider, row, field, value) {
		return true;
	},
	onDataProviderValueChanged: function (provider, row, field) {
	},
	onDataProviderStateChanged: function (provider, row) {
	},
	onDataProviderStatesChanged: function (provider, rows) {
	},
	onDataProviderStatesCleared: function (provider) {
	}
});
var /* @internal */ DataFilterRuntime = defineClass("DataFilterRuntime", ExpressionRuntime, {
	init: function () {
		this._super();
		this._provider = null;
		this._fieldCount = 0;
		this._row = -1;
		this._values = null;
	},
	prepare: function (provider) {
		this._provider = provider;
		this._fieldCount = provider ? provider.fieldCount() : 0;
	},
	setRow: function (row, values) {
		this._row = row;
		this._values = values;
	},
	isIdentifier: function (token) {
		token = token.toLowerCase();
		if (DataFilterRuntime.IDENTS.hasOwnProperty(token)) {
			return DataRowExpressionRuntime.IDENTS[token];
		} 
		return this._super(token);
	},
	evaluateIdentifier: function (idKey) {
		switch (idKey) {
		case DataRowExpressionRuntime.ID_ROW:
			return this._item.index();
		}
		if ($_debug) debugger;
		throw new ExpressionEvaluationError("Invalid identifier key: " + idKey);
	},
	evaluateIndexerI: function (idKey, index) {
		if (index < 0 || index >= this._fieldCount) {
			if ($_debug) debugger;
			throw new ExpressionEvaluationError("Data field index out of bounds:" + index);
		}
		switch (idKey) {
			case DataRowExpressionRuntime.ID_VALUE:
			case DataRowExpressionRuntime.ID_VALUES:
				return this._values[index];
		}
		if ($_debug) debugger;
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	},
	evaluateIndexerS: function (idKey, index, capitalized) {
		switch (idKey) {
			case DataRowExpressionRuntime.ID_VALUE:
			case DataRowExpressionRuntime.ID_VALUES:
				var field = this.$_getField(index, capitalized);
				return this._values[field];
		}
		if ($_debug) debugger;
		throw new ExpressionEvaluationError("Invalid identifier indexer: " + idKey);
	},
	$_getField: function (index, capitalized) {
		var	fld = capitalized ? this._provider.getFieldIndexC(index) : this._provider.getFieldIndex(index);
		if (fld < 0 || fld >= this._fieldCount) {
			if ($_debug) debugger;
			throw new ExpressionEvaluationError("Data field is not exits:" + index);
		}
		return fld;	
	}
}, {
	ID_ROW: 0,
	ID_VALUE: 1,
	ID_VALUES: 2
}, function (f) {
	f.IDENTS = {
		row: f.ID_ROW,
		value: f.ID_VALUE,
		values: f.ID_VALUES
	};
});
var DataFilter = defineClass("DataFilter", null, {
	init: function (runtime, criteria) {
		this._super();
		this._runtime = runtime;
		this._exproNode = null;
		this._active = false;
		this.setCriteria(criteria);
	},
	criteria: null,
	active: true,
	setCriteria: function (value) {
		if (value != this._criteria) {
			this._criteria = value;
			if (value) {
				this._exprNode = ExpressionParser.Default.parse(value, DataFilter.CAPITAL_INDEXERS);
			} else {
				this._exprNode = null;
			}
		}
	},
	select: function (row, values) {
		if (this._exprNode) {
			this._runtime.setRow(row, values);
			return this._exprNode.evaluate(this._runtime);
		} else {
			return true;
		}
	}
}, {
	CAPITAL_INDEXERS: ["value", "values", "len"]
});
var DataFilterCollection = defineClass("DataFilterCollection", null, {
	init: function(runtime, source, filterMode) {
		this._super();
		this._runtime = runtime;
		this._isOr = false;
		this.load(source);
		if (filterMode) {
			this.setFilterMode(filterMode);
		}
	},
	filterMode: "and",
	setFilterMode: function (value) {
		var s = value ? value.toLocaleLowerCase() : value;
		if (s != this._filterMode) {
			this._filterMode = s;
			this._isOr = this._filterMode == DataFilterCollection.FILTER_OR;
		}
	},
	load: function (source) {
		if (!_isArray(source) && source) {
			source = [source];
		}
		this._filters = [];
		if (source) {
			for (var i = 0, cnt = source.length; i < cnt; i++) {
				var filter = null;
				var f = source[i];
				if (f) {
					if (typeof f === "string") {
						filter = new DataFilter(this._runtime, f);
					} else if (f.criteria) {
						filter = new DataFilter(this._runtime, f.criteria);
					}
				}
				if (filter) {
					this._filters.push(filter);
				}
			}
		}
	},
	prepare: function (provider) {
		this._runtime.prepare(provider);
	},
	select: function(row, values) {
		var i,
			filters = this._filters,
			cnt = filters.length;
		if (this._isOr) {
			for (i = 0; i < cnt; i++) {
				if (filters[i].select(row, values) == true) {
					return true;
				}
			}
			return false;
		} else {
			for (i = 0; i < cnt; i++) {
				if (filters[i].select(row, values) == false) {
					return false;
				}
			}
			return true;
		}
	}
}, {
	FILTER_AND: "and",
	FILTER_OR: "or"
});
