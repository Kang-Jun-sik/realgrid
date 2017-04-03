var GridContainer = defineClass("GridContainer", VisualContainer, {
	init : function (dom, containerId, readMode) {
		this._super(dom, containerId, readMode);
        this._createBackgroundElements(this.$_dom);
		this._gridView = this._createGridView(this.$_dom, this, readMode);
		this.addElement(this._gridView);
        this._prepareBorder();
        this._prepareLayers();
		this.setDefaultTool(this._createDefaultTool(), true);
	},
	unloadProc: function() {
		if (this._gridView) {
			// this._gridView.clearWindowEventListeners && this._gridView.clearWindowEventListeners();
			this._gridView._editController._defaultEditor._container = null;
			this._gridView._editController._defaultEditor._editor = null;
			this._gridView = null;
		}
		this._super();
	},
	destroy: function() {
		this._destroying = true;
		this._gridView = null;
		this._super();
	},
	gridView: function () {
		return this._gridView;
	},
	addFeedback: function (element) {
		this._feedbackView.addElement(element);
	},
	removeFeedback: function (element) {
		this._feedbackView.removeElement(element);
	},
	_createChildren: function (containerElement) {
	},
	_layoutChildren: function (bounds) {
        /*
         var r = bounds.clone();
         r.inflate(-1, -1);
		this._vscrollBar.setBounds(r.right() - 20, r.y, 20, r.height);
		this._hscrollBar.setVisible(false);
		*/
	},
	_beforeRender: function (bounds) {
		this._gridView._beforeRender(bounds);
	},
	_doLayout: function (bounds) {
		var r = bounds.clone();
		if (this._borderView) {
            var border = this._gridView._styles.border();
			this._borderView.setVisible(border && border.width() > 0);
            if (this._borderView.isVisible()) {
                this._borderView._border = border;
                this._borderView.setRect(r);
                this._borderView.invalidate();
                r.inflate(-border.width(), -border.width());
            }
		} else {
        }
		this._gridView.setRect(r);
		this._feedbackView.setRect(r);
		r.x = r.y = 0;
		this._gridView._doLayout(r);
	},
	_doDrawContainer: function (g, bounds) {
	},
    _doDrawContainerHtml: function (g, bounds) {
    },
	_focusHandler: function (event) {
		this._gridView._focusHandler(event);
	},
    _createBackgroundElements: function () {
    },
	_createGridView: function (dom, container, readMode) {
		return new GridView(dom, container, readMode);
	},
    _prepareBorder: function () {
        if (this.$_rich) {
            this._borderView = new GridBorderElement(this.$_dom);
            this.addElement(this._borderView);
        } else {
            this._container.style.border = "1px solid #888";
        }
    },
    _prepareLayers: function () {
        this._feedbackView = new LayerElement(this.$_dom, "feedbackLayer");
        this.addElement(this._feedbackView);
    },
	_createDefaultTool: function () {
		if ($_mobileEnable) {
			return _isMobile() ? new MobileSelectionTool(this) : new GridViewSelectionTool(this);
		} else {
			return new GridViewSelectionTool(this);
		}
	}
});
var GridBorderElement = defineClass("GridBorderElement", LayerElement, {
	init: function (dom) {
		this._super(dom, "gridBorderView");
		this._border = new SolidPen(0xffaaaaaa);
		this.setMouseEnabled(false);
	},
	_doDraw: function (g) {
		var w = this._border.width();
		var p = _int(w / 2);
		g.drawBoundsI(null, this._border, p, p, this.width() - w, this.height() - w);
	}
});
var _wmv_ = function (dom) {
	var img = new _egam_();
	img.src = "data:image/png;base64," + _wm_;
	var view = new LayerElement(dom);
	view._doDraw = function (g) {
		g.aL(img, (this.width() - img.width) / 2, (this.height() - img.height) / 2, img.width, img.height);
	};
	return view;
};
var $_INVISIBLE_EDIT_BOUNDS = new Rectangle(-10000, -10000, 100, 100);
var GridBase = defineClass("GridBase", LayerElement, {
	init: function (dom, container, readMode) {
		this._super(dom, "gridView");
		this._container = container;
		this._readMode = readMode;
		this._offsetX = 0;
		this._offsetY = 0;
		if (container.$_rich) {
			this._context = container._context;
			this._toolContext = new CanvasContext("toolContext", container);
			container.addContext(this._toolContext);
		}
		this._loading = true;
        this._userMode = false;
        this._userModeError = null;
		this._gridObjects = [];
		this._addGridObject(this._panel = this._createPanelModel());
		this._addGridObject(this._header = new Header(this));
		this._addGridObject(this._editBar = new EditBar(this));
		this._addGridObject(this._footer = this._createFooterModel());
		this._addGridObject(this._indicator = new Indicator(this));
		this._addGridObject(this._stateBar = new StateBar(this));
		this._addGridObject(this._checkBar = new CheckBar(this));
		this._addGridObject(this._body = new GridBody(this));
		this._addGridObject(this._rowGroup = new RowGroup(this));
		var view = this._rootElement = new LayerElement(dom, "grid root view");
		this.addChild(view);
		view = this._emptyView = this._createEmptyView(dom);
		view.setVisible(false);
		this.addChild(view);
		view = this._debugView = new GridDebugElement(dom, this);
		this.addChild(view);
		this._panelView = this._createPanelView(dom, this._panel);
		this._bodyView = this._createBodyView(dom, this._body, false);
		this._fixedBodyView = this._createBodyView(dom, this._body, true);
		this._rfixedBodyView = this._createBodyView(dom, this._body, true, true);
		this._mergeView = new GridMergeElement(dom);
		this._fixedMergeView = new GridMergeElement(dom, true);
		this._rfixedMergeView = new GridMergeElement(dom, true, true);
		this._mergeHeaderLayer = new GridMergeHeaderElement(dom);
		this._headerView = new HeaderElement(dom, this._header);
		this._fixedHeaderView = new HeaderElement(dom, this._header, true);
		this._rfixedHeaderView = new HeaderElement(dom, this._header, true, true);
        this._summaryView = new HeaderSummaryElement(dom, this._header.summary());
        this._fixedSummaryView = new HeaderSummaryElement(dom, this._header.summary(), true);
        this._rfixedSummaryView = new HeaderSummaryElement(dom, this._header.summary(), true, true);
		this._indicatorView = new IndicatorElement(dom, this._indicator);
		this._stateBarView = new StateBarElement(dom, this._stateBar);
		this._checkBarView = new CheckBarElement(dom, this._checkBar);
		this._footerView = this._createFooterView(dom, this._footer);
		this._fixedFooterView = new FooterElement(dom, this._footer, true);
		this._rfixedFooterView = new FooterElement(dom, this._footer, true, true);
		this._rowGroupView = new RowGroupElement(dom, this._rowGroup);
		this._indicatorHeadView = new IndicatorHeadElement(dom);
		this._stateBarHeadView = new StateBarHeadElement(dom);
		this._checkBarHeadView = new CheckBarHeadElement(dom);
		this._indicatorFootView = new IndicatorFootElement(dom);
		this._stateBarFootView = new StateBarFootElement(dom);
		this._checkBarFootView = new CheckBarFootElement(dom);
        this._indicatorSummaryView = new IndicatorSummaryElement(dom);
        this._stateBarSummaryView = new StateBarSummaryElement(dom);
        this._checkBarSummaryView = new CheckBarSummaryElement(dom);
		if (this._panelView) {
			this.addElement(this._panelView);
		}
		this.addElement(this._bodyView);
		this.addElement(this._mergeView);
		this.addElement(this._fixedBodyView);
		this.addElement(this._rfixedBodyView);
		this.addElement(this._fixedMergeView);
		this.addElement(this._rfixedMergeView);
		this.addElement(this._mergeHeaderLayer);
		this.addElement(this._headerView);
		this.addElement(this._fixedHeaderView);
        this.addElement(this._rfixedHeaderView);
        this.addElement(this._summaryView);
        this.addElement(this._fixedSummaryView);
		this.addElement(this._rfixedSummaryView);
		this._addGroupView();
		this.addElement(this._indicatorView);
		this.addElement(this._stateBarView);
		this.addElement(this._checkBarView);
		this.addElement(this._footerView);
		this.addElement(this._fixedFooterView);
		this.addElement(this._rfixedFooterView);
		this.addElement(this._indicatorHeadView);
		this.addElement(this._stateBarHeadView);
		this.addElement(this._checkBarHeadView);
		this.addElement(this._indicatorFootView);
		this.addElement(this._stateBarFootView);
		this.addElement(this._checkBarFootView);
        this.addElement(this._indicatorSummaryView);
        this.addElement(this._stateBarSummaryView);
        this.addElement(this._checkBarSummaryView);
		this._linesLayer = new GridLinesElement(dom, this);
		this.addElement(this._linesLayer);
		this._selectionLayer = new LayerElement(dom, "selectionLayer");
		this.addElement(this._selectionLayer);
		this._focusLayer = new LayerElement(dom, "focusLayer");
		this.addElement(this._focusLayer);
		this._rowFocusLayer = new LayerElement(dom, "rowFocusLayer");
		this.addElement(this._rowFocusLayer);
		this._scrollLayer = new LayerElement(dom, "scrollLayer");
		this.addElement(this._scrollLayer);
		this._hscrollBar = null;
		this._vscrollBar = null;
		this._scrolledTime = 0;
		this._feedbackLayer = new LayerElement(dom, "feedbackLayer");
		this.addElement(this._feedbackLayer);
		/*$addWatermark$*/
		this._rootColumn = new RootColumn(this);
		this._dataRoots = new DataRootCollection();
		this._columnLayouts = new ColumnLayoutCollection();
		this._columnLayout = null;
		this._orgColumns = [];
		this._orgColumned = true;
		this._columnLayoutChanged = false;
		this._columnsLock = false;
		this._columnWidthsDirty = false;
		this._columnsDirty = false;
		this._itemProvider = null;
		this._lookupProvider = null;
		this._delegate = this._createDelegate();
        this._eventHandler = this._delegate.createGridEventHandler();
        this._eventHandler && this.addListener(this._eventHandler);
		this._layoutManager = this._createLayoutManager();
		this._heightMeasurer = null;
		this._toolTipManager = new ToolTipManager(this);
		this._clipboardManager = new ClipboardManager(this);
		this._progressManager = new ProgressManager(this._container._container);
		this._indicatorFootView.setRenderer(this._delegate.getFooterHeadRenderer());
        this._indicatorSummaryView.setRenderer(this._delegate.getRowHeaderSummaryRenderer());
		this._selections = new SelectionManager(this);
		this._selections.addListener(this);
		this._selectionViews = new Dictionary();
		this._editController = this._createEditController();
		this._validations = new EditValidationCollection();
		this._validationManager = new ValidationManager(this);
		this._columnSummaryRuntime = new ColumnSummaryRuntime();
		this._rowGroupSummaryRuntime = new RowGroupSummaryRuntime();
		this._columnValidationRuntime = new DataCellValidationRuntime();
		this._rowValidationRuntime = new DataRowValidationRuntime();
		this._displayOptions = new DisplayOptions(this);
		this._editOptions = new EditOptions(this);
		this._editorOptions = new EditorOptions(this);
		this._copyOptions = new CopyOptions();
		this._pasteOptions = new PasteOptions();
		this._fixedOptions = new FixedOptions(this);
		this._selectOptions = new SelectOptions(this);
		this._sortingOptions = new SortingOptions(this);
		this._filteringOptions = new FilteringOptions(this);
		this._groupingOptions = new GroupingOptions(this);
		this._columnHeaderOptions = new ColumnHeaderOptions(this);
		this._styles = new VisualStyles(this, "grid");
		this._stylesDirty = false;
		this.initStyles();
		this._dataCellStyles = new DataCellStyleCollection(this);
		this._styleMap = null;
		this._resetting = false;
		this._layouted = false;
		this._focusing = false;
		this._focusedIndex = new CellIndex();
		this._shadowIndex = new CellIndex();
		this._currentRow = -1;
		this._currentRowId = -1;
		this._vertScroll = 0;
		this._horzScroll = 0;
		this._imageLists = {};
		this._delegate.prepareResources();
		this._filterSelector = new ColumnFilterSelector(this._container._container);
		this._toastManager = new ToastManager(this);
		this._popupMenuManager = new PopupMenuManager(this.container()).addListener(this);
        this._contextMenu = null;
		this._dataCellRenderers = new DataCellRendererCollection(this._delegate);
		this._groupFooterMergeManager = new RowGroupFooterMergeManager();
		this._footerMergeManager = new FooterMergeManager();
		this._headerSummaryMergeManager = new FooterMergeManager();
		/*
		this._editContainer = document.createElement("div");
		document.body.appendChild(this._editContainer);
		this._editContainer.style["position"] = "absolute";
		this._editContainer.style["z-index"] = 2000;
		this._editContainer.style["overflow"] = "hidden";
		this._editContainer.style["width"] = "120px";
		this._editContainer.style["height"] = "24px";
		this._editContainer.style["border"] = "none";
		this._editContainer.style["top"] = "0px";
		this._editContainer.style["left"] = "0px";
		this._editor = document.createElement("textarea");
		this._editContainer.appendChild(this._editor);
		this._editor.autocomplete = "off";
		this._editor.style["margin"] = "0px";
		this._editor.style["padding"] = "1px";
		this._editor.style["box-sizing"] = "content-box";
		this._editor.style["padding"] = "1px";
		this._editor.style["font-style"] = "normal";
		this._editor.style["font-variant"] = "normal";
		this._editor.style["font-weight"] = "normal";
		this._editor.style["font-size"] = "10pt";
		this._editor.style["line-height"] = "normal";
		this._editor.style["font-family"] = "Tahoma";
		this._editor.style["word-wrap"] = "normal";
		this._editor.style["overflow"] = "hidden";
		this._editor.style["resize"] = "none";
		this._editor.style["border"] = "2px solid rgb(82, 146, 247)";
		this._editor.style["outline"] = "none";
		this._editor.style["box-shadow"] = "rgba(0, 0, 0, 0.4) 1px 2px 5px";
		this._editor.style["textalign"] = "left";
		this._editor.style["color"] = "rgb(68, 84, 106)";
		this._editor.style["width"] = "113px";
		this._editor.style["height"] = "17px";
		*/
		/*
		 * textarea {
    height: 28px;
    width: 400px;
}
#textarea {
    -moz-appearance: textfield-multiline;
    -webkit-appearance: textarea;
    border: 1px solid gray;
    font: medium -moz-fixed;
    font: -webkit-small-control;
    height: 28px;
    overflow: auto;
    padding: 2px;
    resize: both;
    width: 400px;
}
input {
    margin-top: 5px;
    width: 400px;
}
#input {
    -moz-appearance: textfield;
    -webkit-appearance: textfield;
    background-color: white;
    background-color: -moz-field;
    border: 1px solid darkgray;
    box-shadow: 1px 1px 1px 0 lightgray inset;  
    font: -moz-field;
    font: -webkit-small-control;
    margin-top: 5px;
    padding: 2px 3px;
    width: 398px;    
}
<textarea>I am a textarea</textarea>
<div id="textarea" contenteditable>I look like textarea</div>
<input value="I am an input" />
<div id="input" contenteditable>I look like an input</div>
		 */
		this._topIndex = 0;
		this._dataChanged = false;
		this._cellUpdateEventLock = false;
		this._updateLock = false;
		this._rowChangeTimer = undefined;
		this._rowChangeTimerCallback = function () {
			this.$_checkCurrentRow(true);
		}.bind(this);
        this.$_fixedColCount = this.$_fixedRowCount = 0;
        this.$_fixedColEditable = this.$_fixedRowEditable = true;
        this.$_editOptionsWritable = false;
        this._tmpIndex = new CellIndex(this);
        this._productName = "RealGridJS v1.0";
	},
	destroy: function() {
		this._destroying = true;
		// this.clearWindowEventListeners && this.clearWindowEventListeners();
		for (var attr in this) {
			if ( this.hasOwnProperty(attr) && 
				(this[attr] instanceof VisualObject || 
				 this[attr] instanceof CellElement ||
				 this[attr] instanceof GridElement ||
				 this[attr] instanceof GridBaseOptions ||
				 this[attr] instanceof ColumnFilterSelector )) {
				this[attr] = null;
			}
		}
		this._selectionViews = null;
		this._rowChangeTimerCallback = null;
		this._delegate && !this._delegate._destroying && this._delegate.destroy && this._delegate.destroy();
		this._delegate = null;
		this._debugView = null;
		this._footerView = null;
		this._selections = null;
		this._rowGroupView = null;
		this._summaryView = null;
		this._styles = null;
		this._dataCellRenderers = null;
        this._productName = null;
        this._imageLists = null;
        this._dataCellStyles = null;
		this._hscrollBar = null;
		this._vscrollBar = null;
		this._prevLast = null;
		this._topIndex = null;
		this._prevTopIndex = null;
		this._leftPos = null;
		this._editController = null;
		CellIndex.$_temp._grid = null;
		CellIndex.$_temp._column = null;
		CellIndex.$_temp._itemIndex = null;
		this._super();
	},
	/*
	$_initialize: function (container, offsetX, offsetY) {
		this._container = container;
		this._offsetX = offsetX;
		this._offsetY = offsetY;
	},
	*/
	stylesChanged: function (entry) {
		if (!this._stylesDirty) {
			this._stylesDirty = true;
			this.refreshView();
		}
	},
	dataCellStyleAdded: function (id, needUpdate) {
		if (needUpdate) {
			this.invalidateLayout();
		}
	},
	dataCellStyleChanged: function (id, needUpdate) {
		if (needUpdate) {
			this.invalidateLayout();
		}
	},
	dataCellStyleRemoved: function (id, style, needUpdate) {
		this.itemSource().removeCellStyle(style);
		if (needUpdate) {
			this.invalidateLayout();
		}
	},
	dataCellStylesCleared: function (needUpdate) {
		this.itemSource().clearCellStyles();
		if (needUpdate) {
			this.invalidateLayout();
		}
	},
	scrollBarWidth: 16,
    scrollBarHeight: 16,
	body: null,
	panel: null,
	header: null,
	editBar: null,
	footer: null,
	indicator: null,
	checkBar: null,
	stateBar: null,
	rowGroup: null,
	columnHeaderOptions: null,
	displayOptions: null,
	editOptions: null,
	editorOptions: null,
	copyOptions: null,
	pasteOptions: null,
	fixedOptions: null,
	selectOptions: null,
	sortingOptions: null,
	filteringOptions: null,
	groupingOptions: null,
	styles: null,
	topIndex: 0,
	leftPos: 0,
	summaryMode: SummaryMode.AGGREGATE,
	validations: null,
    sortMode: SortMode.AUTO,
    filterMode: FilterMode.AUTO,
    userMode: false,
    userModeError: null,
	clearWindowEventListeners: function() {
		this._container.$_removeListenerAll();
		// __clearWindowEventListeners(this._container);
	},
    setUserMode: function (value) {
        this._userMode = value;
    },
    setUserModeError: function (value) {
        this._userModeError = value;
    },
	isReadMode: function () {
		return this._readMode;
	},
	setStyles: function (value) {
		if (value !== this._styles) {
			this._styles.extend(value);
		}
	},
	setScrollBarWidth: function (value) {
		value = Math.max(4, value);
		if (value != this._scrollBarWidth) {
			this._scrollBarWidth = value;
			this.refreshView();
		}
	},
    setScrollBarHeight: function (value) {
        value = Math.max(4, value);
        if (value != this._scrollBarHeight) {
            this._scrollBarHeight = value;
            this.refreshView();
        }
    },
	dataCellRenderers: function () {
		return this._dataCellRenderers;
	},
	getItemSource: function () {
		return this._itemProvider;
	},
	itemSource: function () {
		return this._itemProvider;
	},
	setItemSource: function (value) {
		if (this._itemProvider) {
			this._itemProvider.removeListener(this);
		}
		this._itemProvider = value;
		if (this._itemProvider) {
			this._itemProvider.addListener(this);
		}
	},
	dataSource: function () {
		return this._itemProvider ? this._itemProvider.dataSource() : null;
	},
	setDataSource: function (value) {
        var oldDs = this.dataSource();
        if (this._itemProvider) {
            this._itemProvider.setDataSource(value);
        }
        if (this.dataSource() !== oldDs) {
            this.dataSource() && this.applyFilters();
        }
	},
    maxItemCount: function () {
        return 0;
    },
    setMaxItemCount: function (value) {
    },
	activeTool: function () {
		return this.container().activeTool(); 
	},
	toolTipManager: function () {
		return this._toolTipManager;
	},
	validationManager: function () {
		return this._validationManager;
	},
	footerMergeManager: function () {
		return this._footerMergeManager;
	},
	headerSummaryMergeManager: function () {
		return this._headerSummaryMergeManager;
	},
	groupFooterMergeManager: function () {
		return this._groupFooterMergeManager;
	},
	setValidations: function (value) {
		this._validations.assign(value);
	},
	editController: function () {
		return this._editController;
	},
	dataCellStyles: function () {
		return this._dataCellStyles;
	},
	setBody: function (value) {
		this._body.assign(value);
	},
	setPanel: function (value) {
		this._panel && this._panel.assign(value);
	},
	setIndicator: function (value) {
		this._indicator.assign(value);
	},
	setStateBar: function (value) {
		this._stateBar.assign(value);
	},
	setCheckBar: function (value) {
		this._checkBar.assign(value);
	},
	setEditBar: function (value) {
		this._editBar.assign(value);
	},
	setHeader: function (value) {
		this._header.assign(value);
	},
	setFooter: function (value) {
		this._footer.assign(value);
	},
	setRowGroup: function (value) {
		this._rowGroup.assign(value);
	},
	panelView: function () {
		return this._panelView;
	},
	mergeView: function () {
		return this._mergeView;
	},
	fixedMergeView: function () {
		return this._fixedMergeView;
	},
	rfixedMergeView: function () {
		return this._rfixedMergeView;
	},
	mergeHeaderView: function () {
		return this._mergeHeaderLayer;
	},
	indicatorView: function () {
		return this._indicatorView;
	},
	stateBarView: function () {
		return this._stateBarView;
	},
	checkBarView: function () {
		return this._checkBarView;
	},
	headerView: function () {
		return this._headerView;
	},
	fixedHeaderView: function () {
		return this._fixedHeaderView;
	},
	rfixedHeaderView: function () {
		return this._rfixedHeaderView;
	},
    summaryView: function () {
        return this._summaryView;
    },
    fixedSummaryView: function () {
        return this._fixedSummaryView;
    },
	rfixedSummaryView: function () {
        return this._rfixedSummaryView;
    },
	footerView: function () {
		return this._footerView;
	},
	fixedFooterView: function () {
		return this._fixedFooterView;
	},
	rfixedFooterView: function () {
		return this._rfixedFooterView;
	},
	rowGroupView: function () {
		return this._rowGroupView;
	},
    summaryHeadView: function () {
        return this._summaryHeadView;
    },
	indicatorHeadView: function () {
		return this._indicatorHeadView;
	},
	indicatorFootView: function () {
		return this._indicatorFootView;
	},
    indicatorSummaryView: function () {
        return this._indicatorSummaryView;
    },
	stateBarHeadView: function () {
		return this._stateBarHeadView;
	},
	stateBarFootView: function () {
		return this._stateBarFootView;
	},
    stateBarSummaryView: function () {
        return this._stateBarSummaryView;
    },
	checkBarHeadView: function () {
		return this._checkBarHeadView;
	},
	checkBarFootView: function () {
		return this._checkBarFootView;
	},
    checkBarSummaryView: function () {
        return this._checkBarSummaryView;
    },
	bodyView: function () {
		return this._bodyView;
	},
	fixedBodyView: function () {
		return this._fixedBodyView;
	},
	rfixedBodyView: function () {
		return this._rfixedBodyView;
	},
	delegate: function () {
		return this._delegate;
	},
	layoutManager: function () {
		return this._layoutManager;
	},
	popupMenuManager: function () {
		return this._popupMenuManager;
	},
	selections: function () {
		return this._selections;
	},
	columnSummaryRuntime: function () {
		return this._columnSummaryRuntime;
	},
	rowGroupSummaryRuntime: function () {
		return this._rowGroupSummaryRuntime;
	},
	columnValidationRuntime: function () {
		return this._columnValidationRuntime;
	},
	rowValidationRuntime: function () {
		return this._rowValidationRuntime;
	},
	setDisplayOptions: function (value) {
		this._displayOptions.assign(value);
	},
	setSelectOptions: function (value) {
		this._selectOptions.assign(value);
	},
	setEditOptions: function (value) {
		this._editOptions.assign(value);
	},
	setEditorOptions: function (value) {
		this._editorOptions.assign(value);
	},
	setCopyOptions: function (value) {
		this._copyOptions.assign(value);
	},
	setPasteOptions: function (value) {
		this._pasteOptions.assign(value);
	},
	setFixedOptions: function (value) {
		this._fixedOptions.assign(value);
	},
	setSortingOptions: function (value) {
		this._sortingOptions.assign(value);
		if (value && value.handleImages) 
			this._sortingOptions.handleImages().loadImages(this._container);
	},
	setFilteringOptions: function (value) {
		this._filteringOptions.assign(value);
		if (value && value.handleImages) 
			this._sortingOptions.handleImages().loadImages(this._container);
	},
	setGroupingOptions: function (value) {
		this._groupingOptions.assign(value);
	},
	setColumnHeaderOptions: function (value) {
		this._columnHeaderOptions.assign(value);
		if (value && value.checkImages) 
			this._columnHeaderOptions.checkImages().loadImages(this._container);
	},
	setSummaryMode: function (value) {
		if (value != this._summaryMode) {
			this._summaryMode = value;
			this.$_summaryModeChanged();
		}
	},
	heightMeasurer: function () {
		return this._heightMeasurer || SimpleHeightsMeasurer.Default;
	},
	setHeightMeasurer: function (value) {
		this._heightMeasurer = value;
	},
	setTopIndex: function (value) {
		value = Math.max(0, Math.min(parseInt(value), this.itemCount() - this._layoutManager._fixedRows - 1, this._vscrollBar ? this._vscrollBar.maxPosition() : 0));
		if (value != this._topIndex) {
			this._topIndex = value;
			this.refreshView();
			this.closePopups();
		}
	},
	topItem: function () {
		return this._topIndex + this.layoutManager().fixedItemCount();
	},
	setTopItem: function (value) {
		this.setTopIndex(value - this.layoutManager().fixedItemCount());
	},
	setLeftPos: function (value) {
		value = Math.max(0, Math.min(parseInt(value), this._hscrollBar ? this._hscrollBar.maxPosition() : 0));
		if (value != this._leftPos) {
			this._leftPos = value;
			this.refreshView();
			this.closePopups();
		}
	},
	leftCol: function () {
		var lm = this._layoutManager;
		return lm ? lm.firstCol() : 0;
	},
	setLeftCol: function (value) {
		var lm = this._layoutManager;
		if (lm) {
			value = Math.max(lm.fixedColCount(), Math.min(value, lm.columnCount() - 1));
			this.setLeftPos(lm.columnBounds(value).x);
		}
	},
	setRightCol: function (value) {
	    var lm = this._layoutManager;
	    if (lm) {
	        var colPos = Math.min(lm.columnCount() - 1, Math.max(0, (lm.columnCount() - value - 1)));
	        var barLength = this._hscrollBar._max - this._hscrollBar.maxPosition()
	        var x = Math.min(this._hscrollBar.maxPosition(), lm.columnBounds(colPos).x + lm._columns[colPos]._width - barLength);           
            x = Math.max(x, 0);
            
	        this.setLeftPos(x);
	    }
	},
	isEmpty: function () {
		return this.itemCount() == 0 || this.visibleColumnCount() == 0;
	},
	lookupProvider: function () {
		return this._lookupProvider;
	},
	setLookupProvider: function (value) {
		if (value != this._lookupProvider) {
			if (this._lookupProvider) {
				this._lookupProvider.removeListener(this);
			}
			if (value && !(value instanceof LookupSourceProvider)) {
				value = new LocalLookupSourceProvider(value);
			}
			this._lookupProvider = value;
			if (this._lookupProvider) {
				this._lookupProvider.addListener(this);
			}
			this.refreshView();
		}
	},
	getHeaderLevel: function () {
		return this._rootColumn.headerLevel();
	},
	getDataLevel: function () {
		return this._rootColumn.dataLevel();
	},
	itemCount: function () {
		return this._itemProvider ? this._itemProvider.itemCount() : 0;
	},
	rowCount: function () {
		var ds = this.dataSource();
		return ds ? ds.rowCount() : 0;
	},
	getColumn: function (index) {
		return this._rootColumn.getItem(index);
	},
	columns: function () {
		return this._rootColumn.columns();
	},
	getOrderedColumns: function () {
		return this._rootColumn.getOrderedColumns();
	},
	setColumns: function (value) {
		this._checkEditing();
		this._columnsLock = true;
		try {
			this._rootColumn.setColumns(value);
			this._orgColumns = this._rootColumn.columns();
			this._orgColumned = true;
			this._columnLayoutChanged = true;
		} finally {
			this._columnsLock = false;
			this._columnsReset(this._rootColumn);
            this.dataSource() && this.applyFilters();
		}
	},
	addColumn: function (column, group, index) {
		var col;
		this._checkEditing();
		try {
			group && (group = typeof group === "string" ? this.columnByName(group) : typeof group === "object" ? this.columnByName(group.name) : group);
			group = group || this._rootColumn;
			if (group instanceof ColumnGroup) {
				col = group.add(column, index);
				return col;
			}
		} finally {
			col && this.dataSource() && this.applyFilters();
		}
	},
	removeColumn: function(column, group) {
		var ret = false;
		this._checkEditing();
		try {
			column && (column = typeof column === "string" ? this.columnByName(column) : typeof column === "object" ? this.columnByName(column.name) : column);
			group && (group = typeof group === "string" ? this.columnByName(group) : typeof group === "object" ? this.columnByName(group.name) : group);
			group = group || this._rootColumn;
			if (group instanceof ColumnGroup && column) {
				ret = group.remove(column); 
			}
			return ret;

		} finally {
            ret && this.dataSource() && this.applyFilters();
		}
	},
	collectColumns: function (columnsOnly) {
		var columns = [];
		this._rootColumn.collectColumns(columns, columnsOnly);
		return columns;
	},
	collectGroups: function () {
		var groups = [];
		this._rootColumn.collectGroups(groups);
		return groups;
	},
	getColumnNames: function (columnsOnly) {
		return this._rootColumn.collectColumnNames([], columnsOnly);
	},
	columnByHash: function (hash) {
		return this._rootColumn._columnMap[hash];
	},
	columnByName: function (name) {
		return this._rootColumn.columnByName(name);
	},
	/* @internal */ layoutColumnByName: function (name) {
		for (var i = 0, cnt = this._orgColumns.length; i < cnt; i++) {
			var c = this._orgColumns[i];
			if (c instanceof ColumnGroup) {
				c = c.valueColumnByName(name);
				if (c) {
					return c;
				}
			} else if (c.name() == name) {
				return c;
			}
		}
		return this._rootColumn.valueColumnByName(name);
	},
	columnByField: function (fieldIndex) {
		return this._rootColumn.columnByField(fieldIndex);
	},
	columnByFieldName: function (fieldName) {
		return this._rootColumn.columnByFieldName(fieldName);
	},
	columnsByFieldName: function (fieldName) {
		var columns = [];
		this._rootColumn.collectColumnsByFieldName(fieldName, columns);
		return columns.length > 0 ? columns : null;
	},
	columnByTag: function (tag) {
		return this._rootColumn.columnByTag(tag);
	},
	columnsByTag: function (tag) {
		var columns = [];
		this._rootColumn.collectColumnsByTag(tag, columns);
		return columns.length > 0 ? columns : null;
	},
	getDataColumn: function (dataIndex) {
		var i, 
			column,	// DataColumn
			group,	// ColumnGroup
			cnt = this._rootColumn.count();
		for (i = 0; i < cnt; i++) {
			column = _cast(this._rootColumn.getItem(i), DataColumn); 
			if (column) {
				if (column.dataIndex() == dataIndex) {
					return column;
				}
			} else {
				group = _cast(this._rootColumn.getItem(i), ColumnGroup);
				if (group) {
					column = group.getDataColumn(dataIndex);
					if (column) {
						return column;
					}
				}
			}
		}
		return null;
	},
	columnLayouts: function () {
		return this._columnLayouts.items();
	},
	setColumnLayouts: function (value) {
		if (value != this._columnLayouts) {
			this._columnLayouts.clear();
			this._columnLayouts.load(value);
		}
	},
	columnLayout: function () {
		return this._columnLayout;
	},
	setColumnLayout: function (value) {
		this._checkEditing();
		var layout = _cast(value, ColumnLayout);
		if (!layout) {
			if (typeof value == "string") {
				layout = this._columnLayouts.find(value);
			} else {
				layout = ColumnLayout.create(value);
			}
		}
		if (layout != this._columnLayout) {
			this._columnLayout = layout;
			if (layout) {
				this._columnsLock = true;
				try {
					if (this._orgColumned) {
						this._saveOrgWidths();
						this._orgColumned = false;
					}
					this._rootColumn.setColumns(layout.build(this));
					this._columnLayoutChanged = true;
				} finally {
					this._columnsLock = false;
					this._columnsRestore();
					this._rootColumn._clearSavedWidths();
				}
			} else {
				this.restoreColumns(true);
			}
		}
	},
	restoreColumns: function (restoreSize) {
		this._checkEditing();
		this._columnsLock = true;
		try {
			if (restoreSize) {
				this._restoreOrgWidths();
			}
			this._rootColumn.setColumns(this._orgColumns);
			this._orgColumned = true;
			this._columnLayout = null;
			this._columnLayoutChanged = true;
		} finally {
			this._columnsLock = false;
			this._columnsRestore();
		}
	},
	_doColumnsReset: function (group) {
	},
	_columnsReset: function (group) {
		if (!this._columnsLock) {
			this._rootColumn.initVisibles();
			this._resetColumnIndicies();
			for (var i = 0, cnt = this._rootColumn.count(); i < cnt; i++) {
				var column = this._rootColumn.getItem(i);
				if (column instanceof ColumnGroup) {
					column.initGroupWidths();
				}
			}
			this._columnWidthsDirty = true;
			this._columnsDirty = true;
			this.resetGrid();
			this._doColumnsReset(group);
			this._resetFooterMerge();
			this._resetHeaderSummaryMerge()
		}
	},
	_columnsRestore: function (group) {
		if (!this._columnsLock) {
			this._rootColumn.initVisibles();
			this._resetColumnIndicies();
			var i, column,
				cnt = this._rootColumn.count();
			for (i = 0; i < cnt; i++) {
				column = this._rootColumn.getItem(i);
				if (!isNaN(column._saveWidth)) {
					column._width = column._displayWidth = column._groupWidth = column._saveWidth;
				}
				if (column instanceof ColumnGroup && column.count() > 0) {
					column.restoreGroupWidths();
				}
			}
			this._columnWidthsDirty = true;
			this._columnsDirty = true;
			this.resetGrid();
			this._doColumnsReset(group);
			this._resetFooterMerge();
			this._resetHeaderSummaryMerge();
		}
	},
	_saveOrgWidths: function () {
		for (var i = 0, cnt = this._orgColumns.length; i < cnt; i++) {
			var c = this._orgColumns[i];
			c._orgWidth = c.saveWidth();
			if (c instanceof ColumnGroup) {
				c._saveOrgWidths();
			}
		}
	},
	_restoreOrgWidths: function () {
		for (var i = 0, cnt = this._orgColumns.length; i < cnt; i++) {
			var c = this._orgColumns[i];
			c.setSaveWidth(c._orgWidth);
			if (c instanceof ColumnGroup) {
				c._restoreOrgWidths();
			}
		}
	},
	linearizeColumns: function (sortProps) {
		var i, cnt;
		var columns = this.getLeafColumns(true);
		if (columns && (cnt = columns.length) > 0) {
			if (sortProps && sortProps.length > 0) {
				for (i = 0; i < sortProps.length; i++) {
					columns.sort(function (col1, col2) {
						var prop = sortProps[i];
						var v1 = col1.getProperty(prop);
						var v2 = col2.getProperty(prop);
						return v1 < v2 ? 1 : v1 > v2 ? -1 : 0;
					});
				}
			}
			var cols = [];
			var layout = new ColumnLayout();
			for (i = 0; i < cnt; i++) {
				var c = columns[i];
				c._saveWidth = c.width();
				cols.push(c);
			}
			layout.setItems(cols);
			this.setColumnLayout(layout);
		}
	},
	$_setPosition: function (column, y) {
		var i, cnt;
		column._layoutRect.y = y;
		if (column instanceof ColumnGroup && (cnt = column.visibleCount()) > 0) {
			if (column.isVertical()) {
				if (cnt > 1) {
					for (i = 0; i < cnt; i++) {
						this.$_setPosition(column.getVisibleItem(i), y + 1);
					}
				} else {
					this.$_setPosition(column.getVisibleItem(0), y);
				}
			} else {
				for (i = 0; i < cnt; i++) {
					this.$_setPosition(column.getVisibleItem(i), y);
				}
			}
		}
	},
	$_setRoot: function (column) {
		var i, cnt, group;
		if (column._layoutRect.y == 0) {
			column._dataRoot = column;
		} else {
			group = column.group();
			while (group) {
				if (group._layoutRect.y == 0) {
					break;
				}
				group = group.group();
			}
			column._dataRoot = group;
		}
		if (column instanceof ColumnGroup) {
			cnt = column.visibleCount();
			for (i = 0; i < cnt; i++) {
				this.$_setRoot(column.getVisibleItem(i));
			}
		}
	},
	$_setDistance: function (column, x) {
		column._distance = x;
		var d = 1;
		var group = _cast(column, ColumnGroup);
		if (group) {
			var i;
			var c;
			var g;
			var cnt = group.visibleCount();
			if (group.isVertical()) {
				for (i = 0; i < cnt; i++) {
					c = group.getVisibleItem(i);
					d = Math.max(d, this.$_setDistance(c, x));
				}
			} else {
				d = 0;
				for (i = 0; i < cnt; i++) {
					c = group.getVisibleItem(i);
					d += this.$_setDistance(c, x + d);
				}
			}
		}
		return d;
	},
	_resetColumnPositions: function () {
		var i, 
			column, 
			cnt = this.getVisibleColumnCount();
		for (i = 0; i < cnt; i++) {
			column = this.getVisibleColumn(i);
			this.$_setPosition(column, 0);
			this.$_setRoot(column);
			this.$_setDistance(column, i * 1000000);
		}
		this._dataRoots.collect(this._rootColumn);
	},
	_resetColumnIndicies: function () {
		this._rootColumn.resetIndicies(this);
		this._resetVisibleColumns();
		this._resetColumnPositions();
		this._resetColumnStates();
	},
	_resetVisibleColumns: function () {
		this._rootColumn.resetVisibles();
	},
	_resetColumnStates: function () {
		this._rootColumn.resetStates();
	},
	_resetFooterMerge: function () {
		this._footerMergeManager.buildRooms(this, this.footer()._mergeCells);
		this._groupFooterMergeManager.buildRooms(this);
	},
	_resetHeaderSummaryMerge: function () {
		this._headerSummaryMergeManager.buildRooms(this, this.header().summary()._mergeCells);
	},
	isColumnLayoutChanged: function () {
		return this._columnLayoutChanged;
	},
	focusedIndex: function () {
		return this._shadowIndex.assign(this._focusedIndex);
	},
	setFocusedIndex: function (value, select, focus) {
		select = arguments.length > 1 ? select : true;
		focus = arguments.length > 2 ? focus : false;
		if (!this._focusing) {
			this._focusing = true;
			try {
				return this._doSetFocusedIndex(value, select, focus);
			} finally {
				this._focusing = false;
			}
		}
		return false;
	},
	_doSetFocusedIndex: function (value, select, focus) {
		if (!value) {
			return false;
		}
		if (value && !this.isValid(value)) {
			value = value.clone();
			value.normalize(this);
		}
		if (value.column() instanceof ColumnGroup) {
			value.column(value.column().first());
		}
		if (!this.isValid(value)) {
			var ds = this.dataSource();
			if (!ds || ds.rowCount() == 0 || this.itemCount() == 0) {
				this._focusedIndex.itemIndex(-1);
				this._focusedIndex.column(this.getFirstColumn());
			}
			return false;
		}
		if (value && CellIndex.areEquals(value, this._focusedIndex)) {
			if (focus) {
				this.$_makeFocusIndexVisible();
			}
			return true;
		}
		var options = this.editOptions();
		var oldIndex = this._focusedIndex.clone();
		var itemSource = this.itemSource();
		var tool = this.container().activeTool();
		var lm = this.layoutManager();
		var cellView;
		this.closePopups2();
		if (!this._editController.focusedIndexChanging()) {
			return false;
		}
        if (!this._fireCurrentChanging(oldIndex, value)) {
            return false;
        }
        if (!this.isValid(value)) {
            return false;
        }
		var item = oldIndex.item();
		var room;
		if (itemSource && value.I() != oldIndex.I()) {
			try {
				if (item) {
					switch (item.itemState()) {
						case ItemState.INSERTING:
							if (!this.commit(options.isForceInsert(), true)) {
								this.cancel(true);
								return false;
							}
							break;
						case ItemState.APPENDING:
							if (!this.commit(options.isForceAppend()), true) {
								this.cancel(true);
								return false;
							}
							break;
						case ItemState.UPDATING:
							if (!this.commit(this.isEditing() && options.isCommitWhenNoEdit(), true)) {
								this.cancel(true);
								return false;
							}
							break;
					}
				}
			} catch (err) {
				if (err instanceof ValidationError) {
					err = this._fireValidationFail(item._index, err.column, err);
					err ? alert(options.isShowOnlyValidationMessage() && err.userMessage ? err.userMessage : err.toString()) : null;
					return false;
				}
				if (err instanceof AbortError) {
					return false;
				}
				throw err;
			}
		} else if (item && this.isItemEditing(item) && options.isValidateOnExit()) {
            this.$_validateCellValue(oldIndex, oldIndex.value);
            this.invalidateLayout();
        }
		tool.focusedIndexChanging(value);
		if (this.isValid(oldIndex)) {
			room = lm.getMergedCell(oldIndex);
			cellView = this.getCellView(room ? this._mergeView : null, oldIndex);
			if (cellView) {
				cellView.setFocused(false);
				cellView.setMouseEntered(false);
			}
		}
		this._focusedIndex.assign(value);
        if (itemSource instanceof EditableItemProvider) {
            itemSource.setDiffs(this._editOptions.isCheckDiff(), this._editOptions.isCheckCellDiff(), this._editOptions.isStrictDiff());
        }
		this._editController.focusedIndexChanged(oldIndex, value);
		tool.focusedIndexChanged(oldIndex, value);
		if (this.isValid(this._focusedIndex)) {
			room = lm.getMergedCell(this._focusedIndex);
			cellView = this.getCellView(room ? this._mergeView : null, this._focusedIndex);
			if (cellView) {
				cellView.setFocused(true);
			}
		}
		if (select) {
			this.clearSelection();
		}
		if (this.isValid(this._focusedIndex)) {
			if (this._indicatorView.isVisible()) {
				this._indicatorView.refresh();
			}
			if (this._headerView.isVisible()) {
				this._headerView.refresh();
			}
			if (this._fixedHeaderView.isVisible()) {
				this._fixedHeaderView.refresh();
			}
			if (this._rfixedHeaderView.isVisible()) {
				this._rfixedHeaderView.refresh();
			}
		}
		if (focus) {
			this.$_makeFocusIndexVisible();
		}
		this._fireCurrentChanged(this._shadowIndex.assign(this._focusedIndex));

		this.isValid(oldIndex) && oldIndex.item() instanceof GridRow && this.$_refreshRow(oldIndex._itemIndex);
		this.isValid(this._focusedIndex) && this._focusedIndex.item() instanceof GridRow && this.$_refreshRow(this._focusedIndex._itemIndex);
		if (!this.$_checkCurrentRow()) {
            this.$_checkLastCellCommit(oldIndex);
        }
		return true;
	},
	setCurrent: function (curr, select) {
		if (curr) {
			var index = this.getIndex(this._focusedIndex._itemIndex, this._focusedIndex._column);
			if (curr.column) {
				index._column = this.columnByName(curr.column);
			} else if (curr.fieldName) {
				index._column = this.columnByFieldName(curr.fieldName);
			} else if (curr.fieldIndex !== undefined && curr.fieldIndex >= 0) {
				index._column = this.columnByField(curr.fieldIndex);
			}
			if (curr.itemIndex !== undefined && curr.itemIndex >= 0) {
				index._itemIndex = curr.itemIndex;
			} else if (curr.dataRow !== undefined && curr.dataRow >= 0) {
				index._itemIndex = this.getItemIndexOfRow(curr.dataRow);
			}
			if (index._column && index._itemIndex < 0) {
				index._itemIndex = 0;
			}
			if (index._itemIndex >= 0 && !index._column) {
				index._column = this.getFirstColumn();
			}
			this.setFocusedIndex(index, select, true);
		}
	},
	$_makeFocusIndexVisible: function () {
		if (this.isValid(this._focusedIndex)) {
			this.makeCellVisible(this._focusedIndex);
		}
	},
	cancelEditor: function (hideEditor) {
		hideEditor = arguments.length > 0 ? hideEditor : true;
		this._editController.cancelEditor(hideEditor);
	},
	itemEditCancel: function() {
		return this._fireItemEditCancel(this._itemProvider._editingItem);
	},
	cancel: function (focus) {
		if (this.isEditing()) {
			this.editController().cancelEditor(true);
			this.editController().invalidateEditor();
		}
		var index = this.focusedIndex();
		if (this.isValid(index) && this.itemSource().isEditing(index.item())) {
			var dataId = index.dataId();
			index = index.clone();
			this.itemSource().cancel();
			if (this._validationManager._userValidations && dataId > -1) {
				this._validationManager.checkValidateCells(index.itemIndex());
				this._setColumnErrors(index.item());
			}
			index.normalize(this);
			this.setFocusedIndex(index);
			if (focus) {
				this.$_makeFocusIndexVisible();
			}
			return true;
		}
		return false;
	},
    commitEditor: function (hideEditor) {
        hideEditor = arguments.length > 0 ? hideEditor : true;
        this.editController().commitEditor(hideEditor);
    },
	commit: function (force, raiseFailError) {
		var index = this.focusedIndex();
		if (!this.isValid(index)) {
			return false;
		}
		var items = _cast(this.itemSource(), EditableItemProvider);
		if (!items) {
			return false;
		}
		if (this.isEditing()) {
			this.editController().commitEditor(true);
			this.editController().invalidateEditor();
		}
		var item = index.item();
		if (items.isEditing(item) && (force || items.isEdited(item))) {
			var inserting = ItemState.isInserting(item.itemState());
			try {
				this._validationManager.validateRow(item, inserting);
				this.$_validateRow(item, inserting);
			} catch (err) {
				if (err instanceof ValidationError && err.column && err.column.setError) {
					err.column.setError(err.message || err);
					err.column.setErrorLevel(err.level || ValidationLevel.ERROR);
				}
				throw err;
			}
			if (!items.commit()) {
                if (raiseFailError) {
                    throw new AbortError();
                }
                return false;
			}
			return true;
		}
		return false;
	},
	isScrolling: function () {
		return this._scrolling;
	},
	isHorzScrolling: function () {
		return this._horzScrolling;
	},
	toastManager: function () {
		return this._toastManager;
	},
	setCellUpdateEventLock: function (value) {
		this._cellUpdateEventLock = value;
	},
	editorActivated: function (editor) {
		this.activeTool() && this.activeTool().editorActivated(editor);
	},
    onCurrentChanging: undefined,
    onCurrentChanged: undefined,
	onCurrentRowChanged: undefined,
	onValidateCell: undefined,
	onValidateRow: undefined,
	onColumnHeaderClicked: undefined,
	onColumnHeaderDblClicked: undefined,
	onFooterCellClicked: undefined,
	onFooterCellDblClicked: undefined,
	onHeaderSummaryCellClicked: undefined,
	onHeaderSummaryCellDblClicked: undefined,
	onCheckBarHeadClicked: undefined,
	onCheckBarFootClicked: undefined,
	onIndicatorCellClicked: undefined,
	onStateBarCellClicked: undefined,
	onRowGroupHeadClicked: undefined,
	onRowGroupFootClicked: undefined,
	onRowGroupHeaderFooterClicked: undefined,
	onRowGroupBarClicked: undefined,
	onCheckBarFootDblClicked: undefined,
	onIndicatorCellDblClicked: undefined,
	onStateBarCellDblClicked: undefined,
	onRowGroupHeadDblClicked: undefined,
	onRowGroupFootDblClicked: undefined,
	onRowGroupHeaderFooterDblClicked: undefined,
	onRowGroupBarDblClicked: undefined,
	onPanelClicked: undefined,
	onPanelDblClicked: undefined,
	onRowGroupPanelClicked: undefined,
	onRowGroupPanelDblClicked: undefined,
	onGridMenuItemClicked: undefined,
	onContextMenuItemClicked: undefined,
	onCellButtonClicked: undefined,
	onEditButtonClicked: undefined,
	onImageButtonClicked: undefined,
	onClickableCellClicked: undefined,
	onScrollToBottom: undefined,
	onDataCellClicked: undefined,
	onDataCellDblClicked: undefined,
	onRowsDeleting: undefined,
	onRowInserting: undefined,
    onUpdateStarted: undefined,
    onInsertStarted: undefined,
	onShowEditor: undefined,
	onHideEditor: undefined,
	onEditChange: undefined,
    onGetEditValue: undefined,
	onEditCommit: undefined,
	onEditCanceled: undefined,
	onEditSearch: undefined,
	onCellEdited: undefined,
	onEditRowChanged: undefined,
	onEditRowPasted: undefined,
	onRowsPated: undefined,
	onItemChecked: undefined,
	onItemsChecked: undefined,
	onItemAllChecked: undefined,
	onErrorClicked: undefined,
	onSorting: undefined,
	onSortingChanged: undefined,
	onFiltering: undefined,
	onFilteringChanged: undefined,
	onFilterActionClicked: undefined,
	getOptions: function () {
		var options = {};
		var items = this.itemSource();

		options.summaryMode = this.summaryMode();	
		options.hideDeletedRows = items.isHideDeleted();
		if (items.sortMode)
			options.sortMode = items.sortMode();
		if (items.filterMode)
			options.filterMode = items.filterMode();
		return options;
	},
	setOptions: function (source) {
		if (source) {
            var items = this.itemSource();
            var v;
            source.summaryMode !== UNDEFINED && this.setSummaryMode(source.summaryMode);
            source.hideDeletedRows !== UNDEFINED && items.setHideDeleted(source.hideDeletedRows);
            source.sortMode != undefined && items.setSortMode(source.sortMode);
            source.filterMode != undefined && items.setFilterMode(source.filterMode);
            source.display && this.setDisplayOptions(source.display);
            source.fixed && this.setFixedOptions(source.fixed);
            (v = _pick(source.editing, source.edit)) && this.setEditOptions(v);
            (v = _pick(source.selecting, source.select, source.selection)) && this.setSelectOptions(v);
            (v = _pick(source.sorting, source.sort)) && this.setSortingOptions(v);
            (v = _pick(source.filtering, source.filter)) && this.setFilteringOptions(v);
            source.grouping && this.setGroupingOptions(source.grouping);
            source.copy && this.setCopyOptions(source.copy);
            source.paste && this.setPasteOptions(source.paste);
            source.body && this.setBody(source.body);
            source.panel && this.setPanel(source.panel);
            source.indicator && this.setIndicator(source.indicator);
            source.stateBar && this.setStateBar(source.stateBar);
            source.checkBar && this.setCheckBar(source.checkBar);
            source.editBar && this.setEditBar(source.editBar);
            source.header && this.setHeader(source.header);
            source.footer && this.setFooter(source.footer);
            source.rowGroup && this.setRowGroup(source.rowGroup);
            source.columnHeader && this.setColumnHeaderOptions(source.columnHeader);
            source.editor && this.setEditorOptions(source.editor);
		}
	},
/*
    setOptions: function (source) {
        if (source) {
            source.summaryMode !== UNDEFINED && this.setSummaryMode(source.summaryMode);
            source.hideDeletedRows !== UNDEFINED && this.itemSource().setHideDeleted(source.hideDeletedRows);
            source.display && this._displayOptions.assign(source.display);
            source.fixed && this._fixedOptions.assign(source.fixed);
            source.edit && this._editOptions.assign(source.edit);
            source.select && this._selectOptions.assign(source.select);
            source.sorting && this._sortingOptions.assign(source.sorting);
            source.filtering && this._filteringOptions.assign(source.filtering);
            source.grouping && this._groupingOptions.assign(source.grouping);
            source.copy && this._copyOptions.assign(source.copy);
            source.paste && this._pasteOptions.assign(source.paste);
            source.body && this.setBody(source.body);
            source.panel && this.setPanel(source.panel);
            source.header && this.setHeader(source.header);
            source.rowHeader && this.setIndicator(source.rowHeader);
            source.stateBar && this.setStateBar(source.stateBar);
            source.checkBar && this.setCheckBar(source.checkBar);
            source.editBar && this.setEditBar(source.editBar);
            source.footer && this.setFooter(source.footer);
            source.rowGroup && this.setRowGroup(source.rowGroup);
        }
    },
*/
	loadStyles: function (styles) {
		StylesArchiver.deserialize(styles, this);	
	},
	containerToGridRect: function (r) {
		r.x -= this._offsetX;
		r.y -= this._offsetY;
		return r;
	},
	containerToGridX: function (x) {
		return x - this._offsetX;
	},
	containerToGridY: function (y) {
		return y - this._offsetY;
	},
	setCursor: function (cursor) {
		this.container().setCursor(cursor);
	},
	updateNow: function () {
		this.container().updateNow();
	},
    setColumnsProperty: function (prop, value, recursive, visibleOnly) {
        this._rootColumn.setChildrenProperty(prop, value, recursive, visibleOnly);
    },
	invalidateColumnWidths: function () {
		if (!this._columnWidthsDirty) {
			this._columnWidthsDirty = true;
			this._columnsDirty = true;
			this.refreshView();
		}
	},
	invalidateColumns: function () {
		if (!this._columnsDirty) {
			this._columnsDirty = true;
			this.refreshView();
		}
	},
	getItem: function (index) {
		return this._itemProvider.getItem(index);
	},
	getItemIndexOfRow: function (dataRow) {
		return this._itemProvider.getIndexOfRow(dataRow);
	},
	getItemOfRow: function (dataRow) {
		return this._itemProvider.getItemOfRow(dataRow);
	},
	getItemIndiciesOfRows: function (dataRows) {
		return this._itemProvider.getIndicesOfRows(dataRows);
	},
	getAllItems: function () {
		return this._itemProvider ? this._itemProvider.getAllItems() : null;
	},
	getIndex: function (itemIndex, column) {
		itemIndex = arguments.length > 0 ? itemIndex : -1;
		column = arguments.length > 1 ? column : null;
		return new CellIndex(this, itemIndex, column);
	},
	isValid: function (index) {
		/*
		try {
			if (index.column() && !index.column().grid())
				debugger;
		} catch (e) {
			debugger;
		}
		*/
		return index && (index.grid() === this) && (index.I() >= 0) &&
		(index.I() < this.itemCount()) && index.column() && (index.column().grid() === this);
	},
	isValidColumn: function (index) {
		return index && (index.grid() === this) && index.column() && (index.column().grid() === this);
	},
	isValidRow: function (index) {
		return index && (index.grid() === this) && (index.I() >= 0) && (index.I() < this.itemCount());
	},
	beginUpdate: function () {
		this._updateLock = true;
	},
	endUpdate: function (force) {
		if (force || this._updateLock) {
			this._updateLock = false;
			this.refreshView();
		}
	},
	invalidateLayout: function () {
		if (!this._updateLock) {
			this._super();
		}
	},
	refreshView: function () {
		if (!this._loading) {
			this.invalidateLayout();
			this.setTopIndex(this.topIndex());
			this.setLeftPos(this.leftPos());
			this.setFocusedIndex(this.focusedIndex(), true);
		}
	},
	$_refreshRow: function(itemIndex) {
		if (itemIndex <= -1 || itemIndex >= this.itemCount()) {
			return;
		}
		var columns = this.getDataColumns();
		for (var i = 0, cnt = columns.length; i < cnt ; i++) {
			var index = CellIndex.temp(this, itemIndex, columns[i]);
			if (index) {
				var cellView = this.getFocusedCellView(index);
				if (cellView) {
					cellView.invalidate(true,true);
				}
			}
		}
	},
	resetGrid: function () {
		this._resetting = true;
		this.setTopIndex(0);
		this.setLeftPos(0);
		this.setFocusedIndex(this.getIndex(0, this.getFirstColumn()), true);
		this.refreshView();
	},
    getFirstCell: function () {
        if (this.itemCount() > 0) {
            var index = 0;
            for (var i = 0, cnt = this.itemCount(); i < cnt; i++) {
                if (this.getItem(i) instanceof GridRow) {
                    index = i;
                    break;
                }
            }
            return new CellIndex(this, index >= 0 ? index : 0, this.getFirstColumn());
        }
        return null;
    },
	getFirstColumn: function () {
		return this._rootColumn.first();
	},
	getVisibleColumnCount: function () {
		return this._rootColumn.visibleCount();
	},
	visibleColumnCount: function () {
		return this._rootColumn.visibleCount();
	},
	getVisibleColumn: function (index) {
		return this._rootColumn.getVisibleItem(index);
	},
	getHorzColumns: function (start, count) {
		return this._rootColumn.getHorzColumns(start, count);
	},
	getLeafColumns: function (visibleOnly) {
		visibleOnly = arguments.length > 0 ? visibleOnly : true;
		return this._rootColumn.getLeafItems(visibleOnly);
	},
	getValueColumns: function (visibleOnly) {
		visibleOnly = arguments.length > 0 ? visibleOnly : true;
		return this._rootColumn.getValueColumns(visibleOnly);
	},
	getDataColumns: function (visibleOnly) {
		visibleOnly = arguments.length > 0 ? visibleOnly : true;
		return this._rootColumn.getDataColumns(visibleOnly);
	},
	getDataRootColumns: function () {
		return this._dataRoots.roots();
	},
	collectDataColumns: function (c1, c2) {
		return this._dataRoots.collectDataColumns(c1, c2);
	},
	isCheckable: function (itemIndex) {
		var item = this.getItem(itemIndex);
		return item && item.isCheckable();
	},
	setCheckable: function (itemIndex, value) {
		var item = this.getItem(itemIndex);
		item && item.setCheckable(value);
	},
	isCheckedItem: function (itemIndex) {
		var item = this.getItem(itemIndex);
		return item && item.isChecked();
	},
	isCheckedRow: function (dataRow) {
		var item = this._itemProvider.getItemOfRow(dataRow);
		return item && item.isChecked();
	},
	checkAll: function (checked, visibleOnly, checkableOnly, checkEvent) {
		this._itemProvider.checkAll(checked, visibleOnly, checkableOnly, checkEvent);
	},
	checkItem: function (itemIndex, checked, exclusive, checkEvent) {
		var item = this.getItem(itemIndex);
		item && this._itemProvider.checkItem(item, checked, exclusive, checkEvent);
	},
	checkRow: function (dataRow, checked, exclusive, checkEvent) {
		var item = this.getItemOfRow(dataRow);
		item && this._itemProvider.checkItem(item, checked, exclusive, checkEvent);
	},
	checkItems: function (itemIndicies, checked, checkEvent) {
		var items = this._itemProvider.getItemsByIndices(itemIndicies);
		this._itemProvider.checkItems(items, checked, checkEvent);
	},
	checkRows: function (dataRows, checked, checkEvent) {
		var items = this._itemProvider.getItemsByRows(dataRows);
		this._itemProvider.checkItems(items, checked, checkEvent);
	},
	setAllCheck: function (checked) {
		this._checkBarHeadView.setChecked(checked);
	},
	isAllChecked: function () {
		return this._checkBarHeadView.isChecked();
	},
	resetCheckables: function () {
	},
	applyaCheckables: function () {
	},
	addLookupSource: function (source) {
		var provider = this._lookupProvider || (this._lookupProvider = new LocalLookupSourceProvider());
		provider.add(source);
	},
	removeLookupSource: function (sourceId) {
		this._lookupProvider && this._lookupProvider.remove(sourceId);
	},
	existsLookupData: function (sourceId, keys) {
		if (sourceId && keys) {
			var source = this._lookupProvider && this._lookupProvider.getSource(sourceId);
			if (!source) {
				throw "Invalid lookup source id: " + sourceId;
			}
			if (!_isArray(keys)) {
				keys = [keys];
			}
			return source.exists(keys);
		}
		return false;
	},
	fillLookupData: function (sourceId, data) {
		if (sourceId && data) {
			var source = this._lookupProvider && this._lookupProvider.getSource(sourceId);
			if (!source) {
				throw "Invalid lookup source id: " + sourceId;
			}
			if (data.rows) {
				source.fillRows(data.rows);
			} else {
				source.fill(data.keys, data.values);
			}
		}
	},
	clearLookupData: function (sourceId) {
		if (sourceId) {
			var source = this._lookupProvider && this._lookupProvider.getSource(sourceId);
			if (!source) {
				throw "Invalid lookup source id: " + sourceId;
			}
			source.clear();
		}
	},
	getIndicatorIndex: function (item) {
		return item.index();
	},
	canHovering: function () {
		return !this.isEditing();
	},
	calcGroupLevels: function () {
		this._rootColumn.calcHeaderLevels();
		this._rootColumn.calcDataLevels();
	},
	showToast: function (options, force) {
		this._toastManager.show(options, force);
	},
	hideToast: function (action) {
		this._toastManager.close();
		action && typeof action === "function" && setTimeout(action, 0);
	},
	isEditing: function (index) {
		return this._editController && this._editController.isEditing() &&	(!index || CellIndex.areEquals(index, this._editController.editIndex()));
	},
	isItemEditing: function (item) {
		item = item || this.focusedIndex().item();
		return item && (this.itemSource() instanceof EditableItemProvider) && this.itemSource().isEditing(item);
	},
	isItemEdited: function (item) {
		item = item || this.focusedIndex().item();
		return item && (this.itemSource() instanceof EditableItemProvider) && this.itemSource().isEdited(item);
	},
    canWrite: function (index) {
        var can = this._editOptions.isEditable() && this.isValid(index) && (this.visibleColumnCount() > 0)
            && index.item().canEdit() && !!index.dataColumn();
        if (can) {
	        var colIndex = index.C().root().displayIndex();
        	
        	if (colIndex < this._layoutManager.fixedColCount() || colIndex >= this._layoutManager.rfixedStartCol() ) {
            	can = this.fixedOptions().isEditable();
            }
        }
        return can;
    },
    canEdit: function (index) {
        return this.canWrite(index) && index.dataColumn().isEditable();
    },
    canShowEditor: function (index, attrs) {
        if (this.isValid(index)) {
            this._tmpIndex.assign(index);
            return this._fireShowEditor(this._tmpIndex, attrs);
        }
        return false;
    },
	canUpdate: function (item, field) {
		return this.editOptions().canUpdate() && 
		   (this.visibleColumnCount() > 0) && this.itemSource() && this.itemSource().canUpdate(item, field);
	},
	canAppend: function () {
		var can = !this.isEditing() && this.editOptions().canAppend() && (this.visibleColumnCount() > 0) && this.itemSource() && this.itemSource().canAppend();
		if (can) {
			try {
				if (!this._fireRowInserting(this.itemSource().itemCount(), -1)) {
					return false;
				}
			} catch (e) {
				alert(e.message || e);
				return false;
			}
		}
		return can;
	},
	canInsert: function (item, shift, ctrl) {
		var can = !this.isEditing() && this._doCanInsert(item, shift, ctrl) && this.editOptions().canInsert() && (this.visibleColumnCount() > 0) && this.itemSource() && this.itemSource().canInsert(item);
		if (can) {
			try {
				if (!this._fireRowInserting(item.index() + (shift ? 1 : 0), -1)) {
					return false;
				}
			} catch (e) {
				alert(e.message || e);
				return false;
			}
		}
		return can;
	},
	_doCanInsert: function (item, shift, ctrl) {
		return true;
	},
	canDelete: function (item) {
		return this.editOptions().canDelete() && (this.visibleColumnCount() > 0) && 
			this.itemSource() && (this.isItemEditing(item) || this.itemSource().canDelete(item));
	},
	canCommit: function (item) {
		return this.isItemEditing(item) && (this.isItemEdited() || this.editOptions().isCommitWhenNoEdit());
	},
	canCancel: function (item) {
		return this.isItemEditing(item);
	},
	_appendDummy: function(){
		var options = this._editOptions;
		if (options.isDisplayEmptyEditRow() && options.isAppendable()) {
			this._items.appendDummy();
		}
	},
	_cancelDummy: function() {
		this._items.cancelDummy();
	},
	append: function () {
		var items = this.itemSource();
		if (items instanceof EditableItemProvider && items.dataSource() && this.canAppend()) {
			var defaults = this.$_getInsertDefaults(null);
			this._cancelDummy();
            return items.append(defaults);
		}
		return false;
	},
	insertAt: function (itemIndex, shift) {
		return this.insert(this.getItem(itemIndex), shift);
	},
	insert: function (item, shift, ctrl) {
		if (!item) {
			item = this.focusedIndex() ? this.focusedIndex().item() : null;
		}
		if (!item) {
			return false;
		}
		if (!(this.itemSource() instanceof EditableItemProvider) || !this.canInsert(item, shift, ctrl)) {
			return false;
		}
		var defaults = this.$_getInsertDefaults(null);
		this._cancelDummy();
		return this.itemSource().insert(item, defaults, shift, ctrl);
	},
	edit: function (index) {
		if (!index) {
			index = this.focusedIndex();
		}
		if (!this.isValid(index) || !(this.itemSource() instanceof EditableItemProvider)) {
			return false;
		}
		if (index.dataColumn() && !this.canUpdate(index.item(), index.dataField())) {
			return false;
		}
		return this.itemSource().edit(index.item());
	},
	fillEditSearchItems: function (column, searchKey, values, labels) {
		this._editController.fillSearchItems(column, searchKey, values, labels);
	},
	showEditor: function (index, append, dropdown) {
		index = index || this.focusedIndex();
		if (this._editController.showEditor(index, dropdown)) {
            append && this._editController.caretToLast();
            return true;
        }
        return false;
	},
	editorButtonClick: function (index) {
		this._editController.buttonClicked(index);
	},
	hideEditor: function () {
		this._editController.closeList(false);
		this._editController.hideEditor();
	},
	reprepareEditor: function () {
		this._editController.reprepareEditor(this.focusedIndex());
	},
	isReadOnly: function (index) {
		if (!this.isValid(index)) {
			return false;
		}
		var col = index.dataColumn();
		if (!col) {
			return true;
		}
		if (!col.isReadOnly()) {
			var row = ItemState.isInserting(index.item().itemState()) ? -1 : index.dataRow();
			var style = this.itemSource().getCellStyle(row, index.dataField());
			return style instanceof DataCellStyle && style.isReadOnly();
		}
		return true;
	},
	getEditingItem: function () {
		var items = _cast(this.itemSource(), EditableItemProvider);
		return items ? items.editingItem() : null;
	},
	getSortFields: function () {
		return null;
	},
	getSortDirections: function () {
		return null;
	},
    getSortCases: function () {
        return null;
    },
	addFocusElement: function (element) {
		if (element && !this._focusLayer.contains(element)) {
			this._focusLayer.addElement(element, this._toolContext);
			return true;
		}
		return false;
	},
	removeFocusElement: function (element) {
		if (this._focusLayer.contains(element)) {
			this._focusLayer.removeElement(element);
			return true;
		}
		return false;
	},
	addRowFocusElement: function (element) {
		if (element && !this._rowFocusLayer.contains(element)) {
			this._rowFocusLayer.addElement(element, this._toolContext);
			return true;
		}
		return false;
	},
	removeRowFocusElement: function (element) {
		if (this._rowFocusLayer.contains(element)) {
			this._rowFocusLayer.removeElement(element);
			return true;
		}
		return false;
	},
	addFeedbackElement: function (element) {
		if (element && !this._feedbackLayer.contains(element)) {
			this._feedbackLayer.addElement(element, this._toolContext);
			return true;
		}
		return false;
	},
	removeFeedbackElement: function (element) {
		if (this._feedbackLayer.contains(element)) {
			this._feedbackLayer.removeElement(element);
			return true;
		}
		return false;
	},
	getEditCellBounds: function (index) {
        var lm = this.layoutManager();
        var room = lm.getMergedCell(index);
        var view = this.getCellView(room ? this._mergeView : null, index);
		if (view) {
			var r = view.getBounds();
			r.x = r.y = 0;
			r = view.boundsByContainer(r);
            if (room) {
                var i = index.itemIndex();
                if (i >= lm.topIndex() + lm.fixedRowCount() && i < lm.topIndex() + lm.itemCount() + lm.fixedRowCount()) {
                    var r1 = lm.itemBounds(view._topIndex);
                    var r2 = lm.itemBounds(index.I() - this._topIndex);
                    r.y += r2.y - r1.y;
                    r.height = r2.height;
                } else {
                    r = $_INVISIBLE_EDIT_BOUNDS.clone();
                }
            }
			return r;
		} else {
			return $_INVISIBLE_EDIT_BOUNDS.clone();
		}
	},
	getEditBounds: function (index) {
        var lm = this.layoutManager();
        var room = lm.getMergedCell(index);
		var view = this.getCellView(room ? this._mergeView : null, index, index.isFixedCol());
		if (view) {
            var r = view.getBounds();
			if (view instanceof DataCellElement) {
				r.width -= view.getButtonsWidth();
			}
			r.x = r.y = 0;
			r = view.boundsByContainer(r);
            if (room) {
                var i = index.itemIndex();
                if (i >= lm.topIndex() + lm.fixedRowCount() && i < lm.topIndex() + lm.itemCount() + lm.fixedRowCount()) {
                    var r1 = lm.itemBounds(view._topIndex);
                    var r2 = lm.itemBounds(index.I() - this._topIndex);
                    r.y += r2.y - r1.y;
                    r.height = r2.height;
                } else {
                    r = $_INVISIBLE_EDIT_BOUNDS.clone();
                }
            }
			return r;
		} else {
			return $_INVISIBLE_EDIT_BOUNDS.clone();
		}
	},
	getCellView: function (owner, index, fixed, rightFixed) {
        fixed = fixed || index.column().isFixed();
        rightFixed = rightFixed || index.column().isRightFixed();
		if (owner == null || owner instanceof GridBodyElement) {
			var item = index.item();
			if (item && item.isEditable()) {
				var rowView = rightFixed ? this._rfixedBodyView.findRowView(item.index()) : 
				                       fixed ? this._fixedBodyView.findRowView(item.index()) :
							                   this._bodyView.findRowView(item.index());
				if (rowView && rowView.isVisible()) {
					return rowView.findCell(index.column());
				}
			}
		} else if (owner === this._rowGroupView) {
			return this._rowGroupView.getCellView(index, !!fixed, !!rightFixed);
		} else if (owner instanceof GridMergeElement) {
            var mergeView = rightFixed ? this._rfixedMergeView : fixed ? this._fixedMergeView : this._mergeView;
			return  mergeView.getCellView(index);
		} else if (owner === this._mergeHeaderLayer) {
			return this._mergeHeaderLayer.getCellView(index);
		}
		return null;
	},
	getFocusedCellView: function (index) {
		index = index || this._focusedIndex;
		var lm = this.layoutManager();
        var item = index.item();
        var merged = item && item.isMerged();
        var fixed = index.isFixedCol();
        var rfixed = index.isRightFixedCol();
		var cell = rfixed ? this.getCellView(this._rfixedMergeView, index, true) : 
		                    fixed ? this.getCellView(this._fixedMergeView, index, true) : null;
		if (!cell && !fixed) {
			cell = this.getCellView(this._mergeView, index, false);
		} 
		if (!cell && merged) {
			cell = this.getCellView(this._mergeHeaderLayer, index);
		} 
		if (!cell) {
			cell = this.getCellView(null, index, fixed);
		}
		if (!cell && !merged) {
			cell = this.getCellView(this._rowGroupView, index, false);
            if (!cell) {
                cell = this.getCellView(this._rowGroupView, index, true);
            }
		}
		return cell;
	},
	pointToIndex: function (x, y, clipped) {
		var index = CellIndex.temp(this, -1, null);
		if (clipped) {
			this._layoutManager.mouseToIndex(x, y, index);
		} else {
			this._layoutManager.mouseToIndexEx(x, y, index);
		}
		return index;
	},
	getCellBounds: function (index, outer) {
		var r = this.getEditCellBounds(index);
		if (r.x == -10000) {
			r = null;
		}
		if (r && outer) {
			r = this.container().toScreen(r);
		}
		return r;
	},
	getSelection: function () {
		return this._selections.count() > 0 ? this._selections.getItem(0) : null;
	},
	clearSelection: function () {
		var idx = this.focusedIndex();
		this._selections.clear();
		if (this.isValid(idx) && (this.itemCount() > 0) && (this.visibleColumnCount() > 0)) {
			this._selections.add(idx, idx, this._selectOptions.style());
		}
	},
	deleteSelection: function (force) {
		function checkDelete(self, item) {
			var items = [];
			items.push(item);
			return checkDeleteAll(self, items);
		}
		function checkDeleteAll(self, items) {
			try {
				if (items && items.length > 0) {
					var i, item;
					var cnt = items.length;
					var rows = [];
					for (i = 0; i < cnt; i++) {
						item = self.getItem(items[i]);
						if (item && item.dataRow() >= 0) {
							rows.push(item.dataRow());
						}
					}
					if (rows.length > 0) {
						if (!self._fireRowsDeleting(rows)) {
							return false;
						}
					}
				}
			} catch (err) {
				alert(err);
				return false;
			}
			return true;
		}
		function deleteSingleCell(self, selections) {
			if (selections.count() == 0 || selections.count() == 1 && selections.getItem(0).isSingleCell()) {
				var item;
				var r = -1;
				if (selections.count() == 0) {
					r = self.focusedIndex().itemIndex();
				} else {
					r = selections.getItem(0).getBounds().R1();
				}
				if (r >= 0 && self.canDelete(item = self.getItem(r))) {
					if (force || !self.editOptions().isConfirmWhenDelete()) {
						self.cancel();
						if (!ItemState.isInserting(item.itemState())) {
							self.itemSource().remove(item);
						}
					} else {
						if (confirm(self.editOptions().deleteRowsMessage()) && checkDelete(self, r)) {
							self.cancel();
							if (!ItemState.isInserting(item.itemState())) {
								self.itemSource().remove(item);
							}
						}
					}
				}
				return true;
			}
			return false;
		}
		function removeItems(self, items) {
			var editingItem = null;
			for (var i = items.length; i--;) {
				var item = self.getItem(items[i]);
				var state = item.itemState();
				if (ItemState.isEditing(state)) {
					editingItem = item;
					if (ItemState.isInserting(state)) {
						items.splice(i, 1);
					}
					break;
				}
			}
			var rows = null;
			if (items.length > 0) {
				rows = self.itemSource().getRemovableRows(items);
			}
			if (editingItem) {
				self.cancel();
			}
			if (rows) {
				self.itemSource().removeRows(rows);
			}
		}
		var options = this.editOptions();
		var selections = this.selections();
		var itemSource = this.itemSource();
		if (!force && !options.isDeletable()) {// || !isValid(m_focusedIndex))
			return;
		}
		if (!(itemSource instanceof EditableItemProvider)) {
			return;
		}
		if (this.isItemEditing(null) && !options.isDeletableWhenEdit()) {
			alert(window.RG_CONST && window.RG_CONST.COMMITEDITING ? window.RG_CONST.COMMITEDITING : "먼저 편집을 완료 하십시오.");
			return;
		}
		this.commitEditor(true);
		if (deleteSingleCell(this, selections)) {
			return;
		}
		var i, sel, range, r1, r2, r, item;
		var cnt = selections.count();
		var items = [];
		for (i = 0; i < cnt; i++) {
			sel = selections.getItem(i);
			if (sel.style() == SelectionStyle.ROWS || sel.style() == SelectionStyle.BLOCK) {
				range = sel.getBounds();
				r1 = Math.min(range.R1(), range.R2());
				r2 = Math.max(range.R1(), range.R2());
				for (r = r1; r <= r2; r++) {
					item = this.getItem(r);
					if (item.dataRow() >= 0 || item instanceof EditItem || item instanceof TreeEditItem) {
						items.push(r);
					}
				}
			}
		}
		items.sort(function (v1, v2) {
			return v2 - v2;
		});
		r = -1;
		for (i = items.length; i--;) {
			if (items[i] == r) {
				items.splice(i, 1);
			} else {
				r = items[i];
			}
		}
		if (items.length > 0 && this.canDelete(this.getItem(items[0]))) {
			if (force || !options.isConfirmWhenDelete()) {
				if (checkDeleteAll(this, items)) {
					removeItems(this, items);
					this.clearSelection();
				}
			} else if (confirm(options.deleteRowsMessage()) && checkDeleteAll(this, items)) {
				removeItems(this, items);
				this.clearSelection();
			}
		}
	},
    revertSelection: function (force) {
        function revertSingleCell(self, selections) {
            if (selections.count() == 0 || selections.count() == 1 && selections.getItem(0).isSingleCell()) {
                var r = -1;
                if (selections.count() == 0) {
                    r = self.focusedIndex().itemIndex();
                } else {
                    r = selections.getItem(0).getBounds().R1();
                }
                if (r >= 0) {
                    self.itemSource().revert(r);
                }
            }
        }
        var options = this.editOptions();
        var selections = this.selections();
        var itemSource = this.itemSource();
        if (!force && !options.isRevertable()) {
            return;
        }
        if (!(itemSource instanceof EditableItemProvider)) {
            return;
        }
        this.commitEditor(true);
        if (revertSingleCell(this, selections)) {
            return;
        }
        var i, sel, range, r1, r2, r, item;
        var cnt = selections.count();
        var items = [];
        for (i = 0; i < cnt; i++) {
            sel = selections.getItem(i);
            if (sel.style() == SelectionStyle.ROWS || sel.style() == SelectionStyle.BLOCK) {
                range = sel.getBounds();
                r1 = Math.min(range.R1(), range.R2());
                r2 = Math.max(range.R1(), range.R2());
                for (r = r1; r <= r2; r++) {
                    item = this.getItem(r);
                    if (item.dataRow() >= 0 || item instanceof EditItem || item instanceof TreeEditItem) {
                        items.push(r);
                    }
                }
            }
        }
        items.sort(function (v1, v2) {
            return v2 - v2;
        });
        r = -1;
        for (i = items.length; i--;) {
            if (items[i] == r) {
                items.splice(i, 1);
            } else {
                r = items[i];
            }
        }
        if (items.length > 0) {
            this.itemSource().revertAll(items);
        }
    },
	registerImageList: function (images) {
		if (images && images.name() && !this._imageLists.hasOwnProperty(images.name())) {
			this._imageLists[images.name()] = images;
			images.addListener(this);
			this._assignImageList(images);
		}
	},
	unregisterImageList: function (images) {
		if (images && images.name() && this._imageLists.hasOwnProperty(images.name())) {
			delete this._imageLists[images.name()];
			images.removeListener(this);
			this._assignImageList(images, true);
		}
	},
	getImageList: function (imagesName) {
		return imagesName && this._imageLists[imagesName];
	},
	getListImage: function (images, index) {
		if (images instanceof ImageList) {
			return images.getImage(index);
		} else if (images) {
			images = this._imageLists[images];
			return images ? images.getImage(index) : null;
		}
	},
	_assignImageList: function (images, clear) {
        var columns = this.getDataColumns();
        for (var i = 0, cnt = columns.length; i < cnt; i++) {
			var col = columns[i];
			if (col.imageList() == images.name()) {
				col._images = clear ? null : images;
			}
		}
	},
	getImage: function (url) {
		return this._container.getImage(url);
	},
	getSummarizer: function () {
		return null;
	},
	getSummary: function (field, value) {
		var ds = this.dataSource();
		value = value && value.trim().toLowerCase();
		if (value && ds) {
			var summarizer = this.getSummarizer();
			if (summarizer) {
				var fld = isNaN(field) ? ds.getFieldIndex(field) : field;
				if (fld >= 0 && fld < ds.fieldCount()) {
					switch (value) {
						case "count":
							return summarizer.getCount(fld);
						case "sum":
							return summarizer.getSum(fld);
						case "max":
							return summarizer.getMax(fld);
						case "min":
							return summarizer.getMin(fld);
						case "avg":
							return summarizer.getAvg(fld);
						case "var":
							return summarizer.getVar(fld);
						case "varp":
							return summarizer.getVarp(fld);
						case "stdev":
							return summarizer.getStdev(fld);
						case "stdevp":
							return summarizer.getStdevp(fld);
					}
				}
			}
		}
		return NaN;
	},
	orderBy: function (columns, directions, textCases) {
		if (this.isItemEditing(null)) {
			return;
		}
		if (!columns || columns.length < 1) {
			this._sortItems([], [], []);
		} else {
			var	flds = [];
			var	dirs = [];
            var cases = [];
            var	cnt = columns.length;
			for (var i = 0; i < cnt; i++) {
				flds.push(columns[i].dataIndex());
			}
			if (directions) {
				dirs = directions.concat();
			}
            if (textCases) {
                cases = textCases.concat();
            }
			this._sortItems(flds, dirs, cases);
		}
	},
	orderByFields: function (fieldNames, directions, textCases) {
		if (this.isItemEditing(null)) {
			return;
		}
		if (!fieldNames || fieldNames.length < 1) {
			this._sortItems([], []);
		} else {
			var	cnt = fieldNames.length;
			var	ds = this.dataSource();
			var	flds = [];
			var	dirs = [];
            var cases = [];
            var i, f, fld;
			for (i = 0; i < cnt; i++) {
				f = Number(fieldNames[i]);
				fld = isNaN(f) ? ds.getFieldIndex(fieldNames[i]) : f;
				flds.push(fld);
			}
			if (directions) {
				dirs = directions.concat();
			}
            if (textCases) {
                cases = textCases.concat();
            }
			this._sortItems(flds, dirs, cases);
		}
	},
	sortColumn: function (column, event) {
		if (column) {
			if (this.sortingOptions().style() == SortStyle.EXCLUSIVE) {
				( event && event.shiftKey) ? this.sortColumnWithStyle(SortStyle.INCLUSIVE, column) : this.sortColumnWithStyle(SortStyle.EXCLUSIVE, column);
			} else {
				this.sortColumnWithStyle(this.sortingOptions().style(), column);
			}
		}
	},
	unsortColumn: function (column) {
		if (column) {
			this.unsortColumnWithStyle(this.sortingOptions().style(), column);
		}
	},
	$$_addSort: function (field, dir, textCase, reverse) {
		var flds = this.getSortFields();
		var	dirs = this.getSortDirections();
        var cases = this.getSortCases();
		var	idx = -1;
		var	cnt = flds.length;
		for (var i = 0; i < cnt; i++) {
			if (flds[i] == field) {
				idx  = i;
				break;
			}
		}
		if (idx >= 0) {
			dirs[idx] = dir;
            cases[idx] = textCase;
		} else if (reverse) {
			flds.splice(0, 0, field);
			dirs.splice(0, 0, dir);
            cases.splice(0, 0, textCase);
		} else {
			flds.push(field);
			dirs.push(dir);
            cases.push(textCase);
		}
		this._sortItems(flds, dirs);
	},
	sortColumnWithStyle: function (sortStyle, column) {
		if (this.isItemEditing(null)) {
			return;
		}
		if (!column) {
			throw new Error("column is null");
		}
		if (column.dataIndex() < 0) {
			return;
		}
        var sortCase = this._sortingOptions.textCase();
		if (sortStyle == SortStyle.EXCLUSIVE) {
			if (column.sortOrder() < 0) {
				this.orderBy([column], [SortDirection.ASCENDING], [sortCase]);
			} else if (column.sortDirection() == SortDirection.ASCENDING) { 
				this.orderBy([column], [SortDirection.DESCENDING], [sortCase]);
			} else if (this.isGroupedColumn(column) && this._items._groupSorting) {
				this.orderBy([column], [SortDirection.ASCENDING], [sortCase]);
			} else {
				this.unsortColumnWithStyle(sortStyle, column);
			}
		} else if (sortStyle == SortStyle.INCLUSIVE || sortStyle == SortStyle.REVERSE) {
			if (column.sortOrder() < 0) {
				this.$$_addSort(column.dataIndex(), SortDirection.ASCENDING, sortCase, sortStyle == SortStyle.REVERSE);
			} else if (column.sortDirection() == SortDirection.ASCENDING) { 
				this.$$_addSort(column.dataIndex(), SortDirection.DESCENDING, sortCase, sortStyle == SortStyle.REVERSE);
			} else if (this.isGroupedColumn(column) && this._items._groupSorting) {
				this.$$_addSort(column.dataIndex(), SortDirection.ASCENDING, sortCase, sortStyle == SortStyle.REVERSE);
			} else {
				this.unsortColumnWithStyle(sortStyle, column);
			}
		}
	},
	unsortColumnWithStyle: function (sortStyle, column) {
		if (this.isItemEditing(null)) {
			return;
		}
		if (!column) {
			return;
		}
		var	flds = this.getSortFields();
		var	dirs = this.getSortDirections();
        var cases = this.getSortCases();
		var	idx = -1;
		var	cnt = flds.length;
		for (var i = 0; i < cnt; i++) {
			if (flds[i] == column.dataIndex()) {
				idx  = i;
				break;
			}
		}
		if (idx < 0) {
			return;
		}
		if (sortStyle == SortStyle.EXCLUSIVE) {
			this.orderBy([], [], []);
		} else if (sortStyle == SortStyle.INCLUSIVE || sortStyle == SortStyle.REVERSE) {
			flds.splice(idx, 1);
			dirs.splice(idx, 1);
            cases.splice(idx, 1);
			this._sortItems(flds, dirs, cases);
		}
	},
    canFiltering: function () {
        return this._fireFiltering();
    },
    applyFilters: function () {
        if (this.isItemEditing(null)) {
            return false;
        }
        if (this._fireFiltering()) {
            this._toastManager.show(this.filteringOptions().toast(), true, function () {
                this.$_doApplyFilters();
            }.bind(this));
            return true;
        }
        return false;
    },
    $_doApplyFilters: function () {
        this._items.beginFiltering();
        try {
            this._items.clearAllFilters();
            this.$_addFilters(this._rootColumn);
        } finally {
            this._items.endFiltering();
        }
        this.setTopIndex(0);
    },
    $_addFilters: function (group) {
        var c;
        var column;
        var dc;
        var filters;
        var i;
        var n;
        var filter;
        var cnt = group.count();
        for (c = 0; c < cnt; c++) {
            column = group.getItem(c);
            if (column instanceof DataColumn) {
                filters = column.filters();
                if (filters) {
                    n = filters.length;
                    for (i = 0; i < n; i++) {
                        filter = filters[i];
                        if (filter.isActive()) {
                            this._items.addFilter(column.dataIndex(), filter.criteria());
                        }
                    }
                }
            } else if (column instanceof ColumnGroup) {
                this.$_addFilters(column);
            }
        }
    },
    isFiltered: function (column) {
        return column && this._items.isFiltered(column.dataIndex());
    },
	isGroupedColumn: function (column) {
		return false;
	},
	getGroupLevel: function (field) {
		return -1;
	},
	getGroupLevels: function () {
		return 0;
	},
	clearColumnMergeGrouped: function () {
		this._rootColumn.clearMergeGrouped();
	},
	$_makeRowInView: function (row) {
		var r;
		var cnt;
		var lm = this.layoutManager();
		if (row >= lm.fixedItemCount()) {
			r = row;
			cnt = lm.fullItemCount();
			if (cnt == 0) {
				if (lm.itemCount() > 0) {
					this.setTopItem(r);
				} else {
					this.seTopIndex(0);
				}
			} else {
				if (r >= this.topItem() && r < this.topItem() + cnt) {
					return;
				}
				if (r >= this.topItem() + cnt) {
					r = r - cnt + 1;
				}
				this.setTopItem(Math.max(0, r));
			}
		}
	},
	$_makeColumnInView: function (column) {
		var c;
		var x;
		var dx;
		var lm = layoutManager();
		var root = column.root();
		var col = root.displayIndex();
		if (col >= lm.fixedColCount()) {
			x = lm.columnBounds(col).x;
			c = column;
			while (c != root) {
				x += c.displayOffset();
				c = c.parent();
			}			
			if (x < this.leftPos()) {
				this.setLeftPos(x);
			} else if ((dx = (x + column.displayWidth() - this.leftPos()) - lm.nonfixedBounds().width) > 0) {
				this.setLeftPos(Math.min(x, this.leftPos() + dx));
			}
		}
	},
    makeColumnVisible: function (column) {
        var index = this.getIndex(-1, column);
        this.makeCellVisible(index);
    },
    makeItemVisible: function (itemIndex) {
        var index = this.getIndex(itemIndex, this.getFirstColumn());
        this.makeCellVisible(index);
    },
	makeCellVisible: function (index, force) {
		if (this.isValid(index)) {
			if (!this.layoutManager().cellIsVisible(index)) {
				this.layoutManager().makeCellVisible(index);
				this.invalidateLayout();
			}
		} else if (index && index.column()) {
            this.layoutManager().makeCellVisible(index);
            this.invalidateLayout();
        }
		/*
		if (this._layouted) {
			if (!force && this._layoutNeeded) {
				this._focusNeededIndex.assign(index);
				this._focusNeeded = true;
				return;
			}
			if (this.isValidRow(index)) {
				this.$_makeRowInView(index.I());
			}
			if (this.isValidColumn(index)) {
				this.$_makeColumnInView(index.column());
			}
		}
		*/
	},
	copyToClipboard: function () {
		var selections = this.selections();
		if (this._copyOptions.isEnabled()) {
			if (this._copyOptions.isSingleMode() || selections.count() == 0 || selections.isSingleCell()) {
				var index = this.focusedIndex();
				if (index.isValid()) {
					return this._clipboardManager.copyCellToClipboard(index);
				}
			} else {
				var range = selections.getItem(0).getBounds();
				if (range) {
					return this._clipboardManager.copyToClipboard(range);
				}
			}
		}
		return this._clipboardManager.copyEmptyToClipboard();
	},
	pasteFromClipboard: function (data) {
		var index = this.focusedIndex().clone();
		index.normalize(this);
		if (!this.isValid(index) || !index.dataColumn()) {
			return;
		}
		if (this._pasteOptions.isEnabled()) {
			try {
				if (this._pasteOptions.isSingleMode()) {
					this._clipboardManager.pasteCellFromClipboard(index, data);
				} else {
					this._clipboardManager.pasteFromClipboard(index, data);
					if (index.item() && ItemState.isEditing(index.item().itemState())) {
						var v = index.item().getData(index.dataField());
						this.validateCellCommit(index, v);
						this.refreshView();
					}
				}
				this._editController.reprepareEditor(index);
			} catch (err) {
                if (err instanceof ValidationError) {
                	err = this._fireValidationFail(this._clipboardManager._appendingIndex.itemIndex(), err.column, err);
					err ? alert(this._editOptions.isShowOnlyValidationMessage() && err.userMessage ? err.userMessage : err.toString()) : null;
                }
                throw err;
			}
		}
	},
	$_editRowPasted: function (item, fields, oldValues, newValues) {
		this._fireEditItemPasted(item, fields, oldValues, newValues)
	},
	$_rowsPasted: function (items) {
		this._fireItemsPasted(items);
	},
	selectColumnFilters: function (columnView) {
		if (this.isItemEditing(null)) {
			return;
		}
        if (this._fireFiltering()) {
            this._filterSelector.show(columnView, this.filteringOptions().selector());
        }
	},
	closeFilterSelector: function () {
		this._filterSelector.hide();
	},
	closePopups: function () {
		this._filterSelector.hide();
		this._popupMenuManager.close();
		this._editController.closeList();
	},
    closePopups2: function () {
        this._popupMenuManager.close();
        this._editController.closeList();
    },
	isFilterSelecting: function (column) {
		return this._filterSelector.isOpened() && this._filterSelector.column() === column;
	},
	getCellValue: function (itemIndex, field) {
    	var item = this.getItem(itemIndex);
    	if (item) {
        	if (typeof field == "string") {
            	var dataProvider = this.itemSource().dataSource();
            	if (!dataProvider) {
            		return undefined;
            	}
            	field = dataProvider.getFieldIndex(field);
        	}
        	return item.getData(field);
    	}
    	return undefined;
	},
	setCellValue: function (itemIndex, field, newValue) {
    	var item = this.getItem(itemIndex);
    	if (item) {
        	if (typeof field == "string") {
            	var dataProvider = this.itemSource().dataSource();
            	if (!dataProvider) {
            		return;
            	}
            	field = dataProvider.getFieldIndex(field);
        	}
        	if (item instanceof EditItem || item instanceof TreeEditItem) {
        		item.setValue(field, newValue);
        	} else {
        		item.setData(field, newValue);
        	}
    	}
	},
	getEditCellValue: function () {
		if (this.isEditing()) {
			return this._editController._editor._editor.value;
		}
	},
	searchItem: function (fields, values, options/* SearchOptions */, startItem, wrap, select) {
		startItem = arguments.length > 3 ? startItem : 0;
		wrap = arguments.length > 4 ? wrap : true;
		select = arguments.length > 5 ? select : false;
		options = options instanceof SearchOptions ? options : options ? new SearchOptions(options) : null;
		var itemSource;
		var result = -1;
		if (fields && fields.length > 0 && values && values.length > 0 && (itemSource = this.itemSource())) {
			var c, n, f, index;
			var cnt = fields.length;
			var flds = [];
			var dataSource = itemSource.dataSource();
			for (c = 0; c < cnt; c++) {
				n = parseFloat(fields[c]);
				if (!isNaN(n) && n | 0 == n) {
					flds.push(n);
				} else {
					f = dataSource.getFieldIndex(fields[c]);
					if (f >= 0) {
						flds.push(f);
					}
				}
			}
			if (flds.length > 0) {
				cnt = itemSource.itemCount();
				startItem = Math.max(0, startItem);
				result = startItem < cnt ? itemSource.findItem(flds, values, options, startItem, cnt - 1) : -1;
				if (result < 0 && wrap && startItem > 0) {
					result = itemSource.findItem(flds, values, options, 0, startItem - 1);
				}
			}
			if (result >= 0 && select) {
				index = this.getIndex(result, _pick(this.focusedIndex().C(), this.getFirstColumn()));
				this.setFocusedIndex(index, true, true);
			}
		}
		return result;
	},
	searchCell: function (fields, value, options/* SearchCellOptions */, startItem, startFieldIndex, wrap, select) {
		startItem = arguments.length > 3 ? startItem : 0;
		startFieldIndex = arguments.length > 4 ? startFieldIndex : 0;
		wrap = arguments.length > 5 ? wrap : true;
		select = arguments.length > 6 ? select : false;
		options = options instanceof SearchCellOptions ? options : options ? new SearchCellOptions(options) : null;
		var itemSource = this.itemSource();
		var result = null;
        var dataSource;
		if (itemSource && (dataSource = itemSource.dataSource())) {
			if (!fields || fields.length < 1) {
				fields = [];
				var arr = dataSource.getFields();
				for (var i = 0; i < arr.length; i++) {
					fields.push(arr[i].orgFieldName());
				}
			}
			if (fields && fields.length > 0 && value) {
				var c, n;
				var cnt = fields.length;
				var flds = [];
				for (c = 0; c < cnt; c++) {
					n = parseFloat(fields[c]);
					if (!isNaN(n) && n | 0 == n) {
						flds.push(n);
					} else {
						flds.push(dataSource.getFieldIndex(fields[c]));
					}
				}
				if (flds.length > 0) {
					cnt = itemSource.itemCount();
					startItem = Math.max(0, startItem);
					startFieldIndex = Math.max(0, startFieldIndex);
					result = startItem < cnt ? itemSource.findCell(flds, value, options, startItem, cnt - 1, startFieldIndex) : null;
					if (!result && wrap && startItem > 0) {
						result = itemSource.findCell(flds, value, options, 0, startItem - 1, 0);
					}
					if (result) {
						result.fieldName = dataSource.getOrgFieldName(result["fieldIndex"]);
					}
				}
				if (result && select) {
					var index = this.getIndex(result.itemIndex, _pick(this.columnByField(result.fieldIndex), this.focusedIndex().C()));
					this.setFocusedIndex(index, true, true);
				}
			}
		}
        return result;
	},
	$_setDataCellStyle: function (ds, row, field, style) {
		var f;
		var r = Math.max(-1, row); // TODO: -1이면 추가 중인 행에 적용한다.
		if (typeof field === "string") {
			f = ds.getFieldIndex(field);
			if (f < 0) return;
		} else {
			f = field; // -1 이면 모든 필드에 적용한다.
		}
		this.itemSource().setCellStyle(r, f, style);
	},
	setDataCellStyle: function (dataRow, field, styleId, updateNow) {
		var style = styleId ? this._dataCellStyles.get(styleId) : null;
		this.$_setDataCellStyle(this.dataSource(), dataRow, field, style);
		if (updateNow) {
            var idx = this.focusedIndex();
            if (idx) {
				if (idx.dataField() == field && idx.dataRow() == dataRow) {
					this._editController.reprepareEditor(this.focusedIndex());
				}
            }
			this.invalidateLayout();
		}
	},
	getDataCellStyle: function (dataRow, field) {
		return this.itemSource().getCellStyle(dataRow, this.dataSource().getFieldIndexOf(field));
	},
	getDataCellStyleId: function (dataRow, field) {
		var style = this.itemSource().getCellStyle(dataRow, this.dataSource().getFieldIndexOf(field));
		return style ? style.id() : null;
	},
	setDataCellStyles: function (dataRows, fields, styleId) {
		var r, cnt, f, cnt2;
		var ds = this.dataSource();
		var rows = _asArray(dataRows);
		var flds = _asArray(fields);
		var style = styleId ? this._dataCellStyles.get(styleId) : null;
		if (rows && flds) {
			cnt2 = flds.length;
			for (r = 0, cnt = rows.length; r < cnt; r++) {
				for (f = 0; f < cnt2; f++) {
					this.$_setDataCellStyle(ds, rows[r], flds[f], style);
				}
			}
		} else if (rows) {
			for (r = 0, cnt = rows.length; r < cnt; r++) {
				this.$_setDataCellStyle(ds, rows[r], fields, style);
			}
		} else if (flds) {
			for (f = 0, cnt = flds.length; f < cnt; f++) {
				this.$_setDataCellStyle(ds, dataRows, flds[f], style);
			}
		} else {
			this.$_setDataCellStyle(ds, dataRows, fields, style);
		}
        this._editController.reprepareEditor(this.focusedIndex());
		this.invalidateLayout();
	},
	setDataCellStyleRows: function (rows, fieldMap) {
		this.itemSource().setCellStyles(this._dataCellStyles, rows, fieldMap);
		this._editController.reprepareEditor(this.focusedIndex());
		this.invalidateLayout();
	},
	clearDataCellStyles: function () {
		this.itemSource().clearCellStyles();
		this._editController.reprepareEditor(this.focusedIndex());
		this.invalidateLayout();
	},
	getStylesOf: function (region) {
		var map = this._styleMap;
		if (!map) {
			map = this._styleMap = {};
            map[GridStyleSheet.GRID] = map[GridStyleSheet.DEFAULT] = this.styles();
			map[GridStyleSheet.PANEL] = this._panel.styles();
			map[GridStyleSheet.BODY] = this._body.styles();
			map[GridStyleSheet.BODY_EMPTY] = this._body.emptyStyles();
			map[GridStyleSheet.FIXED] = this._fixedOptions.styles();
			map[GridStyleSheet.FIXED_COLBAR] = this._fixedOptions.colBarStyles();
			map[GridStyleSheet.FIXED_ROWBAR] = this._fixedOptions.rowBarStyles();
			map[GridStyleSheet.HEADER] = this._header.styles();
			map[GridStyleSheet.HEADER_GROUP] = this._header.groupStyles();
			map[GridStyleSheet.FOOTER] = this._footer.styles();
			map[GridStyleSheet.FOOTER_GROUP] = this._footer.groupStyles();
			map[GridStyleSheet.ROWGROUP_HEADER] = this._rowGroup.headerStyles();
			map[GridStyleSheet.ROWGROUP_FOOTER] = this._rowGroup.footerStyles();
			map[GridStyleSheet.ROWGROUP_HEAD] = this._rowGroup.headStyles();
			map[GridStyleSheet.ROWGROUP_FOOT] = this._rowGroup.footStyles();
			map[GridStyleSheet.ROWGROUP_SUMMARY] = this._rowGroup.summaryStyles();
			map[GridStyleSheet.ROWGROUP_BAR] = this._rowGroup.barStyles();
			map[GridStyleSheet.ROWGROUP_HEADER_BAR] = this._rowGroup.headerBarStyles();
			map[GridStyleSheet.ROWGROUP_FOOTER_BAR] = this._rowGroup.footerBarStyles();
			map[GridStyleSheet.ROWGROUP_PANEL] = this._rowGroup.panelStyles();
			map[GridStyleSheet.INDICATOR] = this._indicator.styles();
			map[GridStyleSheet.INDICATOR_HEAD] = this._indicator.headStyles();
			map[GridStyleSheet.INDICATOR_FOOT] = this._indicator.footStyles();
			map[GridStyleSheet.INDICATOR_SUMMARY] = this._indicator.summaryStyles();
			map[GridStyleSheet.CHECKBAR] = this._checkBar.styles();
			map[GridStyleSheet.CHECKBAR_HEAD] = this._checkBar.headStyles();
			map[GridStyleSheet.CHECKBAR_FOOT] = this._checkBar.footStyles();
			map[GridStyleSheet.CHECKBAR_SUMMARY] = this._checkBar.summaryStyles();
			map[GridStyleSheet.STATEBAR] = map["statusBar"] = this._stateBar.styles();
			map[GridStyleSheet.STATEBAR_HEAD] = map["statusBarHead"] = this._stateBar.headStyles();
			map[GridStyleSheet.STATEBAR_FOOT] = map["statusBarFoot"] = this._stateBar.footStyles();
			map[GridStyleSheet.STATEBAR_SUMMARY] = map["statusBarSummary"] = this._stateBar.summaryStyles();
			map[GridStyleSheet.SELECTION] = this._selectOptions.maskStyles();
			if (this._treeOptions) {
				map[GridStyleSheet.TREE_EXPANDER] = this._treeOptions.expanderStyles();
			}
		}
		if(region == "all"){
			return map;
		}else{
			return map[region];			
		}
		
	},
	clearStyles: function (region) {
		var styles = this.getStylesOf(region);
		if(region == "all"){
			for(var style in styles){
				if(styles[style]) {
					styles[style].clearValues();
				}
			}
			this.refreshView();
		}else {
			if (styles) {
				styles.clearValues();
				this.refreshView();
			}
		}
	},
	alertCellError: function (cell, error) {
		this._fireErrorClicked(cell, error);
	},
	canMoveIndex: function (index) {
		var lm = this.layoutManager();
		return this.fixedOptions().isMovable() || (index >= lm.fixedColCount() && index < lm.rfixedStartCol());
	},
	canMoveToIndex: function (index) {
		var lm = this.layoutManager();
		return index >= lm.fixedColCount() && index < lm.rfixedStartCol();
	},
	showProgress: function (modal) {
		this._progressManager.show(null, null, modal);
	},
	setProgress: function (min, max, pos, msg) {
		this._progressManager.setProperties(min, max, pos, msg);
	},
	closeProgress: function () {
		this._progressManager.close();
	},
	beginExportProgress: function (msg) {
		this._progressManager.show(null, msg, false);
	},
	endExportProgress: function () {
		this._progressManager.close();
	},
	setExportProgress: function (max, pos, msg) {
		this._progressManager.setProperties(0, max, pos, msg);
	},
	print: function (options) {
		new HtmlPrinter().print(this, options);
	},
	measureText: function (font, text) {
		return this._container.measureText(font, text);
	},
	measureTextRect: function (font, text, x, y, w, h, align, layout, textWrap, rect) {
		return this._container.measureTextRect(font, text, x, y, w, h, align, layout, textWrap, rect);
	},

    setContextMenu: function (menuItems) {
        if (menuItems) {
			if (!this.$_contextMenuHandler) {
				this.$_contextMenuHandler = function (e) {
					var target = e.target || e.srcElement;
					var r = target.getBoundingClientRect();
					var x = e.clientX - r.left;
					var y = e.clientY - r.top;
					var element = this._container.findElementAt(x,y);
					var eltName = element && element.$name ? (element.$name+"").replace("Element","") : eltName;
					var _showContextMenu = this._fireContextMenuPopup(x, y, eltName);
					if (this._contextMenu) {
						e.preventDefault();
						if (_showContextMenu) {
							this._popupMenuManager.showContext(this._contextMenu, x, y);
						}
					}
				}.bind(this);
				if ($_evl) {
					this._container._canvas.addEventListener("contextmenu", this.$_contextMenuHandler);
				} else {
					this._container._canvas.attachEvent("contextmenu", this.$_contextMenuHandler);
				}
			}
			this._contextMenu = new PopupMenu("gridContextMenu", this, menuItems);
        } else {
            this._contextMenu = null;
            if (this.$_contextMenuHandler) {
				if ($_evl) {
					this._container._canvas.removeEventListener("contextmenu", this.$_contextMenuHandler);
				} else {
					this._container._canvas.detachEvent("contextmenu", this.$_contextMenuHandler);
				}
                this.$_contextMenuHandler = null;
            }
        }
		return this._contextMenu;
    },
	container: function () {
		return this._container;
	},
	addElement: function (element, context) {
		this._rootElement.addElement(element, context);
	},
	invalidate: function () {
		this._container.invalidate();
	},
	_beforeRender: function (bounds) {
		this._linesLayer.invalidate();
		/*
		var items = this._bodyView.children;
		if (items) {
			for (var i = 50; i < items.length; i++) {
				items[i]._nodraw = true;
			}
		}
		*/
	},
    $_setEditFocused: function (value,e) {
		// var hasCommit = false;
		// if (!value && !this.$_editFocused && (e.type == "focusout" || e.type == "blur")) {
		//  	var options = this.editOptions();
		//  	var editor = this._editController._editor;
		//  	if (editor && editor.isListing && editor.isListing()) {
		//  		hasCommit = false;
		//  	} else if (options._gridExitWhenCommit && (this.isItemEdited() ||this.isItemEditing())) {
		//     			hasCommit = true;
		//    	}	    	
		// }    		
        if (value != this.$_editFocused) {
            this.$_editFocused = value;
            if (value) {
                var index = this.focusedIndex();
                if (!index || !this.isValid(index)) {
                    index = this.getFirstCell();
                    index && this.setFocusedIndex(index);
                }
            }
        }
        // if (hasCommit) {
        // 	this.commit(false,true);
        // }
    },
	_resetFocusMask: function () {
		var lm = this._layoutManager;
		var r = lm.gridBounds();
		var item = this._focusedIndex.item();
		var cell = this.getFocusedCellView();
		if (lm.isRowGrouped() && !this.isMergedRowGrouped() && !(item instanceof GridRow)) {			
			r.setLeft(lm.rowGroupBounds().x);
		} else if (this.isValid(this._focusedIndex) && (lm.fixedColCount() > 0 || lm.rfixedColCount() > 0) && (cell instanceof DataCellElement || (item instanceof GroupItem) || (item instanceof GroupFooter))) {			
			var col = this._focusedIndex.column().root().displayIndex();
			if (item instanceof MergedGroupFooter || item instanceof MergedGroupHeader) {

			} else if (col < lm.fixedColCount()) {
				r.copyHorz(lm.fixedBounds());
			} else if (col >= lm.rfixedStartCol()) {
				r.copyHorz(lm.rfixedBounds());
			} else {
				r.copyHorz(lm.nonfixedBounds());
			}
		}
		this._focusLayer._mask = r;//lm.fixedBounds();// lm.nonfixedBounds();// lm.gridBounds();
	},
	_resetRowFocusMask: function () {
		var lm = this._layoutManager;
		var r = lm.gridBounds();
		switch (this.displayOptions().rowFocusMask()) {
			case RowFocusMask.DATA : 
				r.width = lm.bodyBounds().right()+lm.rfixedWidth()-r.x;
				break;
			case RowFocusMask.FILL :
				r.setLeft(-r.x);
				break;
			default :
				r.width = lm.bodyBounds().right()+lm.rfixedWidth();
				r.x = 0;
				break;
		}
		this._rowFocusLayer._mask = r;//
	},
	_doDraw: function(g) {
		var r = this.clientRect();
		var displayOptions = this._displayOptions;
		var emptyStyles = this._body.emptyStyles();
		var fill = emptyStyles.background();
		var sysEmptybg = GridStyleSheet && GridStyleSheet.Default && GridStyleSheet.Default._bodyEmpty && GridStyleSheet.Default._bodyEmpty.background();
		g.clipRect(r);

		if (fill && (fill != sysEmptybg)) {
			g.drawRectI(fill, null, r);
		}
		if (!this.isEmpty()) {
			/*
			 var styles = this._model.getStyles();
			 var fill = styles.getFill();
			 var stroke = styles.getStroke();
			 if (fill || stroke) {
			 var r = new Rectangle(0, 0, this.getWidth(), this.getHeight());
			 styles.deflateMargin(r);
			 g.drawRoundRectIWith(fill, stroke, r, styles.getBorderRadiuses(), -1);
			 }
			 */
			/*
			 var r = new Rectangle(0, 0, this.getWidth(), this.getHeight());
			 var fill = new SolidBrush("#ffff00");
			 g.drawRectI(fill, null, r);
			 var stroke = new SolidPen("#555555");
			 for (var row = 0; row < 32; row++) {
			 for (var col = 0; col < 20; col++) {
			 fill = new SolidBrush("#ffffff");
			 r = new Rectangle(col * 100, row * 21, 100, 21);
			 g.drawRectI(fill, null, r);
			 g.drawLineI(stroke, r.right() - 1, r.y, r.right() - 1, r.bottom());
			 g.drawLineI(stroke, r.x, r.bottom() - 1, r.right(), r.bottom() - 1);
			 g.drawText(null, new SolidBrush("#000000"), (row + this._topIndex) + "," + col, col * 100 + 2, row * 21 + 1);
			 }
			 }
			 */
		} else if ( displayOptions && displayOptions._showEmptyMessage && this._rootColumn.visibleCount() > 0 ){
			var r2 = this._bodyView.getBounds();
			r2.width = r.width;
			var font = emptyStyles.font();
			var color = emptyStyles.foreground();
			var text = displayOptions._emptyMessage;
			var align = emptyStyles.textAlignment();
			var line = emptyStyles.lineAlignment();
			line = line == Alignment.FAR ? "bottom" : line == Alignment.NEAR ? "top" : "middle";
			g.getExplicitTextRect(font, text, r2.x, r2.y, r2.width, r2.height, align, line, r2)
			r2.x -= emptyStyles.paddingLeft() , r2.y -= emptyStyles.paddingTop(), r2.width += emptyStyles.paddingLeft()+emptyStyles.paddingRight(), r2.height += emptyStyles.paddingTop()+emptyStyles.paddingBottom();
			g.drawTextRectExplicit(font, color, text, r2, align, line);
			// g.drawRect(null, emptyStyles.border(), r2);
		}
	},
    _doDrawHtml: function () {
    },
	setFocus: function () {
        this._editController.setFocus(true);
	},
	_isColumnsDirty: function () {
		return this._columnsDirty;
	},
	_isStylesDirty: function () {
		return this._stylesDirty;
	},
	_rootGroup: function () {
		return this._rootColumn;
	},
	_checkEditing: function () {
		if (this.itemSource() instanceof EditableItemProvider && this.itemSource().isEditing()) {
			throw "Item is editing";
		}
	},
	_focusHandler: function (event) {
		this._editController.setFocus();
	},
	_validateScrollBars: function () {
		this._hscrollBar && this._hscrollBar._mouseOut();
		this._hscrollBar && this._hscrollBar._mouseOut();
	},
	_addGroupView: function () {
		this.addElement(this._rowGroupView);
	},
	_addGridObject: function (obj) {
		this._gridObjects.push(obj);
	},
	_cleanGridObjects: function () {
		for (var i = 0, cnt = this._gridObjects.length; i < cnt; i++) {
			this._gridObjects[i].clean();
		}
		this._stylesDirty = false;
	},
	_visualObjectChanged: function (obj) {
		if (obj instanceof GridPanel) {
			this._panelView.invalidate();
		} else if (obj instanceof GridBody) {
			this._bodyView.invalidate();
		} else if (obj instanceof Indicator) {
			this._indicatorView.invalidate();
		} else if (obj instanceof StateBar) {
			this._stateBarView.invalidate();
		} else if (obj instanceof CheckBar) {
			this._checkBarView.invalidate();
		} else if (obj instanceof Header || obj instanceof HeaderSummary) {
			this._doHeaderSummaryMergeChanged(obj);
			this._headerView.invalidate();
		} else if (obj instanceof Footer) {
			this._doFooterMergeChanged(obj);
			this._footerView.invalidate();
		} else if (obj instanceof EditBar) {
		}
	},
	_doLayout: function (bounds) {
		this._resetting = false;
		try {
			this.$_doLayout(bounds);
		} finally {
			if (this._loading) {
				this._loading = false;
			}
			this._dataChanged = false;
		}
		this._cleanGridObjects();
		if (this._columnsDirty) {
			this._columnsDirty = false;
			this._rootColumn.clean();
		}
		this._columnLayoutChanged = false;
		var lm = this.layoutManager();
		if (lm.itemCount() > 0) {
			var topIndex = lm.topIndex();
			var last = topIndex + lm.itemCount();
			if (topIndex != this._prevTopIndex) {
				setTimeout(function() {
					this._fireTopIndexChanged(topIndex);
				}.bind(this),0);
			}
			this._prevTopIndex = topIndex;

			if (last != this._prevLast && last == this.itemCount()) {
				setTimeout(function () {
					this._fireScrollToBottom();
				}.bind(this), 1);
			}
			this._prevLast = last;
		}
		this.$_checkCurrentRow();
	},
	$_doLayout: function (bounds) {
		trace(">>> GridBase.doLayout");
		var	cnt = this._rootColumn.visibleCount();
        var fixedCols = this.$_fixedColCount = this._fixedOptions.colCount();
        var rfixedCols = this.$_rfixedColCount = this._fixedOptions.rightColCount();
		var	b = this._body.styles();
		var	h = this._header.styles();
        var	gh = this._header.groupStyles();
        var sh = this._header.subStyles();
        var hs = this._header.summary().styles();
		var	f = this._footer.styles();
		var	def = b.sysDefault();
		var	hdef = h.sysDefault();
        var shdef = sh.sysDefault();
        var hsdef = hs.sysDefault();
		var	fdef = f.sysDefault();
        var rowGroup = this._rowGroup;
		var lm = this._layoutManager;
		var fl = lm.yU();
		var r = bounds.clone();
        var c, column, level;
        this.$_fixedRowCount = this._fixedOptions.rowCount();
        this.$_fixedColEditable = this._fixedOptions.isEditable();
        this.$_fixedRowEditable = this._fixedOptions.isRowEditable();
		this.$_editOptionsWritable = this._editOptions.isWritable();
		this._body._prepareUpdate();
		if (cnt < 1) {
			this._rootElement.setVisible(false);
			this._emptyView.setVisible(true);
			this._emptyView.setSize(r.width, r.height);
			this._emptyView.invalidate();
			return;
		}
		for (c = 0; c < cnt; c++) {
			column = this._rootColumn.getVisibleItem(c);
			column.prepare(this, c < fixedCols, c >= cnt - rfixedCols);
			column.styles().setSysDefault(def);
			if (column instanceof ValueColumn) {
				column.styles().setParent(b, false);
				column._header.styles().setParentAndDefault(h, hdef);
                column._header.subStyles().setParentAndDefault(sh, shdef);
                column._header.summary().styles().setParentAndDefault(hs, hsdef);
				column._footer.styles().setParentAndDefault(f, fdef);
				column.rendererObj().prepareRuntime(this);
				if (column instanceof DataColumn) {
				}
			} else if (column instanceof ColumnGroup) {
				this.$_setColumnGroupStyles(column, b, gh, h, sh, hs, f);
			}
		}
        for (c = 0, cnt = rowGroup.levelCount(); c < cnt; c++) {
            level = rowGroup.getLevel(c);
            level.headerStyles().setParent(rowGroup.headerStyles());
            level.footerStyles().setParent(rowGroup.footerStyles());
            level.barStyles().setParent(rowGroup.barStyles());
            level.headerBarStyles().setParent(rowGroup.headerBarStyles());
            level.footerBarStyles().setParent(rowGroup.footerBarStyles());
        }
		this._linesLayer.invalidate();
		if (this._columnWidthsDirty) {
			this._columnWidthsDirty = false;
			this.$_resetColumnWidths();
		}
		this._emptyView.setVisible(false);
		this._rootElement.setVisible(true);
		lm.setHeightMeasurer(this.heightMeasurer());
		lm.measure(r, this._leftPos, this._topIndex, this._scrollBarWidth, this._scrollBarHeight);
		this._topIndex = lm.topIndex();
		var leftPos = this._leftPos = lm.leftPos();
		lm.layout(r);
		/*$watermarkSize$*/
		if (this.activeTool()) {
			this.activeTool().layoutChanged();
		}
		this._updateScrollBars(lm, r);
		/*
		 var x = bounds.x;
		 var y = bounds.y;
		 var w = bounds.width;
		 var h = bounds.height;
		 var view = this._emptyView;
		 if (view.isVisible()) {
		 view.setBounds(x, y, w, h);
		 return;
		 }
		 view = this._panelView;
		 if (view && view.isVisible()) {
		 view.setBounds(x, y, w, this.getPanel().getMinHeight());
		 y += view.getHeight();
		 }
		 view = this._headerView;
		 if (view.isVisible()) {
		 view.setBounds(x, y, w, 25);
		 view.layoutContent(lm);
		 y += view.getHeight();
		 }
		 view = this._bodyView;
		 view.setBounds(x, y, w, h - y);
		 for (var i = 0; i < 20; i++) {
		 view.addItem(this._itemProvider.getItem(i));
		 }
		 view.layoutContent(lm);
		 */
		/*
		 var layout = this.getLayout();
		 if (layout) {
		 layout.layout(this, bounds);
		 }
		 */
		if (this._footerView.isVisible()) {
			if (lm.isRowGrouped() && leftPos > 0) {
				r = lm.footerBounds();
				r.x = leftPos;
				r.y = 0;
				this._footerView.setMask(r);
			} else {
				this._footerView.setMask(null);
			}
		}
		this._layoutSelectionViews();
		this._layouted = true;
		var cellView = this.getCellView(null, this._focusedIndex);
		if (cellView) {
			cellView.setFocused(true);
		}
		this._editController.resetEditor();
		if (this._debugView) {
			this._debugView.setBounds(0, 0, this._width, this._height);
			this._debugView.invalidate();
		}
	},
	groupingOptionsChanged: function () {
		this._doGroupingOptionsChanged();
	},
	_doGroupingOptionsChanged: function () {
	},
	_createEmptyView: function (dom) {
		return new EmptyGridElement(dom);
	},
    _createPanelModel: function () {
        return new GridPanel(this);
    },
	_createPanelView: function (dom, panel) {
		return new PanelElement(dom, panel);
	},
    _createFooterModel: function () {
        return new Footer(this);
    },
    _createFooterView: function (dom, footer) {
        return new FooterElement(dom, footer);
    },
	_createBodyView: function (dom, body, fixed, rightFixed) {
		return new GridBodyElement(dom, body, fixed, rightFixed);
	},
	_createDelegate: function () {
		return new GridDelegate(this);
	},
	_createLayoutManager: function () {
		return new GridLayoutManager(this);
	},
    _createEditController: function () {
        return this.isReadMode() ? new DummyEditController(this) : _isMobile() ? new MobileEditController(this) : new DefaultEditController(this);
    },
	_columnIndexChanged: function (column) {
		this.clearSelection();
		this._resetColumnIndicies();
		this._resetFooterMerge();
		this._resetHeaderSummaryMerge();
		this.refreshView();
	},
	_columnVisibleIndexChanged: function (column) {
		this.clearSelection();
		this._resetVisibleColumns();
		this._resetColumnPositions();		
		this._resetFooterMerge();
		this._resetHeaderSummaryMerge();
		this.refreshView();
	},
    _columnCheckedChanged: function (column) {
        this._fireColumnCheckedChanged(column);
    },
	_dataColumnChanged: function (column) {
        this.refreshView();
		this._editController && this._editController.dataColumnChanged(column);
	},
	_updateScrollBars: function (lm, r) {
        /*
        if (this._dom) {
            this._hscrollBar && this._hscrollBar.setVisible(false);
            this._vscrollBar && this._vscrollBar.setVisible(false);
            return;
        }
        */
		if (lm._hscrollBar) {
			if (!this._hscrollBar) {
				this._hscrollBar = new ScrollBar(this._dom, false);
				this._scrollLayer.addElement(this._hscrollBar);
				this._hscrollBar.addListener(this);
			}
			var hMax = lm.bodyBounds().width;
			var hPage = Math.min(r.width - lm.gridBounds().x - lm.fixedWidth() - lm.rfixedWidth() - (lm._vscrollBar ? this._scrollBarWidth : 0), lm.columnsLength() - lm.leftPos());
			this._hscrollBar.setProperties(0, hMax, hPage);
			this._hscrollBar.setPosition(lm.leftPos());
			this._hscrollBar.setVisible(true);
		} else if (this._hscrollBar) {
			this._hscrollBar.setProperties(0, 0, 0);
			this._hscrollBar.setPosition(0);
			this._hscrollBar.setVisible(false);
		}
		if (lm._vscrollBar) {
			if (!this._vscrollBar) {
				this._vscrollBar = new ScrollBar(this._dom, true);
				this._scrollLayer.addElement(this._vscrollBar);
				this._vscrollBar.addListener(this);
			}
			var itemCount = this.itemCount();
			var vMax = itemCount - lm.fixedItemCount();
			var vPage = Math.min(lm.fullItemCount(), itemCount - lm.topIndex());
			this._vscrollBar.setProperties(0, vMax, vPage);
			this._vscrollBar.setPosition(lm.topIndex());
			this._vscrollBar.setVisible(true);
		} else if (this._vscrollBar) {
			this._vscrollBar.setProperties(0, 0, 0);
			this._vscrollBar.setPosition(0);
			this._vscrollBar.setVisible(false);
		}
		this._layoutScrollBars(lm, r);
	}, 
	_layoutScrollBars: function (lm, r) {
		this._scrollLayer.setBounds(r.x, r.y, r.width, r.height);
		var sw = this._scrollBarWidth;
        var sh = this._scrollBarHeight;
		var hbar = this._hscrollBar;
		var vbar = this._vscrollBar;
		if (lm._hscrollBar) {
			hbar.setBounds(r.x, r.bottom() - sh, r.width - (lm._vscrollBar ? sw : 0), sh);
			hbar.layoutContent(lm);
		}
		if (lm._vscrollBar) {
			vbar.setBounds(r.right() - sw, r.y, sw, r.height - (lm._hscrollBar ? sh : 0), sw);
			vbar.layoutContent(lm);
		}
	},
	_addSelectionElement: function (view) {
		if (view && !this._selectionLayer.contains(view)) {
			this._selectionLayer.addElement(view, this._toolContext);
			return true;
		}
		return false;
	},
	_removeSelectionElement: function (view) {
		if (this._selectionLayer.contains(view)) {
			this._selectionLayer.removeElement(view);
			return true;
		}
		return false;
	},
	_addSelectionView: function (item) {
		var view = null;
		if (!this._selectionViews.get(item)) {
			view = this._delegate.borrowSelectionView(item);
			this._selectionViews.set(item, view);
			this._addSelectionElement(view);
		}
		return view;
	},
	_clearSelectionViews: function () {
		this._selectionViews.each(function (key, value) {
			this._removeSelectionElement(value);
			this._delegate.returnSelectionView(value);
		}.bind(this));
		this._selectionViews.clear();
	},
	_layoutSelectionViews: function () {
		if (!this._layouted || this._resetting) {
			return;
		}
		this._selectionViews.each(function (item, view) {
			var mobile = _isMobile();
			var lm = this.layoutManager();
			if (this._selections.isSingleCell() && !mobile) {
				view.setVisible(false);
			} else {
				var visible = false;
				var r = new Rectangle();
				if (item instanceof RowSelection) {
					visible = this.$_getSelectionRowsRect(lm, item, r);
				} else if (item instanceof ColumnSelection) {
					visible = this.$_getSelectionColumnsRect(lm, item, r);
				} else {
					visible = this.$_getSelectionRangeRect(lm, item, r);
				}
				view.setVisible(visible);
				if (view.isVisible()) {
					view.setRectI(r);
					view.updateElement(item, mobile ? this._selectOptions.mobileStyles() : this._selectOptions.maskStyles());
					view.invalidate();
				}
			}
		}.bind(this));
	},
	$_getSelectionRowsRect: function (lm, item, r) {
		var range = item.getBounds();
		var fixed = lm.fixedItemCount();
		var t = this.topIndex();
		var r1, r2;
		var y;
		if (fixed > 0) {
			if (range.R1() >= t + fixed + lm.itemCount() || range.R2() < 0 || range.R1() >= fixed && range.R2() < t + fixed) {
				return false;
			}
			y = lm.fixedHeight() + this.fixedOptions().rowBarHeight();
			if (range.R1() < fixed) {
				r1 = lm.itemBounds(Math.max(0, range.R1()));
			} else {
				r1 = lm.itemBounds(Math.max(0, range.R1() - t));
				r1.y = Math.max(r1.y, y);
			}
			if (range.R2() < fixed) {
				r2 = lm.itemBounds(range.R2());
			} else if (range.R1() <= fixed && range.R2() < fixed+t) { // fixed 영역과 body영역에 겹쳐있을 때
				r2= lm.itemBounds(Math.min(fixed + t, fixed)-1);
			} else if (range.R2() >= t) {
				r2 = lm.itemBounds(Math.min(lm.itemCount() + fixed - 1, range.R2() - t));
				r2.y = Math.max(r2.y, y);
			} else {
				r2 = r1;
			}
		} else if (lm.itemCount() > 0) {
			if (range.R1() >= t + lm.itemCount() || range.R2() < t) {
				return false;
			}
			r1 = lm.itemBounds(Math.max(0, range.R1() - t));
			r2 = lm.itemBounds(Math.min(lm.itemCount() - 1, range.R2() - t));
		} else {
			return false;
		}
		r.copy(r1.union(r2));
		r.offset(0, lm.bodyBounds().y);
		r.setRight(lm.bodyBounds().right()+lm.rfixedWidth());
		return true;
	},
	$_getSelectionColumnsRect: function (lm, item, r) {
		var range = item.getBounds();
		var fixed = lm.fixedColCount();
		var rfixed = lm.rfixedColCount();
		var rstart = lm.rfixedStartCol();
		var r1, r2;
		var c1 = range.C1().root().displayIndex();
		var c2 = range.C2().root().displayIndex();
		var wbar = this.fixedOptions().colBarWidth();
		var r1 = lm.dataRootRect(range.C1());
		var r2 = lm.dataRootRect(range.C2());
		if (fixed > 0) {
			var x = lm.columnRect(fixed - 1).right();
			var fx = x + wbar;
			if (c1 >= fixed) {
				r1.setRight(Math.max(fx, r1.right()));
				r1.setLeft(Math.max(fx, r1.x));
			}
			if (c2 >= fixed) {
				r2.setRight(Math.max(c1 < fixed ? x : fx, r2.right()));
				r2.setLeft(Math.max(fx, r2.x));
			}
		}
		if (rfixed > 0) {
			var fx = lm.rfixedLeft();
			var x = fx + wbar;
			if (c1 < rstart) {
				r1.setRight(Math.min(fx, r1.right()));
				r1.setLeft(Math.min(c2 >= rstart ? x : fx, r1.x));
			}
			if (c2 < rstart) {
				r2.setRight(Math.min(fx, r2.right()));
				r2.setLeft(Math.min(fx, r2.x));
			}

		}
		r.setLeft(Math.min(r1.x, r2.x));
		r.setRight(Math.max(r1.right(), r2.right()));
		r2.setBottom(lm.itemRect(lm.itemCount() - 1).bottom());
		r.setTop(lm.headerBounds().y);
		r.setBottom(r2.bottom());
		return true;
	},
	$_getSelectionRangeRect: function (lm, item, r) {
		var tr = new Rectangle();
		if (!this.$_getSelectionRowsRect(lm, item, tr)) {
			return false;
		}
		r.setTop(tr.y);
		r.setBottom(tr.bottom());
		this.$_getSelectionColumnsRect(lm, item, tr);
		r.setLeft(tr.x);
		r.setRight(tr.right());
		return true;
	},
	initStyles: function () {
		var g = this.styles();
		var h = this.header().styles();
        var s = this.header().summary().styles();
		var f = this.footer().styles();
		this.panel().styles().setParent(g, false);
		this.body().styles().setParent(g, false);
		this.body().emptyStyles().setParent(g, false);
		this.fixedOptions().styles().setParent(g, false);
		this.fixedOptions().colBarStyles().setParent(g, false);
		this.fixedOptions().rowBarStyles().setParent(g, false);
		this.header().styles().setParent(g, false);
		this.header().groupStyles().setParent(g, false);
        this.header().subStyles().setParent(g, false);
        this.header().summary().styles().setParent(g, false);
		this.footer().styles().setParent(g, false);
		this.footer().groupStyles().setParent(g, false);
		this.indicator().styles().setParent(g, false);
		this.indicator().headStyles().setParent(h, false);
		this.indicator().footStyles().setParent(f, false);
        this.indicator().summaryStyles().setParent(s, false);
		this.checkBar().styles().setParent(g, false);
		this.checkBar().headStyles().setParent(h, false);
		this.checkBar().footStyles().setParent(f, false);
        this.checkBar().summaryStyles().setParent(s, false);
		this.stateBar().styles().setParent(g, false);
		this.stateBar().headStyles().setParent(h, false);
		this.stateBar().footStyles().setParent(f, false);
        this.stateBar().summaryStyles().setParent(s, false);
		this.rowGroup().headStyles().setParent(h, false);
		this.rowGroup().footStyles().setParent(f, false);
		this.rowGroup().summaryStyles().setParent(s, false);
		this.rowGroup().headerStyles().setParent(g, false);
		this.rowGroup().footerStyles().setParent(g, false);
		this.rowGroup().panelStyles().setParent(h, false);
		this.rowGroup().barStyles().setParent(this.rowGroup().headerStyles(), false);
		this.rowGroup().headerBarStyles().setParent(this.rowGroup().headerStyles(), false);
		this.rowGroup().footerBarStyles().setParent(this.rowGroup().footerStyles(), false);
		this.selectOptions().maskStyles().setParent(null, false);
		s = GridStyleSheet.Default;
		this.styles().setSysDefault(s.getGrid(), false);
		this.panel().styles().setSysDefault(s.panel(), false);
		this.body().styles().setSysDefault(s.body(), false);
		this.body().emptyStyles().setSysDefault(s.bodyEmpty(), false);
		this.fixedOptions().styles().setSysDefault(s.fixed(), false);
		this.fixedOptions().colBarStyles().setSysDefault(s.fixedColBar(), false);
		this.fixedOptions().rowBarStyles().setSysDefault(s.fixedRowBar(), false);
		this.header().styles().setSysDefault(s.header(), false);
		this.header().groupStyles().setSysDefault(s.headerGroup(), false);
        this.header().subStyles().setSysDefault(s.headerSub(), false);
        this.header().summary().styles().setSysDefault(s.headerSummary(), false);
		this.footer().styles().setSysDefault(s.footer(), false);
		this.footer().groupStyles().setSysDefault(s.footerGroup(), false);
		this.indicator().styles().setSysDefault(s.indicator(), false);
		this.indicator().headStyles().setSysDefault(s.indicatorHead(), false);
		this.indicator().footStyles().setSysDefault(s.indicatorFoot(), false);
        this.indicator().summaryStyles().setSysDefault(s.indicatorSum(), false);
		this.checkBar().styles().setSysDefault(s.checkBar(), false);
		this.checkBar().headStyles().setSysDefault(s.checkBarHead(), false);
		this.checkBar().footStyles().setSysDefault(s.checkBarFoot(), false);
        this.checkBar().summaryStyles().setSysDefault(s.checkBarSum(), false);
		this.stateBar().styles().setSysDefault(s.stateBar(), false);
		this.stateBar().headStyles().setSysDefault(s.stateBarHead(), false);
		this.stateBar().footStyles().setSysDefault(s.stateBarFoot(), false);
        this.stateBar().summaryStyles().setSysDefault(s.stateBarSum(), false);
		this.rowGroup().headStyles().setSysDefault(s.rowGroupHead(), false);
		this.rowGroup().footStyles().setSysDefault(s.rowGroupFoot(), false);
		this.rowGroup().summaryStyles().setSysDefault(s.rowGroupSummary(), false);
		this.rowGroup().headerStyles().setSysDefault(s.rowGroupHeader(), false);
		this.rowGroup().footerStyles().setSysDefault(s.rowGroupFooter(), false);
		this.rowGroup().panelStyles().setSysDefault(s.rowGroupPanel(), false);
		this.rowGroup().barStyles().setSysDefault(s.rowGroupBar(), false);
		this.rowGroup().headerBarStyles().setSysDefault(s.rowGroupHeaderBar(), false);
		this.rowGroup().footerBarStyles().setSysDefault(s.rowGroupFooterBar(), false);
		this.selectOptions().maskStyles().setSysDefault(s.selection(), false);
	},
	$_setColumnGroupStyles: function (group, styles, groupHeaderStyles, headerStyles, headerSubStyles, summaryStyles, footerStyles) {
		var	cnt = group.count();
		var	def = styles.sysDefault();
		var	headerDef = headerStyles.sysDefault();
        var	headerSubDef = headerSubStyles.sysDefault();
        var summaryDef = summaryStyles.sysDefault();
		var	footerDef = footerStyles.sysDefault();
		group.styles().setParent(styles, false);
		group.header().styles().setParentAndDefault(groupHeaderStyles, groupHeaderStyles.sysDefault());
		for (var i = 0; i < cnt; i++) {
			var column = group.getItem(i);
			column.prepare(this, group.$_fixed, group.$_rightFixed);
			column.styles().setSysDefault(def);
			if (column instanceof ValueColumn) {
                var header = column.header();
				column.styles().setParent(styles, false);
				header.styles().setParentAndDefault(headerStyles, headerDef);
                header.subStyles().setParentAndDefault(headerSubStyles, headerSubDef);
                header.summary().styles().setParentAndDefault(summaryStyles, summaryDef);
				column.footer().styles().setParentAndDefault(footerStyles, footerDef);
				column.rendererObj().prepareRuntime(this);
				if (column instanceof DataColumn) {
					column.dynamicStyles().prepare();
				}
			} else if (column instanceof ColumnGroup) {
				this.$_setColumnGroupStyles(column, styles, groupHeaderStyles, headerStyles, headerSubStyles, summaryStyles, footerStyles);
			}
		}
	},
	$_resetColumnWidths: function () {
		for (var i = this._rootColumn.visibleCount(); i--;) {
			var column = this._rootColumn.getVisibleItem(i);
			column._displayWidth = column._groupWidth = column._width = _int(column.width());
			if (column instanceof ColumnGroup) {
				column.resetGroupWidths();
			}
		}
	},
	_canMerge: function () {
		return false;
	},
	_populateMerges: function () {
		if (!this._canMerge()) {
			return;
		}
		var i, cnt;
		var col;
		var merges;
		var level;
		var columns = this.getHorzColumns();
		for (i = 0, cnt = columns.length; i < cnt; i++) {
			col = _cast(columns[i], ValueColumn);
			if (col && col.canMerge()) {
				merges = col.stateFor(ColumnMergeManager.MERGE_ROOMS);
				if (!merges) {
					merges = new ColumnMergeManager(col);
					col.setState(ColumnMergeManager.MERGE_ROOMS, merges);
				}
				merges.clear();
				if (col instanceof DataColumn && col.isMergeGrouped()) {
					level = this.getGroupLevel(col.dataIndex());
					if (level > 0) {
						merges.initialize(RowGroupMergeRule.INIT_COUNT);
					}
				} else {
					merges.initialize(ColumnMergeRule.INIT_COUNT);
				}
			}
		}
	},
	_sortItems: function (fields, directions, textCases) {
        var flds = fields.concat();
        var dirs = directions ? directions.concat() : [];
        var cases = textCases ? textCases.concat() : [];
        if (this._fireSorting(flds, dirs)) {
            this._toastManager.show(this.sortingOptions().toast(), true, function () {
                var row = this.sortingOptions().isKeepFocusedRow() && this.focusedIndex() ? this.focusedIndex().dataRow() : -1;
                this._doSortItems(fields, dirs, cases);
                if (row >= 0) {
                    var idx = CellIndex.temp(this, this.getItemIndexOfRow(row), this.focusedIndex().C());
                    this.setFocusedIndex(idx, true, true);
                }
            }.bind(this));
        }
	},
	_doSortItems: function (fields, directions, textCases) {
	},
	_clearFitWidths: function () {
		this._rootColumn.clearFitWidths();
	},
	_doGroupingOptionsChanged: function () {
	},
	$_rowGroupMergeModeChanged: function () {
		this._doRowGroupMergeModeChanged();
	},
	_doRowGroupMergeModeChanged: function () {
	},
	$_rowGroupFooterMergeChanged: function () {
		this._doRowGroupFooterMergeChanged();
	},
	_doRowGroupFooterMergeChanged: function () {
	},
	$_footerMergeChanged: function () {
		this._doFooterMergeChanged();
	},
	_doFooterMergeChanged: function () {
		var footer = this.footer();
		if (footer._footerMergeDirty) {
			this._footerMergeManager.buildRooms(this, footer._mergeCells);
		}
	},
	$_headerSummaryMergeChanged: function () {
		this._doHeaderSummaryMergeChanged();
	},
	_doHeaderSummaryMergeChanged: function () {
		var headerSummary = this.header().summary();
		if (headerSummary._headerSummaryMergeDirty) {
			this._headerSummaryMergeManager.buildRooms(this, headerSummary._mergeCells);
		}
	},
	$_rowGroupAdornmentsChanged: function () {
		this._doRowGroupAdornmentsChanged();
	},
	_doRowGroupAdornmentsChanged: function () {
	},
	$_summaryModeChanged: function () {
		this._doSummaryModeChanged();
	},
	_doSummaryModeChanged: function () {
	},
	$_groupSummaryModeChanged: function () {
		this._doGroupSummaryModeChanged();
	},
	_doGroupSummaryModeChanged: function () {
	},
	$_groupSortingChanged: function() {
		this._doGroupSortingChanged();
	},
	_doGroupSortingChanged: function() {
	},
	_columnMergeRuleChanged: function (column) {
		this._populateMerges();
		this.refreshView();
	},
	$_columnFiltersChanged: function (columnFilter) {
		this._doColumnFiltersChanged(columnFilter);
	},
	_doColumnFiltersChanged: function (filter) {
		this._fireFilteringChanged();
	},
	$_columnFilterActionsChanged: function (column) {
		this._doColumnFilterActionsChanged(column);
	},
	_doColumnFilterActionsChanged: function (column) {
		this.invalidateLayout();
	},
	$_columnFilterActionClicked: function (action, x, y) {
		this._fireFilterActionClicked(action, x, y);
	},
	_editorStarted: function (editor, index) {
		if (this.edit(index)) {
		}
	},
	_editorChange: function (editor, index, value) {//}, text) {
		this._fireEditChange(index, value);//, text);
	},
    getEditValue: function (editor, index, editResult) {
        this._doGetEditValue(index, editResult);
    },
    _doGetEditValue: function (index, editResult) {
        this._fireGetEditValue(index, editResult)
    },
	editorCommit: function (editor, index, oldValue, newValue) {
		return this._doCellCommit(index, oldValue, newValue);
	},
	_doCellCommit: function (index, oldValue, newValue) {
		return this._fireEditCommit(index, oldValue, newValue);
	},
	editorCancel: function (editor, index) {
		this._doCellCancel(index);
	},
	editorCanceled: function () {
		this.activeTool().resetFocused();
	},
	_doCellCancel: function (index) {
		return this._fireEditCanceled(index);
	},
	_editorSearch: function (editor, index, text) {
		this._fireEditSearch(index, text);;
	},
	_searchCellButtonClick: function( editor, index, text) {
		return this._fireSearchCellButtonClick(index, text);
	},
	$_validateCell: function (index, value, inserting) {
		try {
			this._fireValidateCell(index, inserting, value);
		} catch (err) {
			if (err instanceof ValidationError && err.level !== ValidationLevel.IGNORE) {
				err.column = index.column();
				throw err;
			}
			throw err;
		}
	},
	$_validateRow: function (item, inserting) {
		var columns = this.getDataColumns();
		for (var i = 0, cnt = columns.length; i < cnt; i++) {
			var column = columns[i];
			var index = CellIndex.temp(this, item.index(), column);
			var value = item.getData(column.dataIndex());
			this.$_validateCell(index, value, inserting);
		}
		var values = item.getRowObject();
		try {
			this._fireValidateRow(item, inserting, values);
		} catch (err) {
			if (err instanceof ValidationError && err.level !== ValidationLevel.IGNORE) {
				throw err;
			}
			throw err;
		}
	},
	$_validateCellValue: function (index, value) {
		try {
			var inserting = ItemState.isInserting(index.item().itemState());
			this._validationManager.validateCell(index, inserting);
			this.$_validateCell(index, value, inserting);
			index.dataColumn().setError(null);
			index.dataColumn().setErrorLevel(ValidationLevel.IGNORE);
			var dataId = index.dataId();
			var dataIndex = index.dataColumn().dataIndex();
			var row = this._validationManager._validateCellList[dataId];
			if (row && row[dataIndex]) {
				delete row[dataIndex];
			}
			return true;
		} catch (err) {
			if (err instanceof ValidationError) {
				index.dataColumn().setError(err.message || err);
				index.dataColumn().setErrorLevel(err.level || ValidationLevel.ERROR);
				this._validationManager._userValidations && this._validationManager.addInvalidateCell(index, err);

			} else {
				throw err;
			}
		}
		return false;
	},
	validateCellCommit: function (index, value) {
		if (this.editOptions().isValidateOnEdited()) {
			this.$_validateCellValue(index, value);
		}
	},
	checkValidateCells: function(itemIndices) {
		return this._validationManager.checkValidateCells(itemIndices);
	},
	getInvalidCellList:function() {
		return this._validationManager.getInvalidCellList();
	},
	scrollRow: function (delta) {
		var oldTop = this.topIndex();
		this.setTopIndex(oldTop + delta);
		delta = this.topIndex() - oldTop;
		if (delta) {
			if (delta > 0) {
			} else {
			}
		}
	},
	$_getFieldDefaults: function (dataSource) {
		function getDefault(group, dataIndex) {
			for (var i = 0; i < group.count(); i++) {
				var column = _cast(group.getItem(i), DataColumn);
				if (column && column.dataIndex() == i) {
					var value = column.defaultValue();
					if (value != UNDEFINED) {
						return value;
					}
				}
				var g = _cast(group.getItem(i), ColumnGroup);
				if (g) {
					value = getDefault(g, i);
					if (value != UNDEFINED) {
						return value;
					}
				}
			}
			return UNDEFINED;
		}
		var flds = this.dataSource().fieldCount();
		var values = [];
		for (var i = 0; i < flds; i++) {
			values.push(UNDEFINED);
		}
		for (i = 0; i < flds; i++) {
			getDefault(this._rootColumn, i);
		}
		return values;
	},
	$_getColumnDefaults: function (group, defaults) {
		for (var i = 0, cnt = group.count(); i < cnt; i++) {
			var column = group.getItem(i);
			if (column instanceof DataColumn) {
				defaults[column.dataIndex()] = column.defaultValue();
			} else if (column instanceof ColumnGroup) {
				this.$_getColumnDefaults(column, defaults);
			}
		}
	},
	$_getItemDefaults: function (item, defaults) {
	},
	$_readDefaultValues: function (defaults) {
	},
	$_getInsertDefaults: function (item) {
		var defaults = this.$_getFieldDefaults(this.itemSource().dataSource());
		this.$_getColumnDefaults(this._rootColumn, defaults);
		this.$_getItemDefaults(null, defaults);
		this.$_readDefaultValues(defaults);
		return defaults;
	},
	_clearColumnErrors: function () {
		function clearErrors(group) {
			for (var i = 0, cnt = group.count(); i < cnt; i++) {
				var dc = group.getItem(i);
				if (dc instanceof DataColumn) {
					dc.setError(null);
				} else if (dc instanceof ColumnGroup) {
					clearErrors(dc);
				}
			}
		}
		clearErrors(this._rootColumn);
	},
	_setColumnErrors: function(item) {
		function setErrors(errData, group) {
			for (var i = 0, cnt = group.count(); i < cnt; i++) {
				var dc = group.getItem(i);
				if (dc instanceof DataColumn) {
					var err = errData[dc.dataIndex()];
					if (err) {
						dc.setError(err.message);
						dc.setErrorLevel(err.level)
					}
				} else if (dc instanceof ColumnGroup) {
					setErrors(errData, dc);
				}
			}
		}
		var errData = this._validationManager._validateCellList && this._validationManager._validateCellList[item.dataId()];
		if (!errData) {return}
		setErrors(errData, this._rootColumn);
	},
	$_checkCurrentRow: function (force) {
        if (this._focusedIndex) {
            var id = this._focusedIndex.dataId();
			var row = this._focusedIndex.dataRow();
            if (force || (id != this._currentRowId)) {
                clearTimeout(this._rowChangeTimer);
                var oldRow = this._currentRow;
                var delay = this._displayOptions.rowChangeDelay();
                var needFire = force || delay <= 0;
                this._currentRowId = id;
				this._currentRow = row;
                if (needFire) {
                    this._fireCurrentRowChanged(oldRow, row);
                } else if (delay > 0) {
                    this._rowChangeTimer = setTimeout(function () {
                        this._fireCurrentRowChanged(oldRow, row);
                    }.bind(this), delay);
                }
                return true;
            }
        }
        return false;
	},
    $_checkLastCellCommit: function (index) {
        if (index && index.isLast()) {
        }
    },
	_fireCurrentChanging: function (oldIndex, newIndex) {
		return this.fireConfirmEvent(GridBase.CURRENT_CHANGING, oldIndex, newIndex);
	},
	_fireCurrentChanged: function (newIndex) {
		return this.fireEvent(GridBase.CURRENT_CHANGED, newIndex);
	},
	_fireCurrentRowChanged: function (oldRow, newRow) {
		return this.fireEvent(GridBase.CURRENT_ROW_CHANGED, oldRow, newRow);
	},
	_fireValidateCell: function (index, inserting, value) {
		return this.fireEvent(GridBase.VALIDATE_CELL, index, inserting, value);
	},
	_fireValidateRow: function (item, inserting, values) {
		return this.fireEvent(GridBase.VALIDATE_ROW, item, inserting, values);
	},
	_fireValidationFail:function(itemIndex, column, err) {
		return this.fireObjectEvent(GridBase.VALIDATION_FAIL, itemIndex, column, err);
	},
	_fireColumnHeaderClicked: function (column) {
		return this.fireEvent(GridBase.COLUMN_HEADER_CLICKED, column);
	},
	_fireColumnHeaderDblClicked: function (column) {
		return this.fireEvent(GridBase.COLUMN_HEADER_DBL_CLICKED, column);
	},
    _fireColumnCheckedChanged: function (column) {
        return this.fireEvent(GridBase.COLUMN_CHECKED_CHANGED, column);
    },
	_fireFooterCellClicked: function (column) {
		return this.fireEvent(GridBase.FOOTER_CELL_CLICKED, column);
	},
	_fireFooterCellDblClicked: function (column) {
		return this.fireEvent(GridBase.FOOTER_CELL_DBL_CLICKED, column);
	},
	_fireHeaderSummaryCellClicked: function (column) {
		return this.fireEvent(GridBase.HEADERSUMMARY_CELL_CLICKED, column);
	},
	_fireHeaderSummaryCellDblClicked: function (column) {
		return this.fireEvent(GridBase.HEADERSUMMARY_CELL_DBL_CLICKED, column);
	},
	_fireCheckBarHeadClicked: function () {
		return this.fireEvent(GridBase.CHECK_BAR_HEAD_CLICKED);
	},
	_fireCheckBarFootClicked: function () {
		return this.fireEvent(GridBase.CHECK_BAR_FOOT_CLICKED);
	},
	_fireIndicatorCellClicked: function (index) {
		return this.fireEvent(GridBase.INDICATOR_CELL_CLICKED, index);
	},
	_fireStateBarCellClicked: function (index) {
		return this.fireEvent(GridBase.STATE_BAR_CELL_CLICKED, index);
	},
	_fireRowGroupHeadClicked: function () {
		return this.fireEvent(GridBase.ROWGROUP_HEAD_CLICKED);
	},
	_fireRowGroupFootClicked: function () {
		return this.fireEvent(GridBase.ROWGROUP_FOOT_CLICKED);
	},
	_fireRowGroupHeaderFooterClicked: function (kind, index) {
		return this.fireEvent(GridBase.ROWGROUP_HEADER_FOOTER_CLICKED, kind, index);
	},
	_fireRowGroupBarClicked: function (index) {
		return this.fireEvent(GridBase.ROWGROUP_BAR_CLICKED, index);
	},
	_fireCheckBarFootDblClicked: function () {
		return this.fireEvent(GridBase.CHECK_BAR_FOOT_DBL_CLICKED);
	},
	_fireIndicatorCellDblClicked: function (index) {
		return this.fireEvent(GridBase.INDICATOR_CELL_DBL_CLICKED, index);
	},
	_fireStateBarCellDblClicked: function (index) {
		return this.fireEvent(GridBase.STATE_BAR_CELL_DBL_CLICKED, index);
	},
	_fireRowGroupHeadDblClicked: function () {
		return this.fireEvent(GridBase.ROWGROUP_HEAD_DBL_CLICKED);
	},
	_fireRowGroupFootDblClicked: function () {
		return this.fireEvent(GridBase.ROWGROUP_FOOT_DBL_CLICKED);
	},
	_fireRowGroupHeaderFooterDblClicked: function (kind, index) {
		return this.fireEvent(GridBase.ROWGROUP_HEADER_FOOTER_DBL_CLICKED, kind, index);
	},
	_fireRowGroupBarDblClicked: function (index) {
		return this.fireEvent(GridBase.ROWGROUP_BAR_DBL_CLICKED, index);
	},
	_firePanelClicked: function () {
		return this.fireEvent(GridBase.PANEL_CLICKED);
	},
	_firePanelDblClicked: function () {
		return this.fireEvent(GridBase.PANEL_DBL_CLICKED);
	},
	_fireRowGroupPanelClicked: function (column) {
		return this.fireEvent(GridBase.ROWGROUP_PANEL_CLICKED, column);
	},
	_fireRowGroupPanelDblClicked: function (column) {
		return this.fireEvent(GridBase.ROWGROUP_PANEL_DBL_CLICKED, column);
	},
	_fireMenuItemClicked: function (menuItem, index) {
		return this.fireEvent(GridBase.MENU_ITEM_CLICKED, menuItem, index);
	},
	_fireContextMenuPopup: function (x, y, eltName) {
		return this.fireConfirmEvent(GridBase.CONTEXT_MENU_POPUP, x, y, eltName);
	},
    _fireContextMenuItemClicked: function (menuItem, index) {
        return this.fireEvent(GridBase.CONTEXT_MENU_ITEM_CLICKED, menuItem, index);
    },
	_fireCellButtonClicked: function (index) {
		return this.fireEvent(GridBase.CELL_BUTTON_CLICKED, index);
	},
	_fireEditButtonClicked: function (index) {
		return this.fireEvent(GridBase.EDIT_BUTTON_CLICKED, index);
	},
	_fireImageButtonClicked: function (index, buttonIndex, name) {
		return this.fireEvent(GridBase.IMAGE_BUTTON_CLICKED, index, buttonIndex, name);
	},
	_fireScrollToBottom: function () {
		return this.fireEvent(GridBase.SCROLL_TO_BOTTOM);
	},
	_fireTopIndexChanged: function (itemIndex) {
		return this.fireEvent(GridBase.TOPITEMINDEX_CHANGED, itemIndex);
	},
	_fireDataCellClicked: function (index) {
		return this.fireEvent(GridBase.DATA_CELL_CLICKED, index);
	},
	_fireDataCellDblClicked: function (index) {
		return this.fireEvent(GridBase.DATA_CELL_DBL_CLICKED, index);
	},
	_fireRowsDeleting: function (rows) {
		return this.fireConfirmEvent(GridBase.ROWS_DELETING, rows);
	},
	_fireRowInserting: function (itemIndex, dataRow) {
		return this.fireConfirmEvent(GridBase.ROW_INSERTING, itemIndex, dataRow);
	},
    _fireItemCommit: function (itemIndex, dataRow) {
        return this.fireEvent(GridBase.ITEM_COMMIT);
    },
	_fireSelectionChanged: function () {
		return this.fireEvent(GridBase.SELECTION_CHANGED);
	},
	_fireSelectionAdded: function (selection) {
		return this.fireEvent(GridBase.SELECTION_ADDED, selection);
	},
	_fireSelectionRemoved: function () {
		return this.fireEvent(GridBase.SELECTION_REMOVED);
	},
	_fireSelectionCleared: function () {
		return this.fireEvent(GridBase.SELECTION_CLEARED);
	},
	_fireSelectionResized: function () {
		return this.fireEvent(GridBase.SELECTION_RESIZED);
	},
	_fireSelectionEnded: function (selection) {
		return this.fireEvent(GridBase.SELECTION_ENDED, selection);
	},
    _fireUpdateStarted: function (item, appending) {
        return this.fireEvent(GridBase.UPDATE_STARTED, item);
    },
    _fireInsertStarted: function (item, appending) {
        return this.fireEvent(GridBase.INSERT_STARTED, item, appending);
    },
    _fireShowEditor: function (index, attrs) {
        return this.fireConfirmEvent(GridBase.SHOW_EDITOR, index, attrs);
    },
	_fireHideEditor: function () {
		return this.fireEvent(GridBase.HIDE_EDITOR);
	},
	_fireEditChange: function (index, value) {
		return this.fireEvent(GridBase.EDIT_CHANGE, index, value);
	},
    _fireGetEditValue: function (index, editResult) {
        return this.fireEvent(GridBase.GET_EDIT_VALUE, index, editResult);
    },
	_fireEditCommit: function (index, oldValue, newValue) {
		return this.fireConfirmEvent(GridBase.EDIT_COMMIT, index, oldValue, newValue);
	},
	_fireEditCanceled: function (index) {
		return this.fireEvent(GridBase.EDIT_CANCELED, index);
	},
	_fireItemEditCancel:function (item) {
		return this.fireConfirmEvent(GridBase.ITEM_EDIT_CANCEL, item);
	},
	_fireItemEditCanceled: function (item) {
		return this.fireEvent(GridBase.ITEM_EDIT_CANCELED, item);
	},
	_fireEditSearch: function (index, text) {
		this.fireEvent(GridBase.EDIT_SEARCH, index, text);
	},
	_fireSearchCellButtonClick: function(index, text) {
		return this.fireObjectEvent(GridBase.SEARCH_BUTTON_CLICK, index, text);
	},
	_fireCellEdited: function (item, field) {
		this.fireEvent(GridBase.CELL_EDITED, item, field);
	},
	_fireEditRowChanged: function (item, field, oldValue, newValue) {
		this.fireEvent(GridBase.EDIT_ROW_CHANGED, item, field, oldValue, newValue);
	},
	_fireEditItemPasted: function (item, fields, oldValues, newValues) {
		this.fireEvent(GridBase.EDIT_ROW_PASTED, item, fields, oldValues, newValues);
	},
	_fireItemsPasted: function (items) {
		this.fireEvent(GridBase.ROWS_PASTED, items);
	},
	_fireItemChecked: function (item) {
		this.fireEvent(GridBase.ITEM_CHECKED, item, item.isChecked());
	},
	_fireItemsChecked: function (items, checked) {
		this.fireEvent(GridBase.ITEMS_CHECKED, items, checked);
	},
	_fireItemAllChecked: function (checked) {
		this.fireEvent(GridBase.ITEM_ALL_CHECKED, checked);
	},
	_fireErrorClicked: function (cell, error) {
		this.fireEvent(GridBase.ERROR_CLICKED, error);
	},
    _fireSorting: function (fields, directions) {
        return this.fireConfirmEvent(GridBase.SORTING, fields, directions);
    },
    _fireFiltering: function () {
        return this.fireConfirmEvent(GridBase.FILTERING);
    },
	_fireFilterActionClicked: function (action, x, y) {
		this.fireEvent(GridBase.FILTER_ACTION_CLICKED, action, x, y);
	},
	_fireKeyDown: function(key, ctrl, shift, alt) {
		return this.fireConfirmEvent(GridBase.KEY_DOWN, key, ctrl, shift, alt);
	},
	_fireKeyPress: function(key) {
		this.fireEvent(GridBase.KEY_PRESS, key);
	},
	_fireKeyUp: function(key, ctrl, shift, alt) {
		this.fireEvent(GridBase.KEY_UP, key, ctrl, shift, alt);
	},
	_fireShowTooltip: function(index, value) {
		return this.fireObjectEvent(GridBase.SHOW_TOOLTIP, index, value);
	},
	_fireShowHeaderTooltip: function(column, value) {
		return this.fireObjectEvent(GridBase.SHOW_HEADER_TOOLTIP, column, value);
	},
	_fireColumnPropertyChanged: function (column, property, value) {
		return this.fireEvent(GridBase.COLUMN_PROPERTY_CHANGED, column, property, value);
	},
	onPopupMenuManagerMenuItemClicked: function (manager, menuItem, index) {
		this._fireMenuItemClicked(menuItem, index);
	},
	onScrollBarScrolled: function (bar, eventType, delta, position) {
		var options = this.displayOptions();
		if (bar.isVertical()) {
			switch (eventType) {
				case ScrollEventType.LINE_DOWN:
				case ScrollEventType.LINE_UP:
					this.scrollRow(delta);
					break;
				case ScrollEventType.PAGE_DOWN:
				case ScrollEventType.PAGE_UP:
					this.setTopIndex(this.topIndex() + delta * bar._page);
					break;
				case ScrollEventType.THUMB_TRACK:
					var scrollDuration = options.scrollDuration();
					if (options.isLiveScroll() || (this._scrolledTime > 0 && getTimer() - this._scrolledTime > scrollDuration)) {
						this.setTopIndex(position);
						this._scrolledTime = 0;
					} else {
						this._vscrollBar.setPosition(position, true);
						if (scrollDuration > 0 && this._scrolledTime == 0)
							this._scrolledTime = getTimer();
					}
					break;
				default:
					this.setTopIndex(position);
					break;
			}
		} else {
			switch (eventType) {
				case ScrollEventType.LINE_RIGHT:
				case ScrollEventType.LINE_LEFT:
					this.setLeftPos(this.leftPos() + delta * 8);
					break;
				case ScrollEventType.PAGE_RIGHT:
					if (this._layoutManager) { 
						this.setLeftPos(this._layoutManager.scrollToNextColumn());
					} else {
						this.setLeftPos(this.leftPos() + bar._page);
					}
					break;
				case ScrollEventType.PAGE_LEFT:
					if (this._layoutManager) { 
						this.setLeftPos(this._layoutManager.scrollToPrevColumn());
					} else {
						this.setLeftPos(this.leftPos() - bar._page);
					}
					break;
				case ScrollEventType.THUMB_TRACK:
					var scrollDuration = options.hscrollDuration();
					if (options.isHorizLiveScroll() || (this._scrolledTime > 0 && getTimer() - this._scrolledTime > scrollDuration)) {
						this.setLeftPos(position);
						this._scrolledTime = 0;
					} else {
						this._hscrollBar.setPosition(position, true);
						if (scrollDuration > 0 && this._scrolledTime == 0) {
							this._scrolledTime = getTimer();
						}
					}
					break;
				default:
					this.setLeftPos(position);
					break;
			}
		}
	},
	onImageListImageLoaded: function (images, index) {
		var img = images.getImage(index);
		trace(images.name() + "'s image loaded at " + index + " [" + img.width + "," + img.height + "]");
		this.invalidateLayout();
	},
	onItemProviderReset: function (itemProvider) {
		_trace(">> onItemProviderReset");
		this.hideEditor();
		this._dataChanged = true;
		this._resetColumnIndicies();
		this._populateMerges();
		this.resetGrid();
	},
	onItemProviderRefresh: function (itemProvider) {
		_trace(">> onItemProviderRefresh");
		this.hideEditor();
		this._dataChanged = true;
		this._resetColumnIndicies();
		this._populateMerges();
		this.refreshView();
	},
	onItemProviderRefreshClient: function (itemProvider) {
		_trace(">> onItemProviderRefreshClient");
		this.hideEditor();
		this._dataChanged = true;
		this._resetColumnIndicies();
		this._populateMerges();
		this.refreshView();
	},
	onItemProviderItemInserted: function (itemProvider, item) {
		_trace(">> onItemProviderItemInserted: " + item.dataRow());
		this.hideEditor();
		this._dataChanged = true;
		this._populateMerges();
		this.refreshView();
	},
	onItemProviderItemDeleted: function (itemProvider, item) {
		_trace(">> onItemProviderItemDeleted: " + item.dataRow());
		this.hideEditor();
		this._dataChanged = true;
		this._populateMerges();
		this.refreshView();
	},
	onItemProviderItemUpdated: function (itemProvider, item) {
		_trace(">> onItemProviderItemUpdated: " + item.dataRow());
		this.hideEditor();
		this._dataChanged = true;
		this._populateMerges();
		this.refreshView();
	},
	onItemProviderCheckableChanged: function (itemProvider, item) {
		_trace(">> onItemProviderCheckableChanged: " + item.dataRow() + ", " + item.isCheckable());
		this.refreshView();
	},
	onItemProviderItemChecked: function (itemProvider, item) {
		_trace(">> onItemProviderItemChecked: " + item.dataRow() + ", " + item.isChecked());
		this.refreshView();
		this._fireItemChecked(item);
	},
	onItemProviderItemsChecked: function (itemProvider, items, checked) {
		_trace(">> onItemProviderItemsChecked: " + items.length + " items, " + checked);
		this.refreshView();
		this._fireItemsChecked(items, checked);
	},
	onItemProviderItemAllChecked: function (itemProvider, checked) {
		_trace(">> onItemProviderItemAllChecked: " + checked);
		this.refreshView();
		this._fireItemAllChecked(checked);
	},
	onItemProviderRowStateChanged: function (itemProvider, item) {
		_trace(">> onItemProviderRowStateChanged: " + item.dataRow());
		this.refreshView();
	},
	onItemProviderRowStatesChanged: function (itemProvider, items) {
		_trace(">> onItemProviderRowStatesChanged");
		this.refreshView();
	},
	onItemProviderRowStatesCleared: function (itemProvider) {
		_trace(">> onItemProviderRowStatesCleared");
		this.refreshView();
	},
	onItemProviderSort: function (itemProvider, fields, directions) {
		_trace(">> onItemProviderSort");
		this.refreshView();
	},
	onItemProviderSorted: function (itemProvider) {
		_trace(">> onItemProviderSorted");
		this.refreshView();
		this.fireEvent(GridBase.SORTING_CHANGED);
	},
	onItemProviderFilterAdded: function (itemProvider) {
		_trace(">> onItemProviderFilterAdded");
	},
	onItemProviderFilterRemoved: function (itemProvider) {
		_trace(">> onItemProviderFilterRemoved");
	},
	onItemProviderFilterCleared: function (itemProvider) {
		_trace(">> onItemProviderFilterCleared");
	},
	onItemProviderFilterAllCleared: function (itemProvider) {
		_trace("onItemProviderFilterAllCleared");
	},
	onItemProviderFiltered: function (itemProvider) {
		this.refreshView();
		this.fireEvent(GridBase.FILTERING_CHANGED);
	},
	$_focusEditItem: function (item) {
		var index = this.getIndex(item.index(), this.focusedIndex() ? this.focusedIndex().column() : null);
		if (!index.C() && this.visibleColumnCount() > 0) {
			index._column = this.getVisibleColumn(0);
		}
		this.setFocusedIndex(index, true);
		this.makeCellVisible(this.focusedIndex());
	},
	onItemEditUpdateStarted: function (itemProvider, item) {
		this._clearColumnErrors();
		this._setColumnErrors(item)
		this.refreshView();
        this._fireUpdateStarted(item);
	},
	onItemEditAppendStarted: function (itemProvider, item) {
		this.hideEditor();
		this.reprepareEditor();
		this._clearColumnErrors();
		this._populateMerges();
		this.refreshView();
		this.$_focusEditItem(item);
        this._fireInsertStarted(item, true);
	},
	onItemEditInsertStarted: function (itemProvider, item) {
		this.hideEditor();
		this.reprepareEditor();
		this._clearColumnErrors();
		this._populateMerges();
		this.refreshView();
		this.$_focusEditItem(item);
        this._fireInsertStarted(item, false);
	},
	onItemEditCellEdited: function (itemProvider, item, field) {
		this.refreshView();
		!this._cellUpdateEventLock && this._fireCellEdited(item, field);
	},
	onItemEditCellUpdated: function (itemProvider, item, field, oldValue, newValue) {
		this.refreshView();
		!this._cellUpdateEventLock && this._fireEditRowChanged(item, field, oldValue, newValue);
	},
	onItemEditCommitting: function (itemProvider, item) {
	},
	onItemEditCommitted: function (itemProvider, item) {
		this._appendDummy();		
		this.hideEditor();
		this.refreshView();
	},
	onItemEditCanceled: function (itemProvider) {
		this._appendDummy();
		this.hideEditor();
		this._populateMerges();
		this.refreshView();
		this._fireItemEditCanceled(itemProvider._editingItem);
	},
	onItemEditCommitRequest: function (itemProvider) {
		this.commit(false);
	},
	onItemEditCancelReuqest: function (itemProvider) {
		this.cancel();
	},
	onLookupSourceProviderChanged: function (provider) {
		this.refreshView();
	},
	onSelectionChanged: function (manager) {
		this._fireSelectionChanged();
	},
	onSelectionAdded: function (manager, item) {
		this._addSelectionView(item);
		this._layoutSelectionViews();
		this._fireSelectionAdded(item);
		this._fireSelectionChanged();
	},
	onSelectionRemoved: function (manager) {
		this._fireSelectionRemoved();
		this._fireSelectionChanged();
	},
	onSelectionCleared: function (manager) {
		this._clearSelectionViews();
		this._fireSelectionCleared();
		this._fireSelectionChanged();
	},
	onSelectionResized: function (manager, item) {
		this._layoutSelectionViews();
		this._fireSelectionResized();
		this._fireSelectionChanged();
	},
	onSelectionEnded: function (manager, item) {
		this._fireSelectionEnded(item);
	},
    onMenuItemClick: function (menuItem, index) {
        this._fireContextMenuItemClicked(menuItem, index);
    }
}, {
	setGridMapper: function (mapper) {
		GridBase._gridMapper = mapper;
	},
	createColumn: function (source) {
		if (source) {
			var column;
			if (source.type == "group" || source.columns) {
				column = new ColumnGroup();
			} else if (source.type == "series") {
                column = new SeriesColumn();
			} else {
				column = new DataColumn();
			}
			column.assign(source);
			var colMap;
			var map = GridBase._gridMapper;
			if (map && (colMap = map.column)) {
				for (var p in colMap) {
					var prop = colMap[p];
					if (source.hasOwnProperty(prop)) {
						column.setProperty(p, source[prop]);
					}
				}
			}
			if (column instanceof ColumnGroup && source.columns) {
				var columns = GridBase.createColumns(source.columns);
				column.setColumns(columns);
			}
			return column;
		}
		return null;
	},
	createColumns: function (source) {
		if (_isArray(source)) {
			var columns = [];
			for (var i = 0, cnt = source.length; i < cnt; i++) {
				var column = GridBase.createColumn(source[i]);
				column && columns.push(column);
			}
			return columns;
		}
		return null;
	}
});
GridBase.CURRENT_CHANGING = "onGridBaseCurrentChanging";
GridBase.CURRENT_CHANGED = "onGridBaseCurrentChanged";
GridBase.CURRENT_ROW_CHANGED = "onGridBaseCurrentRowChanged";
GridBase.VALIDATE_CELL = "onGridBaseValidateCell";
GridBase.VALIDATE_ROW = "onGridBaseValidateRow";
GridBase.VALIDATION_FAIL = "onGridBaseValidationFail";
GridBase.COLUMN_HEADER_CLICKED = "onGridBaseColumnHeaderClicked";
GridBase.COLUMN_HEADER_DBL_CLICKED = "onGridBaseColumnHeaderDblClicked";
GridBase.COLUMN_CHECKED_CHANGED = "onGridBaseColumnCheckedChanged";
GridBase.FOOTER_CELL_CLICKED = "onGridBaseFooterCellClicked";
GridBase.FOOTER_CELL_DBL_CLICKED = "onGridBaseFooterCellDblClicked";
GridBase.HEADERSUMMARY_CELL_CLICKED = "onGridBaseHeaderSummaryCellClicked";
GridBase.HEADERSUMMARY_CELL_DBL_CLICKED = "onGridBaseHeaderSummaryCellDblClicked";
GridBase.CHECK_BAR_HEAD_CLICKED = "onGridBaseCheckBarHeadClicked";
GridBase.CHECK_BAR_FOOT_CLICKED = "onGridBaseCheckBarFootClicked";
GridBase.INDICATOR_CELL_CLICKED = "onGridBaseIndicatorCellClicked";
GridBase.STATE_BAR_CELL_CLICKED = "onGridBaseStateBarCellClicked";
GridBase.ROWGROUP_HEAD_CLICKED = "onGridBaseRowGroupHeadClicked";
GridBase.ROWGROUP_FOOT_CLICKED = "onGridBaseRowGroupFootClicked";
GridBase.ROWGROUP_BAR_CLICKED = "onGridBaseRowGroupBarClicked";
GridBase.ROWGROUP_HEADER_FOOTER_CLICKED = "onGridBaseRowGroupHeaderFooterClicked";
GridBase.CHECK_BAR_FOOT_DBL_CLICKED = "onGridBaseCheckBarFootDblClicked";
GridBase.INDICATOR_CELL_DBL_CLICKED = "onGridBaseIndicatorCellDblClicked";
GridBase.STATE_BAR_CELL_DBL_CLICKED = "onGridBaseStateBarCellDblClicked";
GridBase.ROWGROUP_HEAD_DBL_CLICKED = "onGridBaseRowGroupHeadDblClicked";
GridBase.ROWGROUP_FOOT_DBL_CLICKED = "onGridBaseRowGroupFootDblClicked";
GridBase.ROWGROUP_BAR_DBL_CLICKED = "onGridBaseRowGroupBarDblClicked";
GridBase.ROWGROUP_HEADER_FOOTER_DBL_CLICKED = "onGridBaseRowGroupHeaderFooterDblClicked";
GridBase.PANEL_CLICKED = "onGridBasePanelClicked";
GridBase.PANEL_DBL_CLICKED = "onGridBasePanelDblClicked";
GridBase.ROWGROUP_PANEL_CLICKED = "onGridBaseRowGroupPanelClicked";
GridBase.ROWGROUP_PANEL_DBL_CLICKED = "onGridBaseRowGroupPanelDblClicked";
GridBase.MENU_ITEM_CLICKED = "onGridBaseMenuItemClicked";
GridBase.CONTEXT_MENU_POPUP = "onGridBaseContextMenuPopup";
GridBase.CONTEXT_MENU_ITEM_CLICKED = "onGridBaseContextMenuItemClicked";
GridBase.CELL_BUTTON_CLICKED = "onGridBaseCellButtonClicked";
GridBase.IMAGE_BUTTON_CLICKED = "onGridBaseImageButtonClicked";
GridBase.EDIT_BUTTON_CLICKED = "onGridBaseEditButtonClicked";
GridBase.CLICKABLE_CELL_CLICKED = "onGridBaseClickableCellClicked";
GridBase.SCROLL_TO_BOTTOM = "onGridBaseScrollToBottom";
GridBase.TOPITEMINDEX_CHANGED = "onGridBaseTopItemIndexChanged";
GridBase.DATA_CELL_CLICKED = "onGridBaseDataCellClicked";
GridBase.DATA_CELL_DBL_CLICKED = "onGridBaseDataCellDblClicked";
GridBase.ROWS_DELETING = "onGridBaseRowsDeleting";
GridBase.ROW_INSERTING = "onGridBaseRowInserting";
GridBase.SELECTION_ADDED = "onGridBaseSelectionAdded";
GridBase.SELECTION_CHANGED = "onGridBaseSelectionChanged";
GridBase.SELECTION_REMOVED = "onGridBaseSelectionRemoved";
GridBase.SELECTION_CLEARED = "onGridBaseSelectionCleared";
GridBase.SELECTION_RESIZED = "onGridBaseSelectionResized";
GridBase.SELECTION_ENDED = "onGridBaseSelectionEnded";
GridBase.INSERT_STARTED = "onGridBaseInsertStarted";
GridBase.UPDATE_STARTED = "onGridBaseUpdateStarted";
GridBase.SHOW_EDITOR = "onGridBaseShowEditor";
GridBase.HIDE_EDITOR = "onGridBaseHideEditor";
GridBase.EDIT_CHANGE = "onGridBaseEditChange";
GridBase.GET_EDIT_VALUE = "onGridBaseGetEditValue";
GridBase.EDIT_COMMIT = "onGridBaseEditCommit";
GridBase.EDIT_CANCELED = "onGridBaseEditCanceled";
GridBase.ITEM_EDIT_CANCELED = "onGridBaseItemEditCanceled";
GridBase.ITEM_EDIT_CANCEL = "onGridBaseItemEditCancel";
GridBase.EDIT_SEARCH = "onGridBaseEditSearch";
GridBase.SEARCH_BUTTON_CLICK = "onGridBaseSearchCellButtonClick";
GridBase.CELL_EDITED = "onGridBaseCellEdited";
GridBase.EDIT_ROW_CHANGED = "onGridBaseEditRowChanged";
GridBase.EDIT_ROW_PASTED = "onGridBaseEditRowPasted";
GridBase.ROWS_PASTED = "onGridBaseRowsPasted";
GridBase.ITEM_CHECKED = "onGridBaseItemChecked";
GridBase.ITEMS_CHECKED = "onGridBaseItemsChecked";
GridBase.ITEM_ALL_CHECKED = "onGridBaseItemAllChecked";
GridBase.ERROR_CLICKED = "onGridBaseErrorClicked";
GridBase.SORTING = "onGridBaseSorting";
GridBase.SORTING_CHANGED = "onGridBaseSortingChanged";
GridBase.FILTERING = "onGridBaseFiltering";
GridBase.FILTERING_CHANGED = "onGridBaseFilteringChanged";
GridBase.FILTER_ACTION_CLICKED = "onGridBaseFilterActionClicked";
GridBase.KEY_PRESS = "onGridBaseKeyPress";
GridBase.KEY_DOWN = "onGridBaseKeyDown";
GridBase.KEY_UP = "onGridBaseKeyUp";
GridBase.SHOW_TOOLTIP = "onGridBaseShowTooltip";
GridBase.SHOW_HEADER_TOOLTIP = "onGridBaseShowHeaderTooltip";
GridBase.COLUMN_PROPERTY_CHANGED = "onGridBaseColumnPropertyChanged";

