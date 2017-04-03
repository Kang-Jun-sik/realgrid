var /* @internal */ FieldSummary = function (field) {
	this.field = field;
	this.count = 0;
	this.sum = NaN;
	this.max = NaN;
	this.min = NaN;
	this.avg = NaN;
	this.vars = NaN;
};
FieldSummary.prototype.clear = function () {
	this.count = 0;
	this.sum = this.max = this.min = this.avg = this.vars = NaN;
};
var LocalDataProvider = defineClass("LocalDataProvider", DataProvider, {
	init: function () {
		DataProvider$.init.call(this);
		this._points = [];
		this._nextPoint = 0;
		this._values = [];
		this._rowIds = [];
		this._rowStates = [];
		this._orgValues = null;
		this._needRestore = false;
		this._deletedCount = 0;
		this._nextRowId = 0;
		this.calculateRuntime();
	},
	destroy: function() {
		this._destroying = true;
		this._values = null;
		this._rowIds = null;
		this._rowStates = null;
		this._points = null;
		this._orgValues = null;
		this._super();
	},
	getRowId: function (row) {
		return this._rowIds[row];
	},
	addRow: function (values) {
		var r = this.rowCount();
		return this.insertRow(this._values.length, values) ? r : -1;
	},
	rowCount: function () {
		return this._values.length;
	},
	isSummarized: function () {
		return true;
	},
	deletedCount: function () {
		return this._deletedCount;
	},
	getOptions: function () {
		return this._super();
	},
	setOptions: function (value) {
		this._super(value);
	},
	$_internalInsertField: function (index, field) {
		index = this._super(index, field);
		if (index >= 0) {
			var r, vals;
			var	rows = this._values.length;
			for (r = 0; r < rows; r++) {
				vals = this._values[r];
				vals && vals.splice(index, 0, undefined);
			}
			if (this._orgValues) {
				rows = Math.min(rows, this._orgValues.length);
				for (r = 0; r < rows; r++) {
					vals = this._orgValues[r];
					vals && vals.splice(index, 0, undefined);
				}
			}
		}
		return index;
	},
	internalClearFields: function () {
		DataProvider$.internalClearFields.call(this);
		this.$_clearRows();
	},
	hasData: function (row) {
		return row >= 0 && row < this._values.length && this._values[row] !== undefined;
	},
	setRowCount: function (newCount, fillDefaults, defaultValues, rowState) {
		if (!this._checkClientState()) return;
		fillDefaults = arguments.length > 1 ? fillDefaults : false;
        defaultValues = arguments.length > 2 ? defaultValues : null;
        rowState = arguments.length > 3 ? rowState : "none";
		var values = this._values;
		var oldCount = values.length;
		var count = Math.max(0, newCount);
		if (count == oldCount) {
			return;
		}
		var ids = this._rowIds;
		var states = this._rowStates;
		var i, j, fld, vals, flds, defaults;
		this.refreshFieldFormats();
		values.length = ids.length = states.length = count;
		if (this._orgValues && this._orgValues.length > count) {
			this._orgValues.length = count;
		}
		if (count > oldCount && (fillDefaults || defaultValues)) {
			flds = this._fields.length;
			defaults = defaultValues;
			if (!_isArray(defaults) && defaults && _isObject(defaults)) {
				defaults = this.objectToRow(defaults);
			}
			if (defaults && defaults.length < 1) {
				defaults = null;
			}
			if (fillDefaults || defaults) {
				var v;
				var defCount = defaults ? Math.min(defaults.length, flds) : 0;
				for (i = oldCount; i < count; i++) {
					vals = [];
					if (fillDefaults) {
						for (j = 0; j < flds; j++) {
							fld = this._fields[j];
							vals[j] = fld._defaultValue !== undefined ? fld._defaultValue : fld._nullValue;
						}
					}
					if (defCount > 0) {
						for (j = 0; j < defCount; j++) {
							v = defaults[j];
							if (v !== undefined) {
								vals[j] = this._fields[j].readValue(v);
							}
						}
					}
					values[i] = vals;
				}
			}
		} else if (count < oldCount && this._deletedCount > 0) {
			for (i = oldCount - 1; i >= count; i--) {
				if (states[i] == RowState.DELETED || states[i] == RowState.CREATE_AND_DELETED) {
					this._deletedCount--;
				}
				states[i] = RowState.NONE;
			}
		}
		rowState = this.isCheckStates() && rowState ? rowState : RowState.NONE;
		for (i = oldCount; i < count; i++) {
			states[i] = rowState;
			ids[i] = this._nextRowId++;
		}
		this.tags().setRowCount(count);
		this._fireRefresh();
		this._fireRowCountChanged();
	},
	$_clearRows: function () {
		this._values.length = 0;
		this._values = [];
		this._rowIds.length = 0;
		this._rowIds = [];
		this._rowStates.length = 0;
		this._rowStates = [];
		if (this._orgValues) {
			this._orgValues.length = 0;
			this._orgValues = [];
		} else {
			this._orgValues = null;
		}
		this._deletedCount = 0;
		this.tags().clearRows();
	},
	clearRows: function () {
		if (!this._checkClientState()) return;
		this.$_clearRows();
		this._fireRefresh();
		this._fireRowCountChanged();
	},
	setRows: function (rows, start, count) {
		if (!this._checkClientState()) return;
		start = arguments.length > 1 ? start : 0;
		count = arguments.length > 2 ? count : -1;
		if (count == 0) {
			return;
		}
		var t = getTimer();
		_trace(">>>>>> set rows..." + t);
		this.refreshFieldFormats();
		this.beginUpdate();
		try {
			this.$_clearRows();
			var checkSt = this.isCheckStates();
			var filters = this._filters;
			var len, end, n, r, i, row;
			if (rows && (len = rows.length) > 0 && start < len) {
				start = Math.max(0, start);
				if (count < 0) { 
					count = len;
				} else {
					count = Math.min(count, len - start);
				}
				if (filters) {
					this._values.length = this._rowIds.length = this._rowStates.length = count;
					filters.prepare(this);
					end = len;
					r = n = 0;
					for (i = start; i < end && r < count; i++) {
						row = rows[i];
						if (!_isArray(row)) {
							row = this.objectToRow(row);
						}
						if (filters.select(n++, row)) {
							this._internalSetRow(r++, row, checkSt);
						}
					}
					this._values.length = this._rowIds.length = this._rowStates.length = r;
				} else {
					end = Math.min(len, start + count);
					if (end > start) {
						this._values.length = this._rowIds.length = this._rowStates.length = end - start;
						r = 0;
						for (i = start; i < end; i++) {
							row = rows[i];
							if (!_isArray(row)) {
								row = this.objectToRow(row);
							}
							this._internalSetRow(r++, row, checkSt);
						}
					}
				}
			}
		} finally {
			this.endUpdate(false);
		}
		this.tags().setRows();
		this._fireRefresh();
		this._fireRowCountChanged();
	},
	setXmlRows: function (rows, start, count) {
		if (!this._checkClientState()) return;
		start = arguments.length > 1 ? start : 0;
		count = arguments.length > 2 ? count : -1;
		if (count == 0) return;
		rows = DataHelper.xmlToArray(this, rows, start, count);
		this.setRows(rows);
	},
	addRows: function (rows, start, count, rowEvents) {
		start = arguments.length > 1 ? start : 0;
		count = arguments.length > 2 ? count : -1;
        rowEvents = arguments.length > 3 ? rowEvents : false;
        this.insertRows(this.rowCount(), rows, start, count, rowEvents);
	},
	appendRows: function (rows, start, count, rowEvents) {
		start = arguments.length > 1 ? start : 0;
		count = arguments.length > 2 ? count : -1;
		rowEvents = arguments.length > 3 ? rowEvents : false;
		this.insertRows(this.rowCount(), rows, start, count, rowEvents);
	},
	insertRows: function (row, rows, start, count, rowEvents) {
		start = arguments.length > 2 ? start : 0;
		count = arguments.length > 3 ? count : -1;
        rowEvents = arguments.length > 4 ? rowEvents : false;
		var len;
		if (!rows || (len = rows.length) < 1) {
			return;
		}
		var i, end, r, v;
		count = (count < 0) ? len : Math.min(len, count);
		if (count == 0) {
			return;
		}
		this._checkClientState();
		if (row < 0 || row > this._values.length) {
			throw new RangeError("row is out of bounds:" + row);
		}
		this.refreshFieldFormats();

		start = Math.max(0, start);
		end = Math.min(len, start + count);
		if (rowEvents) {
			r = row;
			for (i = start; i < end; i++) {
				if (this._fireRowInserting(r)) {
					v = rows[i];
					if (!_isArray(v)) {
						v = this.objectToRow(v);
					}
					this._internalInsertRow(r, v);
					this.tags().insertRow(r);
					this._fireRowInserted(r);
					this._fireRowCountChanged();
					r++;
				}
			}
		} else {
			r = row;
			for (i = start; i < end; i++, r++) {
				v = rows[i];
				if (!isArray(v)) {
					v = this.objectToRow(v);
				}
				this._internalInsertRow(r, v);
			}
			this.tags().insertRows(row, count = end - start);
			this._fireRowsInserted(row, count);
			this._fireRowCountChanged();
		}
	},
	appendXmlRows: function (rows, start, count, rowEvents) {
		this.insertXmlRows(this.rowCount(), rows, start, count, rowEvents);
	},
	insertXmlRows: function (row, rows, start, count, rowEvents) {
		if (!this._checkClientState()) return;
		start = arguments.length > 2 ? start : 0;
		count = arguments.length > 3 ? count : -1;
		rows = DataHelper.xmlToArray(this, rows, start, count);
		this.insertRows(row, rows, start, count, rowEvents);
	},
	updateRows: function (row, rows, start, count, rowEvents) {
		this.$_updateRows(row, rows, start, count, false, rowEvents);
	},
	updateStrictRows: function (row, rows, start, count, rowEvents) {
		this.$_updateRows(row, rows, start, count, true, rowEvents);
	},
	$_updateRows: function (row, rows, start, count, strict, rowEvents) {
		if (!this._checkClientState()) return;
        start = arguments.length > 2 ? start : 0;
        count = arguments.length > 3 ? count : -1;
        rowEvents = arguments.length > 4 ? rowEvents : false;
		var len;
		if (!rows || (len = rows.length) < 1) { 
			return;
		}
		count = (count < 0) ? len : Math.min(len, count);
		if (count == 0) {
			return;
		}
		this.refreshFieldFormats();
		var i, r, end, v;
		var rowCount = this.rowCount();
		start = Math.max(0, start);
		end = Math.min(len, start + count);
		if (end <= start) {
			return;
		}
		if (rowEvents) {
			r = row;
			for (i = start; i < end; i++, r++) {
				if (r >= rowCount) {
					break;
				}
				if (this._fireRowUpdating(r)) {
					v = rows[i];
					this._internalUpdateRow(r, v, strict, true);
					this.tags().updateRow(r);
					this._fireRowUpdated(r);
				}
			}
		} else {
			var list = [];
			r = row;
			for (i = start; i < end; i++, r++) {
				if (r >= rowCount) {
					break;
				}
				if (this._rowStates[r] == RowState.NONE) {
					list.push(r);
				}
				v = rows[i];
				this._internalUpdateRow(r, v, strict, false);
			}
			if (list.length > 0) {
				this._fireRowStatesChanged(list);
			}
			this.tags().updateRows(row, count = end - start);
			this._fireRowsUpdated(row, count);
		}
	},
	updateXmlRows: function (row, rows, start, count, rowEvents) {
		if (!this._checkClientState()) return;
		rows = DataHelper.xmlToArray(this, rows, start, count);
		this.updateRows(row, rows, start, count, rowEvents);
	},
	getValue: function (row, field) {
		this._checkRowIndex(row);
		this._checkFieldIndex(field);
		var vals = this._values[row];
		return vals ? vals[field] : UNDEFINED;
	},
	setValue: function (row, field, value) {
		if (!this._checkClientState()) {
            return false;
        }
		this._checkRowIndex(row);
		this._checkFieldIndex(field);
        var fld = this._fields[field];
        var state = this._rowStates[row];
        if (!fld._updatable && (state == RowState.NONE || state == RowState.UPDATED)) {
            return false;
        }
		var vals = this._values[row];
		var newVal = fld.readValue(value);
		if (vals && fld.equalValues(newVal, vals[field])) {
			return false;
		}
		this.refreshFieldFormat(fld);
		var oldVals;
		var needState = this.isCheckStates() && (state == RowState.NONE || !state);
		if (!vals) {
			this._values[row] = vals = [];
		}
		if (needState && this._orgValues) {
			oldVals = vals.concat();
		}
		vals[field] = newVal;
		this.$_internalCalculateValues(vals, row);

		if (needState) {
			if (oldVals) {
				this._orgValues[row] = oldVals;
			}
			this._changeRowState(row, RowState.UPDATED, true);
		} else if (this._needRestore) {
			this.$_restoreState(row);
		}
		this.tags().setValue(row, field);
		this._fireValueChanged(row, field);
        return true;
	},
	getRow: function (row) {
		this._checkRowIndex(row);
		var vals = this._values[row];
		return vals ? vals.slice() : [];
	},
	$_getRowObject: function (row, fldCount) {
		var	data = {};
		var	vals = this._values[row];
		if (vals) {
			for (var i = 0; i < fldCount; i++) {
				var fld = this.getOrgFieldName(i);
				data[fld] = vals[i];
			}
		}
		return data;
	},
	getRowObject: function (row) {
		this._checkRowIndex(row);
		return this.$_getRowObject(row, this.fieldCount());
	},
	getRows: function (startRow, endRow) {
        startRow = arguments.length > 0 ? startRow : 0;
        endRow = arguments.length > 1 ? endRow : -1;
        var rowCount = this._values.length;
		var r1 = Math.max(0, startRow);
		var r2 = endRow < 0 ? rowCount - 1 : Math.min(rowCount - 1, endRow);
		if (r1 >= rowCount || r2 < r1) {
			return [];
		}
		var i;
		var cnt = r2 - r1 + 1;
		var rows = new Array(cnt);
		for (i = 0; i < cnt; i++) {
			rows[i] = this._values[i + r1] || [];
		}
		return rows;
	},
	getRowObjects: function (startRow, endRow) {
        startRow = arguments.length > 0 ? startRow : 0;
        endRow = arguments.length > 1 ? endRow : -1;
        var rowCount = this._values.length;
		var r1 = Math.max(0, startRow);
		var r2 = endRow < 0 ? rowCount - 1 : Math.min(rowCount - 1, endRow);
		if (r1 >= rowCount || r2 < r1) {
			return [];
		}
		var fldCount = this.fieldCount();
		var cnt = r2 - r1 + 1;
		var rows = new Array(cnt);
		for (var i = 0; i < cnt; i++) {
			rows[i] = this.$_getRowObject(i + r1, fldCount);
		}
		return rows;
	},
    getOutputObjects: function (options, startRow, endRow) {
        var rows = this.getRowObjects(startRow, endRow);
        options && this.$_createOutputRows(rows, options, startRow);
        return rows;
    },
	getOutputObject: function (options, row) {
		var r = this.getRowObject(row);
		options && this.$_createOutputRows([r], options);
		return r;
	},
	getColumn: function (field, startRow, endRow) {
		startRow = arguments.length > 1 ? startRow : 0;
		endRow = arguments.length > 2 ? endRow : -1;
		this._checkFieldIndex(field);
		var rowCount = this._values.length;
		endRow = endRow < 0 ? rowCount - 1 : Math.min(rowCount - 1, endRow);
		startRow = Math.max(0, startRow);
		if (startRow >= rowCount || endRow < startRow) {
			return null;
		}
		var values = new Array(endRow - startRow + 1);
		for (var i = startRow; i <= endRow; i++) {
			var vals = this._values[i];
			values[i - startRow] = vals && vals[field];
		}
		return values;
	},
	hasData: function (row) {
		if (row >= 0 && row < this._values.length) {
			return  this._values[row] !== UNDEFINED;
		} else {
			return false;
		}
	},
	updateRow: function (row, values) {
		return this.$_updateRow(row, values, false);
	},
	updateStrictRow: function (row, values) {
		return this.$_updateRow(row, values, true);
	},
	$_updateRow: function (row, values, strict) {
		if (!this._checkClientState()) return;
		this._checkRowIndex(row);
		this.refreshFieldFormats();
		if (values && this._fireRowUpdating(row)) {
			this._internalUpdateRow(row, values, strict, true);
			this.tags().updateRow(row);
			this._fireRowUpdated(row);
			return true;
		}
		return false;
	},
	insertRow: function (row, values) {
		if (!this._checkClientState()) return false;
		if (row < 0 || row > this._values.length) {
			throw new RangeError("row is out of bounds:" + row);
		}
		this.refreshFieldFormats();
		if (values && this._fireRowInserting(row, values)) {
			if (!isArray(values)) {
				values = this.objectToRow(values);
			}
			this._internalInsertRow(row, values);
			this.tags().insertRow(row);
			this._fireRowInserted(row);
			this._fireRowCountChanged();
			return true;
		}
		return false;
	},
	appendRow: function (values) {
		var r = this.rowCount();
		return this.insertRow(this._values.length, values) ? r : -1;
	},
	$_deleteRow: function (row) {
		if (this._fireRowRemoving(row)) {
			var state = this._rowStates[row];
			this._internalRemoveRow(row);
			if (RowState.isDeleted(state)) {
				this._deletedCount--;
			}
			this.tags().removeRow(row);
			this._fireRowRemoved(row);
			this._fireRowCountChanged();
			return true;
		}
		return false;
	},
	removeRow: function (row) {
		if (!this._checkClientState()) return;
		this._checkRowIndex(row);
		if (this._softDeleting && this._checkStates) {
			var state = this._rowStates[row];
			switch (state) {
			case RowState.CREATED:
				if (this._deleteCreated) {
					this.$_deleteRow(row);	
				} else {
					this._changeRowState(row, RowState.CREATE_AND_DELETED, true, true, true);
				}
				break;
			case RowState.DELETED:
			case RowState.CREATE_AND_DELETED:
				break;
			default:
				this._changeRowState(row, RowState.DELETED, true, true, true);
				break;
			}
			return true;
		} else {
			return this.$_deleteRow(row);
		}
	},
	removeRows: function (rows, rowEvents) {
		if (!this._checkClientState()) return;
		var i, cnt, changed, row, state,
			deleteCreated = this.isDeleteCreated();
		if (!rows || (cnt = rows.length) < 1) {
			return;
		}
		if (this._softDeleting && this._checkStates) {
			var changed;
			var stateRows = rowEvents ? null : [];
			for (i = cnt; i--;) {
				row = rows[i];
				this._checkRowIndex(row);
				changed = false;
				state = this._rowStates[row];
				switch (state) {
					case RowState.CREATED:
						if (!deleteCreated) {
							changed = this._changeRowState(row, RowState.CREATE_AND_DELETED, rowEvents, false, true);
							rows.splice(i, 1);
						}
						break;
					case RowState.DELETED:
					case RowState.CREATE_AND_DELETED:
						rows.splice(i, 1);
						break;
					default:
						changed = this._changeRowState(row, RowState.DELETED, rowEvents, false, true);
						rows.splice(i, 1);
						break;
				}
				if (stateRows && changed) {
					stateRows.push(row);
				}
			}
			if (!rowEvents) {
				if (stateRows && stateRows.length > 0) {
					this._fireRowStatesChanged(stateRows);
				}
			}
		} 
		if ((cnt = rows.length) > 0) {
			if (cnt > 1) {
				rows.sort(function (v1, v2) {
					return v1 - v2;
				});
			}
			if (rowEvents) {
				for (i = cnt; i--;) {
					row = rows[i];
					this._checkRowIndex(row);
					this.$_deleteRow(row);
				}
			} else if (this._fireRowsRemoving(rows)) {
				for (i = cnt; i--;) {
					row = rows[i];
					this._checkRowIndex(row);
					state = this._rowStates[row];
					this._internalRemoveRow(row);
					if (RowState.isDeleted(state)) {
						this._deletedCount--;
					}
				}
				this.tags().removeRows(rows);
				this._fireRowsRemoved(rows);
				this._fireRowCountChanged();
			}
		}
	},
	moveRow: function (row, newRow) {
		if (!this._checkClientState()) return;
		if (row == newRow) {
			return;
		}
		this._checkRowIndex(row);
		this._checkRowIndex(newRow);
		if (this._fireRowMoving(row, newRow)) {
			this._internalMoveRow(row, newRow);
			this.tags().moveRow(row, newRow);
			this._fireRowMoved(row, newRow);
		}
	},
	moveRows: function (row, count, newRow) {
		if (!this._checkClientState()) return;
		if (count < 1 || row == newRow) {
			return;
		}
		this._checkRowIndex(row);
		this._checkRowIndex(newRow);
		if (this._fireRowsMoving(row, count, newRow)) {
			this._internalMoveRows(row, count, newRow);
			this.tags().moveRows(row, count, newRow);
			this._fireRowsMoved(row, count, newRow);
		}
	},
	getRowState: function (row) {
		this._checkRowIndex(row);
		return this._rowStates[row] || RowState.NONE;
	},
	$_checkDeleted: function (oldState, newState) {
		if (RowState.isDeleted(newState)) {
			this._deletedCount++;
		} else if (RowState.isDeleted(oldState) && !RowState.isDeleted(newState)) {
			this._deletedCount--;
		}
	},
	setRowState: function (row, state, force) {
		if (!this._checkClientState()) return;
		this._checkRowIndex(row);
		if (this._orgValues) {
			this._changeRowStateEx(row, state, true, force);
		} else {
			this._changeRowState(row, state, true, force);
		}
	},
	setRowStates: function (rows, state, force, rowEvents) {
		if (!this._checkClientState()) return;
		var i, cnt, row, list, states, oldState;
		if (!rows || (cnt = rows.length) < 1) {
			return;
		}
		if (rowEvents) {
			for (i = 0; i < cnt; i++) {
				row = rows[i];
				this._checkRowIndex(row);
				this._changeRowStateEx(row, state, true, force);
			}
		} else {
			list = [];
			states = this._rowStates;
			for (i = 0; i < cnt; i++) {
				row = rows[i];
				this._checkRowIndex(row);
				oldState = states[row];
				if (state != oldState) {
					states[row] = state;
					list.push(row);
					this.$_checkDeleted(oldState, state);
					if (this._orgValues) {
						this.$_prepareOrgValues(row, oldState, state);
					}
				}
			}
			if (list.length > 0) {
				this._fireRowStatesChanged(list);
			}
		}
	},
	clearRowStates: function (deleteRows, rowEvents) {
		if (!this._checkClientState()) return;
        rowEvents = arguments.length > 1 ? rowEvents : false;
        var i, state;
		var states = this._rowStates;
		var rows = [];
		for (i = states.length; i--;) {
			state = states[i];
			switch (state) {
			case RowState.CREATE_AND_DELETED:
			case RowState.DELETED:
				if (deleteRows) {
					if (rowEvents) {
						this.$_deleteRow(i);
					} else {
						this._internalRemoveRow(i);
						this._deletedCount--;
					}
					rows.push(i);
				} else {
					this._changeRowState(i, RowState.NONE, rowEvents);
					this._deletedCount--;
				}
				break;
			default:
				this._changeRowState(i, RowState.NONE, rowEvents);
				break;
			}
		}
		this.$_resetOrgValues();
		if (!rowEvents) {
			if (rows.length > 0) {
				this._fireRowsRemoved(rows);
				this._fireRowCountChanged();
			}
			this._fireRowStatesCleared();
		}
	},
	getStateRows: function (state) {
		var i, cnt,	st,
			rows = [];
		if (state) {
			for (i = 0, cnt = this._rowStates.length; i < cnt; i++) {
				st = this._rowStates[i];
				if (st == state) {
					rows.push(i);
				}
			}
		}
		return rows;
	},
	getAllStateRows: function () {
		var i, cnt,	st;
		var rows = {};
		var created = rows.created = [];
		var updated = rows.updated = [];
		var deleted = rows.deleted = [];
		var cdeleted = rows.createAndDeleted = [];
		for (i = 0, cnt = this._rowStates.length; i < cnt; i++) {
			st = this._rowStates[i];
			if (st === RowState.CREATED) {
				created.push(i);
			} else if (st === RowState.UPDATED) {
				updated.push(i);
			} else if (st === RowState.DELETED) {
				deleted.push(i);
			} else if (st === RowState.CREATE_AND_DELETED) {
				cdeleted.push(i);
			}
		}
		return rows;
	},
	getRowStateCount: function (states) {
		var i, state;
		var len = states ? states.length : 0;
		var cnt = this._rowStates.length; 
		var count = 0;
		if (len && cnt) {
			if (len > 1) {
				for (i = 0; i < cnt; i++) {
					state = this._rowStates[i];
					if (states.indexOf(state) >= 0) {
						count++;
					}
				}
			} else {
				state = states[0];
				for (i = 0; i < cnt; i++) {
					if (this._rowStates[i] === state) {
						count++;
					}
				}
			}
		}
		return count;
	},
	$_restoreState: function (row) {
		var state = this._rowStates[row];
		if (state === RowState.UPDATED) {
			var orgs = this._orgValues[row];
			if (orgs) {
				var vals = this._values[row];
                var strict = this.isStrictRestore();
                for (var i = 0, cnt = this._fields.length; i < cnt; i++) {
                    var v1 = vals.length > i ? vals[i] : undefined;
                    var v2 = orgs.length > i ? orgs[i] : undefined;
                    if (strict) {
                        if (!this._fields[i].equalValues(v1, v2)) {
                            return false;
                        }
                    } else {
                        if (!this._fields[i].sameValues(v1, v2)) {
                            return false;
                        }
                    }
                }
                this._rowStates[row] = RowState.NONE;
                return true;
			}
		}
		return false;
	},
	restoreUpdatedStates: function (rows) {
		if (!this._orgValues) return;
		if (!this._checkClientState()) return;
		var i, cnt, r;
		var list = [];
		rows = typeof rows === "number" ? [rows] : rows;
		if (_isArray(rows)) {
			for (i = 0, cnt = rows.length; i < cnt; i++) {
				r = rows[i];
				if (r >= 0 && r < this._values.length) {
					if (this.$_restoreState(r)) {
						list.push(r);
					}
				}
			}
		} else {
			for (i = 0, cnt = this._values.length; i < cnt; i++) {
				if (this.$_restoreState(i)) {
					list.push(i);
				}
			}
		}
		if (list.length > 0) {
			this._fireRowStatesChanged(list);
		}
	},
	$_restoreRow: function (row) {
		var state = this._rowStates[row];
		if (state === RowState.UPDATED) {
			var orgs = this._orgValues[row];
			if (orgs) {
				var vals = this._values[row];
				for (var i = 0, cnt = Math.min(orgs.length, this._fields.length); i < cnt; i++) {
					vals[i] = orgs[i];
				}
				this._rowStates[row] = RowState.NONE;
				return true;
			}
		}
		return false;
	},
	restoreUpdatedRows: function (rows) {
		if (!this._orgValues) return;
		if (!this._checkClientState()) return;
		var i, cnt, r;
		var list = [];

        if (_isArray(rows)) {
			for (i = 0, cnt = rows.length; i < cnt; i++) {
				r = rows[i];
				if (r >= 0 && r < this._values.length) {
					if (this.$_restoreRow(r)) {
						list.push(r);
					}
				}
			}
		} else if (rows || rows == 0) {		
			r = rows;		
			if (r >= 0 && r < this._values.length) {		
				if (this.$_restoreRow(r)) {		
					list.push(r);		
				}		
			}
		} else {
			for (i = 0, cnt = this._values.length; i < cnt; i++) {
				if (this.$_restoreRow(i)) {
					list.push(i);
				}
			}
		}
		if (list.length > 0) {
			this._fireRestoreRows(list);
			this._fireRowStatesChanged(list);
		}
	},
	getUpdatedCells: function (rows) {
		var mode = this.restoreMode();
		if (!this._orgValues || !(mode == RestoreMode.AUTO || mode == RestoreMode.EXPLICIT)) return null;
		if (rows == null) {
			rows = this.getStateRows(RowState.UPDATED);
		} else if (!_isArray(rows)) {
			if (typeof rows == "number") {
				rows = [rows];
			}
		}
		if (!_isArray(rows)) {
			return null;
		}
		var ret = [];
		for (var i=0, cnt=rows.length; i<cnt; i++) {
			var row = rows[i];
			var orgs = row >= 0 && this._orgValues && row < this._orgValues.length ? this._orgValues[row] : null;
			if (orgs) {
				var vals = this._values[row];
				var strict = this.isStrictRestore();
				var updateCells = [];
                for (var j = 0, cnt = this._fields.length; j < cnt; j++) {
                    var v1 = vals.length > j ? vals[j] : undefined;
                    var v2 = orgs.length > j ? orgs[j] : undefined;
                    if (this._fields[j].isCalculated()) continue;
                    if (strict) {
                        if (!this._fields[j].equalValues(v1, v2) ) {
                            updateCells.push({
                            	fieldName:this.getOrgFieldName(j),
                            	oldValue:orgs[j],
                            	newValue:vals[j]
                            })
                        }
                    } else {
                        if (!this._fields[j].sameValues(v1, v2)) {
                            updateCells.push({
                            	fieldName:this.getOrgFieldName(j),
                            	oldValue:orgs[j],
                            	newValue:vals[j]
                            })
                        }
                    }
                }
                if (updateCells.length > 0) {
                	ret.push({	__rowId:row,
								updatedCells:updateCells
                	         })
                }
			}
		}
		return ret;
	},
	findRow: function (fields, values) {
		if (!fields || fields.length < 1 || !values || values.length < fields.length) {
			return -1;
		}
		var i, c, cnt, row, len, found, 
			flds = [],
			vals = [],
			rows = this._values;
		cnt = fields.length;
		for (i = 0; i < cnt; i++) {
			if (typeof fields[i] === "string") {
				c = this.getFieldIndex(fields[i]);
			} else {
				c = Number(fields[i]);
			}
			if (c >= 0 && c < this.fieldCount() && flds.indexOf(c) < 0) {
				flds.push(c);
				vals.push(values[i]);
			}
		}
		len = flds.length;
		for (i = 0; i < len; i++) {
			flds[i] = this._fields[flds[i]];
		}
		cnt = rows.length;
		for (i = 0; i < cnt; i++) {
			row = rows[i];
			found = true;
			for (c = 0; c < len; c++) {
				if (!flds[c].equalValues(vals[c], row[c])) {
					found = false;
					break;
				}
			}
			if (found) {
				return i;
			}
		}
		return -1;
	},
	savePoint: function (saveStates) {
		if (!this._checkClientState()) return;
		saveStates = arguments.length > 0 ? arguments : true;
		var values = this._values;
		var flds = this._fields.length;
        var i, cnt, row, rows, states;
		if (flds > 0 && values && (cnt = values.length) > 0) {
			rows = new Array(cnt);
			for (i = 0; i < cnt; i++) {
				row = values[i];
				if (row) {
					row = row.concat();
				}
				rows[i] = row;
			}
			states = saveStates ? this._rowStates.concat() : null;
			i = this._nextPoint++;
			this._points.push({
				id: i,
				data: rows,
				states: states
			});
			return i;
		}
		return -1;
	},
	rollback: function (savePoint) {
		if (!this._checkClientState()) return;
		for (var i = this._points.length - 1; i >= 0; i--) {
			var point = this._points[i];
			if (point.id == savePoint) {
				this.$_removeSavePoints(i + 1);
				this.setRows(point.data);
                var states = point.states;
				if (states) {
					this._rowStates = states.concat();
				}
				break;
			}
		}
	},
	$_removeSavePoints: function (index) {
		var points = this._points;
        var point;
		for (var i = points.length - 1; i >= index; i--) {
			point = points[i];
			point.data = null;
			points.pop();
		}
	},
	clearSavePoints: function () {
		this.$_removeSavePoints(0);
	},
	getSavePoints: function () {
		var points = [];
		for (var i = 0, cnt = this._points.length; i < cnt; i++) {
			points.push(this._points[i].id);
		}
		return points;
	},
	canUpdateRow: function (row) {
		return true;
	},
	canAppendRow: function () {
		return true;
	},
	canInsertRow: function (row) {
		return true;
	},
	canDeleteRow: function (row) {
		return true;
	},
	$_getSortedRows: function (field) {
		var compFunc;
		var rows = new Array(this._values.length);
		switch (this.getField(field).dataType()) {
			case ValueType.NUMBER:
				compFunc = this.compareNumbers;
				break;
			case ValueType.DATETIME:
				compFunc = this.compareDates;
				break;
			case ValueType.BOOLEAN:
				compFunc = this.compareBools;
				break;
			default:
				compFunc = this.compareValues;
				break;
		}
		for (var i = rows.length; i--;) {
			rows[i] = i;
		}
		this.$_sortRows(rows, field, compFunc.bind(this), 0, rows.length - 1);
		return rows;
	},
	getDistinctValues: function (field, maxCount) {
		maxCount = arguments.length > 1 ? maxCount : -1;
		this._checkFieldIndex(field);
		var values = [];
		if (maxCount < 0) {
			maxCount = this._values.length;
		}
		if (maxCount > 0) {
			var i, cnt, value;
			var isNum = this.getField(field).dataType() == ValueType.NUMBER;
			var rows = this.$_getSortedRows(field);
			var row = this._values[rows[0]];
			values.push(row ? row[field] : undefined);
			for (i = 1, cnt = rows.length; i < cnt; i++) {
				if (!this.equalValues(field, rows[i - 1], rows[i])) {
					row = this._values[rows[i]];
					value = row ? row[field] : undefined;
					if (values.indexOf(value) == -1 && (!isNum || !isNaN(value) )) {// undefined나 NaN이 중복들어가는것을 방지
						values.push(value);
					}
					if (values.length >= maxCount) {
						break;
					}
				}
			}
		}
		return values;
	},
	compareValues: function (field, row1, row2) {
		var vals1 = this._values[row1];
		var vals2 = this._values[row2];
		if (vals1 === vals2) {
			return 0;
		} else {
			var v1 = vals1 ? vals1[field] : null;
			var v2 = vals2 ? vals2[field] : null;
			if (v1 === UNDEFINED || v1 === null) {
				return (v2 === UNDEFINED || v2 === null) ? 0 : -1;
			}
			if (v2 === UNDEFINED || v2 === null) {
				return 1;
			}
			return v1 > v2 ? 1 : (v1 < v2) ? -1 : 0;
		}
	},
	compareTexts: function (field, row1, row2) {
		var vals1 = this._values[row1];
		var vals2 = this._values[row2];
		if (vals1 === vals2) {
			return 0;
		} else {
			var v1 = vals1 ? vals1[field] : null;
			var v2 = vals2 ? vals2[field] : null;
			if (v1 === UNDEFINED || v1 === null) {
				return (v2 === UNDEFINED || v2 === null) ? 0 : -1;
			}
			if (v2 === UNDEFINED || v2 === null) {
				return 1;
			}
			v1 = String(v1).toLocaleLowerCase();
			v2 = String(v2).toLocaleLowerCase();
			return v1 > v2 ? 1 : (v1 < v2) ? -1 : 0;
		}
	},
	compareNumbers: function (field, row1, row2) {
		var vals1 = this._values[row1];
		var vals2 = this._values[row2];
		if (vals1 === vals2) {
			return 0;
		} else {
			var v1 = vals1 ? vals1[field] : NaN;
			var v2 = vals2 ? vals2[field] : NaN;
			if (isNaN(v1)) {
				return (isNaN(v2)) ? 0 : -1;
			}
			if (isNaN(v2)) {
				return 1;
			}
			return v1 > v2 ? 1 : (v1 < v2) ? -1 : 0;
		}
	},
	compareDates: function (field, row1, row2) {
		var vals1 = this._values[row1];
		var vals2 = this._values[row2];
		if (vals1 === vals2) {
			return 0;
		} else {
			var v1 = vals1 ? vals1[field] : null;
			var v2 = vals2 ? vals2[field] : null;
			if (!(v1 instanceof Date)) {
				return !(v2 instanceof Date) ? 0 : -1;
			}
			if (!(v2 instanceof Date)) {
				return 1;
			}
			return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
		}
	},
	compareBools: function (field, row1, row2) {
		var vals1 = this._values[row1];
		var vals2 = this._values[row2];
		if (vals1 === vals2) {
			return 0;
		} else {
			var v1 = vals1 ? Boolean(vals1[field]) : false;
			var v2 = vals2 ? Boolean(vals2[field]) : false;
			return (v1 && !v2) ? 1 : (!v1 && v2) ? -1 : 0;
		}
	},
	summarize: function (field, calcVars) {
		if (field == null) {
			return false;
		}
		field.clear();
		var count = this.rowCount();
		if (count < 1) {
			return false;
		}
		var i,
			vals,
			v,
			n = 0,
			f = field.field,
			sum = 0,
			min = NaN,
			max = NaN;
		i = 0;
		while (i < count) {
			vals = this._values[i++];
			v = vals ? (vals[f] == null ? undefined : vals[f]) : NaN;
			if (!isNaN(v)) {
				sum = min = max = v;
				n++;
				break;
			}
		}
		while (i < count) {
			vals = this._values[i++];
			v = vals ? (vals[f] == null ? undefined : vals[f]) : NaN;
			if (!isNaN(v)) {
				sum += v;
				if (v < min) min = v;
				if (v > max) max = v;
				n++;
			}
		}
		field.count = count;
		if (n > 0) {
			field.sum = sum;
			field.min = min;
			field.max = max;
			field.avg = sum / count;
			if (calcVars) {
				var vars = 0,
					avg = field.avg;
				for (i = 0; i < count; i++) {
					vals = this._values[i];
					v = vals ? (vals[f] == null ? undefined : vals[f]) : NaN;
					if (!isNaN(v)) {
						vars += Math.pow(v - avg, 2);
					}
				}
				field.varsp = vars / count;
				field.vars = vars / (count - 1);
			} else {
				field.varsp = NaN;
				field.vars = NaN;
			}
		}
		return true;
	},
	summarizeRange: function (field, rows, calcVars) {
		if (field == null || rows == null) {
			return false;
		}
		field.clear();
		var count = rows.length;
		if (count < 1)
			return false;
		var i,
			r,
			vals,
			v,
			n = 0,
			f = field.field,
			sum = 0,
			min = NaN,
			max = NaN;
		i = 0;
		while (i < count) {
			r = rows[i++];
			vals = this._values[r];
			v = vals ? (vals[f] == null ? undefined : vals[f]) : NaN;
			if (!isNaN(v)) {
				sum = min = max = v;
				n++;
				break;
			}
		}
		while (i < count) {
			r = rows[i++];
			vals = this._values[r];
			v = vals ? (vals[f] == null ? undefined : vals[f]) : NaN;
			if (!isNaN(v)) {
				sum += v;
				if (v < min) min = v;
				if (v > max) max = v;
				n++;
			}
		}
		field.count = count;
		if (n > 0) {
			field.sum = sum;
			field.min = min;
			field.max = max;
			field.avg = sum / count;
			if (calcVars) {
				var vars = 0,
					avg = field.avg;
				for (i = 0; i < count; i++) {
					r = rows[i];
					vals = this._values[r];
					v = vals ? (vals[f] == null ? undefined : vals[f]) : NaN;
					if (!isNaN(v)) {
						vars += Math.pow(v - avg, 2);
					}
				}
				field.varsp = vars / count;
				field.vars = vars / (count - 1);
			} else {
				field.varsp = NaN;
				field.vars = NaN;
			}
		}
		return true;
	},
	_doFieldsReset: function () {
		this.$_clearRows();
		this._super();
	},
	exportToJson: function () {
	},
	exportToCsv: function () {
		var rows = this.rowCount();
		var flds = this.fieldCount();
		var s = "";
		for (var r = 0; r < rows; r++) {
			var vals = this._values[r];
			var line = "";
			if (vals) {
				for (var f = 0; f < flds; f++) {
					line += vals[f];
					if (f < flds - 1) {
						line += ",";
					}
				}
			}
			s += line;
			if (r < rows - 1) {
				s += "\r\n";
			}
		}
		return s;
	},
	exportToXml: function () {
	},
	_doCheckStatesChanged: function () {
		this.$_resetOrgValues();
	},
	_doRestoreModeChanged: function (oldMode, newMode) {
		this.$_resetOrgValues();
	},
    copyRows: function (sourceRow, count, targetRow, noStates) {
        this._checkRowIndex(sourceRow);
        var cnt = this._values.length
        count = Math.max(0, Math.min(count, cnt - sourceRow));
        if (count < 1 || targetRow > cnt) {
            return;
        }
        var rows = [];
        for (var i = 0; i < cnt; i++) {
            var values = this._values[i + sourceRow];
            var row = [];
            for (var f = 0, len = this._fields.length; f < len; f++) {
                var v = values[f];
                if (this._fields[f].dataType() == ValueType.DATE) {
                    row[f] = typeof v == Date ? new Date(v) : v;
                } else {
                    row[f] = v;
                }
            }
            rows.push(row);
        }
        var checkStates = this._checkStates;
        if (noStates) {
            this._checkStates = false;
        }
        try {
            this.insertRows(targetRow, rows);
        } finally {
            this._checkStates = checkStates;
        }
    },
	_checkRowIndex: function (row) {
		if (row < 0 || row >= this._values.length) {
			if ($_debug) debugger;
			throw new RangeError("row is out of bounds: " + row);
		}
	},
	$_resetOrgValues: function () {
		var mode = this.restoreMode();
		this._orgValues = (!this.isCheckStates() || mode == RestoreMode.NONE) ? null : [];
		this._needRestore = this._orgValues && mode == RestoreMode.AUTO;
	},
	_arrayToRow: function (values, row) {
		var c,
			cols = Math.min(values ? values.length : 0, this._fields.length),
			vals = new Array(cols);
		for (c = 0; c < cols; c++) {
			vals[c] = this._fields[c].readValue(values[c]);
		}
		this.$_internalCalculateValues(vals, row);
		return vals;
	},
	_internalInsertRow: function (row, values) {
		var vals = this._arrayToRow(values, row),
			append = row == this._values.length;
		if (append) {
			this._values.push(vals);
			this._rowIds.push(this._nextRowId++);
		} else {
			this._values.splice(row, 0, vals);
			this._rowIds.splice(row, 0, this._nextRowId++);
		}
		if (append) {
			this._rowStates.push(this.isCheckStates() ? RowState.CREATED : RowState.NONE);
		} else {
			this._rowStates.splice(row, 0, this.isCheckStates() ? RowState.CREATED : RowState.NONE);
			if (this._orgValues) {
				this._orgValues.splice(row, 0, undefined);
			}
		}
	},
	_internalSetRow: function (row, values, checkState) {
		var vals = this._arrayToRow(values, row);
		this._values[row] = vals;
		this._rowIds[row] = this._nextRowId++;
		if (this.isCheckStates()) {
			this._rowStates[row] = RowState.NONE;
		}
	},
	_xmlToRow: function (xml) {
	},
	_internalInsertXmlRow: function (row, xml, stateEvent) {
	},
	_internalSetXmlRow: function (row, xml) {
	},
	_internalUpdateRow: function (row, values, strict, stateEvent) {
		var c, v, oldVals, fld;
        var fields = this._fields;
		var isAry = _isArray(values)
		var	cnt = Math.min(fields.length, isAry ? values.length : fields.length);
		var	vals = this._values[row];
		var state = this._rowStates[row];
		var needState = this.isCheckStates() && (state == RowState.NONE || !state);
		if (!vals) {
			this._values[row] = vals = [];
		}
		if (needState && this._orgValues) {
			oldVals = vals.concat();
		}
		var changed = false;
		for (c = 0; c < cnt; c++) {
            fld = fields[c];
            if (fld._updatable || state == RowState.CREATED || state == RowState.CREATE_AND_DELETED) {
				if (isAry || values.hasOwnProperty(fld.orgFieldName())) { 
					v = isAry ? values[c] : values[fld.orgFieldName()];
					if (!strict || v !== UNDEFINED) {
						if (this._needRestore) {
							changed = changed || (strict ? !fld.equalValues(vals[c], fld.readValue(v)) : !fld.sameValues(vals[c], fld.readValue(v))); 
						} else {
							changed = true;
						}
						vals[c] = fld.readValue(v);
					}
                }
            }
		}
		if (changed)
			this.$_internalCalculateValues(vals, row);
		if (needState && changed) {
			if (oldVals) {
				this._orgValues[row] = oldVals;
			}
			this._changeRowState(row, RowState.UPDATED, stateEvent);
		} else if (this._needRestore) {
			this.$_restoreState(row);
		}
	},
	_internalUpdateXmlRow: function (row, xml, stateEvent) {
	},
	_internalRemoveRow: function (row) {
		this._values.splice(row, 1);
		this._rowIds.splice(row, 1);
		if (this._orgValues && this._orgValues.length > row) {
			this._orgValues.splice(row, 1);
		}
		this._rowStates.splice(row, 1);
	},
	_internalMoveRow: function (row, newRow) {
		var vals = this._values[row];
		var id = this._rowIds[row];
		var state = this._rowStates[row];
		this._values.splice(row, 1);
		this._rowIds.splice(row, 1);
		this._rowStates.splice(row, 1);
		this._values.splice(newRow, 0, vals);
		this._rowIds.splice(newRow, 0, id);
		this._rowStates.splice(newRow, 0, state);
		if (this._orgValues && this._orgValues.length > row) {
			vals = this._orgValues[row];
			this._orgValues.splice(row, 1);
			this._orgValues.splice(newRow, 0, vals);
		}
	},
	_internalMoveRows: function (row, count, newRow) {
		var rows = this._values.splice(row, count);
		var ids = this._rowIds.splice(row, count);
		var states = this._rowStates.splice(row, count);
		for (var i = 0, cnt = rows.length; i < cnt; i++) {
			this._values.splice(newRow + i, 0, rows[i]);
			this._rowIds.splice(newRow + i, 0, ids[i]);
			this._rowStates.splice(newRow + i, 0, states[i]);
		}
		if (this._orgValues && this._orgValues.length > row) {
			rows = this._orgValues.splice(row, count);
			this._orgValues.splice(newRow + i, 0, rows[i]);
		}
	},
	_changeRowState: function (row, newState, fireEvent, force, checkDeleted) {
		if (this.isCheckStates() || force) {
			var state = this._rowStates[row];
			newState = newState || RowState.NONE;
			if (newState != state) {
				this._rowStates[row] = newState;
				if (checkDeleted) {
					if (!RowState.isDeleted(state) && RowState.isDeleted(newState)) {
						this._deletedCount++;
					} else if (RowState.isDeleted(state) && !RowState.isDeleted(newState)) {
						this._deletedCount--;
					}
				}
				if (fireEvent) {
					this._fireRowStateChanged(row);
				}
				return true;
			}
		}
		return false;
	},
	$_prepareOrgValues: function (row, oldState, newState) {
		if (newState == RowState.UPDATED) {
			this._orgValues[row] = this._values[row] ? this._values[row].concat() : [];
		} else if (oldState == RowState.UPDATED) {
			if (this._orgValues[row]) {
				this._orgValues[row] = undefined;
			}
		}
	},
	_changeRowStateEx: function (row, newState, fireEvent, force, checkDeleted) {
		var oldState = this._rowStates[row];
		if (this._changeRowState(row, newState, false, force, checkDeleted)) {
			if (this._orgValues) {
				this.$_prepareOrgValues(row, oldState, newState);
			}

			if (fireEvent) {
				this._fireRowStateChanged(row);
			}
			return true;
		}
		return false;
	}
});