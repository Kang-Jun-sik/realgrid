var _nextTreeRowId = 0;
var /* abstract */ TreeDataRow = defineClass("TreeDataRow", null, {
	init : function() {
		Base.init.call(this, true);
		this._rowId = _nextTreeRowId++;
		this._children = null;
		this._descendantCount = 0;
	},
	rowId: function () {
		return this._rowId;
	},
	provider: function () {
		return null;
	},
	parent: function () {
		return null;
	},
	index: function () {
		return -1;
	},
	level: function () {
		return 0;
	},
	iconIndex: function () {
		return -1;
	},
	hasChildren: function () {
		return false;
	},
	count: function () {
		return this._children ? this._children.length : 0;
	},
	descendantCount: function () {
		return this._descendantCount;
	},
	children: function () {
		return this._children ? this._children.concat() : null;
	},
	descendants: function () {
		function collectRows (p, rows) {
			var i, row,
				cnt = p.count();
			for (i = 0; i < cnt; i++) {
				rows.push(row = p.getChild(i));
				collectRows(row, rows);
			}
		}
		if (this._children) {
			var rows = [];
			collectRows(this, rows);
			return rows;
		}
		return null;
	},
	ancestors: function () {
		var rows = null,
			p = this.parent();
		if (p) {
			rows = [];
			while (p && p.rowId() >= 0) {
				rows.push(p);
				p = p.parent();
			}
		}
		return rows;
	},
	getChild: function (index) {
		if (index >= 0) {
			if (!this._children || index >= this._children.length) {
				throw new RangeError("Index is invalid: " + index);
			}
			return this._children[index];
		}
		throw new RangeError("Index is invalid: " + index);
	},
	getChildObjects: function (recursive, childrenProp, iconProp, addRowId) {
		var children = this._children;
		if (children) {
			var objects = [];
            childrenProp = childrenProp || "rows";
			iconProp = iconProp || "iconIndex";
			for (var i = 0, cnt = children.length; i < cnt; i++) {
				var child = children[i];
				var obj = child.getObject();
				if (addRowId) obj["_rowId"] = child._rowId;
				if (recursive) {
					obj[childrenProp] = child.getChildObjects(recursive, childrenProp, iconProp, addRowId);
				}
				obj[iconProp] = child.iconIndex();
				objects.push(obj);
			}
			return objects;
		}
		return null;
	},
    $_createTreeOutputRows: function (rows, options, childrenProp) {
    	function rowsToDataRows(rows, dataRows, childrenProp) {
		  for (var i=0, cnt=rows.length; i < cnt; i++) {
		  	var row = rows[i];
		    dataRows.push(rows[i]);
		    if (childrenProp && row[childrenProp] && row[childrenProp].length) {
		      rowsToDataRows(row[childrenProp], dataRows, childrenProp)
		    }
		  }
		}
		var dataRows = [];
		rowsToDataRows(rows,dataRows,childrenProp);
		var provider = this.provider();
        var fldCount = provider.fieldCount();
        var rowCount = dataRows.length;
        var r, row;
        if (!(options instanceof DataOutputOptions)) {
            options = new DataOutputOptions(options);
        }
        var nullDate = options.nullDateText();
        var nullText = options.nullText();
        var nanText = options.nanText();
        for (var i = 0; i < fldCount; i++) {
            var field = provider.getField(i);
            var prop = field.orgFieldName();
            var callback, writer;
            if (field._dataType == ValueType.DATETIME && ((callback = options._datetimeCallback) || (writer = options._datetimeWriter) || (nullDate != null && nullDate != undefined) )) {
                if (callback) {
                    for (r = 0; r < rowCount; r++) {
                        row = dataRows[r];
                        row[prop] = callback(row["_rowId"], prop, row[prop]);
                    }
                } else {
                    for (r = 0; r < rowCount; r++) {
                        row = dataRows[r];
                        var d = row[prop];
                        row[prop] = d ? writer ? writer.getText(row[prop]) : d : nullDate;
                    }
                }
            } else if (field._dataType == ValueType.BOOLEAN && ((callback = options._booleanCallback) || (writer = options._booleanFormatter))) {
                if (callback) {
                    for (r = 0; r < rowCount; r++) {
                        row = dataRows[r];
                        row[prop] = callback(row["_rowId"], prop, row[prop]);
                    }
                } else {
                    for (r = 0; r < rowCount; r++) {
                        row = dataRows[r];
                        row[prop] = writer.formatValue(row[prop]);
                    }
                }
            } else if (field._dataType == ValueType.NUMBER && ((callback = options._numberCallback) || (writer = options._numberFormatter) || (nanText != null && nanText != undefined))) {
                if (callback) {
                    for (r = 0; r < rowCount; r++) {
                        row = dataRows[r];
                        row[prop] = callback(row["_rowId"], prop, row[prop]);
                    }
                } else {
                    for (r = 0; r < rowCount; r++) {
                        row = dataRows[r];
                        var v = row[prop];
                        row[prop] = v == null || isNaN(v) ? nanText : writer ? writer.format(v) : v;
                    }
                }
            } else if (nullText != null && nullText != undefined) {
                for (r = 0; r < rowCount; r++) {
                    row = dataRows[r];
                    var v = row[prop];
                    row[prop] = v == null || v == undefined ? nullText : v;
                }
            }
        }
        for (var i =0, cnt=dataRows.length; i<cnt; i++) {
        	delete dataRows[i]["_rowId"];
        }
    },
	getOutput: function (options, iconProp) {
		if (options) {
			var row = this.getObject();
			row[iconProp || "iconIndex"] = this.iconIndex();
			row["_rowId"] = this._rowId;
			this.$_createTreeOutputRows([row], options);
			return row;
		}
		return null;
	},
    getChildOutputObjects: function (options, recursive, childrenProp, iconProp) {
        var rows = this.getChildObjects(recursive, childrenProp, iconProp, true);
        rows && options && this.$_createTreeOutputRows(rows, options, childrenProp);
        return rows;
    },
	findById: function (rowId) {
		if (this._children) {
			var i, child, c,
				cnt = this._children.length;
			for (i = 0; i < cnt; i++) {
				child = this._children[i];
				if (child.rowId() == rowId) {
					return child;
				}
				c = child.findById(rowId);
				if (c) {
					return c;
				}
			}
		}
		return null;
	},
	indexOf: function (childRow) {
		return this._children ? this._children.indexOf(childRow) : -1;
	},
	_moveChild: function (index, newIndex) {
		if (index < 0 || index >= this._children.length)
			throw new RangeError("index is out of range: " + index);
		if (newIndex < 0 || newIndex >= this._children.length)
			throw new RangeError("newIndex is out of range: " + newIndex);

		var child = this._children[index];
		if (index > newIndex) {
			for (var i = index; i > newIndex; i--) 
				this._children[i] = this._children[i-1];
		} else {
			for (var i = index; i < newIndex; i++)
				this._children[i] = this._children[i+1];			
		}
		this._children[newIndex] = child;
	},
	_changeParent: function (parent, index) {
		if (index < 0 || index > parent._children.length)
			throw new RangeError("index is out of range: " + index);

		var old = this.parent();
		var oldIndex = this.index();

		old._children.splice(oldIndex, 1);
		old._descendantCountChanged(-1 - this.descendantCount());
		old._detach(this);
		
		parent._children.splice(index, 0, this);
		parent._descendantCountChanged(1 + this.descendantCount());
		parent._attach(this);
	},
	_insertChild: function (index, child, force, noState) {
		var provider = this.provider();
		if (provider && !force) {
			if (!provider._checkClientState()) return;
			provider.refreshFieldFormats();
		}
		if (!child) {
			throw new Error("child is null");
		}
		this._children = this._children || [];
		if (index < 0 || index > this._children.length) {
			throw new RangeError("Insert index is invalid: " + index);
		}
		if (force || this._doChildAdding(index, child)) {
			this._children.splice(index, 0, child);
			this._descendantCountChanged(1 + child.descendantCount());
			this._attach(child);
			if (!noState) {
				child._changeRowState(RowState.CREATED, true);
			}
			this._doChildAdded(index, child);
			return true;
		}
		return false;
	},
	insertChild: function (index, child, noState) {
		return this._insertChild(index, child, false, noState);
	},
	_addChild: function (child, force, noState) {
		return this._insertChild(this.count(), child, force, noState);
	},
	addChild: function (child, noState) {
		return this._insertChild(this.count(), child, false, noState);
	},
	$_removeChild: function (child, index, force) {
		if (force || this._doChildRemoving(child)) {
			this._children.splice(index, 1);
			this._descendantCountChanged(-1 - child.descendantCount());
			this._detach(child);
			this._doChildRemoved(child);
			return true;
		}
		return false;
	},
	_removeChild: function (child, force) {
		var provider = this.provider();
		if (provider && !force) {
			if (!provider._checkClientState()) return;
		}
		if (child && this._children) {
			var i, ds;
			for (i = this._children.length; i--;) {
				if (this._children[i] === child) {
					ds = this.provider();
					if (ds.isSoftDeleting() && ds.isCheckStates()) {
						switch (child.rowState()) {
							case RowState.CREATED:
								if (ds.isDeleteCreated()) {
									return this.$_removeChild(child, i, force);
								} else {
									child._changeRowState(RowState.CREATE_AND_DELETED, true);
								}
								break;
							case RowState.DELETED:
							case RowState.CREATE_AND_DELETED:
								break;
							default: 
								child._changeRowState(RowState.DELETED, true);
						}
					} else {
						return this.$_removeChild(child, i, force);
					}
				}
			}
		}
		return false;
	},
	removeChild: function (childRow) {
		return this._removeChild(childRow, false);
	},
	_removeChildren: function () {
		if (this._children && this._children.length > 0) {
			this._children.splice(0, this._children.length);
			this._descendantCountChanged(-this._descendantCount);
			this._doCleared();
		}
	},
	clearChildren: function () {
		var provider = this.provider();
		if (provider && !provider._checkClientState()) return;
		this._removeChildren();
	},
	_setChildren: function (children) {
		if (this._children && this._children.length > 0) {
			this._children.splice(0, this._children.length);
		}
		var	dcount = -this._descendantCount;
        var cnt;
		if (children && (cnt = children.length) > 0) {
			if (!this._children) {
				this._children = [];
			}
			for (var i = 0; i < cnt; i++) {
				var child = children[i];
				this._children.push(child);
				dcount += 1 + child.descendantCount();
				this._attach(child);
			}
		}
		this._descendantCountChanged(dcount);
	},
	findChild: function (fields, values) {
		var provider = this.provider();
		if (!provider || !fields || fields.length < 1 || !values || values.length < fields.length) {
			return null;
		}
		var	flds = [];
		var	vals = [];
        var i, c, cnt, len;
		cnt = fields.length;
		for (i = 0; i < cnt; i++) {
			if (typeof fields[i] === "string") {
				c = provider.getFieldIndex(fields[i]);
			} else {
				c = Number(fields[i]);
			}
			if (c >= 0 && c < provider.fieldCount() && flds.indexOf(c) < 0) {
				flds.push(c);
				vals.push(values[i]);
			}
		}
		len = flds.length;
		for (i = 0; i < len; i++) {
			flds[i] = provider.getField(flds[i]);
		}
		return this.$_findChild(flds, vals);
	},
	$_findChild: function (flds, vals) {
		var i, c, child, found,
			len = flds.length,
			cnt = this.count();
		for (i = 0; i < cnt; i++) {
			child = this._children[i];
			found = true;
			for (c = 0; c < len; c++) {
				if (!flds[c].equalValues(vals[c], child.getValue(flds[c].index))) {
					found = false;
					break;
				}
			}
			if (found) {
				return child;
			}
			child = child.$_findChild(flds, vals);
			if (child) {
				return child;
			}
		}
		return null;
	},
	isAncestorOf: function (row) {
		if (row && row !== this) {
			var p = row.parent();
			while (p && p !== this) {
				p = p.parent();
			}
			return p === this;
		}
		return false;
	},
	_descendantCountChanged: function (count) {
		this._descendantCount += count;
		var p = this.parent();
		if (p) {
			p._descendantCountChanged(count);
		}
	},
	clearRowStates: function (deleteRows, rowEvents) {
		var provider = this.provider();
		if (!provider) {
			return;
		}
		var i, cnt, row,
			rows = [],
			deletes = deleteRows ? [] : null;
		this._collectStateRows(rows, deletes);
		var nState = rows.length;
		var nDelete = deletes ? deletes.length : 0;
		if (nState == 0 && nDelete == 0) {
			return;
		}
		if (rowEvents) {
			cnt = rows.length;
			for (i = 0; i < cnt; i++) {
				rows[i]._changeRowState(RowState.NONE, true);
			}
		} else if (nState) {
            provider.changeRowStates(rows, RowState.NONE);
		}
        if (nDelete) {
      //   	if (rowEvents) {
      //   		for (var i in deletes) {
    		// 		provider.deleteRow(deletes[i]);
    		// 	}
    		// } else {
            	provider.deleteRows(deletes);
            // }
        }
	},
	_collectStateRows: function (rows, deletes) {
		for (var i = this.count(); i--;) {
			var row = this.getChild(i);
			var state = row.rowState();
			if (deletes && (state == RowState.DELETED || state == RowState.CREATE_AND_DELETED)) {
				deletes.push(row);
			} else {
                if (state != RowState.NONE) {
                    rows.push(row);
                }
				row._collectStateRows(rows, deletes);
			}
		}
	},
	$_clearOrgValues: function () {
		for (var i = this.count(); i--;) {
			this.getChild(i).$_clearOrgValues();
		}
	},
	$_restoreState: function (recursive, restoredRows) {
		if (recursive) {
			for (var i = this.count(); i--;) {
				this.getChild(i).$_restoreState(true, restoredRows);
			}
		}
		return false;
	},
	$_restoreRow: function (recursive, restoredRows) {
		if (recursive) {
			for (var i = this.count(); i--;) {
				this.getChild(i).$_restoreRow(true, restoredRows);
			}
		}
		return false;
	},
	toTreeString: function () {
		var s = this.rowId();
		var indent = new Array(this.level() + 1).join("  ");
		for (var i = 0; i < this.count(); i++) {
			s += "\n" + indent + this.getChild(i).toTreeString();
		}
		return s;
	},
	_attach: function (child) {
		throwAbstractError();
	},
	_deatach: function (child) {
		throwAbstractError();
	},
	_checkFieldIndex: function (field) {
		var flds = this.provider().fieldCount();
		if (field < 0 || field >= flds) {
			throw new DataSourceError("Field index is out of bounds: " + field);
		}
	},
	_doChildAdding: function (index, child) {
		var prov = this.provider();
		if (prov) {
			return prov._rowAdding(this, index, child);
		}
		return true;
	},
	_doChildAdded: function (index, child) {
		var prov = this.provider();
		if (prov) {
			prov._rowAdded(child);
		}
	},
	_doChildRemoving: function (child) {
		var prov = this.provider();
		if (prov) {
			return prov._rowRemoving(child);
		}
		return true;
	},
	_doChildRemoved: function (child) {
		var prov = this.provider();
		if (prov) {
			prov._rowRemoved(child);
		}
	},
	_doCleared: function () {
		var prov = this.provider();
		if (prov) {
			prov._rowCleared(this);
		}
	}
});
var TreeDataRow$ = TreeDataRow.prototype;
var TreeDataRowImpl = defineClass("TreeDataRowImpl", TreeDataRow, {
	init : function(provider, values) {
		TreeDataRow$.init.call(this);
		this._parent = null;
		this._iconIndex = -1;
		this._hasChildren = false;
		this._values = null;
		this._orgValues = null;
		this._state = RowState.NONE;
		if (provider && values) {
			var i,
				flds = provider.fieldCount(),
				cnt = Math.min(values.length, flds);
			this._values = new Array(flds);
			for (i = 0; i < cnt; i++) {
				this._values[i] = provider.getField(i).readValue(values[i]);
			}
		}
	},
	provider: function () {
		return this._parent ? this._parent.provider() : null;
	},
	parent: function () {
		return this._parent;
	},
	index: function () {
		return this._parent ? this._parent.indexOf(this) : -1;
	},
	level: function () {
		return this._parent ? this._parent.level() + 1 : 0;
	},
	hasChildren: function () {
		return this._hasChildren;
	},
	setHasChildren: function (value) {
		if (value != this._hasChildren) {
			this._hasChildren = value;
			var provider = this.provider();
			if (provider) {
				provider.hasChildrenChanged(this);
			}
		}
	},
	iconIndex: function () {
		return this._iconIndex;
	},
	setIconIndex: function (value) {
		value = parseInt(value);
		if (isNaN(value)) {
			value = -1;
		}
		if (value != this._iconIndex) {
			this._iconIndex = value;
			var provider = this.provider();
			if (provider) {
				provider._iconIndexChanged(this);
			}
		}
	},
	values: function () {
		return this._values ? this._values.concat() : [];
	},
	rowState: function () {
		return this._state;
	},
	_changeRowState: function (newState, fireEvent) {
		var provider = this.provider();
		if (provider && provider.isCheckStates() && newState != this._state) {
			var oldState = this._state;
			this._state = newState;
			if (newState == RowState.UPDATED && provider._needOrgValues) {
				this._orgValues = this._values.concat();
			} else if (oldState == RowState.updated) {
				if (this._orgValues) {
					this._orgValues = null;
				}
			}
			if (fireEvent) {
				provider._stateChanged(this);
			}
			return true;
		}
		return false;
	},
	getValue: function (field) {
		var provider = this.provider();
		if (provider) {
			this._checkFieldIndex(field);
			if (this._values) {
				return this._values[field];
			}
			throw new Error("Row data is not loaded");
		}
		return undefined;
	},
	setValue: function (field, value, noState) {
		var provider = this.provider();
		if (provider) {
			if (!provider._checkClientState()) return;
			provider.refreshFieldFormats();
			this._checkFieldIndex(field);
			if (this._values) {
				if (value != this._values[field]) {
					var oldVals;
					var needState = provider.isCheckStates() && (this._state == RowState.NONE || !this._state);
					if (!noState && needState && provider._needOrgValues) {
						oldVals = this._values.concat();
					}
					this._values[field] = value;
					provider.$_internalCalculateValues(this._values, this.rowId());

					if (!noState && needState) {
						if (provider._needOrgValues) {
							this._orgValues = oldVals;
						}
						this._state = RowState.UPDATED;
						provider._stateChanged(this);
					} else if (provider._needRestore) {
						this.$$_restoreState(provider);
					}
					provider._valueChanged(this, field);
				}
				return;
			}
			throw new Error("Row data is not loaded");
		}
	},
	getObject: function () {
		var provider = this.provider();
		if (provider) {
			var i, fld;
			var	cnt = provider.fieldCount();
			var	row = {};
			for (i = 0; i < cnt; i++) {
				fld = provider.getOrgFieldName(i);
				row[fld] = this._values[i];
			}
			return row;
		}
		return null;
	},
	update: function (values) {
		return this.$_update(values, false, false);
	},
	updateStrict: function (values) {
		return this.$_update(values, true, false);
	},
	_update: function (values, force) {
		return this.$_update(values, false, force);
	},
	_updateStrict: function (values, force) {
		return this.$_update(values, true, force);
	},
	$_update: function (values, strict, force) {
		var provider = this.provider();
		if (provider) {
			if (!force) {
				if (!provider._checkClientState()) return;
				provider.refreshFieldFormats();
			}
			if (values && (force || provider._rowUpdating(this))) {
				this._internalUpdate(values, strict, true);
				provider._rowUpdated(this);
				return true;
			}
		}
		return false;
	},
	copy: function () {
		var row = new TreeDataRowImpl(null, null);
		row._rowId = this._rowId;
		row._iconIndex = this._iconIndex;
		row._hasChildren = this._hasChildren;
		row._state = this._state;
		row._values = this._values ? this._values.concat() : null;
		var i, child,
			cnt = this.count();
		for (i = 0; i < cnt; i++) {
			child = this.getChild(i).copy();
			row._addChild(child, true, true);
		}
		return row;
	},
	_attach: function (child) {
		child._parent = this;
	},
	_detach: function (child) {
		if (child._parent === this) {
			child._parent = null;
		}
	},
	$_clearOrgValues: function () {
		if (this._orgValues) {
			this._orgValues.length = 0;
			this._orgValues = null;
		}
		this._super();
	},
	$_restoreState: function (recursive, restoredRows) {
		var restored = $$_restoreState(this.provider());
		if (restored && restoredRows) {
			restoredRows.push(this);
		}
		this._super(recursive, restoredRows);
		return restored;
	},
	$_restoreRow: function (recursive, restoredRows) {
		var restored = false;
		if (this._state === RowState.UPDATED) {
			var orgs = this._orgValues;
			if (orgs) {
				var vals = this._values;
				for (var i = 0, cnt = Math.min(orgs.length, this.provider().fieldCount()); i < cnt; i++) {
					vals[i] = orgs[i];
				}
				this._state = RowState.NONE;
				if (restoredRows) {
					restoredRows.push(this);
				}
				restored = true;
			}
		}
		this._super(true, restoredRows);
		return restored;
	},
	$$_restoreState: function (provider) {
		if (this._state == RowState.UPDATED && this._orgValues) {
			var orgs = this._orgValues;
			var vals = this._values;
            var provider = this.provider();
            var strict = provider.isStrictRestore();
            for (var i = 0, cnt = provider.fieldCount(); i < cnt; i++) {
                var v1 = vals.length > i ? vals[i] : undefined;
                var v2 = orgs.length > i ? orgs[i] : undefined;
                if (strict) {
                    if (!provider.getField(i).equalValues(v1, v2)) {
                        return false;
                    }
                } else {
                    if (!provider.getField(i).sameValues(v1, v2)) {
                        return false;
                    }
                }
            }
            this._state = RowState.NONE;
            return true;
		}
		return false;
	},
	$_getUpdatedCells:function() {
		var orgs = this._orgValues;
		var vals = this._values;
        var provider = this.provider();
        var strict = provider.isStrictRestore();
        var cells = [];
        if (!orgs || orgs.length <= 0) {
        	return null;
        }
        for (var i = 0, cnt = provider.fieldCount(); i < cnt; i++) {
            var v1 = vals.length > i ? vals[i] : undefined;
            var v2 = orgs.length > i ? orgs[i] : undefined;
            if (provider._fields[i].isCalculated()) continue;
            if (strict) {
                if (!provider.getField(i).equalValues(v1, v2)) {
                    cells.push({
						fieldName:provider.getOrgFieldName(i),
						oldValue:orgs[i],
						newValue:vals[i]
                    })
                }
            } else {
                if (!provider.getField(i).sameValues(v1, v2)) {
                    cells.push({
						fieldName:provider.getOrgFieldName(i),
						oldValue:orgs[i],
						newValue:vals[i]
                    })
                }
            }
        }
        return cells;
	},
	_setHasChildren: function (value) {
		this._hasChildren = value;
	},
	_setIconIndex: function (value) {
		value = parseInt(value);
		this._iconIndex = isNaN(value) ? -1 : parseInt(value);
	},
	_internalUpdate: function (values, strict, stateEvent) {
		var fld, changed = false;
		var isAry = _isArray(values);
		var provider = this.provider();
		if (provider) {
			var i, v, oldVals;
			var cnt = Math.min(provider.fieldCount(), isAry ? values.length : provider.fieldCount());
			var needState = provider.isCheckStates() && (this._state == RowState.NONE || !this._state);
			if (needState && provider._needOrgValues) {
				oldVals = this._values.concat();
			}
			for (i = 0; i < cnt; i++) {
				fld = provider.getField(i);
				if (isAry || values.hasOwnProperty(fld._orgFieldName)) {
					v = isAry ? values[i] : values[fld._orgFieldName];
					if (!strict || v !== undefined) {
						if (provider._needRestore) {
							changed = changed || (strict ? !fld.equalValues(this._values[i], fld.readValue(v)) : !fld.sameValues(this._values[i], fld.readValue(v)))
						} else {
							changed = true;
						}
						this._values[i] = provider.getField(i).readValue(v);
					}
				}
			}
			provider.$_internalCalculateValues(this._values, this.rowId());

			if (needState && changed) {
				if (oldVals) {
					this._orgValues = oldVals;
				}
				this._state = RowState.UPDATED;
				if (stateEvent) {
					provider._stateChanged(this);
				}
			} else if (provider._needRestore) {
				this.$$_restoreState(provider);
			}
		}
	}
});
var /* internal */ RootTreeRow = defineClass("RootTreeRow", TreeDataRow, {
	init: function(provider) {
		this._super();
		this._provider = provider;
	},
	copy: function () {
		var i, row,
			cnt = this.count(),
			root = new RootTreeRow(null);
		for (i = 0; i < cnt; i++) {
			row = this.getChild(i).copy();
			root._addChild(row, true, true);
		}
		root._provider = this._provider;
		return root;
	},
	set: function (source) {
		var	children = [];
		for (var i = 0, cnt = source.count(); i < cnt; i++) {
			children.push(source.getChild(i).copy());
		}
		this._setChildren(children);
	},
	provider: function () {
		return this._provider;
	},
	rowId: function () {
		return -1;
	},
	parent: function () {
		return null;
	},
	level: function () {
		return 0;
	},
	index: function () {
		return 0;
	},
	hasChildren: function () {
		return true;
	},
	iconIndex: function () {
		return -1;
	},
	setIconIndex: function (value) {
	},
	values: function () {
		return null;
	},
	rowState: function () {
		return RowState.NONE;
	},
	_setHasChildren: function () {
	},
	_changeRowState: function (newState, fireEvent) {
		return false;
	},
	getValue: function (field) {
		return UNDEFINED;
	},
	setValue: function (field, value, noState) {
	},
	getObject: function () {
		return null;
	},
	update: function (values, force) {
		return false;
	},
	updateStrict: function (values, force) {
		return false;
	},
	/*
	clearRowStates: function (deleteRows, fireStateEvents) {
		var i, row;
		for (i = this.count() - 1; i >= 0; i--) {
			row = this.getChild(i);
			if (deleteRows && (row.rowState() == RowState.DELETED || RowState.CREATE_AND_DELETED)) {
				this._removeChild(row, false);
			} else {
				row.clearRowStates(deleteRows, fireStateEvents);
			}
		}
	},
	*/
	_attach: function (child) {
		child._parent = this;
	},
	_detach: function (child) {
		if (child._parent === this) {
			child._parent = null;
		}
	}
});
var TreeDataProvider = defineClass("TreeDataProvider", DataSource, {
	init: function () {
		this._super();
	},
	rootRow: function () {
		return null;
	}
});
var LocalTreeDataProvider = defineClass("LocalTreeDataProvider", TreeDataProvider, {
	init : function() {
		this._super();
		this._eventLock = 0;
		this._resetLock = 0;
		this._countDirty = false;
		this._tagLock = false;
		this._points = [];
		this._nextPoint = 0;
		this._rootRow = new RootTreeRow(this);
		this._rowMap = [];
		this._tags = new TreeDataTagCollection(this);
		this._needOrgValues = false;
		this._needRestore = false;
		this._nextRowId = 0;
		this.checkParentProc = null;
		this.calculateRuntime();
	},
	needOrgValues: function () {
		return this._needOrgValues;
	},
	needRestore: function () {
		return this._needRestore;
	},
	addTag: function (tag) {
		this._tags.add(tag);
	},
	removeTag: function (tag) {
		this._tags.remove(tag);
	},
	setRows: function (rows, treeField, needSorting, childrenField, iconField) {
		if (!this._checkClientState()) return;
		var source,
			count = 0,
			tfield = this.getFieldIndex(treeField);
		if (tfield >= 0) {
			this.beginUpdate();
			try {
				this._clearRows();
				this.refreshFieldFormats();
				source = new ArrayTreeSource(this, this._rootRow);
				source.checkParentProc = this.checkParentProc;
				count = source.load(null, rows, tfield, needSorting, this.getFieldIndex(childrenField), this.getFieldIndex(iconField));
				this._checkSum(count);
			} finally {
				this.endUpdate(false);
			}
		}
		this._tags.setRows();
		this._fireReset();
		this._fireRowCountChanged();
		return count;
	},
	setCsvRows: function (rows, treeField, needSorting, childrenField, iconField) {
		if (!this._checkClientState()) return;
		var source,
			count = 0,
			tfield = this.getFieldIndex(treeField);
		if (tfield >= 0) {
			this.beginUpdate();
			try {
				this._clearRows();
				this.refreshFieldFormats();
				source = new CsvTreeSource(this, this._rootRow);
				source.checkParentProc = this.checkParentProc;
				count = source.load(null, rows, tfield, needSorting, this.getFieldIndex(childrenField), this.getFieldIndex(iconField));
				this._checkSum(count);
			} finally {
				this.endUpdate(false);
			}
		}
		this._tags.setRows();
		this._fireReset();
		this._fireRowCountChanged();
		return count;
	},
	setXmlRows: function (rows, rowElement, childrenField, iconField) {
		if (!this._checkClientState()) return;
		var source,
			count = 0;
		if (rows) {
			this.beginUpdate();
			try {
				this._clearRows();
				this.refreshFieldFormats();
				source = new XmlTreeSource(this, this._rootRow);
				count = source.load(null, rows, rowElement, this.getFieldIndex(childrenField), this.getFieldIndex(iconField));
				this._checkSum(count);
			} finally {
				this.endUpdate(false);
			}
		}
		this._tags.setRows();
		this._fireReset();
		this._fireRowCountChanged();
		return count;
	},
	setJsonRows: function (rows, rowsProp, childrenProp, iconProp) {
		if (!this._checkClientState()) return;
		if (rows) {
			this.beginUpdate();
			try {
				this._clearRows();
				this.refreshFieldFormats();
				var source = new JsonTreeSource(this, this._rootRow);
				this._rowCount = source.load(null, rows, rowsProp, this.getFieldIndex(childrenProp), this.getFieldIndex(iconProp));
			} finally {
				this.endUpdate(false);
			}
		}
		this._tags.setRows();
		this._fireReset();
		this._fireRowCountChanged();
		return this._rowCount;
	},
	setJsonRows2: function (rows, rowsProp, childRowsProp, childrenProp, iconProp) {
		if (!this._checkClientState()) return;
		if (rows) {
			this.beginUpdate();
			try {
				this._clearRows();
				this.refreshFieldFormats();
				var source = new JsonTreeSource(this, this._rootRow);
				this._rowCount = source.load2(null, rows, rowsProp, childRowsProp, childrenProp, iconProp);
			} finally {
				this.endUpdate(false);
			}
		}
		this._tags.setRows();
		this._fireReset();
		this._fireRowCountChanged();
		return this._rowCount;
	},
	appendDataRows: function (parent, rows, treeField, needSorting, childrenField, iconField) {
		if (!this._checkClientState()) return;
		var cnt = 0,
			tfield = this.getFieldIndex(treeField);
		if (tfield >= 0) {
			var source = new ArrayTreeSource(this, this._rootRow);
			source.checkParentProc = this.checkParentProc;
			this.beginUpdate();
			try {
				this.refreshFieldFormats();
				cnt = source.load(parent, rows, tfield, needSorting, this.getFieldIndex(childrenField), this.getFieldIndex(iconField));
			} finally {
				this.endUpdate(false);
				if (cnt > 0) {
					var newRows = source.insertedRows();
					if (newRows && (cnt = newRows.length) > 0) {
						this._rowsAdded(parent, newRows);
					}
				}
				source = null;
			}
		}
		return cnt;
	},
	appendCsvRows: function (parent, rows, treeField, needSorting, childrenField, iconField) {
		if (!this._checkClientState()) return;
		var source,
			count = 0,
			tfield = this.getFieldIndex(treeField);
		if (tfield >= 0) {
			this.beginUpdate();
			try {
				this._clearRows();
				this.refreshFieldFormats();
				source = new CsvTreeSource(this, this._rootRow);
				source.checkParentProc = this.checkParentProc;
				count = source.load(parent, rows, tfield, needSorting, this.getFieldIndex(childrenField), this.getFieldIndex(iconField));
				this._checkSum(count);
			} finally {
				this.endUpdate(false);
			}
		}
		this._tags.setRows();
		this._fireReset();
		this._fireRowCountChanged();
		return count;
	},
	appendXmlRows: function (parent, rows, rowElement, childrenField, iconField) {
		if (!this._checkClientState()) return;
		var cnt = 0;
		if (rows) {
			var source = new XmlTreeSource(this, this._rootRow);
			this.beginUpdate();
			try {
				this.refreshFieldFormats();
				cnt = source.load(parent, rows, rowElement, this.getFieldIndex(childrenField), this.getFieldIndex(iconField));
			} finally {
				this.endUpdate(false);
				if (cnt > 0) {
					var newRows = source.insertedRows();
					if (newRows && (cnt = newRows.length) > 0) {
						this._rowsAdded(parent, newRows);
					}
				}					
				source = null;
			}
		}
		this.fireRowCountChanged();
		return cnt;
	},
	appendJsonRows: function (parent, rows, rowsProp, childrenField, iconField) {
		if (!this._checkClientState()) return;
		var cnt = 0;
		if (rows) {
			var source = new JsonTreeSource(this, this._rootRow);
			this.beginUpdate();
			try {
				this.refreshFieldFormats();
				cnt = source.load(parent, rows, rowsProp, this.getFieldIndex(childrenField), this.getFieldIndex(iconField));
			} finally {
				this.endUpdate(false);
				if (cnt > 0) {
					var newRows = source.insertedRows();
					if (newRows && (cnt = newRows.length) > 0) {
						this._rowsAdded(parent, newRows);
					}
				}					
				source = null;
			}
		}
		this._fireRowCountChanged();
		return cnt;
	},
	setIconIndex: function (row, value) {
		if (row instanceof TreeDataRowImpl && row.iconIndex() != value) {
			row._setIconIndex(value);
			return true;
		} else if (row.iconIndex() != value) {
			row.setIconIndex(value);
			return true;
		}
		return false;
	},
	setHasChildren: function (row, value) {
		if (row instanceof TreeDataRow && row.hasChildren() != value) {
			row._setHasChildren(value);
			return true;
		} else if (row.hasChildren() != value) {
			row._setHasChildren(value);
			return true;
		}
		return false;
	},
	getAllRows: function () {
		var rows = [];
		return rows;
	},
	getJsonRows: function (rowId, rowsProp, childrenProp) {
		var rows = [];
		return rows;
	},
	getChildCount: function (parent) {
		var p = parent || this._rootRow;
		return p.count();
	},
	getRows: function (parent) {
		var p = parent ? parent : this._rootRow;
		return p.children();
	},
	getDescendantCount: function (parent) {
		var p = parent || this._rootRow;
		return p.descendantCount();
	},
	getDescendants: function (parent, maxLevel) {
		function collectRows(p, rows, maxLevel) {
			var i, row;
			var cnt = p.count();
			for (i = 0; i < cnt; i++) {
				rows.push(row = p.getChild(i));
				if (maxLevel > row.level()) {
					collectRows(row, rows, maxLevel);
				}
			}
		}
		maxLevel = arguments.length > 1 ? maxLevel : 0;
		var p = parent || this._rootRow;
		if (maxLevel <= 0) {
			return p.descendants();
		} else if (maxLevel > p.level()) {
			var rows = [];
			collectRows(p, rows, maxLevel);
			return rows;
		} else {
			return null;
		}
	},
	getRow: function (parent, index) {
		var p = parent || this._rootRow;
		return p.getChild(index);			
	},
	hasData: function (rowId) {
		return this.rowById(rowId) != null;
	},
	rowById: function (rowId) {
		var row = this._rowMap[rowId];
		if (!row) {
			row = this._findRowById(rowId);
			if (row) {
				this._rowMap[rowId] = row;
			}
		}
		return row;
	},
	createRow: function (values, iconIndex, hasChildren) {
		var row = null;
		this.refreshFieldFormats();
		if (_isArray(values)) {
			row = new TreeDataRowImpl(this, values);
		} else if (values) {
			var vals = new Array(this.fieldCount());
			for (var prop in values) {
				var fld = this.getFieldIndex(prop);
				if (fld >= 0) {
					vals[fld] = values[prop];
				}
			}
			row = new TreeDataRowImpl(this, vals);
		}
		if (row) {
			this.$_internalCalculateValues(row._values, row.rowId());
			row._iconIndex = iconIndex;
			row._hasChildren = hasChildren;
		}
		return row;
	},
	clearRows: function () {
		if (!this._checkClientState()) return;
		this._clearRows();
		if (this._eventLock <= 0) {
			this._fireRefresh();
			this._fireRowCountChanged();
		}
	},
	removeRows: function (rows) {
		function checkOrphaned(row, from) {
			for (var i = from; i >= 0; i--) {
				if (rows[i].isAncestorOf(row)) {
					return false;
				}
			}
			return true;
		}
		if (!this._checkClientState()) return;
		if (!rows || rows.length < 1) {
			return;
		}
		rows.sort(function (row1, row2) {
			return row1.level() - row2.level();
		});
		var orgRows = rows; // splice 이전 값 저장
		var i, row, st;
		for (i = rows.length; i--;) {
			if (rows[i].level() > 1 && !checkOrphaned(rows[i], i - 1)) {
				rows.splice(i, 1);
			}
		}
		if (rows.length < 1 || !this._rowsRemoving(rows)) {
			return false;
		}
		if (this._softDeleting && this._checkStates) {
			var changed,
				stateRows = [];
			for (i = rows.length - 1; i >= 0; i--) {
				row = rows[i];
				st = row.rowState();
				changed = false;
				switch (st) {
					case RowState.CREATED:
						if (!this.isDeleteCreated()) {
							changed = row._changeRowState(RowState.CREATE_AND_DELETED, false);
							rows.splice(i, 1);
						}
						break;
					case RowState.DELETED:
					case RowState.CREATE_AND_DELETED:
						rows.splice(i, 1);
						break;
					default: 
						changed = row._changeRowState(RowState.DELETED, true);
						rows.splice(i, 1);
						break;
				}
				if (changed) {
					stateRows.push(row);
				}
			}
			if (stateRows.length > 0) {
				this._fireRowStatesChanged(stateRows);
			}
		}
		this.deleteRows(orgRows);
		return true;
	},
	deleteRows: function (rows) {
		if (!this._checkClientState()) return;
		if (rows && rows.length > 0) {
			var saveSoftDeleting = this._softDeleting;
			this.beginUpdate();
			try {
				this._softDeleting = false;
				this._tagLock = true;
				try {
					for (var i = rows.length - 1; i >= 0; i--) {
						var row = rows[i];
						var p = row && row.parent();
						p = p._removeChild(row, true);
					}
				} finally {
					this._tagLock = false;
				}
			} finally {
				this._softDeleting = saveSoftDeleting;
				this.endUpdate(false);
			}
			this._rowsRemoved(rows);
		}
	},
	moveRowSibling: function (row, delta) {
		if (!(row instanceof TreeDataRow))
			throw new TypeError("row is not TreeDataRow.");
		if (delta == 0)
			return false;

		if (!this._checkClientState()) return false;

		var parent = row.parent();
		var count = parent.children().length;
		var index = row.index();
		var newIndex = Math.min(Math.max(index+delta,0),count-1);
		delta = newIndex - index;
		if (delta == 0)
			return false;

		if (this._fireRowSiblingMoving(row, delta)) {
			parent._moveChild(index, newIndex);
			this._fireRowSiblingMoved(row, delta);
			return true;
		}
		return false;
	},
	changeRowParent: function (row, parent, childIndex) {
		if (!(row instanceof TreeDataRow))
			throw new TypeError("row is not TreeDataRow.");
		if (!(row instanceof TreeDataRow))
			throw new TypeError("parent is not TreeDataRow.");
		if (row === parent) 
			throw new Error("parent must not be self.");
		if (row.isAncestorOf(parent))
			throw new Error("can`t move to child of descendant.");
		var old = row.parent();

		if (old === parent && childIndex == row.index()) 
			return false;
		if (!this._checkClientState()) return false;	
		
		if (!parent._children)
			parent._children = [];
		var count = parent._children.length;
		childIndex = Math.min(Math.max(childIndex,0),count);

		if (this._fireRowParentChanging(row, parent, childIndex)) {
			row._changeParent(parent, childIndex);

			if (!(parent instanceof RootTreeRow))
				this.setHasChildren(parent, true);
			if (!(old instanceof RootTreeRow) && old.count() == 0)
				this.setHasChildren(old, false);

			this._fireRowParentChanged(row, parent, childIndex);
			return true;
		}
		return false;
	},
	getRowState: function (rowId) {
		var row = this.rowById(rowId);
		return row ? row.rowState() : RowState.NONE;
	},
	setRowState: function (rowId, newState, force) {
		var row = this.rowById(rowId);
		if (row && (this._checkStates || force)) {
			var state = row.rowState();
			if (newState != state) {
				row._changeRowState(newState, true);
			}
		}
	},
	changeRowStates: function (rows, newState) {
		var i, row;
		var	cnt = rows.length;
		var	changed = [];
		for (i = 0; i < cnt; i++) {
			row = rows[i];
			if (row._changeRowState(newState, false)) {
				changed.push(row);
			}
		}
		if (changed.length > 0) {
			this._fireRowStatesChanged(changed);
		}
	},
	clearRowStates: function (deleteRows, fireStateEvents) {
		if (!this._checkClientState()) return;
		this._rootRow.clearRowStates(deleteRows, fireStateEvents);
	},
	setRowStates: function (rows, state, force, rowEvents) {
		if (!this._checkClientState()) return;
		var i, row,
			changedRows = rowEvents ? null : [],
			cnt = rows.length;
		for (i = 0; i < cnt; i++) {
			row = this.rowById(rows[i]);
			if (row) {
				if (this._checkStates || force) {
					if (row._changeRowState(state, rowEvents) && !rowEvents) {
						changedRows.push(row);
					}
				}
			}
		}
		if (!rowEvents && changedRows.length > 0) {
			this._fireRowStatesChanged(changedRows);
		}
	},
	$_collectStateRows: function (row, state, rows) {
		var i, child,
			cnt = row.count();
		for (i = 0; i < cnt; i++) {
			child = row.getChild(i);
			if (child.rowState() == state) {
				rows.push(child.rowId());
			}
			this.$_collectStateRows(child, state, rows);
		}
	},
	getStateRows: function (state) {
		var rows = [];
		this.$_collectStateRows(this._rootRow, state, rows);
		return rows;
	},
	$_collectAllStateRows: function (row, rows) {
		var i, child,
			cnt = row.count();
		for (i = 0; i < cnt; i++) {
			child = row.getChild(i);
			switch (child.rowState()) {
				case RowState.CREATED:
					rows.created.push(child.rowId());
					break;
				case RowState.UPDATED:
					rows.updated.push(child.rowId());
					break;
				case RowState.DELETED:
					rows.deleted.push(child.rowId());
					break;
				case RowState.CREATE_AND_DELETED:
					rows.createAndDeleted.push(child.rowId());
					break;
			}
			this.$_collectAllStateRows(child, rows);
		}
	},
	getAllStateRows: function () {
		var rows = {
				created: [],
				updated: [],
				deleted: [],
				createAndDeleted: []
			};
		this.$_collectAllStateRows(this._rootRow, rows);
		return rows;
	},
	$_getRowStateCount: function (row, states) {
		var i,
			cnt = row.count(),
			count = 0;
		for (i = 0; i < cnt; i++) {
			var child = row.getChild(i);
			if (states.indexOf(child.rowState()) >= 0) {
				count++;
			}
			count += this.$_getRowStateCount(child, states);
		}
		return count;
	},
	getRowStateCount: function (states) {
		return this.$_getRowStateCount(this._rootRow, states);
	},
	restoreUpdatedStates: function (rows) {
		if (!this._checkClientState()) return;
		var row;
		if (_isArray(rows) && rows.length == 1) {
			row = this.rowById(rows[0]);
			if (row && row.$_restoreRow(false, null)) {
				this._fireRowStateChanged(row);
			}
		} else {
			var list = [];
			if (_isArray(rows)) {
				for (var i = rows.length; i--;) {
					row = this.rowById(rows[i]);
					if (row) {
						row.$_restoreRow(false, list);
					}
				}
			} else if (rows) {
				row = this.rowById(rows);
				if (row) {
					row.$_restoreRow(false, null);
					this._fireRowStateChanged(row);
				}
			} else {
				this._rootRow.$_restoreRow(true, list);
			}
			if (list.length == 1) {
				this._fireRowStateChanged(list[0]);
			} else if (list.length > 1) {
				this._fireRowStatesChanged(list);
			}
		}
	},
	restoreUpdatedRows: function (rows) {
		if (!this._checkClientState()) return;
		var row;
		if (_isArray(rows) && rows.length == 1) {
			row = this.rowById(rows[0]);
			if (row && row.$_restoreRow(false, null)) {
				this._fireRowStateChanged(row);
			}
		} else {
			var list = [];
			if (_isArray(rows)) {
				for (var i = rows.length; i--;) {
					row = this.rowById(rows[i]);
					if (row) {
						row.$_restoreRow(false, list);
					}
				}
			} else if (rows || rows == 0) {
				row = this.rowById(rows);
				if (row) {
					row.$_restoreRow(false, list);
					this._fireRowStateChanged(row);
				}
			} else {
				this._rootRow.$_restoreRow(true, list);
			}
			if (list.length == 1) {
				this._fireRowStateChanged(list[0]);
			} else if (list.length > 1) {
				this._fireRowStatesChanged(list);
			}
		}
	},
	getUpdatedCells: function (rows) {
		var mode = this.restoreMode();
		if ( !(mode == RestoreMode.AUTO || mode == RestoreMode.EXPLICIT)) return null;
		if (rows == null) {
			rows = this.getStateRows(RowState.UPDATED);
		} else if (!_isArray(rows)) {
			if (typeof rows == "number") {
				rows = [rows];
			} else {
				return null;
			}
		}
		if (!_isArray(rows)) {
			return null;
		}
		var ret = [];
		for (var i=0,cnt=rows.length; i < cnt; i++) {
			var row = this.rowById(rows[i]);
			if (row) {
				var updatedCells = row.$_getUpdatedCells();
				if (updatedCells && updatedCells.length > 0) {
					ret.push({
						__rowId:row._rowId,
						updatedCells:updatedCells
					})
				}
			}
		}
		return ret;
	},
	canUpdateRow: function (row) {
		return true;
	},
	canInsertRow: function (row) {
		return true;
	},
	canDeleteRow: function (row) {
		return true;
	},
	equalValues: function (field, row1, row2) {
		if (row1 !== row2) {
			var fld = this._fields[field];
			var v1 = row1.getValue(field);
			var v2 = row2.getValue(field);
			return fld.equalValues(v1, v2);
		} else {
			return true;
		}
	},
    sameValues: function (field, row1, row2) {
        if (row1 !== row2) {
            var fld = this._fields[field];
            var v1 = row1.getValue(field);
            var v2 = row2.getValue(field);
            return fld.sameValues(v1, v2);
        } else {
            return true;
        }
    },
	compareValues: function (field, row1, row2) {
		if (row1 !== row2) {
			var v1 = row1.getValue(field);
			var v2 = row2.getValue(field);
			if (v1 === null) {
				return (v2 === null) ? 0 : -1;
			}
			if (v2 === null) {
				return 1;
			}
			return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
		} else {
			return 0;
		}
	},
	compareNumbers: function (field, row1, row2) {
		if (row1 !== row2) {
			var v1 = row1.getValue(field);
			var v2 = row2.getValue(field);
			if (isNaN(v1)) {
				return (isNaN(v2)) ? 0 : -1;
			}
			if (isNaN(v2)) {
				return 1;
			}
			return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
		} else {
			return 0;
		}
	},
	compareDates: function (field, row1, row2) {
		if (row1 !== row2) {
			var v1 = row1.getValue(field);
			var v2 = row2.getValue(field);
			if (!(v1 instanceof Date)) {
				return !(v2 instanceof Date) ? 0 : -1;
			}
			if (!(v2 instanceof Date)) {
				return 1;
			}
			return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
		} else {
			return 0;
		}
	},
	compareBools: function (field, row1, row2) {
		if (row1 !== row2) {
			var v1 = row1.getValue(field);
			var v2 = row2.getValue(field);
			return (v1 && !v2) ? 1 : (!v1 && v2) ? -1 : 0;
		} else {
			return 0;
		}
	},
	toTreeString: function () {
		return this._rootRow.toTreeString();
	},
	rootRow: function () {
		return this._rootRow;
	},
	rowCount: function () {
		return this._rootRow._descendantCount;
	},
	immediateUpdate: function () {
		return true;
	},
	isSummarized: function () {
		return true;
	}, 
	beginUpdate: function () {
		this._checkClientState();
		this._eventLock++;
	},
	endUpdate: function (refresh) {
		this._checkClientState();
		refresh = arguments.length > 0 ? refresh : true;
		this._eventLock = Math.max(0, this._eventLock - 1);
		if (this._eventLock == 0) {
			if (refresh) {
				if (this._resetLock > 0) {
					this._fireReset();
				} else {
					this._fireRefresh();
				}
				if (this._countDirty) {
					this._fireRowCountChanged();
				}
			}				
			this._resetLock = 0;
			this._countDirty = false;
		}
	},
	findRow: function (fields, values) {
		if (fields && fields.length > 0 && values && values.length >= fields.length) {
			var row = this._rootRow.findChild(fields, values);
			return row;
		}
		return null;
	},
	setOptions: function (options) {
		this._super(options);
	},
	getOptions: function () {
		var options = this._super();
		_extend(options, {
		});
	},
	_doCheckStatesChanged: function () {
		this.$_resetOrgValues();
	},
	_doRestoreModeChanged: function (oldMode, newMode) {
		this.$_resetOrgValues();
	},
	$_getSortedRows: function (field) {
		var compFunc;
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
		var rows = this.getDescendants(this._rootRow, 0);
		this.$_sortRows(rows, field, compFunc.bind(this), 0, rows.length - 1);
		return rows;
	},
	getDistinctValues: function (field, maxCount) {
		maxCount = arguments.length > 1 ? maxCount : -1;
		this._checkFieldIndex(field);
		var values = [];
		if (maxCount < 0) {
			maxCount = this.getDescendantCount(this._rootRow);
		}
		if (maxCount > 0) {
			var isNum = this.getField(field).dataType() == ValueType.NUMBER;
			var rows = this.$_getSortedRows(field);
			values.push(rows[0]._values[field]);
			for (var i = 1, cnt = rows.length; i < cnt; i++) {
				if (!this.equalValues(field, rows[i - 1], rows[i])) {
					var value = rows[i]._values[field];
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
	_doFieldsReset: function () {
		this._super();
		this._clearRows();
		this._fireReset();
	},
	refreshClients: function () {
		this._fireRefreshClient();
	},
	hasData: function (rowId) {
		return this.rowById(rowId);
	},
	savePoint: function (saveStates) {
		if (!this._checkClientState()) return;
		saveStates = arguments.length > 0 ? saveStates : true;
        var flds = this._fields.length;
        if (flds > 0 && this._rootRow.count() > 0) {
            var root = this._rootRow.copy();
            var i = this._nextPoint++;
            if (!saveStates) {
                root.clearRowStates(false, false);
            }
            this._points.push({
                id: i,
                data: root
            });
            return i;
        }
		return -1;
	},
	rollback: function (savePoint) {
        if (!this._checkClientState()) return;
		savePoint = arguments.length > 0 ? savePoint : 0;
        for (var i = this._points.length - 1; i >= 0; i--) {
            var point = this._points[i];
            if (point.id == savePoint) {
                this.$_removeSavePoints(i + 1);
                this._rowMap = [];
                this._rootRow.set(point.data);
                this._fireReset();
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
	equalValues: function (field, row1, row2) {
		if (row1 !== row2) {
			var fld = this._fields[field];
			var v1 = row1.getValue(field);
			var v2 = row2.getValue(field);
			return fld.equalValues(v1, v2);
		} else {
			return true;
		}
	},
	compareValues: function (field, row1, row2) {
		if (row1 !== row2) {
			var v1 = row1.getValue(field);
			var v2 = row2.getValue(field);
			if (v1 === null) {
				return (v2 === null) ? 0 : -1;
			}
			if (v2 === null) {
				return 1;
			}
			return v1 > v2 ? 1 : (v1 < v2) ? -1 : 0;
		} else {
			return 0;
		}
	},
	compareNumbers: function (field, row1, row2) {
		if (row1 !== row2) {
			var v1 = row1.getValue(field);
			var v2 = row2.getValue(field);
			if (isNaN(v1)) {
				return (isNaN(v2)) ? 0 : -1;
			}
			if (isNaN(v2)) {
				return 1;
			}
			return v1 > v2 ? 1 : (v1 < v2) ? -1 : 0;
		} else {
			return 0;
		}
	},
	compareBools: function (field, row1, row2) {
		if (row1 !== row2) {
			var v1 = row1.getValue(field);
			var v2 = row2.getValue(field);
			return (v1 && !v2) ? 1 : (!v1 && v2) ? -1 : 0;
		} else {
			return 0;
		}
	},
	$_summarizeChildren: function (parent, summary) {
		var i;
		var row;
		var v;
		var f = summary.field;
		var cnt = parent.count();
		for (i = 0; i < cnt; i++) {
			row = parent.getChild(i);
			v = row.getValue(f);
			if (!isNaN(v)) {
				summary.sum += v;
				if (v < summary.min) summary.min = v;
				if (v > summary.max) summary.max = v;
			}
			this.$_summarizeChildren(row, summary);
		}
	},
	$_summarizeVars: function (parent, summary) {
		var i;
		var row;
		var v;
		var f = summary.field;
		var avg = summary.avg;
		var cnt = parent.count();
		var vars = 0;
		for (i = 0; i < cnt; i++) {
			row = parent.getChild(i);
			v = row.getValue(f);
			if (!isNaN(v)) {
				vars += Math.pow(v - avg, 2);
			}
			vars += this.$_summarizeVars(row, summary);
		}
		return vars;
	},
	summarize: function (summary, calcVars) {
		if (summary == null) {
			return false;
		}
		summary.clear();
		var count = this.rowCount();
		if (count < 1) {
			return false;
		}
		summary.count = count;
		summary.sum = 0;
		summary.min = Number.MAX_VALUE;
		summary.max = Number.MIN_VALUE;
		this.$_summarizeChildren(this._rootRow, summary);
		summary.avg = summary.sum / summary.count;
		if (calcVars) {
			var vars = this.$_summarizeVars(this._rootRow, summary);
			summary.varsp = vars / summary.count;
			summary.vars = vars / (summary.count - 1);
		}
		return true;
	},
	summarizeRange: function (summary, rows, calcVars) {
		if (summary == null || rows == null) {
			return false;
		}
		summary.clear();
		var count = rows.length;
		if (count < 1) {
			return false;
		}
		var i;
		var row;
		var v;
		var n = 0;
		var f = summary.field;
		var sum = 0;
		var min = NaN;
		var max = NaN;
		i = 0;
		while (i < count) {
			row = rows[i++];
			v = row.getValue(f);
			if (!isNaN(v)) {
				sum = min = max = v;
				n++;
				break;
			}
		}
		while (i < count) {
			row = rows[i++];
			v = row.getValue(f);
			if (!isNaN(v)) {
				sum += v;
				if (v < min) min = v;
				if (v > max) max = v;
				n++;
			}
		}
		summary.count = count;
		if (n > 0) {
			summary.sum = sum;
			summary.min = min;
			summary.max = max;
			summary.avg = sum / count;
			if (calcVars) {
				if (count > 1) {
					var vars = 0;
					var avg = summary.avg;
					for (i = 0; i < count; i++) {
						row = rows[i++];
						v = row.getValue(f);
						if (!isNaN(v)) {
							vars += Math.pow(v - avg, 2);
						}
					}
					summary.varsp = vars / count;
					summary.vars = vars / (count - 1);
				} else {
					summary.varsp = 0;
					summary.vars = 0;
				}
			}
		}
		return true;
	},
	$_resetOrgValues: function () {
		this._needOrgValues = this._checkStates && this._restoreMode != RestoreMode.NONE;
		this._needRestore = this._needOrgValues && this._restoreMode == RestoreMode.AUTO;
		this._rootRow.$_clearOrgValues();
	},
	_findRowById: function (rowId) {
		return this._rootRow.findById(rowId);
	},
	_checkSum: function (count) {
		if (count != this.rowCount()) {
			throw new Error("Invalid row count: " + count + " <> " + this.rowCount());
		}
	},
	_clearRows: function () {
		this._rootRow._removeChildren();
		this._rowMap = [];
		this._nextRowId = 0;
		this._tags.clearRows();
		this._checkSum(0);
	},
	_summarizeChildren: function (parent, field) {
		var i, row, v, 
			f = field.field,
			cnt = parent.count();
		for (i = 0; i < cnt; i++) {
			row = parent.getChild(i);
			v = row.getValue(f);
			if (!isNaN(v)) {
				field.sum += v;
				if (v < field.min) field.min = v;
				if (v > field.max) field.max = v;
			}
			this.summarizeChildren(row, field);
		}
	},
	_summarizeVars: function (parent, field) {
		var i, row, v, 
			f = field.field,
			avg = field.avg,
			cnt = parent.count(),
			vars = 0;
		for (i = 0; i < cnt; i++) {
			row = parent.getChild(i);
			v = row.getValue(f);
			if (!isNaN(v)) {
				vars += Math.pow(v - avg, 2);
			}
			vars += summarizeChildren(row, field);
		}
		return vars;
	},
	_summarize: function (field, calcVars) {
		if (field == null) {
			return false;
		}
		field.clear();
		var count = this.rowCount();
		if (count < 1) {
			return false;
		}
		field.count = 0;
		field.sum = 0;
		field.min = Number.MIN_VALUE;
		field.max = Number.MAX_VALUE;
		this._summarizeChildren(this._rootRow, field);
		field.avg = field.sum / field.count;
		if (calcVars) {
			var vars = this._summarizeVars(this._rootRow, field);
			field.vars = vars / field.count;
		}
		return true;
	},
	summarizeRange: function (field, rows, calcVars) {
		return false;
	},
	_iconIndexChanged: function (row) {
		this._fireIconIndexChanged(row);
	},
	_hasChildrenChanged: function (row) {
		this._fireHasChildrenChanged(row);	
	},
	_stateChanged: function (row) {
		this._fireRowStateChanged(row);
	},
	_valueChanged: function (row, field) {
		this._fireValueChanged(row, field);
	},
	_rowAdding: function (row, index, child) {
		return this._fireRowAdding(row, index, child);
	},
	_rowAdded: function (row) {
		if (!this._tagLock) {
			this._tags.addRow(row);
		}
		if (this._eventLock <= 0) {
			this._fireRowAdded(row);
			this._fireRowCountChanged();
		}
	},
	_rowsAdded: function (parent, rows) {
		if (!this._tagLock) {
			this._tags.addRows(rows);
		}
		if (this._eventLock <= 0) {
			this._fireRowsAdded(parent, rows);
			this._fireRowCountChanged();
		}
	},
	_rowRemoving: function (row) {
		return this._fireRowRemoving(row);
	},
	_rowRemoved: function (row) {
		if (!this._tagLock) {
			this._tags.removeRow(row);
		}
		if (this._eventLock <= 0) {
			this._fireRowRemoved(row);
			this._fireRowCountChanged();
		}
	},
	_rowsRemoving: function (rows) {
		return this._fireRowsRemoving(rows);
	},
	_rowsRemoved: function (rows) {
		if (!this._tagLock) {
			this._tags.removeRows(rows);
		}
		if (this._eventLock <= 0) {
			this._fireRowsRemoved(rows);
			this._fireRowCountChanged();
		}
	},
	_rowCleared: function (row) {
		if (row) {
			var rows = row.children();
			this._tags.removeRows(rows);
			if (this._eventLock <= 0) {
				this._fireRowsRemoved(rows);
				this._fireRowCountChanged();
			}
		}
	},
	_rowUpdating: function (row) {
		return this._fireRowUpdating(row);
	},
	_rowUpdated: function (row) {
		this._tags.updateRow(row);
		if (this._eventLock <= 0) {
			this._fireRowUpdated(row);
		}
	},
	_fireDisposed: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.DISPOSED);
		} 
	},
	_fireReset: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.RESET);
		} 
	},
	_fireRefresh: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.REFRESH);
		} 
	},
	_fireRefreshClient: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.REFRESH_CLIENT);
		} 
	},
	_fireCleared: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.CLEARED);
		} 
	},
	_fireRowCountChanged: function () {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.ROW_COUNT_CHANGED, this.rowCount());
		} 
	},
	_fireRowAdding: function (row, index, child) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(LocalTreeDataProvider.ROW_ADDING, row, index, child);
		}
		return true;
	},
	_fireRowAdded: function (row) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.ROW_ADDED, row);
		} 
	},
	_fireRowsAdded: function (parent, rows) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.ROWS_ADDED, parent, rows);
		} 
	},
	_fireRowRemoving: function (row) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(LocalTreeDataProvider.ROW_REMOVING, row);
		}
		return true;
	},
	_fireRowRemoved: function (row) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.ROW_REMOVED, row);
		} 
	},
	_fireRowsRemoving: function (rows) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(LocalTreeDataProvider.ROWS_REMOVING, rows);
		}
		return true;
	},
	_fireRowsRemoved: function (rows) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.ROWS_REMOVED, rows);
		} 
	},
	_fireRowUpdating: function (row) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(LocalTreeDataProvider.ROW_UPDATING, row);
		} 
		return true;
	},
	_fireRowUpdated: function (row) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.ROW_UPDATED, row);
		} 
	},
	_fireValueChanging: function (row, field, newValue) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(LocalTreeDataProvider.VALUE_CHNAGED, row, field, newValue);
		}
		return true;
	},
	_fireValueChanged: function (row, field) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.VALUE_CHNAGED, row, field);
		} 
	},
	_fireIconIndexChanged: function (row) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.ICON_INDEX_CHANGED, row);
		} 
	},
	_fireHasChildrenChanged: function (row) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.HAS_CHILDREN_CHANGED, row);
		} 
	},
	_fireRowStateChanged: function (row) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.ROW_STATE_CHANGED, row);
		} 
	},
	_fireRowStatesChanged: function (rows) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.ROW_STATES_CHANGED, rows);
		} 
	},
	_fireRowSiblingMoving: function (row, delta) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(LocalTreeDataProvider.ROW_SIBLING_MOVING, row, delta);
		} 
		return true;
	},
	_fireRowSiblingMoved: function (row, delta) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.ROW_SIBLING_MOVED, row, delta);
		} 
	},
	_fireRowParentChanging: function (row, parent, childIndex) {
		if (this._eventLock <= 0) {
			return this.fireConfirmEvent(LocalTreeDataProvider.ROW_PARENT_CHANGING, row, parent, childIndex);
		} 
		return true;
	},
	_fireRowParentChanged: function (row, parent, childIndex) {
		if (this._eventLock <= 0) {
			this.fireEvent(LocalTreeDataProvider.ROW_PARENT_CHANGED, row, parent, childIndex);
		} 
	}
});
LocalTreeDataProvider.DISPOSED = "onTreeDataProviderDisposed";
LocalTreeDataProvider.RESET = "onTreeDataProviderReset";
LocalTreeDataProvider.REFRESH = "onTreeDataProviderRefresh";
LocalTreeDataProvider.REFRESH_CLIENT = "onTreeDataProviderRefreshClient";
LocalTreeDataProvider.CLEARED = "onTreeDataProviderCleared";
LocalTreeDataProvider.ROW_COUNT_CHANGED = "onTreeDataProviderRowCountChanged";
LocalTreeDataProvider.ROW_ADDING = "onTreeDataProviderRowAdding";
LocalTreeDataProvider.ROW_ADDED = "onTreeDataProviderRowAdded";
LocalTreeDataProvider.ROWS_ADDED = "onTreeDataProviderRowsAdded";
LocalTreeDataProvider.ROW_REMOVING = "onTreeDataProviderRowRemoving";
LocalTreeDataProvider.ROW_REMOVED = "onTreeDataProviderRowRemoved";
LocalTreeDataProvider.ROWS_REMOVING = "onTreeDataProviderRowsRemoving";
LocalTreeDataProvider.ROWS_REMOVED = "onTreeDataProviderRowsRemoved";
LocalTreeDataProvider.ROW_UPDATING = "onTreeDataProviderRowUpdating";
LocalTreeDataProvider.ROW_UPDATED = "onTreeDataProviderRowUpdated";
LocalTreeDataProvider.VALUE_CHANGING = "onTreeDataProviderValueChanging";
LocalTreeDataProvider.VALUE_CHNAGED = "onTreeDataProviderValueChanged";
LocalTreeDataProvider.ICON_INDEX_CHANGED = "onTreeDataProviderIconIndexChanged";
LocalTreeDataProvider.HAS_CHILDREN_CHANGED = "onTreeDataProviderHasChildrenChanged";
LocalTreeDataProvider.ROW_STATE_CHANGED = "onTreeDataProviderRowStateChanged";
LocalTreeDataProvider.ROW_STATES_CHANGED = "onTreeDataProviderRowStatesChanged";
LocalTreeDataProvider.ROW_SIBLING_MOVING = "onTreeDataProviderRowSiblingMoving";
LocalTreeDataProvider.ROW_SIBLING_MOVED = "onTreeDataProviderRowSiblingMoved";
LocalTreeDataProvider.ROW_PARENT_CHANGING = "onTreeDataProviderRowParentChanging";
LocalTreeDataProvider.ROW_PARENT_CHANGED = "onTreeDataProviderRowParentChanged";
var /* internal */ LocalTreeDataProviderObserver = defineClass("LocalTreeDataProviderObserver", DataProviderObserver, {
	init: function () {
		this._super();
	},
	onTreeDataProviderDisposed: function (provider) {
	},
	onTreeDataProviderReset: function (provider) {
	},
	onTreeDataProviderRefresh: function (provider) {
	},
	onTreeDataProviderRefreshClient: function (provider) {
	},
	onTreeDataProviderCleared: function (provider) {
	},
	onTreeDataProviderRowCountChanged: function (provider, newCount) {
	},
	onTreeDataProviderRowAdding: function (provider, row, index) {
		return true;
	},
	onTreeDataProviderRowAdded: function (provider, row) {
	},
	onTreeDataProviderRowsAdded: function (provider, parent, rows) {
	},
	onTreeDataProviderRowRemoving: function (provider, row) {
		return true;
	},
	onTreeDataProviderRowRemoved: function (provider, row) {
	},
	onTreeDataProviderRowsRemoving: function (provider, rows) {
		return true;
	},
	onTreeDataProviderRowsRemoved: function (provider, rows) {
	},
	onTreeDataProviderRowUpdating: function (provider, row) {
		return true;
	},
	onTreeDataProviderRowUpdated: function (provider, row) {
	},
	onTreeDataProviderValueChanging: function (provider, row, field, newValue) {
		return true;
	},
	onTreeDataProviderValueChanged: function (provider, row, field) {
	},
	onTreeDataProviderIconIndexChanged: function (provider, row) {
	},
	onTreeDataProviderHasChildrenChanged: function (provider, row) {
	},
	onTreeDataProviderRowStateChanged: function (provider, row) {
	},
	onTreeDataProviderRowStatesChanged: function (provider, rows) {
	},
	onTreeDataProviderRowSiblingMoving: function (provider, row, delta) {
		return true;
	}, 
	onTreeDataProviderRowSiblingMoved: function (provider, row, delta) {
	}, 
	onTreeDataProviderRowParentChanging: function (provider, row, parent, childIndex) {
		return true;
	}, 
	onTreeDataProviderRowParentChanged: function (provider, row, parent, childIndex) {
	}
});