var SearchOptions = function (source) {
	this.allFields = true;
	this.caseSensitive = false;
	this.partialMath = false;
	this.regularExpression = false;
	source && _extend(this, source);
};
var SearchCellOptions = function (source) {
	this.fields = null;
	this.caseSensitive = false;
	this.partialMatch = false;
	this.regularExpression = false;
	source && _extend(this, source);
};
var Dimension = defineClass("Dimension", null, {
	init: function (size) {
		this._super();
		this._value = NaN;
		this._valuePercent = false;
		this._minimum = NaN;
		this._minimumPercent = false;
		this._maximum = NaN;
		this._maximumPercent = false;
		if (size) {
			this.setSize(size);
		}
	},
	size: null,
	minSize: null,
	maxSize: null,
	setSize: function (value) {
		if (value != this.size) {
			this._size = value;
			var sz = this.parse(value);
			this._value = sz.value;
			this._valuePercent = sz.percent;
		}
	},
	setMinSize: function (value) {
		if (value != this.minSize) {
			this._minSize = value;
			var sz = this.parse(value);
			this._minimum = sz.value;
			this._minimumPercent = sz.percent;
		}
	},
	setMaxSize: function (value) {
		if (value != this.maxSize) {
			this._maxSize = value;
			var sz = this.parse(value);
			this._maximum = sz.value;
			this._maximumPercent = sz.percent;
		}
	},
	getDimension: function (bounds) {
		var v,
			d = bounds;
		if (!isNaN(this._value)) {
			d = this._value ? (this._valuePercent ? this._value * bounds / 100 : this._value) : 0;
		}
		if (!isNaN(this._minimum)) {
			v = this._minimum ? (this._minimumPercent ? this._minimum * bounds / 100 : this._minimum) : 0;
			d = Math.max(v, d);
		}
		if (!isNaN(this._maximum)) {
			v = this._maximum ? (this._maximumPercent ? this._maximum * bounds / 100 : this._maximum) : 0;
			d = Math.min(v, d);
		}
		return d;
	},
	equals: function (d) {
		return this._value == d._value &&
			this._valuePercent == d._valuePercent &&
			this._minimum == d._minimum &&
			this._minimumPercent == d._minimumPercent &&
			this._maximum == d._maximum &&
			this._maximumPercent == d._maximumPercent;
	},
	toString: function () {
		return this._size || "";
	},
	parse: function (size) {
		var v = { value: NaN, percent:false };
		if (size) {
			size = String(size).trim();
			if (size) {
				var len = size.length;
				v.percent = size.charAt(len - 1) == "%";
				if (v.percent) {
					size = size.substring(0, len - 1);
					len = size.length;
					if (len > 0) {
						v.value = Number(size);	
					}
				} else {
					v.value = Number(size);
				}
			}
		}
		return v;
	}
}, {
	createFrom: function (value) {
		var d = null;
		if (value) {
			var s = value.trim();
			var len = s.length;
			if (len > 0) {
				var arr = s.split(",");
				if (arr.length > 0) {
					s = arr[o] && arr[0].trim();
					if (s) {
						d = new Dimension();
						d.setSize(s);
					}
				}
				if (arr.length > 1) {
					s = arr[1] && arr[1].trim();
					if (s) {
						d = new Dimension();
						d.setMinSize(s);
					}
				}
				if (arr.length > 2) {
					s = arr[2] && arr[2].trim();
					if (s) {
						d = new Dimension();
						d.setMaxSize(s);
					}
				}
			}
		}
		return d;
	},
	areEquals: function (v1, v2) {
		if (v1 === v2) return true;
		if (!v1 || !v2) return false;
		return v1.equals(v2);
	}
});

