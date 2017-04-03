var GridBaseOptions = defineClass("GridBaseOptions", null, {
	init: function (grid) {
		this._super();
		this._grid = grid;
	},
	destroy: function() {
		this._destroying = true;
		this._grid = null;
		for (var attr in this) {
			if (this[attr] instanceof VisualStyles || this[attr] instanceof SolidPen || this[attr] instanceof SolidBrush) {
				this[attr] = null;
			}
		}
		this._super();
	},
	grid: function () {
		return this._grid;
	},
	_invalidateOwner: function () {
		this._grid && this._grid.invalidate();
	},
	_layoutOwner: function () {
		this._grid && this._grid.invalidateLayout();
	},
	_refreshOwner: function () {
		this._grid && this._grid.refreshView();
	},
	_invalidateEditor: function () {
		this._grid && this._grid.editController().invalidateEditor();
		this._grid && this._grid.editController().reprepareEditor(this._grid.focusedIndex());
	}
});
var DisplayOptions = defineClass("DisplayOptions", GridBaseOptions, {
	init: function (grid) {
		this._super(grid);
		this._focusPen = new SolidPen(this._focusColor, this._focusBorderWidth);
		this._innerFocusPen = new SolidPen(this._innerFocusColor, 1, [1,1]);
		this._focusActivePen = new SolidPen(this._focusActiveColor, this._focusBorderWidth);
		this._focusBackgroundBrush = new SolidBrush(this._focusBackground);
		this._rowFocusBackgroundBrush = new SolidBrush(this._rowFocusBackground);
	},
	columnResizable: true,
	columnMovable: true,
	parentChangable: false,
	defaultColumnWidth: 120,
	fitStyle: GridFitStyle.NONE,
	rowResizable: false,
	eachRowResizable:false,
	rowHeight: 0,
	minRowHeight: 4,
	maxRowHeight: 0,
	hscrollBar: true,
	vscrollBar: true,
	liveScroll: true,
	horizLiveScroll: true,
	scrollDuration: 0,
	hscrollDuration: 0,
	hintDuration: 0,
    rowChangeDelay: 0,
	horzScrollStep: 8,
	emptyMessage: "이 곳에 표시할 메시지를 DisplayOptions.emptyMessage 속성으로 설정합니다.",
	showEmptyMessage: false,
	heightMeasurer: null,
	fitWhenResized: true,
	focusVisible: true,
	rowFocusVisible : false,
	rowFocusMask : RowFocusMask.ROW,
	rowFocusBackground: null,
	wheelEnabled: true,
	wheelScrollLines : 3,
    rightClickable: true,
    editItemMerging: false,
    showInnerFocus: true,
    toastZIndex:3000,
    focusBackground:null,
    focusColor: "#ff333333",
    innerFocusColor: "#ff333333",
    focusActiveColor: "#ff5292f7",
    focusBorderWidth: 2,
	setFitStyle: function (value) {
		if (value != this._fitStyle) {
			this._fitStyle = value;
			this._refreshOwner();
		}
	},
	setRowHeight: function (value) {
		value = Math.max(0, value);
		if (value != this._rowHeight) {
			this._rowHeight = value;
			this._refreshOwner();
		}
	},
	setMinRowHeight: function (value) {
		value = Math.max(0, value);
		if (value != this._minRowHeight) {
			this._minRowHeight = value;
			this._refreshOwner();
		}
	},
	setMaxRowHeight: function (value) {
		value = Math.max(0, value);
		if (value != this._maxRowHeight) {
			this._maxRowHeight = value;
			this._refreshOwner();
		}
	},
	setHeightMeasurer: function (value) {
		if (value != this._heightMeasurer) {
			this._heightMeasurer = value;
			if (value == "fixed") {
				this._grid.setHeightMeasurer(new FixedHeightsMeasurer());
			} else {
				this._grid.setHeightMeasurer(null);
			}
		}
	},
	setFitWhenResized: function (value) {
		if (value != this._setFitWhenResized) {
			this._setFitWhenResized = value;
			this._refreshOwner();
		}
	},
	setFocusVisible: function (value) {
		if (value != this._focusVisible) {
			this._focusVisible = value;
			this._refreshOwner();
		}
	},
	setShowInnerFocus: function (value) {
		if (value != this._showInnerFocus) {
			this._showInnerFocus = value;
			this._refreshOwner();
		}
	},
	setRowResizable:function(value) {
		if (value != this._rowResizable) {
			this._rowResizable = value;
			this._refreshOwner();
		}
	},	
	setEachRowResizable:function(value) {
		if (value != this._eachRowResizable) {
			this._eachRowResizable = value;
			this._refreshOwner();
		}
	},	
    setFocusColor: function (value) {
    	if (value && value != this._focusColor) {
    		this._focusColor = value;
			this._focusPen = new SolidPen(value, this._focusBorderWidth);
    	}
    },
    setInnerFocusColor: function (value) {
    	if (value && value != this._innerFocusColor) {
    		this._innerFocusColor = value;
    		this._innerFocusPen = new SolidPen(value, 1, [1,1]);
    	}
    },
    setFocusBackground: function (value) {
    	if (value != this._focusBackground) {
    		this._focusBackground = value;
    		this._focusBackgroundBrush = new SolidBrush(value);
    	}
    },
    $_changeEditorBorder: function(color, border) {
    	var grid = this.grid();
    	var delegate = grid && grid.delegate();
    	var editors = delegate && delegate._cellEditors;
    	for (var editorType in editors) {
    		editors[editorType]._displayOptions = grid.displayOptions();
    	}
    },
    setFocusActiveColor: function (value) {
    	if (value && value != this._focusActiveColor) {
    		this._focusActiveColor = value;
    		this._focusActivePen = new SolidPen(value, this._focusBorderWidth);
    		this.$_changeEditorBorder();
    	}
    },
    setFocusBorderWidth: function (value) {
    	if (value && !isNaN(value) && value != this._focusBorderWidth) {
    		this._focusBorderWidth = value;
    		this._focusPen = new SolidPen(this._focusColor, value);
    		this._focusActivePen = new SolidPen(this._focusActiveColor, value);
    		this.$_changeEditorBorder();
    	}
    },
    setHintDuration: function(value) {
    	if (value != this._hintDuration) {
    		this._hintDuration = value;
    		var grid = this.grid();
    		if ( grid.toolTipManager && grid.toolTipManager()) {
    			var tm = grid.toolTipManager();
    			tm._hintDuration = value;
    		}
    	}
    },
    setRowFocusBackground: function(value) {
    	if (value != this.rowFocusBackground) {
    		this._rowFocusBackground = value;
    		this._rowFocusBackgroundBrush = null;
    		if (value) {
    			this._rowFocusBackgroundBrush = new SolidBrush(this._rowFocusBackground);
    		}	
    	}
    },
	propertyChanged: function () {
		this._refreshOwner();
	}    
});
var EditOptions = defineClass("EditOptions", GridBaseOptions, {
	init: function(grid) {
		this._super(grid);
	},
	readOnly: false,
	editable: true,
	checkable: true,
	updatable: true,
	appendable: false,
	insertable: false,
	deletable: false,
    revertable: false,
	editWhenFocused: false,
	commitWhenNoEdit: false,
	commitWhenExitLast: false,
	crossWhenExitLast: false,
	validateOnEdited: true,
	validateOnExit: false,
	hintOnError: true,
	deleteRowsMessage: window.RG_CONST && window.RG_CONST.DELETEROWSMESSAGE ? window.RG_CONST.DELETEROWSMESSAGE : "선택된 행(들)을 삭제하시겠습니까??",
	invalidFormatMessage: window.RG_CONST && window.RG_CONST.INVALIDFORMATMESSAGE ? window.RG_CONST.INVALIDFORMATMESSAGE : "잘못된 입력 유형입니다.",
	showInvalidFormatMessage: true,
	deleteRowsConfirm: true,
    confirmWhenDelete: true,
	editWhenClickFocused: false,
	commitLevel: ValidationLevel.IGNORE,
	useTabKey: true,
	useArrowKeys: true,
	skipReadOnly: false,
	skipReadOnlyCell: false,
	verticalMovingStep: VerticalMovingStep.DEFAULT,
	enterToTab: false,
	enterToNextRow: false,
	enterToEdit: false,
	maxLengthToNextCell:false,
	forceInsert: false,
	forceAppend: false,
	checkDiff: false,
    checkCellDiff: false,
    strictDiff: false,
	deletableWhenEdit: true,
    showCommitError: true,
	firstCellWhenInsert: false,
    appendWhenInsertKey: false,
    appendWhenExitLast: false,
	showOnlyValidationMessage: true,
	displayEmptyEditRow: false,
    deleteRowsConfirm_: function () {
        return this._confirmWhenDelete;
    },
    setDeleteRowsConfirm: function (value) {
        this.setConfirmWhenDelete(value);
    },
	setReadOnly: function (value) {
		if (value != this._readOnly) {
			this._readOnly = value;
            this._refreshOwner();
			this._invalidateEditor();
		}
	},
	setEditable: function (value) {
		if (value != this._editable) {
			this._editable = value;
            this._refreshOwner();
			this._invalidateEditor();
		}
	},
    isWritable: function () {
        return this._editable && !this._readOnly;
    },
	canUpdate: function () {
		return !this._readOnly && this._updatable;
	},
	canInsert: function () {
		return !this._readOnly && this._insertable;
	},
	canAppend: function () {
		return !this._readOnly && this._appendable;
	},
	canDelete: function () {
		return !this._readOnly && this._deletable;
		
	},
	setAppendable: function(value) {
		this._appendable = value;
		this.setDisplayEmptyEditRow(this._displayEmptyEditRow);
	},
	setDisplayEmptyEditRow: function(value) {
		var grid = this.grid();
		if (grid && grid instanceof TreeView) {
			this._displayEmptyEditRow = false;
			return;
		}
		this._displayEmptyEditRow = value;
		if (this._displayEmptyEditRow && this._appendable) {
			this._grid._items.appendDummy();
		} else {
			this._grid._items.cancelDummy();
		}
		this._refreshOwner();
	}
});
var EditorOptions = defineClass("EditorOptions", GridBaseOptions, {
	init: function(grid) {
		this._super(grid);
		this._titleExprStatement = null;
		this._titleExprRuntime = new EditorTitleExpressionRuntime();
	},
    yearDisplayFormat: window.RG_CONST && window.RG_CONST.YEARDISPLAYFORMAT ? window.RG_CONST.YEARDISPLAYFORMAT : "{Y}년",
    monthDisplayFormat: window.RG_CONST && window.RG_CONST.MONTHDISPLAYFORMAT ? window.RG_CONST.MONTHDISPLAYFORMAT : "{M}월",
    months: null,
    weekDays: null,
    viewGridInside:false,
    useCssStyle:false,
    useCssStyleDropDownList:false,
    useCssStyleDatePicker:false,
	useCssStylePopupMenu:false,
	useCssStyleMultiCheck:false,
	applyCellFont:false,
	titleStatement:null,
	setTitleStatement: function(value) {
		if (value != this._titleStatement) {
			this._titleStatement = value;
			if (value) {
				if (this._titleExprStatement) {
					this._titleExprStatement.setSource(value);
				} else {
					this._titleExprStatement = new ExpressionStatement(value);
				}
			} else {
				this._titleExprStatement = null;
			}
		}
	}
});


