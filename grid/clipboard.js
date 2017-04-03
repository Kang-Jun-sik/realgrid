var /* abstract */ ClipboardData = defineClass("ClipboardData", null, {
	init: function() {
		this._super();
	},
	lastColumn: function () {
		throwAbstractError();
	},
	getText: function (scope, range, format) {
		throwAbstractError();
	},
	getCellText: function (scope, index, format) {
		throwAbstractError();
	},
	getRows: function (scope, data, index) {
		throwAbstractError();
	},
	getCell: function (scope, data, index) {
		throwAbstractError();
	}
});
var ClipboardSource = defineClass("ClipboardSource", null, {
	init: function(data) {
		this._super();
		this._lines = [];
		this._colCount = 0;
		this.$_parseQuoted(data);
	},
	rowCount: function () {
		return this._lines.length;
	},
	colCount: function () {
		return this._colCount;
	},
	isEmpty: function () {
		return this._lines.length == 0 || this._colCount == 0;
	},
	isSingle: function () {
		return this._lines.length == 1 && this._colCount == 1;
	},
	get: function (row) {
		return this._lines[row];
	},
	/*
	$_parse: function (data) {
		var c, quoted, escaped, s;
		var lines = this._lines;
		var line = [];
		var len = data.length;
		var p = 0;
		var i = 0;
		var quoting = false;
		while (i < len) {
			c = data.charAt(i);
			if (quoting) {
				if (c == '"') {
					quoting = false;
				}
			} else if (c == '"') {
				quoting = true;
			} else if (c == "\t") {
				s = data.substring(p, i);
				if (escaped) {
					if (i > 0 && data.charAt(i - 1) == '"') {
						s = s.substring(1, s.length - 1);
					}
					escaped  = false;
				}
				line.push(s);
				p = i + 1;
			} else if (c == "\n") {
				s = data.substring(p, i);
				if (escaped) {
					if (i > 0 && data.charAt(i - 1) == '"') {
						s = s.substring(1, s.length - 1);
					}
					escaped  = false;
				}
				line.push(s);
				lines.push(line);
				line = [];
				p = i + 1;
			} else if (c == "\r" && (i + 1) < len && data.charAt(i + 1) == "\n") {
				s = data.substring(p, i);
				if (escaped) {
					if (i > 0 && data.charAt(i - 1) == '"') {
						s = s.substring(1, s.length - 1);
					}
					escaped  = false;
				}
				line.push(s);
				lines.push(line);
				line = [];
				i++;
				p = i + 1;
			}
			i++;
		}
		if (p < len) {
			s = data.substring(p, len);
			line.push(s);
			lines.push(line);
		}
		for (i = lines.length - 1; i >= 0; i--) {
			line = lines[i];
			this._colCount = Math.max(this._colCount, line.length);
			for (p = line.length - 1; p >= 0; p--) {
				s = line[p];
				if (s && (len = s.length) > 1 && s.charAt(0) == '"' && s.charAt(len - 1) == '"') {
					line[p] = s.substring(1, len - 1);
				}
			}
		}
	}
	*/
	$_parseQuoted: function (data) {
		var c, next;
		var lines = this._lines;
		var line = [];
		var len = data.length;
		var p = 0;
		var i = 0;
		var quoting, started;
		var s = "";
		var nextData;

		while (i < len) {
			nextData = false;
			c = data.charAt(i);
			next = i < len -1 ? data.charAt(i+1) : '';
			
			if (c == '"') {
				if (!started) { // 시작 
					started = true;
					quoting = true;
				} else if (quoting && next == '"') { //quoting 시 따옴표 두개
					s += c;
					i++;
				} else if (quoting) { //quoting 시 따옴표 한개 
					quoting = false;
				} else { //quoting 바깥쪽의 따옴표 
					s += c;
				}
			} else if (!quoting && (c == '\r' || c == '\n' || c == '\t')) {
				if (c == '\t') {
					line.push(s);
					nextData = true;
				}
				if (c == '\r' || c == '\n') {
					// if (s.length > 0)
						line.push(s);
					this._colCount = Math.max(this._colCount, line.length);
					lines.push(line);
					line = [];
					if (next == '\n')
						i++;
				}
				s = "";
				started = false;
			} else {
				started = true;
				s += c;
			}
			
			i++;
		}
		// 개행문자로 끝나지 않은 경우 처리
		if (quoting)
			s = '"' + s;
		if (s.length > 0||nextData)  // \t로 끝나는 경우 다음 cell의 값이 공백...
			line.push(s);
		if (line.length > 0) {
			this._colCount = Math.max(this._colCount, line.length);
			lines.push(line);
		}
	}
});
var DefaultClipboardData = defineClass("DefaultClipboardData", ClipboardData, {
	init: function() {
		this._super();
		this._columns = null;
	},
	lastColumn: function () {
		return this._columns ? this._columns[this._columns.length - 1] : null;
	},
	getText: function (scope, range, format) {
        var grid = scope.grid();
		var cells = this.$_rangeToCells(scope, null, range);
		var rows = [];
		for (var r = range.R1(); r <= range.R2(); r++) {
            var item = grid.getItem(r);
			if (item.dataRow() >= 0 || ItemState.isInserting(item.itemState())) {
				for (var f = 0; f < cells.length; f++) {
					var cols = cells[f];
					var row = [];
					for (var c = 0; c < cols.length; c++) {
						var col = _cast(cols[c], DataColumn);
						if (col && !col._blankWhenCopy) {
							var v = scope.getData(r, col, format);
							row.push(v);
						} else {
							row.push("");
						}
					}
					var s = row.join("\t");
					rows.push(s);
				}
			}
		}
		var data = rows.join("\r\n");
		return data+"\r\n";
	},
	getCellText: function (scope, index, format) {
		var data = scope.getData(index.itemIndex(), index.dataColumn(), format);
		return data+"\r\n";
	},
	getRows: function (scope, data, index) {
		if (!data) {
			return null;
		}
		var source = new ClipboardSource(data);
		if (source.isEmpty()) {
			return null;
		}
		if (source.isSingle()) {
			return source.get(0)[0];
		} else {
			var roots = scope.getDataRoots();
			var idx1 = new CellIndex(index.grid(), index.itemIndex(), index.column().dataRoot());
			var idx2 = new CellIndex(index.grid(), index.itemIndex(), roots[roots.length - 1]);
			var range = GridRange.create(idx1, idx2);
			var cells = this.$_rangeToCells(scope, source, range);
			var row, j, c, line, cols, cnt, r;
			var rows = [];
			var i = 0;
			var len = source.rowCount();
			while (i < len) {
				row = {};
                row.columns = [];
                row.values = [];
				for (j = 0; j < cells.length && i < len; j++, i++) {
					cols = cells[j];
                    line = source.get(i);
					row.columns.push(cols);
					row.values.push(r = []);
					cnt = Math.min(line.length, cols.length);// colCount);
					for (c = 0; c < cnt; c++) {
						if (cols[c]) {
							r.push(line[c]);
						} else {
                            r.push("");
                        }
					}
				}
                rows.push(row);
			}
			return rows;
		}
	},
	getCell: function (scope, data, index) {
		if (!data) {
			return null;
		}
		var source = new ClipboardSource(data);
		return source.isEmpty() ? null : source.get(0)[0];
	},
	$_rangeToCells: function (scope/*ClipboardManager*/, source/*ClipboardSource*/, range) {
		range.normalizeData();
		var fld, r, c, g, col, i, colCount, width, height, w;
		var col1 = range.C1();
		var col2 = range.C2();
		var cells = [];
		var roots = scope.getDataRoots();
		var columns = this._columns = [];
		var c1 = roots.indexOf(col1);
		var c2 = roots.indexOf(col2);
		if (c1 < 0) {
			throw col1.name + " is not data root column.";
		}
		if (c2 < 0) {
			throw col2.name + " is not data root column.";
		}
		for (c = c1; c <= c2; c++) {
			columns.push(roots[c]);
		}
		colCount = columns.length;
		for (width = 0, c = 0; c < columns.length; c++) {
			width += this.$_calcWidth(columns[c]);
			if (source && width >= source.colCount()) {
				width = Math.min(width, source.colCount());
				colCount = c + 1;
				columns.length = colCount;
				break;
			}
		}
		w = 0;
		for (height = 1, c = 0; c < colCount; c++) {
			col = columns[c];
			height = Math.max(height, this.$_calcHeight(col, width - w));
			w += col instanceof ColumnGroup ? col.$_dataWidth : 1;
		}
		for (r = 0; r < height; r++) {
			cells.push([]);
		}
		for (r = 0; r < height; r++) {
			for (i = 0; i < width; i++) {
				cells[r].push(null);
			}
		}
		w = 0;
		for (c = 0; c < colCount; c++) {
			col = columns[c];
			this.$_setFields(col, cells, w, 0);
			w += col instanceof ColumnGroup ? col.$_dataWidth : 1;
		}
		return cells;
	},
	$_calcHeight: function (column, maxWidth) {
		if (maxWidth < 1) {
			return 0;
		}
		var i, cnt, c;
		var h = 1;
		var g = _cast(column, ColumnGroup);
		if (g && (cnt = g.count()) > 0) {
			if (g.isVertical()) {
				h = 0;
				for (i = 0; i < cnt; i++) {
					h += this.$_calcHeight(g.getItem(i), maxWidth);
				}
			} else {
				for (i = 0; i < cnt && maxWidth > 0; i++) {
					c = g.getItem(i);
					h = Math.max(h, this.$_calcHeight(c, maxWidth));
					maxWidth -= c instanceof ColumnGroup ? c.$_dataWidth : 1;
				}
			}
			g.$_dataHeight = h;
		} else if (g) {
			g.$_dataHeight = 1;
		}
		return h;
	},
	$_calcWidth: function (column) {
		var i, cnt;
		var w = 1;
		var g = _cast(column, ColumnGroup);
		if (g && (cnt = g.count()) > 0) {
			if (g.isHorizontal()) {
				w = 0;
				for (i = 0; i < cnt; i++) {
					w += this.$_calcWidth(g.getItem(i));
				}
			} else {
				for (i = 0; i < cnt; i++) {
					w = Math.max(w, this.$_calcWidth(g.getItem(i)));
				}
			}
			g.$_dataWidth = w;
		} else if (g) {
			g.$_dataWidth = 1;
		}
		return w;
	},
	$_setFields: function (column, cells, x, y) {
		var r, c, i, fld, col;
		var g = _cast(column, ColumnGroup);
		if (!g) {
			if (cells[y].length > x) {
				cells[y][x] = _cast(column, DataColumn);
			}
		} else if (g.isVertical()) {
			r = y;
			for (i = 0; i < g.count(); i++) {
				col = g.getItem(i);
				this.$_setFields(col, cells, x, r);
				r += (col instanceof ColumnGroup) ? col.$_dataHeight : 1;
			}
		} else {
			c = x;
			for (i = 0; i < g.count(); i++) {
				col = g.getItem(i);
				this.$_setFields(col, cells, c, y);
				c += (col instanceof ColumnGroup) ? col.$_dataWidth : 1;
			}
		}
	}
});