var CellIndex = defineClass("CellIndex", null, {
	init: function (grid, itemIndex, column, step) {
		this._super();
		this._grid = grid;
		this._itemIndex = isNaN(itemIndex) ? -1 : itemIndex;
		this._column = column;
		this._verticalStep = step ? step : VerticalMovingStep.DEFAULT;
	},
	verticalStep: VerticalMovingStep.DEFAULT,
	grid: function () {
		return this._grid;
	},
	itemIndex: function (value) {
		if (arguments.length > 0) {
			this._itemIndex = value;
			return this;
		} else {
			return this._itemIndex;
		}
	},
	setItemIndex: function (value) {
		this._itemIndex = value;
		return this;
	},
	column: function (value) {
		if (arguments.length > 0) {
			this._column = value;
			return this;
		} else {
			return this._column;
		}
	},
	setColumn: function (value) {
		this._column = value;
	},
	dataColumn: function () {
		return (this._column instanceof DataColumn) && this._column;
	},
	valueColumn: function () {
		return (this._column instanceof ValueColumn) && this._column;
	},
	group: function () {
		return (this._column instanceof ColumnGroup) && this._column;
	},
	I: function () {
		return this._itemIndex;
	},
	C: function () {
		return this._column;
	},
	col: function () {
		return this._column.index();
	},
	dataField: function () {
		return (this._column instanceof DataColumn) ? this._column.dataIndex() : -1;
	},
	item: function () {
		return this._grid && this._grid.getItem(this._itemIndex);
	},
	dataRow: function () {
		var item = this.item();
		return item ? item.dataRow() : -1;
	},
	dataId: function () {
		var item = this.item();
		return item ? item.dataId() : -1;
	},
	value: function () {
		var column = this._column;
		if (column instanceof DataColumn) {
			var fld = column.dataIndex();
			if (fld < 0) {
				throw new Error("Not exists data field: " + column.fieldName());
			}
			var item = this.item();
			if (!item) {
				throw new Error("Invalid item index: " + this._itemIndex);
			}
			return item.getData(fld);
		}
		return UNDEFINED;
	},
	isFixed: function () {
		if (this._grid && this._column) {
			var lm = this._grid.layoutManager();
			var rootIndex = this._column.root().displayIndex();
			return rootIndex < lm.fixedColCount() || rootIndex >= lm.rfixedStartCol() || 
				this._itemIndex < lm.fixedItemCount();
		}
		return false;
	},
    isFixedCol: function () {
        if (this._grid && this._column) {
            var lm = this._grid.layoutManager();
            var rootIndex = this._column.root().displayIndex();
            return rootIndex < lm.fixedColCount();
        }
        return false;
    },
    isRightFixedCol: function () {
        if (this._grid && this._column) {
            var lm = this._grid.layoutManager();
            var rootIndex = this._column.root().displayIndex();
            return rootIndex >= lm.rfixedStartCol();
        }
        return false;
    },
    isFixedRow: function () {
        if (this._grid && this._column) {
            var lm = this._grid.layoutManager();
            return this._itemIndex < lm.fixedItemCount();
        }
        return false;
    },
	isTop: function () {
		var column = this._column;
		if (column && column.group()) {
			return ColumnGroup.isTop(column);
		} else {
			return true;
		}
	},
	isBottom: function () {
		var column = this._column;
		if (column && column.group()) {
			return ColumnGroup.isBottom(column);
		} else {
			return true;
		}
	},
	isLeft: function () {
		var column = this._column;
		if (column) {
			if (column.group()) {
				return column.group().displayIndex() == 0 && ColumnGroup.isLeft(column); 
			} else {
				return column.displayIndex() == 0;
			}
		}
		return false;
	},
	isRight: function () {
		var column = this._column;
		if (column) {
			if (column.group()) {
				return column.group().displayIndex() == 0 && ColumnGroup.isRight(column); 
			} else {
				return column.displayIndex() == this._grid.visibleColumnCount() - 1;
			}
		}
		return false;
	},
    isFirst: function () {
        if (this._column) {
            if (this._grid && this._grid.visibleColumnCount() > 0) {
                var column = this._grid.getVisibleColumn(0);
                column = column instanceof ValueColumn ? column : column.root().first();
                return column == this._column;
            }
        }
        return false;
    },
    isLast: function () {
        if (this._column) {
            if (this._grid && this._grid.visibleColumnCount() > 0) {
                var column = this._grid.getVisibleColumn(this._grid.visibleColumnCount() - 1);
                column = column instanceof ValueColumn ? column : column.root().last();
                return column == this._column;
            }
        }
        return false;
    },
	editable: function () {
		var item = this.item();
		return item && (item.dataRow() >= 0 || item.itemState() == ItemState.INSERTING || item.itemState() == ItemState.APPENDING);
	},
	clone: function () {
		return new CellIndex(this._grid, this._itemIndex, this._column, this._verticalStep);
	},
	assign: function (source) {
		if (source) {
			source.grid && (this._grid = source._grid);
			this._itemIndex = source._itemIndex;
			this._column = source._column;
			this._verticalStep = source._verticalStep;
		} else {
			this._itemIndex = -1;
			this._column = null;
		}
		return this;
	},
	proxy: function () {
		return {
			itemIndex: isNaN(this._itemIndex) ? -1 : this._itemIndex,
			column: (this._column ? this._column.name() : null),
			dataRow: this.dataRow(),
			fieldIndex: (this.dataColumn() ? this._column.dataIndex() : -1),
			fieldName: (this.dataColumn() ? this._column.fieldName() : null)
		};
	},
	set: function (grid, itemIndex, column) {
		if (arguments.length >= 3) {
			this._grid = grid;
			this._itemIndex = itemIndex;
			this._column = column;
		} else if (arguments.length == 2) {
			this._itemIndex = grid;
			this._column = itemIndex;
		}
	},
	isValid: function () {
		return this._grid && this._grid.isValid(this);
	},
	normalize: function (grid) {
		if (grid) {
			this._grid = grid;
			if (!this._column) {
				this._column = grid.getFirstColumn();
			}
			this._itemIndex = Math.max(0, Math.min(this._itemIndex, grid.itemCount() - 1));
		}
		return this;
	},
	isMath: function (dataRow, column) {
		if (this._column === column) {
			var item = this.item();
			if (dataRow >= 0) {
				return item && item.dataRow() == dataRow;
			} else {
				return !item || item.dataRow() == dataRow;
			}
		}
		return false;
	},
	incRow: function (delta) {
		if (this._grid) {
			this._itemIndex = Math.max(0, Math.min(this._grid.itemCount() - 1, this._itemIndex + delta));
		}
	},
	first: function () {
		if (this._grid) {
			this._itemIndex = 0;
		}
	},
	last: function () {
		if (this._grid) {
			this._itemIndex = this._grid.itemCount() - 1;
		}
	},
	right: function () {
		var column = $$_cellIndex_getRight(this._grid, this._column);
		if (column) {
			this._column = column;
		}
	},
	left: function () {
		var column = $$_cellIndex_getLeft(this._grid, this._column);
		if (column) {
			this._column = column;
		}
	},
	next: function () {
		var column = $$_cellIndex_getNext(this._grid, this._column);
		if (column) {
			this._column = column;
			return true;
		}
		return false;
	},
	prev: function () {
		var column = $$_cellIndex_getPrev(this._grid, this._column);
		if (column) {
			this._column = column;
			return true;
		}
		return false;
	},
	lower: function (editing) {
		if (this._verticalStep === VerticalMovingStep.ROW && !editing) {
			if (this._itemIndex < this._grid.itemCount() - 1) {
				this.incRow(1);
				return true;
			} else {
				return false;
			}
		} else if (this._verticalStep === VerticalMovingStep.CELL) {
			if (this.isBottom()) {
				if (this._itemIndex < this._grid.itemCount() - 1) {
					this.incRow(1);
					this._column = ColumnGroup.getTop(this._column);
					return true;
				} else {
					return false;
				}
			} else {
				this._column = ColumnGroup.getLower(this._column);
				return true;
			}
		} else {
			if (this.isBottom()) {
				if (this._itemIndex < this._grid.itemCount() - 1) {
					this.incRow(1);
					return true;
				} else {
					return false;
				}
			} else {
				this._column = ColumnGroup.getLower(this._column);
				return true;
			}
		}
	},
	upper: function (editing) {
		if (this._verticalStep === VerticalMovingStep.ROW && !editing) {
			if (this._itemIndex > 0) {
				this.incRow(-1);
				return true;
			} else {
				return false;
			}
		} else if (this._verticalStep === VerticalMovingStep.CELL) {
			if (this.isTop()) {
				if (this._itemIndex > 0) {
					this.incRow(-1);
					this._column = ColumnGroup.getBottom(this._column);
					return true;
				} else {
					return false;
				}
			} else {
				this._column = ColumnGroup.getUpper(this._column);
				return true;
			}			
		} else {				
			if (this.isTop()) {
				if (this._itemIndex > 0) {
					this.incRow(-1);
					return true;
				} else {
					return false;
				}
			} else {
				this._column = ColumnGroup.getUpper(this._column);
				return true;
			}
		}
	},
	home: function () {
		var grid = this._grid;
		if (grid && grid.visibleColumnCount() > 0) {
			var column = grid.getVisibleColumn(0);
			this._column = column instanceof ValueColumn ? column : column.root().first();
		}
	},
	end: function () {
		var grid = this._grid;
		if (grid && grid.visibleColumnCount() > 0) {
			var column = grid.getVisibleColumn(grid.visibleColumnCount() - 1);
			this._column = column instanceof ValueColumn ? column : column.root().last();
		}
	},
	down: function (editing) {
		if ((this._verticalStep == VerticalMovingStep.ROW && !editing) || this.isBottom()) {
			if (this._itemIndex < this._grid.itemCount() - 1) {
				this.incRow(1);
				if (this._verticalStep == VerticalMovingStep.CELL)
					this._column = ColumnGroup.getTop(this._column);
			}
		} else {
			this._column = ColumnGroup.getLower(this._column);
		}
	},
	up: function (editing) {
		if ((this._verticalStep == VerticalMovingStep.ROW && !editing) || this.isTop()) {
			if (this._itemIndex > 0) {
				this.incRow(-1);
				if (this._verticalStep == VerticalMovingStep.CELL)
					this._column = ColumnGroup.getBottom(this._column);
			}
		} else {
			this._column = ColumnGroup.getUpper(this._column);
		}
	},
	toString: function () {
		var root = this._column ? this._column.root() : null;
		var dataRoot = this._column ? this._column.dataRoot() : null;
		var s = "(" + (root ? root.displayIndex() : "null") + "," + (dataRoot ? dataRoot.displayIndex() : "null") + "," + this._itemIndex + ")";
		return s;
	}
}, {
	NULL: null,
	$_temp: null,
	temp: function (grid, itemIndex, column) {
		CellIndex.$_temp._grid = grid;
		CellIndex.$_temp._itemIndex = itemIndex;
		CellIndex.$_temp._column = column;
		return CellIndex.$_temp;
	},
	areEquals: function (idx1, idx2) {
		return (idx1 === idx2) || 
			(idx1 && idx2 && idx1._grid === idx2._grid && idx1._itemIndex === idx2._itemIndex && idx1._column === idx2._column);
	},
	nullProxy: function () {
		return {
			itemIndex: -1,
			column: null,
			dataRow: -1,
			fieldIndex: -1,
			fieldName: null
		};
	}
}, function (f) {
	f.NULL = new f();
	f.$_temp = new f();
});
var $$_cellIndex_getRight = function (grid, start) {
	if (!grid || !start) {
		return null;
	}
	var i, cnt, idx,
		lm = grid.layoutManager(),
		column = ColumnGroup.getRight(start);
	if (column) {
		return column;
	}
	if (start.group()) {
		idx = start.root().displayIndex();
	} else {
		idx = start.displayIndex();
	}
	for (i = idx + 1, cnt = lm.columnCount(); i < cnt; i++) {
		column = lm.getColumn(i);
		if (column instanceof ValueColumn) {
			return column;
		} else if (column instanceof ColumnGroup) {
			column = column.first();
			if (column) {
				return column;
			}
		}
	}
	return null;
};
var $$_cellIndex_getLeft = function (grid, start) {
	if (!grid || !start) {
		return null;
	}
	var i, idx,
		lm = grid.layoutManager(),
		column = ColumnGroup.getLeft(start);
	if (column) {
		return column;
	}
	if (start.group()) {
		idx = start.root().displayIndex();
	} else {
		idx = start.displayIndex();
	}
	for (i = idx - 1; i >= 0; i--) {
		column = lm.getColumn(i);
		if (column instanceof ValueColumn) {
			return column;
		} else if (column instanceof ColumnGroup) {
			column = column.last();
			if (column) {
				return column;
			}
		}
	}
	return null;
};
var $$_cellIndex_getNext = function (grid, start) {
	if (!grid || !start) {
		return null;
	}
	var i, cnt, idx,
		lm = grid.layoutManager(),
		column = ColumnGroup.getNext(start);
	if (column) {
		return column;
	}
	if (start.group()) {
		idx = start.root().displayIndex();
	} else {
		idx = start.displayIndex();
	}
	for (i = idx + 1, cnt = lm.columnCount(); i < cnt; i++) {
		column = lm.getColumn(i);
		if (column instanceof ValueColumn) {
			return column;
		} else if (column instanceof ColumnGroup) {
			column = column.first();
			if (column) {
				return column;
			}
		}
	}
	return null;
};
var $$_cellIndex_getPrev = function (grid, start) {
	if (!grid || !start) {
		return null;
	}
	var i, idx,
		lm = grid.layoutManager(),
		column = ColumnGroup.getPrev(start);
	if (column) {
		return column;
	}
	if (start.group()) {
		idx = start.root().displayIndex();
	} else {
		idx = start.displayIndex();
	}
	for (i = idx - 1; i >= 0; i++) {
		column = lm.getColumn(i);
		if (column instanceof ValueColumn) {
			return column;
		} else if (column instanceof ColumnGroup) {
			column = column.last();
			if (column) {
				return column;
			}
		}
	}
	return null;
};
var GridRange = defineClass("GridRange", null, {
	init: function () {
		this._super();
		this._row1 = 0;
		this._col1 = null;
		this._row2 = -1;
		this._col2 = null;
	},
	isEmpty: function () {
		return (this._row2 < this._row1) || (this._col2 == null && this._col2 == null);
	},
	R1: function () {
		return this._row1;
	},
	C1: function () {
		return this._col1;
	},
	R2: function () {
		return this._row2;
	},
	C2: function () {
		return this._col2;
	},
	top: function () {
		return this._row1 <= this._row2 ? this._row1 : this._row2;
	},
	bottom: function () {
		return this._row1 <= this._row2 ? this._row2 : this._row1;
	},
	firstCell: function () {
		var index = new CellIndex();
		index.setItemIndex(this._row1 <= this._row2 ? this._row1 : this._row2);
		if (this._col1.dataRoot().distance() <= this._col2.dataRoot().distance()) {
			index._column = this._col1;
		} else {
			index._column = this._col2;
		}
		return index;
	},
	lastCell: function () {
		var index = new CellIndex();
		index.setItemIndex(this._row1 >= this._row2 ? this._row1 : this._row2);
		if (this._col1.dataRoot().distance() >= this._col2.dataRoot().distance()) {
			index._column = this._col1;
		} else {
			index._column = this._col2;
		}
		return index;
	},
	contains: function (itemIndex, column) {
		if (column) {
			var i = column.root().displayIndex();
			return (itemIndex >= this._row1) && (itemIndex <= this._row2) &&
				(i >= this._col1.root().displayIndex()) && (i <= this._col2.root().displayIndex());
		}
		return false;
	},
	containsIndex: function (index) {
		return index && this.contains(index._itemIndex, index._column);
	},
	normalize: function () {
		if (this._row1 > this._row2) {
			var r = this._row1;
			this._row1 = this._row2;
			this._row2 = r;
		}
		if (this._col1.dataRoot().distance() > this._col2.dataRoot().distance()) {
			var c = this._col1;
			this._col1 = this._col2;
			this._col2 = c;
		}
        return this;
	},
	normalizeData: function () {
		this.normalize();
		var g = this._col1;
		if (g instanceof ColumnGroup) {
			this._col1 = ColumnGroup.getFirstDataRoot(g);
		}
		g = this._col2;
		if (g instanceof ColumnGroup) {
			this._col2 = ColumnGroup.getLastDataRoot(g);
		}
        return this;
	}
}, {
	$_setRange: function (range, r1, c1, r2, c2) {
		range._row1 = r1 <= r2 ? r1 : r2;
		range._row2 = r1 <= r2 ? r2 : r1;
		range._col1 = c1.dataRoot().distance() <= c2.dataRoot().distance() ? c1 : c2;
		range._col2 = c1.dataRoot().distance() <= c2.dataRoot().distance() ? c2 : c1;
		return range;
	},
	create: function (index1, index2) {
		if (!index2 || index1 === index2) {
			var r = new GridRange();
			r._row1 = r._row2 = index1._itemIndex;
			r._col1 = r._col2 = index1._column;
			return r;
		} else {
			return GridRange.$_setRange(new GridRange(), index1._itemIndex, index1._column, index2._itemIndex, index2._column);
		}
	},
	temp: function (index1, index2) {
		var r = GridRange.$_TEMP;
		if (!index2 || index1 === index2) {
			r._row1 = r._row2 = index1._itemIndex;
			r._col1 = r._col2 = index1._column;
			return r;
		} else {
			return GridRange.$_setRange(r, index1._itemIndex, index1._column, index2._itemIndex, index2._column);
		}
	},
	createRange: function (r1, c1, r2, c2) {
		return GridRange.$_setRange(new GridRange(), r1, c1, r2, c2);
	}
});
GridRange.NULL = new GridRange();
GridRange.$_TEMP = new GridRange();