var FixedOptions = defineClass("FixedOptions", GridBaseOptions, {
	init : function(grid) {
		this._super(grid);
		this._styles = new VisualStyles(this, "fixedBody");
		this._rowBarStyles = new VisualStyles(this, "fixedRowBar");
		this._colBarStyles = new VisualStyles(this, "fixedColumnBar");
	},
	destroy: function() {
		this._destroying = true;
		this._styles = null;
		this._rowBarStyles = null;
		this._colBarStyles = null;
		this._super();
	},
	colCount: 0,
	rightColCount: 0,
	rowCount: 0,
	exceptFromFiltering: true,
	exceptFromSorting: true,
	editable: true,
	rowEditable: true,
	resizable: false,
	rowResizable: false,
	movable: false,
	colBarWidth: 3,
	rowBarHeight: 3,
	ignoreColumnStyles: false,
	ignoreDynamicStyles: false,
	styles: null,
	rowBarStyles: null,
	colBarStyles: null,
	onStyleChanged: null,
	setColCount: function (value) {
		value = Math.max(0, value);
		if (value != this._colCount) {
			this._colCount = value;
			this._grid && this._grid.$_rowGroupFooterMergeChanged();
			this._grid && this._grid.$_footerMergeChanged();
			this._refreshOwner();
		}
	},
	setRightColCount: function (value) {
		value = Math.max(0, value);
		if (value != this._rightColCount) {
			this._rightColCount = value;
			this._grid && this._grid.$_rowGroupFooterMergeChanged();
			this._grid && this._grid.$_footerMergeChanged();
			this._refreshOwner();
		}		
	},
	setRowCount: function (value) {
		value = Math.max(0, value);
		if (value != this._rowCount) {
			this._rowCount = value;
			this.$_resetItemSource();
		}
	},
	setEditable: function (value) {
		if (value != this._editable) {
			this._editable = value;
			this._refreshOwner();
		}
	},
	setRowEditable: function (value) {
		if (value != this._rowEditable) {
			this._rowEditable = value;
			this._refreshOwner();
		}
	},
	setExceptFromFiltering: function(value) {
		if (value != this._exceptFromFiltering) {
			this._exceptFromFiltering = value;
			this.$_resetItemSource();
		}
	},
	setExceptFromSorting: function(value) {
		if (value != this._exceptFromSorting) {
			this._exceptFromSorting = value;
			this.$_resetItemSource();
		}
	},
    setIgnoreColumnStyles: function (value) {
        if (value != this._ignoreColumnStyles) {
            this._ignoreColumnStyles = value;
            this._refreshOwner();
        }
    },
    setIgnoreDynamicStyles: function (value) {
        if (value != this._ignoreDynamicStyles) {
            this._ignoreDynamicStyles = value;
            this._refreshOwner();
        }
    },
	setColBarWidth: function (value) {
		value = Math.max(0, value);
		if (value != this._colBarWidth) {
			this._colBarWidth = value;
			this._refreshOwner();
		}
	},
	setRowBarHeight: function (value) {
		value = Math.max(0, value);
		if (value != this._rowBarHeight) {
			this._rowBarHeight = value;
			this._refreshOwner();
		}
	},
	$_resetItemSource: function () {
		var items;
		var grid = this.grid();
		if (grid && (items = grid.itemSource())) {
			items.setFixed(this._rowCount, !this._exceptFromSorting, !this._exceptFromFiltering);
		}
	},
	stylesChanged: function (entry) {
		this._refreshOwner();
	}
});
var SelectOptions = defineClass("SelectOptions", GridBaseOptions, {
	init : function(grid) {
		this._super(grid);
		this._maskStyles = new VisualStyles(this, "selectMask");
		this._mobileStyles = new VisualStyles(this, "mobileSelection", {
			background: new SolidBrush(0x10000000),
			border: new SolidPen(0xff333333, 2),
			figureBackground: new SolidBrush(0xff333333),
			figureBorder: new SolidPen(0xffdddddd, 1)
		});
	},
	destroy: function() {
		this._destroying = true;
		this._maskStyles = null;
		this._mobileStyles = null;
		this._super();
	},
	rangeSelect: true,
	mode: {
		init: SelectionMode.SINGLE,
		set: function (value) {
			this._mode = value;
			this.grid().clearSelection();
		}
	},
	style: {
		init: SelectionStyle.BLOCK,
		set: function (value) {
			if (value != this._style) {
				var grid = this.grid();
				var sels = grid.selections();
				if (sels.count > 0) {
					item = sels.getItem(0);
					rng = item.getBounds();
					sels.clear();
					if (value != SelectionStyle.NONE) {
						sels.setItemStyle(value);
						sels.add(grid.getIndex(rng.R1(), rng.C1()), grid.getIndex(rng.R1, rng.C1), value);
					}
				}
				this._style = value;
			}
		}
	},
	maskStyles : {
		set: function (value) {
			if (value !== this._maskStyles) {
				this._maskStyles.extend(value);
				this._refreshOwner();
			}
		}
	},
	mobileStyles : {
		set: function (value) {
			if (value !== this._mobileStyles) {
				this._mobileStyles.extend(value);
				this._refreshOwner();
			}
		}
	},
	proxy: function () {
		var val = this._super();
		val["mobileStyles"] = {
			background: VisualStyles.getFillText(this._mobileStyles.background()),
			border: VisualStyles.getStrokeText(this._mobileStyles.border()),
			figureBackground: VisualStyles.getFillText(this._mobileStyles.figureBackground()),
			figureBorder: VisualStyles.getStrokeText(this._mobileStyles.figureBorder()),
		};
		return val;
	}
});