var ClipboardItem = defineClass("ClipboardItem", GridItem, {
	init: function() {
		this._super();
		this._dataSource = null;
		this._values = null;
		this._dataRow = -1;
	},
	setValues: function (values) {
		this._values = values;
	},
	id: function () {
		return NaN;
	},
	parent: function () {
		return null;
	},
	root: function () {
		return this;
	},
	childIndex: function () {
		return -1;
	},
	level: function () {
		return 1;
	},
	isLeaf: function () {
		return true;
	},
	isVisible: function () {
		return true;
	},
	provider: function () {
		return null;
	},
	dataSource: function () {
		return this._dataSource;
	},
	setDataSource: function (value) {
		this._dataSource = value;
	},
	dataRow: function () {
		return this._dataRow;
	},
	dataId:function() {
		return this.dataSource().getRowId(this._dataRow);		
	},
	setDataRow: function(dataRow) {
		this._dataRow = dataRow;
	},
	rowState: function () {
		return RowState.NONE;
	},
	itemState: function () {
		return ItemState.NORMAL;
	},
	isChecked: function () {
		return false;
	},
	setChecked: function (value) {
	},
	isCheckable: function () {
		return true;
	},
	setCheckable: function (value) {
	},
	isEditable: function () {
		return false;
	},
	isReadOnly: function () {
		return false;
	},
	setReadOnly: function (value) {
	},
	isResizable: function () {
		return false;
	},
	getRowData: function () {
		return null;
	},
	getRowObject: function () {
		var i,
			fld,
			v,
			dataSource = this.dataSource(),
			cnt = dataSource.fieldCount(),
			vals = {};
		for (i = 0; i < cnt; i++) {
			fld = dataSource.getOrgFieldName(i);
			v = this._values[i];
			vals[fld] = v;
		}
		return vals;
	},
	canEdit: function () {
		return false;
	},
	makeVisible: function () {
	},
	getData: function (field) {
		return this._values[field];
	}
});