var IconElement = defineClass("IconElement", VisualElement, {
    init: function (dom, name) {
        this._super(dom, name);
        this._image = null;
    },
    setImage: function (value) {
        if (value != this._image) {
            this._image = value;
            this.invalidate();
        }
    },
    iconWidth: function () {
        return this._image ? this._image.width : 0;
    },
    iconHeight: function () {
        return this._image ? this._image.height : 0;
    },
    _hoverChanged: function () {
    },
    _doDraw: function (g) {
        var img = this._image;
        if (img) {
            var w = Math.min(this.width(), img.width);
            var h = Math.min(this.height(), img.height);
            var x = (this.width() - w) / 2;
            var y = (this.height() - h) / 2;
            g.drawImage(img, x, y, w, h);
        }
    }
});
var GridSummarizer = defineClass("GridSummarizer", null, {
    init: function() {
        this._super();
    },
    getCount: function() {
    },
    getSum: function(field) {
    },
    getMax: function(field) {
    },
    getMin: function(field) {
    },
    getAvg: function(field) {
    },
    getVar: function(field) {
    },
    getVarp: function(field) {
    },
    getStdev: function(field) {
    },
    getStdevp: function(field) {
    }
});
var DefaultSummarizer = defineClass("DefaultSummarizer", GridSummarizer, {
    init: function(provider) {
        this._super();
        this._provider = provider;
    },
    getCount: function() {
        return this._provider.itemCount();
    },
    getSum: function(field) {
        return this._provider.getSum(field);
    },
    getMax: function(field) {
        return this._provider.getMax(field);
    },
    getMin: function(field) {
        return this._provider.getMin(field);
    },
    getAvg: function(field) {
        return this._provider.getAvg(field);
    },
    getVar: function(field) {
        return this._provider.getVar(field);
    },
    getVarp: function(field) {
        return this._provider.getVarp(field);
    },
    getStdev: function(field) {
        return this._provider.getStdev(field);
    },
    getStdevp: function(field) {
        return this._provider.getStdevp(field);
    }
});