var SortHandleImageOptions = defineClass("SortHandleImageOptions", null, {
	init: function(config) {
		this._super();
		config && this.assign(config);
	},
	ascending: null,
	descending: null,
	hoveredAscending: null,
	hoveredDescending: null,
	none: null,
	hoveredNone: null,
	loadImages: function(container) {
		container.getImage(this._ascending);
		container.getImage(this._descending);
		container.getImage(this._hoveredAscending); 
		container.getImage(this._hoveredDescending); 
		container.getImage(this._none); 
		container.getImage(this._hoveredNone); 
	}
});

var SortingOptions = defineClass("SortingOptions", GridBaseOptions, {
	init: function(grid) {
		this._super(grid);
		this._toast = new ToastOptions();
		this._toast._visible = false;
		this._toast._message = "Sorting...";
		this._handleImages = new SortHandleImageOptions();
		this._sortOrderStyles = new VisualStyles(this, "sortOrderStyles", {textAlignment:"near"});
	},
	destroy: function() {
		this._destroying = true;
		this._toast = null;
		this._handleImages = null;
		this._sortOrderStyles = null;
		this._destroy();
	},
	enabled: true,
	style: SortStyle.EXCLUSIVE,
	handleVisibility: HandleVisibility.VISIBLE,
	handleColor: undefined, 
	handleNoneColor: undefined,
	hoveredHandleColor: undefined, 
	hoveredHandleNoneColor: undefined,
	handleBorderColor: undefined,
	imageHandle: false,
	handleImages: null,
	commitBeforeSorting: true,
	toast:null,
    keepFocusedRow: false,
    textCase: SortCase.SENSITIVE,
    showSortOrder: false,
    sortOrderStyles: undefined,
	setHandleVisibility: function (value) {
		if (value != this._handleVisibility) {
			this._handleVisibility = value;
			this._refreshOwner();
		}
	},
	setHandleColor: function (value) {
		if (value != this._handleColor) {
			this._handleColor = value;
			this._handleFill = value ? new SolidBrush(value) : SolidBrush.GRAY;
			this._refreshOwner();
		}
	},
	setHandleNoneColor: function (value) {
		if (value != this._handleNoneColor) {
			this._handleNoneColor = value;
			this._handleNoneFill = value ? new SolidBrush(value) : SolidBrush.EMPTY;
			this._refreshOwner();
		}
	},
	setHoveredHandleColor: function (value) {
		if (value != this._hoveredHandleColor) {
			this._hoveredHandleColor = value;
			this._hoveredHandleFill = value ? new SolidBrush(value) : SolidBrush.GRAY;
			this._refreshOwner();
		}
	},
	setHoveredHandleNoneColor: function (value) {
		if (value != this._hoveredHandleNoneColor) {
			this._hoveredHandleNoneColor = value;
			this._hoveredHandleNoneFill = value ? new SolidBrush(value) : SolidBrush.GRAY;
			this._refreshOwner();
		}
	},
	setHandleBorderColor: function (value) {
		if (value != this._handleBorderColor) {
			this._handleBorderColor = value;
			this._handleBorderPen = value ? new SolidPen(value) : SolidPen.GRAY;
			this._refreshOwner();
		}
	},
	setShowSortOrder: function(value) {
		if (value != this._showSortOrder) {
			this._showSortOrder = value;
			this._refreshOwner();
		}
	},
    setSortOrderStyles: function (value) {
        if (value !== this._sortOrderStyles) {
            this._sortOrderStyles.extend(value);
			this._refreshOwner();
        }
    },
	handleFill: function () {
		return this._handleFill;
	},
	handleNoneFill: function () {
		return this._handleNoneFill;
	},
	setToast: function (value) {
		if (value != this._toast) {
			this._toast.assign(value);
		}
	},
	setHandleImages: function (value) {
		this._handleImages.assign(value);
	}
});
var FilterSelectorOptions = defineClass("FilterSelectorOptions", null, {
	init: function(config) {
		this._super();
		this._styles = new VisualStyles("filterSelectorStyles");
		config && this.assign(config);
	},
	destroy: function() {
		this._destroying = true;
		this._styles = null;
		this._super();
	},
	minWidth: null,
	maxWidth: null,
	minHeight: null,
	maxHeight: null,
	styles: null,
	closeWhenClick: false,
	useCssStyle: false,
	setMinWidth: function (value) {
		this._minWidth = value ? PercentSize.createFrom(value) : undefined;
	},
	setMaxWidth: function (value) {
		this._maxWidth = value ? PercentSize.createFrom(value) : undefined;
	},
	setMinHeight: function (value) {
		this._minHeight = value ? PercentSize.createFrom(value) : undefined;
	},
	setMaxHeight: function (value) {
		this._maxHeight = value ? PercentSize.createFrom(value) : undefined;
	},
	getMinWidth: function (width) {
		return this._minWidth ? this._minWidth.getSize(width) : undefined;
	},
	getMaxWidth: function (width) {
		return this._maxWidth ? this._maxWidth.getSize(width) : undefined;
	},
	getMinHeight: function (height) {
		return this._minHeight ? this._minHeight.getSize(height) : undefined;
	},
	getMaxHeight: function (height) {
		return this._maxHeight ? this._maxHeight.getSize(height) : undefined;
	}
});

