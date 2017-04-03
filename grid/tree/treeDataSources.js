var TreeDataSource = defineClass("TreeDataSource", null, {
	init : function(provider, rootRow) {
		Base.init.call(this, provider, rootRow);
		this._provider = provider;
		this._rootRow = rootRow;
		this._rows = null;
		this._rowCount = 0;
	},
	provider: function () {
		return this._provider;
	},
	rootRow: function () {
		return this._rootRow;
	},
	insertedRows: function () {
		return this._rows;
	},
	insertedCount: function () {
		return this._rowCount;
	},
	_prepareLoad: function (parent) {
		this._rowCount = 0;
		this._rows = [];
	},
	_objectToArray: function (row, provider) {
		var c, fld;
		var flds = provider.fieldCount();
		var vals = new Array(flds);
		for (c = 0; c < flds; c++) {
			fld = provider.getOrgFieldName(c);
			if (row.hasOwnProperty(fld)) {
				vals[c] = row[fld];
			}
		}
		//provider.$_internalCalculateValues(vals, -1);
		return vals;
	},
	_createRow: function (childrenField, iconField, values) {
		var row = new TreeDataRowImpl(this._provider, values);
		this.provider().$_internalCalculateValues(row._values, row.rowId())
		if (childrenField >= 0) {
			this._provider.setHasChildren(row, values[childrenField]);
		} 
		if (iconField >= 0) {
			this._provider.setIconIndex(row, values[iconField]);
		}
		return row;
	},
	_createRow2: function (hasChildren, iconIndex, values) {
		var row = new TreeDataRowImpl(this._provider, values);
		this.provider().$_internalCalculateValues(row._values, row.rowId())
		if (hasChildren !== undefined) {
			this._provider.setHasChildren(row, hasChildren);
		}
		if (iconIndex !== undefined) {
			this._provider.setIconIndex(row, iconIndex);
		}
		return row;
	},
	_rowAdded: function (root, row) {
		this._rowCount++;
		if (this._rows && row.parent() === root) {
			this._rows.push(row);
		}
	},
	_addRow: function (root, parent, childrenField, iconField, values) {
		var row = this._createRow(childrenField, iconField, values);
		parent._insertChild(parent.count(), row, true, true);
		this._rowAdded(root, row);
		return row;
	},
	_addRow2: function (root, parent, hasChildren, iconIndex, values) {
		var row = this._createRow2(hasChildren, iconIndex, values);
		parent._insertChild(parent.count(), row, true, true);
		this._rowAdded(root, row);
		return row;
	}
});
var TreeDataSource$ = TreeDataSource.prototype;
var ArraySourceImpl = defineClass("ArraySourceImpl", TreeDataSource, {
	init : function(provider, rootRow) {
		TreeDataSource$.init.call(this, provider, rootRow);
		this.checkParentProc = null;
	},
	_loadData: function (source, parent, treeField, needSorting, childrenField, iconField) {
		this._prepareLoad(parent);
		if (!source || source.length < 1) {
			return this._rowCount;
		}
		var i, arr,
			provider = this.provider(),
			cnt = source.length,
			rows = [];
		for (i = 0; i < cnt; i++) {
			rows[i] = i;
			if (!_isArray(source[i])) {
				source[i] = this._objectToArray(source[i], provider);
			//} else {
			//	provider.$_internalCalculateValues(source[i]);
			}
		}
		if (needSorting) {
			this.$_sortRows(rows, source, treeField, 0, cnt - 1);
		}
		this.provider().beginUpdate();
		try {
			this.$_buildTree(parent ? parent : this.rootRow(), rows, source, treeField, childrenField, iconField);
		} finally {
			this.provider().endUpdate(false);
		}
		return this.insertedCount();
	},
	$_sortRows: function (rows, values, field, left, right) {
		function compare(r1, r2) {
			var s1 = values[r1][field];
			var s2 = values[r2][field];
			if (s1 == s2) {
				return 0;
			}
			if (s1 < s2) {
				return -1;
			}
			return 1;
		}
		var i, j, m, t, r, v;
		do {
			i = left;
			j = right;
			m = rows[_floor((left + right) / 2)];
			do {
				while (true) {
					r = rows[i];
					v = compare(m, r);
					if (v <= 0)
						break;
					i++;
				}
				while (true) {
					r = rows[j];
					v = compare(m, r);
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
				this.$_sortRows(rows, values, field, left, j);
			}
			left = i;
		} while (left < right);
	},
	$_buildTree: function (parent, rows, values, treeField, childrenField, iconField) {
		function getParent(prev, row, values) {
			var s;
			var tree = values[treeField];
			while (prev != parent) {
				s = prev.getValue(treeField);
				if (this.checkParentProc) {
					if (this.checkParentProc(s, tree)) {
						return prev;
					}
				} else if (tree.indexOf(s) == 0) {
					return prev;
				}
				prev = prev.parent();
			}
			return parent;
		}
		var r = rows[0];
		var row = this._createRow(childrenField, iconField, values[r]);
		var p = getParent(parent, row, values[r]);
		p._insertChild(p.count(), row, true, true);
		this._rowAdded(parent, row);
		if (rows.length > 1) {
			var i, 
				cnt = rows.length,
				prev = row;
			for (i = 1; i < cnt; i++) {
				r = rows[i];
				row = this._createRow(childrenField, iconField, values[r]);
				p = getParent(prev, row, values[r]);
				p._insertChild(p.count(), row, true, true);
				this._rowAdded(parent, row);
				prev = row;
			}
		}
	}
});
var ArraySourceImpl$ = ArraySourceImpl.prototype;
var ArrayTreeSource = defineClass("ArrayTreeSource", ArraySourceImpl, {
	init: function(provider, rootRow) {
		ArraySourceImpl$.init.call(this, provider, rootRow);
	},
	load: function (parent, source, treeField, needSorting, childrenField, iconField) {
		return this._loadData(source, parent, treeField, needSorting, childrenField, iconField);
	}
});
var ArrayTreeSource$ = ArrayTreeSource.prototype;
var CsvTreeSource = defineClass("CsvTreeSource", ArraySourceImpl, {
	init: function(provider, rootRow) {
		ArraySourceImpl$.init.call(this, provider, rootRow);
	},
	load: function (parent, source, treeField, needSorting, childrenField, iconField) {
		var rows = DataHelper.csvToArray(this.provider(), source);
		return this._loadData(rows, parent, treeField, needSorting, childrenField, iconField);
	}
});
var CsvTreeSource$ = CsvTreeSource.prototype;
var JsonTreeSource = defineClass("JsonTreeSource", TreeDataSource, {
	init: function(provider, rootRow) {
		TreeDataSource$.init.call(this, provider, rootRow);
	},
	load: function (parent, source, rowsProp, childrenField, iconField) {
		this._prepareLoad(parent);
		if (source) {
			var rows = DataPath.extractJson(source, rowsProp);
			if (rows && rows.length > 0) {
				this.provider().beginUpdate();
				try {
					this.$_buildTree(this.provider(), parent ? parent : this.rootRow(), rows, rowsProp, childrenField, iconField);
				} finally {
					this.provider().endUpdate(false);
				}
			}
		}
		return this._rowCount;
	},
	load2: function (parent, source, rowsProp, childRowsProp, childrenProp, iconProp) {
		this._prepareLoad(parent);
		if (source) {
			var rows = DataPath.extractJson(source, rowsProp);
			if (rows && rows.length > 0) {
				this.provider().beginUpdate();
				try {
					this.$_buildTree2(this.provider(), parent ? parent : this.rootRow(), rows, childRowsProp, childrenProp, iconProp);
				} finally {
					this.provider().endUpdate(false);
				}
			}
		}
		return this._rowCount;
	},
	$_buildTree: function (provider, parent/*TreeDataRow*/, source, rowsProp, childrenField, iconField) {
		function build(self, p, rows, fldNames) {
			var flds = fldNames.length;
			for (var i = 0, cnt = rows.length; i < cnt; i++) {
				var obj = rows[i];
				var vals = new Array(flds);
				for (var c = 0; c < flds; c++) {
					var fld = fldNames[c];
					if (obj.hasOwnProperty(fld)) {
						vals[c] = obj[fld];
					}
				}
				var row = self._addRow(parent, p, childrenField, iconField, vals);
				if (obj.hasOwnProperty(rowsProp)) {
					var arr = obj[rowsProp];
					if (_isArray(arr) && arr.length > 0)
						build(self, row, arr, fldNames);
				}
			}
		}
		var fldNames = provider.getOrgFieldNames();
		build(this, parent, source, fldNames);
	},
	$_buildTree2: function (provider, parent/*TreeDataRow*/, source, rowsProp, childrenProp, iconProp) {
		function build(self, p, rows, fldNames) {
			var flds = fldNames.length;
			for (var i = 0, cnt = rows.length; i < cnt; i++) {
				var obj = rows[i];
				var vals = new Array(flds);
				for (var c = 0; c < flds; c++) {
					var fld = fldNames[c];
					if (obj.hasOwnProperty(fld)) {
						vals[c] = obj[fld];
					}
				}
				var row = self._addRow2(parent, p, obj[childrenProp], obj[iconProp], vals);
				if (obj.hasOwnProperty(rowsProp)) {
					var arr = obj[rowsProp];
					if (_isArray(arr) && arr.length > 0)
						build(self, row, arr, fldNames);
				}
			}
		}
		var fldNames = provider.getOrgFieldNames();
		build(this, parent, source, fldNames);
	}
});
var JsonTreeSource$ = JsonTreeSource.prototype;
var XmlTreeSource = defineClass("XmlTreeSource", TreeDataSource, {
	init: function(provider, rootRow) {
		TreeDataSource$.init.call(this, provider, rootRow);
	},
	load: function (parent, source, rowsProp, childrenField, iconField) {
		this._prepareLoad(parent);
		if (source) {
			var xml = typeof source === "string" ? _parseXml(source) : source;
			if (xml) {
				var rows = DataPath.extractXml(xml.documentElement, rowsProp);
				if (rows && rows.length > 0) {
					this.provider().beginUpdate();
					try {
						this.$_buildTree(this.provider(), parent ? parent : this.rootRow(), rows, rowsProp, childrenField, iconField);
					} finally {
						this.provider().endUpdate(false);
					}
				}
			}
		}
		return this._rowCount;
	},
	$_buildTree: function (provider, parent/*TreeDataRow*/, source, rowElement, childrenField, iconField) {
		var fields = provider.getFields();
		var fieldNames = provider.getOrgFieldNames();
		function build(self, p, rows) {
			for (var i = 0, cnt = rows.length; i < cnt; i++) {
				var xml = rows[i];
				var vals = DataHelper.xmlToRow(xml, fields, fieldNames);
				var row = self._addRow(parent, p, childrenField, iconField, vals);
				var elts = DataPath.extractXml(xml, rowElement);
				if (elts && elts.length > 0) {
					build(self, row, elts);
				}
			}
		}
		build(this, parent, source, provider.getFields());
	}
});
var XmlTreeSource$ = XmlTreeSource.prototype;