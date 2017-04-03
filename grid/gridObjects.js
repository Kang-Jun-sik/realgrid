var GridObject = defineClass("GridObject", EventAware, {
	init: function (grid) {
		this._super();
		this._grid = grid;
		this._dirty = false;
	},
	destroy: function() {
		this._destroying = true;
		this._grid = null;
		for (var attr in this) {
			if (this[attr] instanceof VisualStyles || this[attr] instanceof DynamicStyleCollection) {
				this[attr] = null;
				// delete this[attr];
			}
		}
		this._super();
	},
	owner: function () {
		return this._grid;
	},
	isDirty: function () {
		return this._dirty;
	},
	/*
	assign: function (source) {
		this._super(source);
		this.$_assignProperties(source);
		if (source instanceof GridObject) {
			if (source._styles) {
				this._styles.extend(source._styles);
			}
		} else if (source) {
			if (source.styles) {
				this._styles.extend(source.styles);
			}
		}
	},
	$_assignProperties: function (source) {
		var prop = null, 
			name;
		if (source instanceof GridObject) {
			for (prop in source) {
				if (prop.indexOf("get") == 0) {
					name = "set" + prop.substring(3);
					if (this[name]) {
						this[name].call(this, source[prop].call(source));
					} else {
						trace("Unknown setter: " + name);
					}
				}
			}
		} else if (source) {
			for (prop in source) {
				if (source.hasOwnProperty(prop)) {
					name = "set" + _capitalize(prop);
					if (this[name]) {
						this[name].call(this, source[prop]);
					} else {
						trace("Unknown setter: " + name);
					}
				}
			}
		}
	},
	*/
	clean: function () {
		if (this._dirty) {
			this._dirty = false;
		}
	},
	invalidate: function () {
		this._grid && this._grid.invalidate();
	},
	refreshOwner: function () {
		this._grid && this._grid.refreshView();
	},
	propertyChanged: function (prop, newValue) {
		this._changed();
	},	
	_changed: function() {
		if (!this._dirty) {
			this._dirty = true;
			this._doChanged();
			this.refreshOwner();
		}
	},
	_doChanged: function () {
	}
});
var GridObject$ = GridObject.prototype;
var VisualObject = defineClass("VisualObject", GridObject, {
	init: function (grid, styleName) {
		this._super(grid);
		this._styles = new VisualStyles(this, styleName);
	},
	destroy: function() {
		this._destroying = true;
		this._styles = null;
		this._realHeight = null;
		this._super();
	},
	stylesChanged: function (/*stypeProp*/) {
		this._changed();
	},
	visible: true,
	styles: null,
	setStyles: function (value) {
		if (value !== this._styles) {
			this._styles.extend(value);
		}
	},
	_doChanged: function () {
		if (this._grid) {
			this._grid._visualObjectChanged(this);
		}
	}
});
var VisualObject$ = VisualObject.prototype;
var GridPanel = defineClass("GridPanel", VisualObject, {
	init: function (grid/* GridBase */) {
		this._super(grid, "panelStyles");
		this.setVisible(true);
	},
	minHeight: 20,
	height: 0,
	realHeight: 0,
	proxy: function () {
		var obj = this._super();
		obj.height = this._realHeight;
		delete(obj.realHeight);
		return obj;
	}
});
var HeaderSummary = defineClass("HeaderSummary", VisualObject, {
	init: function (header) {
		this._super(header._grid, "headerSummaryStyles");
		this._header = header;
		this._groupStyles = new VisualStyles(this);
		this._headStyles = new VisualStyles(this);
        this._cell = new HeaderSummaryCell();
        this._headCell = new StyledCell(this);
		this._runtime = new FooterExpressionRuntime();
		this._runStyles = new VisualStyles(this, "runFooterStyles", null, false);
        this.setVisible(false);
	},
	destroy: function () {
		this._destroying = true;
		this._groupStyles = null;
		this._headStyles = null;
        this._cell = null;
        this._headCell = null;
		this._runtime = null;
		this._runStyles = null;
		this._super();
	},
	title: null,
	groupStyles: null,
    headStyles: null,
	minHeight: IntProp(23),
	height: IntProp_0,
	realHeight: IntProp_0,
	resizable: false,
	mergeCells: null,
	setGroupStyles: function (value) {
		if (value !== this._groupStyles) {
			this._groupStyles.extend(value);
		}
	},
    setHeadStyles: function (value) {
        if (value !== this._headStyles) {
            this._headStyles.extend(value);
        }
    },
	header: function () {
		return this._header;
	},
	setMergeCells: function (value) {
		this._mergeCells = [];
		if (value instanceof Array) {
			if (value[0] instanceof Array) {
				for (var i = 0, len = value.length; i < len; i++) {
					this._mergeCells[i] = value[i].slice(0);
				}
			} else {
				this._mergeCells[0] = value.slice(0);
			}
		} else {
			this._mergeCells = null;
		}
		this._headerSummaryMergeDirty = true;
		this._changed();
	},
	getCell: function (index) {
		var cell = this._cell;
		var column = index.column();
		cell.setIndex(index);
		cell.calculate();
		if (column instanceof ColumnGroup) {
			cell.setStyles(this._groupStyles);
		} else {
			var summary = column.header().summary();
			var d = summary.dynamicStyles();
			if (d && d.count() > 0) {
				var r = this._runStyles;
				r.clearValues();
				r.setParent(summary.styles());
				this._runtime.setCell(cell);
				d.applyInternal(this._runtime, r);
				cell.setStyles(r);
			} else {
				cell.setStyles(summary.styles())
			}
		}
		return cell;
	},
    getHeadCell: function () {
        var cell = this._headCell;
        cell.setStyles(this._headStyles);
        return cell;
    },
	proxy: function () {
		var obj = this._super();
		obj.height = this._realHeight;
		delete(obj.realHeight);
		return obj;
	}
});
var Header = defineClass("Header", VisualObject, {
	init: function (grid) {
		this._super(grid, "headerStyles");
        this._summary = new HeaderSummary(this);
		this._groupStyles = new VisualStyles(this, "headerGroupStyles");
        this._subStyles = new VisualStyles(this, "headerSubSytles");
		this._cell = new HeaderCell();
		this.setVisible(true);
	},
	destroy: function() {
		this._destroying = true;
        this._summary = null;
		this._groupStyles = null;
        this._subStyles = null;
		this._cell = null;
		this._super();
	},
    summary: null,
    groupStyles: null,
    subStyles: null,
	minHeight: IntProp(23),
	height: IntProp_0,
	realHeight: IntProp_0,
	resizable: false,
	sortable: true,
	filterable: true,
    subTextLocation: SubTextLocation.LOWER,
	subTextGap: 1,
	itemOffset: 2,
	itemGap: 2,
	imageList: null,
	showTooltip:false,
	heightFill: HeaderHeightFill.DEFAULT,
    setSummary: function (value) {
        if (value !== this._summary) {
            this._summary.assign(value);
        }
    },
	setGroupStyles: function (value) {
		if (value !== this._groupStyles) {
			this._groupStyles.extend(value);
		}
	},
    setSubStyles: function (value) {
        if (value !== this._subStyles) {
            this._subStyles.extend(value);
        }
    },
    setSubTextLocation: function (value) {
        if (!value) {
            value = SubTextLocation.LOWER;
        }
        if (value != this._subTextLocation) {
            this._subTextLocation = value;
            this._changed();
        }
    },
	getCell: function (index) {
		var cell = this._cell;
        var column = index.column();
        var header = column.header();
        var v;
		cell.setIndex(index);
		cell.setStyles(header.styles());
        cell.setSubStyles(header.subStyles());
        cell.setText(header.displayText());
        cell.setSubText(header.subText());
		cell.setSubLocation(!(v = header.subTextLocation()) ? this._subTextLocation : v);
        cell.setSubTextGap((v = header.subTextGap()) === undefined ? this._subTextGap : v);
		cell.setItemOffset((v = header.itemOffset()) === undefined ? this._itemOffset : v);
		cell.setItemGap((v = header.itemGap()) === undefined ? this._itemGap : v);
		cell.setImageList(this._imageList);
		cell.setImageIndex(header.imageIndex());
		cell.setImageUrl(header.imageUrl());
		cell.setCheckLocation(header.checkLocation());
		cell.setImageLocation(header.imageLocation());
		cell.setChecked(column.isChecked());
		cell.setShowTooltip(header.isShowTooltip());
		cell.setTooltip(header.tooltip());
		return cell;
	},
	getGroupingCell: function (column) {
		var cell = this._cell;
        var header = column.header();
        var v;
		cell.setIndex(this._grid.getIndex(-1, column));
		cell.setStyles(this._grid.rowGroup().panelStyles());
        cell.setSubStyles(header.subStyles());
        cell.setText(header.displayText());
        cell.setSubText(header.subText());
        cell.setSubLocation(!(v = header.subTextLocation()) ? this._subTextLocation : v);
        cell.setSubTextGap((v = header.subTextGap()) === undefined ? this._subTextGap : v);
        cell.setItemOffset((v = header.itemOffset()) === undefined ? this._itemOffset : v);
        cell.setItemGap((v = header.itemGap()) === undefined ? this._itemGap : v);
        cell.setImageList(this._imageList);
        cell.setImageIndex(header.imageIndex());
        cell.setImageUrl(header.imageUrl());
        cell.setCheckLocation(header.checkLocation());
        cell.setImageLocation(header.imageLocation());
        cell.setChecked(column.isChecked());
		cell.setShowTooltip(header.isShowTooltip());
		cell.setTooltip(header.tooltip());
		return cell;
	},
    clean: function () {
        this._super();
        this._summary.clean();
    },
	proxy: function () {
		var obj = this._super();
		obj.height = this._realHeight;
		delete(obj.realHeight);
		return obj;
	}
});
var /* @internal */ EditBar = defineClass("EditBar", VisualObject, {
	init: function (grid) {
		this._super(grid, "editBarStyles");
		this._cell = new EditBarCell();
		this.setVisible(false);
	},
	minHeight: 23,
	height: 0,
	getCell: function (index) {
		var cell = this._cell;
		cell.setStyles(this._styles);
		return cell;
	}
});
var Footer = defineClass("Footer", VisualObject, {
	init: function (grid) {
		this._super(grid, "footerStyles");
		this._groupStyles = new VisualStyles(this);
		this._cell = new FooterCell();
        this._runtime = new FooterExpressionRuntime();
        this._runStyles = new VisualStyles(this, "runFooterStyles", null, false);
		this.setVisible(true);
	},
    groupStyles: null,
	minHeight: IntProp(23),
	height: IntProp_0,
	realHeight: IntProp_0,
	resizable: false,
	mergeCells: null,
	count: 1,
	setGroupStyles: function (value) {
		if (value !== this._groupStyles) {
			this._groupStyles.extend(value);
		}
	},
	setMergeCells: function (value) {
		this._mergeCells = [];
		if (value instanceof Array) {
			if (value[0] instanceof Array) {
				for (var i = 0, len = value.length; i < len; i++) {
					this._mergeCells[i] = value[i].slice(0);
				}
			} else {
				this._mergeCells[0] = value.slice(0);
			}
		} else {
			this._mergeCells = null;
		}
		this._footerMergeDirty = true;
		this._changed();
	},
    getCell: function (index, footerIndex) {
		var cell = this._cell;
		var column = index.column();
		cell.setIndex(index);
		if (footerIndex === undefined) {
			cell.setFooterIndex(0);
		} else {
			cell.setFooterIndex(footerIndex);
		}

		cell.calculate();
		if (column instanceof ColumnGroup) {
			cell.setStyles(this._groupStyles);
		} else {
			var footer = column.footer();
            var d = footer.dynamicStyles();
            if (d && d.count() > 0) {
                var r = this._runStyles;
                r.clearValues();
                r.setParent(footer.styles());
                this._runtime.setCell(cell);
                d.applyInternal(this._runtime, r);
                cell.setStyles(r);
            } else {
                cell.setStyles(footer.styles())
            }
		}
		return cell;
	},
	proxy: function () {
		var obj = this._super();
		obj.height = this._realHeight;
		delete(obj.realHeight);
		return obj;
	}
});
var /* @internal */ SectionObject = defineClass("SectionObject", VisualObject, {
	init: function (grid, stylename) {
		this._super(grid, stylename);
		this._headStyles = new VisualStyles(this);
		this._footStyles = new VisualStyles(this);
        this._summaryStyles = new VisualStyles(this);
		this._headCell = new StyledCell(this);
		this._footCell = new StyledCell(this);
        this._sumCell = new StyledCell(this);
		this.setVisible(true);
	},
	headStyles: null,
	footStyles: null,
    summaryStyles: null,
	headText: null,
	footText: null,
	summaryText: null,
	headImageUrl: null,
	footImageUrl: null,
	summaryImageUrl: null,
	setHeadStyles: function (value) {
		if (value !== this._headStyles) {
			this._headStyles.extend(value);
		}
	},
	setFootStyles: function (value) {
		if (value !== this._footStyles) {
			this._footStyles.extend(value);
		}
	},
    setSummaryStyles: function (value) {
        if (value !== this._summaryStyles) {
            this._summaryStyles.extend(value);
        }
    },
	getCell: function (index) {
		throwAbstractError();
	},
	getHeadCell: function () {
		var cell = this._headCell;
		cell.setStyles(this._headStyles);
		return cell;
	},
	getFootCell: function () {
		var cell = this._footCell;
		cell.setStyles(this._footStyles);
		return cell;
	},
    getSumCell: function () {
        var cell = this._sumCell;
        cell.setStyles(this._summaryStyles);
        return cell;
    },
    setHeadImageUrl: function (value) {
    	if (value != this._headImageUrl) {
    		this._headImageUrl = value;
    		this._headImage = value ? this._grid.getImage(value) : null;
    		this._changed();
    	}
    },
    setFootImageUrl: function (value) {
    	if (value != this._footImageUrl) {
    		this._footImageUrl = value;
    		this._footImage = value ? this._grid.getImage(value) : null;
    		this._changed();
    	}    	
    },
    setSummaryImageUrl: function (value) {
    	if (value != this._summaryImageUrl) {
    		this._summaryImageUrl = value;
    		this._summaryImage = value ? this._grid.getImage(value) : null;
    		this._changed();
    	}
    },
    headImage: function () {
    	if (this._headImage) {
    		return this._headImage;
    	} else {
    		return this._headImage = this._headImageUrl ? this._grid.getImage(this._headImageUrl) : null;
    	}
    },
    footImage: function () {
    	if (this._footImage) {
    		return this._footImage;
    	} else {
    		return this._footImage = this._footImageUrl ? this._grid.getImage(this._footImageUrl) : null;
    	}    	
    },
    summaryImage: function () {
    	if (this._summaryImage) {
    		return this._summaryImage;
    	} else {
    		return this._summaryImage = this._summaryImageUrl ? this._grid.getImage(this._summaryImageUrl) : null;
    	}
    }
});