var FilterHandleImageOptions = defineClass("FilterHandleImageOptions", null, {
	init: function(config) {
		this._super();
		config && this.assign(config);
	},
	none: null,
	fill: null,
	hoveredNone: null,
	hoveredFill: null,
	loadImages: function(container) {
		container.getImage(this._none);
		container.getImage(this._fill);
		container.getImage(this._hoveredNone); 
		container.getImage(this._hoveredFill); 
	}
});

var FilteringOptions = defineClass("FilteringOptions", GridBaseOptions, {
	init: function(grid) {
		this._super(grid);
		this._selector = new FilterSelectorOptions();
		this._handleImages = new FilterHandleImageOptions(); 
		this._toast = new ToastOptions();
		this._toast._visible = false;
		this._toast._message = "Filtering...";
	},
	destroy: function() {
		this._destroying = true;
		this._selector = null;
		this._handleImages = null; 
		this._toast = null;
		this._super();
	},
	enabled: true,
	handleVisibility: HandleVisibility.VISIBLE,
	handleColor: undefined,
	handleNoneColor : undefined,
	hoveredHandleColor: undefined,
	hoveredHandleNoneColor : undefined,
	handleBorderColor: undefined,
	imageHandle: false,
	handleImages: null,
	commitBeforeFiltering: true,
	selector: null,
	toast: null,
	addParentNodeOnFiltering:true,
	setSelector: function (value) {
		this._selector.assign(value);
	},
	setToast: function (value) {
		this._toast.assign(value);
	},
	setHandleImages: function (value) {
		this._handleImages.assign(value);
	},
	setHandleColor: function (value) {
		if (value != this._handleColor) {
			this._handleColor = value;
			this._handleFill = value ? new SolidBrush(value) : SolidBrush.GRAY;
			this._refreshOwner();
		}
	},
	setHandleNoneColor: function (value) {
		if (value != this._handleNoneColor) {
			this._handleNoneColor = value;
			this._handleNoneFill = value ? new SolidBrush(value) : SolidBrush.GRAY;
			this._refreshOwner();
		}
	},
	setHoveredHandleColor: function (value) {
		if (value != this._hoveredHandleColor) {
			this._hoveredHandleColor = value;
			this._hoveredHandleFill = value ? new SolidBrush(value) : SolidBrush.GRAY;
			this._refreshOwner();
		}
	},
	setHoveredHandleNoneColor: function (value) {
		if (value != this._hoveredHandleNoneColor) {
			this._hoveredHandleNoneColor = value;
			this._hoveredHandleNoneFill = value ? new SolidBrush(value) : SolidBrush.GRAY;
			this._refreshOwner();
		}
	},
	setHandleBorderColor: function (value) {
		if (value != this._handleBorderColor) {
			this._handleBorderColor = value;
			this._handleBorderPen = value ? new SolidPen(value) : SolidPen.GRAY;
			this._refreshOwner();
		}
	},
	setAddParentNodeOnFiltering:function(value) {
		if (value != this._addParentNodeOnFiltering) {
			this._addParentNodeOnFiltering = value;
			var grid = this.grid();
			if (grid && grid instanceof TreeView) {
				var item = grid._items;
				if (item && item instanceof TreeGridItemProvider) {
					item._addParentNodeOnFiltering = value;
					grid.applyFilters();
				}
			}
		}
	}
});