var /* @internal */ GridBaseObserver = defineClass("GridBaseObserver", null, {
	init: function () {
		this._super();
	},
	onGridBaseCurrentChanging: function (grid, oldIndex, newIndex) {
	},
	onGridBaseCurrentChanged: function (grid, newIndex) {
	},
	onGridBaseCurrentRowChanged: function (grid, oldRow, newRow) {
	},
	onGridBaseValidateCell: function (grid, index, inserting, value) {
	},
	onGridBaseValidateRow: function (grid, item, inserting, values) {
	},
	onGridBaseColumnHeaderClicked: function (grid, column) {
	},
	onGridBaseMenuItemClicked: function (grid, menuItem) {
	},
	onGridBaseCellButtonClicked: function (grid, index) {
	},
	onGridBaseImageButtonClicked: function (grid, index, buttonIndex, name) {
	},
	onGridBaseEditButtonClicked: function (grid, index) {
	},
	onGridBaseScrollToBottom: function (grid) {
	}
});
var /* @internal */ RootColumn = defineClass("RootColumn", ColumnGroup, {
	init : function(owner) {
		this._super();
		this._owner = owner; // GridBase
		this._columnMap = {};
		this._header._visible = false;
	},
	destroy: function() {
		this._destroying = true;
		for (var column in this._columnMap) {
			var col = this._columnMap[column];
			col && !col._destroying && col.destroy && col.destroy();
			this._columnMap[column] = null;
		}
		this._columnMap = null;
		this._super();
	},
	grid : function() {
		return this._owner;
	},
	_columnAdded: function (column) {
		this._super(column);
		this._columnMap[column.$_hash] = column;
		var group = _cast(column, ColumnGroup);
		if (group) {
			this.$_groupAdded(group);
		}
	},
	_columnRemoved: function (column) {
	},
	$_groupAdded: function (group) {
		for (var i = 0, cnt = group.count(); i < cnt; i++) {
			var c = group.getItem(i);
			var g = _cast(c, ColumnGroup);
			this._columnMap[c.$_hash] = c;
			if (g) {
				this.$_groupAdded(g);
			}
		}
	}
});
var DataRootCollection = defineClass("DataRootCollection", null, {
	init : function() {
		this._super();
		this._root = null;
		this._dataRoots = [];
		this._list = [];
	},
	roots: function () {
		return this._dataRoots;
	},
	collect: function (root) {
		this._root = root;
		this._dataRoots.length = 0;
		if (root.visibleCount() > 0) {
			this.$_collectGroup(root);
			this.$_checkValid(root);
		}
	},
	collectDataColumns: function (c1, c2) {
		var columns = [];
		if (c1.dataRoot() !== c1) {
			c1 = c1.dataRoot();
		}
		if (c2.dataRoot() != c2) {
			c2 = c2.dataRoot();
		}
		var g = _cast(c1, ColumnGroup);
		if (g) {
			c1 = ColumnGroup.getFirstDataRoot(g);
		}
		g = _cast(c2, ColumnGroup);
		if (g) {
			c2 = ColumnGroup.getLastDataRoot(g);
		}
		var c;
		var j;
		var cnt;
		var i;
		var i1 = this._dataRoots.indexOf(c1);
		var i2 = this._dataRoots.indexOf(c2);
		if (i1 > i2) {
			i = i1;
			i1 = i2;
			i2 = i;
		}
		for (i = i1; i <= i2; i++) {
			c = this._dataRoots[i];
			if (c.isVisible()) {
				g = _cast(c, ColumnGroup);
				if (g) {
					this._list.length = 0;
					this.$_collectDataColumns(g, this._list);
					for (j = 0, cnt = this._list.length; j < cnt; j++) {
						columns.push(this._list[j]);
					}
				} else if (c instanceof DataColumn) {
					columns.push(c);
				}
			}
		}
		return columns;
	},
	$_collectGroup: function (group) {
		var c;
		var g;
		var i;
		var cnt = group.visibleCount();
		if (cnt < 1) {
			this._dataRoots.push(group);
		} else if (cnt == 1) {
			c = group.getVisibleItem(0);
			g = _cast(c, ColumnGroup);
			if (!g) {
				this._dataRoots.push(c);
			} else {
				this.$_collectGroup(g);
			}
		} else if (group.isVertical()) {
			this._dataRoots.push(group);
		} else {
			for (i = 0; i < cnt; i++) {
				c = group.getVisibleItem(i);
				g = _cast(c, ColumnGroup);
				if (!g) {
					this._dataRoots.push(c);
				} else {
					this.$_collectGroup(g);
				}
			}
		}
	},
	$_collectDataColumns: function (group, list) {
		for (var i = 0, cnt = group.visibleCount(); i < cnt; i++) {
			var col = group.getVisibleItem(i);
			if (col instanceof DataColumn) {
				list.push(col);
			} else if (col instanceof ColumnGroup) {
				this.$_collectDataColumns(col, list);
			}
		}
	},
	$_checkValid: function (group) {
	}
});
var /* @internal */ DummyEditController = defineClass("DummyEditController", null, {
	init: function (grid) {
		this._super();
		this._grid = grid;
		this._editIndex = new CellIndex();
	},
	editIndex: function () {
		return this._editIndex.clone();
	},
	isEditing: function () {
		return false;
	},
	setFocus: function () {
		this._grid.container().setFocus();
	},
	resetEditor: function (resetValue) {
	},
	reprepareEditor: function (index) {
	},
	invalidateEditor: function () {
	},
	closeList: function () {
	},
	focusedIndexChanging: function () {
		if (this._grid._readMode)
			return true;
	},
	focusedIndexChanged: function (oldIndex, newIndex) {
	},
	showEditor: function (index) {
	},
	hideEditor: function () {
	},
	commitEditor: function (hideEditor) {
		return true;
	},
	cancelEditor: function (hideEditor) {
	},
	fillSearchItems: function (column, searchKey, values, labels) {
	},
	buttonClicked: function (index) {
	},
	_focusHandler: function (event) {
	},
	onEditorStart: function (editor) {
	},
	onEditorKeyDown: function (editor, keyCode, ctrl, shift) {
	},
	onEditorChange: function (editor) {
	},
	onEditorSearch: function (editor, text) {
	}
});