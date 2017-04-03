var DummyEditItem = defineClass("DummyEditItem", GridRow, {
	init: function (provider, target/*GridItem*/, index, dataRow, state/*ItemState*/) {
		this._super(dataRow);
		this._target = target;
		provider.attachItem(this);
		this._index = index;
		this._state = state;
		this._values = [];
		this._displayLevel = target ? target.displayLevel() : 0;
        this._started = false;
        this._checkDiff = false;
        this._strictDiff = false;
	},
    values: null,
    isResizable: function () {
    	return false;
    },
	values_: function () {
	},
	setValues: function (vals) {
	},
	beginEdit: function (checkDiff, strictDiff) {
	},
	setValue: function (fieldIndex, value) {
	},
	itemState: function () {
		return this._state;
	},
	getData: function (field) {
		return null;
	},
	setData: function (field, value) {
	},
	getRowData: function ()  {
		return null;
	},
	getRowObject: function () {
		return null;
	},
	_clearDisplayLevels: function () {
		var i;
		var cnt = this._rows.length;
		for (i = 0; i < cnt; i++) {
			this._rows[i]._displayLevel = -1;
		}
	}
});
var EditItem = defineClass("EditItem", GridRow, {
	init: function (provider, target/*GridItem*/, index, dataRow, state/*ItemState*/) {
		this._super(dataRow);
		this._target = target;
		provider.attachItem(this);
		this._index = index;
		this._state = state;
		this._values = [];
		this._displayLevel = target ? target.displayLevel() : 0;
        this._started = false;
        this._checkDiff = false;
        this._strictDiff = false;
	},
    values: null,
    isResizable: function () {
    	return false;
    },
	values_: function () {
		return this._values.concat();
	},
	setValues: function (vals) {
		var i, f, fld, oldValue, newValue,
			provider = this.provider(),
			ds = this.dataSource(),
			cnt = ds.fieldCount();
		if (_isArray(vals)) {
			cnt = Math.min(cnt, vals.length);
			for (i = 0; i < cnt; i++) {
				fld = ds.getField(i);
				oldValue = this._values[i];
				newValue = fld.readValue(vals[i]);
				this._values[i] = newValue;
				if (this._started && !fld.equalValues(oldValue, newValue)) {
					provider._editItemCellUpdated(this, i, oldValue, newValue);
				}
			}
		} else if (vals) {
			for (i = 0; i < cnt; i++) {
				f = ds.getOrgFieldName(i);
				if (vals.hasOwnProperty(f)) {
					fld = ds.getField(i);
					oldValue = this._values[i];
					newValue = fld.readValue(vals[f]);
					this._values[i] = newValue;
					if (this._started && !fld.equalValues(oldValue, newValue)) {
						provider._editItemCellUpdated(this, i, oldValue, newValue);
					}
				}
			}
		}
	},
	beginEdit: function (checkDiff, strictDiff) {
		this._started = true;
		this._checkDiff = checkDiff;
        this._strictDiff = strictDiff;
	},
	setValue: function (fieldIndex, value) {
		var ds = this.dataSource();
		if (fieldIndex < 0 && fieldIndex >= ds.fieldCount()) {
			throw new RangeError("field index is out of bounds: " + fieldIndex);
		}
		var fld = ds.getField(fieldIndex);
		var oldValue = this._values[fieldIndex];
		value = fld.readValue(value);
		this._values[fieldIndex] = value;
		if (this._started && !fld.equalValues(oldValue, value)) {
			this.provider()._editItemCellUpdated(this, fieldIndex, oldValue, value);
		}
	},
	itemState: function () {
		return this._state;
	},
	getData: function (field) {
		if (field < 0 && field >= this.dataSource().fieldCount()) {
			throw new RangeError("field index is out of bounds: " + field);
		}
		return this._values[field];
	},
	setData: function (field, value) {
		var ds = this.dataSource();
		if (field < 0 && field >= ds.fieldCount) {
			throw new RangeError("field index is out of bounds: " + field);
		}
		var fld = ds.getField(field); 
		var oldValue = this._values[field];
		value = fld.readValue(value);
        var can = !this._checkDiff;
        if (!can) {
            if (this._strictDiff) {
                can = !fld.equalValues(oldValue, value);
            } else {
                can = !fld.sameValues(oldValue, value);
            }
        }
		if (can) {
			this._values[field] = value;
			this.provider()._editItemCellUpdated(this, field, oldValue, value);
			this.provider()._editItemCellEdited(this, field);
		}
	},
	getRowData: function ()  {
		return this._values.concat();
	},
	getRowObject: function () {
		var ds = this.dataSource();
		if (ds) {
			var i, fld, 
				cnt = ds.fieldCount(),
				row = {};
			for (i = 0; i < cnt; i++) {
				fld = ds.getOrgFieldName(i);
				row[fld] = this._values[i];
			}
			return row;
		} else {
			return null;
		}
	},
	_clearDisplayLevels: function () {
		var i;
		var cnt = this._rows.length;
		for (i = 0; i < cnt; i++) {
			this._rows[i]._displayLevel = -1;
		}
	}
});
var /* @abstract */ EditableItemProvider = defineClass("EditableItemProvider", ProxyItemProvider, {
	init: function (source, indexing) {
		this._super(source, indexing);
		this._orgItem = null;
		this._editingItem = null;
		this._dummyEditItem = null;
		this._editingState = ItemState.NORMAL;
		this._insertMode = 0;
		this._modified = false;
		this._commiting = false;
		this._saveDs = null;
		if (source && (this._saveDs = source.dataSource())) {
			this._saveDs.registerClient(this);
		}
	},
	isDataEditing: function () {
		return this.isEditing();
	},
	cancelDataEditing: function () {
		if (this.isEditing()) {
			this._fireCancelRequest();
		}
	},
	commitDataEditing: function () {
		if (this.isEditing()) {
			this._fireCommitRequest();
		}
	},
	editingItem: function () {
		return (this._commiting || this.isEditing()) ? this._editingItem : null;
	},
	edit: function (item) {
        if (this.isEditing()) {
            return true;
        } else if (item) {
            try {
                this._beginUpdate(item);
				return true;
            } catch (err) {
                this.cancel();
                throw err;
            }
		}
		return false;
	},
	editData: function (item, field, value) {
		var ds;
		if (item && (ds = this.dataSource()) && field >= 0 && field < ds.fieldCount()) {
			if (!this.isEditing()) {
                try {
                    this._beginUpdate(item);
					return true;
                } catch (err) {
                    this.cancel();
                    throw err;
                }
			}
			this._editingItem.setData(field, value);
		}
		return false;
	},
	appendDummy: function() {
		if (!this.isEditing()) {
			try {
				this._beginAppendDummy();
			} catch (err) {
				this.cancelDummy();
				throw err;
			}
		}
	},
	append: function (defaultValues) {
		if (!this.isEditing()) {
            try {
                this._beginAppend(defaultValues);
				return true;
            } catch (err) {
                this.cancel();
                throw err;
            }
		}
		return false;
	},
	insert: function (item, defaultValues, shift, ctrl) {
		if (!this.isEditing()) {
            try {
                this._beginInsert(item, defaultValues, shift, ctrl);
				return true;
            } catch (err) {
                this.cancel();
                throw err;
            }
		}
		return false;
	},
	remove: function (item) {
	},
	removeAll: function (item) {
	},
	getRemovableRows: function (items) {
		return null;
	},
	removeRows: function (rows) {
	},
	cancelDummy: function() {
		if (this._dummyEditItem) {
			this._cancelDummyEdit();
		}
	},
	cancel: function () {
		if (this.isEditing()) {
			this._cancelEdit();
		}
	},
	commit: function () {
		if (this.isEditing()) {
			this._commiting = true;
			try {
                var ds = this.dataSource();
                if (ds) {
                    if (this._editingState == ItemState.UPDATING && this.isCheckDiff()) {
                        var i;
                        var values = this._editingItem.values();
                        var cnt = values.length;
                        var diff = false;
                        var strict = this.isStrictDiff();
                        for (i = 0; i < cnt; i++) {
                            if (strict) {
                                if (!ds.getField(i).equalValues(this._orgItem.getData(i), values[i])) {
                                    diff = true;
                                    break;
                                }
                            } else {
                                if (!ds.getField(i).sameValues(this._orgItem.getData(i), values[i])) {
                                    diff = true;
                                    break;
                                }
                            }
                        }
                        if (!diff) {
                            this._cancelEdit();
                            return true;
                        }
                    }
                    return this._commitEdit();
                }
			} finally {
				this._commiting = false;
			}
		}
		return true;
	},
	isEditing: function (item) {
		return ItemState.isEditing(this._editingState) && (!item || item === this._editingItem);
	},
	isEdited: function (item) {
		return ItemState.isEditing(this._editingState) && (!item || item === this._editingItem) && this._modified;
	},
	checkDiff: false,
	checkCellDiff: false,
    strictDiff: false,
	isUpdating: function () {
		return this._editingState == ItemState.UPDATING;
	},
	isInserting: function () {
		return this._editingState == ItemState.INSERTING;
	},
	isAppending: function () {
		return this._editingState == ItemState.APPENDING;
	},
	isDataEditing: function () {
		return this.isEditing();
	},
	cancelDataEditing: function () {
	},
	commitDataEditing: function () {
	},
    setDiffs: function (check, cell, strict) {
        this._checkDiff = check;
        this._checkCellDiff = cell;
        this._strictDiff = strict;
    },
	itemCount: function () {
		return this.source().itemCount();
	},
	onItemProviderReset: function (itemProvider) {
		this._super(itemProvider);
		var ds = this.dataSource();
		if (ds != this._saveDs) {
			this._saveDs && this._saveDs.unregisterClient(this);
			this._saveDs = ds;
			this._saveDs && this._saveDs.registerClient(this);
		}
	},
	onItemProviderRefresh: function (itemProvider) {
		this._super(itemProvider);
	},
	onItemProviderRefreshClient: function (itemProvider) {
		this._super(itemProvider);
	},
	onItemProviderItemInserted: function (itemProvider, item) {
		this._super(itemProvider, item);
	},
	onItemProviderItemRemoved: function (itemProvider, item) {
		this._super(itemProvider, item);
	},
	onItemProviderItemUpdated: function (itemProvider, item) {
		this._super(itemProvider, item);
	},
	_checkEditing: function () {
		if (!this.isEditing()) {
			throw new Error("itemProvider is not editing");
		}
	},
	_checkNotEditing: function () {
		if (this.isEditing()) {
			throw new Error("itemProvider is already editing");
		}
	},
	_beginUpdate: function (item) {
		if (!item) {
			throw new Error("item is null");
		}
		this._checkNotEditing();
		this._modified = false;
		this._editingItem = this._doBeginUpdate(item);
		this._editingItem.beginEdit(this.isCheckCellDiff(), this.isStrictDiff());
		if (this._editingItem) {
			this._orgItem = item;
			this._editingState = ItemState.UPDATING;
			this._fireUpdateStarted(this._editingItem);
		}
	},
	_doBeginUpdate: function (item) {
		return null;
	},
	_beginAppendDummy: function () {
		this._dummyEditItem = this._doBeginAppendDummy();
	},
	_beginAppend: function (defaultValues) {
		this._checkNotEditing();
		this._modified = false;
		this._editingItem = this._doBeginAppend(defaultValues);
		this._editingItem.beginEdit(this.isCheckCellDiff(), this.isStrictDiff());
		if (this._editingItem) {
			this._editingState = ItemState.APPENDING;
			this._fireAppendStarted(this._editingItem);
		}
	},
	_doBeginAppend: function (defaultValues) {
		return null;
	},
	_beginInsert: function (item, defaultValues, shift, ctrl) {
		if (!item) {
			throw "item is null";
		}
		this._checkNotEditing();
		this._modified = false;
		this._editingItem = this._doBeginInsert(item, defaultValues, shift, ctrl);
		this._editingItem.beginEdit(this.isCheckCellDiff(), this.isStrictDiff());
		if (this._editingItem) {
			this._editingState = ItemState.INSERTING;
			this._resetItemIndicies(0);//this._editingItem.index());
			this._fireInsertStarted(this._editingItem);
		}
	},
	_doBeginInsert: function (item, defaultValues) {
		return null;
	},
	_cancelDummyEdit: function() {
		this._dummyEditItem = null;
		this._doCancelDummyEdit();
	},
	_cancelEdit: function () {
		this._checkEditing();
		var saveState = this._editingState;
		try {
			this._editingState = ItemState.NORMAL;
			this._doCancelEdit(saveState, this._orgItem);
		} catch (err) {
			this._editingState = saveState;
			throw err;
		}
		this._modified = false;
		this._fireCanceled();

	},
	_doCancelDummyEdit: function() {
	},
	_doCancelEdit: function (state, orgItem) {
		if (state == ItemState.INSERTING) {
			this._resetItemIndicies(0);
		}
	},
	_updateEditingRow: function (orgItem) {
		return false;
	},
	_insertEditingRow: function (appending) {
		return false;
	},
	_updateEditingRow: function (orgItem) {
		return false;
	},
	_insertEditingRow: function (appending) {
		return false;
	},
	_commitEdit: function () {
		this._checkEditing();
		var ds = this.dataSource();
		if (!ds) {
			throw new Error("data provier is null");
		}
		try {
			this._fireItemCommitting(this._editingItem);
		} catch (err) {
			alert(err.message);
		}
		var saveState = this._editingState;
		var completed = false;
		if (this.isUpdating()) {
			try {
				this._editingState = ItemState.NORMAL;
				completed = this._doCompleteUpdate(this._orgItem);
			} catch (err) {
				this._editingState = saveState;
				throw err;
			}
		} else {
			try {
				this._editingState = ItemState.NORMAL;
				completed = this._doCompleteInsert(saveState == ItemState.APPENDING);
			} catch (err) {
				this._editingState = saveState;
				throw err;
			}
		}
		if (completed) {
			this._modified = false;
			this._doCommitEdit(saveState, this._orgItem);
			this._fireCommitted(this._editingItem);
		} else {
			this._editingState = saveState;
		}
		return completed;
	},
	_doCommitEdit: function (state, orgItem) {
		return false;
	},
	_editItemCellEdited: function (item, field) {
		if (item && this.isEditing(item)) {
			this._modified = true;
			this._fireItemCellEdited(item, field);
		}
	},
	_editItemCellUpdated: function (item, field, oldValue, newValue) {
		if (this.isEditing(item)) {
			this._modified = true;
			this._fireItemCellUpdated(item, field, oldValue, newValue);
		}
	},
	_fireUpdateStarted: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(EditableItemProvider.UPDATE_STARTED, item);
		} 
	},
	_fireAppendStarted: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(EditableItemProvider.APPEND_STARTED, item);
		} 
	},
	_fireInsertStarted: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(EditableItemProvider.INSERT_STARTED, item);
		} 
	},
	_fireItemCellEdited: function (item, field) {
		if (this._eventLock <= 0) {
			this.fireEvent(EditableItemProvider.CELL_EDITED, item, field);
		} 
	},
	_fireItemCellUpdated: function (item, field, oldValue, newValue) {
		if (this._eventLock <= 0) {
			this.fireEvent(EditableItemProvider.CELL_UPDATED, item, field, oldValue, newValue);
		} 
	},
	_fireItemCommitting: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(EditableItemProvider.COMMITTING, item);
		} 
	},
	_fireCommitted: function (item) {
		if (this._eventLock <= 0) {
			this.fireEvent(EditableItemProvider.COMMITTED, item);
		} 
	},
	_fireCanceled: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(EditableItemProvider.CANCELED);
		} 
	},
	_fireCommitRequest: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(EditableItemProvider.COMMIT_REQUEST);
		}
	},
	_fireCancelRequest: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(EditableItemProvider.CANCEL_REQUEST);
		}
	}
});
EditableItemProvider.UPDATE_STARTED = "onItemEditUpdateStarted";
EditableItemProvider.APPEND_STARTED = "onItemEditAppendStarted";
EditableItemProvider.INSERT_STARTED = "onItemEditInsertStarted";
EditableItemProvider.CELL_EDITED = "onItemEditCellEdited";
EditableItemProvider.CELL_UPDATED = "onItemEditCellUpdated";
EditableItemProvider.COMMITTING = "onItemEditCommitting";
EditableItemProvider.COMMITTED = "onItemEditCommitted";
EditableItemProvider.CANCELED = "onItemEditCanceled";
EditableItemProvider.COMMIT_REQUEST = "onItemEditCommitRequest";
EditableItemProvider.CANCEL_REQUEST = "onItemEditCancelRequest";
var EditableItemProviderImpl = defineClass("EditableItemProviderImpl", EditableItemProvider, {
	init: function (source, indexing) {
		this._super(source, indexing);
		this._insertRow = -1;
	},
	itemCount: function () {
		var cnt = this.source().itemCount();
		cnt += (this.isInserting() || this.isAppending()) ? 1 : 0;
		cnt += (this._dummyEditItem) ? 1 : 0;
		return cnt;
	},
	getItem: function (index) {
		var ret;
		if (this.isEditing() && this._editingItem.index() == index) {
			return this._editingItem;
		} else if (this.isInserting()) {
			if (index > this._editingItem.index()) {
				ret = this.source().getItem(index - 1);
			} else {
				ret = this.source().getItem(index);
			}
		} else if (index < this.source().itemCount()) {
			ret = this.source().getItem(index);
		}
		if (ret) {
			return ret;
		} else if (this._dummyEditItem && index == this.itemCount() - 1) {
			return this._dummyEditItem;
		}
		return null;
	},
	_doBeginUpdate: function (item) {
		this._editingItem = this._createEditItem(item, ItemState.UPDATING, null);
		return this._editingItem;
	},
	_doBeginAppendDummy: function () {
		this._dummyEditItem = this._dummyEditItem ? this._dummyEditItem : this._createDummyEditItem();
		this._dummyEditItem._index = this.itemCount()-1;
		return this._dummyEditItem;
	},
	_doBeginAppend: function (defaultValues) {
		this._editingItem = this._createEditItem(null, ItemState.APPENDING, defaultValues);
		return this._editingItem;
	},
	_doBeginInsert: function (item, defaultValues, shift, ctrl) {
		this._editingItem = this._createEditItem(item, ItemState.INSERTING, defaultValues, shift, ctrl);
		return this._editingItem;
	},
	_doCancelEdit: function (state, orgItem) {
		this._super(state, orgItem);
	},
	_doCommitEdit: function (state, orgItem) {
		this._super(state, orgItem);
	},
	_doCompleteUpdate: function (orgItem) {
		var ds = this.dataSource();
		if (ds) {
			var editItem = this._editingItem;
			this._copyExtents(editItem, orgItem);
			return ds.updateRow(editItem.dataRow(), editItem.values());
		}
		return false;
	},
	_doCompleteInsert: function (appending) {
		var rslt = false;
		var ds = this.dataSource();
		if (ds) {
			var editItem = this._editingItem;
			var r = appending ? ds.rowCount() : Math.max(0, this._insertRow);
			var values = editItem.values();
			rslt = ds.insertRow(r, values);
			if (rslt) {
				var item = this.getItemOfRow(r);
				this._copyExtents(editItem, item);
			}
		}
		return rslt;
	},
	remove: function (item) {
		var ds = this.dataSource();
		if (item && !this.isEditing(item) && ds) {
			var r = item.dataRow();
			if (r >= 0) {
				ds.removeRow(r);
			}
		}
	},
	removeAll: function (items) {
        if (!items || items.length == 0) {
            return;
        }
		var ds = this.dataSource();
		if (!ds) {
			return;
		}
		var row;
		var cnt = items.length;
		if (cnt > 1) {
			var rows = [];
			for (var i = 0; i < cnt; i++) {
				row = this.getItem(items[i]).dataRow();
				if (row >= 0) {
					rows.push(row);
				}
			}
			if (rows.length > 1) {
				ds.removeRows(rows);
			} else if (rows.length == 1) {
				ds.removeRow(rows[0]);
			}
		} else if (cnt == 1) {
			row = this.getItem(items[0]).dataRow();
			row >= 0 && ds.removeRow();
		}
	},
    revert: function (item) {
        if (!(item instanceof GridItem)) {
            item = this.getItem(item);
        }
        if (item) {
            var ds = this.dataSource();
            if (ds) {
                var r = item.dataRow();
                var st = ds.getRowState(r);
                if (st == RowState.DELETED) {
                    ds.setRowState(r, RowState.NONE);
                } else if (st == RowState.CREATE_AND_DELETED) {
                    ds.setRowState(r, RowState.CREATED);
                }
            }
        }
    },
    revertAll: function (items) {
        if (!items || items.length == 0) {
            return;
        }
        var ds = this.dataSource();
        if (!ds) {
            return;
        }
        for (var i = items.length; i--;) {
            var item = this.getItem(items[i]);
            if (item) {
                var r = item.dataRow();
                var st = ds.getRowState(r);
                if (st == RowState.DELETED) {
                    ds.setRowState(r, RowState.NONE);
                } else if (st == RowState.CREATE_AND_DELETED) {
                    ds.setRowState(r, RowState.CREATED);
                }
            }
        }
    },
	getRemovableRows: function (items) {
		if (!items || items.length == 0) {
			return null;
		}
		var rows = [];
		for (var i = 0, cnt = items.length; i < cnt; i++) {
			var row = this.getItem(items[i]).dataRow();
			row >= 0 &&	rows.push(row);
		}
		return rows;
	},
	removeRows: function (rows) {
		if (rows) {
			if (rows.length > 1) {
				this.dataSource().removeRows(rows);
			} else {
				this.dataSource().removeRow(rows[0]);
			}
		}
	},
	_createDummyEditItem: function () {
		//
		var item = null;
		item = new DummyEditItem(this, null, this.itemCount(), -1/*target.dataRow*/, ItemState.DUMMY);
		return item;
	},
	_createEditItem: function (target, state, defaultValues, shift, ctrl) {
		var ds = this.dataSource();
		if (!ds) {
			return null;
		}
		var i;
		var item = null;
		var flds = ds.fieldCount();
		switch (state) {
		case ItemState.UPDATING:
			item = new EditItem(this, target, target.index(), target.dataRow(), state);
			for (i = 0; i < flds; i++) {
				item.setValue(i, target.getData(i));
			}
			this._copyExtents(target, item);
			break;
		case ItemState.INSERTING:
		case ItemState.APPENDING:
			var targetIndex = state == ItemState.INSERTING && target ? ( shift ? target.index()+1 : target.index()) : this.itemCount();
			item = new EditItem(this, target, targetIndex/*target.index()*/, -1/*target.dataRow*/, state);
			if (state == ItemState.INSERTING) {
				var row = target.dataRow();
				if (row <= -1) {
					var visibleItems = this._source._visibleItems;
					var nextItem = target;
					while (nextItem = visibleItems.getNext(nextItem)) {
						if (nextItem instanceof GridRow) {
							break;
						}
					}
					this._insertRow = nextItem ? nextItem.dataRow() : this.dataSource().rowCount();
				} else {
					this._insertRow = shift ? Math.min(this.dataSource().rowCount(), row+1) : row;
				}
				
			}
			if (defaultValues) {
				for (i = 0; i < flds; i++) {
					if (defaultValues.length > i) {
						item.setValue(i, defaultValues[i]);
					}
				}
			}
			break;
		}
		return item;
	}
});