var HeaderCheckImageOptions = defineClass("HeaderCheckImageOptions", null, {
	init: function(config) {
		this._super();
		config && this.assign(config);
	},
	none: undefined,
	fill: undefined,
	hoveredNone: undefined,
	hoveredFill: undefined,
	loadImages: function(container) {
		container.getImage(this._none);
		container.getImage(this._fill);
		container.getImage(this._hoveredNone); 
		container.getImage(this._hoveredFill); 
	}
});

var ColumnHeaderOptions = defineClass("ColumnHeaderOptions", GridBaseOptions, {
	init: function(grid) {
		this._super(grid);
		this._checkImages = new HeaderCheckImageOptions();
	},
	destroy: function() {
		this._destroying = true;
		this._checkImages = null;
		this._super();
	},
	checkVisibility: HandleVisibility.ALWAYS,
	imageCheckHandle: false,
	checkImages: null,
	checkColor : undefined,
	checkNoneColor : undefined,
	hoveredCheckColor : undefined,
	hoveredCheckNoneColor : undefined,
	checkBorderColor: undefined,
	setCheckVisibility: function (value) {
		if (value != this._checkVisibility) {
			this._checkVisibility = value;
			this._refreshOwner();
		}
	},
	setCheckImages: function (value) {
		this._checkImages.assign(value);
	},
	setCheckColor: function (value) {
		if (value != this._checkColor) {
			this._checkColor = value;
			this._checkFill = value ? new SolidBrush(value) : SolidBrush.GRAY;
			this._refreshOwner();
		}
	},
	setCheckNoneColor: function (value) {
		if (value != this._checkNoneColor) {
			this._checkNoneColor = value;
			this._checkNoneFill = value ? new SolidBrush(value) : SolidBrush.GRAY;
			this._refreshOwner();
		}
	},
	setHoveredCheckColor: function (value) {
		if (value != this._hoveredCheckColor) {
			this._hoveredCheckColor = value;
			this._hoveredCheckFill = value ? new SolidBrush(value) : SolidBrush.GRAY;
			this._refreshOwner();
		}
	},
	setHoveredCheckNoneColor: function (value) {
		if (value != this._hoveredCheckNoneColor) {
			this._hoveredCheckNoneColor = value;
			this._hoveredCheckNoneFill = value ? new SolidBrush(value) : SolidBrush.GRAY;
			this._refreshOwner();
		}
	},
	setCheckBorderColor: function (value) {
		if (value != this._checkBorderColor) {
			this._checkBorderColor = value;
			this._checkBorderPen = value ? new SolidPen(value) : SolidPen.GRAY;
			this._refreshOwner();
		}
	}
});