var Indicator = defineClass("Indicator", SectionObject, {
	init: function (grid) {
		this._super(grid, "indicatorStyles");
		this._cell = new IndicatorCell(this);
	},
	destroy: function() {
		this._destroying = true;
		this._realWidth = null;
		this._super();
	},
	displayValue: IndicatorValue.INDEX,
	zeroBase: false,
	indexOffset: IntProp_0,
	rowOffset: IntProp_0,
	minWidth: IntProp(40),
	maxWidth: IntProp_0,
	width: IntProp_0,
	realWidth: IntProp_0,
	selectable: true,
	getCell: function (index) {
		var cell = this._cell;
		cell.setIndex(index);
		cell.setStyles(this.styles());
		var item = index.item();
		if (item) {
			var state = index.item().itemState();
			if (state == ItemState.NORMAL && this._grid.focusedIndex().I() == index.I()) {
				state = ItemState.FOCUSED;
			}
			cell.setItemState(state);
		}
		return cell;
	},
	proxy: function () {
		var obj = this._super();
		obj.width = this._realWidth;
		delete(obj.realWidth);
		return obj;
	}
});
var StateBar = defineClass("StateBar", SectionObject, {
	init: function (grid) {
		this._super(grid, "stateBarStyles");
		this._cell = new StateBarCell();
		this._stateTexts = {
			"created": "C",
			"updated": "U",
			"deleted": "D",
			"createAndDeleted": "X"
		};
	},
	destroy: function() {
		this._destroying = true;
		this._stateTexts = null;
		this._super();
	},
	width: IntProp(20),
	mark: StateMark.DEFAULT,
    stateTexts: {},
    setStateTexts: function (value) {
		if (typeof value == "object") {
			for (var state in value) {
				if (this._stateTexts.hasOwnProperty(state)) {
					this._stateTexts[state] = value[state];
				}
			}
			this._changed();
		}
    },
	getCell: function (index) {
		var cell = this._cell;
		cell.setIndex(index);
		cell.setStyles(this.styles());
		return cell;
	}	
});
var CheckBar = defineClass("CheckBar", SectionObject, {
	init: function (grid) {
		this._super(grid, "checkBarStyles");
		this._cell = new CheckBarCell();
		this._allChecked = false;
	},
	width: IntProp(20),
	exclusive: false,
	showAll: true,
	showGroup: true,
	visibleOnly: false,
	checkableOnly: true,
	checkableExpression: null,
	getCell: function (index) {
		var cell = this._cell;
		cell.setIndex(index);
		cell.setStyles(this.styles());
		return cell;
	},
	setCheckableExpression: function(value) {
		this._checkableExpression = value;
		this._grid._items && this._grid._items.setCheckableExpression && this._grid._items.setCheckableExpression(this.checkableExpression());
		if (!this._dirty) {
			this._dirty = true;
			this.refreshOwner();
		}
	}
});
var GridBody = defineClass("GridBody", VisualObject, {
	init: function (grid) {
		this._super(grid, "gridBodyStyles");
		this._cellStyles = new VisualStyles(this, "", null, false);
		this._runtimeStyles = new VisualStyles(this, "", null, false);
		this._runtimeStyles2 = new VisualStyles(null, "", null, false);
		this._items = null;
		this._fixedStyles = null;
		this._bodyStyles = null;
		this._hasCellStyles = false;
		this._emptyStyles = new VisualStyles(this, "", null, false);
		this._dynamicStyles = new DynamicStyleCollection({
			capitalIndexers: function () { return $$_gridbody_capital_indexers; }
		});
		this._cellDynamicStyles = new DynamicStyleCollection({
			capitalIndexers: function () { return $$_gridbody_capital_indexers; }
		});
		this._rowStylesFirst = false;
		this._fixedIgnoreDynamic = false;
		this._fixedIgnoreColumn = false;
        this._groupCell = new GroupCell();
		this._dataCell = new DataCell();
		this._literalCell = new LiteralCell();
		this._seriesCell = new SeriesCell();
		this._mergedCell = new MergedDataCell();
		this._dataSource = null;
		this._rowRuntime = new DataRowExpressionRuntime();
		this._cellRuntime = new DataCellExpressionRuntime();
		this._rowStylesOwner = new DynamicStyleOwner({
			capitalIndexers: ["value", "values"]
		});
		this._cellStylesOwner = new DynamicStyleOwner({
			capitalIndexers: ["value", "values"]
		});
		this._styleTargets = { body: true, fixed: false };
		this._runBodyStyles = new VisualStyles(this, "runBodyStyles", null, false);
	},
	destroy: function() {
		this._destroying = true;
		this._styleTargets = null;;
		for( var attr in this) {
			if (this[attr] instanceof VisualStyles) {
				this[attr] = null;
				delete this[attr];
			}
		}
		this._rowStylesOwner = null;
		this._cellStylesOwner = null;
		this._super();
	},
    emptyStyles: null,
    dynamicStyles: null,
    cellDynamicStyles: null,
	rowStylesFirst: false,
	setEmptyStyles: function (value) {
		if (value !== this._emptyStyles) {
			this._emptyStyles.extend(value);
			this._grid && this._grid.refreshView();
		}
	},
	setDynamicStyles: function (value) {
		this._dynamicStyles.setItems(value);
		this._grid && this._grid.refreshView();
	},
	setCellDynamicStyles: function (value) {
		this._cellDynamicStyles.setItems(value);
		this._grid && this._grid.refreshView();
	},
	setRowStylesFirst: function (value) {
		if (value != this._rowStylesFirst) {
			this._rowStylesFirst = value;
			this._grid && this._grid.refreshView();
		}
	},
	rowRuntime: function () {
		return this._rowRuntime;
	},
	cellRunTime: function () {
		return this._cellRuntime;
	},
	checkDynamicStyle: function (index, item) {
		if (index.isFixed() && this._fixedIgnoreDynamic) {
			return false;
		}
		if (index._itemIndex < 0) {
			return false;
		}
		item = item ? item : index.item();
		// var item = index.item();
        this._rowRuntime.setItem(item);
        if (this._dynamicStyles.checkStyle(this._rowRuntime)) {
        	return true;
        }
		var column = index.column();
		var dataColumn = index.dataColumn();
		if (dataColumn && !column._ignoreDefaultDynamicStyles) {
			var cell = column instanceof SeriesColumn ? this._seriesCell : column instanceof LiteralCell ? this._literalCell : column instanceof ColumnGroup ? this._groupCell : this._dataCell;
			cell.setIndex(index);
			this._cellRuntime.setCell(cell);
			if (this.cellDynamicStyles().checkStyle(this._cellRuntime)) {
				return true;
			}
			if (dataColumn.dynamicStyles().checkStyle(this._cellRuntime)) {
				return true;
			}
			if (this._hasCellStyles && this._items.checkCellStyle(item.dataRow(), dataColumn.dataIndex())) {
                return true;
            }
		}
	    return false;
	},
	getCell: function (index, merged, item) {
		var runStyles;
		var column = index.column();
		var dataColumn = index.dataColumn();
		var fixed = index.isFixed();
		var cell;
		if (merged) {
			cell = this._mergedCell;
		} else if (column instanceof DataColumn) {
			cell = this._dataCell;
		} else if (column instanceof SeriesColumn) {
			cell = this._seriesCell;
		} else if (column instanceof LiteralCell) {
			cell = this._literalCell;
		} else if (column instanceof ColumnGroup) {
			cell = this._groupCell;
		} else {
			cell = this._dataCell;
		}

		// var cell = merged ? this._mergedCell : column instanceof SeriesColumn ? this._seriesCell : column instanceof LiteralCell ? this._literalCell : column instanceof ColumnGroup ? this._groupCell : this._dataCell;
		var runBodyStyles = this._rowStylesFirst ? this._runBodyStyles : null;
		var colStyles = this._cellStyles;
		cell.setIndex(index);
		
		runStyles = this._runtimeStyles2;
    	runStyles.clearValues(); 
		if (!this._fixedIgnoreColumn || !fixed) {
        	runStyles.assign(column._styles);
        }
		if (runBodyStyles) {
			runStyles.setParent(runBodyStyles, false);
		} else {
			runStyles.setParent(fixed ? this._fixedStyles : this._bodyStyles, false);
		}
		colStyles.clearValues();
		colStyles.setParent(runStyles, false);
        if (this._dataSource && cell !== this._groupCell) {
            item = item ? item : index.item();
            var dynRow, dynCell, dynCol, dynRowCount, dynCellCount, dynColCount;
            if (fixed && this._fixedIgnoreDynamic) {
                dynRowCount = dynCellCount = dynColCount = 0;
            } else {
                dynRow = this._dynamicStyles;
                dynCell = this._cellDynamicStyles;
                dynRowCount = dynRow.count();
                if (dataColumn) {
                    dynCellCount = dataColumn._ignoreDefaultDynamicStyles ? 0 : dynCell.count();
                    dynCol = dataColumn.dynamicStyles();
                    dynColCount = dynCol.count();
                } else {
                    dynCellCount = column._ignoreDefaultDynamicStyles ? 0 : dynCell.count();
                    dynColCount = 0;
                }
            }
            if (runBodyStyles) {
                this._styleTargets.body = !fixed;
                this._styleTargets.fixed = fixed;
                if (dynRowCount > 0) {
                    runBodyStyles.clearValues();
                    runBodyStyles.setParent(fixed ? this._fixedStyles : this._bodyStyles, false);
                    this._rowRuntime.setItem(item);
                    dynRow.applyInternal(this._rowRuntime, runBodyStyles, this._styleTargets);
                }
                if (dynCellCount > 0 || dynColCount > 0) {
                    runStyles = this._runtimeStyles;
                    runStyles.clearValues();
                    runStyles.setParent(colStyles, false);
                    if (dynCellCount > 0) {
                        this._cellRuntime.setCell(cell);
                        dynCell.applyInternal(this._cellRuntime, runStyles, this._styleTargets);
                    }
                    if (dynColCount > 0) {
                        this._cellRuntime.setCell(cell);
                        dynCol.applyInternal(this._cellRuntime, runStyles, this._styleTargets);
                    }
                    cell.setStyles(runStyles);
                } else {
                    cell.setStyles(colStyles);
                }
            } else if ( item.dataRow && item.dataRow() >= 0 && (dynRowCount > 0 || dynCellCount > 0 || dynColCount > 0) ) {  // item.dataRow check
            // } else if (dynRowCount > 0 || dynCellCount > 0 || dynColCount > 0) { 
                runStyles = this._runtimeStyles;
                runStyles.clearValues();
                runStyles._parent = colStyles;
                if (dynRowCount > 0) {
                    this._rowRuntime.setItem(item);
                    dynRow.applyInternal(this._rowRuntime, runStyles);
                }
                if (dynCellCount > 0) {
                    this._cellRuntime.setCell(cell);
                    dynCell.applyInternal(this._cellRuntime, runStyles);
                }
                if (dynColCount > 0) {
                    this._cellRuntime.setCell(cell);
                    dynCol.applyInternal(this._cellRuntime, runStyles);
                }
                cell.setStyles(runStyles);
            } else {
                cell.setStyles(colStyles);
            }
            if (dataColumn && this._hasCellStyles) {
                var cs = this._items.getCellStyle(item.dataRow(), dataColumn.dataIndex());
                cell.setCellStyles(cs);
            } else {
                cell.setCellStyles(null);
            }
        } else {
            cell.setStyles(colStyles);
        }
        if (dataColumn) {
            if (this._grid.isItemEditing(item)) {
                cell.setError(dataColumn.error());
                cell.setErrorLevel(dataColumn.errorLevel());
            } else {
            	var validateCellList = this._grid._validationManager._validateCellList;
            	var validCell = validateCellList[index.dataId()] && validateCellList[index.dataId()][dataColumn.dataIndex()];
            	if (validCell) {
        			cell.setError(validCell.message);
        			cell.setErrorLevel(validCell.level);
            	} else {
	                cell.setError(null);
	                cell.setErrorLevel(ValidationLevel.IGNORE);
	            }            	
            }
        }
		cell._styles._sysDefault = fixed ? this._fixedStyles._sysDefault : this._bodyStyles._sysDefault;
		return cell;
	},
    getCellSimple: function (index, merged) {
        var col = index._column;
        var cell = merged ? this._mergedCell : col instanceof SeriesColumn ? this._seriesCell : col instanceof LiteralCell ? this._literalCell : col instanceof ColumnGroup ? this._groupCell : this._dataCell;
        cell.setIndex(index);
        return cell;
    },
	addDynamicStyle: function (criteria, styles) {
	},
	_prepareUpdate: function () {
		var grid = this._grid = this.owner();
		this._items = grid.itemSource();
		this._fixedStyles = grid.fixedOptions().styles();
		this._fixedIgnoreDynamic = grid.fixedOptions().isIgnoreDynamicStyles();
		this._fixedIgnoreColumn = grid.fixedOptions().isIgnoreColumnStyles();
		this._bodyStyles = this.styles();
		this._hasCellStyles = this._items.hasCellStyle();
		this._dataSource = grid.dataSource();
		this._rowRuntime.setDataSource(this._dataSource);
		this._cellRuntime.setDataSource(this._dataSource);
        var proto = DynamicStyleCollection.prototype;
        proto.applyInternal = this._grid._userMode ? proto.applyInternalUserMode : proto.applyInternalNormal;
	}
});
var $$_gridbody_capital_indexers = ["value", "values"];
var RowGroupLevel = defineClass("RowGroupLevel", null, {
	init : function(config) {
		this._super();
        /*
		this._level = -1;
		this._column = null;
		this._minHeight = 0;
		*/
		this._headerStyles = new VisualStyles(this, "rowGroupLevelHeaderStyles");
		this._footerStyles = new VisualStyles(this, "rowGroupLevelFooterStyles");
		this._barStyles = new VisualStyles(this, "rowGroupLevelBarStyles");
		this._headerBarStyles = new VisualStyles(this, "rowGroupLevelHeaderBarStyles");
		this._footerBarStyles = new VisualStyles(this, "rowGroupLevelFooterBarStyles");
        if (config) {
            if (config.footerStyles) {
                this._footerStyles.extend(config.footerStyles);
            }
			if (config.headerStyles) {
				this._headerStyles.extend(config.headerStyles);
			}
			if (config.barStyles) {
				this._barStyles.extend(config.barStyles);
			}
			if (config.headerBarStyles) {
				this._headerBarStyles.extend(config.headerBarStyles);
			}
			if (config.footerBarStyles) {
				this._footerBarStyles.extend(config.footerBarStyles);
			}
		}
	},
    /*
    minHeight: 0,
    setMinHeight: function (value) {
        if (value != this._minHeight) {
            this._minHeight = value;
        }
    },
	level: function () {
		return this._level;
	},
	column: function () {
		return this._column;
	},
	*/
	headerStyles: function () {
		return this._headerStyles;
	},
	footerStyles: function () {
		return this._footerStyles;
	},
	barStyles: function () {
		return this._barStyles;
	},
	headerBarStyles: function () {
		return this._headerBarStyles;
	},
	footerBarStyles: function () {
		return this._footerBarStyles;
	}
});
var RowGroup = defineClass("RowGroup", GridObject, {
	init : function(grid) {
		this._super(grid);
		this._levels = [];	// RowGroupLevel
		this._headStyles = new VisualStyles(this, "rowGroupHead");
		this._footStyles = new VisualStyles(this, "rowGroupFoot");
		this._summaryStyles = new VisualStyles(this, "rowGroupSummary");
		this._headerStyles = new VisualStyles(this, "rowGroupHeader");
		this._footerStyles = new VisualStyles(this, "rowGroupFooter");
		this._panelStyles = new VisualStyles(this, "rowGroupPanel");
		this._barStyles = new VisualStyles(this, "rowGroupBar");
		this._headerBarStyles = new VisualStyles(this, "rowGroupHeaderBar");
		this._footerBarStyles = new VisualStyles(this, "rowGroupFooterBar");
		this._headerCell = new RowGroupHeaderCell(this);
		this._footerCell = new RowGroupFooterCell(this);
		this._barCell = new RowGroupBarCell();
		this._itemBarCell = new RowGroupItemBarCell();
		this._headCell = new RowGroupHeadCell();
		this._footCell = new RowGroupFootCell();
		this._summaryCell = new RowGroupSummaryCell();
        this._footerRuntime = new FooterExpressionRuntime();
		this._runtyles = new VisualStyles(this, "rowGroupRuntimeStyles", null, false);
		this._headerExprStatement = new ExpressionStatement(this._headerStatement);
		this._statementRuntime = new RowGroupStatementRuntime();
	},
	destroy: function() {
		this._destroying = true;
		this._headerExprStatement = null;
		this._statementRuntime = null;
		for (var attr in this) {
			if (this[attr] instanceof VisualStyles) {
				this[attr] = null;
			}
		}
		this._super();
	},
	levels: null,
	headerStyles : null,
	footerStyles : null,
	panelStyles : null,
	barStyles : null,
	headerBarStyles : null,
	footerBarStyles : null,
	headStyles : null,
	footStyles : null,
	summaryStyles : null,
	headerStatement : "${groupField}: ${groupValue} - ${rowCount} rows",
	levelIndent : 20,
	headerOffset : -1,
	footerOffset : 0,
	mergeMode : false,
	mergeExpander: true,
	expandedAdornments : RowGroupAdornments.BOTH,
	collapsedAdornments : RowGroupAdornments.HEADER,
	cellDisplay : RowGroupCellDisplay.MERGE,
	footerVisibility : RowGroupFooterVisibility.MULTI_ROWS_ONLY,
	inheritsLevel : true,
	imageLists : null,
	summaryMode : SummaryMode.AGGREGATE,
	footerCellMerge: false,
	footerStatement: null,
	sorting: true,
	levelCount: function () {
		return this._levels.length;
	},
	levels_: function () {
		return this._levels.concat();
	},
	setLevels: function (value) {
        this._levels = [];
        if (value) {
            for (var i = 0; i < value.length; i++) {
                var v = value[i];
                if (v instanceof RowGroupLevel) {
                    this._levels.push(v);
                } else {
                    v = new RowGroupLevel(v);
                    this._levels.push(v);
                }
		    }
        }
        this._changed();
	},
	setFooterStyles: function (value) {
		if (value != this._footerStyles) {
			this._footerStyles.extend(value);
		}
	},
	setHeaderStatement: function (value) {
		if (value != this._headerStatement) {
			this._headerStatement = value;
			this._headerExprStatement.setSource(value);
			this._changed();
		}
	},
	setFooterStatement: function (value) {
		if (value != this._footerStatement) {
			this._footerStatement = value;
			if (value) {
				if (this._footerExprStatement) {
					this._footerExprStatement.setSource(value);
				} else {
					this._footerExprStatement = new ExpressionStatement(value);
				}
			} else {
				this._footerExprStatement = null;
			}
			this._changed();
		}
	},
	setMergeMode: function (value) {
		if (value != this._mergeMode) {
			this._mergeMode = value;
			if (this.owner()) {
				this.owner().$_rowGroupFooterMergeChanged();
				this.owner().$_rowGroupMergeModeChanged();
			}
		}
	},
	setFooterCellMerge: function (value) {
		if (value != this._footerCellMerge) {
			this._footerCellMerge = value;
			if (this.owner()) {
				this.owner().$_rowGroupFooterMergeChanged();
			}
			this._changed();		
		}
	},
	setExpandedAdornments: function (value) {
		if (value != this._expandedAdornments) {
			this._expandedAdornments = value;
			if (this.owner()) {
				this.owner().$_rowGroupAdornmentsChanged();
			}
		}
	},
	setCollapsedAdornments: function (value) {
		if (value != this._collapsedAdornments) {
			this._collapsedAdornments = value;
			if (this.owner()) {
				this.owner().$_rowGroupAdornmentsChanged();
			}
		}
	},
	setSummaryMode: function (value) {
		if (value != this._summaryMode) {
			this._summaryMode = value;
			if (this.owner()) {
				this.owner().$_groupSummaryModeChanged();
			}
		}
	},
	setSorting: function (value) {
		if (value != this._sorting) {
			this._sorting = value;
			if (this.owner()) {
				this.owner().$_groupSortingChanged();
			}
		}
	},
	getLevel: function (level)/* RowGroupLevel */ {
		var cnt = this._levels.length;
		if (cnt > level) {
			return this._levels[level];
		} else if (cnt > 0 && this._inheritsLevel) {
			return this._levels[cnt - 1];
		}
		return null;
	},
	getHeaderCell: function (index) {
		var item = this.owner().getItem(index);
		var level = this.getLevel(item.level() - 1);
		this._runtyles.clearValues();
		if (level) {
			this._runtyles.setParent(level.headerStyles(), false);
		} else {
			this._runtyles.setParent(this._headerStyles, false);
		}
		this._headerCell.setStyles(this._runtyles);
		this._headerCell.setIndex(CellIndex.temp(this.owner(), index));
		return this._headerCell;
	},
	getFooterCell: function (index) {
		var item/*GroupFooter*/ = this.owner().getItem(index.I());
		var group = item.parent();
		var level/*RowGroupLevel*/ = this.getLevel(group.level() - 1);
		var column = _cast(index.column(), ValueColumn);
		if (column) {
			this._runtyles.clearValues();
			this._runtyles.extend(column.footer().styles());
			this._runtyles.extend(column.footer().groupStyles());
		}
		if (level) {
			this._runtyles.setParent(level.footerStyles(), false);
		} else {
			this._runtyles.setParent(this._footerStyles, false);
		}
        this._footerCell.setIndex(index);
        this._footerCell.calculate();
        if (column) {
            var d = column.footer().groupDynamicStyles();
            if (d && d.count() > 0) {
                this._footerRuntime.setCell(this._footerCell);
                d.applyInternal(this._footerRuntime, this._runtyles);
            }
        }
		this._footerCell.setStyles(this._runtyles);
		return this._footerCell;
	},
	getBarCell: function (level) {
		this._barCell.setLevel(level);
		var glevel = this.getLevel(level - 1);
		if (glevel) {
			this._barCell.setStyles(glevel.barStyles());
		} else {
			this._barCell.setStyles(this._barStyles);
		}
		return this._barCell;
	},
	getHeaderBarCell: function (index) {
		this._itemBarCell.setIndex(index);
		var level = this.getLevel(index.item().level() - 1);
		if (level) {
			this._itemBarCell.setStyles(level.headerBarStyles());
		} else {
			this._itemBarCell.setStyles(this._headerBarStyles);
		}
		return this._itemBarCell;
	},
	getFooterBarCell: function (index) {
		this._itemBarCell.setIndex(index);
		var group = index.item().parent();
		var level = this.getLevel(group.level() - 1);
		if (level) {
			this._itemBarCell.setStyles(level.footerBarStyles());
		} else {
			this._itemBarCell.setStyles(this._footerBarStyles);
		}
		return this._itemBarCell;
	},
	getHeadCell: function (level) {
		this._headCell.setStyles(this._headStyles);
		return this._headCell;
	},
	getFootCell: function (level) {
		this._footCell.setStyles(this._footStyles);
		return this._footCell;
	},
	getSummaryCell: function (level) {
		this._summaryCell.setStyles(this._summaryStyles);
		return this._summaryCell;
	},
	getHeaderText: function (group) {
		this._statementRuntime.setGrid(this.owner());
		this._statementRuntime.setGroup(group);
		return this._headerExprStatement.evaluate(this._statementRuntime);
	},
	getFooterText: function (group) {
		if (this._footerExprStatement) {
			this._statementRuntime.setGrid(this.owner());
			this._statementRuntime.setGroup(group);
			return this._footerExprStatement.evaluate(this._statementRuntime)
		} else {
			return null;
		}
	}
});