var ClipboardIndex = defineClass("ClipboardIndex", CellIndex, {
	init: function (grid, item) {
		this._super();
		this._item = item;
	},
	item: function () {
		return this._item;
	}
});

var ClipboardManager = defineClass("ClipboardManager", null, {
	init: function(grid) {
		this._super();
		this._grid = grid;
		this._data = new DefaultClipboardData();
		this._appendingItem = new ClipboardItem();
		this._appendingIndex = new ClipboardIndex(grid, this._appendingItem);
	},
	destroy: function() {
		this._destroying = true;
		this._grid = null;
		this._data = null;
		this._appendingItem = null;
		this._appendingIndex = null;
		this._super();
	},
	grid: function () { 
		return this._grid;
	},
	dataSource: function () {
		return this._dataSource;
	},
	copyEmptyToClipboard: function () {
		return "";
	},
	copyToClipboard: function (range) {
		return this._data.getText(this, range, true);
	},
	copyCellToClipboard: function (index) {
		return this._data.getCellText(this, index, true);
	},
	pasteFromClipboard: function (index, data) {
		this._appendingItem.setDataSource(this._grid && this._grid.dataSource());
		var saveIndex = index.clone();
		index = this.$_checkIndex(index);
		if (!index || !this._grid.isValid(index)) {
			return;
		}
		/*
		var data = null;
		var inner = Clipboard.generalClipboard.hasFormat(DEFAULT_FORMAT);
		if (inner) {
			data = Clipboard.generalClipboard.getData(DEFAULT_FORMAT) as String;
		} else if (Clipboard.generalClipboard.hasFormat(ClipboardFormats.TEXT_FORMAT)) {
			data = Clipboard.generalClipboard.getData(ClipboardFormats.TEXT_FORMAT) as String;
		}
		*/
		if (data != null) {
			var rows = this._data.getRows(this, data, index);
			if (rows != null) {
				if (typeof rows == "string") {
					this.$_pasteSingleCell(index, rows, true);
				} else if (rows.length == 1) {
					this.$_pasteSingleLine(index, rows[0], true);
				} else if (rows.length > 1) {
					this.$_pasteMultiLines(index, rows, true);
				}
			}
		}
		if (!CellIndex.areEquals(index, saveIndex)) {
			this._grid.setFocusedIndex(saveIndex, false, false);
		}
	},
	pasteCellFromClipboard: function (index, data) {
		index = this.$_checkIndex(index);
		if (!index || !this._grid.isValid(index)) {
			return;
		}
		/*
		var data = null;
		var inner = Clipboard.generalClipboard.hasFormat(DEFAULT_FORMAT);
		if (inner) {
			data = Clipboard.generalClipboard.getData(DEFAULT_FORMAT) as String;
		} else if (Clipboard.generalClipboard.hasFormat(ClipboardFormats.TEXT_FORMAT)) {
			data = Clipboard.generalClipboard.getData(ClipboardFormats.TEXT_FORMAT) as String;
		}
		*/
		if (data != null) {
			var s = this._data.getCell(this, data, index);
			this.$_pasteSingleCell(index, s, true);
		}
	},
	getDataRoots: function () {
		return this._grid.getDataRootColumns();
	},
	getData: function (itemIndex, column, format) {
		function _getTextData(cellValue) {
			if (options._lookupDisplay && (column.labelField() || column.isLookupDisplay())) {
				var index = CellIndex.temp(grid, itemIndex, column);
				var gCell = grid.body().getCellSimple(index);
				return gCell.getTextFromItem(item);
			} 
			return cellValue;
		}
        var grid = this._grid;
		var item = grid.getItem(itemIndex);
        var fld, s, v, options;
		if (!item || !(ItemState.isInserting(item.itemState()) || item.dataRow() >= 0)) {
			return "";
		}
		if (column && (fld = grid.dataSource().getField(column.dataIndex())) != null) {
			v = item.getData(column.dataIndex());
			options = this._grid.copyOptions();
			if (format) {
				switch (fld.dataType()) {
					case ValueType.DATETIME:
						if (v) {
							if (options.dateWriter()) {
								s = options.dateWriter().getText(v);
							} else {
								s = v;
							}
						} else {
							s = "";
						}
						break;
					case ValueType.BOOLEAN:
						if (v !== undefined) {
							if (options.boolWriter()) {
								s = options.boolWriter().formatValue(v);
							} else {
								s = v;
							}
						} else {
							s = "";
						}
						break;
					case ValueType.NUMBER:
						if (v !== undefined && !isNaN(v)) {
							s = v;
						} else {
							s = "";
						}
						break;
					default:
						s = _getTextData(v);
						break;
				}
			} else {
				switch (fld.dataType()) {
					case ValueType.DATETIME:
						s = v ? v : "";
						break;
					case ValueType.BOOLEAN:
						s = (v !== undefined) ? v : "";
						break;
					case ValueType.NUMBER:
						s = (v !== undefined && !isNaN(v)) ? v : "";
						break;
					default:
						s = _getTextData(v);
						break;
				}
			}
			s = s ? String(s) : s;
			if (s && ((s.indexOf("\n") >= 0 || s.indexOf("\r\n") >= 0) || s.charAt(0) == '"')) {
				s = s.replace(/\"/g, '""');
				s = '"' + s + '"';
			}
			return s;
		} else {
			return "";
		}
	},
	$_checkIndex: function (index) {
		if (index) {
			index.normalize(this._grid);
			if (this._grid.isValid(index)) {
				if (this._grid.pasteOptions().isSelectionBase()) {
					if (this._grid.selections().count() > 0) {
						var range = this._grid.selections().getItem(0).getBounds();
						var idx = range.firstCell();
						index.setColumn(idx.column());
						index.setItemIndex(idx.itemIndex());
					}
				}
			}
		}
		return index;
	},
	$_createDate: function () {
		return new DefaultClipboardData();
	},
	$_readValue: function (ds, column, s) {
		var v = UNDEFINED;
		var fld = ds.getField(column.dataIndex());
		switch (fld.dataType) {
		case ValueType.NUMBER:
			v = Number(s);
			break;
		case ValueType.DATETIME:
			v = new Date(s);
			break;
		case ValueType.BOOLEAN:
			v = Boolean(s);
			break;
		default:
			v = s;
			break;
		}
		return v;
	},
	$_convertValue: function (ds, options, column, s, vals) {
		var i, readers;
		var v = UNDEFINED;
		var idx = column.dataIndex();
		var fld = ds.getField(idx);
		switch (fld.dataType()) {
		case ValueType.NUMBER:
			v = NaN;
			if (s) {
				var colname = column.name();
				var exp = options.numberCharExpOfCol(colname);
				if (exp) {
					s = s.replace(exp, "");
				}
				var sep = options.numberSeparatorOfCol(colname);
				if (sep) {
					s = s.replace(sep, ".");
				}
				v = parseFloat(s);
			} else if (s == "") {
				v = null;
			}
			break;
		case ValueType.DATETIME:
			v = null;
			readers = options.dateReaders();
			if (s && readers) {
				for (i = 0; i < readers.length; i++) {
					v = readers[i].toDate(s);
					if (v) {
						break;
					}
				}
			}
			if (v === null) {
				v = new Date(s);
				if (isNaN(v.getTime())) {
					v = null;
				}
			}
			if (v === null) {
				v = fld.readValue(s);
			}
			break;
		case ValueType.BOOLEAN:
			v = undefined;
			var boolReader = options.boolReader();
			if (s && boolReader) {
				v = boolReader.toBoolStrict(s);
			}
			if (v === undefined) {
				v = fld.readValue(s);
			}
			break;
		default:
			s = String(s);
			if (s) {
				var editorOptions = column.editorOptions && column.editorOptions();
				var editor = column.editor() && column.editor().toLowerCase();
				if ( editor == "dropdown" && options._checkDomainOnly && editorOptions.domainOnly) {
					if (editorOptions._values && editorOptions._values.length > 0) {
						s = editorOptions._values.indexOf(s) >= 0 ? s : "";
					} else if (column.lookupSource()) {
						var lookupSource = column.lookupSource();
						var flds = column.lookupKeyFieldIds();
						var keys = [];
						for (var i = 0; i < flds.length -1; i++) {
							keys.push(vals[flds[i]]);
						}
						var domain = lookupSource.getTextDomain(keys);
						keys = domain && domain.keys;
						s = keys && keys.indexOf(s) >= 0 ? s : "";
					} else if (column.lookupValues && column.lookupValues() && column.lookupValues().length > 0){
						s = column.lookupValues().indexOf(s) >= 0 ? s : "";
					} else {
						s = "";
					}
				} else if (column.textInputCase() == TextInputCase.LOWER) {
					s = s.toLocaleLowerCase();
				} else if (column.textInputCase() == TextInputCase.UPPER) {
					s = s.toLocaleUpperCase();
				}
			}
			v = s;
		}
		return v;
	},
	$_removeChars: function (s, c) {
		if (c) {
			while (true) {
				var s2 = s.replace(c, "");
				if (s2.length == s.length)
					break;
				s = s2;
			}
		}
		return s;
	},
	$_fireRowsPasted: function (rows) {
		var grid = this._grid;
		var updatedItems = [];
		for (var i = 0; i < rows.length; i++)
			updatedItems.push(grid.getItemIndexOfRow(rows[i]));
		if (updatedItems.length > 0) {
			grid.$_rowsPasted(updatedItems);
		}
	},
	$_pasteSingleCell: function (index, s, convert) {
		var v, item;
		var grid = this._grid;
		var options = grid.pasteOptions();
		var checkReadOnly = options.isCheckReadOnly();
		var ds = grid.dataSource();
		var col = index.dataColumn();
		var items = grid.itemSource();
		var cs = grid.getDataCellStyle(index.dataRow(), col.dataIndex());
        var can = s && ds && col && (( grid.canUpdate(index.item(), col.dataIndex()) && grid.canEdit(index)) || (!cs || cs.calcWritable(col.isWritable())) ) ;

		if (can || !checkReadOnly) {
			if (s.lastIndexOf("\r\n") == s.length - 1) {
				s = s.substr(0, s.length - 2);
			}
			if (s.lastIndexOf("\n") == s.length - 1) {
				s = s.substr(0, s.length - 1);
			}
			v = convert ? this.$_convertValue(ds, options, col, s, index.item() && index.item().getRowData()) : this.$_readValue(ds, col, s);
			if (grid.isItemEditing() || options.isStartEdit() && grid.edit(index)) {
				item = index.item();
                var pasteFlag = !cs ? col.isWritable() : cs.calcWritable(col.isWritable());
                if (!checkReadOnly || pasteFlag) {
					var oldValue = item.getData(index.dataField());
					grid.setCellUpdateEventLock(options.isNoEditEvent());
					try {
						item.setData(col.dataIndex(), v);
					} finally {
						grid.setCellUpdateEventLock(false);
					}
					grid.validateCellCommit(index, index.item().getData(index.dataField()));
					grid.$_editRowPasted(item, [index.dataField()], [oldValue], [v]);
					grid.refreshView();
				}
			} else {
				var vals;
				var validations = grid.validationManager();
				var rowValidation = options.isForceRowValidation();// && grid.validationManager().hasRowValidation();
				var colValidation = options.isForceColumnValidation();
				item = index.item();
				vals = rowValidation || colValidation ? item.getRowData() : [];
                var pasteFlag = !cs ? col.isWritable() : cs.calcWritable(col.isWritable());
                if (!checkReadOnly || pasteFlag) {
					v  = convert ? this.$_convertValue(ds, options, col, s, item && item.getRowData()) : this.$_readValue(ds, col, s);
					vals[col.dataIndex()] = v;
					this._appendingItem.setValues(vals);
					var inserting = ItemState.isInserting(item.itemState());
					this._appendingItem.setDataRow(item.dataRow());
					this._appendingItem.setIndex(item.index());
					this._appendingIndex.setColumn(null);
					this._appendingIndex.setItemIndex(index.itemIndex());
					if (rowValidation) {
						grid.validationManager().hasRowValidation() && grid.validationManager().validateRow(this._appendingItem, false, true);
						grid._fireValidateRow(this._appendingItem, inserting, this._appendingItem.getRowObject());
					}
					if (colValidation) {
						this._appendingIndex.setColumn(col);
						validations.validateCell(this._appendingIndex, false);
						grid._fireValidateCell(this._appendingIndex, false, this._appendingItem.getData(col.dataIndex()));
					}
					grid.updatePastedRow(item, vals, !rowValidation);
                }

			}
		}
	},
	$_pasteSingleLine: function (index, row, convert) {
		var grid = this._grid;
		var items = grid.itemSource();
		var ds = grid.dataSource();
		var rowUpdated = false;
		var options = grid.pasteOptions();
		var checkReadOnly = options.isCheckReadOnly();
		var v, col, item, vals, cols, values, cnt, r, i;
		if (checkReadOnly && !grid._editOptions.isEditable()) {
			return;
		}
		if (ds) {
			if (grid.isItemEditing() || options.isStartEdit() && grid.edit(index)) {
				var fields = [];
				var oldValues = [];
				var saveCol = index.column();
                item = index.item();
                values = [];
                cnt = Math.min(row.columns.length, row.values.length);
                for (r = 0; r < cnt; r++) {
                    cols = row.columns[r];
                    vals = row.values[r];
                    for (i = 0; i < vals.length; i++) {
                        var col = cols[i];
                        var val = vals[i];
                        if (col) {
                            oldValues.push(item.getData(col.dataIndex()));

                            var idx = CellIndex.temp(grid, index.itemIndex(), col);
							var editable = (grid.fixedOptions().isRowEditable() || index.itemIndex() >= grid.layoutManager().fixedItemCount()) && grid.canEdit(idx);
							var readOnly = col.isReadOnly() || (!ItemState.isInserting(item.itemState()) && !grid.canUpdate(item, col.dataIndex()));

                            v = convert ? this.$_convertValue(ds, options, col, val, item && item.getRowData()) : this.$_readValue(ds, col, val);
                            grid.setCellUpdateEventLock(options.isNoEditEvent());
                            try {
								var cs = items.getCellStyle(item.dataRow(), col.dataIndex());
                                var pasteFlag = cs ? cs.calcWritable(editable, readOnly) : editable && !readOnly;
                                if (!checkReadOnly || pasteFlag) {
                                    item.setData(col.dataIndex(), v);
                                }
                            } finally {
                                grid.setCellUpdateEventLock(false);
                            }
                            if (!checkReadOnly || pasteFlag) {
	                            index.column(col);
	                            grid.validateCellCommit(index, index.item().getData(col.dataIndex()));
	                            fields.push(col.dataIndex());
	                            values.push(v);
	                            rowUpdated = true;
	                        }
                        }
                    }
                }
                if (rowUpdated) {
					grid.$_editRowPasted(item, fields, oldValues, values);
					index.column(saveCol);
					grid.refreshView();
                }
			} else {
				var validations = grid.validationManager();
				var rowValidation = options.isForceRowValidation();// && validations.hasRowValidation();
				var colValidation = options.isForceColumnValidation();
				item = index.item();
				values = rowValidation || colValidation ? item.getRowData() : [];
                cnt = Math.min(row.columns.length, row.values.length);
                for (r = 0; r < cnt; r++) {
                    cols = row.columns[r];
                    vals = row.values[r];
                    for (i = 0; i < vals.length; i++) {
                        col = cols[i];
                        if (col) {

							var idx = CellIndex.temp(grid, index.itemIndex(), col);
							var editable = (grid.fixedOptions().isRowEditable() || index.itemIndex() >= grid.layoutManager().fixedItemCount()) && grid.canEdit(idx);
							var readOnly = col.isReadOnly() || (!ItemState.isInserting(item.itemState()) && !grid.canUpdate(item, col.dataIndex()));
							var cs = items.getCellStyle(item.dataRow(), col.dataIndex());
							var pasteFlag = cs ? cs.calcWritable(editable, readOnly) : editable && !readOnly;

                            if (!checkReadOnly || pasteFlag) {
	                            v = convert ? this.$_convertValue(ds, options, col, vals[i], item, item.getRowData()) : this.$_readValue(ds, col, vals[i]);
	                            values[col.dataIndex()] = v;
	                            rowUpdated = true;
                            }
                                
                        }
                    }
                }
                if (rowUpdated) {
                	var inserting = ItemState.isInserting(item.itemState());
					this._appendingItem.setValues(values);
					this._appendingItem.setIndex(item.index());
					this._appendingItem.setDataRow(item.dataRow());
					this._appendingIndex.setColumn(null);
					this._appendingIndex.setItemIndex(index.itemIndex());
					if (rowValidation) {
						validations.hasRowValidation() && validations.validateRow(this._appendingItem, inserting, true);
						grid._fireValidateRow(this._appendingItem, inserting, this._appendingItem.getRowObject());
					}
					if (colValidation) {
						for (i = 0; i < vals.length; i++) {
							this._appendingIndex.setColumn(cols[i]);
							validations.validateCell(this._appendingIndex, inserting);
							grid._fireValidateCell(this._appendingIndex, inserting, this._appendingItem.getData(cols[i].dataIndex()));
						}
					}
					grid.updatePastedRow(item, values, !rowValidation);
                }
			}
			grid.selections().clear();
			grid.selections().add(index, new CellIndex(index.grid(), index.itemIndex(), this._data.lastColumn()), SelectionStyle.BLOCK);
		}
	},
	$_pasteMultiLines: function (index, rows, convert) {
		var grid = this._grid;
		var ds = grid.dataSource();
		if (ds) {
			var items = grid.itemSource();
			var options = grid.pasteOptions();
			var checkReadOnly = options.isCheckReadOnly();
			if (checkReadOnly && !grid._editOptions.isEditable()) {
				return;
			}
			var len = rows.length;
			var idx = index.itemIndex();
			var flds = ds.fieldCount();
			var allColumns = grid.getDataColumns(false);
			var cols = allColumns.length;
			var validations = grid.validationManager();
			var rowValidation = options.isForceRowValidation();// && validations.hasRowValidation();
			var colValidation = options.isForceColumnValidation();
			var appendingItem = this._appendingItem;
            var appendingIndex = this._appendingIndex;
			var r, r2, cnt, i, v, item, row, vals, fld, col, itemCount, values, columns, pasteFlag, cs;
			var eventEachRow = options.isEventEachRow();
			var updatedRows = [];
			if (options.isCommitEdit()) {
				if (!grid.commit(false)) {
					grid.cancel();
				}
			} else {
				grid.cancel();
			}
			itemCount = grid.itemCount();
			appendingItem.setDataSource(ds);
			try {
				for (r = 0; r < len && idx < itemCount; r++) {
					try {
						item = grid.getItem(idx);
						if (item.itemState() == ItemState.APPENDING) {
							break;
						}
						while (item && item.dataRow() < 0) {
							idx++;
							item = grid.getItem(idx);
						}
						if (item == null) {
							break;
						}
						row = rows[r];
	                    vals = rowValidation || colValidation ? item.getRowData() : [];
	                    var rowUpdated = false;
	                    var oldValues = [];
	                    var fields = [];
	                    cnt = Math.min(row.columns.length, row.values.length);
	                    for (r2 = 0; r2 < cnt; r2++) {
	                        columns = row.columns[r2];
	                        values = row.values[r2];
	                        for (i = 0; i < values.length; i++) {
	                            col = columns[i];
	                            if (col) {
	                            	oldValues.push(item.getData(col.dataIndex()));

									var tidx = CellIndex.temp(grid, item.index(), col);
									var editable = (grid.fixedOptions().isRowEditable() || item.index() >= grid.layoutManager().fixedItemCount()) && grid.canEdit(tidx);
									var readOnly = col.isReadOnly() || (!ItemState.isInserting(item.itemState()) && !grid.canUpdate(item, col.dataIndex()));
									var cs = items.getCellStyle(item.dataRow(), col.dataIndex());
									var pasteFlag = cs ? cs.calcWritable(editable, readOnly) : editable && !readOnly;

	                                if (!checkReadOnly || pasteFlag) {
	                                	rowUpdated = rowUpdated || pasteFlag;
	                                    v = convert ? this.$_convertValue(ds, options, col, values[i],item && item.getRowData()) : this.$_readValue(ds, col, values[i]);
	                                    vals[col.dataIndex()] = v;
	                                    fields.push(col.dataIndex());
	                                }
	                            }
	                        }
	                    }
	                    if (rowUpdated) {
							try {
								appendingItem.setValues(vals);
								appendingItem.setIndex(item.index());
								appendingItem.setDataRow(item.dataRow());
								appendingIndex.column(null);
								appendingIndex.setItemIndex(item.index());
								var inserting = ItemState.isInserting(item.itemState());								
								if (rowValidation) {
									validations.hasRowValidation() && validations.validateRow(appendingItem, inserting, true);
									grid._fireValidateRow(appendingItem, inserting, appendingItem.getRowObject());
								}
								if (colValidation) {
		                            for (r2 = 0; r2 < cnt; r2++) {
		                                columns = row.columns[r2];
		                            	for (i = 0; i < cols; i++) {
		                                    col = allColumns[i];
		                                    appendingIndex.column(col);
		                                    validations.validateCell(appendingIndex, inserting);
		                                    grid._fireValidateCell(appendingIndex, inserting, appendingItem.getData(col.dataIndex()));
	                              		}
		                            }
								}
								grid.updatePastedRow(item, vals, !rowValidation);
								if (eventEachRow)
									grid.$_editRowPasted(item, fields, oldValues, vals);
								updatedRows.push(item.dataRow());
							} catch (err) {
								if (options.isStopOnError()) {
									throw err;
								}
							}
						}
						idx++;
					} catch (err) {
						idx = Math.max(index.I(), idx - 1);
						grid.setFocusedIndex(index, false);
						grid.selections().clear();
						grid.selections().add(index, new CellIndex(index.grid(), idx, this._data.lastColumn()), SelectionStyle.BLOCK);
						throw err;
					}
				}
				if (r < len && options.isEnableAppend()) {
					for (; r < len; r++) {
	                    row = rows[r];
	                    vals = [];
	                    try {
	                    	var fields = [];
	                    	cnt = Math.min(row.columns.length, row.values.length);
	                        for (r2 = 0; r2 < cnt; r2++) {
	                            columns = row.columns[r2];
	                            values = row.values[r2];
	                            for (i = 0; i < values.length; i++) {
	                                col = columns[i];
	                            	if (col) {

										var tidx = CellIndex.temp(grid, item.index(), col);
										var editable = (grid.fixedOptions().isRowEditable() || item.index() >= grid.layoutManager().fixedItemCount()) && grid.canEdit(tidx);
										var readOnly = col.isReadOnly() || (!ItemState.isInserting(item.itemState()) && !grid.canUpdate(item, col.dataIndex()));
										var cs = items.getCellStyle(item.dataRow(), col.dataIndex());
										var pasteFlag = cs ? cs.calcWritable(editable, readOnly) : editable && !readOnly;

		                                if (!checkReadOnly || pasteFlag) {
		                                    v = convert ? this.$_convertValue(ds, options, col, values[i], vals) : this.$_readValue(ds, col, values[i]);
		                                    vals[col.dataIndex()] = v;
		                                    fields.push(col.dataIndex());
		                                }
		                            }
	                            }
	                            if (options.isFillColumnDefaults()) {
	                                for (i = 0; i < cols; i++) {
	                                    col = allColumns[i];
	                                    if (vals[col.dataIndex()] === undefined) {
	                                        vals[col.dataIndex()] = col.defaultValue();
	                                    }
	                                }
	                            }
	                            if (options.isFillFieldDefaults()) {
	                                for (i = 0; i < flds; i++) {
	                                    if (vals[i] === undefined) {
	                                        fld = ds.getField(i);
	                                        vals[i] = fld.defaultValue();
	                                    }
	                                }
	                            }
	                        }
	                        try {
	                            appendingItem.setValues(vals);
	                            appendingItem.setDataRow(-1);
	                            appendingItem.setIndex(-1);
								this._appendingIndex.column(null);
								this._appendingIndex.setItemIndex(-1);
	                            if (rowValidation) {
	                                validations.hasRowValidation() && validations.validateRow(appendingItem, true, true);
									grid._fireValidateRow(appendingItem, true, appendingItem.getRowObject());
	                            }
	                            if (options.isForceColumnValidation()) {
	                                for (i = 0; i < cols; i++) {
	                                    col = allColumns[i];
	                                    this._appendingIndex.column(col);
	                                    validations.validateCell(this._appendingIndex, true);
	                                    grid._fireValidateCell(appendingIndex, true, appendingItem.getData(col.dataIndex()));
	                                }
	                            }
	                            grid.appendPastedRow(vals);
	                            var drow = ds.rowCount()-1;
								if (eventEachRow) {
									item = grid.getItem(grid.getItemIndexOfRow(drow));
									grid.$_editRowPasted(item, fields, [], vals);
								}
	                            updatedRows.push(drow);
	                        } catch (err) {
	                            if (options.isStopOnError()) {
	                                throw err;
	                            }
	                        }
	                    } catch (err) {
	                        idx = Math.max(index.I(), grid.itemCount() - 1);
	                        grid.setFocusedIndex(index, false);
	                        grid.selections().clear();
	                        grid.selections().add(index, new CellIndex(index.grid(), idx, this._data.lastColumn()), SelectionStyle.BLOCK);
	                        throw err;
	                    }
	                }
					idx = grid.itemCount();
				}
			} catch (err) {
				this.$_fireRowsPasted(updatedRows);
				throw err;
			}
			this.$_fireRowsPasted(updatedRows);

			grid.setFocusedIndex(index, false);
			grid.selections().clear();
			grid.selections().add(index, new CellIndex(index.grid(), idx - 1, this._data.lastColumn()), SelectionStyle.BLOCK);
		}
	}
});