var GroupingOptions = defineClass("GroupingOptions", GridBaseOptions, {
	init : function(grid) {
		this._super(grid);
		this._toast = new ToastOptions();
		this._toast._visible = false;
		this._toast._message = "Grouping...";
	},
	destroy: function() {
		this._destroying = true;
		this._toast = null;
		this._super();
	},
	enabled: true,
	prompt: window.RG_CONST && window.RG_CONST.GROUPINGPROMPT ? window.RG_CONST.GROUPINGPROMPT :"컬럼 헤더를 이 곳으로 끌어다 놓으면 그 컬럼으로 그룹핑합니다.",
	linear: false,
	expandWhenGrouping: true,
	summarizing: true,
	commitBeforeGrouping: true,
	commitBeforeExpand: true,
	commitBeforeCollapse: true,
	fixMergedColumns: true,
	toast: null,
	removeIncludeLower: false,
	setToast: function (value) {
		if (value != this._toast) {
			this._toast.assign(value);
		}
	},
	propertyChanged: function () {
		this.grid().groupingOptionsChanged();
		this._layoutOwner();
	}
});

var CopyOptions = defineClass("CopyOptions", null, {
	init: function () {
		this._super();
		this._dateWriter = null;
		this._boolWriter = null;
	},
	enabled: true,
	singleMode: false,
	datetimeFormat: null,
	booleanFormat: null,
	lookupDisplay: false,
	dateWriter: function () {
		return this._dateWriter;
	},
	boolWriter: function () {
		return this._boolWriter;
	},
	setDatetimeFormat: function (value) {
		if (value != this._datetimeFormat) {
			this._datetimeFormat = value;
			if (value) {
				this._dateWriter = new DateTimeWriter(value);
			} else {
				this._dateWriter = null;
			}
		}
	},
	setBooleanFormat: function (value) {
		if (value != this._booleanFormat) {
			this._booleanFormat = value;
			if (value) {
				this._boolWriter = new BooleanFormatter(value);
			} else {
				this._boolWriter = null;
			}
		}
	}
});
var PasteOptions = defineClass("PasteOptions", null, {
	init: function () {
		this._super();
		this._boolReader = null;
		this._dateReaders = null;
		this._numberCharExp = null;
		this._numberCharExpOfCols = null;
	},
	enabled: true,
	singleMode: false,
	startEdit: true,
	commitEdit: true,
	enableAppend: true,
	fillFieldDefaults: false,
	fillColumnDefaults: false,
	forceRowValidation: false,
	forceColumnValidation: false,
	datetimeFormats: null,
	booleanFormat: null,
	numberChars: null,
	numberSeparator: null,
	numberCharsOfCols: {},
	numberSeparatorOfCols: {},
	selectionBase: false,
	stopOnError: true,
	noEditEvent: false,
	eventEachRow: false, 
	checkReadOnly:false,
	checkDomainOnly:false,
	setDatetimeFormats: function (value) {
		if (value != this._datetimeFormats) {
			if (_isArray(value)) {
				this._datetimeFormats = value.concat();
			} else if (value) {
				this._datetimeFormats = [value];
			} else {
				this._datetimeFormats = null;
			}
			if (this._datetimeFormats) {
				this._dateReaders = [];
				for (var i = 0; i < this._datetimeFormats.length; i++) {
					this._dateReaders.push(new DateTimeReader(this._datetimeFormats[i]));
				}
			} else {
				this._dateReaders = null;
			}
		}
	},
	dateReaders: function () {
		return this._dateReaders;
	},
	setBooleanFormat: function (value) {
		if (value != this._booleanFormat) {
			this._booleanFormat = value;
			if (value) {
				this._boolReader = new BooleanConverter(value);
			} else {
				this._boolReader = null;
			}
		}
	},
	boolReader: function () {
		return this._boolReader;
	},
	setNumberChars: function (value) {
		if (value != this._numberChars) {
			this._numberChars = value;
			if (value && value.length > 0) {
				var s = "[";
				for (var i = 0; i < value.length; i++) {
					var c = value[i];
					if (c == "\\") {
						s += "\\" + c;
					} else {
						s += c;
					}
				}
				s += "]";
				this._numberCharExp = new RegExp(s, "g");
			} else {
				this._numberCharExp = null;
			}
		}
	},
	setNumberCharsOfCols: function (value) {
		this._numberCharsOfCols = value;
		this._numberCharExpOfCols = {};
		if (value) {
			for (var name in value) {
				var col = value[name];
				if (col instanceof Array && col.length > 0) {
					var s = "[";
					for (var i = 0, l = col.length; i < l; i++) {
						var c = col[i];
						if (c == "\\") {
							s += "\\" + c;
						} else {
							s += c;
						}
					}
					s += "]";
					this._numberCharExpOfCols[name] = new RegExp(s, "g");
				} else {
					this._numberCharExpOfCols[name] = null;
				}
			}
		}
	},
	numberCharExp: function () {
		return this._numberCharExp;
	},
	numberCharExpOfCol: function (col) {
		return col && this._numberCharExpOfCols && this._numberCharExpOfCols[col] ? this._numberCharExpOfCols[col] : this._numberCharExp;
	},
	numberSeparatorOfCol: function (col) {
		return col && this._numberSeparatorOfCols && this._numberSeparatorOfCols[col] ? this._numberSeparatorOfCols[col] : this._numberSeparator;
	}
});